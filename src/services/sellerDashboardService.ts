import { ApiClient } from './baseService';
import { config } from '@/lib/config';

const apiClient = new ApiClient(config.api.baseUrl);

export interface SellerDashboardStats {
  todayOrders: number;
  todayRevenue: number;
  activeProducts: number;
  pendingOrders: number;
}

export interface RecentOrder {
  id: string;
  customerName: string;
  amount: number;
  status: string;
  createdAt: string;
}

export interface TopProduct {
  id: string;
  name: string;
  sold: number;
  revenue: number;
}

class SellerDashboardService {
  private baseUrl = '/api/seller/dashboard';

  // Lấy thống kê dashboard của seller
  async getStats(): Promise<SellerDashboardStats> {
    try {
      const response = await apiClient.get<SellerDashboardStats>(`${this.baseUrl}/stats`);
      if (response.success && response.data) {
        return response.data;
      }
    } catch (error) {
    }
    
    // Return empty stats if API fails
    return {
      todayOrders: 0,
      todayRevenue: 0,
      activeProducts: 0,
      pendingOrders: 0
    };
  }

  // Lấy đơn hàng gần đây
  async getRecentOrders(limit: number = 5): Promise<RecentOrder[]> {
    try {
      const response = await apiClient.get<RecentOrder[]>(`${this.baseUrl}/recent-orders?limit=${limit}`);
      if (response.success && response.data) {
        return response.data;
      }
    } catch (error) {
    }
    
    // Return empty array if API fails
    return [];
  }

  // Lấy sản phẩm bán chạy
  async getTopProducts(limit: number = 5): Promise<TopProduct[]> {
    try {
      const response = await apiClient.get<TopProduct[]>(`${this.baseUrl}/top-products?limit=${limit}`);
      if (response.success && response.data) {
        return response.data;
      }
    } catch (error) {
    }
    
    // Return empty array if API fails
    return [];
  }
}

export const sellerDashboardService = new SellerDashboardService();
