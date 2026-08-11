import React from 'react';
import { businessData } from '../../data/business';
import { MessageSquare, MapPin, Leaf, ArrowUp } from 'lucide-react';

export const FinalCTA: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="relative z-30 bg-[#f4f1ea] border-t border-emerald-900/10 pt-24 pb-12 px-4 sm:px-6 lg:px-8 text-[#0f2d21]">
      <div className="max-w-7xl mx-auto text-center space-y-12">
        
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="w-12 h-12 rounded-full bg-emerald-100/80 border border-emerald-300/60 flex items-center justify-center text-[#386641] mx-auto shadow-xs">
            <Leaf className="w-6 h-6" />
          </div>

          <h2 className="font-playfair text-2xl sm:text-4xl italic text-[#386641]">
            "Your greener space starts here."
          </h2>

          <h1 className="font-cinzel text-4xl sm:text-6xl font-bold tracking-wider text-[#0f2d21]">
            SHEENEEKA <span className="text-[#386641]">NURSERY</span>
          </h1>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => scrollToSection('visit-us')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#386641] hover:bg-[#2d5234] text-white font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-natural transition-all hover:scale-105"
            >
              <MapPin className="w-4 h-4" />
              <span>Visit Us</span>
            </button>

            <a
              href={`https://wa.me/${businessData.whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-8 py-3.5 rounded-full border border-[#386641] bg-white hover:bg-emerald-50 text-[#0f2d21] font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all hover:scale-105"
            >
              <MessageSquare className="w-4 h-4 text-[#386641]" />
              <span>WhatsApp Us</span>
            </a>
          </div>
        </div>

        <div className="pt-12 border-t border-emerald-900/10 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-[#4a6055]">
          <div>
            <p className="font-light">
              © {new Date().getFullYear()} {businessData.name}. All rights reserved.
            </p>
          </div>

          <div className="flex items-center gap-6 font-semibold uppercase tracking-wider text-[#0f2d21]">
            <button onClick={() => scrollToSection('plant-catalog')} className="hover:text-[#386641]">
              Plants
            </button>
            <button onClick={() => scrollToSection('why-sheeneeka')} className="hover:text-[#386641]">
              About
            </button>
            <button onClick={() => scrollToSection('nursery-gallery')} className="hover:text-[#386641]">
              Gallery
            </button>
            <button onClick={() => scrollToSection('visit-us')} className="hover:text-[#386641]">
              Visit Location
            </button>
          </div>

          <button
            onClick={scrollToTop}
            className="p-2.5 rounded-full bg-white hover:bg-emerald-50 border border-emerald-900/10 text-[#386641] shadow-xs transition-colors flex items-center gap-1.5"
            title="Back to top"
          >
            <ArrowUp className="w-4 h-4" />
            <span className="hidden sm:inline text-[10px] font-bold">TOP</span>
          </button>
        </div>

      </div>
    </footer>
  );
};
