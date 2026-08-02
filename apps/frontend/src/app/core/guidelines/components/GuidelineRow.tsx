import React, { useState } from 'react';
import { GripVertical, Edit3, Trash2 } from 'lucide-react';
import { LearningGuideline } from '@/types/guideline.types';
import { renderGuidelineIcon } from '@/utils/guidelineIcons';

interface GuidelineRowProps {
  guideline: LearningGuideline;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  onEdit: (guideline: LearningGuideline) => void;
  onDelete: (guideline: LearningGuideline) => void;
  onMove: (id: string, direction: 'up' | 'down') => void;
  onDropRow?: (draggedIndex: number, targetIndex: number) => void;
}

export const GuidelineRow: React.FC<GuidelineRowProps> = ({
  guideline,
  index,
  isFirst,
  isLast,
  onEdit,
  onDelete,
  onMove,
  onDropRow,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', index.toString());
    e.dataTransfer.effectAllowed = 'move';
    setIsDragging(true);

    try {
      const img = new Image();
      img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
      e.dataTransfer.setDragImage(img, 0, 0);
    } catch {
      // fallback
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setIsDragOver(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const draggedIndexStr = e.dataTransfer.getData('text/plain');
    if (draggedIndexStr !== '') {
      const draggedIndex = parseInt(draggedIndexStr, 10);
      if (!isNaN(draggedIndex) && onDropRow) {
        onDropRow(draggedIndex, index);
      }
    }
  };

  return (
    <tr
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`group transition-all border-b border-slate-100 last:border-0 select-none ${
        isDragging
          ? 'bg-slate-100 shadow-2xs'
          : isDragOver
          ? 'bg-amber-50/60 shadow-[inset_0_2px_0_0_#FF9900]'
          : 'hover:bg-amber-50/20'
      }`}
    >
      {/* Order column */}
      <td className="px-6 py-3 whitespace-nowrap text-slate-400 font-semibold text-xs tabular-nums">
        <div className="flex items-center gap-2.5">
          <GripVertical className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#FF9900] transition-colors cursor-grab active:cursor-grabbing flex-shrink-0" />
          <span className="group-hover:text-amber-700 group-hover:font-bold transition-colors">
            {(index + 1).toString().padStart(2, '0')}
          </span>
        </div>
      </td>

      {/* Icon column */}
      <td className="px-5 py-3 whitespace-nowrap text-center">
        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-200 shadow-2xs text-slate-600 mx-auto">
          {renderGuidelineIcon(guideline.icon, 18, 'w-[18px] h-[18px] flex-shrink-0 select-none')}
        </div>
      </td>

      {/* Title & Description column */}
      <td className="px-6 py-3">
        <div className="text-xs font-semibold text-slate-800 tracking-tight group-hover:text-[#FF9900] transition-colors">
          {guideline.title}
        </div>
        <div className="text-[11px] text-slate-600 font-medium leading-normal mt-0.5 line-clamp-2" title={guideline.description || ''}>
          {guideline.description || 'No description provided.'}
        </div>
      </td>

      {/* Prominence badge */}
      <td className="px-3 py-3 whitespace-nowrap text-center">
        {guideline.prominent ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-xs text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 uppercase tracking-wider">
            ★ {guideline.prominentColor || 'SKY'}
          </span>
        ) : (
          <span className="inline-flex items-center px-2 py-0.5 rounded-xs text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200 uppercase tracking-wider">
            STANDARD
          </span>
        )}
      </td>

      {/* Visibility Status */}
      <td className="px-3 py-3 whitespace-nowrap text-center">
        {guideline.isActive ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-xs text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            ACTIVE
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-xs text-[10px] font-semibold bg-slate-100 text-slate-500 border border-slate-200 uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            HIDDEN
          </span>
        )}
      </td>

      {/* Action buttons */}
      <td className="px-4 py-3 whitespace-nowrap text-right text-xs font-semibold">
        <div className="flex items-center justify-end gap-1.5 opacity-70 group-hover:opacity-100 transition-opacity duration-150">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(guideline);
            }}
            className="w-7 h-7 rounded-lg bg-white hover:bg-amber-50 text-slate-400 hover:text-amber-600 border border-slate-200/80 hover:border-amber-300 flex items-center justify-center transition-all shadow-2xs cursor-pointer"
            title="Edit Guideline"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(guideline);
            }}
            className="w-7 h-7 rounded-lg bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200/80 hover:border-rose-300 flex items-center justify-center transition-all shadow-2xs cursor-pointer"
            title="Delete Guideline"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
};
