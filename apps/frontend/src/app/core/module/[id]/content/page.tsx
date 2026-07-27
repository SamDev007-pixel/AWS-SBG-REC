'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { modulesService, slidesService, mapLayoutTypeToFrontend, mapLayoutTypeToBackend } from '@/services/roadmap.api';
import { ApiError } from '@/services/roadmap.apiClient';
import { authService } from '@/services/auth.service';
import { LearningContentRenderer } from '@/components/Roadmap/LearningContentRenderer';
import * as Icons from 'lucide-react';
import { cn } from '@/lib/utils';
import ConfirmDeleteModal from '@/components/Core/ConfirmDeleteModal';
import { showToast } from '@/components/Core/Toast';
import { AnimatePresence } from 'framer-motion';
import MobileEditorHeader from '@/components/Core/Mobile/MobileEditorHeader';
import MobileSlideList from '@/components/Core/ContentEditor/MobileSlideList';
import MobileSlideEditor from '@/components/Core/ContentEditor/MobileSlideEditor';
import MobileSlidePreview from '@/components/Core/ContentEditor/MobileSlidePreview';

const tierToLevel = (tier: string): 'Beginner' | 'Intermediate' | 'Advanced' => {
  const map: Record<string, 'Beginner' | 'Intermediate' | 'Advanced'> = {
    Fundamentals: 'Beginner',
    Associate: 'Intermediate',
    Professional: 'Advanced',
  };
  return map[tier] || 'Beginner';
};

const getIconForSlug = (slug: string): string => {
  const map: Record<string, string> = {
    fundamentals: 'Globe',
    ec2: 'Cpu',
    s3: 'Database',
    iam: 'Shield',
    vpc: 'Network',
    rds: 'Server',
    route53: 'Compass',
    elasticloadbalancing: 'Shuffle',
    autoscaling: 'ArrowUpCircle',
    lambda: 'Zap',
    dynamodb: 'HardDrive',
    cloudwatch: 'Eye',
    sns_sqs: 'Mail',
    cloudtrail: 'FileText',
    cloudfront: 'Tv',
    ecs_eks: 'Box',
    iam_advanced: 'Lock',
    transit_gateway: 'GitMerge',
  };
  return map[slug] || 'Boxes';
};

