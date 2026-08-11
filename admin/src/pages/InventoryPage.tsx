import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchInventoryMetrics,
  fetchInventoryList,
  adjustInventoryStock,
  fetchInventoryTransactions,
  InventoryItem,
  InventoryTransaction,
} from '../services/adminApi';
import {
  Package,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  SlidersHorizontal,
  Search,
  ChevronLeft,
  ChevronRight,
  History,
  X,
  Plus,
  Minus,
  AlertCircle,
} from 'lucide-react';

export const InventoryPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'inventory' | 'history'>('inventory');

  // Filters & Pagination for Inventory List
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal State
  const [adjustingProduct, setAdjustingProduct] = useState<InventoryItem | null>(null);
  const [adjustQuantity, setAdjustQuantity] = useState<number>(1);
  const [adjustReason, setAdjustReason] = useState<string>('');
  const [modalError, setModalError] = useState<string | null>(null);

  // Queries
  const { data: metrics, isLoading: isMetricsLoading } = useQuery({
    queryKey: ['inventoryMetrics'],
    queryFn: fetchInventoryMetrics,
  });

  const { data: inventoryResponse, isLoading: isListLoading } = useQuery({
    queryKey: ['inventoryList', page, search, statusFilter],
    queryFn: () =>
      fetchInventoryList({
        page,
        limit: 15,
        search: search || undefined,
        status: statusFilter,
      }),
  });

  const { data: txResponse, isLoading: isTxLoading } = useQuery({
    queryKey: ['inventoryTransactions', page],
    queryFn: () => fetchInventoryTransactions({ page, limit: 20 }),
    enabled: activeTab === 'history',
  });

  const adjustMutation = useMutation({
    mutationFn: (payload: { productId: string; quantity: number; reason: string }) =>
      adjustInventoryStock(payload.productId, {
        quantity: payload.quantity,
        reason: payload.reason,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventoryMetrics'] });
      queryClient.invalidateQueries({ queryKey: ['inventoryList'] });
      queryClient.invalidateQueries({ queryKey: ['inventoryTransactions'] });
      setAdjustingProduct(null);
      setAdjustQuantity(1);
      setAdjustReason('');
      setModalError(null);
    },
    onError: (err: any) => {
      setModalError(err.response?.data?.message || 'Failed to adjust stock');
    },
  });

  const items: InventoryItem[] = inventoryResponse?.data || [];
  const pagination = inventoryResponse?.pagination || { page: 1, totalPages: 1, total: 0 };
  const transactions: InventoryTransaction[] = txResponse?.data || [];

  const handleAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingProduct) return;
    if (adjustQuantity === 0) {
      setModalError('Adjustment quantity cannot be zero');
      return;
    }
    if (!adjustReason.trim()) {
      setModalError('Adjustment reason is required');
      return;
    }

    setModalError(null);
    adjustMutation.mutate({
      productId: adjustingProduct.id,
      quantity: adjustQuantity,
      reason: adjustReason,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-cinzel">Inventory &amp; Stock Control</h1>
          <p className="text-xs text-slate-500 mt-1">
            Monitor real-time plant stock levels, thresholds, and manual adjustments.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'inventory'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Stock Levels
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'history'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Movement History
          </button>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Total Products</span>
            <Package className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900 font-cinzel">
            {isMetricsLoading ? '...' : metrics?.totalProducts}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">In Stock</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-700 font-cinzel">
            {isMetricsLoading ? '...' : metrics?.inStock}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Low Stock Alert</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-600 font-cinzel">
            {isMetricsLoading ? '...' : metrics?.lowStock}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Out of Stock</span>
            <XCircle className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-bold text-rose-600 font-cinzel">
            {isMetricsLoading ? '...' : metrics?.outOfStock}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Total Plant Units</span>
            <Package className="w-4 h-4 text-[#386641]" />
          </div>
          <p className="text-2xl font-bold text-[#386641] font-cinzel">
            {isMetricsLoading ? '...' : metrics?.totalUnits}
          </p>
        </div>
      </div>

      {activeTab === 'inventory' ? (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search inventory by plant name or SKU..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#386641]/20 focus:border-[#386641]"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#386641]/20"
            >
              <option value="ALL">All Stock Statuses</option>
              <option value="IN_STOCK">IN STOCK</option>
              <option value="LOW_STOCK">LOW STOCK ALERT</option>
              <option value="OUT_OF_STOCK">OUT OF STOCK</option>
            </select>
          </div>

          {/* Inventory Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {isListLoading ? (
              <div className="p-12 text-center text-xs text-slate-500 animate-pulse">
                Loading inventory records...
              </div>
            ) : items.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-400">No inventory products found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3.5 px-4">Plant Product</th>
                      <th className="py-3.5 px-4">SKU</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4">Current Stock</th>
                      <th className="py-3.5 px-4">Threshold</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {items.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-900 font-cinzel">
                          {item.name}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-500">{item.sku}</td>
                        <td className="py-3.5 px-4 text-slate-600">{item.category}</td>
                        <td className="py-3.5 px-4 font-bold text-[#0f2d21]">
                          {item.stockQuantity} units
                        </td>
                        <td className="py-3.5 px-4 text-slate-400 font-mono">
                          {item.lowStockThreshold}
                        </td>
                        <td className="py-3.5 px-4">
                          {item.status === 'OUT_OF_STOCK' ? (
                            <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold uppercase tracking-wider">
                              OUT OF STOCK
                            </span>
                          ) : item.status === 'LOW_STOCK' ? (
                            <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-wider">
                              LOW STOCK ({item.stockQuantity})
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider">
                              IN STOCK
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => {
                              setAdjustingProduct(item);
                              setAdjustQuantity(1);
                              setAdjustReason('');
                              setModalError(null);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-[#386641] hover:text-white text-slate-700 font-semibold text-xs transition-colors inline-flex items-center gap-1.5"
                          >
                            <SlidersHorizontal className="w-3.5 h-3.5" />
                            <span>Adjust Stock</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* History Tab */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {isTxLoading ? (
            <div className="p-12 text-center text-xs text-slate-500 animate-pulse">
              Loading inventory movement transactions...
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">No inventory transactions logged.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4">Product</th>
                    <th className="py-3.5 px-4">Transaction Type</th>
                    <th className="py-3.5 px-4">Quantity</th>
                    <th className="py-3.5 px-4">Reason / Notes</th>
                    <th className="py-3.5 px-4">Reference Order</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 text-slate-500">
                        {new Date(tx.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {tx.product?.name || 'N/A'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            tx.type === 'SALE'
                              ? 'bg-blue-100 text-blue-800'
                              : tx.type === 'RELEASE'
                              ? 'bg-emerald-100 text-emerald-800'
                              : tx.type === 'ADJUSTMENT'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {tx.type}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold font-mono">
                        {tx.quantity > 0 ? `+${tx.quantity}` : tx.quantity}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{tx.reason || 'N/A'}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-500">
                        {tx.order?.orderNumber || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Stock Adjustment Modal */}
      {adjustingProduct && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleAdjustSubmit}
            className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl relative border border-slate-200"
          >
            <button
              type="button"
              onClick={() => setAdjustingProduct(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-lg font-bold text-slate-900 font-cinzel">Adjust Plant Stock</h3>
              <p className="text-xs text-slate-500 mt-1">
                Product: <strong className="text-slate-900 font-semibold">{adjustingProduct.name}</strong> (Current Stock: {adjustingProduct.stockQuantity})
              </p>
            </div>

            {modalError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Adjustment Quantity (+ to add, - to subtract)
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustQuantity((q) => q - 1)}
                    className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    value={adjustQuantity}
                    onChange={(e) => setAdjustQuantity(parseInt(e.target.value) || 0)}
                    className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-center text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#386641]/20"
                  />
                  <button
                    type="button"
                    onClick={() => setAdjustQuantity((q) => q + 1)}
                    className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 text-center">
                  New stock will become: <strong className="text-slate-800">{adjustingProduct.stockQuantity + adjustQuantity}</strong>
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Reason for Adjustment <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g. New greenhouse delivery / Damaged nursery items"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#386641]/20"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setAdjustingProduct(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={adjustMutation.isPending}
                className="px-5 py-2.5 rounded-xl bg-[#386641] hover:bg-[#2d5234] text-white text-xs font-semibold shadow-sm disabled:opacity-50"
              >
                {adjustMutation.isPending ? 'Updating...' : 'Save Stock Adjustment'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
