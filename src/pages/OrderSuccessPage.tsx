import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Navbar } from '../components/navigation/Navbar';
import { FinalCTA } from '../components/footer/FinalCTA';
import { useCustomerOrder } from '../hooks/useOrders';
import { CheckCircle2, Clock, MapPin, Package, ArrowRight, ShoppingBag } from 'lucide-react';

export const OrderSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const orderNumber = searchParams.get('order');

  const { data: order, isLoading, isError } = useCustomerOrder(orderNumber);

  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#0f2d21] pt-28">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {isLoading ? (
          <div className="bg-white border border-emerald-900/10 rounded-3xl p-12 text-center text-xs text-slate-500 animate-pulse">
            Retrieving order confirmation details...
          </div>
        ) : isError || !order ? (
          <div className="bg-white border border-emerald-900/10 rounded-3xl p-12 text-center space-y-4 shadow-natural">
            <h2 className="font-cinzel text-xl font-bold text-rose-700">Order Information Unavailable</h2>
            <p className="text-xs text-slate-500 font-light">
              We couldn't retrieve the specified order details. Please verify your order number or check your account history.
            </p>
            <Link
              to="/account/orders"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#386641] text-white text-xs font-semibold"
            >
              View Order History
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header Card */}
            <div className="bg-white border border-emerald-900/10 rounded-3xl p-8 text-center space-y-4 shadow-natural">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#386641] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="px-3 py-1 rounded-full bg-emerald-50 text-[#386641] text-[10px] font-bold tracking-wider uppercase border border-emerald-200">
                    Order Status: {order.status}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${
                      order.paymentStatus === 'PAID'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    Payment: {order.paymentMethod} ({order.paymentStatus})
                  </span>
                </div>
                <h1 className="font-cinzel text-2xl sm:text-3xl font-bold text-[#0f2d21]">
                  Order Confirmed!
                </h1>
                <p className="text-xs text-slate-500 mt-1 font-light">
                  Thank you for ordering with Sheeneeka Nursery. Your order number is{' '}
                  <strong className="text-[#386641] font-mono text-sm">{order.orderNumber}</strong>.
                </p>
              </div>
            </div>

            {/* Order Details Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Items & Shipping Snapshot */}
              <div className="lg:col-span-8 space-y-6">
                {/* Shipping Address Snapshot */}
                <div className="bg-white border border-emerald-900/10 rounded-3xl p-6 space-y-3 shadow-natural">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#0f2d21] border-b border-emerald-900/10 pb-3">
                    <MapPin className="w-4 h-4 text-[#386641]" />
                    <span>Shipping Address Snapshot</span>
                  </div>

                  <div className="text-xs text-slate-600 space-y-1 font-light pt-1">
                    <p className="font-semibold text-[#0f2d21]">{order.shippingAddress.fullName}</p>
                    <p>{order.shippingAddress.phone}</p>
                    <p>{order.shippingAddress.addressLine1}</p>
                    {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                    <p>
                      {order.shippingAddress.city}, {order.shippingAddress.state} —{' '}
                      <span className="font-mono font-semibold">{order.shippingAddress.postalCode}</span>
                    </p>
                  </div>
                </div>

                {/* Items Snapshot List */}
                <div className="bg-white border border-emerald-900/10 rounded-3xl p-6 space-y-4 shadow-natural">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#0f2d21] border-b border-emerald-900/10 pb-3">
                    <Package className="w-4 h-4 text-[#386641]" />
                    <span>Ordered Products ({order.items.length})</span>
                  </div>

                  <div className="divide-y divide-emerald-900/10 text-xs">
                    {order.items.map((item) => (
                      <div key={item.id} className="py-3 flex items-center justify-between">
                        <div>
                          <h4 className="font-cinzel font-bold text-xs text-[#0f2d21]">
                            {item.productNameSnapshot}
                          </h4>
                          <p className="text-[11px] text-slate-500">Qty: {item.quantity} × ₹{item.priceSnapshot}</p>
                        </div>
                        <span className="font-semibold text-xs text-[#0f2d21]">₹{item.subtotal}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Summary Card & CTAs */}
              <div className="lg:col-span-4 bg-white border border-emerald-900/10 rounded-3xl p-6 space-y-6 shadow-natural">
                <h3 className="font-cinzel text-base font-bold text-[#0f2d21]">Financial Breakdown</h3>

                <div className="space-y-3 text-xs border-b border-emerald-900/10 pb-4 text-slate-600">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-semibold text-[#0f2d21]">₹{order.subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span className="font-semibold text-[#0f2d21]">
                      {order.deliveryFee === 0 ? <span className="text-emerald-700 font-bold">FREE</span> : `₹${order.deliveryFee}`}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-baseline">
                  <span className="font-cinzel font-bold text-sm text-[#0f2d21]">Total</span>
                  <span className="font-cinzel text-2xl font-bold text-[#386641]">₹{order.total}</span>
                </div>

                <div className="space-y-3 pt-2">
                  <Link
                    to="/account/orders"
                    className="w-full py-3 rounded-full bg-[#386641] hover:bg-[#2d5234] text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-natural transition-all"
                  >
                    <span>View Order History</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <Link
                    to="/shop"
                    className="w-full py-3 rounded-full border border-slate-200 text-slate-600 font-semibold text-xs flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Continue Shopping</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <FinalCTA />
    </div>
  );
};
