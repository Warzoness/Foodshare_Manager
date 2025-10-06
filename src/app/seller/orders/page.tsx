'use client';

import { useState, useMemo, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useSellerShopOrders, useUpdateOrderStatus } from '@/hooks/useApi';
import { ApiOrder } from '@/types';
import styles from './page.module.css';
import sharedStyles from '../shared.module.css';

export default function OrdersManagement() {
  const searchParams = useSearchParams();
  const shopId = searchParams.get('shopId');
  const [statusFilter, setStatusFilter] = useState(''); // Default status is empty string (all orders)
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(20);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');


  // Build API parameters
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
      params.fromDate = new Date(fromDate).toISOString();
    }
    if (toDate) {
      params.toDate = new Date(toDate).toISOString();
    }

    console.log('📊 API Params updated:', params);
    return params;
  }, [shopId, statusFilter, fromDate, toDate, currentPage, pageSize, sortBy, sortDirection]);

  const { data: ordersResponse, loading, error, execute: refetchOrders } = useSellerShopOrders(apiParams);
  const { execute: updateOrderStatus, loading: updating } = useUpdateOrderStatus();

  // Function to handle filter button click
  const handleFilter = useCallback(() => {
    console.log('🔍 Filter button clicked - triggering search');
    setCurrentPage(0); // Reset to first page
    refetchOrders(); // Trigger API call
  }, [refetchOrders]);

  const orders = ordersResponse?.content || [];
  const pagination = ordersResponse ? {
    page: ordersResponse.page,
    size: ordersResponse.size,
    totalElements: ordersResponse.totalElements,
    totalPages: ordersResponse.totalPages,
    hasNext: ordersResponse.hasNext,
    hasPrevious: ordersResponse.hasPrevious
  } : null;
  
  // Handle case where API returns empty data or no data
  const hasOrders = orders && orders.length > 0;

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await updateOrderStatus(orderId, newStatus);
      if (response.success) {
        alert('Cập nhật trạng thái đơn hàng thành công!');
        refetchOrders();
      } else {
        const errorMessage = response.error || 'Không thể cập nhật trạng thái';
        if (errorMessage.includes('500')) {
          alert('Lỗi máy chủ - Vui lòng thử lại sau');
        } else {
          alert(`Lỗi: ${errorMessage}`);
        }
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Có lỗi xảy ra khi cập nhật trạng thái đơn hàng');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case '1':
        return styles.pending;
      case '2':
        return styles.confirmed;
      case '3':
        return styles.cancelled;
      case '4':
        return styles.completed;
      case 'pending':
        return styles.pending;
      case 'confirmed':
        return styles.confirmed;
      case 'cancelled':
        return styles.cancelled;
      case 'completed':
        return styles.completed;
      default:
        return styles.pending;
    }
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

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className={sharedStyles.pageContainer}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Đang tải danh sách đơn hàng...</p>
        </div>
      </div>
    );
  }

  // Handle successful response with no orders
  if (!loading && !error && !hasOrders) {
    return (
      <div className={sharedStyles.pageContainer}>
        <div className={sharedStyles.pageHeader}>
          <h1 className={sharedStyles.pageTitle}>Quản lý đơn hàng</h1>
          <p className={sharedStyles.pageSubtitle}>
            Theo dõi và xử lý đơn hàng từ khách hàng
          </p>
        </div>

        <div className={styles.filters}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Trạng thái</label>
            <select 
              className={styles.filterSelect}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="1">Đang chờ</option>
              <option value="2">Xác nhận</option>
              <option value="3">Hủy</option>
              <option value="4">Hoàn thành</option>
            </select>
          </div>
          
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Từ ngày</label>
            <input
              type="date"
              className={styles.dateInput}
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Đến ngày</label>
            <input
              type="date"
              className={styles.dateInput}
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Sắp xếp theo</label>
            <select 
              className={styles.filterSelect}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="createdAt">Ngày tạo</option>
              <option value="pickupTime">Thời gian nhận</option>
              <option value="totalPrice">Tổng tiền</option>
              <option value="status">Trạng thái</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Thứ tự</label>
            <select 
              className={styles.filterSelect}
              value={sortDirection}
              onChange={(e) => setSortDirection(e.target.value as 'asc' | 'desc')}
            >
              <option value="desc">Giảm dần</option>
              <option value="asc">Tăng dần</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <button 
              className={`${styles.filterButton} ${loading ? styles.loading : ''}`}
              onClick={handleFilter}
              disabled={loading}
            >
              {loading ? 'Đang lọc...' : '🔍 Lọc'}
            </button>
          </div>
        </div>

        <div className={`${styles.ordersList} ${loading ? styles.loading : ''}`}>
          {loading && (
            <div className={styles.loadingOverlay}>
              <div className={styles.loadingSpinner}></div>
              <div className={styles.loadingText}>Đang tải dữ liệu...</div>
            </div>
          )}
          <div className={styles.emptyState}>
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
              <h3 style={{ marginBottom: '8px', color: '#64748b' }}>
                {shopId ? `Chưa có đơn hàng nào cho cửa hàng ${shopId}` : 'Chưa có đơn hàng nào được đặt'}
              </h3>
              <p style={{ color: '#94a3b8', marginBottom: '0' }}>
                {shopId ? 'Các đơn hàng cho cửa hàng này sẽ xuất hiện ở đây' : 'Các đơn hàng từ khách hàng sẽ xuất hiện ở đây'}
              </p>
            </div>
          </div>
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
      <div className={sharedStyles.pageHeader}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => window.location.href = '/seller/store'}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '4px',
                minHeight: '40px',
                padding: '0.5rem 1rem',
                fontSize: '0.875rem',
                fontWeight: '600'
              }}
            >
              ← Quay lại
            </Button>
          </div>
          <h1 className={sharedStyles.pageTitle}>
            {shopId ? `Quản lý đơn hàng - Cửa hàng ${shopId}` : 'Quản lý đơn hàng'}
          </h1>
          <p className={sharedStyles.pageSubtitle}>
            {shopId ? `Theo dõi và xử lý đơn hàng cho cửa hàng ${shopId}` : 'Theo dõi và xử lý đơn hàng từ khách hàng'}
          </p>
        </div>
      </div>

      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Trạng thái</label>
          <select 
            className={styles.filterSelect}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="1">Đang chờ</option>
            <option value="2">Xác nhận</option>
            <option value="3">Hủy</option>
            <option value="4">Hoàn thành</option>
          </select>
        </div>
        
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Từ ngày</label>
          <input
            type="date"
            className={styles.dateInput}
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Đến ngày</label>
            <input
              type="date"
              className={styles.dateInput}
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Sắp xếp theo</label>
            <select 
              className={styles.filterSelect}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="createdAt">Ngày tạo</option>
              <option value="pickupTime">Thời gian nhận</option>
              <option value="totalPrice">Tổng tiền</option>
              <option value="status">Trạng thái</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Thứ tự</label>
            <select 
              className={styles.filterSelect}
              value={sortDirection}
              onChange={(e) => setSortDirection(e.target.value as 'asc' | 'desc')}
            >
              <option value="desc">Giảm dần</option>
              <option value="asc">Tăng dần</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <button 
              className={`${styles.filterButton} ${loading ? styles.loading : ''}`}
              onClick={handleFilter}
              disabled={loading}
            >
              {loading ? 'Đang lọc...' : '🔍 Lọc'}
            </button>
          </div>
      </div>

      <div className={`${styles.ordersList} ${loading ? styles.loading : ''}`}>
        {loading && (
          <div className={styles.loadingOverlay}>
            <div className={styles.loadingSpinner}></div>
            <div className={styles.loadingText}>Đang tải dữ liệu...</div>
          </div>
        )}
        {!hasOrders ? (
          <div className={styles.emptyState}>
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
              <h3 style={{ marginBottom: '8px', color: '#64748b' }}>
                {shopId ? `Chưa có đơn hàng nào cho cửa hàng ${shopId}` : 'Chưa có đơn hàng nào được đặt'}
              </h3>
              <p style={{ color: '#94a3b8', marginBottom: '0' }}>
                {shopId ? 'Các đơn hàng cho cửa hàng này sẽ xuất hiện ở đây' : 'Các đơn hàng từ khách hàng sẽ xuất hiện ở đây'}
              </p>
            </div>
          </div>
        ) : (
          orders.map((order: ApiOrder) => (
            <Card key={order.id} className={styles.orderCard}>
              <div className={styles.orderHeader}>
                <div className={styles.orderInfo}>
                  <h3 className={styles.orderId}>#{order.id}</h3>
                  <p className={styles.customerName}>{order.customerName}</p>
                  <p className={styles.customerPhone}>📞 {order.customerPhone}</p>
                  <p className={styles.customerEmail}>📧 {order.customerEmail}</p>
                </div>
                
                <div className={styles.orderStatus}>
                  <span className={`${styles.statusBadge} ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                  <p className={styles.orderDate}>{formatDate(order.pickupTime)}</p>
                </div>
              </div>

              <div className={styles.orderFooter}>
                <div className={styles.totalAmount}>
                  <div className={styles.totalRow}>
                    <span className={styles.totalLabel}>Tổng cộng:</span>
                    <span className={styles.totalValue}>₫{order.totalPrice.toLocaleString('vi-VN')}</span>
                  </div>
                </div>
                
                <div className={styles.orderActions}>
                  {order.status === '1' && (
                    <>
                      <Button 
                        variant="primary" 
                        size="sm" 
                        className={`${styles.actionButton} ${styles.confirmButton}`}
                        onClick={() => handleUpdateStatus(order.id.toString(), '2')}
                        disabled={updating}
                      >
                        {updating ? 'Đang xử lý...' : '✅ Xác nhận'}
                      </Button>
                      <Button 
                        variant="danger" 
                        size="sm" 
                        className={`${styles.actionButton} ${styles.cancelButton}`}
                        onClick={() => handleUpdateStatus(order.id.toString(), '3')}
                        disabled={updating}
                      >
                        {updating ? 'Đang xử lý...' : '❌ Hủy đơn'}
                      </Button>
                    </>
                  )}
                  {order.status === '2' && (
                    <>
                      <Button 
                        variant="success" 
                        size="sm" 
                        className={`${styles.actionButton} ${styles.completeButton}`}
                        onClick={() => handleUpdateStatus(order.id.toString(), '4')}
                        disabled={updating}
                      >
                        {updating ? 'Đang xử lý...' : '✅ Xác nhận đã lấy hàng'}
                      </Button>
                      <Button 
                        variant="danger" 
                        size="sm" 
                        className={`${styles.actionButton} ${styles.cancelButton}`}
                        onClick={() => handleUpdateStatus(order.id.toString(), '3')}
                        disabled={updating}
                      >
                        {updating ? 'Đang xử lý...' : '❌ Hủy đơn'}
                      </Button>
                    </>
                  )}
                  {order.status === '3' && (
                    <div className={styles.cancelledStatus}>
                      <span className={styles.cancelledText}>Đơn hàng đã bị hủy</span>
                    </div>
                  )}
                  {order.status === '4' && (
                    <div className={styles.completedStatus}>
                      <span className={styles.completedText}>Đơn hàng đã hoàn thành</span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className={styles.pagination}>
          <Button 
            variant="secondary" 
            className={styles.pageButton}
            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
            disabled={!pagination.hasPrevious}
          >
            Trước
          </Button>
          <div className={styles.pageNumbers}>
            <span className={`${styles.pageNumber} ${currentPage === pagination.page ? styles.active : ''}`}>
              {pagination.page + 1}
            </span>
            <span className={styles.pageInfo}>
              / {pagination.totalPages} trang ({pagination.totalElements} đơn hàng)
            </span>
          </div>
          <Button 
            variant="secondary" 
            className={styles.pageButton}
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={!pagination.hasNext}
          >
            Sau
          </Button>
        </div>
      )}
    </div>
  );
}