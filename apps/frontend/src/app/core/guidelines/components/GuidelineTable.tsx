import React, { useState } from 'react';
import { LearningGuideline } from '@/types/guideline.types';
import { GuidelineRow } from './GuidelineRow';
import { ArrowUp, ArrowDown, Edit3, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { renderGuidelineIcon } from '@/utils/guidelineIcons';

interface GuidelineTableProps {
  guidelines: LearningGuideline[];
  onEdit: (guideline: LearningGuideline) => void;
  onDelete: (guideline: LearningGuideline) => void;
  onMove: (id: string, direction: 'up' | 'down') => void;
}

export const GuidelineTable: React.FC<GuidelineTableProps> = ({
  guidelines,
  onEdit,
  onDelete,
  onMove,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return dateStr;
    }
  };

  if (guidelines.length === 0) {
    return (
      <div className="p-8 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col items-center justify-center text-center">
        <p className="text-sm font-semibold text-slate-500 font-heading">No learning guidelines found</p>
        <p className="text-xs text-slate-400 mt-1">Try resetting filters or create a new guideline.</p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop/Tablet Table View */}
      <div className="hidden md:block rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 table-fixed">
            <thead className="bg-slate-50/70">
              <tr>
                <th scope="col" className="w-[100px] px-6 py-3.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider font-heading">
                  Order
                </th>
                <th scope="col" className="w-[80px] px-6 py-3.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider font-heading">
                  Icon
                </th>
                <th scope="col" className="w-[280px] px-6 py-3.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider font-heading">
                  Title & Description
                </th>
                <th scope="col" className="w-[120px] px-6 py-3.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider font-heading">
                  Prominence
                </th>
                <th scope="col" className="w-[100px] px-6 py-3.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider font-heading">
                  Status
                </th>
                <th scope="col" className="w-[160px] px-6 py-3.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider font-heading">
                  Last Updated
                </th>
                <th scope="col" className="w-[110px] px-6 py-3.5 text-right text-[10px] font-bold text-slate-400 uppercase tracking-wider font-heading">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {guidelines.map((guideline, index) => (
                <GuidelineRow
                  key={guideline.id}
                  guideline={guideline}
                  index={index}
                  isFirst={index === 0}
                  isLast={index === guidelines.length - 1}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onMove={onMove}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card List View (Only order, title & description visible initially. Rest is card details on click) */}
      <div className="block md:hidden space-y-3">
        {guidelines.map((guideline, index) => {
          const isExpanded = expandedId === guideline.id;
          return (
            <div
              key={guideline.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_2px_6px_rgba(0,0,0,0.015)] overflow-hidden transition-all duration-200"
            >
              {/* Header: Clickable trigger */}
              <button
                type="button"
                onClick={() => setExpandedId(isExpanded ? null : guideline.id)}
                className="w-full text-left px-4 py-4 flex items-start gap-3 hover:bg-slate-50/50 transition-colors cursor-pointer select-none"
              >
                {/* Order Index */}
                <div className="font-mono text-xs font-black text-slate-400 bg-slate-100 border border-slate-200/60 rounded-lg w-7 h-7 flex items-center justify-center flex-shrink-0 mt-0.5">
                  {(index + 1).toString().padStart(2, '0')}
                </div>

                {/* Title & Description */}
                <div className="flex-1 min-w-0 pr-2">
                  <h4 className="text-xs font-bold text-slate-800 tracking-tight font-heading leading-tight truncate">
                    {guideline.title}
                  </h4>
                  <p className="text-[10px] text-slate-400 font-medium leading-relaxed truncate mt-1">
                    {guideline.description || 'No description provided.'}
                  </p>
                </div>

                {/* Chevron status indicator */}
                <div className="flex-shrink-0 text-slate-450 mt-1">
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </div>
              </button>

              {/* Collapsed/Expanded Details Card */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-3 border-t border-slate-100 bg-slate-50/40 space-y-4 text-xs">
                  {/* Grid fields */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3.5">
                    {/* Icon */}
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider font-heading">
                        Icon
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center border border-slate-200 shadow-sm text-slate-600 flex-shrink-0">
                          {renderGuidelineIcon(guideline.icon, 20)}
                        </div>
                        <span className="text-xs text-slate-700 font-bold tracking-tight">
                          {guideline.icon.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider font-heading">
                        Status
                      </span>
                      <div className="flex items-center mt-1">
                        {guideline.isActive ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-bold bg-emerald-500/10 text-emerald-700 border border-emerald-200/20 uppercase tracking-wider font-heading">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-bold bg-slate-500/10 text-slate-600 border border-slate-200/20 uppercase tracking-wider font-heading">
                            Hidden
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Prominence */}
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider font-heading">
                        Prominence
                      </span>
                      <div className="flex items-center mt-1">
                        {guideline.prominent ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold bg-amber-500/10 text-amber-700 border border-amber-200/30 uppercase tracking-wider font-heading">
                            ★ {guideline.prominentColor || 'SKY'}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-heading">
                            Standard
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Last Updated */}
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider font-heading">
                        Last Updated
                      </span>
                      <div className="text-slate-500 font-mono text-[9px] font-semibold mt-1">
                        {formatDate(guideline.updatedAt)}
                      </div>
                    </div>
                  </div>

                  {/* Actions (Reordering & Edit/Delete) */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    {/* Reorder Buttons */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onMove(guideline.id, 'up');
                        }}
                        disabled={index === 0}
                        className={`p-2 border rounded-xl transition-all ${
                          index === 0
                            ? 'border-slate-100 text-slate-300 cursor-not-allowed bg-slate-50/50'
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-800 shadow-sm active:scale-95 cursor-pointer'
                        }`}
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onMove(guideline.id, 'down');
                        }}
                        disabled={index === guidelines.length - 1}
                        className={`p-2 border rounded-xl transition-all ${
                          index === guidelines.length - 1
                            ? 'border-slate-100 text-slate-300 cursor-not-allowed bg-slate-50/50'
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-800 shadow-sm active:scale-95 cursor-pointer'
                        }`}
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Edit/Delete Buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(guideline);
                        }}
                        className="flex items-center gap-1 px-3 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-sky-600 rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer text-[11px] font-bold uppercase tracking-wider font-heading"
                      >
                        <Edit3 className="w-3 h-3 text-slate-500" />
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(guideline);
                        }}
                        className="flex items-center gap-1 px-3 py-2 border border-slate-200 bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer text-[11px] font-bold uppercase tracking-wider font-heading"
                      >
                        <Trash2 className="w-3 h-3 text-rose-500" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
};
