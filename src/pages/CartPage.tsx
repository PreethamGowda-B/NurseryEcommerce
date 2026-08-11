import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/navigation/Navbar';
import { FinalCTA } from '../components/footer/FinalCTA';
import { useCart } from '../hooks/useCart';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, AlertTriangle, ShieldCheck } from 'lucide-react';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    items,
    subtotal,
    deliveryFee,
    freeDeliveryThreshold,
    freeDeliveryRemaining,
    total,
    hasUnavailableItems,
    isLoading,
    isMutating,
    updateQuantity,
    removeFromCart,
    isAuthenticated,
  } = useCart();

  const handleProceedToCheckout = () => {
    if (isAuthenticated) {
      navigate('/checkout');
    } else {
      navigate('/register?redirect=/checkout');
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#0f2d21] pt-28">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-cinzel text-3xl font-bold text-[#0f2d21]">
              Your Shopping <span className="text-[#386641] italic font-playfair font-normal">Cart</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {isAuthenticated ? 'Persistent Customer Cart (Synced with Database)' : 'Guest Shopping Cart'}
            </p>
          </div>

          {!isAuthenticated && (
            <Link
              to="/login?redirect=/cart"
              className="px-4 py-2 rounded-full bg-emerald-100/80 text-[#386641] text-xs font-semibold hover:bg-emerald-200 transition-colors"
            >
              Sign In to Save Cart Across Devices
            </Link>
          )}
        </div>

        {/* Unavailable items warning */}
        {hasUnavailableItems && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center gap-3 text-xs text-amber-800">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-600" />
            <span>
              Some items in your cart are currently out of stock or unavailable. Unavailable items have been excluded from the total.
            </span>
          </div>
        )}

        {isLoading ? (
          <div className="bg-white border border-emerald-900/10 rounded-3xl p-12 text-center text-xs text-slate-500 animate-pulse">
            Syncing cart contents with database...
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white border border-emerald-900/10 rounded-3xl p-12 text-center space-y-4 shadow-natural">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-[#386641] flex items-center justify-center mx-auto">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h2 className="font-cinzel text-xl font-bold">Your cart is empty</h2>
            <p className="text-slate-500 text-sm max-w-sm mx-auto font-light">
              Explore our nursery collection and bring home living greenery for your space.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#386641] text-white font-semibold text-xs shadow-natural hover:scale-105 transition-all"
            >
              <span>Explore Collection</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Items list */}
            <div className="lg:col-span-8 space-y-4">
              {items.map(({ product, quantity, isAvailable, availabilityReason, effectivePrice }) => (
                <div
                  key={product.id}
                  className={`bg-white border rounded-2xl p-4 sm:p-5 flex items-center gap-4 shadow-natural transition-opacity ${
                    !isAvailable ? 'border-amber-300 bg-amber-50/30 opacity-75' : 'border-emerald-900/10'
                  }`}
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover bg-slate-100 flex-shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <h3 className="font-cinzel font-bold text-sm sm:text-base text-[#0f2d21] truncate">
                      {product.name}
                    </h3>
                    <p className="font-playfair text-xs italic text-[#386641]">
                      {product.botanicalName}
                    </p>

                    {!isAvailable ? (
                      <span className="inline-block px-2.5 py-0.5 mt-1 rounded-md bg-amber-100 text-amber-800 font-semibold text-[10px]">
                        {availabilityReason || 'Currently Unavailable'}
                      </span>
                    ) : (
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="font-semibold text-sm text-[#0f2d21]">
                          ₹{effectivePrice}
                        </span>
                        {product.salePrice && (
                          <span className="text-xs text-slate-400 line-through">
                            ₹{product.price}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Quantity control */}
                  {isAvailable && (
                    <div className="flex items-center gap-2 bg-emerald-50/70 border border-emerald-100 rounded-full px-2 py-1">
                      <button
                        disabled={isMutating}
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        className="p-1 text-slate-600 hover:text-[#386641] disabled:opacity-40"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs font-bold w-6 text-center">{quantity}</span>
                      <button
                        disabled={isMutating}
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        className="p-1 text-slate-600 hover:text-[#386641] disabled:opacity-40"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Remove */}
                  <button
                    disabled={isMutating}
                    onClick={() => removeFromCart(product.id)}
                    className="p-2 text-slate-400 hover:text-red-500 transition-colors disabled:opacity-40"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Order summary */}
            <div className="lg:col-span-4 bg-white border border-emerald-900/10 rounded-3xl p-6 space-y-6 shadow-natural">
              <h2 className="font-cinzel text-lg font-bold text-[#0f2d21]">Order Summary</h2>

              <div className="space-y-3 text-xs border-b border-emerald-900/10 pb-4">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#0f2d21]">₹{subtotal}</span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>Delivery Fee</span>
                  <span className="font-semibold text-[#0f2d21]">
                    {deliveryFee === 0 ? (
                      <span className="text-emerald-700 font-bold">FREE</span>
                    ) : (
                      `₹${deliveryFee}`
                    )}
                  </span>
                </div>

                {freeDeliveryRemaining > 0 && subtotal > 0 && (
                  <p className="text-[10px] text-emerald-700 italic">
                    Add ₹{freeDeliveryRemaining} more for FREE delivery!
                  </p>
                )}
              </div>

              <div className="flex justify-between items-baseline">
                <span className="font-cinzel font-bold text-sm text-[#0f2d21]">Total</span>
                <span className="font-cinzel text-2xl font-bold text-[#386641]">₹{total}</span>
              </div>

              <div className="space-y-2">
                <button
                  disabled={hasUnavailableItems || items.length === 0}
                  onClick={handleProceedToCheckout}
                  className="w-full py-3.5 rounded-full bg-[#386641] hover:bg-[#2d5234] text-white font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-natural transition-all hover:scale-102 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 pt-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Server-Verified Pricing &amp; Stock Enforcement</span>
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
