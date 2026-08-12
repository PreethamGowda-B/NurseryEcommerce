import React, { useState } from 'react';
import { useUser, useLogout } from '../hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { useCustomerSSE } from '../hooks/useCustomerSSE';
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
  Sparkles,
  Tag,
  Boxes,
  ExternalLink,
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

  // New Product Form State
  const [newProdName, setNewProdName] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdSalePrice, setNewProdSalePrice] = useState('');
  const [newProdStock, setNewProdStock] = useState('25');
  const [newProdCategory, setNewProdCategory] = useState('cat-indoor');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdImage, setNewProdImage] = useState('');
  const [formMsg, setFormMsg] = useState<string | null>(null);

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  // 1. Fetch Dashboard Stats (REAL SUPABASE DB DATA)
  const { data: statsData, isLoading: statsLoading, refetch: refetchStats } = useQuery<DashboardStats>({
    queryKey: ['adminStats'],
    queryFn: async () => {
      const res = await api.get('/admin/dashboard/stats');
      return res.data?.data || res.data;
    },
    enabled: isAdmin,
    refetchInterval: 5000,
  });

  // 2. Fetch Orders (REAL SUPABASE DB DATA)
  const { data: ordersData, isLoading: ordersLoading, refetch: refetchOrders } = useQuery({
    queryKey: ['adminOrders', orderStatusFilter, orderSearch],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (orderStatusFilter !== 'ALL') params.append('status', orderStatusFilter);
      if (orderSearch) params.append('search', orderSearch);
      params.append('limit', '100');
      const res = await api.get(`/admin/orders?${params.toString()}`);
      return res.data?.data || res.data;
    },
    enabled: isAdmin,
    refetchInterval: 5000,
  });

  // 3. Fetch Products (REAL SUPABASE DB DATA)
  const { data: productsData, isLoading: productsLoading, refetch: refetchProducts } = useQuery({
    queryKey: ['adminProducts', productSearch],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (productSearch) params.append('search', productSearch);
      params.append('limit', '100');
      const res = await api.get(`/admin/products?${params.toString()}`);
      return res.data?.data || res.data;
    },
    enabled: isAdmin,
    refetchInterval: 5000,
  });

  // 4. Fetch Users (REAL SUPABASE DB DATA)
  const { data: usersData, isLoading: usersLoading, refetch: refetchUsers } = useQuery({
    queryKey: ['adminUsers', userSearch],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (userSearch) params.append('search', userSearch);
      const res = await api.get(`/admin/users?${params.toString()}`);
      return res.data?.data || res.data;
    },
    enabled: isAdmin,
    refetchInterval: 10000,
  });

  // Real-time SSE listener
  useCustomerSSE(() => {
    refetchOrders();
    refetchStats();
    refetchProducts();
  });

  // Pure DB array normalization (ZERO SAMPLE FALLBACKS)
  const ordersList: any[] = Array.isArray(ordersData?.data)
    ? ordersData.data
    : Array.isArray(ordersData?.orders)
    ? ordersData.orders
    : Array.isArray(ordersData)
    ? ordersData
    : [];

  const productsList: any[] = Array.isArray(productsData?.products)
    ? productsData.products
    : Array.isArray(productsData?.data)
    ? productsData.data
    : Array.isArray(productsData)
    ? productsData
    : [];

  const usersList: any[] = Array.isArray(usersData?.users)
    ? usersData.users
    : Array.isArray(usersData?.data)
    ? usersData.data
    : Array.isArray(usersData)
    ? usersData
    : [];

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
      onSuccess: () => navigate('/admin/login'),
    });
  };

  if (isUserLoading) {
    return (
      <div className="min-h-screen bg-[#faf9f6] text-[#0f2d21] flex items-center justify-center">
        <div className="flex items-center gap-3 text-[#386641] font-semibold text-sm">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Authenticating Super Admin Session...</span>
        </div>
      </div>
    );
  }

  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
    return (
      <div className="min-h-screen bg-[#faf9f6] text-[#0f2d21] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-emerald-900/10 rounded-3xl p-8 text-center space-y-6 shadow-natural-lg">
          <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-xs">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="font-cinzel text-2xl font-bold">Super Admin Portal Restricted</h1>
            <p className="text-slate-500 text-xs font-light leading-relaxed">
              You must be logged in as an authorized Sheeneeka Nursery Super Administrator to access this management console.
            </p>
          </div>
          <Link
            to="/admin/login"
            className="w-full py-3.5 rounded-full bg-[#386641] hover:bg-[#2d5234] text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-natural transition-all"
          >
            <span>Go to Admin Portal Login</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  // Calculated live metrics
  const totalRevenue = ordersList
    .filter((o) => o.paymentStatus === 'PAID')
    .reduce((sum, o) => sum + (o.total || 0), 0);

  const pendingCodAmount = ordersList
    .filter((o) => o.paymentMethod === 'COD' && o.paymentStatus === 'PENDING')
    .reduce((sum, o) => sum + (o.total || 0), 0);

  const pendingOrdersCount = ordersList.filter((o) => o.status === 'PENDING').length;
  const lowStockCount = productsList.filter((p) => p.stockQuantity < 10).length;
  const outOfStockCount = productsList.filter((p) => p.stockQuantity === 0).length;

  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#0f2d21] font-sans flex flex-col">
      {/* DEDICATED SUPER ADMIN TOP NAVBAR */}
      <header className="bg-white border-b border-emerald-900/10 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#386641] text-white flex items-center justify-center font-bold shadow-natural">
              <Leaf className="w-6 h-6" />
            </div>
            <div>
              <Link to="/" className="font-cinzel text-lg font-bold tracking-wide text-[#0f2d21] block leading-none hover:text-[#386641]">
                SHEENEEKA NURSERY
              </Link>
              <span className="text-[10px] font-mono tracking-widest text-[#386641] font-bold uppercase">
                SUPER ADMIN OPERATIONS PORTAL
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200/80 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Supabase PostgreSQL • Realtime 5s Sync</span>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/"
                target="_blank"
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-[#386641] text-xs font-semibold transition-colors"
              >
                <span>View Storefront</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>

              <button
                onClick={handleLogout}
                className="p-2.5 rounded-full bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition-colors cursor-pointer"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* SUPER ADMIN MAIN CONTENT */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* SUPER ADMIN HEADER CARD */}
        <div className="bg-white border border-emerald-900/10 rounded-3xl p-6 sm:p-8 shadow-natural flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-100/80 text-[#386641] text-[10px] font-bold uppercase tracking-widest">
                CONTROL CENTER
              </span>
              <span className="text-xs font-mono text-slate-500">
                Session Active: {user.name} ({user.email})
              </span>
            </div>
            <h1 className="font-cinzel text-2xl sm:text-3xl font-bold text-[#0f2d21]">
              Executive Nursery Management
            </h1>
            <p className="text-slate-500 text-xs font-light">
              Manage incoming customer orders, inventory stock, plant catalog listings, and customer accounts.
            </p>
          </div>

          {/* TAB NAVIGATION BAR */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/80">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-[#386641] text-white shadow-xs'
                  : 'text-slate-600 hover:text-[#0f2d21]'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'orders'
                  ? 'bg-[#386641] text-white shadow-xs'
                  : 'text-slate-600 hover:text-[#0f2d21]'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Orders ({ordersList.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'products'
                  ? 'bg-[#386641] text-white shadow-xs'
                  : 'text-slate-600 hover:text-[#0f2d21]'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Products ({productsList.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'users'
                  ? 'bg-[#386641] text-white shadow-xs'
                  : 'text-slate-600 hover:text-[#0f2d21]'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Customers ({usersList.length})</span>
            </button>
          </div>
        </div>

        {/* TAB 1: EXECUTIVE OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white border border-emerald-900/10 rounded-3xl p-6 shadow-natural space-y-2">
                <div className="flex items-center justify-between text-[#386641]">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Paid Revenue</span>
                  <DollarSign className="w-5 h-5 bg-emerald-100 p-1 rounded-full" />
                </div>
                <div className="font-cinzel text-2xl sm:text-3xl font-bold text-[#0f2d21]">
                  ₹{totalRevenue.toLocaleString()}
                </div>
                <p className="text-xs text-amber-700 font-medium">
                  + ₹{pendingCodAmount.toLocaleString()} Pending COD
                </p>
              </div>

              <div className="bg-white border border-emerald-900/10 rounded-3xl p-6 shadow-natural space-y-2">
                <div className="flex items-center justify-between text-blue-700">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Customer Orders</span>
                  <ShoppingBag className="w-5 h-5 bg-blue-100 p-1 rounded-full" />
                </div>
                <div className="font-cinzel text-2xl sm:text-3xl font-bold text-[#0f2d21]">
                  {ordersList.length}
                </div>
                <p className="text-xs text-emerald-700 font-medium">
                  {pendingOrdersCount} Need Action / Confirmation
                </p>
              </div>

              <div className="bg-white border border-emerald-900/10 rounded-3xl p-6 shadow-natural space-y-2">
                <div className="flex items-center justify-between text-[#386641]">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Catalog</span>
                  <Package className="w-5 h-5 bg-emerald-100 p-1 rounded-full" />
                </div>
                <div className="font-cinzel text-2xl sm:text-3xl font-bold text-[#0f2d21]">
                  {productsList.filter((p) => p.published).length} / {productsList.length}
                </div>
                <p className="text-xs text-slate-500 font-light">
                  {productsList.reduce((acc, p) => acc + (p.stockQuantity || 0), 0)} Total Plant Units In Stock
                </p>
              </div>

              <div className="bg-white border border-emerald-900/10 rounded-3xl p-6 shadow-natural space-y-2">
                <div className="flex items-center justify-between text-amber-700">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Stock Alerts</span>
                  <AlertTriangle className="w-5 h-5 bg-amber-100 p-1 rounded-full text-amber-700" />
                </div>
                <div className="font-cinzel text-2xl sm:text-3xl font-bold text-[#0f2d21]">
                  {lowStockCount} Low Stock
                </div>
                <p className="text-xs text-rose-700 font-medium">
                  {outOfStockCount} Out of Stock
                </p>
              </div>
            </div>

            {/* Quick Actions & Live Incoming Orders */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white border border-emerald-900/10 rounded-3xl p-6 sm:p-8 shadow-natural space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-cinzel text-lg font-bold text-[#0f2d21]">Live Customer Orders</h3>
                    <p className="text-slate-500 text-xs font-light">Real-time sync with Supabase PostgreSQL</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-semibold text-[#386641] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Manage All Orders ({ordersList.length})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-3">
                  {ordersList.slice(0, 6).map((ord: any) => (
                    <div
                      key={ord.id}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-bold text-[#0f2d21]">{ord.orderNumber}</span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              ord.status === 'PENDING'
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : ord.status === 'CONFIRMED'
                                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                : ord.status === 'DELIVERED'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : 'bg-[#386641] text-white'
                            }`}
                          >
                            {ord.status}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              ord.paymentStatus === 'PAID'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {ord.paymentMethod} ({ord.paymentStatus})
                          </span>
                        </div>
                        <p className="text-slate-600 font-medium">
                          Customer: <strong className="text-[#0f2d21]">{ord.user?.name || 'Customer'}</strong> ({ord.user?.email || 'Guest'})
                        </p>
                      </div>
                      <div className="text-right flex items-center justify-between sm:justify-end gap-4">
                        <span className="font-cinzel font-bold text-lg text-[#0f2d21]">₹{ord.total}</span>
                        <button
                          onClick={() => setSelectedOrder(ord)}
                          className="px-3.5 py-1.5 rounded-xl bg-[#386641] hover:bg-[#2d5234] text-white text-xs font-semibold transition-all shadow-xs cursor-pointer"
                        >
                          Inspect
                        </button>
                      </div>
                    </div>
                  ))}

                  {ordersList.length === 0 && (
                    <div className="p-8 text-center text-xs text-slate-500">
                      No customer orders currently found in database.
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions Panel */}
              <div className="bg-white border border-emerald-900/10 rounded-3xl p-6 sm:p-8 shadow-natural space-y-6">
                <h3 className="font-cinzel text-lg font-bold text-[#0f2d21]">Super Admin Operations</h3>
                <div className="space-y-3 text-xs">
                  <button
                    onClick={() => {
                      setActiveTab('products');
                      setShowAddProductModal(true);
                    }}
                    className="w-full p-4 rounded-2xl bg-[#386641] text-white font-semibold flex items-center justify-center gap-2 hover:bg-[#2d5234] transition-all shadow-natural cursor-pointer"
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
                    className="w-full p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-[#386641] font-semibold flex items-center justify-center gap-2 hover:bg-emerald-100 transition-all cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Force Real-Time Sync</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ORDER FULFILLMENT & MANAGEMENT */}
        {activeTab === 'orders' && (
          <div className="bg-white border border-emerald-900/10 rounded-3xl p-6 sm:p-8 shadow-natural space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-emerald-900/10 pb-4">
              <div>
                <h2 className="font-cinzel text-xl font-bold text-[#0f2d21]">Customer Order Processing &amp; Fulfillment</h2>
                <p className="text-slate-500 text-xs font-light">
                  Real-time database sync (Auto-refreshes every 5 seconds).
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search Order #, Name, or Email..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-slate-50 border border-emerald-900/15 rounded-xl text-xs focus:outline-none focus:border-[#386641]"
                  />
                </div>

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
                  className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-4 text-xs shadow-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-sm text-[#0f2d21]">{ord.orderNumber}</span>
                      <span className="text-slate-400 text-xs">
                        {new Date(ord.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                          ord.status === 'PENDING'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : ord.status === 'CONFIRMED'
                            ? 'bg-blue-100 text-blue-800 border border-blue-300'
                            : ord.status === 'SHIPPED'
                            ? 'bg-purple-100 text-purple-800 border border-purple-300'
                            : ord.status === 'DELIVERED'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {ord.status}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                          ord.paymentStatus === 'PAID'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}
                      >
                        {ord.paymentMethod} ({ord.paymentStatus})
                      </span>
                    </div>
                  </div>

                  {/* Customer Info & Address */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="font-semibold text-slate-700 mb-1">Customer Account:</p>
                      <p className="text-[#0f2d21] font-bold text-sm">{ord.user?.name || 'Customer'}</p>
                      <p className="text-slate-500 font-mono text-[11px]">{ord.user?.email}</p>
                      <p className="text-slate-500 font-mono text-[11px]">{ord.user?.phone || 'No phone'}</p>
                    </div>

                    <div>
                      <p className="font-semibold text-slate-700 mb-1">Shipping Address:</p>
                      <p className="text-slate-600 font-light leading-relaxed">
                        {ord.shippingAddress?.fullName || ord.shippingAddress?.name}<br />
                        {ord.shippingAddress?.addressLine1}, {ord.shippingAddress?.addressLine2 ? `${ord.shippingAddress.addressLine2}, ` : ''}
                        {ord.shippingAddress?.city}, {ord.shippingAddress?.state} - {ord.shippingAddress?.postalCode}
                      </p>
                    </div>

                    <div className="text-right flex flex-col justify-between">
                      <div>
                        <p className="font-semibold text-slate-700 mb-1">Total Order Value:</p>
                        <p className="font-cinzel text-2xl font-bold text-[#0f2d21]">₹{ord.total}</p>
                      </div>
                      <button
                        onClick={() => setSelectedOrder(ord)}
                        className="text-xs font-semibold text-[#386641] hover:underline text-right mt-2 cursor-pointer"
                      >
                        Inspect Line Items &amp; Timeline →
                      </button>
                    </div>
                  </div>

                  {/* FULFILLMENT ACTIONS BAR */}
                  <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-700">Fulfillment Status Action:</span>
                      {ord.status === 'PENDING' && (
                        <button
                          onClick={() => updateStatusMutation.mutate({ orderNumber: ord.orderNumber, status: 'CONFIRMED' })}
                          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs transition-all shadow-xs cursor-pointer"
                        >
                          Confirm Order
                        </button>
                      )}

                      {ord.status === 'CONFIRMED' && (
                        <button
                          onClick={() => updateStatusMutation.mutate({ orderNumber: ord.orderNumber, status: 'SHIPPED' })}
                          className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-semibold text-xs transition-all shadow-xs cursor-pointer"
                        >
                          Dispatch / Ship Order
                        </button>
                      )}

                      {ord.status === 'SHIPPED' && (
                        <button
                          onClick={() => updateStatusMutation.mutate({ orderNumber: ord.orderNumber, status: 'DELIVERED' })}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-xs transition-all shadow-xs cursor-pointer"
                        >
                          Mark Delivered
                        </button>
                      )}
                    </div>

                    {ord.paymentStatus !== 'PAID' && (
                      <button
                        onClick={() => collectCodMutation.mutate(ord.orderNumber)}
                        className="px-4 py-2 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-800 font-semibold text-xs hover:bg-emerald-200 transition-all cursor-pointer"
                      >
                        Collect Cash Payment (₹{ord.total})
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {ordersList.length === 0 && (
                <div className="bg-[#faf9f6] border border-slate-200 rounded-3xl p-12 text-center text-xs text-slate-500">
                  No orders currently found matching filter criteria in Supabase PostgreSQL database.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: PLANT CATALOG */}
        {activeTab === 'products' && (
          <div className="bg-white border border-emerald-900/10 rounded-3xl p-6 sm:p-8 shadow-natural space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-900/10 pb-4">
              <div>
                <h2 className="font-cinzel text-xl font-bold text-[#0f2d21]">Botanical Catalog Management</h2>
                <p className="text-slate-500 text-xs font-light">
                  Add new plant specimens using the storefront card design template.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search Product Name..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-slate-50 border border-emerald-900/15 rounded-xl text-xs focus:outline-none focus:border-[#386641]"
                  />
                </div>

                <button
                  onClick={() => setShowAddProductModal(true)}
                  className="px-4 py-2.5 rounded-full bg-[#386641] hover:bg-[#2d5234] text-white font-semibold text-xs flex items-center gap-2 shadow-natural transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Product</span>
                </button>
              </div>
            </div>

            {/* PRODUCT CARD GRID MATCHING STOREFRONT TEMPLATE DESIGN */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {productsList.map((p: any) => (
                <div
                  key={p.id}
                  className="bg-[#faf9f6] border border-emerald-900/10 rounded-3xl overflow-hidden shadow-natural hover:shadow-natural-lg transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    {/* Image & Badge Overlay */}
                    <div className="relative aspect-4/3 overflow-hidden bg-slate-100">
                      <img
                        src={p.images?.[0]?.url || 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=800&q=80'}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            p.published
                              ? 'bg-emerald-800 text-white'
                              : 'bg-slate-700 text-white'
                          }`}
                        >
                          {p.published ? 'PUBLISHED' : 'DRAFT'}
                        </span>
                        {p.stockQuantity < 10 && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-600 text-white">
                            LOW STOCK ({p.stockQuantity})
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-5 space-y-3">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#386641] block">
                        {p.category?.name || 'Indoor Plant'}
                      </span>
                      <h3 className="font-cinzel font-bold text-base text-[#0f2d21] line-clamp-1">
                        {p.name}
                      </h3>
                      <p className="text-slate-500 text-xs line-clamp-2 font-light">
                        {p.description || 'Healthy nursery plant specimen with premium potting.'}
                      </p>

                      <div className="flex items-center justify-between pt-2">
                        <div>
                          <span className="font-cinzel text-lg font-bold text-[#0f2d21]">
                            ₹{p.salePrice ?? p.price}
                          </span>
                          {p.salePrice && (
                            <span className="text-slate-400 line-through text-xs ml-2">
                              ₹{p.price}
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-mono font-semibold text-slate-600">
                          Stock: {p.stockQuantity}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Super Admin Quick Control Actions */}
                  <div className="p-4 bg-white border-t border-emerald-900/10 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateStockMutation.mutate({ productId: p.id, stockQuantity: Math.max(0, p.stockQuantity - 5) })}
                        className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#0f2d21] font-bold text-xs flex items-center justify-center cursor-pointer"
                        title="Decrease Stock (-5)"
                      >
                        -
                      </button>
                      <button
                        onClick={() => updateStockMutation.mutate({ productId: p.id, stockQuantity: p.stockQuantity + 10 })}
                        className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#0f2d21] font-bold text-xs flex items-center justify-center cursor-pointer"
                        title="Increase Stock (+10)"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => togglePublishMutation.mutate({ productId: p.id, published: !p.published })}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-100 text-[#386641] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {p.published ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{p.published ? 'Unpublish' : 'Publish'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: CUSTOMER ACCOUNTS */}
        {activeTab === 'users' && (
          <div className="bg-white border border-emerald-900/10 rounded-3xl p-6 sm:p-8 shadow-natural space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-900/10 pb-4">
              <div>
                <h2 className="font-cinzel text-xl font-bold text-[#0f2d21]">Registered Customer Accounts</h2>
                <p className="text-slate-500 text-xs font-light">
                  View customer profiles, orders placed, and toggle status permissions.
                </p>
              </div>

              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search Name or Email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-slate-50 border border-emerald-900/15 rounded-xl text-xs text-[#0f2d21] focus:outline-none"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-semibold">
                    <th className="py-3 px-4">User Name</th>
                    <th className="py-3 px-4">Email / Contact</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Orders Placed</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {usersList.map((u: any) => (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-[#0f2d21]">{u.name}</td>
                      <td className="py-3.5 px-4">
                        <span className="block font-mono text-[#0f2d21]">{u.email}</span>
                        <span className="block text-[10px] text-slate-400 font-mono">{u.phone || 'No phone'}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            u.role === 'ADMIN'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-[#0f2d21]">
                        {u._count?.orders || 0} order(s)
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            u.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {u.role !== 'ADMIN' && (
                          <button
                            onClick={() => toggleUserStatusMutation.mutate({ userId: u.id, status: u.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' })}
                            className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full space-y-6 shadow-2xl text-xs text-[#0f2d21] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-cinzel text-xl font-bold">Order Details: {selectedOrder.orderNumber}</h3>
                <span className="text-[11px] text-slate-400 font-mono">{new Date(selectedOrder.createdAt).toLocaleString()}</span>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Customer & Address */}
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div>
                <p className="font-semibold text-slate-700 mb-1">Customer Account:</p>
                <p className="font-bold text-[#0f2d21]">{selectedOrder.user?.name || 'Customer'}</p>
                <p className="text-slate-500 font-mono text-[11px]">{selectedOrder.user?.email}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-700 mb-1">Payment &amp; Status:</p>
                <p className="font-bold text-[#0f2d21]">{selectedOrder.paymentMethod} ({selectedOrder.paymentStatus})</p>
                <p className="text-slate-500 text-[11px]">Fulfillment Status: {selectedOrder.status}</p>
              </div>
            </div>

            {/* Items */}
            <div className="space-y-3">
              <p className="font-semibold text-[#0f2d21]">Order Line Items:</p>
              {selectedOrder.items?.map((it: any) => (
                <div key={it.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="font-bold text-[#0f2d21]">{it.productNameSnapshot || 'Plant Item'}</span>
                  <span className="font-mono text-slate-600">{it.quantity} x ₹{it.priceSnapshot} = ₹{it.subtotal}</span>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-sm">
              <span className="font-bold text-[#0f2d21]">Total Order Value:</span>
              <span className="font-cinzel font-bold text-xl text-[#386641]">₹{selectedOrder.total}</span>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-6 py-2.5 rounded-full bg-[#386641] hover:bg-[#2d5234] text-white font-semibold text-xs cursor-pointer"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD PRODUCT MODAL MATCHING STOREFRONT DESIGN */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl text-xs text-[#0f2d21]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="font-cinzel text-xl font-bold text-[#0f2d21]">Add New Plant Specimen</h3>
              <button
                onClick={() => setShowAddProductModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg cursor-pointer"
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
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-emerald-900/15 rounded-xl text-xs focus:outline-none focus:border-[#386641]"
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
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-emerald-900/15 rounded-xl text-xs focus:outline-none focus:border-[#386641]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Sale Price (₹)</label>
                  <input
                    type="number"
                    placeholder="799"
                    value={newProdSalePrice}
                    onChange={(e) => setNewProdSalePrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-emerald-900/15 rounded-xl text-xs focus:outline-none focus:border-[#386641]"
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
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-emerald-900/15 rounded-xl text-xs focus:outline-none focus:border-[#386641]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category *</label>
                  <select
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-emerald-900/15 rounded-xl text-xs focus:outline-none focus:border-[#386641]"
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
                <label className="block font-semibold text-slate-700 mb-1">Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={newProdImage}
                  onChange={(e) => setNewProdImage(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-emerald-900/15 rounded-xl text-xs focus:outline-none focus:border-[#386641]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Plant description..."
                  value={newProdDesc}
                  onChange={(e) => setNewProdDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-emerald-900/15 rounded-xl text-xs focus:outline-none focus:border-[#386641]"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="px-4 py-2 rounded-full border border-slate-200 text-slate-600 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-[#386641] text-white font-semibold hover:bg-[#2d5234] cursor-pointer"
                >
                  Save Product Specimen
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
