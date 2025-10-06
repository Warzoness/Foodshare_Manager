// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Pagination types
export interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Image upload types
export interface ImageUploadResponse {
  publicId: string;
  secureUrl: string;
  originalFilename: string;
  format: string;
  bytes: number;
  width: number;
  height: number;
  resourceType: string;
  transformation: string;
}

export interface ImageUploadRequest {
  file: File;
  folder?: string;
  publicId?: string;
  transformation?: string;
}