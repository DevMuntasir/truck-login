/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TruckScene } from './components/TruckScene';
import { FleetDashboard } from './components/FleetDashboard';
import { CodeInspector } from './components/CodeInspector';
import { HeaderNav } from './components/HeaderNav';
import { KeyRound, ShieldAlert, Sparkles, CheckCircle, Flame, Compass } from 'lucide-react';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authenticatedDriver, setAuthenticatedDriver] = useState<string>('driver@priyoshop.com');
  const [brandTitle, setBrandTitle] = useState<string>('priyoshop');
  const [truckSceneKey, setTruckSceneKey] = useState<number>(0);

  // Triggered when truck completes its forward acceleration sequence
  const handleAuthSuccess = (driver: string) => {
    setAuthenticatedDriver(driver);
    setIsAuthenticated(true);
  };

  // Reset or sign out: calls the truck back onto the highway
  const handleResetOrRecall = () => {
    setIsAuthenticated(false);
    setTruckSceneKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top Navigation Bar */}
      <HeaderNav
        onReset={handleResetOrRecall}
        brandTitle={brandTitle}
        onBrandChange={setBrandTitle}
        isLoggedIn={isAuthenticated}
      />

      {/* Hero Showcase Title - Matching the video's "TRUCK LOGIN PAGE" style */}
      <div className="pt-8 pb-4 text-center px-4">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white uppercase font-mono">
          TRUCK LOGIN PAGE
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-xl mx-auto">
          Interactive delivery van with embedded credentials cockpit. Authenticate below to trigger high-beam ignition and forward drive-off departure.
        </p>
      </div>

      {/* Main Interactive Stage */}
      <main className="flex-1 flex flex-col items-center justify-start w-full">
        {!isAuthenticated ? (
          <div className="w-full flex flex-col items-center">
            {/* The Highway & Animated Delivery Truck */}
            <div className="w-full shadow-2xl border-y border-slate-800/80">
              <TruckScene
                key={truckSceneKey}
                onSuccess={handleAuthSuccess}
                brandTitle={brandTitle}
              />
            </div>

            {/* Quick Helper Tips underneath Highway */}
            <div className="w-full max-w-4xl mx-auto px-4 mt-6">
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-300">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-white">One-Click Testing:</span> Click{' '}
                    <span className="text-amber-400 font-mono font-bold">Demo Fill</span> on the van side and press{' '}
                    <span className="text-emerald-400 font-mono font-bold">Login Right Now</span> to see the truck rev up and drive forward off the screen!
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-2.5 py-1 bg-slate-800 rounded-md border border-slate-700 font-mono text-[11px] text-slate-300">
                    GSAP Timeline Engine
                  </span>
                  <span className="px-2.5 py-1 bg-slate-800 rounded-md border border-slate-700 font-mono text-[11px] text-emerald-400">
                    Web Audio Synthesizer
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* When logged in: The truck has driven away and we reveal the Driver Telemetry Dashboard */
          <div className="w-full py-4">
            <FleetDashboard
              onRecallTruck={handleResetOrRecall}
              driverName={authenticatedDriver}
            />
          </div>
        )}

        {/* Video Reference Bottom IDE Windows ("COMMENT FOR CODE") */}
        <CodeInspector />
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Truck Animated Login Experience • Built with React & GSAP</span>
          <span className="font-mono text-slate-400">60 FPS Hardware Accelerated Animation</span>
        </div>
      </footer>
    </div>
  );
}
