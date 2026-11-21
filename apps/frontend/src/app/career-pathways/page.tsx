"use client";

import React, { useMemo, useState, Suspense } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { certificationsService, careerPathwaysService } from "@/services/api";
import { LearnerPathwayDetail } from "@/lib/types";
import {
  Loader2,
  ArrowRight,
  BriefcaseBusiness,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";

const ROLES = [
  { id: "cloud-architect", label: "Architect" },
  { id: "devops-engineer", label: "DevOps" },
  { id: "security-engineer", label: "Security" },
  { id: "data-engineer", label: "Data" },
  { id: "ml-engineer", label: "ML" },
  { id: "ai-engineer", label: "AI" },
  { id: "cloud-developer", label: "Developer" },
  { id: "networking-engineer", label: "Networking" },
];

const getTierColor = (level: string) => {
  switch (level.toLowerCase()) {
    case "foundational": return "#5A6572";
    case "associate": return "#0972D3";
    case "professional": return "#0083A0";
    case "specialty": return "#5A30A6";
    default: return "#94A3B8";
  }
};

const getTierLabel = (level: string) => {
  switch (level.toLowerCase()) {
    case "foundational": return "Foundational";
    case "associate": return "Associate";
    case "professional": return "Professional";
    case "specialty": return "Specialty";
    default: return level;
  }
};

const shortenName = (name: string) => {
  return name.replace("AWS Certified ", "");
};

const easeOut = [0.16, 1, 0.3, 1] as const;

const sectionVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: easeOut },
  },
};

const certItemVariants = {
  hidden: { opacity: 0, y: 25, scale: 0.88 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 280,
      damping: 24,
      delay: 0.1 + i * 0.08,
    },
  }),
};

const connectorVariants = {
  hidden: { opacity: 0, scaleX: 0 },
  visible: (i: number) => ({
    opacity: 1,
    scaleX: 1,
    transition: {
      type: "spring" as const,
      stiffness: 220,
      damping: 18,
      delay: 0.08 + i * 0.08,
    },
  }),
};

const arrowVariants = {
  hidden: { x: -8, opacity: 0 },
  visible: (i: number) => ({
    x: 0,
    opacity: 1,
    transition: { delay: 0.12 + i * 0.08, duration: 0.25, ease: easeOut },
  }),
};

const careerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 200, damping: 22, delay: 0.28 },
  },
};

const oppVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.3 + i * 0.05, duration: 0.28, ease: easeOut },
  }),
};

