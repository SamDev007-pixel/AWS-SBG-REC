"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronDown, 
  User, 
  Shield, 
  Check, 
  Search, 
  AlertCircle, 
  CheckCircle, 
  Lock, 
  Unlock, 
  RefreshCw, 
  ShieldCheck,
  CalendarDays,
  GraduationCap,
  Cpu,
  MessageSquare,
  Map as MapIcon,
  Power,
  Clock,
  Pencil,
  Trash2,
  Users,
  UserPlus,
  Ban,
  X,
  KeyRound,
  Mail,
  UserCheck,
  Sparkles,
  SlidersHorizontal,
  ArrowRight,
  ShieldAlert,
  Sliders
} from "lucide-react";

// User context & API imports
import { UserProvider, useUser } from "@/lib/user-context";
import { workspaceApi as api } from "@/lib/workspace-api";
import { formatDate, cn } from "@/lib/utils";

// Temporary Access Control Types
interface PermissionState {
  id: string;
  permission: string;
  expiresAt: string;
  grantedAt: string;
  grantedById: string;
  grantedByName: string;
}

interface TemporaryCrewMember {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: {
    photo?: string | null;
    initials: string;
    color: string;
  };
  isActive: boolean;
  permissions: PermissionState[];
}

interface MemberItem {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: { photo?: string | null; initials: string; color: string } | null;
  banned: boolean;
}

interface ToastState {
  message: string;
  type: "success" | "error";
}

// Helper to parse event name and description from task notes
function parseTaskNotes(notes: string | null | undefined) {
  if (!notes) return { eventName: "", description: "" };
  if (notes.startsWith("Event: ")) {
    const index = notes.indexOf("\nDescription: ");
    if (index !== -1) {
      const eventName = notes.substring(7, index).trim();
      const description = notes.substring(index + 14).trim();
      return { eventName, description };
    } else {
      return { eventName: notes.substring(7).trim(), description: "" };
    }
  }
  return { eventName: "", description: notes };
}

// Permissions Metadata mapping
const SECURITY_MODULES = [
  { 
    key: "create_event", 
    label: "Events Space Elevation", 
    desc: "Redirects Crew operator to Core event space with create/delete capabilities.",
    icon: CalendarDays,
  },
  { 
    key: "view_analytics", 
    label: "Certifications Addition", 
    desc: "Unlocks core certifications creation & deletion panel on the certifications page.",
    icon: GraduationCap,
  },
  { 
    key: "edit_event", 
    label: "Services Hub Admin", 
    desc: "Allows Crew to add regions, edit presence nodes and configure service mesh parameters.",
    icon: Cpu,
  },
  { 
    key: "manage_announcements", 
    label: "Roadmap Builder Access", 
    desc: "Allows creating, updating, and deleting curriculum topics & modules on roadmap pages.",
    icon: MapIcon,
  },
  { 
    key: "scan_ticket", 
    label: "Chats Response Privileges", 
    desc: "Allows viewing unhandled enthusiast queries and answering/adding them to the FAQ KB.",
    icon: MessageSquare,
  }
];

