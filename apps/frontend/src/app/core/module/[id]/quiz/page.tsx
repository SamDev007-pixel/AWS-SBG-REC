'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { modulesService, questionsService, mapBackendQuestionToFrontend, mapFrontendQuestionToBackend } from '@/services/roadmap.api';
import { ApiError } from '@/services/roadmap.apiClient';
import { authService } from '@/services/auth.service';
import * as Icons from 'lucide-react';
import { cn } from '@/lib/utils';
import ConfirmDeleteModal from '@/components/Core/ConfirmDeleteModal';
import { showToast } from '@/components/Core/Toast';
import { AnimatePresence } from 'framer-motion';
import MobileEditorHeader from '@/components/Core/Mobile/MobileEditorHeader';
import MobileQuestionList from '@/components/Core/QuizEditor/MobileQuestionList';
import MobileQuestionEditor from '@/components/Core/QuizEditor/MobileQuestionEditor';
import MobileQuestionPreview from '@/components/Core/QuizEditor/MobileQuestionPreview';

const tierToLevel = (tier: string): 'Beginner' | 'Intermediate' | 'Advanced' => {
  const map: Record<string, 'Beginner' | 'Intermediate' | 'Advanced'> = {
    Fundamentals: 'Beginner',
    Associate: 'Intermediate',
    Professional: 'Advanced',
  };
  return map[tier] || 'Beginner';
};

