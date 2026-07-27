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
      className="lg:hidden fixed bottom-6 right-6 z-40 bg-[#FF6B00] hover:bg-orange-600 text-white rounded-full p-4 shadow-lg shadow-orange-600/30 flex items-center justify-center transition-transform active:scale-95 hover:scale-105 min-w-[56px] min-h-[56px] cursor-pointer"
      title={label}
      aria-label={label}
    >
      <Icon className="w-6 h-6 stroke-[3px]" />
    </button>
  );
}
