"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { api } from "@/lib/api";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: string;
  image: string;
  accent: string;
}

const CORE_MEMBERS: TeamMember[] = [
  {
    id: "core-2",
    name: "Giridharan R",
    role: "IT Support and Management",
    department: "AWS Cloud Clubs REC",
    image: "/images/core/giridharan_r.jpg",
    accent: "#0073BB",
  },
  {
    id: "core-1",
    name: "Dilip Kannan K",
    role: "Event Management",
    department: "AWS Cloud Clubs REC",
    image: "/images/core/dilip_kannan.jpg",
    accent: "#7C3AED",
  },
  {
    id: "core-4",
    name: "Prathakshanaa T",
    role: "Captain",
    department: "AWS Cloud Clubs REC",
    image: "/images/core/prathakshanaa_t.jpg",
    accent: "#FF9900",
  },
  {
    id: "core-3",
    name: "K N Pranav Ranjan",
    role: "Tech Lead",
    department: "AWS Cloud Clubs REC",
    image: "/images/core/pranav_ranjan.jpg",
    accent: "#FF9900",
  },
  {
    id: "core-5",
    name: "V Thirunavukkarasu",
    role: "Social Media Lead",
    department: "AWS Cloud Clubs REC",
    image: "/images/core/thirunavukkarasu.jpg",
    accent: "#16A34A",
  },
];

const CREW_MEMBERS: TeamMember[] = [
  {
    id: "crew-1",
    name: "Abimithren",
    role: "Cloud Associate",
    department: "Projects & Innovation",
    image: "/images/crew/abimithren.jpg",
    accent: "#0073BB",
  },
  {
    id: "crew-2",
    name: "Abhijith K",
    role: "Technical Associate",
    department: "Projects & Innovation",
    image: "/images/crew/abhijith_k.jpg",
    accent: "#FF9900",
  },
  {
    id: "crew-3",
    name: "Balaambiga C A",
    role: "Operations Lead",
    department: "Events & Outreach",
    image: "/images/crew/balaambiga_c_a.jpg",
    accent: "#16A34A",
  },
  {
    id: "crew-4",
    name: "Goutham R",
    role: "Cloud Associate",
    department: "Projects & Innovation",
    image: "/images/crew/goutham_r.jpg",
    accent: "#0073BB",
  },
  {
    id: "crew-5",
    name: "Harini S",
    role: "Events Associate",
    department: "Events & Outreach",
    image: "/images/crew/harini_s.jpg",
    accent: "#7C3AED",
  },
  {
    id: "crew-6",
    name: "Jaiganesh G",
    role: "Marketing Associate",
    department: "Marketing & Media",
    image: "/images/crew/jaiganesh_g.jpg",
    accent: "#FF9900",
  },
  {
    id: "crew-7",
    name: "Lakshminarasimhan",
    role: "Technical Associate",
    department: "Projects & Innovation",
    image: "/images/crew/lakshminarasimhan.jpg",
    accent: "#0073BB",
  },
  {
    id: "crew-8",
    name: "Neil Daniel",
    role: "Content Strategist",
    department: "Marketing & Media",
    image: "/images/crew/neil_daniel.jpg",
    accent: "#7C3AED",
  },
  {
    id: "crew-9",
    name: "Rannesh Khumar B R",
    role: "Web Developer",
    department: "Projects & Innovation",
    image: "/images/crew/rannesh_khumar_b_r.jpg",
    accent: "#FF9900",
  },
  {
    id: "crew-10",
    name: "Sam Devaraja J",
    role: "Lead Developer",
    department: "Projects & Innovation",
    image: "/images/crew/sam_devaraja_j.jpg",
    accent: "#0073BB",
  },
  {
    id: "crew-11",
    name: "Sudhish",
    role: "Events Associate",
    department: "Events & Outreach",
    image: "/images/crew/sudhish.jpg",
    accent: "#16A34A",
  },
  {
    id: "crew-12",
    name: "Sunchitha V K",
    role: "Design Lead",
    department: "Marketing & Media",
    image: "/images/crew/sunchitha_vk.jpg",
    accent: "#FF9900",
  },
  {
    id: "crew-13",
    name: "Vs Thamizh Selvan",
    role: "Cloud Associate",
    department: "Projects & Innovation",
    image: "/images/crew/vs_thamizh_selvan.jpg",
    accent: "#0073BB",
  },
];

