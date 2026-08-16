'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Users,
  CheckCircle,
  BarChart3,
  TrendingUp,
  Activity,
  X,
  ClipboardList,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import {
  useDashboardStats,
  usePopularEvents,
  useRegistrationsOverTime,
  useAttendanceOverTime,
  useEventsByStatus,
  useRegistrationsByEventStats,
} from '@/lib/hooks';

/* ─── Helpers ──────────────────────────────────────────────────── */
function formatDateLabel(dateStr: string) {
  if (!dateStr || dateStr === '—') return '—';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const date = new Date(
        parseInt(parts[0], 10),
        parseInt(parts[1], 10) - 1,
        parseInt(parts[2], 10)
      );
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return dateStr;
  }
}

/* ─── Skeleton ─────────────────────────────────────────────────── */
function Skeleton({ className = 'h-4 w-full' }: { className?: string }) {
  return (
    <div
      className={`bg-slate-200/60 rounded-[6px] animate-pulse ${className}`}
    />
  );
}

/* ─── Detailed Bar Chart (for modal) ──────────────────────────── */
function DetailBarChart({
  data,
  color,
}: {
  data: { date: string; count: number }[];
  color: string;
}) {
  const slice = data.slice(-30);
  const maxCount = Math.max(...slice.map((d) => d.count), 1);
  const total = slice.reduce((s, d) => s + d.count, 0);
  const peak = slice.reduce((a, b) => (b.count > a.count ? b : a), slice[0] ?? { date: '', count: 0 });
  const avg = slice.length > 0 ? Math.round(total / slice.length) : 0;

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Summary stats */}
      <div className="grid grid-cols-3 max-[400px]:grid-cols-1 gap-2.5">
        {[
          { label: 'Total (30d)', val: total },
          { label: 'Daily Avg', val: avg },
          { label: 'Peak Day', val: peak?.count ?? 0, sub: peak ? formatDateLabel(peak.date) : '' },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-slate-50 border border-slate-200/70 rounded-xl p-3 sm:p-3.5 flex flex-col justify-center"
          >
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-[20px] sm:text-[22px] font-black text-slate-800 leading-tight">
                {s.val}
              </span>
              {s.sub && (
                <span className="text-[10.5px] font-bold" style={{ color }}>
                  ({s.sub})
                </span>
              )}
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      <div className="flex items-end gap-1 sm:gap-1.5 h-36 sm:h-44 mt-2 px-1">
        {slice.map((item, i) => {
          const hPct = item.count > 0 ? (item.count / maxCount) * 100 : 0;
          return (
            <div
              key={i}
              title={`${item.count} on ${formatDateLabel(item.date)}`}
              className="flex-1 flex flex-col items-center justify-end h-full relative group cursor-pointer"
            >
              {/* Tooltip */}
              <div
                className="absolute bottom-full left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded-[5px] whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-20 mb-1.5 shadow-lg"
              >
                {item.count}
                <span className="block font-normal text-slate-300 text-[9px]">{formatDateLabel(item.date)}</span>
              </div>
              <div
                style={{
                  height: hPct > 0 ? `${hPct}%` : '4px',
                  background:
                    item.count > 0
                      ? `linear-gradient(to top, ${color}, ${color}77)`
                      : 'rgba(148,163,184,0.18)',
                }}
                className="w-full min-h-[4px] rounded-t-[3px] transition-all duration-300 group-hover:brightness-110"
              />
            </div>
          );
        })}
      </div>

      {/* X-axis labels */}
      {slice.length > 0 && (
        <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 px-1 pt-1 border-t border-slate-100">
          <span>{formatDateLabel(slice[0].date)}</span>
          <span>{formatDateLabel(slice[slice.length - 1].date)}</span>
        </div>
      )}
    </div>
  );
}

