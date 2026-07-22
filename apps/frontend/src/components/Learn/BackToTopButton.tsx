'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BackToTopButtonProps {
  /** Optional scroll container ref. If omitted, dynamically tracks active scrolling element or window. */
  containerRef?: React.RefObject<HTMLElement | null>;
}

export function BackToTopButton({ containerRef }: BackToTopButtonProps) {
  const [isVisible, setIsVisible] = useState(false);

  const getScrollTop = useCallback(() => {
    if (typeof window === 'undefined') return 0;

    let maxScroll = 0;

    // Check window scroll
    const winScroll = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
    if (winScroll > maxScroll) maxScroll = winScroll;

    // Check containerRef if provided
    if (containerRef?.current && containerRef.current.scrollTop > maxScroll) {
      maxScroll = containerRef.current.scrollTop;
    }

    // Check any scrollable container in the page (e.g. SidebarLayout div or learn page container)
    const elements = document.querySelectorAll<HTMLElement>('.overflow-y-auto, main, div');
    elements.forEach((el) => {
      if (el.scrollTop > maxScroll) {
        maxScroll = el.scrollTop;
      }
    });

    return maxScroll;
  }, [containerRef]);

  const updateScrollState = useCallback(() => {
    const scrollTop = getScrollTop();
    // Show button after scrolling down 150px on mobile/tablet viewports
    setIsVisible(scrollTop >= 150);
  }, [getScrollTop]);

  useEffect(() => {
    updateScrollState();

    const handleScrollCapture = () => {
      updateScrollState();
    };

    window.addEventListener('scroll', handleScrollCapture, { capture: true, passive: true });
    window.addEventListener('resize', updateScrollState, { passive: true });

    // Interval fallback to ensure dynamic scroll state updates smoothly
    const interval = setInterval(updateScrollState, 250);

    return () => {
      window.removeEventListener('scroll', handleScrollCapture, { capture: true });
      window.removeEventListener('resize', updateScrollState);
      clearInterval(interval);
    };
  }, [updateScrollState]);

  const scrollToTop = (e: React.MouseEvent) => {
    e.stopPropagation();

    // Scroll window smoothly
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Scroll containerRef if active
    if (containerRef?.current) {
      containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Scroll any active scrollable container in the page
    const elements = document.querySelectorAll<HTMLElement>('.overflow-y-auto, main, div');
    elements.forEach((el) => {
      if (el.scrollTop > 0) {
        el.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="back-to-top-btn"
          initial={{ opacity: 0, scale: 0.85, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 15 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="fixed bottom-6 right-5 sm:bottom-7 sm:right-6 z-40 lg:hidden pb-[env(safe-area-inset-bottom,0px)] pr-[env(safe-area-inset-right,0px)]"
        >
          <button
            onClick={scrollToTop}
            aria-label="Back to Top"
            type="button"
            className="w-[52px] h-[52px] sm:w-14 sm:h-14 rounded-full bg-white/90 backdrop-blur-md border border-slate-200/80 text-slate-800 flex items-center justify-center shadow-lg shadow-black/10 hover:bg-white hover:border-slate-300 hover:shadow-xl transition-all duration-200 cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 group"
          >
            <ChevronUp className="w-6 h-6 stroke-[2.5] text-slate-800 transition-transform group-hover:-translate-y-0.5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
