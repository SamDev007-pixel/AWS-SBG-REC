"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Monitor, X } from "lucide-react";

export default function DeviceNoticeTooltip() {
  const [isVisible, setIsVisible] = useState(false);
  const [isMobileOrTablet, setIsMobileOrTablet] = useState(false);
  const [isEnthusiastUser, setIsEnthusiastUser] = useState(false);
  const pathname = usePathname();

  // Exclude Core & Crew routes immediately
  const isCoreOrCrewPath = pathname?.startsWith("/core") || pathname?.startsWith("/crew");

  // Exclude public landing (/), public events (/events), public news (/news), login (/login), signup (/signup)
  const isLandingPage = pathname === "/";
  const isEventsPage = pathname === "/events" || pathname?.startsWith("/events") || pathname?.includes("/events");
  const isNewsPage = pathname === "/news" || pathname?.startsWith("/news") || pathname?.includes("/news");
  const isAuthPage =
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname?.startsWith("/login") ||
    pathname?.startsWith("/signup") ||
    pathname?.includes("/login") ||
    pathname?.includes("/signup");

  const isExcludedPage = isCoreOrCrewPath || isLandingPage || isEventsPage || isNewsPage || isAuthPage;

  const checkDevice = () => {
    if (typeof window === "undefined") return false;
    const isSmallScreen = window.innerWidth < 1024;
    const isTouchUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
    return isSmallScreen || isTouchUserAgent;
  };

  useEffect(() => {
    // Determine user role from localStorage
    try {
      const raw = localStorage.getItem("aws_sgb_rec_user");
      if (raw) {
        const parsed = JSON.parse(raw);
        const role = (parsed?.role ?? "").toLowerCase().trim();
        // Target Cloud Enthusiasts only (not Core, not Crew)
        setIsEnthusiastUser(role !== "core" && role !== "crew");
      } else {
        setIsEnthusiastUser(false);
      }
    } catch {
      setIsEnthusiastUser(false);
    }
  }, [pathname]);

  useEffect(() => {
    const isTouch = checkDevice();
    setIsMobileOrTablet(isTouch);
    if (isTouch && isEnthusiastUser && !isExcludedPage) {
      setIsVisible(true);
    }

    const handleResize = () => {
      const isTouchNow = checkDevice();
      setIsMobileOrTablet(isTouchNow);
      if (!isTouchNow) {
        setIsVisible(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isEnthusiastUser, isExcludedPage]);

  useEffect(() => {
    if (isMobileOrTablet && isEnthusiastUser && !isExcludedPage) {
      setIsVisible(true);
    } else if (isExcludedPage || !isEnthusiastUser) {
      setIsVisible(false);
    }
  }, [pathname, isMobileOrTablet, isEnthusiastUser, isExcludedPage]);

  useEffect(() => {
    if (isVisible && isMobileOrTablet && isEnthusiastUser && !isExcludedPage) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, isMobileOrTablet, isEnthusiastUser, isExcludedPage]);

  if (!isMobileOrTablet || !isEnthusiastUser || isExcludedPage) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.98 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          style={{
            position: "fixed",
            top: "72px",
            right: "16px",
            left: "auto",
            zIndex: 99999,
            pointerEvents: "auto",
          }}
        >
          <div
            style={{
              background: "#FFFFFF",
              border: "1px solid #E2E8F0",
              boxShadow: "0 8px 24px rgba(15, 23, 42, 0.12)",
              borderRadius: "10px",
              padding: "9px 13px",
              color: "#0F172A",
              display: "flex",
              alignItems: "center",
              gap: "9px",
              fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            }}
          >
            <Monitor size={16} style={{ color: "#E68A00", flexShrink: 0 }} />
            <span
              style={{
                fontSize: "12.5px",
                fontWeight: 600,
                color: "#1E293B",
                whiteSpace: "nowrap",
                letterSpacing: "-0.01em",
              }}
            >
              Desktop view recommended for best experience
            </span>
            <button
              onClick={() => setIsVisible(false)}
              aria-label="Close notice"
              style={{
                background: "transparent",
                border: "none",
                color: "#94A3B8",
                width: "20px",
                height: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                padding: 0,
                borderRadius: "4px",
                flexShrink: 0,
                marginLeft: "4px",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#0F172A")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#94A3B8")}
            >
              <X size={13} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
