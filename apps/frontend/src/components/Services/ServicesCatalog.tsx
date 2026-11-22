"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Search,
  BookOpen,
  Star,
  HelpCircle,
  Settings2
} from "lucide-react";
import {
  fetchServices,
  fetchServiceCategories,
  AWSServiceSummary,
  AWSServiceCategory
} from "@/lib/api";
import ServiceDetailsModal from "./ServiceDetailsModal";

interface ServicesCatalogProps {
  userRole?: string | null;
}

export default function ServicesCatalog({ userRole: propUserRole }: ServicesCatalogProps = {}) {
  const [services, setServices] = useState<AWSRegionSummary[]>([]);
  const [categories, setCategories] = useState<AWSServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string>("all");
  const [showOnlyFeatured, setShowOnlyFeatured] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Selected Service ID for Modal
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);

  // Responsive columns state
  const [columns, setColumns] = useState(4);
  const containerRef = useRef<HTMLDivElement>(null);

  // User role state
  const [userRole, setUserRole] = useState<string | null>(propUserRole ?? null);

  useEffect(() => {
    if (propUserRole !== undefined) {
      setUserRole(propUserRole ? propUserRole.toLowerCase().trim() : null);
    }
  }, [propUserRole]);

  useEffect(() => {
    if (propUserRole !== undefined) return;
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
            .catch(() => {});
        }
      }
    } catch { /* ignore */ }
  }, [propUserRole]);

  type AWSRegionSummary = AWSServiceSummary;

  // Load services and categories
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [servicesData, categoriesData] = await Promise.all([
          fetchServices(),
          fetchServiceCategories()
        ]);
        setServices(servicesData);
        setCategories(categoriesData);
      } catch (err: any) {
        console.error("Failed to load catalog data:", err);
        setError("Could not load AWS services catalog. Please check your backend connection.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Role calculation: enthusiasts (and visitors) see ONLY featured services
  const isEnthusiast = userRole !== "core" && userRole !== "crew";

  // Filter services by role restriction: enthusiasts see ONLY featured services, not other than that
  const servicesForRole = useMemo(() => {
    if (!isEnthusiast) return services;
    return services.filter(service => Boolean(service.isFeatured));
  }, [services, isEnthusiast]);

  // Responsive columns logic based on container width
  useEffect(() => {
    const updateColumns = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      if (width < 640) {
        setColumns(1);
      } else if (width < 1024) {
        setColumns(2);
      } else if (width < 1280) {
        setColumns(3);
      } else {
        setColumns(4);
      }
    };

    updateColumns();
    window.addEventListener("resize", updateColumns);
    return () => window.removeEventListener("resize", updateColumns);
  }, [servicesForRole]);

  // Filter categories to only those containing services visible to the role
  const visibleCategories = useMemo(() => {
    const activeCategoryIds = new Set(servicesForRole.map(s => s.categoryId));
    return categories.filter(cat => activeCategoryIds.has(cat.id));
  }, [categories, servicesForRole]);

  // Category counts map for interactive pill badges
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: servicesForRole.length };
    servicesForRole.forEach(s => {
      if (s.category?.slug) {
        counts[s.category.slug] = (counts[s.category.slug] || 0) + 1;
      }
    });
    return counts;
  }, [servicesForRole]);

  // Filter services locally for instant speed
  const filteredServices = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return servicesForRole.filter(service => {
      // Search filter
      const matchesSearch = !q || (
        (service.name?.toLowerCase().includes(q) ?? false) ||
        (service.serviceCode?.toLowerCase().includes(q) ?? false) ||
        (service.shortDescription?.toLowerCase().includes(q) ?? false) ||
        (service.category?.name?.toLowerCase().includes(q) ?? false)
      );

      // Category filter
      const matchesCategory =
        selectedCategorySlug === "all" ||
        service.category?.slug === selectedCategorySlug;

      // Featured filter: enthusiasts already only have featured services; for core/crew use the toggle
      const matchesFeatured = isEnthusiast ? true : (!showOnlyFeatured || service.isFeatured);

      // Status filter
      const matchesStatus =
        statusFilter === "all" || service.status === statusFilter;

      // Active state check
      const matchesActive = service.isActive !== false;

      return matchesSearch && matchesCategory && matchesFeatured && matchesStatus && matchesActive;
    });
  }, [servicesForRole, searchQuery, selectedCategorySlug, showOnlyFeatured, statusFilter, isEnthusiast]);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

  return (
    <section className="w-full min-h-screen py-10 px-4 sm:px-10 bg-transparent relative flex flex-col items-center">
      <div ref={containerRef} className="max-w-7xl w-full flex flex-col gap-7 z-10">

        {/* ── Sticky Catalog Header & Filter Controls ── */}
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md -mx-4 px-4 sm:-mx-6 sm:px-6 pt-5 pb-5 border-b border-slate-200/80 flex flex-col gap-6">
          {/* Header Row (Standard Core Breadcrumb Layout) */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5">
            <div className="max-w-2xl">
              {/* Breadcrumb Path */}
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 mb-2 select-none">
                <span className="hover:text-[#FF9900] transition-colors font-semibold">AWS SBG REC</span>
                <span className="text-slate-300">/</span>
                <span className="text-[#FF9900] font-semibold">Services Directory</span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <h2
                  className="font-display text-2xl sm:text-3xl font-semibold leading-tight tracking-tight text-slate-900 m-0"
                  style={{ fontWeight: 600 }}
                >
                  AWS Services Catalog
                </h2>
                {userRole === "core" && (
                  <Link
                    href="/core/services"
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-[6px] text-xs font-semibold transition-all shadow-xs hover:-translate-y-0.5 whitespace-nowrap shrink-0 cursor-pointer self-start sm:self-auto"
                  >
                    <Settings2 size={13} className="text-[#FF9900]" />
                    <span>Manage Services</span>
                  </Link>
                )}
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-500 m-0">
                {isEnthusiast
                  ? "Featured AWS global cloud services curated for cloud enthusiasts."
                  : "Comprehensive reference covering major AWS global cloud service offerings."}
              </p>
            </div>
          </div>

          {/* Filter Controls */}
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
              {/* Search */}
              <div className={cn(isEnthusiast ? "lg:col-span-8" : "lg:col-span-6", "relative")}>
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                <input
                  type="text"
                  placeholder={isEnthusiast ? "Search featured services by code, name, category, or description..." : "Search by service code, name, category, or description..."}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200/90 hover:border-slate-300 focus:border-[#FF9900] focus:ring-2 focus:ring-[#FF9900]/10 focus:outline-none rounded-xl text-xs sm:text-[13px] font-normal transition-all text-slate-800 placeholder:text-slate-400 shadow-xs"
                />
              </div>

              {/* Status Dropdown */}
              <div className={isEnthusiast ? "lg:col-span-4" : "lg:col-span-3"}>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200/90 hover:border-slate-300 focus:border-[#FF9900] focus:ring-2 focus:ring-[#FF9900]/10 focus:outline-none rounded-xl text-xs sm:text-[13px] font-medium text-slate-700 cursor-pointer transition-all shadow-xs"
                >
                  <option value="all">All Launch Statuses</option>
                  <option value="GA">General Availability (GA)</option>
                  <option value="Deprecated">Deprecated</option>
                </select>
              </div>

              {/* Featured Toggle (only for core/crew who view all services) */}
              {!isEnthusiast && (
                <div className="lg:col-span-3">
                  <button
                    onClick={() => setShowOnlyFeatured(!showOnlyFeatured)}
                    className={cn(
                      "w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl border transition-all text-xs font-semibold shadow-xs cursor-pointer select-none active:scale-98",
                      showOnlyFeatured
                        ? "bg-amber-50/90 border-amber-300 text-amber-700 font-bold"
                        : "bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50 text-slate-600 font-medium"
                    )}
                  >
                    <Star size={13} className={showOnlyFeatured ? "fill-amber-500 stroke-none" : "text-slate-400"} />
                    <span>Featured Services Only</span>
                  </button>
                </div>
              )}
            </div>

            {/* Category Filter Pills with count badges */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider select-none">Filter by Cloud Category</span>
              <div className="relative w-full overflow-hidden">
                {/* Fade gradient overlay for visual scroll cue on mobile */}
                <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white via-white/80 to-transparent pointer-events-none z-10 md:hidden" />
                
                <div 
                  className="flex items-center gap-2 overflow-x-auto pb-1.5 scroll-smooth no-scrollbar select-none"
                  style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                  {/* All Categories Pill */}
                  <button
                    onClick={() => setSelectedCategorySlug("all")}
                    className={cn(
                      "flex items-center gap-2 rounded-[8px] px-3.5 py-1.5 text-xs transition-all cursor-pointer select-none active:scale-95 border shrink-0",
                      selectedCategorySlug === "all"
                        ? "bg-orange-50/90 border-orange-300 text-[#FF9900] font-semibold shadow-xs"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 font-medium"
                    )}
                  >
                    <span>All Categories</span>
                    <span
                      className={cn(
                        "inline-flex items-center justify-center rounded-[5px] h-4.5 min-w-[20px] px-1 text-[10px] font-semibold leading-none border",
                        selectedCategorySlug === "all"
                          ? "bg-orange-100/60 border-orange-200 text-[#FF9900]"
                          : "bg-slate-100/70 border-slate-200 text-slate-400"
                      )}
                    >
                      {categoryCounts.all}
                    </span>
                  </button>

                  {/* Category Pills */}
                  {visibleCategories.map(cat => {
                    const count = categoryCounts[cat.slug] ?? 0;
                    const isActive = selectedCategorySlug === cat.slug;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategorySlug(cat.slug)}
                        className={cn(
                          "flex items-center gap-2 rounded-[8px] px-3.5 py-1.5 text-xs transition-all cursor-pointer select-none active:scale-95 border shrink-0",
                          isActive
                            ? "bg-orange-50/90 border-orange-300 text-[#FF9900] font-semibold shadow-xs"
                            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 font-medium"
                        )}
                      >
                        <span>{cat.name}</span>
                        <span
                          className={cn(
                            "inline-flex items-center justify-center rounded-[5px] h-4.5 min-w-[20px] px-1 text-[10px] font-semibold leading-none border",
                            isActive
                              ? "bg-orange-100/60 border-orange-200 text-[#FF9900]"
                              : "bg-slate-100/70 border-slate-200 text-slate-400"
                          )}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Grid / States ── */}
        {loading ? (
          <div className="h-[400px] flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-[3px] border-[#FF9900]/20 border-t-[#FF9900] rounded-full animate-spin" />
            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-normal">Loading AWS Catalog...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-8 text-center text-red-500 text-sm">
            {error}
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center shadow-sm">
            <HelpCircle size={36} className="text-slate-300 mx-auto mb-3" />
            <h4 className="text-base font-semibold text-slate-700 mb-1">No services found</h4>
            <p className="text-slate-400 text-[12px] max-w-sm mx-auto">
              Try adjusting your search or filters.
            </p>
          </div>
        ) : (
          <div className="w-full pb-16">
            <div
              className="grid gap-4 w-full"
              style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
            >
              {filteredServices.map(service => {
                const iconSrc = service.iconUrl?.startsWith('http') || service.iconUrl?.startsWith('/')
                  ? service.iconUrl
                  : (service.iconUrl ? `${API_URL}/${service.iconUrl}` : '/fallback.svg');

                return (
                  <div
                    key={service.id}
                    onClick={() => setSelectedServiceId(service.id)}
                    className="bg-white border border-slate-200/60 rounded-xl p-4 sm:p-5 hover:border-[#E68000]/50 hover:shadow-[0_4px_14px_-2px_rgba(230,128,0,0.24),0_2px_6px_-1px_rgba(230,128,0,0.14)] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col group relative overflow-hidden min-h-[174px]"
                  >
                    {/* Featured badge for Core & Crew only */}
                    {!isEnthusiast && service.isFeatured && (
                      <div className="absolute top-3.5 right-3.5 pointer-events-none">
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[5px] bg-amber-50/90 border border-amber-200/80 text-[9px] font-semibold text-amber-700 tracking-wide select-none shadow-2xs">
                          <Star size={8.5} className="fill-amber-500 text-amber-500" />
                          <span>Featured</span>
                        </span>
                      </div>
                    )}

                    {/* Icon + meta */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0">
                        <img
                          src={iconSrc}
                          alt={service.name}
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = "/fallback.svg";
                          }}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className={cn("min-w-0", !isEnthusiast && service.isFeatured ? "pr-14" : "")}>
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">{service.serviceCode}</span>
                          {service.status !== "GA" && (
                            <span className="px-1.5 py-0.5 text-[8px] font-semibold bg-amber-50 text-amber-500 rounded border border-amber-100 leading-none">
                              {service.status}
                            </span>
                          )}
                        </div>
                        <h4 className="text-[14px] font-semibold text-slate-800 truncate group-hover:text-[#E68000] transition-colors leading-tight">
                          {service.name}
                        </h4>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-[11.5px] text-slate-400 leading-relaxed line-clamp-2 flex-grow">
                      {service.shortDescription}
                    </p>

                    {/* Footer */}
                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] font-medium text-slate-400 truncate max-w-[60%]">
                        {service.category?.name || "AWS Core"}
                      </span>
                      <span className="text-[10px] font-medium text-[#E68000] opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1">
                        View <BookOpen size={10} />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedServiceId && (
        <ServiceDetailsModal
          id={selectedServiceId}
          onClose={() => setSelectedServiceId(null)}
          onNavigateService={(id) => {
            setSelectedServiceId(id);
          }}
          allServices={servicesForRole}
          userRole={userRole}
        />
      )}
    </section>
  );
}

