import React, { useState, useEffect } from 'react';
import { useProfile, useUpdateProfile } from '../../hooks/useAccount';
import { User, Mail, Phone, Calendar, Save, CheckCircle, AlertCircle } from 'lucide-react';

export const ProfileTab: React.FC = () => {
  const { data: profile, isLoading, isError } = useProfile();
  const updateMutation = useUpdateProfile();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setPhone(profile.phone || '');
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      await updateMutation.mutateAsync({ name, phone });
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to update profile.');
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-xs text-slate-500 animate-pulse">Loading profile data...</div>;
  }

  if (isError || !profile) {
    return <div className="p-8 text-center text-xs text-rose-500">Failed to load profile. Please log in again.</div>;
  }

  return (
    <div className="bg-white border border-emerald-900/10 rounded-3xl p-6 sm:p-8 shadow-natural space-y-6">
      <div>
        <h2 className="font-cinzel text-xl font-bold text-[#0f2d21]">Personal Profile</h2>
        <p className="text-xs text-slate-500 mt-1 font-light">
          Manage your account contact details. Email is locked for security.
        </p>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 max-w-lg text-xs">
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-emerald-900/15 rounded-xl text-xs text-[#0f2d21] focus:outline-none focus:border-[#386641]"
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Email Address (Read-Only)</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 z-10" />
            <div className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-700 font-mono font-semibold select-all flex items-center">
              {profile.email}
            </div>
          </div>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
          <div className="relative">
            <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 81231 91863"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-emerald-900/15 rounded-xl text-xs text-[#0f2d21] focus:outline-none focus:border-[#386641]"
            />
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <Calendar className="w-3 h-3" /> Member since {new Date(profile.createdAt).toLocaleDateString()}
          </span>

          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="px-6 py-2.5 rounded-full bg-[#386641] hover:bg-[#2d5234] text-white font-semibold text-xs flex items-center gap-2 shadow-natural transition-all hover:scale-105 disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{updateMutation.isPending ? 'Saving...' : 'Save Profile'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
