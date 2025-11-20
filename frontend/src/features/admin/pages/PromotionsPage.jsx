import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faImage, faToggleOn, faToggleOff } from '@fortawesome/free-solid-svg-icons';
import useFetch from '@shared/hooks/useFetch';
import toast from 'react-hot-toast';
import PromotionModal from '@features/admin/components/PromotionModal';
import { getAuthHeaders } from '@shared/utils/auth';

const PromotionsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState(null);

  const {
    data: promotions = [],
    loading,
    error,
    refetch,
  } = useFetch('/promotions/');

  const handleOpenModal = (promotion = null) => {
    setSelectedPromotion(promotion);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedPromotion(null);
    setIsModalOpen(false);
  };

  const handleToggleActive = async (promotion) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/promotions/${promotion.id}/`,
        {
          method: 'PATCH',
          headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({ is_active: !promotion.is_active }),
        }
      );

      if (response.ok) {
        toast.success(`Promoción ${!promotion.is_active ? 'activada' : 'desactivada'}`);
        refetch();
      } else {
        toast.error('Error al actualizar la promoción');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al conectar con el servidor');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta promoción?')) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/promotions/${id}/`,
        {
          method: 'DELETE',
          headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        }
      );

      if (response.ok) {
        toast.success('Promoción eliminada exitosamente');
        refetch();
      } else {
        toast.error('Error al eliminar la promoción');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al conectar con el servidor');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600 dark:text-text-secondary">Cargando promociones...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-600 dark:text-red-400">Error al cargar promociones</div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col justify-between mb-6 space-y-4 md:flex-row md:items-center md:space-y-0">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
            Promociones
          </h1>
          <p className="text-sm text-gray-600 dark:text-text-secondary">
            Gestiona las promociones que se muestran a los clientes
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center btn-pepper-primary"
        >
          <FontAwesomeIcon icon={faPlus} className="mr-2" />
          Nueva Promoción
        </button>
      </div>

      {/* Promotions Grid */}
      {promotions.length === 0 ? (
        <div className="py-12 text-center">
          <FontAwesomeIcon icon={faImage} className="mb-4 text-6xl text-gray-400" />
          <p className="mb-4 text-gray-600 dark:text-text-secondary">
            No hay promociones creadas
          </p>
          <button
            onClick={() => handleOpenModal()}
            className="btn-pepper-primary"
          >
            <FontAwesomeIcon icon={faPlus} className="mr-2" />
            Crear primera promoción
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {promotions.map((promotion) => (
            <div
              key={promotion.id}
              className="overflow-hidden transition-shadow bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-dark-card dark:border-dark-border hover:shadow-md"
            >
              {/* Image */}
              <div className="relative w-full h-48 bg-gray-200 dark:bg-gray-700">
                {promotion.image_url ? (
                  <img
                    src={promotion.image_url}
                    alt={promotion.title}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <FontAwesomeIcon icon={faImage} className="text-4xl text-gray-400" />
                  </div>
                )}
                {/* Status Badge */}
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    promotion.is_active
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {promotion.is_active ? 'Activa' : 'Inactiva'}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                  {promotion.title}
                </h3>
                {promotion.description && (
                  <p className="mb-4 text-sm text-gray-600 dark:text-text-secondary line-clamp-2">
                    {promotion.description}
                  </p>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-dark-border">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleOpenModal(promotion)}
                      className="px-3 py-1.5 text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                      title="Editar"
                    >
                      <FontAwesomeIcon icon={faEdit} className="text-lg" />
                    </button>
                    <button
                      onClick={() => handleToggleActive(promotion)}
                      className={`px-3 py-1.5 text-sm rounded transition-colors ${
                        promotion.is_active
                          ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-900/40'
                          : 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40'
                      }`}
                      title={promotion.is_active ? 'Desactivar' : 'Activar'}
                    >
                      <FontAwesomeIcon icon={promotion.is_active ? faToggleOff : faToggleOn} />
                    </button>
                    <button
                      onClick={() => handleDelete(promotion.id)}
                      className="px-3 py-1.5 text-sm bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                      title="Eliminar"
                    >
                      <FontAwesomeIcon icon={faTrash} className="text-lg" />
                    </button>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Orden: {promotion.order}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <PromotionModal
          promotion={selectedPromotion}
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

export default PromotionsPage;
