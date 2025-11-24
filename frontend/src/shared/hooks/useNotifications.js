import { useState, useEffect, useCallback, useRef } from 'react';
import api from '@shared/services/api';
import websocketService from '@shared/services/websocketService';

const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const notificationSound = useRef(null);

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora mismo';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    return `Hace ${diffDays}d`;
  };

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/orders/');
      const orders = response.data.results || [];

      // Get pending orders as notifications
      const pendingOrders = orders.filter(order => order.status === 'pending');

      const notifs = pendingOrders.map(order => ({
        id: order.id,
        type: 'order',
        message: `Nuevo pedido #${order.id} de ${order.user?.username || order.user_name || 'Cliente'}`,
        time: formatTime(order.created_at),
        unread: true,
        data: order,
      }));

      setNotifications(notifs);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setLoading(false);
    }
  }, []);

  const playNotificationSound = useCallback(() => {
    // Play a subtle notification sound if available
    if (notificationSound.current) {
      notificationSound.current.play().catch(err => {
        console.log('Could not play notification sound:', err);
      });
    }
  }, []);

  const handleOrderNotification = useCallback((message) => {
    if (!message.data) return;

    const { action, data } = message;

    if (action === 'created' && data.status === 'pending') {
      // New pending order - add to notifications
      const newNotification = {
        id: data.order_id,
        type: 'order',
        message: `Nuevo pedido #${data.order_id} de ${data.user?.username || 'Cliente'}`,
        time: formatTime(data.created_at),
        unread: true,
        data: data,
      };

      setNotifications(prev => {
        // Avoid duplicates
        const exists = prev.find(n => n.id === data.order_id);
        if (exists) return prev;
        return [newNotification, ...prev];
      });

      // Play notification sound
      playNotificationSound();

      // Show browser notification if permission granted
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Nuevo Pedido', {
          body: `Pedido #${data.order_id} de ${data.user?.username || 'Cliente'}`,
          icon: '/favicon.ico',
          tag: `order-${data.order_id}`,
        });
      }
    } else if (action === 'updated') {
      // Order updated - remove from pending if status changed
      if (data.status !== 'pending') {
        setNotifications(prev => prev.filter(n => n.id !== data.order_id));
      } else {
        // Update existing notification
        setNotifications(prev =>
          prev.map(n =>
            n.id === data.order_id
              ? { ...n, data: data, time: formatTime(data.updated_at) }
              : n
          )
        );
      }
    } else if (action === 'deleted') {
      // Order deleted - remove from notifications
      setNotifications(prev => prev.filter(n => n.id !== data.order_id));
    }
  }, [playNotificationSound]);

  useEffect(() => {
    // Request notification permission on mount
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Initialize notification sound (optional)
    // You can add an audio file for notifications if desired
    // notificationSound.current = new Audio('/notification-sound.mp3');

    // Fetch initial notifications
    fetchNotifications();

    // Get access token from localStorage
    const token = localStorage.getItem('access_token');

    if (token) {
      // Connect to WebSocket if not already connected
      if (!websocketService.getConnectionStatus()) {
        console.log('[useNotifications] Connecting WebSocket');
        websocketService.connect(token);
      }

      // Subscribe to order notifications
      const unsubscribeOrders = websocketService.on('order_notification', handleOrderNotification);

      // Subscribe to connection status changes
      const unsubscribeConnection = websocketService.onConnectionChange((connected) => {
        setIsConnected(connected);

        // If reconnected, refresh notifications
        if (connected) {
          fetchNotifications();
        }
      });

      // Cleanup on unmount
      return () => {
        unsubscribeOrders();
        unsubscribeConnection();
        // Note: We don't disconnect here because other components might be using it
        // WebSocket will be disconnected when user logs out
      };
    } else {
      setLoading(false);
    }
  }, [fetchNotifications, handleOrderNotification]);

  const markAsRead = useCallback((id) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, unread: false } : notif
      )
    );
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    loading,
    unreadCount: notifications.filter(n => n.unread).length,
    markAsRead,
    clearAll,
    refresh: fetchNotifications,
    isConnected, // Expose connection status
  };
};

export default useNotifications;
