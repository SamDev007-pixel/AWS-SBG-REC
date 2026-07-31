'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export function FlippingBook({ className }: { className?: string }) {
  return (
    <span className={cn("relative inline-block w-5 h-5", className)} style={{ perspective: '120px' }}>
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes page-flip-y {
          0% {
            transform: rotateY(0deg);
          }
          70%, 100% {
            transform: rotateY(-180deg);
          }
        }
      `}} />

      {/* Background static book */}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="absolute inset-0 w-full h-full text-current opacity-60"
      >
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>

      {/* Turning page */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          transformOrigin: '50% 50%',
          animation: 'page-flip-y 4s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite',
          transformStyle: 'preserve-3d',
          backfaceVisibility: 'visible',
        }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-full h-full text-current"
          style={{
            backfaceVisibility: 'visible',
          }}
        >
          {/* A single page sheet (the right page outline that rotates to the left) */}
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
      </div>
    </span>
  );
}

export default FlippingBook;
