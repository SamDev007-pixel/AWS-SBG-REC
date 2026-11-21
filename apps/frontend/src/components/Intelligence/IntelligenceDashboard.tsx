"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ChevronRight, ArrowUpRight } from 'lucide-react';
import { AWSRegionData } from '@/lib/api';
import FlagImage from '../Layout/FlagImage';

interface IntelligenceDashboardProps {
  region: AWSRegionData;
  onBack: () => void;
}

export default function IntelligenceDashboard({ region, onBack }: IntelligenceDashboardProps) {
  const [activeTab, setActiveTab] = useState<'infrastructure' | 'services' | 'compliance'>('infrastructure');

  // Extract compliance list from database field
  const complianceBadges = region.compliance
    ? region.compliance.split(',').map(c => c.trim()).filter(Boolean)
    : [];

  const topServices = region.topServices || [];
  const aiCapabilities = region.aiCapabilities || [];
  const workloads = region.workloads || [];
  const benefits = region.benefits || [];
  const regionalServices = region.services || [];

  return (
    <div className="w-full min-h-screen text-slate-900 font-sans bg-[#F9FAFB] pb-16">
      
      {/* ── Top Navigation Bar ── */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium text-xs transition-colors cursor-pointer"
            >
              <ArrowLeft size={13} className="text-slate-500" />
              <span>Back to Services</span>
            </button>
            <div className="h-4 w-px bg-slate-200 hidden sm:block" />
            <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 select-none">
              <span className="font-semibold text-slate-700">AWS Infrastructure</span>
              <span className="text-slate-300">/</span>
              <span>{region.category || 'Global'}</span>
              <span className="text-slate-300">/</span>
              <span className="text-slate-900 font-semibold">{region.name}</span>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              Active (GA)
            </span>
            <span className="px-2 py-0.5 rounded-[4px] bg-slate-100 border border-slate-200 text-slate-700 text-xs font-mono font-medium">
              {region.code || region.id}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 flex flex-col gap-6">

        {/* ── Hero Region Profile Header ── */}
        <section className="bg-white border border-slate-200 rounded-[6px] p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <FlagImage
              flag={region.flagUrl || region.flag}
              name={region.name}
              className="w-[58px] h-[38px] sm:w-[64px] sm:h-[42px] rounded-none border border-slate-300 shadow-2xs shrink-0"
              imgClassName="w-full h-full object-cover rounded-none"
            />

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-slate-900 m-0">
                  {region.name}
                </h1>
                <span className="px-2 py-0.5 text-xs font-mono font-medium bg-slate-100 text-slate-700 rounded-[4px] border border-slate-200">
                  {region.code || region.id}
                </span>
                {region.category && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-700 rounded-[4px] border border-slate-200">
                    {region.category}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
                {region.primaryLocation && (
                  <span>Primary Location: <strong className="text-slate-900 font-medium">{region.primaryLocation}</strong></span>
                )}
                {region.launchYear && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span>Launched: <strong className="text-slate-900 font-medium">{region.launchYear}</strong></span>
                  </>
                )}
                {region.compliance && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span>Compliance: <strong className="text-slate-900 font-medium">{region.compliance}</strong></span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Core KPI Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100">
            <div className="flex flex-col items-center justify-center px-4 py-2.5 rounded-[4px] bg-slate-50 border border-slate-200 min-w-[95px] text-center">
              <span className="text-[11px] font-medium text-slate-500">Availability</span>
              <span className="text-base font-semibold text-slate-900">{region.availabilityZones || 3} AZs</span>
            </div>
            <div className="flex flex-col items-center justify-center px-4 py-2.5 rounded-[4px] bg-slate-50 border border-slate-200 min-w-[95px] text-center">
              <span className="text-[11px] font-medium text-slate-500">Services</span>
              <span className="text-base font-semibold text-slate-900">{region.totalServices || "Standard"}</span>
            </div>
            <div className="flex flex-col items-center justify-center px-4 py-2.5 rounded-[4px] bg-slate-50 border border-slate-200 min-w-[95px] text-center">
              <span className="text-[11px] font-medium text-slate-500">Edge PoPs</span>
              <span className="text-base font-semibold text-slate-900">{region.edgeLocations || "Local"}</span>
            </div>
            <div className="flex flex-col items-center justify-center px-4 py-2.5 rounded-[4px] bg-slate-50 border border-slate-200 min-w-[95px] text-center">
              <span className="text-[11px] font-medium text-slate-500">Direct Connect</span>
              <span className="text-base font-semibold text-slate-900">{region.directConnect || "Available"}</span>
            </div>
          </div>
        </section>

        {/* ── Segmented Navigation Tabs ── */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <div className="inline-flex items-center gap-1 bg-slate-100 p-1 rounded-[4px] border border-slate-200">
            <button
              onClick={() => setActiveTab('infrastructure')}
              className={`px-3.5 py-1.5 rounded-[3px] text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'infrastructure'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Infrastructure Specifications
            </button>
            <button
              onClick={() => setActiveTab('services')}
              className={`px-3.5 py-1.5 rounded-[3px] text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'services'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Services & AI Capabilities
            </button>
            <button
              onClick={() => setActiveTab('compliance')}
              className={`px-3.5 py-1.5 rounded-[3px] text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'compliance'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Connectivity & Compliance
            </button>
          </div>

          <span className="text-xs text-slate-400 font-mono hidden sm:inline-block">
            {region.id}
          </span>
        </div>

        {/* ── Tab Content Panels ── */}
        <AnimatePresence mode="wait">
          {activeTab === 'infrastructure' && (
            <motion.div
              key="tab-infrastructure"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full"
            >
              {/* Panel 1: Regional Specifications */}
              <div className="bg-white border border-slate-200 rounded-[6px] p-5 sm:p-6 flex flex-col justify-between">
                <div>
                  <div className="pb-3 border-b border-slate-100 mb-4">
                    <h2 className="text-sm font-semibold text-slate-900 m-0">Regional Specifications</h2>
                    <p className="text-xs text-slate-500 m-0 mt-0.5">Physical deployment and network performance parameters</p>
                  </div>

                  <div className="flex flex-col divide-y divide-slate-100 text-xs">
                    <div className="flex items-center justify-between py-2.5">
                      <span className="text-slate-500 font-medium">Availability Zones</span>
                      <span className="font-medium text-slate-900">{region.availabilityZones || 3} Zones</span>
                    </div>
                    <div className="flex items-center justify-between py-2.5">
                      <span className="text-slate-500 font-medium">Launch Year</span>
                      <span className="font-medium text-slate-900">{region.launchYear || "N/A"}</span>
                    </div>
                    <div className="flex items-center justify-between py-2.5">
                      <span className="text-slate-500 font-medium">Primary Location</span>
                      <span className="font-medium text-slate-900">{region.primaryLocation || region.name}</span>
                    </div>
                    <div className="flex items-center justify-between py-2.5">
                      <span className="text-slate-500 font-medium">Latency Profile</span>
                      <span className="font-medium text-slate-900">{region.latency || "Standard low-latency routing"}</span>
                    </div>
                    <div className="flex items-center justify-between py-2.5">
                      <span className="text-slate-500 font-medium">Regional Reach</span>
                      <span className="font-medium text-slate-900">{region.reach || region.category || "Regional"}</span>
                    </div>
                  </div>
                </div>

                {region.infrastructure && (
                  <div className="mt-5 pt-4 border-t border-slate-100">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                      Infrastructure Summary
                    </span>
                    <p className="text-xs text-slate-700 leading-relaxed m-0">
                      {region.infrastructure}
                    </p>
                  </div>
                )}
              </div>

              {/* Panel 2: Benefits & Workloads */}
              <div className="bg-white border border-slate-200 rounded-[6px] p-5 sm:p-6 flex flex-col justify-between">
                <div>
                  <div className="pb-3 border-b border-slate-100 mb-4">
                    <h2 className="text-sm font-semibold text-slate-900 m-0">Workloads & Operational Benefits</h2>
                    <p className="text-xs text-slate-500 m-0 mt-0.5">Deployment recommendations and region advantages</p>
                  </div>

                  {benefits.length > 0 && (
                    <div className="mb-5">
                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                        Region Benefits
                      </span>
                      <div className="flex flex-col gap-1.5">
                        {benefits.map((b, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs text-slate-800">
                            <span className="text-slate-400 font-bold mt-0.5">•</span>
                            <span>{b}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {workloads.length > 0 && (
                    <div>
                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                        Common Workloads
                      </span>
                      <div className="flex flex-col gap-1.5">
                        {workloads.map((w, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs text-slate-800">
                            <span className="text-slate-400 font-bold mt-0.5">•</span>
                            <span>{w}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Region Code: <strong className="font-mono text-slate-800 font-semibold">{region.id}</strong></span>
                  <span>Category: <strong className="text-slate-800 font-semibold">{region.category || "AWS Global"}</strong></span>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'services' && (
            <motion.div
              key="tab-services"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full"
            >
              {/* Panel 1: Service Catalog Metrics & Top Services */}
              <div className="bg-white border border-slate-200 rounded-[6px] p-5 sm:p-6 flex flex-col justify-between">
                <div>
                  <div className="pb-3 border-b border-slate-100 mb-4">
                    <h2 className="text-sm font-semibold text-slate-900 m-0">Available Services</h2>
                    <p className="text-xs text-slate-500 m-0 mt-0.5">Overview of supported service categories and core offerings</p>
                  </div>

                  {/* Quantitative Metrics */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
                    <div className="p-2.5 rounded-[4px] bg-slate-50 border border-slate-200 text-center">
                      <span className="text-[11px] font-medium text-slate-500 block">Total</span>
                      <span className="text-sm font-semibold text-slate-900">{region.totalServices || "Standard"}</span>
                    </div>
                    <div className="p-2.5 rounded-[4px] bg-slate-50 border border-slate-200 text-center">
                      <span className="text-[11px] font-medium text-slate-500 block">AI / ML</span>
                      <span className="text-sm font-semibold text-slate-900">{region.aimlServices || "Available"}</span>
                    </div>
                    <div className="p-2.5 rounded-[4px] bg-slate-50 border border-slate-200 text-center">
                      <span className="text-[11px] font-medium text-slate-500 block">Analytics</span>
                      <span className="text-sm font-semibold text-slate-900">{region.analyticsServices || "Available"}</span>
                    </div>
                    <div className="p-2.5 rounded-[4px] bg-slate-50 border border-slate-200 text-center">
                      <span className="text-[11px] font-medium text-slate-500 block">Networking</span>
                      <span className="text-sm font-semibold text-slate-900">{region.networkingServices || "Available"}</span>
                    </div>
                  </div>

                  {topServices.length > 0 && (
                    <div>
                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                        Core AWS Services Available
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {topServices.map((srv, i) => (
                          <span key={i} className="px-2.5 py-1 rounded-[4px] bg-slate-100 border border-slate-200 text-slate-800 text-xs font-medium">
                            {srv}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500">Need specific service availability?</span>
                  <button
                    onClick={onBack}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-slate-900 hover:text-[#FF9900] transition-colors cursor-pointer"
                  >
                    <span>Browse Service Directory</span>
                    <ArrowUpRight size={13} />
                  </button>
                </div>
              </div>

              {/* Panel 2: AI Capabilities & Regional Services */}
              <div className="bg-white border border-slate-200 rounded-[6px] p-5 sm:p-6 flex flex-col justify-between">
                <div>
                  <div className="pb-3 border-b border-slate-100 mb-4">
                    <h2 className="text-sm font-semibold text-slate-900 m-0">AI Capabilities & Solutions</h2>
                    <p className="text-xs text-slate-500 m-0 mt-0.5">Machine learning offerings and registered regional capabilities</p>
                  </div>

                  {aiCapabilities.length > 0 && (
                    <div className="mb-5">
                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                        AI & Machine Learning Capabilities
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {aiCapabilities.map((cap, i) => (
                          <span key={i} className="px-2.5 py-1 rounded-[4px] bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium">
                            {cap}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {regionalServices.length > 0 && (
                    <div>
                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                        Supported Regional Solutions
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {regionalServices.map((s, i) => (
                          <span key={i} className="px-2.5 py-1 rounded-[4px] bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 text-xs text-slate-500">
                  Regional service catalog updated from active AWS infrastructure manifest.
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'compliance' && (
            <motion.div
              key="tab-compliance"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full"
            >
              {/* Panel 1: Compliance Standards */}
              <div className="bg-white border border-slate-200 rounded-[6px] p-5 sm:p-6 flex flex-col justify-between">
                <div>
                  <div className="pb-3 border-b border-slate-100 mb-4">
                    <h2 className="text-sm font-semibold text-slate-900 m-0">Audited Compliance Standards</h2>
                    <p className="text-xs text-slate-500 m-0 mt-0.5">Certifications and regional regulatory accreditations</p>
                  </div>

                  {complianceBadges.length > 0 ? (
                    <div>
                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                        Recognized Frameworks
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {complianceBadges.map((comp, i) => (
                          <span key={i} className="px-3 py-1.5 rounded-[4px] bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900">
                            {comp}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 m-0">
                      Standard international AWS cloud compliance attestations apply.
                    </p>
                  )}
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 text-xs text-slate-500">
                  Compliance accreditations are verified periodically by third-party auditors.
                </div>
              </div>

              {/* Panel 2: Network Connectivity */}
              <div className="bg-white border border-slate-200 rounded-[6px] p-5 sm:p-6 flex flex-col justify-between">
                <div>
                  <div className="pb-3 border-b border-slate-100 mb-4">
                    <h2 className="text-sm font-semibold text-slate-900 m-0">Connectivity & Edge Points of Presence</h2>
                    <p className="text-xs text-slate-500 m-0 mt-0.5">Network peering, direct connect, and low-latency edge caching</p>
                  </div>

                  <div className="flex flex-col divide-y divide-slate-100 text-xs">
                    <div className="flex items-center justify-between py-2.5">
                      <span className="text-slate-500 font-medium">Edge Locations (PoPs)</span>
                      <span className="font-medium text-slate-900">{region.edgeLocations || "Local"} Points of Presence</span>
                    </div>
                    <div className="flex items-center justify-between py-2.5">
                      <span className="text-slate-500 font-medium">AWS Direct Connect</span>
                      <span className="font-medium text-slate-900">{region.directConnect || "Available"}</span>
                    </div>
                    <div className="flex items-center justify-between py-2.5">
                      <span className="text-slate-500 font-medium">Regional Reach</span>
                      <span className="font-medium text-slate-900">{region.reach || region.category || "Regional"}</span>
                    </div>
                    <div className="flex items-center justify-between py-2.5">
                      <span className="text-slate-500 font-medium">Intra-Region Latency</span>
                      <span className="font-medium text-slate-900">{region.latency || "Optimized intra-AZ"}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 text-xs text-slate-500">
                  Global private network routing interconnects this region with the AWS global backbone.
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Footer Navigation Strip ── */}
        <div className="w-full bg-white border border-slate-200 rounded-[6px] p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xs font-semibold text-slate-900 m-0">AWS Global Services Directory</h3>
            <p className="text-xs text-slate-500 m-0 mt-0.5">Explore catalog services and cross-region availability matrices.</p>
          </div>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[4px] bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-colors shrink-0 cursor-pointer"
          >
            <span>Return to Services Directory</span>
            <ChevronRight size={13} />
          </button>
        </div>

      </main>
    </div>
  );
}