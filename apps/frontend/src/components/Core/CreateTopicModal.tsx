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
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-400 hover:text-slate-700 transition-colors"
        >
          <Icons.X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-sm sm:text-base font-black text-slate-900 font-heading tracking-tight">
            Create Topic
          </h3>
          {nextTopicNumber !== undefined && (
            <span className="text-[10px] font-black text-indigo-650 bg-indigo-50 border border-indigo-150 px-2 py-0.5 rounded-md font-heading uppercase tracking-wider">
              Topic #{nextTopicNumber}
            </span>
          )}
        </div>
        <p className="text-[10px] text-slate-550 mb-4 leading-normal">
          {nextTopicNumber !== undefined 
            ? `Topic #${nextTopicNumber} will be automatically assigned and provisioned with 3 starter modules.`
            : 'A new topic automatically gets assigned the next topic number in sequence.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs font-semibold">
          <div className="space-y-1">
            <label className="font-extrabold text-slate-500 block">Topic Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Amazon EC2 Fundamentals"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 sm:px-4 sm:py-2.5 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <DescriptionBulletEditor
            value={description}
            onChange={setDescription}
          />

          <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-transparent hover:bg-slate-100 border border-slate-200 text-slate-500 font-bold px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-[#232F3E] hover:bg-slate-800 text-white font-bold px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl shadow-lg transition-all disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create Topic'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
