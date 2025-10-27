'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import styles from './page.module.css';
import { ApiOrder, ApiOrderResponse } from '@/types/admin';

interface OrderFilters {
  shopId: string;
  status: string;
  fromDate: string;
  toDate: string;
  page: number;
  size: number;
  sortBy: string;
  sortDirection: string;
}

export default function AdminOrdersManagement() {
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(20);
  const [filters, setFilters] = useState<OrderFilters>({
    shopId: '',
    status: '',
    fromDate: '',
    toDate: '',
    page: 0,
    size: 20,
    sortBy: 'createdAt',
    sortDirection: 'desc'
  });
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isPaginationLoading, setIsPaginationLoading] = useState(false);
  const [isFilterLoading, setIsFilterLoading] = useState(false);

  // Fetch orders function with useCallback to prevent recreation
  const fetchOrders = useCallback(async (params: OrderFilters) => {
    setLoading(true);
    setError(null);
    
    try {
      const queryParams = new URLSearchParams();
      
      if (params.shopId) queryParams.append('shopId', params.shopId);
      if (params.status) queryParams.append('status', params.status);
      if (params.fromDate) queryParams.append('fromDate', params.fromDate);
      if (params.toDate) queryParams.append('toDate', params.toDate);
      queryParams.append('page', params.page.toString());
      queryParams.append('size', params.size.toString());
      queryParams.append('sortBy', params.sortBy);
      queryParams.append('sortDirection', params.sortDirection);

      // Get auth token from localStorage
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`/api/admin/orders?${queryParams.toString()}`, {
        headers,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: ApiOrderResponse = await response.json();
      
      if (data.success) {
        setOrders(data.data.content);
        setTotalElements(data.data.totalElements);
        setTotalPages(data.data.totalPages);
      } else {
        throw new Error('Failed to fetch orders');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      setOrders([]);
      setTotalElements(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, []);

  // Memoize params to avoid recreating object on every render
  const ordersParams = useMemo(() => ({
    ...filters,
    page: currentPage,
    size: pageSize
  }), [filters, currentPage, pageSize]);

  // Fetch orders when params change
  useEffect(() => {
    fetchOrders(ordersParams);
  }, [ordersParams, fetchOrders]);

  // Handle filter changes
  const handleFilterChange = (key: keyof OrderFilters, value: string) => {
    setIsFilterLoading(true);
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setCurrentPage(0); // Reset to first page when filtering
  };

  const handleSortChange = (sortBy: string, sortDirection: string) => {
    setIsFilterLoading(true);
    setFilters(prev => ({
      ...prev,
      sortBy,
      sortDirection
    }));
    setCurrentPage(0); // Reset to first page when sorting
  };

  const handlePageChange = (newPage: number) => {
    setIsPaginationLoading(true);
    setCurrentPage(newPage);
  };

  // Reset pagination and filter loading when data is loaded
  useEffect(() => {
    if (!loading) {
      if (isPaginationLoading) {
        setIsPaginationLoading(false);
      }
      if (isFilterLoading) {
        setIsFilterLoading(false);
      }
    }
  }, [loading, isPaginationLoading, isFilterLoading]);

  const getStatusText = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
      case '1':
        return 'Chờ xử lý';
      case 'confirmed':
      case '2':
        return 'Đã xác nhận';
      case 'cancelled':
      case '3':
        return 'Đã hủy';
      case 'completed':
      case '4':
        return 'Hoàn thành';
      default: 
        return status || 'Không xác định';
    }
  };

  const getStatusClass = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
      case '1':
        return styles.pending;
      case 'confirmed':
      case '2':
        return styles.confirmed;
      case 'cancelled':
      case '3':
        return styles.cancelled;
      case 'completed':
      case '4':
        return styles.completed;
      default: 
        return styles.unknown;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  return (
    <div className={styles.ordersContainer}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>Quản lý đơn hàng</h1>
          <p className={styles.subtitle}>
            Quản lý tất cả các đơn hàng trong hệ thống
          </p>
        </div>
      </div>

      {/* Filters */}
      <form 
        className={styles.filtersCard}
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <div className={styles.filtersContainer}>
          <div className={styles.filterRow}>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Cửa hàng</label>
              <input
                type="number"
                placeholder="ID cửa hàng"
                className={styles.filterInput}
                value={filters.shopId}
                onChange={(e) => handleFilterChange('shopId', e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                  }
                }}
              />
            </div>
            
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Trạng thái</label>
              <select 
                className={styles.filterSelect}
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="">Tất cả trạng thái</option>
                <option value="1">Chờ xử lý</option>
                <option value="2">Đã xác nhận</option>
                <option value="3">Đã hủy</option>
                <option value="4">Hoàn thành</option>
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Từ ngày</label>
              <input
                type="datetime-local"
                className={styles.filterInput}
                value={filters.fromDate}
                onChange={(e) => handleFilterChange('fromDate', e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                  }
                }}
              />
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Đến ngày</label>
              <input
                type="datetime-local"
                className={styles.filterInput}
                value={filters.toDate}
                onChange={(e) => handleFilterChange('toDate', e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                  }
                }}
              />
            </div>
          </div>

          <div className={styles.filterRow}>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Sắp xếp</label>
              <select 
                className={styles.filterSelect}
                value={`${filters.sortBy}-${filters.sortDirection}`}
                onChange={(e) => {
                  const [sortBy, sortDirection] = e.target.value.split('-');
                  handleSortChange(sortBy, sortDirection);
                }}
              >
                <option value="createdAt-desc">Mới nhất</option>
                <option value="createdAt-asc">Cũ nhất</option>
                <option value="totalPrice-desc">Giá cao nhất</option>
                <option value="totalPrice-asc">Giá thấp nhất</option>
                <option value="status-asc">Trạng thái</option>
              </select>
            </div>

            <div className={styles.filterActions}>
              <Button 
                variant="outline"
                size="md"
                onClick={() => {
                  setIsFilterLoading(true);
                  setFilters({
                    shopId: '',
                    status: '',
                    fromDate: '',
                    toDate: '',
                    page: 0,
                    size: 20,
                    sortBy: 'createdAt',
                    sortDirection: 'desc'
                  });
                  setCurrentPage(0);
                }}
              >
                🗑️ Xóa bộ lọc
              </Button>
              {isFilterLoading && !loading && (
                <div className={styles.filterLoadingIndicator}>
                  <div className={styles.miniSpinner}></div>
                  <span>Đang lọc...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </form>

      {/* Loading State */}
      {loading && (
        <div className={styles.tableCard}>
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <p>Đang tải dữ liệu...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className={styles.tableCard}>
          <div className={styles.errorContainer}>
            {error.includes('Authentication required') ? (
              <div>
                <p className={styles.errorMessage}>🔒 Yêu cầu xác thực</p>
                <p className={styles.errorDescription}>
                  Backend API cần token xác thực hợp lệ để truy cập dữ liệu đơn hàng.
                </p>
                <p className={styles.errorDescription}>
                  Vui lòng liên hệ với quản trị viên hệ thống để được cấp quyền truy cập.
                </p>
              </div>
            ) : (
              <div>
                <p className={styles.errorMessage}>Lỗi API: {error}</p>
                <Button 
                  variant="outline"
                  size="md"
                  onClick={() => fetchOrders(ordersParams)}
                >
                  🔄 Thử lại
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Orders Table */}
      {!loading && (
        <div className={styles.tableCard} style={{ position: 'relative' }}>
          {isFilterLoading && (
            <div className={styles.filterLoadingOverlay}>
              <div className={styles.loadingSpinner}></div>
              <p>Đang tải kết quả...</p>
            </div>
          )}
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead className={styles.tableHead}>
                <tr>
                  <th className={styles.tableHeader}>Mã đơn hàng</th>
                  <th className={styles.tableHeader}>Khách hàng</th>
                  <th className={styles.tableHeader}>Cửa hàng</th>
                  <th className={styles.tableHeader}>Sản phẩm</th>
                  <th className={styles.tableHeader}>Số lượng</th>
                  <th className={styles.tableHeader}>Tổng tiền</th>
                  <th className={styles.tableHeader}>Trạng thái</th>
                  <th className={styles.tableHeader}>Thời gian tạo</th>
                  <th className={styles.tableHeader}>Thời gian hết hạn</th>
                </tr>
              </thead>
              <tbody className={styles.tableBody}>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={9} className={styles.emptyState}>
                      <div className={styles.emptyMessage}>
                        <p>Không có đơn hàng nào</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  orders.map((order: ApiOrder) => (
                    <tr key={order.id} className={styles.tableRow}>
                      <td className={styles.tableCell}>
                        <div className={styles.orderId}>#{order.id}</div>
                      </td>
                      <td className={styles.tableCell}>
                        <div className={styles.customerInfo}>
                          <div className={styles.customerName}>{order.customerName}</div>
                          <div className={styles.customerContact}>
                            📞 {order.customerPhone}
                          </div>
                          <div className={styles.customerEmail}>
                            ✉️ {order.customerEmail}
                          </div>
                        </div>
                      </td>
                      <td className={styles.tableCell}>
                        <div className={styles.shopInfo}>
                          <div className={styles.shopName}>{order.shopName}</div>
                          <div className={styles.shopId}>ID: {order.shopId}</div>
                        </div>
                      </td>
                      <td className={styles.tableCell}>
                        <div className={styles.productInfo}>
                          <div className={styles.productName}>{order.productName}</div>
                          <div className={styles.productImage}>
                            {order.productImage && (
                              <Image 
                                src={order.productImage} 
                                alt={order.productName}
                                width={40}
                                height={40}
                                className={styles.productThumbnail}
                              />
                            )}
                          </div>
                        </div>
                      </td>
                      <td className={styles.tableCell}>
                        <div className={styles.quantityInfo}>
                          <span className={styles.quantity}>{order.quantity}</span>
                        </div>
                      </td>
                      <td className={styles.tableCell}>
                        <div className={styles.priceInfo}>
                          <div className={styles.unitPrice}>
                            {formatCurrency(order.unitPrice)}/đơn vị
                          </div>
                          <div className={styles.totalPrice}>
                            <strong>{formatCurrency(order.totalPrice)}</strong>
                          </div>
                        </div>
                      </td>
                      <td className={styles.tableCell}>
                        <div className={styles.statusContainer}>
                          <span className={`${styles.statusBadge} ${getStatusClass(order.status)}`}>
                            {getStatusText(order.status)}
                          </span>
                          <div className={styles.statusDescription}>
                            {order.statusDescription}
                          </div>
                        </div>
                      </td>
                      <td className={styles.tableCell}>
                        <div className={styles.dateInfo}>
                          {formatDate(order.createdAt)}
                        </div>
                      </td>
                      <td className={styles.tableCell}>
                        <div className={styles.dateInfo}>
                          {order.expiresAt ? formatDate(order.expiresAt) : 'N/A'}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className={styles.pagination}>
          <div className={styles.paginationInfo}>
            Hiển thị <span className="font-medium">{currentPage * pageSize + 1}</span> đến{' '}
            <span className="font-medium">
              {Math.min((currentPage + 1) * pageSize, totalElements)}
            </span>{' '}
            của <span className="font-medium">{totalElements}</span> kết quả
          </div>
          <div className={styles.paginationButtons}>
            <Button 
              variant="outline"
              size="md"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0 || isPaginationLoading}
              loading={isPaginationLoading}
            >
              ← Trước
            </Button>
            <span className={styles.pageNumber}>
              Trang {currentPage + 1} / {totalPages}
            </span>
            <Button 
              variant="outline"
              size="md"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages - 1 || isPaginationLoading}
              loading={isPaginationLoading}
            >
              Sau →
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
