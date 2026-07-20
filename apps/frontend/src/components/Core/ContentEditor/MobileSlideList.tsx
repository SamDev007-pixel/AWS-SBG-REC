'use client';

import React from 'react';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import SlideCard from './SlideCard';
import FloatingActionButton from '../Mobile/FloatingActionButton';

interface MobileSlideListProps {
  slides: any[];
  onEditSlide: (index: number) => void;
  onMoveSlide: (index: number, direction: 'up' | 'down') => void;
  onDeleteSlide: (index: number) => void;
  onAddSlide: () => void;
}

export default function MobileSlideList({
  slides,
  onEditSlide,
  onMoveSlide,
  onDeleteSlide,
  onAddSlide,
}: MobileSlideListProps) {
  if (slides.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[50vh] bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 m-4">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-4">
          <Icons.Layers className="w-8 h-8" />
        </div>
        <h3 className="text-base font-black text-slate-800 font-heading">
          No slides yet
        </h3>
        <p className="text-xs text-slate-500 max-w-xs mt-1 mb-6 leading-relaxed">
          Create your first slide to begin building this lesson module curriculum path.
        </p>
        <button
          onClick={onAddSlide}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs py-3 px-6 rounded-xl flex items-center gap-1.5 shadow-sm min-h-[44px] cursor-pointer"
        >
          <Icons.Plus className="w-4 h-4" />
          Create Slide
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-6 space-y-4 pb-24"
    >
      <div className="space-y-4">
        {slides.map((slide, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <SlideCard
              slide={slide}
              index={idx}
              totalSlides={slides.length}
              onEdit={() => onEditSlide(idx)}
              onMoveUp={() => onMoveSlide(idx, 'up')}
              onMoveDown={() => onMoveSlide(idx, 'down')}
              onDelete={() => onDeleteSlide(idx)}
            />
          </motion.div>
        ))}
      </div>

      {/* Floating Add Slide FAB */}
      <FloatingActionButton
        label="Add Slide"
        icon={Icons.Plus}
        onClick={onAddSlide}
      />
    </motion.div>
  );
}
