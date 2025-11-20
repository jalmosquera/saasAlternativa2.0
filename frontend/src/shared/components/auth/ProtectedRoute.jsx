import { Navigate } from 'react-router-dom';
import { useAuth } from '@shared/contexts/AuthContext';
import PropTypes from 'prop-types';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user } = useAuth();

  // 🔹 lee respaldo del localStorage por si el contexto aún no cargó
  const storedUser = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  const activeUser = user || storedUser;
  const authenticated = isAuthenticated || !!token;

  // No autenticado en ningún lado → login
  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  // Autenticado, pero sin permiso → home
  if (allowedRoles.length > 0 && !allowedRoles.includes(activeUser?.role)) {
    return <Navigate to="/" replace />;
  }

  // Todo OK
  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  allowedRoles: PropTypes.arrayOf(PropTypes.string),
};

export default ProtectedRoute;
