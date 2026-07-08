'use client';

import React, { createContext, useContext, useEffect, useRef, useMemo } from 'react';
import { useMotionValue, useTransform, motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// ==========================================
// 1. Types & Interfaces
// ==========================================

export interface WorldObject {
  id: string;
  type: 'cloud' | 'island' | 'birds' | 'airplane' | 'balloon' | 'blimp';
  spacingBefore: number; // vertical spacing in pixels from the previous object
  x: string;            // horizontal position (e.g., '15%', '60%')
  depth: number;        // depth value (0.1 to 1.0) for parallax calculations
  scale: number;        // scaling factor
  opacity: number;      // base opacity
  rotation?: number;    // slight tilt in degrees
  y?: number;           // computed absolute vertical position
  // Cloud specific
  cloudPathIdx?: number;
  duration?: number;
  reverse?: boolean;
  blur?: number;
  // Island specific
  shapeIndex?: number;
  bobRange?: number;
  bobDuration?: number;
}

export interface WeatherPreset {
  name: string;
  overlayGradient?: string;
  rayColor: string;
  rayOpacity: number;
  hazeColor: string;
  hazeOpacity: number;
}

// ==========================================
// 2. Constants & Configurations
// ==========================================

export const WEATHER_PRESETS: Record<string, WeatherPreset> = {
  'clear-sky': {
    name: 'Clear Sky',
    rayColor: 'rgba(255, 255, 255, 0.04)',
    rayOpacity: 1.0,
    hazeColor: 'from-[#e0f2fe]/30 to-transparent',
    hazeOpacity: 1.0
  },
  'golden-hour': {
    name: 'Golden Hour',
    overlayGradient: 'bg-gradient-to-b from-amber-500/5 via-orange-400/5 to-transparent',
    rayColor: 'rgba(251, 191, 36, 0.07)',
    rayOpacity: 0.9,
    hazeColor: 'from-amber-100/25 to-transparent',
    hazeOpacity: 1.0
  },
  'sunset': {
    name: 'Sunset',
    overlayGradient: 'bg-gradient-to-b from-pink-500/5 via-purple-500/5 to-transparent',
    rayColor: 'rgba(244, 63, 94, 0.03)',
    rayOpacity: 0.8,
    hazeColor: 'from-purple-200/20 to-transparent',
    hazeOpacity: 0.9
  }
};

// Handcrafted sequential arrangement of all world objects using relative spacing
// Note: x positions are pushed to the outer left (< 30%) and right (> 70%) to avoid clashing with the central vine
export const WORLD_OBJECTS: WorldObject[] = [
  // 1. High Altitude Entry
  { id: 'cloud-0', type: 'cloud', spacingBefore: 120, x: '12%', depth: 0.2, scale: 0.75, opacity: 0.22, cloudPathIdx: 0, duration: 65, blur: 0, rotation: -1 },
  { id: 'island-0', type: 'island', spacingBefore: 200, x: '75%', depth: 0.3, scale: 0.7, opacity: 0.25, shapeIndex: 1, bobRange: 4, bobDuration: 13, rotation: -2 },
  { id: 'cloud-1', type: 'cloud', spacingBefore: 180, x: '15%', depth: 0.35, scale: 0.9, opacity: 0.28, cloudPathIdx: 1, duration: 52, reverse: true, blur: 1, rotation: 2 },
  { id: 'event-birds-0', type: 'birds', spacingBefore: 250, x: '15%', depth: 0.3, scale: 1.0, opacity: 0.6 }, // Handcrafted bird flock event

  // 2. Cloud Valley Stacks
  { id: 'cloud-2', type: 'cloud', spacingBefore: 260, x: '18%', depth: 0.55, scale: 1.25, opacity: 0.42, cloudPathIdx: 2, duration: 38, blur: 2, rotation: -3 },
  { id: 'island-1', type: 'island', spacingBefore: 220, x: '20%', depth: 0.55, scale: 1.0, opacity: 0.3, shapeIndex: 2, bobRange: 7, bobDuration: 16, rotation: 3 },
  { id: 'cloud-3', type: 'cloud', spacingBefore: 190, x: '78%', depth: 0.25, scale: 0.78, opacity: 0.2, cloudPathIdx: 3, duration: 68, reverse: true, blur: 1, rotation: 1 },
  { id: 'event-birds-1', type: 'birds', spacingBefore: 300, x: '80%', depth: 0.5, scale: 1.0, opacity: 0.6 }, // Handcrafted bird flock event

  // 3. Middle Horizon
  { id: 'cloud-4', type: 'cloud', spacingBefore: 120, x: '82%', depth: 0.45, scale: 1.1, opacity: 0.35, cloudPathIdx: 4, duration: 55, blur: 0, rotation: -2 },
  { id: 'island-2', type: 'island', spacingBefore: 260, x: '78%', depth: 0.75, scale: 1.15, opacity: 0.32, shapeIndex: 3, bobRange: 8, bobDuration: 14, rotation: -4 },
  { id: 'cloud-5', type: 'cloud', spacingBefore: 210, x: '15%', depth: 0.3, scale: 0.95, opacity: 0.26, cloudPathIdx: 0, duration: 58, reverse: true, blur: 2, rotation: 3 },

  // 4. Floating Archipelago
  { id: 'island-3', type: 'island', spacingBefore: 280, x: '12%', depth: 0.45, scale: 0.8, opacity: 0.22, shapeIndex: 1, bobRange: 6, bobDuration: 18, rotation: 2 },
  { id: 'cloud-6', type: 'cloud', spacingBefore: 120, x: '75%', depth: 0.2, scale: 0.85, opacity: 0.18, cloudPathIdx: 1, duration: 62, blur: 1, rotation: -1 },
  { id: 'cloud-7', type: 'cloud', spacingBefore: 240, x: '25%', depth: 0.6, scale: 1.2, opacity: 0.45, cloudPathIdx: 2, duration: 42, reverse: true, blur: 3, rotation: 4 },
  { id: 'event-birds-2', type: 'birds', spacingBefore: 320, x: '15%', depth: 0.7, scale: 1.0, opacity: 0.6 }, // Handcrafted bird flock event

  // 5. High Altitude Stratus
  { id: 'cloud-8', type: 'cloud', spacingBefore: 150, x: '72%', depth: 0.15, scale: 0.7, opacity: 0.15, cloudPathIdx: 3, duration: 75, blur: 0, rotation: 2 },
  { id: 'island-4', type: 'island', spacingBefore: 280, x: '18%', depth: 0.8, scale: 1.25, opacity: 0.35, shapeIndex: 2, bobRange: 9, bobDuration: 20, rotation: -3 },
  { id: 'cloud-9', type: 'cloud', spacingBefore: 220, x: '10%', depth: 0.4, scale: 1.05, opacity: 0.28, cloudPathIdx: 4, duration: 46, blur: 2, rotation: -2 },

  // 6. Deep Horizon
  { id: 'island-5', type: 'island', spacingBefore: 320, x: '82%', depth: 0.35, scale: 0.75, opacity: 0.2, shapeIndex: 3, bobRange: 5, bobDuration: 15, rotation: 4 },
  { id: 'cloud-10', type: 'cloud', spacingBefore: 140, x: '78%', depth: 0.25, scale: 0.9, opacity: 0.24, cloudPathIdx: 0, duration: 54, reverse: true, blur: 1, rotation: 1 },
  { id: 'cloud-11', type: 'cloud', spacingBefore: 240, x: '18%', depth: 0.5, scale: 1.15, opacity: 0.4, cloudPathIdx: 1, duration: 40, blur: 3, rotation: -3 }
];

// ==========================================
// 3. Helper Functions
// ==========================================

const getStringHash = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
};

