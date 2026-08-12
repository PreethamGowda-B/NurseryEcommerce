import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { useCartStore } from '../features/cart/cartStore';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  status: string;
  token?: string;
}

export function useUser() {
  return useQuery<UserProfile | null>({
    queryKey: ['currentUser'],
    queryFn: async () => {
      try {
        const res = await api.get('/auth/me');
        return res.data.data;
      } catch {
        return null;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const res = await api.post('/auth/login', { email, password });
      const user = res.data?.data;
      if (user?.token) {
        localStorage.setItem('auth_token', user.token);
      }
      return res.data;
    },
    onSuccess: async (data) => {
      const user = data.data;
      if (user?.token) {
        localStorage.setItem('auth_token', user.token);
      }
      queryClient.setQueryData(['currentUser'], user);

      // Merge local guest cart into backend cart upon login
      const guestItems = useCartStore.getState().items.map((i) => ({
        productId: i.product.id,
        quantity: i.quantity,
      }));

      if (guestItems.length > 0) {
        try {
          const mergeRes = await api.post('/cart/merge', { items: guestItems });
          const unavail = mergeRes.data?.data?.unavailableItems || [];
          if (unavail.length > 0) {
            const names = unavail.map((u: any) => `${u.name} (${u.reason})`).join(', ');
            alert(`Note: Some items from your guest cart could not be added: ${names}`);
          }
          useCartStore.getState().clearCart();
        } catch (err) {
          console.error('Failed to merge guest cart into backend:', err);
        }
      }

      await queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { name: string; email: string; phone?: string; password: string }) => {
      const res = await api.post('/auth/register', payload);
      const user = res.data?.data;
      if (user?.token) {
        localStorage.setItem('auth_token', user.token);
      }
      return res.data;
    },
    onSuccess: async (data) => {
      const user = data.data;
      if (user?.token) {
        localStorage.setItem('auth_token', user.token);
      }
      queryClient.setQueryData(['currentUser'], user);

      // Merge local guest cart into backend cart upon registration
      const guestItems = useCartStore.getState().items.map((i) => ({
        productId: i.product.id,
        quantity: i.quantity,
      }));

      if (guestItems.length > 0) {
        try {
          const mergeRes = await api.post('/cart/merge', { items: guestItems });
          const unavail = mergeRes.data?.data?.unavailableItems || [];
          if (unavail.length > 0) {
            const names = unavail.map((u: any) => `${u.name} (${u.reason})`).join(', ');
            alert(`Note: Some items from your guest cart could not be added: ${names}`);
          }
          useCartStore.getState().clearCart();
        } catch (err) {
          console.error('Failed to merge guest cart into backend:', err);
        }
      }

      await queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await api.post('/auth/logout');
      return res.data;
    },
    onSuccess: () => {
      localStorage.removeItem('auth_token');
      queryClient.setQueryData(['currentUser'], null);
      useCartStore.getState().clearCart();
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}
