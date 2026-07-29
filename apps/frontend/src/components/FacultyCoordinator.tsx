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
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  // Handle ESC key to close modal & prevent background scrolling
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") setIsModalOpen(false);
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [isModalOpen]);

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
          border: 1px solid rgba(255, 153, 0, 0.55);
          border-radius: 8px;
          box-shadow: 0 16px 40px -10px rgba(0, 0, 0, 0.6), 0 0 24px rgba(255, 153, 0, 0.15);
          padding: 24px 28px;
          position: relative;
          z-index: 10;
          transition: all 0.3s ease;
        }
        .spotlight-banner-wrapper:hover {
          border-color: rgba(255, 153, 0, 0.75);
          box-shadow: 0 20px 50px -10px rgba(255, 153, 0, 0.22);
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
          border: 1px solid rgba(255, 153, 0, 0.35);
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
            border: 1px solid rgba(255, 153, 0, 0.15) !important;
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
              border: "1px solid rgba(255, 153, 0, 0.15)",
              borderRadius: "8px",
              padding: "16px 20px",
              width: "100%",
              boxShadow: "0 6px 20px rgba(0, 0, 0, 0.35)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{
                  fontSize: "11px", fontWeight: 800, letterSpacing: "0.12em",
                  textTransform: "uppercase", color: "#FF9900",
                }}>
                  MENTORSHIP VISION & IMPACT
                </span>
              </div>

              <p style={{
                fontSize: "13px", lineHeight: "1.7", color: "#e2e8f0",
                fontWeight: 400, margin: "0 0 12px 0", fontStyle: "normal",
                fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif",
                letterSpacing: "-0.005em",
              }}>
                "{coord.bio}"
              </p>

              {/* Trigger Button for Executive Profile Modal */}
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: "11.5px",
                  fontWeight: 750,
                  color: "#FF9900",
                  background: "rgba(255, 153, 0, 0.08)",
                  border: "1px solid rgba(255, 153, 0, 0.3)",
                  borderRadius: "4px",
                  padding: "6px 12px",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255, 153, 0, 0.16)";
                  e.currentTarget.style.borderColor = "rgba(255, 153, 0, 0.5)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255, 153, 0, 0.08)";
                  e.currentTarget.style.borderColor = "rgba(255, 153, 0, 0.3)";
                }}
              >
                <span>Read Full Profile & Tribute</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>

          </div>

        </div>
      </div>

      {/* Executive Profile & Tribute Modal */}
      {isModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 99999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
            backgroundColor: "rgba(8, 12, 20, 0.85)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false);
          }}
        >
          <div
            style={{
              position: "relative",
              width: "100%",
              maxWidth: "680px",
              maxHeight: "85vh",
              overflowY: "auto",
              backgroundColor: "#0D1424",
              border: "1px solid rgba(255, 153, 0, 0.4)",
              borderRadius: "8px",
              boxShadow: "0 25px 60px -10px rgba(0, 0, 0, 0.9), 0 0 30px rgba(255, 153, 0, 0.12)",
              padding: "28px 32px",
              color: "#E2E8F0",
              fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif",
            }}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                width: "32px",
                height: "32px",
                borderRadius: "4px",
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                color: "#94A3B8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255, 153, 0, 0.15)";
                e.currentTarget.style.color = "#FF9900";
                e.currentTarget.style.borderColor = "rgba(255, 153, 0, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                e.currentTarget.style.color = "#94A3B8";
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>

            {/* Modal Header */}
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px", paddingBottom: "16px", borderBottom: "1px solid rgba(255, 153, 0, 0.15)" }}>
              <div style={{ width: "56px", height: "56px", borderRadius: "6px", overflow: "hidden", border: "1px solid rgba(255, 153, 0, 0.35)", flexShrink: 0 }}>
                <img src={coord.image} alt={coord.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div>
                <span style={{
                  fontSize: "9.5px", fontWeight: 800, letterSpacing: "0.12em",
                  textTransform: "uppercase", color: "#FF9900", display: "inline-block", marginBottom: "3px",
                }}>
                  FACULTY COORDINATOR SPOTLIGHT
                </span>
                <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#FFFFFF", margin: 0, lineHeight: 1.25 }}>
                  Dr. Bhuvaneshwaran B
                </h3>
                <p style={{ fontSize: "12px", color: "#94A3B8", margin: "2px 0 0 0", fontWeight: 500 }}>
                  Assistant Professor, School of Computer Engineering · REC
                </p>
              </div>
            </div>

            {/* Professional Industry Certifications Badges */}
            <div style={{ marginBottom: "20px" }}>
              <span style={{ fontSize: "10px", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "#94A3B8", display: "block", marginBottom: "8px" }}>
                INDUSTRY CERTIFICATIONS & DOMAIN EXPERTISE
              </span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {["AWS", "IBM", "Oracle", "MongoDB", "Snowflake", "UiPath", "Microsoft", "Artificial Intelligence", "Cloud Computing", "Data Engineering", "Automation", "Software Development"].map((tech) => (
                  <span
                    key={tech}
                    style={{
                      fontSize: "10.5px",
                      fontWeight: 700,
                      color: tech === "AWS" ? "#FF9900" : "#CBD5E1",
                      background: tech === "AWS" ? "rgba(255, 153, 0, 0.12)" : "rgba(30, 41, 59, 0.8)",
                      border: tech === "AWS" ? "1px solid rgba(255, 153, 0, 0.4)" : "1px solid rgba(51, 65, 85, 0.8)",
                      borderRadius: "4px",
                      padding: "3px 9px",
                    }}
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Full 5-Paragraph Tribute Content */}
            <div style={{ fontSize: "13.5px", lineHeight: "1.75", color: "#CBD5E1" }}>
              <p style={{ marginTop: 0, marginBottom: "14px" }}>
                At the heart of every thriving student community is a mentor who inspires, guides, and empowers. We are privileged to have <strong style={{ color: "#FFFFFF" }}>Dr. Bhuvaneshwaran B</strong>, Assistant Professor, School of Computer Engineering, Rajalakshmi Engineering College, as the Faculty Coordinator of AWS Student Builders Group (SBG) REC.
              </p>

              <p style={{ marginBottom: "14px" }}>
                With extensive expertise in <strong style={{ color: "#FF9900" }}>Artificial Intelligence, Cloud Computing, Data Engineering, Automation, and Software Development</strong>, along with industry-recognized certifications from AWS, IBM, Oracle, MongoDB, Snowflake, UiPath, and Microsoft, he brings invaluable knowledge and vision to our community.
              </p>

              <p style={{ marginBottom: "14px" }}>
                Beyond technical mentorship, Sir constantly motivates us to think innovatively, embrace emerging technologies, and transform ideas into impactful solutions. His guidance extends far beyond classrooms—encouraging students to participate in hackathons, cloud-based projects, workshops, certifications, technical events, research initiatives, and collaborative learning opportunities.
              </p>

              <p style={{ marginBottom: "14px" }}>
                Through his continuous support, insightful feedback, and unwavering encouragement, he has fostered an environment where students are empowered to explore, experiment, and excel. His mentorship inspires us to strengthen our technical foundations, develop leadership qualities, and build solutions that create meaningful impact.
              </p>

              <p style={{ marginBottom: 0, padding: "14px 16px", background: "rgba(255, 153, 0, 0.06)", borderLeft: "3px solid #FF9900", borderRadius: "0 4px 4px 0", color: "#E2E8F0" }}>
                We are deeply grateful for his dedication, encouragement, and belief in our potential. His mentorship continues to shape AWS SBG REC into a community driven by innovation, collaboration, and a passion for lifelong learning.
              </p>
            </div>

            {/* Bottom Close Button */}
            <div style={{ marginTop: "24px", paddingTop: "16px", borderTop: "1px solid rgba(255, 153, 0, 0.15)", display: "flex", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#FFFFFF",
                  background: "rgba(255, 153, 0, 0.2)",
                  border: "1px solid rgba(255, 153, 0, 0.4)",
                  borderRadius: "4px",
                  padding: "7px 18px",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#FF9900";
                  e.currentTarget.style.color = "#0B0F19";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255, 153, 0, 0.2)";
                  e.currentTarget.style.color = "#FFFFFF";
                }}
              >
                Close Profile
              </button>
            </div>

          </div>
        </div>
      )}
    </section>
  );
}
