import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faShoppingCart,
  faUtensils,
  faUsers,
  faEuroSign,
  faArrowUp,
  faArrowDown,
  faEye,
} from '@fortawesome/free-solid-svg-icons';
import useFetch from '@shared/hooks/useFetch';
import { getVisitStats } from '@shared/services/visitTracker';

const DashboardPage = () => {
  const { data: ordersData, loading, error } = useFetch('/orders/');

  // Extract orders from paginated response (same as categories)
  const orders = useMemo(() => ordersData?.results || [], [ordersData]);

  // Calculate statistics from real orders
  const stats = useMemo(() => {
    const totalSales = orders.reduce((sum, order) =>
      sum + parseFloat(order.total_price || 0), 0
    );

    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const confirmedOrders = orders.filter(o => o.status === 'confirmed').length;
    const activeOrders = pendingOrders + confirmedOrders;

    const totalItems = orders.reduce((sum, order) =>
      sum + (order.items_count || 0), 0
    );

    const uniqueCustomers = new Set(orders.map(o => o.user)).size;

    // Get visit statistics
    const visitStats = getVisitStats();

    // Calculate trends (last 7 days vs previous 7 days)
    const now = new Date();
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last14Days = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const ordersLast7Days = orders.filter(o => 
      new Date(o.created_at) >= last7Days
    );
    const ordersPrevious7Days = orders.filter(o => 
      new Date(o.created_at) >= last14Days && new Date(o.created_at) < last7Days
    );

    const salesLast7Days = ordersLast7Days.reduce((sum, o) => 
      sum + parseFloat(o.total_price || 0), 0
    );
    const salesPrevious7Days = ordersPrevious7Days.reduce((sum, o) => 
      sum + parseFloat(o.total_price || 0), 0
    );

    const salesTrend = salesPrevious7Days > 0
      ? ((salesLast7Days - salesPrevious7Days) / salesPrevious7Days * 100).toFixed(1)
      : 0;

    const ordersTrend = ordersPrevious7Days.length > 0
      ? ((ordersLast7Days.length - ordersPrevious7Days.length) / ordersPrevious7Days.length * 100).toFixed(1)
      : 0;

    return [
      {
        id: 1,
        title: 'Total Ventas',
        value: `€${totalSales.toFixed(2)}`,
        change: `${salesTrend >= 0 ? '+' : ''}${salesTrend}%`,
        isPositive: salesTrend >= 0,
        icon: faEuroSign,
        bgColor: 'bg-pepper-orange/10',
        iconColor: 'text-pepper-orange',
        link: '/admin/orders',
      },
      {
        id: 2,
        title: 'Pedidos Activos',
        value: activeOrders.toString(),
        change: `${ordersTrend >= 0 ? '+' : ''}${ordersTrend}%`,
        isPositive: ordersTrend >= 0,
        icon: faShoppingCart,
        bgColor: 'bg-riday-blue/10',
        iconColor: 'text-riday-blue',
        link: '/admin/orders',
      },
      {
        id: 3,
        title: 'Productos Vendidos',
        value: totalItems.toString(),
        change: `${ordersLast7Days.length} últimos 7 días`,
        isPositive: true,
        icon: faUtensils,
        bgColor: 'bg-yellow-500/10',
        iconColor: 'text-yellow-500',
        link: '/admin/products',
      },
      {
        id: 4,
        title: 'Clientes',
        value: uniqueCustomers.toString(),
        change: `${ordersLast7Days.length} pedidos recientes`,
        isPositive: true,
        icon: faUsers,
        bgColor: 'bg-purple-500/10',
        iconColor: 'text-purple-500',
        link: '/admin/users',
      },
      {
        id: 5,
        title: 'Visitas',
        value: visitStats.total.toString(),
        change: `${visitStats.today} hoy • ${visitStats.thisWeek} esta semana`,
        isPositive: true,
        icon: faEye,
        bgColor: 'bg-green-500/10',
        iconColor: 'text-green-500',
        link: '/admin/analytics',
      },
    ];
  }, [orders]);

  // Get recent orders (last 5)
  const recentOrders = useMemo(() => 
    orders.slice(0, 5)
  , [orders]);

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
        <div className="text-gray-600 dark:text-text-secondary">Cargando dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-600 dark:text-red-400">Error al cargar datos del dashboard</div>
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-text-primary">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-text-secondary">
          Bienvenido al panel de administración
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {stats.map((stat) => (
          <Link
            key={stat.id}
            to={stat.link}
            className="block p-6 transition-all duration-200 transform bg-white border border-gray-200 rounded-lg dark:bg-dark-card dark:border-dark-border hover:border-pepper-orange hover:shadow-lg hover:-translate-y-1"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                <FontAwesomeIcon icon={stat.icon} className={`text-xl ${stat.iconColor}`} />
              </div>
              <div className={`flex items-center text-sm font-medium ${stat.isPositive ? 'text-pepper-orange' : 'text-red-500'}`}>
                {stat.change.includes('%') && (
                  <FontAwesomeIcon
                    icon={stat.isPositive ? faArrowUp : faArrowDown}
                    className="mr-1 text-xs"
                  />
                )}
                {stat.change}
              </div>
            </div>
            <h3 className="mb-1 text-sm text-gray-600 dark:text-text-secondary">{stat.title}</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-text-primary">{stat.value}</p>
          </Link>
        ))}
      </div>

      {/* Recent Orders Table */}
      <div className="overflow-hidden bg-white border border-gray-200 rounded-lg dark:bg-dark-card dark:border-dark-border">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-dark-border">
          <h2 className="text-xl font-bold text-gray-900 dark:text-text-primary">Pedidos Recientes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-dark-bg">
              <tr>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-600 uppercase dark:text-text-secondary">
                  ID
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-600 uppercase dark:text-text-secondary">
                  Cliente
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-600 uppercase dark:text-text-secondary">
                  Ubicación
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-600 uppercase dark:text-text-secondary">
                  Items
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-600 uppercase dark:text-text-secondary">
                  Total
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-600 uppercase dark:text-text-secondary">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-dark-border">
              {recentOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="py-6 text-center text-gray-600 dark:text-text-secondary"
                  >
                    No hay pedidos recientes
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-dark-bg">
                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap dark:text-text-secondary">
                      #{order.id}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap dark:text-text-primary">
                      {order.user_name || order.user_email || `User #${order.user}`}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap dark:text-text-primary">
                      {order.delivery_location === 'ardales' ? 'Ardales' : 'Carratraca'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap dark:text-text-secondary">
                      {order.items_count} {order.items_count === 1 ? 'item' : 'items'}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900 whitespace-nowrap dark:text-text-primary">
                      €{parseFloat(order.total_price).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
