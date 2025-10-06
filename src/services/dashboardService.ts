import { ApiClient } from './baseService';
import { config } from '@/lib/config';

const apiClient = new ApiClient(config.api.baseUrl);

export interface DashboardStats {
  totalStores: number;
  activeStores: number;
  totalSellers: number;
  monthlyRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  totalProducts: number;
  activeProducts: number;
}

export interface RecentActivity {
  id: string;
  type: 'ORDER' | 'STORE_REGISTRATION' | 'PRODUCT_ADDED' | 'USER_REGISTERED';
  title: string;
  description: string;
  timestamp: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  relatedId?: string;
}

export interface RevenueData {
  date: string;
  revenue: number;
  orders: number;
}

export interface TopStore {
  id: number;
  name: string;
  revenue: number;
  orders: number;
  rating: number;
}

class DashboardService {
  private baseUrl = '/api/back-office/dashboard';

  // Lấy thống kê tổng quan
  async getStats(): Promise<DashboardStats> {
    const response = await apiClient.get<DashboardStats>(`${this.baseUrl}/stats`);
    if (!response.data) {
      // Return mock data if API not available
      return {
        totalStores: 24,
        activeStores: 18,
        totalSellers: 22,
        monthlyRevenue: 125000000,
        totalOrders: 1250,
        pendingOrders: 45,
        totalProducts: 850,
        activeProducts: 720
      };
    }
    return response.data;
  }

  // Lấy hoạt động gần đây
  async getRecentActivities(limit: number = 10): Promise<RecentActivity[]> {
    const response = await apiClient.get<RecentActivity[]>(`${this.baseUrl}/recent-activities?limit=${limit}`);
    if (!response.data) {
      // Return mock data if API not available
      return [
        {
          id: '1',
          type: 'ORDER',
          title: 'Đơn hàng mới',
          description: 'Đơn hàng #12345 từ cửa hàng ABC Food',
          timestamp: new Date().toISOString(),
          status: 'PENDING'
        },
        {
          id: '2',
          type: 'STORE_REGISTRATION',
          title: 'Cửa hàng mới đăng ký',
          description: 'XYZ Restaurant đã đăng ký tham gia',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          status: 'PENDING'
        }
      ];
    }
    return response.data;
  }

  // Lấy dữ liệu doanh thu theo thời gian
  async getRevenueData(params: {
    startDate: string;
    endDate: string;
    interval?: 'day' | 'week' | 'month';
  }): Promise<RevenueData[]> {
    const searchParams = new URLSearchParams({
      startDate: params.startDate,
      endDate: params.endDate,
      interval: params.interval || 'day'
    });

    const response = await apiClient.get<RevenueData[]>(`${this.baseUrl}/revenue?${searchParams}`);
    if (!response.data) {
      // Return mock data if API not available
      const mockData: RevenueData[] = [];
      const start = new Date(params.startDate);
      const end = new Date(params.endDate);
      
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        mockData.push({
          date: d.toISOString().split('T')[0],
          revenue: Math.floor(Math.random() * 5000000) + 1000000,
          orders: Math.floor(Math.random() * 50) + 10
        });
      }
      return mockData;
    }
    return response.data;
  }

  // Lấy top cửa hàng
  async getTopStores(limit: number = 5): Promise<TopStore[]> {
    const response = await apiClient.get<TopStore[]>(`${this.baseUrl}/top-stores?limit=${limit}`);
    if (!response.data) {
      // Return mock data if API not available
      return [
        { id: 1, name: 'ABC Food', revenue: 15000000, orders: 120, rating: 4.8 },
        { id: 2, name: 'XYZ Restaurant', revenue: 12000000, orders: 95, rating: 4.6 },
        { id: 3, name: 'Fresh Market', revenue: 10000000, orders: 80, rating: 4.5 },
        { id: 4, name: 'Quick Bite', revenue: 8000000, orders: 65, rating: 4.3 },
        { id: 5, name: 'Healthy Food', revenue: 7000000, orders: 55, rating: 4.2 }
      ];
    }
    return response.data;
  }

  // Lấy thống kê theo khoảng thời gian
  async getStatsInRange(params: {
    startDate: string;
    endDate: string;
  }): Promise<DashboardStats> {
    const searchParams = new URLSearchParams({
      startDate: params.startDate,
      endDate: params.endDate
    });

    const response = await apiClient.get<DashboardStats>(`${this.baseUrl}/stats-range?${searchParams}`);
    if (!response.data) {
      return this.getStats(); // Fallback to current stats
    }
    return response.data;
  }
}

export const dashboardService = new DashboardService();