export default function ContentEditorPage() {
  const params = useParams();
  const router = useRouter();
  const moduleId = params.id as string;

  const [module, setModule] = useState<{ id: string; name: string; level: string; dbId: string; iconName: string; topicId: string | null } | null>(null);
  const [slides, setSlides] = useState<any[]>([]);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'failed'>('idle');
  const [isDeleteSlideModalOpen, setIsDeleteSlideModalOpen] = useState(false);
  const [pendingDeleteSlideIdx, setPendingDeleteSlideIdx] = useState<number | null>(null);
  const [mobileView, setMobileView] = useState<'list' | 'edit' | 'preview'>('list');

  // References for debounced save
  const isDirtyRef = useRef(false);
  const slidesRef = useRef<any[]>([]);
  const dbIdRef = useRef<string | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const saveVersionRef = useRef(0);

  // Keep slidesRef.current and dbIdRef.current synchronized
  useEffect(() => {
    slidesRef.current = slides;
  }, [slides]);

  useEffect(() => {
    if (module) {
      dbIdRef.current = module.dbId;
    } else {
      dbIdRef.current = null;
    }
  }, [module]);

  const handleApiError = (err: any) => {
    const apiError = err as ApiError;
    if (apiError.status === 401) {
      authService.logout();
      router.push('/login');
    } else if (apiError.status === 403) {
      alert('Permission Denied: You do not have the required core privileges to make curriculum changes.');
    } else {
      alert(apiError.message || 'An unexpected error occurred.');
    }
  };

  useEffect(() => {
    const loadModuleAndSlides = async () => {
      try {
        setLoading(true);
        let res;
        try {
          res = await modulesService.getModule(moduleId);
        } catch {
          res = await modulesService.getModuleBySlug(moduleId);
        }
        
        // Runtime Contract Guard: Verify module detail structure
        if (!res || !res.id || !res.name || !res.tier) {
          throw new Error('API Contract Mismatch: Invalid module metadata received.');
        }

        // Runtime Contract Guard for Slides
        if (!Array.isArray(res.slides)) {
          throw new Error('API Contract Mismatch: Slides data is missing or not an array.');
        }
        
        for (const slide of res.slides) {
          const missing = [];
          if (slide.title === undefined || slide.title === null) missing.push('title');
          if (slide.layoutType === undefined || slide.layoutType === null) missing.push('layoutType');
          if (slide.orderIndex === undefined || slide.orderIndex === null) missing.push('orderIndex');
          if (missing.length > 0) {
            throw new Error(`API Contract Mismatch: Slide is missing required fields: ${missing.join(', ')}`);
          }
        }

        setModule({
          id: res.slug,
          name: res.name,
          level: tierToLevel(res.tier),
          dbId: res.id,
          iconName: getIconForSlug(res.slug),
          topicId: res.topicId ?? null,
        });

        // Map backend slides to frontend slides structure
        const mappedSlides = res.slides.map((s) => ({
          title: s.title,
          content: s.bullets || [], // Rename bullets -> content
          layoutType: mapLayoutTypeToFrontend(s.layoutType),
          imageUrl: s.imageUrl || undefined,
        }));
        
        setSlides(mappedSlides);
        setError(null);
      } catch (err: any) {
        console.error('Failed to load slides:', err);
        setError(err.message || 'An error occurred loading slide content.');
      } finally {
        setLoading(false);
      }
    };

    loadModuleAndSlides();
  }, [moduleId]);

  const flushSlides = async (): Promise<void> => {
    if (!isDirtyRef.current || !dbIdRef.current) return Promise.resolve();

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = null;
    }

    const version = ++saveVersionRef.current;
    isDirtyRef.current = false;
    setSaveStatus('saving');

    try {
      // Map slides to backend shape, generating orderIndex = array index
      const mapped = slidesRef.current.map((s, index) => ({
        title: s.title,
        layoutType: mapLayoutTypeToBackend(s.layoutType),
        imageUrl: s.imageUrl || null,
        bullets: s.content || [],
        orderIndex: index,
      }));

      await slidesService.syncSlides(dbIdRef.current, mapped);

      if (version === saveVersionRef.current) {
        setSaveStatus('saved');
      }
    } catch (err: any) {
      console.error('Failed to sync slides:', err);
      if (version === saveVersionRef.current) {
        setSaveStatus('failed');
        isDirtyRef.current = true;
      }
      handleApiError(err);
      throw err;
    }
  };

  const updateSlidesLocally = (updatedSlides: any[]) => {
    setSlides(updatedSlides);
    isDirtyRef.current = true;
    setSaveStatus('idle');

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    debounceTimeoutRef.current = setTimeout(() => {
      flushSlides().catch(console.error);
    }, 1000);
  };

  const activeSlide = slides[activeSlideIndex] || slides[0] || null;

  // Add Slide
  const handleAddSlide = async () => {
    try {
      await flushSlides();
      const newSlide = {
        title: 'New Cloud Concept',
        content: ['Introduce your first cloud concept bullet point here.'],
        layoutType: 'text-only' as const
      };
      const updated = [...slides, newSlide];
      
      // Perform immediate sync
      isDirtyRef.current = true;
      setSlides(updated);
      slidesRef.current = updated; // Update ref immediately for flush
      await flushSlides();
      
      setActiveSlideIndex(updated.length - 1);
      showToast('Slide created successfully');
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Slide
  const handleDeleteSlide = async (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (slides.length <= 1) return;
    setPendingDeleteSlideIdx(idx);
    setIsDeleteSlideModalOpen(true);
  };

  const confirmDeleteSlide = async () => {
    if (pendingDeleteSlideIdx === null) return;
    try {
      await flushSlides();
      const updated = slides.filter((_, i) => i !== pendingDeleteSlideIdx);
      
      isDirtyRef.current = true;
      setSlides(updated);
      slidesRef.current = updated;
      await flushSlides();
      
      setActiveSlideIndex(Math.max(0, pendingDeleteSlideIdx - 1));
    } catch (err) {
      console.error(err);
    }
  };

  // Move Slide
  const handleMoveSlide = async (idx: number, direction: 'up' | 'down', e: React.MouseEvent) => {
    e.stopPropagation();
    if (direction === 'up' && idx > 0) {
      try {
        await flushSlides();
        const updated = [...slides];
        const temp = updated[idx];
        updated[idx] = updated[idx - 1];
        updated[idx - 1] = temp;
        
        isDirtyRef.current = true;
        setSlides(updated);
        slidesRef.current = updated;
        await flushSlides();
        
        setActiveSlideIndex(idx - 1);
      } catch (err) {
        console.error(err);
      }
    } else if (direction === 'down' && idx < slides.length - 1) {
      try {
        await flushSlides();
        const updated = [...slides];
        const temp = updated[idx];
        updated[idx] = updated[idx + 1];
        updated[idx + 1] = temp;
        
        isDirtyRef.current = true;
        setSlides(updated);
        slidesRef.current = updated;
        await flushSlides();
        
        setActiveSlideIndex(idx + 1);
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Update Active Slide Fields
  const updateActiveSlide = (fields: Partial<(typeof slides)[0]>) => {
    if (!activeSlide) return;
    const updated = [...slides];
    updated[activeSlideIndex] = {
      ...activeSlide,
      ...fields
    };
    updateSlidesLocally(updated);
  };

  // Bullet CRUD inside active slide
  const handleUpdateBullet = (bulletIdx: number, val: string) => {
    if (!activeSlide) return;
    const updatedBullets = [...activeSlide.content];
    updatedBullets[bulletIdx] = val;
    updateActiveSlide({ content: updatedBullets });
  };

  const handleAddBullet = () => {
    if (!activeSlide) return;
    updateActiveSlide({
      content: [...activeSlide.content, 'New bullet point.']
    });
  };

  const handleDeleteBullet = (bulletIdx: number) => {
    if (!activeSlide || activeSlide.content.length <= 1) return;
    updateActiveSlide({
      content: activeSlide.content.filter((_: string, i: number) => i !== bulletIdx)
    });
  };

  // Image upload helper — uploads to Cloudinary via backend
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setSaveStatus('saving');
      const { url } = await slidesService.uploadImage(file);
      updateActiveSlide({ imageUrl: url });
    } catch (err) {
      console.error('Image upload failed:', err);
      setSaveStatus('failed');
    }
  };

  const handleRemoveImage = () => {
    if (!activeSlide) return;
    const { imageUrl, ...rest } = activeSlide;
    const updated = [...slides];
    updated[activeSlideIndex] = rest;
    updateSlidesLocally(updated);
  };

  // beforeunload handler to prevent losing unsaved data
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirtyRef.current) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes in slides settings. Are you sure you want to leave?';
        return e.returnValue;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Flush on unmount
  useEffect(() => {
    return () => {
      if (isDirtyRef.current && dbIdRef.current) {
        const mapped = slidesRef.current.map((s, index) => ({
          title: s.title,
          layoutType: mapLayoutTypeToBackend(s.layoutType),
          imageUrl: s.imageUrl || null,
          bullets: s.content || [],
          orderIndex: index,
        }));
        slidesService.syncSlides(dbIdRef.current, mapped).catch(console.error);
      }
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  // CMS Error Banner render block
  if (error) {
    return (
      <div className="min-h-screen w-full bg-slate-900 flex items-center justify-center p-6 text-slate-100">
        <div className="max-w-xl w-full bg-rose-500/10 border-2 border-rose-500/20 rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-rose-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/20 animate-bounce">
            <Icons.AlertTriangle className="w-9 h-9" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-extrabold tracking-tight text-white font-heading">
              CMS Runtime Contract Mismatch
            </h2>
            <p className="text-xs text-rose-400 leading-relaxed max-w-md mx-auto">
              {error}
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="bg-rose-600 hover:bg-rose-550 text-white font-black text-xs px-6 py-3 rounded-xl shadow-md transition-all font-heading"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-slate-500">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 rounded-full border-2 border-amber-200 border-t-[#FF9900] animate-spin shadow-2xs" />
          <span className="text-xs text-slate-600 font-bold uppercase tracking-wider font-heading animate-pulse">
            Loading slide content editor...
          </span>
        </div>
      </div>
    );
  }

  if (!module) return null;

  const handleMobileBack = () => {
    const backUrl = module?.topicId ? `/core/topics/${module.topicId}/roadmap?selected=${module.id}` : '/core/topics';
    router.push(backUrl);
  };

  const handleMobileTabChange = (tab: 'slides' | 'quiz') => {
    if (tab === 'quiz') {
      router.push(`/core/module/${module.dbId}/quiz`);
    }
  };

  return (
    <div className="p-0 lg:p-6 lg:md:p-8 space-y-0 lg:space-y-6 flex flex-col h-full bg-white select-none">
      <style>{`
        /* Hide layout sidebar container scrollbars */
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-none {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* Desktop Experience */}
      <div className="hidden lg:flex flex-col h-full space-y-6 flex-1 min-h-0">
        {/* Top Navigation Row */}
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-4 flex-shrink-0 relative">
          <div className="flex items-center gap-3">
            <Link
              href={module?.topicId ? `/core/topics/${module.topicId}/roadmap?selected=${module.id}` : '/core/topics'}
              className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-xl text-slate-600 hover:text-slate-900 transition-colors shadow-2xs"
              onClick={(e) => {
                if (isDirtyRef.current) {
                  const proceed = window.confirm('You have unsaved changes. Are you sure you want to leave?');
                  if (!proceed) e.preventDefault();
                }
              }}
            >
              <Icons.ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 font-heading tracking-tight leading-tight">
                  {module.name}
                </h2>
                <span className="text-[10px] font-bold uppercase text-amber-700 tracking-wider bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-md font-heading">
                  {module.level}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Curate the slide deck that students view when launching this module.
              </p>
            </div>
          </div>

          {/* Editor tab navigation */}
          <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 flex items-center bg-slate-100/80 rounded-xl p-1 gap-1 border border-slate-200/50">
            <Link
              href={`/core/module/${module.dbId}/content`}
              className="px-4 py-1.5 rounded-lg text-xs font-bold transition-all bg-[#232F3E] text-white shadow-2xs flex items-center justify-center font-heading"
            >
              <Icons.FileText className="w-3.5 h-3.5 mr-1.5" />
              Slides
            </Link>
            <Link
              href={`/core/module/${module.dbId}/quiz`}
              className="px-4 py-1.5 rounded-lg text-xs font-bold transition-all text-slate-600 hover:text-slate-900 hover:bg-white/60 flex items-center justify-center font-heading"
              onClick={(e) => {
                if (isDirtyRef.current) {
                  const proceed = window.confirm('You have unsaved changes. Are you sure you want to leave?');
                  if (!proceed) e.preventDefault();
                }
              }}
            >
              <Icons.HelpCircle className="w-3.5 h-3.5 mr-1.5" />
              Quiz
            </Link>
          </div>
        </div>

        {/* Main workspace splits */}
        <div className="flex-1 flex gap-6 min-h-0">
          
          {/* Pane 1: SLIDE TIMELINE SIDEBAR */}
          <div className="w-64 bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between overflow-y-auto flex-shrink-0 shadow-2xs">
            <div className="space-y-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block font-heading">
                Slides Timeline
              </span>

              <div className="space-y-2 max-h-[52vh] overflow-y-auto pr-1 scrollbar-thin">
                {slides.map((slide, idx) => (
                  <div
                    key={idx}
                    onClick={() => setActiveSlideIndex(idx)}
                    className={cn(
                      "p-3 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col gap-1.5 relative group shadow-2xs",
                      activeSlideIndex === idx
                        ? "bg-amber-50/60 border border-[#FF9900]/60 shadow-2xs"
                        : "bg-slate-50/50 border-slate-200/80 hover:bg-slate-50 hover:border-slate-300"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className={cn(
                        "text-[9px] font-bold uppercase font-heading px-1.5 py-0.5 rounded-md border",
                        activeSlideIndex === idx
                          ? "bg-amber-50 text-amber-700 border-amber-200/80"
                          : "bg-slate-100 text-slate-400 border-slate-200/60"
                      )}>
                        SLIDE-{String(idx + 1).padStart(2, '0')}
                      </span>
                      
                      {/* Control Overlay for order/delete */}
                      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                        <button
                          onClick={(e) => handleMoveSlide(idx, 'up', e)}
                          disabled={idx === 0}
                          className="p-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-200/80 text-slate-600 disabled:opacity-30 disabled:pointer-events-none"
                        >
                          <Icons.ChevronUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => handleMoveSlide(idx, 'down', e)}
                          disabled={idx === slides.length - 1}
                          className="p-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-200/80 text-slate-600 disabled:opacity-30 disabled:pointer-events-none"
                        >
                          <Icons.ChevronDown className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteSlide(idx, e)}
                          disabled={slides.length <= 1}
                          className="p-1 rounded-lg bg-white hover:bg-rose-50 border border-slate-200/80 hover:border-rose-200 text-slate-500 hover:text-rose-600 disabled:opacity-30 disabled:pointer-events-none"
                          title="Delete"
                        >
                          <Icons.Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <span className={cn(
                      "text-xs truncate font-heading transition-colors",
                      activeSlideIndex === idx ? "font-semibold text-slate-800" : "font-medium text-slate-600"
                    )}>
                      {slide.title || 'Untitled Slide'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleAddSlide}
              className="w-full mt-4 bg-slate-50 hover:bg-amber-50 text-slate-700 hover:text-amber-700 border border-slate-200/80 hover:border-amber-300 text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer font-heading"
            >
              <Icons.Plus className="w-4 h-4 text-slate-400" />
              Add Slide
            </button>
          </div>

          {/* Pane 2: SLIDE CONFIGURATION */}
          {activeSlide ? (
            <div className="flex-1 bg-white border border-slate-200/80 rounded-2xl p-6 overflow-y-auto flex flex-col gap-5 shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-heading">
                  Slide Configuration
                </span>
                <div className="flex items-center gap-1.5">
                  {saveStatus === 'saving' && <span className="text-[10px] text-[#FF9900] font-bold animate-pulse font-heading lowercase tracking-normal">(saving...)</span>}
                  {saveStatus === 'saved' && <span className="text-[10px] text-emerald-600 font-bold font-heading lowercase tracking-normal">(saved)</span>}
                  {saveStatus === 'failed' && <span className="text-[10px] text-rose-500 font-bold font-heading lowercase tracking-normal">(failed to save)</span>}
                </div>
              </div>

              {/* Layout type selector */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 text-xs block font-heading">Layout Structure</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'text-only', label: 'Text Only', icon: Icons.AlignLeft },
                    { value: 'text-image', label: 'Text + Image', icon: Icons.ImagePlay },
                    { value: 'image-only', label: 'Image Only', icon: Icons.Image }
                  ].map((layout) => (
                    <button
                      key={layout.value}
                      type="button"
                      onClick={() => updateActiveSlide({ layoutType: layout.value as any })}
                      className={cn(
                        "py-2.5 px-3 border rounded-xl flex flex-col items-center gap-1.5 transition-all font-bold text-xs cursor-pointer font-heading shadow-2xs",
                        activeSlide.layoutType === layout.value || (!activeSlide.layoutType && layout.value === 'text-only')
                          ? "bg-amber-50/60 border-[#FF9900] text-amber-800 ring-2 ring-[#FF9900]/15"
                          : "bg-slate-50/50 border-slate-200/80 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      )}
                    >
                      <layout.icon className="w-4 h-4 text-slate-500" />
                      {layout.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title field */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 text-xs block font-heading">Slide Title</label>
                <input
                  type="text"
                  value={activeSlide.title}
                  onChange={(e) => updateActiveSlide({ title: e.target.value })}
                  className="w-full bg-slate-50/50 hover:bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-medium placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF9900]/15 focus:border-[#FF9900] transition-all shadow-2xs"
                />
              </div>

              {/* Bullet points editor */}
              {activeSlide.layoutType !== 'image-only' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-700 text-xs block font-heading">Curriculum Bullet Points</label>
                    <button
                      type="button"
                      onClick={handleAddBullet}
                      className="text-xs font-bold text-[#FF9900] hover:underline flex items-center gap-1 cursor-pointer font-heading"
                    >
                      <Icons.Plus className="w-3.5 h-3.5" />
                      Add Bullet
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {(activeSlide.content || []).map((bullet: string, bulletIdx: number) => (
                      <div key={bulletIdx} className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-amber-50 border border-amber-200/80 text-amber-700 flex items-center justify-center flex-shrink-0 text-xs font-bold font-heading">
                          {bulletIdx + 1}
                        </div>
                        <input
                          type="text"
                          value={bullet}
                          onChange={(e) => handleUpdateBullet(bulletIdx, e.target.value)}
                          className="flex-1 bg-slate-50/50 hover:bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-medium placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF9900]/15 focus:border-[#FF9900] transition-all shadow-2xs"
                        />
                        <button
                          type="button"
                          onClick={() => handleDeleteBullet(bulletIdx)}
                          disabled={activeSlide.content.length <= 1}
                          className="p-2 bg-slate-50 hover:bg-rose-50 border border-slate-200/80 hover:border-rose-200 text-slate-500 hover:text-rose-600 rounded-xl transition-all shadow-2xs cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
                        >
                          <Icons.Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Image selector */}
              {(activeSlide.layoutType === 'text-image' || activeSlide.layoutType === 'image-only') && (
                <div className="space-y-2 border-t border-slate-100 pt-4 mt-2">
                  <label className="font-bold text-slate-700 text-xs block font-heading">Architectural Image Component</label>
                  
                  {activeSlide.imageUrl ? (
                    <div className="relative border border-slate-200/80 rounded-2xl p-4 bg-slate-50/50 flex flex-col items-center gap-3">
                      <img
                        src={activeSlide.imageUrl}
                        alt="Current Slide View"
                        className="max-h-[120px] object-contain rounded-lg border border-slate-200"
                      />
                      <div className="flex items-center gap-2 w-full">
                        <label className="flex-1 py-2 px-3 border border-slate-200/80 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl cursor-pointer text-center shadow-2xs font-heading">
                          Change Image
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="py-2 px-3 border border-rose-200/80 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl cursor-pointer shadow-2xs font-heading"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="border-2 border-dashed border-slate-200 hover:border-[#FF9900] rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer bg-slate-50/40 hover:bg-amber-50/20 transition-all text-center">
                      <Icons.UploadCloud className="w-7 h-7 text-slate-400" />
                      <span className="text-xs font-bold text-slate-700 font-heading">Upload Concept Image</span>
                      <span className="text-[10px] text-slate-400">JPG, PNG, WebP (Max 5MB)</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              )}

            </div>
          ) : (
            <div className="flex-1 bg-white border border-slate-200/80 rounded-2xl p-6 flex items-center justify-center text-slate-400 text-xs shadow-2xs font-medium">
              Select or create a slide to begin editing.
            </div>
          )}

          {/* Pane 3: STUDENT PREVIEW FRAME */}
          <div className="w-[380px] border border-slate-200/80 rounded-2xl overflow-hidden flex flex-col bg-slate-50/60 flex-shrink-0 shadow-2xs">
            <div className="bg-white px-4 py-3 border-b border-slate-200/80 flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-wider font-heading">
              <Icons.Smartphone className="w-4 h-4 text-[#FF9900]" />
              Student Preview Pane
            </div>

            <div className="flex-1 p-5 flex flex-col justify-between overflow-y-auto">
              <div className="space-y-4">
                
                {/* Top progress indicator bar */}
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 font-heading">
                  <span>Slide {activeSlideIndex + 1} of {slides.length}</span>
                  <span className="text-amber-700 uppercase tracking-wider">Curriculum Path</span>
                </div>
                <div className="h-1.5 w-full bg-slate-200/70 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-[#FF9900] transition-all duration-300"
                    style={{ width: `${((activeSlideIndex + 1) / (slides.length || 1)) * 100}%` }}
                  />
                </div>

                {/* Learning slide core */}
                {activeSlide ? (
                  <div className="bg-white rounded-2xl p-5 shadow-sm text-slate-800 min-h-[340px] flex flex-col justify-between border border-slate-200/80 select-text">
                    <LearningContentRenderer
                      title={activeSlide.title}
                      bullets={activeSlide.layoutType === 'image-only' ? [] : activeSlide.content}
                      layout={activeSlide.layoutType || 'text-only'}
                      iconName={module.iconName || 'Boxes'}
                      imageUrl={activeSlide.imageUrl}
                    />
                  </div>
                ) : (
                  <div className="bg-slate-100 border border-slate-200 rounded-2xl p-8 text-center text-slate-400 text-xs min-h-[300px] flex items-center justify-center">
                    No slide selected
                  </div>
                )}
              </div>

              {/* Modal Bottom buttons simulation */}
              <div className="flex items-center justify-between border-t border-slate-200/80 pt-4 mt-6 flex-shrink-0">
                <button
                  disabled={activeSlideIndex === 0}
                  onClick={() => setActiveSlideIndex(prev => Math.max(0, prev - 1))}
                  className="px-4 py-2.5 rounded-xl border border-slate-200/80 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer font-heading"
                >
                  <Icons.ArrowLeft className="w-3.5 h-3.5" />
                  Previous
                </button>
                
                <button
                  disabled={activeSlideIndex === slides.length - 1}
                  onClick={() => setActiveSlideIndex(prev => Math.min(slides.length - 1, prev + 1))}
                  className="px-5 py-2.5 rounded-xl bg-[#232F3E] hover:bg-slate-800 text-white disabled:opacity-30 disabled:pointer-events-none text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer font-heading"
                >
                  Next Slide
                  <Icons.ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Mobile Experience (Refactored Layout) */}
      <div className="lg:hidden flex flex-col h-full min-h-screen">
        <MobileEditorHeader
          title={`${module.name} Content Editor`}
          badge={module.level}
          currentTab="slides"
          isDirty={isDirtyRef.current}
          onBack={handleMobileBack}
          onTabChange={handleMobileTabChange}
        />
        <div className="flex-1 bg-slate-50">
          {mobileView === 'list' && (
            <MobileSlideList
              slides={slides}
              onEditSlide={(idx) => {
                setActiveSlideIndex(idx);
                setMobileView('edit');
              }}
              onMoveSlide={async (idx, direction) => {
                const fakeEvent = { stopPropagation: () => {} } as React.MouseEvent;
                await handleMoveSlide(idx, direction, fakeEvent);
              }}
              onDeleteSlide={async (idx) => {
                const fakeEvent = { stopPropagation: () => {} } as React.MouseEvent;
                await handleDeleteSlide(idx, fakeEvent);
              }}
              onAddSlide={async () => {
                await handleAddSlide();
                setMobileView('edit');
              }}
            />
          )}

          <AnimatePresence mode="wait">
            {mobileView === 'edit' && activeSlide && (
              <MobileSlideEditor
                key="editor"
                slide={activeSlide}
                slideIndex={activeSlideIndex}
                onBack={() => setMobileView('list')}
                onPreview={() => setMobileView('preview')}
                updateActiveSlide={updateActiveSlide}
                handleUpdateBullet={handleUpdateBullet}
                handleAddBullet={handleAddBullet}
                handleDeleteBullet={handleDeleteBullet}
                handleImageUpload={handleImageUpload}
                handleRemoveImage={handleRemoveImage}
                saveStatus={saveStatus}
              />
            )}

            {mobileView === 'preview' && activeSlide && (
              <MobileSlidePreview
                key="preview"
                slide={activeSlide}
                slideIndex={activeSlideIndex}
                totalSlides={slides.length}
                iconName={module.iconName || 'Boxes'}
                onBack={() => setMobileView('edit')}
                onPrevSlide={() => setActiveSlideIndex((prev) => Math.max(0, prev - 1))}
                onNextSlide={() => setActiveSlideIndex((prev) => Math.min(slides.length - 1, prev + 1))}
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      <ConfirmDeleteModal
        isOpen={isDeleteSlideModalOpen}
        title="Delete Slide"
        entityName={pendingDeleteSlideIdx !== null ? `Slide ${pendingDeleteSlideIdx + 1}` : ''}
        onClose={() => { setIsDeleteSlideModalOpen(false); setPendingDeleteSlideIdx(null); }}
        onConfirm={confirmDeleteSlide}
      />
    </div>
  );
}
