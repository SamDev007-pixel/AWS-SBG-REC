"use client";

import React, { useState } from "react";
import StatsCard from "@/components/StatsCard";
import RoadmapProgress from "@/components/dashboard/crew/RoadmapProgress";
import Announcements from "@/components/Announcements";
import LeaderboardModal from "@/components/leaderboard/LeaderboardModal";
import { useTickets, useEvents, useLeaderboardMe } from "@/modules/cloud-enthusiasts/shared/hooks/useCloudEnthusiasts";
import {
  DynamicHeroBanner,
  DynamicCalendarCard,
} from "@/components/dynamic";

function AwsFirewallManagerIcon({ className }: { className?: string }) {
  return (
    <img
      src="/aws-FirewallManager.svg"
      alt="AWS Firewall Manager"
      className={`${className} scale-[1.12]`}
    />
  );
}

function AwsTrustedAdvisorIcon({ className }: { className?: string }) {
  return (
    <img
      src="/aws-TrustedAdvisor.svg"
      alt="AWS Trusted Advisor"
      className={className}
    />
  );
}

export default function Home() {
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const { data: tickets = [] } = useTickets();
  const { data: events = [] } = useEvents();
  const { data: leaderboardMe } = useLeaderboardMe();

  const today = new Date();
  const upcomingCount = events.filter(e => new Date(e.start_datetime) >= today).length;
  return (
    <div style={{ minHeight: '100vh', background: '#FFFFFF', paddingTop: '12px', paddingBottom: '48px', position: 'relative', overflow: 'hidden' }}>
      {/* Glow effect blobs to shine through glassmorphic cards */}
      <div className="absolute top-[20%] left-[10%] w-48 h-48 bg-[#232F3E]/8 rounded-full blur-[80px] pointer-events-none z-0" />
      <div className="absolute top-[60%] right-[15%] w-56 h-56 bg-[#FF9900]/12 rounded-full blur-[85px] pointer-events-none z-0" />

      <div className="relative z-10 px-4 md:px-5 space-y-6 w-full">
        {/* 1. Welcome Hero Banner */}
        <DynamicHeroBanner onViewLeaderboardClick={() => setLeaderboardOpen(true)} />

          {/* 2. Statistics Section (3 columns) */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
            <StatsCard
              label="Points"
              value={leaderboardMe ? leaderboardMe.cloudCredits.toString() : "—"}
              subtext={leaderboardMe?.rank ? `Rank #${leaderboardMe.rank} on Leaderboard` : "Rank on Leaderboard"}
              icon={AwsTrustedAdvisorIcon}
              iconClass="text-600"
              bareIcon
              iconLabel="Trusted Advisor"
              onClick={() => setLeaderboardOpen(true)}
              delay={0.1}
              style={{ background: "rgba(255, 255, 255, 0.75)" }}
            />
            <StatsCard
              label="Events Attended"
              value={tickets.length.toString()}
              subtext={`${upcomingCount} Upcoming Community Events`}
              icon={AwsFirewallManagerIcon}
              iconClass="text-600"
              bareIcon
              iconLabel="Firewall Manager"
              href="/events"
              delay={0.1}
              style={{ background: "rgba(255, 255, 255, 0.75)" }}
            />
            <DynamicCalendarCard />
          </section>

          {/* 3. Content Section (Upcoming Event | Announcements) */}
          <section id="events" className="grid grid-cols-1 lg:grid-cols-10 gap-4 md:gap-5 items-stretch">
            {/* Left Side: Roadmap Progress (60%) */}
            <div className="lg:col-span-6 flex flex-col">
              <div
                className="flex flex-col flex-1 min-h-[400px] rounded-[22px] p-6 border border-slate-100/70 shadow-[0_4px_20px_rgba(0,0,0,0.02)] transition-all hover:shadow-[0_8px_30px_rgba(35,47,62,0.05)] overflow-hidden"
                style={{ 
                  background: "linear-gradient(135deg, rgba(255, 255, 255, 0.68) 0%, rgba(255, 255, 255, 0.75) 100%), url('/assets/roadmap_bg.png') center/cover no-repeat"
                }}
              >
                <RoadmapProgress />
              </div>
            </div>

            {/* Right Side: Announcements (40%) */}
            <div className="lg:col-span-4 flex flex-col">
              <div className="flex-1">
                <Announcements />
              </div>
            </div>
          </section>
      </div>
      {leaderboardOpen && (
        <LeaderboardModal
          isOpen={leaderboardOpen}
          onClose={() => setLeaderboardOpen(false)}
          token={typeof window !== "undefined" ? localStorage.getItem("accessToken") : null}
        />
      )}
    </div>
  );
}
