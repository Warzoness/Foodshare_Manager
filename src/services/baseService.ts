import { ApiResponse, PaginatedResponse, PaginationParams } from '@/types';
import { config } from '@/lib/config';

export class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    // Add authorization header if token exists
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
      }
    }

    const requestConfig: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    // Add timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.api.timeout);

    try {
      const response = await fetch(url, {
        ...requestConfig,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      // Handle different response types
      let data;
      const contentType = response.headers.get('content-type');
      
      try {
        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
        } else {
          data = await response.text();
        }
      } catch (parseError) {
        console.error('Error parsing response:', parseError);
        data = await response.text().catch(() => 'Unable to parse response');
      }

      // Only treat as error if HTTP status is not OK
      if (!response.ok) {
        console.error('HTTP Error Response:', {
          url,
          status: response.status,
          statusText: response.statusText,
          data: data,
          dataType: typeof data,
          dataStringified: JSON.stringify(data, null, 2)
        });
        // Extract error message from various response formats
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        if (typeof data === 'string') {
          errorMessage = data;
        } else if (data && typeof data === 'object') {
          errorMessage = data.message || data.error || data.detail || data.description || errorMessage;
        }
        
        return {
          success: false,
          error: errorMessage,
        };
      }
      
      // If we get here, it's a successful response (even if data is empty object or empty array)
      console.log('API Success Response:', {
        url,
        status: response.status,
        data,
        dataType: typeof data,
        isArray: Array.isArray(data),
        isEmpty: data && typeof data === 'object' && Object.keys(data).length === 0
      });

      return {
        success: data?.success !== false,
        data: data?.data || data,
        pagination: data?.pagination || undefined,
      };
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === 'AbortError') {
        console.error('API Request Timeout:', url);
        return {
          success: false,
          error: 'Request timeout',
        };
      }
      
      console.error('API Request Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Generic CRUD methods
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Paginated requests
  async getPaginated<T>(
    endpoint: string,
    params: PaginationParams
  ): Promise<ApiResponse<PaginatedResponse<T>>> {
    const searchParams = new URLSearchParams({
      page: params.page.toString(),
      limit: params.limit.toString(),
      ...(params.search && { search: params.search }),
      ...(params.sortBy && { sortBy: params.sortBy }),
      ...(params.sortOrder && { sortOrder: params.sortOrder }),
    });

    return this.get<PaginatedResponse<T>>(`${endpoint}?${searchParams}`);
  }
}
