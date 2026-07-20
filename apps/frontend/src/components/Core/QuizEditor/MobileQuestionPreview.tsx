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
      className="fixed inset-0 z-50 bg-slate-50 flex flex-col md:hidden overflow-y-auto"
    >
      {/* Header Row */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <span className="text-xs font-black text-slate-800 font-heading">
          Student Preview
        </span>

        <button
          onClick={onBack}
          className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs py-2 px-3 rounded-xl min-h-[44px] cursor-pointer border border-slate-200 transition-colors"
        >
          <Icons.ArrowLeft className="w-4 h-4" />
          Back to Editing
        </button>
      </div>

      {/* Interactive Simulator Body */}
      <div className="flex-1 p-6 space-y-6 flex flex-col justify-between max-w-md mx-auto w-full pb-12">
        <div className="space-y-4 flex-1 flex flex-col select-text">
          {/* Progress and Level indicator */}
          <div className="flex items-center justify-between text-[10px] font-extrabold text-slate-500">
            <span>
              Question {questionIndex + 1} of {totalQuestions}
            </span>
            <span className="text-[#00cba9] font-bold uppercase tracking-wider">
              Interactive Assessment
            </span>
          </div>

          {/* Scenario Display */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm min-h-[100px] flex items-center">
            <p className="text-xs font-bold leading-relaxed text-slate-800">
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
                'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm';
              if (revealed) {
                if (isCorrect) {
                  btnStyle =
                    'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold shadow-none';
                } else if (isSelected) {
                  btnStyle =
                    'bg-rose-50 border-rose-300 text-rose-800 font-bold shadow-none';
                }
              } else if (isSelected) {
                btnStyle = 'bg-indigo-50 border-indigo-300 text-indigo-750 font-bold';
              }

              return (
                <button
                  key={idx}
                  disabled={revealed}
                  onClick={() => setSelectedIdx(idx)}
                  className={cn(
                    'w-full p-4 border rounded-2xl flex items-center gap-3 text-left font-bold transition-all min-h-[48px] cursor-pointer',
                    btnStyle
                  )}
                >
                  <span
                    className={cn(
                      'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border flex-shrink-0',
                      isSelected
                        ? 'bg-indigo-500 text-white border-indigo-500'
                        : 'bg-slate-100 border-slate-200 text-slate-400'
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
                    'rounded-2xl p-4 border text-[11px] leading-relaxed mt-4',
                    selectedIdx === question.answerIndex
                      ? 'bg-emerald-50 border-emerald-250 text-emerald-850'
                      : 'bg-rose-50 border-rose-250 text-rose-850'
                  )}
                >
                  <p className="font-extrabold flex items-center gap-1.5 mb-1.5 text-xs">
                    {selectedIdx === question.answerIndex ? (
                      <Icons.CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Icons.AlertCircle className="w-4 h-4 text-rose-500" />
                    )}
                    {selectedIdx === question.answerIndex
                      ? 'Correct Explanation!'
                      : 'Incorrect Choice'}
                  </p>
                  <p className="text-slate-650 leading-relaxed">
                    {question.explanation}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Control Button Sim Section (Min Height 44px) */}
        <div className="space-y-3 pt-4 border-t border-slate-200 mt-6 flex-shrink-0">
          {!revealed ? (
            <button
              disabled={selectedIdx === null}
              onClick={() => setRevealed(true)}
              className="w-full bg-[#00cba9] hover:bg-[#00bda0] disabled:bg-slate-200 disabled:text-slate-400 disabled:pointer-events-none text-slate-950 font-black py-3.5 rounded-2xl text-center text-xs tracking-wider transition-all shadow-md min-h-[44px] cursor-pointer"
            >
              Check Answer
            </button>
          ) : (
            <button
              onClick={() => {
                setSelectedIdx(null);
                setRevealed(false);
              }}
              className="w-full bg-slate-100 hover:bg-slate-250 text-slate-750 font-black py-3.5 rounded-2xl text-center text-xs tracking-wider transition-all border border-slate-250 min-h-[44px] cursor-pointer"
            >
              Reset Sim Selection
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
