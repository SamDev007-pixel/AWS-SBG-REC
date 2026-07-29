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
          linear-gradient(to bottom, rgba(11, 15, 25, 0.76) 0%, rgba(11, 15, 25, 0.70) 50%, rgba(11, 15, 25, 0.78) 100%),
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
        padding: "36px 20px 42px",
        borderTop: previewData ? "none" : "1px solid rgba(255, 153, 0, 0.15)",
        borderBottom: previewData ? "none" : "1px solid rgba(255, 153, 0, 0.15)",
        scrollMarginTop: "100px",
      }}
    >
      <style>{`
        .spotlight-banner-wrapper {
          width: 100%;
          max-width: 980px;
          background: rgba(15, 23, 42, 0.75);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 153, 0, 0.25);
          border-radius: 8px;
          box-shadow: 0 16px 40px -10px rgba(0, 0, 0, 0.6), 0 0 24px rgba(255, 153, 0, 0.08);
          padding: 24px 28px;
          position: relative;
          z-index: 10;
          transition: all 0.3s ease;
        }
        .spotlight-banner-wrapper:hover {
          border-color: rgba(255, 153, 0, 0.45);
          box-shadow: 0 20px 50px -10px rgba(255, 153, 0, 0.15);
        }
        .spotlight-grid {
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: 28px;
        }
        .spotlight-left-card {
          width: 200px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .spotlight-img-frame {
          width: 200px;
          height: 200px;
          border-radius: 8px;
          overflow: hidden;
          position: relative;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
          border: 1px solid rgba(255, 153, 0, 0.3);
          margin-bottom: 12px;
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
          align-items: flex-start;
        }

        .spotlight-linkedin-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11.5px;
          font-weight: 700;
          color: #ffffff;
          text-decoration: none;
          background: #0A66C2;
          border-radius: 4px;
          padding: 7.5px 14px;
          box-shadow: 0 3px 10px rgba(10, 102, 194, 0.35);
          transition: all 0.2s ease;
          width: 100%;
          justify-content: center;
        }
        .spotlight-linkedin-btn:hover {
          background: #084E96;
          transform: translateY(-1px);
        }

        @media (max-width: 780px) {
          .spotlight-grid {
            flex-direction: column !important;
            align-items: center !important;
            gap: 12px !important;
          }
          .spotlight-left-card {
            display: contents !important;
          }
          .spotlight-img-frame {
            order: 1 !important;
            width: 160px !important;
            height: 160px !important;
            border-radius: 8px !important;
            margin: 0 auto 4px auto !important;
          }
          .spotlight-right-content {
            order: 2 !important;
            width: 100% !important;
            align-items: center !important;
            text-align: center !important;
          }
          .spotlight-linkedin-btn {
            order: 3 !important;
            width: 100% !important;
            margin-top: 10px !important;
          }
          .spotlight-banner-wrapper {
            padding: 20px 16px !important;
            border-radius: 8px !important;
          }
          .spotlight-quote-card {
            padding: 14px 16px !important;
            margin-top: 10px !important;
            text-align: left !important;
            border-radius: 8px !important;
            border-left: 4px solid #FF9900 !important;
          }
          .spotlight-header-container {
            margin-bottom: 16px !important;
          }
        }
      `}</style>

      {/* Section Header */}
      <div className="spotlight-header-container" style={{ position: "relative", zIndex: 10, textAlign: "center", marginBottom: 22 }}>
        <span style={{
          fontSize: "10.5px", fontWeight: 800, letterSpacing: "0.14em",
          textTransform: "uppercase", color: "#FF9900", display: "inline-flex", alignItems: "center", gap: 6,
          background: "rgba(15, 23, 42, 0.85)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
          border: "1px solid rgba(255, 153, 0, 0.4)", boxShadow: "0 2px 10px rgba(0, 0, 0, 0.4), 0 0 12px rgba(255, 153, 0, 0.15)",
          padding: "4.5px 14px", borderRadius: 4, marginBottom: 10,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#FF9900", boxShadow: "0 0 8px #FF9900" }} />
          FACULTY LEADERSHIP
        </span>
        <h2 style={{
          fontSize: "clamp(20px, 2.2vw, 26px)", fontWeight: 800,
          color: "#ffffff", margin: "0 0 4px 0", letterSpacing: "-0.025em", lineHeight: 1.2,
        }}>
          Meet Our Faculty Coordinator
        </h2>
        <p style={{ fontSize: "12.5px", color: "#94a3b8", margin: 0, fontWeight: 450, maxWidth: "480px" }}>
          Guiding innovation, fostering community excellence, and mentoring student cloud leaders at REC.
        </p>
      </div>

      {/* Spotlight Banner Container */}
      <div className="spotlight-banner-wrapper">
        <div className="spotlight-grid">
          
          {/* Left Column: Portrait & LinkedIn Button */}
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
              target="_blank"
              rel="noopener noreferrer"
              className="spotlight-linkedin-btn"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              Connect on LinkedIn
            </a>
          </div>

          {/* Right Column: Name, Designation, Department & Mentorship Quote Card */}
          <div className="spotlight-right-content">
            
            <span style={{
              fontSize: "10px", fontWeight: 800, letterSpacing: "0.12em",
              textTransform: "uppercase", color: "#FF9900", display: "inline-flex", alignItems: "center", gap: 5,
              background: "rgba(15, 23, 42, 0.85)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
              border: "1px solid rgba(255, 153, 0, 0.4)", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3), 0 0 10px rgba(255, 153, 0, 0.12)",
              borderRadius: 4, padding: "3.5px 11px", marginBottom: 8,
            }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#FF9900", boxShadow: "0 0 6px #FF9900" }} />
              FACULTY COORDINATOR
            </span>

            <h3 style={{
              fontSize: "clamp(20px, 2.2vw, 24px)", fontWeight: 800, color: "#ffffff",
              margin: "0 0 4px 0", letterSpacing: "-0.025em", lineHeight: 1.2,
            }}>
              {coord.name}
            </h3>

            <p style={{ fontSize: "13px", fontWeight: 650, color: "#cbd5e1", margin: "0 0 2px 0", lineHeight: 1.4 }}>
              {coord.role}
            </p>
            
            <p style={{ fontSize: "11.5px", color: "#94a3b8", margin: "0 0 14px 0", fontWeight: 500, lineHeight: 1.4 }}>
              {coord.department}
            </p>

            {/* Sleek Mentorship Vision Quote Container */}
            <div className="spotlight-quote-card" style={{
              background: "rgba(22, 30, 46, 0.75)",
              border: "1px solid rgba(255, 153, 0, 0.25)",
              borderLeft: "4px solid #FF9900",
              borderRadius: "8px",
              padding: "16px 20px",
              width: "100%",
              boxShadow: "0 6px 20px rgba(0, 0, 0, 0.35)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <div style={{
                  width: 22, height: 22, borderRadius: 6,
                  background: "rgba(255, 153, 0, 0.12)", border: "1px solid rgba(255, 153, 0, 0.3)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#FF9900" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <span style={{
                  fontSize: "11px", fontWeight: 800, letterSpacing: "0.12em",
                  textTransform: "uppercase", color: "#FF9900",
                }}>
                  MENTORSHIP VISION & IMPACT
                </span>
              </div>

              <p style={{
                fontSize: "13px", lineHeight: "1.7", color: "#e2e8f0",
                fontWeight: 400, margin: 0, fontStyle: "normal",
                fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif",
                letterSpacing: "-0.005em",
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
