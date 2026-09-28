import React from 'react';
import { Truck, Volume2, VolumeX, Sparkles, RefreshCw } from 'lucide-react';
import { soundEngine } from '../utils/audio';

interface HeaderNavProps {
  onReset: () => void;
  brandTitle: string;
  onBrandChange: (name: string) => void;
  isLoggedIn: boolean;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  onReset,
  brandTitle,
  onBrandChange,
  isLoggedIn,
}) => {
  return (
    <header className="w-full bg-[#0a0f1d]/90 border-b border-slate-800/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Truck className="w-4 h-4" />
          </div>
          <span className="text-base font-extrabold tracking-tight text-white uppercase font-mono">
            TRUCK LOGIN
          </span>
        </div>

        {/* Zone 2: Navigation & Preset Brand Themes */}
        <div className="hidden md:flex items-center gap-2 bg-slate-900/60 p-1 rounded-lg border border-slate-800">
          <span className="text-xs text-slate-400 px-2 font-medium">Van Label:</span>
          {['priyoshop', 'CODING WITH ME', 'FASTLOGIX'].map((title) => (
            <button
              key={title}
              onClick={() => onBrandChange(title)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                brandTitle === title
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              {title}
            </button>
          ))}
        </div>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 rounded-lg text-xs font-semibold transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="whitespace-nowrap">{isLoggedIn ? 'Sign Out & Return Van' : 'Replay Entrance'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
