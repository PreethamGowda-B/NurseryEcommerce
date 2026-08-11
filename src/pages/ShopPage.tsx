import React from 'react';
import { Navbar } from '../components/navigation/Navbar';
import { PlantCatalogSection } from '../components/plants/PlantCatalogSection';
import { FinalCTA } from '../components/footer/FinalCTA';

export const ShopPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#0f2d21] pt-24">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="font-cinzel text-3xl font-bold text-[#0f2d21] mb-2">
          Botanical <span className="text-[#386641] italic font-playfair font-normal">Collection</span>
        </h1>
        <p className="text-slate-600 text-sm mb-6 font-light">
          Browse our complete catalog of healthy nursery plants, trees, pots, and organic gardening supplies.
        </p>
      </div>
      <PlantCatalogSection />
      <FinalCTA />
    </div>
  );
};
