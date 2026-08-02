'use client';

import React from 'react';
import { ShieldAlert, RotateCcw, Cloud, PackageOpen, CheckCircle2 } from 'lucide-react';

// 1. Standard AWS Loading Spinner
export function EC2ConsoleLoader({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center space-y-3">
      <div className="relative w-8 h-8 flex items-center justify-center">
        {/* Spinner Track */}
        <div className="w-8 h-8 rounded-full border-2 border-slate-100" />
        {/* Spinning Active Border */}
        <div className="absolute top-0 left-0 w-8 h-8 rounded-full border-2 border-[#ff9900] border-t-transparent animate-spin" />
      </div>
      {message && (
        <span className="text-xs font-medium text-slate-500 font-sans tracking-wide">
          {message}
        </span>
      )}
    </div>
  );
}

// 2. Static Cloud Sync Loader
export function CloudSyncLoader({ message = 'Loading cloud data...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-10 text-center space-y-3">
      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-500 animate-pulse">
        <Cloud className="w-5 h-5" />
      </div>
      <p className="text-xs font-medium text-slate-600">{message}</p>
    </div>
  );
}

// 3. Simple Empty State
export function AnimatedEmptyState({
  title = 'No Events Discovered',
  description = 'There are no events currently scheduled matching your specific configuration criteria.',
  onClear,
}: {
  title?: string;
  description?: string;
  onClear?: () => void;
}) {
  return (
    <div className="text-center py-10 px-6 bg-white border border-slate-200 rounded-xl max-w-sm mx-auto shadow-xs flex flex-col items-center justify-center">
      <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-400 mb-3">
        <PackageOpen className="w-5 h-5 stroke-[1.8]" />
      </div>
      <h3 className="font-semibold text-sm text-slate-900 mb-1">{title}</h3>
      <p className="text-xs text-slate-500 mb-4 leading-relaxed max-w-xs">{description}</p>
      {onClear && (
        <button
          onClick={onClear}
          className="text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer"
        >
          Reset View Filters
        </button>
      )}
    </div>
  );
}

// 4. Simple Success Check
export function AnimatedSuccessCheck() {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="bg-emerald-50 border border-emerald-200 text-emerald-600 p-3 rounded-full flex items-center justify-center">
        <CheckCircle2 className="w-7 h-7 stroke-[2]" />
      </div>
    </div>
  );
}

// 5. Simple & Professional Error Alert Panel
export function ErrorAlert({
  title = 'Module Integration Fault',
  message,
  onRetry,
  retryLabel = 'Retry Service Request',
  className = '',
}: {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}) {
  return (
    <div
      className={`max-w-sm mx-auto my-8 p-6 bg-white border border-slate-200 rounded-xl shadow-xs text-center flex flex-col items-center ${className}`}
    >
      {/* Icon Badge */}
      <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center mb-3 shrink-0">
        <ShieldAlert className="w-5 h-5 stroke-[2]" />
      </div>

      {/* Title */}
      <h4 className="text-sm font-semibold text-slate-900 mb-1">
        {title}
      </h4>

      {/* Subtitle / Message */}
      <p className="text-xs text-slate-500 mb-5 leading-relaxed max-w-xs break-words">
        {message}
      </p>

      {/* Action Button */}
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center justify-center gap-2 bg-[#232F3E] hover:bg-[#1a2533] active:bg-[#141b24] text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors shadow-xs cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-300" />
          <span>{retryLabel}</span>
        </button>
      )}
    </div>
  );
}


