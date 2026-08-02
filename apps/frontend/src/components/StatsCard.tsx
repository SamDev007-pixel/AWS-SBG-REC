"use client";

import React, { useState } from "react";
import Link from "next/link";
import GlassCard from "./GlassCard";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  label: string;
  value: string | number;
  subtext: string;
  icon: React.ComponentType<{ className?: string }>;
  iconClass: string;
  iconBgClass?: string;
  bareIcon?: boolean;
  href?: string;
  onClick?: () => void;
  delay?: number;
  style?: React.CSSProperties;
  iconLabel?: string;
  isLucide?: boolean;
}

export default function StatsCard({
  label,
  value,
  subtext,
  icon: Icon,
  iconClass,
  iconBgClass,
  bareIcon = false,
  href,
  onClick,
  delay = 0,
  style,
  iconLabel,
  isLucide = false,
}: StatsCardProps) {
  const [iconHovered, setIconHovered] = useState(false);

  const CardContent = () => (
    <div className="flex items-center justify-between">
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-[11px] sm:text-xs font-semibold text-foreground/60 tracking-wider uppercase">
          {label}
        </span>
        <span className="text-lg sm:text-xl font-medium text-slate-800 font-display tracking-tight leading-tight">
          {value}
        </span>
        <span className="text-[10px] sm:text-[11px] font-semibold text-foreground/50 flex items-center gap-1.5 truncate">
          {subtext}
        </span>
      </div>

      {isLucide ? (
        <div className={cn(
          "w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shadow-sm shrink-0",
          iconBgClass || "bg-brand-orange/10"
        )}>
          <Icon className={cn("w-5 h-5", iconClass || "text-brand-orange")} />
        </div>
      ) : bareIcon ? (
        <div>
          <Icon className={cn("w-14 h-14 sm:w-16 sm:h-16 transition-all duration-300 ease-out group-hover:scale-105 group-hover:-translate-y-0.5", iconClass)} />
        </div>
      ) : (
        <div className={cn(
          "w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shadow-inner",
          iconBgClass
        )}>
          <Icon className={cn("w-6 h-6", iconClass)} />
        </div>
      )}
    </div>
  );

  if (onClick) {
    return (
      <div className="block w-full group">
        <GlassCard onClick={onClick} delay={delay} style={style} className="!p-3.5 border border-slate-200 cursor-pointer hover:border-slate-300">
          <CardContent />
        </GlassCard>
      </div>
    );
  }

  if (href) {
    return (
      <Link href={href} className="block w-full group">
        <GlassCard delay={delay} style={style} className="!p-3.5 border border-slate-200 cursor-pointer hover:border-slate-300">
          <CardContent />
        </GlassCard>
      </Link>
    );
  }

  return (
    <div className="block w-full group">
      <GlassCard delay={delay} style={style} className="!p-3.5 border border-slate-200">
        <CardContent />
      </GlassCard>
    </div>
  );
}
