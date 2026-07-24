"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  ChevronRight, ArrowDown, AlertCircle,
  Search, Server, Trophy, LayoutGrid, CheckCircle2, ChevronLeft,
  Settings2, ChevronDown, Globe, MapPin
} from 'lucide-react';
import GlobeScene from '@/components/Globe/GlobeScene';
import IntelligenceDashboard from '@/components/Intelligence/IntelligenceDashboard';
import { fetchCategories, fetchRegions, AWSRegionData, CategoryData } from '@/lib/api';
import FlagImage from '@/components/Layout/FlagImage';
import ServicesCatalog from '@/components/Services/ServicesCatalog';

export default function Home() {
  const [regions, setRegions] = useState<AWSRegionData[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<AWSRegionData | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [showIntelligence, setShowIntelligence] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // User role state
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("aws_sgb_rec_user");
      if (raw) {
        const parsed = JSON.parse(raw);
        const roleStr = (parsed?.role ?? "").toLowerCase().trim();
        setUserRole(roleStr);

        if (roleStr !== "core" && parsed?.id) {
          fetch(`/api/auth/permissions/check?userId=${parsed.id}&permission=edit_event`)
            .then(res => res.json())
            .then(data => {
              if (data.success && data.hasPermission) {
                setUserRole("core");
              }
            })
            .catch(err => console.error("Services page permission check failed:", err));
        }
      }
    } catch { /* ignore */ }
  }, []);

  // Load categories and regions from backend API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [catsData, regsData] = await Promise.all([
          fetchCategories(),
          fetchRegions()
        ]);
        setCategories(catsData);
        setRegions(regsData);
      } catch (err: any) {
        console.error("Error loading mesh data:", err);
        setError(err.message || "Failed to initialize AWS Region Intelligence Mesh.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Dynamically map/filter region services for enthusiasts to the 30 major services
  const normalizedRegions = useMemo(() => {
    const isEnthusiast = userRole !== "core" && userRole !== "crew";
    if (!isEnthusiast) return regions;

    const allowedServiceNamesAndCodes = new Set([
      "amazon-ec2", "ec2",
      "aws-lambda", "lambda",
      "aws-auto-scaling-ec2", "ec2autoscaling",
      "amazon-s3", "s3",
      "amazon-ebs", "ebs",
      "amazon-rds", "rds",
      "amazon-dynamodb", "dynamodb",
      "amazon-aurora", "aurora",
      "amazon-vpc", "vpc",
      "amazon-route-53", "route53",
      "amazon-cloudfront", "cloudfront",
      "elastic-load-balancing", "elb", "elasticloadbalancing",
      "aws-iam", "iam",
      "aws-kms", "kms",
      "aws-secrets-manager", "secretsmanager",
      "aws-waf", "waf",
      "amazon-cloudwatch", "cloudwatch",
      "aws-systems-manager", "ssm", "systemsmanager",
      "aws-cloudtrail", "cloudtrail",
      "amazon-ecs", "ecs",
      "amazon-eks", "eks",
      "amazon-sqs", "sqs",
      "amazon-sns", "sns",
      "amazon-eventbridge", "eventbridge",
      "aws-step-functions", "stepfunctions",
      "aws-cloudformation", "cloudformation",
      "amazon-api-gateway", "apigateway", "apigw",
      "amazon-kinesis", "amazon-kinesis-data-streams", "amazon-kinesis-data-firehose", "amazon-kinesis-data-analytics", "amazon-kinesis-video-streams", "kinesis", "kinesisstreams", "kinesisfirehose", "kinesisanalytics", "kinesisvideo",
      "amazon-redshift", "redshift",
      "aws-glue", "glue"
    ]);

    return regions.map(r => {
      const filterFn = (s: string) => {
        const sLower = s.toLowerCase().replace(/\s+/g, '-');
        return Array.from(allowedServiceNamesAndCodes).some(allowed => 
          sLower.includes(allowed) || allowed.includes(sLower)
        );
      };
      return {
        ...r,
        services: (r.services || []).filter(filterFn),
        topServices: (r.topServices || []).filter(filterFn)
      };
    });
  }, [regions, userRole]);

  // History Popstate Navigation Logic
  useEffect(() => {
    if (typeof window !== 'undefined' && window.history) {
      window.history.replaceState({ view: 'globe' }, '');
    }

    const handlePopState = (event: PopStateEvent) => {
      const state = event.state;
      if (!state || state.view !== 'details') {
        setShowIntelligence(false);
        setSelectedRegion(null);
        setExpandedCategory(null);
      } else if (state.view === 'details') {
        setShowIntelligence(true);
        if (state.regionId && normalizedRegions.length > 0) {
          const region = normalizedRegions.find(r => r.id === state.regionId);
          if (region) {
            setSelectedRegion(region);
            setExpandedCategory(region.categoryId);
          }
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [normalizedRegions]);

  // Dynamically group active categories from database, preserving displayOrder
  const sidebarCategories = useMemo(() => {
    const sortedCats = [...categories].sort((a, b) => a.displayOrder - b.displayOrder);
    return sortedCats.map(cat => {
      const catRegions = normalizedRegions
        .filter(r => r.categoryId === cat.slug)
        .sort((a, b) => a.displayOrder - b.displayOrder);
      return {
        id: cat.slug,
        name: cat.name,
        flag: cat.flag,
        regionIds: catRegions.map(r => r.id)
      };
    });
  }, [categories, normalizedRegions]);

  // Only show markers for regions listed in active sidebar categories
  const visibleRegionIds = useMemo(() =>
    new Set(sidebarCategories.flatMap(cat => cat.regionIds))
    , [sidebarCategories]);

  // Filter regions based on search query
  const filteredRegions = useMemo(() => {
    return normalizedRegions.filter(r => {
      const matchesSearch =
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.services.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
        r.infrastructure.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [normalizedRegions, searchQuery]);

  const handleRegionSelect = (region: AWSRegionData) => {
    setSelectedRegion(region);
    setExpandedCategory(region.categoryId);
    setShowIntelligence(false);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F8F9FA] flex items-center justify-center relative">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-[3px] border-[#232F3E]/10 border-t-[#FF9900] rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-500 tracking-wider">Loading...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[#F8F9FA] flex items-center justify-center font-jakarta relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(190,227,237,0.15)_0%,transparent_60%)] pointer-events-none" />
        <div style={{ background: "linear-gradient(135deg, rgba(255, 153, 0, 0.1), rgba(35, 47, 62, 0.06))" }} className="backdrop-blur-xl border border-slate-100 rounded-[2.5rem] p-10 max-w-md w-full shadow-xl flex flex-col items-center text-center z-10">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6 border border-red-100">
            <AlertCircle size={30} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-3">Mesh Connection Failure</h2>
          <p className="text-slate-500 text-sm font-semibold mb-8">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-4 bg-[#1A1C1E] hover:bg-[#0073BB] text-white rounded-2xl font-black uppercase text-[11px] tracking-widest transition-all shadow-md w-full"
          >
            Re-Initialize Mesh
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className={`w-full bg-[#F8F9FA] text-[#1A1C1E] flex flex-col font-jakarta relative ${showIntelligence ? 'lg:overflow-hidden lg:h-screen h-auto' : 'lg:overflow-y-auto lg:h-screen h-auto'}`}>

      <AnimatePresence mode="wait">
        {!showIntelligence ? (
          /* SECTION 1: CENTERED EXPLORER HUB */
          <motion.section
            key="globe-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05, filter: 'blur(15px)' }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            className="w-full relative flex flex-col bg-[#F8F9FA]"
          >
            {/* 3D Globe View viewport (takes exactly 100vh on desktop, flows naturally on mobile) */}
            <div className="h-auto lg:h-screen w-full relative overflow-visible lg:overflow-hidden flex flex-col lg:flex-shrink-0">
            {/* Background Gradient */}
            <div className="absolute inset-0 z-0 pointer-events-none">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(190,227,237,0.15)_0%,transparent_60%)]" />
            </div>

            {/* Top Header */}
            <header className="relative lg:absolute lg:top-0 lg:left-0 lg:right-0 z-50 w-full px-4 sm:px-10 pt-6 sm:pt-8 pb-2 lg:pt-10 lg:pb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 pointer-events-auto lg:pointer-events-none">
              <div className="flex items-center gap-4 pointer-events-auto w-full sm:w-auto">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight text-slate-900 m-0" style={{ fontFamily: "var(--font-plus-jakarta), 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
                    AWS Region Intelligence
                  </h1>
                  <p className="text-slate-400 text-[10px] sm:text-xs font-medium tracking-wider uppercase mt-1.5 leading-relaxed m-0">
                    Interactive 3D explorer visualizing global cloud infrastructure partitions
                  </p>
                </div>
              </div>
              {userRole === "core" && (
                <div className="pointer-events-auto shrink-0 mt-1 sm:mt-0">
                  <Link
                    href="/core/manage-regions"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[11px] font-bold transition-all shadow-xs hover:-translate-y-0.5 cursor-pointer uppercase tracking-wider"
                  >
                    <Settings2 size={13} className="text-[#FF9900]" />
                    <span>Manage Regions</span>
                  </Link>
                </div>
              )}
            </header>

            <div className="flex-grow flex flex-col lg:flex-row relative z-10 pt-4 lg:pt-32 pb-6 lg:pb-10 px-4 sm:px-10 gap-6 lg:gap-8 h-auto lg:h-full overflow-visible lg:overflow-hidden">

              {/* MOBILE REGION DROPDOWN SELECTOR (visible only on mobile) */}
              <div className="relative w-full lg:hidden z-30">
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="w-full bg-white border border-slate-200/80 rounded-2xl px-4 py-3.5 shadow-sm flex items-center justify-between transition-all hover:bg-slate-50 cursor-pointer select-none active:scale-[0.99] duration-150"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    {selectedRegion ? (
                      <>
                        <FlagImage flag={selectedRegion.flagUrl || selectedRegion.flag} name={selectedRegion.name} className="w-5.5 h-3.5 object-contain flex-shrink-0 rounded-sm border border-slate-200/50 shadow-xs" />
                        <span className="text-[13px] font-bold text-slate-800 truncate">
                          {selectedRegion.name}
                        </span>
                      </>
                    ) : (
                      <>
                        <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                        <span className="text-[13px] font-bold text-slate-500">
                          Select AWS Region...
                        </span>
                      </>
                    )}
                  </div>
                  <ChevronDown className={cn("h-4 w-4 text-slate-400 transition-transform duration-200 shrink-0", isMobileMenuOpen ? "rotate-180" : "")} />
                </button>

                <AnimatePresence>
                  {isMobileMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute left-0 right-0 mt-2 bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-2xl shadow-xl z-50 p-4 max-h-[320px] overflow-y-auto premium-scrollbar"
                    >
                      <p className="text-[9.5px] font-extrabold text-slate-400 uppercase tracking-wider mb-2.5 px-2">Global AWS Regions</p>
                      
                      <div className="flex flex-col gap-3">
                        {sidebarCategories.map((cat) => {
                          if (cat.regionIds.length === 0) return null;
                          return (
                            <div key={cat.id} className="flex flex-col gap-1">
                              <div className="flex items-center gap-2 px-2 py-1">
                                <FlagImage flag={cat.flag} name={cat.name} className="w-4 h-2.5 object-contain rounded-xs border border-slate-200/50" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{cat.name}</span>
                              </div>
                              
                              <div className="flex flex-col gap-1 pl-1 border-l border-slate-100">
                                {cat.regionIds.map((rId) => {
                                  const r = regions.find(region => region.id === rId);
                                  if (!r) return null;
                                  const isSubSelected = selectedRegion?.id === r.id;
                                  return (
                                    <button
                                      key={r.id}
                                      onClick={() => {
                                        handleRegionSelect(r);
                                        setIsMobileMenuOpen(false);
                                      }}
                                      className={cn(
                                        "w-full px-3 py-2 rounded-lg text-left transition-all flex items-center justify-between select-none cursor-pointer",
                                        isSubSelected
                                          ? "bg-[#0073BB]/8 text-[#0073BB] font-extrabold"
                                          : "hover:bg-slate-50 text-slate-650 font-semibold text-[11.5px]"
                                      )}
                                    >
                                      <span className="text-[11.5px] truncate">{r.name}</span>
                                      {isSubSelected && <CheckCircle2 size={12} className="text-[#0073BB] shrink-0" />}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* LEFT SIDEBAR: REGION NAVIGATION (visible only on desktop) */}
              <motion.aside
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="hidden lg:flex w-72 flex-col gap-4 z-20"
              >
                <div className="bg-white/80 backdrop-blur-xl border border-slate-100 rounded-3xl p-4 sm:p-6 h-auto lg:h-full flex flex-col shadow-sm">

                  {/* Header */}
                  <div className="mb-4 pb-4 border-b border-slate-100/80">
                    <p className="text-[10px] sm:text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1.5">Global Regions</p>
                    <p className="text-[11.5px] sm:text-[12px] font-semibold text-slate-500 leading-snug">Select a region to begin exploration.</p>
                  </div>

                  {/* Region list */}
                  <div className="flex flex-col gap-1 flex-grow overflow-y-auto max-h-48 lg:max-h-none premium-scrollbar">
                    {sidebarCategories.map((cat) => {
                      const isExpanded = expandedCategory === cat.id;
                      const hasActiveChild = cat.regionIds.includes(selectedRegion?.id || '');

                      if (cat.regionIds.length === 0) return null;

                      return (
                        <div key={cat.id} className="flex flex-col">
                          <button
                            onClick={() => {
                              const nextExpanded = isExpanded ? null : cat.id;
                              setExpandedCategory(nextExpanded);
                              if (nextExpanded) {
                                const firstRegion = regions.find(r => r.id === cat.regionIds[0]);
                                if (firstRegion) handleRegionSelect(firstRegion);
                              }
                            }}
                            className={cn(
                              "w-full px-3 py-2.5 rounded-xl flex items-center justify-between transition-all text-left group border border-transparent select-none cursor-pointer",
                              hasActiveChild
                                ? "bg-slate-900 text-white shadow-sm border-slate-900"
                                : isExpanded
                                  ? "bg-slate-100 text-slate-900 border-slate-200/50"
                                  : "hover:bg-slate-50 text-slate-700"
                            )}
                          >
                            <div className="flex items-center gap-3 truncate">
                              <FlagImage flag={cat.flag} name={cat.name} className="w-5.5 h-3.5 object-contain flex-shrink-0 rounded-sm border border-slate-200/50 shadow-xs" />
                              <span className="text-[11px] sm:text-[12px] font-black tracking-wide truncate uppercase">{cat.name}</span>
                            </div>
                            <ChevronRight size={12} className={cn(
                              "flex-shrink-0 transition-transform duration-200",
                              isExpanded ? "rotate-90" : "",
                              hasActiveChild
                                ? "text-white/60"
                                : isExpanded
                                  ? "text-slate-600"
                                  : "text-slate-400"
                            )} />
                          </button>

                          {/* Sub-regions */}
                          <AnimatePresence initial={false}>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2, ease: 'easeInOut' }}
                                className="overflow-hidden ml-1 mt-2 flex flex-col gap-1.5"
                              >
                                {cat.regionIds.map((rId) => {
                                  const r = regions.find(region => region.id === rId);
                                  if (!r) return null;
                                  const isSubSelected = selectedRegion?.id === r.id;

                                  return (
                                    <button
                                      key={r.id}
                                      onClick={() => handleRegionSelect(r)}
                                      className={cn(
                                        "w-full px-3.5 py-2.5 rounded-xl text-left transition-all flex items-center justify-between border border-slate-100/50 select-none cursor-pointer group/sub",
                                        isSubSelected
                                          ? "bg-gradient-to-r from-sky-50 to-white border-sky-200/80 text-sky-600 font-extrabold shadow-sm"
                                          : "bg-white text-slate-650 hover:text-slate-800 hover:bg-slate-50/50 hover:border-slate-200/60 font-semibold"
                                      )}
                                    >
                                      <div className="flex items-center gap-2 truncate">
                                        <span className={cn(
                                          "w-1.5 h-1.5 rounded-full flex-shrink-0 transition-colors",
                                          isSubSelected ? "bg-sky-500 animate-pulse" : "bg-slate-300"
                                        )} />
                                        <span className="text-[11.5px] tracking-tight truncate">{r.name}</span>
                                      </div>
                                      {isSubSelected ? (
                                        <CheckCircle2 size={12} className="text-sky-500 shrink-0" />
                                      ) : (
                                        <ChevronRight size={11} className="text-slate-300 group-hover/sub:text-slate-400 shrink-0 transition-colors" />
                                      )}
                                    </button>
                                  );
                                })}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.aside>

              {/* CENTER: GLOBE ALIGNMENT */}
              <div className="flex-grow relative flex items-center justify-center min-h-[300px] sm:min-h-0 mt-4 lg:mt-0">
                <div className="w-[340px] h-[340px] max-w-[95vw] max-h-[95vw] sm:w-[500px] sm:h-[500px] lg:w-[850px] lg:h-[850px] relative pointer-events-auto">
                  <GlobeScene
                    regions={normalizedRegions.filter(r => visibleRegionIds.has(r.id))}
                    onSelectRegion={handleRegionSelect}
                    selectedRegion={selectedRegion}
                  />
                </div>
              </div>
            </div>

            {/* Bottom Status Bar (hidden on mobile, visible on desktop) */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 pointer-events-none hidden md:block">
              <div className="flex items-center gap-2.5 px-5 py-2.5 bg-white/90 backdrop-blur-xl border border-slate-200/60 rounded-full shadow-sm pointer-events-auto">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-xs font-semibold text-slate-500 tracking-wide whitespace-nowrap">Region Intelligence Active</span>
              </div>
            </div>

            {/* FLOATING BRIEF MODAL */}
            <AnimatePresence>
              {selectedRegion && !showIntelligence && (
                <RegionBriefModal
                  region={selectedRegion}
                  onClose={() => setSelectedRegion(null)}
                  onExplore={() => {
                    window.history.pushState({ view: 'details', regionId: selectedRegion.id }, '');
                    setShowIntelligence(true);
                  }}
                />
              )}
            </AnimatePresence>

            {/* Scroll Down Floating Indicator */}
            <div
              className="absolute bottom-8 right-4 sm:bottom-10 sm:right-10 z-20 animate-bounce cursor-pointer pointer-events-auto bg-white/95 backdrop-blur-md p-3 sm:p-4 rounded-full border border-slate-200/60 shadow-none flex items-center justify-center hover:bg-slate-50 transition-colors"
              onClick={() => {
                const catalogEl = document.getElementById("services-catalog-anchor");
                if (catalogEl) {
                  catalogEl.scrollIntoView({ behavior: "smooth" });
                }
              }}
              title="Scroll down to AWS Services Catalog"
            >
              <ArrowDown className="text-[#FF9900] h-3.5 w-3.5 sm:h-4.5 sm:w-4.5" />
            </div>
          </div>

          {/* Catalog wrapper stacked below the globe scene */}
          <div id="services-catalog-anchor" className="w-full">
            <ServicesCatalog />
          </div>
        </motion.section>
        ) : (
          /* SECTION 2: INTELLIGENCE HUB (DETAILS VIEW) */
          <motion.div
            key="intelligence-hub"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            className="w-full min-h-screen bg-slate-950 z-50 flex flex-col"
          >
            {selectedRegion && (
              <IntelligenceDashboard
                region={selectedRegion}
                onBack={() => {
                  window.history.back();
                }}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

    </main>
  );
}

function RegionBriefModal({ region, onClose, onExplore }: { region: AWSRegionData, onClose: () => void, onExplore: () => void }) {
  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0, y: 16 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.95, opacity: 0, y: 16 }}
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
      className="absolute bottom-20 left-4 right-4 sm:left-auto sm:right-10 z-[100] w-auto sm:w-[360px] overflow-hidden rounded-2xl shadow-[0_20px_60px_-10px_rgba(0,0,0,0.12)] border border-slate-100/80 bg-white"
    >
      <div className="p-6 flex flex-col gap-5">

        {/* Header row: flag + close */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center overflow-hidden">
              <FlagImage flag={region.flagUrl || region.flag} name={region.name} className="w-8 h-6 object-contain" />
            </div>
            <div>
              <h3 className="text-[17px] font-bold tracking-tight text-slate-900 leading-tight">{region.name}</h3>
              <p className="text-[10px] font-semibold text-[#0073BB] uppercase tracking-[0.1em] mt-0.5">AWS Infrastructure Region</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-all text-sm"
          >
            ✕
          </button>
        </div>

        {/* Divider */}
        <div className="h-px bg-slate-100" />

        {/* Description */}
        <p className="text-[13px] text-slate-500 font-normal leading-relaxed">
          {region.infrastructure}
        </p>

        {/* CTA */}
        <button
          onClick={onExplore}
          className="w-full py-3 bg-[#1A1C1E] hover:bg-[#0073BB] text-white rounded-xl font-semibold text-[12px] tracking-wide flex items-center justify-center gap-2 transition-all duration-200"
        >
          Explore Specification <ArrowDown size={13} />
        </button>

      </div>
    </motion.div>
  );
}
