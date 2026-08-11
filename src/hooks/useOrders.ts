import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

export interface OrderItemSnapshot {
  id: string;
  productId: string;
  productNameSnapshot: string;
  priceSnapshot: number;
  quantity: number;
  subtotal: number;
}

export interface ShippingAddressSnapshot {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  label: string;
}

export interface CustomerOrder {
  id: string;
  orderNumber: string;
  userId: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  shippingAddress: ShippingAddressSnapshot;
  items: OrderItemSnapshot[];
  createdAt: string;
  updatedAt: string;
}

export function useCustomerOrders() {
  return useQuery<CustomerOrder[]>({
    queryKey: ['customerOrders'],
    queryFn: async () => {
      const res = await api.get('/orders');
      return res.data.data;
    },
    staleTime: 30 * 1000,
  });
}

export function useCustomerOrder(orderNumber: string | null) {
  return useQuery<CustomerOrder>({
    queryKey: ['customerOrder', orderNumber],
    queryFn: async () => {
      if (!orderNumber) throw new Error('Order number is required');
      const res = await api.get(`/orders/${orderNumber}`);
      return res.data.data;
    },
    enabled: !!orderNumber,
    staleTime: 60 * 1000,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ addressId }: { addressId: string }) => {
      const res = await api.post('/orders', { addressId });
      return res.data.data as CustomerOrder;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['customerOrders'] });
    },
  });
}
