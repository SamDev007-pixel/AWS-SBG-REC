'use client';

import React from 'react';
import Link from 'next/link';
import * as Icons from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TopicData } from '@/services/roadmap.api';

interface TopicCardProps {
  topic: TopicData;
  onEdit: (topic: TopicData) => void;
  onDelete: (topic: TopicData) => void;
}

const levelColorMap: Record<string, string> = {
  BEGINNER: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  INTERMEDIATE: 'bg-amber-50 text-amber-700 border-amber-200',
  ADVANCED: 'bg-rose-50 text-rose-700 border-rose-200',
};

export default function TopicCard({ topic, onEdit, onDelete }: TopicCardProps) {
  const beginnerCount = topic.modules.filter((m) => m.level === 'BEGINNER').length;
  const intermediateCount = topic.modules.filter((m) => m.level === 'INTERMEDIATE').length;
  const advancedCount = topic.modules.filter((m) => m.level === 'ADVANCED').length;
  const topicNumber = topic.orderIndex !== undefined ? topic.orderIndex + 1 : undefined;

  return (
    <div id={`topic-card-${topic.id}`} className="bg-white border border-slate-200 rounded-2xl shadow-2xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between group">
      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Top Header Bar */}
          <div className="flex items-center justify-between gap-3 mb-2.5">
            {topicNumber !== undefined ? (
              <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200/80 px-2.5 py-0.5 rounded-md uppercase tracking-wider inline-block">
                Topic #{topicNumber}
              </span>
            ) : <div />}

            <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button
                onClick={() => onEdit(topic)}
                className="w-7 h-7 rounded-lg bg-slate-50 hover:bg-amber-50 text-slate-400 hover:text-amber-600 border border-slate-200/80 hover:border-amber-200 flex items-center justify-center transition-all shadow-2xs cursor-pointer"
                title="Edit Topic"
              >
                <Icons.Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onDelete(topic)}
                className="w-7 h-7 rounded-lg bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200/80 hover:border-rose-200 flex items-center justify-center transition-all shadow-2xs cursor-pointer"
                title="Delete Topic"
              >
                <Icons.Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Title & Description */}
          <Link href={`/core/topics/${topic.id}/roadmap`} className="block group/link">
            <h3 className="text-sm font-bold text-slate-800 tracking-tight truncate group-hover/link:text-[#FF9900] transition-colors">
              {topic.name}
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-1 line-clamp-2 leading-relaxed">
              {topic.description || 'No description provided.'}
            </p>
          </Link>
        </div>

        {/* Level Badges */}
        <div className="flex items-center gap-1.5 flex-wrap pt-2">
          {beginnerCount > 0 && (
            <span className={cn("text-[9px] font-semibold px-2 py-0.5 rounded-md border", levelColorMap['BEGINNER'])}>
              {beginnerCount} Beginner
            </span>
          )}
          {intermediateCount > 0 && (
            <span className={cn("text-[9px] font-semibold px-2 py-0.5 rounded-md border", levelColorMap['INTERMEDIATE'])}>
              {intermediateCount} Intermediate
            </span>
          )}
          {advancedCount > 0 && (
            <span className={cn("text-[9px] font-semibold px-2 py-0.5 rounded-md border", levelColorMap['ADVANCED'])}>
              {advancedCount} Advanced
            </span>
          )}
        </div>
      </div>

      {/* Footer Bar */}
      <div className="border-t border-slate-100 px-5 py-3 bg-slate-50/50 flex items-center justify-between">
        <span className="text-[11px] font-bold text-slate-400">
          {topic.modules.length} {topic.modules.length === 1 ? 'Module' : 'Modules'}
        </span>

        <Link
          href={`/core/topics/${topic.id}/roadmap`}
          className="text-xs font-bold text-[#FF9900] hover:text-[#e68a00] transition-colors flex items-center gap-1"
        >
          Open Builder
          <Icons.ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
