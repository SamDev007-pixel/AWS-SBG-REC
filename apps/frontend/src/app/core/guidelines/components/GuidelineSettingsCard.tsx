import React, { useState, useEffect } from 'react';
import { Settings, Save, ChevronDown, ChevronUp } from 'lucide-react';
import { GuidelineIcon, GuidelineSettings } from '@/types/guideline.types';
import { GUIDELINE_ICONS_LIST } from '@/constants/guideline.constants';
import { renderGuidelineIcon } from '@/utils/guidelineIcons';

interface GuidelineSettingsCardProps {
  settings: GuidelineSettings | null;
  onSave: (data: { headerIcon: GuidelineIcon; headerTitle: string; headerDescription: string }) => Promise<any>;
  onChange: (data: { headerIcon: GuidelineIcon; headerTitle: string; headerDescription: string }) => void;
  isSaving: boolean;
}

export const GuidelineSettingsCard: React.FC<GuidelineSettingsCardProps> = ({
  settings,
  onSave,
  onChange,
  isSaving,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [headerTitle, setHeaderTitle] = useState('');
  const [headerDescription, setHeaderDescription] = useState('');
  const [headerIcon, setHeaderIcon] = useState<GuidelineIcon>('LIGHTBULB');

  // Initialize and sync when settings are loaded
  useEffect(() => {
    if (settings) {
      setHeaderTitle(settings.headerTitle);
      setHeaderDescription(settings.headerDescription);
      setHeaderIcon(settings.headerIcon);
    }
  }, [settings]);

  // Propagate changes up for real-time live previewing
  const handleFieldChange = (
    titleVal: string,
    descVal: string,
    iconVal: GuidelineIcon
  ) => {
    onChange({
      headerTitle: titleVal,
      headerDescription: descVal,
      headerIcon: iconVal,
    });
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setHeaderTitle(val);
    handleFieldChange(val, headerDescription, headerIcon);
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setHeaderDescription(val);
    handleFieldChange(headerTitle, val, headerIcon);
  };

  const handleIconSelect = (val: GuidelineIcon) => {
    setHeaderIcon(val);
    handleFieldChange(headerTitle, headerDescription, val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!headerTitle.trim()) return;
    await onSave({
      headerIcon,
      headerTitle: headerTitle.trim(),
      headerDescription: headerDescription.trim(),
    });
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
      {/* Accordion Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-slate-50/50 hover:bg-slate-50 transition-colors text-left"
      >
        <div className="flex items-center gap-2.5">
          <Settings className="w-4 h-4 text-slate-500" />
          <div>
            <h3 className="text-xs font-bold text-slate-800 tracking-tight font-heading">
              Learning Guide Header Settings
            </h3>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">
              Customize the icon, title, and descriptive subtitle shown at the top of the learner popup.
            </p>
          </div>
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        )}
      </button>

      {/* Collapsible Content */}
      {isOpen && (
        <form onSubmit={handleSubmit} className="p-5 border-t border-slate-100 bg-white space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Header Title */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-heading">
                Header Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={headerTitle}
                onChange={handleTitleChange}
                placeholder="e.g., GUIDELINES"
                maxLength={80}
                required
                className="block w-full border border-slate-200 hover:border-slate-300 text-xs px-3.5 py-2.5 rounded-lg bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF9900]/15 focus:border-[#FF9900] font-semibold transition-all shadow-2xs"
              />
            </div>

            {/* Header Description */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Header Description
              </label>
              <textarea
                value={headerDescription}
                onChange={handleDescriptionChange}
                placeholder="e.g., Platform learning rules and progression guidelines"
                maxLength={200}
                rows={2}
                className="block w-full border border-slate-200 hover:border-slate-300 text-xs px-3.5 py-2 rounded-lg bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF9900]/15 focus:border-[#FF9900] font-medium transition-all shadow-2xs"
              />
            </div>
          </div>

          {/* Visual Icon Picker */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-heading">
              Select Header Icon
            </label>
            <div className="flex gap-3">
              {GUIDELINE_ICONS_LIST.filter(ic => ic.value === 'LIGHTBULB' || ic.value === 'NONE').map((ic) => {
                const isSelected = headerIcon === ic.value;
                return (
                  <button
                    key={ic.value}
                    type="button"
                    onClick={() => handleIconSelect(ic.value)}
                    className={`px-4 py-2.5 rounded-lg border flex items-center gap-2.5 transition-all ${
                      isSelected
                        ? 'border-[#FF9900] bg-amber-50/50 text-amber-700 font-semibold ring-1 ring-[#FF9900]/30'
                        : 'border-slate-200 bg-slate-50/20 text-slate-600 hover:bg-slate-50'
                    }`}
                    title={ic.label}
                  >
                    <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 text-slate-600">
                      {ic.value === 'NONE' ? (
                        <span className="text-[9px] font-black text-slate-400 font-heading uppercase">None</span>
                      ) : (
                        renderGuidelineIcon(ic.value, 20, 'w-[20px] h-[20px] flex-shrink-0 select-none')
                      )}
                    </div>
                    {ic.value !== 'NONE' && (
                      <span className="text-xs font-bold text-slate-700">
                        {ic.label}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Row */}
          <div className="flex justify-end pt-2 border-t border-slate-100">
            <button
              type="submit"
              disabled={isSaving || !headerTitle.trim()}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-[#232F3E] hover:bg-slate-800 rounded-[8px] transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed font-heading"
            >
              {isSaving ? (
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              Save Settings
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
