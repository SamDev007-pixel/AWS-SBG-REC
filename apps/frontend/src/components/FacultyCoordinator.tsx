"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";

const DESCRIPTION = `The driving force behind the AWS Student Builder Group at Rajalakshmi Engineering College, he has played a pivotal role in establishing and nurturing the community. Through his guidance, he empowers students to innovate, collaborate, and execute impactful cloud initiatives.`;

const DEFAULT_COORD = {
  name: "Bhuvaneswaran B.",
  role: "Asst. Professor (Senior Grade) & Training Manager",
  department: "Dept. of CSE · Rajalakshmi Engineering College",
  image: "/images/faculty_bhuvaneswaran.jpg",
  bio: DESCRIPTION,
  linkedin: "https://www.linkedin.com/in/bhuvaneswaranrec/",
};

interface FacultyCoordinatorProps {
  previewData?: {
    name: string;
    role: string;
    department: string;
    image: string;
    bio: string;
    linkedin: string;
  };
  forceMobile?: boolean;
}

export default function FacultyCoordinator({ previewData, forceMobile }: FacultyCoordinatorProps = {}) {
  const [coord, setCoord] = useState(previewData || DEFAULT_COORD);

  useEffect(() => {
    if (previewData) {
      setCoord(previewData);
    }
  }, [previewData]);

  useEffect(() => {
    if (previewData) return;
    let active = true;
    api.get<any>("/homepage/coordinator")
      .then((res) => {
        if (active && res) {
          setCoord(res);
        }
      })
      .catch(() => {});
    return () => { active = false; };
  }, [previewData]);

  return (
    <section
      id="faculty-coordinator"
      className={forceMobile ? "force-mobile" : ""}
      style={{
        width: "100%",
        backgroundColor: "#0B0F19",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "52px 20px 60px",
        borderTop: previewData ? "none" : "1px solid #1E293B",
        borderBottom: previewData ? "none" : "1px solid #1E293B",
        scrollMarginTop: "100px",
      }}
    >
      <style>{`
        .spotlight-banner-wrapper {
          width: 100%;
          max-width: 1040px;
          background: #131B2E;
          border: 1px solid #1E293B;
          border-radius: 20px;
          box-shadow: 0 15px 40px -10px rgba(0, 0, 0, 0.4);
          padding: 36px 40px;
          position: relative;
          z-index: 10;
          transition: all 0.3s ease;
        }
        .spotlight-banner-wrapper:hover {
          border-color: rgba(255, 153, 0, 0.4);
          box-shadow: 0 20px 45px -10px rgba(255, 153, 0, 0.12);
        }
        .spotlight-grid {
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: 36px;
        }
        .spotlight-left-card {
          width: 220px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }
        .spotlight-img-frame {
          width: 220px;
          height: 220px;
          border-radius: 16px;
          overflow: hidden;
          position: relative;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.35);
          border: 1px solid rgba(255, 153, 0, 0.25);
          margin-bottom: 16px;
        }
        .spotlight-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: top center;
          transition: transform 0.5s ease;
        }
        .spotlight-banner-wrapper:hover .spotlight-img {
          transform: scale(1.03);
        }
        .spotlight-right-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        @media (max-width: 780px) {
          .spotlight-grid {
            flex-direction: column !important;
            gap: 20px !important;
          }
          .spotlight-left-card {
            width: 100% !important;
            align-items: center !important;
            text-align: center !important;
          }
          .spotlight-img-frame {
            width: 160px !important;
            height: 160px !important;
            margin: 0 auto 14px auto !important;
            border-radius: 14px !important;
          }
          .spotlight-right-content {
            align-items: center !important;
            text-align: center !important;
          }
          .spotlight-banner-wrapper {
            padding: 24px 20px !important;
            border-radius: 18px !important;
          }
          .spotlight-quote-box {
            border-left: none !important;
            padding-left: 0 !important;
            margin-top: 14px !important;
            text-align: center !important;
          }
          .spotlight-header-container {
            margin-bottom: 22px !important;
          }
        }
      `}</style>

      {/* Section Header */}
      <div className="spotlight-header-container" style={{ position: "relative", zIndex: 10, textAlign: "center", marginBottom: 32 }}>
        <span style={{
          fontSize: "11px", fontWeight: 700, letterSpacing: "0.15em",
          textTransform: "uppercase", color: "#FF9900", display: "inline-flex", alignItems: "center", gap: 5,
          background: "rgba(255, 153, 0, 0.1)", border: "1px solid rgba(255, 153, 0, 0.25)",
          padding: "5px 14px", borderRadius: 20, marginBottom: 10,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#FF9900" }} />
          FACULTY COORDINATOR
        </span>
        <h2 style={{
          fontSize: "clamp(24px, 3vw, 34px)", fontWeight: 800,
          color: "#ffffff", margin: "0 0 6px 0", letterSpacing: "-0.025em", lineHeight: 1.2,
        }}>
          Meet Our Faculty Coordinator
        </h2>
        <p style={{ fontSize: "13.5px", color: "#94a3b8", margin: 0, fontWeight: 450, maxWidth: "540px" }}>
          Guiding innovation, fostering community excellence, and mentoring student cloud leaders at REC.
        </p>
      </div>

      {/* Spotlight Banner Container */}
      <div className="spotlight-banner-wrapper">
        <div className="spotlight-grid">
          
          {/* Left Column: Portrait */}
          <div className="spotlight-left-card">
            <div className="spotlight-img-frame">
              <img
                className="spotlight-img"
                src={coord.image}
                alt={coord.name}
              />
            </div>
            
            <a
              href={coord.linkedin}
              target="_blank" rel="noopener noreferrer"
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                fontSize: 12.5, fontWeight: 700, color: "#ffffff",
                textDecoration: "none",
                background: "#0A66C2",
                borderRadius: 8, padding: "8px 16px",
                boxShadow: "0 4px 12px rgba(10, 102, 194, 0.3)",
                transition: "all 0.2s ease",
                width: "100%", justifyContent: "center",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#084E96";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#0A66C2";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              Connect on LinkedIn
            </a>
          </div>

          {/* Right Column: Name, Designation & Clean Mentorship Statement */}
          <div className="spotlight-right-content">
            <h3 style={{
              fontSize: "clamp(22px, 2.5vw, 26px)", fontWeight: 800, color: "#ffffff",
              margin: "0 0 6px 0", letterSpacing: "-0.025em", lineHeight: 1.2,
            }}>
              {coord.name}
            </h3>

            <p style={{ fontSize: "13.5px", fontWeight: 650, color: "#cbd5e1", margin: "0 0 4px 0", lineHeight: 1.4 }}>
              {coord.role}
            </p>
            
            <p style={{ fontSize: "12px", color: "#94a3b8", margin: "0 0 18px 0", fontWeight: 500, lineHeight: 1.4 }}>
              {coord.department}
            </p>

            {/* Minimalist Executive Quote Block */}
            <div className="spotlight-quote-box" style={{
              borderLeft: "3px solid #FF9900",
              paddingLeft: "18px",
              marginTop: "4px",
            }}>
              <span style={{
                fontSize: "11px", fontWeight: 800, letterSpacing: "0.12em",
                textTransform: "uppercase", color: "#FF9900", display: "block", marginBottom: 6,
              }}>
                MENTORSHIP VISION & IMPACT
              </span>
              <p style={{
                fontSize: "13.5px", lineHeight: "1.7", color: "#e2e8f0",
                fontWeight: 400, margin: 0, fontStyle: "italic",
              }}>
                "{coord.bio}"
              </p>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
