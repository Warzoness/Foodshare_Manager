'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import styles from './page.module.css';
import { useDeleteStore, useUpdateStore } from '@/hooks/useApi';
import { useStores } from '@/hooks/useApi';
import { Store } from '@/types';

export default function StoresManagement() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState(['name', 'asc']);
  const [isPaginationLoading, setIsPaginationLoading] = useState(false);
  
  // Delete store hook
  const { execute: deleteStore, loading: deleteLoading, success: deleteSuccess, error: deleteError } = useDeleteStore();
  
  // Update store hook
  const { loading: updateLoading, error: updateError } = useUpdateStore();

  // Handle delete store
  const handleDeleteStore = async (storeId: string) => {
    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn xóa cửa hàng này?\n\nHành động này không thể hoàn tác và sẽ xóa tất cả dữ liệu liên quan đến cửa hàng này.`
    );
    
    if (confirmed) {
      await deleteStore(storeId.toString());
    }
  };

  // Handle update store
  const handleUpdateStore = async (storeId: string) => {
    // For now, we'll navigate to the store detail page where update functionality can be implemented
    // In a real implementation, you might want to open a modal or navigate to an edit page
    router.push(`/admin/stores/${storeId}`);
  };

  // Memoize params to avoid recreating object on every render
  const storesParams = useMemo(() => ({
    page: currentPage,
    size: pageSize,
    sort: sortBy,
    search: debouncedSearchTerm,
    status: statusFilter
  }), [currentPage, pageSize, sortBy, debouncedSearchTerm, statusFilter]);

  // Use the stores hook
  const { 
    data: storesResponse, 
    loading, 
    error,
    execute: refetchStores 
  } = useStores(storesParams);

  const stores = storesResponse?.content || [];
  const totalItems = storesResponse?.totalElements || 0;
  const totalPages = storesResponse?.totalPages || 0;

  // Handle successful deletion
  useEffect(() => {
    if (deleteSuccess) {
      // Refresh the stores list after successful deletion
      refetchStores();
    }
  }, [deleteSuccess, refetchStores]);


  // Handle search and filters with debounce
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(0); // Reset to first page when searching
  };

  // Debounce search term
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms delay

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(0); // Reset to first page when filtering
  };

  const handleSort = (value: string) => {
    const [field, order] = value.split('-');
    setSortBy([field, order]);
    setCurrentPage(0); // Reset to first page when sorting
  };

  const handleViewStore = (storeId: number) => {
    router.push(`/admin/stores/${storeId}`);
  };

  const handlePageChange = (newPage: number) => {
    setIsPaginationLoading(true);
    setCurrentPage(newPage);
    // useEffect will handle the fetch automatically when currentPage changes
  };


  // Reset pagination loading when data is loaded
  useEffect(() => {
    if (!loading && isPaginationLoading) {
      setIsPaginationLoading(false);
    }
  }, [loading, isPaginationLoading]);

  const getStatusText = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case '1':
      case 'approved':
        return 'Hoạt động';
      case 'pending':
      case 'waiting':
        return 'Chờ duyệt';
      case 'inactive':
      case '0':
      case 'suspended':
        return 'Tạm dừng';
      case 'rejected':
        return 'Từ chối';
      default: 
        return status || 'Không xác định';
    }
  };


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  return (
    <div className={styles.storesContainer}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>Quản lý cửa hàng</h1>
          <p className={styles.subtitle}>
            Quản lý tất cả các cửa hàng trong hệ thống
          </p>
        </div>
        <Button variant="primary" size="lg">+ Thêm cửa hàng mới</Button>
      </div>

      {/* Filters */}
      <div className={styles.filtersCard}>
        <div className={styles.filtersContainer}>
          <input
            type="text"
            placeholder="Tìm kiếm cửa hàng..."
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
          <Select
            value={statusFilter}
            onChange={(value) => handleStatusFilter(value)}
            placeholder="Tất cả trạng thái"
            options={[
              { value: '', label: 'Tất cả trạng thái' },
              { value: 'active', label: 'Hoạt động' },
              { value: 'pending', label: 'Chờ duyệt' },
              { value: 'inactive', label: 'Tạm dừng' },
              { value: 'rejected', label: 'Từ chối' }
            ]}
          />
          <Select
            value={`${sortBy[0]}-${sortBy[1]}`}
            onChange={(value) => handleSort(value)}
            placeholder="Sắp xếp"
            options={[
              { value: 'name-asc', label: 'Tên cửa hàng A-Z' },
              { value: 'name-desc', label: 'Tên cửa hàng Z-A' },
              { value: 'createdAt-desc', label: 'Mới nhất' },
              { value: 'createdAt-asc', label: 'Cũ nhất' },
              { value: 'rating-desc', label: 'Đánh giá cao nhất' },
              { value: 'rating-asc', label: 'Đánh giá thấp nhất' },
              { value: 'totalProducts-desc', label: 'Nhiều sản phẩm nhất' },
              { value: 'status-asc', label: 'Trạng thái' }
            ]}
          />
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
              size="md"
              onClick={() => refetchStores()}
            >
              🔄 Thử lại
            </Button>
          </div>
        </div>
      )}

      {/* Delete Error Notice */}
      {deleteError && (
        <div className={styles.tableCard}>
          <div className={styles.errorContainer}>
            <p className={styles.errorMessage}>Lỗi khi xóa cửa hàng: {deleteError}</p>
          </div>
        </div>
      )}

      {/* Update Error Notice */}
      {updateError && (
        <div className={styles.tableCard}>
          <div className={styles.errorContainer}>
            <p className={styles.errorMessage}>Lỗi khi cập nhật cửa hàng: {updateError}</p>
          </div>
        </div>
      )}



      {/* Stores Table */}
      {!loading && (
        <div className={styles.tableCard}>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead className={styles.tableHead}>
                <tr>
                  <th className={styles.tableHeader}>
                    Cửa hàng
                  </th>
                  <th className={styles.tableHeader}>
                    Thông tin
                  </th>
                  <th className={styles.tableHeader}>
                    Liên hệ
                  </th>
                  <th className={styles.tableHeader}>
                    Trạng thái
                  </th>
                  <th className={styles.tableHeader}>
                    Ngày tạo
                  </th>
                  <th className={styles.tableHeader}>
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className={styles.tableBody}>
                {stores.length === 0 ? (
                  <tr>
                    <td colSpan={6} className={styles.emptyState}>
                      <div className={styles.emptyMessage}>
                        <p>Không có cửa hàng nào</p>
                        <Button variant="primary" size="md">+ Thêm cửa hàng đầu tiên</Button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  stores.map((store: Store) => (
                    <tr key={store.id} className={styles.tableRow}>
                      <td className={styles.tableCell}>
                        <div className={styles.storeInfo}>
                          <div className={styles.storeName}>{store.name || 'N/A'}</div>
                          <div className={styles.storeAddress}>{store.address || 'N/A'}</div>
                        </div>
                      </td>
                      <td className={styles.tableCell}>
                        <div className={styles.storeDetails}>
                          {/* <div className={styles.rating}>⭐ {store.rating || 0}/5</div> */}
                          <div className={styles.productsCount}>{store.totalProducts || 0} sản phẩm</div>
                          <div className={styles.storeDescription}>{store.description || 'Chưa có mô tả'}</div>
                        </div>
                      </td>
                      <td className={styles.tableCell}>
                        <div className={styles.contactInfo}>
                          <div className={styles.contactPhone}>📞 Điện thoại {store.phone || 'N/A'}</div>
                        </div>
                      </td>
                      <td className={styles.tableCell}>
                        <div className={styles.statusContainer}>
                          <span className={`${styles.statusBadge} ${styles[store.status || 'inactive']}`}>
                            {getStatusText(store.status || 'inactive')}
                          </span>
                        </div>
                      </td>
                      <td className={styles.tableCell}>
                        <div className={styles.dateInfo}>
                          {store.createdAt ? formatDate(store.createdAt) : 'N/A'}
                        </div>
                      </td>
                      <td className={styles.tableCell}>
                        <div className={styles.actionButtons}>
                          <Button 
                            variant="secondary"
                            size="sm"
                            onClick={() => handleViewStore(store.id)}
                          >
                            👁️ Xem
                          </Button>
                          <Button 
                            variant="secondary"
                            size="sm"
                            onClick={() => handleUpdateStore(store.id.toString())}
                            disabled={updateLoading}
                            loading={updateLoading}
                            title="Sửa cửa hàng"
                          >
                            ✏️ Sửa
                          </Button>
                          {(store.status || 'inactive') === 'pending' && (
                            <Button variant="success" size="sm">✅ Duyệt</Button>
                          )}
                          <Button 
                            variant="danger"
                            size="sm"
                            onClick={() => handleDeleteStore(store.id.toString())}
                            disabled={deleteLoading}
                            loading={deleteLoading}
                            title="Xóa cửa hàng"
                          >
                            🗑️ Xóa
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
