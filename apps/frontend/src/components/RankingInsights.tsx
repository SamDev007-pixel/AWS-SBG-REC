"use client";

import React from "react";
import GlassCard from "./GlassCard";
import { Sparkles, ArrowRight, Zap, Target } from "lucide-react";

export default function RankingInsights() {
  const currentPoints = 1920;
  const targetPoints = 2010; // Priya Patel (Rank 4)
  const pointsNeeded = targetPoints - currentPoints;
  const progressPercent = Math.round((currentPoints / targetPoints) * 100);

  return (
    <GlassCard className="border border-white/20 h-full flex flex-col justify-between" hoverEffect={false}>
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-black/5 mb-4">
        <div className="w-10 h-10 rounded-xl bg-brand-orange/10 flex items-center justify-center text-brand-orange shrink-0">
          <Target className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base sm:text-lg font-bold text-foreground font-display leading-tight">Ranking Insights</h3>
          <p className="text-xs sm:text-sm text-foreground/65 font-medium mt-0.5">Your progress breakdown</p>
        </div>
      </div>

      {/* Main content grid */}
      <div className="space-y-5 flex-1">
        {/* Progress Bar Info */}
        <div className="space-y-2.5">
          <div className="flex justify-between text-xs sm:text-sm font-semibold">
            <span className="text-foreground/75 font-semibold">Progress to Rank #4</span>
            <span className="font-bold text-brand-orange">{progressPercent}%</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-black/5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-orange to-amber-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Stats breakdown Grid */}
        <div className="grid grid-cols-2 gap-3.5 pt-1">
          <div className="p-3.5 sm:p-4 rounded-xl bg-black/[0.02] border border-black/[0.04] flex flex-col justify-between">
            <span className="text-[11px] sm:text-xs text-foreground/65 font-bold uppercase tracking-wider">Current Percentile</span>
            <span className="text-xl sm:text-2xl font-black text-brand-orange font-display mt-1">Top 15%</span>
          </div>

          <div className="p-3.5 sm:p-4 rounded-xl bg-black/[0.02] border border-black/[0.04] flex flex-col justify-between">
            <span className="text-[11px] sm:text-xs text-foreground/65 font-bold uppercase tracking-wider">Next Rank Goal</span>
            <span className="text-xl sm:text-2xl font-black text-brand-blue font-display mt-1">Rank #4</span>
          </div>

          <div className="p-3.5 sm:p-4 rounded-xl bg-black/[0.02] border border-black/[0.04] flex flex-col justify-between">
            <span className="text-[11px] sm:text-xs text-foreground/65 font-bold uppercase tracking-wider">Points Needed</span>
            <span className="text-xl sm:text-2xl font-black text-foreground font-display mt-1">+{pointsNeeded} pts</span>
          </div>

          <div className="p-3.5 sm:p-4 rounded-xl bg-black/[0.02] border border-black/[0.04] flex flex-col justify-between">
            <span className="text-[11px] sm:text-xs text-foreground/65 font-bold uppercase tracking-wider">Projected Rank</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-600 font-display mt-1">Rank #4</span>
          </div>
        </div>
      </div>

      {/* Footer / Tip */}
      <div className="mt-5 pt-4 border-t border-black/5 flex items-start gap-2.5 text-xs sm:text-sm text-foreground/75 leading-relaxed font-medium">
        <Zap className="w-4 h-4 text-brand-orange flex-shrink-0 mt-0.5" />
        <span>
          <strong className="text-foreground font-bold">Pro-tip:</strong> Earn <strong className="text-brand-orange font-bold">100 points</strong> by registering for the upcoming AWS GenAI Workshop or attending AWS Community Day.
        </span>
      </div>
    </GlassCard>
  );
}


