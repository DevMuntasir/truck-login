import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  RotateCcw, 
  Package, 
  Gauge, 
  Thermometer, 
  CheckCircle2, 
  Radio
} from 'lucide-react';
import { soundEngine } from '../utils/audio';

interface FleetDashboardProps {
  onRecallTruck: () => void;
  driverName?: string;
  truckColor?: string;
}

export const FleetDashboard: React.FC<FleetDashboardProps> = ({
  onRecallTruck,
  driverName = 'driver@priyoshop.com',
  truckColor = '#e11d48',
}) => {
  const [speed, setSpeed] = useState(68);
  const [progress, setProgress] = useState(24);
  const [cargoTemp] = useState(38.2);

  // Dynamic telemetry simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setSpeed(prev => Math.min(75, Math.max(62, prev + (Math.random() * 4 - 2))));
      setProgress(prev => (prev >= 98 ? 15 : prev + 0.4));
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const handleRecall = () => {
    soundEngine.playHorn();
    onRecallTruck();
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 animate-fade-in text-slate-100">
      {/* Top Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-md mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center gap-4">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg border border-white/20"
              style={{ backgroundColor: truckColor === '#FFFFFF' ? '#2563eb' : truckColor }}
            >
              <Truck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight text-white">
                  Mission Active: Route #FR-9042
                </h2>
                <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  IN TRANSIT
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-0.5">
                Authenticated Driver: <span className="text-slate-200 font-medium">{driverName}</span> · Vehicle ID: <span className="font-mono text-slate-300">TRK-8802</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRecall}
              className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm rounded-xl transition-all shadow-lg hover:shadow-amber-500/20 active:scale-95 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Call Back Truck / Sign Out</span>
            </button>
          </div>
        </div>

        {/* Route Progress Visualizer */}
        <div className="pt-6">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <div className="flex items-center gap-1.5 text-slate-200">
              <MapPin className="w-3.5 h-3.5 text-blue-400" />
              <span className="font-medium">San Francisco Logistics Hub</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-200">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-medium">Seattle Distribution Depot</span>
            </div>
          </div>

          {/* Progress bar with animated truck */}
          <div className="relative w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 mt-2 font-mono">
            <span>Departed: 08:30 PM PST</span>
            <span className="text-amber-400 font-semibold">{progress.toFixed(1)}% Distance Completed</span>
            <span>ETA: 42 mins (11:15 PM)</span>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs uppercase tracking-wider">Cruising Speed</span>
            <Gauge className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {speed.toFixed(0)} <span className="text-xs font-normal text-slate-400">MPH</span>
          </div>
          <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Optimal cruise
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs uppercase tracking-wider">Cargo Payload</span>
            <Package className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            18,420 <span className="text-xs font-normal text-slate-400">LBS</span>
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Class A sealed freight
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs uppercase tracking-wider">Reefer Temp</span>
            <Thermometer className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {cargoTemp}° <span className="text-xs font-normal text-slate-400">F</span>
          </div>
          <div className="text-xs text-cyan-400 mt-1 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> Temperature locked
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs uppercase tracking-wider">GPS Transponder</span>
            <Radio className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            ONLINE
          </div>
          <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
            <Clock className="w-3 h-3" /> Ping: 14ms
          </div>
        </div>
      </div>

      {/* Manifest & Instructions */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-900/40 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white">Animation Sequence Completed Successfully</div>
            <div className="text-xs text-slate-400">
              The truck animated forward on authentication, simulated engine revs & headlight flare, and exited the highway.
            </div>
          </div>
        </div>

        <button
          onClick={handleRecall}
          className="w-full sm:w-auto px-4 py-2 border border-slate-700 hover:border-slate-600 bg-slate-800/80 hover:bg-slate-800 text-slate-200 text-xs font-medium rounded-lg transition-colors cursor-pointer"
        >
          Replay Drive-In Animation
        </button>
      </div>
    </div>
  );
};
