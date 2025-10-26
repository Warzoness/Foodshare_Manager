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
      throw new Error('Không thể tải dữ liệu thống kê');
    }
    return response.data;
  }

  // Lấy hoạt động gần đây
  async getRecentActivities(limit: number = 10): Promise<RecentActivity[]> {
    const response = await apiClient.get<RecentActivity[]>(`${this.baseUrl}/recent-activities?limit=${limit}`);
    if (!response.data) {
      throw new Error('Không thể tải dữ liệu hoạt động gần đây');
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
      throw new Error('Không thể tải dữ liệu doanh thu');
    }
    return response.data;
  }

  // Lấy top cửa hàng
  async getTopStores(limit: number = 5): Promise<TopStore[]> {
    const response = await apiClient.get<TopStore[]>(`${this.baseUrl}/top-stores?limit=${limit}`);
    if (!response.data) {
      throw new Error('Không thể tải dữ liệu top cửa hàng');
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
