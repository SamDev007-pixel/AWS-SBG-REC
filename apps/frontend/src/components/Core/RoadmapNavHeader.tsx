'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export interface RoadmapNavHeaderProps {
  activeTab: 'builder' | 'learners' | 'guidelines';
  desktopRightAction?: React.ReactNode;
  mobileRightAction?: React.ReactNode;
  topicNumber?: number;
  topicName?: string;
}

export default function RoadmapNavHeader({
  activeTab,
  desktopRightAction,
  mobileRightAction,
  topicNumber,
  topicName,
}: RoadmapNavHeaderProps) {
  const tabs = [
    {
      id: 'builder',
      desktopLabel: 'Roadmap Builder',
      mobileLabel: 'Builder',
      href: '/core/topics',
    },
    {
      id: 'learners',
      desktopLabel: 'Learners Directory',
      mobileLabel: 'Learners',
      href: '/core/learners',
    },
    {
      id: 'guidelines',
      desktopLabel: 'Learning Guidelines',
      mobileLabel: 'Guidelines',
      href: '/core/guidelines',
    },
  ];

  return (
    <header className="flex-shrink-0 select-none w-full bg-white border-b border-slate-200">
      {/* DESKTOP HEADER (LG AND ABOVE) */}
      <div className="hidden lg:flex h-14 items-center justify-between px-8 w-full">
        <div className="flex items-center gap-6 h-full text-xs font-bold" role="tablist" aria-label="Roadmap builder navigation">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <Link
                key={tab.id}
                href={tab.href}
                role="tab"
                aria-selected={isActive}
                className={
                  isActive
                    ? "transition-all duration-150 h-full flex items-center px-1 border-b-2 text-indigo-650 font-extrabold border-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                    : "transition-all duration-150 h-full flex items-center px-1 text-slate-500 hover:text-indigo-600 hover:border-b-2 hover:border-indigo-300 border-b-2 border-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                }
              >
                {tab.desktopLabel}
              </Link>
            );
          })}
        </div>
        {desktopRightAction && (
          <div className="flex items-center flex-shrink-0">
            {desktopRightAction}
          </div>
        )}
      </div>

      {/* MOBILE & TABLET HEADER & SECONDARY SUB-NAV (< LG) */}
      <div className="block lg:hidden w-full">
        {/* Top Header Bar */}
        <div className="h-14 flex items-center justify-center px-4 border-b border-slate-150 relative">
          <div className="flex items-center justify-center gap-2 min-w-0">
            <span className="font-extrabold text-sm text-slate-900 font-heading tracking-tight truncate text-center">
              Roadmap Builder
            </span>
            {topicNumber !== undefined && (
              <span className="text-[10px] font-black text-indigo-650 bg-indigo-50 border border-indigo-150 px-2 py-0.5 rounded-md font-heading uppercase tracking-wider flex-shrink-0">
                Topic #{topicNumber}
              </span>
            )}
          </div>
          {mobileRightAction !== null && (mobileRightAction ?? desktopRightAction) ? (
            <div className="flex items-center flex-shrink-0 absolute right-4">
              {mobileRightAction ?? desktopRightAction}
            </div>
          ) : null}
        </div>

        {/* Secondary Sub-Navigation Bar */}
        <nav
          aria-label="Roadmap section tabs"
          className="h-11 flex items-center justify-center gap-1 sm:gap-2 px-4 overflow-x-auto no-scrollbar border-t border-slate-100/60 bg-slate-50/50 relative"
          role="tablist"
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <Link
                key={tab.id}
                href={tab.href}
                role="tab"
                aria-selected={isActive}
                className={`relative transition-colors duration-150 h-full min-h-[44px] flex items-center px-3 text-xs font-bold whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                  isActive
                    ? "text-indigo-650 font-extrabold"
                    : "text-slate-500 hover:text-indigo-600"
                }`}
              >
                <span>{tab.mobileLabel}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeRoadmapSubTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full"
                    transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
