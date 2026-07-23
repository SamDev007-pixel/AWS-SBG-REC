import React from 'react';

interface UnsavedChangesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onDiscard: () => void;
}

export const UnsavedChangesDialog: React.FC<UnsavedChangesDialogProps> = ({
  isOpen,
  onClose,
  onDiscard,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 max-w-sm w-full mx-4 relative z-10 animate-in fade-in zoom-in-95 duration-200">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider font-heading">
          Unsaved Changes
        </h3>
        <p className="text-xs text-slate-500 mt-2 font-medium leading-relaxed">
          You have unsaved edits in this guideline. Are you sure you want to discard them?
        </p>
        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-3.5 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50 rounded-xl transition-colors border border-slate-200"
          >
            Keep Editing
          </button>
          <button
            onClick={onDiscard}
            className="px-3.5 py-2 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl shadow-sm transition-colors"
          >
            Discard Changes
          </button>
        </div>
      </div>
    </div>
  );
};
