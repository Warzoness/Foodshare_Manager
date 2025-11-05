'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import InteractiveMap from '@/components/ui/InteractiveMap';
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
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [mapUrl, setMapUrl] = useState<string>('');
  const [coordinateInput, setCoordinateInput] = useState<string>('');

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

  // Update map URL when coordinates change
  const updateMapUrl = (lat: number, lng: number) => {
    if (lat && lng) {
      const _url = `https://www.google.com/maps/embed/v1/search?key=AIzaSyAuanjPK59SnBdvBf_kTqyACP6xYvqG7-8&q=${lat},${lng}`;
      // For public embed without API key, use this format:
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

  // Handle location change from interactive map
  const handleLocationChange = (lat: number, lng: number, address?: string) => {
    console.log('Location changed:', { lat, lng, address });
    setFormData(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng,
      address: address || prev.address
    }));
    
    setCoordinateInput(`${lat}, ${lng}`);
    updateMapUrl(lat, lng);
  };

  // Request current location when modal opens
  useEffect(() => {
    if (showCreateModal) {
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

          // Set as default location
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
          // Don't show error, let user manually enter coordinates
        }
      };

      requestCurrentLocation();
    }
  }, [showCreateModal]);

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

  // Handle address change from autocomplete
  const handleAddressChange = (address: string) => {
    setFormData(prev => ({
      ...prev,
      address
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
    setMapUrl('');
    setCoordinateInput('');
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
      setMapUrl('');
      setCoordinateInput('');
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
          uploading={uploading}
          uploadProgress={uploadProgress}
          uploadError={uploadError}
          previewImage={previewImage}
          setPreviewImage={setPreviewImage}
          mapUrl={mapUrl}
            coordinateInput={coordinateInput}
            setCoordinateInput={setCoordinateInput}
            onUpdateLocation={handleCoordinateUpdate}
            onLocationChange={handleLocationChange}
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
          uploading={uploading}
          uploadProgress={uploadProgress}
          uploadError={uploadError}
          previewImage={previewImage}
          setPreviewImage={setPreviewImage}
          mapUrl={mapUrl}
            coordinateInput={coordinateInput}
            setCoordinateInput={setCoordinateInput}
            onUpdateLocation={handleCoordinateUpdate}
            onLocationChange={handleLocationChange}
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
  uploading,
  uploadProgress,
  uploadError,
  previewImage,
  setPreviewImage,
  mapUrl,
  coordinateInput,
  setCoordinateInput,
  onUpdateLocation,
  onLocationChange
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
  uploading: boolean;
  uploadProgress: number;
  uploadError: string | null;
  previewImage: string | null;
  setPreviewImage: (image: string | null) => void;
  mapUrl: string;
  coordinateInput: string;
  setCoordinateInput: (input: string) => void;
  onUpdateLocation: () => void;
  onLocationChange: (lat: number, lng: number, address?: string) => void;
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
      <div className={styles.modalContent}>
        {/* Modal Header */}
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            Tạo cửa hàng mới
          </h2>
          <button 
            onClick={onClose}
            className={styles.closeButton}
          >
            ×
          </button>
              </div>
              
        {/* Modal Body */}
        <div className={styles.modalBody}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              Tên cửa hàng *
            </label>
            <input
              type="text"
              placeholder="Nhập tên cửa hàng"
              value={formData.name}
              onChange={(e) => onInputChange('name', e.target.value)}
              className={styles.formInput}
            />
          </div>

          {/*<div className={styles.formGroup}>*/}
          {/*  <label className={styles.formLabel}>*/}
          {/*    Địa chỉ **/}
          {/*  </label>*/}
          {/*  <AddressAutocomplete*/}
          {/*    value={formData.address}*/}
          {/*    onChange={(address) => onInputChange('address', address)}*/}
          {/*    onLocationSelect={(lat, lng, address) => {*/}
          {/*      onInputChange('address', address);*/}
          {/*      onLocationChange(lat, lng, address);*/}
          {/*    }}*/}
          {/*    placeholder="Nhập địa chỉ hoặc vị trí cửa hàng"*/}
          {/*  />*/}
          {/*</div>*/}

          {/* Phone Input moved first */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Số điện thoại *</label>
            <input
                type="tel"
                placeholder="0123456789"
                value={formData.phone}
                onChange={(e) => onInputChange('phone', e.target.value)}
                className={styles.formInput}
            />
          </div>

          {/* Address Input + Search Button */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Địa chỉ *</label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="Nhập địa chỉ cửa hàng"
                value={formData.address}
                onChange={(e) => onInputChange('address', e.target.value)}
                className={styles.formInput}
                style={{ flex: 1 }}
              />
              <Button
                type="button"
                variant="primary"
                onClick={async () => {
                  if (!formData.address.trim()) {
                    alert("Vui lòng nhập địa chỉ trước!");
                    return;
                  }

                  try {
                    // Gọi trực tiếp Google Geocoding API
                    const response = await fetch(`https://mapapis.openmap.vn/v1/geocode/forward?address=${encodeURIComponent(formData.address)}&apikey=WbYy44w6zShkSPqH1gybaEtLcHamjRwM`);
                    
                    if (!response.ok) {
                      throw new Error('Geocoding failed');
                    }
                    
                    const data = await response.json();
                    
                    if (data.status === 'ZERO_RESULTS') {
                      alert('Không tìm thấy địa chỉ này! Vui lòng thử:\n- Địa chỉ chi tiết hơn (số nhà, tên đường, quận/huyện)\n- Hoặc click trực tiếp trên bản đồ để chọn vị trí');
                      return;
                    }
                    
                    if (data.status !== 'OK') {
                      console.error('Google Geocoding API error:', data.status, data.error_message);
                      alert(`Lỗi tìm kiếm địa chỉ: ${data.status}`);
                      return;
                    }
                    
                    const location = data.results[0].geometry.location;
                    console.log('Tìm thấy địa chỉ:', data.results[0].formatted_address);
                    console.log('Tọa độ:', { lat: location.lat, lng: location.lng });
                    
                    onLocationChange(location.lat, location.lng, formData.address);
                  } catch (err) {
                    console.error(err);
                    alert("Lỗi tìm kiếm địa chỉ!");
                  }
                }}
                style={{
                  whiteSpace: 'nowrap'
                }}
              >
                🔍 Tìm vị trí
              </Button>
            </div>
          </div>


          {/* Location Picker - Di chuyển lên gần ô địa chỉ */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              Vị trí cửa hàng *
            </label>
            
            {/* Interactive Map Component */}
            <InteractiveMap
              latitude={formData.latitude || 0}
              longitude={formData.longitude || 0}
              address={formData.address}
              onLocationChange={onLocationChange}
              height={300}
              className={styles.mapContainer}
              mode="create"
            />
          </div>

              
          <div className={styles.imageUploadSection}>
            <label className={styles.imageUploadLabel}>
              Hình ảnh cửa hàng
            </label>
            <div
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              className={`${styles.imageUploadArea} ${isDragOver ? styles.dragOver : ''}`}
              onClick={() => document.getElementById('imageInput')?.click()}
            >
              {uploading ? (
                <div className={styles.imageUploadContent}>
                  <div className={styles.imageUploadIcon}>⏳</div>
                  <div className={styles.imageUploadText}>
                    Đang tải lên... {uploadProgress}%
                  </div>
                  <div className={styles.progressBar}>
                    <div 
                      className={styles.progressFill}
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              ) : uploadError ? (
                <div className={styles.imageUploadContent} style={{ color: '#ef4444' }}>
                  <div className={styles.imageUploadIcon}>❌</div>
                  <div className={styles.imageUploadText}>
                    Lỗi tải lên: {uploadError}
                  </div>
                  <div className={styles.imageUploadSubtext}>
                    Thử lại hoặc chọn ảnh khác
                  </div>
                </div>
              ) : (formData.imageUrl || previewImage) ? (
                <div className={styles.imagePreview}>
                  <Image
                    src={previewImage || formData.imageUrl || ''}
                    alt="Preview"
                    width={400}
                    height={200}
                    className={styles.imagePreview}
                  />
                  <button 
                    className={styles.imageRemoveButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      onInputChange('imageUrl', '');
                      setPreviewImage(null);
                    }}
                  >
                    ×
                  </button>
                  {previewImage && !formData.imageUrl && (
                    <div className={styles.imageUploadProgress}>
                      <div>
                        Đang tải lên... {uploadProgress}%
                      </div>
                      <div className={styles.progressBar}>
                        <div 
                          className={styles.progressFill}
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className={styles.imageUploadContent}>
                  <div className={styles.imageUploadIcon}>📷</div>
                  <div className={styles.imageUploadText}>
                    {isDragOver ? 'Thả ảnh vào đây' : 'Kéo thả ảnh hoặc click để chọn'}
                  </div>
                  <div className={styles.imageUploadSubtext}>
                    Hỗ trợ: JPG, PNG, GIF, WebP
                  </div>
                </div>
              )}
              <input
                id="imageInput"
                type="file"
                accept="image/*"
                onChange={onImageInputChange}
                className={styles.imageUploadInput}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              Mô tả
            </label>
            <textarea
              placeholder="Nhập mô tả cửa hàng"
              rows={3}
              value={formData.description}
              onChange={(e) => onInputChange('description', e.target.value)}
              className={styles.formTextarea}
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className={styles.modalFooter}>
          <button 
            onClick={onClose}
            className={`${styles.modalButton} ${styles.modalButtonSecondary}`}
          >
            Hủy
          </button>
          <button 
            onClick={onSubmit}
            disabled={creating}
            className={`${styles.modalButton} ${styles.modalButtonPrimary}`}
          >
            {creating ? 'Đang tạo...' : 'Tạo cửa hàng'}
          </button>
        </div>
      </div>
    </div>
  );
}