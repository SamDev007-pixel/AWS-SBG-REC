'use client';

import { useState, useEffect, useMemo, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCrewAttendance, useMarkCrewAttendance, useEvents } from '@/lib/hooks';
import { useDebounce } from '@/lib/useDebounce';
import { Scanner } from '@yudiel/react-qr-scanner';
import {
  QrCode,
  CheckCircle,
  XCircle,
  Search,
  UserCheck,
  Calendar,
  Download,
  Users,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FlipHorizontal,
  Keyboard,
  X,
  Radio,
  Filter,
} from 'lucide-react';

function formatDateTime(dateString: string): string {
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
}

/* ── Loading Skeleton ─────────────────────────────────────────── */
function TableLoadingSkeleton() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/60">
            {['Attendee', 'Event', 'Ticket Code', 'Scanned At', 'Terminal', 'Status'].map((h) => (
              <th
                key={h}
                className="px-6 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100/70">
          {Array.from({ length: 5 }).map((_, i) => (
            <tr key={i} className="animate-pulse">
              {[32, 28, 20, 24, 16, 16].map((w, j) => (
                <td key={j} className="px-6 py-4">
                  <div className="h-3.5 rounded bg-slate-100" style={{ width: `${w * 4}px` }} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── Content Component ────────────────────────────────────────── */
function CrewAttendanceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlEventId = searchParams.get('eventId') || '';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEventId, setSelectedEventId] = useState(urlEventId);
  const [ticketCode, setTicketCode] = useState('');
  const [page, setPage] = useState(1);
  const limit = 12;

  // Scanner Modal state
  const [scanModalOpen, setScanModalOpen] = useState(false);
  const [scanMode, setScanMode] = useState<'camera' | 'manual'>('camera');
  const [isMirrored, setIsMirrored] = useState(false);
  const [scannerTicketCode, setScannerTicketCode] = useState('');
  const [scanResult, setScanResult] = useState<{
    status: 'valid' | 'already_scanned' | 'invalid';
    message: string;
  } | null>(null);

  const lastScannedCode = useRef<string | null>(null);
  const lastScannedTime = useRef<number>(0);

  // Manual check-in card feedback
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const { data: logsData, isLoading } = useCrewAttendance({
    search: debouncedSearchQuery || undefined,
  });
  const logs = useMemo(() => logsData ?? [], [logsData]);

  const { data: eventsData } = useEvents({ limit: 200 });
  const events = eventsData?.data ?? [];

  // Sync url param if changed
  useEffect(() => {
    if (urlEventId && !selectedEventId) {
      setSelectedEventId(urlEventId);
    }
  }, [urlEventId, selectedEventId]);

  const markAttendanceMutation = useMarkCrewAttendance();

  // Filter logs by selectedEventId if chosen
  const filteredLogs = useMemo(() => {
    if (!selectedEventId) return logs;
    return logs.filter((log) => {
      const logEventId = log.eventId || log.ticket?.eventId;
      return logEventId === selectedEventId;
    });
  }, [logs, selectedEventId]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / limit));
  const paginatedLogs = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredLogs.slice(start, start + limit);
  }, [filteredLogs, page, limit]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearchQuery, selectedEventId]);

  const currentEvent = events.find((e) => e.id === selectedEventId);

  // Manual Check-in Form submit
  function handleManualMarkAttendance(e: React.FormEvent) {
    e.preventDefault();
    if (!ticketCode.trim()) return;
    if (!selectedEventId) {
      setFeedback({
        type: 'error',
        message: 'Please select an event context before checking in.',
      });
      return;
    }

    setFeedback(null);

    markAttendanceMutation.mutate(
      {
        ticketCode: ticketCode.trim(),
        scannerId: 'crew-terminal',
        eventId: selectedEventId,
      },
      {
        onSuccess: (res) => {
          if (res.success) {
            const ticket = res.ticket;
            const attendeeName =
              ticket?.userName ||
              (ticket?.registration ? `${ticket.registration.name || 'Attendee'}` : 'Attendee');

            setFeedback({
              type: 'success',
              message: `Successfully checked in: ${attendeeName} (${ticket?.event?.title || currentEvent?.title || 'Event'})`,
            });
            setTicketCode('');
          } else {
            setFeedback({
              type: 'error',
              message: res.status || 'Failed to mark attendance.',
            });
          }
        },
        onError: (err: Error) => {
          setFeedback({
            type: 'error',
            message: err.message || 'An error occurred during check-in.',
          });
        },
      },
    );
  }

  // Camera QR Code Scan
  function handleCameraScan(code: string) {
    if (!code || !code.trim()) return;
    if (!selectedEventId) {
      setScanResult({
        status: 'invalid',
        message: 'Please select an event before scanning.',
      });
      return;
    }

    const now = Date.now();
    if (code === lastScannedCode.current && now - lastScannedTime.current < 2000) return;
    lastScannedCode.current = code;
    lastScannedTime.current = now;

    setScanResult(null);

    markAttendanceMutation.mutate(
      {
        ticketCode: code.trim(),
        scannerId: 'crew-camera',
        eventId: selectedEventId,
      },
      {
        onSuccess: (response) => {
          if (response.success) {
            const ticket = response.ticket;
            const attendeeName =
              ticket?.userName ||
              (ticket?.registration ? `${ticket.registration.name || 'Attendee'}` : 'Attendee');
            setScanResult({
              status: 'valid',
              message: `Verified: ${attendeeName} · Checked In!`,
            });
          } else {
            const msg = response.status?.toLowerCase() || '';
            if (msg.includes('already') || msg.includes('scanned')) {
              setScanResult({
                status: 'already_scanned',
                message: response.status || 'Ticket has already been scanned.',
              });
            } else if (msg.includes('wrong') || msg.includes('event') || msg.includes('different')) {
              setScanResult({
                status: 'invalid',
                message: 'Ticket belongs to a different event.',
              });
            } else {
              setScanResult({
                status: 'invalid',
                message: response.status || 'Invalid ticket code.',
              });
            }
          }
        },
        onError: (err: Error) => {
          setScanResult({
            status: 'invalid',
            message: err.message || 'Failed to verify ticket. Please try again.',
          });
        },
      },
    );
  }

  // Modal manual submit
  function handleModalManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!scannerTicketCode.trim()) return;
    if (!selectedEventId) {
      setScanResult({
        status: 'invalid',
        message: 'Please select an event before verifying.',
      });
      return;
    }

    setScanResult(null);

    markAttendanceMutation.mutate(
      {
        ticketCode: scannerTicketCode.trim(),
        scannerId: 'crew-terminal-modal',
        eventId: selectedEventId,
      },
      {
        onSuccess: (response) => {
          if (response.success) {
            const ticket = response.ticket;
            const attendeeName =
              ticket?.userName ||
              (ticket?.registration ? `${ticket.registration.name || 'Attendee'}` : 'Attendee');
            setScanResult({
              status: 'valid',
              message: `Verified: ${attendeeName} · Checked In!`,
            });
            setScannerTicketCode('');
          } else {
            const msg = response.status?.toLowerCase() || '';
            if (msg.includes('already') || msg.includes('scanned')) {
              setScanResult({
                status: 'already_scanned',
                message: response.status || 'Ticket has already been scanned.',
              });
            } else {
              setScanResult({
                status: 'invalid',
                message: response.status || 'Invalid ticket code.',
              });
            }
          }
        },
        onError: (err: Error) => {
          setScanResult({
            status: 'invalid',
            message: err.message || 'Verification failed. Please try again.',
          });
        },
      },
    );
  }

  // Unique attendees count
  const uniqueAttendeesCount = useMemo(() => {
    const set = new Set<string>();
    filteredLogs.forEach((l) => {
      const name = l.ticket?.userName || l.ticket?.registration?.name || l.userId;
      if (name) set.add(name);
    });
    return set.size;
  }, [filteredLogs]);

  const selectCls =
    'appearance-none pl-3.5 pr-9 py-2 bg-slate-50 border border-slate-200 hover:border-slate-350 focus:border-[#FF9900] focus:bg-white focus:outline-none rounded-[6px] text-[12.5px] text-slate-700 cursor-pointer transition-all';

  return (
    <div
      className="min-h-screen w-full text-[#1A1C1E] relative pt-4 pb-6 px-4 sm:py-8 sm:px-8 overflow-y-auto premium-scrollbar scroll-smooth antialiased font-jakarta"
      style={{
        backgroundImage:
          "linear-gradient(rgba(255, 255, 255, 0.65), rgba(255, 255, 255, 0.65)), url('/images/aws_tech_doodle_bg.png')",
        backgroundRepeat: 'repeat',
        backgroundSize: '480px auto',
      }}
    >
      <div className="max-w-[1600px] w-full mx-auto flex flex-col gap-6 z-10 relative">
        {/* ── Header Section ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
          <div>
            {/* Breadcrumb Path */}
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 mb-2.5">
              <Link href="/crew/dashboard" className="hover:text-[#FF9900] transition-colors font-semibold">
                Crew
              </Link>
              <span className="text-slate-300">/</span>
              <span className="text-[#FF9900] font-semibold">Attendance</span>
            </div>

            <div className="flex items-center gap-2">
              <h1 className="text-[24px] font-semibold text-slate-900 tracking-tight leading-none m-0">
                Attendance Management
              </h1>
              <span className="px-2 py-0.5 bg-orange-50 text-[#FF9900] rounded-[4px] text-xs font-semibold">
                {filteredLogs.length}
              </span>
            </div>
            <p className="text-[13px] text-slate-500 font-normal mt-2.5">
              Log ticket entries manually, scan passes via camera, search active check-ins, and generate on-duty (OD) attendance lists.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <button
              onClick={() => {
                setScanModalOpen(true);
                setScanResult(null);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#232F3E] hover:bg-slate-800 text-white rounded-[6px] text-[12px] font-semibold transition-all shadow-sm hover:-translate-y-0.5 cursor-pointer"
            >
              <QrCode size={14} />
              Scan Ticket
            </button>

            <button
              onClick={() =>
                router.push(
                  selectedEventId
                    ? `/crew/attendance/od-generator?eventId=${selectedEventId}&scope=crew`
                    : '/crew/attendance/od-generator?scope=crew',
                )
              }
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 rounded-[6px] text-[12px] font-semibold transition-all shadow-sm hover:-translate-y-0.5 cursor-pointer"
            >
              <Download size={14} />
              Generate OD List
            </button>
          </div>
        </div>

        {/* ── Metric Summary Strip ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-[6px] p-4 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                Total Check-ins
              </p>
              <p className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">
                {filteredLogs.length}
              </p>
            </div>
            <div className="w-10 h-10 rounded-[6px] bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <CheckCircle2 size={20} />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-[6px] p-4 shadow-sm flex items-center justify-between">
            <div className="min-w-0 pr-2">
              <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                Event Context
              </p>
              <p className="text-[14px] font-bold text-slate-900 mt-1 truncate">
                {currentEvent ? currentEvent.title : 'All Events'}
              </p>
            </div>
            <div className="w-10 h-10 rounded-[6px] bg-orange-50 border border-orange-100 flex items-center justify-center text-[#FF9900] shrink-0">
              <Calendar size={18} />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-[6px] p-4 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                Unique Attendees
              </p>
              <p className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">
                {uniqueAttendeesCount}
              </p>
            </div>
            <div className="w-10 h-10 rounded-[6px] bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <Users size={19} />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-[6px] p-4 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                Terminal Status
              </p>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[13px] font-bold text-slate-800">Ready for Scans</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-[6px] bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Radio size={18} />
            </div>
          </div>
        </div>

        {/* ── Quick Check-In Form Card ── */}
        <div className="bg-white border border-slate-200 rounded-[6px] shadow-sm p-5 flex flex-col gap-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <h2 className="text-[14px] font-semibold text-slate-800 flex items-center gap-2 m-0">
              <UserCheck size={16} className="text-[#FF9900]" />
              <span>Manual Attendance Entry</span>
            </h2>
            <span className="text-[11px] text-slate-400">
              Select event context, enter ticket code, and confirm
            </span>
          </div>

          <form onSubmit={handleManualMarkAttendance} className="flex flex-col gap-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="relative">
                <select
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                  className="w-full appearance-none px-3.5 py-2.5 bg-slate-50 border border-slate-200 hover:border-slate-350 focus:border-[#FF9900] focus:bg-white focus:outline-none rounded-[6px] text-[13px] text-slate-700 cursor-pointer transition-all pr-10"
                >
                  <option value="">Select Event Context (Required)</option>
                  {events.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.title}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  size={14}
                />
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={ticketCode}
                  onChange={(e) => setTicketCode(e.target.value)}
                  placeholder="Enter Ticket Code (e.g. EVT-EVENTID-TICKET001)..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 hover:border-slate-350 focus:border-[#FF9900] focus:bg-white focus:outline-none rounded-[6px] text-[13px] text-slate-700 placeholder-slate-400 font-mono transition-all"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <p className="text-[11.5px] text-slate-400">
                {selectedEventId
                  ? `Active Event: ${currentEvent?.title || 'Selected'}`
                  : 'Please pick an event to enable check-ins.'}
              </p>
              <button
                type="submit"
                disabled={markAttendanceMutation.isPending || !ticketCode.trim() || !selectedEventId}
                className="px-4 py-2 bg-[#232F3E] hover:bg-slate-800 text-white rounded-[6px] text-[12px] font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer shadow-sm hover:-translate-y-0.5"
              >
                {markAttendanceMutation.isPending ? 'Processing...' : 'Mark Attendance'}
              </button>
            </div>
          </form>

          {feedback && (
            <div
              className={`p-3.5 rounded-[6px] border text-[12.5px] font-medium flex items-start gap-2.5 transition-all ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              <span className="mt-0.5 shrink-0">
                {feedback.type === 'success' ? (
                  <CheckCircle size={15} className="text-emerald-600" />
                ) : (
                  <XCircle size={15} className="text-rose-600" />
                )}
              </span>
              <span>{feedback.message}</span>
            </div>
          )}
        </div>

        {/* ── Filters & Search Bar for Check-in Logs ── */}
        <div className="bg-white border border-slate-200 rounded-[6px] shadow-sm px-4 py-3 sm:px-5 sm:py-3.5">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <Search
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                size={14}
              />
              <input
                type="text"
                placeholder="Search logs by attendee, ticket, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 hover:border-slate-350 focus:border-[#FF9900] focus:bg-white focus:outline-none rounded-[6px] text-[13px] text-slate-700 placeholder-slate-400 transition-all"
              />
            </div>

            {/* Event Filter */}
            <div className="relative shrink-0">
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className={selectCls}
              >
                <option value="">All Assigned Events</option>
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                size={13}
              />
            </div>

            <div className="flex-1" />

            {/* Clear Filters */}
            {(searchQuery || selectedEventId) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedEventId('');
                }}
                className="text-[12px] font-semibold text-[#FF9900] hover:text-orange-700 transition-colors cursor-pointer border-none bg-transparent shrink-0"
              >
                Clear Filters
              </button>
            )}

            <div className="text-[12px] font-medium text-slate-400 shrink-0">
              Showing <span className="font-bold text-slate-700">{filteredLogs.length}</span> records
            </div>
          </div>
        </div>

        {/* ── Check-in Logs Table Card ── */}
        <div className="bg-white border border-slate-200 rounded-[6px] shadow-sm overflow-hidden flex flex-col">
          {isLoading ? (
            <TableLoadingSkeleton />
          ) : filteredLogs.length === 0 ? (
            <div className="border border-dashed border-slate-200 rounded-[6px] m-6 p-14 text-center bg-slate-50/50">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
                <Calendar size={20} />
              </div>
              <h3 className="text-[14px] font-semibold text-slate-700 mb-1">
                No check-in logs found
              </h3>
              <p className="text-[12px] text-slate-400 max-w-sm mx-auto">
                {selectedEventId
                  ? 'No attendees have checked into this event yet. Mark manual entry or scan passes.'
                  : 'No attendance records match your current filters. Clear filters or check in attendees.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60">
                    <th className="px-6 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                      Attendee Name
                    </th>
                    <th className="px-6 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                      Event
                    </th>
                    <th className="px-6 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                      Ticket Code
                    </th>
                    <th className="px-6 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                      Checked-in At
                    </th>
                    <th className="px-6 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                      Terminal / Scanner
                    </th>
                    <th className="px-6 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap text-right">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedLogs.map((log) => {
                    const attendeeName =
                      log.ticket?.userName ||
                      (log.ticket?.registration?.name
                        ? `${log.ticket.registration.name}`
                        : 'Attendee');
                    const eventTitle =
                      log.ticket?.event?.title ||
                      events.find((e) => e.id === log.eventId)?.title ||
                      'Assigned Event';

                    return (
                      <tr
                        key={log.id}
                        className="hover:bg-slate-50/70 transition-colors group"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center font-bold text-[11px] shrink-0">
                              {attendeeName.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-semibold text-slate-800 text-[13px]">
                              {attendeeName}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-600 text-[12.5px] font-medium max-w-[280px] truncate">
                          {eventTitle}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-mono text-[11px] bg-slate-50 border border-slate-200 rounded-[4px] px-2.5 py-1 text-slate-600 font-medium">
                            {log.ticket?.ticketCode || '—'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Clock size={12} className="text-slate-400" />
                            <span>{formatDateTime(log.scannedAt)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">
                          <span className="px-2 py-0.5 bg-slate-50 border border-slate-200 rounded-[4px] text-[11px] text-slate-600">
                            {log.scannerId || 'Terminal'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200/60 rounded-[4px] text-[11px] font-semibold">
                            <CheckCircle2 size={11} className="text-emerald-600" />
                            <span>Attended</span>
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* ── Pagination ── */}
          {!isLoading && totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-100 bg-slate-50/40">
              <span className="text-[12px] text-slate-500">
                Page <span className="font-semibold text-slate-700">{page}</span> of{' '}
                <span className="font-semibold text-slate-700">{totalPages}</span>
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 rounded-[4px] border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600 cursor-pointer"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-1.5 rounded-[4px] border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600 cursor-pointer"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Scan Ticket Modal ── */}
      {scanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="absolute inset-0 cursor-pointer" onClick={() => setScanModalOpen(false)} />
          <div className="relative bg-white border border-slate-200 rounded-[8px] p-6 max-w-sm w-full shadow-2xl z-10 overflow-hidden flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Laser Sweep Animation */}
            <style>{`
              @keyframes laser-sweep {
                0% { top: 6%; opacity: 0; }
                15% { opacity: 1; }
                85% { opacity: 1; }
                100% { top: 94%; opacity: 0; }
              }
            `}</style>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-[6px] bg-orange-50 border border-orange-100 flex items-center justify-center text-[#FF9900]">
                  <QrCode size={16} />
                </div>
                <div>
                  <h3 className="text-[15px] font-semibold text-slate-900 m-0">Scan Ticket</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {scanMode === 'camera'
                      ? 'Position QR code in camera viewport'
                      : 'Enter ticket code to verify'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setScanModalOpen(false)}
                className="w-7 h-7 rounded-[4px] bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors flex items-center justify-center cursor-pointer border-none"
              >
                <X size={14} />
              </button>
            </div>

            {/* Event Selector in Modal */}
            <div className="relative">
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Event Context
              </label>
              <div className="relative">
                <select
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                  className="w-full appearance-none px-3 py-1.5 bg-slate-50 border border-slate-200 hover:border-slate-350 focus:border-[#FF9900] focus:bg-white focus:outline-none rounded-[6px] text-[12px] text-slate-700 cursor-pointer pr-8"
                >
                  <option value="">Select Event (Required)</option>
                  {events.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.title}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  size={13}
                />
              </div>
            </div>

            {/* Mode Switch Tabs */}
            <div className="flex bg-slate-100 p-0.5 rounded-[6px] border border-slate-200 h-8 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setScanMode('camera');
                  setScanResult(null);
                }}
                className={`flex-1 text-[11px] font-semibold transition-all rounded-[4px] flex items-center justify-center gap-1.5 cursor-pointer border-none ${
                  scanMode === 'camera'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 bg-transparent'
                }`}
              >
                <QrCode size={13} />
                Camera
              </button>
              <button
                type="button"
                onClick={() => {
                  setScanMode('manual');
                  setScanResult(null);
                }}
                className={`flex-1 text-[11px] font-semibold transition-all rounded-[4px] flex items-center justify-center gap-1.5 cursor-pointer border-none ${
                  scanMode === 'manual'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 bg-transparent'
                }`}
              >
                <Keyboard size={13} />
                Manual Code
              </button>
            </div>

            {/* Mode Viewport */}
            {scanMode === 'camera' ? (
              <div className="flex flex-col items-center justify-center gap-3">
                <div className="relative w-full aspect-square max-w-[240px] rounded-[6px] bg-[#101720] overflow-hidden shadow-sm flex items-center justify-center border border-slate-200">
                  <div
                    className="absolute inset-0 w-full h-full"
                    style={{ transform: isMirrored ? 'scaleX(-1)' : 'none' }}
                  >
                    <Scanner
                      onScan={(result: any) => {
                        if (result && result.length > 0 && result[0].rawValue) {
                          handleCameraScan(result[0].rawValue);
                        }
                      }}
                      onError={(error: any) => console.log('Scanner error:', error?.message)}
                      sound={false}
                      components={{ finder: false }}
                      constraints={{ facingMode: 'environment' }}
                      styles={{ container: { width: '100%', height: '100%' } }}
                    />
                  </div>

                  {/* Corner Targets */}
                  <div className="absolute inset-0 pointer-events-none p-3">
                    <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-[#FF9900]" />
                    <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-[#FF9900]" />
                    <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-[#FF9900]" />
                    <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-[#FF9900]" />
                  </div>

                  {/* Laser Scan line */}
                  <div
                    className="absolute left-4 right-4 h-0.5 bg-[#FF9900] shadow-[0_0_8px_#FF9900] pointer-events-none"
                    style={{ animation: 'laser-sweep 2s ease-in-out infinite' }}
                  />

                  {/* Flip Camera Button */}
                  <button
                    type="button"
                    onClick={() => setIsMirrored(!isMirrored)}
                    className="absolute bottom-2.5 right-2.5 z-20 bg-slate-900/80 hover:bg-slate-900 text-white rounded-[4px] p-1.5 transition-all cursor-pointer border border-white/20"
                    title="Flip camera view"
                  >
                    <FlipHorizontal size={13} />
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleModalManualSubmit} className="flex flex-col gap-3">
                <input
                  type="text"
                  value={scannerTicketCode}
                  onChange={(e) => setScannerTicketCode(e.target.value)}
                  placeholder="Paste or type ticket code..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 hover:border-slate-350 focus:border-[#FF9900] focus:bg-white focus:outline-none rounded-[6px] text-[12.5px] font-mono text-slate-700"
                />
                <button
                  type="submit"
                  disabled={markAttendanceMutation.isPending || !scannerTicketCode.trim()}
                  className="w-full py-2 bg-[#232F3E] hover:bg-slate-800 text-white rounded-[6px] text-[12px] font-semibold transition-all disabled:opacity-40 cursor-pointer"
                >
                  {markAttendanceMutation.isPending ? 'Verifying...' : 'Verify Ticket'}
                </button>
              </form>
            )}

            {/* Scan Result Feedback Banner */}
            {scanResult && (
              <div
                className={`p-3 rounded-[6px] border text-[12px] font-medium flex items-center gap-2 transition-all ${
                  scanResult.status === 'valid'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : scanResult.status === 'already_scanned'
                    ? 'bg-amber-50 border-amber-200 text-amber-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                {scanResult.status === 'valid' ? (
                  <CheckCircle size={15} className="text-emerald-600 shrink-0" />
                ) : (
                  <XCircle size={15} className="text-rose-600 shrink-0" />
                )}
                <span className="truncate">{scanResult.message}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function CrewAttendancePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full flex items-center justify-center p-8">
          <div className="w-8 h-8 border-3 border-[#FF9900] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <CrewAttendanceContent />
    </Suspense>
  );
}