const ROLE_DETAILS: Record<string, { role: string; path: string[]; salary: string }> = {
  "cloud-architect": {
    role: "A Cloud Architect designs and manages cloud infrastructure. They select suitable AWS services, ensure scalability, security, reliability, and optimize cloud costs for organizations.",
    path: [
      "AWS Certified Cloud Practitioner (recommended for beginners)",
      "AWS Certified Solutions Architect – Associate",
      "AWS Certified Solutions Architect – Professional"
    ],
    salary: "₹15 LPA – ₹35 LPA"
  },
  "devops-engineer": {
    role: "A DevOps Engineer automates software development and deployment processes, manages CI/CD pipelines, monitors applications, and improves collaboration between development and operations teams.",
    path: [
      "AWS Certified Cloud Practitioner",
      "AWS Certified Developer – Associate or AWS Certified SysOps Administrator – Associate",
      "AWS Certified DevOps Engineer – Professional"
    ],
    salary: "₹6 LPA – ₹20 LPA"
  },
  "security-specialist": {
    role: "A Security Specialist protects cloud environments from cyber threats by implementing security policies, managing access controls, monitoring vulnerabilities, and ensuring compliance.",
    path: [
      "AWS Certified Cloud Practitioner",
      "AWS Certified Solutions Architect – Associate or AWS Certified SysOps Administrator – Associate",
      "AWS Certified Security – Specialty"
    ],
    salary: "₹8 LPA – ₹25 LPA"
  },
  "data-engineer": {
    role: "A Data Engineer builds and maintains data pipelines, processes large volumes of data, and prepares data for analytics and business insights.",
    path: [
      "AWS Certified Cloud Practitioner",
      "AWS Certified Data Engineer – Associate"
    ],
    salary: "₹7 LPA – ₹22 LPA"
  },
  "ml-engineer": {
    role: "An ML Engineer develops, trains, test, deploys, and maintains machine learning models for various applications.",
    path: [
      "AWS Certified Cloud Practitioner",
      "AWS Certified Solutions Architect – Associate or AWS Certified Data Engineer – Associate",
      "AWS Certified Machine Learning – Specialty"
    ],
    salary: "₹8 LPA – ₹25 LPA"
  },
  "ai-engineer": {
    role: "An AI Engineer designs and develops AI-powered applications using technologies such as Generative AI, Natural Language Processing, and Computer Vision.",
    path: [
      "AWS Certified Cloud Practitioner",
      "AWS Certified AI Practitioner",
      "AWS Certified Machine Learning – Specialty"
    ],
    salary: "₹10 LPA – ₹30 LPA"
  },
  "cloud-developer": {
    role: "A Cloud Developer develops, tests, and deploys cloud-native applications using AWS services while ensuring scalability and performance.",
    path: [
      "AWS Certified Cloud Practitioner",
      "AWS Certified Developer – Associate"
    ],
    salary: "₹5 LPA – ₹18 LPA"
  },
  "networking-engineer": {
    role: "A Networking Engineer designs, configures, and maintains network infrastructure, VPNs, routers, switches, and cloud networking services.",
    path: [
      "AWS Certified Cloud Practitioner",
      "AWS Certified Solutions Architect – Associate or AWS Certified SysOps Administrator – Associate",
      "AWS Certified Advanced Networking – Specialty"
    ],
    salary: "₹4 LPA – ₹15 LPA"
  },
  "cloud-support-engineer": {
    role: "A Cloud Support Engineer troubleshoots issues related to cloud infrastructure, networking, storage, and applications, ensuring smooth cloud operations.",
    path: [
      "AWS Certified Cloud Practitioner",
      "AWS Certified SysOps Administrator – Associate"
    ],
    salary: "₹4 LPA – ₹12 LPA"
  },
  "site-reliability-engineer": {
    role: "A Site Reliability Engineer ensures that applications and services are highly available, reliable, and scalable through automation and monitoring.",
    path: [
      "AWS Certified Cloud Practitioner",
      "AWS Certified SysOps Administrator – Associate",
      "AWS Certified DevOps Engineer – Professional"
    ],
    salary: "₹10 LPA – ₹28 LPA"
  },
  "cloud-systems-administrator": {
    role: "A Cloud Systems Administrator manages cloud servers, operating systems, backups, monitoring tools, and system performance.",
    path: [
      "AWS Certified Cloud Practitioner",
      "AWS Certified SysOps Administrator – Associate"
    ],
    salary: "₹5 LPA – ₹15 LPA"
  },
  "cloud-consultant": {
    role: "A Cloud Consultant advises organizations on cloud adoption, migration strategies, architecture design, and cost optimization.",
    path: [
      "AWS Certified Cloud Practitioner",
      "AWS Certified Solutions Architect – Associate",
      "AWS Certified Solutions Architect – Professional"
    ],
    salary: "₹10 LPA – ₹30 LPA"
  },
  "cloud-migration-engineer": {
    role: "A Cloud Migration Engineer plans and executes the migration of applications, databases, and workloads from on-premises infrastructure to AWS cloud.",
    path: [
      "AWS Certified Cloud Practitioner",
      "AWS Certified Solutions Architect – Associate"
    ],
    salary: "₹7 LPA – ₹18 LPA"
  },
  "database-administrator": {
    role: "A Cloud Database Administrator manages cloud databases, performs backups and recovery, optimizes performance, and ensures database security.",
    path: [
      "AWS Certified Cloud Practitioner",
      "AWS Certified Solutions Architect – Associate or AWS Certified Data Engineer – Associate",
      "AWS Certified Database – Specialty"
    ],
    salary: "₹6 LPA – ₹20 LPA"
  },
  "cloud-operations-engineer": {
    role: "A Cloud Operations Engineer monitors cloud infrastructure, automates operational tasks, and ensures smooth day-to-day cloud operations.",
    path: [
      "AWS Certified Cloud Practitioner",
      "AWS Certified SysOps Administrator – Associate"
    ],
    salary: "₹6 LPA – ₹18 LPA"
  },
  "finops-engineer": {
    role: "A FinOps Engineer monitors and optimizes cloud spending, analyzes cloud usage, and helps organizations reduce cloud costs efficiently.",
    path: [
      "AWS Certified Cloud Practitioner",
      "AWS Certified Solutions Architect – Associate"
    ],
    salary: "₹8 LPA – ₹20 LPA"
  }
};

