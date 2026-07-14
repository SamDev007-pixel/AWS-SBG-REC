'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  WifiOff,
  ServerCrash,
  Clock,
  Lock,
  UserX,
  AlertTriangle,
  RefreshCw,
  Home,
  LucideIcon
} from 'lucide-react';
import Link from 'next/link';
import { SkyBackground } from '@/components/Roadmap/SkyBackground';
import { LearningErrorType, LearningPageError } from '@/app/learn/error-types';

interface LearningErrorViewProps {
  error: Error & { type?: LearningErrorType; status?: number };
  reset: () => void;
}

interface ErrorDisplayConfig {
  title: string;
  subtitle: string;
  badge: string;
  colorClass: string;
  icon: LucideIcon;
}

const ERROR_CONFIGS: Record<LearningErrorType, ErrorDisplayConfig> = {
  network: {
    title: 'Connection Lost',
    subtitle: "We couldn't reach the learning server. Please check your internet connection and try again.",
    badge: 'Network Connection',
    colorClass: 'text-amber-500 bg-amber-500/10 border-amber-500/20 drop-shadow-[0_0_8px_rgba(245,158,11,0.15)]',
    icon: WifiOff
  },
  server: {
    title: 'Learning Service Unavailable',
    subtitle: 'The AWS learning service is temporarily offline. Please try again shortly.',
    badge: 'Server Offline',
    colorClass: 'text-rose-500 bg-rose-500/10 border-rose-500/20 drop-shadow-[0_0_8px_rgba(244,63,94,0.15)]',
    icon: ServerCrash
  },
  timeout: {
    title: 'Request Timeout',
    subtitle: 'The server took too long to respond. Please check your network speed or try again.',
    badge: 'Timeout Error',
    colorClass: 'text-yellow-600 bg-yellow-500/10 border-yellow-500/20 drop-shadow-[0_0_8px_rgba(234,179,8,0.15)]',
    icon: Clock
  },
  unauthorized: {
    title: 'Session Expired',
    subtitle: 'Your authentication session has expired. Please log in again to continue your journey.',
    badge: 'Session Expired',
    colorClass: 'text-sky-500 bg-sky-500/10 border-sky-500/20 drop-shadow-[0_0_8px_rgba(56,189,248,0.15)]',
    icon: UserX
  },
  forbidden: {
    title: 'Access Denied',
    subtitle: "You do not have the required permissions to access this learning resource.",
    badge: 'Access Denied',
    colorClass: 'text-violet-500 bg-violet-500/10 border-violet-500/20 drop-shadow-[0_0_8px_rgba(139,92,246,0.15)]',
    icon: Lock
  },
  unknown: {
    title: 'Unable to Load Learning Journey',
    subtitle: 'Something went wrong while compiling your progress. Please try again.',
    badge: 'System Failure',
    colorClass: 'text-slate-500 bg-slate-500/10 border-slate-500/20 drop-shadow-[0_0_8px_rgba(100,116,139,0.15)]',
    icon: AlertTriangle
  }
};

