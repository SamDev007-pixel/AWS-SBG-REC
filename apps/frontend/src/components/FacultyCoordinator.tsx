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
        backgroundImage: `
          linear-gradient(to bottom, rgba(11, 15, 25, 0.88) 0%, rgba(11, 15, 25, 0.82) 50%, rgba(11, 15, 25, 0.9) 100%),
          url('/images/crew_doodle_black_bg.png')
        `,
        backgroundSize: "450px auto",
        backgroundRepeat: "repeat",
        backgroundPosition: "center",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 20px 56px",
        borderTop: previewData ? "none" : "1px solid rgba(255, 153, 0, 0.15)",
        borderBottom: previewData ? "none" : "1px solid rgba(255, 153, 0, 0.15)",
        scrollMarginTop: "100px",
      }}
    >
      <style>{`
        .spotlight-banner-wrapper {
          width: 100%;
          max-width: 1240px;
          background: rgba(15, 23, 42, 0.75);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 153, 0, 0.25);
          border-radius: 24px;
          box-shadow: 0 20px 50px -10px rgba(0, 0, 0, 0.6), 0 0 30px rgba(255, 153, 0, 0.08);
          padding: 32px 36px;
          position: relative;
          z-index: 10;
          transition: all 0.3s ease;
        }
        .spotlight-banner-wrapper:hover {
          border-color: rgba(255, 153, 0, 0.45);
          box-shadow: 0 25px 60px -10px rgba(255, 153, 0, 0.15), 0 0 40px rgba(255, 153, 0, 0.1);
        }
        .spotlight-grid {
          display: flex;
          flex-direction: row;
          align-items: stretch;
          gap: 32px;
        }
        .spotlight-left-card {
          width: 270px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }
        .spotlight-img-frame {
          width: 240px;
          height: 240px;
          border-radius: 16px;
          overflow: hidden;
          position: relative;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
          border: 1px solid rgba(255, 153, 0, 0.3);
          margin-bottom: 14px;
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
          justify-content: space-between;
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
            margin: 0 auto 12px auto !important;
            border-radius: 14px !important;
          }
          .spotlight-banner-wrapper {
            padding: 18px 16px !important;
            border-radius: 18px !important;
          }
          .spotlight-quote-card {
            padding: 14px 16px !important;
            margin-bottom: 0 !important;
            border-radius: 12px !important;
          }
          .spotlight-quote-text {
            font-size: 12.5px !important;
            line-height: 1.55 !important;
            display: -webkit-box !important;
            -webkit-line-clamp: 3 !important;
            -webkit-box-orient: vertical !important;
            overflow: hidden !important;
          }
          .spotlight-header-container {
            margin-bottom: 18px !important;
          }
          .spotlight-right-header {
            justify-content: center !important;
          }
        }
      `}</style>

      {/* Section Header */}
      <div className="spotlight-header-container" style={{ position: "relative", zIndex: 10, textAlign: "center", marginBottom: 28 }}>
        <span style={{
          fontSize: "11px", fontWeight: 700, letterSpacing: "0.15em",
          textTransform: "uppercase", color: "#FF9900", display: "inline-flex", alignItems: "center", gap: 5,
          background: "rgba(255, 153, 0, 0.12)", border: "1px solid rgba(255, 153, 0, 0.3)",
          padding: "4px 12px", borderRadius: 20, marginBottom: 8,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#FF9900" }} />
          FACULTY LEADERSHIP
        </span>
        <h2 style={{
          fontSize: "clamp(24px, 3vw, 34px)", fontWeight: 800,
          color: "#ffffff", margin: "0 0 6px 0", letterSpacing: "-0.025em", lineHeight: 1.2,
        }}>
          Meet Our Faculty Coordinator
        </h2>
        <p style={{ fontSize: "13.5px", color: "#94a3b8", margin: 0, fontWeight: 450, maxWidth: "520px" }}>
          Guiding innovation, fostering community excellence, and mentoring student cloud leaders at REC.
        </p>
      </div>

      {/* Spotlight Banner Container */}
      <div className="spotlight-banner-wrapper">
        <div className="spotlight-grid">
          
          {/* Left Column: Portrait & Credentials */}
          <div className="spotlight-left-card">
            <div className="spotlight-img-frame">
              <img
                className="spotlight-img"
                src={coord.image}
                alt={coord.name}
              />
            </div>

            <span style={{
              fontSize: 10, fontWeight: 700, letterSpacing: "0.08em",
              textTransform: "uppercase", color: "#FF9900",
              background: "rgba(255, 153, 0, 0.12)",
              border: "1px solid rgba(255, 153, 0, 0.3)",
              borderRadius: 20, padding: "3px 10px", display: "inline-flex", alignItems: "center", gap: 5,
              marginBottom: 8,
            }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#FF9900" }} />
              FACULTY COORDINATOR
            </span>

            <h3 style={{
              fontSize: 22, fontWeight: 800, color: "#ffffff",
              margin: "0 0 6px 0", letterSpacing: "-0.025em", lineHeight: 1.25,
            }}>
              {coord.name}
            </h3>

            <p style={{ fontSize: 12.5, fontWeight: 650, color: "#cbd5e1", margin: "0 0 3px 0", lineHeight: 1.4 }}>
              {coord.role}
            </p>
            <p style={{ fontSize: 11.5, color: "#94a3b8", margin: "0 0 16px 0", fontWeight: 500, lineHeight: 1.4 }}>
              {coord.department}
            </p>

            <a
              href={coord.linkedin}
              target="_blank" rel="noopener noreferrer"
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                fontSize: 12, fontWeight: 700, color: "#ffffff",
                textDecoration: "none",
                background: "#0A66C2",
                borderRadius: 8, padding: "7px 14px",
                boxShadow: "0 4px 14px rgba(10, 102, 194, 0.35)",
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
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              Connect on LinkedIn
            </a>
          </div>

          {/* Right Column: Message & Mentorship Impact */}
          <div className="spotlight-right-content">
            <div>
              <div className="spotlight-right-header" style={{
                display: "flex", alignItems: "center", gap: 8, marginBottom: 12,
              }}>
                <div style={{
                  width: 26, height: 26, borderRadius: 7,
                  background: "rgba(255, 153, 0, 0.15)", border: "1px solid rgba(255, 153, 0, 0.3)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#FF9900" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "#FF9900" }}>
                  MENTORSHIP VISION & IMPACT
                </span>
              </div>

              {/* Quote Card */}
              <div className="spotlight-quote-card" style={{
                background: "rgba(30, 41, 59, 0.65)",
                border: "1px solid rgba(255, 153, 0, 0.2)",
                borderRadius: 14, padding: "20px 24px",
                position: "relative", marginBottom: 0,
                boxShadow: "0 8px 20px -5px rgba(0, 0, 0, 0.3)",
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="#FF9900" opacity="0.2" style={{ position: "absolute", top: 14, right: 18 }}>
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>

                <p className="spotlight-quote-text" style={{
                  fontSize: "14px", lineHeight: "1.75", color: "#e2e8f0",
                  fontWeight: 400, margin: 0, fontStyle: "normal",
                  letterSpacing: "-0.01em",
                }}>
                  "{coord.bio}"
                </p>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
