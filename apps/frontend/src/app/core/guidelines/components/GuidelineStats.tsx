import React from 'react';
import { Lightbulb, Eye, EyeOff, Star } from 'lucide-react';
import { LearningGuideline } from '@/types/guideline.types';

interface GuidelineStatsProps {
  guidelines: LearningGuideline[];
}

export const GuidelineStats: React.FC<GuidelineStatsProps> = ({ guidelines }) => {
  const total = guidelines.length;
  const active = guidelines.filter((g) => g.isActive).length;
  const hidden = guidelines.filter((g) => !g.isActive).length;
  const prominent = guidelines.filter((g) => g.prominent).length;

  const stats = [
    {
      label: 'Total Guidelines',
      value: total,
      icon: <Lightbulb className="w-5 h-5 text-sky-500" />,
      bg: 'bg-sky-500/10 border-sky-500/20',
    },
    {
      label: 'Active',
      value: active,
      icon: <Eye className="w-5 h-5 text-emerald-500" />,
      bg: 'bg-emerald-500/10 border-emerald-500/20',
    },
    {
      label: 'Hidden',
      value: hidden,
      icon: <EyeOff className="w-5 h-5 text-slate-455" />,
      bg: 'bg-slate-500/10 border-slate-500/20',
    },
    {
      label: 'Prominent Alert',
      value: `${prominent} / 1`,
      icon: <Star className="w-5 h-5 fill-amber-400 text-amber-500" />,
      bg: 'bg-amber-500/10 border-amber-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <div
          key={i}
          className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex items-center justify-between transition-all duration-300 hover:shadow-md hover:scale-[1.01]"
        >
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 font-heading">
              {stat.label}
            </span>
            <span className="text-xl font-bold font-heading text-slate-800 mt-1 tabular-nums">
              {stat.value}
            </span>
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${stat.bg}`}>
            {stat.icon}
          </div>
        </div>
      ))}
    </div>
  );
};
