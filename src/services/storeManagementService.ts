import { ApiClient } from './baseService';
import { config } from '@/lib/config';

const apiClient = new ApiClient(config.api.baseUrl);

export interface Store {
  id: number;
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  ownerId: number;
  ownerName: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
  imageUrl?: string;
  rating?: number;
  totalProducts?: number;
}

export interface CreateStoreRequest {
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  ownerId: number;
  imageUrl?: string;
}

export interface UpdateStoreRequest {
  name?: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'REJECTED';
  imageUrl?: string;
}

export interface StoreListResponse {
  content: Store[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

class StoreManagementService {
  private baseUrl = '/api/admin/shops';

  // Lấy danh sách cửa hàng
  async getStores(params?: {
    page?: number;
    size?: number;
    search?: string;
    status?: string;
  }): Promise<StoreListResponse> {
    const searchParams = new URLSearchParams();
    
    if (params?.page !== undefined) {
      searchParams.append('page', params.page.toString());
    }
    if (params?.size !== undefined) {
      searchParams.append('size', params.size.toString());
    }
    if (params?.search) {
      searchParams.append('search', params.search);
    }
    if (params?.status) {
      searchParams.append('status', params.status);
    }

    const url = `${this.baseUrl}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    
    const response = await apiClient.get<StoreListResponse>(url);
    return response.data || { content: [], totalElements: 0, totalPages: 0, size: 0, number: 0 };
  }

  // Lấy chi tiết cửa hàng
  async getStore(id: number): Promise<Store> {
    const response = await apiClient.get<Store>(`${this.baseUrl}/${id}`);
    if (!response.data) throw new Error('Failed to get store');
    return response.data;
  }

  // Tạo cửa hàng mới
  async createStore(storeData: CreateStoreRequest): Promise<Store> {
    const response = await apiClient.post<Store>(this.baseUrl, storeData);
    if (!response.data) throw new Error('Failed to create store');
    return response.data;
  }

  // Cập nhật cửa hàng
  async updateStore(id: number, updateData: UpdateStoreRequest): Promise<Store> {
    const response = await apiClient.put<Store>(`${this.baseUrl}/${id}`, updateData);
    if (!response.data) throw new Error('Failed to update store');
    return response.data;
  }

  // Xóa cửa hàng
  async deleteStore(id: number): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`);
  }

  // Duyệt cửa hàng
  async approveStore(id: number): Promise<Store> {
    const response = await apiClient.post<Store>(`${this.baseUrl}/${id}/approve`);
    if (!response.data) throw new Error('Failed to approve store');
    return response.data;
  }

  // Từ chối cửa hàng
  async rejectStore(id: number, reason?: string): Promise<Store> {
    const response = await apiClient.post<Store>(`${this.baseUrl}/${id}/reject`, { reason });
    if (!response.data) throw new Error('Failed to reject store');
    return response.data;
  }

  // Thay đổi trạng thái cửa hàng
  async changeStoreStatus(id: number, status: 'ACTIVE' | 'INACTIVE'): Promise<Store> {
    return this.updateStore(id, { status });
  }
}

export const storeManagementService = new StoreManagementService();
