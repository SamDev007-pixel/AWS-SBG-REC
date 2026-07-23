"use client";

import React, { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

export default function PwaRegistrar() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // 1. Register Service Worker
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) => {
            console.log("PWA ServiceWorker registered with scope:", reg.scope);
          })
          .catch((err) => {
            console.error("PWA ServiceWorker registration failed:", err);
          });
      });
    }

    // 2. Listen for BeforeInstallPrompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      console.log("User accepted PWA installation prompt");
    }
    setDeferredPrompt(null);
    setShowBanner(false);
  };

  if (!showBanner || !deferredPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 z-50 max-w-sm bg-[#161D27] text-white p-4 rounded-2xl shadow-2xl border border-slate-700/60 flex items-center justify-between gap-3 animate-[slideUp_0.3s_ease-out]">
      <div className="flex items-center gap-3 min-w-0">
        <img
          src="/pwa-192x192.png"
          alt="AWS SBG App"
          className="w-10 h-10 rounded-xl object-contain shrink-0"
        />
        <div className="min-w-0">
          <h4 className="text-xs font-bold text-white truncate">Install AWS SBG REC</h4>
          <p className="text-[11px] text-slate-300 truncate mt-0.5">Quick access & offline tickets</p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={handleInstallClick}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FF9900] hover:bg-[#FFA524] text-slate-900 text-xs font-bold rounded-lg transition cursor-pointer shadow-xs whitespace-nowrap"
        >
          <Download size={13} />
          Install
        </button>
        <button
          onClick={() => setShowBanner(false)}
          className="p-1.5 text-slate-400 hover:text-white rounded-lg transition cursor-pointer"
          aria-label="Close"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
}
