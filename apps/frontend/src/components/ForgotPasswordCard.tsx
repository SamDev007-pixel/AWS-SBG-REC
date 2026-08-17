"use client";

import React, { useState } from "react";
import {
  Mail,
  ArrowLeft,
  Send
} from "lucide-react";
import { InputField } from "./InputField";
import { cn } from "@/lib/utils";
import Link from "next/link";

export const ForgotPasswordCard = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus(null);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (data.success) {
        // Use the server's message directly — it's crafted to be safe (anti-enumeration)
        setStatus({ type: "success", message: data.message });
      } else {
        setStatus({ type: "error", message: data.message || "Failed to send reset link." });
      }
    } catch {
      setStatus({ type: "error", message: "An error occurred. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative z-10 w-full max-w-[440px] lg:max-w-[460px] bg-white/90 backdrop-blur-md border border-slate-300/80 rounded-2xl p-6 sm:p-8 lg:p-10 shadow-xl shadow-black/25">
      {/* Header with Minimalist Circular Back Button */}
      <div className="flex items-start gap-3.5 mb-6 w-full">
        <Link
          href="/login"
          title="Back to Login"
          className="mt-0.5 w-9 h-9 shrink-0 rounded-full bg-slate-100/90 hover:bg-[#FF9900]/15 text-slate-600 hover:text-[#E47911] border border-slate-200 hover:border-[#FF9900]/40 flex items-center justify-center transition-all duration-200 shadow-xs group"
        >
          <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-0.5" />
        </Link>
        <div className="flex flex-col text-left flex-1 min-w-0">
          <h1 className="text-slate-900 text-2xl sm:text-3xl font-bold tracking-tight mb-1 font-display auth-card-heading">
            Forgot Password?
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm font-normal leading-relaxed">
            No worries, we&apos;ll send you reset instructions.
          </p>
        </div>
      </div>

      {/* Form Section */}
      <form className="w-full space-y-4" onSubmit={handleSubmit}>
        <InputField
          label="Email Address"
          type="email"
          name="email"
          icon={Mail}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {status && (
          <div
            className={cn(
              "p-3 rounded-lg text-[13px] font-semibold text-center border",
              status.type === "success"
                ? "bg-green-50 border-green-200 text-green-700"
                : "bg-red-50 border-red-200 text-red-700"
            )}
          >
            {status.message}
          </div>
        )}

        {/* Primary Button */}
        <button
          disabled={isLoading}
          type="submit"
          className={cn(
            "relative w-full h-11 mt-4 overflow-hidden rounded-lg",
            "bg-[#131A22] hover:bg-slate-900 transition-colors duration-300",
            "text-white font-medium text-[15px] font-display tracking-wide capitalize",
            "shadow-sm",
            "disabled:opacity-50 disabled:cursor-not-allowed group"
          )}
        >
          <div className="relative flex items-center justify-center gap-2">
            {isLoading ? "Sending..." : "Send Instructions"}
            <Send size={16} className={cn("transition-transform", !isLoading && "group-hover:translate-x-1 group-hover:-translate-y-1")} />
          </div>
        </button>
      </form>
    </div>
  );
};
