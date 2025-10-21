import { 
  User, 
  Store, 
  StoreDetail,
  StoreApiResponse,
  UpdateStoreRequest,
  Product, 
  ProductDetail,
  UpdateProductRequest,
  ProductsApiResponse,
  Order, 
  PaginationParams, 
  PaginatedResponse, 
  ApiResponse 
} from '@/types';
import { ApiClient } from './baseService';

// Admin-specific types
export interface AdminPaginationParams {
  page: number;
  size: number;
  sort?: string[];
  search?: string;
  status?: string;
  category?: string;
  shop?: string;
  priceMin?: string;
  priceMax?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface CreateAdminRequest {
  name: string;
  email: string;
  password: string;
  role: 'ADMIN';
}

class AdminService {
  constructor(private apiClient: ApiClient) {}

  // User management
  async getUsers(params?: AdminPaginationParams): Promise<ApiResponse<PaginatedResponse<User> | User[]>> {
    if (params) {
      const queryParams = new URLSearchParams({
        page: params.page.toString(),
        size: params.size.toString()
      });
      
      if (params.search) {
        queryParams.append('search', params.search);
      }
      if (params.status) {
        queryParams.append('status', params.status);
      }
      
      const url = `/users?${queryParams}`;
      const result = await this.apiClient.get(url);
      return {
        success: true,
        data: result.data
      } as ApiResponse<PaginatedResponse<User>>;
    }
    return this.apiClient.get('/users');
  }

  async getUser(id: string): Promise<ApiResponse<User>> {
    return this.apiClient.get(`/users/${id}`);
  }

  async updateUser(id: string, data: Partial<User>): Promise<ApiResponse<User>> {
    return this.apiClient.put(`/users/${id}`, data);
  }

  // Store management - theo API spec mới
  async getStores(params?: AdminPaginationParams): Promise<ApiResponse<StoreApiResponse>> {
    if (params) {
      // GET /admin/shops với query params { page, size }
      const queryParams = new URLSearchParams({
        page: params.page.toString(),
        size: params.size.toString()
      });
      const url = `/api/admin/shops?${queryParams}`;
      const result = await this.apiClient.get(url);
      // API returns data directly, not wrapped in { code, success, data }
      return {
        success: true,
        data: result.data
      } as ApiResponse<StoreApiResponse>;
    }
    const result = await this.apiClient.get('/api/admin/shops');
    // API returns data directly, not wrapped in { code, success, data }
    return {
      success: true,
      data: result.data
    } as ApiResponse<StoreApiResponse>;
  }

  async getStore(id: string): Promise<ApiResponse<Store>> {
    return this.apiClient.get(`/api/admin/shops/${id}`);
  }

  async getStoreDetail(id: string): Promise<ApiResponse<StoreDetail>> {
    return this.apiClient.get(`/api/admin/shops/${id}`);
  }

  async updateStore(id: string, data: UpdateStoreRequest): Promise<ApiResponse<Store>> {
    return this.apiClient.put(`/api/admin/shops/${id}`, data);
  }

  async deleteStore(id: string): Promise<ApiResponse<void>> {
    return this.apiClient.delete(`/api/admin/shops/${id}`);
  }

  // Get products by shop ID
  async getProductsByShop(shopId: string, params?: AdminPaginationParams): Promise<ApiResponse<ProductsApiResponse>> {
    if (params) {
      const queryParams = new URLSearchParams({
        page: params.page.toString(),
        size: params.size.toString()
      });
      
      if (params.sort) {
        params.sort.forEach(sortItem => queryParams.append('sort', sortItem));
      }
      
      const url = `/api/admin/products/shop/${shopId}?${queryParams}`;
      const result = await this.apiClient.get(url);
      return {
        success: true,
        data: result.data
      } as ApiResponse<ProductsApiResponse>;
    }
    
    const result = await this.apiClient.get(`/api/admin/products/shop/${shopId}`);
    return {
      success: true,
      data: result.data
    } as ApiResponse<ProductsApiResponse>;
  }

