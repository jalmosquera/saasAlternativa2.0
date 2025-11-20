import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBars,
  faTachometerAlt,
  faShoppingCart,
  faUtensils,
  faUsers,
  faList,
  faLeaf,
  faChartLine,
  faChevronRight,
  faStore,
  faCog,
  faImage,
  faRectangleAd,
} from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';


const Sidebar = ({ isCollapsed, onToggle }) => {
  const location = useLocation();
  const [openSubmenu, setOpenSubmenu] = useState(null);


  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: faTachometerAlt,
      path: '/admin',
    },
    {
      id: 'orders',
      label: 'Pedidos',
      icon: faShoppingCart,
      path: '/admin/orders',
    },
    {
      id: 'products',
      label: 'Productos',
      icon: faUtensils,
      path: '/admin/products',
    },
    {
      id: 'categories',
      label: 'Categorías',
      icon: faList,
      path: '/admin/categories',
    },
    {
      id: 'ingredients',
      label: 'Ingredientes',
      icon: faLeaf,
      path: '/admin/ingredients',
    },
    {
      id: 'product-options',
      label: 'Opciones',
      icon: faCog,
      path: '/admin/product-options',
    },
    {
      id: 'users',
      label: 'Usuarios',
      icon: faUsers,
      path: '/admin/users',
    },
    {
      id: 'promotions',
      label: 'Promociones',
      icon: faImage,
      path: '/admin/promotions',
    },
    {
      id: 'carousel-cards',
      label: 'Carrusel',
      icon: faRectangleAd,
      path: '/admin/carousel-cards',
    },
    {
      id: 'analytics',
      label: 'Analíticas',
      icon: faChartLine,
      path: '/admin/analytics',
    },
    {
      id: 'settings',
      label: 'Configuraciones',
      icon: faCog,
      path: '/admin/settings',
      submenu: [
        {
          id: 'settings-general',
          label: 'Información General',
          path: '/admin/settings#general',
        },
        {
          id: 'settings-whatsapp',
          label: 'Números de WhatsApp',
          path: '/admin/settings#whatsapp',
        },
        {
          id: 'settings-schedule',
          label: 'Horarios de Atención',
          path: '/admin/settings#horarios',
        },
        {
          id: 'settings-locations',
          label: 'Ubicaciones de Entrega',
          path: '/admin/settings#ubicaciones',
        },
      ],
    },
  ];


  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };


  const toggleSubmenu = (id) => {
    if (isCollapsed) return;
    setOpenSubmenu(openSubmenu === id ? null : id);
  };


  return (
    <aside
      className={`
        fixed left-0 top-0 h-full bg-gray-100 dark:bg-dark-sidebar
        transition-all duration-300 ease-in-out z-40
        ${isCollapsed ? 'w-[70px]' : 'w-[250px]'}
      `}
    >
      {/* Logo & Toggle */}
      <div className="h-[70px] flex items-center justify-between px-4 bg-white dark:bg-dark-header border-b border-gray-200 dark:border-dark-border">
        {!isCollapsed && (
          <h1 className="text-xl font-bold text-pepper-orange">
            Equus
          </h1>
        )}
        <button
          onClick={onToggle}
          className="flex items-center justify-center w-10 h-10 text-gray-600 transition-colors rounded-lg hover:bg-gray-200 dark:hover:bg-dark-card dark:text-text-secondary hover:text-gray-900 dark:hover:text-text-primary"
          aria-label="Toggle sidebar"
        >
          <FontAwesomeIcon icon={faBars} />
        </button>
      </div>


      {/* Navigation */}
      <nav className="py-4">
        <ul className="space-y-1">
          {/* Link to Public Menu */}
          <li>
            <Link
              to="/"
              className="flex items-center px-4 py-3 mx-2 mb-2 text-gray-600 transition-all duration-200 border-b border-gray-200 rounded-lg dark:text-text-secondary hover:bg-gray-200 dark:hover:bg-dark-card hover:text-gray-900 dark:hover:text-text-primary dark:border-dark-border"
            >
              <FontAwesomeIcon
                icon={faStore}
                className={`text-lg ${isCollapsed ? '' : 'mr-3'}`}
              />
              {!isCollapsed && (
                <span className="font-medium">Ver Menú</span>
              )}
            </Link>
          </li>
          {menuItems.map((item) => {
            const active = isActive(item.path);


            return (
              <li key={item.id}>
                {item.submenu ? (
                  <div className="mx-2">
                    {/* En mobile/collapsed: Link directo. En desktop: botón con submenu */}
                    {isCollapsed ? (
                      <Link
                        to={item.path}
                        className={`
                          flex items-center px-4 py-3 rounded-lg justify-center
                          transition-all duration-200
                          ${active
                            ? 'bg-pepper-orange text-white'
                            : 'text-gray-600 dark:text-text-secondary hover:bg-gray-200 dark:hover:bg-dark-card hover:text-gray-900 dark:hover:text-text-primary'
                          }
                        `}
                      >
                        <FontAwesomeIcon
                          icon={item.icon}
                          className="text-lg"
                        />
                      </Link>
                    ) : (
                      <>
                        <button
                          onClick={() => toggleSubmenu(item.id)}
                          className={`
                            w-full flex items-center px-4 py-3 rounded-lg
                            transition-all duration-200 justify-between
                            ${active
                              ? 'bg-pepper-orange text-white'
                              : 'text-gray-600 dark:text-text-secondary hover:bg-gray-200 dark:hover:bg-dark-card hover:text-gray-900 dark:hover:text-text-primary'
                            }
                          `}
                        >
                          <div className="flex items-center">
                            <FontAwesomeIcon
                              icon={item.icon}
                              className="mr-3 text-lg"
                            />
                            <span className="font-medium">{item.label}</span>
                          </div>
                          <FontAwesomeIcon
                            icon={faChevronRight}
                            className={`text-sm transition-transform ${
                              openSubmenu === item.id ? 'rotate-90' : ''
                            }`}
                          />
                        </button>

                        {/* Submenu */}
                        {item.submenu && openSubmenu === item.id && (
                          <ul className="mt-1 ml-2 space-y-1">
                            {item.submenu.map((subItem) => (
                              <li key={subItem.id}>
                                <Link
                                  to={subItem.path}
                                  className={`
                                    flex items-center px-4 py-2 mx-0 rounded-lg
                                    transition-colors
                                    ${isActive(subItem.path)
                                      ? 'bg-gray-200 dark:bg-dark-card text-pepper-orange'
                                      : 'text-gray-600 dark:text-text-secondary hover:bg-gray-200 dark:hover:bg-dark-card hover:text-gray-900 dark:hover:text-text-primary'
                                    }
                                  `}
                                >
                                  <span className="text-sm">{subItem.label}</span>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </>
                    )}
                  </div>
                ) : (
                  <Link
                    to={item.path}
                    className={`
                      flex items-center px-4 py-3 mx-2 rounded-lg
                      transition-all duration-200
                      ${active
                        ? 'bg-pepper-orange text-white'
                        : 'text-gray-600 dark:text-text-secondary hover:bg-gray-200 dark:hover:bg-dark-card hover:text-gray-900 dark:hover:text-text-primary'
                      }
                      ${isCollapsed ? 'justify-center' : 'justify-between'}
                    `}
                  >
                    <div className="flex items-center">
                      <FontAwesomeIcon
                        icon={item.icon}
                        className={`text-lg ${isCollapsed ? '' : 'mr-3'}`}
                      />
                      {!isCollapsed && (
                        <span className="font-medium">{item.label}</span>
                      )}
                    </div>
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};


Sidebar.propTypes = {
  isCollapsed: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
};


export default Sidebar;
