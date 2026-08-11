import React from 'react';
import { Link } from 'react-router-dom';
import { Package, Eye, AlertTriangle, FolderTree, Plus, ArrowUpRight, ShoppingBag, Banknote, CreditCard, Clock } from 'lucide-react';
import { useAdminDashboardStats } from '../hooks/useAdminDashboard';

export const DashboardPage: React.FC = () => {
  const { data: stats, isLoading } = useAdminDashboardStats();

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-1/4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-slate-200 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-cinzel">Dashboard Overview</h1>
          <p className="text-xs text-slate-500 mt-1">Live metrics from your Sheeneeka Nursery store database.</p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/inventory"
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-2 shadow-xs transition-all"
          >
            <Package className="w-4 h-4 text-[#386641]" />
            <span>Manage Inventory</span>
          </Link>

          <Link
            to="/products/new"
            className="px-4 py-2.5 rounded-xl bg-[#386641] hover:bg-[#2d5234] text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Paid Revenue */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Paid Revenue</span>
            <span className="block text-3xl font-bold text-[#386641] font-cinzel">
              ₹{stats?.revenue?.paidRevenue ?? 0}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#386641] flex items-center justify-center">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>

        {/* COD Pending Amount */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">COD Pending</span>
            <span className="block text-3xl font-bold text-amber-600 font-cinzel">
              ₹{stats?.revenue?.codPendingAmount ?? 0}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Banknote className="w-6 h-6" />
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Orders</span>
            <span className="block text-3xl font-bold text-slate-900 font-cinzel">
              {stats?.orders?.total ?? 0}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        {/* Low Stock Plants */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Low Stock Alerts</span>
            <span className="block text-3xl font-bold text-rose-600 font-cinzel">
              {stats?.lowStockProducts ?? 0}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Order Status Counters Grid */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#386641]" />
            <h3 className="text-sm font-bold text-slate-900 font-cinzel">Order Status Breakdown</h3>
          </div>
          <Link to="/orders" className="text-xs font-semibold text-[#386641] hover:underline">
            View All Orders &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-center">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending</span>
            <p className="text-xl font-bold text-slate-800">{stats?.orders?.pending ?? 0}</p>
          </div>
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 space-y-1">
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Confirmed</span>
            <p className="text-xl font-bold text-emerald-800">{stats?.orders?.confirmed ?? 0}</p>
          </div>
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 space-y-1">
            <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">Processing</span>
            <p className="text-xl font-bold text-blue-800">{stats?.orders?.processing ?? 0}</p>
          </div>
          <div className="p-4 rounded-xl bg-purple-50 border border-purple-100 space-y-1">
            <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider">Shipped</span>
            <p className="text-xl font-bold text-purple-800">{stats?.orders?.shipped ?? 0}</p>
          </div>
          <div className="p-4 rounded-xl bg-emerald-100 border border-emerald-200 space-y-1">
            <span className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider">Delivered</span>
            <p className="text-xl font-bold text-emerald-950">{stats?.orders?.delivered ?? 0}</p>
          </div>
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 space-y-1">
            <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">Cancelled</span>
            <p className="text-xl font-bold text-rose-800">{stats?.orders?.cancelled ?? 0}</p>
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/orders"
          className="group bg-white border border-slate-200 hover:border-emerald-500/50 rounded-2xl p-6 shadow-xs transition-all flex items-center justify-between"
        >
          <div>
            <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
              Manage Orders &amp; Fulfillment
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">Filter orders, update delivery status, and collect COD payments.</p>
          </div>
          <ArrowUpRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 transition-colors" />
        </Link>

        <Link
          to="/inventory"
          className="group bg-white border border-slate-200 hover:border-emerald-500/50 rounded-2xl p-6 shadow-xs transition-all flex items-center justify-between"
        >
          <div>
            <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
              Plant Inventory Control
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">Adjust stock, set low-stock thresholds, and view audit history.</p>
          </div>
          <ArrowUpRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 transition-colors" />
        </Link>

        <Link
          to="/products"
          className="group bg-white border border-slate-200 hover:border-emerald-500/50 rounded-2xl p-6 shadow-xs transition-all flex items-center justify-between"
        >
          <div>
            <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
              Catalogue Management
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">Manage prices, botanical specs, plant categories, and images.</p>
          </div>
          <ArrowUpRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 transition-colors" />
        </Link>
      </div>
    </div>
  );
};
