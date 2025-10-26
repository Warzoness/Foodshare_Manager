'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from './page.module.css';
import { useAdminProducts, useDeleteProduct } from '@/hooks/useApi';
import { Product } from '@/types';
import { Button } from '@/components/ui/Button';

export default function ProductsManagement() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(20);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState<string[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  
  // Filter state management
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    sort: '',
    category: '',
    shop: '',
    priceMin: '',
    priceMax: '',
    dateFrom: '',
    dateTo: ''
  });
  

  // Memoize params to avoid recreating object on every render
  const productsParams = useMemo(() => {
    const params: Record<string, unknown> = {
      page: currentPage,
      size: pageSize
    };
    
    // Add sort parameter
    if (sortBy.length > 0) {
      params.sort = sortBy;
    }
    
    // Add search parameter
    if (debouncedSearchTerm) {
      params.search = debouncedSearchTerm;
    }
    
    // Add status filter
    if (statusFilter) {
      params.status = statusFilter;
    }
    
    // Add other filters
    if (filters.category) {
      params.category = filters.category;
    }
    
    if (filters.shop) {
      params.shop = filters.shop;
    }
    
    if (filters.priceMin) {
      params.priceMin = filters.priceMin;
    }
    
    if (filters.priceMax) {
      params.priceMax = filters.priceMax;
    }
    
    if (filters.dateFrom) {
      params.dateFrom = filters.dateFrom;
    }
    
    if (filters.dateTo) {
      params.dateTo = filters.dateTo;
    }
    
    return params;
  }, [currentPage, pageSize, sortBy, debouncedSearchTerm, statusFilter, filters]);

  // Use the new admin products hook
  const { 
    data: productsResponse, 
    loading, 
    error,
    execute: refetchProducts 
  } = useAdminProducts(productsParams);

  // Debug logging
  useEffect(() => {
  }, [productsParams]);

  // Delete product hook
  const { 
    loading: deleteLoading, 
    error: deleteError, 
    success: deleteSuccess,
    execute: executeDelete,
    reset: resetDelete
  } = useDeleteProduct();

  const products = productsResponse?.content || [];
  const totalItems = productsResponse?.totalElements || 0;
  const totalPages = productsResponse?.totalPages || 0;

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(0); // Reset to first page when searching
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Cleanup
  useEffect(() => {
    return () => {
      // Cleanup if needed
    };
  }, []);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Enhanced filter handlers with validation
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setFilters(prev => ({ ...prev, search: value }));
    setCurrentPage(0);
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    setFilters(prev => ({ ...prev, status: value }));
    setCurrentPage(0);
  };

  const handleSort = (value: string) => {
    if (value === '') {
      setSortBy([]);
      setFilters(prev => ({ ...prev, sort: '' }));
    } else {
      const [field, order] = value.split('-');
      setSortBy([`${field},${order}`]);
      setFilters(prev => ({ ...prev, sort: value }));
    }
    setCurrentPage(0);
  };


  // Clear all filters
  const handleClearFilters = () => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
    setStatusFilter('');
    setSortBy([]);
    setFilters({
      search: '',
      status: '',
      sort: '',
      category: '',
      shop: '',
      priceMin: '',
      priceMax: '',
      dateFrom: '',
      dateTo: ''
    });
    setCurrentPage(0);
  };


  // Check if any filter is active
  const hasActiveFilters = () => {
    return Object.values(filters).some(value => value !== '') || 
           searchTerm !== '' || 
           statusFilter !== '' || 
           sortBy.length > 0;
  };

  const handleViewProduct = (productId: number) => {
    router.push(`/admin/products/${productId}`);
  };

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    try {
      await executeDelete(productToDelete.id.toString());
    } catch (_error) {
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setProductToDelete(null);
    resetDelete();
  };

  // Handle delete success
  useEffect(() => {
    if (deleteSuccess) {
      alert('Xóa sản phẩm thành công!');
      setShowDeleteModal(false);
      setProductToDelete(null);
      resetDelete();
      refetchProducts(); // Refresh the products list
    }
  }, [deleteSuccess, resetDelete, refetchProducts]);

  // Handle delete error
  useEffect(() => {
    if (deleteError) {
      alert(`Lỗi khi xóa sản phẩm: ${deleteError}`);
    }
  }, [deleteError]);

  const getStatusText = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case '1':
      case 'available':
        return 'Khả dụng';
      case 'inactive':
      case '0':
      case 'unavailable':
        return 'Không khả dụng';
      default:
        return 'Không khả dụng';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case '1':
      case 'available':
        return styles.active;
      case 'inactive':
      case '0':
      case 'unavailable':
        return styles.inactive;
      default:
        return styles.inactive;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  return (
    <div className={styles.productsContainer}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>Quản lý sản phẩm</h1>
          <p className={styles.subtitle}>Quản lý tất cả sản phẩm trong hệ thống</p>
        </div>
        <Button variant="primary" size="md">
          Thêm sản phẩm
        </Button>
      </div>

      {/* Filters */}
      <div className={styles.filtersCard}>
        <div className={styles.filtersHeader}>
          <h3 className={styles.filtersTitle}>Bộ lọc sản phẩm</h3>
          <div className={styles.filtersHeaderRight}>
            {hasActiveFilters() && (
              <span className={styles.activeFiltersIndicator}>
                Đang áp dụng {Object.values(filters).filter(v => v !== '').length + (searchTerm ? 1 : 0) + (statusFilter ? 1 : 0) + (sortBy.length > 0 ? 1 : 0)} bộ lọc
              </span>
            )}
            {hasActiveFilters() && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleClearFilters}
                className={styles.clearButton}
              >
                Xóa bộ lọc
              </Button>
            )}
          </div>
        </div>
        
        <div className={styles.filtersContainer}>
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className={styles.searchInput}
          />
          <select 
            className={styles.filterSelect}
            value={statusFilter}
            onChange={(e) => handleStatusFilter(e.target.value)}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="active">Khả dụng</option>
            <option value="inactive">Không khả dụng</option>
          </select>
          <select 
            className={styles.filterSelect}
            value={sortBy.length > 0 ? `${sortBy[0].split(',')[0]}-${sortBy[0].split(',')[1]}` : ''}
            onChange={(e) => handleSort(e.target.value)}
          >
            <option value="">Sắp xếp mặc định</option>
            <option value="name-asc">Tên sản phẩm A-Z</option>
            <option value="name-desc">Tên sản phẩm Z-A</option>
            <option value="price-desc">Giá cao nhất</option>
            <option value="price-asc">Giá thấp nhất</option>
          </select>
        </div>
      </div>

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
            <p className={styles.errorMessage}>Lỗi API: {error}</p>
            <Button 
              variant="outline"
              size="sm"
              onClick={() => refetchProducts()}
            >
              Thử lại
            </Button>
          </div>
        </div>
      )}

      {/* Products Table */}
      {!loading && (
        <div className={styles.tableCard}>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead className={styles.tableHead}>
                <tr>
                  <th className={styles.tableHeader}>Sản phẩm</th>
                  <th className={styles.tableHeader}>Cửa hàng</th>
                  <th className={styles.tableHeader}>Giá</th>
                  <th className={styles.tableHeader}>Số lượng</th>
                  <th className={styles.tableHeader}>Trạng thái</th>
                  <th className={styles.tableHeader}>Ngày tạo</th>
                  <th className={styles.tableHeader}>Hành động</th>
                </tr>
              </thead>
              <tbody className={styles.tableBody}>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={7} className={styles.emptyState}>
                      <div className={styles.emptyMessage}>
                        <p>Không có sản phẩm nào</p>
                        <Button variant="primary" size="md">
                          Thêm sản phẩm đầu tiên
                        </Button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  products.map((product: Product) => (
                    <tr key={product.id} className={styles.tableRow}>
                      <td className={styles.tableCell}>
                        <div className={styles.productInfo}>
                          <div className={styles.productImage}>
                            {product.imageUrl ? (
                              <Image src={product.imageUrl} alt={product.name} width={200} height={150} />
                            ) : (
                              <div className={styles.placeholderImage}>📦</div>
                            )}
                          </div>
                          <div className={styles.productDetails}>
                            <div className={styles.productName}>{product.name || 'N/A'}</div>
                            <div className={styles.productDescription}>
                              {product.description || 'Chưa có mô tả'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className={styles.tableCell}>
                        <div className={styles.shopInfo}>
                          <div className={styles.shopName}>{product.shopName || 'N/A'}</div>
                          <div className={styles.shopId}>ID: {product.shopId}</div>
                        </div>
                      </td>
                      <td className={styles.tableCell}>
                        <div className={styles.priceInfo}>
                          <div className={styles.currentPrice}>{formatPrice(product.price)}</div>
                          {product.originalPrice > 0 && (
                            <div className={styles.originalPrice}>{formatPrice(product.originalPrice)}</div>
                          )}
                        </div>
                      </td>
                      <td className={styles.tableCell}>
                        <div className={styles.quantityInfo}>
                          <div className={styles.available}>Có sẵn: {product.quantityAvailable}</div>
                          <div className={styles.pending}>Đang chờ: {product.quantityPending}</div>
                        </div>
                      </td>
                      <td className={styles.tableCell}>
                        <div className={styles.statusContainer}>
                          <span className={`${styles.statusBadge} ${getStatusColor(product.status || 'inactive')}`}>
                            {getStatusText(product.status || 'inactive')}
                          </span>
                        </div>
                      </td>
                      <td className={styles.tableCell}>
                        <div className={styles.dateInfo}>
                          {product.createdAt ? formatDate(product.createdAt) : 'N/A'}
                        </div>
                      </td>
                      <td className={styles.tableCell}>
                        <div className={styles.actionButtons}>
                          <Button 
                            variant="primary"
                            size="sm"
                            onClick={() => handleViewProduct(product.id)}
                          >
                            Xem
                          </Button>
                          <Button 
                            variant="secondary"
                            size="sm"
                            onClick={() => handleViewProduct(product.id)}
                          >
                            Sửa
                          </Button>
                          <Button 
                            variant="danger"
                            size="sm"
                            onClick={() => handleDeleteClick(product)}
                            disabled={deleteLoading}
                          >
                            {deleteLoading && productToDelete?.id === product.id ? 'Đang xóa...' : 'Xóa'}
                          </Button>
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
              {Math.min((currentPage + 1) * pageSize, totalItems)}
            </span>{' '}
            của <span className="font-medium">{totalItems}</span> kết quả
          </div>
          <div className={styles.paginationButtons}>
            <Button 
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0}
            >
              Trước
            </Button>
            <span className={styles.pageNumber}>
              Trang {currentPage + 1} / {totalPages}
            </span>
            <Button 
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages - 1}
            >
              Sau
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && productToDelete && (
        <div className={styles.modalOverlay} onClick={handleDeleteCancel}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Xác nhận xóa sản phẩm</h3>
              <button 
                className={styles.closeButton}
                onClick={handleDeleteCancel}
              >
                ×
              </button>
            </div>
            <div className={styles.modalContent}>
              <p>Bạn có chắc chắn muốn xóa sản phẩm <strong>&quot;{productToDelete.name}&quot;</strong>?</p>
              <p className={styles.warningText}>Hành động này không thể hoàn tác.</p>
            </div>
            <div className={styles.modalActions}>
              <Button 
                variant="outline"
                size="md"
                onClick={handleDeleteCancel}
                disabled={deleteLoading}
              >
                Hủy
              </Button>
              <Button 
                variant="danger"
                size="md"
                onClick={handleDeleteConfirm}
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Đang xóa...' : 'Xóa sản phẩm'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