/* ─── Trend Modal ──────────────────────────────────────────────── */
function TrendModal({
  open,
  onClose,
  title,
  icon: Icon,
  color,
  iconBg,
  data,
  loading,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  icon: React.ComponentType<any>;
  color: string;
  iconBg: string;
  data: { date: string; count: number }[];
  loading: boolean;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/40 backdrop-blur-[3px] transition-opacity"
      />
      {/* Modal */}
      <div
        className="relative z-10 w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div
              style={{ background: iconBg, borderColor: `${color}33` }}
              className="border rounded-lg p-1.5 flex items-center justify-center shrink-0"
            >
              <Icon style={{ color }} className="w-4 h-4" />
            </div>
            <span className="text-[13px] sm:text-[14px] font-extrabold text-slate-900 uppercase tracking-wider">
              {title}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal body */}
        <div className="p-4 sm:p-6 overflow-y-auto">
          {loading ? (
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-3 gap-2 mb-2">
                {[0, 1, 2].map((i) => (
                  <Skeleton key={i} className="h-14 w-full rounded-xl" />
                ))}
              </div>
              <Skeleton className="h-40 w-full rounded-xl" />
            </div>
          ) : data.length > 0 ? (
            <DetailBarChart data={data} color={color} />
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs font-semibold">
              No trend data available yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Horizontal Bar ───────────────────────────────────────────── */
function HBar({ label, value, maxVal }: { label: string; value: number; maxVal: number }) {
  const pct = maxVal > 0 ? (value / maxVal) * 100 : 0;
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <div className="flex justify-between items-baseline gap-2">
        <span className="text-[12px] font-semibold text-slate-800 truncate" title={label}>
          {label}
        </span>
        <span className="text-[12px] font-extrabold text-[#FF9900] shrink-0 tabular-nums">
          {value}
        </span>
      </div>
      <div className="bg-slate-100 rounded-full h-2 w-full overflow-hidden">
        <div
          style={{
            background: 'linear-gradient(90deg, #232F3E, #FF9900)',
            width: `${pct}%`,
          }}
          className="h-full rounded-full transition-all duration-500 ease-out"
        />
      </div>
    </div>
  );
}

/* ─── Section Card ─────────────────────────────────────────────── */
function Card({
  children,
  title,
  icon: Icon,
  iconColor = '#FF9900',
  iconBg = 'rgba(255,153,0,0.08)',
  noPad = false,
}: {
  children: React.ReactNode;
  title: string;
  icon: React.ComponentType<any>;
  iconColor?: string;
  iconBg?: string;
  noPad?: boolean;
}) {
  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl shadow-[0_2px_12px_rgba(35,47,62,0.03)] overflow-hidden flex flex-col h-full">
      <div className="flex items-center gap-2.5 px-4 sm:px-5 py-3.5 border-b border-slate-100 bg-slate-50/50">
        <div
          style={{ background: iconBg, borderColor: `${iconColor}33` }}
          className="border rounded-lg p-1.5 flex items-center justify-center shrink-0 shadow-2xs"
        >
          <Icon style={{ color: iconColor }} className="w-3.5 h-3.5" />
        </div>
        <span className="text-[11.5px] sm:text-[12px] font-extrabold text-slate-800 uppercase tracking-wider">
          {title}
        </span>
      </div>
      <div className={noPad ? 'flex-1 overflow-hidden' : 'p-4 sm:p-5 flex-1'}>
        {children}
      </div>
    </div>
  );
}

/* ─── Main Page ────────────────────────────────────────────────── */
export default function AnalyticsPage() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: popularEvents, isLoading: popularLoading } = usePopularEvents();
  const { data: regOverTime, isLoading: regTimeLoading } = useRegistrationsOverTime();
  const { data: attOverTime, isLoading: attTimeLoading } = useAttendanceOverTime();
  const { data: eventsByStatus, isLoading: statusLoading } = useEventsByStatus();
  const { data: regsByEvent, isLoading: regByEventLoading } = useRegistrationsByEventStats();

  const [modal, setModal] = useState<'registrations' | 'attendance' | null>(null);

  /* ── KPI cards ── */
  const kpis = useMemo(() => {
    if (!stats) return null;
    const totalCapacity = stats.recentEvents?.reduce((s, e) => s + (e.capacity ?? 0), 0) ?? 0;
    const capPct = totalCapacity > 0 ? Math.round((stats.totalRegistrations / totalCapacity) * 100) : 0;
    return [
      {
        id: 'events',
        label: 'Total Events',
        value: stats.totalEvents,
        icon: Calendar,
        iconColor: '#0073BB',
        iconBg: 'rgba(0,115,187,0.08)',
        clickable: false,
      },
      {
        id: 'registrations',
        label: 'Total Registrations',
        value: stats.totalRegistrations,
        icon: Users,
        iconColor: '#10b981',
        iconBg: 'rgba(16,185,129,0.08)',
        clickable: true,
      },
      {
        id: 'attendance',
        label: 'Total Attendance',
        value: stats.totalTickets,
        icon: CheckCircle,
        iconColor: '#FF9900',
        iconBg: 'rgba(255,153,0,0.08)',
        pct:
          stats.totalRegistrations > 0
            ? Math.round((stats.totalTickets / stats.totalRegistrations) * 100)
            : 0,
        pctLabel: 'of registrations',
        accent: '#FF9900',
        clickable: true,
      },
      {
        id: 'capacity',
        label: 'Capacity Utilization',
        value: `${capPct}%`,
        icon: BarChart3,
        iconColor: '#8b5cf6',
        iconBg: 'rgba(139,92,246,0.08)',
        pct: capPct,
        pctLabel: 'utilization',
        accent: '#8b5cf6',
        clickable: false,
      },
    ];
  }, [stats]);

  /* ── Status breakdown ── */
  const statusMap: Record<string, { label: string; color: string; bg: string }> = {
    DRAFT: { label: 'Draft', color: '#64748b', bg: 'rgba(100,116,139,0.08)' },
    PUBLISHED: { label: 'Published', color: '#0073BB', bg: 'rgba(0,115,187,0.08)' },
    REGISTRATION_OPEN: { label: 'Open', color: '#10b981', bg: 'rgba(16,185,129,0.08)' },
    COMPLETED: { label: 'Completed', color: '#FF9900', bg: 'rgba(255,153,0,0.08)' },
  };

  const statusCards = useMemo(() => {
    const counts: Record<string, number> = { DRAFT: 0, PUBLISHED: 0, REGISTRATION_OPEN: 0, COMPLETED: 0 };
    if (eventsByStatus) {
      eventsByStatus.forEach((item) => {
        const k = item.status.toUpperCase();
        if (k in counts) counts[k] = item.count;
        else if (k === 'ARCHIVED' || k === 'ONGOING') counts['COMPLETED'] += item.count;
      });
    }
    return Object.entries(statusMap).map(([status, cfg]) => ({
      status,
      count: counts[status] ?? 0,
      ...cfg,
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventsByStatus]);

  /* ── Registrations by event ── */
  const regByEventData = useMemo(() => {
    if (!regsByEvent) return [];
    return regsByEvent.map((e) => ({ label: e.title, value: e.count }));
  }, [regsByEvent]);

  const maxRegByEvent = Math.max(...regByEventData.map((d) => d.value), 1);

  return (
    <>
      <div
        className="min-h-screen w-full text-slate-900 relative p-3.5 sm:p-6 lg:p-8 overflow-y-auto premium-scrollbar scroll-smooth"
        style={{
          backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.72), rgba(255, 255, 255, 0.72)), url('/images/aws_tech_doodle_bg.png')",
          backgroundRepeat: 'repeat',
          backgroundSize: '480px auto',
          backgroundColor: '#f8fafc',
        }}
      >
        <div className="max-w-7xl mx-auto flex flex-col gap-4 sm:gap-6">

          {/* ── Page Header ── */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3.5 bg-white/85 backdrop-blur-md border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-[#FF9900]/30 text-[#FF9900] flex items-center justify-center shrink-0 shadow-2xs">
                <BarChart3 className="w-5 h-5 text-[#FF9900]" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-[19px] sm:text-[22px] font-black text-slate-900 tracking-tight leading-tight">
                  Analytics & Insights
                </h1>
                <p className="text-[11.5px] sm:text-[12.5px] text-slate-500 font-normal">
                  Real-time metrics, capacity ratios, and attendance distributions
                </p>
              </div>
            </div>

            {/* Report Generator Button */}
            <Link
              href="/core/analytics/report"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#232F3E] hover:bg-[#FF9900] text-white hover:text-[#232F3E] font-bold text-[12px] px-4.5 py-2.5 rounded-xl border border-slate-800 hover:border-[#FF9900] shadow-sm transition-all duration-200 active:scale-95 text-center shrink-0"
            >
              <ClipboardList className="w-4 h-4 shrink-0" />
              <span>Generate Event Report</span>
            </Link>
          </div>

          {/* ── KPI Row ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {statsLoading || !kpis
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-white border border-slate-200/90 rounded-2xl p-4 flex flex-col gap-2.5 shadow-2xs animate-pulse"
                  >
                    <div className="w-8 h-8 rounded-lg bg-slate-100" />
                    <div className="w-1/2 h-6 bg-slate-100 rounded" />
                    <div className="w-3/4 h-3 bg-slate-100 rounded" />
                  </div>
                ))
              : kpis.map((kpi) => (
                  <div
                    key={kpi.label}
                    onClick={kpi.clickable ? () => setModal(kpi.id as 'registrations' | 'attendance') : undefined}
                    className={`bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-4.5 shadow-[0_2px_10px_rgba(35,47,62,0.03)] relative overflow-hidden flex flex-col justify-between transition-all duration-200 group ${
                      kpi.clickable
                        ? 'cursor-pointer hover:border-[#FF9900]/60 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0'
                        : 'hover:border-slate-300'
                    }`}
                  >
                    {/* Clickable hint badge */}
                    {kpi.clickable && (
                      <span
                        style={{ color: kpi.iconColor, background: kpi.iconBg, borderColor: `${kpi.iconColor}33` }}
                        className="absolute top-3.5 right-3.5 text-[8.5px] font-extrabold border rounded-full px-2 py-0.5 tracking-wider uppercase flex items-center gap-1 shadow-2xs group-hover:scale-105 transition-transform"
                      >
                        Trend
                        <ArrowRight className="w-2.5 h-2.5" />
                      </span>
                    )}

                    {/* Top row: icon + value */}
                    <div className="flex items-start gap-3">
                      <div
                        style={{ background: kpi.iconBg, borderColor: `${kpi.iconColor}25` }}
                        className="border rounded-xl p-2.5 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs"
                      >
                        <kpi.icon style={{ color: kpi.iconColor }} className="w-4.5 h-4.5" />
                      </div>
                      <div className="flex-1 min-w-0 pr-12">
                        <p className="text-[24px] sm:text-[26px] font-black text-slate-900 leading-tight tabular-nums">
                          {kpi.value}
                        </p>
                        <p className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider mt-0.5 truncate">
                          {kpi.label}
                        </p>
                      </div>
                    </div>

                    {/* Progress bar — always rendered to keep uniform height */}
                    <div className="mt-3 pt-2.5 border-t border-slate-100/80">
                      {'pct' in kpi && kpi.pct !== undefined ? (
                        <div className="flex justify-between items-center text-[10px] mb-1.5 font-bold">
                          <span className="text-slate-400">{kpi.pctLabel}</span>
                          <span style={{ color: kpi.iconColor }}>{kpi.pct}%</span>
                        </div>
                      ) : (
                        <div className="h-4" />
                      )}
                      <div className="bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          style={{
                            background: `linear-gradient(90deg, ${kpi.iconColor}99, ${kpi.iconColor})`,
                            width: `${'pct' in kpi && kpi.pct !== undefined ? Math.min(kpi.pct, 100) : 0}%`,
                          }}
                          className="h-full rounded-full transition-all duration-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
          </div>

          {/* ── Events by Status ── */}
          <Card title="Events by Lifecycle Status" icon={Calendar} iconColor="#0073BB" iconBg="rgba(0,115,187,0.08)">
            {statusLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5">
                {statusCards.map((s) => (
                  <div
                    key={s.status}
                    style={{ background: s.bg, borderColor: `${s.color}25` }}
                    className="border rounded-xl p-3.5 sm:p-4 text-center flex flex-col items-center justify-center transition-all hover:scale-[1.02]"
                  >
                    <p style={{ color: s.color }} className="text-[26px] sm:text-[30px] font-black leading-tight tabular-nums">
                      {s.count}
                    </p>
                    <p style={{ color: s.color }} className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider opacity-85 mt-1">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* ── Popular Events + Registrations by Event ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
            
            {/* Popular Events Table */}
            <div className="lg:col-span-7">
              <Card title="Popular Events Engagement" icon={Users} iconColor="#8b5cf6" iconBg="rgba(139,92,246,0.08)" noPad>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-[12.5px]">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/70 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                        <th className="py-3 px-4 sm:px-5">Event Title</th>
                        <th className="py-3 px-3 sm:px-4 text-center">Registrations</th>
                        <th className="py-3 px-4 sm:px-5 text-right">Engagement</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {popularLoading
                        ? Array.from({ length: 4 }).map((_, i) => (
                            <tr key={i}>
                              <td className="py-3.5 px-4 sm:px-5"><Skeleton className="h-4 w-3/4" /></td>
                              <td className="py-3.5 px-3 sm:px-4"><Skeleton className="h-4 w-10 mx-auto" /></td>
                              <td className="py-3.5 px-4 sm:px-5"><Skeleton className="h-4 w-20 ml-auto" /></td>
                            </tr>
                          ))
                        : popularEvents && popularEvents.length > 0
                        ? popularEvents.map((event) => {
                            const maxReg = Math.max(...popularEvents.map((e) => e.registrationCount), 1);
                            const pct = (event.registrationCount / maxReg) * 100;
                            return (
                              <tr
                                key={event.eventId}
                                className="hover:bg-slate-50/80 transition-colors"
                              >
                                <td className="py-3 px-4 sm:px-5 font-bold text-slate-800 max-w-[180px] sm:max-w-[240px] truncate" title={event.title}>
                                  {event.title}
                                </td>
                                <td className="py-3 px-3 sm:px-4 font-black text-slate-900 text-center tabular-nums">
                                  {event.registrationCount}
                                </td>
                                <td className="py-3 px-4 sm:px-5 text-right">
                                  <div className="inline-flex items-center justify-end gap-2 w-full max-w-[130px]">
                                    <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                      <div
                                        style={{
                                          background: 'linear-gradient(90deg, #FF9900, #F7BA45)',
                                          width: `${pct}%`,
                                        }}
                                        className="h-full rounded-full"
                                      />
                                    </div>
                                    <span className="text-[11px] font-bold text-slate-500 tabular-nums w-8 text-right shrink-0">
                                      {Math.round(pct)}%
                                    </span>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        : (
                          <tr>
                            <td colSpan={3} className="py-8 text-center text-xs font-semibold text-slate-400">
                              No event metrics recorded yet.
                            </td>
                          </tr>
                        )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>

            {/* Registrations by Event */}
            <div className="lg:col-span-5">
              <Card title="Volume Distribution" icon={BarChart3} iconColor="#FF9900" iconBg="rgba(255,153,0,0.08)">
                {regByEventLoading ? (
                  <div className="flex flex-col gap-3.5">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="flex flex-col gap-1.5">
                        <Skeleton className="h-3 w-1/2" />
                        <Skeleton className="h-2 w-full" />
                      </div>
                    ))}
                  </div>
                ) : regByEventData.length > 0 ? (
                  <div className="flex flex-col gap-3.5">
                    {regByEventData.map((item) => (
                      <HBar key={item.label} label={item.label} value={item.value} maxVal={maxRegByEvent} />
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-xs font-semibold text-slate-400">
                    No volume breakdown available.
                  </div>
                )}
              </Card>
            </div>
          </div>

        </div>
      </div>

      {/* ── Registrations Trend Modal ── */}
      <TrendModal
        open={modal === 'registrations'}
        onClose={() => setModal(null)}
        title="Registration Timeline Trend"
        icon={TrendingUp}
        color="#10b981"
        iconBg="rgba(16,185,129,0.08)"
        data={regOverTime ?? []}
        loading={regTimeLoading}
      />

      {/* ── Attendance Trend Modal ── */}
      <TrendModal
        open={modal === 'attendance'}
        onClose={() => setModal(null)}
        title="Attendance Conversion Trend"
        icon={Activity}
        color="#FF9900"
        iconBg="rgba(255,153,0,0.08)"
        data={attOverTime ?? []}
        loading={attTimeLoading}
      />
    </>
  );
}
