"use client";

import HeroBanner from "@/components/dashboard/crew/HeroBanner";
import CalendarCard from "@/components/dashboard/crew/CalendarCard";
import RoadmapProgress from "@/components/dashboard/crew/RoadmapProgress";
import Announcements from "@/components/dashboard/crew/Announcements";
import StatsCard from "@/components/StatsCard";
import { workAssignments, attendanceRecords } from "@/lib/data/crewMockData";

function WorkAssignmentsIcon({ className }: { className?: string }) {
  return (
    <img src="/aws-DevOpsGuru.svg" alt="Work Assignments" className={className} />
  );
}

function AttendanceIcon({ className }: { className?: string }) {
  return (
    <img src="/aws-FirewallManager.svg" alt="Attendance" className={`${className} scale-[1.12]`} />
  );
}

export default function CrewDashboardPage() {
  const pendingWork = workAssignments.filter((w) => w.status !== "approved").length;
  const presentCount = attendanceRecords.filter((r) => r.status === "present").length;
  const attendanceRate = attendanceRecords.length > 0 
    ? Math.round((presentCount / attendanceRecords.length) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-[#FFFFFF] pt-4 md:pt-6 pb-12 relative overflow-hidden">
      <div className="relative z-10 space-y-6 px-4 md:px-5">
        {/* Section 1 — Hero Banner */}
        <HeroBanner />
        
        {/* Section 2 — Stats Row: Work Assignments + Attendance + Calendar */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
          <StatsCard
            label="Work Assignments"
            value={pendingWork}
            subtext="Pending Tasks"
            icon={WorkAssignmentsIcon}
            iconClass="text-brand-orange"
            iconBgClass="bg-brand-orange/10"
            bareIcon
            iconLabel="Work Assignments"
            href="/crew/tasks"
            style={{ background: "rgba(255, 255, 255, 0.75)" }}
          />
          <StatsCard
            label="My Attendance"
            value={`${attendanceRate}%`}
            subtext={`${presentCount} Present`}
            icon={AttendanceIcon}
            iconClass="text-emerald-600"
            iconBgClass="bg-emerald-50"
            bareIcon
            iconLabel="Attendance"
            href="/crew/attendance"
            style={{ background: "rgba(255, 255, 255, 0.75)" }}
          />
          <CalendarCard />
        </section>

        {/* Section 3 — Two column: Roadmap + Announcements */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 md:gap-8 items-stretch">
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
          <div className="lg:col-span-4 flex flex-col">
            <div className="flex flex-col flex-1">
              <Announcements />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
