'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import FacultyCoordinator from '@/components/FacultyCoordinator';
import Gallery from '@/components/Gallery';
import ReviewsMarquee from '@/components/ReviewsMarquee';
import OurTeamShowcase from '@/components/CommunityStoryCarousel';
import Hero from '@/components/Hero';
import {
  Sliders,
  Settings,
  User,
  Image as ImageIcon,
  MessageSquare,
  Quote,
  Users,
  PlusCircle,
  Plus,
  Edit3,
  Trash2,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  Loader2,
  Linkedin,
  Layout,
  Eye,
  Play,
  Monitor,
  Home,
  Smartphone,
  Lock,
  UploadCloud,
} from 'lucide-react';

interface HeroData {
  badge: string;
  titleHighlight: string;
  subtitle: string;
}

interface CoordinatorData {
  name: string;
  role: string;
  department: string;
  image: string;
  bio: string;
  linkedin: string;
}

interface JourneyData {
  id?: string;
  label: string;
  sublabel: string;
  image: string;
  description: string;
  gradient: string;
  order: number;
}

interface TestimonialData {
  id?: string;
  name: string;
  role: string;
  rating: number;
  text: string;
  type: string;
  order: number;
}

interface TeamMemberData {
  id?: string;
  name: string;
  role: string;
  department: string;
  image: string;
  accent: string;
  type: string; // "core" | "crew"
  order: number;
}

