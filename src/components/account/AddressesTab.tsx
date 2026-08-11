import React, { useState } from 'react';
import {
  useAddresses,
  useCreateAddress,
  useUpdateAddress,
  useDeleteAddress,
  useSetDefaultAddress,
  ShippingAddress,
} from '../../hooks/useAccount';
import { MapPin, Plus, CheckCircle, Edit2, Trash2, Home, Briefcase, Tag, AlertCircle, Save, X } from 'lucide-react';

export const AddressesTab: React.FC = () => {
  const { data: addresses, isLoading, isError } = useAddresses();
  const createMutation = useCreateAddress();
  const updateMutation = useUpdateAddress();
  const deleteMutation = useDeleteAddress();
  const setDefaultMutation = useSetDefaultAddress();

  const [isOpenForm, setIsOpenForm] = useState(false);
  const [editingAddr, setEditingAddr] = useState<ShippingAddress | null>(null);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('India');
  const [label, setLabel] = useState<'HOME' | 'WORK' | 'OTHER'>('HOME');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleOpenAdd = () => {
    setFullName('');
    setPhone('');
    setAddressLine1('');
    setAddressLine2('');
    setCity('');
    setState('');
    setPostalCode('');
    setCountry('India');
    setLabel('HOME');
    setEditingAddr(null);
    setIsOpenForm(true);
  };

  const handleOpenEdit = (addr: ShippingAddress) => {
    setEditingAddr(addr);
    setFullName(addr.fullName);
    setPhone(addr.phone);
    setAddressLine1(addr.addressLine1);
    setAddressLine2(addr.addressLine2 || '');
    setCity(addr.city);
    setState(addr.state);
    setPostalCode(addr.postalCode);
    setCountry(addr.country || 'India');
    setLabel(addr.label || 'HOME');
    setIsOpenForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    try {
      if (editingAddr) {
        await updateMutation.mutateAsync({
          id: editingAddr.id,
          data: { fullName, phone, addressLine1, addressLine2, city, state, postalCode, country, label },
        });
      } else {
        await createMutation.mutateAsync({ fullName, phone, addressLine1, addressLine2, city, state, postalCode, country, label });
      }
      setIsOpenForm(false);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to save address.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-cinzel text-xl font-bold text-[#0f2d21]">Shipping Addresses</h2>
          <p className="text-xs text-slate-500 mt-1 font-light">
            Manage your delivery destinations for plant shipments.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-full bg-[#386641] hover:bg-[#2d5234] text-white text-xs font-semibold flex items-center gap-2 shadow-natural transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Address</span>
        </button>
      </div>

      {/* Form Drawer / Modal */}
      {isOpenForm && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-emerald-900/10 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-natural-lg relative">
            <button
              onClick={() => setIsOpenForm(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="font-cinzel text-lg font-bold text-[#0f2d21]">
                {editingAddr ? 'Edit Shipping Address' : 'Add Shipping Address'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Used for calculating local nursery delivery fees and logistics.</p>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Recipient Name"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-emerald-900/15 rounded-xl focus:outline-none focus:border-[#386641]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-emerald-900/15 rounded-xl focus:outline-none focus:border-[#386641]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Address Line 1 *</label>
                <input
                  type="text"
                  required
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  placeholder="House/Flat No., Building, Street"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-emerald-900/15 rounded-xl focus:outline-none focus:border-[#386641]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Address Line 2 (Optional)</label>
                <input
                  type="text"
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                  placeholder="Area, Landmark"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-emerald-900/15 rounded-xl focus:outline-none focus:border-[#386641]"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Bengaluru"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-emerald-900/15 rounded-xl focus:outline-none focus:border-[#386641]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">State *</label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="Karnataka"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-emerald-900/15 rounded-xl focus:outline-none focus:border-[#386641]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">PIN / Postal Code *</label>
                  <input
                    type="text"
                    required
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="560034"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-emerald-900/15 rounded-xl focus:outline-none focus:border-[#386641] font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Country</label>
                  <input
                    type="text"
                    disabled
                    value={country}
                    className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Address Label</label>
                  <select
                    value={label}
                    onChange={(e) => setLabel(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-emerald-900/15 rounded-xl focus:outline-none focus:border-[#386641]"
                  >
                    <option value="HOME">HOME</option>
                    <option value="WORK">WORK</option>
                    <option value="OTHER">OTHER</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsOpenForm(false)}
                  className="px-5 py-2.5 rounded-full border border-slate-200 text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-6 py-2.5 rounded-full bg-[#386641] hover:bg-[#2d5234] text-white font-semibold flex items-center gap-2 shadow-natural disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Address</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Address Cards List */}
      {isLoading ? (
        <div className="p-8 text-center text-xs text-slate-500 animate-pulse">Loading shipping addresses...</div>
      ) : addresses?.length === 0 ? (
        <div className="bg-white border border-emerald-900/10 rounded-3xl p-12 text-center space-y-4 shadow-natural">
          <MapPin className="w-10 h-10 text-[#386641] mx-auto" />
          <h3 className="font-cinzel text-lg font-bold text-[#0f2d21]">No saved addresses</h3>
          <p className="text-xs text-slate-500 font-light max-w-sm mx-auto">
            Add a shipping address to enable fast checkout for plant shipments.
          </p>
          <button
            onClick={handleOpenAdd}
            className="px-6 py-2.5 rounded-full bg-[#386641] text-white font-semibold text-xs transition-all hover:scale-105"
          >
            Add Address
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses?.map((addr) => (
            <div
              key={addr.id}
              className={`bg-white border rounded-3xl p-6 shadow-natural space-y-4 flex flex-col justify-between relative ${
                addr.isDefault ? 'border-[#386641] ring-1 ring-[#386641]/30' : 'border-emerald-900/10'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-[#386641] text-[10px] font-bold tracking-wider">
                    {addr.label === 'HOME' && <Home className="w-3 h-3" />}
                    {addr.label === 'WORK' && <Briefcase className="w-3 h-3" />}
                    {addr.label === 'OTHER' && <Tag className="w-3 h-3" />}
                    {addr.label}
                  </span>

                  {addr.isDefault ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#386641] text-white text-[10px] font-bold">
                      <CheckCircle className="w-3 h-3" /> DEFAULT SHIPPING
                    </span>
                  ) : (
                    <button
                      onClick={() => setDefaultMutation.mutate(addr.id)}
                      className="text-[11px] text-[#386641] hover:underline font-semibold"
                    >
                      Set as Default
                    </button>
                  )}
                </div>

                <div>
                  <h4 className="font-cinzel text-base font-bold text-[#0f2d21]">{addr.fullName}</h4>
                  <p className="text-xs text-slate-500">{addr.phone}</p>
                </div>

                <div className="text-xs text-[#3a5246] leading-relaxed font-light">
                  <p>{addr.addressLine1}</p>
                  {addr.addressLine2 && <p>{addr.addressLine2}</p>}
                  <p>
                    {addr.city}, {addr.state} — <span className="font-mono font-semibold">{addr.postalCode}</span>
                  </p>
                  <p className="text-slate-400 text-[11px]">{addr.country}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-emerald-900/10 flex items-center justify-end gap-3 text-xs">
                <button
                  onClick={() => handleOpenEdit(addr)}
                  className="inline-flex items-center gap-1 text-[#386641] hover:underline font-semibold"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit
                </button>
                <button
                  onClick={() => deleteMutation.mutate(addr.id)}
                  className="inline-flex items-center gap-1 text-slate-400 hover:text-rose-600 font-semibold"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
