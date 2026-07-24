'use client';

import { useEffect, useState } from 'react';
import { useCrewAnnouncements } from '@/lib/hooks';
import {
  Mail,
  Info,
  Clock,
  AlertTriangle,
  Users,
  User,
  Calendar,
  Bell,
  BellOff,
} from 'lucide-react';

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const TYPE_BADGE: Record<string, string> = {
  UPDATE: 'bg-blue-50 text-blue-700 border-blue-200',
  REMINDER: 'bg-amber-50 text-amber-700 border-amber-200',
  SCHEDULE_CHANGE: 'bg-rose-50 text-rose-700 border-rose-200',
};

function typeBadge(type: string) {
  return TYPE_BADGE[type] || 'bg-slate-50 text-slate-600 border-slate-200';
}

function typeIcon(type: string) {
  switch (type) {
    case 'UPDATE': return <Info size={12} className="text-blue-600" />;
    case 'REMINDER': return <Clock size={12} className="text-amber-600" />;
    case 'SCHEDULE_CHANGE': return <AlertTriangle size={12} className="text-rose-600" />;
    default: return <Mail size={12} className="text-slate-500" />;
  }
}

function typeLabel(type: string) {
  const map: Record<string, string> = {
    UPDATE: 'Update',
    REMINDER: 'Reminder',
    SCHEDULE_CHANGE: 'Schedule Change',
  };
  return map[type] || type.replace(/_/g, ' ');
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function CrewAnnouncementsPage() {
  const [userId, setUserId] = useState('');
  const [userName, setUserName] = useState('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem('aws_sgb_rec_user');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.id) setUserId(parsed.id);
        const name = parsed.fullName || `${parsed.firstName || ''} ${parsed.lastName || ''}`.trim() || parsed.email || 'Crew Member';
        setUserName(name);
      }
    } catch { /* ignore */ }
  }, []);

  const { data: announcements = [], isLoading } = useCrewAnnouncements();

  const now = new Date();
  const isNew = (dateStr: string) => {
    const diff = (now.getTime() - new Date(dateStr).getTime()) / (1000 * 60 * 60);
    return diff < 24; // within last 24 hours
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] py-6 px-4 sm:py-8 sm:px-8 overflow-y-auto">
      <div className="w-full max-w-[1400px] mx-auto space-y-6">

        {/* ── Header ── */}
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400 mb-1">
            <span>Crew</span>
            <span>/</span>
            <span className="text-[#FF9900] font-semibold">Announcements</span>
          </div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Your Announcements</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Messages from Admin addressed to you or all crew members.
              </p>
            </div>
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2.5 shadow-sm">
              <div className="w-7 h-7 rounded-full bg-[#232F3E] flex items-center justify-center">
                <User size={13} className="text-white" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 leading-none">{userName || 'Crew Member'}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Crew · Your inbox</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Summary pills ── */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-full text-xs font-semibold text-slate-600 shadow-sm">
            <Bell size={11} className="text-[#FF9900]" />
            {announcements.length} Total
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 border border-violet-200 rounded-full text-xs font-semibold text-violet-700 shadow-sm">
            <Users size={11} />
            {announcements.filter((a) => a.targetType === 'CREW_ALL').length} Broadcast
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 border border-indigo-200 rounded-full text-xs font-semibold text-indigo-700 shadow-sm">
            <User size={11} />
            {announcements.filter((a) => a.targetType === 'CREW_SPECIFIC').length} Personal
          </div>
        </div>

        {/* ── Announcement List ── */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
          {!userId || isLoading ? (
            <div className="divide-y divide-slate-100">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="px-5 py-4 animate-pulse flex gap-3">
                  <div className="w-9 h-9 bg-slate-100 rounded-lg shrink-0" />
                  <div className="flex-1 space-y-2 pt-1">
                    <div className="h-3.5 w-1/3 bg-slate-100 rounded" />
                    <div className="h-3 w-2/3 bg-slate-100 rounded" />
                    <div className="h-3 w-1/2 bg-slate-100 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : announcements.length === 0 ? (
            <div className="py-16 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-slate-100 rounded-xl text-slate-400 mb-3">
                <BellOff size={22} />
              </div>
              <h3 className="text-sm font-semibold text-slate-700 mb-1">No announcements yet</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                You're all caught up! Announcements from the Admin team will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {announcements.map((ann) => (
                <div key={ann.id} className={`px-5 py-4 hover:bg-slate-50/60 transition ${isNew(ann.createdAt) ? 'border-l-[3px] border-l-[#FF9900]' : ''}`}>
                  <div className="flex items-start gap-3">
                    {/* Category icon */}
                    <div className={`shrink-0 w-9 h-9 rounded-xl border flex items-center justify-center mt-0.5 ${typeBadge(ann.type)}`}>
                      {typeIcon(ann.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="text-sm font-bold text-slate-800 leading-tight">{ann.title}</h3>
                        {isNew(ann.createdAt) && (
                          <span className="text-[9.5px] font-bold px-1.5 py-0.5 rounded-full bg-[#FF9900] text-white">NEW</span>
                        )}
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed mb-2.5">{ann.message}</p>

                      <div className="flex items-center gap-3 flex-wrap">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded border ${typeBadge(ann.type)}`}>
                          {typeLabel(ann.type)}
                        </span>
                        {ann.targetType === 'CREW_ALL' && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded border bg-violet-50 text-violet-600 border-violet-200">
                            <Users size={9} /> Broadcast to all crew
                          </span>
                        )}
                        {ann.targetType === 'CREW_SPECIFIC' && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded border bg-indigo-50 text-indigo-600 border-indigo-200">
                            <User size={9} /> Personal message
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-[10.5px] text-slate-400">
                          <Calendar size={9} />
                          {formatDate(ann.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
