import React, { useState, useRef, useEffect, useCallback } from 'react';
import { gsap } from 'gsap';
import confetti from 'canvas-confetti';
import { 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  KeyRound, 
  AlertCircle, 
  Volume2,
  VolumeX,
  Truck as TruckIcon,
  Heart,
  CheckCircle2
} from 'lucide-react';
import { soundEngine } from '../utils/audio';

interface TruckSceneProps {
  onSuccess: (driverName: string) => void;
  brandTitle?: string;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
}

export const TruckScene: React.FC<TruckSceneProps> = ({
  onSuccess,
  brandTitle = 'priyoshop',
}) => {
  // Form states
  const [username, setUsername] = useState('driver@priyoshop.com');
  const [password, setPassword] = useState('delivery2026');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Animation states: 'arriving' | 'idle' | 'starting' | 'driving-away'
  const [phase, setPhase] = useState<'arriving' | 'idle' | 'starting' | 'driving-away'>('arriving');
  const [headlightsOn, setHeadlightsOn] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [smokeParticles, setSmokeParticles] = useState<Particle[]>([]);

  // DOM Refs for GSAP
  const sceneWrapperRef = useRef<HTMLDivElement>(null);
  const truckWrapperRef = useRef<HTMLDivElement>(null);
  const truckBodyRef = useRef<SVGGElement>(null);
  const frontWheelRef = useRef<SVGGElement>(null);
  const rearWheelRef = useRef<SVGGElement>(null);
  const headlightBeamRef = useRef<SVGPolygonElement>(null);
  const roadDashedRef = useRef<HTMLDivElement>(null);

  // Toggle Mute
  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundEngine.setMuted(next);
  };

  // Smoke particle emitter for engine rev
  const emitSmoke = useCallback(() => {
    const newParticles: Particle[] = Array.from({ length: 14 }, (_, i) => ({
      id: Date.now() + i,
      x: 580 + (Math.random() * 24 - 12),
      y: 330 + (Math.random() * 16 - 8),
      size: 16 + Math.random() * 20,
      opacity: 0.85,
    }));
    setSmokeParticles(prev => [...prev.slice(-24), ...newParticles]);
  }, []);

  // Clean old smoke particles
  useEffect(() => {
    if (smokeParticles.length === 0) return;
    const timer = setTimeout(() => {
      setSmokeParticles(prev => prev.slice(7));
    }, 1200);
    return () => clearTimeout(timer);
  }, [smokeParticles]);

  // Entrance Animation: Truck drives in from left and decelerates to a stop
  const runDriveInAnimation = useCallback(() => {
    setPhase('arriving');
    setErrorMsg('');

    if (!truckWrapperRef.current) return;

    // Reset positions
    gsap.set(truckWrapperRef.current, { x: -1250, y: 0, opacity: 1 });
    const wheels = [frontWheelRef.current, rearWheelRef.current];

    const tl = gsap.timeline({
      onComplete: () => {
        setPhase('idle');
      }
    });

    // Wheels rotating forward during drive-in
    tl.to(wheels, {
      rotation: '+=840',
      transformOrigin: 'center center',
      duration: 2.3,
      ease: 'power2.out',
    }, 0);

    // Truck entering road with deceleration
    tl.to(truckWrapperRef.current, {
      x: 0,
      duration: 2.3,
      ease: 'power3.out',
    }, 0);

    // Realistic suspension pitch & bob on braking to a stop
    // Because inputs are in <foreignObject> inside truckBodyRef, they move 100% in sync!
    tl.to(truckBodyRef.current, {
      y: -9,
      rotation: 1.2,
      transformOrigin: '80% 90%',
      duration: 0.35,
      ease: 'power1.out',
    }, 1.75)
    .to(truckBodyRef.current, {
      y: 4,
      rotation: -0.6,
      duration: 0.35,
      ease: 'power1.inOut',
    }, 2.1)
    .to(truckBodyRef.current, {
      y: 0,
      rotation: 0,
      duration: 0.4,
      ease: 'elastic.out(1, 0.4)',
    }, 2.45);

    // Road dashed line movement during arrival
    if (roadDashedRef.current) {
      tl.to(roadDashedRef.current, {
        backgroundPosition: '-700px 0',
        duration: 2.3,
        ease: 'power2.out',
      }, 0);
    }
  }, []);

  // Run initial arrival on mount
  useEffect(() => {
    runDriveInAnimation();
  }, [runDriveInAnimation]);

  // Handle Form Submission / Authentication
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phase === 'starting' || phase === 'driving-away') return;

    // Validation
    if (!username.trim()) {
      setErrorMsg('Enter Driver ID or Email');
      soundEngine.playErrorBuzz();
      shakeVan();
      return;
    }

    if (!password.trim() || password.length < 4) {
      setErrorMsg('Password minimum 4 chars');
      soundEngine.playErrorBuzz();
      shakeVan();
      return;
    }

    // Success! Trigger departure sequence
    setErrorMsg('');
    triggerSuccessDeparture();
  };

  // Shake animation on error (entire van + inputs together)
  const shakeVan = () => {
    if (truckBodyRef.current) {
      gsap.to(truckBodyRef.current, {
        x: '+=12',
        yoyo: true,
        repeat: 5,
        duration: 0.05,
        ease: 'power1.inOut',
        onComplete: () => {
          gsap.set(truckBodyRef.current, { x: 0 });
        }
      });
    }
  };

  // Quick Demo Autofill
  const handleQuickDemo = () => {
    soundEngine.playClick();
    setUsername('driver@priyoshop.com');
    setPassword('delivery2026');
    setErrorMsg('');
  };

  // Departure Sequence: Headlight flare -> Engine Rev -> Acceleration -> Drives Off Screen!
  const triggerSuccessDeparture = () => {
    setPhase('starting');
    
    // Play sound FX
    soundEngine.playEngineDeparture();

    // High beam on
    setHeadlightsOn(true);
    emitSmoke();

    const wheels = [frontWheelRef.current, rearWheelRef.current];

    const tl = gsap.timeline({
      delay: 0.1,
      onComplete: () => {
        setPhase('driving-away');
        confetti({
          particleCount: 60,
          spread: 85,
          origin: { y: 0.6, x: 0.75 },
          colors: ['#ef4444', '#f59e0b', '#3b82f6', '#10b981']
        });

        setTimeout(() => {
          onSuccess(username || 'driver@priyoshop.com');
        }, 350);
      }
    });

    // 1. Engine torque kick: Van squats back on rear suspension, front lifts!
    // Since inputs are inside truckBodyRef, they naturally tilt and squat WITH the car!
    tl.to(truckBodyRef.current, {
      y: -6,
      rotation: -1.6,
      transformOrigin: '25% 90%',
      duration: 0.45,
      ease: 'back.out(2)',
    }, 0.2);

    // 2. Headlight beam flare extension
    if (headlightBeamRef.current) {
      tl.to(headlightBeamRef.current, {
        opacity: 0.95,
        attr: { points: '835,280 1350,210 1350,380 835,310' },
        duration: 0.35,
        ease: 'power2.out',
      }, 0.2);
    }

    // 3. Second puff of exhaust smoke
    tl.add(() => emitSmoke(), 0.5);

    // 4. Wheels spin rapidly
    tl.to(wheels, {
      rotation: '+=2520',
      transformOrigin: 'center center',
      duration: 1.8,
      ease: 'power2.in',
    }, 0.3);

    // 5. Road line streaks backward at high speed
    if (roadDashedRef.current) {
      tl.to(roadDashedRef.current, {
        backgroundPosition: '-1600px 0',
        duration: 1.8,
        ease: 'power2.in',
      }, 0.3);
    }

    // 6. Van accelerates forward across the road to the right!
    tl.to(truckWrapperRef.current, {
      x: typeof window !== 'undefined' ? window.innerWidth + 1300 : 2200,
      duration: 1.6,
      ease: 'power2.in',
    }, 0.4);

    // Level out suspension at top speed
    tl.to(truckBodyRef.current, {
      rotation: 0.5,
      y: 0,
      duration: 0.6,
      ease: 'power1.in',
    }, 0.7);
  };

  return (
    <div 
      ref={sceneWrapperRef} 
      className="relative w-full overflow-hidden select-none"
      style={{
        background: 'radial-gradient(ellipse at 50% 25%, #182642 0%, #0d1527 65%, #050811 100%)',
        minHeight: '640px',
      }}
    >
      {/* Night Sky Ambience & Distant Silhouette Hills */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute top-10 left-[18%] w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
        <div className="absolute top-20 left-[48%] w-1 h-1 bg-blue-200 rounded-full animate-ping duration-1000" />
        <div className="absolute top-14 left-[78%] w-1.5 h-1.5 bg-amber-100 rounded-full animate-pulse" />
      </div>

      {/* Layered mountain ridges */}
      <div className="absolute bottom-40 left-0 right-0 h-44 pointer-events-none opacity-60">
        <svg viewBox="0 0 1440 180" preserveAspectRatio="none" className="w-full h-full">
          <path
            d="M0,110 Q320,40 640,90 T1280,60 T1440,100 L1440,180 L0,180 Z"
            fill="#0f172a"
            opacity="0.7"
          />
          <path
            d="M0,135 Q400,95 800,125 T1440,115 L1440,180 L0,180 Z"
            fill="#080d1a"
            opacity="0.95"
          />
        </svg>
      </div>

      {/* Street Highway Lamps in Background */}
      <div className="absolute bottom-36 left-0 right-0 flex justify-around pointer-events-none opacity-50 px-8">
        {[12, 35, 62, 85].map((pos, idx) => (
          <div key={idx} className="relative flex flex-col items-center">
            {/* Soft Warm Light Cone */}
            <div 
              className="absolute -top-4 w-32 h-44 bg-gradient-to-b from-amber-200/20 via-amber-300/10 to-transparent blur-md pointer-events-none"
              style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}
            />
            {/* Lamp fixture */}
            <div className="w-4 h-1.5 bg-amber-300 rounded-full shadow-[0_0_12px_#fde047]" />
            <div className="w-1 h-36 bg-slate-700/80" />
          </div>
        ))}
      </div>

      {/* Top Scene Controls Overlay */}
      <div className="relative z-30 pt-6 px-6 max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900/85 border border-slate-700/70 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Priyoshop Delivery Fleet</span>
          </div>

          <button
            onClick={() => soundEngine.playHorn()}
            className="flex items-center gap-1.5 bg-slate-800/85 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors shadow-sm cursor-pointer"
            title="Honk Van Horn"
          >
            <TruckIcon className="w-3.5 h-3.5" />
            <span>Horn</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleMute}
            className="flex items-center gap-1.5 bg-slate-900/85 hover:bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg text-xs text-slate-300 hover:text-white transition-colors backdrop-blur-md cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
            <span>{isMuted ? 'Muted' : 'Sound On'}</span>
          </button>

          <button
            onClick={runDriveInAnimation}
            className="flex items-center gap-1.5 bg-slate-900/85 hover:bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg text-xs text-slate-300 hover:text-white transition-colors backdrop-blur-md cursor-pointer"
          >
            <span>Reset Van</span>
          </button>
        </div>
      </div>

      {/* Main Delivery Van Stage */}
      <div className="relative w-full max-w-6xl mx-auto min-h-[480px] flex items-center justify-center pt-2">
        {/* Animated Van Container */}
        <div 
          ref={truckWrapperRef} 
          className="relative will-change-transform z-20"
          style={{ width: '920px', height: '420px' }}
        >
          {/* Animated Exhaust Smoke Particles */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-10">
            {smokeParticles.map(p => (
              <div
                key={p.id}
                className="absolute rounded-full bg-slate-400/50 blur-xs transition-all duration-700"
                style={{
                  left: `${p.x}px`,
                  top: `${p.y}px`,
                  width: `${p.size}px`,
                  height: `${p.size}px`,
                  transform: 'translate(-50%, -50%) scale(2)',
                  opacity: 0,
                  transition: 'transform 0.9s ease-out, opacity 0.9s ease-out',
                }}
              />
            ))}
          </div>

          {/* SVG DELIVERY VAN GRAPHIC MATCHING Car3 (1).svg */}
          <svg 
            viewBox="0 0 920 420" 
            className="w-full h-full overflow-visible drop-shadow-2xl"
          >
            <defs>
              {/* Headlight beam gradient */}
              <linearGradient id="priyoHeadlightGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#fef08a" stopOpacity="0.9" />
                <stop offset="35%" stopColor="#fde047" stopOpacity="0.4" />
                <stop offset="70%" stopColor="#eab308" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#eab308" stopOpacity="0" />
              </linearGradient>

              {/* Red Van Gradient matching Car3 (1).svg (#E52E46) */}
              <linearGradient id="priyoRedGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ef3851" />
                <stop offset="50%" stopColor="#e52942" />
                <stop offset="100%" stopColor="#d11933" />
              </linearGradient>

              {/* Cab Highlight Gradient */}
              <linearGradient id="cabRedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f4435b" />
                <stop offset="60%" stopColor="#e52942" />
                <stop offset="100%" stopColor="#b91c1c" />
              </linearGradient>

              {/* Dark Chassis */}
              <linearGradient id="vanChassisGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#374151" />
                <stop offset="100%" stopColor="#1f2937" />
              </linearGradient>

              {/* Ground Shadow */}
              <radialGradient id="vanGroundShadow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#000000" stopOpacity="0.85" />
                <stop offset="80%" stopColor="#000000" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Asphalt Contact Shadow */}
            <ellipse cx="460" cy="365" rx="420" ry="18" fill="url(#vanGroundShadow)" />

            {/* 
              THE ENTIRE VAN BODY GROUP (Including the inputs in <foreignObject>)
              Whenever truckBodyRef is rotated or translated by GSAP, EVERYTHING inside moves in 100% lockstep!
            */}
            <g ref={truckBodyRef} id="van-complete-body">
              {/* Headlight High-Beam Flare Projection */}
              {headlightsOn && (
                <polygon
                  ref={headlightBeamRef}
                  points="835,280 1200,230 1200,360 835,308"
                  fill="url(#priyoHeadlightGrad)"
                  className="pointer-events-none transition-all duration-300"
                  style={{ mixBlendMode: 'screen' }}
                />
              )}

              {/* CHASSIS, BATTERY BOX & MUDGUARDS */}
              <g id="chassis-layer">
                {/* Horizontal main black chassis beam under the body */}
                <rect x="55" y="278" width="540" height="28" fill="#1e293b" />
                {/* Dark grey fuel tank/battery box between wheels */}
                <rect x="290" y="298" width="200" height="26" rx="4" fill="#334155" />
                <rect x="292" y="300" width="196" height="4" fill="#475569" />

                {/* Rear Mudguard Arch (Grey-Blue) */}
                <path
                  d="M 90,305 
                     C 90,270 115,255 170,255 
                     C 225,255 250,270 250,305 
                     L 230,305 
                     C 230,278 210,268 170,268 
                     C 130,268 110,278 110,305 
                     Z"
                  fill="#475569"
                />

                {/* Front Mudguard Arch (Grey-Blue) */}
                <path
                  d="M 600,305 
                     C 600,270 625,255 680,255 
                     C 735,255 760,270 760,305 
                     L 740,305 
                     C 740,278 720,268 680,268 
                     C 640,268 620,278 620,305 
                     Z"
                  fill="#475569"
                />
              </g>

              {/* MAIN CARGO BOX (RED VAN BODY WITH DECAL GRAPHIC) */}
              <g id="cargo-box-layer">
                {/* Main Red Cargo Box Rectangle */}
                <rect
                  x="45"
                  y="92"
                  width="550"
                  height="186"
                  rx="6"
                  fill="url(#priyoRedGrad)"
                />

                {/* Top Roof Lip Trim */}
                <rect x="43" y="90" width="554" height="6" rx="2" fill="#ef4444" />

                {/* Bottom Base Rail */}
                <rect x="45" y="274" width="550" height="6" fill="#be123c" />

                {/* 
                  WAVY WHITE LIVERY PATTERN ON LOWER CARGO BODY
                  Matches the user's Car3 (1).svg image
                */}
                <path
                  d="M 45,200 
                     C 120,175 190,215 270,195 
                     C 350,175 430,210 510,190 
                     C 555,180 580,185 595,195 
                     L 595,276 
                     L 45,276 
                     Z"
                  fill="#ffffff"
                />

                {/* Subtle Cityscape & Parcel Motif Decal Silhouette inside the white wave */}
                <g opacity="0.18" fill="#e11d48">
                  {/* City buildings & parcel boxes silhouette */}
                  <rect x="65" y="225" width="22" height="42" rx="1" />
                  <rect x="92" y="215" width="18" height="52" rx="1" />
                  <rect x="115" y="235" width="28" height="32" rx="1" />
                  <rect x="150" y="210" width="24" height="57" rx="1" />
                  <rect x="180" y="228" width="30" height="39" rx="1" />
                  <rect x="220" y="205" width="20" height="62" rx="1" />
                  <rect x="245" y="222" width="26" height="45" rx="1" />
                  <rect x="280" y="212" width="22" height="55" rx="1" />
                  <rect x="310" y="230" width="35" height="37" rx="1" />
                  <rect x="355" y="208" width="24" height="59" rx="1" />
                  <rect x="385" y="226" width="30" height="41" rx="1" />
                  <rect x="425" y="218" width="26" height="49" rx="1" />
                  <rect x="460" y="235" width="32" height="32" rx="1" />
                  <rect x="500" y="212" width="28" height="55" rx="1" />
                  <rect x="535" y="224" width="22" height="43" rx="1" />
                  <rect x="562" y="215" width="24" height="52" rx="1" />
                </g>

                {/* Top Brand Logo Lockup: Priyoshop Bag + Heart + Typography */}
                <g id="priyoshop-brand-logo" transform="translate(260, 105)">
                  {/* Shopping Bag / Gift Box Icon */}
                  <rect x="0" y="2" width="28" height="24" rx="4" fill="#ffffff" />
                  {/* Heart cutout */}
                  <path
                    d="M 14,19 C 14,19 8,14.5 8,10.5 C 8,8.5 9.8,7 11.8,7 C 13,7 13.8,7.8 14,8.5 C 14.2,7.8 15,7 16.2,7 C 18.2,7 20,8.5 20,10.5 C 20,14.5 14,19 14,19 Z"
                    fill="#e11d48"
                  />
                  {/* Brand Typography */}
                  <text
                    x="36"
                    y="20"
                    fill="#ffffff"
                    fontSize="18"
                    fontWeight="800"
                    fontFamily="Plus Jakarta Sans, sans-serif"
                    letterSpacing="0.05em"
                  >
                    {brandTitle}
                  </text>
                </g>
              </g>

              {/* RED CABIN (CAB) - MATCHING Car3 (1).svg */}
              <g id="van-cabin-layer">
                {/* Main Cab Outer Body with forward curved nose */}
                <path
                  d="M 595,150 
                     L 595,274 
                     L 815,274 
                     C 830,274 840,265 840,250 
                     L 840,230 
                     L 810,172 
                     C 798,155 780,150 760,150 
                     Z"
                  fill="url(#cabRedGrad)"
                  stroke="#be123c"
                  strokeWidth="1.5"
                />

                {/* Characteristic Cab Window with downward angled cutline */}
                <path
                  d="M 645,160 
                     L 755,160 
                     C 768,160 778,168 786,180 
                     L 802,212 
                     L 735,212 
                     C 725,222 710,225 645,225 
                     Z"
                  fill="#263238"
                  stroke="#1e293b"
                  strokeWidth="2"
                />

                {/* Driver silhouette & steering wheel */}
                <circle cx="685" cy="185" r="9" fill="#475569" />
                <path d="M 672,215 C 672,198 698,198 698,215 Z" fill="#475569" />
                <line x1="720" y1="195" x2="735" y2="210" stroke="#64748b" strokeWidth="3" strokeLinecap="round" />

                {/* Glass reflection streak */}
                <path
                  d="M 655,165 L 685,165 L 665,220 L 648,220 Z"
                  fill="#ffffff"
                  fillOpacity="0.2"
                />

                {/* Driver Door Seam */}
                <path d="M 635,155 L 635,272" stroke="#be123c" strokeWidth="1.5" />

                {/* Vertical White/Silver Door Handle */}
                <rect x="642" y="235" width="4" height="14" rx="2" fill="#ffffff" />

                {/* Front Bumper & Lower Valence (Dark Charcoal/Black) */}
                <path
                  d="M 780,274 
                     L 840,274 
                     C 845,274 848,278 848,284 
                     L 844,296 
                     L 775,296 
                     Z"
                  fill="#1f2937"
                />

                {/* Headlight / Corner Indicator at lower right front corner */}
                <path
                  d="M 822,250 
                     L 838,250 
                     L 838,268 
                     L 822,268 
                     Z"
                  fill={headlightsOn ? '#fef08a' : '#ffffff'}
                  className="transition-colors duration-300"
                />
                <circle cx="830" cy="259" r="4" fill={headlightsOn ? '#ffffff' : '#f8fafc'} />
                {/* Amber indicator strip */}
                <rect x="822" y="247" width="16" height="3" fill="#f59e0b" />
              </g>

              {/* 
                ============================================================
                THE EMBEDDED LOGIN FORM - USING <foreignObject> INSIDE THE VAN!
                ============================================================
                Because this <foreignObject> is an immediate child of <g ref={truckBodyRef}>:
                1. It is mathematically pinned into the exact coordinate system of the van.
                2. When the van accelerates, tilts, bobs on suspension, or brakes, the inputs
                   move at the EXACT SAME SUB-PIXEL with ZERO displacement or lag.
                3. The input design is styled to match the van's side decal seamlessly.
              */}
              <foreignObject
                x="55"
                y="136"
                width="530"
                height="134"
                className="overflow-visible pointer-events-auto"
              >
                <div 
                  className="w-full h-full flex flex-col justify-between px-5 py-2 select-none"
                  style={{
                    /* Seamlessly blends into the red & white van graphics */
                    background: 'transparent',
                  }}
                >
                  {/* Subtle van integrated header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-white/90 drop-shadow-sm font-mono">
                        DRIVER ACCESS CONSOLE
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleQuickDemo}
                      className="text-[10px] font-semibold text-amber-200 hover:text-white bg-red-900/60 hover:bg-red-900/90 border border-red-700/60 px-2 py-0.5 rounded transition-colors flex items-center gap-1 cursor-pointer"
                      title="Auto-fill driver credentials"
                    >
                      <KeyRound className="w-2.5 h-2.5" />
                      <span>Demo Fill</span>
                    </button>
                  </div>

                  {/* Error Notification if any */}
                  {errorMsg && (
                    <div className="flex items-center gap-1.5 py-0.5 px-2 bg-rose-600/90 text-white rounded text-[10px] font-medium animate-shake shadow">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span className="truncate">{errorMsg}</span>
                    </div>
                  )}

                  {/* The Login Form Inputs */}
                  <form onSubmit={handleLoginSubmit} className="flex flex-col gap-1.5 mt-0.5">
                    <div className="grid grid-cols-2 gap-2">
                      {/* Driver ID / Username Input */}
                      <div className="relative flex items-center">
                        <div className="absolute left-2.5 text-slate-500 pointer-events-none">
                          <User className="w-3 h-3" />
                        </div>
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="Driver ID / Email"
                          disabled={phase === 'starting' || phase === 'driving-away'}
                          className="w-full pl-7 pr-2 py-1 bg-white/95 text-slate-900 border border-slate-300 focus:border-red-600 focus:ring-1 focus:ring-red-500 rounded text-xs transition-all placeholder:text-slate-400 outline-none shadow-inner"
                        />
                      </div>

                      {/* Password Input */}
                      <div className="relative flex items-center">
                        <div className="absolute left-2.5 text-slate-500 pointer-events-none">
                          <Lock className="w-3 h-3" />
                        </div>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="PIN / Password"
                          disabled={phase === 'starting' || phase === 'driving-away'}
                          className="w-full pl-7 pr-7 py-1 bg-white/95 text-slate-900 border border-slate-300 focus:border-red-600 focus:ring-1 focus:ring-red-500 rounded text-xs transition-all placeholder:text-slate-400 outline-none shadow-inner"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2 text-slate-400 hover:text-slate-700 cursor-pointer"
                          tabIndex={-1}
                        >
                          {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>

                    {/* Bottom Action Row: Login Button directly integrated */}
                    <div className="flex items-center justify-between pt-0.5">
                      <div className="flex items-center gap-1 text-[9px] text-slate-600 font-medium">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Ready for Dispatch</span>
                      </div>

                      <button
                        type="submit"
                        disabled={phase === 'starting' || phase === 'driving-away'}
                        className={`flex items-center gap-1.5 px-4 py-1 rounded text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer ${
                          phase === 'starting' || phase === 'driving-away'
                            ? 'bg-emerald-600 text-white cursor-wait'
                            : 'bg-red-600 hover:bg-red-700 text-white hover:shadow-lg'
                        }`}
                      >
                        {phase === 'starting' ? (
                          <>
                            <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>REV & GO...</span>
                          </>
                        ) : (
                          <>
                            <span>Login & Drive</span>
                            <ArrowRight className="w-3 h-3" />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </foreignObject>

              {/* WHEELS (ROTATING ASSEMBLIES) */}
              {/* Wheel 1: Rear Wheel (under the cargo box) */}
              <g ref={rearWheelRef} id="priyo-rear-wheel" transform="translate(170, 305)">
                {/* Thick Black Rubber Tire */}
                <circle cx="0" cy="0" r="44" fill="#1e293b" stroke="#0f172a" strokeWidth="5" />
                {/* Tire Tread Grooves */}
                <circle cx="0" cy="0" r="40" fill="none" stroke="#334155" strokeWidth="2.5" strokeDasharray="6 4" />
                {/* Crisp White Alloy Rim matching Car3 (1).svg */}
                <circle cx="0" cy="0" r="28" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2" />
                {/* Dark Inner Hub */}
                <circle cx="0" cy="0" r="14" fill="#1e293b" />
                {/* Wheel Lug Nuts */}
                {[0, 60, 120, 180, 240, 300].map((deg) => (
                  <circle
                    key={deg}
                    cx={20 * Math.cos((deg * Math.PI) / 180)}
                    cy={20 * Math.sin((deg * Math.PI) / 180)}
                    r="2.2"
                    fill="#475569"
                  />
                ))}
                {/* Center Hub Cap Pin */}
                <circle cx="0" cy="0" r="5" fill="#e11d48" />
              </g>

              {/* Wheel 2: Front Wheel (under the cab) */}
              <g ref={frontWheelRef} id="priyo-front-wheel" transform="translate(680, 305)">
                {/* Thick Black Rubber Tire */}
                <circle cx="0" cy="0" r="44" fill="#1e293b" stroke="#0f172a" strokeWidth="5" />
                <circle cx="0" cy="0" r="40" fill="none" stroke="#334155" strokeWidth="2.5" strokeDasharray="6 4" />
                {/* Crisp White Alloy Rim */}
                <circle cx="0" cy="0" r="28" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2" />
                <circle cx="0" cy="0" r="14" fill="#1e293b" />
                {[0, 60, 120, 180, 240, 300].map((deg) => (
                  <circle
                    key={deg}
                    cx={20 * Math.cos((deg * Math.PI) / 180)}
                    cy={20 * Math.sin((deg * Math.PI) / 180)}
                    r="2.2"
                    fill="#475569"
                  />
                ))}
                <circle cx="0" cy="0" r="5" fill="#e11d48" />
              </g>
            </g>
          </svg>
        </div>
      </div>

      {/* Realistic Multi-Lane Highway Surface with Center Line */}
      <div className="relative w-full h-28 bg-[#0f172a] border-t-4 border-slate-700 shadow-2xl z-10 overflow-hidden">
        {/* Asphalt texture */}
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
            backgroundSize: '16px 16px',
          }}
        />

        {/* Animated Dashed Lane Line */}
        <div 
          ref={roadDashedRef}
          className="absolute top-11 left-0 right-0 h-2.5 pointer-events-none"
          style={{
            backgroundImage: 'repeating-linear-gradient(90deg, #f59e0b 0px, #f59e0b 55px, transparent 55px, transparent 110px)',
            backgroundPosition: '0px 0px',
            boxShadow: '0 0 10px rgba(245, 158, 11, 0.4)',
          }}
        />

        {/* Highway Edge Reflectors */}
        <div className="absolute bottom-1.5 left-0 right-0 h-1.5 bg-slate-800 flex justify-between px-12">
          {Array.from({ length: 14 }).map((_, i) => (
            <div key={i} className="w-2.5 h-1 bg-amber-400/80 rounded-full shadow-[0_0_6px_#f59e0b]" />
          ))}
        </div>
      </div>
    </div>
  );
};
