'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useSellerShop, useUpdateSellerShop } from '@/hooks/useApi';
import { UpdateSellerShopRequest } from '@/types';
import styles from './page.module.css';
import sharedStyles from '../../../shared.module.css';

interface EditShopPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditShopPage({ params }: EditShopPageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const shopId = resolvedParams.id;
  
  const { data: shop, loading: shopLoading, error: shopError, execute: refetchShop } = useSellerShop(shopId);
  const { execute: updateShop, loading: updating, success: updateSuccess } = useUpdateSellerShop();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const [formData, setFormData] = useState<UpdateSellerShopRequest>({
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

  // Update map URL when coordinates change
  const updateMapUrl = (lat: number, lng: number) => {
    if (lat && lng) {
      const _url = `https://www.google.com/maps/embed/v1/search?key=YOUR_API_KEY&q=${lat},${lng}`;
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

  // Load shop data when component mounts
  useEffect(() => {
    if (shopId) {
      refetchShop();
    }
  }, [shopId, refetchShop]);

  // Populate form when shop data is loaded
  useEffect(() => {
    if (shop) {
      const lat = shop.latitude || 0;
      const lng = shop.longitude || 0;
      
      setFormData({
        name: shop.name || '',
        address: shop.address || '',
        phone: shop.phone || '',
        imageUrl: shop.imageUrl || '',
        latitude: lat,
        longitude: lng,
        description: shop.description || '',
        rating: shop.rating || 0,
        status: shop.status || '1'
      });
      
      // Update coordinate input
      setCoordinateInput(`${lat}, ${lng}`);
      
      // Update map URL
      updateMapUrl(lat, lng);
    }
  }, [shop]);

  // Request current location on component mount
  useEffect(() => {
    const requestCurrentLocation = async () => {
      if (!navigator.geolocation) {
        console.log('Geolocation is not supported by this browser.');
        return;
      }

      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000 // Cache for 1 minute
          });
        });

        // Only set if formData hasn't been modified yet (default location)
        if (formData.latitude === 0 && formData.longitude === 0) {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          setFormData(prev => ({
            ...prev,
            latitude: lat,
            longitude: lng
          }));
          
          setCoordinateInput(`${lat}, ${lng}`);
          updateMapUrl(lat, lng);
        }
      } catch (error) {
        console.log('Geolocation error:', error);
        // Don't show error, let user manually enter coordinates
      }
    };

    requestCurrentLocation();
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

  const handleInputChange = (field: keyof UpdateSellerShopRequest, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleUpdateShop = async () => {
    if (!formData.name || !formData.address || !formData.phone) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc (Tên, Địa chỉ, Số điện thoại)');
      return;
    }

    await updateShop(shopId, formData);
  };

  const handleCancel = () => {
    router.back();
  };

  // Handle successful shop update
  useEffect(() => {
    if (updateSuccess) {
      alert('Cập nhật cửa hàng thành công!');
      router.push('/seller/store');
    }
  }, [updateSuccess, router]);


  if (shopLoading) {
    return (
      <div className={sharedStyles.pageContainer}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Đang tải thông tin cửa hàng...</p>
        </div>
      </div>
    );
  }

  if (shopError) {
    return (
      <div className={sharedStyles.pageContainer}>
        <div className={styles.errorContainer}>
          <p className={styles.errorMessage}>Lỗi: {shopError}</p>
          <Button variant="primary" onClick={() => refetchShop()}>
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className={sharedStyles.pageContainer}>
        <div className={styles.errorContainer}>
          <p className={styles.errorMessage}>Không tìm thấy cửa hàng</p>
          <Button variant="primary" onClick={() => router.push('/seller/store')}>
            Quay lại danh sách
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={sharedStyles.pageContainer}>
      <div className={sharedStyles.pageHeader}>
        <h1 className={sharedStyles.pageTitle}>Chỉnh sửa cửa hàng</h1>
        <p className={sharedStyles.pageSubtitle}>
          Cập nhật thông tin cửa hàng của bạn
        </p>
      </div>

      <Card className={styles.editFormCard}>
        <div className={styles.formContainer}>
          <div className={styles.formSection}>
            <label className={styles.formLabel}>
              Tên cửa hàng *
            </label>
            <input
              type="text"
              placeholder="Nhập tên cửa hàng"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={styles.formInput}
            />
          </div>

          <div className={styles.formSection}>
            <label className={styles.formLabel}>
              Địa chỉ *
            </label>
            <textarea
              placeholder="Nhập địa chỉ cửa hàng"
              rows={3}
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              className={styles.formTextarea}
            />
          </div>

          <div className={styles.formSection}>
            <label className={styles.formLabel}>
              Số điện thoại *
            </label>
            <input
              type="tel"
              placeholder="0123456789"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className={styles.formInput}
            />
          </div>

          <div className={styles.formSection}>
            <label className={styles.formLabel}>
              Hình ảnh cửa hàng
            </label>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`${styles.imageUploadArea} ${isDragOver ? styles.dragOver : ''}`}
              onClick={() => document.getElementById('imageInput')?.click()}
            >
              {uploading ? (
                <div className={styles.uploadingState}>
                  <div className={styles.uploadIcon}>⏳</div>
                  <div className={styles.uploadText}>
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
                <div className={styles.errorState}>
                  <div className={styles.errorIcon}>❌</div>
                  <div className={styles.errorText}>
                    Lỗi tải lên: {uploadError}
                  </div>
                  <div className={styles.errorSubtext}>
                    Thử lại hoặc chọn ảnh khác
                  </div>
                </div>
              ) : (formData.imageUrl || previewImage) ? (
                <div className={styles.imagePreview}>
                  <Image
                    src={previewImage || formData.imageUrl || ''}
                    alt="Preview"
                    width={400}
                    height={300}
                    className={styles.previewImg}
                  />
                  <button
                    className={styles.removeImageBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleInputChange('imageUrl', '');
                      setPreviewImage(null);
                    }}
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div className={styles.uploadPrompt}>
                  <div className={styles.uploadIcon}>📷</div>
                  <div className={styles.uploadText}>
                    {isDragOver ? 'Thả ảnh vào đây' : 'Kéo thả ảnh hoặc click để chọn'}
                  </div>
                  <div className={styles.uploadSubtext}>
                    Hỗ trợ: JPG, PNG, GIF, WebP
                  </div>
                </div>
              )}
              <input
                id="imageInput"
                type="file"
                accept="image/*"
                onChange={handleImageInputChange}
                className={styles.hiddenInput}
              />
            </div>
          </div>

          <div className={styles.formSection}>
            <label className={styles.formLabel}>
              Mô tả
            </label>
            <textarea
              placeholder="Nhập mô tả cửa hàng"
              rows={3}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className={styles.formTextarea}
            />
          </div>

          {/* Location Picker */}
          <div className={styles.formSection}>
            <label className={styles.formLabel}>
              Vị trí cửa hàng *
            </label>
            
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
        </div>

        <div className={styles.formActions}>
          <Button 
            variant="secondary" 
            onClick={handleCancel}
            disabled={updating}
          >
            Hủy
          </Button>
          <Button 
            variant="primary" 
            onClick={handleUpdateShop}
            loading={updating}
          >
            {updating ? 'Đang cập nhật...' : 'Cập nhật cửa hàng'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
