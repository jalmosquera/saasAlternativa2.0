import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes, faMoon, faSun, faGlobe, faUser, faSignOutAlt, faShoppingCart } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';
import { useTheme } from '@shared/contexts/ThemeContext';
import { useLanguage } from '@shared/contexts/LanguageContext';
import { useAuth } from '@shared/contexts/AuthContext';
import { useCart } from '@shared/contexts/CartContext';
import useOrderingEnabled from '@shared/hooks/useOrderingEnabled';

const Navbar = ({ companyName = 'Digital Letter' }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { language, changeLanguage, t } = useLanguage();
  const { user, logout, isAuthenticated } = useAuth();
  const { itemCount } = useCart();
  const { isOrderingEnabled } = useOrderingEnabled();

  const toggleLanguage = () => {
    changeLanguage(language === 'es' ? 'en' : 'es');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    closeMenu();
  };

  // Check if user is admin (boss or employee)
  const isAdmin = user?.role === 'boss' || user?.role === 'employee';

  const navLinks = [
    { to: '/', label: t('nav.home') },
    ...(isAuthenticated ? [{ to: '/my-orders', label: t('nav.myOrders') }] : []),
    ...(isAdmin ? [{ to: '/admin', label: 'Admin' }] : []),
    { to: '/contact', label: t('nav.contact') },
  ];


  return (
    <nav className="sticky top-0 z-50 transition-colors duration-200 bg-white shadow-sm dark:bg-pepper-charcoal dark:shadow-gray-800">
      <div className="container-pepper">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center space-x-3"
            onClick={closeMenu}
          >
            
            <span className="text-2xl lg:text-3xl font-cherry-bomb text-pepper-orange">
              {companyName}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="items-center hidden space-x-8 md:flex">
            {navLinks.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `font-gabarito font-semibold text-base transition-colors duration-200 ${
                    isActive
                      ? 'text-pepper-orange'
                      : 'text-pepper-charcoal dark:text-white hover:text-pepper-orange'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* CTA Button (Desktop) */}
          <div className="items-center hidden space-x-4 md:flex">
            {/* Language Toggle (Desktop) */}
            <button
              onClick={toggleLanguage}
              className="relative p-2 transition-colors duration-200 text-pepper-charcoal hover:text-pepper-orange dark:text-white dark:hover:text-pepper-orange"
              aria-label="Toggle language"
              title={t('nav.changeLanguage')}
            >
              <FontAwesomeIcon icon={faGlobe} size="lg" />
              <span className="absolute px-1 text-xs font-bold text-white rounded -bottom-1 -right-1 bg-pepper-orange">
                {language.toUpperCase()}
              </span>
            </button>
            {/* Dark Mode Toggle (Desktop) */}
            <button
              onClick={toggleTheme}
              className="p-2 transition-colors duration-200 text-pepper-charcoal hover:text-pepper-orange dark:text-white dark:hover:text-pepper-orange"
              aria-label="Toggle dark mode"
            >
              <FontAwesomeIcon icon={theme === 'dark' ? faSun : faMoon} size="lg" />
            </button>

            {/* Cart Button (Desktop) - solo mostrar si pedidos habilitados */}
            {isOrderingEnabled && (
              <Link
                to="/cart"
                className="relative p-2 transition-colors duration-200 text-pepper-charcoal hover:text-pepper-orange dark:text-white dark:hover:text-pepper-orange"
                aria-label={`${t('cart.title')} - ${itemCount} ${itemCount === 1 ? t('cart.item') : t('cart.items')}`}
              >
                <FontAwesomeIcon icon={faShoppingCart} size="lg" />
                {itemCount > 0 && (
                  <span className="absolute flex items-center justify-center w-5 h-5 text-xs font-bold text-white rounded-full -top-1 -right-1 bg-pepper-orange">
                    {itemCount}
                  </span>
                )}
              </Link>
            )}

            {/* Auth Buttons */}
            {isAuthenticated ? (
              <>
                <span className="text-sm text-pepper-charcoal dark:text-white font-gabarito">
                  <FontAwesomeIcon icon={faUser} className="mr-2" />
                  {user?.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 btn-pepper-secondary"
                >
                  <FontAwesomeIcon icon={faSignOutAlt} />
                  <span>{t('auth.logout')}</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-pepper-secondary">
                  {t('auth.login')}
                </Link>
                <Link to="/register" className="btn-pepper-primary">
                  {t('auth.register')}
                </Link>
              </>
            )}
          </div>

          {/* Mobile Controls: Language + Dark Mode + Cart + Menu */}
          <div className="flex items-center space-x-2 md:hidden">
            {/* Language Toggle (Mobile) */}
            <button
              onClick={toggleLanguage}
              className="relative p-2 transition-colors duration-200 text-pepper-charcoal hover:text-pepper-orange dark:text-white dark:hover:text-pepper-orange"
              aria-label="Toggle language"
              title={t('nav.changeLanguage')}
            >
              <FontAwesomeIcon icon={faGlobe} size="lg" />
              <span className="absolute px-1 text-xs font-bold text-white rounded -bottom-1 -right-1 bg-pepper-orange">
                {language.toUpperCase()}
              </span>
            </button>
            {/* Dark Mode Toggle (Mobile) */}
            <button
              onClick={toggleTheme}
              className="p-2 transition-colors duration-200 text-pepper-charcoal hover:text-pepper-orange dark:text-white dark:hover:text-pepper-orange"
              aria-label="Toggle dark mode"
            >
              <FontAwesomeIcon icon={theme === 'dark' ? faSun : faMoon} size="lg" />
            </button>
            {/* Cart Button (Mobile) - solo mostrar si pedidos habilitados */}
            {isOrderingEnabled && (
              <Link
                to="/cart"
                className="relative p-2 transition-colors duration-200 text-pepper-charcoal hover:text-pepper-orange dark:text-white dark:hover:text-pepper-orange"
                aria-label={`${t('cart.title')} - ${itemCount} ${itemCount === 1 ? t('cart.item') : t('cart.items')}`}
              >
                <FontAwesomeIcon icon={faShoppingCart} size="lg" />
                {itemCount > 0 && (
                  <span className="absolute flex items-center justify-center w-5 h-5 text-xs font-bold text-white rounded-full -top-1 -right-1 bg-pepper-orange">
                    {itemCount}
                  </span>
                )}
              </Link>
            )}
            {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              className="p-2 transition-colors duration-200 text-pepper-charcoal hover:text-pepper-orange dark:text-white dark:hover:text-pepper-orange"
              aria-label="Toggle menu"
            >
              <FontAwesomeIcon icon={isMenuOpen ? faTimes : faBars} size="lg" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden transition-transform duration-300 ease-in-out origin-top ${
          isMenuOpen ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0 h-0'
        }`}
      >
        <div className="px-4 pt-2 pb-4 space-y-3 bg-white border-t dark:bg-pepper-charcoal border-pepper-gray-light dark:border-gray-700">
          {navLinks.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={closeMenu}
              className={({ isActive }) =>
                `block px-4 py-3 rounded-lg font-gabarito font-semibold text-base transition-colors duration-200 ${
                  isActive
                    ? 'bg-pepper-orange text-white'
                    : 'text-pepper-charcoal dark:text-white hover:bg-pepper-light dark:hover:bg-gray-700'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}

          {/* Auth Buttons Mobile */}
          {isAuthenticated ? (
            <>
              <div className="px-4 py-3 text-sm text-center text-pepper-charcoal dark:text-white font-gabarito">
                <FontAwesomeIcon icon={faUser} className="mr-2" />
                {user?.name}
              </div>
              <button
                onClick={handleLogout}
                className="block w-full text-center btn-pepper-secondary"
              >
                <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
                {t('auth.logout')}
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={closeMenu}
                className="block w-full text-center btn-pepper-secondary"
              >
                {t('auth.login')}
              </Link>
              <Link
                to="/register"
                onClick={closeMenu}
                className="block w-full text-center btn-pepper-primary"
              >
                {t('auth.register')}
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

Navbar.propTypes = {
  companyName: PropTypes.string,
};

export default Navbar;
