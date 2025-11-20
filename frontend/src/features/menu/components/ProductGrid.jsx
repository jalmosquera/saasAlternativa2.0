import PropTypes from 'prop-types';
import ProductCard from './ProductCard';

const ProductGrid = ({ products, loading, error }) => {
  // Estado de carga
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-pepper-orange border-t-transparent"></div>
          <p className="font-gabarito font-semibold text-xl text-pepper-charcoal mt-4">
            Cargando productos...
          </p>
        </div>
      </div>
    );
  }

  // Estado de error
  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg
              className="w-10 h-10 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="font-gabarito font-bold text-2xl text-pepper-charcoal mb-2">
            Error al cargar productos
          </h3>
          <p className="font-inter text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  // Sin productos
  if (!products || !Array.isArray(products) || products.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-4 bg-pepper-light rounded-full flex items-center justify-center">
            <svg
              className="w-10 h-10 text-pepper-orange"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
          </div>
          <h3 className="font-gabarito font-bold text-2xl text-pepper-charcoal mb-2">
            No hay productos disponibles
          </h3>
          <p className="font-inter text-gray-600">
            Por el momento no tenemos productos para mostrar. Vuelve pronto.
          </p>
        </div>
      </div>
    );
  }

  // Grid de productos
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

ProductGrid.propTypes = {
  products: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
      description: PropTypes.string,
      price: PropTypes.number.isRequired,
      image: PropTypes.string,
      is_popular: PropTypes.bool,
      is_new: PropTypes.bool,
      available: PropTypes.bool,
    })
  ),
  loading: PropTypes.bool,
  error: PropTypes.string,
};

ProductGrid.defaultProps = {
  products: [],
  loading: false,
  error: null,
};

export default ProductGrid;
