"use client";

import React from "react";
import Link from "next/link";
import { Calendar, Clock, MapPin, ArrowRight } from "lucide-react";
import GlassCard from "./GlassCard";
import { useEvents } from "@/modules/cloud-enthusiasts/shared/hooks/useCloudEnthusiasts";
import { getPosterSrcAndPosition } from "@/lib/utils";

export default function UpcomingEvent() {
  const { data: realEvents = [], isLoading } = useEvents();

  // Pick the next upcoming event (earliest date >= today)
  const today = new Date();
  const upcoming = realEvents
    .map(e => ({ ...e, _date: new Date(e.start_datetime) }))
    .filter(e => e._date >= today)
    .sort((a, b) => a._date.getTime() - b._date.getTime());

  const event = upcoming.length > 0 ? upcoming[0] : null;

  if (isLoading) {
    return (
      <GlassCard className="flex flex-col items-center justify-center text-center p-12 min-h-[300px]">
        <div className="w-10 h-10 border-4 border-brand-orange border-t-transparent rounded-full animate-spin mb-4" />
        <h3 className="text-lg font-medium text-foreground font-display">Loading Events...</h3>
      </GlassCard>
    );
  }

  if (!event) {
    return (
      <GlassCard style={{ background: "linear-gradient(135deg, rgba(255, 153, 0, 0.1), rgba(35, 47, 62, 0.06))" }} className="flex flex-col items-center justify-center text-center p-12 min-h-[300px]">
        <div className="w-16 h-16 rounded-full bg-brand-blue/10 flex items-center justify-center mb-4 text-brand-blue">
          <Calendar className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-medium text-foreground font-display">No Upcoming Events</h3>
        <p className="text-sm text-foreground/50 mt-1.5 max-w-xs">
          Check back later for new workshops, meetups, and conferences.
        </p>
      </GlassCard>
    );
  }

  return (
    <GlassCard
      className="p-0 overflow-hidden flex flex-col lg:flex-row h-full border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] rounded-2xl bg-white"
      hoverEffect={false}
      style={{
        background: "white"
      }}
    >
      {/* Poster */}
      {(() => {
        const { src: imgPosterSrc, position: imgPosterPosition } = getPosterSrcAndPosition(event.banner_url);
        return (
          <div className="relative w-full lg:w-[40%] aspect-[4/5] lg:h-full lg:max-h-[340px] overflow-hidden bg-slate-50 rounded-t-2xl lg:rounded-tr-none lg:rounded-l-2xl lg:rounded-br-none">
            <img
              src={imgPosterSrc}
              alt={event.title}
              className="w-full h-full object-cover transition-transform duration-750 hover:scale-103 rounded-t-2xl lg:rounded-tr-none lg:rounded-l-2xl lg:rounded-br-none"
              style={{ objectPosition: imgPosterPosition }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            <div className="absolute top-3 left-3 z-10">
              <span className="inline-flex items-center px-2.5 py-1 rounded-[4px] bg-[#232F3E] text-white text-[10px] font-bold uppercase tracking-wider shadow-sm">
                Upcoming Event
              </span>
            </div>
          </div>
        );
      })()}

      {/* Content */}
      <div className="p-6 md:p-8 flex flex-col flex-1 justify-between bg-transparent min-w-0 h-full">
        {/* Top Badges Row */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-orange bg-orange-50 px-2 py-0.5 rounded-md">
              {event.category || "EVENT"}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md">
              {event.mode || "OFFLINE"}
            </span>
          </div>
          {event.registration_deadline && (
            <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-md flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
              Closes {new Date(event.registration_deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          )}
        </div>

        <div className="space-y-1.5">
          <h3 className="text-xl md:text-2xl font-extrabold text-slate-800 tracking-tight leading-snug">
            {event.title}
          </h3>
          <p className="text-[13px] leading-relaxed text-slate-500 font-medium line-clamp-2">
            {event.short_description}
          </p>
        </div>

        {/* Live Registration Progress Bar */}
        {event.max_capacity && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] font-semibold text-slate-450">
              <span className="text-slate-400">Registration Space</span>
              <span className="text-slate-650 font-bold">{event.registered || 0} / {event.max_capacity} filled</span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 to-[#FF9900] transition-all duration-500 rounded-full" 
                style={{ width: `${Math.min(100, Math.max(5, ((event.registered || 0) / event.max_capacity) * 100))}%` }}
              />
            </div>
          </div>
        )}

        {/* Quick Stats Divider Grid */}
        <div className="grid grid-cols-2 gap-4 py-3.5 border-t border-b border-slate-100/80">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Seats Available</span>
            <span className="text-sm font-extrabold text-slate-700 mt-0.5">
              {event.max_capacity ? `${event.max_capacity - (event.registered || 0)} left` : "Open"}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Participation Reward</span>
            <span className="text-sm font-extrabold text-brand-orange mt-0.5 flex items-center gap-0.5">
              +150 XP
            </span>
          </div>
        </div>

        {/* Details Pill List */}
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-100/85 text-[11px] font-semibold text-slate-600">
            <Calendar className="w-3.5 h-3.5 text-[#FF9900]" />
            <span>{event._date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-100/85 text-[11px] font-semibold text-slate-600">
            <Clock className="w-3.5 h-3.5 text-[#FF9900]" />
            <span>{event._date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-100/85 text-[11px] font-semibold text-slate-600 max-w-full">
            <MapPin className="w-3.5 h-3.5 text-[#FF9900] flex-shrink-0" />
            <span className="truncate">{event.venue}</span>
          </div>
        </div>

        {/* Register CTA */}
        <div className="pt-2">
          <Link
            href={`/events/${event.event_id}`}
            className="group inline-flex items-center justify-center px-6 py-2.5 rounded-full font-bold text-xs tracking-wider text-white transition-all duration-200 bg-[#FF9900] hover:bg-[#FFA524] shadow-md shadow-orange-500/10 hover:shadow-lg hover:shadow-orange-500/20 gap-1.5"
          >
            <span>Register Now</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </GlassCard>
  );
}

