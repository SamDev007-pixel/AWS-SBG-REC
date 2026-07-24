'use client';

import { useState, useMemo } from 'react';
import {
  useEvents,
  useAnnouncements,
  useAllCrewAnnouncements,
  useCreateAnnouncement,
  useDeleteAnnouncement,
  useCrewMembers,
} from '@/lib/hooks';
import {
  ChevronDown,
  Trash2,
  Mail,
  Calendar,
  Info,
  Clock,
  AlertTriangle,
  Filter,
  PlusCircle,
  Users,
  User,
  CalendarDays,
  CheckCircle2,
} from 'lucide-react';

// ── Helpers ──────────────────────────────────────────────────────────────────

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

type TargetType = 'EVENT' | 'CREW_ALL' | 'CREW_SPECIFIC';
type FeedTab = 'event' | 'crew';

const TARGET_OPTIONS: { value: TargetType; label: string; icon: React.ReactNode; desc: string }[] = [
  { value: 'EVENT', label: 'Event Registrants', icon: <CalendarDays size={14} />, desc: 'Send to everyone registered for an event' },
  { value: 'CREW_ALL', label: 'All Crew Members', icon: <Users size={14} />, desc: 'Broadcast to all users with the crew role' },
  { value: 'CREW_SPECIFIC', label: 'Specific Crew Member', icon: <User size={14} />, desc: 'Send to one individual crew member' },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function AnnouncementsPage() {
  // Form state
  const [formOpen, setFormOpen] = useState(true);
  const [targetType, setTargetType] = useState<TargetType>('EVENT');
  const [formEventId, setFormEventId] = useState('');
  const [targetCrewUserId, setTargetCrewUserId] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('UPDATE');
  const [sendEmail, setSendEmail] = useState(false);

  // Feed state
  const [feedTab, setFeedTab] = useState<FeedTab>('event');
  const [filterEventId, setFilterEventId] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Data
  const { data: eventsData } = useEvents({ limit: 200 });
  const events = eventsData?.data ?? [];
  const { data: crewMembers = [] } = useCrewMembers();
  const { data: eventAnnouncements = [], isLoading: eventLoading } = useAnnouncements(filterEventId || undefined);
  const { data: crewAnnouncements = [], isLoading: crewLoading } = useAllCrewAnnouncements();

  const createMutation = useCreateAnnouncement();
  const deleteMutation = useDeleteAnnouncement();

  const sortedEventAnnouncements = useMemo(
    () => [...eventAnnouncements].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [eventAnnouncements],
  );

  const sortedCrewAnnouncements = useMemo(
    () => [...crewAnnouncements].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [crewAnnouncements],
  );

  const isFormValid =
    !!title.trim() &&
    !!message.trim() &&
    (targetType === 'EVENT' ? !!formEventId : true) &&
    (targetType === 'CREW_SPECIFIC' ? !!targetCrewUserId : true);

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!isFormValid) return;

    createMutation.mutate(
      {
        eventId: targetType === 'EVENT' ? formEventId : undefined,
        title: title.trim(),
        message: message.trim(),
        type,
        sendEmail,
        targetType,
        targetCrewUserId: targetType === 'CREW_SPECIFIC' ? targetCrewUserId : undefined,
      },
      {
        onSuccess: () => {
          setTitle('');
          setMessage('');
          setType('UPDATE');
          setSendEmail(false);
          setFormEventId('');
          setTargetCrewUserId('');
          setFormOpen(false);
          // Switch feed to matching tab
          setFeedTab(targetType === 'EVENT' ? 'event' : 'crew');
        },
      },
    );
  }

  function handleDelete(id: string) {
    deleteMutation.mutate(id, { onSuccess: () => setDeleteConfirmId(null) });
  }

  function getEventName(eventId?: string | null) {
    if (!eventId) return null;
    return events.find((e) => e.id === eventId)?.title ?? 'Unknown Event';
  }

  function getCrewMemberName(userId?: string | null) {
    if (!userId) return null;
    const m = crewMembers.find((c) => c.id === userId);
    return m ? `${m.firstName} ${m.lastName}` : 'Unknown Crew Member';
  }

  const activeAnnouncements = feedTab === 'event' ? sortedEventAnnouncements : sortedCrewAnnouncements;
  const isLoading = feedTab === 'event' ? eventLoading : crewLoading;

  return (
    <div className="min-h-screen bg-[#F8F9FA] py-6 px-4 sm:py-8 sm:px-8 overflow-y-auto">
      <div className="w-full max-w-[1400px] mx-auto space-y-6">

        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400 mb-1">
              <span>Admin</span>
              <span>/</span>
              <span className="text-[#FF9900] font-semibold">Announcements</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight m-0">Announcements</h1>
            <p className="text-xs text-slate-500 mt-0.5 m-0 leading-relaxed">
              Broadcast updates to event registrants or crew members.
            </p>
          </div>
          <button
            onClick={() => setFormOpen((v) => !v)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#232F3E] hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition cursor-pointer whitespace-nowrap shrink-0 shadow-xs"
          >
            {formOpen ? 'Cancel' : (
              <>
                <PlusCircle size={14} className="shrink-0 text-[#FF9900]" />
                <span>New Announcement</span>
              </>
            )}
          </button>
        </div>

        {/* ── Create Form ── */}
        {formOpen && (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
              <PlusCircle className="text-[#FF9900] h-4 w-4" />
              <h2 className="text-sm font-bold text-slate-800">Create New Announcement</h2>
            </div>

            <form onSubmit={handleCreate} className="p-5 space-y-5">

              {/* Target Audience Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2">
                  Target Audience *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {TARGET_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setTargetType(opt.value);
                        setFormEventId('');
                        setTargetCrewUserId('');
                      }}
                      className={`flex items-start gap-2.5 px-3.5 py-3 rounded-lg border text-left transition cursor-pointer ${
                        targetType === opt.value
                          ? 'border-[#FF9900] bg-orange-50 ring-1 ring-[#FF9900]/20'
                          : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      <div className={`mt-0.5 shrink-0 ${targetType === opt.value ? 'text-[#FF9900]' : 'text-slate-400'}`}>
                        {opt.icon}
                      </div>
                      <div>
                        <p className={`text-xs font-bold ${targetType === opt.value ? 'text-slate-900' : 'text-slate-600'}`}>
                          {opt.label}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">{opt.desc}</p>
                      </div>
                      {targetType === opt.value && (
                        <CheckCircle2 size={13} className="text-[#FF9900] ml-auto mt-0.5 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Conditional: Event selector */}
              {targetType === 'EVENT' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Target Event *</label>
                  <div className="relative">
                    <select
                      value={formEventId}
                      onChange={(e) => setFormEventId(e.target.value)}
                      required
                      className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-lg text-xs pl-3 pr-8 py-2.5 text-slate-700 focus:outline-none focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900]/20 transition cursor-pointer font-medium"
                    >
                      <option value="">Select event...</option>
                      {events.map((ev) => (
                        <option key={ev.id} value={ev.id}>{ev.title}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              )}

              {/* Conditional: Crew member selector */}
              {targetType === 'CREW_SPECIFIC' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Crew Member *</label>
                  <div className="relative">
                    <select
                      value={targetCrewUserId}
                      onChange={(e) => setTargetCrewUserId(e.target.value)}
                      required
                      className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-lg text-xs pl-3 pr-8 py-2.5 text-slate-700 focus:outline-none focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900]/20 transition cursor-pointer font-medium"
                    >
                      <option value="">Select crew member...</option>
                      {crewMembers.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.firstName} {m.lastName} ({m.email})
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                  </div>
                  {crewMembers.length === 0 && (
                    <p className="text-[10.5px] text-amber-600 mt-1">No crew members found. Users with role="crew" will appear here.</p>
                  )}
                </div>
              )}

              {/* Row: Category */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Category</label>
                <div className="relative max-w-xs">
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-lg text-xs pl-3 pr-8 py-2.5 text-slate-700 focus:outline-none focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900]/20 transition cursor-pointer font-medium"
                  >
                    <option value="UPDATE">Update</option>
                    <option value="REMINDER">Reminder</option>
                    <option value="SCHEDULE_CHANGE">Schedule Change</option>
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="Enter announcement title..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg text-xs px-3 py-2.5 text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900]/20 transition font-medium"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Message *</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={3}
                  placeholder="Write your announcement message here..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg text-xs px-3 py-2.5 text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900]/20 transition resize-none font-medium"
                />
              </div>

              {/* Footer: email toggle + submit */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <div className="relative">
                    <input type="checkbox" checked={sendEmail} onChange={(e) => setSendEmail(e.target.checked)} className="sr-only peer" />
                    <div className="w-8 h-4 bg-slate-200 rounded-full peer peer-checked:bg-[#FF9900] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-slate-300 after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:after:translate-x-full" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Mail size={12} className="text-slate-400" />
                    <span className="text-xs text-slate-600 font-medium">Notify via email</span>
                  </div>
                </label>

                <button
                  type="submit"
                  disabled={createMutation.isPending || !isFormValid}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#232F3E] hover:bg-slate-700 text-white text-xs font-bold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm"
                >
                  {createMutation.isPending ? 'Publishing...' : 'Publish Announcement'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── Feed ── */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          {/* Tab bar + filter */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-5 py-3 sm:py-3.5 border-b border-slate-100">
            {/* Tabs */}
            <div className="flex items-center gap-1 bg-slate-100/80 rounded-xl p-1 w-full sm:w-auto">
              <button
                onClick={() => setFeedTab('event')}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${feedTab === 'event' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <CalendarDays size={13} className="shrink-0 text-[#FF9900]" />
                <span>Event Feed</span>
                <span className="inline-flex items-center justify-center bg-slate-200/80 text-slate-700 rounded-full px-1.5 py-0.5 text-[9.5px] font-bold">
                  {sortedEventAnnouncements.length}
                </span>
              </button>
              <button
                onClick={() => setFeedTab('crew')}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${feedTab === 'crew' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <Users size={13} className="shrink-0 text-slate-500" />
                <span>Crew Feed</span>
                <span className="inline-flex items-center justify-center bg-slate-200/80 text-slate-700 rounded-full px-1.5 py-0.5 text-[9.5px] font-bold">
                  {sortedCrewAnnouncements.length}
                </span>
              </button>
            </div>

            {/* Filter (only for event tab) */}
            {feedTab === 'event' && (
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <Filter size={13} className="text-slate-400 shrink-0" />
                <div className="relative w-full sm:w-auto min-w-[140px] max-w-full sm:max-w-xs">
                  <select
                    value={filterEventId}
                    onChange={(e) => setFilterEventId(e.target.value)}
                    className="w-full appearance-none bg-slate-50 border border-slate-200/80 rounded-xl text-xs pl-3 pr-8 py-2 text-slate-700 focus:outline-none focus:border-[#FF9900] transition cursor-pointer font-semibold truncate"
                  >
                    <option value="">All Events</option>
                    {events.map((ev) => (
                      <option key={ev.id} value={ev.id}>{ev.title}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                </div>
              </div>
            )}
          </div>

          {/* Announcement list */}
          {isLoading ? (
            <div className="divide-y divide-slate-100">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="px-5 py-4 animate-pulse flex gap-3">
                  <div className="w-8 h-8 bg-slate-100 rounded-lg shrink-0" />
                  <div className="flex-1 space-y-2 pt-0.5">
                    <div className="h-3.5 w-1/3 bg-slate-100 rounded" />
                    <div className="h-3 w-2/3 bg-slate-100 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : activeAnnouncements.length === 0 ? (
            <div className="py-14 text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-orange-50 rounded-xl text-[#FF9900] mb-3">
                <Mail size={20} />
              </div>
              <h3 className="text-sm font-semibold text-slate-700 mb-1">No announcements yet</h3>
              <p className="text-xs text-slate-400">
                {feedTab === 'crew' ? 'No crew announcements have been sent.' : 'Create your first announcement above.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {activeAnnouncements.map((ann) => (
                <div key={ann.id} className="px-5 py-4 hover:bg-slate-50/60 transition group">
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className={`shrink-0 w-8 h-8 rounded-lg border flex items-center justify-center mt-0.5 ${typeBadge(ann.type)}`}>
                      {typeIcon(ann.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <h3 className="text-sm font-semibold text-slate-800 leading-tight">{ann.title}</h3>
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded border ${typeBadge(ann.type)}`}>
                          {typeLabel(ann.type)}
                        </span>
                        {/* Target badge */}
                        {ann.targetType === 'CREW_ALL' && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded border bg-violet-50 text-violet-700 border-violet-200">
                            <Users size={9} /> All Crew
                          </span>
                        )}
                        {ann.targetType === 'CREW_SPECIFIC' && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded border bg-indigo-50 text-indigo-700 border-indigo-200">
                            <User size={9} /> {getCrewMemberName(ann.targetCrewUserId)}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed mb-2">{ann.message}</p>
                      <div className="flex items-center gap-3 text-[10.5px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar size={10} />
                          {formatDate(ann.createdAt)}
                        </span>
                        {ann.eventId && (
                          <span className="text-[#FF9900] font-medium">{getEventName(ann.eventId)}</span>
                        )}
                      </div>
                    </div>

                    {/* Delete */}
                    <div className="shrink-0">
                      {deleteConfirmId === ann.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleDelete(ann.id)}
                            disabled={deleteMutation.isPending}
                            className="text-[10px] font-bold px-2.5 py-1 bg-rose-600 text-white rounded-md hover:bg-rose-700 transition disabled:opacity-50 cursor-pointer"
                          >
                            {deleteMutation.isPending ? '...' : 'Delete'}
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="text-[10px] font-bold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md hover:bg-slate-200 transition cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirmId(ann.id)}
                          className="p-1.5 rounded-md text-slate-300 hover:text-rose-500 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
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