function getRoleDetails(name: string) {
  const norm = name.toLowerCase();
  if (norm.includes("architect")) return ROLE_DETAILS["cloud-architect"];
  if (norm.includes("devops")) return ROLE_DETAILS["devops-engineer"];
  if (norm.includes("security")) return ROLE_DETAILS["security-specialist"];
  if (norm.includes("data")) return ROLE_DETAILS["data-engineer"];
  if (norm.includes("machine learning") || norm.includes("ml-engineer") || norm.includes("ml engineer") || norm.includes("ml")) return ROLE_DETAILS["ml-engineer"];
  if (norm.includes("ai engineer") || norm.includes("ai-engineer") || norm.includes("ai")) return ROLE_DETAILS["ai-engineer"];
  if (norm.includes("developer")) return ROLE_DETAILS["cloud-developer"];
  if (norm.includes("networking")) return ROLE_DETAILS["networking-engineer"];
  if (norm.includes("support")) return ROLE_DETAILS["cloud-support-engineer"];
  if (norm.includes("reliability") || norm.includes("sre")) return ROLE_DETAILS["site-reliability-engineer"];
  if (norm.includes("systems administrator") || norm.includes("sysadmin")) return ROLE_DETAILS["cloud-systems-administrator"];
  if (norm.includes("consultant")) return ROLE_DETAILS["cloud-consultant"];
  if (norm.includes("migration")) return ROLE_DETAILS["cloud-migration-engineer"];
  if (norm.includes("database") || norm.includes("dba")) return ROLE_DETAILS["database-administrator"];
  if (norm.includes("operations")) return ROLE_DETAILS["cloud-operations-engineer"];
  if (norm.includes("finops")) return ROLE_DETAILS["finops-engineer"];
  
  return {
    role: "A cloud computing specialist focused on design, implementation, and optimization of cloud infrastructure and services.",
    path: [],
    salary: "N/A"
  };
}

