import { ApiClient } from './baseService';
import { config } from '@/lib/config';

const apiClient = new ApiClient(config.api.baseUrl);

export interface Admin {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface CreateAdminRequest {
  name: string;
  email: string;
  password: string;
  role: string;
}

export interface UpdateAdminRequest {
  status?: 'ACTIVE' | 'INACTIVE';
  role?: string;
}

export interface AdminListResponse {
  content: Admin[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

class AdminManagementService {
  private baseUrl = '/api/back-office/users';

  // Lấy danh sách admin
  async getAdmins(params?: {
    page?: number;
    size?: number;
    search?: string;
  }): Promise<AdminListResponse> {
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
    
    // Filter only admin users
    searchParams.append('role', 'ADMIN');

    const url = `${this.baseUrl}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    
    const response = await apiClient.get<AdminListResponse>(url);
    return response.data || { content: [], totalElements: 0, totalPages: 0, size: 0, number: 0 };
  }

  // Tạo admin mới
  async createAdmin(adminData: CreateAdminRequest): Promise<Admin> {
    const response = await apiClient.post<Admin>(this.baseUrl, adminData);
    if (!response.data) throw new Error('Failed to create admin');
    return response.data;
  }

  // Cập nhật admin
  async updateAdmin(id: number, updateData: UpdateAdminRequest): Promise<Admin> {
    const response = await apiClient.put<Admin>(`${this.baseUrl}/${id}`, updateData);
    if (!response.data) throw new Error('Failed to update admin');
    return response.data;
  }

  // Xóa admin
  async deleteAdmin(id: number): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`);
  }

  // Toggle trạng thái admin
  async toggleAdminStatus(id: number, currentStatus: 'ACTIVE' | 'INACTIVE'): Promise<Admin> {
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    return this.updateAdmin(id, { status: newStatus });
  }
}

export const adminManagementService = new AdminManagementService();
