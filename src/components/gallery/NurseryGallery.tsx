import React, { useState } from 'react';
import { galleryItems, GalleryItem } from '../../data/gallery';
import { Maximize2, X, Leaf } from 'lucide-react';

export const NurseryGallery: React.FC = () => {
  const [activeLightbox, setActiveLightbox] = useState<GalleryItem | null>(null);

  return (
    <section id="nursery-gallery" className="relative z-30 bg-[#f4f1ea] py-24 px-4 sm:px-6 lg:px-8 border-t border-emerald-900/10">
      <div className="max-w-7xl mx-auto">
        
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-emerald-100/80 text-[#386641] text-[11px] font-bold uppercase tracking-widest">
            <Leaf className="w-3.5 h-3.5 text-[#386641]" />
            <span>NURSERY ATMOSPHERE & FOLIAGE</span>
          </div>
          <h2 className="font-cinzel text-3xl sm:text-5xl font-bold text-[#0f2d21] tracking-wide">
            Editorial <span className="text-[#386641] italic font-playfair font-normal">Nursery Gallery</span>
          </h2>
          <p className="text-[#3a5246] text-base sm:text-lg font-light leading-relaxed">
            A visual showcase of our physical nursery grounds, architectural plant stock, handcrafted ceramic planters, and garden installations.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleryItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setActiveLightbox(item)}
              className="group relative h-80 rounded-2xl overflow-hidden bg-white border border-emerald-900/10 cursor-pointer shadow-natural"
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                loading="lazy"
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f2d21]/80 via-transparent to-transparent opacity-70 group-hover:opacity-90 transition-opacity" />

              <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between text-white">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-300">
                    {item.category}
                  </span>
                  <h3 className="font-cinzel text-lg font-bold">
                    {item.title}
                  </h3>
                </div>

                <div className="w-9 h-9 rounded-full bg-white/90 text-[#386641] flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                  <Maximize2 className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {activeLightbox && (
        <div
          onClick={() => setActiveLightbox(null)}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
        >
          <button
            onClick={() => setActiveLightbox(null)}
            className="absolute top-6 right-6 p-3 rounded-full bg-white text-slate-800 hover:text-black shadow-md"
          >
            <X className="w-6 h-6" />
          </button>

          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-4xl w-full bg-white border border-emerald-900/10 rounded-3xl overflow-hidden shadow-natural-lg text-[#0f2d21]"
          >
            <img
              src={activeLightbox.image}
              alt={activeLightbox.title}
              className="w-full max-h-[75vh] object-cover"
            />
            <div className="p-6 flex items-center justify-between">
              <div>
                <span className="text-xs uppercase font-bold text-[#386641] tracking-wider">
                  {activeLightbox.category}
                </span>
                <h3 className="font-cinzel text-xl font-bold text-[#0f2d21]">
                  {activeLightbox.title}
                </h3>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
