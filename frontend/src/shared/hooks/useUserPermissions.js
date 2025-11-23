import { useAuth } from '@shared/contexts/AuthContext';

/**
 * Custom hook to check user permissions
 * @returns {Object} Permission flags for the current user
 */
const useUserPermissions = () => {
  const { user } = useAuth();

  // Boss has all permissions
  if (user?.role === 'boss') {
    return {
      canCreate: true,
      canUpdate: true,
      canDelete: true,
      canRead: true,
      hasAnyWritePermission: true,
    };
  }

  // Employe has granular permissions
  if (user?.role === 'employe') {
    const canCreate = user?.can_create ?? false;
    const canUpdate = user?.can_update ?? false;
    const canDelete = user?.can_delete ?? false;

    return {
      canCreate,
      canUpdate,
      canDelete,
      canRead: true, // Employes always have read access
      hasAnyWritePermission: canCreate || canUpdate || canDelete,
    };
  }

  // Client and unauthenticated users have read-only access
  return {
    canCreate: false,
    canUpdate: false,
    canDelete: false,
    canRead: true,
    hasAnyWritePermission: false,
  };
};

export default useUserPermissions;
