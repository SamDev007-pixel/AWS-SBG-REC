"use client";
import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

const LINKS = [
  { label: "Home", href: "/#home", sectionId: "home" },
  { label: "About Us", href: "/#about", sectionId: "about" },
  { label: "Gallery", href: "/#gallery", sectionId: "gallery" },
  { label: "Review", href: "/#reviews", sectionId: "reviews" },
  { label: "Team", href: "/#developers", sectionId: "developers" }
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false);
      }
    };

    handleScroll();
    handleResize();

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const sections = ["home", "about", "gallery", "reviews", "developers", "team-bottom"];
    const handleScrollSpy = () => {
      if (window.scrollY < 50) {
        setActiveSection("home");
        return;
      }
      
      const scrollPosition = window.scrollY + window.innerHeight / 3;
      
      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(sectionId === "team-bottom" ? "developers" : sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScrollSpy);
    handleScrollSpy();
    return () => window.removeEventListener("scroll", handleScrollSpy);
  }, []);

  return (
    <>
      <style>{`
        .navbar-link-item {
          transition: all 0.25s ease !important;
        }
        .navbar-link-item:hover {
          color: #E68A00 !important;
        }
      `}</style>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: isMobile ? "60px" : (scrolled ? "60px" : "68px"),
          backgroundColor: "#FFFFFF",
          borderBottom: "1px solid #E2E8F0",
          boxShadow: scrolled ? "0 4px 20px rgba(15, 23, 42, 0.06)" : "0 2px 10px rgba(15, 23, 42, 0.03)",
          display: "flex",
          alignItems: "center",
          zIndex: 1000,
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          outline: "none",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "100%",
            margin: "0 auto",
            padding: isMobile ? "0 20px" : "0 40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            outline: "none",
          }}
        >
          {/* Logo Branding */}
          <div
            onClick={() => router.push("/")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              cursor: "pointer",
              userSelect: "none",
            }}
          >
            <div
              style={{
                width: isMobile ? "30px" : (scrolled ? "30px" : "33px"),
                height: isMobile ? "30px" : (scrolled ? "30px" : "33px"),
                borderRadius: "7.5px",
                overflow: "hidden",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.18)",
                flexShrink: 0,
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            >
              <img
                src="/sbg-logo-latest.png"
                alt="AWS SBG REC Logo"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            </div>
            <span 
              style={{ 
                fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                fontWeight: 700,
                fontSize: isMobile ? "15.5px" : (scrolled ? "16.5px" : "17.5px"),
                color: "#0F172A",
                letterSpacing: "-0.015em",
                whiteSpace: "nowrap",
                transform: "translateY(-0.5px)",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            >
              AWS SBG REC
            </span>
          </div>

          {/* Desktop Menu Links */}
          {!isMobile && (
            <nav
              style={{
                display: "flex",
                alignItems: "center",
                gap: "28px",
              }}
            >
              {LINKS.map((link) => {
                const isActive = activeSection === link.sectionId;
                return (
                  <a
                    key={link.label}
                    href={link.href}
                    className="navbar-link-item"
                    style={{
                      position: "relative",
                      fontSize: "16px",
                      fontWeight: 600,
                      color: isActive ? "#E68A00" : "#475569",
                      textDecoration: "none",
                      padding: "6px 0",
                      fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                    }}
                  >
                    {link.label}
                    {isActive && (
                      <motion.div
                        layoutId="navbar-underline"
                        style={{
                          position: "absolute",
                          bottom: "-6px",
                          left: 0,
                          right: 0,
                          height: "3px",
                          backgroundColor: "#E68A00",
                          borderRadius: "999px",
                        }}
                      />
                    )}
                  </a>
                );
              })}
            </nav>
          )}

          {/* Desktop CTAs */}
          {!isMobile && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "24px",
              }}
            >
              <button
                onClick={() => router.push("/login")}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#4A5568",
                  fontSize: "16px",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                  outline: "none",
                  padding: "6px 0",
                  transition: "color 0.2s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#FF9900")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#4A5568")}
              >
                Login
              </button>

              <button
                onClick={() => router.push("/signup")}
                style={{
                  padding: "10px 24px",
                  background: "#E68A00",
                  color: "#ffffff",
                  border: "none",
                  fontWeight: 700,
                  fontSize: "16px",
                  cursor: "pointer",
                  fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                  outline: "none",
                  transform: "skewX(-20deg) scale(1)",
                  borderRadius: "4px",
                  boxShadow: "none",
                  transition: "transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "skewX(-20deg) scale(1.04)";
                  e.currentTarget.style.backgroundColor = "#CD7B00";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "skewX(-20deg) scale(1)";
                  e.currentTarget.style.backgroundColor = "#E68A00";
                }}
              >
                <span style={{ display: "inline-block", transform: "skewX(20deg)" }}>
                  Join Us
                </span>
              </button>
            </div>
          )}

          {/* Mobile Hamburger Toggle */}
          {isMobile && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: "8px",
                color: "#0F172A",
                outline: "none",
              }}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          )}
        </div>

        {/* Mobile menu dropdown drawer */}
        <AnimatePresence>
          {isMobile && mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              style={{
                position: "absolute",
                top: "64px",
                left: 0,
                right: 0,
                backgroundColor: "rgba(255, 255, 255, 0.96)",
                borderBottom: "1px solid rgba(15, 23, 42, 0.08)",
                padding: "16px 24px 24px",
                boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                zIndex: 999,
              }}
            >
              {LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    fontSize: "16px",
                    fontWeight: 600,
                    color: "#0F172A",
                    textDecoration: "none",
                    padding: "8px 0",
                    display: "block",
                    fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                  }}
                >
                  {link.label}
                </a>
              ))}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  marginTop: "8px",
                }}
              >
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    router.push("/login");
                  }}
                  style={{
                    width: "100%",
                    padding: "12px",
                    background: "transparent",
                    border: "1.5px solid rgba(15, 23, 42, 0.2)",
                    borderRadius: "8px",
                    color: "#0F172A",
                    fontWeight: 700,
                    fontSize: "16px",
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    router.push("/signup");
                  }}
                  style={{
                    width: "100%",
                    padding: "12px",
                    background: "#E68A00",
                    border: "none",
                    borderRadius: "8px",
                    color: "#ffffff",
                    fontWeight: 800,
                    fontSize: "16px",
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  Join Us
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    </>
  );
}
