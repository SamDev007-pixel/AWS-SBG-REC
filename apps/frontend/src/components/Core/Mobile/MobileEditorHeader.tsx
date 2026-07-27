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

  const badgeColor =
    badge?.toLowerCase() === 'beginner'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
      : badge?.toLowerCase() === 'intermediate'
      ? 'bg-sky-50 text-sky-700 border-sky-200/80'
      : 'bg-amber-50 text-amber-700 border-amber-200/80';

  return (
    <header className="relative w-full bg-white border-b border-slate-200/80 px-3.5 py-2.5 flex items-center justify-between gap-2 shadow-2xs lg:hidden">
      {/* Left side: Back button + Title & Badge */}
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <button
          onClick={handleBackClick}
          className="w-8 h-8 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-xl text-slate-600 transition-colors flex items-center justify-center flex-shrink-0 cursor-pointer"
          aria-label="Go Back"
          title="Go Back"
        >
          <Icons.ArrowLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-1.5 min-w-0">
          <h2 className="text-xs sm:text-sm font-bold text-slate-900 font-heading tracking-tight truncate">
            {title.replace(/\s+Content\s+Editor$/i, '')}
          </h2>
          <span className={cn('text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md border font-heading shadow-2xs flex-shrink-0', badgeColor)}>
            {badge}
          </span>
        </div>
      </div>

      {/* Right side: Modern Segmented Tab Switcher */}
      <div className="flex items-center bg-slate-100/80 rounded-xl p-1 gap-1 border border-slate-200/60 shadow-2xs flex-shrink-0">
        <button
          onClick={() => handleTabClick('slides')}
          className={cn(
            'px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer font-heading',
            currentTab === 'slides'
              ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/80 font-bold'
              : 'text-slate-500 hover:text-slate-900'
          )}
        >
          <Icons.FileText className={cn('w-3.5 h-3.5', currentTab === 'slides' ? 'text-amber-500' : 'text-slate-400')} />
          Slides
        </button>
        <button
          onClick={() => handleTabClick('quiz')}
          className={cn(
            'px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer font-heading',
            currentTab === 'quiz'
              ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/80 font-bold'
              : 'text-slate-500 hover:text-slate-900'
          )}
        >
          <Icons.HelpCircle className={cn('w-3.5 h-3.5', currentTab === 'quiz' ? 'text-amber-500' : 'text-slate-400')} />
          Quiz
        </button>
      </div>
    </header>
  );
}
