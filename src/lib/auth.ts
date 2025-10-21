import { User } from '@/types';
import { config } from './config';

// Auth API endpoints
const AUTH_ENDPOINTS = {
  LOGIN: '/api/back-office/auth/login',
  LOGOUT: '/api/back-office/auth/logout',
  REGISTER: '/api/back-office/auth/register',
  ME: '/api/back-office/auth/me',
};

// Login request interface
interface LoginRequest {
  email: string;
  password: string;
}

// Register request interface
interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

// Get current user from localStorage
export const getCurrentUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!userStr || !token) return null;
    
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

// Get auth token
export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

// Login function
export const login = async (email: string, password: string): Promise<{ user: User | null; error?: string }> => {
  try {
    const response = await fetch(`${config.api.baseUrl}${AUTH_ENDPOINTS.LOGIN}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ email, password } as LoginRequest),
    });

    const responseData = await response.json();

    if (!response.ok) {
      return {
        user: null,
        error: responseData?.message || 'Đăng nhập thất bại',
      };
    }

    // Check if responseData.data exists
    if (!responseData.data) {
      return {
        user: null,
        error: 'Dữ liệu phản hồi không hợp lệ',
      };
    }

    // Extract user data and token from response
    const { id, name, email: userEmail, role, accessToken } = responseData.data;
    
    // Validate required fields
    if (!id || !name || !userEmail || !role || !accessToken) {
      return {
        user: null,
        error: 'Dữ liệu người dùng không đầy đủ',
      };
    }
    
    const user: User = {
      id: id.toString(),
      name,
      email: userEmail,
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Store user data and token
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', accessToken);
    }

    return { user };
  } catch (error) {
    return {
      user: null,
      error: 'Lỗi kết nối. Vui lòng thử lại.',
    };
  }
};

// Register function
export const register = async (name: string, email: string, password: string): Promise<{ user: User | null; error?: string }> => {
  try {
    const response = await fetch(`${config.api.baseUrl}${AUTH_ENDPOINTS.REGISTER}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ name, email, password } as RegisterRequest),
    });

    const responseData = await response.json();

    if (!response.ok) {
      return {
        user: null,
        error: responseData?.message || 'Đăng ký thất bại',
      };
    }

    // Check if responseData.data exists
    if (!responseData.data) {
      return {
        user: null,
        error: 'Dữ liệu phản hồi không hợp lệ',
      };
    }

    // Extract user data from response
    const { id, name: userName, email: userEmail, role } = responseData.data;
    
    // Validate required fields (no accessToken needed for registration)
    if (!id || !userName || !userEmail || !role) {
      return {
        user: null,
        error: 'Dữ liệu người dùng không đầy đủ',
      };
    }
    
    const user: User = {
      id: id.toString(),
      name: userName,
      email: userEmail,
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // For registration, we don't store user data or token in localStorage
    // The component will handle user state management after successful registration
    // User should login separately to get proper authentication token
    
    return { user };
  } catch (error) {
    return {
      user: null,
      error: 'Lỗi kết nối. Vui lòng thử lại.',
    };
  }
};

// Get current user info from API
export const getCurrentUserInfo = async (): Promise<{ user: User | null; error?: string }> => {
  try {
    const token = getAuthToken();
    
    if (!token) {
      return {
        user: null,
        error: 'Không có token xác thực',
      };
    }

    const response = await fetch(`${config.api.baseUrl}${AUTH_ENDPOINTS.ME}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    const responseData = await response.json();

    if (!response.ok) {
      return {
        user: null,
        error: responseData?.message || 'Không thể lấy thông tin người dùng',
      };
    }

    // Check if responseData.data exists
    if (!responseData.data) {
      return {
        user: null,
        error: 'Dữ liệu phản hồi không hợp lệ',
      };
    }

    // Extract user data from response
    const { id, name, email, role } = responseData.data;
    
    // Validate required fields
    if (!id || !name || !email || !role) {
      return {
        user: null,
        error: 'Dữ liệu người dùng không đầy đủ',
      };
    }
    
    const user: User = {
      id: id.toString(),
      name,
      email,
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Update stored user data
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user));
    }

    return { user };
  } catch (error) {
    return {
      user: null,
      error: 'Lỗi kết nối. Vui lòng thử lại.',
    };
  }
};

// Logout function
export const logout = async (): Promise<void> => {
  try {
    const token = getAuthToken();
    
    if (token) {
      await fetch(`${config.api.baseUrl}${AUTH_ENDPOINTS.LOGOUT}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    }
  } catch (error) {
  } finally {
    // Clear local storage regardless of API call success
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  }
};

export const hasRole = (user: User | null, requiredRole: 'admin' | 'seller'): boolean => {
  if (!user?.role) return false;
  
  // Convert API role (ADMIN/SELLER) to lowercase for comparison
  const userRole = user.role.toLowerCase();
  const requiredRoleLower = requiredRole.toLowerCase();
  
  return userRole === requiredRoleLower;
};

export const canAccessStore = (user: User | null): boolean => {
  if (!user) return false;
  if (user.role?.toLowerCase() === 'admin') return true;
  // For sellers, check if they own the store
  // This would typically involve a database query
  return false;
};
