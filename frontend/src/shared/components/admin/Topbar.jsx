import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBell,
  faUser,
  faSignOutAlt,
  faCog,
  faChevronDown,
  faMoon,
  faSun,
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '@shared/contexts/AuthContext';
import { useTheme } from '@shared/contexts/ThemeContext';
import useNotifications from '@shared/hooks/useNotifications';
import PropTypes from 'prop-types';

const Topbar = ({ isCollapsed }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const userMenuRef = useRef(null);
  const notificationsRef = useRef(null);

  // Real-time notifications from pending orders
  const { notifications, loading, unreadCount, markAsRead, clearAll } = useNotifications();

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header
      className={`
        fixed top-0 right-0 h-[70px] bg-white dark:bg-dark-header border-b border-gray-200 dark:border-dark-border
        transition-all duration-300 ease-in-out z-30
        ${isCollapsed ? 'left-[70px]' : 'left-[250px]'}
      `}
    >
      <div className="h-full px-3 md:px-6 flex items-center justify-between">
        {/* Left section - Breadcrumb or page title */}
        <div>
          <h2 className="text-base md:text-xl font-semibold text-gray-900 dark:text-text-primary">
            Panel de Administración
          </h2>
        </div>

        {/* Right section - Theme Toggle, Notifications & User */}
        <div className="flex items-center space-x-2 md:space-x-4">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-dark-card transition-colors text-gray-600 dark:text-text-secondary hover:text-gray-900 dark:hover:text-text-primary"
            aria-label="Toggle theme"
          >
            <FontAwesomeIcon icon={theme === 'dark' ? faSun : faMoon} className="text-lg" />
          </button>

          {/* Notifications */}
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-dark-card transition-colors text-gray-600 dark:text-text-secondary hover:text-gray-900 dark:hover:text-text-primary"
              aria-label="Notifications"
            >
              <FontAwesomeIcon icon={faBell} className="text-lg" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-5 h-5 bg-pepper-orange rounded-full flex items-center justify-center text-xs font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white dark:bg-dark-card rounded-lg shadow-lg border border-gray-200 dark:border-dark-border overflow-hidden animate-fadeIn z-50 max-w-[calc(100vw-2rem)]">
                <div className="px-4 py-3 border-b border-gray-200 dark:border-dark-border flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 dark:text-text-primary">Notificaciones</h3>
                  {notifications.length > 0 && (
                    <button
                      onClick={() => {
                        clearAll();
                      }}
                      className="text-xs text-gray-500 hover:text-gray-700 dark:text-text-secondary dark:hover:text-text-primary"
                    >
                      Limpiar
                    </button>
                  )}
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {loading ? (
                    <div className="px-4 py-8 text-center text-gray-500 dark:text-text-secondary">
                      Cargando notificaciones...
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center text-gray-500 dark:text-text-secondary">
                      No hay notificaciones nuevas
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        onClick={() => {
                          markAsRead(notification.id);
                          navigate('/admin/orders');
                          setShowNotifications(false);
                        }}
                        className={`px-4 py-3 border-b border-gray-200 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-bg transition-colors cursor-pointer ${
                          notification.unread ? 'bg-gray-50 dark:bg-dark-bg/50' : ''
                        }`}
                      >
                        <p className="text-sm text-gray-900 dark:text-text-primary mb-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-text-secondary">
                          {notification.time}
                        </p>
                      </div>
                    ))
                  )}
                </div>
                {notifications.length > 0 && (
                  <div className="px-4 py-3 text-center border-t border-gray-200 dark:border-dark-border">
                    <button
                      onClick={() => {
                        navigate('/admin/orders');
                        setShowNotifications(false);
                      }}
                      className="text-sm text-pepper-orange hover:text-pepper-orange/80 font-medium"
                    >
                      Ver todos los pedidos
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 lg:space-x-3 px-2 lg:px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-card transition-colors"
            >
              <div className="w-9 h-9 bg-pepper-orange rounded-full flex items-center justify-center flex-shrink-0">
                <FontAwesomeIcon icon={faUser} className="text-white" />
              </div>
              <div className="text-left hidden md:block">
                <p className="text-sm font-medium text-gray-900 dark:text-text-primary truncate max-w-[120px]">
                  {user?.username || 'Admin'}
                </p>
                <p className="text-xs text-gray-600 dark:text-text-secondary">
                  {user?.role === 'boss' ? 'Propietario' : 'Empleado'}
                </p>
              </div>
              <FontAwesomeIcon
                icon={faChevronDown}
                className="text-gray-600 dark:text-text-secondary text-sm hidden md:block"
              />
            </button>

            {/* User Dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-card rounded-lg shadow-lg border border-gray-200 dark:border-dark-border overflow-hidden animate-fadeIn z-50">
                {/* Mobile: Show user info in dropdown */}
                <div className="md:hidden px-4 py-3 border-b border-gray-200 dark:border-dark-border">
                  <p className="text-sm font-medium text-gray-900 dark:text-text-primary">
                    {user?.username || 'Admin'}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-text-secondary">
                    {user?.role === 'boss' ? 'Propietario' : 'Empleado'}
                  </p>
                </div>

                <Link
                  to="/admin/settings"
                  className="flex items-center px-4 py-3 hover:bg-gray-50 dark:hover:bg-dark-bg transition-colors"
                  onClick={() => setShowUserMenu(false)}
                >
                  <FontAwesomeIcon icon={faCog} className="text-gray-600 dark:text-text-secondary mr-3" />
                  <span className="text-sm text-gray-900 dark:text-text-primary">Configuración</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-4 py-3 hover:bg-gray-50 dark:hover:bg-dark-bg transition-colors border-t border-gray-200 dark:border-dark-border"
                >
                  <FontAwesomeIcon icon={faSignOutAlt} className="text-gray-600 dark:text-text-secondary mr-3" />
                  <span className="text-sm text-gray-900 dark:text-text-primary">Cerrar sesión</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

Topbar.propTypes = {
  isCollapsed: PropTypes.bool.isRequired,
};

export default Topbar;
