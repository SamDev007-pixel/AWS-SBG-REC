'use client';

import React from 'react';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileQuestionEditorProps {
  question: {
    question: string;
    options: string[];
    answerIndex: number;
    explanation: string;
  } | null;
  questionIndex: number;
  onBack: () => void;
  onPreview: () => void;
  updateActiveQuestion: (fields: Partial<any>) => void;
  updateOptionText: (optIdx: number, val: string) => void;
  saveStatus: 'idle' | 'saving' | 'saved' | 'failed';
}

export default function MobileQuestionEditor({
  question,
  questionIndex,
  onBack,
  onPreview,
  updateActiveQuestion,
  updateOptionText,
  saveStatus,
}: MobileQuestionEditorProps) {
  if (!question) return null;

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
          className="flex items-center gap-1.5 text-slate-650 hover:text-slate-900 font-extrabold text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl min-h-[44px] cursor-pointer"
        >
          <Icons.ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <span className="text-xs font-black text-slate-800 font-heading">
          Edit Question {questionIndex + 1}
        </span>

        <button
          onClick={onPreview}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs py-2 px-4 rounded-xl min-h-[44px] shadow-sm cursor-pointer"
        >
          <Icons.Eye className="w-4 h-4" />
          Preview
        </button>
      </div>

      {/* Editor Content Body */}
      <div className="flex-1 p-6 space-y-6 pb-12 select-text">
        {/* Save Status Banner */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-heading">
            Question Configuration
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

        {/* Question Scenario Textarea */}
        <div className="space-y-2">
          <label className="font-extrabold text-slate-500 text-xs block">
            Question Scenario
          </label>
          <textarea
            rows={4}
            value={question.question}
            onChange={(e) => updateActiveQuestion({ question: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-xs focus:bg-white focus:outline-none focus:border-indigo-500 transition-colors resize-none leading-relaxed min-h-[96px]"
            placeholder="Type question context and details here..."
          />
        </div>

        {/* Options A B C D and correct answer selection */}
        <div className="space-y-3">
          <label className="font-extrabold text-slate-500 text-xs block">
            Options & Correct Answer
          </label>

          <div className="space-y-3.5">
            {['A', 'B', 'C', 'D'].map((letter, optIdx) => {
              const isCorrect = question.answerIndex === optIdx;
              return (
                <div key={optIdx} className="flex items-center gap-3">
                  {/* Option Choice Radio button - 44px min touch target */}
                  <button
                    type="button"
                    onClick={() => updateActiveQuestion({ answerIndex: optIdx })}
                    className={cn(
                      'w-11 h-11 rounded-full flex items-center justify-center font-black transition-all border flex-shrink-0 text-xs cursor-pointer',
                      isCorrect
                        ? 'bg-emerald-500 border-emerald-550 text-white shadow-md shadow-emerald-500/10'
                        : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-400 hover:bg-slate-100'
                    )}
                    aria-label={`Mark Option ${letter} as Correct`}
                  >
                    {letter}
                  </button>

                  {/* Option Text Input */}
                  <input
                    type="text"
                    value={question.options[optIdx] || ''}
                    onChange={(e) => updateOptionText(optIdx, e.target.value)}
                    placeholder={`Option ${letter} value`}
                    className={cn(
                      'flex-1 bg-slate-50 border rounded-xl px-4 py-3 text-slate-800 transition-colors focus:bg-white focus:outline-none text-xs min-h-[44px]',
                      isCorrect
                        ? 'border-emerald-500/50 focus:border-emerald-500'
                        : 'border-slate-200 focus:border-indigo-500'
                    )}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Explanation Textarea */}
        <div className="space-y-2">
          <label className="font-extrabold text-slate-500 text-xs block">
            Explanation of Correct Answer
          </label>
          <textarea
            rows={4}
            value={question.explanation}
            onChange={(e) => updateActiveQuestion({ explanation: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-xs focus:bg-white focus:outline-none focus:border-indigo-500 transition-colors resize-none leading-relaxed min-h-[96px]"
            placeholder="Provide context for why the marked answer is correct..."
          />
        </div>
      </div>
    </motion.div>
  );
}
