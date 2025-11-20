import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';
import useFetch from '@shared/hooks/useFetch';
import toast from 'react-hot-toast';
import { getAuthHeaders } from '@shared/utils/auth';
import { useLanguage } from '@shared/contexts/LanguageContext';

const ProductModal = ({ isOpen, onClose, product, onSuccess }) => {
  const { getTranslation } = useLanguage();
  const { data: categoriesData } = useFetch('/categories/');
  const { data: ingredientsData } = useFetch('/ingredients/');
  const { data: optionsData } = useFetch('/product-options/');

  const categories = categoriesData?.results || [];
  const ingredients = ingredientsData || []; // Ingredients endpoint returns array directly (no pagination)
  const productOptions = optionsData?.results || [];

  const [formData, setFormData] = useState({
    name_es: '',
    name_en: '',
    description_es: '',
    description_en: '',
    price: '',
    category: '',
    stock: 0,
    available: true,
    allows_extra_ingredients: true,
    image: null,
    ingredients: [],
    options: [],
  });
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (product) {
      setFormData({
        name_es: product.translations?.es?.name || '',
        name_en: product.translations?.en?.name || '',
        description_es: product.translations?.es?.description || '',
        description_en: product.translations?.en?.description || '',
        price: product.price?.replace(' €', '') || '',
        category: product.categories?.[0]?.id || '',
        stock: product.stock || 0,
        available: product.available ?? true,
        allows_extra_ingredients: product.allows_extra_ingredients ?? true,
        image: null,
        ingredients: product.ingredients?.map(ing => ing.id) || [],
        options: product.options?.map(opt => opt.id) || [],
      });
      // Solo mostrar preview de imagen si NO es duplicado
      // Los duplicados empiezan sin imagen (el usuario debe subir una nueva)
      if (!product._isDuplicate) {
        setImagePreview(product.image);
      } else {
        setImagePreview(null);
      }
    } else {
      setFormData({
        name_es: '',
        name_en: '',
        description_es: '',
        description_en: '',
        price: '',
        category: '',
        stock: 0,
        available: true,
        allows_extra_ingredients: true,
        image: null,
        ingredients: [],
        options: [],
      });
      setImagePreview(null);
    }
  }, [product, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === 'file' && files[0]) {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
      setImagePreview(URL.createObjectURL(files[0]));
    } else if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleIngredientToggle = (ingredientId) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.includes(ingredientId)
        ? prev.ingredients.filter(id => id !== ingredientId)
        : [...prev.ingredients, ingredientId]
    }));
  };

  const handleOptionToggle = (optionId) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.includes(optionId)
        ? prev.options.filter(id => id !== optionId)
        : [...prev.options, optionId]
    }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    // Si es un producto duplicado (tiene _isDuplicate pero no ID), tratarlo como nuevo
    const isNewProduct = !product || product._isDuplicate || !product.id;

    const url = isNewProduct
      ? `${import.meta.env.VITE_API_URL}/api/products/`
      : `${import.meta.env.VITE_API_URL}/api/products/${product.id}/`;

    const method = isNewProduct ? 'POST' : 'PATCH';

    // Siempre usar FormData (el serializer del backend lo maneja correctamente)
    const formDataToSend = new FormData();

    // Traducciones como campos planos (el serializer los convierte)
    formDataToSend.append('name_es', formData.name_es || '');
    formDataToSend.append('description_es', formData.description_es || '');
    formDataToSend.append('name_en', formData.name_en || '');
    formDataToSend.append('description_en', formData.description_en || '');

    // Numéricos
    formDataToSend.append('price', parseFloat(formData.price) || 0);
    formDataToSend.append('stock', parseInt(formData.stock) || 0);

    // Boolean
    formDataToSend.append('available', formData.available);
    formDataToSend.append('allows_extra_ingredients', formData.allows_extra_ingredients);

    // Categorías (como string separado por comas)
    formDataToSend.append('categories', formData.category);

    // Ingredientes (cada uno por separado, filtrando undefined/null)
    (formData.ingredients || [])
      .filter(id => id !== undefined && id !== null && id !== 'undefined')
      .forEach((id) => {
        formDataToSend.append('ingredients', id);
      });

    // Opciones (cada una por separado, filtrando undefined/null)
    (formData.options || [])
      .filter(id => id !== undefined && id !== null && id !== 'undefined')
      .forEach((id) => {
        formDataToSend.append('options', id);
      });

    // Imagen (solo si se seleccionó una nueva)
    if (formData.image instanceof File) {
      formDataToSend.append('image', formData.image);
    }

    // Headers sin Content-Type (el navegador lo establece con boundary correcto)
    const headers = getAuthHeaders();
    delete headers['Content-Type'];

    // Debug: log what we're sending
    console.log('=== Sending Product Data ===');
    console.log('Method:', method);
    console.log('URL:', url);
    for (let [key, value] of formDataToSend.entries()) {
      console.log(`${key}:`, value);
    }

    const response = await fetch(url, {
      method,
      headers,
      body: formDataToSend,
    });

    let responseData;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      // Si no es JSON, probablemente es HTML (error 500)
      const text = await response.text();
      console.error('Non-JSON response:', text.substring(0, 500));
      throw new Error('El servidor devolvió un error. Revisa la consola del backend.');
    }

    if (response.ok) {
      const successMessage = isNewProduct
        ? 'Producto creado exitosamente'
        : 'Producto actualizado exitosamente';
      toast.success(successMessage);
      onSuccess();
      onClose();
    } else {
      console.error('Error response:', responseData);
      const messages = Object.entries(responseData)
        .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`)
        .join(' | ');
      toast.error(messages || 'Error al guardar el producto');
    }
  } catch (error) {
    console.error('Error:', error);
    toast.error('Error al conectar con el servidor');
  } finally {
    setLoading(false);
  }
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
        <div className="inline-block overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl dark:bg-dark-card sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-dark-border">
            <h3 className="text-xl font-bold text-gray-900 dark:text-text-primary">
              {product ? 'Editar Producto' : 'Nuevo Producto'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <FontAwesomeIcon icon={faTimes} size="lg" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 py-4">
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              {/* Name Spanish */}
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Nombre (🇪🇸) *
                </label>
                <input
                  type="text"
                  name="name_es"
                  value={formData.name_es}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-200 rounded-lg dark:border-dark-border dark:bg-dark-bg dark:text-text-primary focus:outline-none focus:ring-2 focus:ring-pepper-orange"
                />
              </div>

              {/* Name English */}
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Nombre (🇬🇧) *
                </label>
                <input
                  type="text"
                  name="name_en"
                  value={formData.name_en}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-200 rounded-lg dark:border-dark-border dark:bg-dark-bg dark:text-text-primary focus:outline-none focus:ring-2 focus:ring-pepper-orange"
                />
              </div>

              {/* Description Spanish */}
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Descripción (🇪🇸)
                </label>
                <textarea
                  name="description_es"
                  value={formData.description_es}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-200 rounded-lg resize-none dark:border-dark-border dark:bg-dark-bg dark:text-text-primary focus:outline-none focus:ring-2 focus:ring-pepper-orange"
                />
              </div>

              {/* Description English */}
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Descripción (🇬🇧)
                </label>
                <textarea
                  name="description_en"
                  value={formData.description_en}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-200 rounded-lg resize-none dark:border-dark-border dark:bg-dark-bg dark:text-text-primary focus:outline-none focus:ring-2 focus:ring-pepper-orange"
                />
              </div>

              {/* Price, Stock and Category */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Precio (€) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    required
                    className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-200 rounded-lg dark:border-dark-border dark:bg-dark-bg dark:text-text-primary focus:outline-none focus:ring-2 focus:ring-pepper-orange"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Stock *
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    min="0"
                    required
                    className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-200 rounded-lg dark:border-dark-border dark:bg-dark-bg dark:text-text-primary focus:outline-none focus:ring-2 focus:ring-pepper-orange"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Categoría *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-200 rounded-lg dark:border-dark-border dark:bg-dark-bg dark:text-text-primary focus:outline-none focus:ring-2 focus:ring-pepper-orange"
                  >
                    <option value="">Seleccionar...</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.translations?.es?.name || cat.translations?.en?.name || 'Sin nombre'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Ingredientes */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Ingredientes
                </label>
                <div className="grid grid-cols-2 gap-3 p-3 border border-gray-200 rounded-lg dark:border-dark-border bg-gray-50 dark:bg-dark-bg/50">
                  {ingredients.length > 0 ? (
                    ingredients.map(ing => (
                      <label key={ing.id} className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.ingredients.includes(ing.id)}
                          onChange={() => handleIngredientToggle(ing.id)}
                          className="w-4 h-4 border-gray-300 rounded text-pepper-orange focus:ring-pepper-orange"
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                          {ing.icon} {getTranslation(ing.translations, 'name')}
                        </span>
                      </label>
                    ))
                  ) : (
                    <p className="col-span-2 text-sm text-gray-500 dark:text-gray-400">
                      No hay ingredientes disponibles
                    </p>
                  )}
                </div>
              </div>

              {/* Opciones de Productos */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Opciones Personalizables
                  <span className="block text-xs font-normal text-gray-500 dark:text-gray-400">
                    (Tipo de Carne, Tipo de Salsa, etc.)
                  </span>
                </label>
                <div className="grid grid-cols-2 gap-3 p-3 border border-gray-200 rounded-lg dark:border-dark-border bg-gray-50 dark:bg-dark-bg/50">
                  {productOptions.length > 0 ? (
                    productOptions.map(option => (
                      <label key={option.id} className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.options.includes(option.id)}
                          onChange={() => handleOptionToggle(option.id)}
                          className="w-4 h-4 border-gray-300 rounded text-pepper-orange focus:ring-pepper-orange"
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                          {getTranslation(option.translations, 'name')}
                          {option.is_required && <span className="ml-1 text-xs text-red-500">*</span>}
                          <span className="block text-xs text-gray-500 dark:text-gray-400">
                            {option.choices?.length || 0} {(option.choices?.length || 0) !== 1 ? 'opciones' : 'opción'}
                          </span>
                        </span>
                      </label>
                    ))
                  ) : (
                    <p className="col-span-2 text-sm text-gray-500 dark:text-gray-400">
                      No hay opciones disponibles
                    </p>
                  )}
                </div>
              </div>

              {/* Image */}
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Imagen
                </label>
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-200 rounded-lg dark:border-dark-border dark:bg-dark-bg dark:text-text-primary focus:outline-none focus:ring-2 focus:ring-pepper-orange"
                />
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="object-cover w-32 h-32 mt-2 rounded-lg"
                  />
                )}
              </div>

              {/* Available */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="available"
                  checked={formData.available}
                  onChange={handleChange}
                  className="w-4 h-4 border-gray-300 rounded text-pepper-orange focus:ring-pepper-orange"
                />
                <label className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Disponible
                </label>
              </div>

              {/* Permite Ingredientes Extra */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="allows_extra_ingredients"
                  checked={formData.allows_extra_ingredients}
                  onChange={handleChange}
                  className="w-4 h-4 border-gray-300 rounded text-pepper-orange focus:ring-pepper-orange"
                />
                <label className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Permite ingredientes extra
                  <span className="block text-xs font-normal text-gray-500 dark:text-gray-400">
                    Los clientes pueden agregar ingredientes adicionales al producto
                  </span>
                </label>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end pt-4 mt-6 space-x-3 border-t border-gray-200 dark:border-dark-border">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg dark:text-gray-300 dark:bg-dark-bg dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-card"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white transition-colors rounded-lg bg-pepper-orange hover:bg-pepper-orange/90 disabled:opacity-50"
              >
                {loading ? 'Guardando...' : (product ? 'Actualizar' : 'Crear')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

ProductModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  product: PropTypes.object,
  onSuccess: PropTypes.func.isRequired,
};

export default ProductModal;
