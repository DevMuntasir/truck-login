import React, { useState } from 'react';
import { Code, Copy, Check, ChevronDown, ChevronUp, Terminal, Sparkles } from 'lucide-react';

export const CodeInspector: React.FC = () => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  const codeSnippets = [
    {
      title: 'TruckCSS.css',
      language: 'css',
      code: `/* Road & Truck Animation Keyframes */
.highway-road {
  position: relative;
  background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
  border-top: 4px solid #334155;
  box-shadow: 0 -20px 40px rgba(0, 0, 0, 0.6);
}

.dashed-lane {
  background-image: repeating-linear-gradient(
    90deg,
    #fbbf24 0px,
    #fbbf24 45px,
    transparent 45px,
    transparent 85px
  );
  animation: roadRun 0.45s linear infinite;
}

/* Headlight Projection Flare */
.headlight-beam {
  background: radial-gradient(
    ellipse at left,
    rgba(254, 240, 138, 0.45) 0%,
    rgba(253, 224, 71, 0.15) 40%,
    transparent 80%
  );
  clip-path: polygon(0% 40%, 100% 0%, 100% 100%, 0% 60%);
}`
    },
    {
      title: 'AnimationTimeline.ts (GSAP)',
      language: 'typescript',
      code: `// GSAP Departure Timeline on Successful Authentication
export const triggerTruckDriveAway = (truckEl, wheels, headlights) => {
  const tl = gsap.timeline({
    onComplete: () => setAuthState('departed')
  });

  // 1. High beam flash & engine suspension squat
  tl.to(headlights, { opacity: 1, scaleX: 1.4, duration: 0.3 })
    .to(truckEl, { 
      rotation: -1.2, 
      y: -4, 
      duration: 0.35, 
      ease: 'back.out(2)' 
    }, '<')
    
  // 2. High-speed wheel rotation
    .to(wheels, { 
      rotation: '+=1440', 
      duration: 1.8, 
      ease: 'power3.in' 
    }, 0.2)

  // 3. Accelerate off the road towards the horizon
    .to(truckEl, { 
      x: window.innerWidth + 900, 
      rotation: 0, 
      duration: 1.6, 
      ease: 'power2.in' 
    }, 0.3);
};`
    }
  ];

  const handleCopy = (code: string, idx: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 mt-8 mb-12">
      {/* Header bar */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-bold text-slate-200 uppercase tracking-wider">
            Source Inspector & Implementation
          </span>
          <span className="text-xs bg-amber-500/10 text-amber-300 border border-amber-500/20 px-2 py-0.5 rounded font-mono">
            GSAP + React
          </span>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <span>{isExpanded ? 'Hide Code Snippets' : 'Show Code Snippets'}</span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {codeSnippets.map((snippet, idx) => (
            <div
              key={snippet.title}
              className="rounded-xl border border-slate-800 bg-[#0d131f] shadow-xl overflow-hidden flex flex-col"
            >
              {/* Window Title Bar */}
              <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-900/90 border-b border-slate-800 text-xs">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="font-mono text-slate-400 ml-2">{snippet.title}</span>
                </div>

                <button
                  onClick={() => handleCopy(snippet.code, idx)}
                  className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 bg-slate-800/80 hover:bg-slate-700 px-2 py-1 rounded transition-colors cursor-pointer"
                >
                  {copiedIndex === idx ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* Code display */}
              <pre className="p-4 text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed selection:bg-amber-500/30">
                <code>{snippet.code}</code>
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
