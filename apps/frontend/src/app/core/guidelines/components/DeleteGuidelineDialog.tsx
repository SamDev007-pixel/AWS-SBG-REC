import React from 'react';

interface DeleteGuidelineDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  guidelineTitle: string;
}

export const DeleteGuidelineDialog: React.FC<DeleteGuidelineDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  guidelineTitle,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 max-w-sm w-full mx-4 relative z-10 animate-in fade-in zoom-in-95 duration-200">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider font-heading">
          Remove Guideline
        </h3>
        <p className="text-xs text-slate-500 mt-2 font-medium leading-relaxed">
          Are you sure you want to remove the guideline <span className="font-bold text-slate-800">"{guidelineTitle}"</span>? This will hide the rule from all learners on the platform.
        </p>
        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-3.5 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50 rounded-xl transition-colors border border-slate-200"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-3.5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm transition-colors"
          >
            Remove Rule
          </button>
        </div>
      </div>
    </div>
  );
};
