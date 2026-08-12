import React, { useState } from 'react';
import { useLogin } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, Eye, EyeOff, ArrowRight, AlertCircle, Leaf } from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('admin@shreeneekanursery.in');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loginMutation = useLogin();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    try {
      const res = await loginMutation.mutateAsync({ email, password });
      const user = res.data;

      if (user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN')) {
        navigate('/admin');
      } else {
        setErrorMessage('Access denied. Super Administrator authorization required.');
      }
    } catch (err: any) {
      if (err.response?.status === 403) {
        setErrorMessage('Account suspended. Please contact system administrator.');
      } else {
        setErrorMessage('Invalid admin email address or password.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#0f2d21] flex flex-col justify-between p-4 sm:p-6 font-sans">
      {/* Top Header */}
      <header className="max-w-7xl w-full mx-auto flex items-center justify-between py-4">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#386641] text-white flex items-center justify-center font-bold shadow-natural">
            <Leaf className="w-5 h-5" />
          </div>
          <div>
            <span className="font-cinzel text-lg font-bold tracking-wide text-[#0f2d21] block leading-none">
              SHEENEEKA NURSERY
            </span>
            <span className="text-[10px] font-mono tracking-widest text-[#386641] font-bold uppercase">
              SUPER ADMIN AUTHENTICATION
            </span>
          </div>
        </Link>

        <div className="hidden sm:flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200/80 font-mono">
          <ShieldCheck className="w-4 h-4 text-[#386641]" />
          <span>256-Bit Encrypted Admin Access</span>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="max-w-md w-full mx-auto my-auto py-8">
        <div className="bg-white border border-emerald-900/10 rounded-3xl p-8 shadow-natural-lg space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100/80 text-[#386641] flex items-center justify-center mx-auto shadow-xs border border-emerald-200">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="font-cinzel text-2xl font-bold text-[#0f2d21]">Administrator Sign In</h1>
            <p className="text-slate-500 text-xs font-light leading-relaxed">
              Restricted portal for Sheeneeka Nursery store operations &amp; order management.
            </p>
          </div>

          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-xs text-rose-800">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Admin Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="admin@shreeneekanursery.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-emerald-900/15 rounded-xl text-xs text-[#0f2d21] focus:outline-none focus:border-[#386641]"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-emerald-900/15 rounded-xl text-xs text-[#0f2d21] focus:outline-none focus:border-[#386641]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full py-3.5 rounded-full bg-[#386641] hover:bg-[#2d5234] text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-natural transition-all hover:scale-[1.01] disabled:opacity-50 cursor-pointer"
            >
              <span>{loginMutation.isPending ? 'Authenticating Admin...' : 'SIGN IN TO SUPER ADMIN'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-400 font-light leading-relaxed">
              🔒 Authorized Personnel Only. All access attempts are logged with IP &amp; timestamp security tracking.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-[11px] text-slate-400 font-light">
        © 2026 SHEENEKA NURSERY. All rights reserved. Secure Administrator Gateway.
      </footer>
    </div>
  );
};

export default AdminLoginPage;
