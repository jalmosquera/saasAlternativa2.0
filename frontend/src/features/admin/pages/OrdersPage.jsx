import { useState, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faEye, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import usePaginatedFetch from '@shared/hooks/usePaginatedFetch';
import toast from 'react-hot-toast';
import OrderModal from '@features/admin/components/OrderModal';
import { getAuthHeaders } from '@shared/utils/auth';
import Pagination from '@shared/components/Pagination';

const OrdersPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [appliedSearchTerm, setAppliedSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editingStatus, setEditingStatus] = useState(null);

  // Construir filtros para la API
  const apiFilters = useMemo(() => {
    const filters = {};
    if (appliedSearchTerm) filters.search = appliedSearchTerm;
    if (statusFilter && statusFilter !== 'all') filters.status = statusFilter;
    return filters;
  }, [appliedSearchTerm, statusFilter]);

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
    data: ordersData,
    loading,
    error,
    refetch,
    currentPage,
    pageSize,
    totalCount,
    setPage,
  } = usePaginatedFetch('/orders/', 10, apiFilters);

  const orders = ordersData?.results || [];

  const handleOpenModal = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedOrder(null);
    setIsModalOpen(false);
  };

  const handleStatusClick = (orderId, currentStatus) => {
    setEditingStatus({ orderId, status: currentStatus });
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/orders/${orderId}/`,
        {
          method: 'PATCH',
          headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (response.ok) {
        toast.success('Estado del pedido actualizado');
        setEditingStatus(null);
        refetch();
      } else {
        const errorData = await response.json();
        console.error('Error al actualizar:', errorData);
        toast.error('Error al actualizar el estado');
      }
    } catch (error) {
      console.error('Error al conectar con el servidor:', error);
      toast.error('Error al conectar con el servidor');
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    await handleStatusChange(orderId, newStatus);
  };

  // Los pedidos ya vienen filtrados del servidor
  const filteredOrders = orders;

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/10 text-green-600 dark:text-green-400';
      case 'confirmed':
        return 'bg-riday-blue/10 text-riday-blue';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400';
      case 'cancelled':
        return 'bg-red-500/10 text-red-600 dark:text-red-400';
      default:
        return 'bg-gray-500/10 text-gray-600 dark:text-gray-400';
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      'pending': 'Pendiente',
      'confirmed': 'Confirmado',
      'completed': 'Completado',
      'cancelled': 'Cancelado',
    };
    return statusMap[status] || status;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600 dark:text-text-secondary">Cargando pedidos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-600 dark:text-red-400">Error al cargar pedidos</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col gap-4 mb-8 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-text-primary">
            Pedidos
          </h1>
          <p className="text-gray-600 dark:text-text-secondary">
            Gestiona los pedidos de los clientes
          </p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col gap-4 mb-6 sm:flex-row">
        <div className="relative flex flex-1 gap-2 max-w-md">
          <div className="relative flex-1">
            <FontAwesomeIcon
              icon={faSearch}
              className="absolute text-gray-400 -translate-y-1/2 left-3 top-1/2"
            />
            <input
              type="text"
              placeholder="Buscar por cliente, email o ID..."
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
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 text-gray-900 bg-white border border-gray-200 rounded-lg dark:border-dark-border dark:bg-dark-card dark:text-text-primary focus:outline-none focus:ring-2 focus:ring-pepper-orange"
        >
          <option value="all">Todos los estados</option>
          <option value="pending">Pendiente</option>
          <option value="confirmed">Confirmado</option>
          <option value="completed">Completado</option>
          <option value="cancelled">Cancelado</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg dark:border-dark-border">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-border">
          <thead className="bg-gray-50 dark:bg-dark-card">
            <tr>
              <th className="px-4 py-3 text-sm font-semibold text-left text-gray-700 dark:text-text-primary">
                ID
              </th>
              <th className="px-4 py-3 text-sm font-semibold text-left text-gray-700 dark:text-text-primary">
                Cliente
              </th>
              <th className="px-4 py-3 text-sm font-semibold text-left text-gray-700 dark:text-text-primary">
                Ubicación
              </th>
              <th className="px-4 py-3 text-sm font-semibold text-left text-gray-700 dark:text-text-primary">
                Items
              </th>
              <th className="px-4 py-3 text-sm font-semibold text-left text-gray-700 dark:text-text-primary">
                Total
              </th>
              <th className="px-4 py-3 text-sm font-semibold text-left text-gray-700 dark:text-text-primary">
                Estado
              </th>
              <th className="px-4 py-3 text-sm font-semibold text-right text-gray-700 dark:text-text-primary">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 dark:bg-dark-card dark:divide-dark-border">
            {filteredOrders.length === 0 ? (
              <tr>
                <td
                  colSpan="7"
                  className="py-6 text-center text-gray-600 dark:text-text-secondary"
                >
                  No se encontraron pedidos
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr
                  key={order.id}
                  className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-text-primary">
                    #{order.id}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-text-primary">
                    {order.user_name || order.user_email || `User #${order.user}`}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-text-secondary">
                    {order.delivery_location === 'ardales' ? 'Ardales' : 'Carratraca'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-text-secondary">
                    {order.items_count}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-text-primary">
                    €{parseFloat(order.total_price).toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    {editingStatus?.orderId === order.id ? (
                      <select
                        value={editingStatus.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        onBlur={() => setEditingStatus(null)}
                        autoFocus
                        className="px-3 py-1 text-xs font-medium text-gray-900 bg-white border border-gray-300 rounded-full dark:border-dark-border dark:bg-dark-bg dark:text-text-primary focus:outline-none focus:ring-2 focus:ring-pepper-orange"
                      >
                        <option value="pending">Pendiente</option>
                        <option value="confirmed">Confirmado</option>
                        <option value="completed">Completado</option>
                        <option value="cancelled">Cancelado</option>
                      </select>
                    ) : (
                      <span
                        onClick={() => handleStatusClick(order.id, order.status)}
                        className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity ${getStatusColor(order.status)}`}
                      >
                        {getStatusText(order.status)}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 space-x-2 text-right">
                    <button
                      onClick={() => handleOpenModal(order)}
                      className="p-2 transition-colors text-riday-blue hover:text-riday-blue/80"
                      title="Ver detalles"
                    >
                      <FontAwesomeIcon icon={faEye} />
                    </button>
                    {order.status === 'pending' && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'confirmed')}
                        className="p-2 text-green-600 transition-colors hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                        title="Confirmar pedido"
                      >
                        <FontAwesomeIcon icon={faCheck} />
                      </button>
                    )}
                    {(order.status === 'pending' || order.status === 'confirmed') && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'cancelled')}
                        className="p-2 text-red-500 transition-colors hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        title="Cancelar pedido"
                      >
                        <FontAwesomeIcon icon={faTimes} />
                      </button>
                    )}
                  </td>
                </tr>
              ))
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

      {/* Order Detail Modal */}
      <OrderModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        order={selectedOrder}
        onSuccess={refetch}
      />
    </div>
  );
};

export default OrdersPage;
