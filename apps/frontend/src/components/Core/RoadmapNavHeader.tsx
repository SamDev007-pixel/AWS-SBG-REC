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
        <div className="flex items-center gap-7 h-full text-sm font-bold" role="tablist" aria-label="Roadmap builder navigation">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <Link
                key={tab.id}
                href={tab.href}
                role="tab"
                aria-selected={isActive}
                className={`relative h-full flex items-center px-3 text-xs font-bold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF9900] ${
                  isActive
                    ? "text-[#FF9900] font-extrabold"
                    : "text-slate-600 hover:text-[#FF9900]"
                }`}
              >
                <span>{tab.desktopLabel}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeDesktopRoadmapTab"
                    className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#FF9900] rounded-t-full"
                    transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                  />
                )}
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
            <span className="font-extrabold text-base text-slate-900 font-heading tracking-tight truncate text-center">
              Roadmap Builder
            </span>
            {topicNumber !== undefined && (
              <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200/80 px-2.5 py-0.5 rounded-md uppercase tracking-wider flex-shrink-0">
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
          className="h-12 flex items-center justify-around sm:justify-center gap-2 sm:gap-6 px-4 border-t border-slate-100/80 bg-slate-50/50 relative"
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
                className={`relative transition-colors duration-150 h-full min-h-[44px] flex items-center justify-center px-4 text-sm font-bold whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF9900] ${
                  isActive
                    ? "text-[#FF9900] font-extrabold"
                    : "text-slate-600 hover:text-[#FF9900]"
                }`}
              >
                <span>{tab.mobileLabel}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeRoadmapSubTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF9900] rounded-t-full"
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
