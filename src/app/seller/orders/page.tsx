'use client';

import { useState, useMemo, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { useSellerShopOrders, useUpdateOrderStatus } from '@/hooks/useApi';
import { ApiOrder } from '@/types';
import styles from './page.module.css';
import sharedStyles from '../shared.module.css';

export default function OrdersManagement() {
  const searchParams = useSearchParams();
  const shopId = searchParams.get('shopId');
  const [statusFilter, setStatusFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

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
      params.fromDate = new Date(fromDate).toISOString();
    }
    if (toDate) {
      params.toDate = new Date(toDate).toISOString();
    }

    return params;
  }, [shopId, statusFilter, fromDate, toDate, currentPage, pageSize, sortBy, sortDirection]);

  const { data: ordersResponse, loading, error, execute: refetchOrders } = useSellerShopOrders(apiParams);
  const { execute: updateOrderStatus, loading: updating } = useUpdateOrderStatus();

  // Function to handle filter button click
  const handleFilter = useCallback(() => {
    setCurrentPage(0); // Reset to first page
    refetchOrders(); // Trigger API call
  }, [refetchOrders]);

  // Function to clear all filters
  const handleClearFilters = useCallback(() => {
    setStatusFilter('');
    setFromDate('');
    setToDate('');
    setSortBy('createdAt');
    setSortDirection('desc');
    setCurrentPage(0);
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
    } catch (error) {
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
            onClick={() => window.location.href = '/seller/store'}
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

      {/* Advanced Filter */}
      <div className={styles.filterSection}>
        <div className={styles.filterContainer}>
          <div className={styles.filterRow}>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Trạng thái</label>
              <select 
                className={styles.filterSelect}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">Tất cả trạng thái</option>
                <option value="1">Đang chờ</option>
                <option value="2">Đã xác nhận</option>
                <option value="3">Đã hủy</option>
                <option value="4">Hoàn thành</option>
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Từ ngày</label>
              <input
                type="date"
                className={styles.filterInput}
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Đến ngày</label>
              <input
                type="date"
                className={styles.filterInput}
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
          </div>

          <div className={styles.filterActions}>
            <Button 
              variant="primary" 
              onClick={handleFilter}
              disabled={loading}
              className={styles.filterButton}
            >
              {loading ? '⏳ Đang lọc...' : '🔍 Lọc'}
            </Button>
            <Button 
              variant="secondary" 
              onClick={handleClearFilters}
              className={styles.clearButton}
            >
              🗑️ Xóa bộ lọc
            </Button>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className={styles.ordersContainer}>
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
                  <th>Mã đơn</th>
                  <th>Sản phẩm</th>
                  <th>Khách hàng</th>
                  <th>Trạng thái</th>
                  <th>Thời gian nhận</th>
                  <th>Tổng tiền</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order: ApiOrder) => {
                  const statusInfo = getStatusInfo(order.status);
                  return (
                    <tr key={order.id} className={styles.tableRow}>
                      <td className={styles.orderIdCell}>
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
                          </div>
                        </div>
                      </td>
                      <td className={styles.customerCell}>
                        <div className={styles.customerInfo}>
                          <div className={styles.customerName}>{order.customerName}</div>
                          <div className={styles.customerPhone}>📞 {order.customerPhone}</div>
                        </div>
                      </td>
                      <td className={styles.statusCell}>
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
                      <td className={styles.dateCell}>
                        <span className={styles.orderDate}>{formatDate(order.pickupTime)}</span>
                      </td>
                      <td className={styles.totalCell}>
                        <span className={styles.totalPrice}>{formatPrice(order.totalPrice)}</span>
                      </td>
                      <td className={styles.actionsCell}>
                        <div className={styles.orderActions}>
                          {order.status === '1' && (
                            <div className={styles.actionButtons}>
                              <Button 
                                variant="primary" 
                                size="sm" 
                                onClick={() => handleUpdateStatus(order.id.toString(), '2')}
                                disabled={updating}
                                className={styles.confirmButton}
                              >
                                {updating ? '⏳' : '✅'}
                              </Button>
                              <Button 
                                variant="danger" 
                                size="sm" 
                                onClick={() => handleUpdateStatus(order.id.toString(), '3')}
                                disabled={updating}
                                className={styles.cancelButton}
                              >
                                {updating ? '⏳' : '❌'}
                              </Button>
                            </div>
                          )}
                          {order.status === '2' && (
                            <div className={styles.actionButtons}>
                              <Button 
                                variant="success" 
                                size="sm" 
                                onClick={() => handleUpdateStatus(order.id.toString(), '4')}
                                disabled={updating}
                                className={styles.completeButton}
                              >
                                {updating ? '⏳' : '✅'}
                              </Button>
                              <Button 
                                variant="danger" 
                                size="sm" 
                                onClick={() => handleUpdateStatus(order.id.toString(), '3')}
                                disabled={updating}
                                className={styles.cancelButton}
                              >
                                {updating ? '⏳' : '❌'}
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
              <select 
                className={styles.pageSizeSelect}
                value={pageSize}
                onChange={(e) => setPageSize(parseInt(e.target.value))}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className={styles.pageSizeText}>đơn hàng/trang</span>
            </div>
            <div className={styles.pageInfo}>
              Trang {pagination.page + 1} / {pagination.totalPages} 
              ({pagination.totalElements} đơn hàng)
            </div>
          </div>
          
          <div className={styles.paginationControls}>
            <Button 
              variant="secondary" 
              onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
              disabled={!pagination.hasPrevious}
              className={styles.pageButton}
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
              variant="secondary" 
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={!pagination.hasNext}
              className={styles.pageButton}
            >
              Sau →
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}