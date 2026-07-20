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
      className="md:hidden fixed bottom-6 right-6 z-40 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full p-4 shadow-lg shadow-indigo-600/30 flex items-center justify-center transition-transform active:scale-95 hover:scale-105 min-w-[56px] min-h-[56px] cursor-pointer"
      title={label}
      aria-label={label}
    >
      <Icon className="w-6 h-6 stroke-[3px]" />
    </button>
  );
}
