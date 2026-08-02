'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
  menuClassName?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function CustomSelect({
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  className,
  triggerClassName,
  menuClassName,
  disabled = false,
  size = 'md',
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const sizeClasses = {
    sm: 'px-2.5 py-1.5 text-[11px] rounded-lg',
    md: 'px-3.5 py-2.5 text-xs rounded-xl',
    lg: 'px-4 py-3 text-sm rounded-xl',
  };

  return (
    <div ref={containerRef} className={cn('relative w-full select-none', className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full bg-slate-50/70 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] transition-all font-medium flex items-center justify-between text-left cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
          sizeClasses[size],
          isOpen && 'border-[#FF6B00] ring-2 ring-[#FF6B00]/20 bg-white shadow-2xs',
          triggerClassName
        )}
      >
        <span className={cn('truncate', !selectedOption && 'text-slate-400 font-normal')}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={cn(
            'w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ml-2',
            isOpen && 'rotate-180 text-[#FF6B00]'
          )}
        />
      </button>

      {isOpen && (
        <div
          className={cn(
            'absolute top-full left-0 right-0 mt-1.5 z-50 bg-white border border-slate-200 rounded-xl shadow-lg p-1.5 space-y-0.5 max-h-56 overflow-y-auto custom-scrollbar animate-in fade-in-50 zoom-in-95 duration-100',
            menuClassName
          )}
        >
          {options.length === 0 ? (
            <div className="px-3 py-2 text-xs text-slate-400 text-center font-medium">
              No options available
            </div>
          ) : (
            options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  disabled={opt.disabled}
                  onClick={() => {
                    if (!opt.disabled) {
                      onChange(opt.value);
                      setIsOpen(false);
                    }
                  }}
                  className={cn(
                    'w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-between cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed',
                    isSelected
                      ? 'bg-[#FF6B00]/10 text-[#FF6B00] font-bold'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                  )}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#FF6B00] shrink-0 ml-2 stroke-[2.5]" />}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
