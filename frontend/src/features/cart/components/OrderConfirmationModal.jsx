import { useLanguage } from '@shared/contexts/LanguageContext';
import PropTypes from 'prop-types';

const OrderConfirmationModal = ({ isOpen, onClose, onConfirm, orderData, loading }) => {
  const { t, getTranslation } = useLanguage();

  if (!isOpen) return null;

  const { items, deliveryInfo, totalPrice } = orderData;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-pepper-orange to-orange-500 p-6 text-white">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold font-gabarito">
                {t('checkout.confirmOrder')}
              </h2>
              <button
                onClick={onClose}
                disabled={loading}
                className="text-white hover:text-gray-200 transition-colors disabled:opacity-50"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="mt-2 text-sm text-white/90">
              {t('checkout.reviewOrder')}
            </p>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {/* Delivery Info */}
            <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-pepper-orange rounded">
              <h3 className="font-semibold text-lg mb-3 text-pepper-charcoal dark:text-white font-gabarito">
                📍 {t('checkout.deliveryInfo')}
              </h3>
              <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <p>
                  <span className="font-medium">{t('checkout.address')}:</span>{' '}
                  {deliveryInfo.delivery_street}, {deliveryInfo.delivery_house_number}
                </p>
                <p>
                  <span className="font-medium">{t('checkout.location')}:</span>{' '}
                  {deliveryInfo.delivery_location === 'ardales' ? t('checkout.ardales') : t('checkout.carratraca')}
                </p>
                <p>
                  <span className="font-medium">{t('checkout.phone')}:</span>{' '}
                  {deliveryInfo.phone}
                </p>
                {deliveryInfo.notes && (
                  <p>
                    <span className="font-medium">{t('checkout.notes')}:</span>{' '}
                    <span className="italic">{deliveryInfo.notes}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Order Items */}
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-3 text-pepper-charcoal dark:text-white font-gabarito">
                🍽️ {t('checkout.yourOrder')}
              </h3>
              <div className="space-y-3">
                {items.map((item, index) => {
                  const productName = getTranslation(item.product.translations, 'name');
                  const basePrice = parseFloat(item.product.price) || 0;

                  let extrasPrice = 0;
                  if (item.customization?.selectedExtras) {
                    extrasPrice = item.customization.selectedExtras.reduce((sum, extra) => {
                      return sum + (parseFloat(extra.price) || 0);
                    }, 0);
                  }

                  const pricePerUnit = basePrice + extrasPrice;
                  const itemSubtotal = pricePerUnit * item.quantity;

                  return (
                    <div
                      key={index}
                      className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <p className="font-semibold text-pepper-charcoal dark:text-white">
                            {item.quantity}x {productName}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {t('cart.unitPrice')}: €{pricePerUnit.toFixed(2)}
                            {extrasPrice > 0 && (
                              <span className="text-xs ml-1">
                                (Base: €{basePrice.toFixed(2)} + Extras: €{extrasPrice.toFixed(2)})
                              </span>
                            )}
                          </p>
                        </div>
                        <p className="font-bold text-pepper-orange">
                          €{itemSubtotal.toFixed(2)}
                        </p>
                      </div>

                      {/* Customizations */}
                      {item.customization && (
                        <div className="mt-3 pt-3 border-t border-gray-300 dark:border-gray-600 space-y-1 text-sm">
                          {/* ============================================
                              COMENTADO: Ingredientes deseleccionados
                              ============================================
                          {item.customization.deselectedIngredients && item.customization.deselectedIngredients.length > 0 && (
                            <p className="text-red-600 dark:text-red-400">
                              ❌ <span className="font-medium">{t('product.without')}:</span>{' '}
                              {item.customization.deselectedIngredients.join(', ')}
                            </p>
                          )}
                          */}
                          {/* Selected Options (Meat Type, Sauce Type, etc.) */}
                          {item.customization.selectedOptions && Object.keys(item.customization.selectedOptions).length > 0 && (
                            <div className="space-y-1">
                              {Object.values(item.customization.selectedOptions).map((option) => (
                                <p key={option.optionId} className="text-pepper-orange dark:text-orange-400">
                                  ✓ <span className="font-medium">{option.optionName}:</span>{' '}
                                  {option.icon && `${option.icon} `}{option.choiceName}
                                </p>
                              ))}
                            </div>
                          )}
                          {item.customization.selectedExtras && item.customization.selectedExtras.length > 0 && (
                            <p className="text-green-600 dark:text-green-400">
                              🌟 <span className="font-medium">{t('product.extras')}:</span>{' '}
                              {item.customization.selectedExtras.map(extra =>
                                `${getTranslation(extra.translations, 'name')} (+€${parseFloat(extra.price).toFixed(2)})`
                              ).join(', ')}
                            </p>
                          )}
                          {item.customization.additionalNotes && (
                            <p className="text-blue-600 dark:text-blue-400">
                              📝 <span className="font-medium">{t('product.note')}:</span>{' '}
                              {item.customization.additionalNotes}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Total */}
            <div className="p-4 bg-gradient-to-r from-pepper-orange to-orange-500 rounded-lg">
              <div className="flex justify-between items-center text-white">
                <span className="text-lg font-semibold">{t('cart.total')}</span>
                <span className="text-3xl font-bold">€{totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-6 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={onConfirm}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-pepper-orange to-orange-500 hover:from-orange-600 hover:to-orange-600 text-white font-bold rounded-lg shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    {t('common.sending')}...
                  </span>
                ) : (
                  <span>✓ {t('checkout.confirmAndSend')}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

OrderConfirmationModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  orderData: PropTypes.shape({
    items: PropTypes.array.isRequired,
    deliveryInfo: PropTypes.object.isRequired,
    totalPrice: PropTypes.number.isRequired,
  }).isRequired,
  loading: PropTypes.bool,
};

OrderConfirmationModal.defaultProps = {
  loading: false,
};

export default OrderConfirmationModal;
