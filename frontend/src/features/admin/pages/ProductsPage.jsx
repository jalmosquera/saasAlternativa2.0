import { useState, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faSearch, faCheck, faX, faPenToSquare, faCopy } from '@fortawesome/free-solid-svg-icons';

import usePaginatedFetch from '@shared/hooks/usePaginatedFetch';
import { useLanguage } from '@shared/contexts/LanguageContext';
import toast from 'react-hot-toast';
import ProductModal from '@features/admin/components/ProductModal';
import { getAuthHeaders } from '@shared/utils/auth';
import Pagination from '@shared/components/Pagination';

const ProductsPage = () => {
  const { getTranslation } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [appliedSearchTerm, setAppliedSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editedData, setEditedData] = useState({});
  const [bulkEditMode, setBulkEditMode] = useState(false);
  const [bulkData, setBulkData] = useState({});
  const [savingAll, setSavingAll] = useState(false);

  // Construir filtros para la API
  const apiFilters = useMemo(() => {
    const filters = {};
    if (appliedSearchTerm) filters.search = appliedSearchTerm;
    if (selectedCategory && selectedCategory !== 'all') filters.categories = selectedCategory;
    return filters;
  }, [appliedSearchTerm, selectedCategory]);

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
    data: productsData,
    loading,
    error,
    refetch,
    currentPage,
    pageSize,
    totalCount,
    setPage,
  } = usePaginatedFetch('/products/', 15, apiFilters);

  const { data: categoriesData } = usePaginatedFetch('/categories/', 100);

  const products = productsData?.results || [];
  const categories = categoriesData?.results || [];

  const handleOpenModal = (product = null) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
    setIsModalOpen(false);
  };

  const handleStartEdit = (product) => {
    setEditingId(product.id);
    const price = typeof product.price === 'string'
      ? product.price.replace(' €', '')
      : product.price;

    setEditedData({
      name_es: product.translations?.es?.name || '',
      name_en: product.translations?.en?.name || '',
      price: price,
      stock: product.stock,
      available: product.available,
      category: product.categories?.[0]?.id || '',
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditedData({});
  };

  const handleFieldChange = (field, value) => {
    setEditedData(prev => ({ ...prev, [field]: value }));
  };

  const handleBulkEdit = () => {
    if (!bulkEditMode) {
      const initialBulkData = {};
      filteredProducts.forEach(product => {
        const price = typeof product.price === 'string'
          ? product.price.replace(' €', '')
          : product.price;
        
        initialBulkData[product.id] = {
          name_es: product.translations?.es?.name || '',
          name_en: product.translations?.en?.name || '',
          price: price,
          stock: product.stock,
          available: product.available,
          category: product.categories?.[0]?.id || '',
        };
      });
      setBulkData(initialBulkData);
    } else {
      setBulkData({});
    }
    setBulkEditMode(!bulkEditMode);
    setEditingId(null);
    setEditedData({});
  };

  const handleBulkFieldChange = (productId, field, value) => {
    setBulkData(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: value
      }
    }));
  };

  const handleSaveEdit = async (productId) => {
    try {
      const data = bulkEditMode ? bulkData[productId] : editedData;
      
      const dataToSend = {
        translations: {
          es: { name: data.name_es },
          en: { name: data.name_en },
        },
        price: parseFloat(data.price),
        stock: parseInt(data.stock),
        available: data.available,
        categories: [parseInt(data.category)],
      };

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/products/${productId}/`,
        {
          method: 'PATCH',
          headers: getAuthHeaders({
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify(dataToSend),
        }
      );

      if (response.ok) {
        toast.success('Producto actualizado exitosamente');
        if (!bulkEditMode) {
          setEditingId(null);
          setEditedData({});
        }
        refetch();
      } else {
        const error = await response.json();
        toast.error('Error al actualizar el producto');
        console.error('Error:', error);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al conectar con el servidor');
    }
  };

  const handleSaveAllBulkChanges = async () => {
    setSavingAll(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      for (const productId in bulkData) {
        const data = bulkData[productId];
        
        const dataToSend = {
          translations: {
            es: { name: data.name_es },
            en: { name: data.name_en },
          },
          price: parseFloat(data.price),
          stock: parseInt(data.stock),
          available: data.available,
          categories: [parseInt(data.category)],
        };

        try {
          const response = await fetch(
            `${import.meta.env.VITE_API_URL}/api/products/${productId}/`,
            {
              method: 'PATCH',
              headers: getAuthHeaders({
                'Content-Type': 'application/json',
              }),
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
          console.error(`Error guardando producto ${productId}:`, error);
        }
      }

      if (errorCount === 0) {
        toast.success(`✅ Se guardaron ${successCount} producto(s) exitosamente`);
        setBulkEditMode(false);
        setBulkData({});
        refetch();
      } else if (successCount > 0) {
        toast.success(`✅ ${successCount} guardados. ⚠️ ${errorCount} con error`);
        refetch();
      } else {
        toast.error(`❌ Error al guardar ${errorCount} producto(s)`);
      }
    } catch (error) {
      console.error('Error guardando en lote:', error);
      toast.error('Error al guardar los cambios');
    } finally {
      setSavingAll(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este producto?')) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products/${id}/`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        toast.success('Producto eliminado exitosamente');
        refetch();
      } else {
        toast.error('Error al eliminar el producto');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al eliminar el producto');
    }
  };

  const handleDuplicate = async (product) => {
    // Crear un objeto "producto duplicado" temporal para el modal
    // NO creamos el producto todavía, solo abrimos el modal con los datos prellenados
    const duplicatedProduct = {
      // NO incluir ID - esto indica que es un nuevo producto
      translations: {
        es: {
          name: `${product.translations?.es?.name || 'Producto'} (Copia)`,
          description: product.translations?.es?.description || '',
        },
        en: {
          name: `${product.translations?.en?.name || 'Product'} (Copy)`,
          description: product.translations?.en?.description || '',
        },
      },
      price: product.price,
      stock: product.stock,
      available: product.available ?? true,
      allows_extra_ingredients: product.allows_extra_ingredients ?? true,
      categories: product.categories || [],
      ingredients: product.ingredients || [],
      options: product.options || [],
      // NO incluir imagen - el usuario debe subir una nueva
      _isDuplicate: true, // Flag para que el modal sepa que es un duplicado
    };

    // Abrir el modal con los datos prellenados
    // El usuario puede editar antes de guardar
    handleOpenModal(duplicatedProduct);
  };

  // Los productos ya vienen filtrados del servidor
  const filteredProducts = products;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600 dark:text-text-secondary">Cargando productos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-600 dark:text-red-400">Error al cargar productos</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col gap-4 mb-8 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-text-primary">
            Productos
          </h1>
          <p className="text-gray-600 dark:text-text-secondary">
            Gestiona los productos de tu menú
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center space-x-2 btn-pepper-primary"
        >
          <FontAwesomeIcon icon={faPlus} />
          <span>Nuevo Producto</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center">
        <div className="relative flex flex-1 gap-2 max-w-md">
          <div className="relative flex-1">
            <FontAwesomeIcon
              icon={faSearch}
              className="absolute text-gray-400 -translate-y-1/2 left-3 top-1/2"
            />
            <input
              type="text"
              placeholder="Buscar productos..."
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
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 text-gray-900 bg-white border border-gray-200 rounded-lg dark:border-dark-border dark:bg-dark-card dark:text-text-primary focus:outline-none focus:ring-2 focus:ring-pepper-orange"
        >
          <option value="all">Todas las categorías</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>
              {getTranslation(category.translations, 'name') || 'Sin nombre'}
            </option>
          ))}
        </select>

        <button
          onClick={handleBulkEdit}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
            bulkEditMode
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
          title="Editar todos los productos filtrados"
        >
          <FontAwesomeIcon icon={faPenToSquare} />
          <span className="hidden sm:inline">
            {bulkEditMode ? 'Desactivar edición' : 'Editar en lote'}
          </span>
        </button>
      </div>

      {bulkEditMode && (
        <div className="p-4 mb-6 text-blue-700 bg-blue-100 border border-blue-300 rounded-lg dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm">
              <strong>Modo de edición masiva activado:</strong> Editando {filteredProducts.length} producto(s) de{' '}
              {selectedCategory === 'all' ? 'todas las categorías' : 'esta categoría'}. Haz clic en ✓ para guardar cada cambio.
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

      {/* Products Table */}
      <div className="overflow-hidden bg-white border border-gray-200 rounded-lg dark:bg-dark-card dark:border-dark-border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-dark-bg">
              <tr>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-600 uppercase dark:text-text-secondary">
                  Imagen
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-600 uppercase dark:text-text-secondary">
                  Nombre (ES)
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-600 uppercase dark:text-text-secondary">
                  Nombre (EN)
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-600 uppercase dark:text-text-secondary">
                  Precio
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-600 uppercase dark:text-text-secondary">
                  Stock
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-600 uppercase dark:text-text-secondary">
                  Categoría
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-600 uppercase dark:text-text-secondary">
                  Disponible
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-600 uppercase dark:text-text-secondary">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-dark-border">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-gray-600 dark:text-text-secondary">
                    No se encontraron productos
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const isEditing = bulkEditMode || editingId === product.id;
                  const data = bulkEditMode ? bulkData[product.id] : (editingId === product.id ? editedData : null);
                  
                  const nameES = product.translations?.es?.name || 'Sin nombre';
                  const nameEN = product.translations?.en?.name || '';
                  const categoryName = product.categories?.[0]
                    ? getTranslation(product.categories[0].translations, 'name')
                    : 'Sin categoría';
                  const price = typeof product.price === 'string'
                    ? product.price.replace(' €', '')
                    : product.price;

                  return (
                    <tr key={product.id} className={`transition-colors ${
                      isEditing
                        ? 'bg-blue-50 dark:bg-blue-900/10'
                        : product.available
                          ? 'hover:bg-gray-50 dark:hover:bg-dark-bg'
                          : 'bg-gray-100 dark:bg-gray-800 opacity-75'
                    }`}>
                      {/* Imagen */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <img
                          src={product.image || '/placeholder-product.jpg'}
                          alt={nameES}
                          onClick={() => handleOpenModal(product)}
                          className="object-cover w-12 h-12 rounded-lg cursor-pointer hover:opacity-75 transition-opacity"
                          title="Click para editar producto completo"
                        />
                      </td>

                      {/* Nombre ES */}
                      <td className="px-4 py-4">
                        {isEditing ? (
                          <input
                            type="text"
                            value={data?.name_es || nameES}
                            onChange={(e) => {
                              if (bulkEditMode) {
                                handleBulkFieldChange(product.id, 'name_es', e.target.value);
                              } else {
                                handleFieldChange('name_es', e.target.value);
                              }
                            }}
                            className="w-full px-2 py-1 text-sm text-gray-900 bg-white border border-gray-300 rounded dark:border-gray-600 dark:bg-dark-bg dark:text-text-primary focus:ring-2 focus:ring-pepper-orange focus:outline-none"
                          />
                        ) : (
                          <span className="text-sm font-medium text-gray-900 dark:text-text-primary">
                            {nameES}
                          </span>
                        )}
                      </td>

                      {/* Nombre EN */}
                      <td className="px-4 py-4">
                        {isEditing ? (
                          <input
                            type="text"
                            value={data?.name_en || nameEN}
                            onChange={(e) => {
                              if (bulkEditMode) {
                                handleBulkFieldChange(product.id, 'name_en', e.target.value);
                              } else {
                                handleFieldChange('name_en', e.target.value);
                              }
                            }}
                            className="w-full px-2 py-1 text-sm text-gray-900 bg-white border border-gray-300 rounded dark:border-gray-600 dark:bg-dark-bg dark:text-text-primary focus:ring-2 focus:ring-pepper-orange focus:outline-none"
                          />
                        ) : (
                          <span className="text-sm text-gray-600 dark:text-text-secondary">
                            {nameEN || '-'}
                          </span>
                        )}
                      </td>

                      {/* Precio */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        {isEditing ? (
                          <input
                            type="number"
                            step="0.01"
                            value={data?.price || price}
                            onChange={(e) => {
                              if (bulkEditMode) {
                                handleBulkFieldChange(product.id, 'price', e.target.value);
                              } else {
                                handleFieldChange('price', e.target.value);
                              }
                            }}
                            className="w-24 px-2 py-1 text-sm text-gray-900 bg-white border border-gray-300 rounded dark:border-gray-600 dark:bg-dark-bg dark:text-text-primary focus:ring-2 focus:ring-pepper-orange focus:outline-none"
                          />
                        ) : (
                          <span className="text-sm font-semibold text-gray-900 dark:text-text-primary">
                            €{parseFloat(price).toFixed(2)}
                          </span>
                        )}
                      </td>

                      {/* Stock */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        {isEditing ? (
                          <input
                            type="number"
                            value={data?.stock ?? product.stock}
                            onChange={(e) => {
                              if (bulkEditMode) {
                                handleBulkFieldChange(product.id, 'stock', e.target.value);
                              } else {
                                handleFieldChange('stock', e.target.value);
                              }
                            }}
                            className="w-20 px-2 py-1 text-sm text-gray-900 bg-white border border-gray-300 rounded dark:border-gray-600 dark:bg-dark-bg dark:text-text-primary focus:ring-2 focus:ring-pepper-orange focus:outline-none"
                          />
                        ) : (
                          <span className="text-sm text-gray-900 dark:text-text-primary">
                            {product.stock}
                          </span>
                        )}
                      </td>

                      {/* Categoría */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        {isEditing ? (
                          <select
                            value={data?.category || product.categories?.[0]?.id || ''}
                            onChange={(e) => {
                              if (bulkEditMode) {
                                handleBulkFieldChange(product.id, 'category', e.target.value);
                              } else {
                                handleFieldChange('category', e.target.value);
                              }
                            }}
                            className="w-full px-2 py-1 text-sm text-gray-900 bg-white border border-gray-300 rounded dark:border-gray-600 dark:bg-dark-bg dark:text-text-primary focus:ring-2 focus:ring-pepper-orange focus:outline-none"
                          >
                            <option value="">Seleccionar...</option>
                            {categories.map(cat => (
                              <option key={cat.id} value={cat.id}>
                                {getTranslation(cat.translations, 'name') || 'Sin nombre'}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-sm text-gray-600 dark:text-text-secondary">
                            {categoryName}
                          </span>
                        )}
                      </td>

                      {/* Disponible */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        {isEditing ? (
                          <label className="flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={data?.available ?? product.available}
                              onChange={(e) => {
                                if (bulkEditMode) {
                                  handleBulkFieldChange(product.id, 'available', e.target.checked);
                                } else {
                                  handleFieldChange('available', e.target.checked);
                                }
                              }}
                              className="w-4 h-4 border-gray-300 rounded text-pepper-orange focus:ring-pepper-orange"
                            />
                            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                              {(data?.available ?? product.available) ? 'Sí' : 'No'}
                            </span>
                          </label>
                        ) : (
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            product.available
                              ? 'bg-pepper-orange/10 text-pepper-orange'
                              : 'bg-gray-500/10 text-gray-500'
                          }`}>
                            {product.available ? 'Disponible' : 'No disponible'}
                          </span>
                        )}
                      </td>

                      {/* Acciones */}
                      <td className="px-6 py-4 space-x-2 text-sm text-right whitespace-nowrap">
                        {bulkEditMode ? (
                          <button
                            onClick={() => handleSaveEdit(product.id)}
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
                                  onClick={() => handleSaveEdit(product.id)}
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
                                  onClick={() => handleStartEdit(product)}
                                  className="p-2 text-blue-600 transition-colors rounded hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                                  title="Editar inline"
                                >
                                  <FontAwesomeIcon icon={faEdit} className="text-lg" />
                                </button>
                                <button
                                  onClick={() => handleOpenModal(product)}
                                  className="p-2 ml-2 transition-colors rounded text-pepper-orange hover:bg-orange-50 dark:hover:bg-orange-900/20"
                                  title="Editar completo (ingredientes, imagen, etc)"
                                >
                                  <FontAwesomeIcon icon={faPlus} className="text-lg" />
                                </button>
                                <button
                                  onClick={() => handleDuplicate(product)}
                                  className="p-2 ml-2 text-teal-600 transition-colors rounded hover:bg-teal-50 dark:text-teal-400 dark:hover:bg-teal-900/20"
                                  title="Duplicar producto"
                                >
                                  <FontAwesomeIcon icon={faCopy} className="text-lg" />
                                </button>
                                <button
                                  onClick={() => handleDelete(product.id)}
                                  className="p-2 ml-2 text-red-500 transition-colors rounded hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
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

      {/* Product Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        product={selectedProduct}
        onSuccess={refetch}
      />
    </div>
  );
};

export default ProductsPage;
