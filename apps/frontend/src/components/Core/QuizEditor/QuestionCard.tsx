'use client';

import React from 'react';
import * as Icons from 'lucide-react';

interface QuestionCardProps {
  question: {
    question: string;
    options: string[];
    answerIndex: number;
    explanation: string;
  };
  index: number;
  totalQuestions: number;
  onEdit: () => void;
  onDelete: () => void;
}

export default function QuestionCard({
  question,
  index,
  totalQuestions,
  onEdit,
  onDelete,
}: QuestionCardProps) {
  const getLetterForIndex = (idx: number) => {
    return ['A', 'B', 'C', 'D'][idx] || 'A';
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 hover:border-amber-200 transition-colors">
      {/* Card Header details */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="space-y-0.5">
          <span className="text-[10px] font-black uppercase text-[#FF6B00] tracking-wider">
            Question {index + 1}
          </span>
          <span className="text-[9.5px] text-slate-400 block font-medium">
            Multiple Choice
          </span>
        </div>
        <span className="text-[9px] bg-emerald-50 text-emerald-700 px-2 py-0.5 border border-emerald-100 rounded font-extrabold uppercase">
          Active
        </span>
      </div>

      {/* Question Scenario & Correct Answer info */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-slate-800 tracking-tight leading-relaxed line-clamp-2">
          {question.question || 'Untitled Question Scenario'}
        </h3>
        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-semibold bg-slate-50 border border-slate-100 rounded-lg p-2 mt-2 w-fit">
          <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center font-black text-[9px]">
            {getLetterForIndex(question.answerIndex)}
          </span>
          <span>Correct Answer Choice</span>
        </div>
        <p className="text-[11px] text-slate-400 font-normal pt-1">
          Updated just now
        </p>
      </div>

      {/* Question Actions */}
      <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
        <button
          onClick={onEdit}
          className="flex-1 h-9 rounded-xl bg-amber-50/80 hover:bg-amber-100/80 text-amber-800 border border-amber-200/80 hover:border-amber-300 text-xs font-bold transition-all shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer font-heading"
        >
          <Icons.Edit2 className="w-3.5 h-3.5 text-amber-600" />
          Edit Question
        </button>

        <button
          onClick={onDelete}
          disabled={totalQuestions <= 1}
          className="w-9 h-9 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200/80 hover:border-rose-200 transition-all shadow-2xs flex items-center justify-center cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
          title="Delete Question"
          aria-label="Delete Question"
        >
          <Icons.Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
