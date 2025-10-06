import { useState, useCallback } from 'react';
import { sellerService } from '@/services';
import { SellerShop, UpdateSellerShopRequest } from '@/types';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}

// Shop CRUD hooks
export function useUpdateSellerShop() {
  const [state, setState] = useState<UseApiState<SellerShop>>({
    data: null,
    loading: false,
    error: null,
    success: false,
  });

  const execute = useCallback(async (shopId: string, data: UpdateSellerShopRequest) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await sellerService.updateShop(shopId, data);
      if (response.success && response.data) {
        setState({ data: response.data, loading: false, error: null, success: true });
      } else {
        setState({ data: null, loading: false, error: response.error || 'Update failed', success: false });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState({ data: null, loading: false, error: errorMessage, success: false });
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

  return { ...state, execute, reset };
}

export function useDeleteSellerShop() {
  const [state, setState] = useState<UseApiState<void>>({
    data: null,
    loading: false,
    error: null,
    success: false,
  });

  const execute = useCallback(async (shopId: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await sellerService.deleteShop(shopId);
      if (response.success) {
        setState({ data: undefined, loading: false, error: null, success: true });
      } else {
        setState({ data: null, loading: false, error: response.error || 'Delete failed', success: false });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState({ data: null, loading: false, error: errorMessage, success: false });
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

  return { ...state, execute, reset };
}
