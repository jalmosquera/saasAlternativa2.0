import { useState, useEffect } from 'react';
import api from '@shared/services/api';

const useNotifications = (pollingInterval = 30000) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/orders/');
      const orders = response.data.results || [];

      // Get pending orders as notifications
      const pendingOrders = orders.filter(order => order.status === 'pending');

      const notifs = pendingOrders.map(order => ({
        id: order.id,
        type: 'order',
        message: `Nuevo pedido #${order.id} de ${order.user_name || 'Cliente'}`,
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
  };

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

  useEffect(() => {
    fetchNotifications();

    // Set up polling
    const interval = setInterval(fetchNotifications, pollingInterval);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pollingInterval]);

  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, unread: false } : notif
      )
    );
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return {
    notifications,
    loading,
    unreadCount: notifications.filter(n => n.unread).length,
    markAsRead,
    clearAll,
    refresh: fetchNotifications,
  };
};

export default useNotifications;
