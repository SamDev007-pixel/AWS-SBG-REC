"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { certificationsService } from "@/services/certifications";
import { careerPathwaysService } from "@/services/career-pathways";
import { CertificationFormDialog } from "@/components/certifications/certification-form-dialog";
import { CareerRoleFormDialog } from "@/components/career-pathways/career-role-form-dialog";
import { PathwayCard } from "@/components/career-pathways/pathway-card";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import {
  Clock,
  DollarSign,
  Loader2,
  User,
  FileText,
  Monitor,
  ArrowRight,
  GraduationCap,
  BriefcaseBusiness,
  Plus,
  Trash2,
  AlertTriangle,
  RefreshCw,
  Route,
} from "lucide-react";
import { toast } from "sonner";
import { CertificationListItem, CareerRoleListItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const LEVELS = ["All", "Foundational", "Associate", "Professional", "Specialty"];

// Formatting helpers
function formatDuration(duration?: string): string {
  if (!duration) return "90 min";
  return duration.replace(" minutes", " min").replace(" minute", " min");
}

function formatMode(mode?: string): string {
  if (!mode) return "Online or Pearson VUE";
  const m = mode.toLowerCase();
  if (m.includes("online proctored") || m.includes("pearson vue") || m.includes("online or pearson vue")) {
    return "Online or Pearson VUE";
  }
  return mode;
}

// Target roles for certifications
function getTargetRoles(slug: string): string {
  const roles: Record<string, string> = {
    "aws-cloud-practitioner": "Sales, marketing, finance, project managers, managers",
    "aws-ai-practitioner": "Business analyst, IT support, marketing, product/project manager",
    "aws-machine-learning-engineer-associate": "Machine learning engineer, data scientist, software engineer",
    "aws-solutions-architect-associate": "Solutions architect, cloud engineer, systems administrator",
    "aws-developer-associate": "Software developer, application engineer, cloud developer",
    "aws-data-engineer-associate": "Data engineer, data architect, business intelligence developer",
    "aws-cloudops-engineer-associate": "SysOps administrator, DevOps engineer, systems architect",
    "aws-generative-ai-developer-professional": "GenAI developer, software developer, AI research engineer",
    "aws-solutions-architect-professional": "Senior solutions architect, principal cloud designer",
    "aws-devops-engineer-professional": "DevOps engineer, cloud infrastructure manager, SRE",
    "aws-advanced-networking-specialty": "Network architect, cloud network engineer, systems engineer",
    "aws-security-specialty": "Security analyst, security engineer, compliance specialist",
  };
  return roles[slug] ?? "Cloud professionals, IT specialists";
}

// Styling/theme config mapping based on level or examCode
function getCertTheme(examCode: string, level: string) {
  const code = (examCode || "").toUpperCase();
  const lvl = (level || "").toLowerCase();
  
  if (lvl === "foundational" || code.startsWith("CLF") || code.startsWith("AIF")) {
    return {
      accent: "from-[#5A6572] to-[#788896]",
      progress: "bg-[#5A6572]/70",
      pillBg: "bg-[#F1F5F9] text-[#5A6572] border-[#5A6572]/15",
      badgeClass: "bg-[#F1F5F9] text-[#5A6572] border-[#5A6572]/25",
      hoverBorder: "hover:border-[#5A6572]/25",
      cardBorder: "border-2 border-[#5A6572]/15 hover:border-[#5A6572]/25",
      iconColor: "text-[#5A6572]",
      hoverText: "group-hover:text-[#5A6572]",
      hoverBg: "group-hover:bg-[#F1F5F9]",
      hoverPillBorder: "group-hover:border-[#5A6572]/25"
    };
  }

  if (lvl === "associate" || code.startsWith("MLA") || code.startsWith("SAA") || code.startsWith("DVA") || code.startsWith("DEA")) {
    return {
      accent: "from-[#0972D3] to-[#2E90FF]",
      progress: "bg-[#0972D3]/75",
      pillBg: "bg-[#F0F7FF] text-[#0972D3] border-[#2E90FF]/15",
      badgeClass: "bg-[#F0F7FF] text-[#0972D3] border-[#2E90FF]/25",
      hoverBorder: "hover:border-[#0972D3]/25",
      cardBorder: "border-2 border-[#0972D3]/15 hover:border-[#0972D3]/25",
      iconColor: "text-[#0972D3]",
      hoverText: "group-hover:text-[#0972D3]",
      hoverBg: "group-hover:bg-[#F0F7FF]",
      hoverPillBorder: "group-hover:border-[#2E90FF]/25"
    };
  }

  if (lvl === "professional" || code.startsWith("SAP") || code.startsWith("DOP")) {
    return {
      accent: "from-[#00A4B4] to-[#00627A]",
      progress: "bg-[#0083A0]/75",
      pillBg: "bg-[#E6F8FA] text-[#00627A] border-[#00A4B4]/15",
      badgeClass: "bg-[#E6F8FA] text-[#00627A] border-[#00A4B4]/25",
      hoverBorder: "hover:border-[#0083A0]/25",
      cardBorder: "border-2 border-[#0083A0]/15 hover:border-[#0083A0]/25",
      iconColor: "text-[#00627A]",
      hoverText: "group-hover:text-[#00627A]",
      hoverBg: "group-hover:bg-[#E6F8FA]",
      hoverPillBorder: "group-hover:border-[#00A4B4]/25"
    };
  }

  return {
    accent: "from-[#5A30A6] to-[#8C60D6]",
    progress: "bg-[#5A30A6]/75",
    pillBg: "bg-[#F8F5FF] text-[#5A30A6] border-[#8C60D6]/15",
    badgeClass: "bg-[#F8F5FF] text-[#5A30A6] border-[#8C60D6]/25",
    hoverBorder: "hover:border-[#5A30A6]/25",
    cardBorder: "border-2 border-[#5A30A6]/15 hover:border-[#5A30A6]/25",
    iconColor: "text-[#5A30A6]",
    hoverText: "group-hover:text-[#5A30A6]",
    hoverBg: "group-hover:bg-[#F8F5FF]",
    hoverPillBorder: "group-hover:border-[#5A30A6]/25"
  };
}

function getSecondaryBadge(title: string, examCode: string, levelName: string): string {
  const code = (examCode || "").toUpperCase();
  const t = (title || "").toLowerCase();
  if (code.startsWith("CLF") || t.includes("cloud practitioner")) return "PRACTITIONER";
  if (code.startsWith("AIF") || code.startsWith("AIP") || t.includes("ai")) return "AI";
  if (code.startsWith("MLA") || t.includes("machine learning") || t.includes("ml")) return "ML";
  if (t.includes("developer") || t.includes("dev")) return "DEV";
  if (t.includes("architect")) return "ARCHITECT";
  if (t.includes("data")) return "DATA";
  if (t.includes("security")) return "SECURITY";
  if (t.includes("networking")) return "NETWORKING";
  if (t.includes("cloudops") || t.includes("sysops") || t.includes("devops")) return "OPS";
  
  const lvl = (levelName || "").toUpperCase();
  return lvl !== "FOUNDATIONAL" ? lvl : "GENERAL";
}

function CertCard({
  cert,
  onDelete,
}: {
  cert: CertificationListItem;
  onDelete?: () => void;
}) {
  const level = typeof cert.level === 'string' ? cert.level : cert.level?.name || '';
  const theme = getCertTheme(cert.examCode, level);
  const targetRoles = getTargetRoles(cert.slug);
  const secondaryBadge = getSecondaryBadge(cert.title, cert.examCode, level);
  const domains = (cert.domains || []).slice(0, 2);

  return (
    <Link href={`/core/certifications/${cert.slug}`} className="group block h-full">
      <div className={cn("relative flex flex-col justify-between rounded-2xl border bg-white p-5 shadow-2xs transition-all duration-300 ease-out hover:shadow-md hover:translate-y-[-2px] overflow-hidden h-full will-change-transform", theme.cardBorder)}>

        {/* Admin Delete button */}
        {onDelete && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete();
            }}
            className="absolute top-4 right-4 h-7 w-7 flex items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition-colors border border-red-100 cursor-pointer z-10"
            title="Delete Certification"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}

        <div>
          <div className="flex items-center gap-2">
            <span
              className={`rounded-[5px] px-2.5 py-0.5 text-[9.5px] font-extrabold tracking-wider border uppercase shadow-2xs ${theme.badgeClass}`}
            >
              {level}
            </span>
            {secondaryBadge !== level.toUpperCase() && (
              <span className="rounded-[5px] px-2.5 py-0.5 text-[9.5px] font-extrabold tracking-wider border bg-slate-50 text-slate-600 border-slate-200/80 uppercase shadow-2xs">
                {secondaryBadge}
              </span>
            )}
          </div>

          <div className="mt-3 min-h-[50px] flex items-start">
            <h3 className={cn("text-lg font-bold text-slate-900 tracking-tight leading-snug line-clamp-2 pr-6 transition-colors duration-300", theme.hoverText)}>
              {cert.title}
            </h3>
          </div>

          <div className="mt-1 flex items-start gap-1.5 text-[11.5px] text-slate-500 font-medium min-h-[36px]">
            <User className="h-3.5 w-3.5 shrink-0 text-slate-400 mt-0.5" />
            <span className="line-clamp-2 leading-relaxed">{targetRoles}</span>
          </div>

          {/* Attributes */}
          <div className="mt-4 space-y-2">
            <div className="grid grid-cols-3 gap-2">
              <div className="flex items-center gap-2 rounded-lg bg-slate-50 border border-slate-200/70 p-2 min-w-0">
                <Clock className={cn("h-4 w-4 shrink-0", theme.iconColor)} />
                <div className="flex flex-col min-w-0">
                  <span className="text-[8px] font-black text-slate-400 tracking-wider uppercase leading-none mb-1">DURATION</span>
                  <span className="text-xs font-bold text-slate-800 whitespace-nowrap leading-none">
                    {formatDuration(cert.examDuration)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-lg bg-slate-50 border border-slate-200/70 p-2 min-w-0">
                <FileText className={cn("h-4 w-4 shrink-0", theme.iconColor)} />
                <div className="flex flex-col min-w-0">
                  <span className="text-[8px] font-black text-slate-400 tracking-wider uppercase leading-none mb-1">QUESTIONS</span>
                  <span className="text-xs font-bold text-slate-800 leading-none">
                    {cert.totalQuestions ?? 65}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-lg bg-slate-50 border border-slate-200/70 p-2 min-w-0">
                <DollarSign className={cn("h-4 w-4 shrink-0", theme.iconColor)} />
                <div className="flex flex-col min-w-0">
                  <span className="text-[8px] font-black text-slate-400 tracking-wider uppercase leading-none mb-1">COST</span>
                  <span className="text-xs font-bold text-slate-800 leading-none">
                    ${cert.examCost ?? 100}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-lg bg-slate-50 border border-slate-200/70 p-2.5 px-3 min-w-0">
              <Monitor className={cn("h-4 w-4 shrink-0", theme.iconColor)} />
              <div className="flex items-center justify-between w-full min-w-0">
                <span className="text-[8px] font-black text-slate-400 tracking-wider uppercase leading-none">EXAM MODE</span>
                <span className="text-xs font-bold text-slate-800 leading-none truncate pl-2" title={formatMode(cert.examMode)}>
                  {formatMode(cert.examMode)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Domains & Bottom Link */}
        <div className="mt-5 border-t border-slate-100 pt-4 flex-1 flex flex-col justify-between">
          <div>
            {domains.length > 0 && (
              <>
                <div className="text-[9px] font-extrabold text-slate-400 tracking-widest uppercase mb-3">
                  EXAM DOMAINS
                </div>

                <div className="space-y-4">
                  {domains.map((dom) => (
                    <div key={dom.id} className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-800">
                        <span className="truncate pr-2">{dom.name}</span>
                        <span className={cn("rounded-[4px] px-1.5 py-0.5 text-[9px] font-extrabold leading-none border shadow-2xs", theme.pillBg)}>
                          {dom.weightage}%
                        </span>
                      </div>

                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${theme.progress} rounded-full transition-all duration-500`}
                          style={{ width: `${dom.weightage}%` }}
                        />
                      </div>

                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {dom.topics.map((topic) => (
                          <span
                            key={topic.id}
                            className="rounded-[6px] bg-slate-100/70 border border-slate-200/70 px-2 py-0.5 text-[9.5px] text-slate-600 font-medium whitespace-nowrap"
                          >
                            {topic.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="mt-5 flex justify-end pt-2">
            <div className={cn("inline-flex items-center gap-1.5 text-xs font-bold transition-all duration-300", theme.iconColor)}>
              <span>Manage Details</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function CertificationsPageContent() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [addPathOpen, setAddPathOpen] = useState(false);

  const searchParams = useSearchParams();
  const levelParam = searchParams.get("level");
  const tabParam = searchParams.get("tab");

  const [activeTab, setActiveTab] = useState<"certifications" | "pathways">("certifications");
  const [selectedLevel, setSelectedLevel] = useState("All");

  useEffect(() => {
    if (tabParam === "pathways") {
      setActiveTab("pathways");
    } else {
      setActiveTab("certifications");
    }
  }, [tabParam]);

  useEffect(() => {
    if (levelParam) {
      const found = LEVELS.find((l) => l.toLowerCase() === levelParam.toLowerCase());
      if (found) {
        setSelectedLevel(found);
      }
    }
  }, [levelParam]);

  const handleTabChange = (tab: "certifications" | "pathways") => {
    setActiveTab(tab);
    const params = new URLSearchParams(window.location.search);
    if (tab === "pathways") {
      params.set("tab", "pathways");
    } else {
      params.delete("tab");
    }
    router.replace(`/core/certifications?${params.toString()}`);
  };

  const [deleteTarget, setDeleteTarget] = useState<CertificationListItem | null>(null);

  // Admin list query
  const {
    data: certifications,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["admin-certifications"],
    queryFn: certificationsService.adminList,
  });

  // Admin career roles query
  const {
    data: roles,
    isLoading: rolesLoading,
    error: rolesError,
  } = useQuery({
    queryKey: ["admin-career-roles"],
    queryFn: careerPathwaysService.listRoles,
  });

  // Dynamic levels from DB
  const { data: dbLevels = [] } = useQuery({
    queryKey: ["admin-levels"],
    queryFn: certificationsService.listLevels,
  });

  // Fallback to correct DB IDs if fetch fails
  const levels = dbLevels && dbLevels.length > 0 ? dbLevels : [
    { id: "3723da5f-b3f7-4913-a742-433f70775386", name: "Foundational", displayOrder: 1 },
    { id: "36800f63-a96d-4ff2-b9f6-b0ded91b429d", name: "Associate", displayOrder: 2 },
    { id: "8660f00b-1534-4e5c-bfd5-b1144585d165", name: "Professional", displayOrder: 3 },
    { id: "40d5ff07-bfaf-4b7a-b6ee-165616e0356b", name: "Specialty", displayOrder: 4 },
  ];

  const createMutation = useMutation({
    mutationFn: certificationsService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-certifications"] });
      queryClient.invalidateQueries({ queryKey: ["certifications"] });
      toast.success("Certification created");
      setAddOpen(false);
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message ?? "Failed to create certification");
    },
  });

  const createPathMutation = useMutation({
    mutationFn: careerPathwaysService.createRole,
    onSuccess: (data) => {
      toast.success("Career role created");
      queryClient.invalidateQueries({ queryKey: ["admin-career-roles"] });
      setAddPathOpen(false);
      router.push(`/core/career-pathways/${data.id}`);
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message ?? "Failed to create career role");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => certificationsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-certifications"] });
      queryClient.invalidateQueries({ queryKey: ["certifications"] });
      toast.success("Certification deleted");
      setDeleteTarget(null);
    },
    onError: () => {
      toast.error("Failed to delete certification");
    },
  });

  const levelCounts = useMemo(() => {
    const counts: Record<string, number> = {
      All: certifications?.length || 0,
      Foundational: 0,
      Associate: 0,
      Professional: 0,
      Specialty: 0,
    };
    if (certifications) {
      for (const cert of certifications) {
        const lvl = typeof cert.level === 'string' ? cert.level : cert.level?.name;
        if (lvl) {
          const matched = Object.keys(counts).find(k => k.toLowerCase() === lvl.toLowerCase());
          if (matched) {
            counts[matched]++;
          }
        }
      }
    }
    return counts;
  }, [certifications]);

  const levelOrder: Record<string, number> = {
    Foundational: 1,
    Associate: 2,
    Professional: 3,
    Specialty: 4,
  };

  const sortedCertifications = certifications
    ? [...certifications].sort((a, b) => {
        const rawLevelA = typeof a.level === 'string' ? a.level : a.level?.name || '';
        const rawLevelB = typeof b.level === 'string' ? b.level : b.level?.name || '';
        const levelA = rawLevelA ? rawLevelA.charAt(0).toUpperCase() + rawLevelA.slice(1).toLowerCase() : '';
        const levelB = rawLevelB ? rawLevelB.charAt(0).toUpperCase() + rawLevelB.slice(1).toLowerCase() : '';
        const orderA = levelOrder[levelA] ?? 99;
        const orderB = levelOrder[levelB] ?? 99;
        if (orderA !== orderB) {
          return orderA - orderB;
        }
        return (a.displayOrder || 0) - (b.displayOrder || 0);
      })
    : [];

  const filteredCertifications = useMemo(() => {
    if (selectedLevel.toLowerCase() === "all") {
      return sortedCertifications;
    }
    return sortedCertifications.filter((cert) => {
      const lvl = typeof cert.level === 'string' ? cert.level : cert.level?.name;
      return lvl && lvl.toLowerCase() === selectedLevel.toLowerCase();
    });
  }, [sortedCertifications, selectedLevel]);

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
        {/* Header with Breadcrumb Path and Admin Buttons */}
        <header className="pb-5 border-b border-slate-200/80 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div className="max-w-4xl">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 mb-2">
              <span className="hover:text-[#FF6B00] transition-colors font-semibold">AWS SBG REC</span>
              <span className="text-slate-300">/</span>
              <span className="text-[#FF6B00] font-semibold">Core Management</span>
              <span className="text-slate-300">/</span>
              <span className="text-slate-700 font-semibold">Certifications</span>
            </div>
            
            <p className="font-display text-2xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-3xl">
              {activeTab === "certifications" ? "All AWS Certifications" : "AWS Career Pathways"}
            </p>
            
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              {activeTab === "certifications"
                ? "Explore every AWS Certification with complete exam details, syllabus details, domain breakdowns, duration, pricing and many more."
                : "Manage career roles and build structured cloud certification pathways to guide learners towards high-demand industry jobs."}
            </p>
          </div>

          {/* Custom Tab Switcher + Admin Actions */}
          <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="inline-flex items-center gap-1 bg-slate-100/80 p-1 rounded-[6px] border border-slate-200">
              <button
                onClick={() => handleTabChange("certifications")}
                className={cn(
                  "flex items-center gap-2 rounded-[4px] px-3.5 py-1.5 text-xs transition-all cursor-pointer select-none",
                  activeTab === "certifications"
                    ? "bg-white text-slate-900 shadow-xs font-bold border border-slate-200/80"
                    : "text-slate-500 hover:text-slate-800 font-medium"
                )}
              >
                <GraduationCap className={cn("h-4 w-4", activeTab === "certifications" ? "text-[#FF6B00]" : "text-slate-400")} />
                <span>AWS Certifications</span>
              </button>
              
              <button
                onClick={() => handleTabChange("pathways")}
                className={cn(
                  "flex items-center gap-2 rounded-[4px] px-3.5 py-1.5 text-xs transition-all cursor-pointer select-none",
                  activeTab === "pathways"
                    ? "bg-white text-slate-900 shadow-xs font-bold border border-slate-200/80"
                    : "text-slate-500 hover:text-slate-800 font-medium"
                )}
              >
                <BriefcaseBusiness className={cn("h-4 w-4", activeTab === "pathways" ? "text-[#FF6B00]" : "text-slate-400")} />
                <span>Career Pathways</span>
              </button>
            </div>

            {/* Admin Add Buttons */}
            {activeTab === "certifications" ? (
              <Button 
                onClick={() => setAddOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#232F3E] hover:bg-slate-800 text-white rounded-[6px] text-[12px] font-semibold transition-all shadow-sm hover:-translate-y-0.5 cursor-pointer border-none"
              >
                <Plus size={13} className="text-white" />
                Add Certification
              </Button>
            ) : (
              <Button 
                onClick={() => setAddPathOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#232F3E] hover:bg-slate-800 text-white rounded-[6px] text-[12px] font-semibold transition-all shadow-sm hover:-translate-y-0.5 cursor-pointer border-none"
              >
                <Plus size={13} className="text-white" />
                Create Pathway
              </Button>
            )}
          </div>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === "certifications" ? (
            <motion.div
              key="certifications-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col gap-6"
            >
              {/* Level Filter Chips */}
              <div className="flex flex-nowrap overflow-x-auto gap-3 pb-2.5 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap sm:overflow-visible sm:pb-0 scroll-smooth shrink-0 select-none">
                {LEVELS.map((level) => {
                  const count = levelCounts[level] ?? 0;
                  const isActive = selectedLevel.toLowerCase() === level.toLowerCase();
                  
                  const LEVEL_THEMES: Record<string, {
                    activeBg: string;
                    activeBorder: string;
                    activeText: string;
                    badgeBg: string;
                    badgeText: string;
                    badgeBorder: string;
                  }> = {
                    all: {
                      activeBg: "bg-orange-50/80",
                      activeBorder: "border-orange-200",
                      activeText: "text-[#FF9900]",
                      badgeBg: "bg-orange-100/50",
                      badgeText: "text-[#FF9900]",
                      badgeBorder: "border-orange-200/40",
                    },
                    foundational: {
                      activeBg: "bg-slate-100/80",
                      activeBorder: "border-slate-300",
                      activeText: "text-slate-700",
                      badgeBg: "bg-slate-200/50",
                      badgeText: "text-slate-700",
                      badgeBorder: "border-slate-300/40",
                    },
                    associate: {
                      activeBg: "bg-blue-50/80",
                      activeBorder: "border-blue-200",
                      activeText: "text-blue-600",
                      badgeBg: "bg-blue-100/50",
                      badgeText: "text-blue-600",
                      badgeBorder: "border-blue-200/40",
                    },
                    professional: {
                      activeBg: "bg-teal-50/80",
                      activeBorder: "border-teal-200",
                      activeText: "text-teal-700",
                      badgeBg: "bg-teal-100/50",
                      badgeText: "text-teal-700",
                      badgeBorder: "border-teal-200/40",
                    },
                    specialty: {
                      activeBg: "bg-purple-50/80",
                      activeBorder: "border-purple-200",
                      activeText: "text-purple-600",
                      badgeBg: "bg-purple-100/50",
                      badgeText: "text-purple-600",
                      badgeBorder: "border-purple-200/40",
                    },
                  };

                  const theme = LEVEL_THEMES[level.toLowerCase()] ?? LEVEL_THEMES.all;

                  return (
                    <button
                      key={level}
                      onClick={() => setSelectedLevel(level)}
                      className={cn(
                        "flex items-center gap-2 rounded-[8px] px-3.5 py-1.5 text-xs font-medium border transition-all cursor-pointer select-none active:scale-95 focus:outline-none focus:ring-0 focus-visible:outline-none",
                        isActive
                          ? `${theme.activeBg} ${theme.activeBorder} ${theme.activeText} font-semibold shadow-xs`
                          : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-800 hover:border-slate-300"
                      )}
                    >
                      <span>{level}</span>
                      <span
                        className={cn(
                          "inline-flex items-center justify-center rounded-[6px] h-4.5 min-w-[18px] px-1 text-[9.5px] font-semibold leading-none border",
                          isActive
                            ? `${theme.badgeBg} ${theme.badgeBorder} ${theme.badgeText}`
                            : "bg-slate-100/60 border-slate-200 text-slate-400"
                        )}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Cert Grid */}
              <div>
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-[#ff9900]" />
                    <p className="mt-4 text-sm text-muted-foreground">Loading certifications...</p>
                  </div>
                ) : error ? (
                  <div className="flex flex-col items-center justify-center p-8 py-12 text-center rounded-3xl border border-red-100 bg-red-50/20 max-w-md mx-auto my-12 animate-in fade-in-50 slide-in-from-bottom-5 duration-300">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100/80 text-[#ba1a1a] mb-4 ring-8 ring-red-50/50">
                      <AlertTriangle className="h-5 w-5" />
                    </div>
                    <h3 className="text-sm font-black text-slate-800 tracking-tight mb-2">
                      Connection Failed
                    </h3>
                    <p className="text-xs text-slate-500 font-semibold leading-relaxed mb-6 max-w-xs">
                      Failed to load certifications. Please check your network connection or server status and try again.
                    </p>
                    <Button
                      onClick={() => refetch()}
                      className="bg-[#0B0F19] hover:bg-[#1E293B] text-white border border-[#1e293b]/50 px-5 py-2.5 rounded-[10px] font-bold text-xs shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <RefreshCw className="h-3 w-3 text-white" />
                      Retry Connection
                    </Button>
                  </div>
                ) : filteredCertifications.length === 0 ? (
                  <div className="py-20 text-center text-muted-foreground">
                    No certifications available for this level.
                  </div>
                ) : (
                  <motion.div
                    key={selectedLevel}
                    initial="hidden"
                    animate="visible"
                    variants={{
                      hidden: { opacity: 0 },
                      visible: {
                        opacity: 1,
                        transition: {
                          staggerChildren: 0.04,
                        },
                      },
                    }}
                    className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
                  >
                    {filteredCertifications.map((cert) => (
                      <motion.div
                        key={cert.id}
                        className="h-full"
                        variants={{
                          hidden: { opacity: 0, y: -24 },
                          visible: { 
                            opacity: 1, 
                            y: 0,
                            transition: {
                              type: "spring",
                              stiffness: 120,
                              damping: 14,
                              mass: 0.6,
                            }
                          },
                        }}
                      >
                        <CertCard 
                          cert={cert} 
                          onDelete={() => setDeleteTarget(cert)}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="pathways-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col gap-6"
            >
              {/* Admin Career Pathways Grid */}
              <div>
                {rolesLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 w-full">
                    <Loader2 className="h-8 w-8 animate-spin text-[#ff9900]" />
                    <p className="mt-4 text-sm text-muted-foreground">Loading career pathways...</p>
                  </div>
                ) : rolesError ? (
                  <div className="flex flex-col items-center justify-center p-8 py-12 text-center rounded-3xl border border-red-100 bg-red-50/20 max-w-md mx-auto my-12 animate-in fade-in-50 slide-in-from-bottom-5 duration-300">
                    <p className="text-sm font-semibold text-red-600">Failed to load career pathways. Please try again.</p>
                  </div>
                ) : !roles?.length ? (
                  <EmptyState
                    icon={Route}
                    title="No career pathways"
                    description="Create your first career role to get started."
                    action={
                      <Button onClick={() => setAddPathOpen(true)} className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#232F3E] hover:bg-slate-800 text-white rounded-[6px] text-[12px] font-semibold transition-all shadow-sm mt-4">
                        <Plus className="mr-1.5 h-4 w-4" />
                        Create Pathway
                      </Button>
                    }
                  />
                ) : (
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {roles.map((role) => (
                      <PathwayCard key={role.id} role={role} />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Add Certification Dialog */}
      <CertificationFormDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onSubmit={(data) => createMutation.mutate(data)}
        levels={levels}
        isLoading={createMutation.isPending}
      />

      <CareerRoleFormDialog
        open={addPathOpen}
        onOpenChange={setAddPathOpen}
        onSubmit={(data) => createPathMutation.mutate(data)}
        isLoading={createPathMutation.isPending}
      />

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Certification</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete &ldquo;{deleteTarget?.title}&rdquo;? 
              This will remove all associated domains and topics. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-750 text-white px-5 h-9 rounded-[10px] font-bold transition-all shadow-sm hover:shadow-md cursor-pointer border-none"
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function CoreCertificationsPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center py-40">
        <Loader2 className="h-8 w-8 animate-spin text-[#ff9900]" />
        <p className="mt-4 text-xs text-slate-500 font-semibold">Loading certifications directory...</p>
      </div>
    }>
      <CertificationsPageContent />
    </Suspense>
  );
}
