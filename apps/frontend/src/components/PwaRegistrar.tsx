"use client";

import React, { useEffect, useState } from "react";
import { Download, X, Share } from "lucide-react";

export default function PwaRegistrar() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check if app is already running in standalone display mode
    const standaloneMode = window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone === true;
    if (standaloneMode) {
      setIsStandalone(true);
      return;
    }

    // Detect iOS
    const ua = window.navigator.userAgent;
    const iosDevice = /iphone|ipad|ipod/i.test(ua);
    setIsIos(iosDevice);

    // 1. Register Service Worker
    if ("serviceWorker" in navigator) {
      const registerSW = () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) => {
            console.log("PWA ServiceWorker registered with scope:", reg.scope);
          })
          .catch((err) => {
            console.error("PWA ServiceWorker registration failed:", err);
          });
      };

      if (document.readyState === "complete") {
        registerSW();
      } else {
        window.addEventListener("load", registerSW);
      }
    }

    // 2. Listen for BeforeInstallPrompt (Chrome/Android/Desktop)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // If on iOS and not standalone, show banner with instructions after 3 seconds
    if (iosDevice && !standaloneMode) {
      const timer = setTimeout(() => setShowBanner(true), 3000);
      return () => {
        window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        clearTimeout(timer);
      };
    }

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

  if (isStandalone || !showBanner) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 z-50 max-w-sm bg-[#232F3E] text-white p-4 rounded-2xl shadow-2xl border border-slate-700 flex flex-col gap-3 animate-[slideUp_0.3s_ease-out]">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <img
            src="/sbg_logo.svg"
            alt="AWS SBG App"
            className="w-8 h-8 rounded-lg object-contain shrink-0 bg-black p-1 border border-slate-700/80"
          />
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-white truncate">Install AWS SBG REC App</h4>
            <p className="text-[11px] text-slate-300 truncate mt-0.5">Fast access & offline tickets</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {deferredPrompt && (
            <button
              onClick={handleInstallClick}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FF9900] hover:bg-[#FFA524] text-slate-900 text-xs font-bold rounded-lg transition cursor-pointer shadow-xs whitespace-nowrap"
            >
              <Download size={13} />
              Install
            </button>
          )}
          <button
            onClick={() => setShowBanner(false)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition cursor-pointer"
            aria-label="Close"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {isIos && !deferredPrompt && (
        <div className="text-[11px] text-slate-300 bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60 flex items-center gap-2">
          <Share size={14} className="text-[#FF9900] shrink-0" />
          <span>Tap the Share button below and select <strong>"Add to Home Screen"</strong></span>
        </div>
      )}
    </div>
  );
}
