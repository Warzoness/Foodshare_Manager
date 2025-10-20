import { useState, useEffect, useCallback, useRef } from 'react';
import { adminService, sellerService } from '@/services';
import { ApiResponse, CreateSellerShopRequest, UpdateSellerShopRequest, CreateSellerProductRequest, UpdateSellerProductRequest, UpdateStoreRequest, UpdateProductRequest, SellerShop, PaginationParams } from '@/types';
import { AdminPaginationParams } from '@/services/adminService';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}

interface UseApiOptions {
  immediate?: boolean;
  onSuccess?: (data: unknown) => void;
  onError?: (error: string) => void;
}

export function useApi<T>(
  apiCall: () => Promise<ApiResponse<T>>,
  options: UseApiOptions = {}
) {
  const { immediate = false, onSuccess, onError } = options;
  
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
    success: false,
  });

  // Use ref to store the latest apiCall to avoid dependency issues
  const apiCallRef = useRef(apiCall);
  apiCallRef.current = apiCall;

  const execute = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await apiCallRef.current();
      
      if (response.success) {
        setState({
          data: response.data || null,
          loading: false,
          error: null,
          success: true,
        });
        onSuccess?.(response.data);
      } else {
        setState({
          data: null,
          loading: false,
          error: response.error || 'Unknown error',
          success: false,
        });
        onError?.(response.error || 'Unknown error');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState({
        data: null,
        loading: false,
        error: errorMessage,
        success: false,
      });
      onError?.(errorMessage);
    }
  }, [onSuccess, onError]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, execute]);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      success: false,
    });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

// Admin API hooks
export function useStores(params?: Record<string, unknown>) {
  const paramsString = JSON.stringify(params);
  const apiCall = useCallback(() => adminService.getStores(params as unknown as AdminPaginationParams), [paramsString]);
  const apiResult = useApi(apiCall, { immediate: !!params });
  
  // Re-execute when params change
  useEffect(() => {
    if (params) {
      apiResult.execute();
    }
  }, [paramsString, apiResult.execute]);
  
  return apiResult;
}

export function useProductsByShop(shopId: string, params?: Record<string, unknown>) {
  const paramsString = JSON.stringify(params);
  const apiCall = useCallback(() => adminService.getProductsByShop(shopId, params as unknown as AdminPaginationParams), [shopId, paramsString]);
  const apiResult = useApi(apiCall, { immediate: !!shopId });
  
  // Re-execute when params change
  useEffect(() => {
    if (shopId) {
      apiResult.execute();
    }
  }, [shopId, paramsString, apiResult.execute]);
  
  return apiResult;
}

export function useProducts(params?: Record<string, unknown>) {
  const paramsString = JSON.stringify(params);
  const apiCall = useCallback(() => adminService.getAllProducts(params as unknown as { page?: number; size?: number; sort?: string[] }), [paramsString]);
  const apiResult = useApi(apiCall, { immediate: !!params });
  
  // Re-execute when params change
  useEffect(() => {
    if (params) {
      apiResult.execute();
    }
  }, [paramsString, apiResult.execute, params]);
  
  return apiResult;
}

export function useUsers(params?: Record<string, unknown>) {
  const paramsString = JSON.stringify(params);
  const apiCall = useCallback(() => adminService.getUsers(params as unknown as AdminPaginationParams), [paramsString]);
  return useApi(apiCall, { immediate: !!params });
}

export function useUser(id: string) {
  const apiCall = useCallback(() => adminService.getUser(id), [id]);
  return useApi(apiCall, { immediate: !!id });
}

export function useUpdateUser() {
  const [state, setState] = useState<UseApiState<unknown>>({
    data: null,
    loading: false,
    error: null,
    success: false,
  });

  const execute = useCallback(async (id: string, data: Record<string, unknown>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await adminService.updateUser(id, data);
      
      if (response.success) {
        setState({
          data: response.data,
          loading: false,
          error: null,
          success: true,
        });
      } else {
        setState({
          data: null,
          loading: false,
          error: response.error || 'Cập nhật người dùng thất bại',
          success: false,
        });
      }
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Có lỗi xảy ra',
        success: false,
      });
    }
  }, []);

  return { ...state, execute };
}

export function useOrders(params?: Record<string, unknown>) {
  const paramsString = JSON.stringify(params);
  const apiCall = useCallback(() => adminService.getOrders(params as unknown as PaginationParams), [paramsString]);
  return useApi(apiCall, { immediate: !!params });
}