  // Order management
  async getOrders(params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<Order> | Order[]>> {
    if (params) {
      return this.apiClient.getPaginated('/orders', params);
    }
    return this.apiClient.get('/orders');
  }

  async getOrder(id: string): Promise<ApiResponse<Order>> {
    return this.apiClient.get(`/orders/${id}`);
  }

  async updateOrderStatus(id: string, status: string): Promise<ApiResponse<Order>> {
    return this.apiClient.put(`/orders/${id}/status`, { status });
  }

  // Product management - theo API spec mới
  async getProducts(params?: AdminPaginationParams): Promise<ApiResponse<ProductsApiResponse>> {
    if (params) {
      // GET /admin/products với query params
      const queryParams = new URLSearchParams({
        page: params.page.toString(),
        size: params.size.toString()
      });
      
      // Add optional parameters
      if (params.sort && params.sort.length > 0) {
        params.sort.forEach(sortItem => {
          queryParams.append('sort', sortItem);
        });
      }
      
      if (params.search) {
        queryParams.append('search', params.search);
      }
      
      if (params.status) {
        queryParams.append('status', params.status);
      }
      
      if (params.category) {
        queryParams.append('category', params.category);
      }
      
      if (params.shop) {
        queryParams.append('shop', params.shop);
      }
      
      if (params.priceMin) {
        queryParams.append('priceMin', params.priceMin);
      }
      
      if (params.priceMax) {
        queryParams.append('priceMax', params.priceMax);
      }
      
      if (params.dateFrom) {
        queryParams.append('dateFrom', params.dateFrom);
      }
      
      if (params.dateTo) {
        queryParams.append('dateTo', params.dateTo);
      }
      
      // Use local API endpoint
      const url = `/api/admin/products?${queryParams}`;
      
      const result = await this.apiClient.get(url);
      return {
        success: true,
        data: result.data
      } as ApiResponse<ProductsApiResponse>;
    }
    
    // Use local API endpoint
    const result = await this.apiClient.get('/api/admin/products');
    return {
      success: true,
      data: result.data
    } as ApiResponse<ProductsApiResponse>;
  }

  // Get all products with simple pagination
  async getAllProducts(params?: { page?: number; size?: number; sort?: string[] }): Promise<ApiResponse<ProductsApiResponse>> {
    if (params) {
      const queryParams = new URLSearchParams({
        page: (params.page || 0).toString(),
        size: (params.size || 20).toString()
      });
      
      if (params.sort) {
        params.sort.forEach(sortItem => queryParams.append('sort', sortItem));
      }
      
      const url = `/api/admin/products?${queryParams}`;
      const result = await this.apiClient.get(url);
      return {
        success: true,
        data: result.data
      } as ApiResponse<ProductsApiResponse>;
    }
    
    const result = await this.apiClient.get('/api/admin/products');
    return {
      success: true,
      data: result.data
    } as ApiResponse<ProductsApiResponse>;
  }

  async getProduct(id: string): Promise<ApiResponse<Product>> {
    return this.apiClient.get(`/api/admin/products/${id}`);
  }

  async getProductDetail(id: string): Promise<ApiResponse<ProductDetail>> {
    return this.apiClient.get(`/api/admin/products/${id}`);
  }

  async updateProduct(id: string, data: UpdateProductRequest): Promise<ApiResponse<Product>> {
    return this.apiClient.put(`/api/admin/products/${id}`, data);
  }

  async deleteProduct(id: string): Promise<ApiResponse<void>> {
    return this.apiClient.delete(`/api/admin/products/${id}`);
  }

  // Reports - sử dụng API thật
  async getReports(params?: unknown): Promise<ApiResponse<unknown>> {
    if (params) {
      const queryParams = new URLSearchParams(params as Record<string, string>);
      return this.apiClient.get(`/api/admin/reports?${queryParams}`);
    }
    return this.apiClient.get('/api/admin/reports');
  }

  async exportData(): Promise<ApiResponse<unknown>> {
    // Tạm thời trả về success
    return Promise.resolve({
      success: true,
      data: { message: 'Export feature coming soon' }
    });
  }

  // Admin management - theo API spec từ ảnh
  async createAdmin(data: CreateAdminRequest): Promise<ApiResponse<User>> {
    // POST /api/admin/create-admin với body { name, email, password, role }
    return this.apiClient.post('/api/admin/create-admin', data);
  }

  async updateAdmin(id: string, data: Partial<User>): Promise<ApiResponse<User>> {
    return this.apiClient.put(`/api/admin/admins/${id}`, data);
  }

  async deleteAdmin(id: string): Promise<ApiResponse<void>> {
    return this.apiClient.delete(`/api/admin/admins/${id}`);
  }
}

export { AdminService };
