import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchAdminOrderDetail,
  updateAdminOrderStatus,
  collectAdminCodPayment,
  updateAdminOrderNotes,
  AdminOrderDetail,
} from '../services/adminApi';
import {
  ArrowLeft,
  User,
  MapPin,
  Package,
  CreditCard,
  Clock,
  CheckCircle2,
  AlertCircle,
  Banknote,
  FileText,
  ShieldAlert,
} from 'lucide-react';

const VALID_TRANSITIONS_MAP: Record<string, string[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['OUT_FOR_DELIVERY'],
  OUT_FOR_DELIVERY: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
};

export const OrderDetailPage: React.FC = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const queryClient = useQueryClient();

  const [selectedNextStatus, setSelectedNextStatus] = useState<string>('');
  const [statusNote, setStatusNote] = useState<string>('');
  const [internalNotesText, setInternalNotesText] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { data: order, isLoading, isError } = useQuery<AdminOrderDetail>({
    queryKey: ['adminOrderDetail', orderNumber],
    queryFn: () => fetchAdminOrderDetail(orderNumber!),
    enabled: !!orderNumber,
  });

  const updateStatusMutation = useMutation({
    mutationFn: (payload: { status: string; note?: string }) =>
      updateAdminOrderStatus(orderNumber!, payload),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['adminOrderDetail', orderNumber] });
      queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
      setSelectedNextStatus('');
      setStatusNote('');
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || 'Failed to update order status');
    },
  });

  const collectCodMutation = useMutation({
    mutationFn: () => collectAdminCodPayment(orderNumber!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminOrderDetail', orderNumber] });
      queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || 'Failed to collect COD payment');
    },
  });

  const updateNotesMutation = useMutation({
    mutationFn: (notes: string) => updateAdminOrderNotes(orderNumber!, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminOrderDetail', orderNumber] });
    },
  });

  if (isLoading) {
    return <div className="p-12 text-center text-xs text-slate-500 animate-pulse">Loading order details...</div>;
  }

  if (isError || !order) {
    return (
      <div className="p-12 text-center space-y-4">
        <h2 className="text-xl font-bold text-rose-600 font-cinzel">Order Not Found</h2>
        <p className="text-xs text-slate-500">We couldn't retrieve details for order #{orderNumber}.</p>
        <Link to="/orders" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#386641] text-white text-xs font-semibold">
          Back to Orders List
        </Link>
      </div>
    );
  }

  const allowedNextStatuses = VALID_TRANSITIONS_MAP[order.status] || [];
  const isTerminal = order.status === 'DELIVERED' || order.status === 'CANCELLED';

  const handleStatusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNextStatus) return;
    setErrorMsg(null);
    updateStatusMutation.mutate({ status: selectedNextStatus, note: statusNote });
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <Link
            to="/orders"
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 font-mono">{order.orderNumber}</h1>
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-[#386641] text-[10px] font-bold uppercase tracking-wider">
                {order.status}
              </span>
              <span
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  order.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}
              >
                {order.paymentMethod} ({order.paymentStatus})
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Placed on {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Customer, Shipping & Items */}
        <div className="lg:col-span-8 space-y-6">
          {/* Customer & Shipping Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Customer Details */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 pb-2 border-b border-slate-100">
                <User className="w-4 h-4 text-[#386641]" />
                <span>Customer Information</span>
              </div>
              <div className="text-xs space-y-1 text-slate-600">
                <p className="font-semibold text-slate-900">{order.user.name}</p>
                <p>{order.user.email}</p>
                <p>{order.user.phone}</p>
              </div>
            </div>

            {/* Shipping Address Snapshot */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 pb-2 border-b border-slate-100">
                <MapPin className="w-4 h-4 text-[#386641]" />
                <span>Preserved Shipping Address</span>
              </div>
              {order.shippingAddress ? (
                <div className="text-xs space-y-1 text-slate-600">
                  <p className="font-semibold text-slate-900">{order.shippingAddress.fullName}</p>
                  <p>{order.shippingAddress.phone}</p>
                  <p>{order.shippingAddress.addressLine1}</p>
                  {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.state} -{' '}
                    <span className="font-mono font-semibold">{order.shippingAddress.postalCode}</span>
                  </p>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No address snapshot available.</p>
              )}
            </div>
          </div>

          {/* Ordered Products Table */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <Package className="w-4 h-4 text-[#386641]" />
                <span>Historical Order Items ({order.items.length})</span>
              </div>
              <span className="text-[10px] text-slate-400 italic">Prices fixed at purchase time</span>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {order.items.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={item.currentProduct?.image || '/placeholder-plant.jpg'}
                      alt={item.productNameSnapshot}
                      className="w-12 h-12 rounded-xl object-cover bg-slate-100 border border-slate-200 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="font-semibold text-slate-900 truncate">{item.productNameSnapshot}</h4>
                      <p className="text-[11px] text-slate-400 font-mono">
                        SKU: {item.currentProduct?.sku || 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className="font-bold text-slate-900">₹{item.subtotal}</span>
                    <p className="text-[11px] text-slate-400">
                      Qty: {item.quantity} × ₹{item.priceSnapshot}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Summary */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <CreditCard className="w-4 h-4 text-[#386641]" />
                <span>Payment &amp; Gateway Details</span>
              </div>
              {order.paymentMethod === 'COD' && order.paymentStatus === 'PENDING' && (
                <button
                  onClick={() => collectCodMutation.mutate()}
                  disabled={collectCodMutation.isPending}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Banknote className="w-4 h-4" />
                  <span>{collectCodMutation.isPending ? 'Processing...' : 'Collect COD Cash Payment'}</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <p className="text-slate-400">Payment Provider</p>
                <p className="font-bold text-slate-900">{order.paymentMethod}</p>
              </div>
              <div className="space-y-1">
                <p className="text-slate-400">Payment Status</p>
                <p className="font-bold text-slate-900">{order.paymentStatus}</p>
              </div>
              {order.payment?.providerOrderId && (
                <div className="space-y-1">
                  <p className="text-slate-400">Razorpay Order ID</p>
                  <p className="font-mono font-semibold text-slate-800">{order.payment.providerOrderId}</p>
                </div>
              )}
              {order.payment?.providerPaymentId && (
                <div className="space-y-1">
                  <p className="text-slate-400">Razorpay Payment ID</p>
                  <p className="font-mono font-semibold text-slate-800">{order.payment.providerPaymentId}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Status Transition Control, Summary & History */}
        <div className="lg:col-span-4 space-y-6">
          {/* Status Control Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 font-cinzel">Order Status Control</h3>

            {isTerminal ? (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <ShieldAlert className="w-4 h-4 text-slate-500" />
                  <span>Terminal State ({order.status})</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  This order is in a terminal status and cannot be changed or reopened.
                </p>
              </div>
            ) : (
              <form onSubmit={handleStatusSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Next Allowed Status
                  </label>
                  <select
                    value={selectedNextStatus}
                    onChange={(e) => setSelectedNextStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#386641]/20"
                  >
                    <option value="">Select next status...</option>
                    {allowedNextStatuses.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Audit Status Note (Optional)
                  </label>
                  <input
                    type="text"
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    placeholder="e.g. Handed package to BlueDart courier"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#386641]/20"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!selectedNextStatus || updateStatusMutation.isPending}
                  className="w-full py-3 rounded-xl bg-[#386641] hover:bg-[#2d5234] text-white font-semibold text-xs transition-colors disabled:opacity-50"
                >
                  {updateStatusMutation.isPending ? 'Updating Status...' : 'Apply Status Transition'}
                </button>
              </form>
            )}
          </div>

          {/* Financial Breakdown */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 font-cinzel">Financial Breakdown</h3>

            <div className="space-y-2 text-xs border-b border-slate-100 pb-3 text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900">₹{order.subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span className="font-semibold text-slate-900">
                  {order.deliveryFee === 0 ? <span className="text-emerald-700 font-bold">FREE</span> : `₹${order.deliveryFee}`}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-baseline pt-1">
              <span className="font-bold text-sm text-slate-900 font-cinzel">Total</span>
              <span className="text-xl font-bold text-[#386641] font-cinzel">₹{order.total}</span>
            </div>
          </div>

          {/* Status Timeline History */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 border-b border-slate-100 pb-3">
              <Clock className="w-4 h-4 text-[#386641]" />
              <span>Status Timeline History</span>
            </div>

            <div className="relative pl-6 space-y-4 text-xs before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {order.statusHistory.map((hist) => (
                <div key={hist.id} className="relative">
                  <div className="absolute -left-6 top-0.5 w-2.5 h-2.5 rounded-full bg-[#386641] ring-4 ring-white" />
                  <div className="font-bold text-slate-900">{hist.status}</div>
                  {hist.note && <p className="text-[11px] text-slate-500 mt-0.5">{hist.note}</p>}
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {new Date(hist.createdAt).toLocaleString()} — {hist.changedBy || 'System'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
