"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import GroupChatPanel from "@/components/chat/GroupChatPanel";
import {
  MessageSquare, Users, Database,
  Search, CheckCircle2, XCircle, AlertCircle,
  BookOpen, Trash2, Plus, X, ChevronDown, ArrowLeft,
  RefreshCw, SlidersHorizontal, User
} from "lucide-react";

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

const statusMeta = (s: string) => {
  if (s === "live" || s === "pending") {
    return {
      badgeClass: "bg-amber-50 text-amber-900 border-amber-300/80",
      dotClass: "bg-amber-500",
      icon: <AlertCircle size={12} className="text-amber-600" />,
      label: "Live"
    };
  }
  if (s === "resolved" || s === "replied") {
    return {
      badgeClass: "bg-emerald-50 text-emerald-900 border-emerald-300/80",
      dotClass: "bg-emerald-500",
      icon: <CheckCircle2 size={12} className="text-emerald-600" />,
      label: "Resolved"
    };
  }
  if (s === "dismissed") {
    return {
      badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
      dotClass: "bg-slate-400",
      icon: <XCircle size={12} className="text-slate-400" />,
      label: "Dismissed"
    };
  }
  return {
    badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
    dotClass: "bg-slate-400",
    icon: null,
    label: s
  };
};

const simPct = (v: number | null) => (v != null ? `${Math.round(v * 100)}%` : "—");

// ─── Toast ────────────────────────────────────────────────────────────────────
interface ToastProps {
  toast: { type: "success" | "error"; title: string; body?: string } | null;
  onClose: () => void;
}
function Toast({ toast, onClose }: ToastProps) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [toast, onClose]);
  if (!toast) return null;
  const isErr = toast.type === "error";
  return (
    <div className={cn(
      "fixed bottom-6 right-6 z-50 bg-white border rounded-xl p-4 flex items-start gap-3 max-w-sm shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-200",
      isErr ? "border-red-200 shadow-red-500/5" : "border-emerald-200 shadow-emerald-500/5"
    )}>
      <span className={cn("mt-0.5 shrink-0", isErr ? "text-red-600" : "text-emerald-600")}>
        {isErr ? <XCircle size={16} /> : <CheckCircle2 size={16} />}
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-bold text-slate-900">{toast.title}</div>
        {toast.body && <div className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{toast.body}</div>}
      </div>
      <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer outline-none">
        <X size={14} />
      </button>
    </div>
  );
}

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

// ─── Query Row ────────────────────────────────────────────────────────────────
const QueryRow = ({ q, isSelected, onSelect }: { q: Query; isSelected: boolean; onSelect: (q: Query) => void }) => {
  const { badgeClass, dotClass, label } = statusMeta(q.status);
  const simVal = Math.round((q.bestSimilarity ?? 0) * 100);

  return (
    <tr
      onClick={() => onSelect(q)}
      className={cn(
        "cursor-pointer transition-colors group border-b border-slate-100 last:border-none",
        isSelected 
          ? "bg-amber-50/80" 
          : "hover:bg-slate-50/80 bg-white"
      )}
    >
      {/* Col 1: ID */}
      <td className="py-4 pl-6 pr-3 w-20 whitespace-nowrap align-middle">
        <span className="inline-flex items-center text-xs font-bold font-mono text-slate-700 bg-slate-100 border border-slate-200/90 px-2 py-0.5 rounded-md shadow-2xs">
          #{q.id.slice(-4)}
        </span>
      </td>

      {/* Col 2: Question Message */}
      <td className="py-4 px-4 min-w-[220px] align-middle">
        <div className="text-sm font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-slate-950" title={q.message}>
          {q.message}
        </div>
      </td>

      {/* Col 3: Similarity Match */}
      <td className="py-4 px-4 w-28 whitespace-nowrap text-center align-middle">
        <span className={cn(
          "inline-flex items-center justify-center px-2.5 py-1 rounded-md text-xs font-bold border",
          simVal >= 50
            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
            : simVal >= 20
            ? "bg-amber-50 text-amber-800 border-amber-200"
            : "bg-slate-100 text-slate-600 border-slate-200"
        )}>
          {simPct(q.bestSimilarity)}
        </span>
      </td>

      {/* Col 4: Time */}
      <td className="py-4 px-4 w-28 whitespace-nowrap text-center text-xs font-semibold text-slate-500 align-middle">
        {relativeTime(q.timestamp)}
      </td>

      {/* Col 5: Status */}
      <td className="py-4 pl-3 pr-6 w-36 whitespace-nowrap text-right align-middle">
        <span className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold border", badgeClass)}>
          <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", dotClass)} />
          <span className="whitespace-nowrap">{label}</span>
        </span>
      </td>
    </tr>
  );
};

