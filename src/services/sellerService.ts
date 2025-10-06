import { ApiClient } from './baseService';
import { config } from '@/lib/config';
import { 
  SellerShop, 
  SellerProduct, 
  CreateSellerShopRequest, 
  UpdateSellerShopRequest, 
  CreateSellerProductRequest, 
  UpdateSellerProductRequest, 
  ApiResponse,
  Order,
  ApiOrder
} from '@/types';

class SellerService {
  private ordersApiClient: ApiClient;
  
  constructor(private apiClient: ApiClient) {
    // Create separate API client for orders with different base URL
    this.ordersApiClient = new ApiClient(config.api.ordersBaseUrl);
  }

  // Shop management
  async getShops(): Promise<SellerShop[]> {
    const response = await this.apiClient.get<SellerShop[]>('/api/seller/shops');
    return response.data || [];
  }

  async getShop(shopId: string): Promise<ApiResponse<SellerShop>> {
    return this.apiClient.get<SellerShop>(`/api/seller/shops/${shopId}`);
  }

  async createShop(data: CreateSellerShopRequest): Promise<ApiResponse<SellerShop>> {
    return this.apiClient.post<SellerShop>('/api/seller/shops', data);
  }

  async updateShop(shopId: string, data: UpdateSellerShopRequest): Promise<ApiResponse<SellerShop>> {
    return this.apiClient.put<SellerShop>(`/api/seller/shops/${shopId}`, { id: parseInt(shopId), ...data });
  }

  async deleteShop(shopId: string): Promise<ApiResponse<void>> {
    return this.apiClient.delete<void>(`/api/seller/shops/${shopId}`);
  }

  // Product management
  async getProduct(productId: string): Promise<ApiResponse<SellerProduct>> {
    return this.apiClient.get<SellerProduct>(`/api/seller/products/${productId}`);
  }

  async getShopProducts(shopId: string): Promise<ApiResponse<SellerProduct[]>> {
    const response = await this.apiClient.get<SellerProduct[]>(`/api/seller/shops/${shopId}/products`);
    return {
      success: response.success,
      error: response.error,
      data: response.data || []
    };
  }

  async createProduct(data: CreateSellerProductRequest): Promise<ApiResponse<SellerProduct>> {
    return this.apiClient.post<SellerProduct>('/api/seller/products', data);
  }

  async updateProduct(productId: string, data: UpdateSellerProductRequest): Promise<ApiResponse<SellerProduct>> {
    return this.apiClient.put<SellerProduct>(`/api/seller/products/${productId}`, { id: parseInt(productId), ...data });
  }

  async deleteProduct(productId: string): Promise<ApiResponse<void>> {
    return this.apiClient.delete<void>(`/api/seller/products/${productId}`);
  }

  // Order management
  async getOrders(params?: { status?: string }): Promise<ApiResponse<ApiOrder[]>> {
    const queryParams = new URLSearchParams();
    if (params?.status && params.status.trim() !== '') {
      queryParams.append('status', params.status);
    }
    
    const queryString = queryParams.toString();
    const url = queryString ? `/orders?${queryString}` : '/orders';
    
    return this.ordersApiClient.get<ApiOrder[]>(url);
  }

  async getOrder(orderId: string): Promise<ApiResponse<Order>> {
    return this.ordersApiClient.get<Order>(`/orders/${orderId}`);
  }

  async updateOrderStatus(orderId: string, status: string): Promise<ApiResponse<ApiOrder>> {
    try {
      // Convert orderId to number as per API spec (integer)
      const numericOrderId = parseInt(orderId, 10);
      
      if (isNaN(numericOrderId)) {
        throw new Error(`Invalid orderId: ${orderId}`);
      }
      
      const requestBody = {
        status: status
      };
      
      console.log('Updating order status:', { 
        orderId: numericOrderId, 
        requestBody, 
        url: `/api/seller/orders/${numericOrderId}/status` 
      });
      
      const response = await this.apiClient.put<ApiOrder>(`/api/seller/orders/${numericOrderId}/status`, requestBody);
      
      console.log('Order status update response:', response);
      
      return response;
    } catch (error) {
      console.error('Error in updateOrderStatus:', error);
      throw error;
    }
  }

  async getShopOrders(params?: {
    shopId?: number;
    status?: string;
    fromDate?: string;
    toDate?: string;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
  }): Promise<ApiResponse<{
    content: ApiOrder[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  }>> {
    console.log('🔍 getShopOrders called with params:', params);
    
    const queryParams = new URLSearchParams();
    
    if (params?.shopId) queryParams.append('shopId', params.shopId.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.fromDate) queryParams.append('fromDate', params.fromDate);
    if (params?.toDate) queryParams.append('toDate', params.toDate);
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size) queryParams.append('size', params.size.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortDirection) queryParams.append('sortDirection', params.sortDirection);
    
    const queryString = queryParams.toString();
    const url = queryString ? `/api/seller/orders/shop?${queryString}` : '/api/seller/orders/shop';
    
    console.log('🌐 Making API call to:', url);
    
    return this.ordersApiClient.get<{
      content: ApiOrder[];
      page: number;
      size: number;
      totalElements: number;
      totalPages: number;
      hasNext: boolean;
      hasPrevious: boolean;
    }>(url);
  }
}

export { SellerService };
