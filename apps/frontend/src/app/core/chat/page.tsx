"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import GroupChatPanel from "@/components/chat/GroupChatPanel";
import {
  MessageSquare,
  Users,
  Search,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Trash2,
  Plus,
  X,
  RefreshCw,
  User,
  Send,
  ArrowLeft
} from "lucide-react";

// AWS Brand Logo Component (Standalone Orange Smile)
const AWSBrandLogo = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 120 503 240" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <g transform="matrix(1.672925,0,0,1.668521,-2.790411,-1.835373)" fill="#FF9900">
      <path d="M273.5,143.7C240.6,168 192.8,180.9 151.7,180.9C94.1,180.9 42.2,159.6 3,124.2C-0.1,121.4 2.7,117.6 6.4,119.8C48.8,144.4 101.1,159.3 155.2,159.3C191.7,159.3 231.8,151.7 268.7,136.1C274.2,133.6 278.9,139.7 273.5,143.7Z" />
      <path d="M287.2,128.1C283,122.7 259.4,125.5 248.7,126.8C245.5,127.2 245,124.4 247.9,122.3C266.7,109.1 297.6,112.9 301.2,117.3C304.8,121.8 300.2,152.7 282.6,167.5C279.9,169.8 277.3,168.6 278.5,165.6C282.5,155.7 291.4,133.4 287.2,128.1Z" />
    </g>
  </svg>
);

// ─── Types ────────────────────────────────────────────────────────────────────
interface Query {
  id: string;
  sessionId: string;
  message: string;
  bestSimilarity: number;
  bestMatchDoc?: string | null;
  timestamp: string;
  status: string;
  adminReply?: string | null;
}

