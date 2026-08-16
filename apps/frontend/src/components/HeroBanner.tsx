"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Trophy, Sparkles } from "lucide-react";
import Link from "next/link";

interface HeroBannerProps {
  onViewLeaderboardClick?: () => void;
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

import AWSSidebarIcon from "@/components/AWSSidebarIcon";

export default function HeroBanner({ onViewLeaderboardClick }: HeroBannerProps = {}) {
  const [greeting, setGreeting] = useState("Hello");
  const [hoveredIcon, setHoveredIcon] = useState<string | null>(null);
  const [userName, setUserName] = useState("Attendee");

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
        let nameToFormat = "Attendee";
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

      {/* Welcome banner with solid white card background */}
      <div className="relative w-full rounded-xl border border-slate-200 bg-white p-4 sm:p-5 overflow-hidden z-10 shadow-xs">
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
              className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-orange-50/90 border border-orange-200 text-orange-900 text-[11.5px] font-semibold mb-3 shadow-2xs"
            >
              <img src="/sbg_logo.svg" alt="AWS SBG Logo" className="w-4 h-4 object-contain shrink-0" />
              <span>AWS Student Builders Group REC</span>
            </motion.div>

            <h1 
              className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mb-1.5 leading-tight"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              {greeting}, <span className="capitalize">{userName}</span>!
            </h1>

            <p 
              className="text-xs sm:text-[13.5px] text-slate-600 font-normal leading-relaxed max-w-xl mb-4 text-left"
              style={{ fontFamily: "'Amazon Ember', 'Open Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}
            >
              You&apos;re on track. Complete upcoming activities, attend community events, and continue climbing the leaderboard to unlock premium rewards and certifications.
            </p>

            <div className="flex flex-row items-center gap-2.5 w-full sm:w-auto">
              <Link href="/events" className="flex-1 sm:flex-initial">
                <button className="w-full sm:w-auto h-9 inline-flex items-center justify-center gap-1.5 px-4 rounded-lg bg-[#FF9900] hover:bg-[#E88B00] text-white font-bold text-xs sm:text-[13px] shadow-2xs hover:shadow-xs transition-all active:scale-[0.98] cursor-pointer whitespace-nowrap">
                  <span>Explore Events</span>
                  <ArrowRight className="w-3.5 h-3.5 shrink-0 stroke-[2.5]" />
                </button>
              </Link>

              <button
                onClick={onViewLeaderboardClick}
                className="flex-1 sm:flex-initial h-9 inline-flex items-center justify-center gap-1.5 px-4 rounded-lg bg-white hover:bg-slate-50 border border-slate-300/90 text-slate-800 hover:text-slate-900 font-semibold text-xs sm:text-[13px] shadow-2xs hover:border-slate-400 transition-all active:scale-[0.98] cursor-pointer whitespace-nowrap"
              >
                <Trophy className="w-4 h-4 text-amber-500 shrink-0 stroke-[2]" />
                <span>View Leaderboard</span>
              </button>
            </div>
          </div>

          {/* Right Side Visual Panel */}
          <div className="hidden md:flex relative z-10 flex-shrink-0 w-full md:w-auto justify-center items-center md:px-2">
            <div className="relative w-44 h-44 flex items-center justify-center">
              {/* Animated floating circles / orbits */}
              <div className="absolute w-[144px] h-[144px] border border-dashed border-slate-300 rounded-full animate-spin" style={{ animationDuration: "25s" }} />
              <div className="absolute w-[92px] h-[92px] border border-dotted border-slate-400/80 rounded-full animate-spin" style={{ animationDuration: "15s", animationDirection: "reverse" }} />

              {/* Central Main Icon (AWS Logo SVG - Static) */}
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

