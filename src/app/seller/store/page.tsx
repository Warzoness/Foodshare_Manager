'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useSellerShops, useCreateSellerShop } from '@/hooks/useApi';
import { SellerShop, CreateSellerShopRequest } from '@/types';
import styles from './page.module.css';
import sharedStyles from '../shared.module.css';

export default function StoreList() {
  const { data: shops, loading, error, execute: refetchShops } = useSellerShops();
  const { execute: createShop, loading: creating, success: createSuccess } = useCreateSellerShop();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState<CreateSellerShopRequest>({
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

  const [isDragOver, setIsDragOver] = useState(false);
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Simple image upload function
  const uploadImage = async (file: File) => {
    setUploading(true);
    setUploadError(null);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/images/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        setFormData(prev => ({
          ...prev,
          imageUrl: result.data.secureUrl
        }));
        setUploadProgress(100);
        // Set preview to the uploaded image URL
        setPreviewImage(result.data.secureUrl);
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  // Ensure shops is always an array
  const shopsArray = Array.isArray(shops) ? shops : [];

  // Request location permission and get current position
  useEffect(() => {
    const requestLocationPermission = async () => {
      if (!navigator.geolocation) {
        return;
      }

      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          });
        });

        setFormData(prev => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        }));
        setLocationPermission('granted');
      } catch (error) {
        setLocationPermission('denied');
      }
    };

    requestLocationPermission();
  }, []);

  // Handle image drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const file = files[0];
      
      // Basic file validation
      if (!file.type.startsWith('image/')) {
        alert('Vui lòng chọn file ảnh hợp lệ');
        return;
      }

      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        alert('Kích thước file không được vượt quá 10MB');
        return;
      }

      // Upload image first, then show preview from response
      await uploadImage(file);
    }
  };

  const handleImageInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Basic file validation
      if (!file.type.startsWith('image/')) {
        alert('Vui lòng chọn file ảnh hợp lệ');
        return;
      }

      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        alert('Kích thước file không được vượt quá 10MB');
        return;
      }

      // Upload image first, then show preview from response
      await uploadImage(file);
    }
  };


  const handleManageProducts = (shopId: string) => {
    // Navigate to products management page for this shop
    window.location.href = `/seller/products?shopId=${shopId}`;
  };

  const handleEditShop = (shopId: string) => {
    // Navigate to shop edit page
    window.location.href = `/seller/shops/${shopId}/edit`;
  };

  const handleManageOrders = (shopId: string) => {
    // Navigate to shop orders management page
    window.location.href = `/seller/orders?shopId=${shopId}`;
  };

  const handleInputChange = (field: keyof CreateSellerShopRequest, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCreateShop = async () => {
    if (!formData.name || !formData.address || !formData.phone) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc (Tên, Địa chỉ, Số điện thoại)');
      return;
    }

    await createShop(formData);
  };

  const handleOpenModal = () => {
    setShowCreateModal(true);
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setFormData({
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
    setPreviewImage(null);
  };

  // Handle successful shop creation
  useEffect(() => {
    if (createSuccess) {
      setShowCreateModal(false);
      setFormData({
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
      setPreviewImage(null);
      refetchShops();
    }
  }, [createSuccess, refetchShops]);


  if (loading) {
    return (
      <div className={sharedStyles.pageContainer}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Đang tải danh sách cửa hàng...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={sharedStyles.pageContainer}>
        <div className={styles.errorContainer}>
          <p className={styles.errorMessage}>Lỗi: {error}</p>
          <Button variant="primary" onClick={() => refetchShops()}>
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  // Check if no shops (empty array) or no shop registered
  if (shopsArray.length === 0) {
    return (
      <div className={sharedStyles.pageContainer}>
        <div className={sharedStyles.pageHeader}>
          <h1 className={sharedStyles.pageTitle}>Danh sách cửa hàng</h1>
          <p className={sharedStyles.pageSubtitle}>
            Quản lý các cửa hàng của bạn
          </p>
        </div>

        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🏪</div>
          <h2 className={styles.emptyTitle}>Chưa có cửa hàng nào</h2>
          <p className={styles.emptyMessage}>
            Bạn chưa đăng ký cửa hàng nào. Hãy tạo cửa hàng đầu tiên để bắt đầu kinh doanh.
          </p>
          <div className={styles.emptyActions}>
            <Button variant="primary" onClick={handleOpenModal}>
              + Tạo cửa hàng mới
            </Button>
          </div>
        </div>

        {/* Modal Component */}
        <CreateShopModal
          isOpen={showCreateModal}
          onClose={handleCloseModal}
          formData={formData}
          onInputChange={handleInputChange}
          onSubmit={handleCreateShop}
          creating={creating}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onImageInputChange={handleImageInputChange}
          isDragOver={isDragOver}
          locationPermission={locationPermission}
          uploading={uploading}
          uploadProgress={uploadProgress}
          uploadError={uploadError}
          previewImage={previewImage}
          setPreviewImage={setPreviewImage}
        />
      </div>
    );
  }

  return (
    <div className={sharedStyles.pageContainer}>
      <div className={sharedStyles.pageHeader}>
        <h1 className={sharedStyles.pageTitle}>Danh sách cửa hàng</h1>
        <p className={sharedStyles.pageSubtitle}>
          Quản lý các cửa hàng của bạn
        </p>
      </div>

      {/* Shops Grid */}
      <div className={styles.shopsGrid}>
        {shopsArray.map((shop: SellerShop) => (
          <Card key={shop.id} className={styles.shopCard}>
            <div className={styles.shopImage}>
              {shop.imageUrl ? (
                <Image 
                  src={shop.imageUrl} 
                  alt={shop.name}
                  width={300}
                  height={200}
                  className={styles.shopImg}
                />
              ) : (
                <div className={styles.placeholderImage}>
                  <span>🏪</span>
                </div>
              )}
              {/* {getStatusBadge(shop.status)} */}
            </div>
            
            <div className={styles.shopInfo}>
              <h3 className={styles.shopName}>{shop.name}</h3>
              <p className={styles.shopAddress}>{shop.address}</p>
              <p className={styles.shopPhone}>📞 {shop.phone}</p>
              
              <div className={styles.shopStats}>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Đánh giá:</span>
                  <span className={styles.statValue}>⭐ {shop.rating}/5</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Trạng thái:</span>
                  {/* <span className={styles.statValue}>{getStatusBadge(shop.status)}</span> */}
                </div>
              </div>
              
              <p className={styles.shopDescription}>{shop.description}</p>
            </div>
            
            <div className={styles.shopActions}>
              <Button 
                variant="primary" 
                size="sm"
                onClick={() => handleManageProducts(shop.id.toString())}
              >
                Quản lý sản phẩm
              </Button>
              <Button 
                variant="secondary" 
                size="sm"
                onClick={() => handleManageOrders(shop.id.toString())}
              >
                Quản lý đơn hàng
              </Button>
              <Button 
                variant="secondary" 
                size="sm"
                onClick={() => handleEditShop(shop.id.toString())}
              >
                Chỉnh sửa
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Add Shop Button */}
      <div className={styles.addShopSection}>
        <Button variant="primary" size="lg" onClick={handleOpenModal}>
          + Tạo cửa hàng mới
        </Button>
      </div>

      {/* Modal Component */}
        <CreateShopModal
          isOpen={showCreateModal}
          onClose={handleCloseModal}
          formData={formData}
          onInputChange={handleInputChange}
          onSubmit={handleCreateShop}
          creating={creating}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onImageInputChange={handleImageInputChange}
          isDragOver={isDragOver}
          locationPermission={locationPermission}
          uploading={uploading}
          uploadProgress={uploadProgress}
          uploadError={uploadError}
          previewImage={previewImage}
          setPreviewImage={setPreviewImage}
        />
    </div>
  );
}

// Modal component outside main component
function CreateShopModal({ 
  isOpen, 
  onClose, 
  formData, 
  onInputChange, 
  onSubmit, 
  creating,
  onDragOver,
  onDragLeave,
  onDrop,
  onImageInputChange,
  isDragOver,
  locationPermission,
  uploading,
  uploadProgress,
  uploadError,
  previewImage,
  setPreviewImage
}: {
  isOpen: boolean;
  onClose: () => void;
  formData: CreateSellerShopRequest;
  onInputChange: (field: keyof CreateSellerShopRequest, value: string | number) => void;
  onSubmit: () => void;
  creating: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onImageInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isDragOver: boolean;
  locationPermission: 'granted' | 'denied' | 'prompt';
  uploading: boolean;
  uploadProgress: number;
  uploadError: string | null;
  previewImage: string | null;
  setPreviewImage: (image: string | null) => void;
}) {
  if (!isOpen) return null;

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        backdropFilter: 'blur(4px)'
      }}
    >
      <div style={{
        backgroundColor: 'rgba(30, 41, 59, 0.95)',
        padding: '0',
        borderRadius: '16px',
        minWidth: '500px',
        maxWidth: '700px',
        maxHeight: '90vh',
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        border: '1px solid rgba(84, 166, 92, 0.3)',
        backdropFilter: 'blur(10px)'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '24px 24px 0 24px',
          borderBottom: '1px solid rgba(84, 166, 92, 0.3)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{ 
            margin: '0 0 20px 0', 
            color: '#f1f5f9',
            fontSize: '1.5rem',
            fontWeight: '600'
          }}>
            Tạo cửa hàng mới
          </h2>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.color = '#f1f5f9';
              e.currentTarget.style.backgroundColor = 'rgba(84, 166, 92, 0.1)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.color = '#94a3b8';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            ×
          </button>
              </div>
              
        {/* Modal Body */}
        <div style={{ padding: '24px', maxHeight: '60vh', overflowY: 'auto' }}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              color: '#f1f5f9',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}>
              Tên cửa hàng *
                </label>
                <input
              type="text"
              placeholder="Nhập tên cửa hàng"
              value={formData.name}
              onChange={(e) => onInputChange('name', e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid rgba(84, 166, 92, 0.3)',
                borderRadius: '8px',
                backgroundColor: 'transparent',
                color: '#f1f5f9',
                fontSize: '0.875rem',
                outline: 'none',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#54A65C';
                e.target.style.boxShadow = '0 0 0 3px rgba(84, 166, 92, 0.2)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(84, 166, 92, 0.3)';
                e.target.style.boxShadow = 'none';
              }}
            />
            </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              color: '#f1f5f9',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}>
              Địa chỉ *
              </label>
              <textarea
              placeholder="Nhập địa chỉ cửa hàng"
                rows={3}
              value={formData.address}
              onChange={(e) => onInputChange('address', e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid rgba(84, 166, 92, 0.3)',
                borderRadius: '8px',
                backgroundColor: 'transparent',
                color: '#f1f5f9',
                fontSize: '0.875rem',
                outline: 'none',
                resize: 'vertical',
                minHeight: '80px',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#54A65C';
                e.target.style.boxShadow = '0 0 0 3px rgba(84, 166, 92, 0.2)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(84, 166, 92, 0.3)';
                e.target.style.boxShadow = 'none';
              }}
              />
            </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              color: '#f1f5f9',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}>
              Số điện thoại *
                </label>
                <input
              type="tel"
              placeholder="0123456789"
              value={formData.phone}
              onChange={(e) => onInputChange('phone', e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid rgba(84, 166, 92, 0.3)',
                borderRadius: '8px',
                backgroundColor: 'transparent',
                color: '#f1f5f9',
                fontSize: '0.875rem',
                outline: 'none',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#54A65C';
                e.target.style.boxShadow = '0 0 0 3px rgba(84, 166, 92, 0.2)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(84, 166, 92, 0.3)';
                e.target.style.boxShadow = 'none';
              }}
                />
              </div>
              
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              color: '#f1f5f9',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}>
              Hình ảnh cửa hàng
                </label>
            <div
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              style={{
                width: '100%',
                minHeight: '200px',
                border: `2px dashed ${isDragOver ? '#54A65C' : 'rgba(84, 166, 92, 0.3)'}`,
                borderRadius: '12px',
                backgroundColor: isDragOver ? 'rgba(84, 166, 92, 0.1)' : 'rgba(84, 166, 92, 0.05)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative',
                overflow: 'hidden'
              }}
              onClick={() => document.getElementById('imageInput')?.click()}
            >
              {uploading ? (
                <div style={{ textAlign: 'center', color: '#94a3b8' }}>
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>⏳</div>
                  <div style={{ fontSize: '0.875rem', marginBottom: '8px' }}>
                    Đang tải lên... {uploadProgress}%
                  </div>
                  <div style={{
                    width: '100%',
                    height: '4px',
                    backgroundColor: 'rgba(84, 166, 92, 0.2)',
                    borderRadius: '2px',
                    overflow: 'hidden',
                    marginTop: '8px'
                  }}>
                    <div style={{
                      width: `${uploadProgress}%`,
                      height: '100%',
                      backgroundColor: '#54A65C',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                </div>
              ) : uploadError ? (
                <div style={{ textAlign: 'center', color: '#ef4444' }}>
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>❌</div>
                  <div style={{ fontSize: '0.875rem', marginBottom: '8px' }}>
                    Lỗi tải lên: {uploadError}
                  </div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                    Thử lại hoặc chọn ảnh khác
              </div>
            </div>
              ) : (formData.imageUrl || previewImage) ? (
                <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                  <Image
                    src={previewImage || formData.imageUrl || ''}
                    alt="Preview"
                    width={400}
                    height={200}
                    style={{
                      width: '100%',
                      height: '200px',
                      objectFit: 'cover',
                      borderRadius: '10px'
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '30px',
                    height: '30px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onInputChange('imageUrl', '');
                    setPreviewImage(null);
                  }}
                >
                  ×
                </div>
                {previewImage && !formData.imageUrl && (
                  <div style={{
                    position: 'absolute',
                    bottom: '8px',
                    left: '8px',
                    right: '8px',
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    color: 'white',
                    padding: '8px',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: '500'
                  }}>
                    <div style={{ marginBottom: '4px' }}>
                      Đang tải lên... {uploadProgress}%
                    </div>
                    <div style={{
                      width: '100%',
                      height: '2px',
                      backgroundColor: 'rgba(255, 255, 255, 0.3)',
                      borderRadius: '1px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${uploadProgress}%`,
                        height: '100%',
                        backgroundColor: '#54A65C',
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                  </div>
                )}
                </div>
              ) : (
                <div style={{ textAlign: 'center', color: '#94a3b8' }}>
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>📷</div>
                  <div style={{ fontSize: '0.875rem', marginBottom: '8px' }}>
                    {isDragOver ? 'Thả ảnh vào đây' : 'Kéo thả ảnh hoặc click để chọn'}
                  </div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                    Hỗ trợ: JPG, PNG, GIF, WebP
          </div>
            </div>
              )}
              <input
                id="imageInput"
                type="file"
                accept="image/*"
                onChange={onImageInputChange}
                style={{ display: 'none' }}
              />
            </div>
      </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              color: '#f1f5f9',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}>
              Mô tả
            </label>
            <textarea
              placeholder="Nhập mô tả cửa hàng"
              rows={3}
              value={formData.description}
              onChange={(e) => onInputChange('description', e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid rgba(84, 166, 92, 0.3)',
                borderRadius: '8px',
                backgroundColor: 'transparent',
                color: '#f1f5f9',
                fontSize: '0.875rem',
                outline: 'none',
                resize: 'vertical',
                minHeight: '80px',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#54A65C';
                e.target.style.boxShadow = '0 0 0 3px rgba(84, 166, 92, 0.2)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(84, 166, 92, 0.3)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
          
          {/* Location Status */}
          <div style={{ 
            marginBottom: '20px',
            padding: '12px 16px',
            backgroundColor: locationPermission === 'granted' ? 'rgba(84, 166, 92, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            border: `1px solid ${locationPermission === 'granted' ? 'rgba(84, 166, 92, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <div style={{ fontSize: '20px' }}>
              {locationPermission === 'granted' ? '📍' : '⚠️'}
            </div>
            <div>
              <div style={{ 
                fontSize: '0.875rem', 
                fontWeight: '500',
                color: locationPermission === 'granted' ? '#54A65C' : '#ef4444'
              }}>
                {locationPermission === 'granted' ? 'Vị trí đã được lấy thành công' : 'Không thể lấy vị trí hiện tại'}
          </div>
              <div style={{ 
                fontSize: '0.75rem', 
                color: '#94a3b8',
                marginTop: '2px'
              }}>
                {locationPermission === 'granted' 
                  ? `Lat: ${(formData.latitude || 0).toFixed(6)}, Lng: ${(formData.longitude || 0).toFixed(6)}`
                  : 'Vui lòng cho phép truy cập vị trí để tự động lấy tọa độ'
                }
            </div>
          </div>
        </div>
      </div>

        {/* Modal Footer */}
        <div style={{
          padding: '20px 24px 24px 24px',
          borderTop: '1px solid rgba(84, 166, 92, 0.3)',
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end'
        }}>
          <button 
            onClick={onClose}
            style={{
              padding: '12px 24px',
              backgroundColor: 'transparent',
              color: '#94a3b8',
              border: '1px solid rgba(84, 166, 92, 0.3)',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(84, 166, 92, 0.1)';
              e.currentTarget.style.color = '#f1f5f9';
              e.currentTarget.style.borderColor = 'rgba(84, 166, 92, 0.5)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#94a3b8';
              e.currentTarget.style.borderColor = 'rgba(84, 166, 92, 0.3)';
            }}
          >
            Hủy
          </button>
          <button 
            onClick={onSubmit}
            disabled={creating}
            style={{
              padding: '12px 24px',
              backgroundColor: creating ? 'rgba(84, 166, 92, 0.3)' : 'linear-gradient(135deg, #54A65C, #7bb881)',
              background: creating ? 'rgba(84, 166, 92, 0.3)' : 'linear-gradient(135deg, #54A65C, #7bb881)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: creating ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500',
              transition: 'all 0.2s ease',
              boxShadow: creating ? 'none' : '0 4px 14px 0 rgba(84, 166, 92, 0.3)'
            }}
            onMouseOver={(e) => {
              if (!creating) {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 6px 20px 0 rgba(84, 166, 92, 0.4)';
              }
            }}
            onMouseOut={(e) => {
              if (!creating) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 14px 0 rgba(84, 166, 92, 0.3)';
              }
            }}
          >
            {creating ? 'Đang tạo...' : 'Tạo cửa hàng'}
          </button>
        </div>
      </div>
    </div>
  );
}