interface FAQChip {
  id: string;
  question: string;
  answer: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const relativeTime = (isoStr: string) => {
  if (!isoStr) return "—";
  const d = new Date(isoStr);
  if (isNaN(d.getTime())) return "—";
  const diff = Date.now() - d.getTime();
  if (diff < 0) return "Just now";
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

export default function CoreChatPage() {
  const router = useRouter();
  const replyBoxRef = useRef<HTMLDivElement>(null);

  const [authorized, setAuthorized] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState<"queries" | "kb" | "crew">("queries");

  // Data states
  const [queries, setQueries] = useState<Query[]>([]);
  const [chips, setChips] = useState<FAQChip[]>([]);
  const [loading, setLoading] = useState(true);
  const [chipsLoading, setChipsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "live" | "resolved" | "dismissed">("all");
  const [selectedQuery, setSelectedQuery] = useState<Query | null>(null);

  // Response Editor states
  const [replyText, setReplyText] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);

  // FAQ Modal / Form states
  const [isAddFaqOpen, setIsAddFaqOpen] = useState(false);
  const [faqQuestion, setFaqQuestion] = useState("");
  const [faqAnswer, setFaqAnswer] = useState("");
  const [savingFaq, setSavingFaq] = useState(false);
  const [faqSearch, setFaqSearch] = useState("");

  // User & Toast
  const [user, setUser] = useState<any>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Auth Validation
  useEffect(() => {
    try {
      const raw = localStorage.getItem("aws_sgb_rec_user");
      if (raw) {
        const parsed = JSON.parse(raw);
        setUser(parsed);
        const role = (parsed?.role ?? "").toLowerCase().trim();
        if (role === "core") {
          setAuthorized(true);
          setCheckingAuth(false);
        } else if (parsed.id) {
          fetch(`/api/auth/permissions/check?userId=${parsed.id}&permission=scan_ticket`)
            .then(r => r.json())
            .then(d => {
              const hasPerm = d.hasPermission || d.data?.hasPermission || (d.permissions && d.permissions.includes("scan_ticket"));
              if (hasPerm) setAuthorized(true);
              else router.replace("/crew/dashboard");
              setCheckingAuth(false);
            })
            .catch(() => {
              router.replace("/crew/dashboard");
              setCheckingAuth(false);
            });
        } else {
          router.replace("/login");
          setCheckingAuth(false);
        }
      } else {
        router.replace("/login");
        setCheckingAuth(false);
      }
    } catch {
      setUser({ id: "dev_core", fullName: "Core Administrator", role: "core", email: "admin@awsclub.dev" });
      setAuthorized(true);
      setCheckingAuth(false);
    }
  }, [router]);

  // Load Queries
  const fetchQueries = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/unhandled");
      if (!res.ok) throw new Error();
      const data = await res.json();
      const list = data.data?.queries ?? data.queries ?? [];
      setQueries(list.map((q: any) => ({
        id: q.id,
        sessionId: q.sessionId || q.session_id,
        message: q.message,
        bestSimilarity: q.bestSimilarity || q.best_similarity || 0,
        bestMatchDoc: q.bestMatchDoc || q.best_match_doc || null,
        timestamp: q.timestamp,
        status: q.status,
        adminReply: q.adminReply || q.admin_reply || null,
      })));
    } catch {
      showToast("Failed to refresh questions", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  // Load FAQ Chips
  const fetchChips = useCallback(async () => {
    try {
      setChipsLoading(true);
      const res = await fetch("/api/faq-chips");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setChips(data.data?.chips ?? data.chips ?? []);
    } catch {
      showToast("Failed to load FAQ answers", "error");
    } finally {
      setChipsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authorized) return;
    fetchQueries();
    fetchChips();
    const interval = setInterval(fetchQueries, 8000);
    return () => clearInterval(interval);
  }, [authorized, fetchQueries, fetchChips]);

  // Populate reply text on selection & smooth scroll on mobile
  useEffect(() => {
    if (selectedQuery) {
      setReplyText(selectedQuery.adminReply || "");
      setTimeout(() => {
        replyBoxRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 100);
    }
  }, [selectedQuery]);

  // Submit reply
  const handleSendReply = async () => {
    if (!selectedQuery || !replyText.trim()) return;
    setSubmittingReply(true);
    try {
      const res = await fetch(`/api/admin/reply-live/${selectedQuery.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answer: replyText.trim(),
          adminName: user?.fullName || user?.name || "Core Team",
        }),
      });
      if (!res.ok) throw new Error();
      showToast("Reply sent successfully");
      await fetchQueries();
      setSelectedQuery(null);
      setReplyText("");
    } catch {
      showToast("Failed to send reply", "error");
    } finally {
      setSubmittingReply(false);
    }
  };

  // Dismiss Query
  const handleDismissQuery = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/query/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      showToast("Question dismissed");
      await fetchQueries();
      if (selectedQuery?.id === id) {
        setSelectedQuery(null);
        setReplyText("");
      }
    } catch {
      showToast("Failed to dismiss question", "error");
    }
  };

  // Create FAQ Chip
  const handleCreateFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!faqQuestion.trim() || !faqAnswer.trim()) return;
    setSavingFaq(true);
    try {
      const res = await fetch("/api/admin/faq-chips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: faqQuestion.trim(),
          answer: faqAnswer.trim(),
        }),
      });
      if (!res.ok) throw new Error();
      showToast("New answer added successfully");
      await fetchChips();
      setFaqQuestion("");
      setFaqAnswer("");
      setIsAddFaqOpen(false);
    } catch {
      showToast("Failed to add answer", "error");
    } finally {
      setSavingFaq(false);
    }
  };

  // Delete FAQ Chip
  const handleDeleteFaq = async (id: string) => {
    if (!window.confirm("Delete this answer?")) return;
    try {
      const res = await fetch(`/api/admin/faq-chips/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      showToast("Answer deleted");
      setChips(prev => prev.filter(c => c.id !== id));
    } catch {
      showToast("Failed to delete answer", "error");
    }
  };

  // Filtered queries
  const filteredQueries = useMemo(() => {
    return queries.filter(q => {
      const matchesSearch =
        !search ||
        q.message.toLowerCase().includes(search.toLowerCase()) ||
        q.id.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "live" && (q.status === "live" || q.status === "pending")) ||
        (statusFilter === "resolved" && (q.status === "resolved" || q.status === "replied")) ||
        q.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [queries, search, statusFilter]);

  // Counts
  const counts = useMemo(() => ({
    all: queries.length,
    live: queries.filter(q => q.status === "live" || q.status === "pending").length,
    resolved: queries.filter(q => q.status === "resolved" || q.status === "replied").length,
    dismissed: queries.filter(q => q.status === "dismissed").length,
  }), [queries]);

  // Filtered FAQ chips
  const filteredChips = useMemo(() => {
    return chips.filter(c =>
      !faqSearch ||
      c.question.toLowerCase().includes(faqSearch.toLowerCase()) ||
      c.answer.toLowerCase().includes(faqSearch.toLowerCase())
    );
  }, [chips, faqSearch]);

  if (checkingAuth) {
    return (
      <div 
        className="min-h-screen pb-20 antialiased"
        style={{
          backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.65), rgba(255, 255, 255, 0.65)), url('/images/aws_tech_doodle_bg.png')",
          backgroundRepeat: 'repeat',
          backgroundSize: '450px auto',
        }}
      >
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 pt-24">
          <div className="w-8 h-8 rounded-full border-2 border-[#FF9900] border-t-transparent animate-spin" />
          <span className="text-xs text-slate-500 font-semibold">Loading...</span>
        </div>
      </div>
    );
  }

  if (!authorized) return null;

  // ─── FULL-BLEED TEAM CHAT VIEW (Identical to /crew/chat with dedicated Back button) ───
  if (activeTab === "crew") {
    return (
      <div className="h-full w-full flex flex-col bg-white overflow-hidden select-none antialiased">
        {/* End-to-End Header bar with Back Button & Room Info */}
        <div className="flex items-center justify-between px-3 sm:px-6 py-3 border-b border-slate-200 bg-white select-none shrink-0 z-10">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Back Button */}
            <button
              type="button"
              onClick={() => setActiveTab("queries")}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 hover:text-slate-950 bg-slate-100 hover:bg-slate-200/80 transition-colors cursor-pointer border border-slate-200 shrink-0"
              title="Back to Questions"
            >
              <ArrowLeft size={14} />
              <span className="hidden xs:inline">Back</span>
            </button>

            <div className="h-4 w-px bg-slate-200 mx-0.5 hidden xs:block" />

            <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#232F3E] to-[#1A222D] flex items-center justify-center shadow-xs shrink-0">
              <AWSBrandLogo className="w-7 sm:w-8 h-[16px] sm:h-[19px]" />
            </div>

            <div className="min-w-0">
              <h3 className="font-bold text-[#232F3E] text-sm sm:text-[15px] tracking-tight leading-tight truncate">
                Core & Crew Chat
              </h3>
              <span className="text-[11px] text-slate-500 font-medium truncate block mt-0.5">
                Shared channel for team discussions and coordination
              </span>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold uppercase tracking-wider shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Live Chat</span>
          </span>
        </div>

        {/* End-to-End Chat Body */}
        <div className="flex-1 overflow-hidden flex flex-col min-h-0 relative bg-white">
          <GroupChatPanel user={user} />
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen pb-20 antialiased"
      style={{
        backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.65), rgba(255, 255, 255, 0.65)), url('/images/aws_tech_doodle_bg.png')",
        backgroundRepeat: "repeat",
        backgroundSize: "450px auto",
      }}
    >
      {/* Toast Notification */}
      {toast && (
        <div
          className={cn(
            "fixed bottom-6 right-4 left-4 sm:left-auto sm:right-8 sm:bottom-8 z-[200] flex items-center gap-2.5 px-5 py-3 rounded-[8px] shadow-xl border backdrop-blur-md animate-[fadeIn_0.2s_ease-out]",
            toast.type === "success"
              ? "bg-emerald-50/95 text-emerald-800 border-emerald-100"
              : "bg-red-50/95 text-red-800 border-red-100"
          )}
        >
          {toast.type === "success" ? (
            <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
          ) : (
            <AlertCircle size={16} className="text-red-500 shrink-0" />
          )}
          <p className="text-xs font-bold truncate">{toast.message}</p>
        </div>
      )}

      <div className="mx-auto max-w-[1440px] px-3 sm:px-6 lg:px-8 pt-3 sm:pt-10 flex flex-col gap-4 sm:gap-6">
        {/* Header with Breadcrumbs and Tabs */}
        <header className="flex flex-col gap-3">
          {/* Top Bar: Breadcrumbs + User */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 min-w-0">
              <span className="hover:text-[#FF6B00] transition-colors font-semibold truncate">AWS SBG REC</span>
              <span className="text-slate-300">/</span>
              <span className="text-[#FF6B00] font-semibold truncate">Core</span>
              <span className="text-slate-300">/</span>
              <span className="text-slate-700 font-semibold truncate">
                {activeTab === "queries" ? "Questions" : "Quick Answers"}
              </span>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-slate-200/90 bg-white/90 shadow-2xs text-[11px] select-none shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <User size={11} className={user?.role === "core" ? "text-[#FF9900]" : "text-slate-400"} />
              <span className="font-semibold text-slate-700 truncate max-w-[110px] sm:max-w-[160px]">
                {user?.fullName || user?.name || "Admin"}
              </span>
              <span className="text-[9px] uppercase font-bold text-slate-400">({user?.role || "ADMIN"})</span>
            </div>
          </div>

          {/* Title Row + Tab Switcher */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4">
            <div>
              <p className="font-display text-xl sm:text-2xl lg:text-3xl font-semibold leading-tight tracking-tight text-slate-900">
                {activeTab === "queries"
                  ? "User Questions"
                  : "Quick Answers (FAQ)"}
              </p>
              <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
                {activeTab === "queries"
                  ? "View questions from students, reply directly, and update chatbot answers."
                  : "Common questions and answers that the chatbot automatically replies with."}
              </p>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <div className="grid grid-cols-3 sm:flex items-center bg-slate-100/90 p-1 rounded-lg border border-slate-200/80 shadow-2xs w-full sm:w-auto">
                {[
                  { key: "queries", label: "Questions", count: counts.live },
                  { key: "kb", label: "Quick Answers", count: chips.length },
                  { key: "crew", label: "Team Chat", count: null },
                ].map(tab => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => {
                      setActiveTab(tab.key as any);
                      setSelectedQuery(null);
                    }}
                    className={cn(
                      "flex items-center justify-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer select-none outline-none focus:outline-none text-center",
                      activeTab === tab.key
                        ? "bg-white text-slate-900 shadow-2xs font-bold border border-slate-200/80"
                        : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/40 border border-transparent"
                    )}
                  >
                    <span className="truncate">{tab.label}</span>
                    {tab.count !== null && tab.count > 0 && (
                      <span className={cn(
                        "text-[10px] px-1.5 py-0.2 rounded-full font-bold shrink-0",
                        activeTab === tab.key ? "bg-slate-100 text-slate-800" : "bg-slate-200 text-slate-600"
                      )}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {activeTab === "kb" && (
                <button
                  type="button"
                  onClick={() => setIsAddFaqOpen(true)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-[#232F3E] hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer border-none"
                >
                  <Plus size={13} />
                  <span>Add Answer</span>
                </button>
              )}
            </div>
          </div>
        </header>

        {/* ── Main Workspace Card ── */}
        <div className="bg-white border border-slate-200 rounded-xl sm:rounded-[8px] shadow-xs overflow-hidden">
          {/* TAB 1: QUESTIONS LIST */}
          {activeTab === "queries" && (
            <div>
              {/* Filter Toolbar */}
              <div className="p-3 sm:p-5 border-b border-slate-100 flex flex-col gap-2.5">
                {/* Search Bar + Refresh Action */}
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder="Search questions..."
                      className="w-full pl-8 pr-8 py-2 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 placeholder:text-slate-400 outline-none focus:border-slate-400 transition-all"
                    />
                    {search && (
                      <button
                        onClick={() => setSearch("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>

                  <button
                    onClick={fetchQueries}
                    className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200 transition cursor-pointer shrink-0"
                    title="Refresh"
                  >
                    <RefreshCw size={13} />
                  </button>
                </div>

                {/* Status Segmented Pills (Mobile & Desktop) */}
                <div className="grid grid-cols-4 sm:flex sm:items-center bg-slate-100 p-1 rounded-lg border border-slate-200/80 shadow-2xs w-full sm:w-fit">
                  {[
                    { key: "all", label: "All", count: counts.all },
                    { key: "live", label: "Pending", count: counts.live },
                    { key: "resolved", label: "Answered", count: counts.resolved },
                    { key: "dismissed", label: "Dismissed", count: counts.dismissed },
                  ].map(tab => {
                    const isActive = statusFilter === tab.key;
                    return (
                      <button
                        key={tab.key}
                        type="button"
                        onClick={() => setStatusFilter(tab.key as any)}
                        className={cn(
                          "flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 rounded-md text-xs transition-all cursor-pointer select-none outline-none text-center",
                          isActive
                            ? "bg-white text-slate-900 shadow-2xs font-bold"
                            : "text-slate-600 font-semibold hover:text-slate-950 hover:bg-slate-200/40"
                        )}
                      >
                        <span className="truncate">{tab.label}</span>
                        <span className={cn(
                          "text-[10px] px-1 py-0.2 rounded font-bold shrink-0",
                          isActive ? "text-slate-900 bg-slate-100" : "text-slate-500"
                        )}>
                          {tab.count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ── MOBILE VIEW: Interactive Cards (Visible on mobile screens) ── */}
              <div className="md:hidden divide-y divide-slate-100">
                {loading ? (
                  <div className="py-14 text-center text-slate-500 text-xs font-medium">
                    <RefreshCw size={18} className="animate-spin text-[#FF9900] mx-auto mb-2" />
                    <span>Loading questions...</span>
                  </div>
                ) : filteredQueries.length === 0 ? (
                  <div className="py-14 text-center text-slate-500 text-xs font-semibold px-4">
                    No questions found matching the selected filter.
                  </div>
                ) : (
                  filteredQueries.map(q => {
                    const isSelected = selectedQuery?.id === q.id;
                    const isLive = q.status === "live" || q.status === "pending";
                    const isResolved = q.status === "resolved" || q.status === "replied";
                    const simVal = Math.round((q.bestSimilarity || 0) * 100);

                    return (
                      <div
                        key={q.id}
                        onClick={() => setSelectedQuery(q)}
                        className={cn(
                          "p-3.5 transition-colors cursor-pointer flex flex-col gap-2 active:bg-slate-50",
                          isSelected ? "bg-amber-50/70" : "bg-white"
                        )}
                      >
                        {/* Top Meta Line: ID, Time, Status */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="font-mono text-slate-500 font-bold bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 text-[11px] shrink-0">
                              #{q.id.slice(-4)}
                            </span>
                            <span className="text-[11px] text-slate-400 font-medium truncate">
                              {relativeTime(q.timestamp)}
                            </span>
                          </div>

                          <span className={cn(
                            "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border shrink-0",
                            isLive
                              ? "bg-amber-50 text-amber-800 border-amber-200"
                              : isResolved
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : "bg-slate-100 text-slate-600 border-slate-200"
                          )}>
                            <span className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              isLive ? "bg-amber-500" : isResolved ? "bg-emerald-500" : "bg-slate-400"
                            )} />
                            <span>{isLive ? "Pending" : isResolved ? "Answered" : "Dismissed"}</span>
                          </span>
                        </div>

                        {/* Question Message */}
                        <div className="font-bold text-slate-900 text-xs leading-snug">
                          {q.message}
                        </div>

                        {/* If answered, reply preview */}
                        {q.adminReply && (
                          <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded border border-slate-100 font-normal line-clamp-2">
                            <span className="font-semibold text-slate-700">Reply: </span>
                            {q.adminReply}
                          </div>
                        )}

                        {/* Bottom Row: AI Match & Action */}
                        <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                          <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                            <span>Match:</span>
                            <strong className={cn(
                              simVal >= 50 ? "text-emerald-700" : simVal >= 20 ? "text-amber-700" : "text-slate-600"
                            )}>
                              {simVal}%
                            </strong>
                          </span>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedQuery(q);
                            }}
                            className={cn(
                              "px-3 py-1 text-xs font-bold rounded-md transition-colors cursor-pointer",
                              isLive
                                ? "bg-[#232F3E] text-white hover:bg-slate-800"
                                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                            )}
                          >
                            {isLive ? "Reply" : "View"}
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* ── DESKTOP VIEW: Clean Data Table (Visible on md and larger) ── */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/90 text-xs font-bold text-slate-700 uppercase tracking-wider select-none">
                      <th className="py-3.5 px-5 sm:px-6 w-20">ID</th>
                      <th className="py-3.5 px-4 min-w-[280px]">Question</th>
                      <th className="py-3.5 px-4 text-center w-28">Match</th>
                      <th className="py-3.5 px-4 text-center w-28">Time</th>
                      <th className="py-3.5 px-4 text-center w-28">Status</th>
                      <th className="py-3.5 px-5 sm:px-6 text-right w-28">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="py-16 text-center text-slate-500 font-medium">
                          <RefreshCw size={18} className="animate-spin text-[#FF9900] mx-auto mb-2" />
                          <span>Loading questions...</span>
                        </td>
                      </tr>
                    ) : filteredQueries.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-16 text-center text-slate-500 font-semibold">
                          No questions found.
                        </td>
                      </tr>
                    ) : (
                      filteredQueries.map(q => {
                        const isSelected = selectedQuery?.id === q.id;
                        const isLive = q.status === "live" || q.status === "pending";
                        const isResolved = q.status === "resolved" || q.status === "replied";
                        const simVal = Math.round((q.bestSimilarity || 0) * 100);

                        return (
                          <tr
                            key={q.id}
                            onClick={() => setSelectedQuery(q)}
                            className={cn(
                              "transition-colors cursor-pointer group",
                              isSelected ? "bg-amber-50/70" : "hover:bg-slate-50/70"
                            )}
                          >
                            {/* ID */}
                            <td className="py-3.5 px-5 sm:px-6 whitespace-nowrap">
                              <span className="font-mono text-slate-500 font-bold bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                                #{q.id.slice(-4)}
                              </span>
                            </td>

                            {/* Question */}
                            <td className="py-3.5 px-4">
                              <div className="font-bold text-slate-900 line-clamp-1">{q.message}</div>
                              {q.adminReply && (
                                <div className="text-[11px] text-slate-500 font-normal line-clamp-1 mt-0.5">
                                  Reply: {q.adminReply}
                                </div>
                              )}
                            </td>

                            {/* Match */}
                            <td className="py-3.5 px-4 text-center whitespace-nowrap">
                              <span className={cn(
                                "px-2 py-0.5 rounded text-[11px] font-bold border",
                                simVal >= 50
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : simVal >= 20
                                  ? "bg-amber-50 text-amber-700 border-amber-200"
                                  : "bg-slate-100 text-slate-600 border-slate-200"
                              )}>
                                {simVal}%
                              </span>
                            </td>

                            {/* Time */}
                            <td className="py-3.5 px-4 text-center whitespace-nowrap text-slate-500 font-medium">
                              {relativeTime(q.timestamp)}
                            </td>

                            {/* Status */}
                            <td className="py-3.5 px-4 text-center whitespace-nowrap">
                              <span className={cn(
                                "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border",
                                isLive
                                  ? "bg-amber-50 text-amber-800 border-amber-200"
                                  : isResolved
                                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                  : "bg-slate-100 text-slate-600 border-slate-200"
                              )}>
                                <span className={cn(
                                  "w-1.5 h-1.5 rounded-full",
                                  isLive ? "bg-amber-500" : isResolved ? "bg-emerald-500" : "bg-slate-400"
                                )} />
                                <span>{isLive ? "Pending" : isResolved ? "Answered" : "Dismissed"}</span>
                              </span>
                            </td>

                            {/* Action */}
                            <td className="py-3.5 px-5 sm:px-6 text-right whitespace-nowrap">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedQuery(q);
                                }}
                                className="px-2.5 py-1 text-xs font-bold text-slate-700 hover:text-slate-950 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                              >
                                {isLive ? "Reply" : "View"}
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table Footer */}
              <div className="px-4 sm:px-5 py-3 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between text-xs text-slate-500 font-semibold">
                <span>{filteredQueries.length} questions</span>
                <span>AWS SBG REC</span>
              </div>

              {/* Reply Box when a question is selected */}
              {selectedQuery && (
                <div ref={replyBoxRef} className="p-4 sm:p-6 border-t border-slate-200 bg-slate-50/70 space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <div className="flex items-center gap-2 min-w-0">
                      <MessageSquare size={16} className="text-[#FF9900] shrink-0" />
                      <span className="text-xs font-bold text-slate-900 uppercase tracking-wide truncate">
                        Reply to Question #{selectedQuery.id.slice(-4)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedQuery(null)}
                      className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                    >
                      <X size={15} />
                    </button>
                  </div>

                  {/* Question Banner */}
                  <div className="bg-white p-3.5 sm:p-4 rounded-lg border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                      User Question
                    </span>
                    <p className="text-xs sm:text-sm font-bold text-slate-900 leading-relaxed">{selectedQuery.message}</p>
                    {selectedQuery.bestMatchDoc && (
                      <div className="mt-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
                        <span className="font-semibold text-slate-700">Similar Answer in FAQ: </span>
                        {selectedQuery.bestMatchDoc}
                      </div>
                    )}
                  </div>

                  {/* Reply Input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wide block">
                      Your Reply
                    </label>
                    <textarea
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      placeholder="Type your reply here. This will answer the user and help the chatbot answer future questions..."
                      rows={4}
                      className="w-full bg-white border border-slate-200 rounded-lg p-3 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-400 font-medium resize-y"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end gap-2 pt-1">
                    {selectedQuery.status === "live" && (
                      <button
                        type="button"
                        onClick={() => handleDismissQuery(selectedQuery.id)}
                        className="px-3.5 py-2 border border-slate-200 bg-white hover:bg-red-50 text-slate-600 hover:text-red-700 rounded-lg text-xs font-bold transition cursor-pointer"
                      >
                        Dismiss
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleSendReply}
                      disabled={submittingReply || !replyText.trim()}
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#232F3E] hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                    >
                      <Send size={13} />
                      <span>{submittingReply ? "Sending…" : "Send Reply & Save"}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: QUICK ANSWERS (FAQ) */}
          {activeTab === "kb" && (
            <div>
              <div className="p-3.5 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={faqSearch}
                    onChange={e => setFaqSearch(e.target.value)}
                    placeholder="Search answers..."
                    className="w-full pl-8 pr-8 py-2 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 placeholder:text-slate-400 outline-none focus:border-slate-400 transition-all"
                  />
                  {faqSearch && (
                    <button onClick={() => setFaqSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      <X size={12} />
                    </button>
                  )}
                </div>

                <div className="text-xs font-bold text-slate-500">
                  {filteredChips.length} FAQ answers saved
                </div>
              </div>

              {/* Answers Grid */}
              <div className="p-3.5 sm:p-6 divide-y divide-slate-100">
                {chipsLoading ? (
                  <div className="py-14 text-center text-xs text-slate-500 font-medium">
                    <RefreshCw size={18} className="animate-spin text-[#FF9900] mx-auto mb-2" />
                    <span>Loading answers...</span>
                  </div>
                ) : filteredChips.length === 0 ? (
                  <div className="py-14 text-center text-xs text-slate-500 font-semibold px-4">
                    No FAQ answers found. Click "Add Answer" above to create one.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    {filteredChips.map(chip => (
                      <div
                        key={chip.id}
                        className="bg-slate-50/70 border border-slate-200/90 rounded-lg p-3.5 sm:p-4 flex flex-col justify-between gap-3 hover:bg-white hover:border-slate-300 transition-all shadow-2xs"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-xs font-bold text-slate-900 leading-snug">
                              {chip.question}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleDeleteFaq(chip.id)}
                              className="text-slate-400 hover:text-red-600 p-1 cursor-pointer transition-colors"
                              title="Delete answer"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                          <p className="text-xs text-slate-600 mt-2 font-normal leading-relaxed whitespace-pre-line">
                            {chip.answer}
                          </p>
                        </div>

                        <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider pt-2 border-t border-slate-200/60">
                          Chatbot Answer
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Answer Modal */}
      {isAddFaqOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white border border-slate-200 rounded-xl max-w-lg w-full p-5 sm:p-6 shadow-xl space-y-4 sm:space-y-5 animate-[fadeIn_0.15s_ease-out]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <BookOpen size={16} className="text-[#FF9900]" />
                <h3 className="text-sm font-bold text-slate-900">Add Quick Answer</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddFaqOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateFaq} className="space-y-3.5 sm:space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide block">
                  Question
                </label>
                <input
                  type="text"
                  value={faqQuestion}
                  onChange={e => setFaqQuestion(e.target.value)}
                  placeholder="e.g. How do I register for an event?"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 font-semibold outline-none focus:border-slate-400"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide block">
                  Answer
                </label>
                <textarea
                  value={faqAnswer}
                  onChange={e => setFaqAnswer(e.target.value)}
                  placeholder="Enter the answer that the chatbot should reply with..."
                  rows={5}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 font-normal outline-none focus:border-slate-400 resize-y"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddFaqOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingFaq || !faqQuestion.trim() || !faqAnswer.trim()}
                  className="px-4 py-2 bg-[#232F3E] hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition cursor-pointer disabled:opacity-50"
                >
                  {savingFaq ? "Saving…" : "Save Answer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
