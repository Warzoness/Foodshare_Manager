import styles from './page.module.css';

export default function SellerDashboard() {
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
              <div className={styles.statValue}>12</div>
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
              <div className={styles.statValue}>2,500,000đ</div>
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
              <div className={styles.statValue}>45</div>
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
              <div className={styles.statValue}>3</div>
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
              {[
                { id: 'ORD001', customer: 'Nguyễn Văn A', amount: '150,000đ', status: 'pending' },
                { id: 'ORD002', customer: 'Trần Thị B', amount: '200,000đ', status: 'confirmed' },
                { id: 'ORD003', customer: 'Lê Văn C', amount: '300,000đ', status: 'completed' },
              ].map((order) => (
                <div key={order.id} className={styles.orderItem}>
                  <div className={styles.orderInfo}>
                    <p className={styles.orderId}>{order.id}</p>
                    <p className={styles.orderCustomer}>{order.customer}</p>
                  </div>
                  <div className={styles.orderDetails}>
                    <p className={styles.orderAmount}>{order.amount}</p>
                    <span className={`${styles.orderStatus} ${styles[order.status]}`}>
                      {order.status === 'pending' ? 'Đang chờ' :
                       order.status === 'confirmed' ? 'Xác nhận' : 'Hoàn thành'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.contentCard}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Sản phẩm bán chạy</h3>
          </div>
          <div className={styles.cardContent}>
            <div className={styles.productList}>
              {[
                { name: 'Pizza Margherita', sold: 25, revenue: '1,250,000đ' },
                { name: 'Burger Classic', sold: 18, revenue: '900,000đ' },
                { name: 'Pasta Carbonara', sold: 12, revenue: '600,000đ' },
              ].map((product, index) => (
                <div key={index} className={styles.productItem}>
                  <div className={styles.productInfo}>
                    <p className={styles.productName}>{product.name}</p>
                    <p className={styles.productSold}>Đã bán: {product.sold}</p>
                  </div>
                  <p className={styles.productRevenue}>{product.revenue}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
