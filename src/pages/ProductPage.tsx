import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { plantCatalog as fallbackPlants, generateWhatsAppInquiryUrl, PlantItem } from '../data/plants';
import { businessData } from '../data/business';
import { Navbar } from '../components/navigation/Navbar';
import { FinalCTA } from '../components/footer/FinalCTA';
import { Sun, Droplets, Shield, MessageSquare, ShoppingBag, ArrowLeft, Leaf } from 'lucide-react';
import { useCartStore } from '../features/cart/cartStore';
import { useProduct } from '../hooks/useProducts';

export const ProductPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const addItem = useCartStore((state) => state.addItem);
  const [added, setAdded] = useState(false);

  // Fetch product from API
  const { data: apiProduct, isLoading, isError } = useProduct(slug || '');

  // Fallback if API offline or errors out
  const fallbackPlant = fallbackPlants.find((p) => p.id === slug) || fallbackPlants[0];

  const plant: PlantItem = apiProduct
    ? {
        id: apiProduct.slug,
        name: apiProduct.name,
        botanicalName: apiProduct.botanicalName || '',
        categoryId: apiProduct.category.slug,
        categoryName: apiProduct.category.name,
        sunlight: (apiProduct.sunlight as any) || 'Indirect Light',
        watering: (apiProduct.watering as any) || 'When topsoil dries',
        careLevel: (apiProduct.careLevel as any) || 'Beginner',
        description: apiProduct.description,
        image: apiProduct.images?.[0]?.url || fallbackPlant.image,
        price: apiProduct.price,
        salePrice: apiProduct.salePrice || undefined,
        isPopular: apiProduct.featured,
      }
    : fallbackPlant;

  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#0f2d21] pt-28">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#386641] hover:underline mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Store
        </Link>

        {isLoading ? (
          <div className="bg-white border border-emerald-900/10 rounded-3xl p-12 animate-pulse grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="h-96 bg-slate-200 rounded-2xl" />
            <div className="space-y-4">
              <div className="h-6 bg-slate-200 rounded w-1/3" />
              <div className="h-10 bg-slate-200 rounded w-3/4" />
              <div className="h-4 bg-slate-200 rounded w-1/2" />
              <div className="h-24 bg-slate-200 rounded w-full" />
            </div>
          </div>
        ) : isError && !apiProduct && !fallbackPlant ? (
          <div className="bg-white border border-emerald-900/10 rounded-3xl p-12 text-center space-y-4">
            <Leaf className="w-12 h-12 text-[#386641] mx-auto" />
            <h2 className="font-cinzel text-2xl font-bold">Product Not Found</h2>
            <p className="text-slate-500 text-xs">The requested plant specimen is currently unavailable.</p>
            <Link to="/" className="inline-block px-6 py-2.5 rounded-full bg-[#386641] text-white text-xs font-semibold">
              Return to Catalog
            </Link>
          </div>
        ) : (
          <div className="space-y-12">
            <div className="bg-white border border-emerald-900/10 rounded-3xl overflow-hidden shadow-natural-lg grid grid-cols-1 md:grid-cols-2">
              {/* Image */}
              <div className="h-96 md:h-full bg-slate-100 min-h-[400px]">
                <img
                  src={plant.image}
                  alt={plant.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Details */}
              <div className="p-8 sm:p-12 space-y-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/80 text-[#386641] text-[10px] font-bold uppercase tracking-widest">
                    <span>{plant.categoryName}</span>
                  </div>
                  <h1 className="font-cinzel text-3xl sm:text-4xl font-bold text-[#0f2d21]">
                    {plant.name}
                  </h1>
                  <p className="font-playfair text-lg italic text-[#386641]">
                    {plant.botanicalName}
                  </p>
                  <p className="text-[#3a5246] text-sm leading-relaxed font-light">
                    {plant.description}
                  </p>

                  {/* Specs */}
                  <div className="grid grid-cols-3 gap-3 pt-4 border-t border-emerald-900/10 text-xs">
                    <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100 space-y-1">
                      <Sun className="w-4 h-4 text-amber-500" />
                      <span className="block font-semibold text-[#0f2d21]">Sunlight</span>
                      <span className="block text-[11px] text-slate-500">{plant.sunlight}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100 space-y-1">
                      <Droplets className="w-4 h-4 text-cyan-600" />
                      <span className="block font-semibold text-[#0f2d21]">Watering</span>
                      <span className="block text-[11px] text-slate-500">{plant.watering}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100 space-y-1">
                      <Shield className="w-4 h-4 text-[#386641]" />
                      <span className="block font-semibold text-[#0f2d21]">Care Level</span>
                      <span className="block text-[11px] text-slate-500">{plant.careLevel}</span>
                    </div>
                  </div>
                </div>

                {/* Pricing & CTA */}
                <div className="pt-6 border-t border-emerald-900/10 space-y-4">
                  <div className="flex items-baseline gap-3">
                    <span className="font-cinzel text-3xl font-bold text-[#0f2d21]">
                      ₹{plant.salePrice ?? plant.price}
                    </span>
                    {plant.salePrice && (
                      <span className="text-sm text-slate-400 line-through">
                        ₹{plant.price}
                      </span>
                    )}
                    {plant.salePrice && (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                        SAVE ₹{plant.price - plant.salePrice}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        addItem(plant);
                        setAdded(true);
                        setTimeout(() => setAdded(false), 2000);
                      }}
                      className="flex-1 py-3.5 px-6 rounded-full bg-[#386641] hover:bg-[#2d5234] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-natural transition-all hover:scale-102"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>{added ? 'Added to Cart!' : 'Add to Cart'}</span>
                    </button>

                    <a
                      href={generateWhatsAppInquiryUrl(plant.name, businessData.whatsappNumber)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-3.5 px-6 rounded-full border border-[#386641] text-[#386641] hover:bg-emerald-50 font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:scale-102"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Enquire</span>
                    </a>
                  </div>
                </div>

              </div>
            </div>

            {/* Related Products */}
            {apiProduct?.relatedProducts && apiProduct.relatedProducts.length > 0 && (
              <div className="space-y-6 pt-6">
                <h3 className="font-cinzel text-2xl font-bold text-[#0f2d21]">
                  Similar <span className="text-[#386641] italic font-playfair font-normal">Specimens</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {apiProduct.relatedProducts.map((rp) => (
                    <Link
                      key={rp.id}
                      to={`/plants/${rp.slug}`}
                      className="bg-white border border-emerald-900/10 rounded-2xl p-4 space-y-3 hover:border-[#386641] transition-all group block shadow-natural"
                    >
                      <div className="h-44 bg-slate-100 rounded-xl overflow-hidden">
                        <img
                          src={rp.images?.[0]?.url || 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=800&q=80'}
                          alt={rp.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <div>
                        <h4 className="font-cinzel font-bold text-sm text-[#0f2d21] group-hover:text-[#386641]">{rp.name}</h4>
                        <p className="font-playfair text-xs italic text-[#386641]">{rp.botanicalName}</p>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="font-semibold text-sm text-[#0f2d21]">₹{rp.salePrice ?? rp.price}</span>
                        {rp.salePrice && <span className="text-xs text-slate-400 line-through">₹{rp.price}</span>}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <FinalCTA />
    </div>
  );
};
