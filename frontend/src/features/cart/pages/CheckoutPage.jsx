import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { useCart } from '@shared/contexts/CartContext';
import { useLanguage } from '@shared/contexts/LanguageContext';
import { useAuth } from '@shared/contexts/AuthContext';
import { sendOrderViaWhatsApp } from '@shared/services/whatsappService';
import { createOrder, sendOrderConfirmationEmails } from '@shared/services/orderService';
import api from '@shared/services/api';
import OrderConfirmationModal from '@features/cart/components/OrderConfirmationModal';

// Utility function to get current day in Spanish format matching backend
const getCurrentDayInSpanish = () => {
  const daysMap = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const today = new Date().getDay();
  return daysMap[today];
};

const CheckoutPage = () => {
  const { items, getTotalPrice, clearCart } = useCart();
  const { t, getTranslation, language } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [deliveryInfo, setDeliveryInfo] = useState({
    delivery_street: '',
    delivery_house_number: '',
    delivery_location: '',
    phone: user?.phone || '',
    notes: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState('+34623736566');
  const [deliveryLocations, setDeliveryLocations] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingOrder, setPendingOrder] = useState(null);
  const [deliveryEnabledDays, setDeliveryEnabledDays] = useState({});
  const [isOrderingEnabled, setIsOrderingEnabled] = useState(true);

  // Fetch company data for WhatsApp number, delivery locations, and enabled days
  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const response = await api.get('/company/');
        if (response.data.results && response.data.results.length > 0) {
          const companyData = response.data.results[0];
          setWhatsappNumber(companyData.whatsapp_phone || '+34623736566');

          // Use delivery locations from company settings
          if (companyData.delivery_locations && companyData.delivery_locations.length > 0) {
            setDeliveryLocations(companyData.delivery_locations.filter(loc => loc.enabled));
          }

          // Check if ordering is enabled for today
          if (companyData.delivery_enabled_days) {
            setDeliveryEnabledDays(companyData.delivery_enabled_days);
            const currentDay = getCurrentDayInSpanish();
            const isEnabled = companyData.delivery_enabled_days[currentDay] !== false;
            setIsOrderingEnabled(isEnabled);
          }
        }
      } catch (err) {
        console.error('Error fetching company data:', err);
        // Fallback to default locations only if API fails
        setDeliveryLocations([
          { id: 1, name: 'Ardales', value: 'ardales', enabled: true },
          { id: 2, name: 'Carratraca', value: 'carratraca', enabled: true },
        ]);
        // Default to enabled if API fails
        setIsOrderingEnabled(true);
      }
    };
    fetchCompanyData();
  }, []);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Redirect if not authenticated or cart is empty
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else if (items.length === 0) {
      navigate('/cart');
    }
  }, [isAuthenticated, items.length, navigate]);

  const totalPrice = getTotalPrice();

  // Get list of enabled days for user message
  const getEnabledDaysMessage = () => {
    const enabledDays = Object.keys(deliveryEnabledDays).filter(
      day => deliveryEnabledDays[day] === true
    );
    if (enabledDays.length === 0) return '';
    return enabledDays.join(', ');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDeliveryInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!deliveryInfo.delivery_street.trim()) {
      newErrors.delivery_street = t('auth.requiredField');
    }

    if (!deliveryInfo.delivery_house_number.trim()) {
      newErrors.delivery_house_number = t('auth.requiredField');
    }

    if (!deliveryInfo.delivery_location) {
      newErrors.delivery_location = t('auth.requiredField');
    }

    if (!deliveryInfo.phone.trim()) {
      newErrors.phone = t('auth.requiredField');
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      // Step 1: Save order to database
      const createdOrder = await createOrder({
        items,
        deliveryInfo,
      });

      // Step 2: Store order data and show confirmation modal
      setPendingOrder({
        createdOrder,
        orderData: {
          items,
          deliveryInfo,
          user,
          totalPrice,
          orderId: createdOrder.id,
        },
      });

      setShowConfirmModal(true);
    } catch (error) {
      console.error('Error creating order:', error);

      // Handle specific error messages
      let errorMessage = t('checkout.orderError');

      if (error.response?.data) {
        const errorData = error.response.data;

        // Check for specific field errors
        if (errorData.items) {
          errorMessage = `Error en items: ${errorData.items}`;
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (typeof errorData === 'object') {
          const errorFields = Object.keys(errorData);
          if (errorFields.length > 0) {
            errorMessage = `Error: ${errorFields.join(', ')}`;
          }
        }
      }

      toast.error(errorMessage, {
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmOrder = async () => {
    if (!pendingOrder) return;

    setLoading(true);

    try {
      const { orderData, createdOrder } = pendingOrder;

      // Prepare email data
      const emailData = {
        order_id: createdOrder.id,
        user_name: user.full_name || user.username,
        user_email: user.email,
        language: language,
        delivery_info: {
          street: deliveryInfo.delivery_street,
          house_number: deliveryInfo.delivery_house_number,
          location: deliveryInfo.delivery_location,
          phone: deliveryInfo.phone,
          notes: deliveryInfo.notes || '',
        },
        items: items.map(item => {
          const productName = getTranslation(item.product.translations, 'name');
          const basePrice = parseFloat(item.product.price) || 0;

          let extrasPrice = 0;
          let selectedExtras = [];
          if (item.customization?.selectedExtras) {
            selectedExtras = item.customization.selectedExtras.map(extra => ({
              name: getTranslation(extra.translations, 'name'),
              price: parseFloat(extra.price) || 0,
            }));
            extrasPrice = selectedExtras.reduce((sum, extra) => sum + extra.price, 0);
          }

          const pricePerUnit = basePrice + extrasPrice;
          const itemSubtotal = pricePerUnit * item.quantity;

          // Get selected options details
          let selectedOptions = {};
          if (item.customization?.selectedOptions) {
            selectedOptions = Object.values(item.customization.selectedOptions).reduce((acc, option) => {
              acc[option.optionName] = option.choiceName;
              return acc;
            }, {});
          }

          return {
            name: productName,
            quantity: item.quantity,
            unit_price: pricePerUnit,
            subtotal: itemSubtotal,
            customization: item.customization ? {
              /* ============================================
                 COMENTADO: Ingredientes deseleccionados
                 ============================================ */
              // deselected_ingredients: item.customization.deselectedIngredients || [],
              selected_options: selectedOptions,
              selected_extras: selectedExtras,
              additional_notes: item.customization.additionalNotes || '',
            } : null,
          };
        }),
        total_price: totalPrice,
      };

      // Send confirmation emails
      await sendOrderConfirmationEmails(emailData);

      // Send WhatsApp message
      sendOrderViaWhatsApp(orderData, language, getTranslation, whatsappNumber);

      // Show success notification
      toast.success(t('checkout.orderSuccess'), {
        icon: '✅',
        duration: 4000,
      });

      // Close modal and clear state
      setShowConfirmModal(false);
      setPendingOrder(null);

      // Clear cart and navigate
      setTimeout(() => {
        clearCart();
        navigate('/');
      }, 1000);
    } catch (error) {
      console.error('Error confirming order:', error);

      toast.error(t('checkout.orderError'), {
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    if (!loading) {
      setShowConfirmModal(false);
      setPendingOrder(null);
    }
  };

  return (
    <div className="min-h-screen py-12 bg-gray-50 dark:bg-gray-900">
      <div className="container-pepper">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/cart')}
            className="inline-flex items-center mb-4 text-pepper-orange hover:text-pepper-orange-dark"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            {t('productDetail.back')}
          </button>
          <h1 className="text-3xl font-bold lg:text-4xl font-gabarito text-pepper-charcoal dark:text-white">
            {t('checkout.title')}
          </h1>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Delivery Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
              <h2 className="mb-6 text-xl font-bold font-gabarito text-pepper-charcoal dark:text-white">
                {t('checkout.deliveryInfo')}
              </h2>

              <div className="space-y-4">
                {/* Delivery Street */}
                <div>
                  <label
                    htmlFor="delivery_street"
                    className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    {t('checkout.deliveryStreet')} *
                  </label>
                  <input
                    id="delivery_street"
                    name="delivery_street"
                    type="text"
                    value={deliveryInfo.delivery_street}
                    onChange={handleChange}
                    className={`appearance-none relative block w-full px-3 py-2 border ${
                      errors.delivery_street ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    } placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-pepper-orange focus:border-transparent dark:bg-gray-800 transition-colors`}
                    placeholder={t('checkout.streetPlaceholder')}
                  />
                  {errors.delivery_street && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.delivery_street}
                    </p>
                  )}
                </div>

                {/* House Number */}
                <div>
                  <label
                    htmlFor="delivery_house_number"
                    className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    {t('checkout.deliveryHouseNumber')} *
                  </label>
                  <input
                    id="delivery_house_number"
                    name="delivery_house_number"
                    type="text"
                    value={deliveryInfo.delivery_house_number}
                    onChange={handleChange}
                    className={`appearance-none relative block w-full px-3 py-2 border ${
                      errors.delivery_house_number ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    } placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-pepper-orange focus:border-transparent dark:bg-gray-800 transition-colors`}
                    placeholder={t('checkout.houseNumberPlaceholder')}
                  />
                  {errors.delivery_house_number && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.delivery_house_number}
                    </p>
                  )}
                </div>

                {/* Delivery Location - Select */}
                <div>
                  <label
                    htmlFor="delivery_location"
                    className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    {t('checkout.deliveryLocation')} *
                  </label>
                  <select
                    id="delivery_location"
                    name="delivery_location"
                    value={deliveryInfo.delivery_location}
                    onChange={handleChange}
                    className={`appearance-none relative block w-full px-3 py-2 border ${
                      errors.delivery_location ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    } placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-pepper-orange focus:border-transparent dark:bg-gray-800 transition-colors`}
                  >
                    <option value="">{t('checkout.selectLocation')}</option>
                    {deliveryLocations.map((location) => (
                      <option key={location.id} value={location.value}>
                        {location.name}
                      </option>
                    ))}
                  </select>
                  {errors.delivery_location && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.delivery_location}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label
                    htmlFor="phone"
                    className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    {t('auth.phoneNumber')} *
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={deliveryInfo.phone}
                    onChange={handleChange}
                    className={`appearance-none relative block w-full px-3 py-2 border ${
                      errors.phone ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    } placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-pepper-orange focus:border-transparent dark:bg-gray-800 transition-colors`}
                    placeholder={t('auth.phonePlaceholder')}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.phone}
                    </p>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <label
                    htmlFor="notes"
                    className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    {t('checkout.notes')}
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows="3"
                    value={deliveryInfo.notes}
                    onChange={handleChange}
                    className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 transition-colors border border-gray-300 rounded-lg appearance-none resize-none dark:border-gray-600 dark:placeholder-gray-400 dark:text-white focus:outline-none focus:ring-2 focus:ring-pepper-orange focus:border-transparent dark:bg-gray-800"
                    placeholder={t('checkout.notesPlaceholder')}
                  />
                </div>
              </div>

              {/* Warning Message - Orders Disabled */}
              {!isOrderingEnabled && (
                <div className="p-4 mt-6 text-sm bg-yellow-50 border border-yellow-200 rounded-lg dark:bg-yellow-900/20 dark:border-yellow-800">
                  <p className="font-semibold text-yellow-800 dark:text-yellow-300">
                    ⚠️ {t('checkout.ordersNotAvailableToday')}
                  </p>
                  <p className="mt-1 text-yellow-700 dark:text-yellow-400">
                    {t('checkout.ordersAvailableOn')}: {getEnabledDaysMessage()}
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <div className="mt-6">
                <button
                  type="submit"
                  disabled={loading || !isOrderingEnabled}
                  className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition-colors bg-green-600 border border-transparent rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg className="w-5 h-5 mr-3 -ml-1 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {t('checkout.sending')}
                    </span>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faWhatsapp} className="mr-2 text-lg" />
                      {t('checkout.sendOrder')}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky p-6 bg-white rounded-lg shadow-md dark:bg-gray-800 top-24">
              <h2 className="mb-6 text-xl font-bold font-gabarito text-pepper-charcoal dark:text-white">
                {t('checkout.orderSummary')}
              </h2>

              {/* Items */}
              <div className="mb-6 space-y-3">
                {items.map(({ id, product, quantity }) => {
                  const name = getTranslation(product.translations, 'name') || 'Sin nombre';
                  const price = parseFloat(product.price) || 0;
                  const subtotal = price * quantity;

                  return (
                    <div key={id} className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        {quantity}x {name}
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        €{subtotal.toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Total */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between text-xl font-bold font-gabarito text-pepper-charcoal dark:text-white">
                  <span>{t('cart.total')}</span>
                  <span className="text-pepper-orange">€{totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order Confirmation Modal */}
      {showConfirmModal && pendingOrder && (
        <OrderConfirmationModal
          isOpen={showConfirmModal}
          onClose={handleCloseModal}
          onConfirm={handleConfirmOrder}
          orderData={{
            items: items,
            deliveryInfo: deliveryInfo,
            totalPrice: totalPrice,
          }}
          loading={loading}
        />
      )}
    </div>
  );
};

export default CheckoutPage;
