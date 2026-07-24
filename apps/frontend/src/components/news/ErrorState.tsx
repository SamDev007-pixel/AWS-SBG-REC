import { RefreshCw, Newspaper } from "lucide-react";
import { memo } from "react";

type ErrorStateProps = {
  title?: string;
  message?: string;
  actionLabel?: string;
  onRetry?: () => void;
};

export const ErrorState = memo(function ErrorState({
  title = "Unable to load news",
  message = "Something interrupted the newsroom feed. Please try again.",
  actionLabel = "Retry",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="mx-auto flex min-h-[380px] w-full max-w-md flex-col items-center justify-center p-6 text-center">
      <div className="w-full flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        
        {/* Minimalist Icon */}
        <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-4 text-slate-400">
          <Newspaper className="h-5 w-5" />
        </div>

        <h3 className="text-base font-bold text-[#232F3E] tracking-tight">
          {title}
        </h3>

        <p className="mt-1.5 max-w-xs text-xs text-slate-500 leading-relaxed">
          {message}
        </p>

        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="mt-5 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2 text-xs font-semibold text-[#232F3E] hover:border-slate-350 transition-all active:scale-95 cursor-pointer shadow-xs select-none group"
          >
            <RefreshCw className="h-3 w-3 text-slate-500 group-hover:rotate-180 transition-transform duration-500 ease-out" />
            <span>{actionLabel}</span>
          </button>
        ) : null}
      </div>
    </div>
  );
});
