'use client';

import React from 'react';
import * as Icons from 'lucide-react';

interface SlideCardProps {
  slide: {
    title: string;
    layoutType: 'text-only' | 'text-image' | 'image-only';
    imageUrl?: string;
    content: string[];
  };
  index: number;
  totalSlides: number;
  onEdit: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
}

export default function SlideCard({
  slide,
  index,
  totalSlides,
  onEdit,
  onMoveUp,
  onMoveDown,
  onDelete,
}: SlideCardProps) {
  const getLayoutLabel = (type: string) => {
    switch (type) {
      case 'image-only':
        return '🖼 Image Only';
      case 'text-image':
        return '📝🖼 Text + Image';
      default:
        return '📝 Text Only';
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 hover:border-indigo-100 transition-colors">
      {/* Top Header Section */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="space-y-0.5">
          <span className="text-[10px] font-black uppercase text-indigo-500 tracking-wider">
            Slide {index + 1}
          </span>
          <span className="text-[9.5px] text-slate-400 block font-medium">
            {getLayoutLabel(slide.layoutType)}
          </span>
        </div>
        <span className="text-[9px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-extrabold uppercase">
          Draft
        </span>
      </div>

      {/* Title & Description */}
      <div>
        <h3 className="text-sm font-black text-slate-800 tracking-tight leading-snug">
          {slide.title || 'Untitled Slide'}
        </h3>
        <p className="text-[11px] text-slate-400 mt-1.5 font-normal">
          Updated just now
        </p>
      </div>

      {/* Control Actions Row (Min Height 44px for targets) */}
      <div className="flex gap-2 pt-2">
        <button
          onClick={onEdit}
          className="flex-1 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-750 font-extrabold text-xs py-3 rounded-xl flex items-center justify-center gap-1.5 min-h-[44px] transition-all cursor-pointer"
        >
          <Icons.Edit2 className="w-3.5 h-3.5" />
          Edit
        </button>

        <button
          onClick={onMoveUp}
          disabled={index === 0}
          className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-500 disabled:opacity-30 disabled:pointer-events-none rounded-xl px-3 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
          title="Move Up"
          aria-label="Move Up"
        >
          <Icons.ChevronUp className="w-5 h-5" />
        </button>

        <button
          onClick={onMoveDown}
          disabled={index === totalSlides - 1}
          className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-500 disabled:opacity-30 disabled:pointer-events-none rounded-xl px-3 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
          title="Move Down"
          aria-label="Move Down"
        >
          <Icons.ChevronDown className="w-5 h-5" />
        </button>

        <button
          onClick={onDelete}
          disabled={totalSlides <= 1}
          className="bg-rose-50 hover:bg-rose-100 border border-rose-100 text-rose-600 disabled:opacity-30 disabled:pointer-events-none rounded-xl px-3 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
          title="Delete"
          aria-label="Delete"
        >
          <Icons.Trash className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