export default function LearningErrorView({ error, reset }: LearningErrorViewProps) {
  const [isRetrying, setIsRetrying] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Fallback to unknown if type is not recognized
  const type = (error?.type && ERROR_CONFIGS[error.type]) ? error.type : 'unknown';
  const config = ERROR_CONFIGS[type];
  const IconComponent = config.icon;

  const handleRetryClick = () => {
    if (isRetrying) return;
    setIsRetrying(true);
    setTimeout(() => {
      reset();
      setIsRetrying(false);
    }, 850);
  };

  // Weather physics / canvas particles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Rain drop model
    interface Drop {
      x: number;
      y: number;
      length: number;
      speed: number;
      opacity: number;
      width: number;
      layer: 'fg' | 'md' | 'bg';
    }

    const drops: Drop[] = [];
    const maxDrops = 150; // Optimized drop density for lighter sky overlay

    // Initialize multi-layered rain
    for (let i = 0; i < maxDrops; i++) {
      const layerRand = Math.random();
      let layer: 'fg' | 'md' | 'bg' = 'md';
      let speed = 15 + Math.random() * 5;
      let length = 14 + Math.random() * 8;
      let opacity = 0.35 + Math.random() * 0.25;
      let dropWidth = 1.2;

      if (layerRand < 0.2) {
        layer = 'fg'; // Foreground: larger, faster, brighter blue
        speed = 22 + Math.random() * 5;
        length = 24 + Math.random() * 10;
        opacity = 0.6 + Math.random() * 0.25;
        dropWidth = 1.8;
      } else if (layerRand > 0.8) {
        layer = 'bg'; // Background: thinner, slower, lighter blue
        speed = 10 + Math.random() * 4;
        length = 8 + Math.random() * 5;
        opacity = 0.15 + Math.random() * 0.15;
        dropWidth = 0.8;
      }

      drops.push({
        x: Math.random() * (width + 200) - 100,
        y: Math.random() * height - height,
        length,
        speed,
        opacity,
        width: dropWidth,
        layer
      });
    }

    // Splashes model
    interface Splash {
      x: number;
      y: number;
      r: number;
      maxR: number;
      opacity: number;
      speed: number;
    }
    const splashes: Splash[] = [];

    // Wind direction parameters (slant angle between 20-30 degrees)
    const angle = 22 * (Math.PI / 180); 
    const windX = Math.sin(angle);
    const windY = Math.cos(angle);

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Render rain drops
      drops.forEach((drop) => {
        ctx.beginPath();
        // Clear sky-blue rain drops
        ctx.strokeStyle = '#0284c7';
        ctx.globalAlpha = drop.opacity;
        ctx.lineWidth = drop.width;
        
        // Compute slanting positions
        const endX = drop.x + drop.length * windX;
        const endY = drop.y + drop.length * windY;
        
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        // Update movement
        drop.y += drop.speed * windY;
        drop.x += drop.speed * windX;

        // Reset if off-screen
        if (drop.y > height) {
          drop.y = -drop.length;
          drop.x = Math.random() * (width + 200) - 150;
          
          // Generate splashes at the bottom of the screen
          if (drop.layer !== 'bg' && Math.random() < 0.28) {
            splashes.push({
              x: drop.x,
              y: height - 5 - Math.random() * 35, // splat near wet bottom
              r: 0.5,
              maxR: drop.layer === 'fg' ? 4 + Math.random() * 3 : 2 + Math.random() * 1.5,
              opacity: drop.opacity * 0.7,
              speed: 0.08 + Math.random() * 0.08
            });
          }
        }
        if (drop.x > width + 150) {
          drop.x = -50;
        }
      });

      // Render ground splash ripples
      ctx.globalAlpha = 1.0;
      for (let i = splashes.length - 1; i >= 0; i--) {
        const splash = splashes[i];
        ctx.beginPath();
        ctx.strokeStyle = `rgba(14, 165, 233, ${splash.opacity})`; // Clear blue ripples
        ctx.lineWidth = 0.6;
        ctx.ellipse(splash.x, splash.y, splash.r * 1.5, splash.r * 0.4, 0, 0, Math.PI * 2);
        ctx.stroke();

        splash.r += splash.speed * 8;
        splash.opacity -= splash.speed;

        if (splash.opacity <= 0) {
          splashes.splice(i, 1);
        }
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full bg-gradient-to-b from-[#bae6fd] via-[#e0f2fe] to-[#f0f9ff] flex flex-col items-center justify-center overflow-hidden font-sans select-none z-[100]">
      {/* Original Living Sky theme background clouds and stars */}
      <SkyBackground />

      {/* Thunderstorm stylesheet */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes thunderstorm-atmosphere {
          /* Normal State: 0% to 87% (first 4.35s) */
          0%, 87%, 96%, 100% {
            background-color: rgba(0, 0, 0, 0);
            backdrop-filter: brightness(1) contrast(1) saturate(1);
          }
          
          /* 88% (4.4s): Atmosphere begins to darken to storm grey-blue */
          88% {
            background-color: rgba(54, 70, 87, 0.12);
            backdrop-filter: brightness(0.8) contrast(1.1) saturate(0.9);
          }

          /* 89% (4.45s): First lightning strike (white flash, 30-50ms) */
          89% {
            background-color: rgba(255, 255, 255, 0.85);
            backdrop-filter: brightness(1.7) contrast(1.05) saturate(0.95);
          }

          /* 90% (4.5s): Decay to grey-blue storm tint (remaining for 100ms) */
          90% {
            background-color: rgba(54, 70, 87, 0.35);
            backdrop-filter: brightness(0.55) contrast(1.35) saturate(0.65);
          }

          /* 92% (4.6s): Second lightning strike (white flash, 30ms) */
          92% {
            background-color: rgba(255, 255, 255, 0.75);
            backdrop-filter: brightness(1.6) contrast(1.1) saturate(0.9);
          }

          /* 93% (4.65s): Decay back to grey-blue storm tint */
          93% {
            background-color: rgba(71, 89, 109, 0.28);
            backdrop-filter: brightness(0.65) contrast(1.25) saturate(0.75);
          }

          /* 95% (4.75s): Smoothly fading back to normal */
          95% {
            background-color: rgba(71, 89, 109, 0.05);
            backdrop-filter: brightness(0.9) contrast(1.05) saturate(0.9);
          }
        }
      `}} />

      {/* Full-Screen Atmospheric Thunderstorm Flash Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none z-[20]"
        style={{ animation: 'thunderstorm-atmosphere 5s ease-in-out infinite' }}
      />

      {/* Canvas Rain Overlay (Foreground, Middle, Background + Splashes) */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full pointer-events-none z-[5]"
      />

      {/* Main Container */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-md p-8 mx-4 text-center select-none pointer-events-auto">
        
        {/* Dripping Water Badge (Circle Container) */}
        <div className="relative w-16 h-16 mb-6 flex items-center justify-center select-none">
          {/* Circle Badge (Static, styled like info icon) */}
          <div className="w-16 h-16 rounded-full border border-slate-200/60 bg-white flex items-center justify-center shadow-[0_8px_20px_rgba(15,23,42,0.06)] relative z-10">
            {/* Volumetric cloud SVG inside the circle (Static) */}
            <svg
              viewBox="0 0 200 100"
              className="w-10 h-7 drop-shadow-[0_2px_6px_rgba(15,23,42,0.05)] text-slate-400 overflow-visible"
            >
              {/* Cloud Path */}
              <path
                d="M 30,70 A 20,20 0 0,1 60,40 A 25,25 0 0,1 110,30 A 22,22 0 0,1 150,45 A 18,18 0 0,1 180,70 A 10,10 0 0,1 170,80 L 30,80 A 10,10 0 0,1 30,70 Z"
                fill="url(#cloudIconGrad)"
                stroke="#cbd5e1"
                strokeWidth="2"
              />

              {/* Glowing Lightning Bolt inside the cloud */}
              <motion.path
                d="M105,50 L88,78 L102,78 L94,98 L116,68 L102,68 Z"
                fill="url(#lightningGrad)"
                stroke="#FDE047"
                strokeWidth="1.5"
                strokeLinejoin="round"
                className="drop-shadow-[0_0_8px_rgba(250,204,21,0.85)]"
                animate={{ 
                  opacity: [0.1, 1, 0.2, 1, 0.1, 0.1, 0.9, 0.1],
                  scale: [0.95, 1.05, 0.98, 1, 0.95, 0.95, 1.02, 0.95]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  times: [0, 0.05, 0.08, 0.12, 0.18, 0.7, 0.75, 0.8]
                }}
              />

              <defs>
                <linearGradient id="cloudIconGrad" x1="30" y1="30" x2="180" y2="80" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#ffffff" stopOpacity="0.95" />
                  <stop offset="0.5" stopColor="#f1f5f9" stopOpacity="0.85" />
                  <stop offset="1" stopColor="#e2e8f0" stopOpacity="0.95" />
                </linearGradient>
                <linearGradient id="lightningGrad" x1="105" y1="50" x2="94" y2="98" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#FEF08A" />
                  <stop offset="0.6" stopColor="#FACC15" />
                  <stop offset="1" stopColor="#CA8A04" />
                </linearGradient>
              </defs>
            </svg>
          </div>

        </div>

        {/* Error Tag */}
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider border mb-4 shadow-sm bg-white border-slate-200/50 ${config.colorClass.split(' ').slice(0, 1).join(' ')}`}>
          {config.badge}
        </span>

        {/* Headline */}
        <h1 className="text-2xl font-black text-slate-800 tracking-tight font-heading mb-3">
          {config.title}
        </h1>

        {/* Supporting copy */}
        <p className="text-xs text-slate-500 leading-relaxed max-w-sm mb-8 font-sans px-4">
          {config.subtitle}
        </p>

        {/* Actions Layout */}
        <div className="flex flex-row gap-3 w-full px-4">
          {/* Primary Action: Retry */}
          <button
            onClick={handleRetryClick}
            disabled={isRetrying}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-[0_4px_12px_rgba(14,165,233,0.25)] hover:shadow-[0_6px_16px_rgba(14,165,233,0.35)] active:scale-[0.98] disabled:opacity-80 uppercase tracking-widest font-heading cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
            {isRetrying ? 'Retrying...' : 'Retry'}
          </button>

          {/* Secondary Action: Return Home */}
          <Link
            href="/"
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-white hover:bg-slate-50 border border-slate-200/80 text-slate-700 text-xs font-bold rounded-xl transition-all shadow-[0_2px_6px_rgba(15,23,42,0.02)] active:scale-[0.98] uppercase tracking-widest font-heading"
          >
            <Home className="w-3.5 h-3.5" />
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
