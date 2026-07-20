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
      className="fixed inset-0 z-50 bg-white flex flex-col md:hidden overflow-y-auto"
    >
      {/* Editor Header Navigation */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 font-extrabold text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl min-h-[44px] cursor-pointer"
        >
          <Icons.ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <span className="text-xs font-black text-slate-800 font-heading">
          Edit Slide {slideIndex + 1}
        </span>

        <button
          onClick={onPreview}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs py-2 px-4 rounded-xl min-h-[44px] shadow-sm cursor-pointer"
        >
          <Icons.Eye className="w-4 h-4" />
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
              <span className="text-indigo-500 animate-pulse flex items-center gap-1">
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
        <div className="space-y-2">
          <label className="font-extrabold text-slate-500 text-xs block">
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
                  'py-3 px-2 border rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all font-bold text-[10px] min-h-[48px] cursor-pointer',
                  slide.layoutType === layout.value
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                )}
              >
                <layout.icon className="w-4 h-4" />
                {layout.label}
              </button>
            ))}
          </div>
        </div>

        {/* Slide Title */}
        <div className="space-y-2">
          <label className="font-extrabold text-slate-500 text-xs block">
            Slide Title
          </label>
          <input
            type="text"
            value={slide.title}
            onChange={(e) => updateActiveSlide({ title: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-850 text-xs focus:bg-white focus:outline-none focus:border-indigo-500 transition-colors min-h-[44px]"
            placeholder="Slide Title"
          />
        </div>

        {/* Bullet points editor */}
        {slide.layoutType !== 'image-only' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-extrabold text-slate-500 text-xs block">
                Curriculum Bullet Points
              </label>
              <button
                type="button"
                onClick={handleAddBullet}
                className="text-xs font-black text-cyan-600 border border-cyan-200 bg-cyan-50/50 rounded-xl px-3 py-2 hover:bg-cyan-100 flex items-center gap-1 min-h-[44px] cursor-pointer shadow-sm"
              >
                <Icons.Plus className="w-4 h-4" />
                Add Bullet
              </button>
            </div>

            <div className="space-y-3">
              {(slide.content || []).map((bullet: string, bulletIdx: number) => (
                <div key={bulletIdx} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center flex-shrink-0 text-[10px] font-extrabold border border-emerald-100">
                    {bulletIdx + 1}
                  </div>
                  <input
                    type="text"
                    value={bullet}
                    onChange={(e) => handleUpdateBullet(bulletIdx, e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-slate-800 text-xs focus:bg-white focus:outline-none focus:border-indigo-500 transition-colors min-h-[44px]"
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteBullet(bulletIdx)}
                    disabled={slide.content.length <= 1}
                    className="p-3 bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-450 hover:text-rose-600 rounded-xl disabled:opacity-30 disabled:pointer-events-none min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer transition-colors"
                  >
                    <Icons.Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Image selector */}
        {slide.layoutType !== 'text-only' && (
          <div className="space-y-2 border-t border-slate-100 pt-4">
            <label className="font-extrabold text-slate-500 text-xs block">
              Architectural Image Component
            </label>

            {slide.imageUrl ? (
              <div className="relative border border-slate-200 rounded-2xl p-4 bg-slate-50/50 flex flex-col items-center gap-3">
                <img
                  src={slide.imageUrl}
                  alt="Current Slide View"
                  className="max-h-[160px] object-contain rounded-lg border border-slate-200"
                />
                <div className="flex items-center gap-2 w-full">
                  <label className="flex-1 py-3 px-3 border border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-black rounded-xl cursor-pointer text-center min-h-[44px] flex items-center justify-center transition-colors">
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
                    className="py-3 px-4 border border-rose-100 bg-rose-50 hover:bg-rose-100 text-rose-600 text-[11px] font-black rounded-xl min-h-[44px] flex items-center justify-center cursor-pointer transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <label className="border-2 border-dashed border-slate-200 hover:border-indigo-500 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer bg-slate-50/40 hover:bg-indigo-50/20 transition-all text-center min-h-[120px]">
                <Icons.UploadCloud className="w-8 h-8 text-slate-400" />
                <span className="text-[11px] font-black text-slate-600">
                  Upload Concept Image
                </span>
                <span className="text-[9px] text-slate-400 font-semibold">
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
