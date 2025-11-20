import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';
import toast from 'react-hot-toast';
import { getAuthHeaders } from '@shared/utils/auth';

const IngredientModal = ({ isOpen, onClose, ingredient, onSuccess }) => {
  const [formData, setFormData] = useState({
    name_es: '',
    name_en: '',
    icon: '',
    be_extra: false,
    price: '0.00',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (ingredient) {
      setFormData({
        name_es: ingredient.translations?.es?.name || '',
        name_en: ingredient.translations?.en?.name || '',
        icon: ingredient.icon || '',
        be_extra: ingredient.be_extra ?? false,
        price: ingredient.price || '0.00',
      });
    } else {
      setFormData({
        name_es: '',
        name_en: '',
        icon: '',
        be_extra: false,
        price: '0.00',
      });
    }
  }, [ingredient]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dataToSend = {
        translations: {
          es: {
            name: formData.name_es,
          },
          en: {
            name: formData.name_en,
          },
        },
        icon: formData.icon || null,
        be_extra: formData.be_extra,
        price: parseFloat(formData.price) || 0,
      };

      const url = ingredient
        ? `${import.meta.env.VITE_API_URL}/api/ingredients/${ingredient.id}/`
        : `${import.meta.env.VITE_API_URL}/api/ingredients/`;

      const response = await fetch(url, {
        method: ingredient ? 'PUT' : 'POST',
        headers: getAuthHeaders({
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify(dataToSend),
      });

      if (response.ok) {
        toast.success(ingredient ? 'Ingrediente actualizado exitosamente' : 'Ingrediente creado exitosamente');
        onSuccess();
        onClose();
      } else {
        const error = await response.json();
        let errorMessage = 'Error al guardar el ingrediente';
        if (error.detail) {
          errorMessage = error.detail;
        } else if (typeof error === 'object') {
          const errorFields = Object.keys(error);
          if (errorFields.length > 0) {
            errorMessage = `Error en: ${errorFields.join(', ')}`;
          }
        }
        toast.error(errorMessage);
      }
    } catch {
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
        <div className="inline-block align-bottom bg-white dark:bg-dark-card rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-dark-border">
            <h3 className="text-xl font-bold text-gray-900 dark:text-text-primary">
              {ingredient ? 'Editar Ingrediente' : 'Nuevo Ingrediente'}
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
            <div className="space-y-4">
              {/* Name Spanish */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nombre (Español) *
                </label>
                <input
                  type="text"
                  name="name_es"
                  value={formData.name_es}
                  onChange={handleChange}
                  required
                  maxLength="50"
                  className="w-full px-3 py-2 border border-gray-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-gray-900 dark:text-text-primary focus:outline-none focus:ring-2 focus:ring-pepper-orange"
                />
              </div>

              {/* Name English */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nombre (Inglés) *
                </label>
                <input
                  type="text"
                  name="name_en"
                  value={formData.name_en}
                  onChange={handleChange}
                  required
                  maxLength="50"
                  className="w-full px-3 py-2 border border-gray-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-gray-900 dark:text-text-primary focus:outline-none focus:ring-2 focus:ring-pepper-orange"
                />
              </div>

              {/* Icon */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Icono (Font Awesome)
                </label>
                <input
                  type="text"
                  name="icon"
                  value={formData.icon}
                  onChange={handleChange}
                  placeholder="ej: fa-cheese, fa-tomato"
                  maxLength="50"
                  className="w-full px-3 py-2 border border-gray-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-gray-900 dark:text-text-primary focus:outline-none focus:ring-2 focus:ring-pepper-orange"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Ejemplo: fa-cheese, fa-leaf, fa-pepper-hot
                </p>
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Precio (€) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-gray-900 dark:text-text-primary focus:outline-none focus:ring-2 focus:ring-pepper-orange"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Cargo adicional si se agrega como extra
                </p>
              </div>

              {/* Be Extra */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="be_extra"
                  checked={formData.be_extra}
                  onChange={handleChange}
                  className="w-4 h-4 text-pepper-orange border-gray-300 rounded focus:ring-pepper-orange"
                />
                <label className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Puede ser Extra
                </label>
                <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                  (Se puede agregar como extra a productos)
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200 dark:border-dark-border">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-dark-bg border border-gray-300 dark:border-dark-border rounded-lg hover:bg-gray-50 dark:hover:bg-dark-card transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-pepper-orange rounded-lg hover:bg-pepper-orange/90 transition-colors disabled:opacity-50"
              >
                {loading ? 'Guardando...' : (ingredient ? 'Actualizar' : 'Crear')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

IngredientModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  ingredient: PropTypes.object,
  onSuccess: PropTypes.func.isRequired,
};

export default IngredientModal;
