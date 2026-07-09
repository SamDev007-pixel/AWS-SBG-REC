"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  Lock,
  Zap,
  BookOpen,
  ChevronRight,
  Loader2,
  Trophy,
  Map,
} from "lucide-react";
import {
  learningService,
  progressService,
  type TopicSummary,
} from "@/services/roadmap.api";
import { cn } from "@/lib/utils";

const statusConfig = {
  COMPLETED: {
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200/30",
    label: "Completed",
  },
  IN_PROGRESS: {
    badge: "bg-amber-50 text-amber-700 border-amber-200/30",
    label: "In Progress",
  },
  NOT_STARTED: {
    badge: "bg-slate-50 text-slate-500 border-slate-200/50",
    label: "Not Started",
  },
};

export default function RoadmapProgress() {
  const [topics, setTopics] = useState<TopicSummary[]>([]);
  const [xp, setXp] = useState(0);
  const [continueModule, setContinueModule] = useState<{
    name: string;
    topicSlug: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasRoadmapAccess, setHasRoadmapAccess] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        setLoading(true);
        const [topicData, continueData, progressData] = await Promise.all([
          learningService.getTopicList(),
          learningService.getContinueModule(),
          progressService.getMyProgress(),
        ]);
        if (!active) return;
        setTopics(topicData);
        setContinueModule(continueData.module);
        setXp(progressData.currentXP);
      } catch (err: any) {
        if (!active) return;
        setError("Failed to load roadmap progress.");
      } finally {
        if (active) setLoading(false);
      }
    };
    load();

    try {
      const raw = localStorage.getItem('aws_sgb_rec_user');
      if (raw) {
        const parsed = JSON.parse(raw);
        const role = (parsed.role || '').toLowerCase().trim();
        if (role === 'core') {
          setHasRoadmapAccess(true);
        } else if (parsed.id) {
          fetch(`/api/auth/permissions/check?userId=${parsed.id}&permission=manage_announcements`)
            .then(res => res.json())
            .then(data => {
              if (active && data.success && data.hasPermission) {
                setHasRoadmapAccess(true);
              }
            })
            .catch(err => console.error("Error checking permissions in RoadmapProgress:", err));
        }
      }
    } catch {}

    return () => { active = false; };
  }, []);

  const totalModules = topics.reduce((s, t) => s + t.totalModules, 0);
  const completedModules = topics.reduce((s, t) => s + t.completedModules, 0);
  const overallPercent = totalModules > 0
    ? Math.round((completedModules / totalModules) * 100)
    : 0;

  const visibleTopics = useMemo(() => {
    if (!topics || topics.length === 0) return [];
    let ongoingIndex = topics.findIndex(t => continueModule?.topicSlug === t.slug || t.status === 'IN_PROGRESS');
    if (ongoingIndex === -1) {
      ongoingIndex = topics.findIndex(t => t.status === 'NOT_STARTED');
    }
    if (ongoingIndex === -1) {
      ongoingIndex = 0;
    }
    return topics.slice(ongoingIndex, ongoingIndex + 2);
  }, [topics, continueModule]);

  return (
    <div className="flex flex-col h-full select-none gap-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-100/80 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8.5 h-8.5 rounded-lg bg-gradient-to-br from-amber-50 to-orange-50 border border-[#FF9900]/25 flex items-center justify-center text-[#FF9900]">
            <Map className="w-4 h-4" />
          </div>
          <h2 
            className="text-[16px] font-bold text-slate-800 tracking-tight"
            style={{ fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}
          >
            My Roadmap Progress
          </h2>
        </div>
        {!loading && !error && (
          <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full px-2.5 py-0.5">
            <Zap className="w-3 h-3 text-amber-500 fill-current" />
            <span className="text-[10px] font-black text-amber-700">{xp} XP</span>
          </div>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex-1 flex items-center justify-center gap-3 py-10">
          <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />
          <span className="text-xs text-slate-400 font-semibold animate-pulse">
            Loading progress...
          </span>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="flex-1 flex items-center justify-center py-10">
          <p className="text-xs text-rose-500 font-semibold">{error}</p>
        </div>
      )}

      {/* Content */}
      {!loading && !error && (
        <>
          {/* Overall progress bar (Sleek Inline) */}
          {totalModules > 0 && (
            <div className="flex flex-col gap-2 mb-2 px-1 flex-shrink-0">
              <div className="flex justify-between items-center">
                <span 
                  className="text-[11px] font-bold text-slate-700 uppercase tracking-wider"
                  style={{ fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}
                >
                  Overall Progress
                </span>
                <span 
                  className="text-[12px] font-bold text-slate-900"
                  style={{ fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}
                >
                  {completedModules} / {totalModules} Modules ({overallPercent}%)
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-white/60 border border-white/40 shadow-inner overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 to-[#FF9900] transition-all duration-700"
                  style={{ width: `${overallPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Topic timeline connecting list */}
          <div className="flex flex-col gap-4 flex-1 relative my-1">
            {visibleTopics.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2 text-center">
                <BookOpen className="w-8 h-8 text-slate-350" />
                <p className="text-xs font-semibold text-slate-400">
                  No topics available yet.
                </p>
              </div>
            ) : (
              visibleTopics.map((topic, index) => {
                const cfg =
                  statusConfig[topic.status] ?? statusConfig.NOT_STARTED;
                const pct =
                  topic.totalModules > 0
                    ? Math.round(
                        (topic.completedModules / topic.totalModules) * 100
                      )
                    : 0;
                const isActive =
                  continueModule?.topicSlug === topic.slug;

                return (
                  <div key={topic.id} className="relative flex gap-4 pl-1 items-start pt-1.5 group">
                    {/* Perfect absolute connecting line between node centers */}
                    {index < visibleTopics.length - 1 && (
                      <div className="absolute left-[17px] top-[20px] h-[calc(100%+16px)] w-[2px] bg-slate-300/80 z-0" />
                    )}

                    {/* Left Timeline Node (Compact) */}
                    <div className="flex flex-col items-center flex-shrink-0 relative z-10 pt-0.5">
                      <div className={cn(
                        "w-7 h-7 rounded-full border flex items-center justify-center transition-all bg-white shadow-sm",
                        isActive 
                          ? "border-[#FF9900] text-[#FF9900] ring-4 ring-[#FF9900]/10" 
                          : topic.status === 'COMPLETED'
                            ? "border-emerald-250/60 text-emerald-600 bg-emerald-50/50"
                            : "border-slate-300 text-slate-500"
                      )}>
                        {topic.status === 'COMPLETED' ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : topic.status === 'IN_PROGRESS' ? (
                          <Clock className="w-3.5 h-3.5 text-amber-500 animate-spin" style={{ animationDuration: '4s' }} />
                        ) : (
                          <Lock className="w-3 h-3 text-slate-450" />
                        )}
                      </div>
                    </div>

                    {/* Content Item Row (Borderless) */}
                    <div className={cn(
                      "flex-1 flex justify-between gap-3 rounded-lg px-2.5 py-1.5 transition-all duration-150 min-w-0",
                      isActive
                        ? "bg-white/30"
                        : "hover:bg-white/20"
                    )}>
                      {/* Left Column: Title + Subtitle */}
                      <div className="flex flex-col gap-1 min-w-0 flex-1">
                        {/* Title Row */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <p 
                            className="text-[14px] font-bold text-slate-800 truncate"
                            style={{ fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}
                          >
                            {topic.name}
                          </p>
                          {isActive && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 bg-[#FF9900] text-white rounded-md uppercase tracking-wider whitespace-nowrap shadow-sm">
                              CURRENT
                            </span>
                          )}
                        </div>

                        {/* Subtitle Row (Progress Text only) */}
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span 
                            className="text-[11.5px] font-bold text-slate-500 whitespace-nowrap"
                            style={{ fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}
                          >
                            {topic.completedModules}/{topic.totalModules} modules ({pct}%)
                          </span>
                        </div>
                      </div>

                      {/* Right Column: Link Arrow */}
                      {topic.unlocked && (
                        <div className="flex items-center flex-shrink-0">
                          <Link
                            href={hasRoadmapAccess ? `/core/topics/${topic.id}/roadmap` : `/learn/${topic.slug}`}
                            className="w-7 h-7 rounded-full bg-slate-50 hover:bg-[#FF9900] hover:text-white border border-slate-200/50 text-slate-450 hover:border-transparent flex items-center justify-center transition-all duration-150 cursor-pointer shadow-sm active:scale-95"
                            title={hasRoadmapAccess ? `Edit ${topic.name}` : `Go to ${topic.name}`}
                          >
                            <ChevronRight className="w-4 h-4" />
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Bottom continue CTA (Borderless Text Link) */}
          {continueModule && (
            <div className="mt-auto pt-4 flex-shrink-0">
              <Link
                href={hasRoadmapAccess ? `/core/topics` : `/learn/${continueModule.topicSlug}`}
                className="flex items-center justify-between w-full px-2 group cursor-pointer transition-all duration-200"
              >
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-[#FF9900]" />
                  <span 
                    className="text-[14px] font-bold text-slate-800 group-hover:text-[#FF9900] leading-none transition-colors"
                    style={{ fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}
                  >
                    {hasRoadmapAccess ? "Manage Roadmaps" : `Continue: ${continueModule.name}`}
                  </span>
                </div>
                <div className="flex items-center text-slate-500 group-hover:text-[#FF9900] transition-colors">
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-150" />
                </div>
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
