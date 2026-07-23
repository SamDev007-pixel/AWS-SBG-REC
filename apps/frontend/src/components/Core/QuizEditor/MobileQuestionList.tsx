'use client';

import React from 'react';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import QuestionCard from './QuestionCard';
import FloatingActionButton from '../Mobile/FloatingActionButton';

interface MobileQuestionListProps {
  questions: any[];
  onEditQuestion: (index: number) => void;
  onDeleteQuestion: (index: number) => void;
  onAddQuestion: () => void;
}

export default function MobileQuestionList({
  questions,
  onEditQuestion,
  onDeleteQuestion,
  onAddQuestion,
}: MobileQuestionListProps) {
  if (questions.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[50vh] bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 m-4">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-4">
          <Icons.HelpCircle className="w-8 h-8" />
        </div>
        <h3 className="text-base font-black text-slate-800 font-heading">
          No questions added yet
        </h3>
        <p className="text-xs text-slate-500 max-w-xs mt-1 mb-6 leading-relaxed">
          Configure assessments to validate that students absorb this learning module.
        </p>
        <button
          onClick={onAddQuestion}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs py-3 px-6 rounded-xl flex items-center gap-1.5 shadow-sm min-h-[44px] cursor-pointer"
        >
          <Icons.Plus className="w-4 h-4" />
          Add Question
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-6 space-y-4 pb-24"
    >
      <div className="space-y-4">
        {questions.map((question, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <QuestionCard
              question={question}
              index={idx}
              totalQuestions={questions.length}
              onEdit={() => onEditQuestion(idx)}
              onDelete={() => onDeleteQuestion(idx)}
            />
          </motion.div>
        ))}
      </div>

      {/* Floating Add Question FAB */}
      <FloatingActionButton
        label="Add Question"
        icon={Icons.Plus}
        onClick={onAddQuestion}
      />
    </motion.div>
  );
}
