'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { adminService } from '@/services';
import { StoreDetail, Product, UpdateStoreRequest } from '@/types';
import { useUpdateStore, useAdminProductsByShop } from '@/hooks/useApi';
import { Button } from '@/components/ui/Button';
import styles from './page.module.css';

export default function StoreDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [store, setStore] = useState<StoreDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UpdateStoreRequest>({
    name: '',
    address: '',
    phone: '',
    imageUrl: '',
    latitude: 0,
    longitude: 0,
    description: '',
    rating: 0,
    status: '1'
  });

  const [mapUrl, setMapUrl] = useState<string>('');
  const [coordinateInput, setCoordinateInput] = useState<string>('');

  // Products pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(20);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState(['name', 'asc']);
  const [isPaginationLoading, setIsPaginationLoading] = useState(false);

  const shopId = params.id as string;
  
  // Update store hook
  const { execute: updateStore, loading: updateLoading, success: updateSuccess, error: updateError } = useUpdateStore();

  // Products pagination params
  const productsParams = useMemo(() => ({
    page: currentPage,
    size: pageSize,
    sort: sortBy,
    search: debouncedSearchTerm,
    status: statusFilter
  }), [currentPage, pageSize, sortBy, debouncedSearchTerm, statusFilter]);

  // Products hook
  const { 
    data: productsResponse, 
    loading: productsLoading, 
    error: productsError,
    execute: refetchProducts 
  } = useAdminProductsByShop(shopId, productsParams);

  const products = productsResponse?.content || [];
  const totalItems = productsResponse?.totalElements || 0;
  const totalPages = productsResponse?.totalPages || 0;

  useEffect(() => {
    const fetchStoreDetail = async () => {
      try {
        setLoading(true);
        const response = await adminService.getStoreDetail(shopId);
        
        if (response.success && response.data) {
          setStore(response.data);
          // Populate form data with store data
          setFormData({
            name: response.data.name || '',
            address: response.data.address || '',
            phone: response.data.phone || '',
            imageUrl: response.data.imageUrl || '',
            latitude: response.data.latitude || 0,
            longitude: response.data.longitude || 0,
            description: response.data.description || '',
            rating: response.data.rating || 0,
            status: response.data.status || '1'
          });
        } else {
          setError('Không thể tải thông tin cửa hàng');
        }
      } catch (_err) {
        setError('Lỗi khi tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };

    if (shopId) {
      fetchStoreDetail();
    }
  }, [shopId]);

  // Handle successful update
  useEffect(() => {
    if (updateSuccess) {
      setIsEditing(false);
      // Refresh store data
      const fetchStoreDetail = async () => {
        try {
          const response = await adminService.getStoreDetail(shopId);
          if (response.success && response.data) {
            setStore(response.data);
          }
        } catch (_err) {
        }
      };
      fetchStoreDetail();
    }
  }, [updateSuccess, shopId]);

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

  // Update map URL when coordinates change
  const updateMapUrl = (lat: number, lng: number) => {
    if (lat && lng) {
      const publicUrl = `https://www.google.com/maps?q=${lat},${lng}&output=embed`;
      setMapUrl(publicUrl);
    }
  };

  // Parse coordinate input - supports various formats
  const parseCoordinateInput = (input: string): { lat: number | null, lng: number | null } => {
    if (!input || !input.trim()) {
      return { lat: null, lng: null };
    }

    const trimmed = input.trim();
    
    // Try to parse Google Maps URL
    const googleMapsMatch = trimmed.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
    if (googleMapsMatch) {
      return {
        lat: parseFloat(googleMapsMatch[1]),
        lng: parseFloat(googleMapsMatch[2])
      };
    }

    // Try to parse "lat,lng" or "lat lng" format
    const commaMatch = trimmed.match(/^(-?\d+\.?\d*)[,\s]+(-?\d+\.?\d*)$/);
    if (commaMatch) {
      return {
        lat: parseFloat(commaMatch[1]),
        lng: parseFloat(commaMatch[2])
      };
    }

    // Single number
    const singleNumber = parseFloat(trimmed);
    if (!isNaN(singleNumber)) {
      return { lat: singleNumber, lng: null };
    }

    return { lat: null, lng: null };
  };

  // Handle coordinate input update
  const handleCoordinateUpdate = () => {
    const parsed = parseCoordinateInput(coordinateInput);
    
    if (parsed.lat !== null && parsed.lng !== null) {
      setFormData(prev => ({
        ...prev,
        latitude: parsed.lat!,
        longitude: parsed.lng!
      }));
      updateMapUrl(parsed.lat, parsed.lng);
    }
  };

  // Request current location only for new stores (when coordinates are 0,0)
  // For existing stores, keep their original location
  useEffect(() => {
    if (isEditing && formData.latitude === 0 && formData.longitude === 0) {
      const requestCurrentLocation = async () => {
        if (!navigator.geolocation) {
          return;
        }

        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 60000
            });
          });

          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          setFormData(prev => ({
            ...prev,
            latitude: lat,
            longitude: lng
          }));
          
            setCoordinateInput(`${lat}, ${lng}`);
          updateMapUrl(lat, lng);
        } catch (_error) {
          // Don't show error
        }
      };

      requestCurrentLocation();
    }
  }, [isEditing, formData.latitude, formData.longitude]);

  // Update map URL when formData coordinates change
  useEffect(() => {
    if (isEditing && formData.latitude && formData.longitude) {
      updateMapUrl(formData.latitude, formData.longitude);
      setCoordinateInput(`${formData.latitude}, ${formData.longitude}`);
    }
  }, [formData.latitude, formData.longitude, isEditing]);

  // Form handlers
  const handleInputChange = (field: keyof UpdateStoreRequest, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data to original store data
    if (store) {
      setFormData({
        name: store.name || '',
        address: store.address || '',
        phone: store.phone || '',
        imageUrl: store.imageUrl || '',
        latitude: store.latitude || 0,
        longitude: store.longitude || 0,
        description: store.description || '',
        rating: store.rating || 0,
        status: store.status || '1'
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (shopId) {
      await updateStore(shopId, formData);
    }
  };

  const handleViewProduct = (productId: number) => {
    router.push(`/admin/products/${productId}`);
  };

  // Products pagination handlers
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

  const handlePageChange = (newPage: number) => {
    setIsPaginationLoading(true);
    setCurrentPage(newPage);
    // useEffect will handle the fetch automatically when currentPage changes
  };

  // Reset pagination loading when data is loaded
  useEffect(() => {
    if (!productsLoading && isPaginationLoading) {
      setIsPaginationLoading(false);
    }
  }, [productsLoading, isPaginationLoading]);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case '1':
      case 'approved':
        return styles.active;
      case 'pending':
      case 'waiting':
        return styles.pending;
      case 'inactive':
      case '0':
      case 'suspended':
        return styles.inactive;
      case 'rejected':
        return styles.rejected;
      default: 
        return styles.inactive;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
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
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Đang tải thông tin cửa hàng...</p>
        </div>
      </div>
    );
  }

  if (error || !store) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <h2>Lỗi</h2>
          <p>{error || 'Không tìm thấy thông tin cửa hàng'}</p>
          <Button 
            variant="outline"
            size="md"
            onClick={() => router.back()}
          >
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Back Button */}
      <div className={styles.backSection}>
        <Button 
          variant="outline"
          size="sm"
          onClick={() => router.back()}
        >
          Quay lại
        </Button>
      </div>

      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>{store.name}</h1>
          <p className={styles.subtitle}>Chi tiết cửa hàng</p>
        </div>
        <div className={styles.headerActions}>
          {!isEditing ? (
            <Button 
              variant="secondary"
              size="md"
              onClick={handleEdit}
            >
              Chỉnh sửa
            </Button>
          ) : (
            <>
              <Button 
                variant="danger"
                size="md"
                onClick={handleCancel}
                disabled={updateLoading}
              >
                Hủy
              </Button>
              <Button 
                variant="primary"
                size="md"
                onClick={handleSubmit}
                loading={updateLoading}
              >
                Lưu thay đổi
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Store Info Card */}
      <div className={styles.storeInfoCard}>
        {isEditing ? (
          <form onSubmit={handleSubmit} className={styles.editForm}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Tên cửa hàng *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={styles.formInput}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Trạng thái *</label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className={styles.formSelect}
                >
                  <option value="1">Hoạt động</option>
                  <option value="0">Tạm dừng</option>
                  <option value="2">Chờ duyệt</option>
                </select>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Địa chỉ *</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className={styles.formInput}
                required
              />
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Số điện thoại *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={styles.formInput}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Đánh giá (0-5)</label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={formData.rating}
                  onChange={(e) => handleInputChange('rating', parseFloat(e.target.value))}
                  className={styles.formInput}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>URL hình ảnh</label>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                className={styles.formInput}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Vị trí cửa hàng *</label>
              
              {/* Google Maps iframe */}
              <div className={styles.mapContainer}>
                {mapUrl ? (
                  <iframe
                    src={mapUrl}
                    width="100%"
                    height="300"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className={styles.mapIframe}
                  />
                ) : (
                  <div className={styles.mapPlaceholder}>
                    <div className={styles.uploadIcon}>📍</div>
                    <div className={styles.uploadText}>Vui lòng nhập tọa độ để hiển thị bản đồ</div>
                  </div>
                )}
              </div>
              
              {/* Coordinate input */}
              <div className={styles.coordinateInputContainer}>
                <label className={styles.coordinateLabel}>Tọa độ (Latitude, Longitude)</label>
                <div className={styles.coordinateInputRow}>
                  <input
                    type="text"
                    placeholder="21.059788079405156, 105.78357288474545"
                    value={coordinateInput}
                    onChange={(e) => setCoordinateInput(e.target.value)}
                    className={styles.formInput}
                  />
                  <Button 
                    variant="primary"
                    onClick={handleCoordinateUpdate}
                    className={styles.updateLocationBtn}
                  >
                    Cập nhật vị trí
                  </Button>
                </div>
              </div>
              
              <div className={styles.locationHint}>
                💡 Vị trí mặc định sẽ là vị trí hiện tại của bạn. Để thay đổi, tìm địa chỉ trên Google Maps, click chuột phải và chọn &quot;What&apos;s here?&quot; để lấy tọa độ, sau đó dán vào ô trên.
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Mô tả</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className={styles.formTextarea}
                rows={3}
                placeholder="Mô tả về cửa hàng..."
              />
            </div>

            {updateError && (
              <div className={styles.errorMessage}>
                Lỗi: {updateError}
              </div>
            )}
          </form>
        ) : (
          <>
            <div className={styles.storeImage}>
              {store.imageUrl ? (
                <Image src={store.imageUrl} alt={store.name} width={400} height={300} />
              ) : (
                <div className={styles.placeholderImage}>
                  <span>📷</span>
                </div>
              )}
            </div>
            <div className={styles.storeDetails}>
              <div className={styles.storeHeader}>
                <h2 className={styles.storeName}>{store.name}</h2>
                <span className={`${styles.statusBadge} ${getStatusColor(store.status)}`}>
                  {getStatusText(store.status)}
                </span>
              </div>
              
              <div className={styles.storeInfo}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>📍 Địa chỉ:</span>
                  <span className={styles.infoValue}>{store.address}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>📞 Điện thoại:</span>
                  <span className={styles.infoValue}>{store.phone}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>⭐ Đánh giá:</span>
                  <span className={styles.infoValue}>{store.rating}/5</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>🌍 Tọa độ:</span>
                  <span className={styles.infoValue}>
                    {store.latitude.toFixed(6)}, {store.longitude.toFixed(6)}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>📅 Ngày tạo:</span>
                  <span className={styles.infoValue}>{formatDate(store.createdAt)}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>🔄 Cập nhật:</span>
                  <span className={styles.infoValue}>{formatDate(store.updatedAt)}</span>
                </div>
              </div>

              {store.description && (
                <div className={styles.description}>
                  <h3>Mô tả</h3>
                  <p>{store.description}</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Products Section */}
      <div className={styles.productsSection}>
        <div className={styles.sectionHeader}>
          <h2>Sản phẩm ({totalItems})</h2>
          <button className={`${styles.actionButton} ${styles.primary}`}>
            + Thêm sản phẩm
          </button>
        </div>

        {/* Products Filters */}
        <div className={styles.filtersCard}>
          <div className={styles.filtersContainer}>
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              className={styles.searchInput}
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
            />
            <select 
              className={styles.filterSelect}
              value={statusFilter}
              onChange={(e) => handleStatusFilter(e.target.value)}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="active">Hoạt động</option>
              <option value="pending">Chờ duyệt</option>
              <option value="inactive">Tạm dừng</option>
              <option value="rejected">Từ chối</option>
            </select>
            <select 
              className={styles.filterSelect}
              value={`${sortBy[0]}-${sortBy[1]}`}
              onChange={(e) => handleSort(e.target.value)}
            >
              <option value="name-asc">Tên sản phẩm A-Z</option>
              <option value="name-desc">Tên sản phẩm Z-A</option>
              <option value="price-desc">Giá cao nhất</option>
              <option value="price-asc">Giá thấp nhất</option>
              <option value="createdAt-desc">Mới nhất</option>
              <option value="createdAt-asc">Cũ nhất</option>
            </select>
          </div>
        </div>

        {/* Loading State */}
        {productsLoading && (
          <div className={styles.tableCard}>
            <div className={styles.loadingContainer}>
              <div className={styles.loadingSpinner}></div>
              <p>Đang tải sản phẩm...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {productsError && (
          <div className={styles.tableCard}>
            <div className={styles.errorContainer}>
              <p className={styles.errorMessage}>Lỗi API: {productsError}</p>
              <button 
                className={styles.retryButton}
                onClick={() => refetchProducts()}
              >
                Thử lại
              </button>
            </div>
          </div>
        )}

        {/* Products Table */}
        {!productsLoading && (
          <div className={styles.tableCard}>
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead className={styles.tableHead}>
                  <tr>
                    <th className={styles.tableHeader}>
                      Sản phẩm
                    </th>
                    <th className={styles.tableHeader}>
                      Giá
                    </th>
                    <th className={styles.tableHeader}>
                      Số lượng
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
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan={6} className={styles.emptyState}>
                        <div className={styles.emptyMessage}>
                          <p>Không có sản phẩm nào</p>
                          <button className={styles.addButton}>+ Thêm sản phẩm đầu tiên</button>
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
                                <Image src={product.imageUrl} alt={product.name} width={40} height={40} />
                              ) : (
                                <div className={styles.placeholderImage}>
                                  <span>📦</span>
                                </div>
                              )}
                            </div>
                            <div className={styles.productDetails}>
                              <div className={styles.productName}>{product.name || 'N/A'}</div>
                            </div>
                          </div>
                        </td>
                        <td className={styles.tableCell}>
                          <div className={styles.productPricing}>
                            <div className={styles.currentPrice}>
                              {formatPrice(product.price)}
                            </div>
                            {product.originalPrice > product.price && (
                              <div className={styles.originalPrice}>
                                {formatPrice(product.originalPrice)}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className={styles.tableCell}>
                          <div className={styles.productStats}>
                            <div className={styles.statItem}>
                              <span className={styles.statValue}>{product.quantityAvailable || 0}</span>
                              <span className={styles.statLabel}>có sẵn</span>
                            </div>
                            <div className={styles.statItem}>
                              <span className={styles.statValue}>{product.quantityPending || 0}</span>
                              <span className={styles.statLabel}>đã bán</span>
                            </div>
                          </div>
                        </td>
                        <td className={styles.tableCell}>
                          <div className={styles.statusContainer}>
                            <span className={`${styles.statusBadge} ${styles[product.status || 'inactive']}`}>
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
                            <button 
                              className={`${styles.actionButton} ${styles.secondary}`}
                              onClick={() => handleViewProduct(product.id)}
                            >
                              Xem
                            </button>
                            <button 
                              className={`${styles.actionButton} ${styles.secondary}`}
                              onClick={() => handleViewProduct(product.id)}
                              title="Sửa sản phẩm"
                            >
                              Sửa
                            </button>
                            <button 
                              className={`${styles.actionButton} ${styles.danger}`}
                              title="Xóa sản phẩm"
                            >
                              Xóa
                            </button>
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
        {!productsLoading && totalPages > 1 && (
          <div className={styles.pagination}>
            <div className={styles.paginationInfo}>
              Hiển thị <span className="font-medium">{currentPage * pageSize + 1}</span> đến{' '}
              <span className="font-medium">
                {Math.min((currentPage + 1) * pageSize, totalItems)}
              </span>{' '}
              của <span className="font-medium">{totalItems}</span> kết quả
            </div>
            <div className={styles.paginationButtons}>
              <button 
                className={styles.paginationButton}
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0 || isPaginationLoading}
              >
                {isPaginationLoading ? 'Đang tải...' : 'Trước'}
              </button>
              <span className={styles.pageNumber}>
                Trang {currentPage + 1} / {totalPages}
              </span>
              <button 
                className={styles.paginationButton}
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages - 1 || isPaginationLoading}
              >
                {isPaginationLoading ? 'Đang tải...' : 'Sau'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