export function useAdminProducts(params?: Record<string, unknown>) {
  const paramsString = JSON.stringify(params);
  const apiCall = useCallback(() => adminService.getProducts(params as unknown as AdminPaginationParams), [paramsString]);
  const apiResult = useApi(apiCall, { immediate: !!params });
  
  // Re-execute when params change
  useEffect(() => {
    if (params) {
      apiResult.execute();
    }
  }, [paramsString, apiResult.execute, params]);
  
  return apiResult;
}

export function useReports(params?: Record<string, unknown>) {
  const paramsString = JSON.stringify(params);
  const apiCall = useCallback(() => adminService.getReports(params), [paramsString]);
  return useApi(apiCall, { immediate: !!params });
}

export function useAdminProductsByShop(shopId: string, params?: Record<string, unknown>) {
  const paramsString = JSON.stringify(params);
  const apiCall = useCallback(() => adminService.getProductsByShop(shopId, params as unknown as AdminPaginationParams), [shopId, paramsString]);
  const apiResult = useApi(apiCall, { immediate: !!shopId });
  
  // Re-execute when params change
  useEffect(() => {
    if (shopId && params) {
      apiResult.execute();
    }
  }, [paramsString, shopId, apiResult.execute, params]);
  
  return apiResult;
}

export function useSellerShopProducts(shopId: string, params?: {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}) {
  const paramsString = JSON.stringify(params);
  const apiCall = useCallback(() => sellerService.getShopProducts(shopId, params), [shopId, paramsString]);
  const apiResult = useApi(apiCall, { immediate: !!shopId });
  
  // Re-execute when params change
  useEffect(() => {
    if (shopId) {
      apiResult.execute();
    }
  }, [shopId, paramsString, apiResult.execute]);
  
  return apiResult;
}

