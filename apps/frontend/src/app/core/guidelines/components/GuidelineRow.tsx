import React from 'react';
import { ArrowUp, ArrowDown, Edit3, Trash2 } from 'lucide-react';
import { LearningGuideline } from '@/types/guideline.types';
import { renderGuidelineIcon } from '@/utils/guidelineIcons';
import { getGuidelineStyles } from '@/utils/guidelineColors';

interface GuidelineRowProps {
  guideline: LearningGuideline;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  onEdit: (guideline: LearningGuideline) => void;
  onDelete: (guideline: LearningGuideline) => void;
  onMove: (id: string, direction: 'up' | 'down') => void;
}

export const GuidelineRow: React.FC<GuidelineRowProps> = ({
  guideline,
  index,
  isFirst,
  isLast,
  onEdit,
  onDelete,
  onMove,
}) => {
  const styles = getGuidelineStyles(false);

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

  return (
    <tr className="group hover:bg-slate-50/80 hover:shadow-[inset_2px_0_0_#0ea5e9] transition-all">
      {/* Reordering column */}
      <td className="px-6 py-4 whitespace-nowrap text-slate-500 font-semibold text-xs">
        <div className="flex items-center gap-1.5">
          <span className="w-5 font-mono tabular-nums text-slate-400">
            {(index + 1).toString().padStart(2, '0')}
          </span>
          <div className="flex flex-col">
            <button
              onClick={() => onMove(guideline.id, 'up')}
              disabled={isFirst}
              className={`p-0.5 rounded transition-colors ${
                isFirst
                  ? 'text-slate-200 cursor-not-allowed'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-850'
              }`}
              title="Move Up"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onMove(guideline.id, 'down')}
              disabled={isLast}
              className={`p-0.5 rounded transition-colors ${
                isLast
                  ? 'text-slate-200 cursor-not-allowed'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-850'
              }`}
              title="Move Down"
            >
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </td>

      {/* Icon column */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center border border-slate-250/60 shadow-sm text-slate-600">
          {renderGuidelineIcon(guideline.icon, 22, 'w-[22px] h-[22px] flex-shrink-0 select-none')}
        </div>
      </td>

      {/* Title & Description column */}
      <td className="px-6 py-4 max-w-[280px]">
        <div className="text-xs font-bold text-slate-800 tracking-tight font-heading truncate">
          {guideline.title}
        </div>
        <div className="text-[10px] text-slate-500 font-medium truncate mt-0.5" title={guideline.description || ''}>
          {guideline.description || 'No description provided.'}
        </div>
      </td>

      {/* Prominence badge */}
      <td className="px-6 py-4 whitespace-nowrap">
        {guideline.prominent ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-bold bg-amber-500/10 text-amber-700 border border-amber-200/50 uppercase tracking-wider font-heading">
            ★ {guideline.prominentColor || 'SKY'}
          </span>
        ) : (
          <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider font-heading">
            Standard
          </span>
        )}
      </td>

      {/* Visibility Status */}
      <td className="px-6 py-4 whitespace-nowrap">
        {guideline.isActive ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-bold bg-emerald-500/10 text-emerald-700 border border-emerald-200/20 uppercase tracking-wider font-heading">
            Active
          </span>
        ) : (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-bold bg-slate-500/10 text-slate-600 border border-slate-200/20 uppercase tracking-wider font-heading">
            Hidden
          </span>
        )}
      </td>

      {/* Last Updated Timestamp */}
      <td className="px-6 py-4 whitespace-nowrap text-[10px] text-slate-500 font-medium font-mono">
        {formatDate(guideline.updatedAt)}
      </td>

      {/* Action buttons */}
      <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-semibold">
        <div className="flex items-center justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity duration-150">
          <button
            onClick={() => onEdit(guideline)}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-sky-600 transition-all duration-150 active:scale-95 cursor-pointer"
            title="Edit Guideline"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(guideline)}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-rose-600 transition-all duration-150 active:scale-95 cursor-pointer"
            title="Delete Guideline"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};
