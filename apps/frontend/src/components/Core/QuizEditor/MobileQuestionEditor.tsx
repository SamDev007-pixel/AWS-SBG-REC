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
          Edit Question {questionIndex + 1}
        </span>

        <button
          onClick={onPreview}
          className="bg-slate-50 hover:bg-amber-50 text-slate-700 hover:text-amber-700 border border-slate-200/80 hover:border-amber-300 font-bold text-xs px-3.5 py-2 rounded-xl transition-all shadow-2xs flex items-center gap-1.5 font-heading cursor-pointer"
        >
          <Icons.Eye className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600" />
          Preview
        </button>
      </div>

      {/* Editor Content Body */}
      <div className="flex-1 p-6 space-y-6 pb-12 select-text">
        {/* Save Status Banner */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-heading">
            Question Configuration
          </span>
          <div className="flex items-center gap-1.5 text-[10px] font-bold font-heading">
            {saveStatus === 'saving' && (
              <span className="text-[#FF9900] animate-pulse flex items-center gap-1">
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
        <div className="space-y-1.5">
          <label className="font-bold text-slate-700 text-xs block font-heading uppercase tracking-wider">
            Question Scenario
          </label>
          <textarea
            rows={4}
            value={question.question}
            onChange={(e) => updateActiveQuestion({ question: e.target.value })}
            className="w-full bg-slate-50/50 hover:bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-medium placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF9900]/15 focus:border-[#FF9900] transition-all shadow-2xs resize-none leading-relaxed min-h-[96px]"
            placeholder="Type question context and details here..."
          />
        </div>

        {/* Options A B C D and correct answer selection */}
        <div className="space-y-2">
          <label className="font-bold text-slate-700 text-xs block font-heading uppercase tracking-wider">
            Options & Correct Answer
          </label>

          <div className="space-y-2.5">
            {['A', 'B', 'C', 'D'].map((letter, optIdx) => {
              const isCorrect = question.answerIndex === optIdx;
              return (
                <div key={optIdx} className="flex items-center gap-2.5">
                  {/* Option Choice Radio button */}
                  <button
                    type="button"
                    onClick={() => updateActiveQuestion({ answerIndex: optIdx })}
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center font-bold transition-all border flex-shrink-0 text-xs font-heading cursor-pointer shadow-2xs',
                      isCorrect
                        ? 'bg-emerald-500 border-emerald-600 text-white shadow-xs'
                        : 'bg-slate-50/50 border-slate-200/80 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
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
                      'flex-1 bg-slate-50/50 hover:bg-slate-50 border rounded-xl px-3.5 py-2.5 text-slate-800 transition-all focus:bg-white focus:outline-none text-xs font-medium shadow-2xs',
                      isCorrect
                        ? 'border-emerald-500/60 ring-2 ring-emerald-500/15'
                        : 'border-slate-200 focus:border-[#FF9900] focus:ring-2 focus:ring-[#FF9900]/15'
                    )}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Explanation Textarea */}
        <div className="space-y-1.5">
          <label className="font-bold text-slate-700 text-xs block font-heading uppercase tracking-wider">
            Explanation of Correct Answer
          </label>
          <textarea
            rows={4}
            value={question.explanation}
            onChange={(e) => updateActiveQuestion({ explanation: e.target.value })}
            className="w-full bg-slate-50/50 hover:bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-medium placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF9900]/15 focus:border-[#FF9900] transition-all shadow-2xs resize-none leading-relaxed min-h-[96px]"
            placeholder="Provide context for why the marked answer is correct..."
          />
        </div>
      </div>
    </motion.div>
  );
}
