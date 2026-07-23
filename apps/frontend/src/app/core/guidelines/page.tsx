'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Plus, Eye, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SkyBackground } from '@/components/Roadmap/SkyBackground';
import { LearningGuidePanel } from '@/components/Learn/LearningGuidePanel';
import { LearningGuideline } from '@/types/guideline.types';
import { useLearningGuidelines } from './hooks/useLearningGuidelines';
import { GuidelineStats } from './components/GuidelineStats';
import { GuidelineFilters } from './components/GuidelineFilters';
import { GuidelineTable } from './components/GuidelineTable';
import { GuidelineEditorDrawer } from './components/GuidelineEditorDrawer';
import { DeleteGuidelineDialog } from './components/DeleteGuidelineDialog';
import { GuidelineSettingsCard } from './components/GuidelineSettingsCard';
import { GuidelineIcon } from '@/types/guideline.types';
import RoadmapNavHeader from '@/components/Core/RoadmapNavHeader';

export default function LearningGuidelinesCMSPage() {
  const {
    guidelines,
    settings,
    loading,
    loadingSettings,
    createGuideline,
    updateGuideline,
    deleteGuideline,
    reorderGuidelines,
    updateSettings,
  } = useLearningGuidelines();

  // CMS state variables
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Draft settings state for live preview sync
  const [draftSettings, setDraftSettings] = useState({
    headerIcon: 'LIGHTBULB' as GuidelineIcon,
    headerTitle: 'GUIDELINES',
    headerDescription: 'Platform learning rules and progression guidelines',
  });

  const [synced, setSynced] = useState(false);
  if (settings && !synced) {
    setDraftSettings({
      headerIcon: settings.headerIcon,
      headerTitle: settings.headerTitle,
      headerDescription: settings.headerDescription,
    });
    setSynced(true);
  }

  // Drawer & dialog states
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeGuideline, setActiveGuideline] = useState<LearningGuideline | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<LearningGuideline | null>(null);

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // 1. Client-Side Filtering
  const filteredGuidelines = useMemo(() => {
    return guidelines.filter((g) => {
      // Text search match
      const titleMatch = g.title.toLowerCase().includes(searchQuery.toLowerCase());
      const descMatch = (g.description || '').toLowerCase().includes(searchQuery.toLowerCase());
      const textMatch = titleMatch || descMatch;

      // Status match
      let statusMatch = true;
      if (statusFilter === 'ACTIVE') statusMatch = g.isActive;
      else if (statusFilter === 'HIDDEN') statusMatch = !g.isActive;
      else if (statusFilter === 'PROMINENT') statusMatch = g.prominent;

      return textMatch && statusMatch;
    });
  }, [guidelines, searchQuery, statusFilter]);

  // 2. Add/Edit operations
  const handleAddNew = () => {
    setActiveGuideline(null);
    setIsDrawerOpen(true);
  };

  const handleEdit = (guideline: LearningGuideline) => {
    setActiveGuideline(guideline);
    setIsDrawerOpen(true);
  };

  const handleSave = async (formData: any) => {
    if (activeGuideline) {
      await updateGuideline(activeGuideline.id, formData);
    } else {
      await createGuideline(formData);
    }
  };

  // 3. Delete operation
  const handleDeleteTrigger = (guideline: LearningGuideline) => {
    setDeleteTarget(guideline);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (deleteTarget) {
      await deleteGuideline(deleteTarget.id);
      setIsDeleteDialogOpen(false);
      setDeleteTarget(null);
    }
  };

  // 4. Reorder operation (button shifts)
  const handleMove = async (id: string, direction: 'up' | 'down') => {
    const currentIndex = guidelines.findIndex((g) => g.id === id);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= guidelines.length) return;

    // Swap guidelines in list array copy
    const reorderedList = [...guidelines];
    const temp = reorderedList[currentIndex];
    reorderedList[currentIndex] = reorderedList[newIndex];
    reorderedList[newIndex] = temp;

    // Send updated list of IDs to backend reordering endpoint
    const ids = reorderedList.map((g) => g.id);
    await reorderGuidelines(ids);
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 text-slate-800 overflow-hidden font-sans">
      <RoadmapNavHeader
        activeTab="guidelines"
        desktopRightAction={
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <button
              onClick={() => setIsPreviewOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl shadow-sm transition-all font-heading uppercase tracking-wider cursor-pointer"
            >
              <Eye className="w-4 h-4" /> Preview Modal
            </button>
            <button
              onClick={handleAddNew}
              className="flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-sm hover:shadow transition-all font-heading uppercase tracking-wider cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Guideline
            </button>
          </div>
        }
        mobileRightAction={null}
      />

      {/* Mobile action bar below header */}
      <div className="flex sm:hidden items-center justify-between gap-3 px-4 py-3 bg-white border-b border-slate-200 flex-shrink-0 select-none">
        <button
          onClick={() => setIsPreviewOpen(true)}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl shadow-sm transition-all font-heading uppercase tracking-wider cursor-pointer"
        >
          <Eye className="w-4 h-4" /> Preview Modal
        </button>
        <button
          onClick={handleAddNew}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-sm hover:shadow transition-all font-heading uppercase tracking-wider cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Guideline
        </button>
      </div>

      {/* Main body scroll area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Stats segment */}
        <GuidelineStats guidelines={guidelines} />

        {/* Settings card segment */}
        <GuidelineSettingsCard
          settings={settings}
          onSave={updateSettings}
          onChange={setDraftSettings}
          isSaving={loadingSettings}
        />

        {/* Filter segment */}
        <GuidelineFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
        />

        {/* Table segment */}
        {loading && guidelines.length === 0 ? (
          <div className="flex-1 min-h-[200px] flex flex-col items-center justify-center text-slate-450 gap-2.5">
            <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-sky-500 animate-spin" />
            <span className="text-xs font-semibold font-heading">Loading guidelines...</span>
          </div>
        ) : (
          <GuidelineTable
            guidelines={filteredGuidelines}
            onEdit={handleEdit}
            onDelete={handleDeleteTrigger}
            onMove={handleMove}
          />
        )}
      </div>

      {/* Editor slide drawer */}
      <GuidelineEditorDrawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setActiveGuideline(null);
        }}
        onSave={handleSave}
        guideline={activeGuideline}
      />

      {/* Delete Confirmation */}
      <DeleteGuidelineDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setDeleteTarget(null);
        }}
        onConfirm={handleDeleteConfirm}
        guidelineTitle={deleteTarget?.title || ''}
      />

      {/* Learner Guidelines Modal Preview */}
      <AnimatePresence>
        {isPreviewOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
              onClick={() => setIsPreviewOpen(false)}
            />
            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-md max-h-[85vh] overflow-y-auto rounded-2xl bg-gradient-to-b from-[#bae6fd] via-[#e0f2fe] to-[#e0f2fe] shadow-2xl border border-sky-200/50 overflow-hidden z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <SkyBackground />

              <button
                onClick={() => setIsPreviewOpen(false)}
                className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-white/80 hover:bg-white flex items-center justify-center transition-colors border border-sky-100/50 shadow-sm cursor-pointer"
              >
                <X className="w-4 h-4 text-slate-650" />
              </button>
              <div className="p-5 relative z-10">
                <LearningGuidePanel
                  previewHeaderIcon={draftSettings.headerIcon}
                  previewHeaderTitle={draftSettings.headerTitle}
                  previewHeaderDescription={draftSettings.headerDescription}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
