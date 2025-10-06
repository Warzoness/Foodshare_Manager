'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import styles from './layout.module.css';

const navigation = [
  { name: 'Dashboard', href: '/seller/dashboard', icon: '📊' },
  { name: 'Cửa hàng', href: '/seller/store', icon: '🏪' },
  { name: 'Cài đặt', href: '/seller/settings', icon: '⚙️' },
];

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  // Check if device is mobile
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Close sidebar when route changes on mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [pathname, isMobile]);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobile && sidebarOpen) {
        const target = event.target as HTMLElement;
        if (!target.closest(`.${styles.mobileSidebar}`) && 
            !target.closest(`.${styles.mobileMenuButton}`)) {
          setSidebarOpen(false);
        }
      }
    };

    if (isMobile) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isMobile, sidebarOpen]);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isMobile && sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobile, sidebarOpen]);

  const handleLogout = async () => {
    await logout();
    setSidebarOpen(false);
  };

  const toggleSidebar = () => {
    console.log('Toggle sidebar clicked, current state:', sidebarOpen);
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <ProtectedRoute requiredRole="seller">
      <div className={styles.container}>
      {/* Desktop Sidebar - Only show on desktop */}
      {!isMobile && (
        <div className={styles.sidebar}>
          <div className={styles.sidebarContent}>
            <div className={styles.sidebarInner}>
              <div className={styles.sidebarHeader}>
                <div className={styles.logoSection}>
                  <div className={styles.logoContainer}>
                    <div className={styles.logoIcon}>
                      <span>FS</span>
                    </div>
                    <h1 className={styles.logoText}>
                      {user?.role?.toLowerCase() === 'admin' ? 'FoodShare Admin' : 'FoodShare Seller'}
                    </h1>
                  </div>
                </div>
                <nav className={styles.navigation}>
                  {user?.role?.toLowerCase() === 'admin' && (
                    <Link
                      href="/admin/dashboard"
                      className={styles.adminLink}
                    >
                      <span className={styles.navIcon}>👨‍💼</span>
                      Quay lại Admin
                    </Link>
                  )}
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
                    <span>{user?.name?.charAt(0) || 'S'}</span>
                  </div>
                  <div>
                    <p className={styles.userName}>{user?.name || 'Seller Account'}</p>
                    <p className={styles.userEmail}>{user?.email || 'seller@foodshare.com'}</p>
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
      )}

      {/* Main content */}
      <div className={styles.mainContent}>
        {/* Top bar */}
        <div className={styles.topBar}>
          <button
            type="button"
            className={styles.mobileMenuButton}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleSidebar();
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleSidebar();
            }}
            aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
            style={{ 
              WebkitTapHighlightColor: 'transparent',
              touchAction: 'manipulation'
            }}
          >
            <span className={styles.srOnly}>{sidebarOpen ? "Close sidebar" : "Open sidebar"}</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {sidebarOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
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
                    <span>{user?.name?.charAt(0) || 'S'}</span>
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
      {sidebarOpen && isMobile && (
        <div className={styles.mobileOverlay}>
          <div className={styles.mobileOverlayBg} onClick={toggleSidebar} />
          <div className={styles.mobileSidebar}>
            {/* Mobile sidebar content - same as desktop */}
            <div className={styles.mobileSidebarContent}>
              <div className={styles.mobileLogoSection}>
                <div className={styles.mobileLogoContainer}>
                  <div className={styles.mobileLogoIcon}>
                    <span>FS</span>
                  </div>
                  <h1 className={styles.mobileLogoText}>
                    {user?.role?.toLowerCase() === 'admin' ? 'FoodShare Admin' : 'FoodShare Seller'}
                  </h1>
                </div>
              </div>
              <nav className={styles.mobileNavigation}>
                {user?.role?.toLowerCase() === 'admin' && (
                  <Link
                    href="/admin/dashboard"
                    className={styles.mobileAdminLink}
                    onClick={toggleSidebar}
                  >
                    <span className={styles.mobileNavIcon}>👨‍💼</span>
                    Quay lại Admin
                  </Link>
                )}
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`${styles.mobileNavItem} ${isActive ? styles.mobileNavItemActive : ''}`}
                      onClick={toggleSidebar}
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
                    <span>{user?.name?.charAt(0) || 'S'}</span>
                  </div>
                  <div>
                    <p className={styles.mobileUserName}>{user?.name || 'Seller Account'}</p>
                    <p className={styles.mobileUserEmail}>{user?.email || 'seller@foodshare.com'}</p>
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