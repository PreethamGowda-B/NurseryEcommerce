import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  status: string;
  token?: string;
}

export function useAdminUser() {
  return useQuery<AdminUser | null>({
    queryKey: ['adminUser'],
    queryFn: async () => {
      try {
        const res = await api.get('/auth/me');
        const user = res.data.data;
        if (user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN')) {
          return user;
        }
        return null;
      } catch {
        return null;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAdminLogin() {
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
    onSuccess: (data) => {
      if (data.data?.token) {
        localStorage.setItem('auth_token', data.data.token);
      }
      queryClient.setQueryData(['adminUser'], data.data);
    },
  });
}

export function useAdminLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await api.post('/auth/logout');
      return res.data;
    },
    onSuccess: () => {
      localStorage.removeItem('auth_token');
      queryClient.setQueryData(['adminUser'], null);
      queryClient.clear();
    },
  });
}
