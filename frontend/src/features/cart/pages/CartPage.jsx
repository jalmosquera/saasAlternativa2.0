import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faTrash, faPlus, faMinus, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useCart } from '@shared/contexts/CartContext';
import { useLanguage } from '@shared/contexts/LanguageContext';
import { useAuth } from '@shared/contexts/AuthContext';

const CartPage = () => {
  const { items, removeFromCart, incrementQuantity, decrementQuantity, getTotalPrice, clearCart } = useCart();
  const { t, getTranslation } = useLanguage();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const totalPrice = getTotalPrice();

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="container-pepper">
          <div className="max-w-2xl mx-auto text-center">
            <FontAwesomeIcon
              icon={faShoppingCart}
              className="text-6xl text-gray-300 dark:text-gray-600 mb-6"
            />
            <h1 className="text-3xl font-gabarito font-bold text-pepper-charcoal dark:text-white mb-4">
              {t('cart.emptyCart')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              {t('cart.emptyCartMessage')}
            </p>
            <Link to="/" className="btn-pepper-primary inline-block">
              {t('cart.continueShopping')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container-pepper">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center text-pepper-orange hover:text-pepper-orange-dark mb-4"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            {t('cart.continueShopping')}
          </Link>
          <h1 className="text-3xl lg:text-4xl font-gabarito font-bold text-pepper-charcoal dark:text-white">
            {t('cart.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {items.length} {items.length === 1 ? t('cart.item') : t('cart.items')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const { id: itemId, product, quantity, customization } = item;
              const name = getTranslation(product.translations, 'name') || 'Sin nombre';
              const productImage = product.image || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%23f5f5f5"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="14" fill="%23999"%3ENo img%3C/text%3E%3C/svg%3E';

              // Calculate base price
              const basePrice = parseFloat(product.price) || 0;

              // Calculate extras price
              let extrasPrice = 0;
              if (customization?.selectedExtras) {
                extrasPrice = customization.selectedExtras.reduce((sum, extra) => {
                  return sum + (parseFloat(extra.price) || 0);
                }, 0);
              }

              // Total price per unit (base + extras)
              const pricePerUnit = basePrice + extrasPrice;
              const subtotal = pricePerUnit * quantity;

              // Get customized ingredients if any
              const hasCustomization = customization && (
                /* ============================================
                   COMENTADO: Verificación de ingredientes seleccionados
                   ============================================ */
                // (customization.selectedIngredients && customization.selectedIngredients.length < (product.ingredients?.length || 0)) ||
                customization.selectedExtras?.length > 0 ||
                customization.selectedOptions ||
                customization.additionalNotes
              );

              return (
                <div
                  key={itemId}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 flex flex-col gap-4"
                >
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <Link
                      to={`/product/${product.id}`}
                      className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                    >
                      <img
                        src={productImage}
                        alt={name}
                        className="w-full h-full object-cover"
                      />
                    </Link>

                    {/* Product Info */}
                    <div className="flex-grow">
                      <Link to={`/product/${product.id}`}>
                        <h3 className="font-gabarito font-bold text-lg text-pepper-charcoal dark:text-white mb-1 hover:text-pepper-orange transition-colors cursor-pointer">
                          {name}
                        </h3>
                      </Link>
                      <div className="mb-3">
                        <p className="text-pepper-orange font-bold text-xl">
                          €{pricePerUnit.toFixed(2)}
                        </p>
                        {extrasPrice > 0 && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Base: €{basePrice.toFixed(2)} + Extras: €{extrasPrice.toFixed(2)}
                          </p>
                        )}
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => decrementQuantity(itemId)}
                          className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <FontAwesomeIcon icon={faMinus} className="text-sm" />
                        </button>
                        <span className="w-12 text-center font-gabarito font-bold text-pepper-charcoal dark:text-white">
                          {quantity}
                        </span>
                        <button
                          onClick={() => incrementQuantity(itemId)}
                          className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                          aria-label="Increase quantity"
                        >
                          <FontAwesomeIcon icon={faPlus} className="text-sm" />
                        </button>
                        <button
                          onClick={() => removeFromCart(itemId)}
                          className="ml-auto text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                          aria-label="Remove item"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </div>

                    {/* Subtotal */}
                    <div className="flex-shrink-0 text-right">
                      <p className="font-gabarito font-bold text-xl text-pepper-charcoal dark:text-white">
                        €{subtotal.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Show customization details if any */}
                  {hasCustomization && (
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-3 text-sm">
                      {/* ============================================
                          COMENTADO: Mostrar ingredientes customizados
                          ============================================
                      {customization.selectedIngredients && customization.selectedIngredients.length < (product.ingredients?.length || 0) && (
                        <div className="mb-2">
                          <span className="font-semibold text-gray-700 dark:text-gray-300">
                            {t('cart.customIngredients')}:
                          </span>
                          <span className="text-gray-600 dark:text-gray-400 ml-2">
                            {product.ingredients
                              ?.filter(ing => customization.selectedIngredients.includes(ing.id))
                              .map(ing => getTranslation(ing.translations, 'name'))
                              .join(', ')}
                          </span>
                        </div>
                      )}
                      */}
                      {/* Show selected options (Meat Type, Sauce Type, etc.) */}
                      {customization.selectedOptions && Object.keys(customization.selectedOptions).length > 0 && (
                        <div className="mb-2 space-y-1">
                          {Object.values(customization.selectedOptions).map((option) => (
                            <div key={option.optionId}>
                              <span className="font-semibold text-gray-700 dark:text-gray-300">
                                {option.optionName}:
                              </span>
                              <span className="text-gray-600 dark:text-gray-400 ml-2">
                                {option.icon && `${option.icon} `}{option.choiceName}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                      {customization.selectedExtras && customization.selectedExtras.length > 0 && (
                        <div className="mb-2">
                          <span className="font-semibold text-gray-700 dark:text-gray-300">
                            Extras:
                          </span>
                          <span className="text-gray-600 dark:text-gray-400 ml-2">
                            {customization.selectedExtras
                              .map(extra => `${getTranslation(extra.translations, 'name')} (+€${parseFloat(extra.price).toFixed(2)})`)
                              .join(', ')}
                          </span>
                        </div>
                      )}
                      {customization.additionalNotes && (
                        <div>
                          <span className="font-semibold text-gray-700 dark:text-gray-300">
                            {t('cart.extraNotes')}:
                          </span>
                          <span className="text-gray-600 dark:text-gray-400 ml-2">
                            {customization.additionalNotes}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Clear Cart Button */}
            <button
              onClick={clearCart}
              className="w-full py-3 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-gabarito font-semibold transition-colors"
            >
              <FontAwesomeIcon icon={faTrash} className="mr-2" />
              {t('cart.clearCart')}
            </button>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sticky top-24">
              <h2 className="font-gabarito font-bold text-xl text-pepper-charcoal dark:text-white mb-6">
                {t('checkout.orderSummary')}
              </h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>{t('cart.subtotal')}</span>
                  <span>€{totalPrice.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                  <div className="flex justify-between font-gabarito font-bold text-xl text-pepper-charcoal dark:text-white">
                    <span>{t('cart.total')}</span>
                    <span className="text-pepper-orange">€{totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              {!isAuthenticated ? (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                    {t('cart.loginRequired')}
                  </p>
                  <Link
                    to="/login"
                    className="block w-full text-center btn-pepper-primary"
                  >
                    {t('cart.loginToOrder')}
                  </Link>
                </div>
              ) : (
                <button
                  onClick={handleCheckout}
                  className="w-full btn-pepper-primary"
                >
                  {t('cart.proceedToCheckout')}
                </button>
              )}

              <Link
                to="/"
                className="block w-full text-center mt-3 text-pepper-orange hover:text-pepper-orange-dark transition-colors"
              >
                {t('cart.continueShopping')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