function AccessControlDashboard() {
  const { currentUser, users, setCurrentUserById, isLoading: userContextLoading } = useUser();

  // Navigation State
  const [activeTab, setActiveTab] = useState<string>("Access Directory");

  // Data lists
  const [securityLogs, setSecurityLogs] = useState<any[]>([]);
  const [showAllLogs, setShowAllLogs] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Crew & Permission States
  const [tempCrew, setTempCrew] = useState<TemporaryCrewMember[]>([]);
  const [loadingPermissions, setLoadingPermissions] = useState(false);
  const [permissionsError, setPermissionsError] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [togglingKey, setTogglingKey] = useState<string | null>(null);

  // Selected Crew Member State for Task & Permission Assignment
  const [selectedCrewMemberId, setSelectedCrewMemberId] = useState<string>("");
  const [selectedCrewTasks, setSelectedCrewTasks] = useState<any[]>([]);
  const [loadingTasks, setLoadingTasks] = useState<boolean>(false);

  // Task Form States
  const [taskName, setTaskName] = useState("");
  const [taskEventName, setTaskEventName] = useState("");
  const [taskPriority, setTaskPriority] = useState<string>("medium");
  const [taskDeadline, setTaskDeadline] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [assigningTask, setAssigningTask] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [events, setEvents] = useState<any[]>([]);

  // ─── Members Management State ──────────────────────────────────────────────
  const [members, setMembers] = useState<MemberItem[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [memberSearch, setMemberSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "core" | "crew" | "enthusiasts">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "deactivated">("all");
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);

  // Add Member Form States
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<"crew" | "core">("crew");
  const [isCreatingMember, setIsCreatingMember] = useState(false);

  const isCore = currentUser?.role === "core";

  // Available tabs based on active developer identity role
  const workspaceTabs = useMemo(() => {
    if (isCore) {
      return ["Access Directory", "Members Directory", "Security Audit Logs"];
    } else {
      return ["My Active Permissions"];
    }
  }, [isCore]);

  // Handle identity switch - default to appropriate primary view
  useEffect(() => {
    setActiveTab(isCore ? "Access Directory" : "My Active Permissions");
    setSelectedCrewMemberId("");
    setSelectedCrewTasks([]);
  }, [currentUser, isCore]);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Load temporary permissions list
  const loadPermissionsData = async () => {
    try {
      setLoadingPermissions(true);
      setPermissionsError(null);
      const res = await fetch("/api/auth/permissions");
      if (!res.ok) {
        throw new Error("Failed to query permissions database.");
      }
      const data = await res.json();
      if (data.success) {
        setTempCrew(data.crew || []);
      } else {
        throw new Error(data.error || "Failed to load delegation dashboard");
      }
    } catch (err: any) {
      console.error(err);
      setPermissionsError(err.message || "Failed to sync connection.");
    } finally {
      setLoadingPermissions(false);
    }
  };

  // Load members directory list
  const fetchMembersList = useCallback(async () => {
    try {
      setMembersLoading(true);
      const res = await fetch("/api/auth");
      const data = await res.json();
      setMembers(data.data?.users ?? data.users ?? []);
    } catch (err) {
      console.error("Failed to load members list:", err);
    } finally {
      setMembersLoading(false);
    }
  }, []);

  // Load events list for dropdown
  const loadEventsData = async () => {
    try {
      const headers: Record<string, string> = {};
      const userId = typeof window !== 'undefined' ? (localStorage.getItem('selected_user_id') || currentUser?.id) : currentUser?.id;
      if (userId) {
        headers['x-user-id'] = userId;
      }
      const res = await fetch("/api/events?limit=100", { headers });
      if (!res.ok) {
        setEvents([]);
        return;
      }
      const responseJson = await res.json();
      let eventsList: any[] = [];
      if (responseJson && responseJson.success && responseJson.data) {
        if (Array.isArray(responseJson.data.data)) {
          eventsList = responseJson.data.data;
        } else if (Array.isArray(responseJson.data)) {
          eventsList = responseJson.data;
        }
      } else if (responseJson && Array.isArray(responseJson.data)) {
        eventsList = responseJson.data;
      } else if (Array.isArray(responseJson)) {
        eventsList = responseJson;
      }
      setEvents(eventsList);
    } catch (err) {
      console.warn("Unable to load events data:", err);
      setEvents([]);
    }
  };

  // Core API loader
  const loadWorkspaceData = async () => {
    if (!currentUser) return;
    setIsLoadingData(true);
    try {
      if (isCore) {
        const logs = await api.getSecurityLogs();
        setSecurityLogs(logs);
        await Promise.all([loadPermissionsData(), fetchMembersList(), loadEventsData()]);
      } else {
        await loadPermissionsData();
      }
    } catch (err) {
      console.error("Failed to load workspace data", err);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    loadWorkspaceData();
  }, [currentUser]);

  // Load assigned tasks when target crew member is selected
  const loadAssignedTasks = async (memberId: string) => {
    if (!memberId) {
      setSelectedCrewTasks([]);
      return;
    }
    try {
      setLoadingTasks(true);
      const res = await api.getTasks({ assigneeId: memberId });
      setSelectedCrewTasks(res?.data || []);
    } catch (err) {
      console.error("Failed to load tasks for crew member:", err);
    } finally {
      setLoadingTasks(false);
    }
  };

  useEffect(() => {
    if (isCore && selectedCrewMemberId) {
      loadAssignedTasks(selectedCrewMemberId);
    }
  }, [selectedCrewMemberId, isCore]);

  // Toggle permission handler
  const handleTogglePermission = async (userId: string, permission: string, currentEnabled: boolean) => {
    const key = `${userId}_${permission}`;
    try {
      setTogglingKey(key);
      if (currentEnabled) {
        const res = await fetch(`/api/auth/permissions?userId=${userId}&permission=${permission}`, {
          method: "DELETE",
          headers: {
            "x-user-id": currentUser?.id || ""
          }
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || "Failed to revoke permission.");
        }
        showToast("Security access revoked.", "success");
      } else {
        const res = await fetch("/api/auth/permissions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-user-id": currentUser?.id || ""
          },
          body: JSON.stringify({
            userId,
            permission,
            durationMinutes: 52560000,
            grantedById: currentUser?.id || null
          })
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || "Failed to grant permission.");
        }
        showToast("Elevated authority granted permanently.", "success");
      }
      await loadWorkspaceData();
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Action failed.", "error");
    } finally {
      setTogglingKey(null);
    }
  };

  // Task Assign Form Submission / Update
  const handleAssignTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCrewMemberId) {
      showToast("Please select a crew member first.", "error");
      return;
    }
    if (!taskName.trim()) {
      showToast("Task name is required.", "error");
      return;
    }
    if (!taskDeadline) {
      showToast("Deadline is required.", "error");
      return;
    }

    try {
      setAssigningTask(true);
      if (editingTaskId) {
        await api.updateTask(editingTaskId, {
          name: taskName.trim(),
          priority: taskPriority as any,
          dueDate: new Date(taskDeadline).toISOString(),
          notes: `Event: ${taskEventName.trim()}\nDescription: ${taskDescription.trim() || 'No description provided.'}`
        });
        showToast("Task updated successfully.", "success");
        setEditingTaskId(null);
      } else {
        await api.createTask({
          name: taskName.trim(),
          category: "during_event",
          priority: taskPriority as any,
          assignedToId: selectedCrewMemberId,
          dueDate: new Date(taskDeadline).toISOString(),
          notes: `Event: ${taskEventName.trim()}\nDescription: ${taskDescription.trim() || 'No description provided.'}`
        });
        showToast(`Task assigned & announcement posted!`, "success");
      }
      
      setTaskName("");
      setTaskEventName("");
      setTaskDescription("");
      setTaskDeadline("");
      
      await loadAssignedTasks(selectedCrewMemberId);
      const logs = await api.getSecurityLogs();
      setSecurityLogs(logs);
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Failed to save task.", "error");
    } finally {
      setAssigningTask(false);
    }
  };

  const handleEditClick = (task: any) => {
    const { eventName, description } = parseTaskNotes(task.notes);
    setEditingTaskId(task.id);
    setTaskName(task.name);
    setTaskEventName(eventName || "");
    setTaskPriority(task.priority);
    if (task.dueDate) {
      const d = new Date(task.dueDate);
      const tzoffset = d.getTimezoneOffset() * 60000;
      const localISOTime = (new Date(d.getTime() - tzoffset)).toISOString().slice(0, 16);
      setTaskDeadline(localISOTime);
    } else {
      setTaskDeadline("");
    }
    setTaskDescription(description || "");
  };

  const handleCancelEdit = () => {
    setEditingTaskId(null);
    setTaskName("");
    setTaskEventName("");
    setTaskPriority("medium");
    setTaskDeadline("");
    setTaskDescription("");
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
      await api.deleteTask(taskId);
      showToast("Task deleted successfully.", "success");
      await loadAssignedTasks(selectedCrewMemberId);
      const logs = await api.getSecurityLogs();
      setSecurityLogs(logs);
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Failed to delete task.", "error");
    }
  };

  // ─── Member CRUD Handlers ──────────────────────────────────────────────────
  const handleRegisterMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim() || !newPassword.trim()) {
      showToast("Please fill all required member details.", "error");
      return;
    }
    try {
      setIsCreatingMember(true);
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "register",
          name: newName.trim(),
          email: newEmail.trim(),
          password: newPassword.trim(),
          role: newRole,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Failed to create member account.", "error");
        return;
      }
      showToast(`Account for ${newName.trim()} created successfully!`, "success");
      setNewName("");
      setNewEmail("");
      setNewPassword("");
      setNewRole("crew");
      setIsAddMemberOpen(false);
      await Promise.all([fetchMembersList(), loadPermissionsData()]);
    } catch (err) {
      showToast("Network error while creating account.", "error");
    } finally {
      setIsCreatingMember(false);
    }
  };

  const handleDeactivateMember = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to deactivate ${name}'s account?`)) return;
    try {
      const res = await fetch(`/api/auth?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      showToast(`${name} has been deactivated.`, "success");
      await Promise.all([fetchMembersList(), loadPermissionsData()]);
    } catch {
      showToast("Failed to deactivate account.", "error");
    }
  };

  const handleActivateMember = async (id: string, name: string) => {
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "unban", userId: id }),
      });
      if (!res.ok) throw new Error();
      showToast(`${name}'s account has been reactivated!`, "success");
      await Promise.all([fetchMembersList(), loadPermissionsData()]);
    } catch {
      showToast("Failed to reactivate account.", "error");
    }
  };

  // Filtered members list
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const matchSearch =
        !memberSearch ||
        m.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
        m.email.toLowerCase().includes(memberSearch.toLowerCase()) ||
        m.role.toLowerCase().includes(memberSearch.toLowerCase());

      if (!matchSearch) return false;

      // Role filter
      if (roleFilter === "core" && m.role !== "core") return false;
      if (roleFilter === "crew" && !["crew", "volunteer", "scanner"].includes(m.role)) return false;
      if (roleFilter === "enthusiasts" && !["enthusiasts", "enthusiast"].includes(m.role)) return false;

      // Status filter
      if (statusFilter === "active" && m.banned) return false;
      if (statusFilter === "deactivated" && !m.banned) return false;

      return true;
    });
  }, [members, memberSearch, roleFilter, statusFilter]);

  // Counts for member tabs
  const memberCounts = useMemo(() => {
    return {
      all: members.length,
      core: members.filter(m => m.role === "core").length,
      crew: members.filter(m => ["crew", "volunteer", "scanner"].includes(m.role)).length,
      enthusiasts: members.filter(m => ["enthusiasts", "enthusiast"].includes(m.role)).length,
      active: members.filter(m => !m.banned).length,
      deactivated: members.filter(m => m.banned).length,
    };
  }, [members]);

  // Memoized current selection target crew member
  const selectedCrewMember = useMemo(() => {
    return tempCrew.find(c => c.id === selectedCrewMemberId);
  }, [tempCrew, selectedCrewMemberId]);

  const eventOptions = useMemo(() => {
    const list = [...events];
    if (taskEventName && !list.some(e => e.title === taskEventName)) {
      list.push({ id: "temp-event", title: taskEventName });
    }
    return list;
  }, [events, taskEventName]);

  const activeMembers = useMemo(() => {
    return tempCrew.filter(c => c.permissions && c.permissions.length > 0);
  }, [tempCrew]);

  const myCrewObject = useMemo(() => {
    return tempCrew.find(m => m.id === currentUser?.id);
  }, [tempCrew, currentUser]);

  const filteredLogs = useMemo(() => {
    if (showAllLogs) return securityLogs;
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return securityLogs.filter((log) => {
      if (!log.createdAt) return false;
      return new Date(log.createdAt) >= oneWeekAgo;
    });
  }, [securityLogs, showAllLogs]);

  if (userContextLoading) {
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
          <span className="text-xs text-slate-500 font-semibold">Configuring Workspace Identity...</span>
        </div>
      </div>
    );
  }

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
        {/* Toast notifications */}
        {toast && (
          <div className={`fixed bottom-8 right-8 z-[200] flex items-center gap-2.5 px-6 py-3.5 rounded-[8px] shadow-xl border backdrop-blur-md animate-[fadeIn_0.2s_ease-out] ${
            toast.type === "success"
              ? "bg-emerald-50/95 text-emerald-800 border-emerald-100"
              : "bg-red-50/95 text-red-800 border-red-100"
          }`}>
            {toast.type === "success" ? <CheckCircle size={16} className="text-emerald-500" /> : <AlertCircle size={16} className="text-red-500" />}
            <p className="text-[10px] font-extrabold uppercase tracking-wider">{toast.message}</p>
          </div>
        )}

        {/* Header with Breadcrumb Path, User Badge, and Aligned Tab Switcher */}
        <header className="flex flex-col gap-3.5 pb-2">
          {/* Top Bar: Breadcrumb + Operator Badge */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
              <span className="hover:text-[#FF6B00] transition-colors font-semibold">AWS SBG REC</span>
              <span className="text-slate-300">/</span>
              <span className="text-[#FF6B00] font-semibold">Core Management</span>
              <span className="text-slate-300">/</span>
              <span className="text-slate-700 font-semibold">{activeTab}</span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-slate-200/90 bg-white/90 shadow-2xs text-xs select-none">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <User size={12} className={currentUser?.role === "core" ? "text-[#FF9900]" : "text-slate-400"} />
              <span className="font-semibold text-slate-700 truncate max-w-[140px]">{currentUser?.name || "Member"}</span>
              <span className="text-[10px] uppercase font-bold text-slate-400">({currentUser?.role || "OPERATOR"})</span>
            </div>
          </div>

          {/* Main Title Row: Page Heading + Tab Navigation Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <p className="font-display text-2xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-3xl">
                {activeTab === "Access Directory" 
                  ? "Access Directory & Permissions" 
                  : activeTab === "Members Directory" 
                  ? "Members Directory" 
                  : activeTab === "Security Audit Logs"
                  ? "Security Audit Logs"
                  : "Active Permissions"}
              </p>
              
              <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
                {activeTab === "Access Directory"
                  ? "Manage team accounts, delegate temporary module permissions, and allocate task assignments."
                  : activeTab === "Members Directory"
                  ? "View and manage system administrators, crew members, operating access, and account statuses."
                  : activeTab === "Security Audit Logs"
                  ? "Comprehensive security ledger tracking permission elevations, role changes, and system access."
                  : "View your currently active module permissions and privileges."}
              </p>
            </div>

            {/* Navigation Tabs + Action Buttons */}
            <div className="shrink-0 flex items-center gap-2.5 flex-wrap">
              <div className="inline-flex items-center bg-slate-100/90 p-1 rounded-lg border border-slate-200/80 shadow-2xs">
                {workspaceTabs.map(tab => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer text-center outline-none focus:outline-none select-none",
                      activeTab === tab
                        ? "bg-white text-slate-900 shadow-2xs font-bold border border-slate-200/80"
                        : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/40 border border-transparent"
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {activeTab === "Members Directory" && isCore && (
                <button
                  onClick={() => setIsAddMemberOpen(true)}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-[#232F3E] hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer border-none"
                >
                  <UserPlus size={13} />
                  <span>Add New Member</span>
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Workspace Body */}
        {isLoadingData ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <div className="w-6 h-6 rounded-full border border-slate-800 border-t-transparent animate-spin mb-3" />
            <p className="text-xs font-semibold">Syncing security states...</p>
          </div>
        ) : (
          <div className="relative">
            
            {/* 1. CORE: ACCESS DIRECTORY (ENABLE/DISABLE CONTROLS & ASSIGNMENTS) */}
            {isCore && (
              <>
                <div className={`space-y-6 animate-[fadeIn_0.3s_ease-out] ${activeTab === "Access Directory" ? "" : "hidden"}`}>
                  {permissionsError && (
                    <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-[8px] text-xs font-semibold flex items-center gap-2 shadow-sm">
                      <AlertCircle size={16} className="shrink-0" />
                      <span>{permissionsError}</span>
                    </div>
                  )}

                  {/* Unified Main Workspace Container Card */}
                  <div className="bg-white border border-slate-200 rounded-[8px] p-4 sm:p-8 shadow-xs space-y-6">
                    {/* Dropdown Crew Selector & Active Header Row */}
                    <div className="flex items-center justify-between pb-6 border-b border-slate-100 flex-wrap gap-4">
                      <div className="max-w-md w-full">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">
                          Target Crew Member
                        </label>
                        <div className="relative">
                          <select
                            value={selectedCrewMemberId}
                            onChange={(e) => setSelectedCrewMemberId(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-[8px] text-sm px-4 py-3.5 pr-10 outline-none focus:border-slate-350 transition-all font-semibold text-slate-800 appearance-none cursor-pointer"
                          >
                            <option value="">Select a crew member...</option>
                            {tempCrew.map((member) => (
                              <option key={member.id} value={member.id}>
                                {member.name} ({member.email})
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        </div>
                      </div>

                      {selectedCrewMember && (
                        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-[8px] w-full sm:w-auto">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                          <div className="text-sm min-w-0">
                            <span className="font-bold text-slate-800 truncate block sm:inline">{selectedCrewMember.name}</span>
                            <span className="text-slate-400 font-semibold sm:ml-1.5 uppercase text-xs">({selectedCrewMember.role})</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Main content workspace area */}
                    {!selectedCrewMember ? (
                      activeMembers.length > 0 ? (
                        <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-1 gap-2">
                            <div>
                              <h3 className="text-base sm:text-lg font-bold text-[#232F3E] tracking-tight">Active Core Access Directory</h3>
                              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-0.5">
                                Crew members currently holding elevated credentials to core modules
                              </p>
                            </div>
                            <span className="inline-block bg-[#232F3E]/5 text-[#232F3E] border border-slate-200 px-2.5 py-1 rounded-[6px] text-xs font-bold uppercase tracking-wide w-fit">
                              Active Grants: {activeMembers.length}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                            {activeMembers.map((member) => {
                              const roleColors: Record<string, string> = {
                                volunteer: "bg-emerald-50 text-emerald-700 border-emerald-100",
                                scanner: "bg-sky-50 text-sky-700 border-sky-100",
                                crew: "bg-slate-50 text-slate-700 border-slate-150"
                              };
                              const roleNameNormalized = (member.role || "crew").toLowerCase();
                              const roleBadgeClass = roleColors[roleNameNormalized] || roleColors.crew;

                              return (
                                <div
                                  key={member.id}
                                  onClick={() => setSelectedCrewMemberId(member.id)}
                                  className="bg-slate-50/40 border border-slate-200/80 rounded-[8px] p-4 sm:p-6 hover:bg-slate-50/90 hover:border-slate-300 transition-all duration-300 cursor-pointer flex flex-col justify-between group relative overflow-hidden"
                                >
                                  <div>
                                    <div className="flex items-start justify-between gap-3 mb-2">
                                      <div className="flex items-center gap-3 min-w-0">
                                        {member.avatar?.photo ? (
                                          <img
                                            src={member.avatar.photo}
                                            alt={member.name}
                                            className="w-10 h-10 sm:w-11 sm:h-11 rounded-[8px] object-cover ring-2 ring-slate-100 group-hover:ring-[#FF9900]/30 transition-all duration-300 shrink-0"
                                          />
                                        ) : (
                                          <div
                                            className="w-10 h-10 sm:w-11 sm:h-11 rounded-[8px] flex items-center justify-center font-bold text-xs text-white shadow-xs group-hover:scale-105 ring-2 ring-slate-100 group-hover:ring-[#FF9900]/30 transition-all duration-300 shrink-0"
                                            style={{ backgroundColor: member.avatar?.color || '#232F3E' }}
                                          >
                                            {member.avatar?.initials || "CR"}
                                          </div>
                                        )}

                                        <div className="min-w-0">
                                          <h4 className="text-sm sm:text-base font-bold text-[#232F3E] group-hover:text-[#FF9900] transition-colors duration-300 truncate">
                                            {member.name}
                                          </h4>
                                          <p className="text-xs text-slate-400 font-medium truncate mt-0.5">
                                            {member.email}
                                          </p>
                                        </div>
                                      </div>

                                      <span className={`px-2 py-0.5 rounded-[6px] text-[10px] sm:text-xs font-bold uppercase tracking-wide border shrink-0 ${roleBadgeClass}`}>
                                        {member.role || "CREW"}
                                      </span>
                                    </div>

                                    <div className="border-b border-slate-200/60 my-4" />

                                    <div className="space-y-2 relative z-10">
                                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">
                                        Active Permissions
                                      </p>
                                      <div className="flex flex-wrap gap-1.5">
                                        {member.permissions.map((p) => {
                                          const matchedModule = SECURITY_MODULES.find(m => m.key === p.permission);
                                          const label = matchedModule?.label || p.permission;
                                          const Icon = matchedModule?.icon || Shield;

                                          return (
                                            <span
                                              key={p.permission}
                                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[6px] text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200 shadow-xs group-hover:shadow transition-shadow duration-300"
                                            >
                                              <Icon size={11} className="shrink-0 text-slate-500" />
                                              <span>{label}</span>
                                            </span>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="mt-6 pt-3 border-t border-slate-200/50 flex items-center justify-between text-xs font-bold uppercase tracking-wide text-slate-400 group-hover:text-[#FF9900] transition-colors duration-300 relative z-10">
                                    <span>Configure Member</span>
                                    <ChevronDown className="w-3.5 h-3.5 -rotate-90 group-hover:translate-x-0.5 transition-transform duration-300" />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className="py-20 text-center select-none relative overflow-hidden flex flex-col items-center justify-center">
                          <div className="relative z-10 space-y-4 max-w-sm mx-auto">
                            <div className="w-14 h-14 rounded-[8px] bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-400 mx-auto shadow-xs ring-4 ring-slate-50/50">
                              <Lock className="w-6 h-6 text-slate-500" />
                            </div>
                            <div className="space-y-1.5 px-4">
                              <h3 className="text-[#232F3E] font-bold text-lg tracking-tight">No Active Access Grants</h3>
                              <p className="text-slate-400 text-xs font-medium leading-relaxed">
                                There are currently no crew members with elevated permissions. Select a crew member from the dropdown above to assign tasks and delegate credentials.
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    ) : (
                      /* Selected Operator View Inset Grid */
                      <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                          {/* Left Block: Assign Task Form */}
                          <div className="lg:col-span-7 bg-slate-50/40 border border-slate-200/80 rounded-[8px] p-4 sm:p-6 flex flex-col justify-between">
                            <div>
                              <div className="pb-3 border-b border-slate-200/60 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                                <div>
                                  <h3 className="text-base sm:text-lg font-bold text-[#232F3E] tracking-tight">
                                    {editingTaskId ? "Edit Task" : "Assign New Task"}
                                  </h3>
                                  <p className="text-[10px] text-slate-400 uppercase font-medium tracking-wider mt-0.5">
                                    {editingTaskId 
                                      ? `Modify event duties for ${selectedCrewMember.name}` 
                                      : `Delegate event duties to ${selectedCrewMember.name}`}
                                  </p>
                                </div>
                                <span className="inline-block bg-orange-50 text-[#FF9900] border border-orange-100 px-2.5 py-0.5 rounded-[6px] text-xs font-bold uppercase tracking-wide whitespace-nowrap shrink-0 w-fit">
                                  {editingTaskId ? "TASK EDITOR" : "TASK DELEGATOR"}
                                </span>
                              </div>

                              <form onSubmit={handleAssignTask} className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-tight mb-2">Event Name</label>
                                    <select
                                      value={taskEventName}
                                      onChange={(e) => setTaskEventName(e.target.value)}
                                      className="w-full bg-white border border-slate-200 rounded-[8px] text-sm px-3.5 py-3 outline-none font-semibold text-slate-800 focus:border-slate-350 cursor-pointer"
                                    >
                                      <option value="">Select Event (Optional)</option>
                                      {eventOptions.map((evt) => (
                                        <option key={evt.id} value={evt.title}>
                                          {evt.title}
                                        </option>
                                      ))}
                                    </select>
                                  </div>

                                  <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-tight mb-2">Priority</label>
                                    <select
                                      value={taskPriority}
                                      onChange={(e) => setTaskPriority(e.target.value)}
                                      className="w-full bg-white border border-slate-200 rounded-[8px] text-sm px-3.5 py-3 outline-none font-semibold text-slate-700 focus:border-slate-350 cursor-pointer"
                                    >
                                      <option value="low">Low</option>
                                      <option value="medium">Medium</option>
                                      <option value="high">High</option>
                                      <option value="critical">Critical</option>
                                    </select>
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-tight mb-2">Task Name</label>
                                  <input
                                    type="text"
                                    placeholder="e.g. Design Event Banner, Scan QR Codes..."
                                    value={taskName}
                                    onChange={(e) => setTaskName(e.target.value)}
                                    className="w-full bg-white border border-slate-200 rounded-[8px] text-sm px-3.5 py-3 outline-none font-semibold text-slate-800 focus:border-slate-350"
                                  />
                                </div>

                                <div>
                                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-tight mb-2">Deadline</label>
                                  <input
                                    type="datetime-local"
                                    value={taskDeadline}
                                    onChange={(e) => setTaskDeadline(e.target.value)}
                                    className="w-full bg-white border border-slate-200 rounded-[8px] text-sm px-3.5 py-3 outline-none font-semibold text-slate-800 focus:border-slate-350"
                                  />
                                </div>

                                <div>
                                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-tight mb-2">Short Description</label>
                                  <textarea
                                    rows={3}
                                    placeholder="Write description or notes for the crew member..."
                                    value={taskDescription}
                                    onChange={(e) => setTaskDescription(e.target.value)}
                                    className="w-full bg-white border border-slate-200 rounded-[8px] text-sm px-3.5 py-3 outline-none font-semibold text-slate-800 focus:border-slate-350 resize-none leading-relaxed"
                                  />
                                </div>

                                <div className="flex gap-3">
                                  <button
                                    type="submit"
                                    disabled={assigningTask}
                                    className="flex-1 py-3 px-4 bg-[#232F3E] hover:bg-[#1a232f] text-white rounded-[8px] font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-sm hover:shadow"
                                  >
                                    {assigningTask ? "Saving Task..." : (editingTaskId ? "Update Task" : "Assign Task to Operator")}
                                  </button>
                                  {editingTaskId && (
                                    <button
                                      type="button"
                                      onClick={handleCancelEdit}
                                      className="py-3 px-4 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-[8px] font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-sm"
                                    >
                                      Cancel
                                    </button>
                                  )}
                                </div>
                              </form>
                            </div>
                          </div>

                          {/* Right Block: Elevated Permissions Toggles */}
                          <div className="lg:col-span-5 bg-slate-50/40 border border-slate-200/80 rounded-[8px] p-4 sm:p-6 flex flex-col justify-between">
                            <div>
                              <div className="pb-3 border-b border-slate-200/60 mb-4 flex items-center justify-between">
                                <div>
                                  <h3 className="text-base sm:text-lg font-bold text-[#232F3E] tracking-tight">Security Elevators</h3>
                                  <p className="text-[10px] text-slate-400 uppercase font-medium tracking-wider mt-0.5">
                                    Directly unlock core workspace capabilities
                                  </p>
                                </div>
                                <ShieldCheck size={20} className="text-[#FF9900]" />
                              </div>

                              <div className="space-y-3">
                                {SECURITY_MODULES.map((mod) => {
                                  const isEnabled = selectedCrewMember.permissions.some(p => p.permission === mod.key);
                                  const isToggling = togglingKey === `${selectedCrewMember.id}_${mod.key}`;
                                  const Icon = mod.icon;

                                  return (
                                    <div
                                      key={mod.key}
                                      className="p-3.5 rounded-[8px] border bg-white border-slate-200 shadow-2xs hover:border-slate-300 transition-all flex items-center justify-between gap-3"
                                    >
                                      <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-100 border border-slate-200 text-slate-700 shrink-0">
                                          <Icon size={15} strokeWidth={1.75} />
                                        </div>
                                        <div className="min-w-0">
                                          <p className="text-xs font-bold text-slate-800 truncate">{mod.label}</p>
                                          <p className="text-[10px] text-slate-400 line-clamp-1 leading-snug">{mod.desc}</p>
                                        </div>
                                      </div>

                                      <button
                                        onClick={() => handleTogglePermission(selectedCrewMember.id, mod.key, isEnabled)}
                                        disabled={isToggling}
                                        className={cn(
                                          "px-3 py-1.5 rounded-[6px] text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shrink-0 border",
                                          isEnabled
                                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-red-50 hover:text-red-700 hover:border-red-200"
                                            : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200"
                                        )}
                                      >
                                        {isToggling ? "Syncing..." : isEnabled ? "Active" : "Grant"}
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            <button
                              onClick={() => setSelectedCrewMemberId("")}
                              className="mt-6 w-full py-2.5 rounded-[8px] text-xs font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors uppercase tracking-wider cursor-pointer"
                            >
                              Close Member Panel
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. CORE: MEMBERS MANAGEMENT DIRECTORY - ENTERPRISE DATA TABLE */}
                <div className={`space-y-4 animate-[fadeIn_0.3s_ease-out] ${activeTab === "Members Directory" ? "" : "hidden"}`}>
                  {/* Table Card Container */}
                  <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden flex flex-col">
                    {/* Controls Bar: Search & Filter Tabs */}
                    <div className="px-5 py-3 border-b border-slate-200 bg-white flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shrink-0">
                      {/* Search */}
                      <div className="relative flex-1 max-w-sm">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <input
                          type="text"
                          value={memberSearch}
                          onChange={(e) => setMemberSearch(e.target.value)}
                          placeholder="Search members by name or email..."
                          className="w-full pl-9 pr-8 py-2 bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-500 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition-all font-semibold"
                        />
                        {memberSearch && (
                          <button 
                            onClick={() => setMemberSearch("")} 
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer outline-none"
                          >
                            <X size={13} />
                          </button>
                        )}
                      </div>

                      {/* Filter Controls Group */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Role Segmented Tabs */}
                        <div className="inline-flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200/80 shadow-2xs">
                          {[
                            { key: "all", label: "All", count: memberCounts.all },
                            { key: "core", label: "Core", count: memberCounts.core },
                            { key: "crew", label: "Crew", count: memberCounts.crew },
                            { key: "enthusiasts", label: "Enthusiasts", count: memberCounts.enthusiasts },
                          ].map((tab) => {
                            const isActive = roleFilter === tab.key;
                            return (
                              <button
                                key={tab.key}
                                type="button"
                                onClick={() => setRoleFilter(tab.key as any)}
                                className={cn(
                                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition-all cursor-pointer select-none outline-none focus:outline-none",
                                  isActive
                                    ? "bg-white text-slate-900 shadow-2xs font-bold"
                                    : "text-slate-600 font-semibold hover:text-slate-950 hover:bg-slate-200/40"
                                )}
                              >
                                <span>{tab.label}</span>
                                <span className={cn(
                                  "text-[11px] px-1 py-0.2 rounded font-bold",
                                  isActive ? "text-slate-900 bg-slate-100" : "text-slate-500"
                                )}>
                                  {tab.count}
                                </span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Status Filter Dropdown */}
                        <div className="relative">
                          <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as any)}
                            className="appearance-none bg-slate-100 hover:bg-slate-200/60 border border-slate-200/80 rounded-lg pl-3 pr-7 py-1.5 text-xs font-bold text-slate-700 outline-none cursor-pointer transition-colors"
                          >
                            <option value="all">All Status ({memberCounts.all})</option>
                            <option value="active">Active Only ({memberCounts.active})</option>
                            <option value="deactivated">Deactivated ({memberCounts.deactivated})</option>
                          </select>
                          <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    {/* The Clean Data Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-slate-200 bg-slate-50/90 text-xs font-bold text-slate-700 uppercase tracking-wider">
                            <th className="py-3.5 px-5 sm:px-6">Member</th>
                            <th className="py-3.5 px-4">Role</th>
                            <th className="py-3.5 px-4">Status</th>
                            <th className="py-3.5 px-4">Access Level</th>
                            <th className="py-3.5 px-5 sm:px-6 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {membersLoading ? (
                            <tr>
                              <td colSpan={5} className="py-16 text-center text-slate-500 font-medium">
                                <RefreshCw size={18} className="animate-spin text-[#FF9900] mx-auto mb-2" />
                                <span>Loading member records...</span>
                              </td>
                            </tr>
                          ) : filteredMembers.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="py-14 text-center text-slate-500 font-semibold">
                                No members found matching {memberSearch ? `"${memberSearch}"` : "the selected filters"}.
                              </td>
                            </tr>
                          ) : (
                            filteredMembers.map((member) => {
                              const isCoreRole = member.role === "core";
                              const isCrewRole = member.role === "crew" || member.role === "volunteer" || member.role === "scanner";
                              const crewRecord = tempCrew.find(c => c.id === member.id);
                              const permCount = crewRecord?.permissions?.length || 0;

                              return (
                                <tr 
                                  key={member.id}
                                  className={cn(
                                    "transition-colors hover:bg-slate-50/70 group",
                                    member.banned && "bg-slate-50/50 opacity-75"
                                  )}
                                >
                                  {/* Col 1: Member Identity */}
                                  <td className="py-3.5 px-5 sm:px-6">
                                    <div className="flex items-center gap-3">
                                      {member.avatar?.photo ? (
                                        <img
                                          src={member.avatar.photo}
                                          alt={member.name}
                                          className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200 shrink-0"
                                        />
                                      ) : (
                                        <div
                                          className={cn(
                                            "w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ring-1",
                                            isCoreRole 
                                              ? "bg-amber-100 text-amber-800 ring-amber-200" 
                                              : isCrewRole 
                                              ? "bg-slate-100 text-slate-800 ring-slate-200" 
                                              : "bg-slate-100 text-slate-700 ring-slate-200"
                                          )}
                                        >
                                          {member.avatar?.initials || member.name.slice(0, 2).toUpperCase()}
                                        </div>
                                      )}
                                      <div className="min-w-0">
                                        <div className="font-bold text-slate-900 text-sm truncate">
                                          {member.name}
                                        </div>
                                        <div className="text-xs text-slate-500 font-medium truncate mt-0.5">
                                          {member.email}
                                        </div>
                                      </div>
                                    </div>
                                  </td>

                                  {/* Col 2: System Role */}
                                  <td className="py-3.5 px-4 whitespace-nowrap">
                                    <span className={cn(
                                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border",
                                      isCoreRole 
                                        ? "bg-amber-50 text-amber-900 border-amber-300/80" 
                                        : isCrewRole
                                        ? "bg-slate-100 text-slate-800 border-slate-300"
                                        : "bg-slate-50 text-slate-700 border-slate-200"
                                    )}>
                                      {isCoreRole && <Shield size={12} className="text-amber-600" />}
                                      {isCrewRole && <User size={12} className="text-slate-600" />}
                                      <span className="capitalize">{member.role === "core" ? "Core Admin" : member.role === "crew" ? "Crew Member" : member.role}</span>
                                    </span>
                                  </td>

                                  {/* Col 3: Status */}
                                  <td className="py-3.5 px-4 whitespace-nowrap">
                                    <div className="flex items-center gap-1.5 text-xs">
                                      <span className={cn(
                                        "w-2 h-2 rounded-full",
                                        member.banned ? "bg-red-500" : "bg-emerald-500"
                                      )} />
                                      <span className={member.banned ? "text-slate-500 font-semibold" : "text-slate-800 font-semibold"}>
                                        {member.banned ? "Deactivated" : "Active"}
                                      </span>
                                    </div>
                                  </td>

                                  {/* Col 4: Active Permissions */}
                                  <td className="py-3.5 px-4 whitespace-nowrap">
                                    {isCoreRole ? (
                                      <span className="text-xs font-bold text-amber-900">
                                        Full Root Access
                                      </span>
                                    ) : isCrewRole ? (
                                      permCount > 0 ? (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-blue-50 text-blue-800 border border-blue-200 text-xs font-bold">
                                          <ShieldCheck size={13} />
                                          <span>{permCount} Elevated {permCount === 1 ? "Grant" : "Grants"}</span>
                                        </span>
                                      ) : (
                                        <span className="text-slate-600 text-xs font-semibold">
                                          Baseline Access
                                        </span>
                                      )
                                    ) : (
                                      <span className="text-slate-600 text-xs font-semibold">
                                        Standard User
                                      </span>
                                    )}
                                  </td>

                                  {/* Col 5: Actions */}
                                  <td className="py-3.5 px-5 sm:px-6 text-right whitespace-nowrap">
                                    <div className="inline-flex items-center gap-2">
                                      {isCrewRole && (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setSelectedCrewMemberId(member.id);
                                            setActiveTab("Access Directory");
                                          }}
                                          className="px-2.5 py-1 text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer outline-none focus:outline-none focus-visible:outline-none"
                                          title="Configure permissions & tasks"
                                        >
                                          Configure
                                        </button>
                                      )}

                                      {member.banned ? (
                                        <button
                                          type="button"
                                          onClick={() => handleActivateMember(member.id, member.name)}
                                          className="px-2.5 py-1 rounded-md text-xs font-bold text-emerald-800 bg-emerald-100/70 hover:bg-emerald-100 transition-colors cursor-pointer outline-none focus:outline-none focus-visible:outline-none"
                                        >
                                          Activate
                                        </button>
                                      ) : (
                                        <button
                                          type="button"
                                          onClick={() => handleDeactivateMember(member.id, member.name)}
                                          className="px-2.5 py-1 rounded-md text-xs font-bold text-slate-500 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer outline-none focus:outline-none focus-visible:outline-none"
                                        >
                                          Deactivate
                                        </button>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Table Footer */}
                    <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between text-xs text-slate-600 font-semibold">
                      <span>{filteredMembers.length} accounts listed</span>
                      <span>AWS SBG REC Access Control</span>
                    </div>
                  </div>
                </div>

                {/* 3. CORE: SECURITY AUDIT LOGS */}
                <div className={`space-y-6 animate-[fadeIn_0.3s_ease-out] ${activeTab === "Security Audit Logs" ? "" : "hidden"}`}>
                  <div className="bg-white border border-slate-200 rounded-[8px] p-4 sm:p-8 shadow-xs space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-4">
                      <div className="flex items-center gap-2">
                        <ShieldAlert size={16} className="text-[#FF9900]" />
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Audit Ledger Timeline</span>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                          {securityLogs.length} events
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4 pl-6 border-l-2 border-slate-200/80 relative">
                      {filteredLogs.map((log) => {
                        const isGranted = log.action === "permission_granted";
                        const matchedModule = SECURITY_MODULES.find(m => m.key === log.permission);
                        const label = matchedModule?.label || log.permission || "Elevated Module Access";
                        const Icon = isGranted ? Check : X;

                        return (
                          <div key={log.id} className="relative pb-6 last:pb-0">
                            <div className={`absolute left-[-31px] top-0.5 w-4 h-4 rounded-full bg-white border-2 flex items-center justify-center shadow-xs ${
                              isGranted ? "border-emerald-500 text-emerald-500" : "border-red-500 text-red-500"
                            }`}>
                              <Icon size={8} />
                            </div>
                            
                            <div className="flex flex-col space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-slate-800 text-sm">{log.operator?.name || "System Administrator"}</span>
                                
                                <span className={`px-2.5 py-0.5 rounded-[6px] text-xs font-bold uppercase tracking-tight ${
                                  isGranted 
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                                    : "bg-red-50 text-red-700 border border-red-100"
                                }`}>
                                  {isGranted ? "Granted" : "Revoked"}
                                </span>
                                
                                <span className="text-xs text-slate-400 font-semibold ml-auto">{formatDate(log.createdAt)}</span>
                              </div>

                              <p className="text-slate-600 text-xs leading-relaxed mt-1">
                                {isGranted ? (
                                  <>
                                    Granted <span className="font-semibold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded-md text-xs">{label}</span> access to{" "}
                                    <span className="font-semibold text-[#232F3E]">{log.target?.name || "Crew Operator"}</span> ({log.target?.email || ""}).
                                  </>
                                ) : (
                                  <>
                                    Revoked <span className="font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded-md text-[11px]">{label}</span> access from{" "}
                                    <span className="font-bold text-[#232F3E]">{log.target?.name || "Crew Operator"}</span> ({log.target?.email || ""}).
                                  </>
                                )}
                              </p>
                            </div>
                          </div>
                        );
                      })}

                      {filteredLogs.length === 0 && (
                        <div className="text-center py-12 text-slate-400 font-semibold">
                          No access control modifications logged in the selected timeframe.
                        </div>
                      )}

                      {!showAllLogs && securityLogs.length > filteredLogs.length && (
                        <div className="text-center py-4 border-t border-slate-100 mt-4 select-none">
                          <p className="text-xs text-slate-400 font-bold uppercase tracking-tight mb-2">
                            {securityLogs.length - filteredLogs.length} older entries are hidden
                          </p>
                          <button
                            onClick={() => setShowAllLogs(true)}
                            className="px-4 py-2 rounded-[8px] text-xs font-bold uppercase tracking-tight bg-[#232F3E] hover:bg-[#1a232f] text-white border border-[#232F3E] cursor-pointer shadow-sm hover:shadow"
                          >
                            View Complete Log History
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* 4. CREW: MY ACTIVE PERMISSIONS */}
            {!isCore && activeTab === "My Active Permissions" && (
              <div className="w-full space-y-6">
                <div className="bg-white border border-slate-200/80 rounded-[8px] p-6 shadow-sm relative overflow-hidden">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-[8px] bg-orange-50 border border-orange-100 flex items-center justify-center text-[#FF9900] shadow-sm">
                      <ShieldCheck size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#232F3E] tracking-tight">Active Credentials Console</h3>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-tight mt-0.5">Elevated Session Privileges</p>
                    </div>
                  </div>

                  {myCrewObject && myCrewObject.permissions.length > 0 ? (
                    <div className="space-y-4">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-tight border-b border-slate-100 pb-2">
                        Privileges Granted to You ({myCrewObject.permissions.length})
                      </p>

                      <div className="space-y-3">
                        {myCrewObject.permissions.map((p) => {
                          const matchedModule = SECURITY_MODULES.find(m => m.key === p.permission);
                          const label = matchedModule?.label || p.permission;
                          const desc = matchedModule?.desc || "No description available.";
                          const Icon = matchedModule?.icon || Lock;

                          return (
                            <div 
                              key={p.permission}
                              className="p-4 rounded-[8px] border bg-slate-50 border-slate-200/80 text-slate-700 flex items-start justify-between gap-4"
                            >
                              <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-100 border border-slate-200 text-slate-700 shrink-0 mt-0.5">
                                  <Icon size={15} strokeWidth={1.75} />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-base font-semibold text-slate-800 leading-tight">
                                    {label}
                                  </p>
                                  <p className="text-xs text-slate-400 leading-normal font-medium mt-1">
                                    {desc}
                                  </p>
                                  <div className="flex items-center gap-1.5 mt-2.5 text-xs text-slate-450 font-semibold uppercase tracking-tight">
                                    <span>Authorized by: {p.grantedByName}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-1 px-3 py-1.5 rounded-[6px] text-xs font-bold border border-emerald-200 bg-emerald-50 text-emerald-600 shrink-0 uppercase tracking-tight select-none">
                                <Clock size={10} className="mr-0.5" />
                                <span>Infinite</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="py-12 border border-dashed border-slate-200 bg-slate-50/50 rounded-[8px] text-center space-y-4">
                      <Lock size={32} className="text-slate-300 mx-auto" />
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-[#232F3E] uppercase tracking-tight">Default Permissions Mode</h4>
                        <p className="text-[10px] text-slate-450 font-semibold px-6 leading-relaxed">
                          You are currently running with default baseline permissions. Elevated credentials will appear here once toggled by a Core administrator.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="border-t border-slate-100 pt-4 mt-6 flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-tight">
                    <span>Identity context: {currentUser?.role}</span>
                    <span>Status: Synchronized</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Add New Member Modal ── */}
      {isAddMemberOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 sm:p-7 relative">
            <button
              onClick={() => setIsAddMemberOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#FF9900]">
                <UserPlus size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Register Team Member</h3>
                <p className="text-xs text-slate-500 mt-0.5">Create a Core Administrator or Crew Member account.</p>
              </div>
            </div>

            <form onSubmit={handleRegisterMember} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs focus-within:border-[#FF9900] focus-within:bg-white transition-all">
                  <User size={14} className="text-slate-400 shrink-0" />
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="bg-transparent border-none outline-none text-slate-800 text-xs w-full font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs focus-within:border-[#FF9900] focus-within:bg-white transition-all">
                  <Mail size={14} className="text-slate-400 shrink-0" />
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="e.g. john.doe@rajalakshmi.edu.in"
                    className="bg-transparent border-none outline-none text-slate-800 text-xs w-full font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs focus-within:border-[#FF9900] focus-within:bg-white transition-all">
                  <KeyRound size={14} className="text-slate-400 shrink-0" />
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="bg-transparent border-none outline-none text-slate-800 text-xs w-full font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Privilege Level
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setNewRole("crew")}
                    className={cn(
                      "p-3 rounded-lg border text-left cursor-pointer transition-all",
                      newRole === "crew"
                        ? "bg-orange-50/80 border-[#FF9900] text-slate-900 shadow-2xs"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    )}
                  >
                    <div className="text-xs font-bold text-slate-900">Crew Member</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Operator level access</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewRole("core")}
                    className={cn(
                      "p-3 rounded-lg border text-left cursor-pointer transition-all",
                      newRole === "core"
                        ? "bg-orange-50/80 border-[#FF9900] text-slate-900 shadow-2xs"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    )}
                  >
                    <div className="text-xs font-bold text-slate-900">Core Admin</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Full root permissions</div>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddMemberOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingMember}
                  className="px-5 py-2.5 bg-[#232F3E] hover:bg-[#1a232f] text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-sm disabled:opacity-50 cursor-pointer border-none"
                >
                  {isCreatingMember ? "Registering..." : "Create Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AccessControlPage() {
  return (
    <UserProvider>
      <AccessControlDashboard />
    </UserProvider>
  );
}
