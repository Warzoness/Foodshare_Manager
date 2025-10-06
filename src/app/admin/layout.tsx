'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import styles from './layout.module.css';

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: '📊' },
  { name: 'Quản lý cửa hàng', href: '/admin/stores', icon: '🏪' },
  { name: 'Danh sách sản phẩm', href: '/admin/products', icon: '🍕' },
  { name: 'Quản lý đơn hàng', href: '/admin/orders', icon: '📦' },
  { name: 'Quản lý người dùng', href: '/admin/users', icon: '👥' },
  { name: 'Báo cáo', href: '/admin/reports', icon: '📈' },
  { name: 'Cài đặt', href: '/admin/settings', icon: '⚙️' },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <ProtectedRoute requiredRole="admin">
      <div className={styles.container}>
      {/* Sidebar */}
      <div className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarContent}>
          <div className={styles.sidebarInner}>
            <div className={styles.sidebarHeader}>
              <div className={styles.logoSection}>
                <div className={styles.logoContainer}>
                  <div className={styles.logoIcon}>
                    <span>FS</span>
                  </div>
                  <h1 className={styles.logoText}>FoodShare Admin</h1>
                </div>
              </div>
              <nav className={styles.navigation}>
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                    >
                      <span className={styles.navIcon}>{item.icon}</span>
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className={styles.userSection}>
              <div className={styles.userInfo}>
                <div className={styles.userAvatar}>
                  <span>{user?.name?.charAt(0) || 'A'}</span>
                </div>
                <div>
                  <p className={styles.userName}>{user?.name || 'Admin Account'}</p>
                  <p className={styles.userEmail}>{user?.email || 'admin@foodshare.com'}</p>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className={styles.logoutButton}
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className={styles.mainContent}>
        {/* Top bar */}
        <div className={styles.topBar}>
          <button
            type="button"
            className={styles.mobileMenuButton}
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className={styles.topBarContent}>
            <div className={styles.searchContainer}>
              <div className={styles.searchWrapper}>
                <div className={styles.searchIcon}>
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  className={styles.searchInput}
                  placeholder="Tìm kiếm..."
                  type="search"
                />
              </div>
            </div>
            <div className={styles.topBarActions}>
              
              <div className="relative">
                <button className={styles.userButton}>
                  <div className={styles.userButtonAvatar}>
                    <span>{user?.name?.charAt(0) || 'A'}</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className={styles.pageContent}>
          <div className={styles.pageContentInner}>
            <div className={styles.pageContentContainer}>
              {children}
            </div>
          </div>
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className={styles.mobileOverlay}>
          <div className={styles.mobileOverlayBg} onClick={() => setSidebarOpen(false)} />
          <div className={styles.mobileSidebar}>
            <div className={styles.mobileCloseButton}>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
              >
                <span className="sr-only">Close sidebar</span>
                <svg className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {/* Mobile sidebar content - same as desktop */}
            <div className={styles.mobileSidebarContent}>
              <div className={styles.mobileLogoSection}>
                <div className={styles.mobileLogoContainer}>
                  <div className={styles.mobileLogoIcon}>
                    <span>FS</span>
                  </div>
                  <h1 className={styles.mobileLogoText}>FoodShare Admin</h1>
                </div>
              </div>
              <nav className={styles.mobileNavigation}>
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`${styles.mobileNavItem} ${isActive ? styles.mobileNavItemActive : ''}`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <span className={styles.mobileNavIcon}>{item.icon}</span>
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
              <div className={styles.mobileUserSection}>
                <div className={styles.mobileUserInfo}>
                  <div className={styles.mobileUserAvatar}>
                    <span>{user?.name?.charAt(0) || 'A'}</span>
                  </div>
                  <div>
                    <p className={styles.mobileUserName}>{user?.name || 'Admin Account'}</p>
                    <p className={styles.mobileUserEmail}>{user?.email || 'admin@foodshare.com'}</p>
                  </div>
                </div>
                <button 
                  onClick={handleLogout}
                  className={styles.mobileLogoutButton}
                >
                  Đăng xuất
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </ProtectedRoute>
  );
}
