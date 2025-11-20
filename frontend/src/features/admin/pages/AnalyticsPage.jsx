import { useState, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTrophy,
  faUser,
  faCalendarDay,
  faCalendarWeek,
  faCalendarAlt,
} from '@fortawesome/free-solid-svg-icons';
import useFetch from '@shared/hooks/useFetch';

const AnalyticsPage = () => {
  const [period, setPeriod] = useState('week'); // 'day', 'week', 'month'

  const { data: ordersData, loading, error } = useFetch('/orders/');
  const orders = useMemo(() => ordersData?.results || [], [ordersData]);

  // Filter orders by period
  const filteredOrders = useMemo(() => {
    const today = new Date();
    const startDate = new Date(today);

    if (period === 'day') {
      startDate.setHours(0, 0, 0, 0);
    } else if (period === 'week') {
      startDate.setDate(today.getDate() - 7);
    } else {
      startDate.setDate(1); // First day of current month
    }

    return orders.filter(order => new Date(order.created_at) >= startDate);
  }, [orders, period]);

  // Calculate analytics
  const analytics = useMemo(() => {
    const productStats = {};
    const userStats = {};

    filteredOrders.forEach(order => {
      const userId = order.user;
      const userName = order.user_name || order.user_email || `Usuario #${userId}`;

      // User statistics
      if (!userStats[userId]) {
        userStats[userId] = { name: userName, count: 0, total: 0 };
      }
      userStats[userId].count += 1;
      userStats[userId].total += parseFloat(order.total_price || 0);

      // Product statistics
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach(item => {
          const productId = item.product;
          if (!productStats[productId]) {
            productStats[productId] = {
              id: productId,
              name: item.product_name || 'Desconocido',
              image: item.product_image,
              quantity: 0,
              revenue: 0,
            };
          }
          productStats[productId].quantity += item.quantity;
          productStats[productId].revenue += parseFloat(item.subtotal || 0);
        });
      }
    });

    // Convert to arrays and sort
    const topProducts = Object.values(productStats)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    const topCustomer = Object.values(userStats)
      .sort((a, b) => b.total - a.total)[0] || null;

    const topProduct = topProducts[0] || null;

    return { topProduct, topCustomer, topProducts };
  }, [filteredOrders]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600 dark:text-text-secondary">Cargando analíticas...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-600 dark:text-red-400">Error al cargar analíticas</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col gap-4 mb-8 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-text-primary">
            Analíticas
          </h1>
          <p className="text-gray-600 dark:text-text-secondary">
            Análisis de ventas y comportamiento de clientes
          </p>
        </div>

        {/* Period Filter */}
        <div className="flex gap-2">
          <button
            onClick={() => setPeriod('day')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              period === 'day'
                ? 'bg-pepper-orange text-white'
                : 'bg-gray-200 dark:bg-dark-card text-gray-700 dark:text-text-secondary hover:bg-gray-300 dark:hover:bg-dark-border'
            }`}
          >
            <FontAwesomeIcon icon={faCalendarDay} className="mr-2" />
            Hoy
          </button>
          <button
            onClick={() => setPeriod('week')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              period === 'week'
                ? 'bg-pepper-orange text-white'
                : 'bg-gray-200 dark:bg-dark-card text-gray-700 dark:text-text-secondary hover:bg-gray-300 dark:hover:bg-dark-border'
            }`}
          >
            <FontAwesomeIcon icon={faCalendarWeek} className="mr-2" />
            Semana
          </button>
          <button
            onClick={() => setPeriod('month')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              period === 'month'
                ? 'bg-pepper-orange text-white'
                : 'bg-gray-200 dark:bg-dark-card text-gray-700 dark:text-text-secondary hover:bg-gray-300 dark:hover:bg-dark-border'
            }`}
          >
            <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" />
            Mes
          </button>
        </div>
      </div>

      {/* Top Product Card */}
      {analytics.topProduct && (
        <div className="p-6 mb-6 text-white rounded-lg shadow-lg bg-gradient-to-br from-pepper-orange to-pepper-orange/80">
          <div className="flex items-center mb-4">
            <FontAwesomeIcon icon={faTrophy} className="mr-3 text-3xl" />
            <h2 className="text-2xl font-bold">Producto Más Vendido</h2>
          </div>
          <div className="flex flex-col items-center gap-6 md:flex-row">
            {/* Product Image */}
            <div className="flex-shrink-0">
              <img
                src={analytics.topProduct.image || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 150 150"%3E%3Crect width="150" height="150" fill="%23f5f5f5"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="14" fill="%23999"%3ESin Imagen%3C/text%3E%3C/svg%3E'}
                alt={analytics.topProduct.name}
                className="object-cover w-32 h-32 rounded-lg shadow-md"
              />
            </div>
            {/* Product Info */}
            <div className="flex-grow text-center md:text-left">
              <h3 className="mb-2 text-3xl font-bold">{analytics.topProduct.name}</h3>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="text-sm text-white/80">Cantidad Vendida</p>
                  <p className="text-4xl font-bold">{analytics.topProduct.quantity}</p>
                </div>
                <div>
                  <p className="text-sm text-white/80">Ingresos Generados</p>
                  <p className="text-4xl font-bold">€{analytics.topProduct.revenue.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Customer and Top 5 Products */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top Customer */}
        <div className="p-6 bg-white border border-gray-200 rounded-lg dark:bg-dark-card dark:border-dark-border">
          <div className="flex items-center mb-4">
            <FontAwesomeIcon icon={faUser} className="mr-3 text-xl text-yellow-500" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-text-primary">
              Cliente Más Activo
            </h2>
          </div>
          {analytics.topCustomer ? (
            <div className="p-6 rounded-lg bg-yellow-500/10 dark:bg-yellow-500/20">
              <p className="mb-2 text-2xl font-bold text-gray-900 dark:text-text-primary">
                {analytics.topCustomer.name}
              </p>
              <p className="mb-4 text-gray-600 dark:text-text-secondary">
                {analytics.topCustomer.count} pedidos realizados
              </p>
              <p className="text-3xl font-bold text-yellow-500">
                €{analytics.topCustomer.total.toFixed(2)}
              </p>
              <p className="text-sm text-gray-600 dark:text-text-secondary">Total gastado</p>
            </div>
          ) : (
            <p className="py-4 text-center text-gray-600 dark:text-text-secondary">
              No hay datos disponibles
            </p>
          )}
        </div>

        {/* Top 5 Products */}
        <div className="p-6 bg-white border border-gray-200 rounded-lg dark:bg-dark-card dark:border-dark-border">
          <div className="flex items-center mb-4">
            <FontAwesomeIcon icon={faTrophy} className="mr-3 text-xl text-pepper-orange" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-text-primary">
              Top 5 Productos
            </h2>
          </div>
          <div className="space-y-3">
            {analytics.topProducts.length === 0 ? (
              <p className="py-4 text-center text-gray-600 dark:text-text-secondary">
                No hay datos disponibles
              </p>
            ) : (
              analytics.topProducts.map((product, index) => (
                <div
                  key={product.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-dark-bg"
                >
                  <span className="flex items-center justify-center flex-shrink-0 w-8 h-8 text-sm font-bold text-white rounded-full bg-pepper-orange">
                    {index + 1}
                  </span>
                  <img
                    src={product.image || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"%3E%3Crect width="40" height="40" fill="%23f5f5f5"/%3E%3C/svg%3E'}
                    alt={product.name}
                    className="flex-shrink-0 object-cover w-12 h-12 rounded"
                  />
                  <div className="flex-grow min-w-0">
                    <p className="font-medium text-gray-900 truncate dark:text-text-primary">
                      {product.name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-text-secondary">
                      {product.quantity} vendidos • €{product.revenue.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
