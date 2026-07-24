"use client";

import React, { useState } from "react";
import GlassCard from "./GlassCard";
import { Bell, Calendar, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAnnouncements } from "@/lib/hooks";
import { motion } from "framer-motion";

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function typeBadge(type: string) {
  const map: Record<string, string> = {
    UPDATE: 'bg-blue-50 text-blue-700 border-blue-200/50',
    REMINDER: 'bg-amber-50 text-amber-700 border-amber-200/50',
    SCHEDULE_CHANGE: 'bg-rose-50 text-rose-700 border-rose-200/50',
    URGENT: 'bg-red-50 text-red-700 border-red-200/50',
    INFO: 'bg-emerald-50 text-emerald-700 border-emerald-200/50',
  };
  return map[type] || 'bg-slate-50 text-slate-700 border-slate-200/50';
}

function typeLeftBar(type: string) {
  const map: Record<string, string> = {
    UPDATE: 'bg-blue-500',
    REMINDER: 'bg-amber-500',
    SCHEDULE_CHANGE: 'bg-rose-500',
    URGENT: 'bg-red-500',
    INFO: 'bg-emerald-500',
  };
  return map[type] || 'bg-slate-400';
}

function typeLabel(type: string) {
  return type.replace(/_/g, ' ');
}

export default function Announcements() {
  const { data: announcements = [], isLoading } = useAnnouncements();
  const [headerHovered, setHeaderHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col h-full rounded-[22px] p-5 overflow-hidden select-none min-h-[400px] border border-amber-500/20 shadow-[0_8px_30px_rgba(255,153,0,0.04)]"
      style={{
        background: "linear-gradient(135deg, rgba(255, 248, 240, 0.95) 0%, rgba(255, 243, 228, 0.85) 50%, rgba(255, 248, 240, 0.95) 100%)"
      }}
    >
      {/* Panel Header */}
      <div 
        className="flex items-center justify-between pb-3.5 border-b border-slate-100/80 mb-4 flex-shrink-0"
        onMouseEnter={() => setHeaderHovered(true)}
        onMouseLeave={() => setHeaderHovered(false)}
      >
        <div className="flex items-center gap-2.5">
          <motion.div 
            animate={headerHovered ? { rotate: [0, -15, 15, -10, 10, 0] } : {}}
            transition={{ duration: 0.5 }}
            className="w-8.5 h-8.5 rounded-lg bg-gradient-to-br from-amber-50 to-orange-50 border border-[#FF9900]/25 flex items-center justify-center text-[#FF9900]"
          >
            <Bell className="w-4 h-4" />
          </motion.div>
          <div>
            <h3 
              className="font-bold text-[14.5px] text-slate-800 tracking-tight leading-none"
              style={{ fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}
            >
              Community Announcements
            </h3>
          </div>
        </div>

        <span className="inline-flex items-center justify-center bg-slate-100/80 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
          {announcements.length} {announcements.length === 1 ? 'Update' : 'Updates'}
        </span>
      </div>

      {/* Body Content */}
      {isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-2 py-12">
          <div className="w-6 h-6 border-2 border-[#FF9900] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-400 font-medium">Loading updates...</span>
        </div>
      ) : announcements.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-10 text-center px-4">
          <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mb-3">
            <Bell className="w-5 h-5 text-slate-400" />
          </div>
          <h4 
            className="font-bold text-sm text-slate-700 mb-1"
            style={{ fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}
          >
            No Announcements Yet
          </h4>
          <p 
            className="text-xs text-slate-500 max-w-[240px] leading-relaxed"
            style={{ fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}
          >
            Stay tuned! When the core team publishes updates or reminders, they will appear here in real-time.
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 custom-scrollbar">
          {announcements.map((ann) => (
            <div
              key={ann.id}
              className="relative p-4 rounded-xl bg-white/90 border border-slate-100/90 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:border-slate-200 transition-all group overflow-hidden"
            >
              <div className={cn("absolute left-0 top-0 bottom-0 w-1 rounded-l-xl", typeLeftBar(ann.type))} />

              <div className="flex items-start justify-between gap-2 pl-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider", typeBadge(ann.type))}>
                    {typeLabel(ann.type)}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                    <Calendar size={11} />
                    <span>{formatDate(ann.createdAt)}</span>
                  </div>
                </div>
              </div>

              <h4 
                className="font-bold text-[13px] text-slate-800 mt-2 pl-1.5 leading-snug group-hover:text-[#FF9900] transition-colors"
                style={{ fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}
              >
                {ann.title}
              </h4>

              <p 
                className="text-[11.5px] text-slate-500 leading-relaxed mt-2.5 whitespace-pre-line font-medium"
                style={{ fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}
              >
                {ann.message}
              </p>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