const getDelayForId = (id: string, maxDuration: number): number => {
  const hash = getStringHash(id);
  return -(hash % maxDuration);
};

const getXPos = (x: string, isMirrored: boolean): string => {
  if (x.endsWith('%')) {
    const val = parseFloat(x);
    return isMirrored ? `${100 - val}%` : x;
  }
  return x;
};

// ==========================================
// 4. Parallax Context
// ==========================================

interface ParallaxContextType {
  scrollOffset: any; // MotionValue<number> in [-1, 1]
}

const ParallaxContext = createContext<ParallaxContextType | null>(null);

export const useParallax = () => {
  const context = useContext(ParallaxContext);
  if (!context) {
    throw new Error('useParallax must be used inside a ParallaxController');
  }
  return context;
};

interface ParallaxControllerProps {
  scrollContainerRef?: React.RefObject<HTMLElement | null>;
  children: React.ReactNode;
}

export const ParallaxController: React.FC<ParallaxControllerProps> = ({
  scrollContainerRef,
  children
}) => {
  const scrollOffset = useMotionValue(0);
  const velocityRef = useRef(0);
  const lastScrollY = useRef(0);
  const lastTime = useRef(0);

  useEffect(() => {
    const targetElement = scrollContainerRef?.current || document.documentElement;
    if (!targetElement) return;

    lastScrollY.current = targetElement.scrollTop || window.pageYOffset || 0;
    lastTime.current = performance.now();

    const handleScroll = () => {
      const currentY = targetElement.scrollTop !== undefined 
        ? targetElement.scrollTop 
        : (window.pageYOffset || document.documentElement.scrollTop);
      
      const now = performance.now();
      const dt = Math.max(1, now - lastTime.current);
      const dy = currentY - lastScrollY.current;

      const currentVelocity = dy / dt; // pixels per ms
      
      velocityRef.current = currentVelocity;
      lastScrollY.current = currentY;
      lastTime.current = now;
    };

    const scrollTarget = scrollContainerRef?.current ? targetElement : window;
    scrollTarget.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      scrollTarget.removeEventListener('scroll', handleScroll);
    };
  }, [scrollContainerRef]);

  useEffect(() => {
    let rafId: number;

    const tick = () => {
      // Decay velocity back to 0
      velocityRef.current *= 0.90;

      // Map velocity to target offset and clamp to prevent jumping
      const sensitivity = 2.0;
      const target = Math.max(-1, Math.min(1, velocityRef.current * sensitivity));

      // Lerp the motion value
      const current = scrollOffset.get();
      const next = current + (target - current) * 0.08;
      scrollOffset.set(next);

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [scrollOffset]);

  return (
    <ParallaxContext.Provider value={{ scrollOffset }}>
      {children}
    </ParallaxContext.Provider>
  );
};

// ==========================================
// 5. Visual Asset Components (SVG Gradients & Paths)
// ==========================================

const SkyEngineGradients: React.FC = () => (
  <svg width="0" height="0" className="absolute pointer-events-none select-none">
    <defs>
      <linearGradient id="rockGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#94a3b8" />
        <stop offset="100%" stopColor="#475569" />
      </linearGradient>
      <linearGradient id="rockDarkGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#475569" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#1e293b" stopOpacity="0.9" />
      </linearGradient>
      <linearGradient id="grassGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#0d9488" />
        <stop offset="100%" stopColor="#0f766e" />
      </linearGradient>
      <linearGradient id="treeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#0f766e" />
        <stop offset="100%" stopColor="#115e59" />
      </linearGradient>
      <linearGradient id="mistGrad" x1="0%" y1="100%" x2="0%" y2="0%">
        <stop offset="0%" stopColor="#bae6fd" stopOpacity="0.5" />
        <stop offset="100%" stopColor="#bae6fd" stopOpacity="0" />
      </linearGradient>
    </defs>
  </svg>
);

const CLOUD_PATHS = [
  // 1. Classic fluffy
  "M 25,75 A 20,20 0 0,1 60,45 A 25,25 0 0,1 115,35 A 22,22 0 0,1 155,50 A 18,18 0 0,1 185,75 A 10,10 0 0,1 175,85 L 25,85 A 10,10 0 0,1 25,75 Z",
  // 2. Wispy elongated
  "M 15,65 A 12,12 0 0,1 35,45 A 18,18 0 0,1 75,35 A 15,15 0 0,1 105,40 A 25,25 0 0,1 155,30 A 18,18 0 0,1 185,55 L 15,55 Z",
  // 3. Thick cumulus
  "M 20,70 A 25,25 0 0,1 55,35 A 30,30 0 0,1 115,20 A 25,25 0 0,1 160,40 A 20,20 0 0,1 185,70 L 20,70 Z",
  // 4. Flat bottom stratus
  "M 10,60 A 15,15 0 0,1 35,40 Q 60,35 90,42 A 20,20 0 0,1 130,30 Q 160,38 180,55 A 12,12 0 0,1 190,65 L 10,65 Z",
  // 5. Small cloud puff
  "M 30,60 A 15,15 0 0,1 55,35 A 15,15 0 0,1 80,45 A 12,12 0 0,1 95,60 Z"
];

const IslandShape1: React.FC = () => (
  <svg viewBox="0 0 200 120" className="w-full h-full">
    <path d="M 20,60 C 25,90 60,115 100,115 C 140,115 175,90 180,60 C 140,57 60,57 20,60 Z" fill="url(#rockGrad)" />
    <path d="M 15,60 C 50,52 150,52 185,60 C 185,60 150,67 100,67 C 50,67 15,60 15,60 Z" fill="url(#grassGrad)" />
    <path d="M 60,56 Q 63,45 68,56 M 75,55 Q 80,38 85,55 M 120,56 Q 125,42 130,56" stroke="url(#treeGrad)" strokeWidth="4" strokeLinecap="round" />
    <rect x="0" y="70" width="200" height="50" fill="url(#mistGrad)" />
  </svg>
);

const IslandShape2: React.FC = () => (
  <svg viewBox="0 0 240 140" className="w-full h-full">
    <path d="M 30,70 C 40,105 80,135 120,135 C 160,135 200,105 210,70 C 170,68 70,68 30,70 Z" fill="url(#rockGrad)" />
    <path d="M 70,70 C 80,95 100,115 120,115 C 140,115 160,95 170,70 Z" fill="url(#rockDarkGrad)" />
    <path d="M 25,70 C 60,62 180,62 215,70 C 215,70 180,78 120,78 C 60,78 25,70 25,70 Z" fill="url(#grassGrad)" />
    <path d="M 135,70 Q 145,50 155,70" fill="none" stroke="url(#rockDarkGrad)" strokeWidth="3" />
    <rect x="0" y="80" width="240" height="60" fill="url(#mistGrad)" />
  </svg>
);

const IslandShape3: React.FC = () => (
  <svg viewBox="0 0 180 150" className="w-full h-full">
    <path d="M 40,50 C 42,80 70,140 90,140 C 110,140 138,80 140,50 C 110,48 70,48 40,50 Z" fill="url(#rockGrad)" />
    <path d="M 35,50 C 60,42 120,42 145,50 C 145,50 120,56 90,56 C 60,56 35,50 35,50 Z" fill="url(#grassGrad)" />
    <path d="M 85,46 Q 90,32 95,46" stroke="url(#treeGrad)" strokeWidth="5" strokeLinecap="round" />
    <rect x="0" y="80" width="180" height="70" fill="url(#mistGrad)" />
  </svg>
);

// ==========================================
// 6. Sub-Engine Components
// ==========================================

export const SunRays: React.FC<{ preset: WeatherPreset }> = ({ preset }) => {
  return (
    <div 
      className="absolute inset-0 pointer-events-none z-10 overflow-hidden mix-blend-overlay select-none"
      style={{ opacity: preset.rayOpacity }}
    >
      <motion.div
        className="absolute inset-0"
        style={{
          background: `repeating-linear-gradient(
            -35deg,
            ${preset.rayColor} 0px,
            ${preset.rayColor} 50px,
            transparent 50px,
            transparent 100px
          )`,
          maskImage: 'radial-gradient(circle at 100% 0%, black, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(circle at 100% 0%, black, transparent 75%)'
        }}
        animate={{
          opacity: [0.55, 0.8, 0.55],
          scale: [1, 1.03, 1],
          rotate: [-1, 1, -1]
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />
    </div>
  );
};

export const AtmosphericHaze: React.FC<{ preset: WeatherPreset }> = ({ preset }) => {
  return (
    <div 
      className={cn(
        "absolute inset-x-0 bottom-0 h-1/3 pointer-events-none z-12 bg-gradient-to-t select-none transition-all duration-500",
        preset.hazeColor
      )}
      style={{ opacity: preset.hazeOpacity * 0.45 }}
    />
  );
};

interface CloudEngineProps {
  objects: WorldObject[];
  isMirrored?: boolean;
}

export const CloudEngine: React.FC<CloudEngineProps> = ({ objects, isMirrored = false }) => {
  const { scrollOffset } = useParallax();
  const maxParallax = 25; // Max vertical offset for clouds

  const marqueeStyle = `
    @keyframes marquee {
      0% { transform: translate3d(0%, 0, 0); }
      100% { transform: translate3d(-50%, 0, 0); }
    }
    @keyframes marquee-reverse {
      0% { transform: translate3d(-50%, 0, 0); }
      100% { transform: translate3d(0%, 0, 0); }
    }
  `;

  const cloudObjects = useMemo(() => {
    return objects.filter(obj => obj.type === 'cloud');
  }, [objects]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 select-none">
      <style>{marqueeStyle}</style>

      {cloudObjects.map((cloud) => (
        <CloudItem 
          key={cloud.id} 
          cloud={cloud} 
          scrollOffset={scrollOffset} 
          isMirrored={isMirrored} 
          maxParallax={maxParallax}
        />
      ))}
    </div>
  );
};

const CloudItem: React.FC<{
  cloud: WorldObject;
  scrollOffset: any;
  isMirrored: boolean;
  maxParallax: number;
}> = ({ cloud, scrollOffset, isMirrored, maxParallax }) => {
  const yVal = useTransform(scrollOffset, (val: number) => val * maxParallax * cloud.depth);
  
  const pathIdx = cloud.cloudPathIdx ?? 0;
  const cloudPath = CLOUD_PATHS[pathIdx % CLOUD_PATHS.length];
  
  const duration = cloud.duration ?? 50;
  const delay = getDelayForId(cloud.id, duration);
  const directionReverse = isMirrored ? !cloud.reverse : cloud.reverse;
  const animationName = directionReverse ? 'marquee-reverse' : 'marquee';
  const horizontalAlign = getXPos(cloud.x, isMirrored);

  // Compute size variables
  const width = 160 + (getStringHash(cloud.id) % 160); // 160px to 320px
  const height = width / 2;
  const blurValue = cloud.blur ?? (getStringHash(cloud.id) % 3); // 0px to 2px

  return (
    <motion.div
      style={{ 
        y: yVal,
        top: `${cloud.y}px`
      }}
      className="absolute left-0 right-0 h-28 pointer-events-none"
    >
      <div
        style={{
          display: 'flex',
          width: '200%',
          animation: `${animationName} ${duration}s linear infinite`,
          animationDelay: `${delay}s`,
          opacity: cloud.opacity,
          transform: 'translate3d(0, 0, 0)',
          filter: `blur(${blurValue}px)`
        }}
        className="will-change-transform"
      >
        {/* Part A */}
        <div className="w-1/2 flex justify-start relative h-full">
          <svg
            style={{
              position: 'absolute',
              left: horizontalAlign,
              width: `${width}px`,
              height: `${height}px`,
              transform: `scale(${cloud.scale}) rotate(${cloud.rotation ?? 0}deg)`
            }}
            viewBox="0 0 200 100"
            fill="currentColor"
            className="text-white drop-shadow-[0_4px_8px_rgba(255,255,255,0.05)]"
          >
            <path d={cloudPath} />
          </svg>
        </div>
        {/* Part B (Seamless Loop Matching) */}
        <div className="w-1/2 flex justify-start relative h-full">
          <svg
            style={{
              position: 'absolute',
              left: horizontalAlign,
              width: `${width}px`,
              height: `${height}px`,
              transform: `scale(${cloud.scale}) rotate(${cloud.rotation ?? 0}deg)`
            }}
            viewBox="0 0 200 100"
            fill="currentColor"
            className="text-white drop-shadow-[0_4px_8px_rgba(255,255,255,0.05)]"
          >
            <path d={cloudPath} />
          </svg>
        </div>
      </div>
    </motion.div>
  );
};

interface IslandEngineProps {
  objects: WorldObject[];
  isMirrored?: boolean;
}

export const IslandEngine: React.FC<IslandEngineProps> = ({ objects, isMirrored = false }) => {
  const { scrollOffset } = useParallax();
  const maxParallax = 35; // Max vertical offset for islands

  const islandStyle = `
    @keyframes island-float {
      0% { transform: translateY(0); }
      50% { transform: translateY(var(--float-amplitude)); }
      100% { transform: translateY(0); }
    }
    @media (prefers-reduced-motion: reduce) {
      .island-float-active {
        animation: none !important;
      }
    }
  `;

  const islandObjects = useMemo(() => {
    return objects.filter(obj => obj.type === 'island');
  }, [objects]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-5 select-none">
      <style>{islandStyle}</style>
      {islandObjects.map((island, index) => (
        <IslandItem 
          key={island.id} 
          island={island} 
          index={index}
          scrollOffset={scrollOffset} 
          isMirrored={isMirrored} 
          maxParallax={maxParallax}
        />
      ))}
    </div>
  );
};

const IslandItem: React.FC<{
  island: WorldObject;
  index: number;
  scrollOffset: any;
  isMirrored: boolean;
  maxParallax: number;
}> = ({ island, index, scrollOffset, isMirrored, maxParallax }) => {
  const yVal = useTransform(scrollOffset, (val: number) => val * maxParallax * island.depth);
  
  const horizontalAlign = getXPos(island.x, isMirrored);
  
  // Custom scale jitter, increased by 33% (1.33x scale multiplier)
  const hash = getStringHash(island.id);
  const scaleJitter = 1.0 + ((hash % 10) - 5) / 100; // jitter by +/- 5%
  const computedScale = island.scale * scaleJitter * 1.33;

  // Float amplitude: 6px to 14px
  const bobRange = 6 + (hash % 9);

  // Float duration: large islands float slower, small islands float faster
  const baseDuration = 6.0 + (hash % 15) * 0.25; // 6.0s to 9.5s
  const scaleRatio = island.scale; // raw designed scale before jitter and multiplier
  const adjustedDuration = baseDuration * (0.75 + scaleRatio * 0.35);
  const bobDuration = parseFloat(Math.max(6.0, Math.min(11.0, adjustedDuration)).toFixed(2));

  // Staggered negative delay so animations are already in progress on page load
  const delay = -parseFloat(((hash % 100) / 100 * bobDuration).toFixed(2));

  return (
    <motion.div
      key={island.id}
      style={{
        left: horizontalAlign,
        top: `${island.y}px`,
        width: `${140 * computedScale}px`,
        height: `${100 * computedScale}px`,
        opacity: island.opacity,
        y: yVal
      }}
      className="absolute pointer-events-none"
    >
      {/* GPU accelerated translation div. Respects prefers-reduced-motion. */}
      <div
        className="island-float-active"
        style={{
          width: '100%',
          height: '100%',
          filter: `saturate(${60 + island.depth * 40}%) blur(${(1.0 - island.depth) * 0.7}px)`,
          willChange: 'transform',
          animation: `island-float ${bobDuration}s ease-in-out infinite`,
          animationDelay: `${delay}s`,
          '--float-amplitude': `${bobRange}px`
        } as any}
      >
        <img
          src={index % 2 === 0 ? "/assets/island.png" : "/assets/island2.png"}
          alt="Floating Sky Island"
          className="w-full h-full object-contain pointer-events-none select-none"
        />
      </div>
    </motion.div>
  );
};

const BirdFlapAnimation: React.FC<{
  scale: number;
  flapSpeed: number;
  delayOffset: number;
}> = ({ scale, flapSpeed, delayOffset }) => {
  const flapLeftStyle = `
    @keyframes flap-left {
      0% { transform: rotate(0deg); }
      50% { transform: rotate(-38deg); }
      100% { transform: rotate(0deg); }
    }
    @keyframes flap-right {
      0% { transform: rotate(0deg); }
      50% { transform: rotate(38deg); }
      100% { transform: rotate(0deg); }
    }
  `;

  return (
    <div 
      style={{
        transform: `scale(${scale})`,
        width: '32px',
        height: '24px',
        position: 'relative'
      }}
    >
      <style>{flapLeftStyle}</style>
      <svg viewBox="0 0 40 30" fill="currentColor" className="text-slate-800 w-full h-full opacity-60">
        {/* Bird body */}
        <path d="M 18,15 Q 20,13 22,15 Q 21,17 19,17 Z" />
        {/* Left Wing */}
        <path 
          d="M 19,15 Q 10,8 6,12 Q 13,14 19,15 Z" 
          style={{
            transformOrigin: '19px 15px',
            animation: `flap-left ${flapSpeed}s ease-in-out infinite`,
            animationDelay: `${delayOffset}s`
          }}
        />
        {/* Right Wing */}
        <path 
          d="M 21,15 Q 30,8 34,12 Q 27,14 21,15 Z" 
          style={{
            transformOrigin: '21px 15px',
            animation: `flap-right ${flapSpeed}s ease-in-out infinite`,
            animationDelay: `${delayOffset}s`
          }}
        />
      </svg>
    </div>
  );
};

interface BirdFlockRendererProps {
  event: WorldObject;
  scrollOffset: any;
  onComplete: () => void;
}

const BirdFlockRenderer: React.FC<BirdFlockRendererProps> = ({
  event,
  scrollOffset,
  onComplete
}) => {
  const direction = getStringHash(event.id) % 2 === 0 ? 'ltr' : 'rtl';
  const speed = 11 + (getStringHash(event.id) % 4); // 11s to 14s duration
  const flockSize = 2 + (getStringHash(event.id) % 4); // 2 to 5 birds
  
  const birdVariations = useMemo(() => {
    return Array.from({ length: flockSize }).map((_, index) => {
      const uniqueId = `${event.id}-bird-${index}`;
      const hash = getStringHash(uniqueId);
      const xOffset = -index * 30 - (hash % 15);
      const yOffset = (index % 2 === 0 ? 1 : -1) * index * 18 + (hash % 10 - 5);
      const scale = 0.8 + (hash % 5) * 0.1; // 0.8 to 1.2
      const flapSpeed = 0.45 + (hash % 6) * 0.05; // 0.45s to 0.7s
      const delayOffset = (hash % 5) * 0.1 - 0.2; // -0.2s to 0.2s
      return { scale, flapSpeed, xOffset, yOffset, delayOffset };
    });
  }, [event.id, flockSize]);

  // Nested parallax offset drift using depth
  const maxParallax = 35;
  const yParallax = useTransform(scrollOffset, (val: number) => val * maxParallax * event.depth);

  return (
    <motion.div 
      style={{
        position: 'absolute',
        inset: 0,
        y: yParallax,
        zIndex: 3 // z-3 places events behind the z-5 islands, creating perfect depth
      }}
      className="pointer-events-none select-none"
    >
      <motion.div
        initial={{ 
          x: direction === 'ltr' ? '-15%' : '115%', 
          opacity: 0,
          y: event.y ?? 200
        }}
        animate={{
          x: direction === 'ltr' ? '115%' : '-15%',
          y: [event.y ?? 200, (event.y ?? 200) - 35, (event.y ?? 200) + 15, (event.y ?? 200) - 10, event.y ?? 200],
          opacity: [0, event.opacity, event.opacity, 0]
        }}
        transition={{
          duration: speed,
          ease: [0.25, 0.1, 0.25, 1], // easeInOut bezier glide
          times: [0, 0.12, 0.88, 1] // fade in/out curves
        }}
        onAnimationComplete={onComplete}
        className="absolute flex items-center justify-center pointer-events-none"
        style={{
          width: '80px',
          height: '60px'
        }}
      >
        {birdVariations.map((bird, idx) => (
          <div
            key={idx}
            style={{
              position: 'absolute',
              left: `${bird.xOffset}px`,
              top: `${bird.yOffset}px`,
              transform: direction === 'rtl' ? 'scaleX(-1)' : undefined
            }}
          >
            <BirdFlapAnimation 
              scale={bird.scale}
              flapSpeed={bird.flapSpeed}
              delayOffset={bird.delayOffset}
            />
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
};

const EventItem: React.FC<{
  event: WorldObject;
  scrollContainerRef?: React.RefObject<HTMLElement | null>;
}> = ({ event, scrollContainerRef }) => {
  const [hasTriggered, setHasTriggered] = React.useState(false);
  const [hasCompleted, setHasCompleted] = React.useState(false);
  const { scrollOffset } = useParallax();

  useEffect(() => {
    const container = scrollContainerRef?.current || document.documentElement;
    if (!container) return;

    const checkVisibility = () => {
      if (hasTriggered) return;

      const scrollTop = container.scrollTop !== undefined 
        ? container.scrollTop 
        : (window.pageYOffset || document.documentElement.scrollTop);
      const clientHeight = container.clientHeight !== undefined 
        ? container.clientHeight 
        : window.innerHeight;

      // Event triggers the first time it comes near viewport visibility (e.g. scroll window reaches within 100px of y)
      if (event.y && scrollTop + clientHeight >= event.y + 100) {
        setHasTriggered(true);
      }
    };

    const scrollTarget = scrollContainerRef?.current ? container : window;
    scrollTarget.addEventListener('scroll', checkVisibility, { passive: true });
    checkVisibility(); // Run check immediately on mount

    return () => {
      scrollTarget.removeEventListener('scroll', checkVisibility);
    };
  }, [event.y, hasTriggered, scrollContainerRef]);

  if (!hasTriggered || hasCompleted) return null;

  if (event.type === 'birds') {
    return (
      <BirdFlockRenderer 
        event={event} 
        scrollOffset={scrollOffset} 
        onComplete={() => setHasCompleted(true)} 
      />
    );
  }

  return null;
};

export const EventEngine: React.FC<{
  objects: WorldObject[];
  scrollContainerRef?: React.RefObject<HTMLElement | null>;
}> = ({ objects, scrollContainerRef }) => {
  const eventObjects = useMemo(() => {
    return objects.filter(obj => ['birds', 'airplane', 'balloon', 'blimp'].includes(obj.type));
  }, [objects]);

  return (
    <>
      {eventObjects.map((event) => (
        <EventItem 
          key={event.id} 
          event={event} 
          scrollContainerRef={scrollContainerRef} 
        />
      ))}
    </>
  );
};

// ==========================================
// 7. Orchestrator Component
// ==========================================

interface LivingSkyPanelProps {
  scrollContainerRef?: React.RefObject<HTMLElement | null>;
  preset?: keyof typeof WEATHER_PRESETS;
  className?: string;
  isMirrored?: boolean;
  topics?: any[];
}

export const LivingSkyPanel: React.FC<LivingSkyPanelProps> = ({
  scrollContainerRef,
  preset = 'clear-sky',
  className,
  isMirrored = false,
  topics
}) => {
  const selectedPreset = WEATHER_PRESETS[preset] || WEATHER_PRESETS['clear-sky'];

  // Track dynamic topic positions in the DOM
  const [topicPositions, setTopicPositions] = React.useState<Record<string, number>>({});

  React.useEffect(() => {
    const container = scrollContainerRef?.current;
    if (!container || !topics || topics.length === 0) return;

    const updatePositions = () => {
      const positions: Record<string, number> = {};
      topics.forEach((topic) => {
        const card = document.getElementById(`topic-card-${topic.id}`);
        if (card) {
          const cardRect = card.getBoundingClientRect();
          const containerRect = container.getBoundingClientRect();
          // compute absolute position relative to scroll container top
          const absoluteY = cardRect.top - containerRect.top + container.scrollTop;
          positions[topic.id] = absoluteY;
        }
      });
      setTopicPositions(positions);
    };

    // Run immediately on layout effects/mounting
    updatePositions();

    window.addEventListener('resize', updatePositions);
    // Listen to container changes (like layout changes and content updates)
    const resizeObserver = new ResizeObserver(updatePositions);
    resizeObserver.observe(container);

    return () => {
      window.removeEventListener('resize', updatePositions);
      resizeObserver.disconnect();
    };
  }, [topics, scrollContainerRef]);

  // Dynamically compile absolute coordinates on-the-fly from relative spacing OR topic DOM offsets
  const compiledObjects = useMemo(() => {
    if (topics && topics.length > 0) {
      const objects: WorldObject[] = [];
      topics.forEach((topic, index) => {
        const cardY = topicPositions[topic.id];
        if (cardY === undefined) return;

        const hash = getStringHash(topic.id);

        // STAGGER VISUAL ELEMENTS TO PREVENT CLUTTER:
        // Even indexes: Render a beautiful floating island, staggered left/right to avoid the central vine/CloudMan
        if (index % 2 === 0) {
          const isLeft = (index / 2) % 2 === 0;
          const islandX = isLeft 
            ? `${10 + (hash % 15)}%`   // Left side: 10% to 25%
            : `${75 + (hash % 15)}%`;  // Right side: 75% to 90%
          objects.push({
            id: `island-${topic.id}`,
            type: 'island',
            spacingBefore: 0,
            x: islandX,
            y: cardY + 50 + (hash % 40 - 20),
            depth: 0.35 + (hash % 3) * 0.15, // 0.35, 0.5, 0.65 depth parallax
            scale: 0.55 + (hash % 3) * 0.1, // 0.55, 0.65, 0.75 scale (smaller size is cleaner and more ambient)
            opacity: 0.2 + (hash % 3) * 0.04, // 0.2 to 0.28 opacity
            shapeIndex: 1 + (hash % 3),
            bobRange: 4 + (hash % 4),
            bobDuration: 14 + (hash % 6),
            rotation: (hash % 6) - 3
          });
        } 
        // Odd indexes: Render a soft drifting cloud, also staggered to balance the screen width
        else {
          const isLeft = ((index - 1) / 2) % 2 === 0;
          const cloudX = isLeft 
            ? `${8 + (hash % 17)}%`    // Left side: 8% to 25%
            : `${75 + (hash % 15)}%`;  // Right side: 75% to 90%
          objects.push({
            id: `cloud-${topic.id}`,
            type: 'cloud',
            spacingBefore: 0,
            x: cloudX,
            y: cardY + 30 + (hash % 40 - 20),
            depth: 0.2 + (hash % 3) * 0.2, // 0.2, 0.4, 0.6 depth parallax
            scale: 0.7 + (hash % 3) * 0.1, // 0.7, 0.8, 0.9 scale
            opacity: 0.16 + (hash % 3) * 0.04, // 0.16 to 0.24 opacity
            cloudPathIdx: hash % 5,
            duration: 50 + (hash % 20),
            reverse: hash % 2 === 0,
            blur: hash % 3,
            rotation: (hash % 4) - 2
          });
        }

        // TRIGGER EVENT ONLY FOR SPECIFIC JOURNEY MILESTONES (e.g., every 3 topics to keep events rare)
        if (index % 3 === 0) {
          objects.push({
            id: `birds-flock-${topic.id}`,
            type: 'birds',
            spacingBefore: 0,
            x: '30%',
            y: cardY + 120, // Triggers as user scrolls past the card
            depth: 0.35 + (hash % 3) * 0.15,
            scale: 0.9,
            opacity: 0.55
          });
        }
      });
      return objects;
    }

    // Fallback if topics are missing
    let currentY = 100; // starting vertical padding
    return WORLD_OBJECTS.map((obj) => {
      currentY += obj.spacingBefore;
      return {
        ...obj,
        y: currentY
      };
    });
  }, [topics, topicPositions]);

  // Determine height of the compiled scene dynamically
  const totalSceneHeight = useMemo(() => {
    if (compiledObjects.length === 0) return 600;
    let maxY = 600;
    compiledObjects.forEach((obj) => {
      if (obj.y && obj.y > maxY) {
        maxY = obj.y;
      }
    });
    return maxY + 350; // padding after the last element
  }, [compiledObjects]);

  return (
    <div
      className={cn(
        "absolute inset-0 pointer-events-none select-none",
        selectedPreset.overlayGradient,
        className
      )}
      style={{
        height: `${totalSceneHeight}px`,
        // Bottom fade-out mask to prevent sharp cutoffs
        maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 85%, rgba(0,0,0,0) 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 85%, rgba(0,0,0,0) 100%)'
      }}
    >
      {/* SVG definitions */}
      <SkyEngineGradients />

      <ParallaxController scrollContainerRef={scrollContainerRef}>
        {/* Continuous Cloud Layers */}
        <CloudEngine objects={compiledObjects} isMirrored={isMirrored} />

        {/* Ambient Haze */}
        <AtmosphericHaze preset={selectedPreset} />

        {/* Ambient Floating Islands */}
        <IslandEngine objects={compiledObjects} isMirrored={isMirrored} />

        {/* Soft Sun Rays */}
        <SunRays preset={selectedPreset} />

        {/* Viewport Event Trigger Layer */}
        <EventEngine objects={compiledObjects} scrollContainerRef={scrollContainerRef} />
      </ParallaxController>
    </div>
  );
};
