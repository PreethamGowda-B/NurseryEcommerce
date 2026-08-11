import React, { useState } from 'react';
import { Navbar } from '../components/navigation/Navbar';
import { FinalCTA } from '../components/footer/FinalCTA';
import { useUser } from '../hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Truck,
  Plus,
  RefreshCw,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  DollarSign,
  Search,
  Filter,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface DashboardStats {
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

export const AdminPage: React.FC = () => {
  const { data: user, isLoading: isUserLoading } = useUser();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'products'>('overview');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('ALL');
  const [orderSearch, setOrderSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [showAddProductModal, setShowAddProductModal] = useState(false);

  // New Product Form State
  const [newProdName, setNewProdName] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdSalePrice, setNewProdSalePrice] = useState('');
  const [newProdStock, setNewProdStock] = useState('25');
  const [newProdCategory, setNewProdCategory] = useState('cat-indoor');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdImage, setNewProdImage] = useState('');
  const [formMsg, setFormMsg] = useState<string | null>(null);

  const isAdmin = user?.role === 'ADMIN';

  // 1. Fetch Dashboard Stats
  const { data: statsData, isLoading: statsLoading, refetch: refetchStats } = useQuery<DashboardStats>({
    queryKey: ['adminStats'],
    queryFn: async () => {
      const res = await api.get('/admin/dashboard/stats');
      return res.data.data;
    },
    enabled: isAdmin,
    staleTime: 30000,
  });

  // 2. Fetch Orders
  const { data: ordersData, isLoading: ordersLoading, refetch: refetchOrders } = useQuery({
    queryKey: ['adminOrders', orderStatusFilter, orderSearch],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (orderStatusFilter !== 'ALL') params.append('status', orderStatusFilter);
      if (orderSearch) params.append('search', orderSearch);
      const res = await api.get(`/admin/orders?${params.toString()}`);
      return res.data.data;
    },
    enabled: isAdmin,
  });

  // 3. Fetch Products
  const { data: productsData, isLoading: productsLoading, refetch: refetchProducts } = useQuery({
    queryKey: ['adminProducts', productSearch],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (productSearch) params.append('search', productSearch);
      params.append('limit', '50');
      const res = await api.get(`/admin/products?${params.toString()}`);
      return res.data.data;
    },
    enabled: isAdmin,
  });

  // Order Status Update Mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderNumber, status }: { orderNumber: string; status: string }) => {
      const res = await api.patch(`/admin/orders/${orderNumber}/status`, {
        status,
        note: `Status updated to ${status} by admin`,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
    },
  });

  // COD Collect Mutation
  const collectCodMutation = useMutation({
    mutationFn: async (orderNumber: string) => {
      const res = await api.post(`/admin/orders/${orderNumber}/cod/collect`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
    },
  });

  // Create Product Mutation
  const createProductMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.post('/admin/products', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
      setShowAddProductModal(false);
      setNewProdName('');
      setNewProdPrice('');
      setNewProdSalePrice('');
      setNewProdDesc('');
      setNewProdImage('');
    },
  });

  // Toggle Published Mutation
  const togglePublishMutation = useMutation({
    mutationFn: async ({ productId, published }: { productId: string; published: boolean }) => {
      const res = await api.patch(`/admin/products/${productId}`, { published });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
    },
  });

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    setFormMsg(null);

    const price = parseFloat(newProdPrice);
    const stockQuantity = parseInt(newProdStock, 10);
    const salePrice = newProdSalePrice ? parseFloat(newProdSalePrice) : undefined;

    if (!newProdName || isNaN(price) || isNaN(stockQuantity)) {
      setFormMsg('Please fill all required product fields correctly.');
      return;
    }

    createProductMutation.mutate({
      name: newProdName,
      price,
      salePrice,
      stockQuantity,
      categoryId: newProdCategory,
      description: newProdDesc || 'Healthy nursery plant specimen.',
      images: newProdImage ? [{ url: newProdImage, altText: newProdName, sortOrder: 0 }] : undefined,
      published: true,
    });
  };

  if (isUserLoading) {
    return (
      <div className="min-h-screen bg-[#faf9f6] pt-28 flex items-center justify-center">
        <div className="flex items-center gap-3 text-[#386641] font-semibold text-sm">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Verifying Admin Permissions...</span>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-[#faf9f6] text-[#0f2d21] pt-28">
        <Navbar />
        <div className="max-w-md mx-auto px-4 py-16 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="font-cinzel text-2xl font-bold">Admin Portal Restricted</h1>
            <p className="text-slate-500 text-xs font-light leading-relaxed">
              You must be logged in as an authorized Sheeneeka Nursery Administrator to view this control panel.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 text-xs text-left space-y-2">
            <p className="font-bold text-slate-700">Default Seed Admin Credentials:</p>
            <p className="font-mono text-slate-600 select-all">Email: admin@sheeneekanursery.in</p>
            <p className="font-mono text-slate-600 select-all">Password: Admin@Sheeneeka2026!</p>
          </div>
          <Link
            to="/login?redirect=/admin"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#386641] text-white text-xs font-semibold hover:bg-[#2d5234] transition-all shadow-natural"
          >
            <span>Log In as Admin</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <FinalCTA />
      </div>
    );
  }

  const ordersList = ordersData?.orders || [];
  const productsList = productsData?.data || [];

  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#0f2d21] pt-28">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Admin Header */}
        <div className="bg-white border border-emerald-900/10 rounded-3xl p-6 sm:p-8 shadow-natural flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/80 text-[#386641] text-[10px] font-bold uppercase tracking-widest">
              <span>ADMINISTRATOR CONTROL CENTER</span>
            </div>
            <h1 className="font-cinzel text-2xl sm:text-3xl font-bold text-[#0f2d21]">
              Sheeneeka Nursery Operations
            </h1>
            <p className="text-slate-500 text-xs font-light">
              Logged in as <strong className="text-[#386641]">{user.name}</strong> ({user.email})
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/80">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                activeTab === 'overview' ? 'bg-[#386641] text-white shadow-xs' : 'text-slate-600 hover:text-[#0f2d21]'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Overview</span>
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                activeTab === 'orders' ? 'bg-[#386641] text-white shadow-xs' : 'text-slate-600 hover:text-[#0f2d21]'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Orders ({statsData?.orders.pending || 0} Pending)</span>
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                activeTab === 'products' ? 'bg-[#386641] text-white shadow-xs' : 'text-slate-600 hover:text-[#0f2d21]'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Products ({statsData?.totalProducts || 0})</span>
            </button>
          </div>
        </div>

        {/* TAB 1: OVERVIEW & ANALYTICS */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white border border-emerald-900/10 rounded-3xl p-6 shadow-natural space-y-2">
                <div className="flex items-center justify-between text-emerald-700">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Revenue</span>
                  <DollarSign className="w-5 h-5 bg-emerald-100 p-1 rounded-full" />
                </div>
                <div className="font-cinzel text-2xl font-bold text-[#0f2d21]">
                  ₹{statsData?.revenue.paidRevenue.toLocaleString() || '0'}
                </div>
                <p className="text-[11px] text-amber-700 font-medium">
                  + ₹{statsData?.revenue.codPendingAmount.toLocaleString() || '0'} Pending COD
                </p>
              </div>

              <div className="bg-white border border-emerald-900/10 rounded-3xl p-6 shadow-natural space-y-2">
                <div className="flex items-center justify-between text-blue-700">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Orders</span>
                  <ShoppingBag className="w-5 h-5 bg-blue-100 p-1 rounded-full" />
                </div>
                <div className="font-cinzel text-2xl font-bold text-[#0f2d21]">
                  {statsData?.orders.total || 0}
                </div>
                <p className="text-[11px] text-emerald-700 font-medium">
                  {statsData?.orders.pending || 0} Need Action / Confirmation
                </p>
              </div>

              <div className="bg-white border border-emerald-900/10 rounded-3xl p-6 shadow-natural space-y-2">
                <div className="flex items-center justify-between text-[#386641]">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Catalog</span>
                  <Package className="w-5 h-5 bg-emerald-100 p-1 rounded-full" />
                </div>
                <div className="font-cinzel text-2xl font-bold text-[#0f2d21]">
                  {statsData?.publishedProducts || 0} / {statsData?.totalProducts || 0}
                </div>
                <p className="text-[11px] text-slate-500 font-light">
                  {statsData?.totalUnits || 0} Plant Units In Stock
                </p>
              </div>

              <div className="bg-white border border-emerald-900/10 rounded-3xl p-6 shadow-natural space-y-2">
                <div className="flex items-center justify-between text-amber-700">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Stock Alerts</span>
                  <AlertTriangle className="w-5 h-5 bg-amber-100 p-1 rounded-full text-amber-700" />
                </div>
                <div className="font-cinzel text-2xl font-bold text-[#0f2d21]">
                  {statsData?.lowStockProducts || 0} Low Stock
                </div>
                <p className="text-[11px] text-rose-700 font-medium">
                  {statsData?.outOfStockProducts || 0} Out of Stock
                </p>
              </div>
            </div>

            {/* Quick Actions & Recent Orders */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white border border-emerald-900/10 rounded-3xl p-6 sm:p-8 shadow-natural space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-cinzel text-lg font-bold text-[#0f2d21]">Recent Customer Orders</h3>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-semibold text-[#386641] hover:underline"
                  >
                    View All Orders →
                  </button>
                </div>

                <div className="space-y-3">
                  {ordersList.slice(0, 5).map((ord: any) => (
                    <div
                      key={ord.id}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-[#0f2d21]">{ord.orderNumber}</span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              ord.status === 'PENDING'
                                ? 'bg-amber-100 text-amber-800'
                                : ord.status === 'CONFIRMED'
                                ? 'bg-blue-100 text-blue-800'
                                : ord.status === 'DELIVERED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {ord.status}
                          </span>
                        </div>
                        <p className="text-slate-500 font-light">
                          {ord.user?.name || 'Customer'} • {ord.items?.length || 0} item(s)
                        </p>
                      </div>
                      <div className="text-right flex items-center gap-4">
                        <span className="font-cinzel font-bold text-sm text-[#0f2d21]">₹{ord.total}</span>
                      </div>
                    </div>
                  ))}
                  {ordersList.length === 0 && (
                    <p className="text-slate-500 text-xs italic py-4">No orders placed yet.</p>
                  )}
                </div>
              </div>

              {/* Operations Panel */}
              <div className="bg-white border border-emerald-900/10 rounded-3xl p-6 sm:p-8 shadow-natural space-y-6">
                <h3 className="font-cinzel text-lg font-bold text-[#0f2d21]">Quick Inventory Actions</h3>
                <div className="space-y-3 text-xs">
                  <button
                    onClick={() => {
                      setActiveTab('products');
                      setShowAddProductModal(true);
                    }}
                    className="w-full p-3.5 rounded-2xl bg-[#386641] text-white font-semibold flex items-center justify-center gap-2 hover:bg-[#2d5234] transition-all shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Plant Specimen</span>
                  </button>

                  <button
                    onClick={() => {
                      refetchStats();
                      refetchOrders();
                      refetchProducts();
                    }}
                    className="w-full p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-[#386641] font-semibold flex items-center justify-center gap-2 hover:bg-emerald-100 transition-all"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Refresh Live Database Metrics</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ORDER MANAGEMENT */}
        {activeTab === 'orders' && (
          <div className="bg-white border border-emerald-900/10 rounded-3xl p-6 sm:p-8 shadow-natural space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="font-cinzel text-xl font-bold text-[#0f2d21]">Customer Order Management</h2>
                <p className="text-slate-500 text-xs font-light">
                  Process orders, update fulfillment statuses, and log COD payments directly to PostgreSQL.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="px-3.5 py-2 bg-slate-50 border border-emerald-900/15 rounded-xl text-xs text-[#0f2d21] focus:outline-none"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="PENDING">PENDING</option>
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="PROCESSING">PROCESSING</option>
                  <option value="SHIPPED">SHIPPED</option>
                  <option value="DELIVERED">DELIVERED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              {ordersList.map((ord: any) => (
                <div
                  key={ord.id}
                  className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4 text-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                    <div>
                      <span className="font-mono font-bold text-sm text-[#0f2d21]">{ord.orderNumber}</span>
                      <span className="text-slate-400 ml-2">
                        {new Date(ord.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                          ord.status === 'PENDING'
                            ? 'bg-amber-100 text-amber-800'
                            : ord.status === 'CONFIRMED'
                            ? 'bg-blue-100 text-blue-800'
                            : ord.status === 'DELIVERED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {ord.status}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                          ord.paymentStatus === 'PAID'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {ord.paymentMethod} ({ord.paymentStatus})
                      </span>
                    </div>
                  </div>

                  {/* Customer Info & Items */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="font-semibold text-slate-700">Customer Details:</p>
                      <p className="text-slate-600">{ord.user?.name || 'Customer'}</p>
                      <p className="text-slate-500 font-mono text-[11px]">{ord.user?.email}</p>
                    </div>

                    <div>
                      <p className="font-semibold text-slate-700">Shipping Address:</p>
                      <p className="text-slate-600 font-light">
                        {ord.shippingAddress?.fullName}, {ord.shippingAddress?.addressLine1},{' '}
                        {ord.shippingAddress?.city}, {ord.shippingAddress?.state} - {ord.shippingAddress?.postalCode}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-semibold text-slate-700">Order Amount:</p>
                      <p className="font-cinzel text-xl font-bold text-[#0f2d21]">₹{ord.total}</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-end gap-2">
                    {ord.status === 'PENDING' && (
                      <button
                        onClick={() => updateStatusMutation.mutate({ orderNumber: ord.orderNumber, status: 'CONFIRMED' })}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[11px]"
                      >
                        Confirm Order
                      </button>
                    )}

                    {ord.status === 'CONFIRMED' && (
                      <button
                        onClick={() => updateStatusMutation.mutate({ orderNumber: ord.orderNumber, status: 'SHIPPED' })}
                        className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold text-[11px]"
                      >
                        Mark Shipped
                      </button>
                    )}

                    {ord.status === 'SHIPPED' && (
                      <button
                        onClick={() => updateStatusMutation.mutate({ orderNumber: ord.orderNumber, status: 'DELIVERED' })}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px]"
                      >
                        Mark Delivered
                      </button>
                    )}

                    {ord.paymentStatus !== 'PAID' && (
                      <button
                        onClick={() => collectCodMutation.mutate(ord.orderNumber)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-100 border border-emerald-300 text-emerald-800 hover:bg-emerald-200 font-semibold text-[11px]"
                      >
                        Collect Cash Payment (₹{ord.total})
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {ordersList.length === 0 && (
                <div className="text-center py-12 space-y-2">
                  <ShoppingBag className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-slate-500 text-xs">No orders match the selected filter criteria.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: PRODUCT MANAGEMENT */}
        {activeTab === 'products' && (
          <div className="bg-white border border-emerald-900/10 rounded-3xl p-6 sm:p-8 shadow-natural space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-cinzel text-xl font-bold text-[#0f2d21]">Plant Catalog Management</h2>
                <p className="text-slate-500 text-xs font-light">
                  Add new botanical species, adjust stock quantities, and publish/unpublish products.
                </p>
              </div>

              <button
                onClick={() => setShowAddProductModal(true)}
                className="px-4 py-2.5 rounded-full bg-[#386641] hover:bg-[#2d5234] text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-natural transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </button>
            </div>

            {/* Products Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-semibold">
                    <th className="py-3 px-4">Product Name</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4">Stock</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {productsList.map((p: any) => (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-semibold text-[#0f2d21] flex items-center gap-3">
                        <img
                          src={p.images?.[0]?.url || 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=800&q=80'}
                          alt={p.name}
                          className="w-8 h-8 rounded-lg object-cover bg-slate-100"
                        />
                        <div>
                          <span>{p.name}</span>
                          <span className="block text-[10px] font-mono text-slate-400">{p.id}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{p.category?.name || 'Category'}</td>
                      <td className="py-3 px-4 font-cinzel font-bold text-[#0f2d21]">₹{p.price}</td>
                      <td className="py-3 px-4 font-mono font-semibold">
                        <span className={p.stockQuantity < 10 ? 'text-rose-600 font-bold' : 'text-slate-700'}>
                          {p.stockQuantity} units
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            p.published ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {p.published ? 'PUBLISHED' : 'DRAFT'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => togglePublishMutation.mutate({ productId: p.id, published: !p.published })}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                          title={p.published ? 'Unpublish' : 'Publish'}
                        >
                          {p.published ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ADD PRODUCT MODAL */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="font-cinzel text-xl font-bold text-[#0f2d21]">Add New Plant Specimen</h3>
              <button
                onClick={() => setShowAddProductModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {formMsg && (
              <div className="p-3 rounded-xl bg-amber-50 text-amber-800 text-xs">{formMsg}</div>
            )}

            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Plant Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Variegated Monstera Albo"
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-emerald-900/15 rounded-xl text-xs focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Regular Price (₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="999"
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-emerald-900/15 rounded-xl text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Sale Price (₹)</label>
                  <input
                    type="number"
                    placeholder="799"
                    value={newProdSalePrice}
                    onChange={(e) => setNewProdSalePrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-emerald-900/15 rounded-xl text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Initial Stock Quantity *</label>
                  <input
                    type="number"
                    required
                    value={newProdStock}
                    onChange={(e) => setNewProdStock(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-emerald-900/15 rounded-xl text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category *</label>
                  <select
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-emerald-900/15 rounded-xl text-xs focus:outline-none"
                  >
                    <option value="cat-indoor">Indoor Plants</option>
                    <option value="cat-outdoor">Outdoor Plants & Palms</option>
                    <option value="cat-flowering">Flowering Plants</option>
                    <option value="cat-fruit">Fruit & Exotic Plants</option>
                    <option value="cat-vegetable">Vegetables & Herbs</option>
                    <option value="cat-pots">Pots, Planters & Soil</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={newProdImage}
                  onChange={(e) => setNewProdImage(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-emerald-900/15 rounded-xl text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Plant description..."
                  value={newProdDesc}
                  onChange={(e) => setNewProdDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-emerald-900/15 rounded-xl text-xs focus:outline-none"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="px-4 py-2 rounded-full border border-slate-200 text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createProductMutation.isPending}
                  className="px-6 py-2 rounded-full bg-[#386641] text-white font-semibold hover:bg-[#2d5234]"
                >
                  {createProductMutation.isPending ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <FinalCTA />
    </div>
  );
};

export default AdminPage;
