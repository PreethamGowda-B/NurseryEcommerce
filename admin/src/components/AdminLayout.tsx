import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingBag,
  SlidersHorizontal,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  CheckCircle2,
  Leaf,
  ShieldAlert,
} from 'lucide-react';
import { useAdminUser, useAdminLogout } from '../hooks/useAdminAuth';
import { useAdminSSE } from '../hooks/useAdminSSE';

export const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [newOrderToast, setNewOrderToast] = useState<any | null>(null);
  const { data: user, isLoading } = useAdminUser();
  const logoutMutation = useAdminLogout();
  const location = useLocation();
  const navigate = useNavigate();

  // Listen for real-time SSE order creation events
  useAdminSSE((orderData) => {
    setNewOrderToast(orderData);
    setTimeout(() => {
      setNewOrderToast(null);
    }, 8000);
  });

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="flex items-center gap-3 text-sm">
          <Leaf className="w-5 h-5 text-emerald-400 animate-spin" />
          <span>Authenticating Admin Access...</span>
        </div>
      </div>
    );
  }

  // Route protection fallback
  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white p-4">
        <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-2xl p-8 text-center space-y-4">
          <ShieldAlert className="w-12 h-12 text-rose-400 mx-auto" />
          <h2 className="text-xl font-bold">Access Denied</h2>
          <p className="text-slate-400 text-xs leading-relaxed">
            You do not have administrative privileges to access this area.
          </p>
          <Link
            to="/login"
            className="inline-block px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
          >
            Go to Admin Login
          </Link>
        </div>
      </div>
    );
  }

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Orders', path: '/orders', icon: ShoppingBag },
    { label: 'Inventory', path: '/inventory', icon: SlidersHorizontal },
    { label: 'Products', path: '/products', icon: Package },
    { label: 'Categories', path: '/categories', icon: FolderTree },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800">
          <Link to="/dashboard" className="flex items-center gap-2.5 text-white font-bold text-sm tracking-wide">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <Leaf className="w-4 h-4" />
            </div>
            <div>
              <span className="block leading-tight text-emerald-400">SHEENEKA</span>
              <span className="block text-[10px] text-slate-400 font-normal tracking-widest uppercase">Admin Portal</span>
            </div>
          </Link>

          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav list */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-emerald-600/15 text-emerald-400 font-semibold border border-emerald-500/20'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User profile footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-emerald-700 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="truncate">
                <span className="block text-xs font-semibold text-white truncate">{user.name}</span>
                <span className="block text-[10px] text-emerald-400 font-mono font-bold uppercase">{user.role}</span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-sm font-semibold text-slate-700 capitalize">
              {location.pathname.replace('/', '') || 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="hidden sm:inline-block font-mono bg-slate-100 px-2.5 py-1 rounded-md">
              admin.sheeneekanursery.in
            </span>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Backend Operational" />
          </div>
        </header>

        {/* Real-time SSE Incoming Order Toast Banner */}
        {newOrderToast && (
          <div className="bg-emerald-600 text-white px-6 py-3 shadow-lg flex items-center justify-between animate-bounce">
            <div className="flex items-center gap-3 text-xs">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold">
                🔔
              </div>
              <div>
                <span className="font-bold text-sm block">NEW CUSTOMER ORDER RECEIVED (REAL-TIME SSE)</span>
                <span className="font-mono text-emerald-100">
                  Order #{newOrderToast.orderNumber} • Customer: {newOrderToast.customerName} • Total: ₹{newOrderToast.total} ({newOrderToast.paymentMethod})
                </span>
              </div>
            </div>
            <Link
              to="/orders"
              onClick={() => setNewOrderToast(null)}
              className="px-4 py-1.5 rounded-lg bg-white text-emerald-900 font-bold text-xs hover:bg-emerald-50 transition-colors"
            >
              View Order Details
            </Link>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
