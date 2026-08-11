import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

export interface AdminProduct {
  id: string;
  name: string;
  botanicalName?: string;
  slug: string;
  sku: string;
  categoryId: string;
  description: string;
  shortDescription?: string;
  price: number;
  salePrice?: number | null;
  stockQuantity: number;
  lowStockThreshold: number;
  sunlight?: string;
  watering?: string;
  careLevel?: string;
  plantSize?: string;
  published: boolean;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  images?: {
    id: string;
    url: string;
    altText?: string;
    sortOrder: number;
  }[];
}

export interface AdminProductsParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  published?: boolean;
}

export function useAdminProducts(params: AdminProductsParams = {}) {
  return useQuery({
    queryKey: ['adminProducts', params],
    queryFn: async () => {
      const res = await api.get('/admin/products', { params });
      return res.data;
    },
    staleTime: 30 * 1000,
  });
}

export function useAdminProduct(id: string) {
  return useQuery({
    queryKey: ['adminProduct', id],
    queryFn: async () => {
      const res = await api.get(`/admin/products/${id}`);
      return res.data.data;
    },
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<AdminProduct> & { imageUrl?: string }) => {
      const res = await api.post('/admin/products', payload);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboardStats'] });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<AdminProduct> & { imageUrl?: string } }) => {
      const res = await api.patch(`/admin/products/${id}`, data);
      return res.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      queryClient.invalidateQueries({ queryKey: ['adminProduct', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboardStats'] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/admin/products/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboardStats'] });
    },
  });
}
