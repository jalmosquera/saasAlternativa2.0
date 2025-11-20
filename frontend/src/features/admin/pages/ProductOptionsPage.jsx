import { useState, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faEdit,
  faTrash,
  faSearch,
  faCog,
  faChevronDown,
  faChevronUp,
} from '@fortawesome/free-solid-svg-icons';
import toast from 'react-hot-toast';
import usePaginatedFetch from '@shared/hooks/usePaginatedFetch';
import { useLanguage } from '@shared/contexts/LanguageContext';
import Pagination from '@shared/components/Pagination';
import ProductOptionModal from '@features/admin/components/ProductOptionModal';
import { getAuthHeaders } from '@shared/utils/auth';

const ProductOptionsPage = () => {
  const { getTranslation } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [appliedSearchTerm, setAppliedSearchTerm] = useState('');
  const [expandedOptions, setExpandedOptions] = useState(new Set());

  // Filters for API
  const apiFilters = useMemo(() => {
    const filters = {};
    if (appliedSearchTerm) {
      filters.search = appliedSearchTerm;
    }
    return filters;
  }, [appliedSearchTerm]);

  // Fetch options with pagination
  const {
    data: optionsData,
    loading,
    error,
    refetch,
    currentPage,
    pageSize,
    totalCount,
    setPage,
  } = usePaginatedFetch('/product-options/', 10, apiFilters);

  const options = optionsData?.results || [];

  const handleOpenModal = (option = null) => {
    setSelectedOption(option);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOption(null);
  };

  const handleSuccess = () => {
    refetch();
    handleCloseModal();
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setAppliedSearchTerm(searchTerm);
    setPage(1);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setAppliedSearchTerm('');
    setPage(1);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta opción? Se eliminarán también todas sus opciones.')) {
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/product-options/${id}/`,
        {
          method: 'DELETE',
          headers: getAuthHeaders(),
        }
      );

      if (response.ok) {
        toast.success('Opción eliminada exitosamente');
        refetch();
      } else {
        toast.error('Error al eliminar la opción');
      }
    } catch (error) {
      console.error('Error deleting option:', error);
      toast.error('Error al conectar con el servidor');
    }
  };

  const toggleExpand = (optionId) => {
    setExpandedOptions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(optionId)) {
        newSet.delete(optionId);
      } else {
        newSet.add(optionId);
      }
      return newSet;
    });
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="p-4 text-red-700 bg-red-100 border border-red-400 rounded dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
          Error al cargar las opciones: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold font-gabarito text-pepper-charcoal dark:text-text-primary">
            <FontAwesomeIcon icon={faCog} className="mr-2 text-pepper-orange" />
            Opciones de Productos
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-text-secondary">
            Gestiona las opciones personalizables de tus productos (Tipo de Carne, Tipo de Salsa, etc.)
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="btn-pepper-primary"
        >
          <FontAwesomeIcon icon={faPlus} className="mr-2" />
          Nueva Opción
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <FontAwesomeIcon
              icon={faSearch}
              className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2"
            />
            <input
              type="text"
              placeholder="Buscar opciones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-2 pl-10 pr-4 border border-gray-200 rounded-lg dark:border-dark-border bg-white dark:bg-dark-bg text-gray-900 dark:text-text-primary focus:outline-none focus:ring-2 focus:ring-pepper-orange"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2 text-white transition-colors rounded-lg bg-pepper-orange hover:bg-orange-600"
          >
            Buscar
          </button>
          {appliedSearchTerm && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="px-6 py-2 text-gray-700 transition-colors bg-gray-200 rounded-lg dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Limpiar
            </button>
          )}
        </form>
      </div>

      {/* Options Table */}
      <div className="overflow-hidden border border-gray-200 rounded-lg dark:border-dark-border bg-white dark:bg-dark-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200 bg-gray-50 dark:bg-dark-bg dark:border-dark-border">
              <tr>
                <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase dark:text-text-secondary">
                  #
                </th>
                <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase dark:text-text-secondary">
                  Nombre
                </th>
                <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase dark:text-text-secondary">
                  Requerido
                </th>
                <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase dark:text-text-secondary">
                  Opciones
                </th>
                <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase dark:text-text-secondary">
                  Orden
                </th>
                <th className="px-4 py-3 text-xs font-semibold tracking-wider text-right text-gray-700 uppercase dark:text-text-secondary">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-dark-border">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center">
                    <div className="inline-block w-8 h-8 border-4 border-gray-200 rounded-full animate-spin border-t-pepper-orange"></div>
                    <p className="mt-2 text-gray-600 dark:text-text-secondary">Cargando opciones...</p>
                  </td>
                </tr>
              ) : options.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-gray-600 dark:text-text-secondary">
                    {appliedSearchTerm
                      ? 'No se encontraron opciones con esos criterios'
                      : 'No hay opciones registradas. Crea una nueva opción para empezar.'}
                  </td>
                </tr>
              ) : (
                options.map((option, index) => {
                  const isExpanded = expandedOptions.has(option.id);
                  const choicesCount = option.choices?.length || 0;

                  return (
                    <>
                      <tr key={option.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-dark-hover">
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-text-primary">
                          {(currentPage - 1) * pageSize + index + 1}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-900 dark:text-text-primary">
                              {getTranslation(option.translations, 'name')}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              option.is_required
                                ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                            }`}
                          >
                            {option.is_required ? 'Sí' : 'No'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => toggleExpand(option.id)}
                            className="flex items-center gap-2 text-sm text-pepper-orange hover:text-orange-600"
                          >
                            <span className="font-medium">{choicesCount} {choicesCount !== 1 ? 'opciones' : 'opción'}</span>
                            <FontAwesomeIcon icon={isExpanded ? faChevronUp : faChevronDown} className="text-xs" />
                          </button>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-text-primary">
                          {option.order}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-3">
                            <button
                              onClick={() => handleOpenModal(option)}
                              className="p-3 text-blue-600 transition-colors rounded hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                              title="Editar"
                            >
                              <FontAwesomeIcon icon={faEdit} className="text-lg" />
                            </button>
                            <button
                              onClick={() => handleDelete(option.id)}
                              className="p-3 text-red-600 transition-colors rounded hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                              title="Eliminar"
                            >
                              <FontAwesomeIcon icon={faTrash} className="text-lg" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {/* Expanded Choices Row */}
                      {isExpanded && option.choices && option.choices.length > 0 && (
                        <tr key={`${option.id}-expanded`} className="bg-gray-50 dark:bg-dark-bg">
                          <td colSpan="6" className="px-4 py-4">
                            <div className="ml-8">
                              <h4 className="mb-2 text-sm font-semibold text-gray-700 dark:text-text-secondary">
                                Opciones disponibles:
                              </h4>
                              <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
                                {option.choices.map(choice => (
                                  <div
                                    key={choice.id}
                                    className="flex items-center gap-2 p-2 border border-gray-200 rounded dark:border-gray-700"
                                  >
                                    {choice.icon && <span className="text-xl">{choice.icon}</span>}
                                    <div className="flex-1">
                                      <div className="text-sm font-medium text-gray-900 dark:text-text-primary">
                                        {getTranslation(choice.translations, 'name')}
                                      </div>
                                      {parseFloat(choice.price_adjustment) > 0 && (
                                        <div className="text-xs text-gray-600 dark:text-text-secondary">
                                          +€{parseFloat(choice.price_adjustment).toFixed(2)}
                                        </div>
                                      )}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-text-secondary">
                                      Orden: {choice.order}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalCount > pageSize && (
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            pageSize={pageSize}
            totalCount={totalCount}
            onPageChange={setPage}
          />
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <ProductOptionModal
          option={selectedOption}
          onClose={handleCloseModal}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
};

export default ProductOptionsPage;
