"use client";

import React from "react";
import { motion } from "framer-motion";
import { Bell, Calendar, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SampleAnnouncement {
  id: string;
  title: string;
  message: string;
  type: "UPDATE" | "REMINDER" | "SCHEDULE_CHANGE" | "INFO" | "URGENT";
  createdAt: string;
}

const SAMPLE_ANNOUNCEMENTS: SampleAnnouncement[] = [
  {
    id: "sample-1",
    title: "AWS Cloud Day 2026 Registration Open",
    message: "Join us for our annual flagship event featuring hands-on labs, expert speaker sessions, and networking opportunities. RSVP today to secure your entry pass!",
    type: "UPDATE",
    createdAt: "2026-07-12T10:00:00Z",
  },
  {
    id: "sample-2",
    title: "Weekly Hands-on Lab Session: Serverless on AWS",
    message: "Get ready to build! This week we are diving deep into AWS Lambda, API Gateway, and DynamoDB. Bring your laptops and pre-configured AWS Sandbox accounts.",
    type: "SCHEDULE_CHANGE",
    createdAt: "2026-07-10T14:30:00Z",
  },
  {
    id: "sample-3",
    title: "AWS Certifications Bootcamp Starting Soon",
    message: "Kickstart your Cloud Practitioner or Solutions Architect Associate journey. Weekly study groups, mock exams, and voucher eligibility trackers are now active.",
    type: "REMINDER",
    createdAt: "2026-07-08T09:15:00Z",
  },
  {
    id: "sample-4",
    title: "Community Mentorship Program Cohort 3",
    message: "Applications for mentors and mentees are now open. Get paired with senior AWS engineers and work on real-world capstone projects. Apply before the deadline.",
    type: "INFO",
    createdAt: "2026-07-05T11:00:00Z",
  },
];

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function typeBadge(type: string) {
  const map: Record<string, string> = {
    UPDATE: "bg-blue-50 text-blue-600 border-none",
    REMINDER: "bg-amber-50 text-amber-600 border-none",
    SCHEDULE_CHANGE: "bg-rose-50 text-rose-600 border-none",
    URGENT: "bg-red-50 text-red-600 border-none",
    INFO: "bg-emerald-50 text-emerald-600 border-none",
  };
  return map[type] || "bg-slate-50 text-slate-650 border-none";
}

export default function AnnouncementsSection() {
  return (
    <section id="announcements" className="py-20 bg-white relative overflow-hidden select-none border-t border-slate-50">
      {/* Decorative gradient blur in background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-br from-amber-200/10 to-orange-200/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span 
            className="text-xs font-bold uppercase tracking-widest text-[#FF9900] bg-amber-50 px-3 py-1 rounded-full border border-amber-100"
            style={{ fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}
          >
            Stay Informed
          </span>
          <h2 
            className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight mt-4 font-display"
            style={{ fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}
          >
            Latest Announcements
          </h2>
          <p 
            className="text-slate-500 mt-3 font-medium text-[15px]"
            style={{ fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}
          >
            Get the latest updates, event schedules, reminders, and news from our AWS Student Community.
          </p>
        </div>

        {/* 2x2 Announcements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {SAMPLE_ANNOUNCEMENTS.map((ann, i) => (
            <motion.div
              key={ann.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              className="group p-6 rounded-2xl transition-all border border-slate-100 bg-white/70 hover:bg-white hover:border-[#FF9900]/25 hover:shadow-[0_12px_24px_-8px_rgba(0,0,0,0.04)] cursor-pointer"
            >
              <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
                <span className={cn("inline-block rounded-md px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider border-none", typeBadge(ann.type))}>
                  {ann.type.replace(/_/g, " ")}
                </span>
                <span className="text-[11px] text-slate-450 font-semibold">
                  {formatDate(ann.createdAt)}
                </span>
              </div>

              <h3 
                className="text-[16px] font-bold text-slate-800 group-hover:text-[#FF9900] transition-colors flex items-center gap-1 leading-snug group-hover:translate-x-0.5 transition-transform duration-200"
                style={{ fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}
              >
                <span>{ann.title}</span>
                <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200 text-[#FF9900]" />
              </h3>

              <p 
                className="text-[12.5px] text-slate-500 leading-relaxed mt-2.5 whitespace-pre-line font-medium"
                style={{ fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}
              >
                {ann.message}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
