import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Navbar } from '../components/navigation/Navbar';
import { FinalCTA } from '../components/footer/FinalCTA';
import { Leaf, Lock, Mail, User, Phone, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useRegister } from '../hooks/useAuth';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const redirectPath = searchParams.get('redirect') || '/account';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const registerMutation = useRegister();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters');
      return;
    }

    try {
      await registerMutation.mutateAsync({ name: name.trim(), email: email.trim(), phone: phone.trim(), password });
      navigate(redirectPath);
    } catch (err: any) {
      if (err.response?.status === 409) {
        setErrorMsg('An account with this email address already exists.');
      } else {
        setErrorMsg(err.response?.data?.message || 'Failed to create account.');
      }
    }
  };

  const loginLink = `/login${redirectPath !== '/account' ? `?redirect=${encodeURIComponent(redirectPath)}` : ''}`;

  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#0f2d21] pt-28">
      <Navbar />
      <div className="max-w-md mx-auto px-4 py-12">
        <div className="bg-white border border-emerald-900/10 rounded-3xl p-8 space-y-6 shadow-natural-lg text-center">
          <div className="w-14 h-14 rounded-full bg-emerald-100/80 text-[#386641] flex items-center justify-center mx-auto">
            <Leaf className="w-7 h-7" />
          </div>

          <div>
            <h1 className="font-cinzel text-2xl font-bold text-[#0f2d21]">Create Account</h1>
            <p className="text-slate-500 text-xs mt-1 font-light">
              Register for a Sheeneeka Nursery customer account.
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
              <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-emerald-900/15 rounded-xl text-xs text-[#0f2d21] focus:outline-none focus:border-[#386641]"
                />
              </div>
            </div>

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
              <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  placeholder="+91 81231 91863"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
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
                  placeholder="Minimum 6 characters"
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
              disabled={registerMutation.isPending}
              className="w-full py-3.5 rounded-full bg-[#386641] hover:bg-[#2d5234] text-white font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-natural transition-all hover:scale-102 mt-2 disabled:opacity-50"
            >
              <span>{registerMutation.isPending ? 'Creating Account...' : 'Create Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="text-xs text-slate-500 pt-2 border-t border-emerald-900/10">
            Already have an account?{' '}
            <Link to={loginLink} className="font-semibold text-[#386641] hover:underline">
              Log In
            </Link>
          </p>
        </div>
      </div>
      <FinalCTA />
    </div>
  );
};