function RoleSection({
  path,
  dbBadgeMap,
  isFlipped,
  onToggleFlip,
}: {
  path: LearnerPathwayDetail;
  dbBadgeMap: Record<string, string>;
  isFlipped: boolean;
  onToggleFlip: () => void;
}) {
  const certs = path.pathway as any[];
  const details = getRoleDetails(path.name);

  return (
    <motion.div 
      className="w-full h-full [perspective:1200px] min-h-[460px] sm:min-h-[440px] relative"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-15px" }}
      variants={sectionVariants}
    >
      <motion.div
        className="w-full h-full relative"
        style={{ transformStyle: "preserve-3d" }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
      >
        {/* FRONT FACE */}
        <div 
          onClick={onToggleFlip}
          className={cn(
            "w-full bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col justify-between items-center transition-all duration-300 h-full cursor-pointer hover:shadow-md hover:border-slate-300/80",
            isFlipped ? "pointer-events-none opacity-0" : "opacity-100"
          )}
          style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", transform: "translate3d(0,0,0)" }}
        >
          <div className="text-center mb-8 w-full relative">
            <h3 className="text-xl font-black text-slate-800 tracking-tight leading-tight">
              {path.name}
            </h3>
            <p className="mt-2 text-xs text-slate-500 max-w-lg mx-auto leading-relaxed">
              {path.description}
            </p>
          </div>

          <div 
            className="flex flex-row flex-nowrap items-start justify-center gap-1.5 sm:gap-2.5 w-full py-2.5 px-1"
          >
            {certs.map((pathItem: any, i: number) => {
              const cert = pathItem.certification;
              const tierColor = getTierColor(cert.level.name);
              const badgeUrl = cert.badgeImageUrl || dbBadgeMap[cert.slug];
              return (
                <React.Fragment key={cert.id}>
                  {i > 0 && (
                    <motion.div
                      className="flex items-center justify-center shrink-0 select-none w-4 sm:w-6 h-[80px] sm:h-[100px] md:h-[120px]"
                      variants={connectorVariants}
                      custom={i}
                    >
                      <motion.span
                        className="flex h-full items-center justify-center text-slate-300"
                        variants={arrowVariants}
                        custom={i}
                      >
                        <div className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-slate-50 border border-slate-200/60 text-slate-400 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                          <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-slate-400 shrink-0" />
                        </div>
                      </motion.span>
                    </motion.div>
                  )}
                  
                  {/* Note: from=pathways enables intelligent back navigation returning straight to career pathways */}
                  <Link 
                    href={`/certifications/${cert.slug}?from=pathways`} 
                    onClick={(e) => e.stopPropagation()}
                    className="group/cert w-full max-w-[76px] sm:max-w-[100px] md:max-w-[120px] flex flex-col items-center gap-2 text-center no-underline text-inherit shrink-0"
                  >
                    <motion.div
                      className="w-full flex flex-col items-center gap-2"
                      variants={certItemVariants}
                      custom={i}
                    >
                      <div
                        className="w-full aspect-square rounded-lg sm:rounded-xl border border-slate-200 bg-white flex items-center justify-center overflow-hidden transition-all duration-300 cursor-pointer shadow-sm relative group-hover/cert:border-[var(--tier-color)] group-hover/cert:-translate-y-0.5 group-hover/cert:scale-[1.02] group-hover/cert:shadow-md"
                        style={{ "--tier-color": tierColor } as React.CSSProperties}
                      >
                        <div className="w-[75%] h-[75%] flex items-center justify-center">
                          {badgeUrl ? (
                            <img
                              src={badgeUrl}
                              alt={cert.title}
                              className="w-full h-full object-contain block transition-transform duration-300 group-hover/cert:scale-[1.08]"
                            />
                          ) : (
                            <>
                              <GraduationCap size={24} className="sm:hidden" style={{ color: tierColor }} />
                              <GraduationCap size={32} className="hidden sm:block" style={{ color: tierColor }} />
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-center gap-0.5 w-full">
                        <span className="text-[9px] sm:text-[10px] md:text-[11px] font-bold text-slate-800 leading-snug line-clamp-2 min-h-[28px] sm:min-h-[32px] flex items-center justify-center">
                          {shortenName(cert.title)}
                        </span>
                        <span className="text-[7px] sm:text-[8px] font-black uppercase tracking-normal" style={{ color: tierColor }}>
                          {getTierLabel(cert.level.name)}
                        </span>
                      </div>
                    </motion.div>
                  </Link>
                </React.Fragment>
              );
            })}
          </div>

          <motion.div
            className="w-full mt-6 pt-5 border-t border-slate-100"
            variants={careerVariants}
          >
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1.5 mb-3">
                <BriefcaseBusiness size={13} className="text-slate-400" />
                <span className="text-[10px] font-black text-slate-400 tracking-wider uppercase">Career Opportunities</span>
              </div>
              <div className="flex flex-wrap justify-center items-center gap-1.5">
                {path.opportunities.map((opp: any, i: number) => (
                  <motion.span
                    key={opp.id}
                    variants={oppVariants}
                    custom={i}
                    className="inline-flex items-center rounded-full bg-slate-50 border border-slate-200 px-3 py-1 text-[10px] font-bold text-slate-600 shadow-sm transition-colors hover:bg-slate-100/80 cursor-default"
                  >
                    {opp.title}
                  </motion.span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* BACK FACE */}
        <div 
          onClick={onToggleFlip}
          className={cn(
            "absolute inset-0 w-full h-full bg-[#0B0F19] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-lg flex flex-col justify-between transition-all duration-300 cursor-pointer hover:border-[#FF9900]/40 hover:shadow-[0_12px_30px_-6px_rgba(0,0,0,0.3),0_0_15px_rgba(255,153,0,0.15)]",
            isFlipped ? "opacity-100" : "pointer-events-none opacity-0"
          )}
          style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", transform: "rotateY(180deg) translate3d(0,0,0)" }}
        >
          <div className="w-full relative flex items-start justify-between">
            <div className="flex-1 text-left">
              <span className="text-[9px] font-black text-slate-500 tracking-wider uppercase">Role Profile</span>
              <h3 className="text-lg font-black text-white tracking-tight leading-tight mt-0.5">
                {path.name}
              </h3>
            </div>
          </div>

          <div className="mt-4 flex-1 flex flex-col gap-4 text-left overflow-y-auto premium-scrollbar pr-1 max-h-[220px] sm:max-h-[240px]">
            <div className="space-y-1">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <BriefcaseBusiness size={12} className="text-[#FF9900]" />
                What Does a {path.name} Do?
              </div>
              <p className="text-[11.5px] text-slate-300 leading-relaxed font-normal">
                {details.role}
              </p>
            </div>

            {details.path.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <GraduationCap size={12} className="text-[#0972D3]" />
                  Recommended Certification Path
                </div>
                <ul className="space-y-1 pl-1">
                  {details.path.map((step, idx) => (
                    <li key={idx} className="text-[11px] text-slate-300 flex items-start gap-2 leading-tight">
                      <span className="text-[#FF9900] font-bold text-[10px] mt-0.5">›</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="space-y-1">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={12} className="text-emerald-400" />
                Industry Salary Range (India)
              </div>
              <div className="inline-flex items-center gap-1.5 bg-emerald-950/40 border border-emerald-500/20 px-2.5 py-1 rounded-md text-[11px] font-bold text-emerald-300">
                <span>{details.salary}</span>
              </div>
            </div>
          </div>

          <div className="w-full pt-4 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
            <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Click card to return</span>
            <span className="text-[#FF9900] font-semibold flex items-center gap-1">
              <span>View certifications</span>
              <span>→</span>
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function CareerPathwaysContent() {
  const { data: dbPathways, isLoading: pathwaysLoading } = useQuery({
    queryKey: ["career-pathways"],
    queryFn: careerPathwaysService.list,
  });

  const { data: certifications } = useQuery({
    queryKey: ["certifications"],
    queryFn: certificationsService.list,
  });

  const [flippedPathwayId, setFlippedPathwayId] = useState<string | null>(null);

  const dbBadgeMap = useMemo(() => {
    if (!certifications) return {};
    const map: Record<string, string> = {};
    for (const c of certifications) {
      if (c.badgeImageUrl) {
        map[c.slug] = c.badgeImageUrl;
      }
    }
    return map;
  }, [certifications]);

  const sortedPaths = useMemo(() => {
    if (!dbPathways) return [];
    return [...dbPathways].sort((a, b) => {
      const idxA = ROLES.findIndex(r => r.id === a.slug);
      const idxB = ROLES.findIndex(r => r.id === b.slug);
      return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
    });
  }, [dbPathways]);

  return (
    <div 
      className="min-h-screen pb-20 antialiased"
      style={{
        backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.65), rgba(255, 255, 255, 0.65)), url('/images/aws_tech_doodle_bg.png')",
        backgroundRepeat: 'repeat',
        backgroundSize: '450px auto',
      }}
    >
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      <div className="mx-auto max-w-[1440px] px-4 pt-4 sm:pt-12 sm:px-6 lg:px-8 flex flex-col gap-6">
        {/* Header (Standard Core Breadcrumb Layout with Divider Line) */}
        <header className="pb-5 border-b border-slate-200/80 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div className="max-w-4xl">
            {/* Breadcrumb Path */}
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 mb-2">
              <span className="hover:text-[#FF9900] transition-colors font-semibold">AWS SBG REC</span>
              <span className="text-slate-300">/</span>
              <span className="text-[#FF9900] font-semibold">Certifications Directory</span>
            </div>
            
            <p className="font-display text-2xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-3xl">
              AWS Career Pathways
            </p>
            
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              See how AWS certifications stack up to guide your path to high-demand cloud roles.
            </p>
          </div>

          {/* Dedicated Tab Switcher (Navigates to dedicated routes) */}
          <div className="shrink-0">
            <div className="inline-flex items-center gap-1 bg-slate-100/80 p-1 rounded-[6px] border border-slate-200">
              <Link
                href="/certifications"
                className="flex items-center gap-2 rounded-[4px] px-3.5 py-1.5 text-xs transition-all cursor-pointer select-none text-slate-500 hover:text-slate-800 font-medium"
              >
                <GraduationCap className="h-4 w-4 text-slate-400" />
                <span>AWS Certifications</span>
              </Link>
              
              <button
                type="button"
                className="flex items-center gap-2 rounded-[4px] px-3.5 py-1.5 text-xs transition-all select-none bg-white text-slate-900 shadow-xs font-bold border border-slate-200/80 cursor-default"
              >
                <BriefcaseBusiness className="h-4 w-4 text-[#FF9900]" />
                <span>Career Pathways</span>
              </button>
            </div>
          </div>
        </header>

        {/* Career Pathways Grid */}
        <div className="flex flex-col gap-6">
          {pathwaysLoading ? (
            <div className="flex flex-col items-center justify-center py-20 w-full">
              <Loader2 className="h-8 w-8 animate-spin text-[#ff9900]" />
              <p className="mt-4 text-sm text-muted-foreground">Loading pathways...</p>
            </div>
          ) : sortedPaths.length === 0 ? (
            <div className="py-20 text-center text-muted-foreground w-full">
              No pathways available yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch w-full">
              {sortedPaths.map((path) => (
                <RoleSection 
                  key={path.id} 
                  path={path} 
                  dbBadgeMap={dbBadgeMap} 
                  isFlipped={flippedPathwayId === path.id}
                  onToggleFlip={() => setFlippedPathwayId((prev) => (prev === path.id ? null : path.id))}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CareerPathwaysPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center py-40">
        <Loader2 className="h-8 w-8 animate-spin text-[#ff9900]" />
        <p className="mt-4 text-xs text-slate-500 font-semibold">Loading career pathways...</p>
      </div>
    }>
      <CareerPathwaysContent />
    </Suspense>
  );
}

