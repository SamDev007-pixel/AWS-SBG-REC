'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DescriptionBulletEditorProps {
  value: string;
  onChange: (serializedValue: string) => void;
}

export const parseDescriptionToBullets = (text: string): string[] => {
  if (!text || !text.trim()) return [''];

  const lines = text.split(/\r?\n/).map(line => line.trim());
  const bullets: string[] = [];

  for (const line of lines) {
    if (!line) continue;
    // Strip leading bullets / list markers
    const cleanLine = line
      .replace(/^[\s\-*•+\u2022\u2023\u25E6\u2043]+/, '')
      .replace(/^\d+\.\s+/, '')
      .trim();
    if (cleanLine) {
      bullets.push(cleanLine);
    }
  }

  return bullets.length > 0 ? bullets : [text.trim()];
};

export const serializeBulletsToDescription = (bullets: string[]): string => {
  return bullets
    .map(b => b.trim())
    .map(b => b ? `• ${b}` : '')
    .join('\n');
};

export const cleanDescription = (desc: string): string => {
  if (!desc) return '';
  return desc
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => {
      const clean = line.replace(/^[\s\-*•+\u2022\u2023\u25E6\u2043]+/, '').trim();
      return clean.length > 0;
    })
    .join('\n');
};

export default function DescriptionBulletEditor({
  value,
  onChange
}: DescriptionBulletEditorProps) {
  const [bullets, setBullets] = useState<string[]>(['']);
  const [focusIndex, setFocusIndex] = useState<number | null>(null);
  const inputRefs = useRef<Array<HTMLTextAreaElement | null>>([]);
  const lastPropagatedValueRef = useRef<string>('');

  // Sync prop changes from outside (e.g. initial load)
  useEffect(() => {
    if (value !== lastPropagatedValueRef.current) {
      const parsed = parseDescriptionToBullets(value);
      setBullets(parsed);
      lastPropagatedValueRef.current = value;
    }
  }, [value]);

  const updateBullets = (newBullets: string[]) => {
    setBullets(newBullets);
    const serialized = serializeBulletsToDescription(newBullets);
    lastPropagatedValueRef.current = serialized;
    onChange(serialized);
  };

  const handleInputChange = (index: number, val: string) => {
    const updated = [...bullets];
    updated[index] = val;
    updateBullets(updated);
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const updated = [...bullets];
      updated.splice(index + 1, 0, '');
      updateBullets(updated);
      setFocusIndex(index + 1);
    } else if (e.key === 'Backspace' && bullets[index] === '') {
      e.preventDefault();
      if (bullets.length <= 1) return;

      const updated = bullets.filter((_, idx) => idx !== index);
      updateBullets(updated);
      setFocusIndex(index > 0 ? index - 1 : 0);
    }
  };

  const addBulletRow = () => {
    const updated = [...bullets, ''];
    updateBullets(updated);
    setFocusIndex(updated.length - 1);
  };

  const removeBulletRow = (index: number) => {
    if (bullets.length <= 1) {
      updateBullets(['']);
      return;
    }
    const updated = bullets.filter((_, idx) => idx !== index);
    updateBullets(updated);
    setFocusIndex(index > 0 ? index - 1 : 0);
  };

  // Adjust height dynamically for autogrowing textarea
  const adjustHeight = (el: HTMLTextAreaElement | null) => {
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  };

  // Set focus selection
  useEffect(() => {
    if (focusIndex !== null && inputRefs.current[focusIndex]) {
      const el = inputRefs.current[focusIndex];
      el?.focus();
      const len = el?.value.length || 0;
      el?.setSelectionRange(len, len);
      setFocusIndex(null);
    }
  }, [focusIndex, bullets]);

  return (
    <div className="space-y-2">
      <label className="text-[11px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider block font-heading">
        Description Bullets
      </label>
      
      <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-0.5">
        <AnimatePresence initial={false}>
          {bullets.map((bullet, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="flex items-start gap-2 group"
            >
              {/* Autogrowing textarea input with integrated bullet prefix */}
              <div className="flex-1 min-w-0 relative flex items-center">
                <div className="absolute left-3 top-2.5 pointer-events-none flex items-center justify-center text-[#FF9900] font-black text-sm select-none">
                  •
                </div>
                <textarea
                  ref={(el) => {
                    inputRefs.current[idx] = el;
                    adjustHeight(el);
                  }}
                  rows={1}
                  value={bullet}
                  placeholder={`Bullet point ${idx + 1}`}
                  onChange={(e) => {
                    handleInputChange(idx, e.target.value);
                    adjustHeight(e.target);
                  }}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className="w-full bg-slate-50/50 hover:bg-slate-50 border border-slate-200 rounded-xl pl-7 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF9900]/15 focus:border-[#FF9900] transition-all resize-none leading-relaxed overflow-hidden font-medium shadow-2xs"
                />
              </div>

              {/* Trash button to delete row */}
              {bullets.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeBulletRow(idx)}
                  className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-400 hover:text-rose-600 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 flex-shrink-0 flex items-center justify-center cursor-pointer mt-0.5"
                  title="Remove bullet"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <button
        type="button"
        onClick={addBulletRow}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50/80 hover:bg-amber-100/80 border border-amber-200/80 text-[#FF9900] text-xs font-bold transition-all cursor-pointer shadow-2xs mt-1"
      >
        <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
        Add Bullet
      </button>
    </div>
  );
}
