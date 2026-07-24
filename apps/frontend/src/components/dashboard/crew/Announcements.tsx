"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Bell, ArrowUpRight, Calendar } from "lucide-react";
import Link from "next/link";
import { useAnnouncements } from "@/lib/hooks";
import { cn } from "@/lib/utils";

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
      className="flex flex-col h-full rounded-[22px] p-5 overflow-hidden select-none min-h-[400px] border border-amber-500/20 shadow-[0_8px_30px_rgba(255,153,0,0.04)] bg-gradient-to-br from-amber-500/5 to-orange-500/10"
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
          <Link href="/crew/announcements" className="hover:underline select-none">
            <h3 
              className="text-[16px] font-bold text-slate-800 tracking-tight flex items-center gap-1.5"
              style={{ fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}
            >
              Announcements
              <ArrowUpRight className="w-4 h-4 text-slate-400 hover:text-[#FF9900] transition-colors" />
            </h3>
          </Link>
        </div>
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider bg-slate-50 border border-slate-200/50 px-2 py-0.5 rounded-[4px]">
          {announcements.length} {announcements.length === 1 ? "update" : "updates"}
        </span>
      </div>

      {/* Content Area */}
      {isLoading ? (
        <div className="flex-1 space-y-3.5 pr-1 max-h-[320px] overflow-y-auto">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-4 rounded-xl border border-slate-100 bg-white/40 animate-pulse relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <div className="h-4.5 w-16 bg-slate-200 rounded" />
                <div className="h-3.5 w-20 bg-slate-200 rounded" />
              </div>
              <div className="h-4.5 w-3/4 bg-slate-200 rounded mb-2" />
              <div className="h-3.5 w-full bg-slate-200 rounded" />
            </div>
          ))}
        </div>
      ) : announcements.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
          <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 mb-3.5 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
            <Bell className="w-5 h-5 text-slate-400" />
          </div>

          <h4 
            className="text-[14px] font-bold text-slate-700 tracking-tight"
            style={{ fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}
          >
            No Announcements Yet
          </h4>
          <p 
            className="text-xs text-slate-400 mt-1 max-w-[220px] leading-relaxed font-medium"
            style={{ fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}
          >
            Watch this space for updates. When a new announcement is posted, it will appear here.
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto pr-1 max-h-[320px] custom-scrollbar space-y-3.5">
          {announcements.map((ann) => (
            <Link
              href="/crew/announcements"
              key={ann.id}
              className="block group p-4 rounded-2xl transition-all border border-slate-100 bg-white/70 hover:bg-white hover:border-[#FF9900]/25 hover:shadow-[0_12px_24px_-8px_rgba(0,0,0,0.04)] cursor-pointer"
            >
              <div className="flex items-center justify-between gap-2 mb-2.5 flex-wrap">
                <span className={cn("inline-block rounded-md px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider border-none", typeBadge(ann.type))}>
                  {typeLabel(ann.type)}
                </span>
                <span className="text-[10px] text-slate-400 font-semibold">
                  {formatDate(ann.createdAt)}
                </span>
              </div>

              <h4 
                className="text-[13.5px] font-bold text-slate-800 group-hover:text-[#FF9900] transition-colors flex items-center gap-1 leading-tight group-hover:translate-x-0.5 transition-transform duration-200"
                style={{ fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}
              >
                <span>{ann.title}</span>
                <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200 text-[#FF9900]" />
              </h4>

              <p 
                className="text-[11.5px] text-slate-500 leading-relaxed mt-2.5 whitespace-pre-line font-medium"
                style={{ fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}
              >
                {ann.message}
              </p>
            </Link>
          ))}
        </div>
      )}
    </motion.div>
  );
}
