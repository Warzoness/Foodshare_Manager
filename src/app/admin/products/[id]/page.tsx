'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { adminService } from '@/services';
import { ProductDetail, UpdateProductRequest } from '@/types';
import { useAdminProductDetail, useUpdateProduct, useDeleteProduct } from '@/hooks/useApi';
import { Button } from '@/components/ui/Button';
import styles from './page.module.css';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [formData, setFormData] = useState<UpdateProductRequest>({
    name: '',
    description: '',
    price: 0,
    originalPrice: 0,
    imageUrl: '',
    detailImageUrl: '',
    quantityAvailable: 0,
    quantityPending: 0,
    status: 'active',
    categoryId: 0
  });

  const productId = params.id as string;
  
  // Product detail hook
  const { data, loading: hookLoading, error: hookError } = useAdminProductDetail(productId);
  
  // Update product hook
  const { execute: updateProduct, loading: updateLoading, success: updateSuccess, error: updateError } = useUpdateProduct();
  
  // Delete product hook
  const { execute: deleteProduct, loading: deleteLoading, success: deleteSuccess, error: deleteError } = useDeleteProduct();

  useEffect(() => {
    if (data) {
      setProduct(data);
      // Populate form data with product data
      setFormData({
        name: data.name || '',
        description: data.description || '',
        price: data.price || 0,
        originalPrice: data.originalPrice || 0,
        imageUrl: data.imageUrl || '',
        detailImageUrl: data.detailImageUrl || '',
        quantityAvailable: data.quantityAvailable || 0,
        quantityPending: data.quantityPending || 0,
        status: data.status || 'active',
        categoryId: data.categoryId || 0
      });
      setLoading(false);
    } else if (hookError) {
      setError(hookError);
      setLoading(false);
    } else if (hookLoading) {
      setLoading(true);
    }
  }, [data, hookError, hookLoading]);

  // Handle successful update
  useEffect(() => {
    if (updateSuccess) {
      setIsEditing(false);
      // Refresh product data
      const fetchProductDetail = async () => {
        try {
          const response = await adminService.getProductDetail(productId);
          if (response.success && response.data) {
            setProduct(response.data);
          }
        } catch (err) {
          console.error('Error refreshing product data:', err);
        }
      };
      fetchProductDetail();
    }
  }, [updateSuccess, productId]);

  // Handle successful delete
  useEffect(() => {
    if (deleteSuccess) {
      // Show success message and redirect
      alert('Xóa sản phẩm thành công!');
      router.push('/admin/products');
    }
  }, [deleteSuccess, router]);

  const getStatusText = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case '1':
      case 'available':
        return 'Có sẵn';
      case 'inactive':
      case '0':
      case 'unavailable':
        return 'Không có sẵn';
      case 'pending':
      case 'waiting':
        return 'Chờ duyệt';
      case 'out_of_stock':
        return 'Hết hàng';
      default: 
        return status || 'Không xác định';
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
      case 'pending':
      case 'waiting':
        return styles.pending;
      case 'out_of_stock':
        return styles.outOfStock;
      default:
        return styles.unknown;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
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

  const handleViewShop = (shopId: number) => {
    router.push(`/admin/stores/${shopId}`);
  };

  // Form handlers
  const handleInputChange = (field: keyof UpdateProductRequest, value: string | number) => {
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
    // Reset form data to original product data
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || 0,
        originalPrice: product.originalPrice || 0,
        imageUrl: product.imageUrl || '',
        detailImageUrl: product.detailImageUrl || '',
        quantityAvailable: product.quantityAvailable || 0,
        quantityPending: product.quantityPending || 0,
        status: product.status || 'active',
        categoryId: product.categoryId || 0
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (productId) {
      await updateProduct(productId, formData);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (productId) {
      await deleteProduct(productId);
    }
    setShowDeleteConfirm(false);
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Đang tải thông tin sản phẩm...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <h2>Không thể tải thông tin sản phẩm</h2>
          <p>{error || 'Sản phẩm không tồn tại'}</p>
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
          <h1 className={styles.title}>{product.name}</h1>
          <p className={styles.subtitle}>Chi tiết sản phẩm</p>
        </div>
        <div className={styles.headerActions}>
          {!isEditing ? (
            <>
              <Button 
                variant="danger"
                size="md"
                onClick={handleDeleteClick}
                disabled={deleteLoading}
              >
                Xóa sản phẩm
              </Button>
              <Button 
                variant="secondary"
                size="md"
                onClick={handleEdit}
              >
                Chỉnh sửa
              </Button>
            </>
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

      {/* Product Info Card */}
      <div className={styles.productInfoCard}>
        {isEditing ? (
          <form onSubmit={handleSubmit} className={styles.editForm}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Tên sản phẩm *</label>
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
                  <option value="active">Có sẵn</option>
                  <option value="inactive">Không có sẵn</option>
                  <option value="pending">Chờ duyệt</option>
                  <option value="out_of_stock">Hết hàng</option>
                </select>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Mô tả sản phẩm</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className={styles.formTextarea}
                rows={3}
                placeholder="Mô tả về sản phẩm..."
              />
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Giá bán *</label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', parseFloat(e.target.value))}
                  className={styles.formInput}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Giá gốc</label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={formData.originalPrice}
                  onChange={(e) => handleInputChange('originalPrice', parseFloat(e.target.value))}
                  className={styles.formInput}
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Số lượng có sẵn *</label>
                <input
                  type="number"
                  min="0"
                  value={formData.quantityAvailable}
                  onChange={(e) => handleInputChange('quantityAvailable', parseInt(e.target.value))}
                  className={styles.formInput}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Số lượng đang chờ</label>
                <input
                  type="number"
                  min="0"
                  value={formData.quantityPending}
                  onChange={(e) => handleInputChange('quantityPending', parseInt(e.target.value))}
                  className={styles.formInput}
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Danh mục ID *</label>
                <input
                  type="number"
                  min="1"
                  value={formData.categoryId}
                  onChange={(e) => handleInputChange('categoryId', parseInt(e.target.value))}
                  className={styles.formInput}
                  required
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>URL hình ảnh chính</label>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                className={styles.formInput}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>URL hình ảnh chi tiết</label>
              <input
                type="url"
                value={formData.detailImageUrl}
                onChange={(e) => handleInputChange('detailImageUrl', e.target.value)}
                className={styles.formInput}
                placeholder="https://example.com/detail-image.jpg"
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
            <div className={styles.productImage}>
              {product.imageUrl ? (
                <Image src={product.imageUrl} alt={product.name} width={300} height={200} />
              ) : (
                <div className={styles.placeholderImage}>
                  <span>📦</span>
                </div>
              )}
            </div>
            <div className={styles.productDetails}>
              <div className={styles.productHeader}>
                <h2 className={styles.productName}>{product.name}</h2>
                <span className={`${styles.statusBadge} ${getStatusColor(product.status)}`}>
                  {getStatusText(product.status)}
                </span>
              </div>
              
              <div className={styles.productInfo}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>💰 Giá bán:</span>
                  <span className={styles.infoValue}>{formatPrice(product.price)}</span>
                </div>
                {product.originalPrice > 0 && (
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>💸 Giá gốc:</span>
                    <span className={styles.infoValue}>{formatPrice(product.originalPrice)}</span>
                  </div>
                )}
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>📦 Có sẵn:</span>
                  <span className={styles.infoValue}>{product.quantityAvailable} sản phẩm</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>⏳ Đang chờ:</span>
                  <span className={styles.infoValue}>{product.quantityPending} sản phẩm</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>🏷️ Danh mục ID:</span>
                  <span className={styles.infoValue}>{product.categoryId}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>📅 Ngày tạo:</span>
                  <span className={styles.infoValue}>{formatDate(product.createdAt)}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>🔄 Cập nhật:</span>
                  <span className={styles.infoValue}>{formatDate(product.updatedAt)}</span>
                </div>
              </div>

              {product.description && (
                <div className={styles.description}>
                  <h3>Mô tả sản phẩm</h3>
                  <p>{product.description}</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Shop Information Card */}
      <div className={styles.shopInfoCard}>
        <div className={styles.sectionHeader}>
          <h2>Thông tin cửa hàng</h2>
          <Button 
            variant="primary"
            size="md"
            onClick={() => handleViewShop(product.shopId)}
          >
            Xem cửa hàng
          </Button>
        </div>
        
        <div className={styles.shopInfo}>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>🏪 Tên cửa hàng:</span>
            <span className={styles.infoValue}>{product.shopName}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>📍 Địa chỉ:</span>
            <span className={styles.infoValue}>{product.shopAddress}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>📞 Điện thoại:</span>
            <span className={styles.infoValue}>{product.shopPhone}</span>
          </div>
        </div>
      </div>

      {/* Product Images Section */}
      {(product.imageUrl || product.detailImageUrl) && (
        <div className={styles.imagesSection}>
          <h2>Hình ảnh sản phẩm</h2>
          <div className={styles.imagesGrid}>
            {product.imageUrl && (
              <div className={styles.imageCard}>
                <h3>Hình ảnh chính</h3>
                <Image src={product.imageUrl} alt={`${product.name} - Hình chính`} width={400} height={300} />
              </div>
            )}
            {product.detailImageUrl && (
              <div className={styles.imageCard}>
                <h3>Hình ảnh chi tiết</h3>
                <div className={styles.detailImagesGrid}>
                  {product.detailImageUrl.split(',').filter(url => url.trim()).map((url, index) => (
                    <Image 
                      key={index}
                      src={url.trim()} 
                      alt={`${product.name} - Hình chi tiết ${index + 1}`} 
                      width={200} 
                      height={150} 
                      className={styles.detailImage}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Xác nhận xóa sản phẩm</h3>
            </div>
            <div className={styles.modalContent}>
              <p>Bạn có chắc chắn muốn xóa sản phẩm <strong>{product.name}</strong> không?</p>
              <p className={styles.warningText}>Hành động này không thể hoàn tác!</p>
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
                loading={deleteLoading}
              >
                Xóa sản phẩm
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Error Display */}
      {deleteError && (
        <div className={styles.errorToast}>
          <p>Lỗi: {deleteError}</p>
          <button onClick={() => window.location.reload()}>✕</button>
        </div>
      )}
    </div>
  );
}
