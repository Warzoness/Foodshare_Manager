import styles from './page.module.css';

export default function AdminDashboard() {
  return (
    <div className={styles.adminContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>Dashboard Admin</h1>
        <p className={styles.subtitle}>
          Tổng quan về hệ thống và các cửa hàng
        </p>
      </div>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statContent}>
            <div className={`${styles.statIcon} ${styles.blue}`}>
              <span>🏪</span>
            </div>
            <div className={styles.statInfo}>
              <div className={styles.statLabel}>
                Tổng số cửa hàng
              </div>
              <div className={styles.statValue}>24</div>
            </div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statContent}>
            <div className={`${styles.statIcon} ${styles.green}`}>
              <span>✅</span>
            </div>
            <div className={styles.statInfo}>
              <div className={styles.statLabel}>
                Cửa hàng hoạt động
              </div>
              <div className={styles.statValue}>18</div>
            </div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statContent}>
            <div className={`${styles.statIcon} ${styles.yellow}`}>
              <span>👥</span>
            </div>
            <div className={styles.statInfo}>
              <div className={styles.statLabel}>
                Tổng số seller
              </div>
              <div className={styles.statValue}>22</div>
            </div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statContent}>
            <div className={`${styles.statIcon} ${styles.purple}`}>
              <span>💰</span>
            </div>
            <div className={styles.statInfo}>
              <div className={styles.statLabel}>
                Doanh thu tháng
              </div>
              <div className={styles.statValue}>125Mđ</div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Tables */}
      <div className={styles.chartsGrid}>
        <div className={styles.chartCard}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Doanh thu theo tháng</h3>
          </div>
          <div className={styles.cardContent}>
            <div className={styles.chartPlaceholder}>
              <p>Biểu đồ doanh thu sẽ được hiển thị ở đây</p>
            </div>
          </div>
        </div>

        <div className={styles.chartCard}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Top cửa hàng bán chạy</h3>
          </div>
          <div className={styles.cardContent}>
            <div className={styles.topStoresList}>
              {[
                { name: 'Pizza House Q1', revenue: '15,500,000đ', orders: 156 },
                { name: 'Burger King Q3', revenue: '12,300,000đ', orders: 128 },
                { name: 'Pasta Corner Q7', revenue: '10,800,000đ', orders: 95 },
              ].map((store, index) => (
                <div key={index} className={styles.storeItem}>
                  <div className={styles.storeInfo}>
                    <p className={styles.storeName}>{store.name}</p>
                    <p className={styles.storeOrders}>{store.orders} đơn hàng</p>
                  </div>
                  <p className={styles.storeRevenue}>{store.revenue}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className={styles.activitiesGrid}>
        <div className={styles.chartCard}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Hoạt động gần đây</h3>
          </div>
          <div className={styles.cardContent}>
            <div className={styles.activityList}>
              {[
                { action: 'Cửa hàng mới đăng ký', store: 'Coffee Shop Q2', time: '2 giờ trước' },
                { action: 'Đơn hàng mới', store: 'Pizza House Q1', time: '3 giờ trước' },
                { action: 'Cập nhật sản phẩm', store: 'Burger King Q3', time: '5 giờ trước' },
                { action: 'Báo cáo doanh thu', store: 'Pasta Corner Q7', time: '1 ngày trước' },
              ].map((activity, index) => (
                <div key={index} className={styles.activityItem}>
                  <div className={styles.activityDot}></div>
                  <div className={styles.activityContent}>
                    <p className={styles.activityAction}>{activity.action}</p>
                    <p className={styles.activityStore}>{activity.store}</p>
                  </div>
                  <div className={styles.activityTime}>{activity.time}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.chartCard}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Cửa hàng cần chú ý</h3>
          </div>
          <div className={styles.cardContent}>
            <div className={styles.attentionList}>
              {[
                { name: 'Fast Food Q4', issue: 'Chưa có đơn hàng trong 3 ngày', status: 'warning' },
                { name: 'Coffee Shop Q6', issue: 'Cần cập nhật menu', status: 'info' },
                { name: 'Pizza Place Q8', issue: 'Đánh giá thấp', status: 'danger' },
              ].map((store, index) => (
                <div key={index} className={styles.attentionItem}>
                  <div className={styles.attentionInfo}>
                    <p className={styles.attentionStore}>{store.name}</p>
                    <p className={styles.attentionIssue}>{store.issue}</p>
                  </div>
                  <span className={`${styles.attentionBadge} ${styles[store.status]}`}>
                    {store.status === 'warning' ? 'Cảnh báo' :
                     store.status === 'info' ? 'Thông tin' : 'Quan trọng'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
