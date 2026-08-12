import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'https://sheeneeka-nursery-api.onrender.com';

export function useAdminSSE(onNewOrder?: (orderData: any) => void) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    // Standard EventSource connection to authenticated Express SSE endpoint
    const sseUrl = `${API_BASE_URL}/api/sse/admin?token=${encodeURIComponent(token)}`;
    const eventSource = new EventSource(sseUrl, { withCredentials: true });

    eventSource.onopen = () => {
      console.log('⚡ Admin Real-Time SSE Stream Connected');
    };

    // 1. Listen for new orders created by customers
    eventSource.addEventListener('ORDER_CREATED', (e: MessageEvent) => {
      try {
        const orderData = JSON.parse(e.data);
        console.log('🔔 REAL-TIME EVENT: ORDER_CREATED', orderData);
        
        // Invalidate admin queries so orders and stats update instantly
        queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
        queryClient.invalidateQueries({ queryKey: ['adminStats'] });

        if (onNewOrder) {
          onNewOrder(orderData);
        }
      } catch (err) {
        console.error('Error parsing ORDER_CREATED SSE event:', err);
      }
    });

    // 2. Listen for order status updates
    eventSource.addEventListener('ORDER_STATUS_UPDATED', (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        console.log('🔔 REAL-TIME EVENT: ORDER_STATUS_UPDATED', data);

        queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
        queryClient.invalidateQueries({ queryKey: ['adminStats'] });
      } catch (err) {
        console.error('Error parsing ORDER_STATUS_UPDATED SSE event:', err);
      }
    });

    // 3. Listen for inventory updates
    eventSource.addEventListener('INVENTORY_UPDATED', () => {
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      queryClient.invalidateQueries({ queryKey: ['adminInventory'] });
    });

    eventSource.onerror = (err) => {
      console.warn('SSE stream reconnecting/re-establishing...', err);
    };

    // Cleanup connection on unmount
    return () => {
      eventSource.close();
    };
  }, [queryClient, onNewOrder]);
}
