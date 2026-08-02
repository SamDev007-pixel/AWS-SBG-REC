"use client";

import React, { useEffect, useState } from "react";
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
  Route,
  Flame,
  TrendingUp,
  Cloud,
  Cpu,
} from "lucide-react";
import {
  learningService,
  progressService,
  type TopicSummary,
} from "@/services/roadmap.api";

import AWSSidebarIcon from "@/components/AWSSidebarIcon";

const statusConfig = {
  COMPLETED: {
    icon: <AWSSidebarIcon name="certifications" className="h-5 w-5 text-emerald-500" />,
    badge: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    bar: "from-emerald-400 to-emerald-500",
    label: "Completed",
  },
  IN_PROGRESS: {
    icon: <AWSSidebarIcon name="roadmap" className="h-5 w-5 text-amber-500" />,
    badge: "bg-amber-50 text-amber-700 border border-amber-200",
    bar: "from-amber-400 to-orange-400",
    label: "In Progress",
  },
  NOT_STARTED: {
    icon: <AWSSidebarIcon name="access-control" className="h-5 w-5 text-slate-400" />,
    badge: "bg-slate-100 text-slate-500 border border-slate-200",
    bar: "from-slate-300 to-slate-300",
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

  const activeTopic =
    topics.find((t) => t.slug === continueModule?.topicSlug) ||
    topics.find((t) => t.status === "IN_PROGRESS") ||
    topics.find((t) => t.status === "NOT_STARTED") ||
    topics[0];

  const activeTopicTotal = activeTopic ? activeTopic.totalModules : 6;
  const activeTopicCompleted = activeTopic ? activeTopic.completedModules : 0;
  const activeModuleNum = Math.min(activeTopicCompleted + 1, activeTopicTotal || 1);
  const activeTopicPercent = activeTopicTotal > 0 ? Math.round((activeTopicCompleted / activeTopicTotal) * 100) : 0;
  const targetUrl =
    hasRoadmapAccess && activeTopic
      ? `/core/topics/${activeTopic.id}/roadmap`
      : activeTopic
      ? `/learn/${activeTopic.slug}`
      : `/core/topics`;

  return (
    <div className="flex flex-col h-full min-h-0 justify-between select-none gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-amber-500 stroke-[2.2]" />
          <h2 className="text-base font-bold text-slate-800 tracking-tight font-display">
            My Roadmap Progress
          </h2>
        </div>
        {!loading && !error && (
          <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/25 rounded-md px-2.5 py-1 shadow-2xs">
            <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500 stroke-[1.8]" />
            <span className="text-xs font-bold text-amber-800 tracking-wide">{xp} XP</span>
          </div>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center gap-3 py-8">
          <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />
          <span className="text-xs text-slate-400 font-semibold animate-pulse">
            Loading your progress...
          </span>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="flex flex-col items-center justify-center py-8">
          <p className="text-xs text-rose-500 font-semibold">{error}</p>
        </div>
      )}

      {/* Content */}
      {!loading && !error && (
        <div className="flex flex-col flex-1 justify-between gap-4">
          {/* Overall Completion Header & Main Bar */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs sm:text-sm">
              <span className="font-semibold text-slate-600">
                Overall Completion
              </span>
              <span className="font-bold text-slate-800">
                {overallPercent}% / {totalModules} Modules
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-700"
                style={{ width: `${Math.max(overallPercent, 2)}%` }}
              />
            </div>
          </div>

          {/* Current Module Card */}
          {activeTopic ? (
            <div className="bg-white/80 border border-slate-200/80 hover:border-amber-500/30 transition-all duration-200 rounded-xl p-4 sm:p-5 flex flex-col gap-4 shadow-2xs group">
              {/* Header Info */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-600 shrink-0 mt-0.5">
                    <Cpu className="w-4.5 h-4.5 stroke-[2]" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight leading-snug truncate">
                      {activeTopic.name}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1 line-clamp-2">
                      {activeTopic.description ||
                        "Master the core AWS services and cloud architecture patterns."}
                    </p>
                  </div>
                </div>

                <span className="bg-amber-50 text-amber-700 border border-amber-200/80 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                  CURRENT
                </span>
              </div>

              {/* Bottom Progress & Action CTA */}
              <div className="flex flex-col gap-2 pt-1 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="font-semibold text-slate-600">
                    Module {activeModuleNum} of {activeTopicTotal}
                  </span>
                  <Link
                    href={targetUrl}
                    className="inline-flex items-center gap-1 font-bold text-amber-600 hover:text-amber-700 group-hover:translate-x-0.5 transition-transform cursor-pointer"
                  >
                    <span>Continue</span>
                    <ChevronRight className="w-4 h-4 stroke-[2.2]" />
                  </Link>
                </div>

                <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-amber-500 transition-all duration-500"
                    style={{ width: `${Math.max(activeTopicPercent, 5)}%` }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 gap-2 text-center bg-white/30 rounded-2xl border border-white/30">
              <BookOpen className="w-8 h-8 text-slate-300" />
              <p className="text-xs font-semibold text-slate-400">
                No active roadmap module available.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