// Admin mutation hooks
export function useDeleteStore() {
  const [state, setState] = useState<UseApiState<unknown>>({
    data: null,
    loading: false,
    error: null,
    success: false,
  });

  const execute = useCallback(async (storeId: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await adminService.deleteStore(storeId);
      
      if (response.success) {
        setState({
          data: response.data,
          loading: false,
          error: null,
          success: true,
        });
      } else {
        setState({
          data: null,
          loading: false,
          error: response.error || 'Unknown error',
          success: false,
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState({
        data: null,
        loading: false,
        error: errorMessage,
        success: false,
      });
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      success: false,
    });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

export function useUpdateStore() {
  const [state, setState] = useState<UseApiState<unknown>>({
    data: null,
    loading: false,
    error: null,
    success: false,
  });

  const execute = useCallback(async (storeId: string, data: UpdateStoreRequest) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await adminService.updateStore(storeId, data);
      
      if (response.success) {
        setState({
          data: response.data,
          loading: false,
          error: null,
          success: true,
        });
      } else {
        setState({
          data: null,
          loading: false,
          error: response.error || 'Unknown error',
          success: false,
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState({
        data: null,
        loading: false,
        error: errorMessage,
        success: false,
      });
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      success: false,
    });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

export function useAdminProductDetail(id: string) {
  const apiCall = useCallback(() => adminService.getProductDetail(id), [id]);
  return useApi(apiCall, { immediate: !!id });
}

export function useUpdateProduct() {
  const [state, setState] = useState<UseApiState<unknown>>({
    data: null,
    loading: false,
    error: null,
    success: false,
  });

  const execute = useCallback(async (productId: string, data: UpdateProductRequest) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await adminService.updateProduct(productId, data);
      
      if (response.success) {
        setState({
          data: response.data,
          loading: false,
          error: null,
          success: true,
        });
      } else {
        setState({
          data: null,
          loading: false,
          error: response.error || 'Unknown error',
          success: false,
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState({
        data: null,
        loading: false,
        error: errorMessage,
        success: false,
      });
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      success: false,
    });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

export function useDeleteProduct() {
  const [state, setState] = useState<UseApiState<unknown>>({
    data: null,
    loading: false,
    error: null,
    success: false,
  });

  const execute = useCallback(async (productId: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await adminService.deleteProduct(productId);
      
      if (response.success) {
        setState({
          data: response.data,
          loading: false,
          error: null,
          success: true,
        });
      } else {
        setState({
          data: null,
          loading: false,
          error: response.error || 'Xóa sản phẩm thất bại',
          success: false,
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra khi xóa sản phẩm';
      setState({
        data: null,
        loading: false,
        error: errorMessage,
        success: false,
      });
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      success: false,
    });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

// Seller API hooks
export function useSellerShops() {
  const [state, setState] = useState<UseApiState<SellerShop[]>>({
    data: null,
    loading: false,
    error: null,
    success: false,
  });

  const execute = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const shops = await sellerService.getShops();
      setState({
        data: shops,
        loading: false,
        error: null,
        success: true,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState({
        data: null,
        loading: false,
        error: errorMessage,
        success: false,
      });
    }
  }, []);

  useEffect(() => {
    execute();
  }, [execute]);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      success: false,
    });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

export function useSellerShop(shopId: string) {
  const apiCall = useCallback(() => sellerService.getShop(shopId), [shopId]);
  return useApi(apiCall, { immediate: !!shopId });
}

export function useSellerProduct(productId: string) {
  const apiCall = useCallback(() => sellerService.getProduct(productId), [productId]);
  return useApi(apiCall, { immediate: !!productId });
}

// Seller mutation hooks
export function useCreateSellerShop() {
  const [state, setState] = useState<UseApiState<SellerShop>>({
    data: null,
    loading: false,
    error: null,
    success: false,
  });

  const execute = useCallback(async (data: CreateSellerShopRequest) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await sellerService.createShop(data);
      setState({
        data: response.data || null,
        loading: false,
        error: null,
        success: true,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState({
        data: null,
        loading: false,
        error: errorMessage,
        success: false,
      });
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      success: false,
    });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

export function useUpdateSellerShop() {
  const [state, setState] = useState<UseApiState<unknown>>({
    data: null,
    loading: false,
    error: null,
    success: false,
  });

  const execute = useCallback(async (shopId: string, data: UpdateSellerShopRequest) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await sellerService.updateShop(shopId, data);
      
      if (response.success) {
        setState({
          data: response.data,
          loading: false,
          error: null,
          success: true,
        });
      } else {
        setState({
          data: null,
          loading: false,
          error: response.error || 'Unknown error',
          success: false,
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState({
        data: null,
        loading: false,
        error: errorMessage,
        success: false,
      });
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      success: false,
    });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

export function useCreateSellerProduct() {
  const [state, setState] = useState<UseApiState<unknown>>({
    data: null,
    loading: false,
    error: null,
    success: false,
  });

  const execute = useCallback(async (data: CreateSellerProductRequest) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await sellerService.createProduct(data);
      
      if (response.success) {
        setState({
          data: response.data,
          loading: false,
          error: null,
          success: true,
        });
        return response;
      } else {
        setState({
          data: null,
          loading: false,
          error: response.error || 'Unknown error',
          success: false,
        });
        return response;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorResponse = {
        success: false,
        error: errorMessage,
        data: null
      };
      setState({
        data: null,
        loading: false,
        error: errorMessage,
        success: false,
      });
      return errorResponse;
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      success: false,
    });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

export function useUpdateSellerProduct() {
  const [state, setState] = useState<UseApiState<unknown>>({
    data: null,
    loading: false,
    error: null,
    success: false,
  });

  const execute = useCallback(async (productId: string, data: UpdateSellerProductRequest) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await sellerService.updateProduct(productId, data);
      
      if (response.success) {
        setState({
          data: response.data,
          loading: false,
          error: null,
          success: true,
        });
        return response;
      } else {
        setState({
          data: null,
          loading: false,
          error: response.error || 'Unknown error',
          success: false,
        });
        return response;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorResponse = {
        success: false,
        error: errorMessage,
        data: null
      };
      setState({
        data: null,
        loading: false,
        error: errorMessage,
        success: false,
      });
      return errorResponse;
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      success: false,
    });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

// Seller Orders hooks
export function useSellerOrders(params?: { status?: string }) {
  const paramsString = JSON.stringify(params);
  const apiCall = useCallback(() => sellerService.getOrders(params), [paramsString]);
  return useApi(apiCall, { immediate: true });
}

export function useUpdateOrderStatus() {
  const [state, setState] = useState<UseApiState<unknown>>({
    data: null,
    loading: false,
    error: null,
    success: false,
  });

  const execute = useCallback(async (orderId: string, status: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await sellerService.updateOrderStatus(orderId, status);
      
      if (response.success) {
        setState({
          data: response.data,
          loading: false,
          error: null,
          success: true,
        });
        return response;
      } else {
        setState({
          data: null,
          loading: false,
          error: response.error || 'Unknown error',
          success: false,
        });
        return response;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorResponse = {
        success: false,
        error: errorMessage,
        data: null
      };
      setState({
        data: null,
        loading: false,
        error: errorMessage,
        success: false,
      });
      return errorResponse;
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      success: false,
    });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

export function useSellerShopOrders(params?: {
  shopId?: number;
  status?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}) {
  console.log('🎯 useSellerShopOrders hook called with params:', params);
  const paramsString = JSON.stringify(params);
  const apiCall = useCallback(() => {
    console.log('🚀 API call triggered with params:', params);
    return sellerService.getShopOrders(params);
  }, [paramsString]);
  return useApi(apiCall, { immediate: true });
}

export function useDeleteSellerProduct() {
  const [state, setState] = useState<UseApiState<unknown>>({
    data: null,
    loading: false,
    error: null,
    success: false,
  });

  const execute = useCallback(async (productId: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await sellerService.deleteProduct(productId);
      
      if (response.success) {
        setState({
          data: response.data,
          loading: false,
          error: null,
          success: true,
        });
      } else {
        setState({
          data: null,
          loading: false,
          error: response.error || 'Unknown error',
          success: false,
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState({
        data: null,
        loading: false,
        error: errorMessage,
        success: false,
      });
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      success: false,
    });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

// Auth hooks
export function useRegister() {
  const [state, setState] = useState<UseApiState<unknown>>({
    data: null,
    loading: false,
    error: null,
    success: false,
  });

  const execute = useCallback(async (name: string, email: string, password: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const { register } = await import('@/lib/auth');
      const response = await register(name, email, password);
      
      if (response.user) {
        setState({
          data: response.user,
          loading: false,
          error: null,
          success: true,
        });
      } else {
        setState({
          data: null,
          loading: false,
          error: response.error || 'Đăng ký thất bại',
          success: false,
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState({
        data: null,
        loading: false,
        error: errorMessage,
        success: false,
      });
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      success: false,
    });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

// Seller Dashboard hooks
export function useSellerDashboardStats() {
  const [state, setState] = useState<UseApiState<{
    todayOrders: number;
    todayRevenue: number;
    activeProducts: number;
    pendingOrders: number;
  }>>({
    data: null,
    loading: false,
    error: null,
    success: false,
  });

  const execute = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const { sellerDashboardService } = await import('@/services/sellerDashboardService');
      const stats = await sellerDashboardService.getStats();
      setState({
        data: stats,
        loading: false,
        error: null,
        success: true,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState({
        data: null,
        loading: false,
        error: errorMessage,
        success: false,
      });
    }
  }, []);

  useEffect(() => {
    execute();
  }, [execute]);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      success: false,
    });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

export function useSellerRecentOrders(limit: number = 5) {
  const [state, setState] = useState<UseApiState<Array<{
    id: string;
    customerName: string;
    amount: number;
    status: string;
    createdAt: string;
  }>>>({
    data: null,
    loading: false,
    error: null,
    success: false,
  });

  const execute = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const { sellerDashboardService } = await import('@/services/sellerDashboardService');
      const orders = await sellerDashboardService.getRecentOrders(limit);
      setState({
        data: orders,
        loading: false,
        error: null,
        success: true,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState({
        data: null,
        loading: false,
        error: errorMessage,
        success: false,
      });
    }
  }, [limit]);

  useEffect(() => {
    execute();
  }, [execute]);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      success: false,
    });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

export function useSellerTopProducts(limit: number = 5) {
  const [state, setState] = useState<UseApiState<Array<{
    id: string;
    name: string;
    sold: number;
    revenue: number;
  }>>>({
    data: null,
    loading: false,
    error: null,
    success: false,
  });

  const execute = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const { sellerDashboardService } = await import('@/services/sellerDashboardService');
      const products = await sellerDashboardService.getTopProducts(limit);
      setState({
        data: products,
        loading: false,
        error: null,
        success: true,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState({
        data: null,
        loading: false,
        error: errorMessage,
        success: false,
      });
    }
  }, [limit]);

  useEffect(() => {
    execute();
  }, [execute]);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      success: false,
    });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}