import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'https://sheeneeka-nursery-api.onrender.com';

export function useCustomerSSE(onStatusUpdate?: (data: any) => void) {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Authenticated SSE stream for customer live order tracking
    const sseUrl = `${API_BASE_URL}/api/sse/customer`;
    const eventSource = new EventSource(sseUrl, { withCredentials: true });

    eventSource.onopen = () => {
      console.log('⚡ Customer Order Live Tracking SSE Connected');
    };

    // Listen strictly for ORDER_STATUS_UPDATED for this customer's orders
    eventSource.addEventListener('ORDER_STATUS_UPDATED', (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        console.log('🔔 REAL-TIME EVENT: ORDER_STATUS_UPDATED', data);

        // Invalidate customer orders query cache for instant live UI update
        queryClient.invalidateQueries({ queryKey: ['customerOrders'] });

        if (onStatusUpdate) {
          onStatusUpdate(data);
        }
      } catch (err) {
        console.error('Error parsing customer SSE order update:', err);
      }
    });

    eventSource.onerror = (err) => {
      console.warn('Customer SSE stream reconnecting...', err);
    };

    return () => {
      eventSource.close();
    };
  }, [queryClient, onStatusUpdate]);
}
