import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';
import toast from 'react-hot-toast';
import { getAuthHeaders } from '@shared/utils/auth';

const CarouselCardModal = ({ card, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    text: '',
    emoji: '',
    background_color: '#FF6B35',
    is_active: true,
    order: 0,
  });
  const [loading, setLoading] = useState(false);

  // Predefined color palette
  const colorPalette = [
    '#FF6B35', // Orange (default)
    '#F76511', // Pepper Orange
    '#4ECDC4', // Turquoise
    '#FF6B9D', // Pink
    '#95E1D3', // Mint
    '#FFD93D', // Yellow
    '#6C5CE7', // Purple
    '#A8E6CF', // Light Green
    '#FF8B94', // Coral
    '#45B7D1', // Blue
  ];

  // Common emoji suggestions
  const emojiSuggestions = ['🍔', '🍕', '🌮', '🍟', '🥤', '🍦', '🎉', '⭐', '🔥', '💯', '🎊', '✨'];

  useEffect(() => {
    if (card) {
      setFormData({
        text: card.text || '',
        emoji: card.emoji || '',
        background_color: card.background_color || '#FF6B35',
        is_active: card.is_active ?? true,
        order: card.order ?? 0,
      });
    } else {
      setFormData({
        text: '',
        emoji: '',
        background_color: '#FF6B35',
        is_active: true,
        order: 0,
      });
    }
  }, [card]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleEmojiClick = (emoji) => {
    setFormData(prev => ({ ...prev, emoji }));
  };

  const handleColorClick = (color) => {
    setFormData(prev => ({ ...prev, background_color: color }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.text.trim()) {
      toast.error('El texto es requerido');
      return;
    }

    if (!formData.emoji.trim()) {
      toast.error('El emoji es requerido');
      return;
    }

    setLoading(true);

    try {
      const url = card
        ? `${import.meta.env.VITE_API_URL}/api/carousel-cards/${card.id}/`
        : `${import.meta.env.VITE_API_URL}/api/carousel-cards/`;

      const headers = getAuthHeaders({
        'Content-Type': 'application/json',
      });

      const response = await fetch(url, {
        method: card ? 'PUT' : 'POST',
        headers,
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(
          card
            ? 'Card actualizada exitosamente'
            : 'Card creada exitosamente'
        );
        onSuccess();
      } else {
        const error = await response.json();
        let errorMessage = 'Error al guardar la card';
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
              {card ? 'Editar Card' : 'Nueva Card'}
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
              {/* Preview */}
              <div className="p-4 border-2 border-dashed rounded-lg border-gray-300 dark:border-gray-600">
                <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Vista previa:
                </p>
                <div
                  className="flex flex-col items-center justify-center p-6 text-center rounded-lg"
                  style={{ backgroundColor: formData.background_color }}
                >
                  <div className="mb-3 text-5xl">{formData.emoji || '?'}</div>
                  <p className="text-lg font-bold text-white">
                    {formData.text || 'Tu texto aquí'}
                  </p>
                </div>
              </div>

              {/* Text */}
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Texto *
                </label>
                <input
                  type="text"
                  name="text"
                  value={formData.text}
                  onChange={handleChange}
                  required
                  maxLength={100}
                  placeholder="Ej: Hamburguesas Deliciosas"
                  className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-200 rounded-lg dark:border-dark-border dark:bg-dark-bg dark:text-text-primary focus:outline-none focus:ring-2 focus:ring-pepper-orange"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {formData.text.length}/100 caracteres
                </p>
              </div>

              {/* Emoji */}
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Emoji *
                </label>
                <input
                  type="text"
                  name="emoji"
                  value={formData.emoji}
                  onChange={handleChange}
                  required
                  maxLength={10}
                  placeholder="🍔"
                  className="w-full px-3 py-2 text-2xl text-gray-900 bg-white border border-gray-200 rounded-lg dark:border-dark-border dark:bg-dark-bg dark:text-text-primary focus:outline-none focus:ring-2 focus:ring-pepper-orange"
                />
                <p className="mt-2 mb-2 text-xs text-gray-500 dark:text-gray-400">
                  Sugerencias (click para seleccionar):
                </p>
                <div className="flex flex-wrap gap-2">
                  {emojiSuggestions.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => handleEmojiClick(emoji)}
                      className={`text-2xl p-2 rounded-lg border-2 transition-all ${
                        formData.emoji === emoji
                          ? 'border-pepper-orange bg-orange-50 dark:bg-orange-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:border-pepper-orange'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Background Color */}
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Color de fondo
                </label>
                <div className="flex flex-wrap gap-3 mb-3">
                  {colorPalette.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => handleColorClick(color)}
                      className={`w-12 h-12 rounded-lg border-4 transition-all ${
                        formData.background_color === color
                          ? 'border-gray-900 dark:border-white scale-110'
                          : 'border-gray-300 dark:border-gray-600 hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
                <input
                  type="text"
                  name="background_color"
                  value={formData.background_color}
                  onChange={handleChange}
                  placeholder="#FF6B35"
                  className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-200 rounded-lg dark:border-dark-border dark:bg-dark-bg dark:text-text-primary focus:outline-none focus:ring-2 focus:ring-pepper-orange"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Código hexadecimal (ej: #FF6B35)
                </p>
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
                  Las cards con menor número se muestran primero
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
                  Card activa
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
                {loading ? 'Guardando...' : (card ? 'Actualizar' : 'Crear')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

CarouselCardModal.propTypes = {
  card: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
};

export default CarouselCardModal;
