"use client";

import React, { useState } from 'react';
import { Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FlagImageProps {
  flag: string | null | undefined; // Legacy emoji or flagUrl
  name?: string; // Optional region/category name for fallback character
  className?: string;
  imgClassName?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000";

/**
 * Optimizes flagcdn URLs:
 * Downscaling raw vector SVGs (e.g. US 50 stars, Brazil constellations, Australia Southern Cross)
 * to 24px-28px icon sizes causes severe subpixel aliasing distortion in browsers.
 * flagcdn provides pre-rendered, supersampled high-DPI raster thumbnails (w160)
 * that render cleanly and crisply without pixel noise or distorted stripes.
 */
function getOptimizedFlagUrl(url: string): string {
  if (url && url.includes('flagcdn.com')) {
    let optimized = url.replace(/\.svg$/i, '.png');
    if (!optimized.includes('/w') && !optimized.includes('/h') && !optimized.includes('/256x192/')) {
      optimized = optimized.replace('flagcdn.com/', 'flagcdn.com/w160/');
    }
    return optimized;
  }
  return url;
}

export default function FlagImage({ flag, name, className = "w-[27px] h-[18px] rounded-[3px]", imgClassName }: FlagImageProps) {
  const [hasError, setHasError] = useState(false);

  // If missing flag or flag has error, render the fallback placeholder
  if (!flag || hasError) {
    const fallbackText = name ? name.trim().charAt(0).toUpperCase() : "";
    return (
      <div 
        className={cn(
          "flex items-center justify-center bg-slate-800 text-white rounded-[3px] font-black select-none text-[10px] border border-slate-300 shrink-0 overflow-hidden box-border",
          className
        )}
      >
        {fallbackText || <Globe size={11} className="text-slate-400" />}
      </div>
    );
  }

  const isUrl = flag.startsWith('/') || flag.startsWith('http') || flag.includes('.') || flag.includes('data:');

  if (isUrl) {
    const rawSrc = flag.startsWith('/') ? `${API_URL}${flag}` : flag;
    const src = getOptimizedFlagUrl(rawSrc);
    return (
      <div 
        className={cn(
          "relative overflow-hidden rounded-[3px] shrink-0 border border-slate-300 box-border block bg-transparent",
          className
        )}
      >
        <img 
          src={src} 
          className={cn("w-full h-full object-cover select-none pointer-events-none rounded-[3px] block", imgClassName)} 
          alt={name || "Flag"} 
          loading="eager"
          decoding="async"
          onError={() => setHasError(true)}
        />
      </div>
    );
  }

  // Legacy emoji fallback
  return (
    <div 
      className={cn(
        "flex items-center justify-center select-none shrink-0 overflow-hidden rounded-[3px] border border-slate-300 box-border bg-white",
        className
      )}
    >
      <span className="text-[inherit] leading-none select-none">{flag}</span>
    </div>
  );
}
