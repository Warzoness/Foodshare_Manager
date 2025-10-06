'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { useSellerShopProducts, useDeleteSellerProduct, useCreateSellerProduct, useUpdateSellerProduct } from '@/hooks/useApi';
import { SellerProduct } from '@/types';
import styles from './page.module.css';
import sharedStyles from '../shared.module.css';

export default function ProductsManagement() {
  const searchParams = useSearchParams();
  const shopId = searchParams.get('shopId') || '1'; // Get shopId from URL parameter
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<SellerProduct | null>(null);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: 0,
    originalPrice: 0,
    categoryId: 1,
    imageUrl: '',
    detailImageUrl: '',
    quantityAvailable: 0,
    quantityPending: 0,
    status: '1'
  });

  // Function to calculate discount percentage
  const calculateDiscountPercentage = (originalPrice: number, currentPrice: number) => {
    if (originalPrice <= currentPrice) return 0;
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  };

  // Memoize params to avoid recreating object on every render
  // const productsParams = useMemo(() => ({
  //   page: currentPage - 1,
  //   limit: pageSize,
  //   search: searchTerm,
  //   sortBy: 'name',
  //   sortOrder: 'asc' as const
  // }), [currentPage, pageSize, searchTerm]);

  const { data: productsResponse, loading, error, execute: refetchProducts } = useSellerShopProducts(shopId);
  const { execute: deleteProduct, loading: deleting } = useDeleteSellerProduct();
  const { execute: createProduct, loading: creating } = useCreateSellerProduct();
  const { execute: updateProduct, loading: updating } = useUpdateSellerProduct();

  const products = Array.isArray(productsResponse) ? productsResponse : ((productsResponse as unknown as Record<string, unknown>)?.data || []);
  const totalPages = 0; // Will be implemented when database is connected



  const handleDeleteProduct = async (productId: string | number) => {
    if (!productId) {
      console.error('Product ID is undefined');
      return;
    }
    
    if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      await deleteProduct(productId.toString());
      refetchProducts();
    }
  };

  const handleCreateProduct = async () => {
    if (!newProduct.name || !newProduct.description || !newProduct.price || !newProduct.categoryId) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc: Tên, Mô tả, Giá, Category ID');
      return;
    }

    try {
      const productData = {
        shopId: parseInt(shopId),
        categoryId: newProduct.categoryId,
        name: newProduct.name,
        description: newProduct.description,
        price: newProduct.price,
        originalPrice: newProduct.originalPrice || newProduct.price,
        imageUrl: newProduct.imageUrl || '',
        detailImageUrl: newProduct.detailImageUrl || newProduct.imageUrl || '',
        quantityAvailable: newProduct.quantityAvailable,
        quantityPending: newProduct.quantityPending,
        status: newProduct.status
      };

      console.log('Creating product with data:', productData);
      
      const response = await createProduct(productData);
      
      if (response.success) {
        alert('Tạo sản phẩm thành công!');
        // Reset form and close modal
        setNewProduct({
          name: '',
          description: '',
          price: 0,
          originalPrice: 0,
          categoryId: 1,
          imageUrl: '',
          detailImageUrl: '',
          quantityAvailable: 0,
          quantityPending: 0,
          status: '1'
        });
        setShowCreateForm(false);
        refetchProducts();
      } else {
        alert(`Lỗi: ${response.error || 'Không thể tạo sản phẩm'}`);
      }
    } catch (error) {
      console.error('Error creating product:', error);
      alert('Có lỗi xảy ra khi tạo sản phẩm');
    }
  };

  const handleEditProduct = (product: SellerProduct) => {
    setEditingProduct(product);
    setNewProduct({
      name: product.name || '',
      description: product.description || '',
      price: product.price || 0,
      originalPrice: product.originalPrice || 0,
      categoryId: product.categoryId || 1,
      imageUrl: product.imageUrl || '',
      detailImageUrl: product.detailImageUrl || '',
      quantityAvailable: product.quantityAvailable || 0,
      quantityPending: product.quantityPending || 0,
      status: product.status || '1'
    });
    setShowEditForm(true);
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct || !newProduct.name || !newProduct.description || !newProduct.price || !newProduct.categoryId) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc: Tên, Mô tả, Giá, Category ID');
      return;
    }

    try {
      const productData = {
        shopId: parseInt(shopId),
        categoryId: newProduct.categoryId,
        name: newProduct.name,
        description: newProduct.description,
        price: newProduct.price,
        originalPrice: newProduct.originalPrice || newProduct.price,
        imageUrl: newProduct.imageUrl || '',
        detailImageUrl: newProduct.detailImageUrl || newProduct.imageUrl || '',
        quantityAvailable: newProduct.quantityAvailable,
        quantityPending: newProduct.quantityPending,
        status: newProduct.status
      };

      console.log('Updating product with data:', productData);
      
      const response = await updateProduct(editingProduct.id!.toString(), productData);
      
      if (response.success) {
        alert('Cập nhật sản phẩm thành công!');
        setShowEditForm(false);
        setEditingProduct(null);
        setNewProduct({
          name: '',
          description: '',
          price: 0,
          originalPrice: 0,
          categoryId: 1,
          imageUrl: '',
          detailImageUrl: '',
          quantityAvailable: 0,
          quantityPending: 0,
          status: '1'
        });
        refetchProducts();
      } else {
        alert(`Lỗi: ${response.error || 'Không thể cập nhật sản phẩm'}`);
      }
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Có lỗi xảy ra khi cập nhật sản phẩm');
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Show message if no shopId is provided
  if (!searchParams.get('shopId')) {
    return (
      <div className={sharedStyles.pageContainer}>
        <div className={styles.errorContainer}>
          <p className={styles.errorMessage}>Vui lòng chọn cửa hàng để quản lý sản phẩm</p>
          <Button variant="primary" onClick={() => window.location.href = '/seller/store'}>
            Quay lại danh sách cửa hàng
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={sharedStyles.pageContainer}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Đang tải danh sách sản phẩm...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={sharedStyles.pageContainer}>
        <div className={styles.errorContainer}>
          <p className={styles.errorMessage}>Lỗi: {error}</p>
          <Button variant="primary" onClick={() => refetchProducts()}>
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
              style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              ← Quay lại
            </Button>
          </div>
          <h1 className={sharedStyles.pageTitle}>Quản lý sản phẩm</h1>
          <p className={sharedStyles.pageSubtitle}>
            Quản lý menu và sản phẩm của cửa hàng (ID: {shopId})
          </p>
        </div>
        <Button 
          variant="primary" 
          className={sharedStyles.primaryButton}
          onClick={() => setShowCreateForm(true)}
        >
          + Thêm sản phẩm
        </Button>
      </div>

      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Danh mục</label>
          <select 
            className={styles.filterSelect}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">Tất cả danh mục</option>
            <option value="1">Pizza</option>
            <option value="2">Burger</option>
            <option value="3">Salad</option>
            <option value="4">Pasta</option>
          </select>
        </div>
        
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Trạng thái</label>
          <select 
            className={styles.filterSelect}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="1">Đang bán</option>
            <option value="0">Ngừng bán</option>
          </select>
        </div>
        
        <div className={styles.searchGroup}>
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.productsGrid}>
        {loading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <p>Đang tải sản phẩm...</p>
          </div>
        ) : error ? (
          <div className={styles.errorContainer}>
            <p className={styles.errorMessage}>Lỗi: {error}</p>
            <Button variant="primary" onClick={() => refetchProducts()}>
              Thử lại
            </Button>
          </div>
        ) : (Array.isArray(products) && products.length === 0) ? (
          <div className={styles.emptyState}>
            <p>Không có sản phẩm nào</p>
          </div>
        ) : (
          Array.isArray(products) ? products.map((product: SellerProduct, index: number) => (
            <Card key={product.id || `product-${index}`} className={styles.productCard}>
              <div className={styles.productImage}>
                {product.imageUrl ? (
                  <Image
                    src={product.imageUrl}
                    alt={product.name || 'Sản phẩm'}
                    width={200}
                    height={150}
                    className={styles.image}
                  />
                ) : (
                  <div className={styles.noImagePlaceholder}>
                    <div className={styles.noImageIcon}>📷</div>
                    <p className={styles.noImageText}>Chưa có ảnh</p>
                  </div>
                )}
              </div>
              
              <div className={styles.productInfo}>
                <div className={styles.productContent}>
                  <h3 className={styles.productName}>{product.name || 'Tên sản phẩm'}</h3>
                  <p className={styles.productCategory}>Danh mục: {product.categoryId || 'N/A'}</p>
                  <p className={styles.productDescription}>{product.description || 'Không có mô tả'}</p>
                  <div className={styles.productPrice}>
                    {(product.originalPrice || 0) > (product.price || 0) ? (
                      <div className={styles.priceContainer}>
                        <div className={styles.originalPrice}>
                          ₫{(product.originalPrice || 0).toLocaleString()}
                        </div>
                        <div className={styles.currentPrice}>
                          ₫{(product.price || 0).toLocaleString()}
                        </div>
                        <div className={styles.discountBadge}>
                          -{calculateDiscountPercentage(product.originalPrice || 0, product.price || 0)}%
                        </div>
                      </div>
                    ) : (
                      <div className={styles.currentPrice}>
                        ₫{(product.price || 0).toLocaleString()}
                      </div>
                    )}
                  </div>
                  <div className={styles.productStock}>
                    <span>Còn lại: {product.quantityAvailable || 0}</span>
                    <span>Đang chờ: {product.quantityPending || 0}</span>
                  </div>
                </div>
                <div className={`${styles.statusBadge} ${product.status === '1' ? styles.active : styles.inactive}`}>
                  {product.status === '1' ? 'Đang bán' : 'Ngừng bán'}
                </div>
              </div>
              
              <div className={styles.productActions}>
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={() => handleEditProduct(product)}
                  disabled={updating}
                >
                  {updating ? 'Đang sửa...' : 'Sửa'}
                </Button>
                <Button 
                  variant="danger" 
                  size="sm"
                  onClick={() => product.id && handleDeleteProduct(product.id)}
                  disabled={deleting || !product.id}
                >
                  {deleting ? 'Đang xóa...' : 'Xóa'}
                </Button>
              </div>
            </Card>
          )) : null
        )}
      </div>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <Button 
            variant="secondary" 
            className={styles.pageButton}
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Trước
          </Button>
          <div className={styles.pageNumbers}>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = i + 1;
              return (
                <span 
                  key={page}
                  className={`${styles.pageNumber} ${currentPage === page ? styles.active : ''}`}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </span>
              );
            })}
          </div>
          <Button 
            variant="secondary" 
            className={styles.pageButton}
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Sau
          </Button>
        </div>
      )}

      {/* Create Product Modal */}
      {showCreateForm && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2>Thêm sản phẩm mới</h2>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Tên sản phẩm *</label>
              <input
                type="text"
                className={styles.formInput}
                value={newProduct.name}
                onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                placeholder="Nhập tên sản phẩm"
              />
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Mô tả *</label>
              <textarea
                className={styles.formTextarea}
                value={newProduct.description}
                onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                placeholder="Nhập mô tả sản phẩm"
                rows={3}
              />
            </div>
            
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Giá hiện tại (VNĐ) *</label>
                <input
                  type="number"
                  className={styles.formInput}
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({...newProduct, price: parseInt(e.target.value) || 0})}
                  placeholder="0"
                />
              </div>
              
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Giá gốc (VNĐ)</label>
                <input
                  type="number"
                  className={styles.formInput}
                  value={newProduct.originalPrice}
                  onChange={(e) => setNewProduct({...newProduct, originalPrice: parseInt(e.target.value) || 0})}
                  placeholder="0"
                />
              </div>
            </div>
            
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Số lượng có sẵn</label>
                <input
                  type="number"
                  className={styles.formInput}
                  value={newProduct.quantityAvailable}
                  onChange={(e) => setNewProduct({...newProduct, quantityAvailable: parseInt(e.target.value) || 0})}
                  placeholder="0"
                />
              </div>
              
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Số lượng đang chờ</label>
                <input
                  type="number"
                  className={styles.formInput}
                  value={newProduct.quantityPending}
                  onChange={(e) => setNewProduct({...newProduct, quantityPending: parseInt(e.target.value) || 0})}
                  placeholder="0"
                />
              </div>
            </div>
            
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Category ID *</label>
                <input
                  type="number"
                  className={styles.formInput}
                  value={newProduct.categoryId}
                  onChange={(e) => setNewProduct({...newProduct, categoryId: parseInt(e.target.value) || 1})}
                  placeholder="1"
                  min="1"
                />
              </div>
              
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Trạng thái</label>
                <select
                  className={styles.formSelect}
                  value={newProduct.status}
                  onChange={(e) => setNewProduct({...newProduct, status: e.target.value})}
                >
                  <option value="1">Đang bán</option>
                  <option value="0">Ngừng bán</option>
                </select>
              </div>
            </div>
            
            <div className={styles.formGroup}>
              <ImageUpload
                label="Ảnh chính sản phẩm"
                onImageUpload={(url) => setNewProduct({...newProduct, imageUrl: url})}
                currentImage={newProduct.imageUrl}
                className={styles.imageUpload}
              />
            </div>
            
            <div className={styles.formGroup}>
              <ImageUpload
                label="Ảnh phụ sản phẩm"
                multiple={true}
                maxFiles={5}
                onMultipleImageUpload={(urls) => setNewProduct({...newProduct, detailImageUrl: urls.join(',')})}
                currentImages={newProduct.detailImageUrl ? newProduct.detailImageUrl.split(',') : []}
                className={styles.imageUpload}
              />
            </div>
            
            <div className={styles.modalActions}>
              <Button 
                variant="secondary" 
                onClick={() => setShowCreateForm(false)}
                disabled={creating}
              >
                Hủy
              </Button>
              <Button 
                variant="primary" 
                onClick={handleCreateProduct}
                disabled={creating}
              >
                {creating ? 'Đang tạo...' : 'Tạo sản phẩm'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditForm && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2>Sửa sản phẩm</h2>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Tên sản phẩm *</label>
              <input
                type="text"
                className={styles.formInput}
                value={newProduct.name}
                onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                placeholder="Nhập tên sản phẩm"
              />
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Mô tả *</label>
              <textarea
                className={styles.formTextarea}
                value={newProduct.description}
                onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                placeholder="Nhập mô tả sản phẩm"
                rows={3}
              />
            </div>
            
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Giá hiện tại (VNĐ) *</label>
                <input
                  type="number"
                  className={styles.formInput}
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({...newProduct, price: parseInt(e.target.value) || 0})}
                  placeholder="0"
                />
              </div>
              
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Giá gốc (VNĐ)</label>
                <input
                  type="number"
                  className={styles.formInput}
                  value={newProduct.originalPrice}
                  onChange={(e) => setNewProduct({...newProduct, originalPrice: parseInt(e.target.value) || 0})}
                  placeholder="0"
                />
              </div>
            </div>
            
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Số lượng có sẵn</label>
                <input
                  type="number"
                  className={styles.formInput}
                  value={newProduct.quantityAvailable}
                  onChange={(e) => setNewProduct({...newProduct, quantityAvailable: parseInt(e.target.value) || 0})}
                  placeholder="0"
                />
              </div>
              
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Số lượng đang chờ</label>
                <input
                  type="number"
                  className={styles.formInput}
                  value={newProduct.quantityPending}
                  onChange={(e) => setNewProduct({...newProduct, quantityPending: parseInt(e.target.value) || 0})}
                  placeholder="0"
                />
              </div>
            </div>
            
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Category ID *</label>
                <input
                  type="number"
                  className={styles.formInput}
                  value={newProduct.categoryId}
                  onChange={(e) => setNewProduct({...newProduct, categoryId: parseInt(e.target.value) || 1})}
                  placeholder="1"
                  min="1"
                />
              </div>
              
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Trạng thái</label>
                <select
                  className={styles.formSelect}
                  value={newProduct.status}
                  onChange={(e) => setNewProduct({...newProduct, status: e.target.value})}
                >
                  <option value="1">Đang bán</option>
                  <option value="0">Ngừng bán</option>
                </select>
              </div>
            </div>
            
            <div className={styles.formGroup}>
              <ImageUpload
                label="Ảnh chính sản phẩm"
                onImageUpload={(url) => setNewProduct({...newProduct, imageUrl: url})}
                currentImage={newProduct.imageUrl}
                className={styles.imageUpload}
              />
            </div>
            
            <div className={styles.formGroup}>
              <ImageUpload
                label="Ảnh phụ sản phẩm"
                multiple={true}
                maxFiles={5}
                onMultipleImageUpload={(urls) => setNewProduct({...newProduct, detailImageUrl: urls.join(',')})}
                currentImages={newProduct.detailImageUrl ? newProduct.detailImageUrl.split(',') : []}
                className={styles.imageUpload}
              />
            </div>
            
            <div className={styles.modalActions}>
              <Button 
                variant="secondary" 
                onClick={() => {
                  setShowEditForm(false);
                  setEditingProduct(null);
                }}
                disabled={updating}
              >
                Hủy
              </Button>
              <Button 
                variant="primary" 
                onClick={handleUpdateProduct}
                disabled={updating}
              >
                {updating ? 'Đang cập nhật...' : 'Cập nhật sản phẩm'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}