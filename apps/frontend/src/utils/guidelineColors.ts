import { GuidelineThemeColor } from '../types/guideline.types';

export interface GuidelineStyles {
  container: string;
  iconContainer: string;
  title: string;
  description: string;
  glow: string;
  badge: string;
}

export const COLOR_STYLING: Record<GuidelineThemeColor, {
  glow: string;
  border: string;
  iconBg: string;
  text: string;
  badge: string;
}> = {
  SKY: {
    glow: 'bg-sky-500/10 shadow-[0_0_20px_rgba(14,165,233,0.15)]',
    border: 'border-sky-500/20 hover:border-sky-500/35',
    iconBg: 'bg-sky-500/10 border-sky-500/20',
    text: 'text-sky-600',
    badge: 'bg-sky-50 border-sky-200/50 text-sky-700',
  },
  EMERALD: {
    glow: 'bg-emerald-500/10 shadow-[0_0_20px_rgba(52,211,153,0.15)]',
    border: 'border-emerald-500/20 hover:border-emerald-500/35',
    iconBg: 'bg-emerald-500/10 border-emerald-500/20',
    text: 'text-emerald-600',
    badge: 'bg-emerald-50 border-emerald-200/50 text-emerald-700',
  },
  AMBER: {
    glow: 'bg-amber-500/10 shadow-[0_0_20px_rgba(245,158,11,0.15)]',
    border: 'border-amber-500/20 hover:border-amber-500/35',
    iconBg: 'bg-amber-500/10 border-amber-500/20',
    text: 'text-amber-600',
    badge: 'bg-amber-50 border-amber-200/50 text-amber-700',
  },
  INDIGO: {
    glow: 'bg-indigo-500/10 shadow-[0_0_20px_rgba(129,140,248,0.15)]',
    border: 'border-indigo-500/20 hover:border-indigo-500/35',
    iconBg: 'bg-indigo-500/10 border-indigo-500/20',
    text: 'text-indigo-600',
    badge: 'bg-indigo-50 border-indigo-200/50 text-indigo-700',
  },
  ROSE: {
    glow: 'bg-rose-500/10 shadow-[0_0_20px_rgba(244,63,94,0.15)]',
    border: 'border-rose-500/20 hover:border-rose-500/35',
    iconBg: 'bg-rose-500/10 border-rose-500/20',
    text: 'text-rose-600',
    badge: 'bg-rose-50 border-rose-200/50 text-rose-700',
  },
  VIOLET: {
    glow: 'bg-violet-500/10 shadow-[0_0_20px_rgba(139,92,246,0.15)]',
    border: 'border-violet-500/20 hover:border-violet-500/35',
    iconBg: 'bg-violet-500/10 border-violet-500/20',
    text: 'text-violet-600',
    badge: 'bg-violet-50 border-violet-200/50 text-violet-700',
  },
  SLATE: {
    glow: 'bg-slate-500/10 shadow-[0_0_20px_rgba(100,116,139,0.15)]',
    border: 'border-slate-500/20 hover:border-slate-500/35',
    iconBg: 'bg-slate-500/10 border-slate-500/20',
    text: 'text-slate-600',
    badge: 'bg-slate-50 border-slate-200/50 text-slate-700',
  },
};

export const PROMINENT_STYLING: Record<GuidelineThemeColor, {
  container: string;
  iconContainer: string;
  title: string;
  description: string;
}> = {
  SKY: {
    container: 'bg-sky-500/[0.06] hover:bg-sky-500/[0.09] border-sky-500/25 hover:border-sky-500/35 shadow-[0_6px_16px_rgba(14,165,233,0.03)]',
    iconContainer: 'bg-sky-500/10 border-sky-500/20 text-sky-600',
    title: 'text-sky-950 font-bold',
    description: 'text-sky-850/80',
  },
  EMERALD: {
    container: 'bg-emerald-500/[0.06] hover:bg-emerald-500/[0.09] border-emerald-500/25 hover:border-emerald-500/35 shadow-[0_6px_16px_rgba(16,185,129,0.03)]',
    iconContainer: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600',
    title: 'text-emerald-950 font-bold',
    description: 'text-emerald-850/80',
  },
  AMBER: {
    container: 'bg-amber-500/[0.06] hover:bg-amber-500/[0.09] border-amber-500/25 hover:border-amber-500/35 shadow-[0_6px_16px_rgba(245,158,11,0.03)]',
    iconContainer: 'bg-amber-500/10 border-amber-500/20 text-amber-600',
    title: 'text-amber-955 font-bold',
    description: 'text-amber-850/80',
  },
  INDIGO: {
    container: 'bg-indigo-500/[0.06] hover:bg-indigo-500/[0.09] border-indigo-500/25 hover:border-indigo-500/35 shadow-[0_6px_16px_rgba(99,102,241,0.03)]',
    iconContainer: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-600',
    title: 'text-indigo-950 font-bold',
    description: 'text-indigo-850/80',
  },
  ROSE: {
    container: 'bg-rose-500/[0.06] hover:bg-rose-500/[0.09] border-rose-500/25 hover:border-rose-500/35 shadow-[0_6px_16px_rgba(244,63,94,0.03)]',
    iconContainer: 'bg-rose-500/10 border-rose-500/20 text-rose-600',
    title: 'text-rose-950 font-bold',
    description: 'text-rose-850/80',
  },
  VIOLET: {
    container: 'bg-violet-500/[0.06] hover:bg-violet-500/[0.09] border-violet-500/25 hover:border-violet-500/35 shadow-[0_6px_16px_rgba(139,92,246,0.03)]',
    iconContainer: 'bg-violet-500/10 border-violet-500/20 text-violet-600',
    title: 'text-violet-950 font-bold',
    description: 'text-violet-850/80',
  },
  SLATE: {
    container: 'bg-slate-500/[0.06] hover:bg-slate-500/[0.09] border-slate-500/25 hover:border-slate-500/35 shadow-[0_6px_16px_rgba(100,116,139,0.03)]',
    iconContainer: 'bg-slate-500/10 border-slate-500/20 text-slate-600',
    title: 'text-slate-950 font-bold',
    description: 'text-slate-850/80',
  },
};

export function getGuidelineStyles(
  isProminent: boolean,
  prominentColor?: GuidelineThemeColor | null
): GuidelineStyles {
  const pc = prominentColor || 'SKY';
  const config = COLOR_STYLING[pc] || COLOR_STYLING.SKY;
  const glow = config.glow;
  const badge = config.badge;

  if (isProminent) {
    const styling = PROMINENT_STYLING[pc] || PROMINENT_STYLING.SKY;
    return {
      container: styling.container,
      iconContainer: styling.iconContainer,
      title: styling.title,
      description: styling.description,
      glow,
      badge,
    };
  } else {
    return {
      container: 'bg-sky-50/[0.03] hover:bg-sky-50/[0.06] border-white/10 hover:border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_6px_20px_rgba(15,23,42,0.02)]',
      iconContainer: 'bg-white/10 border-white/20',
      title: 'text-slate-800 font-bold',
      description: 'text-slate-500/90',
      glow: COLOR_STYLING.SKY.glow,
      badge: COLOR_STYLING.SKY.badge,
    };
  }
}
