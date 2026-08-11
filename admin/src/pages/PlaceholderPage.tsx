import React from 'react';

interface PlaceholderProps {
  title: string;
  description: string;
}

export const PlaceholderPage: React.FC<PlaceholderProps> = ({ title, description }) => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h1>
        <p className="text-xs text-slate-500 mt-1">{description}</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center max-w-lg mx-auto space-y-4 shadow-xs">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto text-sm font-bold">
          PH5
        </div>
        <h3 className="text-base font-bold text-slate-900">Coming in Next Phase</h3>
        <p className="text-xs text-slate-500 leading-relaxed font-light">
          This administrative section will become active when its backend order processing and reporting modules are fully integrated in subsequent phases.
        </p>
      </div>
    </div>
  );
};
