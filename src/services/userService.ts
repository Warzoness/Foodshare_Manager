import { ApiClient } from './baseService';
import { config } from '@/lib/config';

const apiClient = new ApiClient(config.api.baseUrl);

export interface User {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  profilePictureUrl: string;
  role: 'ADMIN' | 'SELLER' | 'USER';
  updatedAt: string;
}

export interface UpdateUserRequest {
  name: string;
  email: string;
  phoneNumber: string;
  profilePictureUrl: string;
  role?: 'ADMIN' | 'SELLER' | 'USER' | 'SUPER_ADMIN';
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface CurrentUser {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'SELLER' | 'USER';
  createdAt: string;
  updatedAt: string;
}

class UserService {
  // Đăng ký user mới
  async register(userData: RegisterRequest): Promise<User> {
    const response = await apiClient.post<User>('/api/back-office/auth/register', userData);
    if (!response.data) throw new Error('Failed to register user');
    return response.data;
  }

  // Lấy thông tin user hiện tại
  async getCurrentUser(): Promise<CurrentUser> {
    const response = await apiClient.get<CurrentUser>('/api/back-office/auth/me');
    if (!response.data) throw new Error('Failed to get current user');
    return response.data;
  }

  // Thay đổi mật khẩu
  async changePassword(passwordData: ChangePasswordRequest): Promise<void> {
    const response = await apiClient.post('/api/back-office/auth/change-password', passwordData);
    if (!response.success) {
      throw new Error(response.error || 'Failed to change password');
    }
  }

  // Cập nhật thông tin user (Admin, Seller, User)
  async updateUser(userId: number, userData: UpdateUserRequest): Promise<User> {
    const response = await apiClient.put<User>(`/api/back-office/users/${userId}`, userData);
    if (!response.data) throw new Error('Failed to update user');
    return response.data;
  }

  // Cập nhật thông tin admin
  async updateAdmin(adminId: number, adminData: Omit<UpdateUserRequest, 'role'> & { role?: 'ADMIN' | 'SUPER_ADMIN' }): Promise<User> {
    return this.updateUser(adminId, adminData);
  }

  // Cập nhật thông tin seller
  async updateSeller(sellerId: number, sellerData: Omit<UpdateUserRequest, 'role'> & { role?: 'SELLER' }): Promise<User> {
    return this.updateUser(sellerId, { ...sellerData, role: 'SELLER' });
  }

  // Cập nhật thông tin user thường
  async updateRegularUser(userId: number, userData: Omit<UpdateUserRequest, 'role'>): Promise<User> {
    return this.updateUser(userId, { ...userData, role: 'USER' });
  }

  // Cập nhật profile của chính mình (không thể thay đổi role)
  async updateMyProfile(userData: Omit<UpdateUserRequest, 'role'>): Promise<User> {
    // Get current user info to get ID
    const currentUser = await this.getCurrentUser();
    return this.updateUser(currentUser.id, userData);
  }
}

export const userService = new UserService();
