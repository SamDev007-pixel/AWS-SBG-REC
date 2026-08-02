'use client';

import { useState, useRef, useEffect } from 'react';
import { useCrewEvents, useCrewIncidents, useCreateCrewIncident } from '@/lib/hooks';
import { AlertOctagon, AlertTriangle, Info, Clock, Paperclip, CheckCircle2, Camera, Loader2, X, ShieldAlert, FileText, Send, Sparkles } from 'lucide-react';
import AWSSidebarIcon from '@/components/AWSSidebarIcon';
import CustomSelect from '@/components/ui/CustomSelect';

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function priorityConfig(priority: string) {
  const map: Record<
    string,
    { label: string; className: string; icon: React.ComponentType<{ className?: string }> }
  > = {
    HIGH: {
      label: 'High Priority',
      className: 'bg-rose-50 text-rose-700 border-rose-200/80',
      icon: AlertOctagon,
    },
    MEDIUM: {
      label: 'Medium Priority',
      className: 'bg-amber-50 text-amber-700 border-amber-200/80',
      icon: AlertTriangle,
    },
    LOW: {
      label: 'Low Priority',
      className: 'bg-sky-50 text-sky-700 border-sky-200/80',
      icon: Info,
    },
  };
  return (
    map[priority] || {
      label: priority,
      className: 'bg-slate-50 text-slate-700 border-slate-200',
      icon: Info,
    }
  );
}

