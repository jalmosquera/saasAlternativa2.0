import { useState, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faSearch } from '@fortawesome/free-solid-svg-icons';
import usePaginatedFetch from '@shared/hooks/usePaginatedFetch';
import { useLanguage } from '@shared/contexts/LanguageContext';
import toast from 'react-hot-toast';
import CategoryModal from '@features/admin/components/CategoryModal';
import { getAuthHeaders } from '@shared/utils/auth';
import Pagination from '@shared/components/Pagination';

const CategoriesPage = () => {
  const { getTranslation } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [appliedSearchTerm, setAppliedSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Construir filtros para la API
  const apiFilters = useMemo(() => {
    const filters = {};
    if (appliedSearchTerm) filters.search = appliedSearchTerm;
    return filters;
  }, [appliedSearchTerm]);

  // Función para aplicar la búsqueda
  const handleSearch = () => {
    setAppliedSearchTerm(searchTerm);
  };

  // Permitir búsqueda con Enter
  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const {
    data: categoriesData,
    loading,
    error,
    refetch,
    currentPage,
    pageSize,
    totalCount,
    setPage,
  } = usePaginatedFetch('/categories/', 10, apiFilters);

  const categories = categoriesData?.results || [];

  const handleOpenModal = (category = null) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedCategory(null);
    setIsModalOpen(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta categoría?')) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/categories/${id}/`,
        {
          method: 'DELETE',
          headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        }
      );

      if (response.ok) {
        toast.success('Categoría eliminada exitosamente');
        refetch();
      } else {
        const errorData = await response.json();
        console.error('Error al eliminar:', errorData);
        toast.error('Error al eliminar la categoría');
      }
    } catch (error) {
      console.error('Error al conectar con el servidor:', error);
      toast.error('Error al conectar con el servidor');
    }
  };

  // Las categorías ya vienen filtradas del servidor
  const filteredCategories = categories;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600 dark:text-text-secondary">Cargando categorías...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-600 dark:text-red-400">Error al cargar categorías</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-text-primary mb-2">
            Categorías
          </h1>
          <p className="text-gray-600 dark:text-text-secondary">
            Gestiona las categorías de productos
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="btn-pepper-primary flex items-center space-x-2"
        >
          <FontAwesomeIcon icon={faPlus} />
          <span>Nueva Categoría</span>
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative flex gap-2 max-w-md">
          <div className="relative flex-1">
            <FontAwesomeIcon
              icon={faSearch}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Buscar categorías..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleSearchKeyPress}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-card text-gray-900 dark:text-text-primary focus:outline-none focus:ring-2 focus:ring-pepper-orange"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-4 py-2 text-white transition-colors rounded-lg bg-pepper-orange hover:bg-pepper-orange/90 whitespace-nowrap"
          >
            Buscar
          </button>
        </div>
      </div>

      {/* Categories Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-dark-border">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-border">
          <thead className="bg-gray-50 dark:bg-dark-card">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-text-primary">
                ID
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-text-primary">
                Nombre
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-text-primary">
                Descripción
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-text-primary">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-dark-card divide-y divide-gray-200 dark:divide-dark-border">
            {filteredCategories.length === 0 ? (
              <tr>
                <td
                  colSpan="4"
                  className="text-center py-6 text-gray-600 dark:text-text-secondary"
                >
                  No se encontraron categorías
                </td>
              </tr>
            ) : (
              filteredCategories.map((category) => {
                const name =
                  getTranslation(category.translations, 'name') || 'Sin nombre';
                const description =
                  getTranslation(category.translations, 'description') || '';

                return (
                  <tr
                    key={category.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-text-primary">
                      {category.id}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-text-primary font-medium">
                      {name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-text-secondary">
                      {description || (
                        <span className="italic text-gray-400">Sin descripción</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button
                        onClick={() => handleOpenModal(category)}
                        className="text-pepper-orange hover:text-pepper-orange/80 transition-colors p-2"
                        title="Editar"
                      >
                        <FontAwesomeIcon icon={faEdit} className="text-lg" />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors p-2"
                        title="Eliminar"
                      >
                        <FontAwesomeIcon icon={faTrash} className="text-lg" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && !error && (
        <Pagination
          count={totalCount}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={setPage}
        />
      )}

      {/* Category Modal */}
      <CategoryModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        category={selectedCategory}
        onSuccess={refetch}
      />
    </div>
  );
};

export default CategoriesPage;
