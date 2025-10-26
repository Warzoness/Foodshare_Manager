'use client';

import { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { useSellerShopProducts, useDeleteSellerProduct, useCreateSellerProduct, useUpdateSellerProduct } from '@/hooks/useApi';
import { SellerProduct } from '@/types';
import { VietnameseValidator } from '@/lib/validation';
import styles from './page.module.css';

export default function ProductsManagement() {
  const searchParams = useSearchParams();
  const shopId = searchParams.get('shopId') || '1';
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<SellerProduct | null>(null);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    categoryId: 1,
    imageUrl: '',
    detailImageUrl: '',
    detailImages: [] as string[],
    quantityAvailable: '',
    quantityPending: '',
    status: '1'
  });

  // Validation states
  const [priceError, setPriceError] = useState('');
  const [originalPriceError, setOriginalPriceError] = useState('');
  const [quantityError, setQuantityError] = useState('');

  // Validation functions
  const validatePrice = (value: string) => {
    const result = VietnameseValidator.validatePrice(value);
    setPriceError(result.message);
    return result.isValid;
  };

  const validateOriginalPrice = (value: string) => {
    if (!value.trim()) {
      setOriginalPriceError('');
      return true; // Original price is optional
    }
    const result = VietnameseValidator.validatePrice(value);
    if (!result.isValid) {
      setOriginalPriceError(result.message);
      return false;
    }
    const price = parseFloat(newProduct.price);
    if (!isNaN(price) && parseFloat(value) <= price) {
      setOriginalPriceError('Giá gốc phải lớn hơn giá bán');
      return false;
    }
    setOriginalPriceError('');
    return true;
  };

  const validateQuantity = (value: string) => {
    const result = VietnameseValidator.validateQuantity(value);
    setQuantityError(result.message);
    return result.isValid;
  };

  const isFormValid = () => {
    return !priceError && !originalPriceError && !quantityError && 
           newProduct.name.trim() && newProduct.price.trim() && newProduct.quantityAvailable.trim();
  };

  // Memoize pagination params
  const paginationParams = useMemo(() => ({
    page: currentPage,
    size: pageSize,
    sortBy,
    sortDirection
  }), [currentPage, pageSize, sortBy, sortDirection]);

  const { data: productsResponse, loading, error: _error, execute: refetchProducts } = useSellerShopProducts(shopId, paginationParams);
  const { execute: deleteProduct, loading: deleting } = useDeleteSellerProduct();
  const { execute: createProduct, loading: creating } = useCreateSellerProduct();
  const { execute: updateProduct, loading: updating } = useUpdateSellerProduct();

  // Extract data from response
  const products = useMemo(() => productsResponse?.content || [], [productsResponse?.content]);
  const totalElements = productsResponse?.totalElements || 0;
  const totalPages = productsResponse?.totalPages || 0;
  const isFirst = productsResponse?.first || false;
  const isLast = productsResponse?.last || false;

  // Filter products based on search and filters
  const filteredProducts = useMemo(() => {
    return products.filter((product: SellerProduct) => {
      const matchesSearch = !searchTerm || 
        (product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         product.description?.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = !categoryFilter || product.categoryId?.toString() === categoryFilter;
      const matchesStatus = !statusFilter || product.status === statusFilter;
      
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, searchTerm, categoryFilter, statusFilter]);

  // Handlers
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('desc');
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(0);
  };

  const handleEditProduct = (product: SellerProduct) => {
    setEditingProduct(product);
    const detailImages = product.detailImageUrl ? product.detailImageUrl.split(',').filter(url => url.trim()) : [];
    setNewProduct({
      name: product.name || '',
      description: product.description || '',
      price: product.price ? product.price.toString() : '',
      originalPrice: product.originalPrice ? product.originalPrice.toString() : '',
      categoryId: product.categoryId || 1,
      imageUrl: product.imageUrl || '',
      detailImageUrl: product.detailImageUrl || '',
      detailImages: detailImages,
      quantityAvailable: product.quantityAvailable ? product.quantityAvailable.toString() : '',
      quantityPending: product.quantityPending ? product.quantityPending.toString() : '',
      status: product.status || '1'
    });
    // Reset validation states when opening edit form
    setPriceError('');
    setOriginalPriceError('');
    setQuantityError('');
    setShowEditForm(true);
  };

  const handleDeleteProduct = async (productId: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      try {
        await deleteProduct(productId.toString());
        refetchProducts();
      } catch (_error) {
      }
    }
  };

  const handleCreateProduct = async () => {
    // Validate all fields before submitting
    const isPriceValid = validatePrice(newProduct.price);
    const isOriginalPriceValid = validateOriginalPrice(newProduct.originalPrice);
    const isQuantityValid = validateQuantity(newProduct.quantityAvailable);

    if (!isPriceValid || !isOriginalPriceValid || !isQuantityValid) {
      return; // Don't submit if validation fails
    }

    try {
      const productData = {
        ...newProduct,
        price: parseFloat(newProduct.price),
        originalPrice: newProduct.originalPrice ? parseFloat(newProduct.originalPrice) : 0,
        quantityAvailable: parseInt(newProduct.quantityAvailable),
        quantityPending: newProduct.quantityPending ? parseInt(newProduct.quantityPending) : 0,
        shopId: parseInt(shopId),
        detailImageUrl: newProduct.detailImages.join(',')
      };
      await createProduct(productData);
      setShowCreateForm(false);
      setNewProduct({
        name: '',
        description: '',
        price: '',
        originalPrice: '',
        categoryId: 1,
        imageUrl: '',
        detailImageUrl: '',
        detailImages: [],
        quantityAvailable: '',
        quantityPending: '',
        status: '1'
      });
      // Reset validation states
      setPriceError('');
      setOriginalPriceError('');
      setQuantityError('');
        refetchProducts();
    } catch (_error) {
    }
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct?.id) return;
    
    // Validate all fields before submitting
    const isPriceValid = validatePrice(newProduct.price);
    const isOriginalPriceValid = validateOriginalPrice(newProduct.originalPrice);
    const isQuantityValid = validateQuantity(newProduct.quantityAvailable);

    if (!isPriceValid || !isOriginalPriceValid || !isQuantityValid) {
      return; // Don't submit if validation fails
    }
    
    try {
      const productData = {
        ...newProduct,
        price: parseFloat(newProduct.price),
        originalPrice: newProduct.originalPrice ? parseFloat(newProduct.originalPrice) : 0,
        quantityAvailable: parseInt(newProduct.quantityAvailable),
        quantityPending: newProduct.quantityPending ? parseInt(newProduct.quantityPending) : 0,
        detailImageUrl: newProduct.detailImages.join(',')
      };
      await updateProduct(editingProduct.id.toString(), productData);
      setShowEditForm(false);
      setEditingProduct(null);
      // Reset validation states
      setPriceError('');
      setOriginalPriceError('');
      setQuantityError('');
      refetchProducts();
    } catch (_error) {
    }
  };

  const calculateDiscountPercentage = (original: number, current: number) => {
    if (original <= current) return 0;
    return Math.round(((original - current) / original) * 100);
  };

  if (!shopId) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <h2>Vui lòng chọn cửa hàng để quản lý sản phẩm</h2>
          <Button onClick={() => window.location.href = '/seller/store'}>
            Quay lại danh sách cửa hàng
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.breadcrumb}>
            <Button 
              variant="ghost" 
              onClick={() => window.location.href = '/seller/store'}
              className={styles.backButton}
            >
              ← Quay lại
            </Button>
          </div>
          <div className={styles.titleSection}>
            <h1 className={styles.title}>Quản lý sản phẩm</h1>
            <p className={styles.subtitle}>Cửa hàng #{shopId}</p>
          </div>
        </div>
        <Button 
          className={styles.addButton}
          onClick={() => setShowCreateForm(true)}
        >
          + Thêm sản phẩm
        </Button>
      </div>

      {/* Stats Overview */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="9" cy="9" r="2"/>
              <path d="M21 15l-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
            </svg>
          </div>
          <div className={styles.statInfo}>
            <h3>Tổng sản phẩm</h3>
            <p className={styles.statNumber}>{totalElements}</p>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20,6 9,17 4,12"/>
            </svg>
          </div>
          <div className={styles.statInfo}>
            <h3>Đang bán</h3>
            <p className={styles.statNumber}>{products.filter((p: SellerProduct) => p.status === '1').length}</p>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="6" y="4" width="4" height="16"/>
              <rect x="14" y="4" width="4" height="16"/>
            </svg>
          </div>
          <div className={styles.statInfo}>
            <h3>Ngừng bán</h3>
            <p className={styles.statNumber}>{products.filter((p: SellerProduct) => p.status === '0').length}</p>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
            </svg>
          </div>
          <div className={styles.statInfo}>
            <h3>Trang hiện tại</h3>
            <p className={styles.statNumber}>{currentPage + 1} / {totalPages}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filtersCard}>
        <div className={styles.filtersHeader}>
          <h2>Bộ lọc và tìm kiếm</h2>
        </div>
        <div className={styles.filtersContent}>
          <div className={styles.searchBox}>
            <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          
          <div className={styles.filterControls}>
          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
              className={styles.filterSelect}
          >
            <option value="">Tất cả danh mục</option>
            <option value="1">Pizza</option>
            <option value="2">Burger</option>
            <option value="3">Salad</option>
            <option value="4">Pasta</option>
          </select>
        
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
              className={styles.filterSelect}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="1">Đang bán</option>
            <option value="0">Ngừng bán</option>
          </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="createdAt">Sắp xếp theo ngày tạo</option>
              <option value="name">Sắp xếp theo tên</option>
              <option value="price">Sắp xếp theo giá</option>
              <option value="quantityAvailable">Sắp xếp theo số lượng</option>
            </select>
            
            <select
              value={sortDirection}
              onChange={(e) => setSortDirection(e.target.value as 'asc' | 'desc')}
              className={styles.filterSelect}
            >
              <option value="desc">Giảm dần</option>
              <option value="asc">Tăng dần</option>
            </select>
        </div>
        </div>
      </div>

      {/* Products Table */}
      <div className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <h2>Danh sách sản phẩm ({filteredProducts.length})</h2>
        </div>
        
        {loading ? (
          <div className={styles.loadingState}>
            <div className={styles.spinner}></div>
            <p>Đang tải sản phẩm...</p>
          </div>
        ) : _error ? (
          <div className={styles.errorState}>
            <svg className={styles.errorIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
            <h3>Lỗi tải dữ liệu</h3>
            <p>{_error}</p>
            <Button onClick={() => refetchProducts()}>Thử lại</Button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className={styles.emptyState}>
            <svg className={styles.emptyIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="9" cy="9" r="2"/>
              <path d="M21 15l-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
            </svg>
            <h3>Không có sản phẩm nào</h3>
            <p>
              {searchTerm || categoryFilter || statusFilter
                ? 'Không tìm thấy sản phẩm phù hợp với bộ lọc'
                : 'Chưa có sản phẩm nào trong cửa hàng'
              }
            </p>
            <Button onClick={() => setShowCreateForm(true)}>Thêm sản phẩm đầu tiên</Button>
          </div>
        ) : (
          <div className={styles.tableContainer}>
            <table className={styles.productsTable}>
              <thead>
                <tr>
                  <th className={styles.tableHeaderCell}>
                    <button 
                      className={styles.sortButton}
                      onClick={() => handleSort('name')}
                    >
                      Sản phẩm
                      {sortBy === 'name' && (
                        <span className={styles.sortIcon}>
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </button>
                  </th>
                  <th className={`${styles.tableHeaderCell} ${styles.hideOnMobile}`}>
                    <button 
                      className={styles.sortButton}
                      onClick={() => handleSort('categoryId')}
                    >
                      Danh mục
                      {sortBy === 'categoryId' && (
                        <span className={styles.sortIcon}>
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </button>
                  </th>
                  <th className={`${styles.tableHeaderCell} ${styles.hideOnMobile}`}>
                    <button 
                      className={styles.sortButton}
                      onClick={() => handleSort('price')}
                    >
                      Giá
                      {sortBy === 'price' && (
                        <span className={styles.sortIcon}>
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </button>
                  </th>
                  <th className={`${styles.tableHeaderCell} ${styles.hideOnMobile}`}>
                    <button 
                      className={styles.sortButton}
                      onClick={() => handleSort('quantityAvailable')}
                    >
                      Số lượng
                      {sortBy === 'quantityAvailable' && (
                        <span className={styles.sortIcon}>
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </button>
                  </th>
                  <th className={`${styles.tableHeaderCell} ${styles.hideOnMobile}`}>
                    <button 
                      className={styles.sortButton}
                      onClick={() => handleSort('status')}
                    >
                      Trạng thái
                      {sortBy === 'status' && (
                        <span className={styles.sortIcon}>
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </button>
                  </th>
                  <th className={`${styles.tableHeaderCell} ${styles.hideOnMobile}`}>Hình chi tiết</th>
                  <th className={styles.tableHeaderCell}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product: SellerProduct, index: number) => (
                  <tr key={product.id || `product-${index}`} className={styles.tableRow}>
                    <td className={styles.tableCell}>
                      <div className={styles.productInfo}>
                        <div className={styles.productImage}>
                          {product.imageUrl ? (
                            <Image
                              src={product.imageUrl}
                              alt={product.name || 'Sản phẩm'}
                              width={60}
                              height={60}
                              className={styles.image}
                            />
                          ) : (
                            <div className={styles.noImage}>
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                                <circle cx="8.5" cy="8.5" r="1.5"/>
                                <polyline points="21,15 16,10 5,21"/>
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className={styles.productDetails}>
                          <h3 className={styles.productName}>{product.name || 'Tên sản phẩm'}</h3>
                          <p className={styles.productDescription}>
                            {product.description || 'Không có mô tả'}
                          </p>
                          
                          {/* Mobile-only info */}
                          <div className={styles.mobileOnlyInfo}>
                            <div className={styles.mobileCategory}>
                              📂 Danh mục {product.categoryId || 'N/A'}
                            </div>
                            <div className={styles.mobilePrice}>
                              💰 {(product.originalPrice || 0) > (product.price || 0) ? (
                                <div className={styles.mobilePriceSection}>
                                  <span className={styles.mobileOriginalPrice}>
                                    ₫{(product.originalPrice || 0).toLocaleString()}
                                  </span>
                                  <span className={styles.mobileCurrentPrice}>
                                    ₫{(product.price || 0).toLocaleString()}
                                  </span>
                                  <span className={styles.mobileDiscount}>
                                    -{calculateDiscountPercentage(product.originalPrice || 0, product.price || 0)}%
                                  </span>
                                </div>
                              ) : (
                                <span className={styles.mobileCurrentPrice}>
                                  ₫{(product.price || 0).toLocaleString()}
                                </span>
                              )}
                            </div>
                            <div className={styles.mobileQuantity}>
                              📦 Còn lại: {product.quantityAvailable || 0} | Đang chờ: {product.quantityPending || 0}
                            </div>
                            <div className={styles.mobileStatus}>
                              <span className={`${styles.mobileStatusBadge} ${product.status === '1' ? styles.active : styles.inactive}`}>
                                {product.status === '1' ? '🟢 Đang bán' : '🔴 Ngừng bán'}
                              </span>
                            </div>
                            {product.detailImageUrl && (
                              <div className={styles.mobileDetailImages}>
                                🖼️ {product.detailImageUrl.split(',').filter(url => url.trim()).length} hình chi tiết
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className={`${styles.tableCell} ${styles.hideOnMobile}`}>
                      <span className={styles.category}>
                        Danh mục {product.categoryId || 'N/A'}
                      </span>
                    </td>
                    <td className={`${styles.tableCell} ${styles.hideOnMobile}`}>
                      <div className={styles.priceSection}>
                        {(product.originalPrice || 0) > (product.price || 0) ? (
                          <div className={styles.discountPrice}>
                            <span className={styles.originalPrice}>
                              ₫{(product.originalPrice || 0).toLocaleString()}
                            </span>
                            <span className={styles.currentPrice}>
                              ₫{(product.price || 0).toLocaleString()}
                            </span>
                            <span className={styles.discount}>
                              -{calculateDiscountPercentage(product.originalPrice || 0, product.price || 0)}%
                            </span>
                      </div>
                    ) : (
                          <span className={styles.currentPrice}>
                        ₫{(product.price || 0).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className={`${styles.tableCell} ${styles.hideOnMobile}`}>
                      <div className={styles.quantityInfo}>
                        <div className={styles.quantityItem}>
                          <span>Còn lại: {product.quantityAvailable || 0}</span>
                  </div>
                        <div className={styles.quantityItem}>
                    <span>Đang chờ: {product.quantityPending || 0}</span>
                  </div>
                </div>
                    </td>
                    <td className={`${styles.tableCell} ${styles.hideOnMobile}`}>
                      <span className={`${styles.statusBadge} ${product.status === '1' ? styles.active : styles.inactive}`}>
                  {product.status === '1' ? 'Đang bán' : 'Ngừng bán'}
                      </span>
                    </td>
                    <td className={`${styles.tableCell} ${styles.hideOnMobile}`}>
                      <div className={styles.detailImagesContainer}>
                        {product.detailImageUrl ? (
                          <div className={styles.detailImagesGrid}>
                            {(() => {
                              const images = product.detailImageUrl.split(',').filter(url => url.trim());
                              const displayImages = images.slice(0, 3);
                              const remainingCount = images.length - 3;
                              
                              return (
                                <>
                                  {displayImages.map((url, index) => (
                                    <Image 
                                      key={index}
                                      src={url.trim()} 
                                      alt={`${product.name} - Hình chi tiết ${index + 1}`} 
                                      width={40} 
                                      height={40} 
                                      className={styles.detailImageThumbnail}
                                    />
                                  ))}
                                  {remainingCount > 0 && (
                                    <div className={styles.moreImagesIndicator}>
                                      +{remainingCount}
                                    </div>
                                  )}
                                </>
                              );
                            })()}
                          </div>
                        ) : (
                          <span className={styles.noDetailImages}>Không có</span>
                        )}
                      </div>
                    </td>
                    <td className={styles.tableCell}>
                      <div className={styles.actions}>
                <Button 
                          variant="outline" 
                  size="sm"
                  onClick={() => handleEditProduct(product)}
                  disabled={updating}
                          className={styles.editButton}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                          Sửa
                </Button>
                <Button 
                  variant="danger" 
                  size="sm"
                  onClick={() => product.id && handleDeleteProduct(product.id)}
                  disabled={deleting || !product.id}
                          className={styles.deleteButton}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3,6 5,6 21,6"/>
                            <path d="M19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"/>
                          </svg>
                          Xóa
                </Button>
              </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <div className={styles.paginationInfo}>
            <span>
              Hiển thị {currentPage * pageSize + 1} - {Math.min((currentPage + 1) * pageSize, totalElements)} 
              trong tổng số {totalElements} sản phẩm
            </span>
          </div>
          
          <div className={styles.paginationControls}>
            <select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(parseInt(e.target.value))}
              className={styles.pageSizeSelect}
            >
              <option value={10}>10/trang</option>
              <option value={20}>20/trang</option>
              <option value={50}>50/trang</option>
              <option value={100}>100/trang</option>
            </select>
            
            <div className={styles.pageButtons}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(0)}
                disabled={isFirst}
              >
                Đầu
              </Button>
          <Button 
                variant="outline"
                size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
                disabled={isFirst}
          >
            Trước
          </Button>
              
          <div className={styles.pageNumbers}>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let page;
                  if (totalPages <= 5) {
                    page = i;
                  } else if (currentPage <= 2) {
                    page = i;
                  } else if (currentPage >= totalPages - 3) {
                    page = totalPages - 5 + i;
                  } else {
                    page = currentPage - 2 + i;
                  }

              return (
                    <button
                  key={page}
                  className={`${styles.pageNumber} ${currentPage === page ? styles.active : ''}`}
                  onClick={() => handlePageChange(page)}
                >
                      {page + 1}
                    </button>
              );
            })}
          </div>
              
          <Button 
                variant="outline"
                size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
                disabled={isLast}
          >
            Sau
          </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(totalPages - 1)}
                disabled={isLast}
              >
                Cuối
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Create Product Modal */}
      {showCreateForm && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
            <h2>Thêm sản phẩm mới</h2>
              <button 
                className={styles.closeButton}
                onClick={() => setShowCreateForm(false)}
              >
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
            <div className={styles.formGroup}>
                <label>Tên sản phẩm</label>
              <input
                type="text"
                value={newProduct.name}
                onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  className={styles.formInput}
              />
            </div>
            
            <div className={styles.formGroup}>
                <label>Mô tả</label>
              <textarea
                value={newProduct.description}
                onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                  className={styles.formTextarea}
                rows={3}
              />
            </div>
            
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Giá hiện tại</label>
                <input
                  type="text"
                  value={newProduct.price}
                  onChange={(e) => {
                    setNewProduct({...newProduct, price: e.target.value});
                    validatePrice(e.target.value);
                  }}
                  onBlur={(e) => validatePrice(e.target.value)}
                  className={`${styles.formInput} ${priceError ? styles.inputError : ''}`}
                  placeholder="Nhập giá bán"
                />
                {priceError && <div className={styles.errorMessage}>{priceError}</div>}
              </div>
              <div className={styles.formGroup}>
                <label>Giá gốc</label>
                <input
                  type="text"
                  value={newProduct.originalPrice}
                  onChange={(e) => {
                    setNewProduct({...newProduct, originalPrice: e.target.value});
                    validateOriginalPrice(e.target.value);
                  }}
                  onBlur={(e) => validateOriginalPrice(e.target.value)}
                  className={`${styles.formInput} ${originalPriceError ? styles.inputError : ''}`}
                  placeholder="Nhập giá gốc"
                />
                {originalPriceError && <div className={styles.errorMessage}>{originalPriceError}</div>}
              </div>
            </div>
            
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Số lượng có sẵn</label>
                <input
                  type="text"
                  value={newProduct.quantityAvailable}
                  onChange={(e) => {
                    setNewProduct({...newProduct, quantityAvailable: e.target.value});
                    validateQuantity(e.target.value);
                  }}
                  onBlur={(e) => validateQuantity(e.target.value)}
                  className={`${styles.formInput} ${quantityError ? styles.inputError : ''}`}
                  placeholder="Nhập số lượng"
                />
                {quantityError && <div className={styles.errorMessage}>{quantityError}</div>}
              </div>
              </div>
              
              <div className={styles.formGroup}>
                <ImageUpload
                  label="Hình ảnh sản phẩm"
                  currentImage={newProduct.imageUrl}
                  onImageUpload={(url) => setNewProduct({...newProduct, imageUrl: url})}
                  className={styles.imageUploadField}
                />
              </div>
              
              <div className={styles.formGroup}>
                <ImageUpload
                  label="Hình ảnh chi tiết"
                  multiple={true}
                  maxFiles={5}
                  currentImages={newProduct.detailImages}
                  onMultipleImageUpload={(urls) => setNewProduct({...newProduct, detailImages: urls})}
                  className={styles.imageUploadField}
                />
              </div>
            </div>
            <div className={styles.modalFooter}>
              <Button 
                variant="outline" 
                onClick={() => setShowCreateForm(false)}
              >
                Hủy
              </Button>
              <Button 
                onClick={handleCreateProduct}
                disabled={creating || !isFormValid()}
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
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
            <h2>Sửa sản phẩm</h2>
              <button 
                className={styles.closeButton}
                onClick={() => setShowEditForm(false)}
              >
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label>Tên sản phẩm</label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  className={styles.formInput}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Mô tả</label>
                <textarea
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                  className={styles.formTextarea}
                  rows={3}
                />
            </div>
            
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Giá hiện tại</label>
                <input
                  type="text"
                  value={newProduct.price}
                  onChange={(e) => {
                    setNewProduct({...newProduct, price: e.target.value});
                    validatePrice(e.target.value);
                  }}
                  onBlur={(e) => validatePrice(e.target.value)}
                  className={`${styles.formInput} ${priceError ? styles.inputError : ''}`}
                  placeholder="Nhập giá bán"
                />
                {priceError && <div className={styles.errorMessage}>{priceError}</div>}
              </div>
              <div className={styles.formGroup}>
                <label>Giá gốc</label>
                <input
                  type="text"
                  value={newProduct.originalPrice}
                  onChange={(e) => {
                    setNewProduct({...newProduct, originalPrice: e.target.value});
                    validateOriginalPrice(e.target.value);
                  }}
                  onBlur={(e) => validateOriginalPrice(e.target.value)}
                  className={`${styles.formInput} ${originalPriceError ? styles.inputError : ''}`}
                  placeholder="Nhập giá gốc"
                />
                {originalPriceError && <div className={styles.errorMessage}>{originalPriceError}</div>}
              </div>
            </div>
            
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Số lượng có sẵn</label>
                <input
                  type="text"
                  value={newProduct.quantityAvailable}
                  onChange={(e) => {
                    setNewProduct({...newProduct, quantityAvailable: e.target.value});
                    validateQuantity(e.target.value);
                  }}
                  onBlur={(e) => validateQuantity(e.target.value)}
                  className={`${styles.formInput} ${quantityError ? styles.inputError : ''}`}
                  placeholder="Nhập số lượng"
                />
                {quantityError && <div className={styles.errorMessage}>{quantityError}</div>}
              </div>
              <div className={styles.formGroup}>
                  <label>Trạng thái</label>
                <select
                  value={newProduct.status}
                  onChange={(e) => setNewProduct({...newProduct, status: e.target.value})}
                    className={styles.formSelect}
                >
                  <option value="1">Đang bán</option>
                  <option value="0">Ngừng bán</option>
                </select>
              </div>
            </div>
            
            <div className={styles.formGroup}>
              <ImageUpload
                label="Hình ảnh sản phẩm"
                currentImage={newProduct.imageUrl}
                onImageUpload={(url) => setNewProduct({...newProduct, imageUrl: url})}
                className={styles.imageUploadField}
              />
            </div>
            
            <div className={styles.formGroup}>
              <ImageUpload
                label="Hình ảnh chi tiết"
                multiple={true}
                maxFiles={5}
                currentImages={newProduct.detailImages}
                onMultipleImageUpload={(urls) => setNewProduct({...newProduct, detailImages: urls})}
                className={styles.imageUploadField}
              />
            </div>
            </div>
            <div className={styles.modalFooter}>
              <Button 
                variant="outline" 
                onClick={() => setShowEditForm(false)}
              >
                Hủy
              </Button>
              <Button 
                onClick={handleUpdateProduct}
                disabled={updating || !isFormValid()}
              >
                {updating ? 'Đang cập nhật...' : 'Cập nhật'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}