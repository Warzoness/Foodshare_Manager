import { ApiResponse, ImageUploadResponse, ImageUploadRequest } from '@/types/common';

class ImageUploadService {
  private baseUrl: string;

  constructor() {
    // In browser, use relative URL. In server, use full URL
    this.baseUrl = typeof window !== 'undefined' ? '' : (process.env.NEXT_PUBLIC_API_URL || '');
  }

  /**
   * Upload image to Cloudinary via API
   */
  async uploadImage(request: ImageUploadRequest): Promise<ApiResponse<ImageUploadResponse>> {
    try {
      const formData = new FormData();
      formData.append('file', request.file);

      // Build query parameters
      const params = new URLSearchParams();
      if (request.folder) params.append('folder', request.folder);
      if (request.publicId) params.append('publicId', request.publicId);
      if (request.transformation) params.append('transformation', request.transformation);

      const url = `${this.baseUrl}/api/images/upload?${params.toString()}`;
      
      console.log('Image upload URL:', url);
      console.log('Base URL:', this.baseUrl);
      console.log('File name:', request.file.name);
      console.log('File size:', request.file.size);

      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      console.log('Upload response status:', response.status);
      console.log('Upload response:', result);

      if (!response.ok) {
        return {
          success: false,
          data: undefined,
          error: result.error || result.message || 'Upload failed',
        };
      }

      return {
        success: true,
        data: result.data,
        error: undefined,
      };
    } catch (error) {
      console.error('Image upload error:', error);
      return {
        success: false,
        data: undefined,
        error: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  }

  /**
   * Upload multiple images
   */
  async uploadMultipleImages(
    files: File[],
    options?: {
      folder?: string;
      transformation?: string;
    }
  ): Promise<ApiResponse<ImageUploadResponse[]>> {
    try {
      const uploadPromises = files.map(file => 
        this.uploadImage({
          file,
          folder: options?.folder,
          transformation: options?.transformation,
        })
      );

      const results = await Promise.all(uploadPromises);
      
      const successfulUploads = results
        .filter(result => result.success)
        .map(result => result.data!)
        .filter(Boolean);

      const failedCount = results.filter(result => !result.success).length;

      if (failedCount > 0) {
        return {
          success: false,
          data: undefined,
          error: `${failedCount} out of ${files.length} images failed to upload`,
        };
      }

      return {
        success: true,
        data: successfulUploads,
        error: undefined,
      };
    } catch (error) {
      console.error('Multiple image upload error:', error);
      return {
        success: false,
        data: undefined,
        error: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  }

  /**
   * Get optimized image URL with transformations
   */
  getOptimizedImageUrl(
    publicId: string,
    transformations?: {
      width?: number;
      height?: number;
      quality?: 'auto' | number;
      format?: 'auto' | 'webp' | 'jpg' | 'png';
      crop?: 'fill' | 'fit' | 'scale' | 'crop';
    }
  ): string {
    const baseUrl = 'https://res.cloudinary.com/mock-cloud/image/upload';
    
    if (!transformations) {
      return `${baseUrl}/${publicId}`;
    }

    const transformParts = [];
    
    if (transformations.width) transformParts.push(`w_${transformations.width}`);
    if (transformations.height) transformParts.push(`h_${transformations.height}`);
    if (transformations.quality) {
      const quality = transformations.quality === 'auto' ? 'q_auto' : `q_${transformations.quality}`;
      transformParts.push(quality);
    }
    if (transformations.format) {
      const format = transformations.format === 'auto' ? 'f_auto' : `f_${transformations.format}`;
      transformParts.push(format);
    }
    if (transformations.crop) transformParts.push(`c_${transformations.crop}`);

    const transformationString = transformParts.join(',');
    return `${baseUrl}/${transformationString}/${publicId}`;
  }

  /**
   * Validate image file
   */
  validateImageFile(file: File): { valid: boolean; error?: string } {
    // Check file type
    if (!file.type.startsWith('image/')) {
      return { valid: false, error: 'File must be an image' };
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return { valid: false, error: 'File size must be less than 10MB' };
    }

    // Check supported formats
    const supportedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!supportedFormats.includes(file.type)) {
      return { valid: false, error: 'Unsupported image format. Supported: JPG, PNG, GIF, WebP' };
    }

    return { valid: true };
  }
}

// Export singleton instance
export const imageUploadService = new ImageUploadService();
export default imageUploadService;
