"use client";

import React, { useState } from "react";
import {
  User,
  Mail,
  Lock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Circle
} from "lucide-react";
import { InputField } from "./InputField";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { clearSessionCache } from "./AuthWrapper";

export const SignupCard = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const validations = {
    length: formData.password.length >= 8,
    uppercase: /[A-Z]/.test(formData.password),
    number: /[0-9]/.test(formData.password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password),
  };

  const passwordsMatch = formData.confirmPassword
    ? formData.password === formData.confirmPassword
    : null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if all validations are met
    const allValid = Object.values(validations).every(v => v === true);
    if (!allValid || !passwordsMatch) {
      setStatus({ type: "error", message: "Please ensure all requirements are met and passwords match." });
      return;
    }

    // Domain validation
    if (!formData.email.toLowerCase().trim().endsWith("@rajalakshmi.edu.in")) {
      setStatus({ type: "error", message: "Only @rajalakshmi.edu.in email addresses are permitted to register." });
      return;
    }

    setIsLoading(true);
    setStatus(null);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();
      if (data.success) {
        // All new signups default to 'enthusiasts' role
        localStorage.setItem("aws_sgb_rec_user", JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          role: 'enthusiasts',
        }));
        // Bust the module-level session cache so AuthWrapper picks up the new role immediately
        clearSessionCache();

        // Perform a background login to secure a NestJS JWT accessToken for the session
        try {
          const loginRes = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: formData.email, password: formData.password }),
          });
          if (loginRes.ok) {
            const loginData = await loginRes.json();
            if (loginData.success && loginData.user.accessToken) {
              localStorage.setItem("accessToken", loginData.user.accessToken);
            }
          }
        } catch (err) {
          console.error("Background login after registration failed:", err);
        }

        setStatus({ type: "success", message: "Account created successfully! Redirecting..." });
        setTimeout(() => {
          router.push("/events");
        }, 2000);
      } else {
        setStatus({ type: "error", message: data.message || "Failed to create account." });
      }
    } catch {
      setStatus({ type: "error", message: "An unexpected error occurred." });
    } finally {
      setIsLoading(false);
    }
  };

  const validationItems = [
    { key: "length", label: "Minimum 8 Characters" },
    { key: "uppercase", label: "One Uppercase Letter" },
    { key: "number", label: "One Number" },
    { key: "special", label: "One Special Character" },
  ] as const;

  return (
    <div className="relative z-10 w-full max-w-[440px] lg:max-w-[460px] bg-white/90 backdrop-blur-md border border-slate-300/80 rounded-2xl p-6 sm:p-8 lg:p-10 shadow-xl shadow-black/25">
      {/* Header with Minimalist Circular Back Button */}
      <div className="flex items-start gap-3.5 mb-6 w-full">
        <Link
          href="/"
          title="Back to Home"
          className="mt-0.5 w-9 h-9 shrink-0 rounded-full bg-slate-100/90 hover:bg-[#FF9900]/15 text-slate-600 hover:text-[#E47911] border border-slate-200 hover:border-[#FF9900]/40 flex items-center justify-center transition-all duration-200 shadow-xs group"
        >
          <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-0.5" />
        </Link>
        <div className="flex flex-col text-left flex-1 min-w-0">
          <h1 className="text-slate-900 text-2xl sm:text-3xl font-bold tracking-tight mb-1 font-display auth-card-heading">
            Create Your Account
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm font-normal leading-relaxed">
            Join the community of cloud innovators.
          </p>
        </div>
      </div>

      {/* Form Section */}
      <form className="w-full space-y-3.5 sm:space-y-4" onSubmit={handleSubmit}>
        <InputField
          label="Full Name"
          type="text"
          name="fullName"
          icon={User}
          value={formData.fullName}
          onChange={handleChange}
          required
        />

        <InputField
          label="Email Address"
          type="email"
          name="email"
          icon={Mail}
          value={formData.email}
          onChange={handleChange}
          required
        />

        <div className="space-y-3">
          <InputField
            label="Password"
            type="password"
            name="password"
            icon={Lock}
            value={formData.password}
            onChange={handleChange}
            required
          />

          {/* Validation Checklist */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            {validationItems.map((item) => {
              const isValid = validations[item.key as keyof typeof validations];
              return (
                <div key={item.key} className="flex items-center gap-2">
                  <div>
                    {isValid ? (
                      <CheckCircle2 size={12} className="text-green-500" />
                    ) : (
                      <Circle size={12} className="text-aws-slate/30" />
                    )}
                  </div>
                  <span className={cn(
                    "text-[9px] font-semibold uppercase tracking-wider transition-colors duration-300",
                    isValid ? "text-green-600" : "text-slate-500"
                  )}>
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <InputField
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            icon={Lock}
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            error={passwordsMatch === false}
          />

          {passwordsMatch !== null && (
            <div>
              <p className={cn(
                "text-[10px] font-semibold",
                passwordsMatch ? "text-green-600" : "text-red-500"
              )}>
                {passwordsMatch ? "✓ Passwords Match" : "⚠ Passwords do not match"}
              </p>
            </div>
          )}
        </div>

        {status && (
          <div
            className={cn(
              "p-3 rounded-lg text-[11px] font-semibold text-center border",
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
            {isLoading ? "Creating Account..." : "Create Account"}
            <ArrowRight size={16} className={cn("transition-transform", !isLoading && "group-hover:translate-x-1")} />
          </div>
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-slate-500 text-sm font-normal">
          Already have an account?{" "}
          <Link href="/login" className="text-[#E47911] hover:underline font-semibold transition-colors">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};
