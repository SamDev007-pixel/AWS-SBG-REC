"use client";

import HeroBanner from "@/components/dashboard/crew/HeroBanner";
import CalendarCard from "@/components/dashboard/crew/CalendarCard";
import RoadmapProgress from "@/components/dashboard/crew/RoadmapProgress";
import Announcements from "@/components/dashboard/crew/Announcements";
import StatsCard from "@/components/StatsCard";
import { workAssignments, attendanceRecords } from "@/lib/data/crewMockData";

import AWSSidebarIcon from "@/components/AWSSidebarIcon";

function WorkAssignmentsIcon({ className }: { className?: string }) {
  return <img src="/aws-DevOpsGuru.svg" alt="AWS DevOps Guru" className={className || "w-14 h-14 sm:w-16 sm:h-16"} />;
}

function AttendanceIcon({ className }: { className?: string }) {
  return <img src="/aws-TrustedAdvisor.svg" alt="AWS Trusted Advisor" className={className || "w-14 h-14 sm:w-16 sm:h-16"} />;
}

export default function CrewDashboardPage() {
  const pendingWork = workAssignments.filter((w) => w.status !== "approved").length;
  const presentCount = attendanceRecords.filter((r) => r.status === "present").length;
  const attendanceRate = attendanceRecords.length > 0 
    ? Math.round((presentCount / attendanceRecords.length) * 100) 
    : 0;

  return (
    <div
      className="w-full min-h-full lg:h-screen lg:max-h-screen p-4 sm:p-5 lg:p-6 relative overflow-y-auto lg:overflow-hidden flex flex-col justify-between select-none gap-4"
      style={{
        backgroundImage: "linear-gradient(rgba(255,255,255,0.55), rgba(255,255,255,0.55)), url('/images/aws_tech_doodle_bg.png')",
        backgroundSize: "300px 300px",
        backgroundRepeat: "repeat",
        backgroundColor: "#f8fafc",
      }}
    >
      <div className="relative z-10 flex flex-col flex-1 gap-4 w-full justify-between">
        {/* Section 1 — Hero Banner */}
        <div className="flex-shrink-0">
          <HeroBanner />
        </div>
        
        {/* Section 2 — Stats Row: Work Assignments + Attendance + Calendar */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-shrink-0">
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
          />
          <CalendarCard />
        </section>

        {/* Section 3 — Two column: Roadmap + Announcements */}
        <section id="events" className="grid grid-cols-1 lg:grid-cols-10 gap-4 items-stretch flex-1 min-h-0">
          <div className="lg:col-span-6 flex flex-col h-full min-h-0">
            <div 
              className="flex flex-col flex-1 h-full min-h-0 rounded-xl border border-slate-200 p-5 overflow-hidden justify-between shadow-xs bg-white"
            >
              <RoadmapProgress />
            </div>
          </div>
          <div className="lg:col-span-4 flex flex-col h-full min-h-0">
            <div className="flex flex-col flex-1 h-full min-h-0">
              <Announcements />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
