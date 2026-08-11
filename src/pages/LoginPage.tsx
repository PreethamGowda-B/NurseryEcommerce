import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Navbar } from '../components/navigation/Navbar';
import { FinalCTA } from '../components/footer/FinalCTA';
import { Leaf, Lock, Mail, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useLogin } from '../hooks/useAuth';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const redirectPath = searchParams.get('redirect') || '/account';

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
        navigate(redirectPath);
      }
    } catch (err: any) {
      if (err.response?.status === 403) {
        setErrorMsg('Your account has been suspended. Please contact support.');
      } else {
        setErrorMsg('Invalid email or password.');
      }
    }
  };

  const fillAdminCredentials = () => {
    setEmail('admin@sheeneekanursery.in');
    setPassword('Admin@Sheeneeka2026!');
  };

  const registerLink = `/register${redirectPath !== '/account' ? `?redirect=${encodeURIComponent(redirectPath)}` : ''}`;

  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#0f2d21] pt-28">
      <Navbar />
      <div className="max-w-md mx-auto px-4 py-12">
        <div className="bg-white border border-emerald-900/10 rounded-3xl p-8 space-y-6 shadow-natural-lg text-center">
          <div className="w-14 h-14 rounded-full bg-emerald-100/80 text-[#386641] flex items-center justify-center mx-auto">
            <Leaf className="w-7 h-7" />
          </div>

          <div>
            <h1 className="font-cinzel text-2xl font-bold text-[#0f2d21]">Customer Login</h1>
            <p className="text-slate-500 text-xs mt-1 font-light">
              Sign in to manage your orders, sync your shopping cart, and view plant status.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2 text-left">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-left text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="email@example.com"
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
                  placeholder="••••••••"
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
              <span>{loginMutation.isPending ? 'Logging In...' : 'Log In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-3 border-t border-emerald-900/10 space-y-2">
            <button
              type="button"
              onClick={fillAdminCredentials}
              className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-emerald-50 border border-slate-200 text-[#386641] font-semibold text-[11px] transition-colors"
            >
              🔑 Fill Admin Demo Credentials
            </button>
            <p className="text-xs text-slate-500">
              Don't have an account?{' '}
              <Link to={registerLink} className="font-semibold text-[#386641] hover:underline">
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>
      <FinalCTA />
    </div>
  );
};
