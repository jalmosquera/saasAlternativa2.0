import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect, useState } from 'react';


// Context providers
import { AuthProvider } from '@shared/contexts/AuthContext';
import { ThemeProvider } from '@shared/contexts/ThemeContext';
import { LanguageProvider } from '@shared/contexts/LanguageContext';
import { CartProvider } from '@shared/contexts/CartContext';


// Layouts y páginas
import MenuLayout from '@shared/components/layout/MenuLayout';
import AdminLayout from '@shared/components/layout/AdminLayout';
import HomePage from '@features/menu/pages/HomePage';
import ProductDetailPage from '@features/menu/pages/ProductDetailPage';
import ContactPage from '@features/menu/pages/ContactPage';
import MyOrdersPage from '@features/menu/pages/MyOrdersPage';
import { LoginPage, RegisterPage, ForgotPasswordPage, ResetPasswordPage } from '@features/auth/pages';
import CartPage from '@features/cart/pages/CartPage';
import CheckoutPage from '@features/cart/pages/CheckoutPage';
import DashboardPage from '@features/admin/pages/DashboardPage';
import OrdersPage from '@features/admin/pages/OrdersPage';
import ProductsPage from '@features/admin/pages/ProductsPage';
import CategoriesPage from '@features/admin/pages/CategoriesPage';
import IngredientsPage from '@features/admin/pages/IngredientsPage';
import ProductOptionsPage from '@features/admin/pages/ProductOptionsPage';
import UsersPage from '@features/admin/pages/UsersPage';
import ProtectedRoute from '@shared/components/auth/ProtectedRoute';
import NotFoundPage from '@pages/NotFoundPage';
import AnalyticsPage from './features/admin/pages/AnalyticsPage';
import SettingsPage from './features/admin/pages/SettingsPage';
import PromotionsPage from './features/admin/pages/PromotionsPage';
import CarouselCardsPage from './features/admin/pages/CarouselCardsPage';
import JuanPorras from './pages/JuanPorras';


function App() {
  const [isDark, setIsDark] = useState(false);


  useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => observer.disconnect();
  }, []);

  // Manejo de loading inicial - Ocultar el loader del HTML
  useEffect(() => {
    const initialLoader = document.getElementById('initial-loader');

    if (initialLoader) {
      // Esperar a que React esté completamente montado
      const timer = setTimeout(() => {
        initialLoader.classList.add('hidden');

        // Remover del DOM después de la transición
        setTimeout(() => {
          initialLoader.remove();
        }, 400);
      }, 800);

      // Failsafe: asegurar que se oculte después de 5 segundos máximo
      const failsafe = setTimeout(() => {
        if (initialLoader && initialLoader.parentNode) {
          initialLoader.classList.add('hidden');
          setTimeout(() => {
            initialLoader.remove();
          }, 400);
        }
      }, 5000);

      return () => {
        clearTimeout(timer);
        clearTimeout(failsafe);
      };
    }
  }, []);


  return (
    <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <CartProvider>
              <BrowserRouter>
                <Toaster
                  position="bottom-center"
                  reverseOrder={false}
                  toastOptions={{
                    duration: 1500,
                    style: {
                      background: isDark ? '#363636' : '#ffffff',
                      color: '#F76511',
                      padding: '16px',
                      borderRadius: '8px',
                      boxShadow: isDark
                        ? '0 4px 12px rgba(0, 0, 0, 0.3)'
                        : '0 4px 12px rgba(0, 0, 0, 0.15)',
                    },
                    success: {
                      duration: 1500,
                      iconTheme: {
                        primary: '#FF6B35',
                        secondary: '#F76511',
                      },
                    },
                    error: {
                      duration: 1500,
                    },
                  }}
                />


              <Routes>
                {/* Auth */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />


                {/* Público */}
                <Route path="/" element={<MenuLayout />}>
                  <Route index element={<HomePage />} />
                  <Route path="product/:id" element={<ProductDetailPage />} />
                  <Route path="contact" element={<ContactPage />} />
                  <Route path="cart" element={<CartPage />} />
                  <Route path="checkout" element={<CheckoutPage />} />
                  <Route path="my-orders" element={<MyOrdersPage />} />
                </Route>

                {/* Juan landing */}
                <Route path="juanporras" element={<JuanPorras />} />

                {/* Admin (protegido) */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute allowedRoles={['boss', 'employee']}>
                      <AdminLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<DashboardPage />} />
                  <Route path="orders" element={<OrdersPage />} />
                  <Route path="products" element={<ProductsPage />} />
                  <Route path="categories" element={<CategoriesPage />} />
                  <Route path="ingredients" element={<IngredientsPage />} />
                  <Route path="product-options" element={<ProductOptionsPage />} />
                  <Route path="users" element={<UsersPage />} />
                  <Route path="promotions" element={<PromotionsPage />} />
                  <Route path="carousel-cards" element={<CarouselCardsPage />} />
                  <Route path="analytics" element={<AnalyticsPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                </Route>


                {/* 404 */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </BrowserRouter>
          </CartProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}


export default App;
