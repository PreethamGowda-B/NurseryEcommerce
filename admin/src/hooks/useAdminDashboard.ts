import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';

export interface DashboardStats {
  totalProducts: number;
  publishedProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  totalCategories: number;
  totalUnits: number;
  orders: {
    total: number;
    pending: number;
    confirmed: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  };
  revenue: {
    paidRevenue: number;
    codPendingAmount: number;
  };
}

export function useAdminDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: ['adminDashboardStats'],
    queryFn: async () => {
      const res = await api.get('/admin/dashboard/stats');
      return res.data.data;
    },
    staleTime: 30 * 1000,
  });
}
