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

import AWSSidebarIcon from "@/components/AWSSidebarIcon";

function AwsPointsIcon({ className }: { className?: string }) {
  return <img src="/aws-DevOpsGuru.svg" alt="AWS DevOps Guru" className={className || "w-12 h-12 sm:w-14 sm:h-14"} />;
}

function AwsEventsAttendedIcon({ className }: { className?: string }) {
  return <img src="/aws-EventBridge.svg" alt="AWS EventBridge" className={className || "w-12 h-12 sm:w-14 sm:h-14"} />;
}

export default function Home() {
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const { data: tickets = [] } = useTickets();
  const { data: events = [] } = useEvents();
  const { data: leaderboardMe } = useLeaderboardMe();

  const today = new Date();
  const upcomingCount = events.filter(e => new Date(e.start_datetime) >= today).length;
  return (
    <div className="w-full min-h-full lg:h-screen lg:max-h-screen bg-white p-4 sm:p-5 lg:p-6 relative overflow-y-auto lg:overflow-hidden flex flex-col justify-between select-none gap-4">

      <div className="relative z-10 flex flex-col flex-1 gap-4 w-full justify-between">
        {/* 1. Welcome Hero Banner */}
        <div className="flex-shrink-0">
          <DynamicHeroBanner onViewLeaderboardClick={() => setLeaderboardOpen(true)} />
        </div>

        {/* 2. Statistics Section (3 columns) */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-shrink-0">
          <StatsCard
            label="Points"
            value={leaderboardMe ? leaderboardMe.cloudCredits.toString() : "—"}
            subtext={leaderboardMe?.rank ? `Rank #${leaderboardMe.rank} on Leaderboard` : "Rank on Leaderboard"}
            icon={AwsPointsIcon}
            iconClass="text-slate-900"
            bareIcon
            iconLabel="Leaderboard Points"
            onClick={() => setLeaderboardOpen(true)}
            delay={0.1}
          />
          <StatsCard
            label="Events Attended"
            value={tickets.length.toString()}
            subtext={`${upcomingCount} Upcoming Community Events`}
            icon={AwsEventsAttendedIcon}
            iconClass="text-slate-900"
            bareIcon
            iconLabel="Events Attended"
            href="/events"
            delay={0.1}
          />
          <DynamicCalendarCard />
        </section>

        {/* 3. Content Section (Roadmap Progress | Announcements) */}
        <section id="events" className="grid grid-cols-1 lg:grid-cols-10 gap-4 items-stretch flex-1 min-h-0">
          {/* Left Side: Roadmap Progress (60%) */}
          <div className="lg:col-span-6 flex flex-col h-full min-h-0">
            <div 
              className="flex flex-col flex-1 h-full min-h-0 rounded-xl border border-slate-200 p-5 overflow-hidden justify-between shadow-xs"
              style={{
                backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.65), rgba(255, 255, 255, 0.65)), url('/images/aws_tech_doodle_bg.png')",
                backgroundSize: "300px 300px",
                backgroundRepeat: "repeat",
              }}
            >
              <RoadmapProgress />
            </div>
          </div>

          {/* Right Side: Announcements (40%) */}
          <div className="lg:col-span-4 flex flex-col h-full min-h-0">
            <div className="flex-1 h-full min-h-0">
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
