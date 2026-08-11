import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { useUser } from './useAuth';
import { useCartStore } from '../features/cart/cartStore';
import { PlantItem } from '../data/plants';

export interface ApiCartItem {
  id: string;
  productId: string;
  name: string;
  slug: string;
  botanicalName?: string | null;
  image: string;
  price: number;
  salePrice: number | null;
  effectivePrice: number;
  quantity: number;
  stockQuantity: number;
  itemSubtotal: number;
  isAvailable: boolean;
  availabilityReason?: string;
  published: boolean;
}

export interface ApiCart {
  id: string;
  items: ApiCartItem[];
  itemCount: number;
  subtotal: number;
  deliveryFee: number;
  freeDeliveryThreshold: number;
  freeDeliveryRemaining: number;
  total: number;
  hasUnavailableItems: boolean;
}

export function useCartQuery(enabled: boolean) {
  return useQuery<ApiCart>({
    queryKey: ['cart'],
    queryFn: async () => {
      const res = await api.get('/cart');
      return res.data.data;
    },
    enabled,
    staleTime: 0,
  });
}

export function useAddToCart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ productId, quantity }: { productId: string; quantity: number }) => {
      const res = await api.post('/cart/items', { productId, quantity });
      return res.data.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['cart'], data);
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ productId, quantity }: { productId: string; quantity: number }) => {
      const res = await api.patch(`/cart/items/${productId}`, { quantity });
      return res.data.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['cart'], data);
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

export function useRemoveCartItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (productId: string) => {
      const res = await api.delete(`/cart/items/${productId}`);
      return res.data.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['cart'], data);
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

export function useClearCart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await api.delete('/cart');
      return res.data.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['cart'], data);
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

/**
 * Unified useCart hook:
 * Automatically uses Backend Cart API when customer is logged in,
 * or localStorage Zustand store when user is a guest.
 */
export function useCart() {
  const { data: user } = useUser();
  const isAuthenticated = !!user;

  // Backend query & mutations
  const cartQuery = useCartQuery(isAuthenticated);
  const addToCartMutation = useAddToCart();
  const updateItemMutation = useUpdateCartItem();
  const removeItemMutation = useRemoveCartItem();
  const clearCartMutation = useClearCart();

  // Guest Zustand store
  const guestStore = useCartStore();

  // Logged-in Customer Cart (Always handle via backend)
  if (isAuthenticated) {
    const apiCart = cartQuery.data;

    const items = apiCart
      ? apiCart.items.map((item) => ({
          product: {
            id: item.productId,
            name: item.name,
            botanicalName: item.botanicalName || '',
            categoryId: 'plant',
            categoryName: 'Plant',
            sunlight: 'Indirect Light' as const,
            watering: 'When topsoil dries' as const,
            careLevel: 'Beginner' as const,
            description: '',
            image: item.image,
            price: item.price,
            salePrice: item.salePrice || undefined,
          } as PlantItem,
          quantity: item.quantity,
          isAvailable: item.isAvailable,
          availabilityReason: item.availabilityReason,
          effectivePrice: item.effectivePrice,
          itemSubtotal: item.itemSubtotal,
        }))
      : [];

    return {
      isAuthenticated: true,
      items,
      itemCount: apiCart?.itemCount ?? 0,
      subtotal: apiCart?.subtotal ?? 0,
      deliveryFee: apiCart?.deliveryFee ?? 0,
      freeDeliveryThreshold: apiCart?.freeDeliveryThreshold ?? 999,
      freeDeliveryRemaining: apiCart?.freeDeliveryRemaining ?? 999,
      total: apiCart?.total ?? 0,
      hasUnavailableItems: apiCart?.hasUnavailableItems ?? false,
      isLoading: cartQuery.isLoading,
      isMutating:
        addToCartMutation.isPending ||
        updateItemMutation.isPending ||
        removeItemMutation.isPending ||
        clearCartMutation.isPending,

      addToCart: async (product: PlantItem, quantity = 1) => {
        guestStore.addItem(product, quantity);
        try {
          await addToCartMutation.mutateAsync({ productId: product.id, quantity });
        } catch (err) {
          console.error('Failed to sync item to backend cart:', err);
        }
      },

      updateQuantity: async (productId: string, quantity: number) => {
        if (quantity <= 0) {
          await removeItemMutation.mutateAsync(productId);
        } else {
          await updateItemMutation.mutateAsync({ productId, quantity });
        }
      },

      removeFromCart: async (productId: string) => {
        await removeItemMutation.mutateAsync(productId);
      },

      clearCart: async () => {
        await clearCartMutation.mutateAsync();
      },

      refreshCart: async () => {
        await cartQuery.refetch();
      },
    };
  }

  // Fallback to Guest Store for unauthenticated visitors
  const subtotal = guestStore.getSubtotal();
  const deliveryFee = guestStore.getDeliveryFee();
  const total = guestStore.getTotal();
  const itemCount = guestStore.getTotalItems();
  const freeDeliveryThreshold = 999;
  const freeDeliveryRemaining = Math.max(0, freeDeliveryThreshold - subtotal);

  const guestItems = guestStore.items.map((i) => ({
    product: i.product,
    quantity: i.quantity,
    isAvailable: true,
    availabilityReason: undefined as string | undefined,
    effectivePrice: i.product.salePrice ?? i.product.price,
    itemSubtotal: (i.product.salePrice ?? i.product.price) * i.quantity,
  }));

  return {
    isAuthenticated: false,
    items: guestItems,
    itemCount,
    subtotal,
    deliveryFee,
    freeDeliveryThreshold,
    freeDeliveryRemaining,
    total,
    hasUnavailableItems: false,
    isLoading: false,
    isMutating: false,

    addToCart: async (product: PlantItem, quantity = 1) => {
      guestStore.addItem(product, quantity);
    },

    updateQuantity: async (productId: string, quantity: number) => {
      guestStore.updateQuantity(productId, quantity);
    },

    removeFromCart: async (productId: string) => {
      guestStore.removeItem(productId);
    },

    clearCart: async () => {
      guestStore.clearCart();
    },

    refreshCart: async () => {},
  };
}
