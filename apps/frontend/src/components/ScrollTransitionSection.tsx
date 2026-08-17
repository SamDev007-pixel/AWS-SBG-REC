"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import JourneyCard from "./JourneyCard";

export default function ScrollTransitionSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Track scroll progress of this section relative to viewport
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Apply responsive spring physics to eliminate lag while maintaining ultra-smooth rendering
  const smoothScrollProgress = useSpring(scrollYProgress, {
    stiffness: 280,
    damping: 32,
    mass: 0.05,
    restDelta: 0.001
  });

  // Slanted clipPath transition: starts at a gentle 8vh slant and flattens out smoothly as it scrolls into view
  const clipProgress = useTransform(smoothScrollProgress, [0.08, 0.40], [8, 0]);
  const clipPath = useTransform(clipProgress, (val) => `polygon(0 ${val}vh, 100% 0vh, 100% 100%, 0% 100%)`);



  // Grid pattern and glow opacity transition: only visible when the background becomes dark
  const visualEffectsOpacity = useTransform(
    smoothScrollProgress,
    [0.1, 0.45],
    [0, 1]
  );

  return (
    <motion.section
      id="about"
      ref={containerRef}
      style={{
        position: "relative",
        minHeight: "auto",
        width: "100%",
        backgroundColor: "#060C17",
        backgroundImage: `
          linear-gradient(to bottom, rgba(6, 12, 23, 0.85) 0%, rgba(6, 12, 23, 0.75) 50%, rgba(6, 12, 23, 0.88) 100%),
          url('/images/crew_doodle_black_bg.png')
        `,
        backgroundSize: "450px auto",
        backgroundRepeat: "repeat",
        backgroundPosition: "center",
        zIndex: 10,
        scrollMarginTop: "80px",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "70px 24px 36px",
        boxSizing: "border-box",
        clipPath: clipPath,
      }}
    >

      {/* Ambient Dark Theme Glow Effects */}
      <motion.div
        style={{
          position: "absolute",
          top: "10%",
          left: "15%",
          width: "45vw",
          height: "45vw",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255, 153, 0, 0.08) 0%, transparent 70%)",
          filter: "blur(90px)",
          zIndex: 2,
          opacity: visualEffectsOpacity,
          pointerEvents: "none",
        }}
      />
      <motion.div
        style={{
          position: "absolute",
          bottom: "10%",
          right: "15%",
          width: "40vw",
          height: "40vw",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0, 115, 187, 0.1) 0%, transparent 70%)",
          filter: "blur(80px)",
          zIndex: 2,
          opacity: visualEffectsOpacity,
          pointerEvents: "none",
        }}
      />

      {/* Content Container Layer (Fades and slides up cleanly on scroll entry) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: "relative",
          zIndex: 5,
          maxWidth: "960px",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: "10px",
          pointerEvents: "auto",
        }}
      >
        {/* Badge Pill */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "linear-gradient(135deg, rgba(255, 153, 0, 0.12), rgba(255, 153, 0, 0.05))",
            border: "1px solid rgba(255, 153, 0, 0.22)",
            borderRadius: "100px",
            padding: "5px 14px",
            boxShadow: "0 0 12px rgba(255, 153, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
          }}
        >
          <span
            style={{
              fontSize: "10px",
              fontWeight: 800,
              color: "#FF9900",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Our Mission
          </span>
        </div>

        {/* Heading */}
        <h2
          style={{
            fontFamily: "'Outfit', 'Plus Jakarta Sans', sans-serif",
            fontSize: "clamp(1.5rem, 3.2vw, 2.2rem)",
            fontWeight: 700,
            color: "#FFFFFF",
            margin: 0,
            lineHeight: 1.2,
            letterSpacing: "-0.02em",
            backgroundImage: "linear-gradient(135deg, #FFFFFF 50%, #FFE9CC 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Empowering students to learn, build, and innovate on AWS.
        </h2>

        {/* Description paragraphs stacked vertically */}
        <div 
          style={{ 
            display: "flex", 
            flexDirection: "column", 
            gap: "8px", 
            width: "100%",
            maxWidth: "760px",
            margin: "2px auto 0 auto",
          }}
        >
          <p
            className="about-mission-text"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "clamp(13.5px, 1.35vw, 15.5px)",
              color: "#FFFFFF",
              lineHeight: 1.65,
              margin: 0,
              fontWeight: 600,
              textShadow: "0 1px 12px rgba(0, 0, 0, 0.9)",
            }}
          >
            AWS Student Builder Group REC is a student-driven cloud community at Rajalakshmi Engineering College dedicated to learning, building, and innovating with Amazon Web Services. We bring together aspiring developers, cloud enthusiasts, and future technology leaders to explore modern cloud technologies through practical experiences and collaborative learning.
          </p>
          <p
            className="about-mission-text"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "clamp(13.5px, 1.35vw, 15.5px)",
              color: "#FFFFFF",
              lineHeight: 1.65,
              margin: 0,
              fontWeight: 600,
              textShadow: "0 1px 12px rgba(0, 0, 0, 0.9)",
            }}
          >
            By combining technical knowledge with hands-on implementation, we help students transform ideas into real-world solutions while preparing them for the rapidly evolving technology industry.
          </p>
        </div>

        {/* Journey Timeline component */}
        <div style={{ width: "100%", position: "relative", marginTop: "4px" }}>
          <JourneyCard plain={true} hideDesc={false} isDark={true} hideTitle={true} />
        </div>
      </motion.div>
    </motion.section>
  );
}
