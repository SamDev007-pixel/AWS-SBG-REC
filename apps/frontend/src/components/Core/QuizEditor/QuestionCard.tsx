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
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 hover:border-indigo-100 transition-colors">
      {/* Card Header details */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="space-y-0.5">
          <span className="text-[10px] font-black uppercase text-indigo-500 tracking-wider">
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

      {/* Question Actions (Min height 44px) */}
      <div className="flex gap-2 pt-2">
        <button
          onClick={onEdit}
          className="flex-1 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-750 font-extrabold text-xs py-3 rounded-xl flex items-center justify-center gap-1.5 min-h-[44px] cursor-pointer transition-colors"
        >
          <Icons.Edit2 className="w-3.5 h-3.5" />
          Edit Question
        </button>

        <button
          onClick={onDelete}
          disabled={totalQuestions <= 1}
          className="bg-rose-50 hover:bg-rose-100 border border-rose-100 text-rose-600 disabled:opacity-30 disabled:pointer-events-none rounded-xl px-3 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer transition-colors"
          title="Delete Question"
          aria-label="Delete Question"
        >
          <Icons.Trash className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
