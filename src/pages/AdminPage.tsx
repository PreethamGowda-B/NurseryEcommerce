import React, { useState } from 'react';
import { useUser, useLogout } from '../hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
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
  LogOut,
  Leaf,
  Database,
  Phone,
  MapPin,
  Calendar,
  X,
  ChevronRight,
  SlidersHorizontal,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

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
  const logoutMutation = useLogout();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'products' | 'users'>('overview');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('ALL');
  const [orderSearch, setOrderSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  // Modal States
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);

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
    staleTime: 10000,
  });

  // 2. Fetch Orders
  const { data: ordersData, isLoading: ordersLoading, refetch: refetchOrders } = useQuery({
    queryKey: ['adminOrders', orderStatusFilter, orderSearch],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (orderStatusFilter !== 'ALL') params.append('status', orderStatusFilter);
      if (orderSearch) params.append('search', orderSearch);
      params.append('limit', '100');
      const res = await api.get(`/admin/orders?${params.toString()}`);
      return res.data.data;
    },
    enabled: isAdmin,
    staleTime: 10000,
  });

  // 3. Fetch Products
  const { data: productsData, isLoading: productsLoading, refetch: refetchProducts } = useQuery({
    queryKey: ['adminProducts', productSearch],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (productSearch) params.append('search', productSearch);
      params.append('limit', '100');
      const res = await api.get(`/admin/products?${params.toString()}`);
      return res.data.data;
    },
    enabled: isAdmin,
  });

  // 4. Fetch Users
  const { data: usersData, isLoading: usersLoading, refetch: refetchUsers } = useQuery({
    queryKey: ['adminUsers', userSearch],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (userSearch) params.append('search', userSearch);
      const res = await api.get(`/admin/users?${params.toString()}`);
      return res.data.data;
    },
    enabled: isAdmin,
  });

  // Order Status Update Mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderNumber, status }: { orderNumber: string; status: string }) => {
      const res = await api.patch(`/admin/orders/${orderNumber}/status`, {
        status,
        note: `Status updated to ${status} by super admin`,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
      if (selectedOrder) {
        refetchSingleOrder(selectedOrder.orderNumber);
      }
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

  // Refetch single order detail
  const refetchSingleOrder = async (orderNumber: string) => {
    try {
      const res = await api.get(`/admin/orders/${orderNumber}`);
      setSelectedOrder(res.data.data);
    } catch {}
  };

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

  // Update Product Stock Mutation
  const updateStockMutation = useMutation({
    mutationFn: async ({ productId, stockQuantity }: { productId: string; stockQuantity: number }) => {
      const res = await api.patch(`/admin/products/${productId}`, { stockQuantity });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
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

  // User Status Toggle Mutation
  const toggleUserStatusMutation = useMutation({
    mutationFn: async ({ userId, status }: { userId: string; status: string }) => {
      const res = await api.patch(`/admin/users/${userId}/status`, { status });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
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

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => navigate('/login'),
    });
  };

  if (isUserLoading) {
    return (
      <div className="min-h-screen bg-[#071610] text-emerald-100 flex items-center justify-center">
        <div className="flex items-center gap-3 text-emerald-400 font-semibold text-sm">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Verifying Super Admin Authorization...</span>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-[#071610] text-[#e2f0db] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#0d261b] border border-emerald-800/40 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-amber-900/40 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="font-cinzel text-2xl font-bold text-white">Super Admin Access Required</h1>
            <p className="text-emerald-200/70 text-xs font-light leading-relaxed">
              You must be logged in as an authorized Sheeneeka Nursery Super Administrator to access this management console.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-[#081a12] border border-emerald-800/30 text-xs text-left space-y-2">
            <p className="font-bold text-emerald-400">Super Admin Seed Credentials:</p>
            <p className="font-mono text-emerald-200/90 select-all">Email: admin@sheeneekanursery.in</p>
            <p className="font-mono text-emerald-200/90 select-all">Password: Admin@Sheeneeka2026!</p>
          </div>
          <Link
            to="/login?redirect=/admin"
            className="w-full py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-natural transition-all"
          >
            <span>Log In to Super Admin Console</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  const ordersList = ordersData?.orders || [];
  const productsList = productsData?.data || [];
  const usersList = usersData?.users || [];

  return (
    <div className="min-h-screen bg-[#071610] text-[#e2f0db] flex flex-col lg:flex-row font-sans">
      {/* SUPER ADMIN SIDEBAR */}
      <aside className="w-full lg:w-72 bg-[#0b2117] border-r border-emerald-900/30 flex flex-col justify-between flex-shrink-0">
        <div className="p-6 space-y-8">
          {/* Logo & Portal Badge */}
          <div className="space-y-2">
            <Link to="/" className="flex items-center gap-2 text-white">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                <Leaf className="w-5 h-5" />
              </div>
              <div>
                <span className="font-cinzel text-lg font-bold tracking-wide block leading-none">
                  SHEENEEKA
                </span>
                <span className="text-[10px] font-mono tracking-widest text-emerald-400 uppercase">
                  SUPER ADMIN PORTAL
                </span>
              </div>
            </Link>
          </div>

          {/* Nav Items */}
          <nav className="space-y-1 text-xs font-medium">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full px-4 py-3 rounded-2xl flex items-center justify-between transition-all ${
                activeTab === 'overview'
                  ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 font-semibold'
                  : 'text-emerald-200/70 hover:bg-emerald-950/50 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <LayoutDashboard className="w-4 h-4" />
                <span>Executive Overview</span>
              </div>
              <ChevronRight className="w-4 h-4 text-emerald-500/40" />
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full px-4 py-3 rounded-2xl flex items-center justify-between transition-all ${
                activeTab === 'orders'
                  ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 font-semibold'
                  : 'text-emerald-200/70 hover:bg-emerald-950/50 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-4 h-4" />
                <span>Order Management</span>
              </div>
              {statsData?.orders.pending ? (
                <span className="px-2 py-0.5 rounded-full bg-amber-500/30 text-amber-300 font-bold text-[10px]">
                  {statsData.orders.pending}
                </span>
              ) : null}
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`w-full px-4 py-3 rounded-2xl flex items-center justify-between transition-all ${
                activeTab === 'products'
                  ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 font-semibold'
                  : 'text-emerald-200/70 hover:bg-emerald-950/50 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Package className="w-4 h-4" />
                <span>Plant Catalog & Stock</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-mono">
                {statsData?.totalProducts || 0}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`w-full px-4 py-3 rounded-2xl flex items-center justify-between transition-all ${
                activeTab === 'users'
                  ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 font-semibold'
                  : 'text-emerald-200/70 hover:bg-emerald-950/50 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4" />
                <span>Customer Accounts</span>
              </div>
            </button>
          </nav>
        </div>

        {/* Admin Footer & Logout */}
        <div className="p-6 border-t border-emerald-900/30 space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#081a12] border border-emerald-800/30">
            <div className="w-8 h-8 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-xs">
              SA
            </div>
            <div className="overflow-hidden text-xs">
              <span className="font-semibold text-white block truncate">{user.name}</span>
              <span className="text-[10px] text-emerald-400 block truncate">{user.email}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="flex-1 py-2 px-3 rounded-xl bg-emerald-950 hover:bg-emerald-900 border border-emerald-800/40 text-emerald-300 text-xs font-semibold text-center transition-colors"
            >
              View Storefront
            </Link>
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/40 transition-colors"
              title="Log Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* SUPER ADMIN MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-8 bg-[#071610]">
        {/* Top Operational Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-emerald-900/30">
          <div>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono">
              <Database className="w-3.5 h-3.5" />
              <span>Supabase PostgreSQL (Tokyo ap-northeast-1) • Live Connected</span>
            </div>
            <h1 className="font-cinzel text-2xl sm:text-3xl font-bold text-white mt-1">
              {activeTab === 'overview' && 'Executive Management Overview'}
              {activeTab === 'orders' && 'Customer Order Processing & Fulfillment'}
              {activeTab === 'products' && 'Botanical Catalog & Inventory Control'}
              {activeTab === 'users' && 'Customer Accounts & Access Management'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                refetchStats();
                refetchOrders();
                refetchProducts();
                refetchUsers();
              }}
              className="px-4 py-2 rounded-xl bg-emerald-900/50 hover:bg-emerald-800/60 border border-emerald-700/40 text-emerald-200 text-xs font-semibold flex items-center gap-2 transition-all shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />
              <span>Refresh Metrics</span>
            </button>
          </div>
        </div>

        {/* TAB 1: EXECUTIVE OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-[#0b2117] border border-emerald-800/30 rounded-3xl p-6 space-y-3 shadow-xl">
                <div className="flex items-center justify-between text-emerald-400">
                  <span className="text-xs font-semibold uppercase tracking-wider text-emerald-200/60">Total Paid Revenue</span>
                  <DollarSign className="w-6 h-6 bg-emerald-900/60 p-1 rounded-xl" />
                </div>
                <div className="font-cinzel text-3xl font-bold text-white">
                  ₹{statsData?.revenue.paidRevenue.toLocaleString() || '0'}
                </div>
                <p className="text-xs text-amber-400/90 font-mono">
                  + ₹{statsData?.revenue.codPendingAmount.toLocaleString() || '0'} Pending COD
                </p>
              </div>

              <div className="bg-[#0b2117] border border-emerald-800/30 rounded-3xl p-6 space-y-3 shadow-xl">
                <div className="flex items-center justify-between text-blue-400">
                  <span className="text-xs font-semibold uppercase tracking-wider text-emerald-200/60">Total Customer Orders</span>
                  <ShoppingBag className="w-6 h-6 bg-blue-900/60 p-1 rounded-xl" />
                </div>
                <div className="font-cinzel text-3xl font-bold text-white">
                  {statsData?.orders.total || 0}
                </div>
                <p className="text-xs text-emerald-400 font-mono">
                  {statsData?.orders.pending || 0} Action Pending
                </p>
              </div>

              <div className="bg-[#0b2117] border border-emerald-800/30 rounded-3xl p-6 space-y-3 shadow-xl">
                <div className="flex items-center justify-between text-emerald-400">
                  <span className="text-xs font-semibold uppercase tracking-wider text-emerald-200/60">Active Catalog</span>
                  <Package className="w-6 h-6 bg-emerald-900/60 p-1 rounded-xl" />
                </div>
                <div className="font-cinzel text-3xl font-bold text-white">
                  {statsData?.publishedProducts || 0} / {statsData?.totalProducts || 0}
                </div>
                <p className="text-xs text-emerald-200/60 font-mono">
                  {statsData?.totalUnits || 0} Total Units In Stock
                </p>
              </div>

              <div className="bg-[#0b2117] border border-emerald-800/30 rounded-3xl p-6 space-y-3 shadow-xl">
                <div className="flex items-center justify-between text-amber-400">
                  <span className="text-xs font-semibold uppercase tracking-wider text-emerald-200/60">Low Stock Alerts</span>
                  <AlertTriangle className="w-6 h-6 bg-amber-900/60 p-1 rounded-xl text-amber-400" />
                </div>
                <div className="font-cinzel text-3xl font-bold text-white">
                  {statsData?.lowStockProducts || 0} Low Stock
                </div>
                <p className="text-xs text-rose-400 font-mono">
                  {statsData?.outOfStockProducts || 0} Out of Stock
                </p>
              </div>
            </div>

            {/* Recent Orders & Action Table */}
            <div className="bg-[#0b2117] border border-emerald-800/30 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-cinzel text-xl font-bold text-white">Recent Customer Orders</h3>
                  <p className="text-xs text-emerald-200/60 font-light">All customer purchases synchronized with Supabase PostgreSQL</p>
                </div>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs font-semibold text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <span>Manage All Orders</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-3">
                {ordersList.slice(0, 6).map((ord: any) => (
                  <div
                    key={ord.id}
                    className="p-4 rounded-2xl bg-[#071710] border border-emerald-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white">{ord.orderNumber}</span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            ord.status === 'PENDING'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : ord.status === 'CONFIRMED'
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              : ord.status === 'DELIVERED'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {ord.status}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            ord.paymentStatus === 'PAID'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {ord.paymentMethod} ({ord.paymentStatus})
                        </span>
                      </div>
                      <p className="text-emerald-200/70 font-light">
                        {ord.user?.name || 'Customer'} ({ord.user?.email}) • {ord.items?.length || 0} item(s)
                      </p>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4">
                      <span className="font-cinzel font-bold text-base text-white">₹{ord.total}</span>
                      <button
                        onClick={() => setSelectedOrder(ord)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 text-[11px] font-semibold border border-emerald-700/40"
                      >
                        Inspect Order
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ALL CUSTOMER ORDERS */}
        {activeTab === 'orders' && (
          <div className="bg-[#0b2117] border border-emerald-800/30 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-emerald-900/40">
              <div>
                <h2 className="font-cinzel text-xl font-bold text-white">Fulfillment & Status Control</h2>
                <p className="text-xs text-emerald-200/60 font-light">
                  Process incoming orders, transition statuses, and collect Cash on Delivery payments.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search Order Number or Email..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="pl-9 pr-3 py-2 bg-[#071610] border border-emerald-800/40 rounded-xl text-xs text-white placeholder-emerald-700 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-[#071610] border border-emerald-800/40 rounded-xl text-xs text-white focus:outline-none"
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
                  className="p-5 rounded-2xl bg-[#071710] border border-emerald-900/40 space-y-4 text-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-900/40 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-sm text-white">{ord.orderNumber}</span>
                      <span className="text-emerald-400/60 text-[11px]">
                        {new Date(ord.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                          ord.status === 'PENDING'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : ord.status === 'CONFIRMED'
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            : ord.status === 'SHIPPED'
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            : ord.status === 'DELIVERED'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {ord.status}
                      </span>

                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                          ord.paymentStatus === 'PAID'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {ord.paymentMethod} ({ord.paymentStatus})
                      </span>
                    </div>
                  </div>

                  {/* Customer Info & Address */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="font-semibold text-emerald-300 mb-1">Customer Info:</p>
                      <p className="text-white font-medium">{ord.user?.name || 'Customer'}</p>
                      <p className="text-emerald-200/60 font-mono text-[11px]">{ord.user?.email}</p>
                      <p className="text-emerald-200/60 font-mono text-[11px]">{ord.user?.phone || 'No phone'}</p>
                    </div>

                    <div>
                      <p className="font-semibold text-emerald-300 mb-1">Shipping Address:</p>
                      <p className="text-emerald-100 font-light">
                        {ord.shippingAddress?.fullName || ord.shippingAddress?.name}<br />
                        {ord.shippingAddress?.addressLine1}, {ord.shippingAddress?.addressLine2 ? `${ord.shippingAddress.addressLine2}, ` : ''}
                        {ord.shippingAddress?.city}, {ord.shippingAddress?.state} - {ord.shippingAddress?.postalCode}
                      </p>
                    </div>

                    <div className="text-right flex flex-col justify-between">
                      <div>
                        <p className="font-semibold text-emerald-300 mb-1">Total Amount:</p>
                        <p className="font-cinzel text-2xl font-bold text-white">₹{ord.total}</p>
                      </div>
                      <button
                        onClick={() => setSelectedOrder(ord)}
                        className="text-xs text-emerald-400 hover:underline text-right mt-2"
                      >
                        Inspect Items &amp; Timeline →
                      </button>
                    </div>
                  </div>

                  {/* FULFILLMENT ACTIONS BAR */}
                  <div className="pt-3 border-t border-emerald-900/40 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-emerald-400 font-semibold">Fulfillment Action:</span>
                      {ord.status === 'PENDING' && (
                        <button
                          onClick={() => updateStatusMutation.mutate({ orderNumber: ord.orderNumber, status: 'CONFIRMED' })}
                          className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-[11px] transition-colors"
                        >
                          Confirm Order
                        </button>
                      )}

                      {ord.status === 'CONFIRMED' && (
                        <button
                          onClick={() => updateStatusMutation.mutate({ orderNumber: ord.orderNumber, status: 'SHIPPED' })}
                          className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-[11px] transition-colors"
                        >
                          Dispatch / Ship Order
                        </button>
                      )}

                      {ord.status === 'SHIPPED' && (
                        <button
                          onClick={() => updateStatusMutation.mutate({ orderNumber: ord.orderNumber, status: 'DELIVERED' })}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] transition-colors"
                        >
                          Mark Delivered
                        </button>
                      )}
                    </div>

                    {ord.paymentStatus !== 'PAID' && (
                      <button
                        onClick={() => collectCodMutation.mutate(ord.orderNumber)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-900/80 hover:bg-emerald-800 border border-emerald-600/50 text-emerald-200 font-semibold text-[11px] transition-colors"
                      >
                        Collect Cash Payment (₹{ord.total})
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {ordersList.length === 0 && (
                <div className="text-center py-16 space-y-3">
                  <ShoppingBag className="w-10 h-10 text-emerald-900/80 mx-auto" />
                  <p className="text-emerald-200/60 text-xs">No orders match the filter query.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: PLANT CATALOG & STOCK */}
        {activeTab === 'products' && (
          <div className="bg-[#0b2117] border border-emerald-800/30 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-emerald-900/40">
              <div>
                <h2 className="font-cinzel text-xl font-bold text-white">Botanical Catalog &amp; Inventory</h2>
                <p className="text-xs text-emerald-200/60 font-light">
                  Add new plant specimens, adjust stock quantities, and publish/unpublish items.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search Product Name..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="pl-9 pr-3 py-2 bg-[#071610] border border-emerald-800/40 rounded-xl text-xs text-white placeholder-emerald-700 focus:outline-none"
                  />
                </div>

                <button
                  onClick={() => setShowAddProductModal(true)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-2 transition-all shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Product</span>
                </button>
              </div>
            </div>

            {/* Products Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-emerald-900/40 text-emerald-400/80 uppercase tracking-wider font-semibold">
                    <th className="py-3 px-4">Plant Specimen</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4">Stock Level</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-950">
                  {productsList.map((p: any) => (
                    <tr key={p.id} className="hover:bg-[#071710] transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-white flex items-center gap-3">
                        <img
                          src={p.images?.[0]?.url || 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=800&q=80'}
                          alt={p.name}
                          className="w-10 h-10 rounded-xl object-cover bg-emerald-950 border border-emerald-800/40"
                        />
                        <div>
                          <span className="block font-bold text-white">{p.name}</span>
                          <span className="block text-[10px] font-mono text-emerald-400/70">{p.id}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-emerald-200/80">{p.category?.name || 'Category'}</td>
                      <td className="py-3.5 px-4 font-cinzel font-bold text-white">
                        ₹{p.salePrice ?? p.price}
                        {p.salePrice && <span className="text-emerald-400/60 line-through text-[10px] ml-1.5">₹{p.price}</span>}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateStockMutation.mutate({ productId: p.id, stockQuantity: Math.max(0, p.stockQuantity - 5) })}
                            className="w-6 h-6 rounded-lg bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 font-bold text-xs"
                            title="Decrease Stock (-5)"
                          >
                            -
                          </button>
                          <span className={`font-mono font-bold ${p.stockQuantity < 10 ? 'text-amber-400' : 'text-emerald-200'}`}>
                            {p.stockQuantity}
                          </span>
                          <button
                            onClick={() => updateStockMutation.mutate({ productId: p.id, stockQuantity: p.stockQuantity + 10 })}
                            className="w-6 h-6 rounded-lg bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 font-bold text-xs"
                            title="Increase Stock (+10)"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            p.published ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {p.published ? 'PUBLISHED' : 'DRAFT'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => togglePublishMutation.mutate({ productId: p.id, published: !p.published })}
                          className="p-2 rounded-xl bg-emerald-950 hover:bg-emerald-900 border border-emerald-800/40 text-emerald-300 transition-colors"
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

        {/* TAB 4: REGISTERED CUSTOMERS */}
        {activeTab === 'users' && (
          <div className="bg-[#0b2117] border border-emerald-800/30 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-emerald-900/40">
              <div>
                <h2 className="font-cinzel text-xl font-bold text-white">Registered Customer Accounts</h2>
                <p className="text-xs text-emerald-200/60 font-light">
                  View customer profiles, order history counts, and status permissions.
                </p>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search Name or Email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="pl-9 pr-3 py-2 bg-[#071610] border border-emerald-800/40 rounded-xl text-xs text-white placeholder-emerald-700 focus:outline-none"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-emerald-900/40 text-emerald-400/80 uppercase tracking-wider font-semibold">
                    <th className="py-3 px-4">User Name</th>
                    <th className="py-3 px-4">Email / Contact</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Orders Placed</th>
                    <th className="py-3 px-4">Account Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-950">
                  {usersList.map((u: any) => (
                    <tr key={u.id} className="hover:bg-[#071710] transition-colors">
                      <td className="py-3.5 px-4 font-bold text-white">{u.name}</td>
                      <td className="py-3.5 px-4">
                        <span className="block text-emerald-200/90 font-mono">{u.email}</span>
                        <span className="block text-[10px] text-emerald-400/60 font-mono">{u.phone || 'No phone'}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            u.role === 'ADMIN' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-emerald-200 font-bold">
                        {u._count?.orders || 0} order(s)
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            u.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {u.role !== 'ADMIN' && (
                          <button
                            onClick={() => toggleUserStatusMutation.mutate({ userId: u.id, status: u.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' })}
                            className="px-3 py-1 rounded-lg bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 text-[11px] font-semibold"
                          >
                            {u.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* INSPECT ORDER MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#0b2117] border border-emerald-800/40 rounded-3xl p-6 sm:p-8 max-w-xl w-full space-y-6 shadow-2xl text-xs text-emerald-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-emerald-900/40 pb-4">
              <div>
                <h3 className="font-cinzel text-xl font-bold text-white">Order Details: {selectedOrder.orderNumber}</h3>
                <span className="text-[11px] text-emerald-400 font-mono">{new Date(selectedOrder.createdAt).toLocaleString()}</span>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-emerald-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Customer & Address */}
            <div className="grid grid-cols-2 gap-4 bg-[#071610] p-4 rounded-2xl border border-emerald-900/30">
              <div>
                <p className="font-semibold text-emerald-300 mb-1">Customer:</p>
                <p className="text-white font-medium">{selectedOrder.user?.name || 'Customer'}</p>
                <p className="text-emerald-400/80 font-mono text-[11px]">{selectedOrder.user?.email}</p>
              </div>
              <div>
                <p className="font-semibold text-emerald-300 mb-1">Payment &amp; Status:</p>
                <p className="text-white font-medium">{selectedOrder.paymentMethod} ({selectedOrder.paymentStatus})</p>
                <p className="text-emerald-400/80 text-[11px]">Status: {selectedOrder.status}</p>
              </div>
            </div>

            {/* Items */}
            <div className="space-y-3">
              <p className="font-semibold text-white">Order Line Items:</p>
              {selectedOrder.items?.map((it: any) => (
                <div key={it.id} className="flex items-center justify-between p-3 rounded-xl bg-[#071610] border border-emerald-900/30">
                  <span className="font-bold text-white">{it.productNameSnapshot || 'Plant Item'}</span>
                  <span className="font-mono text-emerald-300">{it.quantity} x ₹{it.priceSnapshot} = ₹{it.subtotal}</span>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-950 border border-emerald-800/40 text-sm">
              <span className="font-bold text-white">Total Order Value:</span>
              <span className="font-cinzel font-bold text-xl text-white">₹{selectedOrder.total}</span>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-6 py-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD PRODUCT MODAL */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#0b2117] border border-emerald-800/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl text-xs text-emerald-100">
            <div className="flex items-center justify-between border-b border-emerald-900/40 pb-4">
              <h3 className="font-cinzel text-xl font-bold text-white">Add New Plant Specimen</h3>
              <button
                onClick={() => setShowAddProductModal(false)}
                className="text-emerald-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {formMsg && (
              <div className="p-3 rounded-xl bg-amber-900/40 border border-amber-500/40 text-amber-300 text-xs">{formMsg}</div>
            )}

            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-emerald-300 mb-1">Plant Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Variegated Monstera Albo"
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#071610] border border-emerald-800/40 rounded-xl text-xs text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-emerald-300 mb-1">Regular Price (₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="999"
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#071610] border border-emerald-800/40 rounded-xl text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-emerald-300 mb-1">Sale Price (₹)</label>
                  <input
                    type="number"
                    placeholder="799"
                    value={newProdSalePrice}
                    onChange={(e) => setNewProdSalePrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#071610] border border-emerald-800/40 rounded-xl text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-emerald-300 mb-1">Initial Stock Quantity *</label>
                  <input
                    type="number"
                    required
                    value={newProdStock}
                    onChange={(e) => setNewProdStock(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#071610] border border-emerald-800/40 rounded-xl text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-emerald-300 mb-1">Category *</label>
                  <select
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#071610] border border-emerald-800/40 rounded-xl text-xs text-white focus:outline-none"
                  >
                    <option value="cat-indoor">Indoor Plants</option>
                    <option value="cat-outdoor">Outdoor Plants &amp; Palms</option>
                    <option value="cat-flowering">Flowering Plants</option>
                    <option value="cat-fruit">Fruit &amp; Exotic Plants</option>
                    <option value="cat-vegetable">Vegetables &amp; Herbs</option>
                    <option value="cat-pots">Pots, Planters &amp; Soil</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-emerald-300 mb-1">Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={newProdImage}
                  onChange={(e) => setNewProdImage(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#071610] border border-emerald-800/40 rounded-xl text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-emerald-300 mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Plant description..."
                  value={newProdDesc}
                  onChange={(e) => setNewProdDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#071610] border border-emerald-800/40 rounded-xl text-xs text-white focus:outline-none"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-emerald-900/40">
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="px-4 py-2 rounded-full border border-emerald-800 text-emerald-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createProductMutation.isPending}
                  className="px-6 py-2 rounded-full bg-emerald-600 text-white font-semibold hover:bg-emerald-500"
                >
                  {createProductMutation.isPending ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
