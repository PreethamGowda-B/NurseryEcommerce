import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLogin } from '../hooks/useAuth';
import { ShieldCheck, Lock, Mail, ArrowRight, AlertCircle, Eye, EyeOff, Leaf, KeyRound } from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loginMutation = useLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    try {
      const res = await loginMutation.mutateAsync({ email: email.trim(), password });
      const user = res?.data;

      if (user?.role === 'ADMIN') {
        navigate('/admin');
      } else {
        setErrorMsg('Access Denied: This user account does not possess Super Admin privileges.');
      }
    } catch (err: any) {
      if (err.response?.status === 403) {
        setErrorMsg('Your administrator account has been suspended. Please contact system support.');
      } else {
        setErrorMsg('Invalid administrator credentials.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#0f2d21] flex flex-col justify-between font-sans">
      {/* Top Header */}
      <header className="h-20 bg-white border-b border-emerald-900/10 px-4 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#386641] text-white flex items-center justify-center font-bold shadow-natural">
            <Leaf className="w-6 h-6" />
          </div>
          <div>
            <span className="font-cinzel text-lg font-bold tracking-wide text-[#0f2d21] block leading-none">
              SHEENEEKA NURSERY
            </span>
            <span className="text-[10px] font-mono tracking-widest text-[#386641] font-bold uppercase">
              SUPER ADMIN AUTHENTICATION
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
          <ShieldCheck className="w-4 h-4 text-[#386641]" />
          <span className="hidden sm:inline">256-Bit Encrypted Admin Access</span>
        </div>
      </header>

      {/* Main Admin Login Card */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-emerald-900/10 rounded-3xl p-8 space-y-6 shadow-natural-lg text-center">
          <div className="w-16 h-16 rounded-3xl bg-emerald-100/80 border border-emerald-300 text-[#386641] flex items-center justify-center mx-auto shadow-xs">
            <KeyRound className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h1 className="font-cinzel text-2xl font-bold text-[#0f2d21]">Administrator Sign In</h1>
            <p className="text-slate-500 text-xs font-light">
              Restricted portal for Sheeneeka Nursery store operations &amp; order management.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2 text-left">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-left text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Admin Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="admin@sheeneekanursery.in"
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#386641] transition-colors p-1"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full py-3.5 rounded-full bg-[#386641] hover:bg-[#2d5234] text-white font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-natural transition-all hover:scale-102 mt-2 disabled:opacity-50"
            >
              <span>{loginMutation.isPending ? 'Authenticating...' : 'Sign In To Super Admin'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200/60 text-[11px] text-amber-800 text-center font-light leading-relaxed">
            🔒 Authorized Personnel Only. All access attempts are logged with IP &amp; timestamp security tracking.
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-400 border-t border-emerald-900/10">
        © 2026 SHEENEEKA NURSERY. All rights reserved. Secure Administrator Gateway.
      </footer>
    </div>
  );
};

export default AdminLoginPage;
