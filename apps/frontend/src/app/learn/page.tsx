'use client';

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LogOut,
  Search,
  BookOpen,
  AlertCircle,
  X,
  Loader2,
  ChevronRight,
  CheckCircle2,
  Trophy,
  Zap,
  Layers,
  Lock,
  Home,
  Users,
  ArrowDown
} from 'lucide-react';
import { learningService, progressService, TopicSummary } from '@/services/roadmap.api';
import { getAuthSession } from '@/lib/authHelper';
import { authService } from '@/services/auth.service';
import { AppLayout } from '@/components/Layout/AppLayout';
import { SkyBackground } from '@/components/Roadmap/SkyBackground';
import { TopicRailItem } from '@/components/Learn/TopicRailItem';
import { LearningGuidePanel } from '@/components/Learn/LearningGuidePanel';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import CoreSidebarShell from '@/app/core/CoreSidebarShell';
import CrewSidebarShell from '@/app/crew/(admin)/CrewSidebarShell';
import EventsSidebarShell from '@/app/events/EventsSidebarShell';
import { LearningPageError, categorizeError } from './error-types';
import { logError } from './error-logger';
import LearningErrorView from '@/components/Learn/LearningErrorView';



// Helper to parse topic descriptions into bullet points
const parseBulletPoints = (text: string): string[] => {
  if (!text || !text.trim()) return [];

  // Split by every newline
  const lines = text.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  const bulletItems: string[] = [];

  for (const line of lines) {
    const cleanBlock = line
      .replace(/^[\s\-*•+\u2022\u2023\u25E6\u2043]+/, '') // Remove bullet markers from start of block
      .replace(/^\d+\.\s+/, '') // Remove numbered list markers
      .trim();

    if (cleanBlock) {
      bulletItems.push(cleanBlock);
    }
  }

  return bulletItems.length > 0 ? bulletItems : [text.trim()];
};

