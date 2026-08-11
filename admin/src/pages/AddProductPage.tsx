import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, AlertCircle, Package, DollarSign, Layers, Sun, Image as ImageIcon } from 'lucide-react';
import { useCreateProduct } from '../hooks/useAdminProducts';
import { useAdminCategories } from '../hooks/useAdminCategories';

export const AddProductPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: categories } = useAdminCategories();
  const createMutation = useCreateProduct();

  const [name, setName] = useState('');
  const [botanicalName, setBotanicalName] = useState('');
  const [sku, setSku] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [salePrice, setSalePrice] = useState<number | ''>('');
  const [stockQuantity, setStockQuantity] = useState<number | ''>(10);
  const [lowStockThreshold, setLowStockThreshold] = useState<number | ''>(5);
  const [sunlight, setSunlight] = useState('Bright Indirect');
  const [watering, setWatering] = useState('When topsoil dries');
  const [careLevel, setCareLevel] = useState('Beginner');
  const [plantSize, setPlantSize] = useState('Medium');
  const [imageUrl, setImageUrl] = useState('');
  const [published, setPublished] = useState(true);
  const [featured, setFeatured] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (price === '' || price < 0) {
      setErrorMsg('Price must be greater than or equal to 0');
      return;
    }

    if (salePrice !== '' && salePrice !== null && salePrice > (price as number)) {
      setErrorMsg('Sale price cannot be greater than regular price');
      return;
    }

    if (stockQuantity === '' || stockQuantity < 0) {
      setErrorMsg('Stock quantity cannot be negative');
      return;
    }

    if (!categoryId) {
      setErrorMsg('Please select a category');
      return;
    }

    try {
      await createMutation.mutateAsync({
        name,
        botanicalName: botanicalName || undefined,
        sku,
        categoryId,
        shortDescription: shortDescription || undefined,
        description,
        price: Number(price),
        salePrice: salePrice !== '' ? Number(salePrice) : null,
        stockQuantity: Number(stockQuantity),
        lowStockThreshold: Number(lowStockThreshold),
        sunlight,
        watering,
        careLevel,
        plantSize,
        imageUrl: imageUrl || undefined,
        published,
        featured,
      });

      navigate('/products');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to create product.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link to="/products" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-600 mb-2">
            <ArrowLeft className="w-4 h-4" /> Back to Products
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Add New Product</h1>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Section 1: Basic Information */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-slate-900 font-bold text-sm">
            <Package className="w-4 h-4 text-emerald-600" />
            <h2>Product Specification</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">Product Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Monstera Deliciosa"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">Botanical Name (Scientific)</label>
              <input
                type="text"
                value={botanicalName}
                onChange={(e) => setBotanicalName(e.target.value)}
                placeholder="e.g. Monstera deliciosa Liebm."
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-500 font-italic"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">SKU (Unique Code) *</label>
              <input
                type="text"
                required
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="e.g. MONSTERA-DEL-01"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">Category *</label>
              <select
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-500"
              >
                <option value="">Select Category</option>
                {categories?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-700">Short Summary</label>
            <input
              type="text"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="Brief tagline for product cards"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-700">Full Botanical Description *</label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed description of foliage, growth habits, origin, and care requirements..."
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Section 2: Pricing & Inventory */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-slate-900 font-bold text-sm">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <h2>Pricing (₹ INR)</h2>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700">Regular Price (₹) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="1"
                  value={price}
                  onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="899"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-500 font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700">Discounted Sale Price (₹ Optional)</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={salePrice}
                  onChange={(e) => setSalePrice(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="749"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-500 font-semibold text-emerald-600"
                />
                <p className="text-[10px] text-slate-400">Must be less than or equal to regular price.</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-slate-900 font-bold text-sm">
              <Layers className="w-4 h-4 text-emerald-600" />
              <h2>Inventory Control</h2>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700">Available Stock Quantity *</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="10"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-500 font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700">Low Stock Alert Threshold</label>
                <input
                  type="number"
                  min="0"
                  value={lowStockThreshold}
                  onChange={(e) => setLowStockThreshold(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="5"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Care Information & Image */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-slate-900 font-bold text-sm">
            <Sun className="w-4 h-4 text-emerald-600" />
            <h2>Botanical Care &amp; Media</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">Sunlight</label>
              <input
                type="text"
                value={sunlight}
                onChange={(e) => setSunlight(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">Watering</label>
              <input
                type="text"
                value={watering}
                onChange={(e) => setWatering(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">Care Level</label>
              <input
                type="text"
                value={careLevel}
                onChange={(e) => setCareLevel(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">Plant Size</label>
              <input
                type="text"
                value={plantSize}
                onChange={(e) => setPlantSize(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="space-y-1 pt-2">
            <label className="block text-xs font-medium text-slate-700">Product Image URL</label>
            <div className="relative">
              <ImageIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/photo-1614594975525-e45190c55d0b"
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Publishing Toggles */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-900">
              <input
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span>Publish Immediately to Customer Website</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-900">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500"
              />
              <span>Mark as Featured Product</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={createMutation.isPending}
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md transition-all hover:scale-102 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{createMutation.isPending ? 'Saving Product...' : 'Save & Publish Product'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