// ─── FAQ Chips Manager ────────────────────────────────────────────────────────
interface FAQChip { id: string; question: string; answer: string; }

function FAQChipsManager({ showToast }: { showToast: (t: any) => void }) {
  const [chips, setChips] = useState<FAQChip[]>([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [expandedChips, setExpandedChips] = useState<Record<string, boolean>>({});
  const [searchChip, setSearchChip] = useState("");

  const fetchChips = useCallback(async () => {
    try {
      const res = await fetch("/api/faq-chips");
      const data = await res.json();
      setChips(data.data?.chips ?? data.chips ?? []);
    } catch { showToast({ type: "error", title: "Failed to load FAQ chips." }); }
    finally { setLoading(false); }
  }, [showToast]);

  useEffect(() => { fetchChips(); }, [fetchChips]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim() || !newAnswer.trim()) return;
    setAdding(true);
    try {
      const res = await fetch("/api/admin/faq-chips", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: newQuestion.trim(), answer: newAnswer.trim() }),
      });
      if (!res.ok) throw new Error();
      await fetchChips();
      setNewQuestion(""); setNewAnswer("");
      showToast({ type: "success", title: "FAQ Chip Added Successfully" });
    } catch { showToast({ type: "error", title: "Failed to add FAQ chip" }); }
    finally { setAdding(false); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this FAQ chip?")) return;
    try {
      const res = await fetch(`/api/admin/faq-chips/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setChips(prev => prev.filter(c => c.id !== id));
      showToast({ type: "success", title: "FAQ Chip Deleted" });
    } catch { showToast({ type: "error", title: "Delete failed" }); }
  };

  const filteredChips = chips.filter(c => 
    !searchChip || 
    c.question.toLowerCase().includes(searchChip.toLowerCase()) || 
    c.answer.toLowerCase().includes(searchChip.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-start">
      {/* FAQ list */}
      <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl flex flex-col overflow-hidden shadow-xs">
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50/90 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <BookOpen size={16} className="text-[#FF9900]" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800">Knowledge Chips Directory</span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              {chips.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs shadow-2xs w-full sm:w-48">
              <Search size={13} className="text-slate-400 shrink-0" />
              <input
                type="text"
                value={searchChip}
                onChange={e => setSearchChip(e.target.value)}
                placeholder="Search chips..."
                className="bg-transparent border-none outline-none text-slate-900 text-xs w-full placeholder:text-slate-400 font-semibold"
              />
            </div>
          </div>
        </div>

        <div className="p-4 overflow-y-auto max-h-[600px] bg-white">
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-500 font-semibold">
              <RefreshCw size={16} className="animate-spin text-[#FF9900] mx-auto mb-2" />
              Loading FAQ chips…
            </div>
          ) : filteredChips.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500 font-semibold">No FAQ chips found.</div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {filteredChips.map(chip => {
                const isExpanded = !!expandedChips[chip.id];
                return (
                  <div 
                    key={chip.id} 
                    onClick={() => setExpandedChips(p => ({ ...p, [chip.id]: !p[chip.id] }))}
                    className="rounded-lg bg-slate-50/80 border border-slate-200 p-3.5 cursor-pointer transition-all hover:bg-white hover:border-slate-300 hover:shadow-xs"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-xs font-bold text-slate-900 flex-1 leading-snug">{chip.question}</div>
                      <div className="flex items-center gap-2 shrink-0">
                        <ChevronDown size={14} className={cn("text-slate-400 transition-transform duration-200", isExpanded && "rotate-180")} />
                        <button 
                          onClick={e => { e.stopPropagation(); handleDelete(chip.id); }}
                          className="text-slate-400 hover:text-red-600 transition-colors p-1 cursor-pointer"
                          title="Delete chip"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                    {isExpanded && (
                      <div className="text-xs font-medium text-slate-600 mt-2.5 pt-2.5 border-t border-slate-200/80 leading-relaxed">
                        {chip.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Add form */}
      <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 sm:p-6 flex flex-col gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Plus size={16} className="text-[#FF9900]" />
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">Add FAQ Knowledge Chip</h3>
          </div>
          <p className="text-xs font-medium text-slate-500 mt-1">Configure automated chatbot instant responses for enthusiast inquiries.</p>
        </div>

        <form onSubmit={handleAdd} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Trigger Question</label>
            <input 
              type="text" 
              value={newQuestion} 
              onChange={e => setNewQuestion(e.target.value)} 
              placeholder="e.g. What are the prerequisites for AWS Solutions Architect?"
              className="w-full bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 font-semibold transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Official Response</label>
            <textarea 
              value={newAnswer} 
              onChange={e => setNewAnswer(e.target.value)} 
              placeholder="Provide the structured official answer to be saved into the knowledge base..." 
              rows={5}
              className="w-full bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 font-medium transition-all resize-y min-h-[100px]"
            />
          </div>

          <button 
            type="submit" 
            disabled={adding || !newQuestion.trim() || !newAnswer.trim()}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#232F3E] hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus size={14} />
            <span>{adding ? "Adding Chip…" : "Add FAQ Chip"}</span>
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── CMS Panel ────────────────────────────────────────────────────────────────
function CMSPanel({ query, onSaved, onDismissed, showToast, user, onBack }: { query: Query | null; onSaved: (id: string) => void; onDismissed: (id: string) => void; showToast: (t: any) => void; user: any; onBack?: () => void }) {
  const [answer, setAnswer] = useState("");
  const [saving, setSaving] = useState("");
  const [saveResult, setSaveResult] = useState<{ doc_id: string; total: number } | null>(null);

  useEffect(() => {
    setAnswer(query?.adminReply || "");
    setSaveResult(null);
  }, [query]);

  const handleSave = async () => {
    if (!query || !answer.trim()) { showToast({ type: "error", title: "Answer cannot be empty." }); return; }
    setSaving("saving");
    try {
      const res = await fetch(`/api/admin/reply-live/${query.id}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer: answer.trim(), adminName: user?.fullName || "Core Team" }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSaveResult({ doc_id: data.doc_id, total: data.chroma_total_docs });
      showToast({ type: "success", title: "Saved to Knowledge Base!", body: "Future similar queries will be auto-answered." });
      onSaved(query.id);
    } catch { showToast({ type: "error", title: "Save failed." }); }
    finally { setSaving(""); }
  };

  const handleDismiss = async () => {
    if (!query) return;
    setSaving("dismissing");
    try {
      const res = await fetch(`/api/admin/query/${query.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      showToast({ type: "success", title: "Query dismissed." });
      onDismissed(query.id);
    } catch { showToast({ type: "error", title: "Dismiss failed." }); }
    finally { setSaving(""); }
  };

  if (!query) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 bg-white p-12 text-slate-400 flex-1 h-full min-h-[360px]">
        <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 mb-1">
          <MessageSquare size={22} strokeWidth={1.5} />
        </div>
        <div className="text-sm font-bold text-slate-800">No Query Selected</div>
        <div className="text-xs text-center max-w-[260px] leading-relaxed text-slate-500 font-medium">
          Select a user inquiry from the queue to formulate an official answer and update the knowledge base.
        </div>
      </div>
    );
  }

  const { badgeClass, dotClass, label: stLabel } = statusMeta(query.status);

  return (
    <div className="flex flex-col gap-4 bg-white p-4 sm:p-6 flex-1 min-h-0 h-full overflow-y-auto">
      {/* Mobile Back button */}
      {onBack && (
        <button
          onClick={onBack}
          className="lg:hidden inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 transition w-fit cursor-pointer shadow-xs"
        >
          <ArrowLeft size={14} />
          <span>Back to Queries List</span>
        </button>
      )}

      {/* Header */}
      <div className="flex items-center justify-between shrink-0 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={15} className="text-[#FF9900]" />
          <span className="text-xs font-bold text-slate-900">Query Response Editor</span>
          <span className="text-[11px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            #{query.id.slice(-6)}
          </span>
        </div>
        <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-bold border", badgeClass)}>
          <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", dotClass)} />
          <span>{stLabel}</span>
        </span>
      </div>

      {/* Question card */}
      <div className="bg-slate-50/90 rounded-xl border border-slate-200 border-l-4 border-l-[#FF9900] p-4 shadow-2xs">
        <div className="text-[11px] font-bold text-slate-500 tracking-wider uppercase mb-1 flex items-center gap-1.5">
          <MessageSquare size={12} className="text-[#FF9900]" />
          <span>Enthusiast Question</span>
        </div>
        <div className="text-sm text-slate-900 leading-relaxed font-bold">{query.message}</div>
      </div>

      {/* Closest match */}
      {query.bestMatchDoc && (
        <details className="bg-white rounded-xl border border-slate-200 p-3.5 cursor-pointer shadow-2xs group">
          <summary className="text-xs font-bold text-slate-800 flex items-center justify-between outline-none list-none select-none">
            <div className="flex items-center gap-2">
              <Database size={13} className="text-[#FF9900]" />
              <span>Closest KB Match (Auto-Reply Source)</span>
            </div>
            <ChevronDown size={14} className="text-slate-400 group-open:rotate-180 transition-transform duration-200" />
          </summary>
          <div className="mt-2.5 text-xs text-slate-600 font-medium leading-relaxed border-t border-slate-100 pt-2.5 max-h-36 overflow-y-auto">
            {query.bestMatchDoc}
          </div>
        </details>
      )}

      {/* Answer & actions */}
      {saveResult ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
          <div>
            <div className="text-xs font-bold text-emerald-900">Saved to Knowledge Base</div>
            <div className="text-xs text-emerald-700 font-medium mt-0.5">Future similar queries will be automatically answered.</div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3 mt-1">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Official Resolution Answer</label>
            <textarea
              value={answer} 
              onChange={e => setAnswer(e.target.value)} 
              placeholder="Write the accurate answer to respond and train the knowledge base…"
              rows={5} 
              disabled={saving !== ""}
              className="w-full bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200 rounded-lg p-3 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 font-medium transition-all resize-y min-h-[110px]"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-1">
            {query.status === "live" && (
              <button 
                onClick={handleDismiss} 
                disabled={saving !== ""}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 border border-slate-200 bg-white hover:bg-red-50 text-slate-600 hover:text-red-700 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs disabled:opacity-50"
              >
                <XCircle size={13} />
                <span>{saving === "dismissing" ? "Dismissing…" : "Dismiss"}</span>
              </button>
            )}
            <button 
              onClick={handleSave} 
              disabled={saving !== "" || !answer.trim()}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#232F3E] hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Database size={13} />
              <span>{saving === "saving" ? "Saving…" : "Save to KB"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export default function CoreChatPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [activeView, setActiveView] = useState<"queries" | "kb" | "crew_chats">("queries");
  const [queries, setQueries] = useState<Query[]>([]);
  const [stats, setStats] = useState<{ live: number; pending: number; resolved: number; dismissed: number; kb_docs: number }>();
  const [selectedQuery, setSelectedQuery] = useState<Query | null>(null);
  const [search, setSearch] = useState("");
  const [filterTab, setFilterTab] = useState<"all" | "live" | "resolved" | "dismissed">("live");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ type: "success" | "error"; title: string; body?: string } | null>(null);
  const [user, setUser] = useState<any>(null);

  const showToast = useCallback((t: any) => setToast(t), []);
  const hideToast = useCallback(() => setToast(null), []);

  const fetchData = useCallback(async () => {
    try {
      const [qRes, sRes] = await Promise.all([fetch("/api/admin/unhandled"), fetch("/api/admin/stats")]);
      if (!qRes.ok || !sRes.ok) throw new Error();
      const qData = await qRes.json(); const sData = await sRes.json();
      const queriesList = qData.data?.queries ?? qData.queries ?? [];
      const statsObj = sData.data ?? sData;
      setQueries(queriesList.map((q: any) => ({
        id: q.id, sessionId: q.sessionId || q.session_id, message: q.message,
        bestSimilarity: q.bestSimilarity || q.best_similarity || 0,
        bestMatchDoc: q.bestMatchDoc || q.best_match_doc || null,
        timestamp: q.timestamp, status: q.status,
        adminReply: q.adminReply || q.admin_reply || null,
      })));
      setStats(statsObj);
    } catch { showToast({ type: "error", title: "Failed to load data" }); }
    finally { setLoading(false); }
  }, [showToast]);

  useEffect(() => {
    if (!authorized) return;
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData, authorized]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("aws_sgb_rec_user");
      if (raw) {
        const parsed = JSON.parse(raw); setUser(parsed);
        const role = (parsed?.role ?? "").toLowerCase().trim();
        if (role === "core") { setAuthorized(true); setCheckingAuth(false); }
        else if (parsed.id) {
          fetch(`/api/auth/permissions/check?userId=${parsed.id}&permission=scan_ticket`)
            .then(r => r.json()).then(d => { if (d.success && d.hasPermission) setAuthorized(true); else router.replace("/crew/dashboard"); setCheckingAuth(false); })
            .catch(() => { router.replace("/crew/dashboard"); setCheckingAuth(false); });
        } else { router.replace("/login"); setCheckingAuth(false); }
      } else { router.replace("/login"); setCheckingAuth(false); }
    } catch {
      setUser({ id: "dev_core", fullName: "Core Administrator", role: "core", email: "admin@awsclub.dev" });
      setAuthorized(true); setCheckingAuth(false);
    }
  }, [router]);

  const handleSaved = useCallback(() => { fetchData(); setSelectedQuery(null); }, [fetchData]);
  const handleDismissed = useCallback(() => { fetchData(); setSelectedQuery(null); }, [fetchData]);

  const visible = queries.filter(q => {
    const matchTab = filterTab === "all" || (filterTab === "live" && (q.status === "live" || q.status === "pending")) || (filterTab === "resolved" && (q.status === "resolved" || q.status === "replied")) || q.status === filterTab;
    const matchSearch = !search || q.message.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const TABS = [
    { key: "live",      label: "Live",      count: queries.filter(q => q.status === "live" || q.status === "pending").length },
    { key: "resolved",  label: "Resolved",  count: queries.filter(q => q.status === "resolved" || q.status === "replied").length },
    { key: "dismissed", label: "Dismissed", count: queries.filter(q => q.status === "dismissed").length },
    { key: "all",       label: "All",       count: queries.length },
  ] as const;

  // ── Auth checking ──
  if (checkingAuth) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3.5 bg-slate-50">
        <div className="w-7 h-7 rounded-full border-2 border-[#FF9900] border-t-transparent animate-spin" />
        <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">Verifying credentials…</span>
      </div>
    );
  }
  if (!authorized) return null;

  const currentTabLabel = activeView === "queries" 
    ? "Unhandled Queries" 
    : activeView === "kb" 
    ? "Knowledge Base" 
    : "Crew Channel";

  return (
    <div 
      className="min-h-screen bg-slate-50 relative selection:bg-orange-500 selection:text-white"
      style={{
        backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.65), rgba(255, 255, 255, 0.65)), url('/images/aws_tech_doodle_bg.png')",
        backgroundRepeat: 'repeat',
        backgroundSize: '450px auto'
      }}
    >
      <div className="mx-auto max-w-[1440px] px-4 pt-4 sm:pt-10 sm:px-6 lg:px-8 flex flex-col gap-6 pb-16">
        {/* Header with Breadcrumb Path, User Badge, and Aligned Tab Switcher */}
        <header className="flex flex-col gap-3.5 pb-2">
          {/* Top Bar: Breadcrumb + Operator Badge */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
              <span className="hover:text-[#FF6B00] transition-colors font-semibold">AWS SBG REC</span>
              <span className="text-slate-300">/</span>
              <span className="text-[#FF6B00] font-semibold">Core Management</span>
              <span className="text-slate-300">/</span>
              <span className="text-slate-700 font-semibold">{currentTabLabel}</span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-slate-200/90 bg-white/90 shadow-2xs text-xs select-none">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <User size={12} className={user?.role === "core" ? "text-[#FF9900]" : "text-slate-400"} />
              <span className="font-semibold text-slate-700 truncate max-w-[140px]">{user?.fullName || user?.name || "Member"}</span>
              <span className="text-[10px] uppercase font-bold text-slate-400">({user?.role || "OPERATOR"})</span>
            </div>
          </div>

          {/* Main Title Row: Page Heading + Tab Navigation Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <p className="font-display text-2xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-3xl">
                {activeView === "queries"
                  ? "Unhandled Queries Queue"
                  : activeView === "kb"
                  ? "FAQ Knowledge Base"
                  : "Core–Crew Communications"}
              </p>
              
              <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed font-medium">
                {activeView === "queries"
                  ? "Review unhandled enthusiast inquiries, formulate official responses, and train the RAG chatbot knowledge base."
                  : activeView === "kb"
                  ? "Manage automated instant-answer knowledge chips for commonly asked student and community questions."
                  : "Private internal communication stream for Core administrators and active Crew members."}
              </p>
            </div>

            {/* Navigation Tabs */}
            <div className="shrink-0 flex items-center gap-2.5 flex-wrap">
              <div className="inline-flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200/80 shadow-2xs">
                {[
                  { key: "queries",    label: "Unhandled Queries", icon: <MessageSquare size={13} /> },
                  { key: "kb",         label: "Knowledge Base",    icon: <BookOpen size={13} /> },
                  { key: "crew_chats", label: "Crew Channel",       icon: <Users size={13} /> },
                ].map((v) => {
                  const isActive = activeView === v.key;
                  return (
                    <button
                      key={v.key}
                      type="button"
                      onClick={() => {
                        setActiveView(v.key as any);
                        if (v.key !== "queries") setSelectedQuery(null);
                      }}
                      className={cn(
                        "flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer text-center outline-none focus:outline-none select-none",
                        isActive
                          ? "bg-white text-slate-900 shadow-2xs font-bold border border-slate-200/80"
                          : "text-slate-600 hover:text-slate-950 hover:bg-slate-200/40 border border-transparent"
                      )}
                    >
                      {v.icon}
                      <span>{v.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </header>

        {/* ── Main View Content ── */}
        <div className="relative">
          {activeView === "crew_chats" ? (
            <div className="flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <div className="bg-slate-50/90 text-slate-800 px-5 py-3.5 border-b border-slate-200 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-[#FF9900]" />
                  <span className="text-xs font-bold text-slate-900">AWS Club · Core–Crew Channel</span>
                </div>
                <span className="text-[10px] font-bold text-slate-600 bg-white border border-slate-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Internal Ops
                </span>
              </div>
              <div className="h-[600px] overflow-hidden flex flex-col">
                <GroupChatPanel user={user} />
              </div>
            </div>
          ) : activeView === "kb" ? (
            <FAQChipsManager showToast={showToast} />
          ) : (
            /* ── Queries Queue & CMS Editor ── */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left: Query Table List */}
              <div className={cn(
                "lg:col-span-7 bg-white border border-slate-200 rounded-xl flex flex-col overflow-hidden shadow-xs",
                selectedQuery ? "hidden lg:flex" : "flex"
              )}>
                {/* List Toolbar */}
                <div className="px-6 py-3.5 border-b border-slate-200 bg-white flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shrink-0">
                  <div className="relative flex-1 max-w-sm">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input 
                      type="text" 
                      value={search} 
                      onChange={e => setSearch(e.target.value)} 
                      placeholder="Search questions by keyword…"
                      className="w-full pl-9 pr-8 py-2 bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 placeholder:text-slate-500 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition-all" 
                    />
                    {search && (
                      <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer outline-none">
                        <X size={13} />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2.5 flex-wrap">
                    {/* Status Segmented Tabs */}
                    <div className="inline-flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200/80 shadow-2xs">
                      {TABS.map(tab => {
                        const isActive = filterTab === tab.key;
                        return (
                          <button 
                            key={tab.key} 
                            onClick={() => setFilterTab(tab.key as any)}
                            className={cn(
                              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition-all cursor-pointer select-none outline-none focus:outline-none",
                              isActive
                                ? "bg-white text-slate-900 shadow-2xs font-bold"
                                : "text-slate-600 font-semibold hover:text-slate-950 hover:bg-slate-200/40"
                            )}
                          >
                            <span>{tab.label}</span>
                            <span className={cn(
                              "text-[11px] px-1.5 py-0.2 rounded font-bold",
                              isActive ? "text-slate-900 bg-slate-100" : "text-slate-500"
                            )}>
                              {tab.count}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    <button 
                      onClick={fetchData} 
                      className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200 transition cursor-pointer" 
                      title="Refresh query queue"
                    >
                      <RefreshCw size={13} />
                    </button>
                  </div>
                </div>

                {/* The Clean Data Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/90 text-xs font-bold text-slate-600 uppercase tracking-wider select-none">
                        <th className="py-3.5 pl-6 pr-3 w-20">ID</th>
                        <th className="py-3.5 px-4 min-w-[220px]">Question</th>
                        <th className="py-3.5 px-4 text-center w-28">Match</th>
                        <th className="py-3.5 px-4 text-center w-28">Time</th>
                        <th className="py-3.5 pl-3 pr-6 text-right w-36">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {visible.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-16 text-center text-slate-500 font-medium">
                            <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto mb-3">
                              <CheckCircle2 size={18} className="text-slate-400" />
                            </div>
                            <div className="text-sm font-bold text-slate-900">No Queries in this View</div>
                            <div className="text-xs text-slate-500 mt-1">All clear for the selected filter criteria.</div>
                          </td>
                        </tr>
                      ) : (
                        visible.map(q => (
                          <QueryRow 
                            key={q.id} 
                            q={q} 
                            isSelected={selectedQuery?.id === q.id} 
                            onSelect={setSelectedQuery} 
                          />
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Table Footer */}
                <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between text-xs text-slate-600 font-semibold">
                  <span>{visible.length} queries displayed</span>
                  <span>AWS SBG REC Chat Intelligence</span>
                </div>
              </div>

              {/* Right: CMS Response Editor Panel */}
              <div className={cn(
                "lg:col-span-5 flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs min-h-[500px]",
                !selectedQuery ? "hidden lg:flex" : "flex"
              )}>
                <CMSPanel 
                  query={selectedQuery} 
                  onSaved={handleSaved} 
                  onDismissed={handleDismissed} 
                  showToast={showToast} 
                  user={user} 
                  onBack={() => setSelectedQuery(null)} 
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <Toast toast={toast} onClose={hideToast} />
    </div>
  );
}
