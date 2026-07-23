'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SmartScrollNavigationProps {
  /** Optional scroll container ref. If not provided or if non-scrollable, dynamically detects active scrolling element. */
  containerRef?: React.RefObject<HTMLElement | null>;
  /** Optional custom scroll down handler. */
  onScrollDown?: () => void;
}

export function SmartScrollNavigation({ containerRef, onScrollDown }: SmartScrollNavigationProps) {
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
      setShowUp(false);
      setShowDown(true);
    } else if (isAtBottom) {
      setShowUp(true);
      setShowDown(false);
    } else {
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

  const handleScrollUp = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    if (containerRef?.current) {
      containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
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

    const activeCard = document.querySelector<HTMLElement>('[data-active-topic="true"]');
    if (activeCard) {
      const rect = activeCard.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      const elementCenter = rect.top + rect.height / 2;
      const viewportCenter = viewportHeight / 2;

      const isAlreadyAtTopic = Math.abs(elementCenter - viewportCenter) < 150 || (rect.top >= 40 && rect.bottom <= viewportHeight - 40);

      if (!isAlreadyAtTopic) {
        activeCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
    }

    if (typeof window !== 'undefined') {
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
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
      className="fixed bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-40 flex lg:hidden flex-row items-center gap-3 sm:gap-3.5 pointer-events-none pb-[env(safe-area-inset-bottom,0px)]"
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
            className="pointer-events-auto w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-slate-900/60 backdrop-blur-[16px] border border-white/25 text-slate-100 flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_8px_20px_rgba(0,0,0,0.25)] hover:bg-slate-900/80 hover:border-white/40 hover:text-white hover:shadow-[0_0_15px_rgba(255,153,0,0.3)] transition-all duration-200 cursor-pointer active:scale-95 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF9900]"
          >
            <ChevronUp className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5] text-slate-100 group-hover:text-white transition-transform group-hover:-translate-y-0.5" />
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
            className="pointer-events-auto w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-slate-900/60 backdrop-blur-[16px] border border-white/25 text-slate-100 flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_8px_20px_rgba(0,0,0,0.25)] hover:bg-slate-900/80 hover:border-white/40 hover:text-white hover:shadow-[0_0_15px_rgba(255,153,0,0.3)] transition-all duration-200 cursor-pointer active:scale-95 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF9900]"
          >
            <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5] text-slate-100 group-hover:text-white transition-transform group-hover:translate-y-0.5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
