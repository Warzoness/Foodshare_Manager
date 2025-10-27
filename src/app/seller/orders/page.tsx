'use client';

import { useState, useMemo, useCallback, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { DatePicker } from '@/components/ui/DatePicker';
import { useSellerShopOrders, useUpdateOrderStatus } from '@/hooks/useApi';
import { ApiOrder } from '@/types';
import styles from './page.module.css';
import sharedStyles from '../shared.module.css';

function OrdersManagementContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const shopId = searchParams.get('shopId');
  
  // API filter states (used for actual API calls)
  const [statusFilter, setStatusFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // UI filter states (temporary, for input fields)
  const [uiStatusFilter, setUiStatusFilter] = useState('');
  const [uiFromDate, setUiFromDate] = useState('');
  const [uiToDate, setUiToDate] = useState('');
  const [uiSortBy, setUiSortBy] = useState('createdAt');
  const [uiSortDirection, setUiSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Track initial load to differentiate from filter refreshes
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Build API parameters theo request body
  const apiParams = useMemo(() => {
    const params: Record<string, unknown> = {
      page: currentPage,
      size: pageSize,
      sortBy,
      sortDirection
    };

    if (shopId) {
      params.shopId = parseInt(shopId);
    }
    if (statusFilter) {
      params.status = statusFilter;
    }
    if (fromDate) {
      // Format for Java LocalDateTime: yyyy-MM-ddTHH:mm:ss (no timezone)
      params.fromDate = `${fromDate}T00:00:00`;
    }
    if (toDate) {
      // Format for Java LocalDateTime: yyyy-MM-ddTHH:mm:ss (no timezone)
      params.toDate = `${toDate}T23:59:59`;
    }

    return params;
  }, [shopId, statusFilter, fromDate, toDate, currentPage, pageSize, sortBy, sortDirection]);

  const { data: ordersResponse, loading, error, execute: refetchOrders } = useSellerShopOrders(apiParams);
  const { execute: updateOrderStatus, loading: updating } = useUpdateOrderStatus();

  // Mark initial load as complete after first data fetch
  useEffect(() => {
    if (ordersResponse && isInitialLoad) {
      setIsInitialLoad(false);
    }
  }, [ordersResponse, isInitialLoad]);

  // Function to apply filters (copy UI state to API state)
  const handleApplyFilters = useCallback(() => {
    setStatusFilter(uiStatusFilter);
    setFromDate(uiFromDate);
    setToDate(uiToDate);
    setSortBy(uiSortBy);
    setSortDirection(uiSortDirection);
    setCurrentPage(0); // Reset to first page when applying filters
  }, [uiStatusFilter, uiFromDate, uiToDate, uiSortBy, uiSortDirection]);

  // Function to clear all filters
  const handleClearFilters = useCallback(() => {
    // Clear API states
    setStatusFilter('');
    setFromDate('');
    setToDate('');
    setSortBy('createdAt');
    setSortDirection('desc');
    setCurrentPage(0);
    
    // Clear UI states
    setUiStatusFilter('');
    setUiFromDate('');
    setUiToDate('');
    setUiSortBy('createdAt');
    setUiSortDirection('desc');
  }, []);

  const orders = ordersResponse?.content || [];
  const pagination = ordersResponse ? {
    page: ordersResponse.page,
    size: ordersResponse.size,
    totalElements: ordersResponse.totalElements,
    totalPages: ordersResponse.totalPages,
    hasNext: ordersResponse.hasNext,
    hasPrevious: ordersResponse.hasPrevious
  } : null;

  // Calculate statistics
  const stats = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter(order => order.status === '1').length;
    const confirmed = orders.filter(order => order.status === '2').length;
    const completed = orders.filter(order => order.status === '4').length;
    const cancelled = orders.filter(order => order.status === '3').length;
    
    return {
      total,
      pending,
      confirmed,
      completed,
      cancelled
    };
  }, [orders]);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    // Xác nhận trước khi thực hiện hành động
    const confirmMessages = {
      '2': 'Bạn có chắc chắn muốn xác nhận đơn hàng này?',
      '3': 'Bạn có chắc chắn muốn hủy đơn hàng này?',
      '4': 'Bạn có chắc chắn đơn hàng đã được hoàn thành?'
    };
    
    const confirmMessage = confirmMessages[newStatus as keyof typeof confirmMessages];
    if (!confirmMessage || !confirm(confirmMessage)) {
      return;
    }

    try {
      const response = await updateOrderStatus(orderId, newStatus);
      
      if (response.success) {
        // Hiển thị thông báo thành công với icon
        const successMessages = {
          '2': '✅ Đơn hàng đã được xác nhận!',
          '3': '❌ Đơn hàng đã được hủy!',
          '4': '🎉 Đơn hàng đã hoàn thành!'
        };
        alert(successMessages[newStatus as keyof typeof successMessages] || 'Cập nhật trạng thái đơn hàng thành công!');
        refetchOrders();
      } else {
        const errorMessage = response.error || 'Không thể cập nhật trạng thái';
        alert(`❌ Lỗi: ${errorMessage}`);
      }
    } catch (_error) {
      alert('❌ Có lỗi xảy ra khi cập nhật trạng thái đơn hàng');
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case '1':
        return { text: 'Đang chờ', color: '#ffffff', bgColor: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' };
      case '2':
        return { text: 'Đã xác nhận', color: '#ffffff', bgColor: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' };
      case '3':
        return { text: 'Đã hủy', color: '#ffffff', bgColor: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' };
      case '4':
        return { text: 'Hoàn thành', color: '#ffffff', bgColor: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' };
      default:
        return { text: 'Đang chờ', color: '#ffffff', bgColor: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' };
    }
  };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  if (loading && isInitialLoad) {
    return (
      <div className={sharedStyles.pageContainer}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Đang tải danh sách đơn hàng...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={sharedStyles.pageContainer}>
        <div className={styles.errorContainer}>
          <p className={styles.errorMessage}>
            Lỗi: {error.includes('500') ? 'Lỗi máy chủ - Vui lòng thử lại sau' : error}
          </p>
          <Button variant="primary" onClick={() => refetchOrders()}>
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={sharedStyles.pageContainer}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <Button 
            variant="secondary" 
            size="sm"
            onClick={() => router.push('/seller/store')}
            className={styles.backButton}
          >
            ← Quay lại
          </Button>
          <div className={styles.titleSection}>
            <h1 className={styles.title}>
              {shopId ? `Đơn hàng - Cửa hàng ${shopId}` : 'Quản lý đơn hàng'}
            </h1>
            <p className={styles.subtitle}>
              {pagination ? `${pagination.totalElements} đơn hàng` : 'Theo dõi đơn hàng từ khách hàng'}
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Dashboard */}
      <div className={styles.statsSection}>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="8.5" cy="7" r="4"></circle>
                <path d="M20 8v6"></path>
                <path d="M23 11h-6"></path>
              </svg>
            </div>
            <div className={styles.statInfo}>
              <h3>Tổng đơn hàng</h3>
              <div className={styles.statNumber}>{stats.total}</div>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12,6 12,12 16,14"></polyline>
              </svg>
            </div>
            <div className={styles.statInfo}>
              <h3>Đang chờ</h3>
              <div className={styles.statNumber}>{stats.pending}</div>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 12l2 2 4-4"></path>
                <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"></path>
                <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"></path>
                <path d="M12 3c0 1-1 3-3 3s-3-2-3-3 1-3 3-3 3 2 3 3"></path>
                <path d="M12 21c0-1 1-3 3-3s3 2 3 3-1 3-3 3-3-2-3-3"></path>
              </svg>
            </div>
            <div className={styles.statInfo}>
              <h3>Đã xác nhận</h3>
              <div className={styles.statNumber}>{stats.confirmed}</div>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22,4 12,14.01 9,11.01"></polyline>
              </svg>
            </div>
            <div className={styles.statInfo}>
              <h3>Hoàn thành</h3>
              <div className={styles.statNumber}>{stats.completed}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Filter */}
      <div className={styles.filterSection}>
        {/* Mobile Filter Bar */}
        <div className={styles.mobileFilterBar}>
          <button
            type="button"
            onClick={() => setShowFilterModal(true)}
            className={styles.mobileFilterIconButton}
            aria-label="Mở bộ lọc"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
            </svg>
            <span>Bộ lọc</span>
          </button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleApplyFilters}
            className={styles.mobileSearchButton}
          >
            🔍 Tìm kiếm
          </Button>
        </div>
        
        {/* Desktop Filter Form */}
        <form 
          className={styles.desktopFiltersForm}
          onSubmit={(e) => {
            e.preventDefault();
            handleApplyFilters();
          }}
        >
          <div className={styles.filterContainer}>
          <div className={styles.filterRow}>
            <div className={styles.filterGroup}>
              <Select
                label="Trạng thái"
                value={uiStatusFilter}
                onChange={(value) => setUiStatusFilter(value)}
                placeholder="Tất cả trạng thái"
                options={[
                  { value: '', label: 'Tất cả trạng thái' },
                  { value: '1', label: 'Đang chờ' },
                  { value: '2', label: 'Đã xác nhận' },
                  { value: '3', label: 'Đã hủy' },
                  { value: '4', label: 'Hoàn thành' }
                ]}
              />
            </div>

            <div className={styles.filterGroup}>
              <DatePicker
                label="Từ ngày"
                value={uiFromDate}
                onChange={(value) => setUiFromDate(value)}
                placeholder="Chọn ngày bắt đầu"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleApplyFilters();
                  }
                }}
              />
            </div>

            <div className={styles.filterGroup}>
              <DatePicker
                label="Đến ngày"
                value={uiToDate}
                onChange={(value) => setUiToDate(value)}
                placeholder="Chọn ngày kết thúc"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleApplyFilters();
                  }
                }}
              />
            </div>

            <div className={styles.filterGroup}>
              <Select
                label="Sắp xếp theo"
                value={uiSortBy}
                onChange={(value) => setUiSortBy(value)}
                options={[
                  { value: 'createdAt', label: 'Ngày tạo' },
                  { value: 'pickupTime', label: 'Thời gian nhận' },
                  { value: 'totalPrice', label: 'Tổng tiền' },
                  { value: 'status', label: 'Trạng thái' }
                ]}
              />
            </div>

            <div className={styles.filterGroup}>
              <Select
                label="Thứ tự"
                value={uiSortDirection}
                onChange={(value) => setUiSortDirection(value as 'asc' | 'desc')}
                options={[
                  { value: 'desc', label: 'Giảm dần' },
                  { value: 'asc', label: 'Tăng dần' }
                ]}
              />
            </div>
          </div>

          <div className={styles.filterActions}>
            <Button 
              type="submit"
              variant="primary" 
              size="md"
            >
              🔍 Lọc
            </Button>
            <Button 
              variant="outline" 
              size="md"
              onClick={handleClearFilters}
              type="button"
            >
              🗑️ Xóa bộ lọc
            </Button>
            {loading && (
              <div className={styles.filterLoadingIndicator}>
                <div className={styles.miniSpinner}></div>
                <span>Đang tải...</span>
              </div>
            )}
          </div>
          </div>
        </form>
      </div>

      {/* Mobile Filter Modal */}
      {showFilterModal && (
        <div className={styles.modalOverlay} onClick={() => setShowFilterModal(false)}>
          <div className={styles.filterModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.filterModalHeader}>
              <h3>Bộ lọc nâng cao</h3>
              <button
                type="button"
                onClick={() => setShowFilterModal(false)}
                className={styles.filterModalClose}
              >
                ×
              </button>
            </div>
            
            <div className={styles.filterModalBody}>
              <div className={styles.filterModalGroup}>
                <Select
                  label="Trạng thái"
                  value={uiStatusFilter}
                  onChange={(value) => setUiStatusFilter(value)}
                  placeholder="Tất cả trạng thái"
                  options={[
                    { value: '', label: 'Tất cả trạng thái' },
                    { value: '1', label: 'Đang chờ' },
                    { value: '2', label: 'Đã xác nhận' },
                    { value: '3', label: 'Đã hủy' },
                    { value: '4', label: 'Hoàn thành' }
                  ]}
                />
              </div>
              
              <div className={styles.filterModalGroup}>
                <DatePicker
                  label="Từ ngày"
                  value={uiFromDate}
                  onChange={(value) => setUiFromDate(value)}
                  placeholder="Chọn ngày bắt đầu"
                />
              </div>
              
              <div className={styles.filterModalGroup}>
                <DatePicker
                  label="Đến ngày"
                  value={uiToDate}
                  onChange={(value) => setUiToDate(value)}
                  placeholder="Chọn ngày kết thúc"
                />
              </div>
              
              <div className={styles.filterModalGroup}>
                <Select
                  label="Sắp xếp theo"
                  value={uiSortBy}
                  onChange={(value) => setUiSortBy(value)}
                  options={[
                    { value: 'createdAt', label: 'Ngày tạo' },
                    { value: 'pickupTime', label: 'Thời gian nhận' },
                    { value: 'totalPrice', label: 'Tổng tiền' },
                    { value: 'status', label: 'Trạng thái' }
                  ]}
                />
              </div>
              
              <div className={styles.filterModalGroup}>
                <Select
                  label="Thứ tự"
                  value={uiSortDirection}
                  onChange={(value) => setUiSortDirection(value as 'asc' | 'desc')}
                  options={[
                    { value: 'desc', label: 'Giảm dần' },
                    { value: 'asc', label: 'Tăng dần' }
                  ]}
                />
              </div>
            </div>
            
            <div className={styles.filterModalFooter}>
              <Button
                variant="outline"
                size="md"
                onClick={() => {
                  handleClearFilters();
                  setShowFilterModal(false);
                }}
              >
                Xóa bộ lọc
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  handleApplyFilters();
                  setShowFilterModal(false);
                }}
              >
                Xác nhận
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Orders Table */}
      <div className={styles.ordersContainer} style={{ position: 'relative' }}>
        {loading && !isInitialLoad && (
          <div className={styles.filterLoadingOverlay}>
            <div className={styles.loadingSpinner}></div>
            <p>Đang tải kết quả...</p>
          </div>
        )}
        {orders.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📦</div>
            <h3>Chưa có đơn hàng</h3>
            <p>
              {shopId 
                ? `Các đơn hàng cho cửa hàng ${shopId} sẽ xuất hiện ở đây`
                : 'Các đơn hàng từ khách hàng sẽ xuất hiện ở đây'
              }
            </p>
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.ordersTable}>
                <thead>
                  <tr>
                    <th className={styles.hideOnMobile}>Mã đơn</th>
                    <th>Sản phẩm</th>
                    <th className={styles.hideOnMobile}>Khách hàng</th>
                    <th className={styles.hideOnMobile}>Trạng thái</th>
                    <th className={styles.hideOnMobile}>Thời gian nhận</th>
                    <th className={styles.hideOnMobile}>Tổng tiền</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
              <tbody>
                {orders.map((order: ApiOrder) => {
                  const statusInfo = getStatusInfo(order.status);
                  return (
                    <tr key={order.id} className={styles.tableRow}>
                      <td className={`${styles.orderIdCell} ${styles.hideOnMobile}`}>
                        <span className={styles.orderId}>#{order.id}</span>
                      </td>
                      <td className={styles.productCell}>
                        <div className={styles.productInfo}>
                          <Image 
                            src={order.productImage || '/images/image.png'} 
                            alt={order.productName || 'Sản phẩm'}
                            width={40}
                            height={40}
                            className={styles.productImage}
                          />
                            <div className={styles.productDetails}>
                              <div className={styles.productName}>
                                {order.productName || 'Không có tên'}
                              </div>
                              <div className={styles.productQuantity}>
                                SL: {order.quantity}
                              </div>
                              {/* Mobile-only info */}
                              <div className={styles.mobileOnlyInfo}>
                                <div className={styles.mobileStatus}>
                                  <span 
                                    className={styles.mobileStatusBadge}
                                    style={{ 
                                      color: statusInfo.color, 
                                      background: statusInfo.bgColor 
                                    }}
                                  >
                                    {statusInfo.text}
                                  </span>
                                </div>
                                <div className={styles.mobileCustomerInfo}>
                                  👤 {order.customerName} | 📞 {order.customerPhone}
                                </div>
                                <div className={styles.mobileDateInfo}>
                                  📅 {formatDate(order.pickupTime)}
                                </div>
                                <div className={styles.mobileTotalPrice}>
                                  💰 {formatPrice(order.totalPrice)}
                                </div>
                              </div>
                            </div>
                        </div>
                      </td>
                      <td className={`${styles.customerCell} ${styles.hideOnMobile}`}>
                        <div className={styles.customerInfo}>
                          <div className={styles.customerName}>{order.customerName}</div>
                          <div className={styles.customerPhone}>📞 {order.customerPhone}</div>
                        </div>
                      </td>
                      <td className={`${styles.statusCell} ${styles.hideOnMobile}`}>
                        <span 
                          className={styles.statusBadge}
                          style={{ 
                            color: statusInfo.color, 
                            background: statusInfo.bgColor 
                          }}
                        >
                          {statusInfo.text}
                        </span>
                      </td>
                      <td className={`${styles.dateCell} ${styles.hideOnMobile}`}>
                        <span className={styles.orderDate}>{formatDate(order.pickupTime)}</span>
                      </td>
                      <td className={`${styles.totalCell} ${styles.hideOnMobile}`}>
                        <span className={styles.totalPrice}>{formatPrice(order.totalPrice)}</span>
                      </td>
                      <td className={styles.actionsCell}>
                        <div className={styles.orderActions}>
                          {order.status === '1' && (
                            <div className={styles.actionButtons}>
                              <Button 
                                variant="success" 
                                size="sm" 
                                onClick={() => handleUpdateStatus(order.id.toString(), '2')}
                                disabled={updating}
                                loading={updating}
                              >
                                ✅ Xác nhận
                              </Button>
                              <Button 
                                variant="danger" 
                                size="sm" 
                                onClick={() => handleUpdateStatus(order.id.toString(), '3')}
                                disabled={updating}
                                loading={updating}
                              >
                                ❌ Hủy đơn
                              </Button>
                            </div>
                          )}
                          {order.status === '2' && (
                            <div className={styles.actionButtons}>
                              <Button 
                                variant="primary" 
                                size="sm" 
                                onClick={() => handleUpdateStatus(order.id.toString(), '4')}
                                disabled={updating}
                                loading={updating}
                              >
                                🎉 Hoàn thành
                              </Button>
                              <Button 
                                variant="danger" 
                                size="sm" 
                                onClick={() => handleUpdateStatus(order.id.toString(), '3')}
                                disabled={updating}
                                loading={updating}
                              >
                                ❌ Hủy đơn
                              </Button>
                            </div>
                          )}
                          {(order.status === '3' || order.status === '4') && (
                            <div className={styles.finalStatus}>
                              <span className={styles.finalStatusText}>
                                {order.status === '3' ? 'Đã hủy' : 'Hoàn thành'}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Advanced Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className={styles.pagination}>
          <div className={styles.paginationInfo}>
            <div className={styles.pageSizeSelector}>
              <label className={styles.pageSizeLabel}>Hiển thị:</label>
              <Select
                value={pageSize.toString()}
                onChange={(value) => setPageSize(parseInt(value))}
                size="sm"
                options={[
                  { value: '10', label: '10' },
                  { value: '20', label: '20' },
                  { value: '50', label: '50' },
                  { value: '100', label: '100' }
                ]}
              />
              <span className={styles.pageSizeText}>đơn hàng/trang</span>
            </div>
            <div className={styles.pageInfo}>
              Trang {pagination.page + 1} / {pagination.totalPages} 
              ({pagination.totalElements} đơn hàng)
            </div>
          </div>
          
          <div className={styles.paginationControls}>
            <Button 
              variant="outline" 
              size="md"
              onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
              disabled={!pagination.hasPrevious}
            >
              ← Trước
            </Button>
            
            <div className={styles.pageNumbers}>
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const pageNum = Math.max(0, Math.min(pagination.totalPages - 1, currentPage - 2 + i));
                return (
                  <Button
                    key={pageNum}
                    variant={pageNum === currentPage ? "primary" : "secondary"}
                    onClick={() => setCurrentPage(pageNum)}
                    className={styles.pageNumber}
                  >
                    {pageNum + 1}
                  </Button>
                );
              })}
            </div>
            
            <Button 
              variant="outline" 
              size="md"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={!pagination.hasNext}
            >
              Sau →
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrdersManagement() {
  return (
    <Suspense fallback={
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Đang tải...</p>
        </div>
      </div>
    }>
      <OrdersManagementContent />
    </Suspense>
  );
}