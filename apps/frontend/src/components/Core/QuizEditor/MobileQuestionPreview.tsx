'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileQuestionPreviewProps {
  question: {
    question: string;
    options: string[];
    answerIndex: number;
    explanation: string;
  } | null;
  questionIndex: number;
  totalQuestions: number;
  onBack: () => void;
}

export default function MobileQuestionPreview({
  question,
  questionIndex,
  totalQuestions,
  onBack,
}: MobileQuestionPreviewProps) {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);

  // Reset local interactive preview states when active question changes
  useEffect(() => {
    setSelectedIdx(null);
    setRevealed(false);
  }, [questionIndex]);

  if (!question) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 15 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-x-0 bottom-0 top-[56px] z-30 bg-slate-50 flex flex-col lg:hidden overflow-y-auto no-scrollbar"
    >
      {/* Header Row */}
      <div className="sticky top-0 z-20 bg-white border-b border-slate-200/80 px-4 py-3 flex items-center justify-between shadow-2xs flex-shrink-0">
        <span className="text-xs sm:text-sm font-bold text-slate-900 font-heading">
          Student Preview
        </span>

        <button
          onClick={onBack}
          className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs py-2 px-3 rounded-xl border border-slate-200/80 transition-colors shadow-2xs font-heading cursor-pointer"
        >
          <Icons.ArrowLeft className="w-3.5 h-3.5" />
          Back to Editing
        </button>
      </div>

      {/* Interactive Simulator Body */}
      <div className="flex-1 p-6 space-y-6 flex flex-col justify-between max-w-md mx-auto w-full pb-12">
        <div className="space-y-4 flex-1 flex flex-col select-text">
          {/* Progress and Level indicator */}
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 font-heading">
            <span>
              Question {questionIndex + 1} of {totalQuestions}
            </span>
            <span className="text-amber-700 font-bold uppercase tracking-wider bg-amber-50 border border-amber-200/80 px-1.5 py-0.5 rounded-md">
              Interactive Assessment
            </span>
          </div>

          {/* Scenario Display */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs min-h-[100px] flex items-center">
            <p className="text-xs font-bold leading-relaxed text-slate-800 font-heading">
              {question.question}
            </p>
          </div>

          {/* Selection Options (Min height 48px) */}
          <div className="space-y-3 pt-2">
            {(question.options || []).map((option, idx) => {
              const letter = ['A', 'B', 'C', 'D'][idx];
              const isSelected = selectedIdx === idx;
              const isCorrect = question.answerIndex === idx;

              let btnStyle =
                'bg-white border-slate-200/80 text-slate-700 hover:bg-slate-50 shadow-2xs';
              if (revealed) {
                if (isCorrect) {
                  btnStyle =
                    'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold shadow-none';
                } else if (isSelected) {
                  btnStyle =
                    'bg-rose-50 border-rose-300 text-rose-800 font-bold shadow-none';
                }
              } else if (isSelected) {
                btnStyle = 'bg-amber-50/60 border-[#FF9900] text-amber-900 font-bold ring-2 ring-[#FF9900]/15';
              }

              return (
                <button
                  key={idx}
                  disabled={revealed}
                  onClick={() => setSelectedIdx(idx)}
                  className={cn(
                    'w-full p-3.5 border rounded-2xl flex items-center gap-3 text-left font-bold transition-all min-h-[48px] cursor-pointer font-heading',
                    btnStyle
                  )}
                >
                  <span
                    className={cn(
                      'w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold border flex-shrink-0 font-heading',
                      isSelected
                        ? 'bg-[#FF9900] text-white border-[#FF9900]'
                        : 'bg-slate-100 border-slate-200/80 text-slate-500'
                    )}
                  >
                    {letter}
                  </span>
                  <span className="flex-1 text-xs truncate leading-normal">
                    {option}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Feedback/Explanation Panel */}
          <AnimatePresence>
            {revealed && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div
                  className={cn(
                    'rounded-2xl p-4 border text-[11px] leading-relaxed mt-4 font-medium',
                    selectedIdx === question.answerIndex
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-rose-50 border-rose-200 text-rose-800'
                  )}
                >
                  <p className="font-bold flex items-center gap-1.5 mb-1.5 text-xs font-heading">
                    {selectedIdx === question.answerIndex ? (
                      <Icons.CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Icons.AlertCircle className="w-4 h-4 text-rose-600" />
                    )}
                    {selectedIdx === question.answerIndex
                      ? 'Correct Explanation!'
                      : 'Incorrect Choice'}
                  </p>
                  <p className="text-slate-600 leading-relaxed">
                    {question.explanation}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Control Button Sim Section */}
        <div className="space-y-3 pt-4 border-t border-slate-200/80 mt-6 flex-shrink-0">
          {!revealed ? (
            <button
              disabled={selectedIdx === null}
              onClick={() => setRevealed(true)}
              className="w-full bg-[#FF9900] hover:bg-amber-600 disabled:bg-slate-200 disabled:text-slate-400 disabled:pointer-events-none text-white font-bold py-2.5 rounded-xl text-center text-xs transition-all shadow-2xs cursor-pointer font-heading"
            >
              Check Answer
            </button>
          ) : (
            <button
              onClick={() => {
                setSelectedIdx(null);
                setRevealed(false);
              }}
              className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold py-2.5 rounded-xl text-center text-xs transition-all border border-slate-200/80 shadow-2xs cursor-pointer font-heading"
            >
              Reset Sim Selection
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