export default function LearnPage() {
  const router = useRouter();

  // State variables
  const [mounted, setMounted] = useState(false);
  const [topics, setTopics] = useState<TopicSummary[]>([]);
  const [loading, setLoading] = useState(true);


  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState<number | undefined>(undefined);
  const [error, setError] = useState<LearningPageError | null>(null);
  const [retryTrigger, setRetryTrigger] = useState(0);

  const [searchQuery, setSearchQuery] = useState('');
  const [continueModule, setContinueModule] = useState<any | null>(null);
  const [userXP, setUserXP] = useState<number>(0);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Completion animation states
  const [animatingTopicId, setAnimatingTopicId] = useState<string | null>(null);
  const [nextAnimatingTopicId, setNextAnimatingTopicId] = useState<string | null>(null);
  const [isCompletedVisual, setIsCompletedVisual] = useState(false);
  const [isNextUnlockedVisual, setIsNextUnlockedVisual] = useState(false);
  const [isArrowSuccessVisual, setIsArrowSuccessVisual] = useState(false);
  const [visualPercent, setVisualPercent] = useState(0);
  const [animationDuration, setAnimationDuration] = useState(4500);

  // Layout refs for localized scrolling
  const railRef = useRef<HTMLDivElement>(null);
  const activeCardRef = useRef<HTMLDivElement>(null);

  // Exit handler
  const handleExit = () => {
    authService.logout();
    router.push('/login');
  };

  // Resume navigation handler (shared between green circle and Resume button)
  const handleResume = () => {
    if (continueModule) {
      router.push(`/learn/${continueModule.topicSlug}`);
    }
  };

  // Guidelines popup state
  const [showGuidelines, setShowGuidelines] = useState(false);

  const handleReviewTopics = () => {
    if (railRef.current) {
      railRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const scrollToActiveTopic = () => {
    if (activeCardRef.current) {
      activeCardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else if (railRef.current) {
      railRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Auth & Initial Fetch
  useEffect(() => {
    const session = getAuthSession();
    if (!session.isAuthenticated) {
      router.replace('/login');
      return;
    }
    const roleStr = session.role;
    setUserRole(roleStr);

    if (roleStr !== 'core' && session.user && (session.user as any).id) {
      const uId = (session.user as any).id;
      fetch(`/api/auth/permissions/check?userId=${uId}&permission=manage_announcements`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.hasPermission) {
            setUserRole('core');
          }
        })
        .catch(err => console.error("Learn page permission check failed:", err));
    }

    let active = true;
    const fetchTopics = async () => {
      try {

        setLoading(true);
        const [data, continueData, progressData] = await Promise.all([
          learningService.getTopicList(),
          learningService.getContinueModule(),
          progressService.getMyProgress(),
        ]);
        if (!active) return;



        // Proactively detect completion animation on initial fetch to avoid first-render flash
        const recentTopicId = sessionStorage.getItem("recentTopicCompletion");
        if (recentTopicId) {
          const completedTopicIndex = data.findIndex(t => t.id === recentTopicId);
          if (completedTopicIndex !== -1) {
            const completedTopic = data[completedTopicIndex];

            if (completedTopic.completedModules === completedTopic.totalModules) {
              const currentSig = `${completedTopic.id}-${completedTopic.totalModules}-${completedTopic.completedModules}`;
              const lastSig = localStorage.getItem("lastAnimatedCompletionKey");
              if (currentSig !== lastSig) {
                setAnimatingTopicId(completedTopic.id);
                const startPercent = 0;
                setVisualPercent(startPercent);
                setIsArrowSuccessVisual(false);
                setIsCompletedVisual(false);
                setIsNextUnlockedVisual(false);

                const nextTopic = data[completedTopicIndex + 1] || null;
                if (nextTopic) {
                  setNextAnimatingTopicId(nextTopic.id);
                } else {
                  setNextAnimatingTopicId(null);
                }
              }
            }
          }
        }

        setTopics(data);
        setContinueModule(continueData.module);
        setUserXP(progressData.currentXP);
      } catch (err) {
        if (!active) return;
        logError(err, 'learn-page-fetch-topics');
        setError(categorizeError(err));
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchTopics();
    return () => { active = false; };
  }, [router, retryTrigger]);

  // Topic completion animation trigger
  useEffect(() => {
    if (loading || topics.length === 0) return;

    if (typeof window === 'undefined') return;

    const recentTopicId = sessionStorage.getItem("recentTopicCompletion");
    if (!recentTopicId) {
      return;
    }

    const completedTopicIndex = topics.findIndex(t => t.id === recentTopicId);
    if (completedTopicIndex === -1) {
      return;
    }

    const completedTopic = topics[completedTopicIndex];

    if (completedTopic.completedModules !== completedTopic.totalModules) return;

    const currentSig = `${completedTopic.id}-${completedTopic.totalModules}-${completedTopic.completedModules}`;
    const lastSig = localStorage.getItem("lastAnimatedCompletionKey");


    if (currentSig === lastSig) {
      sessionStorage.removeItem("recentTopicCompletion");
      return;
    }


    // New completion found!
    setAnimatingTopicId(completedTopic.id);
    setIsCompletedVisual(false);
    setIsNextUnlockedVisual(false);
    setIsArrowSuccessVisual(false);

    // Find the next topic in the array to unlock simultaneously
    const nextTopic = topics[completedTopicIndex + 1] || null;
    if (nextTopic) {
      setNextAnimatingTopicId(nextTopic.id);
    } else {
      setNextAnimatingTopicId(null);
    }

    const startPercent = 0;
    setVisualPercent(startPercent);

    // Phase 1: 300ms empty-state hold, then fill progress bar and AWS arrow to 100% over animationDuration
    let fillInterval: NodeJS.Timeout;
    const fillTimer = setTimeout(() => {
      const duration = animationDuration; // 4500
      const intervalMs = 50;
      const totalSteps = duration / intervalMs;
      let currentStep = 0;

      fillInterval = setInterval(() => {
        currentStep++;
        if (currentStep >= totalSteps) {
          setVisualPercent(100);
          clearInterval(fillInterval);
        } else {
          const ratio = currentStep / totalSteps;
          const easeOutRatio = 1 - Math.pow(1 - ratio, 2); // Matches the css 'ease-out' transition curve
          const currentPercent = startPercent + (100 - startPercent) * easeOutRatio;
          setVisualPercent(Math.round(currentPercent));
        }
      }, intervalMs);
    }, 300);

    // Phase 2 (600ms): Once progress reaches 100% at 4800ms, transition color to Success Green
    const colorTimer = setTimeout(() => {
      setIsArrowSuccessVisual(true);
    }, 4800); // 300ms hold + 4500ms fill

    // Phase 3 & 4 (Simultaneous - 500ms crossfades) at 6400ms
    const transitionTimer = setTimeout(() => {
      setIsCompletedVisual(true);
      setIsNextUnlockedVisual(true);
    }, 6400); // 4800ms + 1600ms buffer/transitions

    // Clean up animation states after 6.3 seconds total
    const cleanupTimer = setTimeout(() => {
      localStorage.setItem("lastAnimatedCompletionKey", currentSig);
      sessionStorage.removeItem("recentTopicCompletion");
      sessionStorage.removeItem("recentTopicPrevPercent");
      setAnimatingTopicId(null);
      setNextAnimatingTopicId(null);
      setIsCompletedVisual(false);
      setIsNextUnlockedVisual(false);
      setIsArrowSuccessVisual(false);
    }, 6300);

    return () => {
      clearTimeout(fillTimer);
      if (fillInterval) clearInterval(fillInterval);
      clearTimeout(colorTimer);
      clearTimeout(transitionTimer);
      clearTimeout(cleanupTimer);
    };
  }, [loading, topics]);







  // Dynamic presentation-overlay topics mapping
  const presentationTopics = useMemo(() => {
    if (!animatingTopicId) return topics;

    return topics.map(topic => {
      // 1. Overlay the animating completed topic
      if (topic.id === animatingTopicId) {
        if (!isCompletedVisual) {
          // Pre-completion: Status is CURRENT/IN_PROGRESS, modules count is totalModules - 1
          const prevCompletedModules = Math.max(0, topic.totalModules - 1);
          return {
            ...topic,
            status: 'IN_PROGRESS' as const,
            completedModules: prevCompletedModules,
          };
        } else {
          // Completed phase: status is COMPLETED, modules count is totalModules
          return {
            ...topic,
            status: 'COMPLETED' as const,
            completedModules: topic.totalModules,
          };
        }
      }

      // 2. Overlay the next unlocked topic (which is unlocking)
      if (topic.id === nextAnimatingTopicId) {
        if (!isNextUnlockedVisual) {
          // Still locked before crossfade
          return {
            ...topic,
            unlocked: false,
            status: 'NOT_STARTED' as const,
            completedModules: 0,
          };
        } else {
          // Unlocked after crossfade
          return {
            ...topic,
            unlocked: true,
            status: 'IN_PROGRESS' as const,
            completedModules: 0,
          };
        }
      }

      return topic;
    });
  }, [topics, animatingTopicId, nextAnimatingTopicId, isCompletedVisual, isNextUnlockedVisual]);

  // Filter topics based on search query
  const filteredTopics = useMemo(() => {
    if (!searchQuery.trim()) return presentationTopics;
    const q = searchQuery.toLowerCase();
    return presentationTopics.filter(t =>
      t.name.toLowerCase().includes(q) ||
      (t.description && t.description.toLowerCase().includes(q))
    );
  }, [presentationTopics, searchQuery]);

  // Measure dynamic height of the content to stretch the SkyBackground dynamically
  useEffect(() => {
    if (!contentRef.current) return;
    const updateHeight = () => {
      if (contentRef.current) {
        setContentHeight(contentRef.current.scrollHeight);
      }
    };
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(contentRef.current);
    return () => observer.disconnect();
  }, [topics, filteredTopics]);

  // Find matching topic progress for continue module
  const continueTopicProgress = useMemo(() => {
    if (!continueModule || presentationTopics.length === 0) return '0 / 0 Modules';
    const topic = presentationTopics.find((t) => t.slug === continueModule.topicSlug);
    if (!topic) return '0 / 0 Modules';
    return `${topic.completedModules} / ${topic.totalModules} Modules`;
  }, [continueModule, presentationTopics]);

  // Find current topic
  const currentTopic = useMemo(() => {
    if (presentationTopics.length === 0) return null;
    if (continueModule?.topicSlug) {
      const found = presentationTopics.find((t) => t.slug === continueModule.topicSlug);
      if (found) return found;
    }
    const current = presentationTopics.find((t) => getDialStatus(t) === 'CURRENT');
    if (current) return current;
    const unlocked = presentationTopics.find((t) => t.unlocked);
    if (unlocked) return unlocked;
    return presentationTopics[0];
  }, [continueModule, presentationTopics]);

  const displayTopic = useMemo(() => {
    if (animatingTopicId) {
      return presentationTopics.find(t => t.id === animatingTopicId) || currentTopic;
    }
    return currentTopic;
  }, [animatingTopicId, presentationTopics, currentTopic]);

  const isAnimatingCompleted = animatingTopicId !== null && animatingTopicId === displayTopic?.id;

  // Auto-scroll current topic and its predecessors into view
  useEffect(() => {
    if (typeof window === 'undefined' || loading) return;

    let active = true;
    let frameId1: number;
    let frameId2: number;

    const performScroll = () => {
      if (!active) return;
      const railEl = railRef.current;
      const activeEl = activeCardRef.current;

      // Guard against null refs during rapid state transitions, routing, or filtering changes
      if (!railEl || !activeEl) return;

      const isScrollable = railEl.scrollHeight > railEl.clientHeight;
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const scrollBehavior = prefersReducedMotion ? 'auto' : 'smooth';

      /**
       * Native scrollIntoView() scrolls all scrollable ancestors.
       * That causes the SidebarLayout container to move, clipping
       * the page header. We instead scroll only the topic rail when
       * it is independently scrollable.
       */
      if (isScrollable) {
        // Localized desktop scroll: calculate relative rect sizes only when necessary
        const railRect = railEl.getBoundingClientRect();
        const elRect = activeEl.getBoundingClientRect();

        const targetScrollTop = railEl.scrollTop + (elRect.top - railRect.top) - (railRect.height / 2) + (elRect.height / 2);
        const maxScroll = railEl.scrollHeight - railEl.clientHeight;
        const clampedScrollTop = Math.max(0, Math.min(targetScrollTop, maxScroll));

        railEl.scrollTo({
          top: clampedScrollTop,
          behavior: scrollBehavior
        });
      } else {
        // Native mobile scroll: center the element in the main page viewport
        activeEl.scrollIntoView({
          behavior: scrollBehavior,
          block: 'center'
        });
      }
    };

    // Double requestAnimationFrame ensures accurate layout dimensions are read after React commits changes to the DOM
    frameId1 = requestAnimationFrame(() => {
      frameId2 = requestAnimationFrame(performScroll);
    });

    return () => {
      active = false;
      cancelAnimationFrame(frameId1);
      if (frameId2) cancelAnimationFrame(frameId2);
    };
  }, [currentTopic?.id, animatingTopicId, isCompletedVisual, loading]);

  // Map display level for continue module
  const continueDisplayLevel = useMemo(() => {
    if (!continueModule) return 'Beginner';
    const mapping: Record<string, string> = {
      BEGINNER: 'Beginner',
      INTERMEDIATE: 'Intermediate',
      ADVANCED: 'Advanced',
    };
    return mapping[continueModule.level] || 'Beginner';
  }, [continueModule]);

  // Fallback reward calculation
  const continueXPReward = useMemo(() => {
    if (!continueModule) return 50;
    if (continueModule.level === 'ADVANCED') return 100;
    if (continueModule.level === 'INTERMEDIATE') return 75;
    return 50;
  }, [continueModule]);

  const topicsCompletedCount = useMemo(() => {
    return presentationTopics.filter(t => t.completedModules > 0 && t.completedModules === t.totalModules).length;
  }, [presentationTopics]);

  const currentTopicIndex = useMemo(() => {
    if (presentationTopics.length === 0) return 0;
    const activeIndex = presentationTopics.findIndex(t => t.id === currentTopic?.id);
    if (activeIndex !== -1) return activeIndex + 1;
    return 1;
  }, [presentationTopics, currentTopic]);

  const modulesCompletedCount = useMemo(() => {
    return presentationTopics.reduce((sum, t) => sum + (t.completedModules || 0), 0);
  }, [presentationTopics]);

  const isPlatformCompleted = useMemo(() => {
    if (presentationTopics.length === 0) return false;
    const totalCompleted = presentationTopics.reduce((sum, t) => sum + (t.completedModules || 0), 0);
    const totalModules = presentationTopics.reduce((sum, t) => sum + (t.totalModules || 0), 0);
    return (totalModules > 0 && totalCompleted === totalModules) || !continueModule;
  }, [presentationTopics, continueModule]);

  const isPlatformCompletedVisual = isPlatformCompleted && !animatingTopicId;

  // Check dial states
  const getDialStatus = (topic: TopicSummary) => {
    const isLocked = !topic.unlocked;
    const isCompleted = topic.status === 'COMPLETED';
    const isCurrent = topic.unlocked && !isCompleted;

    if (isLocked) return 'LOCKED';
    if (isCompleted) return 'COMPLETED';
    if (isCurrent) return 'CURRENT';
    return 'AVAILABLE';
  };

  const renderWithSidebar = (children: React.ReactNode) => {
    if (!mounted) {
      return (
        <div className="min-h-screen bg-[#bae6fd] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#FF9900]" />
        </div>
      );
    }
    const themedContent = (
      <div className="w-full h-full bg-slate-50/50 flex-1 min-h-0">
        {children}
      </div>
    );
    if (userRole === 'core') {
      return <CoreSidebarShell>{themedContent}</CoreSidebarShell>;
    }
    if (userRole === 'crew') {
      return <CrewSidebarShell>{themedContent}</CrewSidebarShell>;
    }
    return <EventsSidebarShell>{themedContent}</EventsSidebarShell>;
  };

  // Main UI Load/Error views
  if (loading) {
    return renderWithSidebar(
      <AppLayout>
        <div className="min-h-screen w-full bg-gradient-to-b from-[#bae6fd] via-[#e0f2fe] to-white flex items-center justify-center relative overflow-hidden font-sans select-none">
          {/* Cloud Background from Roadmaps */}
          <SkyBackground />

          <div className="flex flex-col items-center gap-4 z-10 pointer-events-auto">
            <div className="relative flex items-center justify-center">
              {/* Outer pulsing ring */}
              <div className="absolute w-12 h-12 rounded-full bg-sky-500/10 animate-ping" />
              <Loader2 className="w-10 h-10 text-sky-500 animate-spin stroke-[2.5]" />
            </div>
            <span className="text-[10px] text-slate-500 font-bold tracking-widest uppercase animate-pulse font-heading">
              Loading Learning Tracks...
            </span>
          </div>
        </div>
      </AppLayout>
    );
  }

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    setRetryTrigger((prev) => prev + 1);
  };

  if (error) {
    return <LearningErrorView error={error} reset={handleRetry} />;
  }



  return renderWithSidebar(
    <AppLayout>
      <div className="h-full lg:h-[calc(100vh)] w-full bg-gradient-to-b from-[#bae6fd] via-[#e0f2fe] to-[#e0f2fe] font-sans select-none relative overflow-y-auto lg:overflow-hidden pb-12 lg:pb-0 flex flex-col">
        {/* Cloud Background from Roadmaps */}
        <SkyBackground height={contentHeight ? contentHeight + 200 : undefined} />

        <div ref={contentRef} className="max-w-full mx-auto px-4 sm:px-6 xl:px-12 pt-6 sm:pt-8 pb-6 flex flex-col gap-6 sm:gap-8 relative z-10 w-full h-full lg:h-full lg:flex-1 lg:min-h-0">

          {/* ROADMAP PROGRESS HEADER PANEL */}
          <header className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 w-full pointer-events-auto py-2 h-auto">
            {/* Left Side: Current Mission Info */}
            <div className="flex items-center gap-3 sm:gap-4 w-full lg:w-auto h-auto min-w-0">
              <AnimatePresence mode="wait">
                {isPlatformCompletedVisual ? (
                  <motion.div
                    key="completed-header"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center gap-3 sm:gap-4 w-full lg:w-auto min-w-0"
                  >
                    <div
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/95 border border-slate-200/80 flex items-center justify-center shadow-lg flex-shrink-0"
                    >
                      <svg viewBox="0 0 304 182" className="w-8 h-auto" fill="none">
                        <path
                          fill="#252F3E"
                          d="M86.4,66.4c0,3.7,0.4,6.7,1.1,8.9c0.8,2.2,1.8,4.6,3.2,7.2c0.5,0.8,0.7,1.6,0.7,2.3c0,1-0.6,2-1.9,3l-6.3,4.2c-0.9,0.6-1.8,0.9-2.6,0.9c-1,0-2-0.5-3-1.4C76.2,90,75,88.4,74,86.8c-1-1.7-2-3.6-3.1-5.9c-7.8,9.2-17.6,13.8-29.4,13.8c-8.4,0-15.1-2.4-20-7.2c-4.9-4.8-7.4-11.2-7.4-19.2c0-8.5,3-15.4,9.1-20.6c6.1-5.2,14.2-7.8,24.5-7.8c3.4,0,6.9,0.3,10.6,0.8c3.7,0.5,7.5,1.3,11.5,2.2v-7.3c0-7.6-1.6-12.9-4.7-16c-3.2-3.1-8.6-4.6-16.3-4.6c-3.5,0-7.1,0.4-10.8,1.3c-3.7,0.9-7.3,2-10.8,3.4c-1.6,0.7-2.8,1.1-3.5,1.3c-0.7,0.2-1.2,0.3-1.6,0.3c-1.4,0-2.1-1-2.1-3.1v-4.9c0-1.6,0.2-2.8,0.7-3.5c0.5-0.7,1.4-1.4,2.8-2.1c3.5-1.8,7.7-3.3,12.6-4.5c4.9-1.3,10.1-1.9,15.6-1.9c11.9,0,20.6,2.7,26.2,8.1c5.5,5.4,8.3,13.6,8.3,24.6V66.4z M45.8,81.6c3.3,0,6.7-0.6,10.3-1.8c3.6-1.2,6.8-3.4,9.5-6.4c1.6-1.9,2.8-4,3.4-6.4c0.6-2.4,1-5.3,1-8.7v-4.2c-2.9-0.7-6-1.3-9.2-1.7c-3.2-0.4-6.3-0.6-9.4-0.6c-6.7,0-11.6,1.3-14.9,4c-3.3,2.7-4.9,6.5-4.9,11.5c0,4.7,1.2,8.2,3.7,10.6C37.7,80.4,41.2,81.6,45.8,81.6z M126.1,92.4c-1.8,0-3-0.3-3.8-1c-0.8-0.6-1.5-2-2.1-3.9L96.7,10.2c-0.6-2-0.9-3.3-0.9-4c0-1.6,0.8-2.5,2.4-2.5h9.8c1.9,0,3.2,0.3,3.9,1c0.8,0.6,1.4,2,2,3.9l16.8,66.2l15.6-66.2c0.5-2,1.1-3.3,1.9-3.9c0.8-0.6,2.2-1,4-1h8c1.9,0,3.2,0.3,4,1c0.8,0.6,1.5,2,1.9,3.9l15.8,67l17.3-67c0.6-2,1.3-3.3,2-3.9c0.8-0.6,2.1-1,3.9-1h9.3c1.6,0,2.5,0.8,2.5,2.5c0,0.5-0.1,1-0.2,1.6c-0.1,0.6-0.3,1.4-0.7,2.5l-24.1,77.3c-0.6,2-1.3,3.3-2.1,3.9c-0.8,0.6-2.1,1-3.8,1h-8.6c-1.9,0-3.2-0.3-4-1c-0.8-0.7-1.5-2-1.9-4L156,23l-15.4,64.4c-0.5,2-1.1,3.3-1.9,4c-0.8,0.7-2.2,1-4,1H126.1z M254.6,95.1c-5.2,0-10.4-0.6-15.4-1.8c-5-1.2-8.9-2.5-11.5-4c-1.6-0.9-2.7-1.9-3.1-2.8c-0.4-0.9-0.6-1.9-0.6-2.8v-5.1c0-2.1,0.8-3.1,2.3-3.1c0.6,0,1.2,0.1,1.8,0.3c0.6,0.2,1.5,0.6,2.5,1c3.4,1.5,7.1,2.7,11,3.5c4,0.8,7.9,1.2,11.9,1.2c6.3,0,11.2-1.1,14.6-3.3c3.4-2.2,5.2-5.4,5.2-9.5c0-2.8-0.9-5.1-2.7-7c-1.8-1.9-5.2-3.6-10.1-5.2L246,52c-7.3-2.3-12.7-5.7-16-10.2c-3.3-4.4-5-9.3-5-14.5c0-4.2,0.9-7.9,2.7-11.1c1.8-3.2,4.2-6,7.2-8.2c3-2.3,6.4-4,10.4-5.2c4-1.2,8.2-1.7,12.6-1.7c2.2,0,4.5,0.1,6.7,0.4c2.3,0.3,4.4,0.7,6.5,1.1c2,0.5,3.9,1,5.7,1.6c1.8,0.6,3.2,1.2,4.2,1.8c1.4,0.8,2.4,1.6,3,2.5c0.6,0.8,0.9,1.9,0.9,3.3v4.7c0,2.1-0.8,3.2-2.3,3.2c-0.8,0-2.1-0.4-3.8-1.2c-5.7-2.6-12.1-3.9-19.2-3.9c-5.7,0-10.2,0.9-13.3,2.8c-3.1,1.9-4.7,4.8-4.7,8.9c0,2.8,1,5.2,3,7.1c2,1.9,5.7,3.8,11,5.5l14.2,4.5c7.2,2.3,12.4,5.5,15.5,9.6c3.1,4.1,4.6,8.8,4.6,14c0,4.3-0.9,8.2-2.6,11.6c-1.8,3.4-4.2,6.4-7.3,8.8c-3.1,2.5-6.8,4.3-11.1,5.6C264.4,94.4,259.7,95.1,254.6,95.1z"
                        />
                        <path
                          fill="#FF9900"
                          d="M273.5,143.7c-32.9,24.3-80.7,37.2-121.8,37.2c-57.6,0-109.5-21.3-148.7-56.7c-3.1-2.8-0.3-6.6,3.4-4.4c42.4,24.6,94.7,39.5,148.8,39.5c36.5,0,76.6-7.6,113.5-23.2C274.2,133.6,278.9,139.7,273.5,143.7z"
                        />
                        <path
                          fill="#FF9900"
                          d="M287.2,128.1c-4.2-5.4-27.8-2.6-38.5-1.3c-3.2,0.4-3.7-2.4-0.8-4.5c18.8-13.2,49.7-9.4,53.3-5c3.6,4.5-1,35.4-18.6,50.2c-2.7,2.3-5.3,1.1-4.1-1.9C282.5,155.7,291.4,133.4,287.2,128.1z"
                        />
                      </svg>
                    </div>
                    <div className="flex flex-col text-slate-800 min-w-0">
                      <span className="text-sm sm:text-base font-black text-slate-900 block leading-tight font-heading mt-0.5 break-words">
                        🎉 AWS Journey Complete
                      </span>
                      <span className="text-[10px] sm:text-xs font-semibold text-slate-500 mt-1 block break-words">
                        Congratulations! You've completed every available topic.
                      </span>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2 text-[10px] sm:text-[11px] font-extrabold">
                        <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50/80 border border-emerald-100/30 px-2 py-0.5 rounded-md">
                          {topicsCompletedCount} {topicsCompletedCount === 1 ? 'Topic' : 'Topics'}
                        </span>
                        <span className="text-slate-300">|</span>
                        <span className="flex items-center gap-1 text-cyan-600 bg-cyan-50/80 border border-cyan-100/30 px-2 py-0.5 rounded-md">
                          {modulesCompletedCount} {modulesCompletedCount === 1 ? 'Module' : 'Modules'}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="current-header"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-start sm:items-center gap-3 sm:gap-4 w-full lg:w-auto min-w-0"
                  >
                    <button
                      onClick={handleResume}
                      aria-label="Continue learning"
                      className={cn(
                        "w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-white shadow-md transition-all duration-300 flex-shrink-0 mt-0.5 sm:mt-0",
                        continueModule
                          ? "bg-[#FF9900] shadow-[#FF9900]/20 cursor-pointer hover:bg-[#ffb84d] hover:shadow-lg hover:shadow-[#FF9900]/30 hover:scale-105 active:scale-95"
                          : "bg-[#FF9900]/60 cursor-pointer hover:bg-[#ffb84d] hover:scale-105 active:scale-95"
                      )}
                    >
                      <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 stroke-[3]" />
                    </button>
                    <div className="flex flex-col text-slate-800 min-w-0 flex-1">
                      <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-widest block font-heading">
                        CONTINUE YOUR JOURNEY
                      </span>
                      <span className="text-sm sm:text-base font-black text-slate-900 block leading-snug font-heading mt-0.5 break-words whitespace-normal [text-wrap:balance]">
                        {continueModule ? `Current Mission: ${continueModule.name}` : 'Ready to start your AWS journey'}
                      </span>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1.5 text-[10px] sm:text-[11px] font-extrabold text-slate-500">
                        <span className="flex items-center gap-1 text-cyan-600">
                          <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" /> {continueModule ? continueTopicProgress : 'Select a topic'}
                        </span>
                        {continueModule?.topicName && (
                          <>
                            <span className="text-slate-300">|</span>
                            <Link
                              href={`/learn/${continueModule.topicSlug}`}
                              className="text-indigo-650 font-bold bg-indigo-50/80 hover:bg-indigo-100/80 px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] tracking-tight cursor-pointer transition-all hover:scale-105 inline-flex items-center gap-1"
                              title="Go to topic roadmap"
                            >
                              Topic: {continueModule.topicName}
                            </Link>
                          </>
                        )}
                        <span className="text-slate-300">|</span>
                        <button
                          onClick={scrollToActiveTopic}
                          className="text-sky-700 font-bold bg-sky-50/90 hover:bg-sky-100/90 border border-sky-200/60 hover:border-sky-300/80 px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] tracking-tight cursor-pointer transition-all hover:scale-105 inline-flex items-center gap-1 shadow-xs active:scale-95 group"
                          title="Scroll down to active topic"
                          aria-label="Scroll down to current active topic"
                        >
                          <ArrowDown className="w-3 h-3 text-sky-600 animate-bounce" />
                          <span>Scroll to Active Topic</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right Side: Responsive Stats Grid & Actions */}
            <div className="w-full lg:w-auto flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3">
              {/* Stats Cards Grid (2x2 on Mobile, Inline Flex on Tablet & Desktop) */}
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
                {/* Topics Progress Badge */}
                <div className="bg-[#0284c7]/10 border border-[#0284c7]/20 rounded-lg sm:rounded-xl px-2.5 sm:px-3 py-2 sm:py-1.5 flex items-center gap-2 min-h-[44px] sm:min-h-0 min-w-0">
                  <CheckCircle2 className="w-4 h-4 text-[#0284c7] flex-shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[7px] sm:text-[8px] font-extrabold text-slate-500 uppercase tracking-wider block leading-none truncate">
                      TOPICS
                    </span>
                    <span className="text-[10px] sm:text-xs font-bold text-slate-900 block leading-none mt-1 sm:mt-1 truncate">
                      {currentTopicIndex} / {topics.length}
                    </span>
                  </div>
                </div>

                {/* Total XP Badge */}
                <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg sm:rounded-xl px-2.5 sm:px-3 py-2 sm:py-1.5 flex items-center gap-2 min-h-[44px] sm:min-h-0 min-w-0">
                  <Trophy className="w-4 h-4 text-indigo-650 flex-shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[7px] sm:text-[8px] font-extrabold text-slate-500 uppercase tracking-wider block leading-none truncate">
                      SCORE
                    </span>
                    <span className="text-[10px] sm:text-xs font-bold text-slate-900 block leading-none mt-1 sm:mt-1 truncate">
                      {userXP} XP
                    </span>
                  </div>
                </div>

                {/* Reward XP Badge */}
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg sm:rounded-xl px-2.5 sm:px-3 py-2 sm:py-1.5 flex items-center gap-2 min-h-[44px] sm:min-h-0 min-w-0">
                  <Zap className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[7px] sm:text-[8px] font-extrabold text-slate-500 uppercase tracking-wider block leading-none truncate">
                      REWARD
                    </span>
                    <span className="text-[10px] sm:text-xs font-bold text-slate-900 block leading-none mt-1 sm:mt-1 truncate">
                      +{continueModule ? continueXPReward : 50} XP
                    </span>
                  </div>
                </div>

                {/* Level badge (Shown on Tablet & Desktop, replaced or paired with Home on Mobile) */}
                <div className="hidden sm:flex bg-emerald-500/10 border border-emerald-500/20 rounded-lg sm:rounded-xl px-2.5 sm:px-3 py-2 sm:py-1.5 items-center gap-2 min-h-[44px] sm:min-h-0 min-w-0">
                  <Layers className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[7px] sm:text-[8px] font-extrabold text-slate-500 uppercase tracking-wider block leading-none truncate">
                      LEVEL
                    </span>
                    <span className="text-[10px] sm:text-xs font-bold text-slate-900 block leading-none mt-1 sm:mt-1 truncate">
                      {continueDisplayLevel}
                    </span>
                  </div>
                </div>

                {/* Home Link Card */}
                <Link
                  href={userRole === 'core' ? '/core/topics' : userRole === 'crew' ? '/core/learners' : '/events/dashboard'}
                  className="bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 hover:border-indigo-500/30 text-indigo-650 rounded-lg sm:rounded-xl px-2.5 sm:px-3 py-2 sm:py-1.5 flex items-center justify-center sm:justify-start gap-2 transition-all flex-shrink-0 cursor-pointer min-h-[44px] sm:min-h-0 min-w-0"
                  title={userRole === 'core' ? "Admin Portal" : userRole === 'crew' ? "Crew Portal" : "Events Dashboard"}
                >
                  <Home className="w-4 h-4 text-indigo-650 flex-shrink-0" />
                  <div className="min-w-0 hidden xs:block sm:block">
                    <span className="text-[7px] sm:text-[8px] font-extrabold text-slate-500 uppercase tracking-wider block leading-none truncate">
                      PORTAL
                    </span>
                    <span className="text-[10px] sm:text-xs font-bold text-indigo-650 block leading-none mt-1 sm:mt-1 truncate">
                      Home
                    </span>
                  </div>
                </Link>
              </div>

              {/* Guidelines Action Button */}
              <AnimatePresence>
                {!isPlatformCompletedVisual && (
                  <motion.button
                    key="resume-learning-btn"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => setShowGuidelines(true)}
                    className="w-full sm:w-auto font-bold text-xs px-4 sm:px-5 py-2.5 sm:py-2.5 rounded-lg sm:rounded-xl shadow-md hover:shadow-lg transition-all duration-300 tracking-wider font-heading cursor-pointer text-white bg-[#00cba9] hover:bg-[#00bda0] flex items-center justify-center min-h-[44px] sm:min-h-0 flex-shrink-0"
                  >
                    Guidelines
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </header>

          {/* TWO-COLUMN LAYOUT: Topic rail + Learning Guide */}
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 lg:flex-1 lg:min-h-0 lg:overflow-hidden pb-6">
            {/* Left Column: Search + Topic Rail */}
            <div ref={railRef} className="flex-[1.5] min-w-0 lg:overflow-y-auto lg:h-full pr-2 custom-scrollbar">
              <div className="flex items-center gap-2 sm:gap-3 w-full pointer-events-auto">
                <div className="relative min-w-0 flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search Topics"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-8 sm:pl-10 sm:pr-9 py-1.5 sm:py-2 bg-white/90 border border-slate-200/80 rounded-full text-[11px] sm:text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100 shadow-sm transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-650 transition-colors"
                    >
                      <X className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    </button>
                  )}
                </div>

                {userRole === 'crew' && (
                  <Link
                    href="/crew/learners"
                    className="flex items-center gap-1.5 px-3 sm:px-4.5 py-1.5 sm:py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 font-heading font-black text-[10px] sm:text-xs cursor-pointer flex-shrink-0"
                    title="View Learner Progress"
                  >
                    <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    <span className="hidden sm:inline">View Learner Progress</span>
                    <span className="sm:hidden">Learners</span>
                  </Link>
                )}
              </div>

              <main className="flex flex-col items-center">
                {filteredTopics.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 px-4">
                    <BookOpen className="w-12 h-12 text-slate-300 mb-3" />
                    <h3 className="text-sm font-bold text-slate-600">No matching topics found</h3>
                    <p className="text-xs text-slate-400 mt-1">Try search with a different keyword</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-4 w-full px-4 py-6 animate-fade-in">
                    {filteredTopics.map((topic, index) => {
                      const status = getDialStatus(topic);
                      const isCompleted = status === 'COMPLETED';
                      const isCurrent = status === 'CURRENT' || status === 'AVAILABLE';
                      const isLocked = status === 'LOCKED';

                      // Determine if this is the first locked topic in the filtered list (based on original status)
                      const isFirstLocked = isLocked && (index === 0 || getDialStatus(filteredTopics[index - 1]) !== 'LOCKED');

                      // Visual states for overrides during completion animation
                      let statusToRender = status;
                      let progressPercentToRender = topic.totalModules > 0
                        ? Math.round((topic.completedModules / topic.totalModules) * 100)
                        : 0;
                      let completedModulesToRender = topic.completedModules;

                      if (topic.id === animatingTopicId) {
                        if (!isCompletedVisual) {
                          statusToRender = 'CURRENT';
                          progressPercentToRender = visualPercent;
                          const sessionStoragePrevPercent = sessionStorage.getItem("recentTopicPrevPercent");
                          const prevPercent = sessionStoragePrevPercent !== null
                            ? Number(sessionStoragePrevPercent)
                            : (topic.totalModules > 1 ? Math.round(((topic.totalModules - 1) / topic.totalModules) * 100) : 0);
                          completedModulesToRender = Math.round((prevPercent / 100) * topic.totalModules);
                        } else {
                          statusToRender = 'COMPLETED';
                          progressPercentToRender = 100;
                          completedModulesToRender = topic.totalModules;
                        }
                      } else if (topic.id === nextAnimatingTopicId) {
                        if (!isNextUnlockedVisual) {
                          statusToRender = 'LOCKED';
                        } else {
                          statusToRender = 'CURRENT';
                          progressPercentToRender = 0;
                          completedModulesToRender = 0;
                        }
                      }

                      const renderCurrent = statusToRender === 'CURRENT';
                      const renderCompleted = statusToRender === 'COMPLETED';
                      const renderLocked = statusToRender === 'LOCKED';

                      // Dynamic current module label (e.g. MOD 3)
                      const currentModuleLabel = `MOD ${Math.min(completedModulesToRender + 1, topic.totalModules)}`;

                      return (
                        <div
                          key={topic.id}
                          ref={statusToRender === 'CURRENT' ? activeCardRef : undefined}
                          className="w-full"
                        >
                          {isFirstLocked && (
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-heading mt-6 mb-3 self-start pl-2">
                              UPCOMING TOPICS
                            </span>
                          )}
                          <AnimatePresence mode="wait">
                            {renderCurrent && (
                              <motion.div
                                key={`${topic.id}-current`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.45 }}
                                className={cn(
                                  "w-full bg-white/[0.15] backdrop-blur-[20px] border border-white/25 rounded-xl p-5 md:p-6 flex flex-col gap-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_10px_30px_rgba(0,0,0,0.08)] select-none border-l-4 text-left transition-[border-color]",
                                  topic.id === animatingTopicId
                                    ? (isArrowSuccessVisual ? "border-l-emerald-500 duration-600 ease-in-out" : "border-l-[#FF9900]")
                                    : "border-l-[#FF9900]"
                                )}
                              >
                                <div className="w-full">
                                  <div className="flex justify-between items-start gap-4">
                                    <div className="flex-1">
                                      <span className={cn(
                                        "inline-block text-[9px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-[4px] mb-2.5 transition-colors duration-600",
                                        topic.id === animatingTopicId && isArrowSuccessVisual
                                          ? "bg-emerald-500/10 text-emerald-650 border border-emerald-500/20"
                                          : "bg-[#FF9900]/10 text-[#FF9900] border border-[#FF9900]/20"
                                      )}>
                                        Current
                                      </span>

                                      <h2 className="text-xl font-semibold text-slate-900 tracking-tight leading-tight">
                                        {topic.name}
                                      </h2>

                                      {/* Details Row: No time estimate */}
                                      <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-slate-500 font-normal">
                                        <span>{completedModulesToRender} / {topic.totalModules} Modules</span>
                                        <span className="text-slate-350 font-semibold">•</span>
                                        <span className={cn(
                                          "font-semibold transition-colors duration-600",
                                          topic.id === animatingTopicId && isArrowSuccessVisual ? "text-emerald-650" : "text-[#FF9900]"
                                        )}>
                                          {currentModuleLabel}
                                        </span>
                                      </div>
                                    </div>

                                    {/* AWS Swoosh Progress Illustration */}
                                    <div className="w-32 h-16 md:w-36 md:h-16 flex-shrink-0 flex items-center justify-center bg-white/10 border border-amber-500/20 rounded-xl p-2.5 relative overflow-hidden backdrop-blur-sm shadow-[0_0_12px_rgba(255,153,0,0.08)]">
                                      <svg viewBox="0 100 310 90" className="w-full h-auto text-slate-200/50 select-none">
                                        <defs>
                                          <clipPath id={`aws-swoosh-clip-${topic.id}`}>
                                            <path d="M273.5,143.7c-32.9,24.3-80.7,37.2-121.8,37.2c-57.6,0-109.5-21.3-148.7-56.7c-3.1-2.8-0.3-6.6,3.4-4.4c42.4,24.6,94.7,39.5,148.8,39.5c36.5,0,76.6-7.6,113.5-23.2C274.2,133.6,278.9,139.7,273.5,143.7z" />
                                            <path d="M287.2,128.1c-4.2-5.4-27.8-2.6-38.5-1.3c-3.2,0.4-3.7-2.4-0.8-4.5c18.8-13.2,49.7-9.4,53.3-5c3.6,4.5-1,35.4-18.6,50.2c-2.7,2.3-5.3,1.1-4.1-1.9C282.5,155.7,291.4,133.4,287.2,128.1z" />
                                          </clipPath>
                                        </defs>

                                        {/* Unfilled background swoosh outline */}
                                        <g
                                          fill="rgba(226, 232, 240, 0.25)"
                                          stroke={
                                            topic.id === animatingTopicId
                                              ? (isArrowSuccessVisual ? "#10B981" : "rgba(255, 159, 0, 1)")
                                              : "rgba(255, 159, 0, 1)"
                                          }
                                          strokeWidth="3"
                                          style={{
                                            transition: topic.id === animatingTopicId
                                              ? 'stroke 600ms ease-in-out'
                                              : 'stroke 700ms ease-out'
                                          }}
                                        >
                                          <path d="M273.5,143.7c-32.9,24.3-80.7,37.2-121.8,37.2c-57.6,0-109.5-21.3-148.7-56.7c-3.1-2.8-0.3-6.6,3.4-4.4c42.4,24.6,94.7,39.5,148.8,39.5c36.5,0,76.6-7.6,113.5-23.2C274.2,133.6,278.9,139.7,273.5,143.7z" />
                                          <path d="M287.2,128.1c-4.2-5.4-27.8-2.6-38.5-1.3c-3.2,0.4-3.7-2.4-0.8-4.5c18.8-13.2,49.7-9.4,53.3-5c3.6,4.5-1,35.4-18.6,50.2c-2.7,2.3-5.3,1.1-4.1-1.9C282.5,155.7,291.4,133.4,287.2,128.1z" />
                                        </g>

                                        {/* Filled swoosh left-to-right using clipPath */}
                                        <g clipPath={`url(#aws-swoosh-clip-${topic.id})`}>
                                          <rect
                                            x="0"
                                            y="100"
                                            width={`${(300 * progressPercentToRender) / 100}`}
                                            height="90"
                                            fill={
                                              topic.id === animatingTopicId
                                                ? (isArrowSuccessVisual ? "#10B981" : "#FF9900")
                                                : "#FF9900"
                                            }
                                            style={{
                                              width: `${(300 * progressPercentToRender) / 100}px`,
                                              transition: topic.id === animatingTopicId
                                                ? `width 50ms linear, fill 600ms ease-in-out`
                                                : 'width 700ms ease-out, fill 700ms ease-out'
                                            }}
                                          />
                                        </g>
                                      </svg>
                                    </div>
                                  </div>

                                  {/* Progress bar and numeric percentage */}
                                  <div className="flex items-center gap-3 mt-4">
                                    <div className="flex-1 h-1.5 bg-slate-100/50 rounded-full overflow-hidden">
                                      <div
                                        className={cn(
                                          "h-full rounded-full",
                                          topic.id === animatingTopicId
                                            ? (isArrowSuccessVisual ? "bg-emerald-500" : "bg-[#FF9900]")
                                            : "bg-[#FF9900]"
                                        )}
                                        style={{
                                          width: `${progressPercentToRender}%`,
                                          transition: topic.id === animatingTopicId
                                            ? `width 50ms linear, background-color 600ms ease-in-out`
                                            : 'width 700ms ease-out, background-color 700ms ease-out'
                                        }}
                                      />
                                    </div>
                                    <span className="text-xs font-semibold text-slate-500 leading-none">
                                      {progressPercentToRender}%
                                    </span>
                                  </div>
                                </div>

                                {/* Bottom Row: Action */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3.5 border-t border-white/10">
                                  <Link
                                    href={`/learn/${topic.slug}`}
                                    className={cn(
                                      "px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 border transition-all duration-600 active:scale-[0.98] cursor-pointer",
                                      topic.id === animatingTopicId && isArrowSuccessVisual
                                        ? "border-emerald-500 text-emerald-650 hover:bg-emerald-500/5"
                                        : "border-[#FF9900] text-[#FF9900] hover:bg-[#FF9900]/5"
                                    )}
                                  >
                                    <span>Continue</span>
                                    <span className="text-xs">→</span>
                                  </Link>
                                </div>
                              </motion.div>
                            )}

                            {renderCompleted && (
                              <motion.div
                                key={`${topic.id}-completed`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.45 }}
                                className="w-full bg-white/[0.15] backdrop-blur-[20px] border border-white/25 rounded-xl p-4 sm:py-3.5 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_10px_30px_rgba(0,0,0,0.08)] select-none border-l-4 border-l-emerald-500 text-left"
                              >
                                <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                                  {/* Green checkmark circle icon */}
                                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 flex-shrink-0 mt-0.5 sm:mt-0">
                                    <CheckCircle2 className="w-4.5 h-4.5 stroke-[2.5]" />
                                  </div>

                                  {/* Topic Title and Modules Pill */}
                                  <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2.5 min-w-0">
                                    <h2 className="text-sm font-semibold text-slate-800 tracking-tight leading-snug">
                                      {topic.name}
                                    </h2>
                                    <span className="inline-block text-[9px] font-extrabold text-emerald-650 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2.5 py-0.5 uppercase tracking-wide self-start sm:self-auto flex-shrink-0">
                                      {topic.totalModules} {topic.totalModules === 1 ? 'Module' : 'Modules'}
                                    </span>
                                  </div>
                                </div>

                                {/* Review Button */}
                                <Link
                                  href={`/learn/${topic.slug}`}
                                  className="w-full sm:w-auto px-4.5 py-2 rounded-full text-xs font-black border border-emerald-500/25 text-emerald-650 bg-emerald-500/10 hover:bg-emerald-500/20 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-1 cursor-pointer flex-shrink-0"
                                >
                                  <span>Review</span>
                                  <span className="text-xs">→</span>
                                </Link>
                              </motion.div>
                            )}

                            {renderLocked && (
                              <motion.div
                                key={`${topic.id}-locked`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.45 }}
                                className="w-full bg-white/[0.08] backdrop-blur-[20px] border border-white/15 rounded-[20px] p-4 sm:py-3.5 sm:px-6 flex items-start sm:items-center justify-between shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_8px_24px_rgba(0,0,0,0.05)] select-none opacity-80 text-left"
                              >
                                <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                                  <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 flex-shrink-0 mt-0.5 sm:mt-0">
                                    <Lock className="w-4 h-4" />
                                  </div>
                                  <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2.5 min-w-0">
                                    <span className="font-semibold text-slate-700 text-sm leading-snug">
                                      {topic.name}
                                    </span>
                                    <span className="inline-block text-[10px] font-extrabold text-slate-500 bg-white/5 border border-white/10 rounded-full px-2.5 py-0.5 uppercase tracking-wide self-start sm:self-auto flex-shrink-0">
                                      {topic.totalModules} {topic.totalModules === 1 ? 'Module' : 'Modules'}
                                    </span>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                )}
              </main>
            </div>

            {/* Right Column: Description of current Topic */}
            <div className="hidden lg:flex w-full lg:flex-1 flex-shrink-0 flex-col gap-6 lg:overflow-y-auto lg:h-full pr-2 custom-scrollbar">
              {displayTopic ? (
                <div className={cn(
                  "w-full backdrop-blur-[20px] border rounded-2xl p-6 md:p-8 flex flex-col gap-6 text-left transition-all duration-600",
                  displayTopic.status === 'COMPLETED' || (isAnimatingCompleted && isArrowSuccessVisual)
                    ? "bg-emerald-500/[0.06] border-emerald-500/20 shadow-[inset_0_0_35px_rgba(16,185,129,0.2),inset_0_1px_0_rgba(255,255,255,0.4),0_10px_30px_rgba(0,0,0,0.08)]"
                    : "bg-white/[0.15] border-white/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_10px_30px_rgba(0,0,0,0.08)]"
                )}>
                  <div className="flex items-center gap-3">
                    {/* Book Icon: Turns green on completion */}
                    <div className={cn(
                      "p-2.5 rounded-xl flex items-center justify-center border transition-colors duration-600",
                      isAnimatingCompleted && isArrowSuccessVisual
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600"
                        : "bg-[#FF9900]/10 border-[#FF9900]/20 text-[#FF9900]"
                    )}>
                      <FlippingBook className="w-5 h-5" />
                    </div>

                    {/* Header text container: Animates on topic change */}
                    <div className="flex-1 min-w-0">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={displayTopic.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 50 }}
                          transition={{ duration: 0.4, ease: "easeInOut" }}
                          className="flex flex-col"
                        >
                          <div className="relative h-3.5 w-full">
                            <AnimatePresence initial={false}>
                              {!(isAnimatingCompleted && isArrowSuccessVisual) ? (
                                <motion.span
                                  key="focus-title"
                                  initial={{ clipPath: "inset(0 0 0 0)" }}
                                  animate={{ clipPath: "inset(0 0 0 0)" }}
                                  exit={{ clipPath: "inset(0 0 0 100%)" }}
                                  transition={{ duration: 0.8, ease: "easeInOut" }}
                                  className="absolute left-0 top-0 text-[9px] font-extrabold uppercase tracking-widest text-slate-400 block font-heading whitespace-nowrap"
                                >
                                  Current Topic Focus
                                </motion.span>
                              ) : (
                                <motion.span
                                  key="completed-title"
                                  initial={{ clipPath: "inset(0 100% 0 0)" }}
                                  animate={{ clipPath: "inset(0 0 0 0)" }}
                                  transition={{ duration: 0.8, ease: "easeInOut" }}
                                  className="absolute left-0 top-0 text-[9px] font-extrabold uppercase tracking-widest text-emerald-600 block font-heading whitespace-nowrap"
                                >
                                  Completed
                                </motion.span>
                              )}
                            </AnimatePresence>
                          </div>

                          <h3 className="text-lg font-black text-slate-900 leading-tight font-heading mt-0.5 truncate">
                            {displayTopic.name}
                          </h3>
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </div>

                  <div className="border-t border-slate-200/50 pt-5 flex flex-col gap-4">
                    <div className="relative">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-heading block mb-2.5">
                        Description
                      </span>
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={displayTopic.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 50 }}
                          transition={{ duration: 0.4, ease: "easeInOut" }}
                        >
                          {displayTopic.description ? (
                            <ul className="list-none pl-0 flex flex-col gap-2.5">
                              {parseBulletPoints(displayTopic.description).map((item, index) => (
                                <li key={index} className="flex items-start gap-2.5">
                                  <span className={cn(
                                    "w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5 transition-colors duration-600",
                                    isAnimatingCompleted && isArrowSuccessVisual ? "bg-emerald-500" : "bg-[#FF9900]"
                                  )} />
                                  <span
                                    className="text-xs text-slate-700 leading-relaxed font-semibold whitespace-pre-line break-words"
                                    style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
                                  >
                                    {item}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-xs text-slate-400 italic font-medium">
                              No description provided for this topic.
                            </p>
                          )}
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </div>

                </div>
              ) : (
                <div className="w-full bg-white/[0.08] backdrop-blur-[20px] border border-white/15 rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_8px_24px_rgba(0,0,0,0.05)] opacity-80">
                  <BookOpen className="w-10 h-10 text-slate-350 mb-3 stroke-[1.5]" />
                  <span className="text-xs font-bold text-slate-500">No active topic selected</span>
                  <span className="text-[10px] text-slate-400 mt-1">Select a topic from the roadmap to view details.</span>
                </div>
              )}
            </div>
          </div>

          {/* Guidelines Popup Modal */}
          <AnimatePresence>
            {showGuidelines && (
              <motion.div
                key="guidelines-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
                onClick={() => setShowGuidelines(false)}
              >
                <motion.div
                  key="guidelines-modal"
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  transition={{ duration: 0.25 }}
                  className="relative w-full max-w-md max-h-[85vh] overflow-y-auto rounded-2xl bg-gradient-to-b from-[#bae6fd] via-[#e0f2fe] to-[#e0f2fe] shadow-2xl border border-sky-200/50 overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Sky Background from Roadmaps */}
                  <SkyBackground />

                  <button
                    onClick={() => setShowGuidelines(false)}
                    className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-white/80 hover:bg-white flex items-center justify-center transition-colors border border-sky-100/50 shadow-sm"
                  >
                    <X className="w-4 h-4 text-slate-650" />
                  </button>
                  <div className="p-5 relative z-10">
                    <LearningGuidePanel />
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </AppLayout>
  );
}

// ─── Animated Flipping Book Icon ───────────────────────────────────────────
function FlippingBook({ className }: { className?: string }) {
  return (
    <span className={cn("relative inline-block w-5 h-5", className)} style={{ perspective: '120px' }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes page-flip-y {
          0% {
            transform: rotateY(0deg);
          }
          70%, 100% {
            transform: rotateY(-180deg);
          }
        }
      `}} />
      
      {/* Background static book */}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="absolute inset-0 w-full h-full text-current opacity-60"
      >
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>

      {/* Turning page */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          transformOrigin: '50% 50%',
          animation: 'page-flip-y 4s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite',
          transformStyle: 'preserve-3d',
          backfaceVisibility: 'visible',
        }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-full h-full text-current"
          style={{
            backfaceVisibility: 'visible',
          }}
        >
          {/* A single page sheet (the right page outline that rotates to the left) */}
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
      </div>
    </span>
  );
}
