import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

export interface RazorpayOrderData {
  razorpayOrderId: string;
  amount: number;
  currency: string;
  keyId: string;
  orderNumber: string;
}

export interface VerifyPaymentPayload {
  orderNumber: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export function useCreateRazorpayOrder() {
  return useMutation({
    mutationFn: async ({ orderNumber }: { orderNumber: string }) => {
      const res = await api.post('/payments/razorpay/create', { orderNumber });
      return res.data.data as RazorpayOrderData;
    },
  });
}

export function useVerifyRazorpayPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: VerifyPaymentPayload) => {
      const res = await api.post('/payments/razorpay/verify', payload);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['customerOrders'] });
    },
  });
}

export function useConfirmCodOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ orderNumber }: { orderNumber: string }) => {
      const res = await api.post('/payments/cod/confirm', { orderNumber });
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['customerOrders'] });
    },
  });
}
