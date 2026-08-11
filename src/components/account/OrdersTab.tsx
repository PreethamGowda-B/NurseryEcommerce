import React, { useState } from 'react';
import { useCustomerOrders, CustomerOrder } from '../../hooks/useOrders';
import { Package, Clock, MapPin, Eye, X, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const OrdersTab: React.FC = () => {
  const { data: orders, isLoading, isError } = useCustomerOrders();
  const [selectedOrder, setSelectedOrder] = useState<CustomerOrder | null>(null);

  if (isLoading) {
    return <div className="p-8 text-center text-xs text-slate-500 animate-pulse">Loading order history...</div>;
  }

  if (isError) {
    return <div className="p-8 text-center text-xs text-rose-500">Failed to load order history.</div>;
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="bg-white border border-emerald-900/10 rounded-3xl p-12 text-center space-y-4 shadow-natural">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-[#386641] flex items-center justify-center mx-auto">
          <Package className="w-8 h-8" />
        </div>
        <h3 className="font-cinzel text-xl font-bold text-[#0f2d21]">No orders placed yet</h3>
        <p className="text-slate-500 text-xs max-w-sm mx-auto font-light">
          Your nursery plant order history and live status updates will appear here.
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#386641] text-white font-semibold text-xs shadow-natural hover:scale-105 transition-all"
        >
          <span>Explore Plants</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-cinzel text-xl font-bold text-[#0f2d21]">My Orders ({orders.length})</h2>
          <p className="text-xs text-slate-500 mt-1 font-light">View historical order snapshots and tracking details.</p>
        </div>
      </div>

      {/* Orders List Cards */}
      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white border border-emerald-900/10 rounded-3xl p-6 shadow-natural flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-cinzel font-bold text-sm text-[#0f2d21]">{order.orderNumber}</span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#386641] text-[10px] font-bold uppercase tracking-wider">
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
              <p className="text-xs text-slate-500">
                Placed on {new Date(order.createdAt).toLocaleDateString()} — {order.items.length} item(s)
              </p>
              <p className="text-xs text-slate-600 font-light">
                Deliver to: <strong className="font-semibold text-[#0f2d21]">{order.shippingAddress.fullName}</strong> ({order.shippingAddress.city})
              </p>
            </div>

            <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-emerald-900/10">
              <div className="text-right">
                <span className="font-cinzel text-lg font-bold text-[#386641]">₹{order.total}</span>
                <p className="text-[10px] text-slate-400">Total Amount</p>
              </div>

              <button
                onClick={() => setSelectedOrder(order)}
                className="px-4 py-2 rounded-full bg-emerald-50 text-[#386641] hover:bg-emerald-100 font-semibold text-xs flex items-center gap-1.5 transition-colors"
              >
                <Eye className="w-4 h-4" />
                <span>View Details</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
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
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold uppercase">
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
                <span>Preserved Delivery Address</span>
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
              <h4 className="font-cinzel text-sm font-bold text-[#0f2d21]">Ordered Items Snapshot</h4>
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
