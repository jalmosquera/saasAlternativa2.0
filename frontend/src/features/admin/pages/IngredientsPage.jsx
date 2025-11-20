import { useState, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faSearch, faCheck, faX, faPenToSquare } from '@fortawesome/free-solid-svg-icons';
import usePaginatedFetch from '@shared/hooks/usePaginatedFetch';
import toast from 'react-hot-toast';
import IngredientModal from '@features/admin/components/IngredientModal';
import { getAuthHeaders } from '@shared/utils/auth';
import Pagination from '@shared/components/Pagination';

const IngredientsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [appliedSearchTerm, setAppliedSearchTerm] = useState('');
  const [selectedBeExtra, setSelectedBeExtra] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState(null);

  // Edición inline
  const [editingId, setEditingId] = useState(null);
  const [editedIcon, setEditedIcon] = useState('');
  const [editedNameEs, setEditedNameEs] = useState('');
  const [editedNameEn, setEditedNameEn] = useState('');
  const [editedBeExtra, setEditedBeExtra] = useState(false);
  const [editedPrice, setEditedPrice] = useState('0.00');

  // Edición en lote
  const [bulkEditMode, setBulkEditMode] = useState(false);
  const [bulkData, setBulkData] = useState({});
  const [savingAll, setSavingAll] = useState(false);

  // Construir filtros para la API
  const apiFilters = useMemo(() => {
    const filters = {};
    if (appliedSearchTerm) filters.search = appliedSearchTerm;
    if (selectedBeExtra && selectedBeExtra !== 'all') {
      filters.be_extra = selectedBeExtra === 'true';
    }
    return filters;
  }, [appliedSearchTerm, selectedBeExtra]);

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
    data: ingredientsData,
    loading,
    error,
    refetch,
    currentPage,
    pageSize,
    totalCount,
    setPage,
  } = usePaginatedFetch('/ingredients/', 10, apiFilters);
  const ingredients = ingredientsData?.results || ingredientsData || [];

  const handleOpenModal = (ingredient = null) => {
    setSelectedIngredient(ingredient);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedIngredient(null);
    setIsModalOpen(false);
  };

  const handleStartEdit = (ingredient) => {
    setEditingId(ingredient.id);
    setEditedIcon(ingredient.icon || '');
    setEditedNameEs(ingredient.translations?.es?.name || '');
    setEditedNameEn(ingredient.translations?.en?.name || '');
    setEditedBeExtra(ingredient.be_extra || false);
    setEditedPrice(ingredient.price || '0.00');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditedIcon('');
    setEditedNameEs('');
    setEditedNameEn('');
    setEditedBeExtra(false);
    setEditedPrice('0.00');
  };

  const handleSaveEdit = async (ingredientId) => {
    try {
      const data = bulkEditMode ? bulkData[ingredientId] : {
        icon: editedIcon,
        name_es: editedNameEs,
        name_en: editedNameEn,
        be_extra: editedBeExtra,
        price: editedPrice,
      };

      const dataToSend = {
        icon: bulkEditMode ? data.icon : editedIcon,
        translations: {
          es: { name: bulkEditMode ? data.name_es : editedNameEs },
          en: { name: bulkEditMode ? data.name_en : editedNameEn },
        },
        be_extra: bulkEditMode ? data.be_extra : editedBeExtra,
        price: parseFloat(bulkEditMode ? data.price : editedPrice) || 0,
      };

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/ingredients/${ingredientId}/`,
        {
          method: 'PUT',
          headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify(dataToSend),
        }
      );

      if (response.ok) {
        toast.success('Ingrediente actualizado exitosamente');
        if (!bulkEditMode) {
          setEditingId(null);
        }
        refetch();
      } else {
        const err = await response.json();
        console.error('Error al guardar:', err);
        toast.error('Error al actualizar el ingrediente');
      }
    } catch (err) {
      console.error('Error al conectar con el servidor:', err);
      toast.error('Error al conectar con el servidor');
    }
  };

  const handleBulkEdit = () => {
    if (!bulkEditMode) {
      const initialBulkData = {};
      filteredIngredients.forEach(ingredient => {
        initialBulkData[ingredient.id] = {
          icon: ingredient.icon || '',
          name_es: ingredient.translations?.es?.name || '',
          name_en: ingredient.translations?.en?.name || '',
          be_extra: ingredient.be_extra || false,
          price: ingredient.price || '0.00',
        };
      });
      setBulkData(initialBulkData);
    } else {
      setBulkData({});
    }
    setBulkEditMode(!bulkEditMode);
    setEditingId(null);
  };

  const handleBulkFieldChange = (ingredientId, field, value) => {
    setBulkData(prev => ({
      ...prev,
      [ingredientId]: {
        ...prev[ingredientId],
        [field]: value
      }
    }));
  };

  const handleSaveAllBulkChanges = async () => {
    setSavingAll(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      for (const ingredientId in bulkData) {
        const data = bulkData[ingredientId];

        const dataToSend = {
          icon: data.icon,
          translations: {
            es: { name: data.name_es },
            en: { name: data.name_en },
          },
          be_extra: data.be_extra,
          price: parseFloat(data.price) || 0,
        };

        try {
          const response = await fetch(
            `${import.meta.env.VITE_API_URL}/api/ingredients/${ingredientId}/`,
            {
              method: 'PUT',
              headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
              body: JSON.stringify(dataToSend),
            }
          );

          if (response.ok) {
            successCount++;
          } else {
            errorCount++;
          }
        } catch (error) {
          errorCount++;
          console.error(`Error guardando ingrediente ${ingredientId}:`, error);
        }
      }

      if (errorCount === 0) {
        toast.success(`✅ Se guardaron ${successCount} ingrediente(s) exitosamente`);
        setBulkEditMode(false);
        setBulkData({});
        refetch();
      } else if (successCount > 0) {
        toast.success(`✅ ${successCount} guardados. ⚠️ ${errorCount} con error`);
        refetch();
      } else {
        toast.error(`❌ Error al guardar ${errorCount} ingrediente(s)`);
      }
    } catch (error) {
      console.error('Error guardando en lote:', error);
      toast.error('Error al guardar los cambios');
    } finally {
      setSavingAll(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este ingrediente?')) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/ingredients/${id}/`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        toast.success('Ingrediente eliminado exitosamente');
        refetch();
      } else {
        toast.error('Error al eliminar el ingrediente');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al eliminar el ingrediente');
    }
  };

  // Los ingredientes ya vienen filtrados del servidor
  const filteredIngredients = ingredients;

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600 dark:text-text-secondary">Cargando ingredientes...</div>
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-600 dark:text-red-400">Error al cargar ingredientes</div>
      </div>
    );

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col gap-4 mb-8 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-text-primary">
            Ingredientes
          </h1>
          <p className="text-gray-600 dark:text-text-secondary">
            Gestiona los ingredientes de tus productos
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center space-x-2 btn-pepper-primary"
        >
          <FontAwesomeIcon icon={faPlus} />
          <span>Nuevo Ingrediente</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center">
        <div className="relative flex flex-1 gap-2 max-w-md">
          <div className="relative flex-1">
            <FontAwesomeIcon
              icon={faSearch}
              className="absolute text-gray-400 -translate-y-1/2 left-3 top-1/2"
            />
            <input
              type="text"
              placeholder="Buscar ingredientes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleSearchKeyPress}
              className="w-full py-2 pl-10 pr-4 text-gray-900 bg-white border border-gray-200 rounded-lg dark:border-dark-border dark:bg-dark-card dark:text-text-primary focus:outline-none focus:ring-2 focus:ring-pepper-orange"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-4 py-2 text-white transition-colors rounded-lg bg-pepper-orange hover:bg-pepper-orange/90 whitespace-nowrap"
          >
            Buscar
          </button>
        </div>

        <select
          value={selectedBeExtra}
          onChange={(e) => setSelectedBeExtra(e.target.value)}
          className="px-4 py-2 text-gray-900 bg-white border border-gray-200 rounded-lg dark:border-dark-border dark:bg-dark-card dark:text-text-primary focus:outline-none focus:ring-2 focus:ring-pepper-orange"
        >
          <option value="all">Todos los ingredientes</option>
          <option value="true">Puede ser extra</option>
          <option value="false">No puede ser extra</option>
        </select>

        <button
          onClick={handleBulkEdit}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
            bulkEditMode
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
          title="Editar todos los ingredientes"
        >
          <FontAwesomeIcon icon={faPenToSquare} />
          <span className="hidden sm:inline">
            {bulkEditMode ? 'Desactivar edición' : 'Editar en lote'}
          </span>
        </button>
      </div>

      {/* Bulk Edit Banner */}
      {bulkEditMode && (
        <div className="p-4 mb-6 text-blue-700 bg-blue-100 border border-blue-300 rounded-lg dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm">
              <strong>Modo de edición masiva activado:</strong> Editando {filteredIngredients.length} ingrediente(s). Haz clic en ✓ para guardar cada cambio.
            </p>
            <button
              onClick={handleSaveAllBulkChanges}
              disabled={savingAll}
              className="flex items-center gap-2 px-4 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {savingAll ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Guardando...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faCheck} />
                  Guardar todos
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Ingredients Table */}
      <div className="overflow-hidden bg-white border border-gray-200 rounded-lg dark:bg-dark-card dark:border-dark-border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-dark-bg">
              <tr>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-600 uppercase dark:text-text-secondary">
                  Icon
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-600 uppercase dark:text-text-secondary">
                  ID
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-center text-gray-600 uppercase dark:text-text-secondary">
                  Puede ser Extra
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-600 uppercase dark:text-text-secondary">
                  Nombre (ES)
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-600 uppercase dark:text-text-secondary">
                  Nombre (EN)
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-600 uppercase dark:text-text-secondary">
                  Precio Extra
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-600 uppercase dark:text-text-secondary">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-dark-border">
              {filteredIngredients.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-12 text-center text-gray-600 dark:text-text-secondary"
                  >
                    No se encontraron ingredientes
                  </td>
                </tr>
              ) : (
                filteredIngredients.map((ingredient) => {
                  const isEditing = bulkEditMode || editingId === ingredient.id;
                  const data = bulkEditMode ? bulkData[ingredient.id] : null;
                  const nameEs = ingredient.translations?.es?.name || '';
                  const nameEn = ingredient.translations?.en?.name || '';

                  return (
                    <tr
                      key={ingredient.id}
                      className={`transition-colors ${
                        isEditing
                          ? 'bg-blue-50 dark:bg-blue-900/10'
                          : 'hover:bg-gray-50 dark:hover:bg-dark-bg'
                      }`}
                    >
                      {/* Icon Column */}
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        {isEditing ? (
                          <input
                            type="text"
                            maxLength="2"
                            value={bulkEditMode ? data?.icon : editedIcon}
                            onChange={(e) => {
                              if (bulkEditMode) {
                                handleBulkFieldChange(ingredient.id, 'icon', e.target.value);
                              } else {
                                setEditedIcon(e.target.value);
                              }
                            }}
                            className="w-12 h-10 text-2xl text-center bg-white border border-gray-300 rounded dark:border-gray-600 dark:bg-dark-bg dark:text-text-primary focus:ring-2 focus:ring-pepper-orange focus:outline-none"
                            placeholder="🍅"
                          />
                        ) : (
                          <span
                            onClick={() => handleOpenModal(ingredient)}
                            className="text-2xl cursor-pointer hover:scale-110 transition-transform"
                            title="Click para editar ingrediente"
                          >
                            {ingredient.icon || '📦'}
                          </span>
                        )}
                      </td>

                      {/* ID Column */}
                      <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap dark:text-text-secondary">
                        #{ingredient.id}
                      </td>

                      {/* Puede ser Extra Column */}
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        {isEditing ? (
                          <select
                            value={bulkEditMode ? (data?.be_extra ? 'true' : 'false') : (editedBeExtra ? 'true' : 'false')}
                            onChange={(e) => {
                              const value = e.target.value === 'true';
                              if (bulkEditMode) {
                                handleBulkFieldChange(ingredient.id, 'be_extra', value);
                              } else {
                                setEditedBeExtra(value);
                              }
                            }}
                            className="w-full px-2 py-1 text-sm text-gray-900 bg-white border border-gray-300 rounded dark:border-gray-600 dark:bg-dark-bg dark:text-text-primary focus:ring-2 focus:ring-pepper-orange focus:outline-none"
                          >
                            <option value="false">No</option>
                            <option value="true">Sí</option>
                          </select>
                        ) : (
                          <span className="text-lg">
                            {ingredient.be_extra ? (
                              <FontAwesomeIcon icon={faCheck} className="text-green-600 dark:text-green-400" />
                            ) : (
                              <FontAwesomeIcon icon={faX} className="text-gray-400 dark:text-gray-600" />
                            )}
                          </span>
                        )}
                      </td>

                      {/* Nombre ES Column */}
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap dark:text-text-primary">
                        {isEditing ? (
                          <input
                            type="text"
                            value={bulkEditMode ? data?.name_es : editedNameEs}
                            onChange={(e) => {
                              if (bulkEditMode) {
                                handleBulkFieldChange(ingredient.id, 'name_es', e.target.value);
                              } else {
                                setEditedNameEs(e.target.value);
                              }
                            }}
                            className="w-full px-2 py-1 text-sm text-gray-900 bg-white border border-gray-300 rounded dark:border-gray-600 dark:bg-dark-bg dark:text-text-primary focus:ring-2 focus:ring-pepper-orange focus:outline-none"
                          />
                        ) : (
                          nameEs || '-'
                        )}
                      </td>

                      {/* Nombre EN Column */}
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap dark:text-text-primary">
                        {isEditing ? (
                          <input
                            type="text"
                            value={bulkEditMode ? data?.name_en : editedNameEn}
                            onChange={(e) => {
                              if (bulkEditMode) {
                                handleBulkFieldChange(ingredient.id, 'name_en', e.target.value);
                              } else {
                                setEditedNameEn(e.target.value);
                              }
                            }}
                            className="w-full px-2 py-1 text-sm text-gray-900 bg-white border border-gray-300 rounded dark:border-gray-600 dark:bg-dark-bg dark:text-text-primary focus:ring-2 focus:ring-pepper-orange focus:outline-none"
                          />
                        ) : (
                          nameEn || '-'
                        )}
                      </td>

                      {/* Precio Extra Column */}
                      <td className="px-6 py-4 text-sm whitespace-nowrap">
                        {isEditing ? (
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={bulkEditMode ? data?.price : editedPrice}
                            onChange={(e) => {
                              if (bulkEditMode) {
                                handleBulkFieldChange(ingredient.id, 'price', e.target.value);
                              } else {
                                setEditedPrice(e.target.value);
                              }
                            }}
                            className="w-24 px-2 py-1 text-sm text-gray-900 bg-white border border-gray-300 rounded dark:border-gray-600 dark:bg-dark-bg dark:text-text-primary focus:ring-2 focus:ring-pepper-orange focus:outline-none"
                          />
                        ) : (
                          <span className="text-sm font-semibold text-gray-900 dark:text-text-primary">
                            {ingredient.be_extra ? `€${parseFloat(ingredient.price || 0).toFixed(2)}` : '-'}
                          </span>
                        )}
                      </td>

                      {/* Actions Column */}
                      <td className="px-6 py-4 space-x-2 text-sm text-right whitespace-nowrap">
                        {bulkEditMode ? (
                          <button
                            onClick={() => handleSaveEdit(ingredient.id)}
                            className="text-green-600 transition-colors hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                            title="Guardar"
                          >
                            <FontAwesomeIcon icon={faCheck} />
                          </button>
                        ) : (
                          <>
                            {isEditing ? (
                              <>
                                <button
                                  onClick={() => handleSaveEdit(ingredient.id)}
                                  className="text-green-600 transition-colors hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                                  title="Guardar"
                                >
                                  <FontAwesomeIcon icon={faCheck} />
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  className="ml-3 text-gray-600 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                  title="Cancelar"
                                >
                                  <FontAwesomeIcon icon={faX} />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleStartEdit(ingredient)}
                                  className="text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                  title="Editar inline"
                                >
                                  <FontAwesomeIcon icon={faEdit} className="text-lg" />
                                </button>
                                <button
                                  onClick={() => handleOpenModal(ingredient)}
                                  className="ml-3 transition-colors text-pepper-orange hover:text-pepper-orange/80"
                                  title="Editar completo"
                                >
                                  <FontAwesomeIcon icon={faPlus} />
                                </button>
                                <button
                                  onClick={() => handleDelete(ingredient.id)}
                                  className="ml-3 text-red-500 transition-colors hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                  title="Eliminar"
                                >
                                  <FontAwesomeIcon icon={faTrash} className="text-lg" />
                                </button>
                              </>
                            )}
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
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

      {/* Ingredient Modal */}
      <IngredientModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        ingredient={selectedIngredient}
        onSuccess={refetch}
      />
    </div>
  );
};

export default IngredientsPage;
