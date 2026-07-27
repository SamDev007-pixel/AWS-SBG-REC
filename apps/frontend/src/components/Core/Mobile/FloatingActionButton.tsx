'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface FloatingActionButtonProps {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
}

export default function FloatingActionButton({
  label,
  icon: Icon,
  onClick,
}: FloatingActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className="lg:hidden fixed bottom-6 right-6 z-40 bg-[#232F3E] hover:bg-slate-800 text-white rounded-full px-4 py-3 shadow-lg shadow-slate-900/20 border border-slate-700/30 flex items-center gap-2 transition-all active:scale-95 hover:scale-105 cursor-pointer font-heading text-xs font-bold"
      title={label}
      aria-label={label}
    >
      <Icon className="w-4 h-4 stroke-[2.5px]" />
      <span>{label}</span>
    </button>
  );
}
