import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faMapMarkerAlt, faPhone, faStickyNote } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';
import useFetch from '@shared/hooks/useFetch';

const OrderModal = ({ isOpen, onClose, order }) => {
  const [orderDetails, setOrderDetails] = useState(null);
  
  // Solo hacer fetch si hay una orden seleccionada
  const shouldFetch = isOpen && order?.id;
  const { data: orderData, loading } = useFetch(
    shouldFetch ? `/orders/${order.id}/` : null
  );

  useEffect(() => {
    if (orderData) {
      setOrderDetails(orderData);
    }
  }, [orderData]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/10 text-green-600 dark:text-green-400';
      case 'confirmed':
        return 'bg-riday-blue/10 text-riday-blue';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400';
      case 'cancelled':
        return 'bg-red-500/10 text-red-600 dark:text-red-400';
      default:
        return 'bg-gray-500/10 text-gray-600 dark:text-gray-400';
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      'pending': 'Pendiente',
      'confirmed': 'Confirmado',
      'completed': 'Completado',
      'cancelled': 'Cancelado',
    };
    return statusMap[status] || status;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75"
          onClick={onClose}
        ></div>

        {/* Modal panel */}
        <div className="inline-block overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl dark:bg-dark-card sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-dark-border">
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-bold text-gray-900 dark:text-text-primary">
                Pedido #{order?.id}
              </h3>
              {order && (
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                  {getStatusText(order.status)}
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <FontAwesomeIcon icon={faTimes} size="lg" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-4">
            {loading ? (
              <div className="flex items-center justify-center h-48">
                <div className="text-gray-600 dark:text-text-secondary">Cargando detalles...</div>
              </div>
            ) : (
              <div className="space-y-6 max-h-[60vh] overflow-y-auto">
                {/* Customer Info */}
                <div>
                  <h4 className="mb-3 text-sm font-semibold text-gray-700 dark:text-text-primary">
                    Información del Cliente
                  </h4>
                  <div className="p-4 space-y-2 rounded-lg bg-gray-50 dark:bg-dark-bg">
                    <div>
                      <span className="text-sm text-gray-600 dark:text-text-secondary">Nombre:</span>
                      <span className="ml-2 text-sm font-medium text-gray-900 dark:text-text-primary">
                        {orderDetails?.user_name || order?.user_name || 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600 dark:text-text-secondary">Email:</span>
                      <span className="ml-2 text-sm font-medium text-gray-900 dark:text-text-primary">
                        {orderDetails?.user_email || order?.user_email || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Delivery Info */}
                <div>
                  <h4 className="mb-3 text-sm font-semibold text-gray-700 dark:text-text-primary">
                    Información de Entrega
                  </h4>
                  <div className="p-4 space-y-3 rounded-lg bg-gray-50 dark:bg-dark-bg">
                    <div className="flex items-start gap-2">
                      <FontAwesomeIcon icon={faMapMarkerAlt} className="mt-1 text-pepper-orange" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-text-primary">
                          {orderDetails?.delivery_street || order?.delivery_street}, {orderDetails?.delivery_house_number || order?.delivery_house_number}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-text-secondary">
                          {(orderDetails?.delivery_location || order?.delivery_location) === 'ardales' ? 'Ardales' : 'Carratraca'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <FontAwesomeIcon icon={faPhone} className="text-pepper-orange" />
                      <span className="text-sm text-gray-900 dark:text-text-primary">
                        {orderDetails?.phone || order?.phone}
                      </span>
                    </div>
                    {(orderDetails?.notes || order?.notes) && (
                      <div className="flex items-start gap-2">
                        <FontAwesomeIcon icon={faStickyNote} className="mt-1 text-pepper-orange" />
                        <p className="text-sm italic text-gray-600 dark:text-text-secondary">
                          {orderDetails?.notes || order?.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h4 className="mb-3 text-sm font-semibold text-gray-700 dark:text-text-primary">
                    Productos ({orderDetails?.items?.length || 0})
                  </h4>
                  <div className="overflow-hidden border border-gray-200 rounded-lg dark:border-dark-border">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-border">
                      <thead className="bg-gray-50 dark:bg-dark-bg">
                        <tr>
                          <th className="px-4 py-2 text-xs font-medium text-left text-gray-600 dark:text-text-secondary">
                            Producto
                          </th>
                          <th className="px-4 py-2 text-xs font-medium text-center text-gray-600 dark:text-text-secondary">
                            Cantidad
                          </th>
                          <th className="px-4 py-2 text-xs font-medium text-right text-gray-600 dark:text-text-secondary">
                            Precio Unit.
                          </th>
                          <th className="px-4 py-2 text-xs font-medium text-right text-gray-600 dark:text-text-secondary">
                            Subtotal
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200 dark:bg-dark-card dark:divide-dark-border">
                        {orderDetails?.items?.map((item) => (
                          <tr key={item.id}>
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-text-primary">
                              <div>
                                <div className="font-medium">{item.product_name}</div>
                                {item.customization && (
                                  <div className="mt-1 space-y-1 text-xs text-gray-600 dark:text-text-secondary">
                                    {/* Show deselected ingredients */}
                                    {item.customization.deselectedIngredients && item.customization.deselectedIngredients.length > 0 && (
                                      <div className="text-red-600 dark:text-red-400">
                                        ❌ Sin: {item.customization.deselectedIngredients.join(', ')}
                                      </div>
                                    )}
                                    {/* Show extra ingredients */}
                                    {item.customization.selectedExtras && item.customization.selectedExtras.length > 0 && (
                                      <div className="text-green-600 dark:text-green-400">
                                        ➕ Extras: {item.customization.selectedExtras.map(extra => {
                                          // Handle both object format (with translations) and string format
                                          if (typeof extra === 'string') return extra;
                                          if (extra.translations) {
                                            return extra.translations.es?.name || extra.translations.en?.name || extra.name;
                                          }
                                          return extra.name;
                                        }).join(', ')}
                                      </div>
                                    )}
                                    {/* Show additional notes */}
                                    {item.customization.additionalNotes && item.customization.additionalNotes.trim() && (
                                      <div className="italic">
                                        📝 Nota: {item.customization.additionalNotes}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-center text-gray-600 dark:text-text-secondary">
                              {item.quantity}
                            </td>
                            <td className="px-4 py-3 text-sm text-right text-gray-600 dark:text-text-secondary">
                              €{parseFloat(item.unit_price).toFixed(2)}
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-right text-gray-900 dark:text-text-primary">
                              €{parseFloat(item.subtotal).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Total */}
                <div className="pt-4 border-t border-gray-200 dark:border-dark-border">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-900 dark:text-text-primary">
                      Total
                    </span>
                    <span className="text-2xl font-bold text-pepper-orange">
                      €{parseFloat(orderDetails?.total_price || order?.total_price || 0).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Order Date */}
                <div className="text-xs text-right text-gray-500 dark:text-text-secondary">
                  Pedido realizado el: {orderDetails?.created_at ? new Date(orderDetails.created_at).toLocaleString('es-ES') : 'N/A'}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end px-6 py-4 border-t border-gray-200 dark:border-dark-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-white transition-colors rounded-lg bg-pepper-orange hover:bg-pepper-orange/90"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

OrderModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  order: PropTypes.object,
  onSuccess: PropTypes.func,
};

export default OrderModal;