export default function QuizEditorPage() {
  const params = useParams();
  const router = useRouter();
  const moduleId = params.id as string;

  const [module, setModule] = useState<{ id: string; name: string; level: string; dbId: string; topicId: string | null } | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'failed'>('idle');
  const [isDeleteQuestionModalOpen, setIsDeleteQuestionModalOpen] = useState(false);
  const [pendingDeleteQuestionIdx, setPendingDeleteQuestionIdx] = useState<number | null>(null);
  const [mobileView, setMobileView] = useState<'list' | 'edit' | 'preview'>('list');

  // Student simulation quiz preview states
  const [simSelectedIdx, setSimSelectedIdx] = useState<number | null>(null);
  const [simRevealed, setSimRevealed] = useState(false);

  // References for debounced save
  const isDirtyRef = useRef(false);
  const questionsRef = useRef<any[]>([]);
  const dbIdRef = useRef<string | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const saveVersionRef = useRef(0);

  // Synchronize state with refs
  useEffect(() => {
    questionsRef.current = questions;
  }, [questions]);

  useEffect(() => {
    if (module) {
      dbIdRef.current = module.dbId;
    } else {
      dbIdRef.current = null;
    }
  }, [module]);

  // Reset simulation when active question changes
  useEffect(() => {
    setSimSelectedIdx(null);
    setSimRevealed(false);
  }, [activeQuestionIdx]);

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
    const loadModuleAndQuestions = async () => {
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

        // Runtime Contract Guard for Questions
        if (!Array.isArray(res.questions)) {
          throw new Error('API Contract Mismatch: Questions data is missing or not an array.');
        }
        
        for (const q of res.questions) {
          const missing = [];
          if (q.question === undefined || q.question === null) missing.push('question');
          if (q.optionA === undefined || q.optionA === null) missing.push('optionA');
          if (q.optionB === undefined || q.optionB === null) missing.push('optionB');
          if (q.optionC === undefined || q.optionC === null) missing.push('optionC');
          if (q.optionD === undefined || q.optionD === null) missing.push('optionD');
          if (q.explanation === undefined || q.explanation === null) missing.push('explanation');
          if (q.orderIndex === undefined || q.orderIndex === null) missing.push('orderIndex');
          if (missing.length > 0) {
            throw new Error(`API Contract Mismatch: Question is missing required fields: ${missing.join(', ')}`);
          }
        }

        setModule({
          id: res.slug,
          name: res.name,
          level: tierToLevel(res.tier),
          dbId: res.id,
          topicId: res.topicId ?? null,
        });

        // Map backend questions to frontend questions structure using the adapter in api.ts
        const mappedQuestions = res.questions.map((q) => mapBackendQuestionToFrontend(q));
        
        setQuestions(mappedQuestions);
        setError(null);
      } catch (err: any) {
        console.error('Failed to load questions:', err);
        setError(err.message || 'An error occurred loading quiz questions.');
      } finally {
        setLoading(false);
      }
    };

    loadModuleAndQuestions();
  }, [moduleId]);

  const flushQuestions = async (): Promise<void> => {
    if (!isDirtyRef.current || !dbIdRef.current) return Promise.resolve();

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = null;
    }

    const version = ++saveVersionRef.current;
    isDirtyRef.current = false;
    setSaveStatus('saving');

    try {
      // Map questions to backend shape, generating orderIndex = array index
      const mapped = questionsRef.current.map((q, index) => {
        const backendQ = mapFrontendQuestionToBackend(q);
        backendQ.orderIndex = index;
        return backendQ;
      });

      await questionsService.syncQuestions(dbIdRef.current, mapped);

      if (version === saveVersionRef.current) {
        setSaveStatus('saved');
      }
    } catch (err: any) {
      console.error('Failed to sync questions:', err);
      if (version === saveVersionRef.current) {
        setSaveStatus('failed');
        isDirtyRef.current = true;
      }
      handleApiError(err);
      throw err;
    }
  };

  const updateQuestionsLocally = (updatedQuestions: any[]) => {
    setQuestions(updatedQuestions);
    isDirtyRef.current = true;
    setSaveStatus('idle');

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    debounceTimeoutRef.current = setTimeout(() => {
      flushQuestions().catch(console.error);
    }, 1000);
  };

  const activeQuestion = questions[activeQuestionIdx] || questions[0] || null;

  // Add Question
  const handleAddQuestion = async () => {
    try {
      await flushQuestions();
      const newQuestion = {
        question: 'New Question Scenario',
        options: ['Option A Choice', 'Option B Choice', 'Option C Choice', 'Option D Choice'],
        answerIndex: 0,
        explanation: 'Detailed concept explanation of why Option A is correct.'
      };
      const updated = [...questions, newQuestion];

      isDirtyRef.current = true;
      setQuestions(updated);
      questionsRef.current = updated;
      await flushQuestions();

      setActiveQuestionIdx(updated.length - 1);
      showToast('Question created successfully');
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Question
  const handleDeleteQuestion = async (idx: number) => {
    if (questions.length <= 1) {
      alert("At least one question is required for a module assessment.");
      return;
    }
    setPendingDeleteQuestionIdx(idx);
    setIsDeleteQuestionModalOpen(true);
  };

  const confirmDeleteQuestion = async () => {
    if (pendingDeleteQuestionIdx === null) return;
    try {
      await flushQuestions();
      const updated = questions.filter((_, i) => i !== pendingDeleteQuestionIdx);

      isDirtyRef.current = true;
      setQuestions(updated);
      questionsRef.current = updated;
      await flushQuestions();

      setActiveQuestionIdx(Math.max(0, pendingDeleteQuestionIdx - 1));
    } catch (err) {
      console.error(err);
    }
  };

  // Update Active Question Fields
  const updateActiveQuestion = (fields: Partial<(typeof questions)[0]>) => {
    if (!activeQuestion) return;
    const updated = [...questions];
    updated[activeQuestionIdx] = {
      ...activeQuestion,
      ...fields
    };
    updateQuestionsLocally(updated);
  };

  const updateOptionText = (optIdx: number, val: string) => {
    if (!activeQuestion) return;
    const updatedOptions = [...activeQuestion.options];
    updatedOptions[optIdx] = val;
    updateActiveQuestion({ options: updatedOptions });
  };

  // beforeunload handler to prevent losing unsaved data
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirtyRef.current) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes in quiz settings. Are you sure you want to leave?';
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
        const mapped = questionsRef.current.map((q, index) => {
          const backendQ = mapFrontendQuestionToBackend(q);
          backendQ.orderIndex = index;
          return backendQ;
        });
        questionsService.syncQuestions(dbIdRef.current, mapped).catch(console.error);
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
            Loading module quiz editor...
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
    if (tab === 'slides') {
      router.push(`/core/module/${module.dbId}/content`);
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

      {/* Desktop Experience (Unchanged Layout) */}
      <div className="hidden lg:flex flex-col h-full space-y-6 flex-1 min-h-0">
        {/* Top Navigation Row */}
        <div className="flex items-start justify-between border-b border-slate-200 pb-4 flex-shrink-0 relative">
          <div className="flex items-start gap-3">
            <Link
              href={module?.topicId ? `/core/topics/${module.topicId}/roadmap?selected=${module.id}` : '/core/topics'}
              className="p-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-500 hover:text-slate-950 transition-colors shadow-sm mt-0.5"
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
                <span className="text-[9px] font-extrabold uppercase text-amber-700 tracking-wider bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-md font-heading">
                  {module.level}
                </span>
                <h2 className="text-base font-bold text-slate-900 font-heading tracking-tight leading-tight">
                  {module.name} Quiz Editor
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Create, manage, and validate assessment questions for this learning module.
              </p>
            </div>
          </div>

          {/* Editor tab navigation */}
          <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 flex items-center bg-slate-100/80 rounded-xl p-1 gap-1 border border-slate-200/50">
            <Link
              href={`/core/module/${module.dbId}/content`}
              className="px-4 py-1.5 rounded-lg text-xs font-bold transition-all text-slate-600 hover:text-slate-900 hover:bg-white/60 flex items-center justify-center font-heading"
              onClick={(e) => {
                if (isDirtyRef.current) {
                  const proceed = window.confirm('You have unsaved changes. Are you sure you want to leave?');
                  if (!proceed) e.preventDefault();
                }
              }}
            >
              <Icons.FileText className="w-3.5 h-3.5 mr-1.5" />
              Slides
            </Link>
            <Link
              href={`/core/module/${module.dbId}/quiz`}
              className="px-4 py-1.5 rounded-lg text-xs font-bold transition-all bg-[#232F3E] text-white shadow-2xs flex items-center justify-center font-heading"
            >
              <Icons.HelpCircle className="w-3.5 h-3.5 mr-1.5" />
              Quiz
            </Link>
          </div>
        </div>

        {/* Main split splits */}
        <div className="flex-1 flex gap-6 min-h-0">
          
          {/* Pane 1: QUESTION LIST (25% width) */}
          <div className="w-72 bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col overflow-y-auto flex-shrink-0 gap-4 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block font-heading">
              Assessment Pool ({questions.length})
            </span>

            {/* Scrollable Questions list */}
            <div className="space-y-2 flex-1 overflow-y-auto pr-1 scrollbar-thin">
              {questions.map((q, idx) => (
                <div
                  key={idx}
                  onClick={() => setActiveQuestionIdx(idx)}
                  className={cn(
                    "p-3 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col gap-1.5 relative group shadow-2xs",
                    activeQuestionIdx === idx
                      ? "bg-amber-50/60 border border-[#FF9900]/60 shadow-2xs"
                      : "bg-slate-50/50 border-slate-200/80 hover:bg-slate-50 hover:border-slate-300"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className={cn(
                      "text-[9px] font-bold uppercase font-heading px-1.5 py-0.5 rounded-md border",
                      activeQuestionIdx === idx
                        ? "bg-amber-50 text-amber-700 border-amber-200/80"
                        : "bg-slate-100 text-slate-400 border-slate-200/60"
                    )}>
                      Q{String(idx + 1).padStart(2, '0')}
                    </span>
                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteQuestion(idx);
                        }}
                        className="p-1 rounded-lg bg-white hover:bg-rose-50 border border-slate-200/80 hover:border-rose-200 text-slate-500 hover:text-rose-600 transition-colors"
                        title="Delete"
                      >
                        <Icons.Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <span className={cn(
                    "text-xs line-clamp-2 leading-relaxed font-heading transition-colors",
                    activeQuestionIdx === idx ? "font-semibold text-slate-800" : "font-medium text-slate-600"
                  )}>
                    {q.question || 'Untitled Question'}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={handleAddQuestion}
              className="w-full mt-4 bg-slate-50 hover:bg-amber-50 text-slate-700 hover:text-amber-700 border border-slate-200/80 hover:border-amber-300 text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer font-heading flex-shrink-0"
            >
              <Icons.Plus className="w-4 h-4" />
              Add Question
            </button>
          </div>

          {/* Pane 2: QUESTION EDITOR (40% width) */}
          {activeQuestion ? (
            <div className="flex-1 bg-white border border-slate-200/80 rounded-2xl p-6 overflow-y-auto flex flex-col gap-5 shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-heading">
                  Question Configuration
                </span>
                <div className="flex items-center gap-1.5 font-heading">
                  {saveStatus === 'saving' && <span className="text-[9px] text-[#FF9900] font-bold animate-pulse lowercase tracking-normal">(saving...)</span>}
                  {saveStatus === 'saved' && <span className="text-[9px] text-emerald-600 font-bold lowercase tracking-normal">(saved)</span>}
                  {saveStatus === 'failed' && <span className="text-[9px] text-rose-500 font-bold lowercase tracking-normal">(failed to save)</span>}
                </div>
              </div>

              {/* Question description */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 text-xs block font-heading uppercase tracking-wider">Question Scenario</label>
                <textarea
                  rows={3}
                  value={activeQuestion.question}
                  onChange={(e) => updateActiveQuestion({ question: e.target.value })}
                  className="w-full bg-slate-50/50 hover:bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-medium placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF9900]/15 focus:border-[#FF9900] transition-all shadow-2xs resize-none leading-relaxed"
                />
              </div>

              {/* Options list A B C D */}
              <div className="space-y-2">
                <label className="font-bold text-slate-700 text-xs block font-heading uppercase tracking-wider">Options & Correct Answer</label>
                
                <div className="space-y-2.5 text-xs">
                  {['A', 'B', 'C', 'D'].map((letter, optIdx) => {
                    const isCorrect = activeQuestion.answerIndex === optIdx;
                    return (
                      <div key={optIdx} className="flex items-center gap-2.5">
                        
                        {/* Check radio indicator */}
                        <button
                          type="button"
                          onClick={() => updateActiveQuestion({ answerIndex: optIdx })}
                          className={cn(
                            "w-7 h-7 rounded-full flex items-center justify-center font-bold transition-all border flex-shrink-0 text-xs font-heading cursor-pointer shadow-2xs",
                            isCorrect
                              ? "bg-emerald-500 border-emerald-600 text-white shadow-xs"
                              : "bg-slate-50/50 border-slate-200/80 text-slate-500 hover:border-slate-300 hover:bg-slate-50"
                          )}
                        >
                          {letter}
                        </button>
   
                        {/* Text Input */}
                        <input
                          type="text"
                          value={activeQuestion.options[optIdx] || ''}
                          onChange={(e) => updateOptionText(optIdx, e.target.value)}
                          placeholder={`Option ${letter} value`}
                          className={cn(
                            "flex-1 bg-slate-50/50 hover:bg-slate-50 border rounded-xl px-3.5 py-2.5 text-slate-800 transition-all focus:bg-white focus:outline-none text-xs font-medium shadow-2xs",
                            isCorrect ? "border-emerald-500/60 ring-2 ring-emerald-500/15" : "border-slate-200 focus:border-[#FF9900] focus:ring-2 focus:ring-[#FF9900]/15"
                          )}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Explanation field */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 text-xs block font-heading uppercase tracking-wider">Explanation of Correct Answer</label>
                <textarea
                  rows={3}
                  value={activeQuestion.explanation}
                  onChange={(e) => updateActiveQuestion({ explanation: e.target.value })}
                  className="w-full bg-slate-50/50 hover:bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-medium placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF9900]/15 focus:border-[#FF9900] transition-all shadow-2xs resize-none leading-relaxed"
                />
              </div>

            </div>
          ) : (
            <div className="flex-1 bg-white border border-slate-200/80 rounded-2xl p-6 flex items-center justify-center text-slate-400 text-xs shadow-2xs font-heading">
              Select or create a question to configure.
            </div>
          )}

          {/* Pane 3: STUDENT PREVIEW FRAME (35% width) */}
          <div className="w-80 border border-slate-200/80 rounded-2xl overflow-hidden flex flex-col bg-slate-50/50 flex-shrink-0 shadow-2xs">
            <div className="bg-white px-4 py-3 border-b border-slate-200/80 flex items-center gap-2 text-xs font-bold text-slate-700 font-heading">
              <Icons.Smartphone className="w-4 h-4 text-[#FF9900]" />
              INTERACTIVE STUDENT VIEW
            </div>

            <div className="flex-1 p-5 flex flex-col justify-between overflow-y-auto">
              {activeQuestion ? (
                <div className="space-y-4 flex-1 flex flex-col justify-between">
                  
                  {/* Simulating active question slide */}
                  <div className="space-y-4 select-text">
                    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 min-h-[100px] flex items-center shadow-2xs">
                      <p className="text-xs font-bold leading-relaxed text-slate-800 font-heading">
                        {activeQuestion.question}
                      </p>
                    </div>

                    <div className="space-y-2 text-xs">
                      {(activeQuestion.options || []).map((option: string, idx: number) => {
                        const letter = ['A', 'B', 'C', 'D'][idx];
                        const isSimSelected = simSelectedIdx === idx;
                        const isCorrect = activeQuestion.answerIndex === idx;

                        let btnStyle = "bg-white border-slate-200/80 text-slate-700 hover:bg-slate-50 shadow-2xs";
                        if (simRevealed) {
                          if (isCorrect) {
                            btnStyle = "bg-emerald-50 border-emerald-300 text-emerald-800 font-bold shadow-none";
                          } else if (isSimSelected) {
                            btnStyle = "bg-rose-50 border-rose-300 text-rose-800 font-bold shadow-none";
                          }
                        } else if (isSimSelected) {
                          btnStyle = "bg-amber-50/60 border-[#FF9900] text-amber-900 font-bold ring-2 ring-[#FF9900]/15";
                        }

                        return (
                          <button
                            key={idx}
                            disabled={simRevealed}
                            onClick={() => setSimSelectedIdx(idx)}
                            className={cn(
                              "w-full p-3 border rounded-xl flex items-center gap-2.5 text-left font-bold transition-all cursor-pointer font-heading",
                              btnStyle
                            )}
                          >
                            <span className={cn(
                              "w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-bold border flex-shrink-0 font-heading",
                              isSimSelected ? "bg-[#FF9900] text-white border-[#FF9900]" : "bg-slate-100 border-slate-200/80 text-slate-500"
                            )}>
                              {letter}
                            </span>
                            <span className="flex-1 truncate">{option}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Submitting reveals review info */}
                  <div className="space-y-3 pt-4 border-t border-slate-200/80 mt-4 flex-shrink-0">
                    {simRevealed && (
                      <div className={cn(
                        "rounded-xl p-3.5 border text-[11px] leading-relaxed font-medium",
                        simSelectedIdx === activeQuestion.answerIndex
                          ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                          : "bg-rose-50 border-rose-200 text-rose-800"
                      )}>
                        <p className="font-bold flex items-center gap-1.5 mb-1 text-xs font-heading">
                          {simSelectedIdx === activeQuestion.answerIndex ? (
                            <Icons.CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Icons.AlertCircle className="w-4 h-4 text-rose-600" />
                          )}
                          {simSelectedIdx === activeQuestion.answerIndex ? 'Correct Explanation!' : 'Incorrect Choice'}
                        </p>
                        <p className="text-slate-600">{activeQuestion.explanation}</p>
                      </div>
                    )}

                    {!simRevealed ? (
                      <button
                        disabled={simSelectedIdx === null}
                        onClick={() => setSimRevealed(true)}
                        className="w-full bg-[#FF9900] hover:bg-amber-600 disabled:bg-slate-200 disabled:text-slate-400 disabled:pointer-events-none text-white font-bold py-2.5 rounded-xl text-center text-xs transition-all shadow-2xs cursor-pointer font-heading"
                      >
                        Check Answer
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setSimSelectedIdx(null);
                          setSimRevealed(false);
                        }}
                        className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold py-2.5 rounded-xl text-center text-xs transition-all border border-slate-200/80 shadow-2xs cursor-pointer font-heading"
                      >
                        Reset Sim Selection
                      </button>
                    )}
                  </div>

                </div>
              ) : (
                <div className="text-center text-slate-400 text-xs py-8">
                  No active question scenario to simulate.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Experience (Refactored Layout) */}
      <div className="lg:hidden flex flex-col h-full min-h-screen">
        <MobileEditorHeader
          title={`${module.name} Quiz Editor`}
          badge={module.level}
          currentTab="quiz"
          isDirty={isDirtyRef.current}
          onBack={handleMobileBack}
          onTabChange={handleMobileTabChange}
        />
        <div className="flex-1 bg-slate-50">
          {mobileView === 'list' && (
            <MobileQuestionList
              questions={questions}
              onEditQuestion={(idx) => {
                setActiveQuestionIdx(idx);
                setMobileView('edit');
              }}
              onDeleteQuestion={async (idx) => {
                await handleDeleteQuestion(idx);
              }}
              onAddQuestion={async () => {
                await handleAddQuestion();
                setMobileView('edit');
              }}
            />
          )}

          <AnimatePresence mode="wait">
            {mobileView === 'edit' && activeQuestion && (
              <MobileQuestionEditor
                key="editor"
                question={activeQuestion}
                questionIndex={activeQuestionIdx}
                onBack={() => setMobileView('list')}
                onPreview={() => setMobileView('preview')}
                updateActiveQuestion={updateActiveQuestion}
                updateOptionText={updateOptionText}
                saveStatus={saveStatus}
              />
            )}

            {mobileView === 'preview' && activeQuestion && (
              <MobileQuestionPreview
                key="preview"
                question={activeQuestion}
                questionIndex={activeQuestionIdx}
                totalQuestions={questions.length}
                onBack={() => setMobileView('edit')}
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      <ConfirmDeleteModal
        isOpen={isDeleteQuestionModalOpen}
        title="Delete Question"
        entityName={pendingDeleteQuestionIdx !== null ? `Q${pendingDeleteQuestionIdx + 1}` : ''}
        onClose={() => { setIsDeleteQuestionModalOpen(false); setPendingDeleteQuestionIdx(null); }}
        onConfirm={confirmDeleteQuestion}
      />
    </div>
  );
}
