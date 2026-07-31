'use client';

import React, { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { TopicData, TopicTheme } from '@/services/roadmap.api';
import DescriptionBulletEditor, { cleanDescription } from './DescriptionBulletEditor';
import { FlippingBook } from '@/components/Learn/FlippingBook';
import { SkyBackground } from '@/components/Roadmap/SkyBackground';
import { cn } from '@/lib/utils';

interface EditTopicModalProps {
  isOpen: boolean;
  topic: TopicData | null;
  onClose: () => void;
  onSubmit: (id: string, name: string, description: string, theme: TopicTheme) => Promise<void>;
}

const parseBulletPoints = (text: string): string[] => {
  if (!text || !text.trim()) return [];
  const lines = text.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  const bulletItems: string[] = [];
  for (const line of lines) {
    const cleanBlock = line
      .replace(/^[\s\-*•+\u2022\u2023\u25E6\u2043]+/, '')
      .replace(/^\d+\.\s+/, '')
      .trim();
    if (cleanBlock) bulletItems.push(cleanBlock);
  }
  return bulletItems.length > 0 ? bulletItems : [text.trim()];
};

export default function EditTopicModal({ isOpen, topic, onClose, onSubmit }: EditTopicModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [theme, setTheme] = useState<TopicTheme>('TECH');
  const [submitting, setSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [isFullScreenPreview, setIsFullScreenPreview] = useState(false);
  const [isEditorDrawerOpen, setIsEditorDrawerOpen] = useState(true);

  useEffect(() => {
    if (topic) {
      setName(topic.name);
      setDescription(topic.description || '');
      setTheme(topic.theme || 'TECH');
    }
  }, [topic]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!topic || !name.trim()) return;
    setSubmitting(true);
    try {
      const cleanedDescription = cleanDescription(description);
      await onSubmit(topic.id, name.trim(), cleanedDescription, theme);
      onClose();
    } catch (err) {
      // Error handled by parent
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !topic) return null;

  const bullets = parseBulletPoints(description);
  const wordCount = description.trim() ? description.trim().split(/\s+/).length : 0;
  const topicNumber = topic.orderIndex !== undefined ? topic.orderIndex + 1 : 1;

  // ─── FULL 100% DESKTOP SCREEN PREVIEW MODE (Applicable for Desktop/Laptop only) ─────
  if (isFullScreenPreview) {
    return (
      <div className="hidden md:flex fixed inset-0 z-50 w-screen h-screen h-[100dvh] max-h-screen bg-gradient-to-b from-[#bae6fd] via-[#e0f2fe] to-[#e0f2fe] font-sans select-none overflow-hidden flex-col">
        {/* Full Viewport Sky Background */}
        <SkyBackground />

        {/* 1. TOP BROWSER & CONTROL BAR */}
        <div className="relative z-40 w-full bg-slate-900/90 backdrop-blur-md text-white px-4 py-2.5 flex items-center justify-between border-b border-slate-800 shadow-md">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-rose-500" />
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
            </div>
            <div className="flex items-center gap-2 bg-slate-800 px-3.5 py-1 rounded-lg border border-slate-700 text-xs text-slate-200">
              <Icons.Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-mono">https://app.aws-rec.com/learn</span>
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-heading">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              100% Full Screen Desktop View
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Toggle Editor Drawer Button */}
            <button
              type="button"
              onClick={() => setIsEditorDrawerOpen(!isEditorDrawerOpen)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border font-heading cursor-pointer",
                isEditorDrawerOpen
                  ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                  : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300"
              )}
            >
              <Icons.Edit3 className="w-3.5 h-3.5" />
              <span>{isEditorDrawerOpen ? "Hide Editor Panel" : "Show Editor Panel"}</span>
            </button>

            <button
              type="button"
              disabled={submitting}
              onClick={() => handleSubmit()}
              className="bg-[#FF9900] hover:bg-[#ff8800] text-slate-900 font-extrabold text-xs px-4 py-1.5 rounded-lg shadow-md transition-all cursor-pointer disabled:opacity-50 font-heading"
            >
              {submitting ? 'Saving...' : 'Save & Exit'}
            </button>

            <button
              type="button"
              onClick={() => setIsFullScreenPreview(false)}
              className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs px-3 py-1.5 rounded-lg border border-slate-700 transition-all cursor-pointer font-heading"
            >
              <Icons.Minimize2 className="w-3.5 h-3.5" />
              <span>Exit Fullscreen</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white transition-colors"
            >
              <Icons.X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2. MAIN 100vw × 100vh /learn PAGE CONTENT */}
        <div className="relative z-10 max-w-full mx-auto px-6 xl:px-12 pt-6 pb-6 flex flex-col gap-6 w-full h-full flex-1 min-h-0 overflow-hidden">

          {/* ROADMAP PROGRESS HEADER PANEL (Exact desktop /learn header) */}
          <header className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 w-full py-2 flex-shrink-0">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-10 h-10 rounded-full bg-white/90 border border-slate-200/80 flex items-center justify-center text-slate-600 shadow-xs flex-shrink-0">
                <Icons.ChevronLeft className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div className="flex flex-col text-slate-800 min-w-0">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block font-heading">
                  CONTINUE YOUR JOURNEY
                </span>
                <span className="text-base font-black text-slate-900 block leading-snug font-heading mt-0.5 truncate">
                  Current Mission: {name.trim() || 'Untitled Topic'}
                </span>
                <div className="flex items-center gap-3 mt-1 text-xs font-extrabold text-slate-500">
                  <span className="flex items-center gap-1 text-cyan-600">
                    <Icons.CheckCircle2 className="w-3.5 h-3.5" /> 2 / 5 Modules Completed
                  </span>
                  <span className="text-slate-300">|</span>
                  <span className="flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100/50">
                    <Icons.Zap className="w-3.5 h-3.5" /> +50 XP Reward
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <div className="bg-[#0284c7]/10 border border-[#0284c7]/20 rounded-xl px-3.5 py-1.5 flex items-center gap-2">
                <Icons.CheckCircle2 className="w-4 h-4 text-[#0284c7]" />
                <div>
                  <span className="text-[8px] font-extrabold text-slate-500 uppercase tracking-wider block leading-none">TOPICS</span>
                  <span className="text-xs font-bold text-slate-900 block leading-none mt-1">{topicNumber} / 8</span>
                </div>
              </div>
              <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl px-3.5 py-1.5 flex items-center gap-2">
                <Icons.Trophy className="w-4 h-4 text-indigo-650" />
                <div>
                  <span className="text-[8px] font-extrabold text-slate-500 uppercase tracking-wider block leading-none">SCORE</span>
                  <span className="text-xs font-bold text-slate-900 block leading-none mt-1">450 XP</span>
                </div>
              </div>
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3.5 py-1.5 flex items-center gap-2">
                <Icons.Layers className="w-4 h-4 text-emerald-600" />
                <div>
                  <span className="text-[8px] font-extrabold text-slate-500 uppercase tracking-wider block leading-none">LEVEL</span>
                  <span className="text-xs font-bold text-slate-900 block leading-none mt-1">Intermediate</span>
                </div>
              </div>
              <button type="button" className="font-bold text-xs px-5 py-2.5 rounded-xl text-white bg-[#00cba9] shadow-md font-heading cursor-pointer">
                Guidelines
              </button>
            </div>
          </header>

          {/* TWO-COLUMN LAYOUT: Topic rail + Right Learning Focus Panel */}
          <div className="flex flex-row gap-8 flex-1 min-h-0 overflow-hidden pb-6">

            {/* Left Column: Search + Topic Rail */}
            <div className="flex-[1.5] min-w-0 overflow-y-auto h-full pr-3 custom-scrollbar flex flex-col gap-4">
              <div className="relative w-full">
                <Icons.Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  readOnly
                  placeholder="Search Topics"
                  className="w-full pl-10 pr-9 py-2 bg-white/90 border border-slate-200/80 rounded-full text-xs text-slate-700 shadow-sm"
                />
              </div>

              <div className="flex flex-col items-center gap-4 w-full">
                {/* Completed Topic Card */}
                <div className="w-full bg-white/[0.15] backdrop-blur-[20px] border border-white/25 rounded-xl p-4 sm:px-6 flex items-center justify-between shadow-sm border-l-4 border-l-emerald-500 text-left opacity-80">
                  <div className="flex items-center gap-3">
                    <Icons.CheckCircle2 className="w-5 h-5 text-emerald-600 stroke-[2.5]" />
                    <h2 className="text-sm font-semibold text-slate-800">1. Cloud & AWS Foundations</h2>
                  </div>
                  <span className="px-4 py-1 rounded-full text-xs font-bold border border-emerald-500/25 text-emerald-650 bg-emerald-500/10">Review</span>
                </div>

                {/* CURRENT EDITED TOPIC CARD */}
                <div className="w-full bg-white/[0.25] backdrop-blur-[20px] border border-white/35 rounded-xl p-6 flex flex-col gap-4 shadow-xl border-l-4 border-l-[#FF9900] text-left">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="inline-block text-[9px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded bg-[#FF9900]/10 text-[#FF9900] border border-[#FF9900]/20 mb-2">
                        Current Focus
                      </span>
                      <h2 className="text-xl font-bold text-slate-900 tracking-tight leading-tight">
                        {topicNumber}. {name.trim() || 'Untitled Topic'}
                      </h2>
                      <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                        <span>2 / 5 Modules</span>
                        <span>•</span>
                        <span className="text-[#FF9900] font-bold">MOD 3: Core Architecture</span>
                      </div>
                    </div>

                    <div className="w-36 h-16 flex items-center justify-center bg-white/10 border border-amber-500/20 rounded-xl p-2 relative backdrop-blur-sm">
                      <svg viewBox="0 100 310 90" className="w-full h-auto text-[#FF9900]">
                        <path fill="#FF9900" d="M273.5,143.7c-32.9,24.3-80.7,37.2-121.8,37.2c-57.6,0-109.5-21.3-148.7-56.7c-3.1-2.8-0.3-6.6,3.4-4.4c42.4,24.6,94.7,39.5,148.8,39.5c36.5,0,76.6-7.6,113.5-23.2C274.2,133.6,278.9,139.7,273.5,143.7z" />
                        <path fill="#FF9900" d="M287.2,128.1c-4.2-5.4-27.8-2.6-38.5-1.3c-3.2,0.4-3.7-2.4-0.8-4.5c18.8-13.2,49.7-9.4,53.3-5c3.6,4.5-1,35.4-18.6,50.2c-2.7,2.3-5.3,1.1-4.1-1.9C282.5,155.7,291.4,133.4,287.2,128.1z" />
                      </svg>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-slate-100/50 rounded-full overflow-hidden">
                      <div className="h-full bg-[#FF9900] w-[60%] rounded-full" />
                    </div>
                    <span className="text-xs font-bold text-slate-600">60%</span>
                  </div>
                </div>

                {/* Locked Topic */}
                <div className="w-full bg-white/[0.08] backdrop-blur-[20px] border border-white/15 rounded-[20px] p-4 sm:px-6 flex items-center justify-between opacity-70 text-left">
                  <div className="flex items-center gap-3">
                    <Icons.Lock className="w-4 h-4 text-slate-400" />
                    <span className="font-semibold text-slate-700 text-sm">{topicNumber + 1}. Advanced Microservices</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full">5 Modules</span>
                </div>
              </div>
            </div>

            {/* Right Column: Full Topic Description Focus Panel */}
            <div className="flex-1 min-w-0 flex flex-col gap-6 h-full overflow-y-auto custom-scrollbar">
              <div className="w-full min-w-0 backdrop-blur-[20px] bg-white/[0.15] border border-white/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_10px_30px_rgba(0,0,0,0.08)] rounded-2xl p-6 lg:p-8 flex flex-col gap-6 text-left">
                <div className="flex items-center gap-3 w-full min-w-0">
                  <div className="p-2.5 rounded-xl flex items-center justify-center border bg-[#FF9900]/10 border-[#FF9900]/20 text-[#FF9900] flex-shrink-0">
                    <FlippingBook className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 block font-heading whitespace-nowrap">
                      Current Topic Focus
                    </span>
                    <h3 className="text-lg lg:text-xl font-black text-slate-900 leading-tight font-heading mt-0.5 whitespace-normal break-words">
                      {name.trim() || 'Untitled Topic'}
                    </h3>
                  </div>
                </div>

                <div className="border-t border-slate-200/50 pt-5 flex flex-col gap-4 w-full min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-heading block">
                    Description
                  </span>

                  {bullets.length > 0 ? (
                    <ul className="list-none pl-0 flex flex-col gap-3 w-full min-w-0">
                      {bullets.map((item, index) => (
                        <li key={index} className="flex items-start gap-3 w-full min-w-0">
                          <span className="w-2 h-2 rounded-full bg-[#FF9900] flex-shrink-0 mt-1.5" />
                          <span className="text-xs sm:text-sm text-slate-700 leading-relaxed font-semibold whitespace-normal break-words flex-1 min-w-0 [overflow-wrap:anywhere] [word-break:break-word]">
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-slate-400 italic font-medium py-2">
                      No description bullet points added yet.
                    </p>
                  )}
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* 3. FLOATING LIVE CONTENT EDITOR DRAWER PANEL */}
        <AnimatePresence>
          {isEditorDrawerOpen && (
            <motion.div
              initial={{ opacity: 0, x: -300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -300 }}
              transition={{ duration: 0.25 }}
              className="fixed top-16 left-6 bottom-6 w-[380px] max-w-[calc(100vw-3rem)] z-40 bg-white/95 backdrop-blur-2xl border border-slate-200/90 rounded-3xl shadow-2xl p-5 flex flex-col justify-between overflow-y-auto custom-scrollbar text-slate-800"
            >
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Icons.Edit3 className="w-4 h-4 text-[#FF9900]" />
                    <h3 className="text-sm font-extrabold text-slate-900 font-heading">
                      Live Content Editor
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsEditorDrawerOpen(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    <Icons.ChevronLeft className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-[10px] text-slate-550 leading-normal">
                  Edit the fields below. The entire 100% desktop website behind this panel updates live.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
                  <div className="space-y-1">
                    <label className="font-extrabold text-slate-500 block">Topic Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#FF6B00] transition-colors"
                    />
                  </div>

                  <DescriptionBulletEditor
                    value={description}
                    onChange={setDescription}
                  />
                </form>
              </div>

              <div className="pt-4 border-t border-slate-100 mt-4 flex flex-col gap-3">
                <div className="bg-slate-50 border border-slate-200/60 rounded-xl px-3 py-1.5 flex items-center justify-between text-[10px] font-bold text-slate-500">
                  <span>Space Occupied:</span>
                  <span className="text-slate-800">{bullets.length} Bullets • {wordCount} Words</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 bg-transparent hover:bg-slate-100 border border-slate-200 text-slate-500 font-bold py-2 rounded-xl transition-all cursor-pointer text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => handleSubmit()}
                    className="flex-1 bg-[#232F3E] hover:bg-slate-800 text-white font-bold py-2 rounded-xl shadow-lg transition-all disabled:opacity-50 cursor-pointer text-xs font-heading"
                  >
                    {submitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // ─── STANDARD EDIT MODAL VIEW (Clean editor form on Phone, optional Preview on Desktop/Laptop) ───
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className={cn(
          "bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 w-full shadow-2xl relative text-slate-800 transition-all duration-300 my-auto max-h-[92vh] overflow-y-auto custom-scrollbar",
          showPreview ? "max-w-md md:max-w-6xl" : "max-w-md"
        )}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-400 hover:text-slate-700 transition-colors z-20 cursor-pointer"
        >
          <Icons.X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-100 pr-10">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-black text-slate-900 font-heading tracking-tight">
              Edit Topic
            </h3>
            <span className="text-[10px] font-black text-[#FF6B00] bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md font-heading uppercase tracking-wider">
              Topic {topicNumber}
            </span>
          </div>

          {/* Toggle Live Preview Controls (DESKTOP & LAPTOP ONLY - Hidden on Phone UI) */}
          <div className="hidden md:flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border font-heading cursor-pointer",
                showPreview
                  ? "bg-amber-500/10 border-amber-500/30 text-[#FF9900] shadow-xs"
                  : "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-600"
              )}
              title={showPreview ? "Hide /learn preview" : "Show full /learn desktop preview"}
            >
              <Icons.Eye className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{showPreview ? "Preview Active" : "Desktop Preview"}</span>
            </button>

            {/* Launch 100% Full Screen Desktop Preview Button (Desktop & Laptop only) */}
            <button
              type="button"
              onClick={() => setIsFullScreenPreview(true)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#232F3E] hover:bg-slate-800 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer font-heading"
              title="Expand to 100% full screen desktop view"
            >
              <Icons.Maximize2 className="w-3.5 h-3.5 text-[#FF9900]" />
              <span>100% Full Desktop View</span>
            </button>
          </div>
        </div>

        {/* Modal Body Grid */}
        <div className={cn("grid gap-6 items-start", showPreview ? "grid-cols-1 md:grid-cols-12" : "grid-cols-1")}>

          {/* Form Controls Column (Takes full width on Phone UI, 5 cols on Desktop/Laptop) */}
          <div className={cn("flex flex-col gap-4", showPreview ? "w-full md:col-span-5" : "w-full")}>
            <p className="text-[10px] text-slate-550 leading-normal">
              Rename this topic or update its description bullets. <span className="hidden md:inline">Use the <strong>100% Full Desktop View</strong> button above to preview the entire website full-screen.</span>
            </p>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
              <div className="space-y-1">
                <label className="font-extrabold text-slate-500 block">Topic Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#FF6B00] transition-colors"
                />
              </div>

              <DescriptionBulletEditor
                value={description}
                onChange={setDescription}
              />

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 mt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="bg-transparent hover:bg-slate-100 border border-slate-200 text-slate-500 font-bold px-4 py-2.5 rounded-[8px] transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#232F3E] hover:bg-slate-800 text-white font-bold px-5 py-2.5 rounded-[8px] shadow-lg transition-all disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>

          {/* Side-by-Side Desktop View Preview Column (DESKTOP & LAPTOP ONLY - Hidden on Phone UI) */}
          {showPreview && (
            <div className="hidden md:flex md:col-span-7 w-full flex-col gap-3 min-w-0">
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 font-heading flex items-center gap-1.5">
                  <Icons.Layout className="w-3.5 h-3.5 text-[#FF9900]" />
                  Desktop View (/learn page)
                </span>
                <button
                  type="button"
                  onClick={() => setIsFullScreenPreview(true)}
                  className="inline-flex items-center gap-1 text-[9px] font-extrabold text-[#FF9900] bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full uppercase tracking-wider font-heading hover:bg-amber-100 cursor-pointer"
                >
                  <Icons.Maximize2 className="w-2.5 h-2.5" />
                  Expand 100% Fullscreen
                </button>
              </div>

              {/* Simulated Desktop Container */}
              <div className="relative w-full rounded-2xl bg-gradient-to-b from-[#bae6fd] via-[#e0f2fe] to-[#e0f2fe] p-4 sm:p-5 border border-sky-200/60 shadow-inner overflow-hidden min-h-[440px] flex flex-col justify-between select-none">
                <SkyBackground />

                <div className="relative z-10 flex flex-col gap-4 w-full">
                  {/* Top Header */}
                  <div className="w-full bg-white/40 backdrop-blur-md border border-white/40 rounded-xl p-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-white/90 border border-slate-200 flex items-center justify-center text-slate-600 flex-shrink-0">
                        <Icons.ChevronLeft className="w-4 h-4 stroke-[2.5]" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block font-heading">
                          CONTINUE YOUR JOURNEY
                        </span>
                        <span className="text-xs font-black text-slate-900 block leading-tight font-heading truncate">
                          Current Mission: {name.trim() || 'Untitled Topic'}
                        </span>
                      </div>
                    </div>

                    <div className="bg-[#0284c7]/10 border border-[#0284c7]/20 rounded-lg px-2 py-1 flex items-center gap-1.5 flex-shrink-0">
                      <Icons.CheckCircle2 className="w-3.5 h-3.5 text-[#0284c7]" />
                      <span className="text-[10px] font-bold text-slate-900">{topicNumber} / 8 Topics</span>
                    </div>
                  </div>

                  {/* 2 Columns Preview */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start w-full">
                    {/* Left Column (5 cols) */}
                    <div className="md:col-span-5 flex flex-col gap-2">
                      <div className="w-full bg-white/15 border border-white/25 rounded-xl p-2.5 flex items-center justify-between border-l-4 border-l-emerald-500 opacity-75">
                        <span className="text-[11px] font-bold text-slate-800 truncate">1. Cloud Foundations</span>
                        <span className="text-[8px] font-bold text-emerald-600">Done</span>
                      </div>

                      <div className="w-full bg-white/30 border border-white/40 rounded-xl p-3 flex flex-col gap-1.5 shadow-md border-l-4 border-l-[#FF9900]">
                        <span className="text-[8px] font-black uppercase text-[#FF9900]">Current Focus</span>
                        <h4 className="text-xs font-black text-slate-900 font-heading leading-tight truncate">
                          {topicNumber}. {name.trim() || 'Untitled Topic'}
                        </h4>
                        <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden mt-1">
                          <div className="bg-[#FF9900] h-full w-[60%]" />
                        </div>
                      </div>
                    </div>

                    {/* Right Column (7 cols) */}
                    <div className="md:col-span-7 flex flex-col gap-2 min-w-0">
                      <div className="w-full backdrop-blur-[20px] bg-white/[0.15] border border-white/25 shadow-md rounded-xl p-4 flex flex-col gap-3 text-left">
                        <div className="flex items-center gap-2.5 w-full min-w-0">
                          <div className="p-2 rounded-lg flex items-center justify-center border bg-[#FF9900]/10 border-[#FF9900]/20 text-[#FF9900] flex-shrink-0">
                            <FlippingBook className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-[8px] font-extrabold uppercase text-slate-400 font-heading block">
                              Current Topic Focus
                            </span>
                            <h3 className="text-xs sm:text-sm font-black text-slate-900 leading-tight font-heading mt-0.5 truncate">
                              {name.trim() || 'Untitled Topic'}
                            </h3>
                          </div>
                        </div>

                        <div className="border-t border-slate-200/50 pt-2 flex flex-col gap-2 w-full min-w-0">
                          <span className="text-[8px] font-bold uppercase text-slate-400 font-heading block">
                            Description
                          </span>

                          {bullets.length > 0 ? (
                            <ul className="list-none pl-0 flex flex-col gap-1.5 w-full min-w-0 max-h-[160px] overflow-y-auto custom-scrollbar">
                              {bullets.map((item, index) => (
                                <li key={index} className="flex items-start gap-2 w-full min-w-0">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF9900] flex-shrink-0 mt-1" />
                                  <span className="text-[11px] text-slate-700 leading-relaxed font-semibold break-words flex-1 min-w-0">
                                    {item}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-[10px] text-slate-400 italic">No description bullet points added.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Metrics Bar */}
                <div className="relative z-10 mt-3 bg-white/70 backdrop-blur-md border border-white/60 rounded-xl px-3 py-1 flex items-center justify-between text-[10px] font-bold text-slate-600 font-heading">
                  <span>Occupancy Stats:</span>
                  <span className="text-slate-800">{bullets.length} Bullets • {wordCount} Words</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