const DEFAULT_MEMBERS = [
  ...CORE_MEMBERS.map((m) => ({ ...m, type: "core" as const })),
  ...CREW_MEMBERS.map((m) => ({ ...m, type: "crew" as const })),
];

const PAD = 6;

function TeamMemberCard({ member, isActive }: { member: TeamMember & { type: "core" | "crew" }; isActive: boolean }) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const shouldPopUp = isActive || isHovered;

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        width: 240,
        flexShrink: 0,
        background: "linear-gradient(to bottom, #ffffff, #f8fafc)",
        borderRadius: 8,
        border: shouldPopUp ? "1px solid #E68A00" : "1px solid rgba(15, 23, 42, 0.12)",
        boxShadow: shouldPopUp
          ? "0 12px 24px -6px rgba(230, 138, 0, 0.16), 0 4px 12px -4px rgba(230, 138, 0, 0.12)"
          : "0 1px 3px rgba(15, 23, 42, 0.015), 0 1px 2px rgba(15, 23, 42, 0.01)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        cursor: "pointer",
        padding: "0 0 14px 0",
        transform: shouldPopUp ? "translateY(-6px)" : "none",
        transition: "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.5s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
        position: "relative",
      }}
    >
      {/* Image Container */}
      <div style={{
        width: "100%",
        height: 230,
        background: (!member.image || imageError) ? "#0f172a" : "#f8fafc",
        overflow: "hidden",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <img
          src={(!member.image || imageError) ? "/aws-logo.svg" : member.image}
          alt={(!member.image || imageError) ? "AWS Logo" : member.name}
          onError={() => setImageError(true)}
          style={{
            width: (!member.image || imageError) ? "50%" : "100%",
            height: (!member.image || imageError) ? "auto" : "100%",
            display: "block",
            objectFit: (!member.image || imageError) ? "contain" : "cover",
            transition: "transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        />
      </div>

      {/* Text Info */}
      <div style={{
        padding: "12px 10px 0px 10px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        flexGrow: 1,
      }}>
        {/* Row 1: Name */}
        <h3 style={{
          fontSize: 14,
          fontWeight: 700,
          color: shouldPopUp ? "#E68A00" : "#0f172a",
          margin: "0 0 6px 0",
          letterSpacing: "-0.01em",
          textOverflow: "ellipsis",
          overflow: "hidden",
          whiteSpace: "nowrap",
          width: "100%",
          transition: "color 0.3s ease",
        }}>
          {member.name}
        </h3>
        
        {/* Row 2: Core/Crew Type Badge */}
        <div>
          <span style={{
            fontSize: 9,
            fontWeight: 800,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            color: member.type === "core" ? "#E68A00" : "#0073BB",
            background: member.type === "core" ? "rgba(230, 138, 0, 0.06)" : "rgba(0, 115, 187, 0.06)",
            border: `1px solid ${member.type === "core" ? "rgba(230, 138, 0, 0.12)" : "rgba(0, 115, 187, 0.12)"}`,
            borderRadius: 3,
            padding: "1px 5px",
            display: "inline-block",
            marginBottom: 5,
          }}>
            {member.type}
          </span>
        </div>

        {/* Row 3: Position / Role (Core Only) */}
        {member.type === "core" && (
          <span style={{
            fontSize: 11,
            fontWeight: 600,
            color: "#475569",
            display: "inline-flex",
            alignItems: "center",
            gap: 4.5,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: "100%",
          }}>
            <span style={{ width: 4.5, height: 4.5, borderRadius: "50%", background: member.accent, flexShrink: 0 }} />
            {member.role}
          </span>
        )}
      </div>
    </div>
  );
}

interface OurTeamShowcaseProps {
  previewData?: any[];
}

export default function OurTeamShowcase({ previewData }: OurTeamShowcaseProps = {}) {
  const [allMembers, setAllMembers] = useState<(TeamMember & { type: "core" | "crew" })[]>(previewData as any || DEFAULT_MEMBERS);
  const [currentIndex, setCurrentIndex] = useState(PAD);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [hasReached, setHasReached] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (previewData) {
      setAllMembers(previewData as any);
    }
  }, [previewData]);

  useEffect(() => {
    if (previewData) return;
    let active = true;
    api.get<any[]>("/homepage/team")
      .then((res) => {
        if (active && res && res.length > 0) {
          setAllMembers(res as any);
        }
      })
      .catch((err) => console.error("Team dynamic fetch error:", err));
    return () => { active = false; };
  }, [previewData]);

  const displayMembers = useMemo(() => {
    if (allMembers.length === 0) return [];
    return [
      ...allMembers.slice(-PAD),
      ...allMembers,
      ...allMembers.slice(0, PAD),
    ];
  }, [allMembers]);

  // Adjust current index on members load/update
  useEffect(() => {
    if (allMembers.length === 0) return;
    const captIdx = allMembers.findIndex((m) => m.role === "Captain");
    setCurrentIndex(captIdx !== -1 ? captIdx + PAD : PAD);
  }, [allMembers]);

  // Intersection Observer to detect when section reaches the viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasReached(true);
          const captIdx = allMembers.findIndex((m) => m.role === "Captain");
          if (captIdx !== -1) {
            setCurrentIndex(captIdx + PAD);
          }
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [allMembers]);

  // Auto swap every 3 seconds, resets timer on index change
  useEffect(() => {
    if (!hasReached || allMembers.length === 0) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => prev + 1);
    }, 3000);
    return () => clearInterval(timer);
  }, [currentIndex, hasReached, allMembers]);

  // Re-enable transitions after browser reflow
  useEffect(() => {
    if (!isTransitioning) {
      const timeout = setTimeout(() => {
        setIsTransitioning(true);
      }, 30);
      return () => clearTimeout(timeout);
    }
  }, [isTransitioning]);

  const handlePrev = () => {
    if (!isTransitioning) return;
    setCurrentIndex((prev) => prev - 1);
  };

  const handleNext = () => {
    if (!isTransitioning) return;
    setCurrentIndex((prev) => prev + 1);
  };

  const handleTransitionEnd = () => {
    if (allMembers.length === 0) return;
    if (currentIndex >= allMembers.length + PAD) {
      setIsTransitioning(false);
      setCurrentIndex(currentIndex - allMembers.length);
    } else if (currentIndex < PAD) {
      setIsTransitioning(false);
      setCurrentIndex(currentIndex + allMembers.length);
    }
  };

  if (allMembers.length === 0) return null;

  return (
    <section
      ref={sectionRef}
      id="team"
      style={{
        width: "100%",
        background: "#f8fafc",
        backgroundImage: "radial-gradient(circle at 10% 20%, rgba(255, 153, 0, 0.04) 0%, transparent 45%), radial-gradient(circle at 90% 80%, rgba(0, 115, 187, 0.04) 0%, transparent 45%), radial-gradient(#e2e8f0 1px, transparent 1px)",
        backgroundSize: "100% 100%, 100% 100%, 24px 24px",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "36px 0 44px",
        scrollMarginTop: "100px",
        borderTop: previewData ? "none" : "1px solid #e2e8f0",
      }}
    >
      <style>{`
        @media (max-width: 1024px) {
          .team-mobile-nav-buttons {
            display: flex !important;
            justify-content: center;
            gap: 16px;
            margin-top: 24px;
            width: 100%;
            position: relative;
            z-index: 30;
          }
          .team-desktop-btn {
            display: none !important;
          }
        }
      `}</style>

      {/* ── DOT GRID RADIAL FADE MASK ── */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "radial-gradient(circle at center, transparent 40%, #ffffff 90%)",
        pointerEvents: "none",
        zIndex: 1,
      }} />

      {/* ── HEADER ── */}
      <div style={{ textAlign: "center", marginBottom: 28, position: "relative", zIndex: 10, padding: "0 24px" }}>
        <span style={{
          fontSize: "11px",
          fontWeight: 700,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: "#E68A00",
          display: "block",
          marginBottom: "8px",
        }}>
          OUR TEAM
        </span>

        <h2 style={{
          fontSize: "clamp(28px, 3vw, 36px)",
          fontWeight: 800,
          color: "#0f172a",
          margin: "0 0 10px",
          letterSpacing: "-0.025em",
          lineHeight: 1.2
        }}>
          Meet the Team
        </h2>
        <p style={{
          fontSize: "15px",
          color: "#475569",
          margin: 0,
          fontWeight: 400,
          maxWidth: "480px",
          marginLeft: "auto",
          marginRight: "auto",
          lineHeight: 1.6,
        }}>
          The talented student leaders, developers, and designers driving the AWS Cloud Club community at REC.
        </p>
      </div>

      {/* ── SLIDER TEAM CAROUSEL ── */}
      <div 
        style={{
          width: "100%",
          overflow: "hidden",
          position: "relative",
          zIndex: 10,
          padding: "20px 0 10px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* Carousel Content Row */}
        <div style={{ width: "100%", display: "flex", alignItems: "center", position: "relative" }}>
          {/* Left Arrow Button */}
          <button
            onClick={handlePrev}
            className="team-desktop-btn"
            aria-label="Previous Team Member"
            style={{
              position: "absolute",
              left: "24px",
              zIndex: 30,
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.85)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(15, 23, 42, 0.08)",
              boxShadow: "0 4px 12px rgba(15, 23, 42, 0.06)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#475569",
              transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#E68A00";
              e.currentTarget.style.color = "#FFFFFF";
              e.currentTarget.style.borderColor = "#E68A00";
              e.currentTarget.style.boxShadow = "0 8px 16px rgba(230, 138, 0, 0.25)";
              e.currentTarget.style.transform = "scale(1.08)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.85)";
              e.currentTarget.style.color = "#475569";
              e.currentTarget.style.borderColor = "rgba(15, 23, 42, 0.08)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(15, 23, 42, 0.06)";
              e.currentTarget.style.transform = "none";
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          {/* Right Arrow Button */}
          <button
            onClick={handleNext}
            className="team-desktop-btn"
            aria-label="Next Team Member"
            style={{
              position: "absolute",
              right: "24px",
              zIndex: 30,
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.85)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(15, 23, 42, 0.08)",
              boxShadow: "0 4px 12px rgba(15, 23, 42, 0.06)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#475569",
              transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#E68A00";
              e.currentTarget.style.color = "#FFFFFF";
              e.currentTarget.style.borderColor = "#E68A00";
              e.currentTarget.style.boxShadow = "0 8px 16px rgba(230, 138, 0, 0.25)";
              e.currentTarget.style.transform = "scale(1.08)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.85)";
              e.currentTarget.style.color = "#475569";
              e.currentTarget.style.borderColor = "rgba(15, 23, 42, 0.08)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(15, 23, 42, 0.06)";
              e.currentTarget.style.transform = "none";
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          {/* Carousel Track */}
          <div
            ref={containerRef}
            onTransitionEnd={handleTransitionEnd}
            style={{
              display: "flex",
              gap: "20px",
              transition: isTransitioning ? "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)" : "none",
              transform: `translateX(calc(50% - 120px - ${currentIndex * 260}px))`,
              width: "100%",
            }}
          >
            {displayMembers.map((member, index) => (
              <div
                key={`${member.id}-${index}`}
                onClick={() => {
                  if (isTransitioning) {
                    setCurrentIndex(index);
                  }
                }}
                style={{
                  width: 240,
                  flexShrink: 0,
                  opacity: currentIndex === index ? 1 : 0.75,
                  transition: "opacity 0.4s ease",
                }}
              >
                <TeamMemberCard member={member} isActive={currentIndex === index} />
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Navigation Buttons (Repositioned below carousel to avoid overlaps) */}
        <div className="team-mobile-nav-buttons" style={{ display: "none" }}>
          <button
            onClick={handlePrev}
            aria-label="Previous Team Member"
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.9)",
              border: "1px solid rgba(15, 23, 42, 0.08)",
              boxShadow: "0 2px 8px rgba(15, 23, 42, 0.06)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#475569",
              cursor: "pointer",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            onClick={handleNext}
            aria-label="Next Team Member"
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.9)",
              border: "1px solid rgba(15, 23, 42, 0.08)",
              boxShadow: "0 2px 8px rgba(15, 23, 42, 0.06)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#475569",
              cursor: "pointer",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
