import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Navbar } from '../components/navigation/Navbar';
import { FinalCTA } from '../components/footer/FinalCTA';
import { useUser, useLogout } from '../hooks/useAuth';
import { ProfileTab } from '../components/account/ProfileTab';
import { AddressesTab } from '../components/account/AddressesTab';
import { OrdersTab } from '../components/account/OrdersTab';
import { User, MapPin, Package, LogOut, ShieldCheck, Leaf } from 'lucide-react';

export const AccountPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: user, isLoading } = useUser();
  const logoutMutation = useLogout();

  // Redirect to login if unauthenticated
  React.useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login');
    }
  }, [user, isLoading, navigate]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-[#faf9f6] flex items-center justify-center text-xs text-slate-500">
        Verifying customer authentication session...
      </div>
    );
  }

  // Determine active sub-tab from path
  const activeTab = location.pathname.includes('/addresses')
    ? 'addresses'
    : location.pathname.includes('/orders')
    ? 'orders'
    : 'profile';

  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#0f2d21] pt-28">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Customer Header */}
        <div className="bg-white border border-emerald-900/10 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-natural">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100/80 border border-emerald-300 text-[#386641] flex items-center justify-center font-bold text-xl">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-cinzel text-xl sm:text-2xl font-bold text-[#0f2d21]">{user.name}</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#386641] text-[10px] font-bold tracking-wider uppercase">
                  Customer
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={() => {
                logoutMutation.mutate();
                navigate('/login');
              }}
              className="px-5 py-2.5 rounded-full bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 font-semibold text-xs flex items-center gap-2 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Account Sub-Tabs Navigation */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-3 bg-white border border-emerald-900/10 rounded-3xl p-3 shadow-natural space-y-1">
            <Link
              to="/account/profile"
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold transition-all ${
                activeTab === 'profile'
                  ? 'bg-[#386641] text-white shadow-natural'
                  : 'text-slate-600 hover:bg-emerald-50 hover:text-[#386641]'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Personal Profile</span>
            </Link>

            <Link
              to="/account/addresses"
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold transition-all ${
                activeTab === 'addresses'
                  ? 'bg-[#386641] text-white shadow-natural'
                  : 'text-slate-600 hover:bg-emerald-50 hover:text-[#386641]'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>Shipping Addresses</span>
            </Link>

            <Link
              to="/account/orders"
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold transition-all ${
                activeTab === 'orders'
                  ? 'bg-[#386641] text-white shadow-natural'
                  : 'text-slate-600 hover:bg-emerald-50 hover:text-[#386641]'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>My Orders</span>
            </Link>
          </div>

          {/* Active Tab Body */}
          <div className="lg:col-span-9">
            {activeTab === 'profile' && <ProfileTab />}
            {activeTab === 'addresses' && <AddressesTab />}
            {activeTab === 'orders' && <OrdersTab />}
          </div>
        </div>
      </div>

      <FinalCTA />
    </div>
  );
};
