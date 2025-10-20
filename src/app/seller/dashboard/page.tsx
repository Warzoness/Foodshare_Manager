'use client';

import { useSellerDashboardStats, useSellerRecentOrders, useSellerTopProducts } from '@/hooks/useApi';
import styles from './page.module.css';

export default function SellerDashboard() {
  const { data: stats, loading: statsLoading } = useSellerDashboardStats();
  const { data: recentOrders, loading: ordersLoading } = useSellerRecentOrders(3);
  const { data: topProducts, loading: productsLoading } = useSellerTopProducts(3);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };


  const getStatusText = (status: string) => {
    switch (status) {
      case '1':
        return 'Đang chờ';
      case '2':
        return 'Xác nhận';
      case '3':
        return 'Hủy';
      case '4':
        return 'Hoàn thành';
      case 'pending':
        return 'Đang chờ';
      case 'confirmed':
        return 'Xác nhận';
      case 'cancelled':
        return 'Hủy';
      case 'completed':
        return 'Hoàn thành';
      default:
        return 'Đang chờ';
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case '1':
      case 'pending':
        return styles.pending;
      case '2':
      case 'confirmed':
        return styles.confirmed;
      case '3':
      case 'cancelled':
        return styles.cancelled;
      case '4':
      case 'completed':
        return styles.completed;
      default:
        return styles.pending;
    }
  };

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>Dashboard</h1>
        <p className={styles.subtitle}>
          Tổng quan về cửa hàng và hoạt động kinh doanh
        </p>
      </div>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statContent}>
            <div className={`${styles.statIcon} ${styles.blue}`}>
              <span>📦</span>
            </div>
            <div className={styles.statInfo}>
              <div className={styles.statLabel}>
                Đơn hàng hôm nay
              </div>
              <div className={styles.statValue}>
                {statsLoading ? '...' : (stats?.todayOrders || 0)}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statContent}>
            <div className={`${styles.statIcon} ${styles.green}`}>
              <span>💰</span>
            </div>
            <div className={styles.statInfo}>
              <div className={styles.statLabel}>
                Doanh thu hôm nay
              </div>
              <div className={styles.statValue}>
                {statsLoading ? '...' : formatCurrency(stats?.todayRevenue || 0)}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statContent}>
            <div className={`${styles.statIcon} ${styles.yellow}`}>
              <span>🍕</span>
            </div>
            <div className={styles.statInfo}>
              <div className={styles.statLabel}>
                Sản phẩm đang bán
              </div>
              <div className={styles.statValue}>
                {statsLoading ? '...' : (stats?.activeProducts || 0)}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statContent}>
            <div className={`${styles.statIcon} ${styles.red}`}>
              <span>⏰</span>
            </div>
            <div className={styles.statInfo}>
              <div className={styles.statLabel}>
                Đơn chờ xử lý
              </div>
              <div className={styles.statValue}>
                {statsLoading ? '...' : (stats?.pendingOrders || 0)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className={styles.contentGrid}>
        <div className={styles.contentCard}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Đơn hàng gần đây</h3>
          </div>
          <div className={styles.cardContent}>
            <div className={styles.orderList}>
              {ordersLoading ? (
                <div className={styles.loadingText}>Đang tải...</div>
              ) : recentOrders && recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <div key={order.id} className={styles.orderItem}>
                    <div className={styles.orderInfo}>
                      <p className={styles.orderId}>#{order.id}</p>
                      <p className={styles.orderCustomer}>{order.customerName}</p>
                    </div>
                    <div className={styles.orderDetails}>
                      <p className={styles.orderAmount}>{formatCurrency(order.amount)}</p>
                      <span className={`${styles.orderStatus} ${getStatusClass(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.emptyState}>
                  <p>Chưa có đơn hàng nào</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={styles.contentCard}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Sản phẩm bán chạy</h3>
          </div>
          <div className={styles.cardContent}>
            <div className={styles.productList}>
              {productsLoading ? (
                <div className={styles.loadingText}>Đang tải...</div>
              ) : topProducts && topProducts.length > 0 ? (
                topProducts.map((product) => (
                  <div key={product.id} className={styles.productItem}>
                    <div className={styles.productInfo}>
                      <p className={styles.productName}>{product.name}</p>
                      <p className={styles.productSold}>Đã bán: {product.sold}</p>
                    </div>
                    <p className={styles.productRevenue}>{formatCurrency(product.revenue)}</p>
                  </div>
                ))
              ) : (
                <div className={styles.emptyState}>
                  <p>Chưa có dữ liệu sản phẩm</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
