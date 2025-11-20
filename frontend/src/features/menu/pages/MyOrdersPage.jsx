import { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faShoppingBag,
  faSpinner,
  faCheckCircle,
  faClock,
  faTimesCircle,
  faMapMarkerAlt,
  faPhone,
  faCalendarAlt
} from '@fortawesome/free-solid-svg-icons';
import { useLanguage } from '@shared/contexts/LanguageContext';
import { useAuth } from '@shared/contexts/AuthContext';
import api from '@shared/services/api';
import toast from 'react-hot-toast';

const MyOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingOrderId, setCancellingOrderId] = useState(null);
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/orders/');
      // Orders are already filtered by user in backend
      setOrders(response.data.results || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error(t('myOrders.loadingError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, fetchOrders]);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm(t('myOrders.cancelConfirm'))) {
      return;
    }

    try {
      setCancellingOrderId(orderId);
      await api.post(`/orders/${orderId}/cancel/`);
      toast.success(t('myOrders.cancelSuccess'));
      // Refresh orders list
      fetchOrders();
    } catch (error) {
      console.error('Error cancelling order:', error);
      const errorMessage = error.response?.data?.detail || t('myOrders.cancelError');
      toast.error(errorMessage);
    } finally {
      setCancellingOrderId(null);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        label: t('myOrders.status.pending'),
        icon: faClock,
        className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      },
      confirmed: {
        label: t('myOrders.status.confirmed'),
        icon: faCheckCircle,
        className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      },
      completed: {
        label: t('myOrders.status.completed'),
        icon: faCheckCircle,
        className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      },
      cancelled: {
        label: t('myOrders.status.cancelled'),
        icon: faTimesCircle,
        className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      }
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <span className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-semibold ${config.className}`}>
        <FontAwesomeIcon icon={config.icon} className="text-xs" />
        <span>{config.label}</span>
      </span>
    );
  };

  const canCancelOrder = (status) => {
    return status === 'pending' || status === 'confirmed';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen py-20 bg-gray-50 dark:bg-dark-bg">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto text-center">
            <FontAwesomeIcon icon={faShoppingBag} className="text-6xl text-gray-400 mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {t('myOrders.loginRequired')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              {t('myOrders.loginMessage')}
            </p>
            <a
              href="/login"
              className="btn-pepper-primary inline-block"
            >
              {t('myOrders.loginButton')}
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen py-20 bg-gray-50 dark:bg-dark-bg">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center">
            <FontAwesomeIcon icon={faSpinner} spin className="text-4xl text-pepper-orange" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 bg-gray-50 dark:bg-dark-bg">
      <div className="container-pepper">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-pepper-charcoal dark:text-white mb-2 font-gabarito">
            <FontAwesomeIcon icon={faShoppingBag} className="mr-3" />
            {t('myOrders.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('myOrders.subtitle')}
          </p>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <FontAwesomeIcon icon={faShoppingBag} className="text-6xl text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {t('myOrders.noOrders')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              {t('myOrders.noOrdersMessage')}
            </p>
            <a
              href="/"
              className="btn-pepper-primary inline-block"
            >
              {t('myOrders.viewMenu')}
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white dark:bg-dark-card rounded-lg shadow-md p-6 border border-gray-200 dark:border-dark-border"
              >
                {/* Order Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 pb-4 border-b border-gray-200 dark:border-dark-border">
                  <div>
                    <h3 className="text-xl font-bold text-pepper-charcoal dark:text-white font-gabarito">
                      {t('myOrders.orderNumber')} #{order.id}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" />
                      {formatDate(order.created_at)}
                    </p>
                  </div>
                  <div className="mt-3 sm:mt-0">
                    {getStatusBadge(order.status)}
                  </div>
                </div>

                {/* Order Items */}
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                    {t('myOrders.products')}:
                  </h4>
                  <div className="space-y-3">
                    {order.items.map((item, index) => (
                      <div
                        key={index}
                        className="py-3 px-4 bg-gray-50 dark:bg-dark-bg rounded-lg border border-gray-200 dark:border-dark-border"
                      >
                        {/* Product Header */}
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <span className="font-medium text-gray-900 dark:text-white">
                              {item.quantity}x {item.product_name}
                            </span>
                            <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                              (€{parseFloat(item.unit_price).toFixed(2)} {t('myOrders.unitPrice')})
                            </span>
                          </div>
                          <span className="font-semibold text-pepper-orange">
                            €{parseFloat(item.subtotal).toFixed(2)}
                          </span>
                        </div>

                        {/* Customization Details */}
                        {item.customization && (
                          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-dark-border space-y-2">
                            {/* Deselected Ingredients */}
                            {item.customization.deselected_ingredients && item.customization.deselected_ingredients.length > 0 && (
                              <div className="flex items-start">
                                <span className="text-sm font-semibold text-red-600 dark:text-red-400 mr-2">
                                  ❌ {t('myOrders.without')}:
                                </span>
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                  {item.customization.deselected_ingredients.join(', ')}
                                </span>
                              </div>
                            )}

                            {/* Selected Extras */}
                            {item.customization.selected_extras && item.customization.selected_extras.length > 0 && (
                              <div className="flex items-start">
                                <span className="text-sm font-semibold text-green-600 dark:text-green-400 mr-2">
                                  ➕ {t('myOrders.extras')}:
                                </span>
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                  {item.customization.selected_extras.map((extra, idx) => (
                                    <span key={idx}>
                                      {extra.name} (+€{parseFloat(extra.price).toFixed(2)})
                                      {idx < item.customization.selected_extras.length - 1 ? ', ' : ''}
                                    </span>
                                  ))}
                                </span>
                              </div>
                            )}

                            {/* Additional Notes */}
                            {item.customization.additional_notes && (
                              <div className="flex items-start">
                                <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 mr-2">
                                  📝 {t('myOrders.note')}:
                                </span>
                                <span className="text-sm text-gray-700 dark:text-gray-300 italic">
                                  "{item.customization.additional_notes}"
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery Info */}
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {t('myOrders.deliveryInfo')}:
                  </h4>
                  <div className="space-y-1 text-sm">
                    <p className="text-gray-700 dark:text-gray-300">
                      <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2 text-blue-600" />
                      {order.delivery_street}, {order.delivery_house_number} - {order.delivery_location}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300">
                      <FontAwesomeIcon icon={faPhone} className="mr-2 text-blue-600" />
                      {order.phone}
                    </p>
                    {order.notes && (
                      <p className="text-gray-700 dark:text-gray-300 italic mt-2">
                        {t('myOrders.notes')}: {order.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Order Total and Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-4 border-t border-gray-200 dark:border-dark-border">
                  <div className="mb-3 sm:mb-0">
                    <span className="text-lg font-bold text-pepper-charcoal dark:text-white">
                      {t('myOrders.total')}: <span className="text-pepper-orange">€{parseFloat(order.total_price).toFixed(2)}</span>
                    </span>
                  </div>

                  {canCancelOrder(order.status) && (
                    <button
                      onClick={() => handleCancelOrder(order.id)}
                      disabled={cancellingOrderId === order.id}
                      className="btn-pepper-secondary bg-red-600 hover:bg-red-700 text-white border-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {cancellingOrderId === order.id ? (
                        <>
                          <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                          {t('myOrders.cancelling')}
                        </>
                      ) : (
                        <>
                          <FontAwesomeIcon icon={faTimesCircle} className="mr-2" />
                          {t('myOrders.cancelOrder')}
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrdersPage;
