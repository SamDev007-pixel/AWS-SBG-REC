import React, { useState, useEffect, useRef } from 'react';
import { X, Calendar } from 'lucide-react';
import { LearningGuideline, GuidelineIcon, GuidelineThemeColor } from '@/types/guideline.types';
import { GUIDELINE_COLORS_LIST, GUIDELINE_ICONS_LIST } from '@/constants/guideline.constants';
import { renderGuidelineIcon } from '@/utils/guidelineIcons';
import { validateGuideline, ValidationErrors } from '@/utils/guidelineValidation';
import { GuidelinePreviewCard } from './GuidelinePreviewCard';
import { UnsavedChangesDialog } from './UnsavedChangesDialog';

interface GuidelineEditorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  guideline: LearningGuideline | null;
}

export const GuidelineEditorDrawer: React.FC<GuidelineEditorDrawerProps> = ({
  isOpen,
  onClose,
  onSave,
  guideline,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState<GuidelineIcon>('STEP_FUNCTIONS');
  const [prominent, setProminent] = useState(false);
  const [prominentColor, setProminentColor] = useState<GuidelineThemeColor>('SKY');
  const [isActive, setIsActive] = useState(true);

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);

  // Reference values to check if the form is dirty
  const initialValuesRef = useRef({
    title: '',
    description: '',
    icon: 'STEP_FUNCTIONS' as GuidelineIcon,
    prominent: false,
    prominentColor: 'SKY' as GuidelineThemeColor,
    isActive: true,
  });

  useEffect(() => {
    if (isOpen) {
      const vals = {
        title: guideline?.title || '',
        description: guideline?.description || '',
        icon: guideline?.icon || 'STEP_FUNCTIONS',
        prominent: guideline?.prominent || false,
        prominentColor: guideline?.prominentColor || 'SKY',
        isActive: guideline?.isActive !== undefined ? guideline.isActive : true,
      };

      setTitle(vals.title);
      setDescription(vals.description);
      setIcon(vals.icon);
      setProminent(vals.prominent);
      setProminentColor(vals.prominentColor);
      setIsActive(vals.isActive);
      setErrors({});
      initialValuesRef.current = vals;
    }
  }, [guideline, isOpen]);

  if (!isOpen) return null;

  const isDirty =
    title !== initialValuesRef.current.title ||
    description !== initialValuesRef.current.description ||
    icon !== initialValuesRef.current.icon ||
    prominent !== initialValuesRef.current.prominent ||
    prominentColor !== initialValuesRef.current.prominentColor ||
    isActive !== initialValuesRef.current.isActive;

  const handleCloseAttempt = () => {
    if (isDirty) {
      setShowUnsavedDialog(true);
    } else {
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      title,
      description: description.trim() || undefined,
      icon,
      prominent,
      prominentColor: prominent ? prominentColor : undefined,
      isActive,
    };

    const validationErrors = validateGuideline(data);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave(data);
      onClose();
    } catch {
      // Errors are handled inside hook and shown via Toasts
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleString();
    } catch {
      return dateStr;
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-40 flex justify-end">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-[2px]" onClick={handleCloseAttempt} />

        {/* Drawer container */}
        <div className="relative w-full max-w-md h-full bg-white border-l border-slate-200 flex flex-col shadow-2xl z-10 animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-100 relative flex items-center justify-center lg:justify-between bg-slate-50/50">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-widest font-heading text-center lg:text-left pr-8 lg:pr-0">
              {guideline ? 'Edit Learning Guideline' : 'Create Learning Guideline'}
            </h2>
            <button
              onClick={handleCloseAttempt}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form Scroll Area */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
            {/* Title field */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-heading">
                Guideline Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
                }}
                className={`block w-full border text-xs px-3.5 py-2.5 rounded-xl bg-slate-50/30 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 ${
                  errors.title
                    ? 'border-rose-400 focus:ring-rose-500 focus:border-rose-500'
                    : 'border-slate-200 focus:ring-sky-500 focus:border-sky-500'
                }`}
                placeholder="e.g. Complete modules in sequence."
              />
              {errors.title && <p className="text-[10px] font-bold text-rose-500 mt-1">{errors.title}</p>}
            </div>

            {/* Description field */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-heading">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (errors.description) setErrors((prev) => ({ ...prev, description: undefined }));
                }}
                rows={3}
                className={`block w-full border text-xs px-3.5 py-2.5 rounded-xl bg-slate-50/30 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 ${
                  errors.description
                    ? 'border-rose-400 focus:ring-rose-500 focus:border-rose-500'
                    : 'border-slate-200 focus:ring-sky-500 focus:border-sky-500'
                }`}
                placeholder="Enter helpful descriptive rules for AWS candidates..."
              />
              {errors.description && <p className="text-[10px] font-bold text-rose-500 mt-1">{errors.description}</p>}
            </div>

            {/* Visibility switches */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-700 font-heading">Active Status</span>
                <span className="text-[10px] text-slate-400 font-medium mt-0.5">Toggle visibility on the learner dashboard</span>
              </div>
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-8 h-4 rounded-full bg-slate-200 text-sky-600 focus:ring-sky-500 border-none cursor-pointer"
              />
            </div>

            {/* Icon Picker Grid */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-heading">
                Select AWS Service Icon <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                {GUIDELINE_ICONS_LIST.filter(ic => ic.value !== 'NONE').map((ic) => {
                  const isSelected = icon === ic.value;
                  return (
                    <button
                      key={ic.value}
                      type="button"
                      onClick={() => setIcon(ic.value)}
                      className={`p-2.5 rounded-xl border flex flex-col items-center justify-center min-w-[76px] min-h-[76px] flex-shrink-0 transition-all ${
                        isSelected
                          ? 'border-sky-500 bg-sky-50/35 text-sky-600 ring-1 ring-sky-500/50 shadow-sm'
                          : 'border-slate-200 bg-slate-50/20 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                      }`}
                      title={ic.label}
                    >
                      <div className="w-9 h-9 flex-shrink-0 flex items-center justify-center text-slate-600">
                        {renderGuidelineIcon(ic.value, 22, 'w-[22px] h-[22px] flex-shrink-0 select-none')}
                      </div>
                      <span className="text-[8px] font-bold tracking-tight text-slate-500 text-center w-full truncate mt-1">
                        {ic.label.split(' ')[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Prominent checkbox */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-heading">
                Highlight Alert?
              </label>
              <div className="flex items-center h-10 border border-slate-200 rounded-xl bg-slate-50/30 px-3.5">
                <input
                  type="checkbox"
                  id="prominent-toggle"
                  checked={prominent}
                  onChange={(e) => setProminent(e.target.checked)}
                  className="w-4 h-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500 cursor-pointer"
                />
                <label htmlFor="prominent-toggle" className="text-xs font-semibold text-slate-700 pl-2 cursor-pointer select-none">
                  Make Prominent
                </label>
              </div>
            </div>

            {/* Prominent color select */}
            {prominent && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-heading">
                  Prominent Highlight Color <span className="text-rose-500">*</span>
                </label>
                <select
                  value={prominentColor}
                  onChange={(e) => {
                    setProminentColor(e.target.value as GuidelineThemeColor);
                    if (errors.prominentColor) setErrors((prev) => ({ ...prev, prominentColor: undefined }));
                  }}
                  className={`block w-full border text-xs px-3 py-2.5 rounded-xl bg-slate-50/30 text-slate-800 focus:outline-none focus:ring-1 ${
                    errors.prominentColor
                      ? 'border-rose-400 focus:ring-rose-500 focus:border-rose-500'
                      : 'border-slate-200 focus:ring-sky-500 focus:border-sky-500'
                  } font-semibold`}
                >
                  {GUIDELINE_COLORS_LIST.map((color) => (
                    <option key={color.value} value={color.value}>
                      {color.label}
                    </option>
                  ))}
                </select>
                {errors.prominentColor && (
                  <p className="text-[10px] font-bold text-rose-500 mt-1">{errors.prominentColor}</p>
                )}
              </div>
            )}

            {/* Preview panel */}
            <div className="pt-2">
              <GuidelinePreviewCard
                title={title}
                description={description}
                icon={icon}
                prominent={prominent}
                prominentColor={prominentColor}
              />
            </div>

            {/* Metadata information */}
            {guideline && (
              <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/40 space-y-1 text-[9px] text-slate-500 font-mono">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Created: {formatDate(guideline.createdAt)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Updated: {formatDate(guideline.updatedAt)}</span>
                </div>
              </div>
            )}
          </form>

          {/* Action buttons */}
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3.5">
            <button
              type="button"
              onClick={handleCloseAttempt}
              className="px-4 py-2.5 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-4 py-2.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 disabled:bg-sky-400 rounded-xl shadow-sm transition-colors"
            >
              {isSubmitting ? 'Saving...' : guideline ? 'Save Changes' : 'Create Guideline'}
            </button>
          </div>
        </div>
      </div>

      {/* Warning confirmation */}
      <UnsavedChangesDialog
        isOpen={showUnsavedDialog}
        onClose={() => setShowUnsavedDialog(false)}
        onDiscard={() => {
          setShowUnsavedDialog(false);
          onClose();
        }}
      />
    </>
  );
};
