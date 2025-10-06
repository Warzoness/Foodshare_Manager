import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <div className={styles.hero}>
          <h1 className={styles.title}>
            Trang Quản Trị FoodShare  
          </h1>
          <p className={styles.subtitle}>
            Hệ thống quản lý cửa hàng thực phẩm chuyên nghiệp
          </p>
          <p className={styles.description}>
            Quản lý cửa hàng, sản phẩm và đơn hàng một cách hiệu quả: 
            {/* <span className={styles.highlight}> Seller</span> và <span className={styles.highlight}>Admin</span> */}
          </p>
        </div>

        <div className={styles.features}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🏪</div>
            <h3 className={styles.featureTitle}>Quản lý cửa hàng</h3>
            <p className={styles.featureDescription}>
              Quản lý thông tin cửa hàng thực phẩm, giờ hoạt động và trạng thái
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🥗</div>
            <h3 className={styles.featureTitle}>Quản lý sản phẩm</h3>
            <p className={styles.featureDescription}>
              Thêm, sửa, xóa sản phẩm thực phẩm và quản lý danh mục
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🛒</div>
            <h3 className={styles.featureTitle}>Quản lý đơn hàng</h3>
            <p className={styles.featureDescription}>
              Xử lý đơn hàng thực phẩm, theo dõi trạng thái và thống kê
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>📈</div>
            <h3 className={styles.featureTitle}>Báo cáo & Thống kê</h3>
            <p className={styles.featureDescription}>
              Xem báo cáo doanh thu, hiệu suất bán hàng và xuất dữ liệu
            </p>
          </div>
        </div>


        <div className={styles.cta}>
          <h2 className={styles.ctaTitle}>Sẵn sàng bắt đầu?</h2>
          <p className={styles.ctaDescription}>
            Đăng nhập ngay để trải nghiệm hệ thống quản lý cửa hàng thực phẩm chuyên nghiệp. 
            Tối ưu hóa doanh thu và phục vụ khách hàng tốt hơn.
          </p>
          <Link href="/login" className={styles.ctaButton}>
            Đăng nhập ngay
          </Link>
        </div>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerSection}>
            <div className={styles.footerBrand}>
              <div className={styles.footerLogo}>
                <span className={styles.logoIcon}>🥗</span>
                <span className={styles.logoText}>FoodShare Manager</span>
              </div>
              <p className={styles.footerDescription}>
                Hệ thống quản lý cửa hàng thực phẩm chuyên nghiệp, giúp bạn tối ưu hóa doanh thu và phục vụ khách hàng tốt hơn.
              </p>
              <div className={styles.socialLinks}>
                <Link href="#" className={styles.socialLink} aria-label="Facebook">
                  <span>📘</span>
                </Link>
                <Link href="#" className={styles.socialLink} aria-label="Twitter">
                  <span>🐦</span>
                </Link>
                <Link href="#" className={styles.socialLink} aria-label="LinkedIn">
                  <span>💼</span>
                </Link>
                <Link href="#" className={styles.socialLink} aria-label="Email">
                  <span>📧</span>
                </Link>
              </div>
            </div>
          </div>
          
          <div className={styles.footerSection}>
            <h4 className={styles.footerTitle}>Tính năng chính</h4>
            <ul className={styles.footerList}>
              <li><Link href="#" className={styles.footerLink}>Quản lý cửa hàng</Link></li>
              <li><Link href="#" className={styles.footerLink}>Quản lý sản phẩm</Link></li>
              <li><Link href="#" className={styles.footerLink}>Xử lý đơn hàng</Link></li>
              <li><Link href="#" className={styles.footerLink}>Báo cáo & Thống kê</Link></li>
              <li><Link href="#" className={styles.footerLink}>Quản lý người dùng</Link></li>
            </ul>
          </div>

          <div className={styles.footerSection}>
            <h4 className={styles.footerTitle}>Hỗ trợ</h4>
            <ul className={styles.footerList}>
              <li><Link href="#" className={styles.footerLink}>Hướng dẫn sử dụng</Link></li>
              <li><Link href="#" className={styles.footerLink}>Tài liệu API</Link></li>
              <li><Link href="#" className={styles.footerLink}>Liên hệ hỗ trợ</Link></li>
              <li><Link href="#" className={styles.footerLink}>FAQ</Link></li>
              <li><Link href="#" className={styles.footerLink}>Trạng thái hệ thống</Link></li>
            </ul>
          </div>

          <div className={styles.footerSection}>
            <h4 className={styles.footerTitle}>Công ty</h4>
            <ul className={styles.footerList}>
              <li><Link href="#" className={styles.footerLink}>Về chúng tôi</Link></li>
              <li><Link href="#" className={styles.footerLink}>Tin tức</Link></li>
              <li><Link href="#" className={styles.footerLink}>Tuyển dụng</Link></li>
              <li><Link href="#" className={styles.footerLink}>Đối tác</Link></li>
              <li><Link href="#" className={styles.footerLink}>Chính sách bảo mật</Link></li>
            </ul>
          </div>
        </div>
        
        <div className={styles.footerBottom}>
          <div className={styles.footerBottomContent}>
            <p className={styles.footerCopyright}>
              © 2024 FoodShare Manager. Tất cả quyền được bảo lưu.
            </p>
            <div className={styles.footerBottomLinks}>
              <Link href="#" className={styles.bottomLink}>Điều khoản sử dụng</Link>
              <span className={styles.separator}>•</span>
              <Link href="#" className={styles.bottomLink}>Chính sách bảo mật</Link>
              <span className={styles.separator}>•</span>
              <Link href="#" className={styles.bottomLink}>Cookie</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
