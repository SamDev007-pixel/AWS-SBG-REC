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
    <div className="bg-white border border-slate-200/80 hover:border-slate-300 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3.5 transition-all">
      {/* Top Header Section */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700 font-heading">
            SLIDE-{String(index + 1).padStart(2, '0')}
          </span>
          <span className="text-[10px] font-bold text-slate-500 bg-slate-50 border border-slate-200/80 px-2 py-0.5 rounded-md font-heading flex items-center gap-1">
            <Icons.FileText className="w-3 h-3 text-slate-400" />
            {slide.layoutType === 'image-only' ? 'Image Only' : slide.layoutType === 'text-image' ? 'Text + Image' : 'Text Only'}
          </span>
        </div>
        <span className="text-[9px] font-bold text-slate-500 bg-slate-50 border border-slate-200/80 px-2 py-0.5 rounded-md font-heading uppercase tracking-wider">
          Draft
        </span>
      </div>

      {/* Title & Content Snippet */}
      <div className="space-y-1">
        <h3 className="text-xs sm:text-sm font-bold text-slate-800 font-heading tracking-tight leading-snug line-clamp-1">
          {slide.title || 'Untitled Slide'}
        </h3>
        {slide.content && slide.content.length > 0 && (
          <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-2">
            {slide.content.filter(Boolean).join(' • ')}
          </p>
        )}
      </div>

      {/* Control Actions Row */}
      <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
        <button
          onClick={onEdit}
          className="flex-1 h-9 rounded-xl bg-amber-50/80 hover:bg-amber-100/80 text-amber-800 border border-amber-200/80 hover:border-amber-300 text-xs font-bold transition-all shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer font-heading"
        >
          <Icons.FileEdit className="w-3.5 h-3.5 text-amber-600" />
          Edit Slide
        </button>

        <button
          onClick={onMoveUp}
          disabled={index === 0}
          className="w-9 h-9 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-slate-600 transition-all shadow-2xs flex items-center justify-center cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
          title="Move Up"
          aria-label="Move Up"
        >
          <Icons.ChevronUp className="w-4 h-4" />
        </button>

        <button
          onClick={onMoveDown}
          disabled={index === totalSlides - 1}
          className="w-9 h-9 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-slate-600 transition-all shadow-2xs flex items-center justify-center cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
          title="Move Down"
          aria-label="Move Down"
        >
          <Icons.ChevronDown className="w-4 h-4" />
        </button>

        <button
          onClick={onDelete}
          disabled={totalSlides <= 1}
          className="w-9 h-9 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200/80 hover:border-rose-200 transition-all shadow-2xs flex items-center justify-center cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
          title="Delete"
          aria-label="Delete"
        >
          <Icons.Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
