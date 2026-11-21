'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useCrewTasks, useUpdateCrewTaskStatus } from '@/lib/hooks';
import {
  Play,
  RotateCcw,
  CheckCircle2,
  Clock,
  Search,
  LayoutGrid,
  List,
  CalendarDays,
  ListTodo,
  Check,
  X,
  Filter,
  Sparkles,
  Inbox,
  AlertCircle,
  RefreshCw,
  ClipboardList,
  Timer,
  RotateCw,
  BadgeCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CrewTask } from '@/lib/types';

function formatDate(dateString?: string): string {
  if (!dateString) return '—';
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

function statusBadge(status: string) {
  switch (status) {
    case 'PENDING':
      return {
        label: 'Pending',
        badge: 'bg-amber-50 text-amber-700 border-amber-200',
        dot: 'bg-amber-500',
      };
    case 'IN_PROGRESS':
      return {
        label: 'In Progress',
        badge: 'bg-blue-50 text-blue-700 border-blue-200',
        dot: 'bg-blue-500',
      };
    case 'COMPLETED':
      return {
        label: 'Completed',
        badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dot: 'bg-emerald-500',
      };
    default:
      return {
        label: status,
        badge: 'bg-slate-50 text-slate-600 border-slate-200',
        dot: 'bg-slate-400',
      };
  }
}

/* ── Loading Skeleton ── */
function TasksSkeleton({ viewMode }: { viewMode: 'kanban' | 'list' }) {
  if (viewMode === 'kanban') {
    return (
      <div className="grid gap-5 md:grid-cols-3">
        {[1, 2, 3].map((col) => (
          <div key={col} className="space-y-4">
            <div className="h-6 w-32 bg-slate-200/60 rounded animate-pulse" />
            <div className="space-y-3">
              {[1, 2].map((card) => (
                <div
                  key={card}
                  className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-3 animate-pulse"
                >
                  <div className="flex justify-between items-center">
                    <div className="h-4 w-16 bg-slate-100 rounded" />
                    <div className="h-4 w-24 bg-slate-100 rounded" />
                  </div>
                  <div className="h-5 w-3/4 bg-slate-100 rounded" />
                  <div className="h-3.5 w-full bg-slate-50 rounded" />
                  <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                    <div className="h-3 w-20 bg-slate-50 rounded" />
                    <div className="h-7 w-20 bg-slate-100 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/60">
              {['Task Details', 'Associated Event', 'Status', 'Updated', 'Actions'].map((h) => (
                <th key={h} className="px-5 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {[1, 2, 3, 4, 5].map((i) => (
              <tr key={i} className="animate-pulse">
                <td className="px-5 py-4">
                  <div className="h-4 w-48 bg-slate-100 rounded mb-1.5" />
                  <div className="h-3 w-64 bg-slate-50 rounded" />
                </td>
                <td className="px-5 py-4">
                  <div className="h-4 w-28 bg-slate-100 rounded" />
                </td>
                <td className="px-5 py-4">
                  <div className="h-5 w-20 bg-slate-100 rounded-full" />
                </td>
                <td className="px-5 py-4">
                  <div className="h-3.5 w-24 bg-slate-100 rounded" />
                </td>
                <td className="px-5 py-4">
                  <div className="h-7 w-20 bg-slate-100 rounded-lg" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function CrewTasksPage() {
  const { data: tasks = [], isLoading, refetch, isFetching } = useCrewTasks();
  const updateTaskMutation = useUpdateCrewTaskStatus();

  const [search, setSearch] = useState('');
  const [selectedEvent, setSelectedEvent] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'>('ALL');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  // Handle task status transitions
  function handleStatusChange(taskId: string, newStatus: string) {
    updateTaskMutation.mutate({ id: taskId, status: newStatus });
  }

  // Derive unique events list for the event dropdown filter
  const eventOptions = useMemo(() => {
    const map = new Map<string, string>();
    tasks.forEach((t) => {
      if (t.eventId && t.event?.title) {
        map.set(t.eventId, t.event.title);
      }
    });
    return Array.from(map.entries()).map(([id, title]) => ({ id, title }));
  }, [tasks]);

  // Filter tasks based on search, event, and status
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchSearch =
        search.trim() === '' ||
        task.title.toLowerCase().includes(search.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(search.toLowerCase())) ||
        (task.event?.title && task.event.title.toLowerCase().includes(search.toLowerCase()));

      const matchEvent = selectedEvent === 'ALL' || task.eventId === selectedEvent;
      const matchStatus = statusFilter === 'ALL' || task.status === statusFilter;

      return matchSearch && matchEvent && matchStatus;
    });
  }, [tasks, search, selectedEvent, statusFilter]);

  const pendingTasks = useMemo(() => filteredTasks.filter((t) => t.status === 'PENDING'), [filteredTasks]);
  const inProgressTasks = useMemo(() => filteredTasks.filter((t) => t.status === 'IN_PROGRESS'), [filteredTasks]);
  const completedTasks = useMemo(() => filteredTasks.filter((t) => t.status === 'COMPLETED'), [filteredTasks]);

  const totalCount = tasks.length;
  const pendingCount = tasks.filter((t) => t.status === 'PENDING').length;
  const inProgressCount = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const completedCount = tasks.filter((t) => t.status === 'COMPLETED').length;

  return (
    <div
      className="min-h-screen w-full text-[#1A1C1E] relative py-6 px-4 sm:py-8 sm:px-8 overflow-y-auto premium-scrollbar scroll-smooth antialiased"
      style={{
        backgroundImage:
          "linear-gradient(rgba(255, 255, 255, 0.65), rgba(255, 255, 255, 0.65)), url('/images/aws_tech_doodle_bg.png')",
        backgroundRepeat: 'repeat',
        backgroundSize: '480px auto',
      }}
    >
      <div className="max-w-[1500px] w-full mx-auto flex flex-col gap-6 z-10 relative">
        {/* ── Breadcrumb & Header ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400 mb-2">
              <Link href="/crew/dashboard" className="hover:text-[#FF9900] transition-colors font-semibold">
                Crew
              </Link>
              <span className="text-slate-300">/</span>
              <span className="text-[#FF9900] font-semibold">Work Assignments</span>
            </div>

            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-none">
                Operational Crew Tasks
              </h1>
              <span className="px-2 py-0.5 bg-orange-50 text-[#FF9900] border border-orange-200/60 rounded-full text-xs font-semibold">
                {totalCount} Total
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-normal mt-1.5">
              Track and update assigned crew duties, logistics tasks, and on-ground coordination.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start md:self-auto">
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer"
              title="Refresh task list"
            >
              <RefreshCw size={13} className={cn('text-slate-500', isFetching && 'animate-spin')} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* ── Summary Stats Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Total */}
          <button
            onClick={() => setStatusFilter('ALL')}
            className={cn(
              "bg-white border rounded-2xl p-5 shadow-xs relative overflow-hidden flex items-center gap-4 text-left transition-all duration-200 cursor-pointer group",
              statusFilter === 'ALL'
                ? "border-[#FF9900]/80 shadow-md ring-2 ring-[#FF9900]/10 bg-gradient-to-b from-orange-50/15 to-white"
                : "border-slate-200/80 hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5"
            )}
          >
            <div className="absolute top-0 right-0 w-28 h-28 bg-[radial-gradient(circle_at_70%_20%,rgba(0,115,187,0.05)_0%,transparent_60%)] pointer-events-none" />
            <div className={cn(
              "w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105",
              statusFilter === 'ALL'
                ? "bg-slate-900 border-slate-800 text-white shadow-xs"
                : "bg-slate-50 border-slate-200/80 text-slate-700 group-hover:bg-blue-50 group-hover:border-blue-100 group-hover:text-[#0073BB]"
            )}>
              <ClipboardList size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">All Tasks</span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-black text-slate-900 tracking-tight font-display">{totalCount}</span>
                <span className="text-[11px] text-slate-400 font-medium">total</span>
              </div>
            </div>
            {statusFilter === 'ALL' && (
              <span className="absolute top-3 right-3 text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-orange-50 text-[#FF9900] border border-orange-200/60 shadow-xs">
                Active
              </span>
            )}
          </button>

          {/* Pending */}
          <button
            onClick={() => setStatusFilter(statusFilter === 'PENDING' ? 'ALL' : 'PENDING')}
            className={cn(
              "bg-white border rounded-2xl p-5 shadow-xs relative overflow-hidden flex items-center gap-4 text-left transition-all duration-200 cursor-pointer group",
              statusFilter === 'PENDING'
                ? "border-amber-400/90 shadow-md ring-2 ring-amber-400/10 bg-gradient-to-b from-amber-50/20 to-white"
                : "border-slate-200/80 hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5"
            )}
          >
            <div className="absolute top-0 right-0 w-28 h-28 bg-[radial-gradient(circle_at_70%_20%,rgba(245,158,11,0.06)_0%,transparent_60%)] pointer-events-none" />
            <div className={cn(
              "w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105",
              statusFilter === 'PENDING'
                ? "bg-amber-500 border-amber-500 text-white shadow-xs"
                : "bg-amber-50 border-amber-200/70 text-amber-600 group-hover:bg-amber-100/80"
            )}>
              <Timer size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">Pending</span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-black text-slate-900 tracking-tight font-display">{pendingCount}</span>
                <span className="text-[11px] text-amber-600 font-medium">waiting</span>
              </div>
            </div>
            {statusFilter === 'PENDING' && (
              <span className="absolute top-3 right-3 text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/60 shadow-xs">
                Active
              </span>
            )}
          </button>

          {/* In Progress */}
          <button
            onClick={() => setStatusFilter(statusFilter === 'IN_PROGRESS' ? 'ALL' : 'IN_PROGRESS')}
            className={cn(
              "bg-white border rounded-2xl p-5 shadow-xs relative overflow-hidden flex items-center gap-4 text-left transition-all duration-200 cursor-pointer group",
              statusFilter === 'IN_PROGRESS'
                ? "border-blue-400/90 shadow-md ring-2 ring-blue-400/10 bg-gradient-to-b from-blue-50/20 to-white"
                : "border-slate-200/80 hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5"
            )}
          >
            <div className="absolute top-0 right-0 w-28 h-28 bg-[radial-gradient(circle_at_70%_20%,rgba(59,130,246,0.06)_0%,transparent_60%)] pointer-events-none" />
            <div className={cn(
              "w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105",
              statusFilter === 'IN_PROGRESS'
                ? "bg-blue-600 border-blue-600 text-white shadow-xs"
                : "bg-blue-50 border-blue-200/70 text-blue-600 group-hover:bg-blue-100/80"
            )}>
              <RotateCw size={19} />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">In Progress</span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-black text-slate-900 tracking-tight font-display">{inProgressCount}</span>
                <span className="text-[11px] text-blue-600 font-medium">ongoing</span>
              </div>
            </div>
            {statusFilter === 'IN_PROGRESS' && (
              <span className="absolute top-3 right-3 text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60 shadow-xs">
                Active
              </span>
            )}
          </button>

          {/* Completed */}
          <button
            onClick={() => setStatusFilter(statusFilter === 'COMPLETED' ? 'ALL' : 'COMPLETED')}
            className={cn(
              "bg-white border rounded-2xl p-5 shadow-xs relative overflow-hidden flex items-center gap-4 text-left transition-all duration-200 cursor-pointer group",
              statusFilter === 'COMPLETED'
                ? "border-emerald-400/90 shadow-md ring-2 ring-emerald-400/10 bg-gradient-to-b from-emerald-50/20 to-white"
                : "border-slate-200/80 hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5"
            )}
          >
            <div className="absolute top-0 right-0 w-28 h-28 bg-[radial-gradient(circle_at_70%_20%,rgba(16,185,129,0.06)_0%,transparent_60%)] pointer-events-none" />
            <div className={cn(
              "w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105",
              statusFilter === 'COMPLETED'
                ? "bg-emerald-600 border-emerald-600 text-white shadow-xs"
                : "bg-emerald-50 border-emerald-200/70 text-emerald-600 group-hover:bg-emerald-100/80"
            )}>
              <BadgeCheck size={21} />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">Completed</span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-black text-slate-900 tracking-tight font-display">{completedCount}</span>
                <span className="text-[11px] text-emerald-600 font-medium">done</span>
              </div>
            </div>
            {statusFilter === 'COMPLETED' && (
              <span className="absolute top-3 right-3 text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 shadow-xs">
                Active
              </span>
            )}
          </button>
        </div>

        {/* ── Filters & Search Toolbar ── */}
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 sm:p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3.5">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks by title, description, or event..."
              className="w-full pl-9 pr-9 py-2 bg-slate-50/70 border border-slate-200 hover:border-slate-300 focus:border-[#FF9900] focus:bg-white focus:outline-none rounded-lg text-xs text-slate-800 placeholder-slate-400 transition"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            {/* Event Filter */}
            {eventOptions.length > 0 && (
              <div className="relative shrink-0">
                <select
                  value={selectedEvent}
                  onChange={(e) => setSelectedEvent(e.target.value)}
                  className="appearance-none pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-[#FF9900] focus:bg-white focus:outline-none rounded-lg text-xs text-slate-700 cursor-pointer font-medium"
                >
                  <option value="ALL">All Events ({tasks.length})</option>
                  {eventOptions.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.title}
                    </option>
                  ))}
                </select>
                <Filter size={11} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            )}

            {/* Status Filter */}
            <div className="relative shrink-0">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="appearance-none pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-[#FF9900] focus:bg-white focus:outline-none rounded-lg text-xs text-slate-700 cursor-pointer font-medium"
              >
                <option value="ALL">All Statuses ({totalCount})</option>
                <option value="PENDING">Pending ({pendingCount})</option>
                <option value="IN_PROGRESS">In Progress ({inProgressCount})</option>
                <option value="COMPLETED">Completed ({completedCount})</option>
              </select>
              <Filter size={11} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            {/* Clear filters if any active */}
            {(search || selectedEvent !== 'ALL' || statusFilter !== 'ALL') && (
              <button
                onClick={() => {
                  setSearch('');
                  setSelectedEvent('ALL');
                  setStatusFilter('ALL');
                }}
                className="text-[12px] font-semibold text-[#FF9900] hover:text-orange-700 transition-colors cursor-pointer border-none bg-transparent shrink-0 whitespace-nowrap"
              >
                Clear Filters
              </button>
            )}

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200/80">
              <button
                onClick={() => setViewMode('kanban')}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer',
                  viewMode === 'kanban'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                )}
                title="Kanban Board View"
              >
                <LayoutGrid size={13} />
                <span>Board</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer',
                  viewMode === 'list'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                )}
                title="List / Table View"
              >
                <List size={13} />
                <span>List</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── Content View (Kanban or List) ── */}
        {isLoading ? (
          <TasksSkeleton viewMode={viewMode} />
        ) : filteredTasks.length === 0 ? (
          <div className="border border-dashed border-slate-200 rounded-2xl p-14 text-center bg-white/70 shadow-xs">
            <div className="mx-auto w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center mb-3 text-slate-400">
              <Inbox size={22} />
            </div>
            <h3 className="text-sm font-bold text-slate-800 mb-1">No tasks found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
              {search || selectedEvent !== 'ALL' || statusFilter !== 'ALL'
                ? 'No tasks match your current filter parameters. Try resetting your search or filter.'
                : 'There are currently no operational crew tasks assigned.'}
            </p>
            {(search || selectedEvent !== 'ALL' || statusFilter !== 'ALL') && (
              <button
                onClick={() => {
                  setSearch('');
                  setSelectedEvent('ALL');
                  setStatusFilter('ALL');
                }}
                className="px-3.5 py-1.5 text-xs font-semibold text-[#FF9900] bg-orange-50 hover:bg-orange-100 rounded-lg transition"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : viewMode === 'kanban' ? (
          /* ── Kanban Board View ── */
          <div className="grid gap-6 md:grid-cols-3 items-start">
            {/* Column 1: PENDING */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b-2 border-amber-400/80">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Pending</h2>
                </div>
                <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-full">
                  {pendingTasks.length}
                </span>
              </div>

              <div className="space-y-3 min-h-[300px]">
                {pendingTasks.length === 0 ? (
                  <div className="border border-dashed border-slate-200 rounded-xl p-8 text-center bg-white/50">
                    <Clock size={20} className="mx-auto text-slate-300 mb-2" />
                    <p className="text-xs font-medium text-slate-400">No pending tasks</p>
                  </div>
                ) : (
                  pendingTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onStatusChange={handleStatusChange}
                      isUpdating={updateTaskMutation.isPending}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Column 2: IN_PROGRESS */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b-2 border-blue-500">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500" />
                  </span>
                  <h2 className="text-xs font-bold text-blue-900 uppercase tracking-wider">In Progress</h2>
                </div>
                <span className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200/60 px-2 py-0.5 rounded-full">
                  {inProgressTasks.length}
                </span>
              </div>

              <div className="space-y-3 min-h-[300px]">
                {inProgressTasks.length === 0 ? (
                  <div className="border border-dashed border-slate-200 rounded-xl p-8 text-center bg-white/50">
                    <Play size={20} className="mx-auto text-slate-300 mb-2" />
                    <p className="text-xs font-medium text-slate-400">No tasks currently in progress</p>
                  </div>
                ) : (
                  inProgressTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onStatusChange={handleStatusChange}
                      isUpdating={updateTaskMutation.isPending}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Column 3: COMPLETED */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b-2 border-emerald-500">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <h2 className="text-xs font-bold text-emerald-900 uppercase tracking-wider">Completed</h2>
                </div>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full">
                  {completedTasks.length}
                </span>
              </div>

              <div className="space-y-3 min-h-[300px]">
                {completedTasks.length === 0 ? (
                  <div className="border border-dashed border-slate-200 rounded-xl p-8 text-center bg-white/50">
                    <CheckCircle2 size={20} className="mx-auto text-slate-300 mb-2" />
                    <p className="text-xs font-medium text-slate-400">No completed tasks yet</p>
                  </div>
                ) : (
                  completedTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onStatusChange={handleStatusChange}
                      isUpdating={updateTaskMutation.isPending}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        ) : (
          /* ── Table / List View ── */
          <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70">
                    <th className="px-5 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Task Details
                    </th>
                    <th className="px-5 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Associated Event
                    </th>
                    <th className="px-5 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-5 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Last Updated
                    </th>
                    <th className="px-5 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTasks.map((task) => {
                    const statusInfo = statusBadge(task.status);
                    return (
                      <tr key={task.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-5 py-4 min-w-[280px]">
                          <p
                            className={cn(
                              'text-xs font-bold text-slate-900 leading-snug',
                              task.status === 'COMPLETED' && 'line-through text-slate-400'
                            )}
                          >
                            {task.title}
                          </p>
                          {task.description && (
                            <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                              {task.description}
                            </p>
                          )}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          {task.event?.title ? (
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 bg-slate-100/80 px-2.5 py-1 rounded-md border border-slate-200/50">
                              <CalendarDays size={12} className="text-[#FF9900]" />
                              {task.event.title}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span
                            className={cn(
                              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-bold border',
                              statusInfo.badge
                            )}
                          >
                            <span className={cn('w-1.5 h-1.5 rounded-full', statusInfo.dot)} />
                            {statusInfo.label}
                          </span>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-xs text-slate-500">
                          {formatDate(task.updatedAt || task.createdAt)}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {task.status === 'PENDING' && (
                              <button
                                onClick={() => handleStatusChange(task.id, 'IN_PROGRESS')}
                                className="inline-flex items-center gap-1 bg-[#232F3E] hover:bg-slate-800 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg shadow-xs transition cursor-pointer"
                              >
                                <Play size={11} className="fill-white" /> Start
                              </button>
                            )}

                            {task.status === 'IN_PROGRESS' && (
                              <>
                                <button
                                  onClick={() => handleStatusChange(task.id, 'PENDING')}
                                  className="inline-flex items-center gap-1 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition cursor-pointer"
                                  title="Move back to Pending"
                                >
                                  <RotateCcw size={11} /> Pause
                                </button>
                                <button
                                  onClick={() => handleStatusChange(task.id, 'COMPLETED')}
                                  className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg shadow-xs transition cursor-pointer"
                                >
                                  <Check size={12} /> Done
                                </button>
                              </>
                            )}

                            {task.status === 'COMPLETED' && (
                              <button
                                onClick={() => handleStatusChange(task.id, 'IN_PROGRESS')}
                                className="inline-flex items-center gap-1 border border-slate-200 hover:bg-slate-100 text-slate-500 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition cursor-pointer"
                              >
                                <RotateCcw size={11} /> Re-open
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Task Card Component for Kanban ── */
interface TaskCardProps {
  task: CrewTask;
  onStatusChange: (id: string, newStatus: string) => void;
  isUpdating: boolean;
}

function TaskCard({ task, onStatusChange, isUpdating }: TaskCardProps) {
  const isPending = task.status === 'PENDING';
  const isInProgress = task.status === 'IN_PROGRESS';
  const isCompleted = task.status === 'COMPLETED';

  return (
    <div
      className={cn(
        'rounded-xl border bg-white p-4 sm:p-4.5 shadow-xs transition-all duration-200 flex flex-col justify-between group hover:shadow-md',
        isInProgress
          ? 'border-blue-300 ring-1 ring-blue-500/10'
          : isCompleted
          ? 'border-slate-200/80 bg-slate-50/50 opacity-90'
          : 'border-slate-200/90 hover:border-slate-300'
      )}
    >
      <div className="space-y-2">
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          {task.event?.title ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md truncate max-w-[200px]">
              <CalendarDays size={10} className="text-[#FF9900] shrink-0" />
              <span className="truncate">{task.event.title}</span>
            </span>
          ) : (
            <span className="text-[10px] text-slate-400">General Task</span>
          )}

          <span
            className={cn(
              'text-[9.5px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border',
              isPending && 'bg-amber-50 text-amber-700 border-amber-200',
              isInProgress && 'bg-blue-50 text-blue-700 border-blue-200',
              isCompleted && 'bg-emerald-50 text-emerald-700 border-emerald-200'
            )}
          >
            {isPending ? 'Pending' : isInProgress ? 'Active' : 'Completed'}
          </span>
        </div>

        {/* Title */}
        <h3
          className={cn(
            'text-xs sm:text-[13px] font-bold text-slate-800 leading-snug group-hover:text-[#FF9900] transition-colors',
            isCompleted && 'line-through text-slate-400 group-hover:text-slate-500'
          )}
        >
          {task.title}
        </h3>

        {/* Description */}
        {task.description && (
          <p
            className={cn(
              'text-[11.5px] text-slate-500 leading-relaxed line-clamp-3',
              isCompleted && 'text-slate-400'
            )}
          >
            {task.description}
          </p>
        )}
      </div>

      {/* Card Footer */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <span className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
          <Clock size={10} />
          {formatDate(task.updatedAt || task.createdAt)}
        </span>

        <div className="flex items-center gap-1.5">
          {isPending && (
            <button
              onClick={() => onStatusChange(task.id, 'IN_PROGRESS')}
              disabled={isUpdating}
              className="inline-flex items-center gap-1 bg-[#232F3E] hover:bg-slate-800 text-white text-[11px] font-semibold px-2.5 py-1.5 rounded-lg shadow-xs hover:-translate-y-0.5 transition cursor-pointer"
            >
              <Play size={10} className="fill-white" />
              <span>Start</span>
            </button>
          )}

          {isInProgress && (
            <>
              <button
                onClick={() => onStatusChange(task.id, 'PENDING')}
                disabled={isUpdating}
                className="inline-flex items-center gap-1 border border-slate-200 hover:bg-slate-50 text-slate-600 text-[11px] font-semibold px-2 py-1.5 rounded-lg transition cursor-pointer"
                title="Move back to Pending"
              >
                <RotateCcw size={10} />
                <span>Stop</span>
              </button>
              <button
                onClick={() => onStatusChange(task.id, 'COMPLETED')}
                disabled={isUpdating}
                className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold px-2.5 py-1.5 rounded-lg shadow-xs hover:-translate-y-0.5 transition cursor-pointer"
              >
                <Check size={11} />
                <span>Complete</span>
              </button>
            </>
          )}

          {isCompleted && (
            <button
              onClick={() => onStatusChange(task.id, 'IN_PROGRESS')}
              disabled={isUpdating}
              className="inline-flex items-center gap-1 border border-slate-200 hover:bg-slate-100 text-slate-500 text-[11px] font-semibold px-2 py-1.5 rounded-lg transition cursor-pointer"
            >
              <RotateCcw size={10} />
              <span>Re-open</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
