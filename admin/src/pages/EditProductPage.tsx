import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, AlertCircle, Package, DollarSign, Layers, Sun, Image as ImageIcon } from 'lucide-react';
import { useAdminProduct, useUpdateProduct } from '../hooks/useAdminProducts';
import { useAdminCategories } from '../hooks/useAdminCategories';

export const EditProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: product, isLoading, isError } = useAdminProduct(id || '');
  const { data: categories } = useAdminCategories();
  const updateMutation = useUpdateProduct();

  const [name, setName] = useState('');
  const [botanicalName, setBotanicalName] = useState('');
  const [sku, setSku] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [salePrice, setSalePrice] = useState<number | ''>('');
  const [stockQuantity, setStockQuantity] = useState<number | ''>(0);
  const [lowStockThreshold, setLowStockThreshold] = useState<number | ''>(5);
  const [sunlight, setSunlight] = useState('');
  const [watering, setWatering] = useState('');
  const [careLevel, setCareLevel] = useState('');
  const [plantSize, setPlantSize] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [published, setPublished] = useState(true);
  const [featured, setFeatured] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (product) {
      setName(product.name || '');
      setBotanicalName(product.botanicalName || '');
      setSku(product.sku || '');
      setCategoryId(product.categoryId || '');
      setShortDescription(product.shortDescription || '');
      setDescription(product.description || '');
      setPrice(product.price ?? '');
      setSalePrice(product.salePrice ?? '');
      setStockQuantity(product.stockQuantity ?? 0);
      setLowStockThreshold(product.lowStockThreshold ?? 5);
      setSunlight(product.sunlight || '');
      setWatering(product.watering || '');
      setCareLevel(product.careLevel || '');
      setPlantSize(product.plantSize || '');
      setImageUrl(product.images?.[0]?.url || '');
      setPublished(product.published ?? true);
      setFeatured(product.featured ?? false);
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
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

    try {
      await updateMutation.mutateAsync({
        id,
        data: {
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
        },
      });

      navigate('/products');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to update product.');
    }
  };

  if (isLoading) {
    return <div className="p-12 text-center text-xs text-slate-500 animate-pulse">Loading product specifications...</div>;
  }

  if (isError || !product) {
    return <div className="p-12 text-center text-xs text-rose-500">Product not found.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link to="/products" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-600 mb-2">
            <ArrowLeft className="w-4 h-4" /> Back to Products
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Edit Product: {product.name}</h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">ID: {product.id} • SKU: {product.sku}</p>
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
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">Botanical Name (Scientific)</label>
              <input
                type="text"
                value={botanicalName}
                onChange={(e) => setBotanicalName(e.target.value)}
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
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-500 font-semibold text-emerald-600"
                />
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
              <span>Published on Storefront</span>
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
            disabled={updateMutation.isPending}
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md transition-all hover:scale-102 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{updateMutation.isPending ? 'Updating Product...' : 'Update Product'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
