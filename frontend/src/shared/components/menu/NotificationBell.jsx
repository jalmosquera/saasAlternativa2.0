import { useState, useEffect, useCallback, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faCheck, faShoppingBag } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@shared/contexts/LanguageContext';
import websocketService from '@shared/services/websocketService';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { t } = useLanguage();

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t('notifications.now') || 'Ahora mismo';
    if (diffMins < 60) return `${t('notifications.minutesAgo') || 'Hace'} ${diffMins} min`;
    if (diffHours < 24) return `${t('notifications.hoursAgo') || 'Hace'} ${diffHours}h`;
    return `${t('notifications.daysAgo') || 'Hace'} ${diffDays}d`;
  };

  const handleOrderNotification = useCallback((message) => {
    console.log('[NotificationBell] Received notification:', message);

    if (!message.data) return;

    const { action, data } = message;

    // Handle order updates (status changes)
    if (action === 'updated') {
      const statusMessages = {
        'confirmed': t('myOrders.statusUpdated.confirmed') || 'Tu pedido ha sido confirmado',
        'completed': t('myOrders.statusUpdated.completed') || 'Tu pedido ha sido completado',
        'cancelled': t('myOrders.statusUpdated.cancelled') || 'Tu pedido ha sido cancelado'
      };

      const message_text = statusMessages[data.status] || t('myOrders.statusUpdated.default') || 'Estado del pedido actualizado';

      const newNotification = {
        id: `${data.order_id}-${Date.now()}`,
        order_id: data.order_id,
        type: 'order_update',
        message: `${t('myOrders.orderNumber') || 'Pedido'} #${data.order_id}: ${message_text}`,
        time: formatTime(data.updated_at),
        timestamp: data.updated_at,
        unread: true,
        status: data.status,
      };

      setNotifications(prev => {
        // Add notification to the beginning
        const updated = [newNotification, ...prev];
        // Keep only last 10 notifications
        return updated.slice(0, 10);
      });

      setUnreadCount(prev => prev + 1);
    }
  }, [t]);

  useEffect(() => {
    // Subscribe to order notifications
    const unsubscribe = websocketService.on('order_notification', handleOrderNotification);

    // Cleanup on unmount
    return () => {
      unsubscribe();
    };
  }, [handleOrderNotification]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      // Mark all as read when opening
      setUnreadCount(0);
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, unread: false }))
      );
    }
  };

  const handleNotificationClick = (notification) => {
    navigate('/my-orders');
    setIsOpen(false);
  };

  const clearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return '✅';
      case 'completed':
        return '🎉';
      case 'cancelled':
        return '❌';
      default:
        return '📦';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon */}
      <button
        onClick={toggleDropdown}
        className="relative p-2 transition-colors duration-200 text-white hover:text-pepper-orange dark:text-white dark:hover:text-pepper-orange"
        aria-label={t('notifications.title') || 'Notificaciones'}
      >
        <FontAwesomeIcon icon={faBell} size="lg" />
        {unreadCount > 0 && (
          <span className="absolute flex items-center justify-center w-5 h-5 text-xs font-bold text-white rounded-full -top-1 -right-1 bg-pepper-orange animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 z-50 w-80 mt-2 bg-white dark:bg-dark-card rounded-lg shadow-xl border border-gray-200 dark:border-dark-border overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-pepper-orange text-white">
            <h3 className="font-semibold text-sm">
              <FontAwesomeIcon icon={faBell} className="mr-2" />
              {t('notifications.title') || 'Notificaciones'}
            </h3>
            {notifications.length > 0 && (
              <button
                onClick={clearAll}
                className="text-xs hover:underline"
              >
                {t('notifications.clearAll') || 'Limpiar todo'}
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                <FontAwesomeIcon icon={faBell} size="3x" className="mb-3 opacity-20" />
                <p className="text-sm">
                  {t('notifications.empty') || 'No tienes notificaciones'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-dark-border">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`px-4 py-3 cursor-pointer transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                      notification.unread ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 text-2xl">
                        {getStatusIcon(notification.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {notification.time}
                        </p>
                      </div>
                      {notification.unread && (
                        <div className="flex-shrink-0">
                          <span className="inline-block w-2 h-2 bg-pepper-orange rounded-full"></span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-dark-border">
              <button
                onClick={() => {
                  navigate('/my-orders');
                  setIsOpen(false);
                }}
                className="w-full text-center text-sm font-medium text-pepper-orange hover:text-pepper-orange-dark transition-colors"
              >
                <FontAwesomeIcon icon={faShoppingBag} className="mr-2" />
                {t('notifications.viewAllOrders') || 'Ver todos mis pedidos'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
