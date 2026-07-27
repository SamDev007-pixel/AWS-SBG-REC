import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  className?: string;
  text?: string;
}

export function LoadingSpinner({ className, text }: LoadingSpinnerProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12",
        className
      )}
    >
      <div className="w-9 h-9 rounded-full border-2 border-amber-200 border-t-[#FF9900] animate-spin shadow-2xs" />
      {text && (
        <p className="mt-3 text-xs text-slate-600 font-bold uppercase tracking-wider font-heading animate-pulse">{text}</p>
      )}
    </div>
  );
}
