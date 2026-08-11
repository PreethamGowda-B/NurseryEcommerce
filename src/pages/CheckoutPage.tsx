import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Navbar } from '../components/navigation/Navbar';
import { FinalCTA } from '../components/footer/FinalCTA';
import { useCart } from '../hooks/useCart';
import { useUser } from '../hooks/useAuth';
import { useAddresses } from '../hooks/useAccount';
import { useCreateOrder } from '../hooks/useOrders';
import { useCreateRazorpayOrder, useVerifyRazorpayPayment, useConfirmCodOrder } from '../hooks/usePayment';
import { loadRazorpaySdk } from '../lib/razorpay';
import { MapPin, Plus, ShieldCheck, CheckCircle2, AlertCircle, CreditCard, Banknote, Lock } from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: user, isLoading: isUserLoading } = useUser();
  const { items, subtotal, deliveryFee, total, hasUnavailableItems, isLoading: isCartLoading } = useCart();
  const { data: addresses, isLoading: isAddrLoading } = useAddresses();

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'RAZORPAY'>('COD');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const createOrderMutation = useCreateOrder();
  const createRazorpayOrderMutation = useCreateRazorpayOrder();
  const verifyRazorpayPaymentMutation = useVerifyRazorpayPayment();
  const confirmCodMutation = useConfirmCodOrder();

  const isProcessing =
    createOrderMutation.isPending ||
    createRazorpayOrderMutation.isPending ||
    verifyRazorpayPaymentMutation.isPending ||
    confirmCodMutation.isPending;

  // Authentication guard
  useEffect(() => {
    if (!isUserLoading && !user) {
      navigate('/login?redirect=/checkout');
    }
  }, [user, isUserLoading, navigate]);

  // Pre-select default address
  useEffect(() => {
    if (addresses && addresses.length > 0 && !selectedAddressId) {
      const def = addresses.find((a) => a.isDefault) || addresses[0];
      setSelectedAddressId(def.id);
    }
  }, [addresses, selectedAddressId]);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!selectedAddressId) {
      setErrorMsg('Please select a shipping address to proceed.');
      return;
    }

    if (items.length === 0) {
      setErrorMsg('Your cart is empty.');
      return;
    }

    if (hasUnavailableItems) {
      setErrorMsg('Some items in your cart are currently unavailable. Please remove them before placing order.');
      return;
    }

    try {
      // 1. Create order record on backend
      const createdOrder = await createOrderMutation.mutateAsync({ addressId: selectedAddressId });

      // 2. Process based on selected payment method
      if (paymentMethod === 'COD') {
        await confirmCodMutation.mutateAsync({ orderNumber: createdOrder.orderNumber });
        navigate(`/order-success?order=${createdOrder.orderNumber}&method=COD`);
      } else {
        // Razorpay Online Flow
        const sdkLoaded = await loadRazorpaySdk();
        if (!sdkLoaded) {
          setErrorMsg('Failed to load Razorpay Checkout SDK. Please check your internet connection.');
          return;
        }

        const rzpData = await createRazorpayOrderMutation.mutateAsync({ orderNumber: createdOrder.orderNumber });

        const options = {
          key: rzpData.keyId,
          amount: rzpData.amount,
          currency: rzpData.currency,
          name: 'Sheeneeka Nursery',
          description: `Order ${rzpData.orderNumber}`,
          order_id: rzpData.razorpayOrderId,
          prefill: {
            name: user?.name,
            email: user?.email,
            contact: user?.phone || '',
          },
          theme: {
            color: '#386641',
          },
          handler: async (response: any) => {
            try {
              await verifyRazorpayPaymentMutation.mutateAsync({
                orderNumber: createdOrder.orderNumber,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              });
              navigate(`/order-success?order=${createdOrder.orderNumber}&method=RAZORPAY`);
            } catch (verr: any) {
              setErrorMsg(verr.response?.data?.message || 'Payment signature verification failed.');
            }
          },
          modal: {
            ondismiss: () => {
              setErrorMsg('Razorpay payment modal closed. You can retry payment from your account orders.');
            },
          },
        };

        const rzpModal = new (window as any).Razorpay(options);
        rzpModal.open();
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to process order or payment.');
    }
  };

  if (isUserLoading || isCartLoading || !user) {
    return (
      <div className="min-h-screen bg-[#faf9f6] flex items-center justify-center text-xs text-slate-500">
        Verifying checkout session...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#0f2d21] pt-28">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="font-cinzel text-3xl font-bold text-[#0f2d21]">
            Secure <span className="text-[#386641] italic font-playfair font-normal">Checkout</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review delivery address and select your preferred payment method.
          </p>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {items.length === 0 ? (
          <div className="bg-white border border-emerald-900/10 rounded-3xl p-12 text-center space-y-4 shadow-natural">
            <h2 className="font-cinzel text-xl font-bold">Your cart is empty</h2>
            <p className="text-xs text-slate-500 font-light">Add items to your cart before proceeding to checkout.</p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#386641] text-white text-xs font-semibold"
            >
              Explore Shop
            </Link>
          </div>
        ) : (
          <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Address & Items */}
            <div className="lg:col-span-8 space-y-6">
              {/* Section 1: Address Selection */}
              <div className="bg-white border border-emerald-900/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-natural">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-[#386641]" />
                    <h2 className="font-cinzel text-lg font-bold text-[#0f2d21]">1. Select Shipping Address</h2>
                  </div>

                  <Link
                    to="/account/addresses"
                    className="text-xs text-[#386641] font-semibold hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Manage Addresses
                  </Link>
                </div>

                {isAddrLoading ? (
                  <div className="text-xs text-slate-500 animate-pulse">Loading saved addresses...</div>
                ) : !addresses || addresses.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 text-center space-y-3">
                    <p className="text-xs text-amber-800 font-medium">No saved shipping addresses found.</p>
                    <Link
                      to="/account/addresses"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#386641] text-white text-xs font-semibold"
                    >
                      <Plus className="w-4 h-4" /> Add Delivery Address
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {addresses.map((addr) => {
                      const isSelected = selectedAddressId === addr.id;
                      return (
                        <div
                          key={addr.id}
                          onClick={() => setSelectedAddressId(addr.id)}
                          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                            isSelected
                              ? 'border-[#386641] bg-emerald-50/40 ring-1 ring-[#386641]/40'
                              : 'border-slate-200 bg-white hover:border-emerald-300'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-bold tracking-wider px-2.5 py-0.5 rounded-md bg-emerald-100 text-[#386641] uppercase">
                              {addr.label}
                            </span>
                            {isSelected && <CheckCircle2 className="w-4 h-4 text-[#386641]" />}
                          </div>

                          <h4 className="font-cinzel font-bold text-xs text-[#0f2d21]">{addr.fullName}</h4>
                          <p className="text-[11px] text-slate-500">{addr.phone}</p>
                          <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">
                            {addr.addressLine1}, {addr.city}, {addr.state} - {addr.postalCode}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Section 2: Payment Method Selection */}
              <div className="bg-white border border-emerald-900/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-natural">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-[#386641]" />
                  <h2 className="font-cinzel text-lg font-bold text-[#0f2d21]">2. Select Payment Method</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* COD Radio */}
                  <div
                    onClick={() => setPaymentMethod('COD')}
                    className={`p-5 rounded-2xl border cursor-pointer flex items-start gap-4 transition-all ${
                      paymentMethod === 'COD'
                        ? 'border-[#386641] bg-emerald-50/40 ring-1 ring-[#386641]/40'
                        : 'border-slate-200 bg-white hover:border-emerald-300'
                    }`}
                  >
                    <Banknote className="w-6 h-6 text-[#386641] flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-cinzel font-bold text-sm text-[#0f2d21]">Cash on Delivery</h4>
                        {paymentMethod === 'COD' && <CheckCircle2 className="w-4 h-4 text-[#386641]" />}
                      </div>
                      <p className="text-xs text-slate-500 mt-1 font-light">
                        Pay with Cash or UPI directly to our logistics partner upon plant delivery.
                      </p>
                    </div>
                  </div>

                  {/* Razorpay Radio */}
                  <div
                    onClick={() => setPaymentMethod('RAZORPAY')}
                    className={`p-5 rounded-2xl border cursor-pointer flex items-start gap-4 transition-all ${
                      paymentMethod === 'RAZORPAY'
                        ? 'border-[#386641] bg-emerald-50/40 ring-1 ring-[#386641]/40'
                        : 'border-slate-200 bg-white hover:border-emerald-300'
                    }`}
                  >
                    <CreditCard className="w-6 h-6 text-[#386641] flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-cinzel font-bold text-sm text-[#0f2d21]">Pay Online (Razorpay)</h4>
                        {paymentMethod === 'RAZORPAY' && <CheckCircle2 className="w-4 h-4 text-[#386641]" />}
                      </div>
                      <p className="text-xs text-slate-500 mt-1 font-light">
                        Instant payment via Credit/Debit Cards, UPI (GPay/PhonePe), NetBanking, or Wallets.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Order Items Review */}
              <div className="bg-white border border-emerald-900/10 rounded-3xl p-6 sm:p-8 space-y-4 shadow-natural">
                <h2 className="font-cinzel text-lg font-bold text-[#0f2d21]">3. Order Items ({items.length})</h2>

                <div className="divide-y divide-emerald-900/10">
                  {items.map(({ product, quantity, effectivePrice, itemSubtotal }) => (
                    <div key={product.id} className="py-4 flex items-center gap-4">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-16 h-16 rounded-xl object-cover bg-slate-100 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-cinzel font-bold text-xs sm:text-sm text-[#0f2d21] truncate">
                          {product.name}
                        </h4>
                        <p className="text-[11px] text-slate-500">Qty: {quantity}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold text-xs text-[#0f2d21]">₹{itemSubtotal}</span>
                        <p className="text-[10px] text-slate-400">₹{effectivePrice} each</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary & Confirmation */}
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
                    {deliveryFee === 0 ? <span className="text-emerald-700 font-bold">FREE</span> : `₹${deliveryFee}`}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-baseline">
                <span className="font-cinzel font-bold text-sm text-[#0f2d21]">Total Amount</span>
                <span className="font-cinzel text-2xl font-bold text-[#386641]">₹{total}</span>
              </div>

              <button
                type="submit"
                disabled={isProcessing || !selectedAddressId || hasUnavailableItems}
                className="w-full py-4 rounded-full bg-[#386641] hover:bg-[#2d5234] text-white font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-natural transition-all hover:scale-102 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Lock className="w-4 h-4" />
                <span>
                  {isProcessing
                    ? 'Processing...'
                    : paymentMethod === 'COD'
                    ? 'Place COD Order'
                    : `Pay ₹${total} via Razorpay`}
                </span>
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>HMAC-SHA256 Encrypted &amp; Server-Verified Payment</span>
              </div>
            </div>
          </form>
        )}
      </div>
      <FinalCTA />
    </div>
  );
};
