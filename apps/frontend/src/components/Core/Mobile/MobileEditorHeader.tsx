'use client';

import React from 'react';
import * as Icons from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileEditorHeaderProps {
  title: string;
  badge: string;
  currentTab: 'slides' | 'quiz';
  isDirty: boolean;
  onBack: () => void;
  onTabChange: (tab: 'slides' | 'quiz') => void;
}

export default function MobileEditorHeader({
  title,
  badge,
  currentTab,
  isDirty,
  onBack,
  onTabChange,
}: MobileEditorHeaderProps) {
  const handleTabClick = (tab: 'slides' | 'quiz') => {
    if (tab === currentTab) return;
    if (isDirty) {
      const proceed = window.confirm(
        'You have unsaved changes. Are you sure you want to leave and switch tabs?'
      );
      if (!proceed) return;
    }
    onTabChange(tab);
  };

  const handleBackClick = () => {
    if (isDirty) {
      const proceed = window.confirm(
        'You have unsaved changes. Are you sure you want to leave?'
      );
      if (!proceed) return;
    }
    onBack();
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-white border-b border-slate-200 px-6 py-4 flex flex-col gap-4 shadow-sm md:hidden">
      {/* Top row: Back button & Title details */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleBackClick}
          className="p-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-500 hover:text-slate-800 transition-colors shadow-sm min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
          aria-label="Go Back"
        >
          <Icons.ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-black uppercase text-cyan-600 tracking-widest bg-cyan-50 border border-cyan-100 px-2 py-0.5 rounded-md font-heading">
              {badge}
            </span>
          </div>
          <h2 className="text-sm font-black text-slate-800 font-heading tracking-tight leading-tight truncate mt-0.5">
            {title}
          </h2>
        </div>
      </div>

      {/* Bottom row: Tabs Switcher */}
      <div className="flex items-center bg-slate-100 rounded-xl p-1 gap-1 w-full max-w-[280px] self-center">
        <button
          onClick={() => handleTabClick('slides')}
          className={cn(
            'flex-1 text-center py-2 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center min-h-[36px] cursor-pointer',
            currentTab === 'slides'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          )}
        >
          <Icons.FileText className="w-3.5 h-3.5 mr-1.5" />
          Slides
        </button>
        <button
          onClick={() => handleTabClick('quiz')}
          className={cn(
            'flex-1 text-center py-2 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center min-h-[36px] cursor-pointer',
            currentTab === 'quiz'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          )}
        >
          <Icons.HelpCircle className="w-3.5 h-3.5 mr-1.5" />
          Quiz
        </button>
      </div>
    </header>
  );
}
