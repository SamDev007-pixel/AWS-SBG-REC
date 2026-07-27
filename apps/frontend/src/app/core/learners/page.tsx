'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import * as Icons from 'lucide-react';
import { cn } from '@/lib/utils';
import { learnersService, type LearnerSummary } from '@/services/roadmap.api';
import { getAuthSession } from '@/lib/authHelper';
import RoadmapNavHeader from '@/components/Core/RoadmapNavHeader';

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function CoreLearnersDirectoryPage() {
  const session = getAuthSession();
  const isCrew = false; // Core admin view
  const [learners, setLearners] = useState<LearnerSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [roleFilter, setRoleFilter] = useState<'all' | 'CREW' | 'ENTHUSIAST'>('all');
  const [moduleFilterType, setModuleFilterType] = useState<'all' | 'above' | 'below'>('all');
  const [moduleFilterValue, setModuleFilterValue] = useState<number>(3);
  const [expandedLearnerId, setExpandedLearnerId] = useState<string | null>(null);

  const handleToggleExpand = (learnerId: string) => {
    setExpandedLearnerId((prev) => (prev === learnerId ? null : learnerId));
  };

  useEffect(() => {
    const fetchLearners = async () => {
      try {
        setLoading(true);
        const data = await learnersService.getLearners();
        setLearners(data);
      } catch (err: any) {
        setError(err?.message || 'Failed to load learners');
      } finally {
        setLoading(false);
      }
    };
    fetchLearners();
  }, []);

  const filteredLearners = learners.filter((learner) => {
    const matchesSearch =
      learner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      learner.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole =
      roleFilter === 'all' || learner.role === roleFilter;

    let matchesModules = true;
    if (moduleFilterType === 'above') {
      matchesModules = learner.completedModulesCount >= moduleFilterValue;
    } else if (moduleFilterType === 'below') {
      matchesModules = learner.completedModulesCount <= moduleFilterValue;
    }

    return matchesSearch && matchesRole && matchesModules;
  });

  const totalModulesCount =
    learners.length > 0 ? learners[0].totalModulesCount : 0;

  const totalTopicsCount =
    learners.length > 0 ? learners[0].totalTopicsCount : 0;

  return (
    <div className="h-full flex flex-col bg-slate-50 text-slate-800 overflow-hidden font-sans">

      <RoadmapNavHeader
        activeTab="learners"
        desktopRightAction={
          <div className="relative w-72 flex-shrink-0">
            <input
              type="text"
              placeholder="Search learner name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-850 placeholder-slate-450 focus:bg-white focus:outline-none focus:border-indigo-500 transition-colors shadow-inner"
            />
            <Icons.Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-450" />
          </div>
        }
        mobileRightAction={null}
      />

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 space-y-6 w-full max-w-full">

        {/* FILTERS & SEARCH ROW */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Left: Role Filter Segmented Control */}
          <div className="w-full lg:w-auto bg-slate-100/90 p-1 rounded-xl flex items-center border border-slate-200/80 shadow-2xs gap-1 select-none">
            {[
              { id: 'all', label: 'All', fullLabel: 'All Learners' },
              { id: 'CREW', label: 'Crew', fullLabel: 'Crew Members' },
              { id: 'ENTHUSIAST', label: 'Learners', fullLabel: 'Learners' },
            ].map((tab) => {
              const active = roleFilter === tab.id;
              const count =
                tab.id === 'all'
                  ? learners.length
                  : learners.filter((l) => l.role === tab.id).length;
              return (
                <button
                  key={tab.id}
                  onClick={() => setRoleFilter(tab.id as any)}
                  className={cn(
                    "flex-1 lg:flex-none px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-lg text-[11px] sm:text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer",
                    active
                      ? "bg-white text-slate-900 font-bold shadow-2xs border border-slate-200/90"
                      : "text-slate-600 font-semibold hover:text-slate-900 hover:bg-slate-200/60"
                  )}
                >
                  <span className="hidden lg:inline">{tab.fullLabel}</span>
                  <span className="lg:hidden">{tab.label}</span>
                  <span className={cn(
                    "px-1.5 py-0.5 rounded-md text-[9px] sm:text-[10px] font-bold tabular-nums border",
                    active
                      ? "bg-amber-50 text-amber-700 border-amber-200/80"
                      : "bg-slate-200/60 text-slate-500 border-transparent"
                  )}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right: Search & Module Completion Filters */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Icons.Search className="h-4 w-4 text-slate-400" />
              </span>
              <input
                type="text"
                placeholder="Search learner..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 hover:border-slate-300 rounded-lg bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF9900]/15 focus:border-[#FF9900] font-medium transition-all shadow-2xs"
              />
            </div>

            {/* Module Completion Filter */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-auto">
                <select
                  value={moduleFilterType}
                  onChange={(e) => setModuleFilterType(e.target.value as 'all' | 'above' | 'below')}
                  className="block w-full text-xs py-1.5 pl-3 pr-8 border border-slate-200 hover:border-slate-300 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF9900]/15 focus:border-[#FF9900] font-semibold transition-all shadow-2xs cursor-pointer appearance-none"
                >
                  <option value="all">Any completion</option>
                  <option value="above">Completed modules &gt;=</option>
                  <option value="below">Completed modules &lt;=</option>
                </select>
                <Icons.ChevronDown className="absolute right-2.5 top-2.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              </div>

              {moduleFilterType !== 'all' && (
                <input
                  type="number"
                  min={0}
                  max={20}
                  value={moduleFilterValue}
                  onChange={(e) => setModuleFilterValue(Number(e.target.value))}
                  className="w-14 border border-slate-200 hover:border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 text-center font-bold focus:outline-none focus:ring-2 focus:ring-[#FF9900]/15 focus:border-[#FF9900] bg-white transition-all shadow-2xs"
                />
              )}
            </div>
          </div>

        </div>

        {/* STAT CARDS */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          {[
            { label: 'Learners', fullLabel: 'Total Learners', value: learners.length, icon: Icons.Users, iconColor: 'text-[#FF9900] bg-amber-50 border-amber-200' },
            { label: 'Modules', fullLabel: 'Total Modules', value: totalModulesCount, icon: Icons.Layers, iconColor: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
            { label: 'Topics', fullLabel: 'Total Topics', value: totalTopicsCount, icon: Icons.BookOpen, iconColor: 'text-sky-600 bg-sky-50 border-sky-200' },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white border border-slate-200 rounded-xl sm:rounded-2xl p-2.5 sm:p-4 flex items-center justify-between shadow-2xs min-w-0">
              <div className="min-w-0 flex-1 pr-1">
                <span className="text-[9px] sm:text-[10px] font-bold uppercase text-slate-400 block tracking-wider truncate">
                  <span className="hidden sm:inline">{stat.fullLabel}</span>
                  <span className="sm:hidden">{stat.label}</span>
                </span>
                <span className="text-sm sm:text-xl font-bold text-slate-800 block mt-0.5 tabular-nums truncate">
                  {stat.value}
                </span>
              </div>
              <div className={cn("w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center border shadow-2xs flex-shrink-0", stat.iconColor)}>
                <stat.icon className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
              </div>
            </div>
          ))}
        </div>

        {/* TABLE (Desktop View) */}
        <div className="hidden md:block bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-[10px] uppercase font-black tracking-wider text-slate-450 bg-slate-50/50">
                  <th className="py-4 px-6">Learner Account</th>
                  <th className="py-4 pl-6 pr-12 text-right md:px-6 md:text-center">XP</th>
                  <th className="py-4 px-6 hidden md:table-cell">Current Topic</th>
                  <th className="py-4 px-6 text-center hidden md:table-cell">Topic #</th>
                  <th className="py-4 px-6 text-center hidden md:table-cell">Current Level</th>
                  <th className="py-4 px-6 text-left hidden md:table-cell">Current Module</th>
                  <th className="py-4 px-6 text-center hidden md:table-cell">Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {loading ? (
                  [1, 2, 3, 4, 5].map((n) => (
                    <tr key={n} className="animate-pulse border-b border-slate-100">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3.5">
                          <div className="w-9 h-9 rounded-xl bg-slate-200/70 flex-shrink-0" />
                          <div className="space-y-1.5">
                            <div className="w-32 h-3.5 bg-slate-200/80 rounded-md" />
                            <div className="w-48 h-3 bg-slate-100 rounded-md" />
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center"><div className="w-12 h-4 bg-amber-100/60 rounded-md mx-auto" /></td>
                      <td className="py-4 px-6"><div className="w-36 h-3.5 bg-slate-100 rounded-md" /></td>
                      <td className="py-4 px-6 text-center"><div className="w-10 h-3.5 bg-slate-100 rounded-md mx-auto" /></td>
                      <td className="py-4 px-6 text-center"><div className="w-20 h-5 bg-slate-100 rounded-md mx-auto" /></td>
                      <td className="py-4 px-6 text-left"><div className="w-28 h-3.5 bg-slate-100 rounded-md" /></td>
                      <td className="py-4 px-6 text-center"><div className="w-16 h-4 bg-emerald-100/60 rounded-md mx-auto" /></td>
                    </tr>
                  ))
                ) : error ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-rose-450 text-xs italic">
                      {error}
                    </td>
                  </tr>
                ) : filteredLearners.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-slate-400 text-xs italic">
                      No matching learners found.
                    </td>
                  </tr>
                ) : (
                  filteredLearners.map((learner) => {
                    const isCrewLearner = learner.role === 'CREW';
                    const isComplete = learner.isPlatformComplete;

                    const rowBg = isComplete
                      ? "bg-emerald-50/60 hover:bg-emerald-50"
                      : isCrewLearner
                        ? "bg-amber-50/40 hover:bg-amber-50/70"
                        : "hover:bg-slate-55 bg-white hover:bg-slate-50";

                    const avatarBg = isComplete
                      ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                      : isCrewLearner
                        ? "bg-amber-100 text-amber-700 border-amber-200"
                        : "bg-indigo-50 text-indigo-650 border-indigo-100";

                    const nameColor = isComplete
                      ? "text-emerald-800"
                      : "text-slate-805 text-slate-800";

                    return (
                      <tr
                        key={learner.id}
                        className={cn("transition-colors", rowBg)}
                      >
                        {/* Name, Email & Badge */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3.5">
                            <div className={cn(
                              "w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs border flex-shrink-0",
                              avatarBg
                            )}>
                              {getInitials(learner.name)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className={cn(
                                  "font-extrabold transition-colors text-xs",
                                  nameColor
                                )}>
                                  {learner.name}
                                </span>
                              </div>
                              <span className="text-slate-500 text-[11px] block mt-0.5 font-medium">
                                {learner.email}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* XP */}
                        <td className="py-4 pl-6 pr-12 text-right md:px-6 md:text-center">
                          <span className="text-amber-600 font-black">
                            {learner.xp}
                          </span>
                        </td>

                        {/* Current Topic */}
                        <td className="py-4 px-6 hidden md:table-cell">
                          <span className="text-slate-600 font-semibold">
                            {learner.currentTopic ?? '—'}
                          </span>
                        </td>

                        {/* Topic Number */}
                        <td className="py-4 px-6 text-center hidden md:table-cell">
                          {learner.currentTopicNumber ? (
                            <span className="text-slate-600 font-bold">
                              {learner.currentTopicNumber}/{learner.totalTopicsCount}
                            </span>
                          ) : (
                            <span className="text-slate-300 font-bold">—</span>
                          )}
                        </td>

                        {/* Current Level */}
                        <td className="py-4 px-6 text-center hidden md:table-cell">
                          {learner.currentLevel ? (
                            <span className={cn(
                              "px-2.5 py-1 rounded-xl text-[9px] font-black border uppercase tracking-wider whitespace-nowrap",
                              learner.currentLevel === 'BEGINNER'
                                ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                : learner.currentLevel === 'INTERMEDIATE'
                                  ? "bg-cyan-50 text-cyan-600 border-cyan-100"
                                  : "bg-indigo-50 text-indigo-650 border-indigo-100"
                            )}>
                              {learner.currentLevel}
                            </span>
                          ) : (
                            <span className="text-slate-300 text-[9px] font-bold">—</span>
                          )}
                        </td>

                        {/* Current Module */}
                        <td className="py-4 px-6 text-left hidden md:table-cell">
                          <span className="text-slate-655 font-semibold text-slate-600">
                            {learner.currentModuleName ?? (isComplete ? 'Completed' : '—')}
                          </span>
                          {learner.currentModuleOrder !== null && (
                            <span className="text-slate-400 text-[9px] block mt-0.5 font-bold">
                              #{learner.currentModuleOrder + 1}
                            </span>
                          )}
                        </td>

                        {/* Progress */}
                        <td className="py-4 px-6 text-center hidden md:table-cell">
                          <span className={cn(
                            "font-black",
                            isComplete ? "text-emerald-600" : "text-slate-600"
                          )}>
                            {learner.completedModulesCount} / {learner.totalModulesCount}
                          </span>
                          {isComplete && (
                            <span className="ml-1.5 inline-flex items-center text-[8px] font-black text-emerald-600 bg-emerald-100 border border-emerald-200 rounded-md px-1.5 py-0.5 uppercase">
                              Complete
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* MOBILE VIEW LIST */}
        <div className="block md:hidden bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
          {/* Mobile Header Row */}
          <div className="border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50/50 flex justify-between items-center py-3 px-4 select-none">
            <span>Learner</span>
            <span>XP</span>
          </div>
          {loading ? (
            <div className="divide-y divide-slate-100 animate-pulse">
              {[1, 2, 3, 4, 5].map((n) => (
                <div key={n} className="flex items-center justify-between py-3.5 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-200/70 flex-shrink-0" />
                    <div className="space-y-1.5">
                      <div className="w-28 h-3.5 bg-slate-200/80 rounded-md" />
                      <div className="w-40 h-3 bg-slate-100 rounded-md" />
                    </div>
                  </div>
                  <div className="w-14 h-4 bg-amber-100/60 rounded-md" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-10 text-rose-450 text-xs italic">
              {error}
            </div>
          ) : filteredLearners.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs italic">
              No matching learners found.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredLearners.map((learner) => {
                const isCrewLearner = learner.role === 'CREW';
                const isComplete = learner.isPlatformComplete;

                const rowBg = isComplete
                  ? "bg-emerald-50/60 hover:bg-emerald-50"
                  : isCrewLearner
                    ? "bg-amber-50/40 hover:bg-amber-50/70"
                    : "hover:bg-slate-55 bg-white hover:bg-slate-50";

                const avatarBg = isComplete
                  ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                  : isCrewLearner
                    ? "bg-amber-100 text-amber-700 border-amber-200"
                    : "bg-indigo-50 text-indigo-650 border-indigo-100";

                const nameColor = isComplete
                  ? "text-emerald-800"
                  : "text-slate-800";

                const expanded = expandedLearnerId === learner.id;

                return (
                  <div
                    key={learner.id}
                    onClick={() => handleToggleExpand(learner.id)}
                    className={cn("flex flex-col cursor-pointer transition-colors", rowBg)}
                  >
                    <div className="flex items-center gap-3 py-3.5 px-4">
                      {/* Avatar */}
                      <div className={cn(
                        "w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs border flex-shrink-0",
                        avatarBg
                      )}>
                        {getInitials(learner.name)}
                      </div>

                      {/* Content Area */}
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        {/* Name & XP Line */}
                        <div className="flex items-center justify-between gap-2">
                          <span className={cn("font-extrabold text-xs truncate", nameColor)}>
                            {learner.name}
                          </span>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <span className="text-amber-600 font-black text-xs">
                              {learner.xp} XP
                            </span>
                            {expanded ? (
                              <Icons.ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                            ) : (
                              <Icons.ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                            )}
                          </div>
                        </div>

                        {/* Email */}
                        <span className="text-slate-500 text-[11px] font-medium truncate mt-0.5">
                          {learner.email}
                        </span>
                      </div>
                    </div>

                    {expanded && (
                      <div className="px-4 pb-4 pt-1">
                        <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-3.5 space-y-2 text-xs shadow-2xs">
                          {/* Current Topic */}
                          <div className="flex justify-between items-center py-1.5 border-b border-slate-200/60">
                            <span className="text-slate-500 font-medium text-[11px]">Current Topic</span>
                            <span className="text-slate-700 font-medium text-xs">{learner.currentTopic ?? '—'}</span>
                          </div>

                          {/* Topic # */}
                          <div className="flex justify-between items-center py-1.5 border-b border-slate-200/60">
                            <span className="text-slate-500 font-medium text-[11px]">Topic #</span>
                            <span className="text-slate-700 font-medium text-xs tabular-nums">
                              {learner.currentTopicNumber ? `${learner.currentTopicNumber}/${learner.totalTopicsCount}` : '—'}
                            </span>
                          </div>

                          {/* Current Level */}
                          <div className="flex justify-between items-center py-1.5 border-b border-slate-200/60">
                            <span className="text-slate-500 font-medium text-[11px]">Current Level</span>
                            {learner.currentLevel ? (
                              <span className={cn(
                                "px-2 py-0.5 rounded-md text-[9px] font-bold border uppercase tracking-wider",
                                learner.currentLevel === 'BEGINNER'
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : learner.currentLevel === 'INTERMEDIATE'
                                    ? "bg-amber-50 text-amber-700 border-amber-200"
                                    : "bg-rose-50 text-rose-700 border-rose-200"
                              )}>
                                {learner.currentLevel}
                              </span>
                            ) : (
                              <span className="text-slate-400 font-medium text-xs">—</span>
                            )}
                          </div>

                          {/* Current Module */}
                          <div className="flex justify-between items-center py-1.5 border-b border-slate-200/60">
                            <span className="text-slate-500 font-medium text-[11px]">Current Module</span>
                            <div className="text-right font-medium text-xs">
                              <span className="text-slate-700 block">{learner.currentModuleName ?? (isComplete ? 'Completed' : '—')}</span>
                              {learner.currentModuleOrder !== null && (
                                <span className="text-slate-400 text-[9px] font-medium block mt-0.5">#{learner.currentModuleOrder + 1}</span>
                              )}
                            </div>
                          </div>

                          {/* Progress */}
                          <div className="flex justify-between items-center pt-1.5">
                            <span className="text-slate-500 font-medium text-[11px]">Progress</span>
                            <div className="flex items-center gap-1.5">
                              <span className={cn("font-medium text-xs tabular-nums", isComplete ? "text-emerald-700" : "text-slate-700")}>
                                {learner.completedModulesCount} / {learner.totalModulesCount}
                              </span>
                              {isComplete && (
                                <span className="text-[9px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md px-2 py-0.5 uppercase">
                                  Complete
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
