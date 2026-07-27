'use client';

import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import { motion } from 'framer-motion';
import DescriptionBulletEditor, { cleanDescription } from './DescriptionBulletEditor';

interface CreateTopicModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, description: string) => Promise<void>;
  nextTopicNumber?: number;
}

export default function CreateTopicModal({ isOpen, onClose, onSubmit, nextTopicNumber }: CreateTopicModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      const cleanedDescription = cleanDescription(description);
      await onSubmit(name.trim(), cleanedDescription);
      setName('');
      setDescription('');
      onClose();
    } catch (err) {
      // Error handled by parent
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/55 backdrop-blur-xs z-50 flex items-center justify-center p-3">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white border border-slate-180 rounded-2xl sm:rounded-3xl p-4 sm:p-6 w-full max-w-md shadow-2xl relative text-slate-800"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between gap-3 pb-3.5 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 font-heading tracking-tight">
              Create Topic
            </h3>
            {nextTopicNumber !== undefined && (
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-md font-heading uppercase tracking-wider">
                Topic {nextTopicNumber}
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-400 hover:text-slate-700 transition-colors flex items-center justify-center flex-shrink-0 cursor-pointer"
            title="Close"
          >
            <Icons.X className="w-3.5 h-3.5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="text-[11px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider block font-heading">
              Topic Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Amazon EC2 Fundamentals"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50/50 hover:bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-medium placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF9900]/15 focus:border-[#FF9900] transition-all shadow-2xs"
            />
          </div>

          <DescriptionBulletEditor
            value={description}
            onChange={setDescription}
          />

          <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100 mt-5">
            <button
              type="button"
              onClick={onClose}
              className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 font-bold px-4 py-2.5 rounded-xl transition-all shadow-2xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-[#232F3E] hover:bg-slate-800 text-white font-bold px-5 py-2.5 rounded-xl shadow-xs hover:shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create Topic'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