export default function ManageHomepage() {
  const [activeTab, setActiveTab] = useState<'hero' | 'coordinator' | 'journeys' | 'testimonials' | 'team'>('hero');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  // States
  const [hero, setHero] = useState<HeroData>({ badge: '', titleHighlight: '', subtitle: '' });
  const [coord, setCoord] = useState<CoordinatorData>({ name: '', role: '', department: '', image: '', bio: '', linkedin: '' });
  const [journeys, setJourneys] = useState<JourneyData[]>([]);
  const [testimonials, setTestimonials] = useState<TestimonialData[]>([]);
  const [team, setTeam] = useState<TeamMemberData[]>([]);

  // Modals / Editors
  const [editingJourney, setEditingJourney] = useState<JourneyData | null>(null);
  const [editingTestimonial, setEditingTestimonial] = useState<TestimonialData | null>(null);
  const [editingTeam, setEditingTeam] = useState<TeamMemberData | null>(null);

  const [saving, setSaving] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isPreviewFlipped, setIsPreviewFlipped] = useState(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');

  const [uploadingCoord, setUploadingCoord] = useState(false);
  const [uploadingJourney, setUploadingJourney] = useState(false);
  const [uploadingTeam, setUploadingTeam] = useState(false);
  const [teamImageError, setTeamImageError] = useState(false);
  const [teamMemberImageErrors, setTeamMemberImageErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setTeamImageError(false);
  }, [editingTeam?.image]);

  const handleCoordImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCoord(true);
    try {
      const res = await api.upload<{ url: string }>('/upload/image', file);
      if (res && res.url) {
        setCoord((prev) => ({ ...prev, image: res.url }));
        setMessage({ text: 'Coordinator photo uploaded successfully!' });
      }
    } catch (err: any) {
      console.error(err);
      setMessage({ text: err.message || 'Failed to upload image', isError: true });
    } finally {
      setUploadingCoord(false);
    }
  };

  const handleJourneyImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingJourney(true);
    try {
      const res = await api.upload<{ url: string }>('/upload/image', file);
      if (res && res.url && editingJourney) {
        setEditingJourney((prev) => prev ? { ...prev, image: res.url } : null);
        setMessage({ text: 'Journey card image uploaded successfully!' });
      }
    } catch (err: any) {
      console.error(err);
      setMessage({ text: err.message || 'Failed to upload image', isError: true });
    } finally {
      setUploadingJourney(false);
    }
  };

  const handleTeamImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingTeam(true);
    try {
      const res = await api.upload<{ url: string }>('/upload/image', file);
      if (res && res.url && editingTeam) {
        setEditingTeam((prev) => prev ? { ...prev, image: res.url } : null);
        setMessage({ text: 'Team member image uploaded successfully!' });
      }
    } catch (err: any) {
      console.error(err);
      setMessage({ text: err.message || 'Failed to upload image', isError: true });
    } finally {
      setUploadingTeam(false);
    }
  };

  useEffect(() => {
    fetchData();
    if (typeof window !== 'undefined') {
      const isMobileScreen = window.innerWidth < 768;
      setPreviewMode(isMobileScreen ? 'mobile' : 'desktop');
    }
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [heroRes, coordRes, journeyRes, testimonialRes, teamRes] = await Promise.all([
        api.get<HeroData>('/homepage/hero'),
        api.get<CoordinatorData>('/homepage/coordinator'),
        api.get<JourneyData[]>('/homepage/journeys'),
        api.get<TestimonialData[]>('/homepage/testimonials'),
        api.get<TeamMemberData[]>('/homepage/team'),
      ]);

      if (heroRes) setHero(heroRes);
      if (coordRes) setCoord(coordRes);
      if (journeyRes) setJourneys(journeyRes.sort((a, b) => a.order - b.order));
      if (testimonialRes) setTestimonials(testimonialRes.sort((a, b) => a.order - b.order));
      if (teamRes) setTeam(teamRes.sort((a, b) => a.order - b.order));
    } catch (err) {
      console.error(err);
      setMessage({ text: 'Failed to fetch homepage settings.', isError: true });
    } finally {
      setLoading(false);
    }
  };

  const showFeedback = (text: string, isError = false) => {
    setMessage({ text, isError });
    setTimeout(() => setMessage(null), 4500);
  };

  // ── Handlers ─────────────────────────────────────────────────────────────

  const saveHero = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/homepage/hero', hero);
      showFeedback('Hero section updated successfully.');
    } catch {
      showFeedback('Failed to update Hero section.', true);
    } finally {
      setSaving(false);
    }
  };

  const saveCoordinator = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/homepage/coordinator', coord);
      showFeedback('Faculty Coordinator details updated.');
    } catch {
      showFeedback('Failed to update Faculty Coordinator.', true);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveJourney = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingJourney) return;
    setSaving(true);
    try {
      if (editingJourney.id) {
        await api.put(`/homepage/journeys/${editingJourney.id}`, editingJourney);
        showFeedback('Journey Highlight card updated.');
      } else {
        await api.post('/homepage/journeys', editingJourney);
        showFeedback('Journey Highlight card added.');
      }
      setEditingJourney(null);
      fetchData();
    } catch {
      showFeedback('Failed to save Journey Highlight.', true);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteJourney = async (id: string) => {
    if (!confirm('Are you sure you want to delete this highlight?')) return;
    try {
      await api.delete(`/homepage/journeys/${id}`);
      showFeedback('Journey Highlight removed.');
      fetchData();
    } catch {
      showFeedback('Failed to delete highlight.', true);
    }
  };

  const handleSaveTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTestimonial) return;
    setSaving(true);
    try {
      if (editingTestimonial.id) {
        await api.put(`/homepage/testimonials/${editingTestimonial.id}`, editingTestimonial);
        showFeedback('Testimonial updated.');
      } else {
        await api.post('/homepage/testimonials', editingTestimonial);
        showFeedback('Testimonial added.');
      }
      setEditingTestimonial(null);
      fetchData();
    } catch {
      showFeedback('Failed to save testimonial.', true);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTestimonial = async (id: string) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return;
    try {
      await api.delete(`/homepage/testimonials/${id}`);
      showFeedback('Testimonial removed.');
      fetchData();
    } catch {
      showFeedback('Failed to delete testimonial.', true);
    }
  };

  const handleSaveTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeam) return;
    setSaving(true);
    try {
      if (editingTeam.id) {
        await api.put(`/homepage/team/${editingTeam.id}`, editingTeam);
        showFeedback('Team member updated.');
      } else {
        await api.post('/homepage/team', editingTeam);
        showFeedback('Team member added.');
      }
      setEditingTeam(null);
      fetchData();
    } catch {
      showFeedback('Failed to save team member.', true);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTeam = async (id: string) => {
    if (!confirm('Are you sure you want to delete this team member?')) return;
    try {
      await api.delete(`/homepage/team/${id}`);
      showFeedback('Team member removed.');
      fetchData();
    } catch {
      showFeedback('Failed to delete team member.', true);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] p-4 md:p-6 lg:p-8 flex flex-col gap-6" style={{ fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      <style dangerouslySetInnerHTML={{ __html: `
        /* Modern, premium, clean scrollbar overrides for form textareas */
        textarea::-webkit-scrollbar {
          width: 5px !important;
          height: 5px !important;
        }
        textarea::-webkit-scrollbar-track {
          background: transparent !important;
        }
        textarea::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.35) !important;
          border-radius: 9999px !important;
          border: 1px solid transparent !important;
          background-clip: padding-box !important;
        }
        textarea::-webkit-scrollbar-thumb:hover {
          background: rgba(148, 163, 184, 0.55) !important;
        }
        textarea::-webkit-scrollbar-button {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }
        textarea::-webkit-resizer {
          background-image: linear-gradient(135deg, transparent 50%, rgba(148, 163, 184, 0.4) 50%) !important;
          background-size: 6px 6px !important;
          background-repeat: no-repeat !important;
          background-position: bottom right !important;
        }
        textarea {
          scrollbar-width: thin !important;
          scrollbar-color: rgba(148, 163, 184, 0.35) transparent !important;
        }
        .preview-content-scroll::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }
        .preview-content-scroll {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }
      ` }} />
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[8px] bg-gradient-to-br from-amber-50 to-orange-50 border border-[#FF9900]/25 text-[#FF9900] flex items-center justify-center shadow-sm shrink-0">
            <Home className="h-5 w-5" />
          </div>
          <div className="flex flex-col gap-0.5">
            <h1 className="text-[20px] font-black text-slate-900 tracking-tight leading-tight m-0">
              Homepage CMS
            </h1>
            <p className="text-[11.5px] text-slate-500 font-normal leading-none m-0 mt-0.5">
              Customize, add, or delete components rendered on the main landing page.
            </p>
          </div>
        </div>
      </div>

      {/* Feedback Alert */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={`flex items-center gap-2.5 px-4 py-3 rounded-[8px] border text-[12.5px] font-semibold tracking-wide ${
              message.isError
                ? 'bg-rose-50 border-rose-200/50 text-rose-800'
                : 'bg-emerald-50 border-emerald-200/50 text-emerald-800'
            }`}
          >
            {message.isError ? <AlertCircle className="w-4.5 h-4.5 text-rose-500" /> : <CheckCircle className="w-4.5 h-4.5 text-emerald-500" />}
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tab Selectors & Toggle Container */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
        <div className="flex flex-wrap bg-slate-100/75 p-1 rounded-[10px] gap-1 border border-slate-200/30">
          {[
            { id: 'hero', label: 'Hero Banner', icon: Settings },
            { id: 'journeys', label: 'Journey Cards', icon: ImageIcon },
            { id: 'testimonials', label: 'Testimonials', icon: Quote },
            { id: 'coordinator', label: 'Faculty Coordinator', icon: User },
            { id: 'team', label: 'Team Members', icon: Users },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSel = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id as any); setMessage(null); }}
                className={`flex items-center gap-1.75 px-3 py-1.5 rounded-[7px] text-[12px] font-bold transition-all duration-200 cursor-pointer ${
                  isSel
                    ? 'bg-white text-slate-800 shadow-[0_2px_8px_rgba(15,23,42,0.06)] border border-slate-200/50'
                    : 'text-slate-500 hover:text-slate-800 border border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSel ? 'text-[#FF9900]' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Live Preview Button */}
        <button
          type="button"
          onClick={() => setIsPreviewOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.75 rounded-[8px] border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-[12px] transition-all cursor-pointer shadow-sm hover:shadow active:scale-95 shrink-0"
        >
          <Monitor className="w-4 h-4 text-[#FF9900]" />
          <span>Show Live Preview</span>
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-8 h-8 text-[#FF9900] animate-spin" />
          <p className="text-[12px] text-slate-500 font-bold">Synchronizing Configs...</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-[8px] p-5 shadow-[0_4px_24px_rgba(0,0,0,0.015)]">
          
          {/* ── 1. HERO TAB ── */}
          {activeTab === 'hero' && (
            <form onSubmit={saveHero} className="w-full flex flex-col gap-5">
              <div className="flex flex-col gap-1 border-b border-slate-100 pb-2">
                <span className="text-[14px] font-bold text-slate-800">Banner Details</span>
                <span className="text-[11.5px] text-slate-500">Configure the primary branding message shown at the top of the landing page.</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-extrabold text-[#E68A00] uppercase tracking-[0.06em] mb-1.5">Top Banner Badge</label>
                  <input
                    type="text"
                    value={hero.badge}
                    onChange={(e) => setHero({ ...hero, badge: e.target.value })}
                    className="w-full h-10 px-3.5 border border-slate-200 rounded-[8px] focus:outline-none focus:border-[#FF9900] focus:ring-2 focus:ring-[#FF9900]/10 text-[13px] text-slate-800 font-medium transition-all"
                    placeholder="e.g. Rajalakshmi Engineering College"
                    required
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Displayed in a prominent outline pill at the very top.</span>
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold text-[#E68A00] uppercase tracking-[0.06em] mb-1.5">Title Highlight</label>
                  <input
                    type="text"
                    value={hero.titleHighlight}
                    onChange={(e) => setHero({ ...hero, titleHighlight: e.target.value })}
                    className="w-full h-10 px-3.5 border border-slate-200 rounded-[8px] focus:outline-none focus:border-[#FF9900] focus:ring-2 focus:ring-[#FF9900]/10 text-[13px] text-slate-800 font-medium transition-all"
                    placeholder="e.g. AWS Student Builder Group"
                    required
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">The main phrase rendered with an orange gradient accent.</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-[#E68A00] uppercase tracking-[0.06em] mb-1.5">Subtitle / Paragraph Description</label>
                <textarea
                  rows={4}
                  value={hero.subtitle}
                  onChange={(e) => setHero({ ...hero, subtitle: e.target.value })}
                  className="w-full p-3.5 border border-slate-200 rounded-[8px] focus:outline-none focus:border-[#FF9900] focus:ring-2 focus:ring-[#FF9900]/10 text-[13px] text-slate-800 font-medium transition-all leading-relaxed"
                  placeholder="Enter a descriptive overview about the club..."
                  required
                />
                <span className="text-[10px] text-slate-400 mt-1 block">A short welcoming paragraph outlining the club's objectives.</span>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="flex items-center justify-center gap-2 bg-[#E68A00] hover:bg-[#cc7a00] disabled:bg-slate-200 text-white font-bold text-[12px] px-6 py-2.5 rounded-[8px] self-start transition-all cursor-pointer shadow-md shadow-[#E68A00]/10 hover:shadow-lg hover:shadow-[#E68A00]/15 hover:-translate-y-0.5 active:translate-y-0"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </form>
          )}

          {/* ── 2. COORDINATOR TAB ── */}
          {activeTab === 'coordinator' && (
            <form onSubmit={saveCoordinator} className="w-full flex flex-col gap-5">
              <div className="flex flex-col gap-1 border-b border-slate-100 pb-2">
                <span className="text-[14px] font-bold text-slate-800">Faculty Coordinator Information</span>
                <span className="text-[11.5px] text-slate-500">Configure profile details of the coordinator supervising the student branch.</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-extrabold text-[#E68A00] uppercase tracking-[0.06em] mb-1.5">Full Name</label>
                  <input
                    type="text"
                    value={coord.name}
                    onChange={(e) => setCoord({ ...coord, name: e.target.value })}
                    className="w-full h-10 px-3.5 border border-slate-200 rounded-[8px] focus:outline-none focus:border-[#FF9900] focus:ring-2 focus:ring-[#FF9900]/10 text-[13px] text-slate-800 font-medium transition-all"
                    placeholder="e.g. Dr. Jane Doe"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold text-[#E68A00] uppercase tracking-[0.06em] mb-1.5">LinkedIn Profile URL</label>
                  <input
                    type="url"
                    value={coord.linkedin}
                    onChange={(e) => setCoord({ ...coord, linkedin: e.target.value })}
                    className="w-full h-10 px-3.5 border border-slate-200 rounded-[8px] focus:outline-none focus:border-[#FF9900] focus:ring-2 focus:ring-[#FF9900]/10 text-[13px] text-slate-800 font-medium transition-all"
                    placeholder="e.g. https://linkedin.com/in/username"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-extrabold text-[#E68A00] uppercase tracking-[0.06em] mb-1.5">Designation Title</label>
                  <input
                    type="text"
                    value={coord.role}
                    onChange={(e) => setCoord({ ...coord, role: e.target.value })}
                    className="w-full h-10 px-3.5 border border-slate-200 rounded-[8px] focus:outline-none focus:border-[#FF9900] focus:ring-2 focus:ring-[#FF9900]/10 text-[13px] text-slate-800 font-medium transition-all"
                    placeholder="e.g. Assistant Professor (SG)"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold text-[#E68A00] uppercase tracking-[0.06em] mb-1.5">Department & Institution</label>
                  <input
                    type="text"
                    value={coord.department}
                    onChange={(e) => setCoord({ ...coord, department: e.target.value })}
                    className="w-full h-10 px-3.5 border border-slate-200 rounded-[8px] focus:outline-none focus:border-[#FF9900] focus:ring-2 focus:ring-[#FF9900]/10 text-[13px] text-slate-800 font-medium transition-all"
                    placeholder="e.g. Dept of Information Technology, REC"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-[#E68A00] uppercase tracking-[0.06em] mb-1.5">Photo Image</label>
                <div className="flex items-center gap-4">
                  {coord.image && (
                    <div className="w-16 h-16 rounded-[8px] border border-slate-200 overflow-hidden shrink-0 shadow-sm">
                      <img src={coord.image} alt="Faculty Coordinator" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <label className="flex-1 flex flex-col items-center justify-center border border-dashed border-slate-200 hover:border-[#FF9900] rounded-[8px] p-4 cursor-pointer hover:bg-slate-50/50 transition-all">
                    <div className="flex flex-col items-center gap-1">
                      <UploadCloud className="w-5 h-5 text-slate-400" />
                      <span className="text-[12px] font-bold text-slate-600">
                        {uploadingCoord ? 'Uploading Image...' : 'Click to Upload Image'}
                      </span>
                      <span className="text-[10px] text-slate-400">PNG, JPG, WEBP up to 5MB</span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoordImageUpload}
                      className="hidden"
                      disabled={uploadingCoord}
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-[#E68A00] uppercase tracking-[0.06em] mb-1.5">Biography Statement</label>
                <textarea
                  rows={4}
                  value={coord.bio}
                  onChange={(e) => setCoord({ ...coord, bio: e.target.value })}
                  className="w-full p-3.5 border border-slate-200 rounded-[8px] focus:outline-none focus:border-[#FF9900] focus:ring-2 focus:ring-[#FF9900]/10 text-[13px] text-slate-800 font-medium transition-all leading-relaxed"
                  placeholder="Write a brief profile summary..."
                  required
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="flex items-center justify-center gap-2 bg-[#E68A00] hover:bg-[#cc7a00] disabled:bg-slate-200 text-white font-bold text-[12px] px-6 py-2.5 rounded-[8px] self-start transition-all cursor-pointer shadow-md shadow-[#E68A00]/10 hover:shadow-lg hover:shadow-[#E68A00]/15 hover:-translate-y-0.5 active:translate-y-0"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </form>
          )}

          {/* ── 3. JOURNEYS TAB ── */}
          {activeTab === 'journeys' && (
            <div className="w-full">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[14px] font-bold text-slate-800">Journey Highlights Deck</span>
                  <span className="text-[11.5px] text-slate-500">Manage the milestone cards representing key achievements, workshops, and meetups.</span>
                </div>
                <button
                  onClick={() => setEditingJourney({ label: '', sublabel: '', image: '/images/cloud_jam.jpg', description: '', gradient: 'linear-gradient(135deg,#0073BB,#005f9e)', order: journeys.length })}
                  className="flex items-center gap-1.5 bg-[#FF9900] hover:bg-[#E68A00] text-white px-4 py-1.5 rounded-[6px] text-[12px] font-extrabold transition-all cursor-pointer shadow-sm hover:shadow hover:-translate-y-0.5 active:translate-y-0 active:scale-95 shrink-0 border-none select-none"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" /> Add Card
                </button>
              </div>

              {journeys.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-slate-200 rounded-[12px] bg-slate-50/55 mt-5">
                  <ImageIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-[13px] text-slate-400 font-bold">No journey cards added yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-5">
                  {journeys.map((j) => (
                    <div
                      key={j.id}
                      className="bg-white border border-slate-100 rounded-xl p-4.5 flex items-center justify-between transition-all duration-200 relative group hover:shadow-md hover:border-slate-200/80"
                    >
                      {/* Left Side: Image + Text Info */}
                      <div className="flex items-center gap-4 min-w-0 flex-1 mr-4">
                        {/* Image Wrapper */}
                        <div className="relative shrink-0 w-16 h-16">
                          <div className="w-full h-full rounded-lg overflow-hidden border border-slate-100 bg-slate-50">
                            <img src={j.image} alt={j.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          </div>
                          <div className="absolute -bottom-1 -right-1 bg-slate-900 text-white rounded-full text-[9px] w-4.5 h-4.5 flex items-center justify-center font-bold border-2 border-white shadow-sm z-10 leading-none">
                            <span className="relative -top-[0.5px]">{j.order}</span>
                          </div>
                        </div>

                        {/* Text Content */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-extrabold text-slate-800 text-[14.5px] leading-tight truncate">{j.label}</h4>
                            <span className="inline-block text-[9px] font-bold rounded px-2 py-0.5 border leading-none bg-orange-50/50 text-[#E68A00] border-orange-100/50 shrink-0">
                              {j.sublabel}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400 font-semibold truncate block mt-1.5 leading-none">
                            {j.description || 'No description provided'}
                          </span>
                        </div>
                      </div>

                      {/* Right Side: Action Buttons */}
                      <div className="flex gap-1 shrink-0 border-l border-slate-100 pl-4 py-1">
                        <button
                          onClick={() => setEditingJourney(j)}
                          title="Edit card highlights"
                          className="p-1.5 text-slate-400 hover:text-[#E68A00] hover:bg-orange-50/50 rounded-lg transition-all cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => j.id && handleDeleteJourney(j.id)}
                          title="Remove card highlights"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── 4. TESTIMONIALS TAB ── */}
          {activeTab === 'testimonials' && (
            <div className="w-full">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[14px] font-bold text-slate-800">Testimonials List</span>
                  <span className="text-[11.5px] text-slate-500">Manage the feedback statements, student quotes, and experience reports.</span>
                </div>
                <button
                  onClick={() => setEditingTestimonial({ name: '', role: 'Student', rating: 5, text: '', type: 'Cloud', order: testimonials.length })}
                  className="flex items-center gap-1.5 bg-[#FF9900] hover:bg-[#E68A00] text-white px-4 py-1.5 rounded-[6px] text-[12px] font-extrabold transition-all cursor-pointer shadow-sm hover:shadow hover:-translate-y-0.5 active:translate-y-0 active:scale-95 shrink-0 border-none select-none"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" /> Add Testimonial
                </button>
              </div>

              {testimonials.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-slate-200 rounded-[12px] bg-slate-50/55 mt-5">
                  <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-[13px] text-slate-400 font-bold">No testimonials added yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
                  {testimonials.map((t) => (
                    <div
                      key={t.id}
                      className="bg-white border border-slate-200 hover:border-[#FF9900]/40 rounded-[12px] p-4 flex flex-col justify-between shadow-sm hover:shadow transition-all duration-300 relative overflow-hidden"
                    >
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-50 to-orange-50 border border-[#FF9900]/25 text-[#FF9900] text-[11px] font-extrabold flex items-center justify-center shrink-0">
                            {t.name ? t.name[0].toUpperCase() : 'U'}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <h4 className="font-extrabold text-slate-800 text-[13px] truncate leading-tight">{t.name}</h4>
                            <span className="text-[9.5px] text-slate-500 font-medium truncate">{t.role}</span>
                          </div>
                        </div>
                        <p className="text-[11.5px] text-slate-650 italic leading-relaxed line-clamp-3">"{t.text}"</p>
                      </div>
                      <div className="flex justify-between items-center border-t border-slate-50 pt-2 mt-2">
                        <span className="inline-block bg-blue-50 text-blue-700 border border-blue-100/50 text-[9px] font-extrabold rounded-[3px] px-1.5 py-0.5 leading-none">{t.type}</span>
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => setEditingTestimonial(t)} className="p-1 border border-slate-200 hover:border-[#FF9900]/30 hover:bg-[#FF9900]/5 text-slate-500 hover:text-[#FF9900] rounded-[5px] transition-all cursor-pointer">
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => t.id && handleDeleteTestimonial(t.id)} className="p-1 border border-rose-200 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-[5px] transition-all cursor-pointer">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── 5. TEAM TAB ── */}
          {activeTab === 'team' && (
            <div className="w-full">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[14px] font-bold text-slate-800">Team Roster</span>
                  <span className="text-[11.5px] text-slate-555">Configure member profiles, designation roles, and color frames for the core/crew bubbles.</span>
                </div>
                <button
                  onClick={() => setEditingTeam({ name: '', role: '', department: 'AWS Cloud Clubs REC', image: '/images/crew/default.jpg', accent: '#FF9900', type: 'crew', order: team.length })}
                  className="flex items-center gap-1.5 bg-[#FF9900] hover:bg-[#E68A00] text-white px-4 py-1.5 rounded-[6px] text-[12px] font-extrabold transition-all cursor-pointer shadow-sm hover:shadow hover:-translate-y-0.5 active:translate-y-0 active:scale-95 shrink-0 border-none select-none"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" /> Add Member
                </button>
              </div>

              {team.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-slate-200 rounded-[12px] bg-slate-50/55 mt-5">
                  <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-[13px] text-slate-400 font-bold">No members registered yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-5">
                  {team.map((m) => (
                    <div
                      key={m.id}
                      className="bg-white border border-slate-100 rounded-xl p-4.5 flex items-center justify-between transition-all duration-200 relative group hover:shadow-md hover:border-slate-200/80"
                    >
                      {/* Left Side: Avatar + Text Info */}
                      <div className="flex items-center gap-4 min-w-0 flex-1 mr-4">
                        {/* Avatar Wrapper */}
                        <div className="relative shrink-0 w-14 h-14">
                          <div 
                            className={`w-full h-full rounded-full overflow-hidden border flex items-center justify-center transition-all ${(!m.image || teamMemberImageErrors[m.id || '']) ? 'bg-slate-900' : 'bg-white'}`} 
                            style={{ borderColor: m.accent || '#FF9900', borderWidth: '1.5px' }}
                          >
                            <img 
                              src={(!m.image || teamMemberImageErrors[m.id || '']) ? '/aws-logo.svg' : m.image} 
                              alt={(!m.image || teamMemberImageErrors[m.id || '']) ? 'AWS Logo' : m.name} 
                              onError={() => {
                                if (m.id) {
                                  setTeamMemberImageErrors(prev => ({ ...prev, [m.id!]: true }));
                                }
                              }}
                              className={`w-full h-full ${(!m.image || teamMemberImageErrors[m.id || '']) ? 'object-contain p-2.5' : 'object-cover rounded-full'}`} 
                            />
                          </div>
                          <div className="absolute -bottom-0.5 -right-0.5 bg-slate-900 text-white rounded-full text-[9px] w-4.5 h-4.5 flex items-center justify-center font-bold border-2 border-white shadow-sm z-10 leading-none">
                            <span className="relative -top-[0.5px]">{m.order}</span>
                          </div>
                        </div>

                        {/* Text Content */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-extrabold text-slate-800 text-[14.5px] leading-tight truncate">{m.name}</h4>
                            <span className={`inline-block text-[9px] font-bold uppercase tracking-wider rounded px-2 py-0.5 border leading-none shrink-0 ${
                              m.type === 'core'
                                ? 'bg-amber-50 text-amber-600 border-amber-100/50'
                                : 'bg-blue-50 text-blue-600 border-blue-100/50'
                            }`}>
                              {m.type === 'core' ? 'Core Admin' : 'Crew Associate'}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-550 font-semibold truncate block mt-1.5 leading-none">
                            {m.role || (m.type === 'core' ? 'Member' : 'Crew Member')}
                          </span>
                        </div>
                      </div>

                      {/* Right Side: Action Buttons */}
                      <div className="flex gap-1 shrink-0 border-l border-slate-100 pl-4 py-1">
                        <button
                          onClick={() => setEditingTeam(m)}
                          title="Edit profile settings"
                          className="p-1.5 text-slate-400 hover:text-[#E68A00] hover:bg-orange-50/50 rounded-lg transition-all cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => m.id && handleDeleteTeam(m.id)}
                          title="Remove member from roster"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── EDIT JOURNEY MODAL ── */}
      {editingJourney && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[8px] max-w-lg w-full p-5 shadow-2xl border border-slate-200/50 flex flex-col gap-5"
          >
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h4 className="font-extrabold text-slate-900 text-[15px]">
                {editingJourney.id ? 'Edit Journey Highlight' : 'Create Journey Highlight'}
              </h4>
              <button onClick={() => setEditingJourney(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <form onSubmit={handleSaveJourney} className="flex flex-col gap-3.5 text-[12.5px]">
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[10.5px] font-extrabold text-[#E68A00] uppercase mb-1">Title</label>
                  <input
                    type="text"
                    value={editingJourney.label}
                    onChange={(e) => setEditingJourney({ ...editingJourney, label: e.target.value })}
                    className="w-full h-9 px-3 border border-slate-200 rounded-[6px] focus:outline-none focus:border-[#FF9900]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10.5px] font-extrabold text-[#E68A00] uppercase mb-1">Highlights & Date</label>
                  <input
                    type="text"
                    value={editingJourney.sublabel}
                    onChange={(e) => setEditingJourney({ ...editingJourney, sublabel: e.target.value })}
                    className="w-full h-9 px-3 border border-slate-200 rounded-[6px] focus:outline-none focus:border-[#FF9900]"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[10.5px] font-extrabold text-[#E68A00] uppercase mb-1">Cover Photo</label>
                  <div className="flex items-center gap-3">
                    {editingJourney.image && (
                      <div className="w-10 h-10 rounded-[6px] border border-slate-200 overflow-hidden shrink-0 shadow-sm">
                        <img src={editingJourney.image} alt="Card" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <label className="flex-1 flex items-center justify-center gap-1.5 border border-dashed border-slate-200 hover:border-[#FF9900] rounded-[6px] p-2 cursor-pointer hover:bg-slate-50/55 transition-all text-[11.5px] font-bold text-slate-600">
                      <UploadCloud className="w-4 h-4 text-slate-400" />
                      <span>
                        {uploadingJourney ? 'Uploading...' : 'Upload Image'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleJourneyImageUpload}
                        className="hidden"
                        disabled={uploadingJourney}
                      />
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-[10.5px] font-extrabold text-[#E68A00] uppercase mb-1">Sort Position</label>
                  <input
                    type="number"
                    value={editingJourney.order}
                    onChange={(e) => setEditingJourney({ ...editingJourney, order: parseInt(e.target.value) || 0 })}
                    className="w-full h-9 px-3 border border-slate-200 rounded-[6px] focus:outline-none focus:border-[#FF9900]"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10.5px] font-extrabold text-[#E68A00] uppercase mb-1">Detailed Description</label>
                <textarea
                  rows={3}
                  value={editingJourney.description}
                  onChange={(e) => setEditingJourney({ ...editingJourney, description: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-[6px] focus:outline-none focus:border-[#FF9900] leading-relaxed"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={saving}
                className="w-full bg-[#E68A00] hover:bg-[#cc7a00] disabled:bg-slate-200 text-white py-2 rounded-[6px] text-[12.5px] font-bold transition-all cursor-pointer"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* ── EDIT TESTIMONIAL MODAL ── */}
      {editingTestimonial && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[8px] max-w-lg w-full p-5 shadow-2xl border border-slate-200/50 flex flex-col gap-5"
          >
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h4 className="font-extrabold text-slate-900 text-[15px]">
                {editingTestimonial.id ? 'Edit Testimonial' : 'Create Testimonial'}
              </h4>
              <button onClick={() => setEditingTestimonial(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <form onSubmit={handleSaveTestimonial} className="flex flex-col gap-3.5 text-[12.5px]">
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[10.5px] font-extrabold text-[#E68A00] uppercase mb-1">Student Name</label>
                  <input
                    type="text"
                    value={editingTestimonial.name}
                    onChange={(e) => setEditingTestimonial({ ...editingTestimonial, name: e.target.value })}
                    className="w-full h-9 px-3 border border-slate-200 rounded-[6px] focus:outline-none focus:border-[#FF9900]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10.5px] font-extrabold text-[#E68A00] uppercase mb-1">Year & Branch</label>
                  <input
                    type="text"
                    value={editingTestimonial.role}
                    onChange={(e) => setEditingTestimonial({ ...editingTestimonial, role: e.target.value })}
                    className="w-full h-9 px-3 border border-slate-200 rounded-[6px] focus:outline-none focus:border-[#FF9900]"
                    placeholder="e.g. 2nd Year · CSE Department"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-[10.5px] font-extrabold text-[#E68A00] uppercase mb-1">Topic / Event Tag</label>
                  <input
                    type="text"
                    value={editingTestimonial.type}
                    onChange={(e) => setEditingTestimonial({ ...editingTestimonial, type: e.target.value })}
                    className="w-full h-9 px-3 border border-slate-200 rounded-[6px] focus:outline-none focus:border-[#FF9900]"
                    placeholder="e.g. Cloud Matrix"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10.5px] font-extrabold text-[#E68A00] uppercase mb-1">Rating (1 to 5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={editingTestimonial.rating}
                    onChange={(e) => setEditingTestimonial({ ...editingTestimonial, rating: parseInt(e.target.value) || 5 })}
                    className="w-full h-9 px-3 border border-slate-200 rounded-[6px] focus:outline-none focus:border-[#FF9900]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10.5px] font-extrabold text-[#E68A00] uppercase mb-1">Sort Order</label>
                  <input
                    type="number"
                    value={editingTestimonial.order}
                    onChange={(e) => setEditingTestimonial({ ...editingTestimonial, order: parseInt(e.target.value) || 0 })}
                    className="w-full h-9 px-3 border border-slate-200 rounded-[6px] focus:outline-none focus:border-[#FF9900]"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10.5px] font-extrabold text-[#E68A00] uppercase mb-1">Student Feedback</label>
                <textarea
                  rows={3}
                  value={editingTestimonial.text}
                  onChange={(e) => setEditingTestimonial({ ...editingTestimonial, text: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-[6px] focus:outline-none focus:border-[#FF9900] leading-relaxed"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={saving}
                className="w-full bg-[#E68A00] hover:bg-[#cc7a00] disabled:bg-slate-200 text-white py-2 rounded-[6px] text-[12.5px] font-bold transition-all cursor-pointer"
              >
                {saving ? 'Saving...' : 'Save Testimonial'}
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* ── EDIT TEAM MODAL ── */}
      {editingTeam && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[8px] max-w-lg w-full p-5 shadow-2xl border border-slate-200/50 flex flex-col gap-5"
          >
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h4 className="font-extrabold text-slate-900 text-[15px]">
                {editingTeam.id ? 'Edit Team Member' : 'Create Team Member'}
              </h4>
              <button onClick={() => setEditingTeam(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <form onSubmit={handleSaveTeam} className="flex flex-col gap-3.5 text-[12.5px]">
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[10.5px] font-extrabold text-[#E68A00] uppercase mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editingTeam.name}
                    onChange={(e) => setEditingTeam({ ...editingTeam, name: e.target.value })}
                    className="w-full h-9 px-3 border border-slate-200 rounded-[6px] focus:outline-none focus:border-[#FF9900]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10.5px] font-extrabold text-[#E68A00] uppercase mb-1">Showcase Tier</label>
                  <select
                    value={editingTeam.type}
                    onChange={(e) => setEditingTeam({ ...editingTeam, type: e.target.value })}
                    className="w-full h-9 px-3 border border-slate-200 rounded-[6px] focus:outline-none focus:border-[#FF9900] bg-white cursor-pointer"
                  >
                    <option value="core">Core Admin</option>
                    <option value="crew">Crew Associate</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3.5">
                <div className="col-span-2">
                  <label className="block text-[10.5px] font-extrabold text-[#E68A00] uppercase mb-1">Designation</label>
                  <input
                    type="text"
                    value={editingTeam.role}
                    onChange={(e) => setEditingTeam({ ...editingTeam, role: e.target.value })}
                    className="w-full h-9 px-3 border border-slate-200 rounded-[6px] focus:outline-none focus:border-[#FF9900]"
                    placeholder={editingTeam.type === 'core' ? "e.g. Lead Developer" : "e.g. Cloud Associate"}
                    required
                  />
                </div>
              </div>
              <div className={`grid gap-3.5 items-end ${editingTeam.type === 'core' ? 'grid-cols-3' : 'grid-cols-2'}`}>
                <div className="col-span-1">
                  <label className="block text-[10.5px] font-extrabold text-[#E68A00] uppercase mb-1">Avatar Photo</label>
                  <div className="flex items-center gap-2">
                    {editingTeam.image && !teamImageError && (
                      <div className="w-9 h-9 rounded-full border border-slate-200 overflow-hidden shrink-0 shadow-sm">
                        <img 
                          src={editingTeam.image} 
                          alt="Avatar" 
                          className="w-full h-full object-cover" 
                          onError={() => setTeamImageError(true)}
                        />
                      </div>
                    )}
                    <label className="flex-1 flex items-center justify-center border border-dashed border-slate-200 hover:border-[#FF9900] rounded-[6px] p-2.5 cursor-pointer hover:bg-slate-50/50 transition-all text-[10.5px] font-bold text-slate-600 leading-none h-9">
                      <UploadCloud className="w-3.5 h-3.5 text-slate-400" />
                      <span className="ml-1">
                        {uploadingTeam ? 'Uploading...' : 'Upload'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleTeamImageUpload}
                        className="hidden"
                        disabled={uploadingTeam}
                      />
                    </label>
                  </div>
                </div>
                {editingTeam.type === 'core' && (
                  <div>
                    <label className="block text-[10.5px] font-extrabold text-[#E68A00] uppercase mb-1">Accent Hex</label>
                    <input
                      type="text"
                      value={editingTeam.accent}
                      onChange={(e) => setEditingTeam({ ...editingTeam, accent: e.target.value })}
                      className="w-full h-9 px-3 border border-slate-200 rounded-[6px] focus:outline-none focus:border-[#FF9900]"
                      placeholder="e.g. #FF9900"
                      required
                    />
                  </div>
                )}
                <div>
                  <label className="block text-[10.5px] font-extrabold text-[#E68A00] uppercase mb-1">Sort Order</label>
                  <input
                    type="number"
                    value={editingTeam.order}
                    onChange={(e) => setEditingTeam({ ...editingTeam, order: parseInt(e.target.value) || 0 })}
                    className="w-full h-9 px-3 border border-slate-200 rounded-[6px] focus:outline-none focus:border-[#FF9900]"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={saving}
                className="w-full bg-[#E68A00] hover:bg-[#cc7a00] disabled:bg-slate-200 text-white py-2 rounded-[6px] text-[12.5px] font-bold transition-all cursor-pointer"
              >
                {saving ? 'Saving...' : 'Save Team Member'}
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* ── LIVE PREVIEW MODAL POPUP ── */}
      <AnimatePresence>
        {isPreviewOpen && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className={`bg-white rounded-[16px] w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col transition-all duration-300 ${previewMode === 'mobile' ? 'max-w-sm' : 'max-w-5xl'}`}
            >
              {/* Clean Preview Header */}
              <div className="bg-slate-50 px-4.5 py-3.5 border-b border-slate-200/80 flex items-center justify-between">
                <div className="text-[13.5px] font-black text-slate-800 tracking-tight select-none">
                  Live Preview
                </div>

                {/* Controls Side (Switcher + Close) */}
                <div className="flex items-center gap-3">
                  {/* Desktop / Mobile Switcher */}
                  <div className="flex items-center gap-0.5 bg-slate-100/85 p-0.5 rounded-[8px] border border-slate-200/50">
                    <button
                      onClick={() => setPreviewMode('desktop')}
                      className={`p-1 rounded-[6px] transition-all cursor-pointer ${previewMode === 'desktop' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                      title="Desktop View"
                    >
                      <Monitor className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setPreviewMode('mobile')}
                      className={`p-1 rounded-[6px] transition-all cursor-pointer ${previewMode === 'mobile' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                      title="Mobile View"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="w-[1px] h-4 bg-slate-200" />

                  {/* Close Button */}
                  <button
                    onClick={() => setIsPreviewOpen(false)}
                    className="p-1.5 hover:bg-slate-200/60 rounded-[8px] text-slate-400 hover:text-slate-700 transition-all cursor-pointer shrink-0"
                  >
                    <X className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>

              {/* Preview Content Area */}
              <div className="overflow-y-auto max-h-[75vh] bg-[#f8fafc] preview-content-scroll">
                {activeTab === 'hero' && (
                  <div className="relative overflow-hidden select-none origin-top">
                    <Hero previewData={hero} forceMobile={previewMode === 'mobile'} />
                  </div>
                )}

                {activeTab === 'coordinator' && (
                  <div className="relative py-2 bg-[#f8fafc] overflow-hidden select-none origin-top">
                    <FacultyCoordinator previewData={coord} forceMobile={previewMode === 'mobile'} />
                  </div>
                )}

                {activeTab === 'journeys' && (
                  <div className="relative py-2 bg-[#0b0f19] select-none origin-top">
                    <Gallery previewData={journeys} />
                  </div>
                )}

                {activeTab === 'testimonials' && (
                  <div className="relative py-2 bg-[#f8fafc] overflow-hidden select-none">
                    <ReviewsMarquee previewData={testimonials} />
                  </div>
                )}

                {activeTab === 'team' && (
                  <div className="relative py-2 bg-[#f8fafc] overflow-hidden select-none origin-top">
                    <OurTeamShowcase previewData={team} />
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
