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
        padding: "52px 20px 60px",
        borderTop: previewData ? "none" : "1px solid rgba(255, 153, 0, 0.15)",
        borderBottom: previewData ? "none" : "1px solid rgba(255, 153, 0, 0.15)",
        scrollMarginTop: "100px",
      }}
    >
      <style>{`
        .coordinator-card {
          width: 100%;
          max-width: 680px;
          background: rgba(15, 23, 42, 0.8);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 153, 0, 0.25);
          border-radius: 28px;
          box-shadow: 0 20px 50px -10px rgba(0, 0, 0, 0.6), 0 0 35px rgba(255, 153, 0, 0.08);
          padding: 40px 36px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          position: relative;
          z-index: 10;
          transition: all 0.3s ease;
        }
        .coordinator-card:hover {
          border-color: rgba(255, 153, 0, 0.45);
          box-shadow: 0 25px 60px -10px rgba(255, 153, 0, 0.15), 0 0 45px rgba(255, 153, 0, 0.12);
        }
        .coordinator-avatar-frame {
          width: 130px;
          height: 130px;
          border-radius: 50%;
          overflow: hidden;
          position: relative;
          box-shadow: 0 0 25px rgba(255, 153, 0, 0.3), 0 8px 20px rgba(0, 0, 0, 0.5);
          border: 2.5px solid #FF9900;
          margin-bottom: 20px;
        }
        .coordinator-avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: top center;
          transition: transform 0.5s ease;
        }
        .coordinator-card:hover .coordinator-avatar-img {
          transform: scale(1.05);
        }

        @media (max-width: 640px) {
          .coordinator-card {
            padding: 28px 20px !important;
            border-radius: 20px !important;
          }
          .coordinator-avatar-frame {
            width: 110px !important;
            height: 110px !important;
            margin-bottom: 16px !important;
          }
        }
      `}</style>

      {/* Section Header */}
      <div style={{ position: "relative", zIndex: 10, textAlign: "center", marginBottom: 28 }}>
        <span style={{
          fontSize: "11px", fontWeight: 700, letterSpacing: "0.15em",
          textTransform: "uppercase", color: "#FF9900", display: "inline-flex", alignItems: "center", gap: 5,
          background: "rgba(255, 153, 0, 0.12)", border: "1px solid rgba(255, 153, 0, 0.3)",
          padding: "5px 14px", borderRadius: 20, marginBottom: 10,
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

      {/* Minimalist Centered Profile Card */}
      <div className="coordinator-card">
        {/* Avatar */}
        <div className="coordinator-avatar-frame">
          <img
            className="coordinator-avatar-img"
            src={coord.image}
            alt={coord.name}
          />
        </div>

        {/* Name */}
        <h3 style={{
          fontSize: "clamp(22px, 2.5vw, 26px)", fontWeight: 800,
          background: "linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          margin: "0 0 4px 0", letterSpacing: "-0.025em", lineHeight: 1.2,
        }}>
          {coord.name}
        </h3>

        {/* Role */}
        <p style={{ fontSize: "13.5px", fontWeight: 650, color: "#FF9900", margin: "0 0 3px 0", lineHeight: 1.4 }}>
          {coord.role}
        </p>

        {/* Department */}
        <p style={{ fontSize: "12px", color: "#94a3b8", margin: "0 0 20px 0", fontWeight: 500, lineHeight: 1.4 }}>
          {coord.department}
        </p>

        {/* Quote Block */}
        <div style={{
          background: "rgba(30, 41, 59, 0.4)",
          border: "1px solid rgba(255, 153, 0, 0.15)",
          borderRadius: 16,
          padding: "18px 22px",
          marginBottom: 24,
          maxWidth: "580px",
        }}>
          <p style={{
            fontSize: "13.5px", lineHeight: "1.7", color: "#e2e8f0",
            fontWeight: 400, margin: 0, fontStyle: "italic",
          }}>
            "{coord.bio}"
          </p>
        </div>

        {/* LinkedIn Pill Button */}
        <a
          href={coord.linkedin}
          target="_blank" rel="noopener noreferrer"
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            fontSize: 13, fontWeight: 700, color: "#ffffff",
            textDecoration: "none",
            background: "#0A66C2",
            borderRadius: 24, padding: "9px 22px",
            boxShadow: "0 4px 16px rgba(10, 102, 194, 0.35)",
            transition: "all 0.2s ease",
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
    </section>
  );
}
