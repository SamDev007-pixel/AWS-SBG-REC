'use client';

import React from 'react';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { LearningContentRenderer } from '@/components/Roadmap/LearningContentRenderer';

interface MobileSlidePreviewProps {
  slide: {
    title: string;
    layoutType: 'text-only' | 'text-image' | 'image-only';
    imageUrl?: string;
    content: string[];
  } | null;
  slideIndex: number;
  totalSlides: number;
  iconName: string;
  onBack: () => void;
  onPrevSlide: () => void;
  onNextSlide: () => void;
}

export default function MobileSlidePreview({
  slide,
  slideIndex,
  totalSlides,
  iconName,
  onBack,
  onPrevSlide,
  onNextSlide,
}: MobileSlidePreviewProps) {
  if (!slide) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 15 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-50 bg-slate-50 flex flex-col md:hidden overflow-y-auto"
    >
      {/* Sticky Header Row */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <span className="text-xs font-black text-slate-800 font-heading">
          Student Preview
        </span>

        <button
          onClick={onBack}
          className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs py-2 px-3 rounded-xl min-h-[44px] cursor-pointer border border-slate-200 transition-colors"
        >
          <Icons.ArrowLeft className="w-4 h-4" />
          Back to Editing
        </button>
      </div>

      {/* Preview Content Area */}
      <div className="flex-1 p-6 space-y-6 flex flex-col justify-between max-w-md mx-auto w-full pb-12">
        <div className="space-y-4">
          {/* Progress row */}
          <div className="flex items-center justify-between text-[10px] font-extrabold text-slate-500">
            <span>
              Slide {slideIndex + 1} of {totalSlides}
            </span>
            <span className="text-emerald-650 font-bold uppercase tracking-wider">
              Curriculum Preview
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 w-full bg-slate-250 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-300"
              style={{
                width: `${((slideIndex + 1) / (totalSlides || 1)) * 100}%`,
              }}
            />
          </div>

          {/* Learning Card view container */}
          <div className="bg-white rounded-3xl p-5 shadow-xl text-slate-800 min-h-[360px] flex flex-col justify-between border border-slate-100 select-text">
            <LearningContentRenderer
              title={slide.title}
              bullets={slide.layoutType === 'image-only' ? [] : slide.content}
              layout={slide.layoutType || 'text-only'}
              iconName={iconName || 'Boxes'}
              imageUrl={slide.imageUrl}
            />
          </div>
        </div>

        {/* Modal Bottom buttons simulation (Min Height 44px) */}
        <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-200 mt-6 flex-shrink-0">
          <button
            disabled={slideIndex === 0}
            onClick={onPrevSlide}
            className="flex-1 px-4.5 py-3 rounded-xl border border-slate-200 text-slate-650 hover:text-slate-900 bg-white hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none text-xs font-black flex items-center justify-center gap-1.5 shadow-sm min-h-[44px] cursor-pointer transition-colors"
          >
            <Icons.ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <button
            disabled={slideIndex === totalSlides - 1}
            onClick={onNextSlide}
            className="flex-1 px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-450 text-white disabled:opacity-30 disabled:pointer-events-none text-xs font-black flex items-center justify-center gap-1.5 shadow-sm min-h-[44px] cursor-pointer transition-colors"
          >
            Next Slide
            <Icons.ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
