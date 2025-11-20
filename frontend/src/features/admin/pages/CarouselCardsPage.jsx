import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faToggleOn, faToggleOff } from '@fortawesome/free-solid-svg-icons';
import useFetch from '@shared/hooks/useFetch';
import toast from 'react-hot-toast';
import CarouselCardModal from '@features/admin/components/CarouselCardModal';
import { getAuthHeaders } from '@shared/utils/auth';

const CarouselCardsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);

  const {
    data: cards = [],
    loading,
    error,
    refetch,
  } = useFetch('/carousel-cards/');

  const handleOpenModal = (card = null) => {
    setSelectedCard(card);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedCard(null);
    setIsModalOpen(false);
  };

  const handleToggleActive = async (card) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/carousel-cards/${card.id}/`,
        {
          method: 'PATCH',
          headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({ is_active: !card.is_active }),
        }
      );

      if (response.ok) {
        toast.success(`Card ${!card.is_active ? 'activada' : 'desactivada'}`);
        refetch();
      } else {
        toast.error('Error al actualizar la card');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al conectar con el servidor');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta card?')) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/carousel-cards/${id}/`,
        {
          method: 'DELETE',
          headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        }
      );

      if (response.ok) {
        toast.success('Card eliminada exitosamente');
        refetch();
      } else {
        toast.error('Error al eliminar la card');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al conectar con el servidor');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600 dark:text-text-secondary">Cargando cards del carrusel...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-600 dark:text-red-400">Error al cargar las cards</div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col justify-between mb-6 space-y-4 md:flex-row md:items-center md:space-y-0">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
            Cards del Carrusel
          </h1>
          <p className="text-sm text-gray-600 dark:text-text-secondary">
            Gestiona las cards promocionales que se muestran en el carrusel animado
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center btn-pepper-primary"
        >
          <FontAwesomeIcon icon={faPlus} className="mr-2" />
          Nueva Card
        </button>
      </div>

      {/* Cards Grid */}
      {cards.length === 0 ? (
        <div className="py-12 text-center">
          <div className="mb-4 text-6xl">🎠</div>
          <p className="mb-4 text-gray-600 dark:text-text-secondary">
            No hay cards creadas
          </p>
          <button
            onClick={() => handleOpenModal()}
            className="btn-pepper-primary"
          >
            <FontAwesomeIcon icon={faPlus} className="mr-2" />
            Crear primera card
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {cards.map((card) => (
            <div
              key={card.id}
              className="overflow-hidden transition-shadow bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-dark-card dark:border-dark-border hover:shadow-md"
            >
              {/* Card Preview */}
              <div
                className="relative flex flex-col items-center justify-center h-48 p-6 text-center"
                style={{ backgroundColor: card.background_color }}
              >
                {/* Emoji */}
                <div className="mb-4 text-6xl">{card.emoji}</div>
                {/* Text */}
                <p className="text-lg font-bold text-white">{card.text}</p>

                {/* Status Badge */}
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    card.is_active
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {card.is_active ? 'Activa' : 'Inactiva'}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="p-4">
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-dark-border">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleOpenModal(card)}
                      className="px-3 py-1.5 text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                      title="Editar"
                    >
                      <FontAwesomeIcon icon={faEdit} className="text-lg" />
                    </button>
                    <button
                      onClick={() => handleToggleActive(card)}
                      className={`px-3 py-1.5 text-sm rounded transition-colors ${
                        card.is_active
                          ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-900/40'
                          : 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40'
                      }`}
                      title={card.is_active ? 'Desactivar' : 'Activar'}
                    >
                      <FontAwesomeIcon icon={card.is_active ? faToggleOff : faToggleOn} />
                    </button>
                    <button
                      onClick={() => handleDelete(card.id)}
                      className="px-3 py-1.5 text-sm bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                      title="Eliminar"
                    >
                      <FontAwesomeIcon icon={faTrash} className="text-lg" />
                    </button>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Orden: {card.order}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <CarouselCardModal
          card={selectedCard}
          onClose={handleCloseModal}
          onSuccess={() => {
            refetch();
            handleCloseModal();
          }}
        />
      )}
    </div>
  );
};

export default CarouselCardsPage;
