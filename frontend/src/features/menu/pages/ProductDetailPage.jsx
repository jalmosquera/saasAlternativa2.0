import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faStar,
  faFire,
  faPlus,
  faMinus,
  faShoppingCart
} from '@fortawesome/free-solid-svg-icons';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import useFetch from '@/shared/hooks/useFetch';
import { useLanguage } from '@shared/contexts/LanguageContext';
import { useCart } from '@shared/contexts/CartContext';
import useOrderingEnabled from '@shared/hooks/useOrderingEnabled';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  /* ============================================
     COMENTADO: Ocultar ingredientes según petición cliente
     Fecha: 2025-01-16
     Se puede reactivar eliminando este comentario
     ============================================ */
  // const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [selectedExtras, setSelectedExtras] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState({}); // { optionId: choiceId }
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [showExtras, setShowExtras] = useState(false);
  const { getTranslation, t } = useLanguage();
  const { addToCart } = useCart();
  const { isOrderingEnabled } = useOrderingEnabled();

  // Fetch del producto
  const {
    data: productData,
    loading,
    error,
  } = useFetch(`/products/${id}/`);

  // Fetch de ingredientes extras disponibles
  const { data: extraIngredientsData } = useFetch('/ingredients/?be_extra=true');

  // Scroll to top when component mounts or ID changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  /* ============================================
     COMENTADO: Inicialización de ingredientes
     ============================================ */
  // // Initialize selected ingredients when product loads (all selected by default)
  // useEffect(() => {
  //   if (productData && productData.ingredients) {
  //     const allIngredientIds = productData.ingredients.map(ing => ing.id);
  //     setSelectedIngredients(allIngredientIds);
  //   }
  // }, [productData]);

  // Initialize selected options when product loads (first choice selected by default)
  useEffect(() => {
    if (productData && productData.options && productData.options.length > 0) {
      const defaultOptions = {};
      productData.options.forEach(option => {
        if (option.choices && option.choices.length > 0) {
          // Select first choice by default
          defaultOptions[option.id] = option.choices[0].id;
        }
      });
      setSelectedOptions(defaultOptions);
    }
  }, [productData]);

  // Manejar incremento de cantidad
  const handleIncrement = () => {
    setQuantity((prev) => prev + 1);
  };

  // Manejar decremento de cantidad
  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  /* ============================================
     COMENTADO: Función toggle ingredientes
     ============================================ */
  // // Toggle ingredient selection (base ingredients)
  // const toggleIngredient = (ingredientId) => {
  //   setSelectedIngredients(prev => {
  //     if (prev.includes(ingredientId)) {
  //       return prev.filter(id => id !== ingredientId);
  //     } else {
  //       return [...prev, ingredientId];
  //     }
  //   });
  // };

  // Toggle extra ingredient selection
  const toggleExtraIngredient = (ingredientId) => {
    setSelectedExtras(prev => {
      if (prev.includes(ingredientId)) {
        return prev.filter(id => id !== ingredientId);
      } else {
        return [...prev, ingredientId];
      }
    });
  };

  // Handle option selection (radio button)
  const handleOptionChange = (optionId, choiceId) => {
    setSelectedOptions(prev => ({
      ...prev,
      [optionId]: choiceId
    }));
  };

  // Manejar agregar al carrito
  const handleAddToCart = () => {
    // Get full extra ingredient objects with prices
    const extrasWithPrices = selectedExtras.map(extraId => {
      const extra = extraIngredients.find(ing => ing.id === extraId);
      return extra;
    }).filter(Boolean);

    /* ============================================
       COMENTADO: Cálculo de ingredientes deseleccionados
       ============================================ */
    // // Calculate deselected ingredients (ingredients that were removed)
    // const allIngredientIds = productData.ingredients.map(ing => ing.id);
    // const deselectedIngredientIds = allIngredientIds.filter(id => !selectedIngredients.includes(id));
    // const deselectedIngredientNames = productData.ingredients
    //   .filter(ing => deselectedIngredientIds.includes(ing.id))
    //   .map(ing => getTranslation(ing.translations, 'name'));

    // Get selected option details for customization
    const selectedOptionsDetails = {};
    if (productData.options) {
      productData.options.forEach(option => {
        const selectedChoiceId = selectedOptions[option.id];
        const selectedChoice = option.choices?.find(choice => choice.id === selectedChoiceId);
        if (selectedChoice) {
          selectedOptionsDetails[option.id] = {
            optionId: option.id,
            optionName: getTranslation(option.translations, 'name'),
            choiceId: selectedChoice.id,
            choiceName: getTranslation(selectedChoice.translations, 'name'),
            icon: selectedChoice.icon,
          };
        }
      });
    }

    const customization = {
      /* ============================================
         COMENTADO: Ingredientes en customization
         ============================================ */
      // selectedIngredients,
      // deselectedIngredients: deselectedIngredientNames,
      selectedExtras: extrasWithPrices,
      selectedOptions: selectedOptionsDetails,
      additionalNotes: additionalNotes.trim(),
    };
    addToCart(productData, quantity, customization);

    // Show success notification
    toast.success(t('cart.addedToCart'), {
      icon: '🛒',
    });

    // Reset to defaults after adding
    setQuantity(1);
    setAdditionalNotes('');
    setSelectedExtras([]);
    setShowExtras(false);

    // Reset options to first choice
    if (productData && productData.options && productData.options.length > 0) {
      const defaultOptions = {};
      productData.options.forEach(option => {
        if (option.choices && option.choices.length > 0) {
          defaultOptions[option.id] = option.choices[0].id;
        }
      });
      setSelectedOptions(defaultOptions);
    }

    /* ============================================
       COMENTADO: Reset de ingredientes seleccionados
       ============================================ */
    // if (productData && productData.ingredients) {
    //   const allIngredientIds = productData.ingredients.map(ing => ing.id);
    //   setSelectedIngredients(allIngredientIds);
    // }
  };

  // Estado de carga
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 rounded-full animate-spin border-pepper-orange border-t-transparent"></div>
          <p className="mt-4 text-xl font-semibold font-gabarito text-pepper-charcoal">
            Cargando producto...
          </p>
        </div>
      </div>
    );
  }

  // Estado de error
  if (error || !productData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="max-w-md text-center">
          <div className="flex items-center justify-center w-20 h-20 mx-auto mb-4 bg-red-100 rounded-full">
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
          <h3 className="mb-2 text-2xl font-bold font-gabarito text-pepper-charcoal">
            Producto no encontrado
          </h3>
          <p className="mb-6 text-gray-600 font-inter">
            {error || 'El producto que buscas no existe.'}
          </p>
          <button
            onClick={() => navigate('/')}
            className="btn-pepper-primary"
          >
            Volver al menú
          </button>
        </div>
      </div>
    );
  }

  const {
    translations,
    price,
    image,
    is_popular = false,
    is_new = false,
    available = true,
    allows_extra_ingredients = true,
    categories = [],
    ingredients = [],
    options = [],
  } = productData;

  // Extraer datos de traducción usando el idioma actual
  const name = getTranslation(translations, 'name') || 'Sin nombre';
  const description = getTranslation(translations, 'description') || '';

  // Imagen placeholder
  const productImage = image || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="225" viewBox="0 0 400 225"%3E%3Crect width="400" height="225" fill="%23f5f5f5"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" fill="%23999"%3ESin Imagen%3C/text%3E%3C/svg%3E';

  // El precio ya viene formateado desde la API como string (ej: "7487.00 €")
  const formattedPrice = price;

  // Obtener ingredientes extras disponibles
  const extraIngredients = extraIngredientsData || []; // Ingredients endpoint returns array directly (no pagination)

  // Para calcular el total, necesitamos extraer el número del string
  const priceNumber = parseFloat(price?.replace(/[^\d.]/g, '') || 0);

  // Calcular precio de extras sumando el precio de cada ingrediente extra seleccionado
  const extrasPrice = selectedExtras.reduce((total, extraId) => {
    const extra = extraIngredients.find(ing => ing.id === extraId);
    return total + (extra ? parseFloat(extra.price || 0) : 0);
  }, 0);

  const totalPrice = ((priceNumber + extrasPrice) * quantity).toFixed(2) + ' €';



  
  return (
    <div className="min-h-screen py-8 transition-colors duration-200 bg-pepper-light dark:bg-gray-900">
      <div className="container-pepper">
        {/* Botón volver */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center mb-6 space-x-2 transition-colors text-pepper-orange hover:text-pepper-charcoal dark:hover:text-white"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          <span className="font-semibold font-gabarito"></span>
        </button>

        {/* Contenido principal */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Imagen del producto */}
          <div className="relative">
            <div
              className="relative overflow-hidden bg-white cursor-pointer card-pepper dark:bg-gray-800 group/image"
              onClick={() => setIsImageModalOpen(true)}
            >
              {/* Badges */}
              {(is_popular || is_new) && (
                <div className="absolute z-10 flex flex-col space-y-2 top-4 right-4">
                  {is_popular && (
                    <span className="inline-flex items-center px-3 py-2 space-x-1 text-sm font-semibold text-white rounded-full shadow-lg bg-pepper-orange font-gabarito">
                      <FontAwesomeIcon icon={faFire} className="text-xs" />
                      <span>Popular</span>
                    </span>
                  )}
                  {is_new && (
                    <span className="inline-flex items-center px-3 py-2 space-x-1 text-sm font-semibold text-white rounded-full shadow-lg bg-pepper-yellow font-gabarito">
                      <FontAwesomeIcon icon={faStar} className="text-xs" />
                      <span>Nuevo</span>
                    </span>
                  )}
                </div>
              )}

              {/* Badge no disponible */}
              {!available && (
                <div className="absolute z-10 top-4 left-4">
                  <span className="px-4 py-2 text-sm font-semibold text-white bg-gray-600 rounded-full shadow-lg font-gabarito">
                    Agotado
                  </span>
                </div>
              )}

              <img
                src={productImage}
                alt={name}
                className={`w-full h-auto object-cover transition-transform duration-300 group-hover/image:scale-105 ${
                  !available ? 'opacity-60 grayscale' : ''
                }`}
                style={{ aspectRatio: '16/9' }}
              />

              {/* Overlay hover indicator */}
              <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-300 bg-black opacity-0 group-hover/image:opacity-10">
                <div className="p-3 transition-all duration-300 transform scale-75 bg-white rounded-full opacity-0 dark:bg-gray-800 group-hover/image:opacity-100 group-hover/image:scale-100">
                  <svg
                    className="w-6 h-6 text-pepper-orange"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Información del producto */}
          <div className="flex flex-col">
            {/* Categorías */}
            {categories.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {categories.map((category) => (
                  <span
                    key={category.id}
                    className="inline-block px-3 py-1 text-sm font-semibold bg-white border-2 rounded-full dark:bg-gray-800 text-pepper-orange font-gabarito border-pepper-orange"
                  >
                    {getTranslation(category.translations, 'name') || 'Sin categoría'}
                  </span>
                ))}
              </div>
            )}

            {/* Nombre */}
            <h1 className="mb-4 text-3xl font-black font-gabarito md:text-4xl lg:text-5xl text-pepper-charcoal dark:text-white">
              {name}
            </h1>

            {/* Descripción */}
            {description && (
              <p className="mb-6 text-lg leading-relaxed text-gray-600 font-inter dark:text-gray-300">
                {description}
              </p>
            )}
            {/* Product Options (Meat Type, Sauce Type) - solo si pedidos habilitados */}
            {isOrderingEnabled && options && options.length > 0 && (
              <div className="mb-6">
                {options.map((option) => {
                  const optionName = getTranslation(option.translations, 'name') || 'Opción';
                  const isRequired = option.is_required;

                  return (
                    <div key={option.id} className="mb-6">
                      <h3 className="mb-3 text-xl font-bold font-gabarito text-pepper-charcoal dark:text-white">
                        {optionName}
                        {isRequired && <span className="ml-2 text-sm text-pepper-orange">*</span>}
                      </h3>
                      <div className="flex flex-wrap gap-3">
                        {option.choices && option.choices.map((choice) => {
                          const choiceName = getTranslation(choice.translations, 'name') || 'Opción';
                          const isSelected = selectedOptions[option.id] === choice.id;

                          return (
                            <label
                              key={choice.id}
                              className={`flex items-center space-x-2 px-4 py-3 rounded-lg border-2 cursor-pointer transition-all ${
                                isSelected
                                  ? 'bg-pepper-orange border-pepper-orange text-white shadow-md'
                                  : 'bg-white dark:bg-gray-800 border-pepper-gray-light dark:border-gray-600 text-pepper-charcoal dark:text-white hover:border-pepper-orange'
                              }`}
                            >
                              <input
                                type="radio"
                                name={`option-${option.id}`}
                                checked={isSelected}
                                onChange={() => handleOptionChange(option.id, choice.id)}
                                className="w-4 h-4 border-gray-300 text-pepper-orange focus:ring-pepper-orange"
                              />
                              {choice.icon && <span className="text-2xl">{choice.icon}</span>}
                              <span className="font-semibold font-gabarito">
                                {choiceName}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Campo para ingredientes adicionales - solo si pedidos habilitados */}
            {isOrderingEnabled && (
                  <div className="mt-4">
                    <label htmlFor="additionalNotes" className="block mb-2 text-sm font-medium">
                      <span className="inline-block px-3 py-2 leading-relaxed text-justify text-gray-800 bg-yellow-200 rounded-lg dark:bg-yellow-500/30 dark:text-gray-200">
                        {t('productDetail.additionalIngredients')}
                      </span>
                    </label>
                    <input
                      id="additionalNotes"
                      type="text"
                      value={additionalNotes}
                      onChange={(e) => setAdditionalNotes(e.target.value)}
                      placeholder={t('productDetail.additionalIngredientsPlaceholder')}
                      className="w-full px-4 py-2 transition-colors border-2 rounded-lg border-pepper-gray-light dark:border-gray-600 focus:border-pepper-orange focus:outline-none dark:bg-gray-800 dark:text-white "
                    />
                  </div>
                )}

            {/* ============================================
                COMENTADO: Sección de ingredientes base
                Se oculta según petición del cliente
                Fecha: 2025-01-16
                ============================================
            {ingredients && ingredients.length > 0 && (
              <div className="mb-6">
                <h3 className="mb-3 text-xl font-bold font-gabarito text-pepper-charcoal dark:text-white">
                  {t('productDetail.ingredients')}:
                </h3>
                {isOrderingEnabled && (
                  <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
                    {t('productDetail.selectIngredients')}
                  </p>
                )}
                <div className="flex flex-wrap gap-3">
                  {ingredients.map((ingredient, index) => {
                    const ingredientName = getTranslation(ingredient.translations, 'name') || 'Ingrediente';
                    const isSelected = selectedIngredients.includes(ingredient.id);

                    return isOrderingEnabled ? (
                      <label
                        key={ingredient.id || index}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-2 cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-pepper-orange border-pepper-orange text-white'
                            : 'bg-white dark:bg-gray-800 border-pepper-gray-light dark:border-gray-600 text-pepper-charcoal dark:text-white hover:border-pepper-orange'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleIngredient(ingredient.id)}
                          className="w-4 h-4 border-gray-300 rounded text-pepper-orange focus:ring-pepper-orange"
                        />
                        <span className="text-2xl">{ingredient.icon}</span>
                        <span className="font-semibold font-gabarito">
                          {ingredientName}
                        </span>
                      </label>
                    ) : (
                      <div
                        key={ingredient.id || index}
                        className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800"
                      >
                        <span className="text-2xl">{ingredient.icon}</span>
                        <span className="font-semibold font-gabarito text-pepper-charcoal dark:text-white">
                          {ingredientName}
                        </span>
                      </div>
                    );
                  })}
                </div>

                Botón para agregar extras
                {isOrderingEnabled && extraIngredients.length > 0 && (
                  <div className="mt-6">
                    <button
                      type="button"
                      onClick={() => setShowExtras(!showExtras)}
                      className="w-full px-4 py-3 font-semibold transition-all border-2 rounded-lg font-gabarito border-pepper-orange text-pepper-orange hover:bg-pepper-orange hover:text-white"
                    >
                      {showExtras ? t('productDetail.hideExtras') : t('productDetail.addExtras')}
                    </button>

                    Lista de ingredientes extras
                    {showExtras && (
                      <div className="p-4 mt-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <p className="mb-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                          {t('productDetail.selectAdditionalIngredients')}
                        </p>
                        <div className="flex flex-wrap gap-3">
                          {extraIngredients.map((ingredient) => {
                            const ingredientName = getTranslation(ingredient.translations, 'name') || 'Ingrediente';
                            const ingredientPrice = parseFloat(ingredient.price || 0).toFixed(2);
                            const isSelected = selectedExtras.includes(ingredient.id);

                            return (
                              <label
                                key={ingredient.id}
                                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-2 cursor-pointer transition-all ${
                                  isSelected
                                    ? 'bg-green-500 border-green-500 text-white'
                                    : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-pepper-charcoal dark:text-white hover:border-green-500'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleExtraIngredient(ingredient.id)}
                                  className="w-4 h-4 border-gray-300 rounded text-green-500 focus:ring-green-500"
                                />
                                <span className="text-2xl">{ingredient.icon}</span>
                                <span className="font-semibold font-gabarito">
                                  {ingredientName} <span className="text-xs">(+{ingredientPrice}€)</span>
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            */}

            {/* Sección de extras - solo si el producto permite ingredientes extra */}
            {isOrderingEnabled && allows_extra_ingredients && extraIngredients.length > 0 && (
              <div className="mb-6">
                <button
                  type="button"
                  onClick={() => setShowExtras(!showExtras)}
                  className="w-full px-4 py-3 font-semibold transition-all border-2 rounded-lg font-gabarito border-pepper-orange text-pepper-orange hover:bg-pepper-orange hover:text-white"
                >
                  {showExtras ? t('productDetail.hideExtras') : t('productDetail.addExtras')}
                </button>

                {/* Lista de ingredientes extras */}
                {showExtras && (
                  <div className="p-4 mt-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <p className="mb-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                      {t('productDetail.selectAdditionalIngredients')}
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {extraIngredients.map((ingredient) => {
                        const ingredientName = getTranslation(ingredient.translations, 'name') || 'Ingrediente';
                        const ingredientPrice = parseFloat(ingredient.price || 0).toFixed(2);
                        const isSelected = selectedExtras.includes(ingredient.id);

                        return (
                          <label
                            key={ingredient.id}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-2 cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-green-500 border-green-500 text-white'
                                : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-pepper-charcoal dark:text-white hover:border-green-500'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleExtraIngredient(ingredient.id)}
                              className="w-4 h-4 border-gray-300 rounded text-green-500 focus:ring-green-500"
                            />
                            <span className="text-2xl">{ingredient.icon}</span>
                            <span className="font-semibold font-gabarito">
                              {ingredientName} <span className="text-xs">(+{ingredientPrice}€)</span>
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Precio */}
            <div className="mb-8">
              <span className="text-4xl font-black font-gabarito text-pepper-orange">
                {formattedPrice}
              </span>
            </div>

            {/* Selector de cantidad y botón agregar - solo mostrar si pedidos habilitados */}
            {available && isOrderingEnabled && (
              <div className="space-y-4">
                {/* Selector de cantidad */}
                <div className="flex items-center space-x-4">
                  <span className="font-semibold font-gabarito text-pepper-charcoal dark:text-white">
                    Cantidad:
                  </span>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={handleDecrement}
                      className="flex items-center justify-center w-10 h-10 transition-colors bg-white border-2 rounded-lg dark:bg-gray-800 border-pepper-gray-light dark:border-gray-600 hover:border-pepper-orange"
                      disabled={quantity <= 1}
                    >
                      <FontAwesomeIcon icon={faMinus} className="text-pepper-charcoal dark:text-white" />
                    </button>
                    <span className="font-gabarito font-bold text-2xl text-pepper-charcoal dark:text-white min-w-[3rem] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={handleIncrement}
                      className="flex items-center justify-center w-10 h-10 transition-colors bg-white border-2 rounded-lg dark:bg-gray-800 border-pepper-gray-light dark:border-gray-600 hover:border-pepper-orange"
                    >
                      <FontAwesomeIcon icon={faPlus} className="text-pepper-charcoal dark:text-white" />
                    </button>
                  </div>
                </div>

                {/* Total */}
                <div className="flex items-center justify-between px-6 py-4 bg-white border-2 rounded-lg dark:bg-gray-800 border-pepper-gray-light dark:border-gray-600">
                  <span className="text-lg font-semibold font-gabarito text-pepper-charcoal dark:text-white">
                    Total:
                  </span>
                  <span className="text-2xl font-black font-gabarito text-pepper-orange">
                    {totalPrice}
                  </span>
                </div>

                {/* Botón agregar al carrito */}
                <button
                  onClick={handleAddToCart}
                  className="w-full flex items-center justify-center space-x-3 py-4 bg-pepper-orange text-white rounded-lg font-gabarito font-bold text-lg hover:bg-opacity-90 transition-all duration-200 hover:-translate-y-0.5 shadow-lg"
                >
                  <FontAwesomeIcon icon={faShoppingCart} />
                  <span>Agregar al carrito</span>
                </button>
              </div>
            )}

            {/* Mensaje de producto no disponible - solo si producto no está available */}
            {!available && (
              <div className="px-8 py-6 text-center bg-gray-100 rounded-lg dark:bg-gray-800">
                <p className="text-xl font-bold text-gray-600 font-gabarito dark:text-gray-300">
                  Este producto no está disponible en este momento
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image Modal with Blur Background */}
      {isImageModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn"
          onClick={() => setIsImageModalOpen(false)}
        >
          <div
            className="relative max-w-7xl max-h-[90vh] animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setIsImageModalOpen(false)}
              className="absolute right-0 p-2 text-white transition-colors -top-12 hover:text-pepper-orange"
              aria-label="Cerrar"
            >
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Image */}
            <img
              src={productImage}
              alt={name}
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
            />

            {/* Image info overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 rounded-b-lg bg-gradient-to-t from-black/80 to-transparent">
              <h3 className="text-2xl font-bold text-white font-gabarito">
                {name}
              </h3>
              {description && (
                <p className="mt-2 text-sm text-gray-200 font-inter">
                  {description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;