export default function IncidentReportingPage() {
  const { data: events } = useCrewEvents();
  const { data: incidents, isLoading: incidentsLoading } = useCrewIncidents();
  const createIncidentMutation = useCreateCrewIncident();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [eventId, setEventId] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [eventDropdownOpen, setEventDropdownOpen] = useState(false);
  const [priorityDropdownOpen, setPriorityDropdownOpen] = useState(false);

  const eventDropdownRef = useRef<HTMLDivElement>(null);
  const priorityDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (eventDropdownRef.current && !eventDropdownRef.current.contains(event.target as Node)) {
        setEventDropdownOpen(false);
      }
      if (priorityDropdownRef.current && !priorityDropdownRef.current.contains(event.target as Node)) {
        setPriorityDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Image exceeds the 5MB limit.");
      return;
    }

    setIsUploading(true);
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Upload failed');
      }

      const json = await res.json();
      const imageUrl = json.url || json.data?.url;
      if (imageUrl) {
        setAttachmentUrl(imageUrl);
      } else {
        throw new Error('No URL returned from upload');
      }
    } catch (err: any) {
      setUploadError(err.message || 'Image upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  function handleReportSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setFormSuccess(false);

    const resolvedEventId = eventId || (events && events[0]?.id) || "";

    createIncidentMutation.mutate(
      {
        title: title.trim(),
        description: description.trim(),
        priority,
        eventId: resolvedEventId,
        attachmentUrl: attachmentUrl.trim() || undefined,
      },
      {
        onSuccess: () => {
          setTitle('');
          setDescription('');
          setPriority('MEDIUM');
          setEventId('');
          setAttachmentUrl('');
          setFormSuccess(true);

          setTimeout(() => setFormSuccess(false), 3000);
        },
      },
    );
  }

  const activeCount = incidents?.length || 0;

  const selectedEventTitle = (events ?? []).find(e => e.id === eventId)?.title || "Select event (Optional)";

  const priorityLabels: Record<string, string> = {
    LOW: 'Low Priority',
    MEDIUM: 'Medium Priority',
    HIGH: 'High Priority',
  };

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
      <div className="relative z-10 flex flex-col flex-1 gap-4 w-full min-h-0 justify-between">
        {/* Header Row */}
        <div className="shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sm:gap-4 rounded-xl border border-slate-200 bg-white p-3.5 sm:p-5 shadow-xs">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#FF6B00]/10 border border-[#FF6B00]/20 flex items-center justify-center text-[#FF6B00] shrink-0 mt-0.5 sm:mt-0">
              <AWSSidebarIcon name="incidents" className="w-5 h-5 sm:w-6 sm:h-6 text-[#FF6B00]" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 font-display">
                  Incident & Issue Reporting
                </h1>
                <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                  GuardDuty Monitored
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 leading-snug">
                Log operational exceptions, security concerns, or technical bottlenecks on stage.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
            <div className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-slate-600 font-medium text-[11px] sm:text-xs">Total Incidents:</span>
              <span className="font-bold text-slate-900 text-xs">{activeCount}</span>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-4 flex-1 min-h-0 items-stretch">
          {/* Incident Report Form (6 Cols) */}
          <div className="lg:col-span-6 flex flex-col h-full min-h-0">
            <div className="flex flex-col flex-1 h-full min-h-0 rounded-xl border border-slate-200 bg-white p-4 sm:p-5 overflow-y-auto shadow-xs custom-scrollbar">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3.5 shrink-0">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-[#FF6B00]" />
                  <h2 className="text-sm font-bold text-slate-900">Submit New Incident Report</h2>
                </div>
                <span className="text-[10px] font-medium text-slate-400">* Required fields</span>
              </div>

              <form onSubmit={handleReportSubmit} className="flex-1 flex flex-col gap-3.5">
                {/* Associated Event Custom Dropdown */}
                <div className="space-y-1 shrink-0">
                  <label className="text-[10px] sm:text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Associated Event
                  </label>
                  <CustomSelect
                    value={eventId}
                    onChange={setEventId}
                    placeholder="Select event (Optional)"
                    options={[
                      { value: '', label: 'Select event (Optional)' },
                      ...(events ?? []).map((ev) => ({ value: ev.id, label: ev.title })),
                    ]}
                  />
                </div>

                {/* Incident Title */}
                <div className="space-y-1 shrink-0">
                  <label className="text-[10px] sm:text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Incident Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    placeholder="e.g., Stage mic connectivity issue"
                    className="w-full bg-slate-50/70 border border-slate-200 rounded-xl text-xs px-3.5 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] transition-all font-medium placeholder:text-slate-400"
                  />
                </div>

                {/* Priority Level Custom Dropdown */}
                <div className="space-y-1 shrink-0">
                  <label className="text-[10px] sm:text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Priority Level <span className="text-rose-500">*</span>
                  </label>
                  <CustomSelect
                    value={priority}
                    onChange={setPriority}
                    options={[
                      { value: 'LOW', label: 'Low Priority' },
                      { value: 'MEDIUM', label: 'Medium Priority' },
                      { value: 'HIGH', label: 'High Priority' },
                    ]}
                  />
                </div>

                {/* Description */}
                <div className="space-y-1 flex-1 flex flex-col min-h-[100px]">
                  <label className="text-[10px] sm:text-[11px] font-bold text-slate-700 uppercase tracking-wider shrink-0">
                    Detailed Description <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    placeholder="Describe what happened, impact, and immediate action..."
                    className="w-full flex-1 bg-slate-50/70 border border-slate-200 rounded-xl text-xs p-3.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] transition-all resize-none font-medium placeholder:text-slate-400 min-h-[90px]"
                  />
                </div>

                {/* Attachment Upload */}
                <div className="space-y-1 shrink-0">
                  <label className="text-[10px] sm:text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Evidence Image Attachment (Optional)
                  </label>
                  <div>
                    {attachmentUrl ? (
                      <div className="relative inline-block w-20 h-20 rounded-xl border border-slate-200 overflow-hidden bg-slate-50 group">
                        <img src={attachmentUrl} alt="Attachment" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setAttachmentUrl('')}
                          className="absolute top-1 right-1 bg-slate-900/70 hover:bg-slate-900 text-white rounded-md p-1 transition-all"
                          aria-label="Remove image"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled={isUploading}
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full border border-dashed border-slate-300 hover:border-[#FF6B00] hover:bg-[#FF6B00]/5 rounded-xl p-2.5 text-center transition-all cursor-pointer flex items-center justify-center gap-2 bg-slate-50/40 text-xs font-semibold text-slate-600 hover:text-[#FF6B00]"
                      >
                        {isUploading ? (
                          <>
                            <Loader2 size={14} className="animate-spin text-[#FF6B00]" />
                            <span>Uploading...</span>
                          </>
                        ) : (
                          <>
                            <Camera size={14} className="text-slate-400" />
                            <span>Attach Photo</span>
                          </>
                        )}
                      </button>
                    )}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                  {uploadError && (
                    <p className="text-[10px] text-rose-500 font-medium">{uploadError}</p>
                  )}
                </div>

                {/* Submit Action */}
                <div className="pt-1 shrink-0">
                  <button
                    type="submit"
                    disabled={
                      createIncidentMutation.isPending ||
                      !title.trim() ||
                      !description.trim() ||
                      isUploading
                    }
                    className="w-full bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white font-bold rounded-xl py-3 px-4 shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
                  >
                    {createIncidentMutation.isPending ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <>
                        <Send size={14} />
                        <span>Submit Incident Report</span>
                      </>
                    )}
                  </button>
                </div>

                {formSuccess && (
                  <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 p-3 rounded-xl text-xs flex items-center gap-2.5 animate-fadeIn">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span className="font-semibold">Incident report logged successfully!</span>
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Submitted Reports History (4 Cols) */}
          <div className="lg:col-span-4 flex flex-col h-full min-h-0">
            <div className="flex flex-col flex-1 h-full min-h-0 rounded-xl border border-slate-200 bg-white p-4 sm:p-5 overflow-hidden shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3.5 shrink-0">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-slate-700" />
                  <h2 className="text-sm font-bold text-slate-900">Submitted Log History</h2>
                </div>
                <span className="text-xs font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                  {incidents?.length || 0}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto pr-0.5 space-y-3 custom-scrollbar">
                {incidentsLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="border border-slate-200 rounded-xl p-3.5 animate-pulse space-y-2"
                    >
                      <div className="h-3.5 w-2/3 bg-slate-200 rounded-md" />
                      <div className="h-3 w-5/6 bg-slate-100 rounded-md" />
                    </div>
                  ))
                ) : !incidents || incidents.length === 0 ? (
                  <div className="py-10 px-4 text-center flex flex-col items-center justify-center gap-2 my-auto">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-400 shrink-0">
                      <ShieldAlert className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-700">No Incidents Reported</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">All monitored systems are operating normally.</p>
                    </div>
                  </div>
                ) : (
                  incidents.map((inc) => {
                    const pc = priorityConfig(inc.priority);
                    const Icon = pc.icon;

                    return (
                      <div
                        key={inc.id}
                        className="border border-slate-200/90 rounded-xl p-3.5 bg-white hover:border-slate-300 transition-all shadow-2xs space-y-2 group"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-xs font-bold text-slate-900 group-hover:text-[#FF6B00] transition-colors line-clamp-1">
                            {inc.title}
                          </h3>
                          <span
                            className={`inline-flex items-center gap-1 border rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase shrink-0 ${pc.className}`}
                          >
                            <Icon className="h-2.5 w-2.5" /> {inc.priority}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                          {inc.description}
                        </p>

                        {inc.attachmentUrl && (
                          <div className="pt-1">
                            <a
                              href={inc.attachmentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block w-full h-24 rounded-lg overflow-hidden border border-slate-200 relative group/img"
                            >
                              <img src={inc.attachmentUrl} alt="Incident media" className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300" />
                              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold gap-1">
                                <Paperclip size={12} /> View Image
                              </div>
                            </a>
                          </div>
                        )}

                        <div className="pt-2 border-t border-slate-100 flex flex-col gap-1 text-[10px] text-slate-500 font-medium">
                          {inc.event?.title && (
                            <div className="truncate text-slate-700 font-semibold">
                              <span className="text-slate-400 font-normal">Event: </span>
                              {inc.event.title}
                            </div>
                          )}
                          <div className="flex items-center gap-1 text-slate-400">
                            <Clock className="h-3 w-3" />
                            <span>{formatDate(inc.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
