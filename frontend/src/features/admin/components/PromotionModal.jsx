import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faImage, faTrash } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';
import toast from 'react-hot-toast';
import { getAuthHeaders } from '@shared/utils/auth';

const PromotionModal = ({ promotion, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    is_active: true,
    order: 0,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (promotion) {
      setFormData({
        title: promotion.title || '',
        description: promotion.description || '',
        is_active: promotion.is_active ?? true,
        order: promotion.order ?? 0,
      });
      setImagePreview(promotion.image_url || null);
    } else {
      setFormData({
        title: '',
        description: '',
        is_active: true,
        order: 0,
      });
      setImagePreview(null);
    }
    setImageFile(null);
  }, [promotion]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Por favor selecciona una imagen válida');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('La imagen no debe superar los 5MB');
        return;
      }

      setImageFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(promotion?.image_url || null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      toast.error('El título es requerido');
      return;
    }

    if (!promotion && !imageFile) {
      toast.error('La imagen es requerida para crear una promoción');
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('is_active', formData.is_active);
      formDataToSend.append('order', formData.order);

      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }

      const url = promotion
        ? `${import.meta.env.VITE_API_URL}/api/promotions/${promotion.id}/`
        : `${import.meta.env.VITE_API_URL}/api/promotions/`;

      const headers = getAuthHeaders();
      // Don't set Content-Type for FormData - browser will set it with boundary

      const response = await fetch(url, {
        method: promotion ? 'PUT' : 'POST',
        headers,
        body: formDataToSend,
      });

      if (response.ok) {
        toast.success(
          promotion
            ? 'Promoción actualizada exitosamente'
            : 'Promoción creada exitosamente'
        );
        onSuccess();
      } else {
        const error = await response.json();
        let errorMessage = 'Error al guardar la promoción';
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
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

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
              {promotion ? 'Editar Promoción' : 'Nueva Promoción'}
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
              {/* Title */}
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Título (Referencia interna) *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="Ej: Promoción Verano 2024"
                  className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-200 rounded-lg dark:border-dark-border dark:bg-dark-bg dark:text-text-primary focus:outline-none focus:ring-2 focus:ring-pepper-orange"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Descripción (se muestra al pie de la imagen)
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Texto que aparecerá en el modal..."
                  className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-200 rounded-lg resize-none dark:border-dark-border dark:bg-dark-bg dark:text-text-primary focus:outline-none focus:ring-2 focus:ring-pepper-orange"
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Imagen {!promotion && '*'}
                </label>

                {/* Image Preview */}
                {imagePreview && (
                  <div className="relative mb-3">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="object-cover w-full h-48 border border-gray-200 rounded-lg dark:border-dark-border"
                    />
                    {imageFile && (
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute top-2 right-2 p-2 text-white transition-colors bg-red-500 rounded-full hover:bg-red-600"
                        title="Eliminar imagen"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    )}
                  </div>
                )}

                {/* File Input */}
                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="image-upload"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <FontAwesomeIcon
                        icon={faImage}
                        className="mb-3 text-4xl text-gray-400"
                      />
                      <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-semibold">Click para subir</span> o arrastra
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        PNG, JPG o JPEG (MAX. 5MB)
                      </p>
                    </div>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Order */}
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Orden de visualización
                </label>
                <input
                  type="number"
                  name="order"
                  value={formData.order}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-200 rounded-lg dark:border-dark-border dark:bg-dark-bg dark:text-text-primary focus:outline-none focus:ring-2 focus:ring-pepper-orange"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Las promociones con menor número se muestran primero
                </p>
              </div>

              {/* Is Active */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="w-4 h-4 text-pepper-orange bg-gray-100 border-gray-300 rounded focus:ring-pepper-orange dark:focus:ring-pepper-orange dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <label
                  htmlFor="is_active"
                  className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Promoción activa
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
                {loading ? 'Guardando...' : (promotion ? 'Actualizar' : 'Crear')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

PromotionModal.propTypes = {
  promotion: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
};

export default PromotionModal;
