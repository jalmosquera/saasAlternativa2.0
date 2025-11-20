import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faFire } from '@fortawesome/free-solid-svg-icons';
import { useLanguage } from '@shared/contexts/LanguageContext';
import { useCart } from '@shared/contexts/CartContext';
import useOrderingEnabled from '@shared/hooks/useOrderingEnabled';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { getTranslation, t } = useLanguage();
  const { addToCart } = useCart();
  const { isOrderingEnabled } = useOrderingEnabled();
  const {
    id,
    translations,
    price,
    image,
    ingredients = [],
    is_popular = false,
    is_new = false,
    available = true,
  } = product;

  // Extraer datos de traducción usando el idioma actual
  const name = getTranslation(translations, 'name') || 'Sin nombre';
  const description = getTranslation(translations, 'description') || '';

  // Navegar a detalle del producto
  const handleCardClick = () => {
    navigate(`/product/${id}`);
  };

  // Manejar agregar al carrito (previene navegación)
  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(product, 1);

    // Show success notification
    toast.success(t('cart.addedToCart'), {
      icon: '🛒',
    });
  };

  // Imagen placeholder si no hay imagen (SVG inline)
  const productImage = image || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="225" viewBox="0 0 400 225"%3E%3Crect width="400" height="225" fill="%23f5f5f5"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" fill="%23999"%3ESin Imagen%3C/text%3E%3C/svg%3E';

  // El precio ya viene formateado desde la API
  const formattedPrice = price;

  return (
    <div
      onClick={handleCardClick}
      className="card-pepper overflow-hidden group cursor-pointer relative transition-all duration-200 hover:shadow-xl bg-white dark:bg-gray-800 dark:border-gray-700"
    >
      {/* Badge - Popular o Nuevo */}
      {(is_popular || is_new) && (
        <div className="absolute top-3 right-3 z-10">
          {is_popular && (
            <span className="inline-flex items-center space-x-1 bg-pepper-orange text-white px-3 py-1 rounded-full text-sm font-gabarito font-semibold shadow-lg">
              <FontAwesomeIcon icon={faFire} className="text-xs" />
              <span>Popular</span>
            </span>
          )}
          {is_new && !is_popular && (
            <span className="inline-flex items-center space-x-1 bg-pepper-yellow text-white px-3 py-1 rounded-full text-sm font-gabarito font-semibold shadow-lg">
              <FontAwesomeIcon icon={faStar} className="text-xs" />
              <span>Nuevo</span>
            </span>
          )}
        </div>
      )}

      {/* Badge - No disponible */}
      {!available && (
        <div className="absolute top-3 left-3 z-10">
          <span className="bg-gray-600 text-white px-3 py-1 rounded-full text-sm font-gabarito font-semibold shadow-lg">
            Agotado
          </span>
        </div>
      )}

      {/* Imagen del producto */}
      <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
        <img
          src={productImage}
          alt={name}
          className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
            !available ? 'opacity-60 grayscale' : ''
          }`}
          loading="lazy"
        />
      </div>

      {/* Contenido */}
      <div className="p-4">
        {/* Nombre del producto */}
        <h3 className="font-gabarito font-bold text-lg md:text-xl text-pepper-charcoal dark:text-white mb-2 line-clamp-1">
          {name}
        </h3>

        {/* Descripción */}
        {description && (
          <p className="font-inter text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
            {description}
          </p>
        )}

        {/* Ingredientes (iconos) */}
        {ingredients && ingredients.length > 0 && (
          <div className="flex items-center gap-1 mb-3 flex-wrap">
            {ingredients.slice(0, 5).map((ingredient, index) => (
              <span
                key={ingredient.id || index}
                className="text-xl"
                title={getTranslation(ingredient.translations, 'name') || 'Ingrediente'}
              >
                {ingredient.icon}
              </span>
            ))}
            {ingredients.length > 5 && (
              <span className="text-xs text-gray-500 ml-1">
                +{ingredients.length - 5}
              </span>
            )}
          </div>
        )}

        {/* Precio */}
        <div className="flex items-center justify-between">
          <span className="font-gabarito font-bold text-2xl text-pepper-orange">
            {formattedPrice}
          </span>

          {/* Botón de acción - solo mostrar si pedidos están habilitados */}
          {available && isOrderingEnabled && (
            <button
              onClick={handleAddToCart}
              className="px-4 py-2 bg-pepper-orange text-white rounded-lg font-gabarito font-semibold text-sm hover:bg-opacity-90 transition-all duration-200 hover:-translate-y-0.5 shadow-md"
              aria-label={`${t('product.addToCart')} ${name}`}
            >
              {t('product.addToCart')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

ProductCard.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    translations: PropTypes.shape({
      es: PropTypes.shape({
        name: PropTypes.string,
        description: PropTypes.string,
      }),
      en: PropTypes.shape({
        name: PropTypes.string,
        description: PropTypes.string,
      }),
    }),
    price: PropTypes.string,
    image: PropTypes.string,
    ingredients: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        icon: PropTypes.string,
        translations: PropTypes.shape({
          es: PropTypes.shape({
            name: PropTypes.string,
          }),
          en: PropTypes.shape({
            name: PropTypes.string,
          }),
        }),
      })
    ),
    is_popular: PropTypes.bool,
    is_new: PropTypes.bool,
    available: PropTypes.bool,
  }).isRequired,
};

export default ProductCard;
