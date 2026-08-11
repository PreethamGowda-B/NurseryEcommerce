import React from 'react';
import { businessData } from '../../data/business';
import { MapPin, Phone, MessageSquare, Clock, Navigation, Leaf } from 'lucide-react';

export const VisitUsSection: React.FC = () => {
  return (
    <section id="visit-us" className="relative z-30 bg-[#faf9f6] py-24 px-4 sm:px-6 lg:px-8 border-t border-emerald-900/10">
      <div className="max-w-7xl mx-auto">
        
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-emerald-100/80 text-[#386641] text-[11px] font-bold uppercase tracking-widest">
            <Leaf className="w-3.5 h-3.5 text-[#386641]" />
            <span>PHYSICAL NURSERY LOCATION & HOURS</span>
          </div>
          <h2 className="font-cinzel text-3xl sm:text-5xl font-bold text-[#0f2d21] tracking-wide">
            Visit <span className="text-[#386641] italic font-playfair font-normal">Sheeneeka Nursery</span>
          </h2>
          <p className="text-[#3a5246] text-base sm:text-lg font-light leading-relaxed">
            Come explore our physical botanical grounds in person. Walk through our shaded plant canopies and consult with our plant care specialists.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          <div className="lg:col-span-5 bg-white border border-emerald-900/10 p-8 rounded-3xl space-y-8 shadow-natural-lg flex flex-col justify-between text-[#0f2d21]">
            <div className="space-y-6">
              
              <div>
                <h3 className="font-cinzel text-2xl font-bold text-[#0f2d21] mb-1">
                  {businessData.name}
                </h3>
                <p className="text-xs text-[#386641] font-semibold tracking-wide">
                  {businessData.tagline}
                </p>
              </div>

              {/* Address */}
              <div className="flex items-start gap-4 text-sm">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center shrink-0 text-[#386641]">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-semibold text-[#0f2d21] block mb-0.5">Address</span>
                  <p className="text-xs font-light text-[#4a6055] leading-relaxed">
                    {businessData.address}, {businessData.city}, {businessData.state} - {businessData.pincode}
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-4 text-sm">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center shrink-0 text-[#386641]">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-semibold text-[#0f2d21] block mb-0.5">Phone Call</span>
                  <a href={`tel:${businessData.phoneRaw}`} className="text-xs font-semibold text-[#386641] hover:underline">
                    {businessData.phone}
                  </a>
                </div>
              </div>

              {/* WhatsApp */}
              <div className="flex items-start gap-4 text-sm">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center shrink-0 text-[#386641]">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-semibold text-[#0f2d21] block mb-0.5">WhatsApp Inquiry</span>
                  <a
                    href={`https://wa.me/${businessData.whatsappNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-[#386641] hover:underline"
                  >
                    {businessData.whatsappFormatted}
                  </a>
                </div>
              </div>

              {/* Hours */}
              <div className="flex items-start gap-4 text-sm">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center shrink-0 text-[#386641]">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-semibold text-[#0f2d21] block mb-0.5">Opening Hours</span>
                  <p className="text-xs font-light text-[#4a6055]">Mon - Fri: {businessData.openingHours.weekdays}</p>
                  <p className="text-xs font-light text-[#4a6055]">Sat - Sun: {businessData.openingHours.weekends}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-6 border-t border-emerald-900/10">
              <a
                href={businessData.googleMapsDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 rounded-full bg-[#386641] hover:bg-[#2d5234] text-white font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-natural transition-all"
              >
                <Navigation className="w-4 h-4" />
                <span>Get Directions</span>
              </a>

              <div className="grid grid-cols-2 gap-3">
                <a
                  href={`https://wa.me/${businessData.whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 rounded-full border border-[#386641] text-[#386641] hover:bg-emerald-50 text-xs font-semibold text-center flex items-center justify-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
                <a
                  href={`tel:${businessData.phoneRaw}`}
                  className="py-3 rounded-full border border-[#386641] text-[#386641] hover:bg-emerald-50 text-xs font-semibold text-center flex items-center justify-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Now</span>
                </a>
              </div>

              {businessData.isPlaceholder && (
                <p className="text-[10px] text-slate-400 italic text-center pt-2">
                  *Address & map URL will be updated with actual nursery pin upon launch.
                </p>
              )}
            </div>
          </div>

          <div className="lg:col-span-7 bg-white rounded-3xl overflow-hidden border border-emerald-900/10 min-h-[420px] shadow-natural-lg relative">
            <iframe
              src={businessData.googleMapsEmbedUrl}
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: '420px' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Sheeneeka Nursery Location Map"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
