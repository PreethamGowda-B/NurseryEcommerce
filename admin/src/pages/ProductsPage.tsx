import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle,
  AlertTriangle,
  Star,
  RefreshCw,
} from 'lucide-react';
import { useAdminProducts, useUpdateProduct, useDeleteProduct, AdminProduct } from '../hooks/useAdminProducts';
import { useAdminCategories } from '../hooks/useAdminCategories';

export const ProductsPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [page, setPage] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: categories } = useAdminCategories();
  const { data: productsData, isLoading, isError, refetch } = useAdminProducts({
    page,
    limit: 15,
    search: search || undefined,
    categoryId: selectedCategory || undefined,
  });

  const updateProductMutation = useUpdateProduct();
  const deleteProductMutation = useDeleteProduct();

  const handleTogglePublish = async (product: AdminProduct) => {
    await updateProductMutation.mutateAsync({
      id: product.id,
      data: { published: !product.published },
    });
  };

  const handleToggleFeatured = async (product: AdminProduct) => {
    await updateProductMutation.mutateAsync({
      id: product.id,
      data: { featured: !product.featured },
    });
  };

  const handleDelete = async (id: string) => {
    await deleteProductMutation.mutateAsync(id);
    setDeletingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Product Catalogue</h1>
          <p className="text-xs text-slate-500 mt-1">Manage plant inventory, pricing, stock levels, and publication status.</p>
        </div>

        <Link
          to="/products/new"
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </Link>
      </div>

      {/* Filters & Search */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, SKU, species..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(1);
            }}
            className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-emerald-500"
          >
            <option value="">All Categories</option>
            {categories?.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => refetch()}
            className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs flex items-center gap-1 font-medium"
            title="Refresh List"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Product Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-500 animate-pulse">Loading products database...</div>
        ) : isError ? (
          <div className="p-8 text-center text-xs text-rose-500">Failed to load product catalogue.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                  <th className="py-3.5 px-4">Product</th>
                  <th className="py-3.5 px-4">SKU</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Stock</th>
                  <th className="py-3.5 px-4 text-center">Featured</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {productsData?.data?.map((p: AdminProduct) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    
                    {/* Product Name & Image */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.images?.[0]?.url || 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=200&q=80'}
                          alt={p.name}
                          className="w-10 h-10 rounded-lg object-cover bg-slate-100 flex-shrink-0"
                        />
                        <div>
                          <Link to={`/products/${p.id}/edit`} className="font-semibold text-slate-900 hover:text-emerald-600 transition-colors">
                            {p.name}
                          </Link>
                          {p.botanicalName && (
                            <span className="block text-[10px] text-slate-400 italic">{p.botanicalName}</span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* SKU */}
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">{p.sku}</td>

                    {/* Category */}
                    <td className="py-3.5 px-4">{p.category?.name || '—'}</td>

                    {/* Pricing */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">₹{p.salePrice ?? p.price}</div>
                      {p.salePrice && <div className="text-[10px] text-slate-400 line-through">₹{p.price}</div>}
                    </td>

                    {/* Stock */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          p.stockQuantity > 5
                            ? 'bg-emerald-100 text-emerald-800'
                            : p.stockQuantity > 0
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {p.stockQuantity <= 5 && p.stockQuantity > 0 && <AlertTriangle className="w-3 h-3" />}
                        {p.stockQuantity} units
                      </span>
                    </td>

                    {/* Featured */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleToggleFeatured(p)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          p.featured ? 'text-amber-500 bg-amber-50' : 'text-slate-300 hover:text-amber-400'
                        }`}
                        title={p.featured ? 'Featured on Storefront' : 'Mark as Featured'}
                      >
                        <Star className="w-4 h-4 fill-current" />
                      </button>
                    </td>

                    {/* Status Toggle */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleTogglePublish(p)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                          p.published
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                        }`}
                      >
                        {p.published ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        <span>{p.published ? 'Published' : 'Hidden'}</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <Link
                        to={`/products/${p.id}/edit`}
                        className="inline-flex p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-slate-100 transition-colors"
                        title="Edit Product Specs"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Link>

                      <button
                        onClick={() => setDeletingId(p.id)}
                        className="inline-flex p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete or Archive Product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>

            {productsData?.data?.length === 0 && (
              <div className="p-12 text-center text-slate-500 space-y-2">
                <Package className="w-8 h-8 mx-auto text-slate-300" />
                <p className="font-semibold text-xs">No products found matching filters.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 text-center shadow-xl">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Confirm Product Removal</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              If this product is linked to existing customer orders, it will be safely archived and unpublished rather than deleted.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deletingId)}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold"
              >
                Proceed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
