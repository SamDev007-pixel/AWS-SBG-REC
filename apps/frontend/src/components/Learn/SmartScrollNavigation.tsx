'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SmartScrollNavigationProps {
  /** Optional scroll container ref. If not provided or if non-scrollable, dynamically detects active scrolling element. */
  containerRef?: React.RefObject<HTMLElement | null>;
  /** Optional custom scroll down handler. */
  onScrollDown?: () => void;
  /** Optional custom scroll up handler. */
  onScrollUp?: () => void;
}

export function SmartScrollNavigation({ containerRef, onScrollDown, onScrollUp }: SmartScrollNavigationProps) {
  const [showUp, setShowUp] = useState(false);
  const [showDown, setShowDown] = useState(false);
  const activeContainerRef = useRef<HTMLElement | Window | null>(null);

  const getScrollContainer = useCallback((): { container: HTMLElement | Window; scrollTop: number; scrollHeight: number; clientHeight: number } | null => {
    if (typeof window === 'undefined') return null;

    if (containerRef?.current) {
      const el = containerRef.current;
      if (el.scrollHeight > el.clientHeight + 40) {
        return {
          container: el,
          scrollTop: el.scrollTop,
          scrollHeight: el.scrollHeight,
          clientHeight: el.clientHeight,
        };
      }
    }

    const winScroll = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
    const winHeight = window.innerHeight;
    const docHeight = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);

    if (docHeight > winHeight + 40 && winScroll > 0) {
      return {
        container: window,
        scrollTop: winScroll,
        scrollHeight: docHeight,
        clientHeight: winHeight,
      };
    }

    const candidates = Array.from(document.querySelectorAll<HTMLElement>('.overflow-y-auto, main, div'));
    const activeScrollEl = candidates.find(
      (el) => el.scrollHeight > el.clientHeight + 40 && el.clientHeight > 0
    );

    if (activeScrollEl) {
      return {
        container: activeScrollEl,
        scrollTop: activeScrollEl.scrollTop,
        scrollHeight: activeScrollEl.scrollHeight,
        clientHeight: activeScrollEl.clientHeight,
      };
    }

    return {
      container: window,
      scrollTop: winScroll,
      scrollHeight: docHeight,
      clientHeight: winHeight,
    };
  }, [containerRef]);

  const updateScrollState = useCallback(() => {
    const info = getScrollContainer();
    if (!info) return;

    const { container, scrollTop, scrollHeight, clientHeight } = info;
    activeContainerRef.current = container;

    const isScrollable = scrollHeight > clientHeight + 40;

    if (!isScrollable) {
      setShowUp(false);
      setShowDown(false);
      return;
    }

    const isAtTop = scrollTop <= 40;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 40;

    if (isAtTop) {
      // Top of page: ONLY Down arrow appears
      setShowUp(false);
      setShowDown(true);
    } else if (isAtBottom) {
      // Bottom of page: ONLY Up arrow appears
      setShowUp(true);
      setShowDown(false);
    } else {
      // Current topic / middle of page: BOTH Up and Down arrows appear
      setShowUp(true);
      setShowDown(true);
    }
  }, [getScrollContainer]);

  useEffect(() => {
    updateScrollState();

    const handleScrollCapture = (e: Event) => {
      if (e.target && e.target !== document) {
        const el = e.target as HTMLElement;
        if (el.scrollHeight && el.clientHeight && el.scrollHeight > el.clientHeight + 40) {
          activeContainerRef.current = el;
        }
      }
      updateScrollState();
    };

    window.addEventListener('scroll', handleScrollCapture, { capture: true, passive: true });
    window.addEventListener('resize', updateScrollState, { passive: true });

    const interval = setInterval(updateScrollState, 300);

    return () => {
      window.removeEventListener('scroll', handleScrollCapture, { capture: true });
      window.removeEventListener('resize', updateScrollState);
      clearInterval(interval);
    };
  }, [updateScrollState]);

  type TopicPosition = 'above' | 'at' | 'below';

  // Helper to determine if current page scroll position is ABOVE, AT, or BELOW current active topic
  const getTopicPosition = useCallback((activeCard: HTMLElement): TopicPosition => {
    const info = getScrollContainer();
    const rect = activeCard.getBoundingClientRect();

    let elementCenter: number;
    let viewportCenter: number;

    if (info && info.container !== window && info.container instanceof HTMLElement) {
      const containerRect = info.container.getBoundingClientRect();
      elementCenter = rect.top + rect.height / 2;
      viewportCenter = containerRect.top + containerRect.height / 2;
    } else {
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      elementCenter = rect.top + rect.height / 2;
      viewportCenter = viewportHeight / 2;
    }

    const diff = elementCenter - viewportCenter;

    if (Math.abs(diff) <= 120) {
      return 'at';
    }

    // diff > 120 means the topic element is further down -> current page scroll is ABOVE topic
    if (diff > 120) {
      return 'above';
    }

    // diff < -120 means the topic element is further up -> current page scroll is BELOW topic
    return 'below';
  }, [getScrollContainer]);

  const handleScrollUp = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (onScrollUp) {
      onScrollUp();
      return;
    }

    const activeCard = document.querySelector<HTMLElement>('[data-active-topic="true"], [data-topic-status="CURRENT"]');
    const pos = activeCard ? getTopicPosition(activeCard) : 'at';

    // Rule 4: If page is BELOW current topic, bring page to current topic
    if (activeCard && pos === 'below') {
      activeCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // Rule 3: If page is ABOVE current topic or ON current topic, bring to header (top = 0)
    if (containerRef?.current && containerRef.current.scrollTop > 0) {
      containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }

    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    const candidates = document.querySelectorAll<HTMLElement>('.overflow-y-auto, main, div');
    candidates.forEach((el) => {
      if (el.scrollTop > 0) {
        el.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  };

  const handleScrollDown = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (onScrollDown) {
      onScrollDown();
      return;
    }

    const activeCard = document.querySelector<HTMLElement>('[data-active-topic="true"], [data-topic-status="CURRENT"]');
    const pos = activeCard ? getTopicPosition(activeCard) : 'at';

    // Rule 1: If page is ABOVE current topic, bring page to current topic
    if (activeCard && pos === 'above') {
      activeCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // Rule 2: If topic/page is ON current topic or BELOW it, bring page to bottom
    if (containerRef?.current && containerRef.current.scrollHeight > containerRef.current.clientHeight + 40) {
      containerRef.current.scrollTo({ top: containerRef.current.scrollHeight, behavior: 'smooth' });
    }

    if (typeof window !== 'undefined') {
      const targetScroll = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
      window.scrollTo({ top: targetScroll, behavior: 'smooth' });
    }

    const candidates = document.querySelectorAll<HTMLElement>('.overflow-y-auto, main, div');
    candidates.forEach((el) => {
      if (el.scrollHeight > el.clientHeight + 40) {
        el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
      }
    });
  };

  if (!showUp && !showDown) return null;

  return (
    <div
      className="fixed bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-40 flex flex-row items-center gap-3 sm:gap-3.5 pointer-events-none pb-[env(safe-area-inset-bottom,0px)]"
      style={{ isolation: 'isolate' }}
    >
      <AnimatePresence>
        {showUp && (
          <motion.button
            key="scroll-up-arrow"
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            onClick={handleScrollUp}
            aria-label="Scroll Up"
            type="button"
            className="pointer-events-auto w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/40 hover:bg-white/70 backdrop-blur-xl border border-white/50 text-black flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_8px_24px_rgba(0,0,0,0.12)] hover:shadow-[0_0_20px_rgba(255,255,255,0.6)] transition-all duration-200 cursor-pointer active:scale-95 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/40"
          >
            <ChevronUp className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5] text-black group-hover:scale-110 transition-transform group-hover:-translate-y-0.5" />
          </motion.button>
        )}

        {showDown && (
          <motion.button
            key="scroll-down-arrow"
            initial={{ opacity: 0, scale: 0.8, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -10 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            onClick={handleScrollDown}
            aria-label="Scroll Down"
            type="button"
            className="pointer-events-auto w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/40 hover:bg-white/70 backdrop-blur-xl border border-white/50 text-black flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_8px_24px_rgba(0,0,0,0.12)] hover:shadow-[0_0_20px_rgba(255,255,255,0.6)] transition-all duration-200 cursor-pointer active:scale-95 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/40"
          >
            <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5] text-black group-hover:scale-110 transition-transform group-hover:translate-y-0.5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
