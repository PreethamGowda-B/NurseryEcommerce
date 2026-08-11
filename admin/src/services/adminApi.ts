import api from '../lib/api';

export interface AdminDashboardStats {
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

export interface AdminOrderSummary {
  id: string;
  orderNumber: string;
  createdAt: string;
  updatedAt: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  itemCount: number;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  shippingAddress: {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  } | null;
  internalNotes?: string | null;
}

export interface AdminOrderDetail extends AdminOrderSummary {
  discount: number;
  tax: number;
  idempotencyKey?: string | null;
  items: Array<{
    id: string;
    productId: string;
    productNameSnapshot: string;
    priceSnapshot: number;
    quantity: number;
    subtotal: number;
    currentProduct: {
      id: string;
      name: string;
      sku: string;
      image: string | null;
    } | null;
  }>;
  payment: {
    id: string;
    provider: string;
    providerOrderId?: string | null;
    providerPaymentId?: string | null;
    amount: number;
    status: string;
    webhookVerified: boolean;
    createdAt: string;
  } | null;
  statusHistory: Array<{
    id: string;
    status: string;
    note?: string | null;
    changedBy?: string | null;
    createdAt: string;
  }>;
}

export interface InventoryItem {
  id: string;
  name: string;
  slug: string;
  sku: string;
  category: string;
  price: number;
  salePrice: number | null;
  stockQuantity: number;
  lowStockThreshold: number;
  status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
  published: boolean;
}

export interface InventoryTransaction {
  id: string;
  productId: string;
  type: 'RESERVE' | 'SALE' | 'RELEASE' | 'ADJUSTMENT';
  quantity: number;
  reason?: string | null;
  createdAt: string;
  product?: {
    id: string;
    name: string;
    sku: string;
  };
  order?: {
    id: string;
    orderNumber: string;
  };
}

export async function fetchAdminDashboardStats(): Promise<AdminDashboardStats> {
  const res = await api.get('/admin/dashboard/stats');
  return res.data.data;
}

export async function fetchAdminOrders(params: Record<string, any>) {
  const res = await api.get('/admin/orders', { params });
  return res.data;
}

export async function fetchAdminOrderDetail(orderNumber: string): Promise<AdminOrderDetail> {
  const res = await api.get(`/admin/orders/${orderNumber}`);
  return res.data.data;
}

export async function updateAdminOrderStatus(
  orderNumber: string,
  payload: { status: string; note?: string; internalNotes?: string }
): Promise<AdminOrderDetail> {
  const res = await api.patch(`/admin/orders/${orderNumber}/status`, payload);
  return res.data.data;
}

export async function collectAdminCodPayment(orderNumber: string): Promise<AdminOrderDetail> {
  const res = await api.post(`/admin/orders/${orderNumber}/cod/collect`);
  return res.data.data;
}

export async function updateAdminOrderNotes(
  orderNumber: string,
  internalNotes: string
): Promise<AdminOrderDetail> {
  const res = await api.patch(`/admin/orders/${orderNumber}/notes`, { internalNotes });
  return res.data.data;
}

export async function fetchInventoryMetrics() {
  const res = await api.get('/admin/inventory/metrics');
  return res.data.data;
}

export async function fetchInventoryList(params: Record<string, any>) {
  const res = await api.get('/admin/inventory', { params });
  return res.data;
}

export async function adjustInventoryStock(
  productId: string,
  payload: { quantity: number; reason: string }
) {
  const res = await api.post(`/admin/inventory/${productId}/adjust`, payload);
  return res.data.data;
}

export async function fetchInventoryTransactions(params: Record<string, any>) {
  const res = await api.get('/admin/inventory/transactions', { params });
  return res.data;
}
