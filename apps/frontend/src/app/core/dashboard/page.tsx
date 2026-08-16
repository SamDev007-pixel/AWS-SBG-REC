'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  Users, 
  Ticket, 
  BarChart3, 
  ArrowRight, 
  Sparkles, 
  Calendar, 
  MapPin, 
  Plus, 
  UserCheck,
  Edit,
  MoreVertical,
  Trash2,
  Archive,
  Globe,
  XCircle,
  CheckCircle,
  Eye,
  Sliders,
  Home,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';
import { useEvents, useDeleteEvent } from '@/lib/hooks';
import type { EventStatus, Event, EventMode } from '@/lib/types';
import GlassCard from '@/components/GlassCard';
import { getPosterSrcAndPosition } from '@/lib/utils';
import * as api from '@/lib/api';

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function statusConfig(status: EventStatus) {
  const map: Record<EventStatus, { label: string; className: string }> = {
    DRAFT:               { label: 'Draft',               className: 'bg-slate-500/10 text-slate-600 border-slate-200' },
    PUBLISHED:           { label: 'Published',           className: 'bg-blue-500/10 text-blue-700 border-blue-500/20' },
    REGISTRATION_OPEN:   { label: 'Registration Open',   className: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20' },
    REGISTRATION_CLOSED: { label: 'Reg. Closed',         className: 'bg-amber-500/10 text-amber-700 border-amber-500/20' },
    ONGOING:             { label: 'Ongoing',             className: 'bg-indigo-500/10 text-indigo-700 border-indigo-500/20' },
    COMPLETED:           { label: 'Completed',           className: 'bg-slate-500/10 text-slate-600 border-slate-500/20' },
    ARCHIVED:            { label: 'Archived',            className: 'bg-rose-500/10 text-rose-600 border-rose-500/20' },
  };
  return map[status] ?? { label: status, className: 'bg-slate-500/10 text-slate-600 border-slate-200' };
}

function categoryConfig(category: string) {
  const map: Record<string, { label: string; className: string }> = {
    Technology: { label: 'Technology', className: 'bg-orange-500/10 text-[#FF9900] border-[#FF9900]/20' },
    Workshop:   { label: 'Workshop',   className: 'bg-blue-500/10 text-blue-700 border-blue-500/20' },
    Bootcamp:   { label: 'Bootcamp',   className: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20' },
    DevOps:     { label: 'DevOps',     className: 'bg-purple-500/10 text-purple-700 border-purple-500/20' },
  };
  return map[category] ?? { label: category, className: 'bg-slate-500/10 text-slate-600 border-slate-500/20' };
}

function modeConfig(mode: EventMode | undefined) {
  const map: Record<EventMode, { label: string; className: string }> = {
    ONLINE:  { label: 'Online',  className: 'bg-violet-50 text-violet-700 border-violet-100' },
    OFFLINE: { label: 'Offline', className: 'bg-orange-50 text-orange-700 border-orange-100' },
    HYBRID:  { label: 'Hybrid',  className: 'bg-cyan-50 text-cyan-700 border-cyan-100' },
  };
  if (!mode) return { label: '—', className: 'bg-slate-50 text-slate-500 border-slate-100' };
  return map[mode] ?? { label: mode, className: 'bg-slate-50 text-slate-500 border-slate-100' };
}

const SURROUNDING_ICONS = [
  { src: "https://raw.githubusercontent.com/SamDevaraja/AWS-SBG-REC/cbf1e2065c9a67ce4e1da4ffb83bf5a143780d74/apps/backend/uploads/services/amazon-ec2.svg", label: "EC2" },
  { src: "https://raw.githubusercontent.com/SamDevaraja/AWS-SBG-REC/cbf1e2065c9a67ce4e1da4ffb83bf5a143780d74/apps/backend/uploads/services/amazon-dynamodb.svg", label: "DynamoDB" },
  { src: "https://raw.githubusercontent.com/SamDevaraja/AWS-SBG-REC/cbf1e2065c9a67ce4e1da4ffb83bf5a143780d74/apps/backend/uploads/services/aws-lambda.svg", label: "Lambda" },
  { src: "https://raw.githubusercontent.com/SamDevaraja/AWS-SBG-REC/cbf1e2065c9a67ce4e1da4ffb83bf5a143780d74/apps/backend/uploads/services/amazon-s3.svg", label: "S3" },
  { src: "https://raw.githubusercontent.com/SamDevaraja/AWS-SBG-REC/cbf1e2065c9a67ce4e1da4ffb83bf5a143780d74/apps/backend/uploads/services/amazon-cloudwatch.svg", label: "CloudWatch" },
];

const ORBIT_RADIUS = 72; // Center-to-center distance in pixels

const POSITIONED_ICONS = SURROUNDING_ICONS.map((item, index) => {
  const angle = index * 72; // 5 icons: 360 / 5 = 72 degrees step
  return { ...item, angle };
});

function CoreHeroBanner() {
  const [greeting, setGreeting] = useState("Hello");
  const [userName, setUserName] = useState("Administrator");
  const [hoveredIcon, setHoveredIcon] = useState<string | null>(null);

  useEffect(() => {
    const hours = new Date().getHours();
    if (hours >= 5 && hours < 12) {
      setGreeting("Good Morning");
    } else if (hours >= 12 && hours < 17) {
      setGreeting("Good Afternoon");
    } else {
      setGreeting("Good Evening");
    }

    try {
      const raw = localStorage.getItem("aws_sgb_rec_user");
      if (raw) {
        const parsed = JSON.parse(raw);
        let nameToFormat = "Administrator";
        if (parsed.fullName) nameToFormat = parsed.fullName;
        else if (parsed.email) nameToFormat = parsed.email;
        
        const cleanName = nameToFormat.includes('@') ? nameToFormat.split('@')[0] : nameToFormat;
        const formatted = cleanName
          .split(/[\s._-]+/)
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        setUserName(formatted);
      }
    } catch {
      // ignore
    }
  }, []);

  return (
    <div className="relative w-full">
      {/* Background soft glow blobs */}
      <div className="absolute top-1/2 left-[10%] -translate-y-1/2 w-36 h-36 bg-amber-500/15 rounded-full blur-[60px] pointer-events-none z-0" />
      <div className="absolute top-1/2 right-[15%] -translate-y-1/2 w-40 h-40 bg-orange-500/10 rounded-full blur-[65px] pointer-events-none z-0" />

      {/* Welcome banner with solid white card container */}
      <div className="relative w-full rounded-xl border border-slate-200 p-4 sm:p-5 overflow-hidden z-10 shadow-xs bg-white">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative w-full flex flex-col md:flex-row justify-between items-center gap-4"
        >
          {/* Welcome Text Content */}
          <div className="relative z-10 flex-1 flex flex-col items-start text-slate-800">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-orange-50/90 border border-orange-200 text-orange-900 text-[11.5px] font-semibold mb-3 shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#FF9900]" />
              <span 
                className="tracking-wider font-semibold"
                style={{ fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}
              >
                AWS Student Builders Group REC
              </span>
            </motion.div>

            <h1 
              className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mb-1.5 leading-tight"
              style={{ fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}
            >
              {greeting}, <span className="capitalize font-bold text-slate-900 inline-block">{userName}</span>!
            </h1>

            <p 
              className="text-xs sm:text-[13.5px] text-slate-600 font-normal leading-relaxed max-w-xl mb-4 text-left"
              style={{ fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}
            >
              Manage your community, empower your team, and turn ambitious ideas into impactful events that leave a lasting impression.
            </p>

            <div className="flex flex-row items-center gap-2.5 w-full sm:w-auto">
              <Link href="/core/events/create" className="flex-1 sm:flex-initial">
                <button
                  className="w-full sm:w-auto h-9 inline-flex items-center justify-center gap-1.5 px-4 rounded-lg bg-[#FF9900] hover:bg-[#E88B00] text-white font-bold text-xs sm:text-[13px] shadow-2xs hover:shadow-xs transition-all active:scale-[0.98] cursor-pointer whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create New Event</span>
                </button>
              </Link>

              <Link href="/core/analytics" className="flex-1 sm:flex-initial">
                <button
                  className="w-full sm:w-auto h-9 inline-flex items-center justify-center gap-1.5 px-4 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 hover:text-slate-900 font-semibold text-xs sm:text-[13px] shadow-2xs hover:shadow-xs transition-all active:scale-[0.98] cursor-pointer whitespace-nowrap"
                >
                  <BarChart3 className="w-4 h-4 text-slate-500" />
                  <span>System Analytics</span>
                </button>
              </Link>
            </div>
          </div>

          {/* Right Side Visual Panel */}
          <div className="hidden md:flex relative z-10 flex-shrink-0 w-full md:w-auto justify-center items-center md:px-2">
            <div className="relative w-44 h-44 flex items-center justify-center">
              {/* Animated floating circles / orbits */}
              <div className="absolute w-[144px] h-[144px] border border-dashed border-slate-300 rounded-full animate-spin" style={{ animationDuration: "25s" }} />
              <div className="absolute w-[92px] h-[92px] border border-dotted border-slate-400/80 rounded-full animate-spin" style={{ animationDuration: "15s", animationDirection: "reverse" }} />

              {/* Central Main Icon (AWS Logo) */}
              <div className="absolute z-10 w-16 h-16 bg-transparent flex items-center justify-center pointer-events-none">
                <img src="/aws-logo.svg" alt="AWS Logo" className="w-13 h-auto object-contain drop-shadow-sm" />
              </div>

              {/* 5 Surrounding Smaller Icons (Orbiting) */}
              {POSITIONED_ICONS.map((item) => {
                const isHovered = hoveredIcon === item.label;
                return (
                  <motion.div
                    key={item.label}
                    className="absolute"
                    style={{
                      left: "50%",
                      top: "50%",
                      x: "-50%",
                      y: "-50%",
                    }}
                    animate={{
                      rotate: [item.angle, item.angle + 360],
                    }}
                    transition={{
                      duration: 40,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    <motion.div
                      className="absolute w-9 h-9 rounded-xl overflow-hidden border border-black/10 shadow-xs cursor-pointer z-20"
                      style={{
                        left: "50%",
                        top: "50%",
                        x: "-50%",
                        y: `calc(-50% - ${ORBIT_RADIUS}px)`,
                      }}
                      animate={{
                        rotate: [-item.angle, -item.angle - 360],
                        scale: isHovered ? 1.2 : 1,
                        boxShadow: isHovered
                          ? "0 6px 12px -4px rgba(0, 0, 0, 0.2)"
                          : "0 2px 4px -1px rgba(0, 0, 0, 0.08)",
                        borderColor: isHovered
                          ? "rgba(255, 153, 0, 0.5)"
                          : "rgba(0, 0, 0, 0.1)",
                        zIndex: isHovered ? 30 : 20,
                      }}
                      transition={{
                        rotate: { duration: 40, repeat: Infinity, ease: "linear" },
                        scale: { type: "spring", stiffness: 400, damping: 15 },
                      }}
                      onHoverStart={() => setHoveredIcon(item.label)}
                      onHoverEnd={() => setHoveredIcon(null)}
                    >
                      <img src={item.src} alt={item.label} className="w-full h-full object-cover" />
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}



/* ── Actions Dropdown ─────────────────────────────────────────── */
function ActionsDropdown({
  event,
  onAction,
}: {
  event: Event;
  onAction: (action: string, eventId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open]);

  const canPublish = event.status === 'DRAFT';
  const canCloseRegistration = event.status === 'REGISTRATION_OPEN' || event.status === 'PUBLISHED';
  const canArchive = !['ARCHIVED', 'COMPLETED', 'DRAFT'].includes(event.status);
  const canDelete = ['DRAFT', 'ARCHIVED'].includes(event.status);
  const canComplete = !['COMPLETED', 'ARCHIVED', 'DRAFT'].includes(event.status);
  const canRevert = event.status === 'COMPLETED';

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className={`h-8 w-8 rounded-[6px] hover:bg-slate-100 active:bg-slate-200/80 transition-all duration-150 cursor-pointer flex items-center justify-center focus:outline-none ${open ? 'bg-slate-100 text-[#FF9900]' : 'text-slate-500'}`}
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 z-20 w-48 bg-white/95 backdrop-blur-md border border-slate-300/90 rounded-[6px] shadow-[0_12px_30px_-4px_rgba(0,0,0,0.1)] py-1.5 overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-150 origin-top-right">
          {[
            { action: 'edit', icon: Edit, label: 'Edit Event', show: true },
          ].filter(i => i.show).map(({ action, icon: Icon, label }) => (
            <button key={action} onClick={() => { onAction(action, event.id); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[12px] font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors">
              <Icon className="h-3.5 w-3.5 text-slate-400" />
              {label}
            </button>
          ))}

          {canPublish && (
            <button onClick={() => { onAction('publish', event.id); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[12px] font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors">
              <Globe className="h-3.5 w-3.5 text-slate-400" />
              Publish
            </button>
          )}
          {canCloseRegistration && (
            <button onClick={() => { onAction('closeRegistration', event.id); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[12px] font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors">
              <XCircle className="h-3.5 w-3.5 text-slate-400" />
              Close Registration
            </button>
          )}
          {canComplete && (
            <button onClick={() => { onAction('complete', event.id); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[12px] font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors">
              <CheckCircle className="h-3.5 w-3.5 text-slate-400" />
              Complete Event
            </button>
          )}
          {canArchive && (
            <button onClick={() => { onAction('archive', event.id); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[12px] font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors">
              <Archive className="h-3.5 w-3.5 text-slate-400" />
              Archive
            </button>
          )}
          {canRevert && (
            <>
              <div className="border-t border-slate-100 my-1" />
              <button onClick={() => { onAction('revert', event.id); setOpen(false); }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[12px] font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                <RotateCcw className="h-3.5 w-3.5 text-slate-400" />
                Reopen Event
              </button>
            </>
          )}
          {canDelete && (
            <>
              <div className="border-t border-slate-100 my-1" />
              <button onClick={() => { onAction('delete', event.id); setOpen(false); }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[12px] font-medium text-rose-600 hover:bg-rose-50 transition-colors">
                <Trash2 className="h-3.5 w-3.5 text-rose-400" />
                Delete
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

const RecentEventSkeleton = () => (
  <div className="border border-slate-200 bg-white rounded-[6px] shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden animate-pulse flex flex-col justify-between h-full">
    <div className="bg-slate-100 h-48 rounded-t-[6px]" />
    <div className="p-5 pt-4 space-y-3 flex-grow flex flex-col justify-between">
      <div className="space-y-2">
        <div className="h-5 bg-slate-100 rounded w-3/4" />
        <div className="h-4 bg-slate-100 rounded w-1/3" />
      </div>
      <div className="space-y-1.5 pt-2 border-t border-slate-100">
        <div className="h-3.5 bg-slate-100 rounded w-4/5" />
        <div className="h-3.5 bg-slate-100 rounded w-2/3" />
      </div>
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        <div className="h-9 bg-slate-100 rounded w-5/12" />
        <div className="h-9 bg-slate-100 rounded w-5/12" />
      </div>
    </div>
  </div>
);

const RecentEventCard = ({
  event,
  onAction,
}: {
  event: Event;
  onAction: (action: string, eventId: string) => void;
}) => {
  const sc = statusConfig(event.status);
  const regCount = event.registrations?.length ?? 0;
  const capacity = event.capacity;
  const { src: imgPosterSrc, position: imgPosterPosition } = getPosterSrcAndPosition(event.posterImage);

  return (
    <div className="group rounded-[6px] overflow-hidden transition-all duration-300 flex flex-col h-full relative cursor-pointer bg-white border border-slate-200 hover:border-[#FF9900]/70 hover:shadow-[0_12px_30px_-6px_rgba(35,47,62,0.08),0_0_15px_rgba(255,153,0,0.22)] hover:-translate-y-1 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
      {/* Poster (Full-bleed cover image matching events page) */}
      <div className="h-48 w-full relative bg-slate-900 overflow-hidden rounded-t-[6px]">
        <img
          src={imgPosterSrc}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500 ease-out"
          style={{ objectPosition: imgPosterPosition }}
        />
      </div>

      {/* Body */}
      <div className="p-5 pt-4 flex-1 flex flex-col gap-3 bg-white">
        {/* Title & Details Group wrapper */}
        <div className="flex flex-col gap-3">
          {/* Header with Title and Actions */}
          <div className="flex items-start justify-between gap-4">
            <h3 className="text-[18px] font-bold text-slate-800 leading-snug tracking-tight hover:text-[#FF9900] transition-colors line-clamp-2" title={event.title}>
              {event.title}
            </h3>
            <div className="shrink-0 pt-0.5">
              <ActionsDropdown event={event} onAction={onAction} />
            </div>
          </div>

          {/* Badges Row (Status, Category) */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-[4px] text-[10px] font-semibold uppercase tracking-wider border ${sc.className}`}>
              {sc.label}
            </span>
            {event.category && (() => {
              const cat = categoryConfig(event.category);
              return (
                <span className={`inline-flex items-center px-2 py-0.5 rounded-[4px] text-[10px] font-semibold uppercase tracking-wider border ${cat.className}`}>
                  {cat.label}
                </span>
              );
            })()}
          </div>

          {/* Date & Venue details */}
          <div className="flex flex-col gap-1.5 text-[13px] text-slate-500">
            {event.date && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#FF9900]/80 shrink-0" />
                <span className="font-medium text-slate-600">{formatDate(event.date)}</span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-500">{event.time || '09:30 AM'}</span>
              </div>
            )}
            {event.venue && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#FF9900]/80 shrink-0" />
                <span className="truncate text-slate-600 font-medium" title={event.venue}>{event.venue}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Card Footer Container */}
      <div className="px-5 py-4 bg-slate-50/60 border-t border-slate-200 flex flex-col gap-3.5 mt-auto rounded-b-[6px]">
        {/* Remaining Seats */}
        {capacity != null && (() => {
          const remaining = Math.max(0, capacity - regCount);
          let statusCls = "bg-slate-500/10 text-slate-700 border-slate-500/20";
          let dotColor = "bg-slate-450";
          if (remaining === 0) {
            statusCls = "bg-rose-500/10 text-rose-700 border-rose-500/20";
            dotColor = "bg-rose-500";
          } else if (remaining <= 20) {
            statusCls = "bg-amber-500/10 text-amber-700 border-amber-500/20";
            dotColor = "bg-amber-500";
          } else {
            statusCls = "bg-emerald-500/10 text-emerald-700 border-emerald-500/20";
            dotColor = "bg-emerald-500";
          }
          
          return (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <Users className="h-3.5 w-3.5 text-slate-400" />
                <span>Seats Remaining</span>
              </div>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[4px] text-[11.5px] font-bold border ${statusCls}`}>
                <span className={`h-1.5 w-1.5 rounded-[2px] ${dotColor}`} />
                {remaining}
              </span>
            </div>
          );
        })()}

        {/* Footer / Buttons */}
        <div className="flex items-center justify-between gap-3.5">
          <Link href={`/core/events/edit/${event.id}`}
            className="flex-1 h-9.5 bg-[#232F3E] hover:bg-[#1a232f] text-white font-semibold text-[12.5px] rounded-[6px] transition-all duration-200 text-decoration-none flex items-center justify-center gap-1.5 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98]">
            <Edit className="h-4 w-4" />
            <span>Edit Event</span>
          </Link>
          
          <Link href={`/core/registrations?eventId=${event.id}`}
            className="group flex-1 h-9.5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 font-semibold text-[12.5px] rounded-[6px] transition-all duration-200 text-decoration-none flex items-center justify-center gap-1.5 shadow-sm hover:shadow active:scale-[0.98]">
            <Users className="h-4 w-4 text-slate-500 group-hover:scale-105 transition-transform" />
            <span>Registrations</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default function DashboardPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: eventsData, isLoading: eventsLoading } = useEvents({
    limit: 3,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const recentEvents = Array.isArray(eventsData) ? eventsData : (eventsData?.data ?? []);

  const deleteEventMutation = useDeleteEvent();
  const archiveMutation = useMutation({ mutationFn: (id: string) => api.archiveEvent(id), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events'] }) });
  const publishMutation = useMutation({ mutationFn: (id: string) => api.publishEvent(id), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events'] }) });
  const closeRegistrationMutation = useMutation({ mutationFn: (id: string) => api.closeRegistration(id), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events'] }) });
  const completeMutation = useMutation({ mutationFn: (id: string) => api.updateEvent(id, { status: 'COMPLETED' }), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events'] }) });

  const revertMutation = useMutation({ mutationFn: (id: string) => api.updateEvent(id, { status: 'REGISTRATION_OPEN' }), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events'] }) });

  const handleAction = useCallback((action: string, eventId: string) => {
    switch (action) {
      case 'edit': router.push(`/core/events/edit/${eventId}`); break;
      case 'publish':
        if (window.confirm('Are you sure you want to publish this event? It will be visible to attendees.')) publishMutation.mutate(eventId);
        break;
      case 'archive':
        if (window.confirm('Are you sure you want to archive this event?')) archiveMutation.mutate(eventId);
        break;
      case 'closeRegistration':
        if (window.confirm('Are you sure you want to close registration for this event? No new registrations will be accepted.')) closeRegistrationMutation.mutate(eventId);
        break;
      case 'complete':
        if (window.confirm('Are you sure you want to mark this event as completed?')) completeMutation.mutate(eventId);
        break;
      case 'revert':
        if (window.confirm('Revert this event back to Ongoing (Registration Open) status?')) revertMutation.mutate(eventId);
        break;
      case 'delete':
        if (window.confirm('Are you sure you want to delete this event?')) deleteEventMutation.mutate(eventId);
        break;
    }
  }, [router, publishMutation, archiveMutation, closeRegistrationMutation, deleteEventMutation, completeMutation, revertMutation]);

  const adminActions = [
    { label: 'Manage Homepage', href: '/core/manage-homepage', icon: Home, color: 'text-orange-500 bg-orange-50/60 border border-orange-100/50' },
    { label: 'Scanner Panel', href: '/core/attendance', icon: UserCheck, color: 'text-indigo-600 bg-indigo-50 border border-indigo-100' },
    { label: 'Generate Report', href: '/core/analytics', icon: BarChart3, color: 'text-teal-600 bg-teal-50 border border-teal-100' },
  ];

  return (
    <div
      className="w-full min-h-screen relative"
      style={{
        backgroundImage: "linear-gradient(rgba(255,255,255,0.55), rgba(255,255,255,0.55)), url('/images/aws_tech_doodle_bg.png')",
        backgroundSize: "300px 300px",
        backgroundRepeat: "repeat",
        backgroundColor: "#f8fafc",
      }}
    >
      <div className="w-full max-w-7xl mx-auto p-4 sm:p-5 lg:p-6 flex flex-col gap-4 relative z-10">
        
        {/* Welcome Hero Banner */}
        <CoreHeroBanner />

        {/* Shortcuts strip / Console Utilities */}
        <div className="w-full py-3 px-4 sm:px-5 rounded-xl border border-slate-200 bg-white shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-50 to-orange-50 border border-[#FF9900]/25 text-[#FF9900] flex items-center justify-center shadow-2xs">
                <Sliders className="h-4 w-4" />
              </div>
              <div className="flex flex-col gap-0.5" style={{ fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
                <h3 className="text-[11.5px] font-bold text-slate-800 uppercase tracking-[0.06em] leading-none m-0">
                  Console Utilities
                </h3>
                <p className="text-[10.5px] text-slate-500 font-normal leading-none m-0">
                  Quick administrative action shortcuts
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2 w-full md:w-auto">
              {adminActions.map((action) => (
                <Link key={action.label} href={action.href} className="w-full sm:w-auto inline-flex">
                  <motion.button
                    whileHover={{ scale: 1.01, y: -0.5 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full sm:w-auto h-8.5 inline-flex items-center justify-between sm:justify-start gap-2 px-3 rounded-lg border border-slate-200 bg-slate-50/80 hover:bg-white shadow-2xs hover:border-[#FF9900]/40 hover:shadow-xs text-xs font-semibold text-slate-700 transition-all duration-150 cursor-pointer group"
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 flex items-center justify-center rounded-[5px] border ${action.color}`}>
                        <action.icon className="h-3.5 w-3.5" />
                      </div>
                      <span>{action.label}</span>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-[#FF9900] group-hover:translate-x-0.5 transition-transform duration-150 shrink-0" />
                  </motion.button>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Events Section */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-amber-50 to-orange-50 border border-[#FF9900]/20 text-[#FF9900] shadow-2xs shrink-0">
                <Calendar className="w-4 h-4 text-brand-orange" />
              </span>
              <div className="flex flex-col">
                <h2 className="text-base sm:text-[17px] font-semibold text-slate-800 tracking-tight leading-tight m-0">
                  Recent Events
                </h2>
                <p className="text-slate-500 text-[11px] font-normal mt-0.5">
                  Overview of your most recently managed community activities.
                </p>
              </div>
            </div>
            
            <Link href="/core/events" className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 h-8 px-3 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 hover:text-slate-900 rounded-lg text-xs font-semibold transition-all shadow-2xs group">
              <span>View All Events</span>
              <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-all" />
            </Link>
          </div>

          {eventsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <RecentEventSkeleton key={i} />
              ))}
            </div>
          ) : recentEvents.length === 0 ? (
            <GlassCard hoverEffect={false} className="border border-slate-200 py-8 text-center w-full bg-white rounded-xl shadow-xs">
              <Calendar className="h-7 w-7 text-slate-300 mx-auto mb-2 animate-pulse" />
              <h3 className="text-sm font-semibold text-slate-800 mb-1 font-display">No events found</h3>
              <p className="text-xs text-slate-500 mb-4 max-w-xs mx-auto">Get started by creating your first community event.</p>
              <Link href="/core/events/create">
                <button className="bg-brand-orange text-white rounded-lg text-xs font-semibold px-4 py-2 hover:bg-brand-orange/90 transition shadow-xs cursor-pointer">
                  Create Event
                </button>
              </Link>
            </GlassCard>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentEvents.map((event) => (
                <RecentEventCard key={event.id} event={event} onAction={handleAction} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
