'use client';

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { LogOut, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

export const SIDEBAR_OPEN_W = 240;
export const SIDEBAR_COLLAPSED_W = 68;

export interface NavItem {
  icon: React.ReactNode;
  label: string;
  href: string;
}

export interface SidebarUser {
  name: string;
  initials: string;
  badge?: string;
}

interface SidebarProps {
  isOpen: boolean;
  isMobile: boolean;
  isMobileOpen: boolean;
  onToggle: () => void;
  onMobileClose: () => void;
  currentPath: string;
  onNavigate: (href: string) => void;
  navItems: NavItem[];
  bottomNavItems?: NavItem[];
  user?: SidebarUser;
  homeHref?: string;
  signOutLabel?: string;
  onSignOut?: () => void;
  brandTitle?: string;
  brandSubtitle?: string;
}

export default function Sidebar({
  isOpen,
  isMobile,
  isMobileOpen,
  onToggle,
  onMobileClose,
  currentPath,
  onNavigate,
  navItems,
  bottomNavItems,
  user,
  homeHref = "/",
  signOutLabel = "Sign Out",
  onSignOut,
  brandTitle,
  brandSubtitle,
}: SidebarProps) {
  const [mounted, setMounted] = useState(false);
  const [hoveredTooltip, setHoveredTooltip] = useState<{
    label: string;
    top: number;
  } | null>(null);

  useEffect(() => {
    setMounted(true);
    const handleResize = () => setHoveredTooltip(null);
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    setHoveredTooltip(null);
  }, [isOpen]);

  const handleHover = (label: string, element: HTMLElement) => {
    if (isOpen || isMobile) return;
    const rect = element.getBoundingClientRect();
    setHoveredTooltip({
      label,
      top: rect.top + rect.height / 2,
    });
  };

  const handleLeave = () => {
    setHoveredTooltip(null);
  };

  const isHome = currentPath === homeHref;

  // Sidebar width: CSS-driven
  const sidebarW = isMobile
    ? "100%"
    : isOpen ? SIDEBAR_OPEN_W : SIDEBAR_COLLAPSED_W;

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && isMobileOpen && (
        <div
          className="fixed inset-0 z-[1400] bg-black/40 md:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar — CSS transitions only */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full z-[1500] flex flex-col overflow-hidden font-sans",
          "transition-[width,transform] duration-[250ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
        )}
        style={{
          width: sidebarW,
          transform: isMobile && !isMobileOpen ? 'translateX(-100%)' : 'translateX(0)',
          background: "var(--sidebar-bg, #0a0e1a)",
          boxShadow: "none",
          willChange: "width, transform",
        }}
      >
        {/* Mobile close */}
        {isMobile && (
          <button
            onClick={onMobileClose}
            className="absolute right-4 top-4 z-50 p-2 rounded-none hover:bg-white/10 active:scale-95 transition-all text-slate-400 hover:text-white"
            aria-label="Close menu"
          >
            <X className="w-5.5 h-5.5" />
          </button>
        )}

        {/* Brand Header / User profile */}
        <div className={cn(
          "border-b border-white/5 shrink-0 flex items-center transition-all",
          isOpen ? "h-20 px-4 justify-between" : "h-20 justify-center px-0"
        )}>
          {isOpen ? (
            <>
              <button
                onClick={() => { onNavigate(homeHref); onMobileClose(); }}
                className="flex items-center gap-3 text-left group cursor-pointer min-w-0 flex-1"
              >
                <div className="w-10 h-10 rounded-[5px] bg-[#F66E0A]/10 border border-[#F66E0A]/30 flex items-center justify-center shrink-0">
                  <span className="text-[#F66E0A] font-black text-base">
                    {brandTitle ? brandTitle[0] : (user?.initials || 'A')}
                  </span>
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <h1 className="text-[14px] font-semibold text-white tracking-tight truncate leading-tight group-hover:text-slate-200 transition-colors">
                    {brandTitle || user?.name || 'Admin'}
                  </h1>
                  {(brandSubtitle || user?.badge) && (
                    <p className="text-[11px] font-medium text-slate-300 truncate leading-tight mt-0.5">
                      {brandSubtitle || user?.badge}
                    </p>
                  )}
                </div>
              </button>
              {!isMobile && (
                <button
                  onClick={onToggle}
                  className="w-8 h-8 rounded-none flex items-center justify-center text-slate-300 hover:text-[#F66E0A] hover:bg-white/10 transition-colors shrink-0 ml-1.5 cursor-pointer"
                  aria-label="Collapse sidebar"
                >
                  <Menu className="w-4.5 h-4.5" />
                </button>
              )}
            </>
          ) : (
            /* When sidebar is hidden/minimized: The initial S box appears here */
            <button
              onClick={() => { onNavigate(homeHref); onMobileClose(); handleLeave(); }}
              className="w-10 h-10 rounded-[5px] bg-[#F66E0A]/10 hover:bg-[#F66E0A]/20 border border-[#F66E0A]/30 flex items-center justify-center transition-all cursor-pointer group"
              aria-label={brandTitle || user?.name || 'Dashboard'}
            >
              <span className="text-[#F66E0A] font-black text-base group-hover:scale-105 transition-transform">
                {brandTitle ? brandTitle[0] : (user?.initials || 'A')}
              </span>
            </button>
          )}
        </div>

        {/* Expand button when collapsed (desktop) */}
        {!isOpen && !isMobile && (
          <div className="h-14 flex items-center justify-center border-b border-white/5 shrink-0">
            <button
              onClick={onToggle}
              className="w-10 h-10 rounded-none bg-white/[0.03] hover:bg-white/[0.08] hover:text-white border border-white/10 flex items-center justify-center text-slate-400 transition-all cursor-pointer"
              aria-label="Expand sidebar"
            >
              <Menu className="w-4.5 h-4.5" />
            </button>
          </div>
        )}

        {/* Nav items */}
        <nav
          onScroll={handleLeave}
          className={cn(
            "flex-1 py-4 overflow-y-auto no-scrollbar",
            isOpen ? "px-3 space-y-1" : "flex flex-col items-center gap-2 py-4"
          )}
        >
          {navItems.map((item) => {
            const isCertificationsItem = item.href === '/certifications' || item.href === '/core/certifications';
            const isPathwayPath = currentPath === '/career-pathways' || currentPath.startsWith('/career-pathways/') || currentPath === '/core/career-pathways' || currentPath.startsWith('/core/career-pathways/');
            const isActive = !isHome && (
              currentPath === item.href || 
              currentPath.startsWith(item.href + '/') ||
              (isCertificationsItem && isPathwayPath)
            );
            return (
              <div
                key={item.label}
                className={cn("relative", !isOpen && "flex justify-center w-full")}
              >
                <button
                  onClick={() => { onNavigate(item.href); onMobileClose(); handleLeave(); }}
                  onMouseEnter={(e) => handleHover(item.label, e.currentTarget)}
                  onMouseLeave={handleLeave}
                  className={cn(
                    "relative overflow-hidden transition-all duration-150 font-sans cursor-pointer group rounded-md",
                    isOpen
                      ? "flex items-center gap-3.5 w-full px-3 py-2.5 text-left"
                      : "w-10 h-10 flex items-center justify-center",
                    isActive
                      ? "bg-[#F66E0A]/12 text-[#F66E0A] font-semibold"
                      : "text-slate-200 hover:text-white hover:bg-white/[0.07] font-medium"
                  )}
                  aria-label={item.label}
                >
                  {/* Left indicator line */}
                  {isActive && isOpen && (
                    <span className="absolute left-0 top-0 bottom-0 w-[2.5px] bg-[#F66E0A] pointer-events-none" />
                  )}
                  <div className={cn(
                    "flex items-center justify-center shrink-0 pointer-events-none transition-colors duration-150",
                    isMobile
                      ? "[&>svg]:w-[26px] [&>svg]:h-[26px] [&>img]:w-[26px] [&>img]:h-[26px]"
                      : "[&>svg]:w-[24px] [&>svg]:h-[24px] [&>img]:w-[24px] [&>img]:h-[24px]",
                    isActive ? "text-[#F66E0A]" : "text-slate-300 group-hover:text-white"
                  )}>
                    {item.icon}
                  </div>
                  {isOpen && (
                    <span
                      className={cn(
                        isMobile ? "text-[15px]" : "text-[14px]",
                        "truncate flex-1 capitalize tracking-normal transition-colors duration-150",
                        isActive ? "font-semibold text-[#F66E0A]" : "font-medium text-slate-200 group-hover:text-white"
                      )}
                    >
                      {item.label}
                    </span>
                  )}
                </button>
              </div>
            );
          })}
        </nav>

        {/* Sign out and bottom items */}
        <div className={cn(
          "border-t border-white/5 shrink-0 py-3",
          isOpen ? "px-3 space-y-1" : "flex flex-col items-center gap-2"
        )}>
          {bottomNavItems && bottomNavItems.map((item) => {
            const isActive = !isHome && (currentPath === item.href || currentPath.startsWith(item.href + '/'));
            return (
              <div
                key={item.label}
                className={cn("relative", !isOpen && "flex justify-center w-full")}
              >
                <button
                  onClick={() => { onNavigate(item.href); onMobileClose(); handleLeave(); }}
                  onMouseEnter={(e) => handleHover(item.label, e.currentTarget)}
                  onMouseLeave={handleLeave}
                  className={cn(
                    "relative overflow-hidden transition-all duration-150 font-sans cursor-pointer group rounded-md",
                    isOpen
                      ? "flex items-center gap-3.5 w-full px-3 py-2.5 text-left"
                      : "w-10 h-10 flex items-center justify-center",
                    isActive
                      ? "bg-[#F66E0A]/12 text-[#F66E0A] font-semibold"
                      : "text-slate-200 hover:text-white hover:bg-white/[0.07] font-medium"
                  )}
                  aria-label={item.label}
                >
                  {/* Left indicator line */}
                  {isActive && isOpen && (
                    <span className="absolute left-0 top-0 bottom-0 w-[2.5px] bg-[#F66E0A] pointer-events-none" />
                  )}
                  <div className={cn(
                    "flex items-center justify-center shrink-0 pointer-events-none transition-colors duration-150",
                    isMobile
                      ? "[&>svg]:w-[26px] [&>svg]:h-[26px] [&>img]:w-[26px] [&>img]:h-[26px]"
                      : "[&>svg]:w-[24px] [&>svg]:h-[24px] [&>img]:w-[24px] [&>img]:h-[24px]",
                    isActive ? "text-[#F66E0A]" : "text-slate-300 group-hover:text-white"
                  )}>
                    {item.icon}
                  </div>
                  {isOpen && (
                    <span
                      className={cn(
                        isMobile ? "text-[15px]" : "text-[14px]",
                        "truncate flex-1 capitalize tracking-normal transition-colors duration-150",
                        isActive ? "font-semibold text-[#F66E0A]" : "font-medium text-slate-200 group-hover:text-white"
                      )}
                    >
                      {item.label}
                    </span>
                  )}
                </button>
              </div>
            );
          })}

          <div
            className={cn("relative", !isOpen && "flex justify-center w-full")}
          >
            <button
              onClick={() => { onMobileClose(); handleLeave(); onSignOut?.(); }}
              onMouseEnter={(e) => handleHover(signOutLabel, e.currentTarget)}
              onMouseLeave={handleLeave}
              className={cn(
                "transition-all duration-150 font-sans cursor-pointer group text-slate-200 hover:text-red-400 hover:bg-red-500/10 rounded-md font-medium",
                isOpen
                  ? "flex items-center gap-3.5 w-full px-3 py-2.5 text-left"
                  : "w-10 h-10 flex items-center justify-center"
              )}
              aria-label={signOutLabel}
            >
              <div className="flex items-center justify-center shrink-0 [&>svg]:w-[22px] [&>svg]:h-[22px] pointer-events-none">
                <LogOut className="w-5 h-5 text-slate-300 group-hover:text-red-400 transition-colors" />
              </div>
              {isOpen && (
                <span className={cn(isMobile ? "text-[15px]" : "text-[14px]", "truncate font-medium text-slate-200 group-hover:text-red-400 transition-colors")}>
                  {signOutLabel}
                </span>
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* Floating Tooltip Portal for Minimized Sidebar */}
      {mounted && !isOpen && !isMobile && hoveredTooltip && createPortal(
        <div
          className="fixed z-[99999] pointer-events-none select-none flex items-center"
          style={{
            top: hoveredTooltip.top,
            left: SIDEBAR_COLLAPSED_W + 6,
            transform: "translateY(-50%)",
          }}
        >
          <div className="flex items-center animate-[tooltipShow_100ms_ease-out]">
            {/* Arrow */}
            <div className="w-0 h-0 border-y-[5px] border-y-transparent border-r-[6px] mr-[-1px] border-r-[#0d131f]" />
            {/* Tooltip bubble */}
            <div className="px-3 py-1.5 rounded-md shadow-2xl flex items-center whitespace-nowrap border border-white/10 text-[13px] font-medium tracking-wide bg-[#0d131f] text-slate-100">
              <span className="capitalize">{hoveredTooltip.label}</span>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
