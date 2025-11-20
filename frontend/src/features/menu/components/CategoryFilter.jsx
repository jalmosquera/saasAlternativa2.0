import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUtensils,
  faCoffee,
  faIceCream,
  faBurger,
  faBowlFood,
  faLemon
} from '@fortawesome/free-solid-svg-icons';
import { useLanguage } from '@shared/contexts/LanguageContext';

const CategoryFilter = ({ categories, selectedCategory, onCategoryChange, loading }) => {
  const { getTranslation } = useLanguage();

  // Mapeo de iconos por nombre de categoría
  const iconMap = {
    comidas: faUtensils,
    bebidas: faCoffee,
    postres: faIceCream,
    hamburguesas: faBurger,
    camperos: faBurger,
    patatas:faLemon,
    montaditos:faBurger,
    serranitos:faBurger,
    para_picar:faBurger,
    ligth_fusion:faBurger,
    entre_pan_y_pan:faBurger,
    default: faBowlFood,
  };

  // Función para obtener el nombre de la categoría desde translations
  const getCategoryName = (category) => {
    return getTranslation(category?.translations, 'name') || 'Sin nombre';
  };

  // Función para obtener el icono según el nombre de la categoría
  const getCategoryIcon = (categoryName) => {
    if (!categoryName || typeof categoryName !== 'string') {
      return iconMap.default;
    }
    const name = categoryName.toLowerCase();
    return iconMap[name] || iconMap.default;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="inline-block w-8 h-8 border-4 rounded-full animate-spin border-pepper-orange border-t-transparent"></div>
      </div>
    );
  }

  if (!categories || !Array.isArray(categories) || categories.length === 0) {
    return null;
  }

  return (
    <div className="mb-12">
      <h2 className="mb-6 text-2xl font-bold text-center font-gabarito md:text-3xl text-pepper-charcoal dark:text-white">
        Categorías
      </h2>

      {/* Filtros de categoría - Scroll horizontal en móvil */}
      <div className="pb-4 overflow-x-auto">
        <div className="flex items-center space-x-4 md:justify-center min-w-max md:min-w-0">
          {/* Opción "Todos" */}
          <button
            onClick={() => onCategoryChange(null)}
            className={`flex flex-col items-center gap-2 px-4 py-3 rounded-xl transition-all duration-200 min-w-[120px] ${
              selectedCategory === null
                ? 'bg-pepper-orange text-white shadow-lg scale-105'
                : 'bg-white dark:bg-gray-800 text-pepper-charcoal dark:text-white hover:bg-pepper-light dark:hover:bg-gray-700 border-2 border-pepper-gray-light dark:border-gray-600'
            }`}
          >
            <div className="flex items-center justify-center w-10 h-10">
              <FontAwesomeIcon
                icon={faUtensils}
                className="text-xl"
              />
            </div>
            <span className="text-xs font-semibold text-center font-gabarito leading-tight">Todos</span>
          </button>

          {/* Categorías dinámicas */}
          {categories.map((category) => {
            const categoryName = getCategoryName(category);
            return (
              <button
                key={category.id}
                onClick={() => onCategoryChange(category.id)}
                className={`flex flex-col items-center gap-2 px-3 py-3 rounded-xl transition-all duration-200 min-w-[120px] max-w-[140px] ${
                  selectedCategory === category.id
                    ? 'bg-pepper-orange text-white shadow-lg scale-105'
                    : 'bg-white dark:bg-gray-800 text-pepper-charcoal dark:text-white hover:bg-pepper-light dark:hover:bg-gray-700 border-2 border-pepper-gray-light dark:border-gray-600'
                }`}
              >
                <div className="flex items-center justify-center w-10 h-10">
                  <FontAwesomeIcon
                    icon={getCategoryIcon(categoryName)}
                    className="text-xl"
                  />
                </div>
                <span className="text-xs font-semibold text-center font-gabarito leading-tight line-clamp-2">
                  {categoryName}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

CategoryFilter.propTypes = {
  categories: PropTypes.arrayOf(
    PropTypes.shape({
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
      image: PropTypes.string,
    })
  ),
  selectedCategory: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onCategoryChange: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};

CategoryFilter.defaultProps = {
  categories: [],
  selectedCategory: null,
  loading: false,
};

export default CategoryFilter;
