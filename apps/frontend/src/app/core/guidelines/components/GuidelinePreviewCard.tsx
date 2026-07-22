import React from 'react';
import { GuidelineIcon, GuidelineThemeColor } from '@/types/guideline.types';
import { getGuidelineStyles } from '@/utils/guidelineColors';
import { renderGuidelineIcon } from '@/utils/guidelineIcons';
import { SkyBackground } from '@/components/Roadmap/SkyBackground';
import { cn } from '@/lib/utils';

interface GuidelinePreviewCardProps {
  title: string;
  description: string | null;
  icon: GuidelineIcon;
  prominent: boolean;
  prominentColor: GuidelineThemeColor | null;
}

export const GuidelinePreviewCard: React.FC<GuidelinePreviewCardProps> = ({
  title,
  description,
  icon,
  prominent,
  prominentColor,
}) => {
  const styles = getGuidelineStyles(prominent, prominentColor);

  return (
    <div className="flex flex-col gap-2">
      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider font-heading">
        WYSIWYG Learner Preview
      </span>
      <div className="relative p-5 rounded-2xl bg-gradient-to-b from-[#bae6fd] via-[#e0f2fe] to-[#e0f2fe] border border-sky-200/50 flex flex-col justify-center min-h-[130px] overflow-hidden select-none shadow-md">
        {/* Sky Background from Roadmaps */}
        <SkyBackground />

        <div
          className={cn(
            'w-full border rounded-xl p-4 flex items-start gap-4 transition-all duration-300 relative overflow-hidden group z-10',
            styles.container
          )}
        >
          <div className={cn('absolute inset-0 opacity-[0.01] transition-opacity duration-300', styles.glow)} />

          <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center relative flex-shrink-0 border shadow-inner', styles.iconContainer)}>
            {renderGuidelineIcon(icon, 22, 'w-[22px] h-[22px] flex-shrink-0 select-none')}
          </div>

          <div className="flex-1 min-w-0 z-10">
            <h3 className={cn('text-xs tracking-tight leading-snug font-heading', styles.title)}>
              {title || 'Guideline Title'}
            </h3>
            {description && (
              <p className={cn('text-[11px] leading-relaxed mt-1', styles.description)}>
                {description}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
