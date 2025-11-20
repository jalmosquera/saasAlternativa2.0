import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';
import toast from 'react-hot-toast';
import { getAuthHeaders } from '@shared/utils/auth';

const ProductOptionModal = ({ option, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name_es: '',
    name_en: '',
    is_required: true,
    order: 0,
  });

  const [choices, setChoices] = useState([]);
  const [loading, setLoading] = useState(false);

  // Initialize form data when editing
  useEffect(() => {
    if (option) {
      setFormData({
        name_es: option.translations?.es?.name || '',
        name_en: option.translations?.en?.name || '',
        is_required: option.is_required ?? true,
        order: option.order || 0,
      });

      // Initialize choices
      if (option.choices && option.choices.length > 0) {
        setChoices(
          option.choices.map(choice => ({
            id: choice.id,
            name_es: choice.translations?.es?.name || '',
            name_en: choice.translations?.en?.name || '',
            icon: choice.icon || '',
            price_adjustment: choice.price_adjustment || '0.00',
            order: choice.order || 0,
            _isExisting: true, // Mark as existing
          }))
        );
      }
    } else {
      // Reset for new option
      setFormData({
        name_es: '',
        name_en: '',
        is_required: true,
        order: 0,
      });
      setChoices([]);
    }
  }, [option]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddChoice = () => {
    setChoices(prev => [
      ...prev,
      {
        id: `temp-${Date.now()}`, // Temporary ID
        name_es: '',
        name_en: '',
        icon: '',
        price_adjustment: '0.00',
        order: prev.length,
        _isExisting: false,
      }
    ]);
  };

  const handleChoiceChange = (index, field, value) => {
    setChoices(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value
      };
      return updated;
    });
  };

  const handleRemoveChoice = (index) => {
    setChoices(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate
      if (!formData.name_es.trim() || !formData.name_en.trim()) {
        toast.error('Por favor completa los nombres en ambos idiomas');
        setLoading(false);
        return;
      }

      if (choices.length === 0) {
        toast.error('Debes agregar al menos una opción');
        setLoading(false);
        return;
      }

      // Validate choices
      for (const choice of choices) {
        if (!choice.name_es.trim() || !choice.name_en.trim()) {
          toast.error('Todas las opciones deben tener nombre en ambos idiomas');
          setLoading(false);
          return;
        }
      }

      // Prepare option data
      const optionData = {
        translations: {
          es: { name: formData.name_es.trim() },
          en: { name: formData.name_en.trim() },
        },
        is_required: formData.is_required,
        order: parseInt(formData.order) || 0,
      };

      let optionId;

      // Create or update option
      if (option) {
        // Update existing option
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/product-options/${option.id}/`,
          {
            method: 'PUT',
            headers: getAuthHeaders({
              'Content-Type': 'application/json',
            }),
            body: JSON.stringify(optionData),
          }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(JSON.stringify(error));
        }

        optionId = option.id;
      } else {
        // Create new option
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/product-options/`,
          {
            method: 'POST',
            headers: getAuthHeaders({
              'Content-Type': 'application/json',
            }),
            body: JSON.stringify(optionData),
          }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(JSON.stringify(error));
        }

        const createdOption = await response.json();
        optionId = createdOption.id;
      }

      // Now handle choices
      // Get existing choice IDs if editing
      const existingChoiceIds = option?.choices?.map(c => c.id) || [];
      const currentChoiceIds = choices.filter(c => c._isExisting).map(c => c.id);

      // Delete removed choices
      const deletedChoiceIds = existingChoiceIds.filter(id => !currentChoiceIds.includes(id));
      for (const choiceId of deletedChoiceIds) {
        await fetch(
          `${import.meta.env.VITE_API_URL}/api/product-option-choices/${choiceId}/`,
          {
            method: 'DELETE',
            headers: getAuthHeaders(),
          }
        );
      }

      // Create or update choices
      for (const choice of choices) {
        const choiceData = {
          option: optionId,
          translations: {
            es: { name: choice.name_es.trim() },
            en: { name: choice.name_en.trim() },
          },
          icon: choice.icon.trim() || '',
          price_adjustment: parseFloat(choice.price_adjustment) || 0,
          order: parseInt(choice.order) || 0,
        };

        if (choice._isExisting && typeof choice.id === 'number') {
          // Update existing choice
          const response = await fetch(
            `${import.meta.env.VITE_API_URL}/api/product-option-choices/${choice.id}/`,
            {
              method: 'PUT',
              headers: getAuthHeaders({
                'Content-Type': 'application/json',
              }),
              body: JSON.stringify(choiceData),
            }
          );

          if (!response.ok) {
            const error = await response.json();
            console.error('Error updating choice:', error);
            throw new Error(`Error al actualizar opción: ${JSON.stringify(error)}`);
          }
        } else {
          // Create new choice
          const response = await fetch(
            `${import.meta.env.VITE_API_URL}/api/product-option-choices/`,
            {
              method: 'POST',
              headers: getAuthHeaders({
                'Content-Type': 'application/json',
              }),
              body: JSON.stringify(choiceData),
            }
          );

          if (!response.ok) {
            const error = await response.json();
            console.error('Error creating choice:', error);
            throw new Error(`Error al crear opción: ${JSON.stringify(error)}`);
          }
        }
      }

      toast.success(
        option
          ? 'Opción actualizada exitosamente'
          : 'Opción creada exitosamente'
      );
      onSuccess();
    } catch (error) {
      console.error('Error saving option:', error);
      toast.error('Error al guardar la opción');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="w-full max-w-4xl overflow-hidden bg-white rounded-lg shadow-xl dark:bg-dark-card max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-border">
          <h2 className="text-2xl font-bold font-gabarito text-pepper-charcoal dark:text-text-primary">
            {option ? 'Editar Opción' : 'Nueva Opción'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover dark:text-text-secondary"
          >
            <FontAwesomeIcon icon={faTimes} className="text-xl" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 p-6 space-y-6 overflow-y-auto">
            {/* Option Basic Info */}
            <div className="p-4 border border-gray-200 rounded-lg dark:border-gray-700">
              <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-text-primary">
                Información de la Opción
              </h3>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-text-secondary">
                    Nombre (Español) *
                  </label>
                  <input
                    type="text"
                    name="name_es"
                    value={formData.name_es}
                    onChange={handleChange}
                    placeholder="ej: Tipo de Carne"
                    required
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg dark:border-dark-border bg-white dark:bg-dark-bg text-gray-900 dark:text-text-primary focus:outline-none focus:ring-2 focus:ring-pepper-orange"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-text-secondary">
                    Nombre (Inglés) *
                  </label>
                  <input
                    type="text"
                    name="name_en"
                    value={formData.name_en}
                    onChange={handleChange}
                    placeholder="eg: Meat Type"
                    required
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg dark:border-dark-border bg-white dark:bg-dark-bg text-gray-900 dark:text-text-primary focus:outline-none focus:ring-2 focus:ring-pepper-orange"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-text-secondary">
                    Orden
                  </label>
                  <input
                    type="number"
                    name="order"
                    value={formData.order}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg dark:border-dark-border bg-white dark:bg-dark-bg text-gray-900 dark:text-text-primary focus:outline-none focus:ring-2 focus:ring-pepper-orange"
                  />
                </div>

                <div className="flex items-center">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="is_required"
                      checked={formData.is_required}
                      onChange={handleChange}
                      className="w-5 h-5 border-gray-300 rounded text-pepper-orange focus:ring-pepper-orange"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700 dark:text-text-secondary">
                      Opción requerida
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Choices Section */}
            <div className="p-4 border border-gray-200 rounded-lg dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-text-primary">
                  Opciones
                </h3>
                <button
                  type="button"
                  onClick={handleAddChoice}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-white transition-colors rounded-lg bg-pepper-orange hover:bg-orange-600"
                >
                  <FontAwesomeIcon icon={faPlus} />
                  Agregar Opción
                </button>
              </div>

              {choices.length === 0 ? (
                <p className="py-4 text-center text-gray-500 dark:text-text-secondary">
                  No hay opciones. Agrega al menos una.
                </p>
              ) : (
                <div className="space-y-3">
                  {choices.map((choice, index) => (
                    <div
                      key={choice.id}
                      className="p-4 border border-gray-200 rounded-lg dark:border-gray-700 bg-gray-50 dark:bg-dark-bg"
                    >
                      {/* Primera fila: Nombres */}
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <div>
                          <label className="block mb-1 text-xs font-medium text-gray-700 dark:text-text-secondary">
                            Nombre (ES) *
                          </label>
                          <input
                            type="text"
                            value={choice.name_es}
                            onChange={(e) => handleChoiceChange(index, 'name_es', e.target.value)}
                            placeholder="ej: Pollo"
                            required
                            className="w-full px-2 py-1 text-sm border border-gray-200 rounded dark:border-gray-600 bg-white dark:bg-dark-card text-gray-900 dark:text-text-primary focus:outline-none focus:ring-1 focus:ring-pepper-orange"
                          />
                        </div>

                        <div>
                          <label className="block mb-1 text-xs font-medium text-gray-700 dark:text-text-secondary">
                            Nombre (EN) *
                          </label>
                          <input
                            type="text"
                            value={choice.name_en}
                            onChange={(e) => handleChoiceChange(index, 'name_en', e.target.value)}
                            placeholder="eg: Chicken"
                            required
                            className="w-full px-2 py-1 text-sm border border-gray-200 rounded dark:border-gray-600 bg-white dark:bg-dark-card text-gray-900 dark:text-text-primary focus:outline-none focus:ring-1 focus:ring-pepper-orange"
                          />
                        </div>
                      </div>

                      {/* Segunda fila: Icono, Precio, Eliminar */}
                      <div className="grid grid-cols-1 gap-3 mt-3 md:grid-cols-4">
                        <div>
                          <label className="block mb-1 text-xs font-medium text-gray-700 dark:text-text-secondary">
                            Icono
                          </label>
                          <input
                            type="text"
                            value={choice.icon}
                            onChange={(e) => handleChoiceChange(index, 'icon', e.target.value)}
                            placeholder=""
                            maxLength="10"
                            className="w-full px-2 py-1 text-sm border border-gray-200 rounded dark:border-gray-600 bg-white dark:bg-dark-card text-gray-900 dark:text-text-primary focus:outline-none focus:ring-1 focus:ring-pepper-orange"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block mb-1 text-xs font-medium text-gray-700 dark:text-text-secondary">
                            Ajuste de Precio (€)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={choice.price_adjustment}
                            onChange={(e) => handleChoiceChange(index, 'price_adjustment', e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-200 rounded dark:border-gray-600 bg-white dark:bg-dark-card text-gray-900 dark:text-text-primary focus:outline-none focus:ring-1 focus:ring-pepper-orange"
                          />
                        </div>

                        <div className="flex items-end">
                          <button
                            type="button"
                            onClick={() => handleRemoveChoice(index)}
                            className="w-full px-3 py-1 text-sm text-red-600 transition-colors rounded hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                            title="Eliminar opción"
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-dark-border">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2 text-gray-700 transition-colors bg-gray-200 rounded-lg dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 text-white transition-colors rounded-lg bg-pepper-orange hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white rounded-full animate-spin border-t-transparent"></div>
                  Guardando...
                </span>
              ) : option ? (
                'Actualizar'
              ) : (
                'Crear'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

ProductOptionModal.propTypes = {
  option: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
};

export default ProductOptionModal;
