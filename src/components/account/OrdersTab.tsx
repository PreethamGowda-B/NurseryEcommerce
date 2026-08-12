import React, { useState } from 'react';
import { useCustomerOrders, CustomerOrder } from '../../hooks/useOrders';
import { useCustomerSSE } from '../../hooks/useCustomerSSE';
import { Package, Clock, MapPin, Eye, X, ArrowRight, CheckCircle2, Truck, ShieldCheck, Search, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export const OrdersTab: React.FC = () => {
  const { data: orders, isLoading, isError } = useCustomerOrders();
  const [selectedOrder, setSelectedOrder] = useState<CustomerOrder | null>(null);
  const [searchTrackNumber, setSearchTrackNumber] = useState('');

  // Real-time SSE Live Order Status Tracking Listener
  useCustomerSSE(() => {
    // Automatically refetches customer orders when admin changes status
  });

  if (isLoading) {
    return <div className="p-8 text-center text-xs text-slate-500 animate-pulse">Loading live order history...</div>;
  }

  if (isError) {
    return <div className="p-8 text-center text-xs text-rose-500">Failed to load order history.</div>;
  }

  const displayOrders = orders || [];

  const filteredOrders = displayOrders.filter(
    (o) =>
      o.orderNumber.toLowerCase().includes(searchTrackNumber.toLowerCase()) ||
      o.items.some((i) => i.productNameSnapshot.toLowerCase().includes(searchTrackNumber.toLowerCase()))
  );

  const getStepProgress = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PENDING':
        return 1;
      case 'CONFIRMED':
      case 'PROCESSING':
        return 2;
      case 'SHIPPED':
      case 'DISPATCHED':
        return 3;
      case 'DELIVERED':
        return 4;
      default:
        return 1;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-cinzel text-xl font-bold text-[#0f2d21]">Live Customer Order Tracking ({displayOrders.length})</h2>
          <p className="text-xs text-slate-500 mt-1 font-light">Real-time status updates and order tracking timeline.</p>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Track Order # (e.g. SN-260811)..."
            value={searchTrackNumber}
            onChange={(e) => setSearchTrackNumber(e.target.value)}
            className="pl-10 pr-4 py-2 bg-white border border-emerald-900/15 rounded-full text-xs text-[#0f2d21] focus:outline-none focus:border-[#386641] shadow-xs"
          />
        </div>
      </div>

      {/* Orders List Cards */}
      <div className="space-y-4">
        {filteredOrders.map((order) => {
          const currentStep = getStepProgress(order.status);

          return (
            <div
              key={order.id}
              className="bg-white border border-emerald-900/10 rounded-3xl p-6 shadow-natural space-y-4 hover:shadow-natural-lg transition-all"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-cinzel font-bold text-base text-[#0f2d21]">{order.orderNumber}</span>
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        order.status === 'DELIVERED'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : order.status === 'SHIPPED'
                          ? 'bg-purple-100 text-purple-800 border border-purple-300'
                          : order.status === 'CONFIRMED'
                          ? 'bg-blue-100 text-blue-800 border border-blue-300'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}
                    >
                      {order.status}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        order.paymentStatus === 'PAID'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {order.paymentMethod} ({order.paymentStatus})
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-light">
                    Placed on {new Date(order.createdAt).toLocaleDateString()} — {order.items.length} item(s)
                  </p>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="text-right">
                    <span className="font-cinzel text-xl font-bold text-[#386641]">₹{order.total}</span>
                    <p className="text-[10px] text-slate-400">Total Amount</p>
                  </div>

                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="px-4 py-2 rounded-full bg-[#386641] hover:bg-[#2d5234] text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-xs"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Track Order</span>
                  </button>
                </div>
              </div>

              {/* LIVE ORDER TRACKING PROGRESS STEPPER */}
              <div className="pt-4 border-t border-slate-100">
                <div className="grid grid-cols-4 gap-2 text-center text-xs relative">
                  {/* Step 1 */}
                  <div className="space-y-1.5 flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                        currentStep >= 1 ? 'bg-[#386641] text-white shadow-xs' : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      1
                    </div>
                    <span className={`text-[11px] font-semibold ${currentStep >= 1 ? 'text-[#0f2d21]' : 'text-slate-400'}`}>
                      Order Placed
                    </span>
                  </div>

                  {/* Step 2 */}
                  <div className="space-y-1.5 flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                        currentStep >= 2 ? 'bg-[#386641] text-white shadow-xs' : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      2
                    </div>
                    <span className={`text-[11px] font-semibold ${currentStep >= 2 ? 'text-[#0f2d21]' : 'text-slate-400'}`}>
                      Confirmed
                    </span>
                  </div>

                  {/* Step 3 */}
                  <div className="space-y-1.5 flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                        currentStep >= 3 ? 'bg-[#386641] text-white shadow-xs' : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      3
                    </div>
                    <span className={`text-[11px] font-semibold ${currentStep >= 3 ? 'text-[#0f2d21]' : 'text-slate-400'}`}>
                      Dispatched
                    </span>
                  </div>

                  {/* Step 4 */}
                  <div className="space-y-1.5 flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                        currentStep >= 4 ? 'bg-[#386641] text-white shadow-xs' : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      4
                    </div>
                    <span className={`text-[11px] font-semibold ${currentStep >= 4 ? 'text-[#0f2d21]' : 'text-slate-400'}`}>
                      Delivered
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filteredOrders.length === 0 && (
          <div className="bg-white border border-emerald-900/10 rounded-3xl p-12 text-center space-y-4 shadow-natural">
            <Package className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-slate-500 text-xs font-light">No orders found matching tracking search "{searchTrackNumber}".</p>
          </div>
        )}
      </div>

      {/* Order Detail & Live Tracking Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-emerald-900/10 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-natural-lg relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-emerald-900/10 pb-4">
              <div className="flex items-center gap-2">
                <h3 className="font-cinzel text-xl font-bold text-[#0f2d21]">{selectedOrder.orderNumber}</h3>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#386641] text-[10px] font-bold uppercase">
                  {selectedOrder.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Order date: {new Date(selectedOrder.createdAt).toLocaleString()}
              </p>
            </div>

            {/* Preserved Shipping Address Snapshot */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-[#0f2d21] mb-1">
                <MapPin className="w-3.5 h-3.5 text-[#386641]" />
                <span>Delivery Destination Address</span>
              </div>
              <p className="font-semibold text-[#0f2d21]">{selectedOrder.shippingAddress.fullName}</p>
              <p>{selectedOrder.shippingAddress.phone}</p>
              <p>{selectedOrder.shippingAddress.addressLine1}</p>
              {selectedOrder.shippingAddress.addressLine2 && <p>{selectedOrder.shippingAddress.addressLine2}</p>}
              <p>
                {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.postalCode}
              </p>
            </div>

            {/* Preserved Order Item Snapshots */}
            <div className="space-y-3">
              <h4 className="font-cinzel text-sm font-bold text-[#0f2d21]">Ordered Plant Specimen Items</h4>
              <div className="divide-y divide-emerald-900/10 text-xs">
                {selectedOrder.items.map((item) => (
                  <div key={item.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <h5 className="font-cinzel font-bold text-xs text-[#0f2d21]">{item.productNameSnapshot}</h5>
                      <p className="text-[11px] text-slate-500">Qty: {item.quantity} × ₹{item.priceSnapshot}</p>
                    </div>
                    <span className="font-semibold text-xs text-[#0f2d21]">₹{item.subtotal}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Breakdown */}
            <div className="pt-3 border-t border-emerald-900/10 text-xs space-y-2 text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-[#0f2d21]">₹{selectedOrder.subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span className="font-semibold text-[#0f2d21]">
                  {selectedOrder.deliveryFee === 0 ? <span className="text-emerald-700 font-bold">FREE</span> : `₹${selectedOrder.deliveryFee}`}
                </span>
              </div>
              <div className="flex justify-between font-bold text-sm text-[#0f2d21] pt-2 border-t border-emerald-900/10">
                <span>Total</span>
                <span className="text-[#386641]">₹{selectedOrder.total}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersTab;
