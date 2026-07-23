'use client';

import React, { useEffect, useState } from 'react';
import { Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';
import { learningService } from '@/services/roadmap.api';
import apiClient from '@/services/roadmap.apiClient';
import { renderGuidelineIcon } from '@/utils/guidelineIcons';
import { getGuidelineStyles } from '@/utils/guidelineColors';
import { LearningGuideline, GuidelineIcon, GuidelineSettings } from '@/types/guideline.types';

interface LearningGuidePanelProps {
  previewHeaderIcon?: GuidelineIcon;
  previewHeaderTitle?: string;
  previewHeaderDescription?: string;
}

export const LearningGuidePanel: React.FC<LearningGuidePanelProps> = ({
  previewHeaderIcon,
  previewHeaderTitle,
  previewHeaderDescription,
}) => {
  const [guidelines, setGuidelines] = useState<LearningGuideline[]>([]);
  const [settings, setSettings] = useState<GuidelineSettings | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const [rulesData, settingsRes] = await Promise.all([
          learningService.getGuidelines(),
          apiClient.get<GuidelineSettings>('/roadmap/guidelines/settings'),
        ]);
        if (isMounted) {
          setGuidelines(rulesData);
          setSettings(settingsRes.data);
        }
      } catch (err) {
        console.error('Failed to load learning guidelines or settings:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    fetchData();
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl bg-white/[0.08] backdrop-blur-[20px] border border-white/20 shadow-[inset_0_1.5px_0_rgba(255,255,255,0.3),0_12px_36px_rgba(0,0,0,0.05)] p-5 flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-6 h-6 border-2 border-white/20 border-t-white/70 rounded-full animate-spin" />
        <span className="text-[10px] uppercase font-bold text-white/50 tracking-wider font-heading mt-3">
          Loading Rules...
        </span>
      </div>
    );
  }

  // 1. Create a combined list containing database items and the static Example Scoring card
  const renderedElements: (LearningGuideline & { isExampleScoring?: boolean })[] = [...guidelines];

  const exampleCard = {
    isExampleScoring: true,
    id: 'example-scoring-static',
    title: 'Example Scoring',
    icon: 'COST_EXPLORER',
  };

  // Insert the Example Scoring card at index 6 or append if the database list is shorter
  if (renderedElements.length >= 6) {
    renderedElements.splice(6, 0, exampleCard as any);
  } else {
    renderedElements.push(exampleCard as any);
  }

  const icon = previewHeaderIcon ?? settings?.headerIcon ?? 'LIGHTBULB';
  const title = previewHeaderTitle ?? settings?.headerTitle ?? 'GUIDELINES';
  const description = previewHeaderDescription ?? settings?.headerDescription ?? 'Platform learning rules and progression guidelines';

  return (
    <div className="rounded-2xl bg-white/[0.08] backdrop-blur-[20px] border border-white/20 shadow-[inset_0_1.5px_0_rgba(255,255,255,0.3),0_12px_36px_rgba(0,0,0,0.05)] p-5 flex flex-col gap-5 select-none w-full min-h-full">
      {/* Guidelines Header */}
      <div className="flex flex-col gap-1 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          {icon !== 'NONE' && (
            <div className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center border flex-shrink-0',
              icon === 'LIGHTBULB'
                ? 'bg-amber-500/15 border-amber-500/20 text-amber-600'
                : 'bg-sky-500/15 border-sky-500/20 text-sky-600'
            )}>
              {renderGuidelineIcon(icon, 20, 'w-[20px] h-[20px] flex-shrink-0 select-none')}
            </div>
          )}
          <h2 className="text-[12px] font-black text-slate-800 uppercase tracking-widest font-heading">
            {title}
          </h2>
        </div>
        {description && (
          <p className={cn(
            'text-[10px] text-slate-500 font-semibold tracking-tight -mt-1 leading-normal',
            icon !== 'NONE' ? 'pl-10' : 'pl-0'
          )}>
            {description}
          </p>
        )}
      </div>

      {/* Guidelines Cards Stack */}
      <div className="flex flex-col gap-3">
        {renderedElements.map((element) => {
          // Render example scoring card
          if (element.isExampleScoring) {
            return (
              <div
                key={element.id}
                className="w-full bg-sky-50/[0.04] border border-white/15 rounded-xl p-4 flex flex-col gap-3 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_8px_24px_rgba(15,23,42,0.02)] backdrop-blur-md relative overflow-hidden group transition-all duration-300 hover:bg-sky-50/[0.06]"
              >
                <div className="absolute inset-0 bg-teal-500/10 opacity-[0.01] group-hover:opacity-[0.03] transition-opacity duration-300" />

                <div className="flex items-center gap-3 z-10">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center relative flex-shrink-0 bg-white/10 border border-white/20 shadow-inner text-slate-800">
                    {renderGuidelineIcon('COST_EXPLORER', 22, 'w-[22px] h-[22px] flex-shrink-0 select-none')}
                  </div>
                  <h3 className="text-xs font-bold text-slate-800 tracking-tight uppercase font-heading">
                    Example Scoring
                  </h3>
                </div>

                <div className="space-y-1.5 pt-0.5 z-10">
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                    For a 100-point module:
                  </p>
                  {[
                    { label: 'Module Completion', value: '50 Points' },
                    { label: 'Quiz Score', value: '8 / 10 Correct' },
                    { label: 'Quiz Reward', value: '40 Points' },
                    { label: 'Final Score', value: '90 Points' },
                  ].map((line, j) => (
                    <div key={j} className="flex justify-between items-center text-xs py-1 border-b border-slate-200/5 last:border-0 last:pb-0">
                      <span className="text-slate-600 font-semibold">{line.label}</span>
                      <span className="font-bold text-slate-800 tabular-nums">{line.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          }

          const styles = getGuidelineStyles(element.prominent, element.prominentColor);

          return (
            <div
              key={element.id}
              className={cn(
                'w-full border rounded-xl p-4 flex items-start gap-4 transition-all duration-300 hover:scale-[1.005] backdrop-blur-md relative overflow-hidden group',
                styles.container
              )}
            >
              <div className={cn('absolute inset-0 opacity-[0.01] group-hover:opacity-[0.03] transition-opacity duration-300', styles.glow)} />

              <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center relative flex-shrink-0 border shadow-inner', styles.iconContainer)}>
                {renderGuidelineIcon(element.icon, 22, 'w-[22px] h-[22px] flex-shrink-0 select-none')}
              </div>

              <div className="flex-1 min-w-0 z-10">
                <h3 className={cn(
                  'text-xs tracking-tight leading-snug font-heading',
                  styles.title
                )}>
                  {element.title}
                </h3>
                {element.description && (
                  <p className={cn('text-[11px] leading-relaxed mt-1', styles.description)}>
                    {element.description}
                  </p>
                )}
              </div>
            </div>
        })}
      </div>
    </div>
  );
};
