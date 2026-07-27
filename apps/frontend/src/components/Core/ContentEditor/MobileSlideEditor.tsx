'use client';

import React from 'react';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileSlideEditorProps {
  slide: {
    title: string;
    layoutType: 'text-only' | 'text-image' | 'image-only';
    imageUrl?: string;
    content: string[];
  } | null;
  slideIndex: number;
  onBack: () => void;
  onPreview: () => void;
  updateActiveSlide: (fields: Partial<any>) => void;
  handleUpdateBullet: (bulletIdx: number, val: string) => void;
  handleAddBullet: () => void;
  handleDeleteBullet: (bulletIdx: number) => void;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveImage: () => void;
  saveStatus: 'idle' | 'saving' | 'saved' | 'failed';
}

export default function MobileSlideEditor({
  slide,
  slideIndex,
  onBack,
  onPreview,
  updateActiveSlide,
  handleUpdateBullet,
  handleAddBullet,
  handleDeleteBullet,
  handleImageUpload,
  handleRemoveImage,
  saveStatus,
}: MobileSlideEditorProps) {
  if (!slide) return null;

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'tween', duration: 0.25 }}
      className="fixed inset-x-0 bottom-0 top-[56px] z-30 bg-white flex flex-col lg:hidden overflow-y-auto no-scrollbar"
    >
      {/* Editor Header Navigation */}
      <div className="sticky top-0 z-20 bg-white border-b border-slate-200/80 px-4 py-3 flex items-center justify-between shadow-2xs flex-shrink-0">
        <button
          onClick={onBack}
          className="w-9 h-9 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-xl text-slate-600 hover:text-slate-900 transition-colors flex items-center justify-center flex-shrink-0 cursor-pointer"
          aria-label="Go Back"
          title="Go Back"
        >
          <Icons.ArrowLeft className="w-4 h-4" />
        </button>

        <span className="text-xs sm:text-sm font-bold text-slate-900 font-heading tracking-tight">
          Edit Slide {slideIndex + 1}
        </span>

        <button
          onClick={onPreview}
          className="bg-slate-50 hover:bg-amber-50 text-slate-700 hover:text-amber-700 border border-slate-200/80 hover:border-amber-300 font-bold text-xs px-3.5 py-2 rounded-xl transition-all shadow-2xs flex items-center gap-1.5 font-heading cursor-pointer"
        >
          <Icons.Eye className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600" />
          Preview
        </button>
      </div>

      {/* Editor Body */}
      <div className="flex-1 p-6 space-y-6 pb-12 select-text">
        {/* Save Status Banner */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-heading">
            Slide Configuration
          </span>
          <div className="flex items-center gap-1.5 text-[10px] font-bold">
            {saveStatus === 'saving' && (
              <span className="text-[#FF6B00] animate-pulse flex items-center gap-1">
                <Icons.Loader2 className="w-3 h-3 animate-spin" /> saving...
              </span>
            )}
            {saveStatus === 'saved' && (
              <span className="text-emerald-600 flex items-center gap-1">
                <Icons.CheckCircle2 className="w-3 h-3" /> saved
              </span>
            )}
            {saveStatus === 'failed' && (
              <span className="text-rose-500 flex items-center gap-1">
                <Icons.AlertTriangle className="w-3 h-3" /> failed to save
              </span>
            )}
          </div>
        </div>

        {/* Layout Structure Select */}
        <div className="space-y-1.5">
          <label className="font-bold text-slate-700 text-xs block font-heading uppercase tracking-wider">
            Layout Structure
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: 'text-only', label: 'Text Only', icon: Icons.AlignLeft },
              { value: 'text-image', label: 'Text + Image', icon: Icons.ImagePlay },
              { value: 'image-only', label: 'Image Only', icon: Icons.Image },
            ].map((layout) => (
              <button
                key={layout.value}
                type="button"
                onClick={() => updateActiveSlide({ layoutType: layout.value as any })}
                className={cn(
                  'py-2.5 px-2 border rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all font-bold text-xs cursor-pointer font-heading shadow-2xs',
                  slide.layoutType === layout.value
                    ? 'bg-amber-50/60 border-[#FF9900] text-amber-800 ring-2 ring-[#FF9900]/15'
                    : 'bg-slate-50/50 border-slate-200/80 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                )}
              >
                <layout.icon className="w-4 h-4 text-slate-500" />
                {layout.label}
              </button>
            ))}
          </div>
        </div>

        {/* Slide Title */}
        <div className="space-y-1.5">
          <label className="font-bold text-slate-700 text-xs block font-heading uppercase tracking-wider">
            Slide Title
          </label>
          <input
            type="text"
            value={slide.title}
            onChange={(e) => updateActiveSlide({ title: e.target.value })}
            className="w-full bg-slate-50/50 hover:bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-medium placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF9900]/15 focus:border-[#FF9900] transition-all shadow-2xs"
            placeholder="e.g. Linux Filesystem Hierarchy"
          />
        </div>

        {/* Bullet points editor */}
        {slide.layoutType !== 'image-only' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-700 text-xs block font-heading uppercase tracking-wider">
                Curriculum Bullet Points
              </label>
              <button
                type="button"
                onClick={handleAddBullet}
                className="text-xs font-bold text-[#FF9900] hover:underline flex items-center gap-1 cursor-pointer font-heading"
              >
                <Icons.Plus className="w-3.5 h-3.5" />
                Add Bullet
              </button>
            </div>

            <div className="space-y-2.5">
              {(slide.content || []).map((bullet: string, bulletIdx: number) => (
                <div key={bulletIdx} className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-amber-50 border border-amber-200/80 text-amber-700 flex items-center justify-center flex-shrink-0 text-xs font-bold font-heading">
                    {bulletIdx + 1}
                  </div>
                  <input
                    type="text"
                    value={bullet}
                    onChange={(e) => handleUpdateBullet(bulletIdx, e.target.value)}
                    className="flex-1 bg-slate-50/50 hover:bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-medium placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF9900]/15 focus:border-[#FF9900] transition-all shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteBullet(bulletIdx)}
                    disabled={slide.content.length <= 1}
                    className="p-2 bg-slate-50 hover:bg-rose-50 border border-slate-200/80 hover:border-rose-200 text-slate-500 hover:text-rose-600 rounded-xl transition-all shadow-2xs cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
                  >
                    <Icons.Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Image selector */}
        {slide.layoutType !== 'text-only' && (
          <div className="space-y-2 border-t border-slate-100 pt-4">
            <label className="font-bold text-slate-700 text-xs block font-heading uppercase tracking-wider">
              Architectural Image Component
            </label>

            {slide.imageUrl ? (
              <div className="relative border border-slate-200/80 rounded-2xl p-4 bg-slate-50/50 flex flex-col items-center gap-3">
                <img
                  src={slide.imageUrl}
                  alt="Current Slide View"
                  className="max-h-[160px] object-contain rounded-lg border border-slate-200"
                />
                <div className="flex items-center gap-2 w-full">
                  <label className="flex-1 py-2 px-3 border border-slate-200/80 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl cursor-pointer text-center shadow-2xs font-heading">
                    Change Image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="py-2 px-3 border border-rose-200/80 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl cursor-pointer shadow-2xs font-heading"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <label className="border-2 border-dashed border-slate-200 hover:border-[#FF9900] rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer bg-slate-50/40 hover:bg-amber-50/20 transition-all text-center">
                <Icons.UploadCloud className="w-7 h-7 text-slate-400" />
                <span className="text-xs font-bold text-slate-700 font-heading">
                  Upload Concept Image
                </span>
                <span className="text-[10px] text-slate-400">
                  JPG, PNG, WebP (Max 5MB)
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
