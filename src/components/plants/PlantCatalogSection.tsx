import React, { useState } from 'react';
import { plantCatalog as fallbackPlants, generateWhatsAppInquiryUrl, PlantItem } from '../../data/plants';
import { plantCategories as fallbackCategories } from '../../data/categories';
import { businessData } from '../../data/business';
import { Sun, Droplets, Shield, MessageSquare, Search, Leaf, X, ShoppingBag, RefreshCw } from 'lucide-react';
import { useCartStore } from '../../features/cart/cartStore';
import { useCategories, useProducts, ApiProduct } from '../../hooks/useProducts';
import { Link } from 'react-router-dom';

export const PlantCatalogSection: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeModalPlant, setActiveModalPlant] = useState<PlantItem | null>(null);
  const [addedToastPlant, setAddedToastPlant] = useState<string | null>(null);
  const addItem = useCartStore((state) => state.addItem);

  // Fetch API categories
  const { data: apiCategories, isLoading: categoriesLoading } = useCategories();

  // Fetch API products
  const {
    data: apiProductsData,
    isLoading: productsLoading,
    isError,
    refetch,
  } = useProducts({
    category: selectedCategory !== 'all' ? selectedCategory : undefined,
    search: searchQuery ? searchQuery : undefined,
  });

  // Use API categories if available, fallback to static categories
  const categoriesList = apiCategories || fallbackCategories;

  // Adapt API products or fall back to filtered static list if API errors out
  let displayPlants: PlantItem[] = [];

  if (apiProductsData?.data) {
    displayPlants = apiProductsData.data.map((p: ApiProduct) => ({
      id: p.slug,
      name: p.name,
      botanicalName: p.botanicalName || '',
      categoryId: p.category.slug,
      categoryName: p.category.name,
      sunlight: (p.sunlight as any) || 'Indirect Light',
      watering: (p.watering as any) || 'When topsoil dries',
      careLevel: (p.careLevel as any) || 'Beginner',
      description: p.description,
      image: p.images?.[0]?.url || 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=800&q=80',
      price: p.price,
      salePrice: p.salePrice || undefined,
      isPopular: p.featured,
    }));
  } else if (isError) {
    // Fallback filter
    displayPlants = fallbackPlants.filter((plant) => {
      const matchesCategory = selectedCategory === 'all' || plant.categoryId === selectedCategory;
      const matchesSearch =
        plant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plant.botanicalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plant.categoryName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }

  const clearFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
  };

  return (
    <section id="plant-catalog" className="relative z-30 bg-[#f4f1ea] py-24 px-4 sm:px-6 lg:px-8 border-t border-emerald-900/10">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-emerald-100/80 text-[#386641] text-[11px] font-bold uppercase tracking-widest">
            <Leaf className="w-3.5 h-3.5 text-[#386641]" />
            <span>EXPLORE OUR COLLECTION</span>
          </div>
          <h2 className="font-cinzel text-3xl sm:text-5xl font-bold text-[#0f2d21] tracking-wide">
            Shop by <span className="text-[#386641] italic font-playfair font-normal">Categories</span>
          </h2>
          <p className="text-[#3a5246] text-base sm:text-lg font-light leading-relaxed">
            Select from our curated variety of healthy indoor flora, outdoor landscaping palms, blooming perennials, and nursery care supplies.
          </p>
        </div>

        {/* Filter Tabs & Search Box */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
          
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-5 py-2.5 rounded-full text-xs font-semibold tracking-wider transition-all ${
                selectedCategory === 'all'
                  ? 'bg-[#386641] text-white shadow-natural'
                  : 'bg-white text-[#0f2d21] hover:bg-emerald-50 border border-emerald-900/10'
              }`}
            >
              All Plants
            </button>

            {categoriesList.map((cat) => (
              <button
                key={cat.slug || cat.id}
                onClick={() => setSelectedCategory(cat.slug || cat.id)}
                className={`px-4 py-2.5 rounded-full text-xs font-semibold tracking-wider transition-all ${
                  selectedCategory === (cat.slug || cat.id)
                    ? 'bg-[#386641] text-white shadow-natural'
                    : 'bg-white text-[#0f2d21] hover:bg-emerald-50 border border-emerald-900/10'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-[#386641] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search plant species..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-emerald-900/15 rounded-full text-xs text-[#0f2d21] placeholder-slate-400 focus:outline-none focus:border-[#386641] shadow-xs transition-colors"
            />
          </div>
        </div>

        {/* API Connection Warning / Offline Retry State */}
        {isError && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between text-xs text-amber-900">
            <span>Showing cached catalog. Unable to connect to Nursery API server.</span>
            <button
              onClick={() => refetch()}
              className="px-3 py-1 rounded-full bg-amber-200 hover:bg-amber-300 font-semibold flex items-center gap-1 text-[11px]"
            >
              <RefreshCw className="w-3 h-3" /> Retry Connection
            </button>
          </div>
        )}

        {/* Loading Skeleton Grid */}
        {productsLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-white border border-emerald-900/10 rounded-2xl p-4 space-y-4 animate-pulse">
                <div className="h-56 bg-slate-200 rounded-xl" />
                <div className="h-4 bg-slate-200 rounded w-3/4" />
                <div className="h-3 bg-slate-200 rounded w-1/2" />
                <div className="h-8 bg-slate-200 rounded-full w-full" />
              </div>
            ))}
          </div>
        )}

        {/* Plants Grid */}
        {!productsLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayPlants.map((plant) => (
              <div
                key={plant.id}
                className="group bg-white border border-emerald-900/10 hover:border-[#386641]/40 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1.5 shadow-natural flex flex-col"
              >
                {/* Image */}
                <Link to={`/plants/${plant.id}`} className="relative h-56 sm:h-64 overflow-hidden bg-slate-100 flex-shrink-0 block">
                  <img
                    src={plant.image}
                    alt={plant.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                  {plant.isPopular && (
                    <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#386641] text-white text-[10px] font-bold uppercase tracking-wider shadow-sm">
                      Featured
                    </span>
                  )}
                  <span className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-[#386641] text-[10px] font-semibold shadow-xs">
                    {plant.categoryName}
                  </span>
                </Link>

                {/* Card Body */}
                <div className="p-5 flex flex-col flex-1">
                  <div className="mb-3">
                    <Link to={`/plants/${plant.id}`}>
                      <h3 className="font-cinzel text-base sm:text-lg font-bold text-[#0f2d21] group-hover:text-[#386641] transition-colors leading-tight">
                        {plant.name}
                      </h3>
                    </Link>
                    <p className="font-playfair text-xs italic text-[#386641] mt-0.5">
                      {plant.botanicalName}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#3a5246] mb-3">
                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-100">
                      <Sun className="w-3 h-3 text-amber-500" />
                      {plant.sunlight}
                    </span>
                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-100">
                      <Droplets className="w-3 h-3 text-cyan-600" />
                      {plant.watering}
                    </span>
                  </div>

                  <p className="text-[#4a6055] text-xs line-clamp-2 font-light leading-relaxed mb-3">
                    {plant.description}
                  </p>

                  {/* Price Display */}
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="font-cinzel text-lg font-bold text-[#0f2d21]">
                      ₹{plant.salePrice ?? plant.price}
                    </span>
                    {plant.salePrice && (
                      <span className="text-xs text-slate-400 line-through">
                        ₹{plant.price}
                      </span>
                    )}
                    {plant.salePrice && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        SAVE ₹{plant.price - plant.salePrice}
                      </span>
                    )}
                  </div>

                  {/* Action strip */}
                  <div className="mt-auto pt-4 border-t border-emerald-900/10 flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-2">
                      <button
                        onClick={() => {
                          addItem(plant);
                          setAddedToastPlant(plant.name);
                          setTimeout(() => setAddedToastPlant(null), 2000);
                        }}
                        className="flex-1 px-3.5 py-2 rounded-full bg-[#386641] hover:bg-[#2d5234] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-all hover:scale-102"
                      >
                        <ShoppingBag className="w-3.5 h-3.5 text-emerald-200" />
                        <span>{addedToastPlant === plant.name ? 'Added!' : 'Add to Cart'}</span>
                      </button>

                      <a
                        href={generateWhatsAppInquiryUrl(plant.name, businessData.whatsappNumber)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-2 rounded-full border border-[#386641] text-[#386641] hover:bg-emerald-50 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all hover:scale-102"
                        title="Enquire on WhatsApp"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Enquire</span>
                      </a>
                    </div>

                    <Link
                      to={`/plants/${plant.id}`}
                      className="text-[11px] text-center text-slate-500 hover:text-[#386641] font-medium underline underline-offset-2 transition-colors pt-1 block"
                    >
                      View Details &amp; Care Specs
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!productsLoading && displayPlants.length === 0 && (
          <div className="text-center py-16 bg-white border border-emerald-900/10 rounded-3xl p-8 space-y-4 shadow-natural">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-[#386641] flex items-center justify-center mx-auto">
              <Leaf className="w-6 h-6" />
            </div>
            <h3 className="font-cinzel text-xl font-bold text-[#0f2d21]">No plants found</h3>
            <p className="text-slate-500 text-xs max-w-sm mx-auto font-light">
              No botanical specimens matched your current search or category filter.
            </p>
            <button
              onClick={clearFilters}
              className="px-6 py-2.5 rounded-full bg-[#386641] text-white font-semibold text-xs transition-all hover:scale-105"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* Detail Modal (fallback or quick view) */}
      {activeModalPlant && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-emerald-900/10 rounded-3xl max-w-2xl w-full overflow-hidden shadow-natural-lg relative animate-in fade-in zoom-in-95 duration-200 text-[#0f2d21]">
            
            <button
              onClick={() => setActiveModalPlant(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 text-slate-600 hover:text-black z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="h-64 md:h-full bg-slate-100">
                <img
                  src={activeModalPlant.image}
                  alt={activeModalPlant.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-6 md:p-8 space-y-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#386641]">
                    {activeModalPlant.categoryName}
                  </span>
                  <h3 className="font-cinzel text-2xl font-bold text-[#0f2d21]">
                    {activeModalPlant.name}
                  </h3>
                  <p className="font-playfair text-sm italic text-[#386641]">
                    {activeModalPlant.botanicalName}
                  </p>
                </div>

                <p className="text-[#4a6055] text-xs md:text-sm leading-relaxed font-light">
                  {activeModalPlant.description}
                </p>

                <div className="space-y-2 pt-2 border-t border-emerald-900/10 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <Sun className="w-4 h-4 text-amber-500" /> Sunlight:
                    </span>
                    <span className="font-semibold text-[#0f2d21]">{activeModalPlant.sunlight}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <Droplets className="w-4 h-4 text-cyan-600" /> Water Need:
                    </span>
                    <span className="font-semibold text-[#0f2d21]">{activeModalPlant.watering}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <Shield className="w-4 h-4 text-[#386641]" /> Care Level:
                    </span>
                    <span className="font-semibold text-[#0f2d21]">{activeModalPlant.careLevel}</span>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between gap-3">
                  <span className="font-cinzel text-lg font-bold text-[#0f2d21]">
                    ₹{activeModalPlant.salePrice ?? activeModalPlant.price}
                  </span>
                  <a
                    href={generateWhatsAppInquiryUrl(activeModalPlant.name, businessData.whatsappNumber)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 rounded-full bg-[#386641] hover:bg-[#2d5234] text-white font-semibold text-xs flex items-center gap-2 shadow-natural transition-all hover:scale-105"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Inquire on WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
