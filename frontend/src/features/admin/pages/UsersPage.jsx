import { useState, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faSearch, faUser } from '@fortawesome/free-solid-svg-icons';
import usePaginatedFetch from '@shared/hooks/usePaginatedFetch';
import toast from 'react-hot-toast';
import UserModal from '@features/admin/components/UserModal';
import { getAuthHeaders } from '@shared/utils/auth';
import Pagination from '@shared/components/Pagination';

const UsersPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [appliedSearchTerm, setAppliedSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Construir filtros para la API
  const apiFilters = useMemo(() => {
    const filters = {};
    if (appliedSearchTerm) filters.search = appliedSearchTerm;
    if (selectedRole) filters.role = selectedRole;
    return filters;
  }, [appliedSearchTerm, selectedRole]);

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
    data: usersData,
    loading,
    error,
    refetch,
    currentPage,
    pageSize,
    totalCount,
    setPage,
  } = usePaginatedFetch('/users-list/', 10, apiFilters);

  const users = usersData?.results || [];

  const handleOpenModal = (user = null) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedUser(null);
    setIsModalOpen(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este usuario?')) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users-list/${id}/`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        toast.success('Usuario eliminado exitosamente');
        refetch();
      } else {
        toast.error('Error al eliminar el usuario');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al eliminar el usuario');
    }
  };

  // Los usuarios ya vienen filtrados del servidor
  // Filtrar usuarios específicos que no deben mostrarse
  const excludedEmails = ['jmosquera2305@gmail.com', 'mosquerasoft@gmail.com'];
  const filteredUsers = users.filter(user => !excludedEmails.includes(user.email));

  const getRoleLabel = (role) => {
    const roles = {
      'boss': 'Propietario',
      'employe': 'Empleado',
      'client': 'Cliente',
    };
    return roles[role] || role;
  };

  const getRoleBadge = (role) => {
    const badges = {
      'boss': 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300',
      'employe': 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300',
      'client': 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300',
    };
    return badges[role] || badges['client'];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600 dark:text-text-secondary">Cargando usuarios...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-600 dark:text-red-400">Error al cargar usuarios</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col gap-4 mb-8 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-text-primary">
            Usuarios
          </h1>
          <p className="text-gray-600 dark:text-text-secondary">
            Gestiona los usuarios del sistema
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center space-x-2 btn-pepper-primary"
        >
          <FontAwesomeIcon icon={faPlus} />
          <span>Nuevo Usuario</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 mb-6 md:flex-row">
        {/* Búsqueda por nombre/email */}
        <div className="relative flex flex-1 gap-2 max-w-md">
          <div className="relative flex-1">
            <FontAwesomeIcon
              icon={faSearch}
              className="absolute text-gray-400 -translate-y-1/2 left-3 top-1/2"
            />
            <input
              type="text"
              placeholder="Buscar por nombre o email..."
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

        {/* ✅ Filtro por Rol */}
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="px-4 py-2 text-gray-900 bg-white border border-gray-200 rounded-lg dark:border-dark-border dark:bg-dark-card dark:text-text-primary focus:outline-none focus:ring-2 focus:ring-pepper-orange"
        >
          <option value="">Todos los roles</option>
          <option value="boss">Propietario</option>
          <option value="employe">Empleado</option>
          <option value="client">Cliente</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="overflow-hidden bg-white border border-gray-200 rounded-lg dark:bg-dark-card dark:border-dark-border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-dark-bg">
              <tr>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-600 uppercase dark:text-text-secondary">
                  Usuario
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-600 uppercase dark:text-text-secondary">
                  Email
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-600 uppercase dark:text-text-secondary">
                  Rol
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-600 uppercase dark:text-text-secondary">
                  Activo
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-600 uppercase dark:text-text-secondary">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-dark-border">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-600 dark:text-text-secondary">
                    No se encontraron usuarios
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-dark-bg">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 rounded-full bg-pepper-orange">
                          <FontAwesomeIcon icon={faUser} className="text-white" />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900 dark:text-text-primary">
                            {user.username}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap dark:text-text-secondary">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadge(user.role)}`}>
                        {getRoleLabel(user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        user.is_active
                          ? 'bg-pepper-orange/10 text-pepper-orange'
                          : 'bg-gray-500/10 text-gray-500'
                      }`}>
                        {user.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 space-x-2 text-sm text-right whitespace-nowrap">
                      <button
                        onClick={() => handleOpenModal(user)}
                        className="transition-colors text-pepper-orange hover:text-pepper-orange/80"
                        title="Editar"
                      >
                        <FontAwesomeIcon icon={faEdit} className="text-lg" />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="ml-3 text-red-500 transition-colors hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        title="Eliminar"
                      >
                        <FontAwesomeIcon icon={faTrash} className="text-lg" />
                      </button>
                    </td>
                  </tr>
                ))
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

      {/* User Modal */}
      <UserModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        user={selectedUser}
        onSuccess={refetch}
      />
    </div>
  );
};

export default UsersPage;
