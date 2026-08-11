import React from 'react';
import { whyUsData } from '../../data/whyUs';
import { Sprout, ShieldCheck, Compass, Sparkles, Leaf } from 'lucide-react';

const iconMap: Record<string, React.ReactNode> = {
  Sprout: <Sprout className="w-6 h-6 text-[#386641]" />,
  ShieldCheck: <ShieldCheck className="w-6 h-6 text-[#386641]" />,
  Compass: <Compass className="w-6 h-6 text-[#386641]" />,
  Sparkles: <Sparkles className="w-6 h-6 text-[#386641]" />,
};

export const WhySheeneeka: React.FC = () => {
  return (
    <section id="why-sheeneeka" className="relative z-30 bg-[#faf9f6] py-24 px-4 sm:px-6 lg:px-8 border-t border-emerald-900/10">
      <div className="max-w-7xl mx-auto">
        
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-emerald-100/80 text-[#386641] text-[11px] font-bold uppercase tracking-widest">
            <Leaf className="w-3.5 h-3.5 text-[#386641]" />
            <span>NURSERY STRENGTHS & CRAFTSMANSHIP</span>
          </div>
          <h2 className="font-cinzel text-3xl sm:text-5xl font-bold text-[#0f2d21] tracking-wide">
            Why <span className="text-[#386641] italic font-playfair font-normal">Sheeneeka Nursery</span>
          </h2>
          <p className="text-[#3a5246] text-base sm:text-lg font-light leading-relaxed">
            We prioritize plant health, species variety, organic soil blends, and expert care guidance to help your greenery thrive effortlessly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {whyUsData.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-emerald-900/10 hover:border-[#386641]/40 p-8 rounded-2xl space-y-4 transition-all duration-300 hover:-translate-y-1 shadow-natural flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center shadow-xs">
                  {iconMap[item.iconName] || <Sprout className="w-6 h-6 text-[#386641]" />}
                </div>

                <h3 className="font-cinzel text-xl font-bold text-[#0f2d21]">
                  {item.title}
                </h3>

                <p className="text-[#4a6055] text-xs leading-relaxed font-light">
                  {item.description}
                </p>
              </div>

              {item.isPlaceholderNote && (
                <span className="text-[10px] text-[#386641]/80 italic block pt-2 border-t border-emerald-900/10">
                  *{item.isPlaceholderNote}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
