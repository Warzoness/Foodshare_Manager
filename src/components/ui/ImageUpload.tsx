'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { Button } from './Button';
import styles from './ImageUpload.module.css';

interface ImageUploadProps {
  onImageUpload?: (url: string) => void;
  onMultipleImageUpload?: (urls: string[]) => void;
  multiple?: boolean;
  maxFiles?: number;
  currentImage?: string;
  currentImages?: string[];
  label?: string;
  className?: string;
}

export function ImageUpload({
  onImageUpload,
  onMultipleImageUpload,
  multiple = false,
  maxFiles = 5,
  currentImage = '',
  currentImages = [],
  label = 'Upload ảnh',
  className = ''
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewImages, setPreviewImages] = useState<string[]>(currentImages);
  const [previewImage, setPreviewImage] = useState<string>(currentImage);
  const [showMobileOptions, setShowMobileOptions] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Detect if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor;
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
      setIsMobile(isMobileDevice);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/images/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const data = await response.json();
    return data.data.secureUrl;
  };

  const uploadMultipleImages = async (files: File[]): Promise<string[]> => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    const response = await fetch('/api/images/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const data = await response.json();
    // API returns array of objects with secureUrl property
    return data.data.map((item: { secureUrl: string }) => item.secureUrl);
  };

  const handleFileSelect = useCallback(async (files: FileList) => {
    if (!files.length) return;

    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(file => file.type.startsWith('image/'));
    
    if (validFiles.length === 0) {
      alert('Vui lòng chọn file ảnh hợp lệ');
      return;
    }

    if (multiple && validFiles.length > maxFiles) {
      alert(`Chỉ được upload tối đa ${maxFiles} ảnh`);
      return;
    }

    setUploading(true);

    try {
      if (multiple) {
        const urls = await uploadMultipleImages(validFiles);
        const newImages = [...previewImages, ...urls];
        setPreviewImages(newImages);
        onMultipleImageUpload?.(newImages);
      } else {
        const url = await uploadImage(validFiles[0]);
        setPreviewImage(url);
        onImageUpload?.(url);
      }
    } catch (error) {
      alert('Có lỗi xảy ra khi upload ảnh');
    } finally {
      setUploading(false);
    }
  }, [multiple, maxFiles, onImageUpload, onMultipleImageUpload, previewImages]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  }, [handleFileSelect]);

  const handleClick = () => {
    if (isMobile) {
      setShowMobileOptions(true);
    } else {
      fileInputRef.current?.click();
    }
  };

  const handleGallerySelect = () => {
    setShowMobileOptions(false);
    fileInputRef.current?.click();
  };

  const handleCameraCapture = () => {
    setShowMobileOptions(false);
    cameraInputRef.current?.click();
  };

  const handleMobileOptionsClose = () => {
    setShowMobileOptions(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      handleFileSelect(files);
    }
  };

  const removeImage = (index: number) => {
    if (multiple) {
      const newImages = previewImages.filter((_, i) => i !== index);
      setPreviewImages(newImages);
      onMultipleImageUpload?.(newImages);
    } else {
      setPreviewImage('');
      onImageUpload?.('');
    }
  };

  const removeAllImages = () => {
    setPreviewImages([]);
    onMultipleImageUpload?.([]);
  };

  return (
    <div className={`${styles.uploadContainer} ${className}`}>
      <label className={styles.label}>{label}</label>
      
      {multiple ? (
        <div className={styles.multipleUpload}>
          <div
            className={`${styles.dropZone} ${isDragging ? styles.dragging : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleClick}
          >
            <div className={styles.dropZoneContent}>
              <div className={styles.uploadIcon}>📁</div>
              <p className={styles.dropZoneText}>
                {isDragging ? 'Thả ảnh vào đây' : 'Kéo thả ảnh hoặc click để chọn'}
              </p>
              <p className={styles.dropZoneSubtext}>
                Tối đa {maxFiles} ảnh, mỗi ảnh tối đa 10MB
              </p>
            </div>
          </div>

          {previewImages.length > 0 && (
            <div className={styles.previewContainer}>
              <div className={styles.previewHeader}>
                <span>Ảnh đã chọn ({previewImages.length}/{maxFiles})</span>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={removeAllImages}
                  disabled={uploading}
                >
                  Xóa tất cả
                </Button>
              </div>
              <div className={styles.previewGrid}>
                {previewImages.map((url, index) => (
                  <div key={index} className={styles.previewItem}>
                    <Image
                      src={url}
                      alt={`Preview ${index + 1}`}
                      width={100}
                      height={100}
                      className={styles.previewImage}
                    />
                    <button
                      className={styles.removeButton}
                      onClick={() => removeImage(index)}
                      disabled={uploading}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className={styles.singleUpload}>
          <div
            className={`${styles.dropZone} ${isDragging ? styles.dragging : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleClick}
          >
            {previewImage ? (
              <div className={styles.previewContainer}>
                <Image
                  src={previewImage}
                  alt="Preview"
                  width={200}
                  height={150}
                  className={styles.previewImage}
                />
                <button
                  className={styles.removeButton}
                  onClick={() => removeImage(0)}
                  disabled={uploading}
                >
                  ×
                </button>
              </div>
            ) : (
              <div className={styles.dropZoneContent}>
                <div className={styles.uploadIcon}>📁</div>
                <p className={styles.dropZoneText}>
                  {isDragging ? 'Thả ảnh vào đây' : 'Kéo thả ảnh hoặc click để chọn'}
                </p>
                <p className={styles.dropZoneSubtext}>
                  Ảnh tối đa 10MB
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        onChange={handleFileInputChange}
        className={styles.hiddenInput}
      />

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple={multiple}
        onChange={handleFileInputChange}
        className={styles.hiddenInput}
      />

      {uploading && (
        <div className={styles.uploadingOverlay}>
          <div className={styles.uploadingSpinner}></div>
          <p>Đang upload...</p>
        </div>
      )}

      {/* Mobile Options Modal */}
      {showMobileOptions && (
        <div className={styles.mobileOptionsOverlay} onClick={handleMobileOptionsClose}>
          <div className={styles.mobileOptionsModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.mobileOptionsHeader}>
              <h3>Chọn ảnh</h3>
              <button 
                className={styles.closeButton}
                onClick={handleMobileOptionsClose}
              >
                ×
              </button>
            </div>
            <div className={styles.mobileOptionsContent}>
              <button 
                className={styles.mobileOptionButton}
                onClick={handleCameraCapture}
              >
                <div className={styles.mobileOptionIcon}>📷</div>
                <span>Chụp ảnh</span>
              </button>
              <button 
                className={styles.mobileOptionButton}
                onClick={handleGallerySelect}
              >
                <div className={styles.mobileOptionIcon}>🖼️</div>
                <span>Chọn từ thư viện</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
