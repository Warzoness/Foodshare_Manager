'use client';

import {use, useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import Image from 'next/image';
import {Card} from '@/components/ui/Card';
import {Button} from '@/components/ui/Button';
import {Select} from '@/components/ui/Select';
import InteractiveMap from '@/components/ui/InteractiveMap';
import {useSellerShop, useUpdateSellerShop} from '@/hooks/useApi';
import {UpdateSellerShopRequest} from '@/types';
import styles from './page.module.css';
import sharedStyles from '../../../shared.module.css';

interface EditShopPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default function EditShopPage({params}: EditShopPageProps) {
    const router = useRouter();
    const resolvedParams = use(params);
    const shopId = resolvedParams.id;

    const {data: shop, loading: shopLoading, error: shopError, execute: refetchShop} = useSellerShop(shopId);
    const {execute: updateShop, loading: updating, success: updateSuccess} = useUpdateSellerShop();
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
            return {lat: null, lng: null};
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
            return {lat: singleNumber, lng: null};
        }

        return {lat: null, lng: null};
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

    // Handle location change from interactive map
    const handleLocationChange = (lat: number, lng: number, address?: string) => {
        setFormData(prev => ({
            ...prev,
            latitude: lat,
            longitude: lng,
            address: address || prev.address
        }));

        setCoordinateInput(`${lat}, ${lng}`);
        updateMapUrl(lat, lng);
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
                        <label className={styles.formLabel}>Địa chỉ *</label>
                        <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                            <input
                                type="text"
                                placeholder="Nhập địa chỉ cửa hàng"
                                value={formData.address}
                                onChange={(e) => handleInputChange('address', e.target.value)}
                                className={styles.formInput}
                                style={{flex: 1}}
                            />
                            <Button
                                type="button"
                                variant="primary"
                                onClick={async () => {
                                    if (!formData.address?.trim()) {
                                        alert("Vui lòng nhập địa chỉ trước!");
                                        return;
                                    }

                                    try {
                                        // Sử dụng Google Geocoding API thông qua API route
                                        const response = await fetch(`/api/geocoding?address=${encodeURIComponent(formData.address || '')}`);
                                        
                                        if (!response.ok) {
                                            if (response.status === 404) {
                                                alert('Không tìm thấy địa chỉ này! Vui lòng thử:\n- Địa chỉ chi tiết hơn (số nhà, tên đường, quận/huyện)\n- Hoặc click trực tiếp trên bản đồ để chọn vị trí');
                                            } else {
                                                throw new Error('Geocoding failed');
                                            }
                                            return;
                                        }
                                        
                                        const data = await response.json();
                                        console.log('Tìm thấy địa chỉ:', data.formattedAddress);
                                        console.log('Tọa độ:', { lat: data.latitude, lng: data.longitude });
                                        
                                        handleLocationChange(data.latitude, data.longitude, formData.address);
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

                    {/* Interactive Map Section */}
                    <div className={styles.formSection}>
                        <label className={styles.formLabel}>
                            Vị trí cửa hàng *
                        </label>
                        <InteractiveMap
                            latitude={formData.latitude || 0}
                            longitude={formData.longitude || 0}
                            address={formData.address}
                            onLocationChange={handleLocationChange}
                            height={300}
                            className={styles.mapContainer}
                            mode="edit"
                        />
                    </div>

                    <div className={styles.imageUploadSection}>
                        <label className={styles.imageUploadLabel}>
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
                                <div className={styles.imageUploadContent}>
                                    <div className={styles.imageUploadIcon}>⏳</div>
                                    <div className={styles.imageUploadText}>
                                        Đang tải lên... {uploadProgress}%
                                    </div>
                                    <div className={styles.progressBar}>
                                        <div
                                            className={styles.progressFill}
                                            style={{width: `${uploadProgress}%`}}
                                        />
                                    </div>
                                </div>
                            ) : uploadError ? (
                                <div className={styles.imageUploadContent} style={{color: '#ef4444'}}>
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
                                    <Button
                                        className={styles.imageRemoveButton}
                                        variant="danger"
                                        size="xs"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleInputChange('imageUrl', '');
                                            setPreviewImage(null);
                                        }}
                                    >
                                        ×
                                    </Button>
                                    {previewImage && !formData.imageUrl && (
                                        <div className={styles.imageUploadProgress}>
                                            <div>
                                                Đang tải lên... {uploadProgress}%
                                            </div>
                                            <div className={styles.progressBar}>
                                                <div
                                                    className={styles.progressFill}
                                                    style={{width: `${uploadProgress}%`}}
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
                                onChange={handleImageInputChange}
                                className={styles.imageUploadInput}
                            />
                        </div>
                    </div>

                    <div className={styles.formSection}>
                        <Select
                            label="Trạng thái cửa hàng *"
                            value={formData.status || '1'}
                            onChange={(value) => handleInputChange('status', value)}
                            options={[
                                { value: '1', label: 'Đang hoạt động' },
                                { value: '0', label: 'Đóng cửa' },
                                { value: '2', label: 'Chờ duyệt' }
                            ]}
                        />
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
