"use client";
import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";

/* ─── Card data ─────────────────────────────────────────────────────────── */
const DEFAULT_CARDS = [
  {
    gradient: "linear-gradient(135deg,rgb(130,68,239),#4a7a9b)",
    label: "Cloud Matrix",
    sublabel: "120+ builders · Oct 2025 · 24 hours",
    image: "/images/cloud_jam.jpg",
    description: "An intensive cloud computing hackathon challenge where student builders collaborate in teams to architect, deploy, and scale innovative solutions on AWS. A true 24-hour sprint from concept to a production-ready application.",
  },
  {
    gradient: "linear-gradient(135deg,#0073BB,#005f9e)",
    label: "AI Workshop",
    sublabel: "Bedrock & LLMs · Feb 2026",
    image: "/images/ai_workshop.jpg",
    description: "A comprehensive generative AI hands-on session focusing on Amazon Bedrock. Students explored building applications using large language models (LLMs), prompt engineering, and building agentic assistants.",
  },
  {
    gradient: "linear-gradient(135deg,#FF9900,#E68900)",
    label: "Community Meetup",
    sublabel: "150+ members · Networking",
    image: "/images/community_meetup.jpg",
    description: "A community gathering bringing together cloud practitioners, student developers, and tech professionals to network, share case studies, and discuss the latest industry innovations.",
  },
  {
    gradient: "linear-gradient(135deg,#2c4a62,#3d6680)",
    label: "Certification Bootcamp",
    sublabel: "100+ students certified",
    image: "/images/bootcamp.jpg",
    description: "A focused interactive workspace session where students collaborated on preparation for AWS certifications, shared learnings from technical bootcamps, and engaged in peer mentoring.",
  },
  {
    gradient: "linear-gradient(135deg,#005f9e,#0073BB)",
    label: "re:Invent Watch Party",
    sublabel: "Cloud Matrix Event",
    image: "/images/ai_workshop.jpg",
    description: "An expert panel discussion and watch party highlighting the most exciting announcements and technical breakthroughs from AWS re:Invent, sharing actionable insights for developers.",
  },
  {
    gradient: "linear-gradient(135deg,#243448,#2d4f6b)",
    label: "Robo Wolke",
    sublabel: "Robotics & IoT Showcase · Dobot Magician",
    image: "/images/robo_wolke_journey.jpg",
    description: "An experimental robotics exhibition demonstrating the integration of cloud computing with physical hardware. The showcase highlighted controlling Dobot Magician robotic arms using AWS-backed cloud services.",
  },
];

/* ─── Stack layout constants ────────────────────────────────────────────── */
const CARD_H     = 460;   // card height px
const Y_STEP     = 12;    // vertical offset per depth level (stack peek)
const SCALE_STEP = 0.03;  // scale reduction per depth level
const AUTO_MS    = 3200;  // auto-advance interval (ms)

/* ─── Shared card face ──────────────────────────────────────────────────── */
function CardFace({
  card,
  index,
  total,
}: {
  card: (typeof DEFAULT_CARDS)[0];
  index: number;
  total: number;
}) {
  return (
    <div style={{ position: "relative", width: "100%", height: "100%", zIndex: 2 }}>
      {/* Text Content */}
      <div style={{ position: "relative", zIndex: 2 }}>
        <div
          style={{
            fontSize: "11px",
            fontWeight: 800,
            color: "#FF9900",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: "4px",
          }}
        >
          {card.sublabel}
        </div>
        <div
          style={{
            fontSize: "clamp(16px, 2.5vw, 19px)",
            fontWeight: 800,
            color: "#FFFFFF",
            marginBottom: "7px",
            lineHeight: 1.2,
          }}
        >
          {card.label}
        </div>
        <p
          style={{
            fontSize: "clamp(11.5px, 1.5vw, 13px)",
            color: "rgba(255, 255, 255, 0.82)",
            lineHeight: 1.5,
            margin: 0,
          }}
        >
          {card.description}
        </p>
      </div>
    </div>
  );
}

/* ─── Gallery ───────────────────────────────────────────────────────────── */
interface GalleryProps {
  previewData?: any[];
}

export default function Gallery({ previewData }: GalleryProps = {}) {
  const [cards, setCards] = useState<any[]>(previewData || DEFAULT_CARDS);
  const [order, setOrder] = useState<number[]>(() =>
    (previewData || DEFAULT_CARDS).map((_, i) => i)
  );
  const [flyingIdx, setFlyingIdx] = useState<number | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const N = cards.length;

  useEffect(() => {
    if (previewData) {
      setCards(previewData);
      setOrder(previewData.map((_, i) => i));
    }
  }, [previewData]);

  useEffect(() => {
    if (previewData) return;
    let active = true;
    api.get<any[]>("/homepage/journeys")
      .then((res) => {
        if (active && res && res.length > 0) {
          setCards(res);
          setOrder(res.map((_, i) => i));
        }
      })
      .catch((err) => console.error("Journeys dynamic fetch error:", err));
    return () => { active = false; };
  }, [previewData]);

  /* ── Advance: top card flies up, deck rotates ─────────────────────── */
  const advance = useCallback(() => {
    if (isBusy || order.length === 0) return;
    setIsBusy(true);

    const topCardIdx = order[0];
    setFlyingIdx(topCardIdx); // overlay takes over

    // Rotate deck instantly — layout spring handles reposition
    setOrder((prev) => {
      const [first, ...rest] = prev;
      return [...rest, first]; // top card goes to bottom
    });

    // Flying card exits over ~500ms, then we're done
    setTimeout(() => {
      setFlyingIdx(null);
      setIsBusy(false);
    }, 520);
  }, [isBusy, order]);

  /* ── Auto-advance ─────────────────────────────────────────────────── */
  useEffect(() => {
    const t = setInterval(advance, AUTO_MS);
    return () => clearInterval(t);
  }, [advance]);

  if (order.length === 0 || cards.length === 0) return null;

  const currentTopCard = cards[order[0]];

  return (
    <section
      id="gallery"
      style={{
        width: "100%",
        minHeight: "auto",
        padding: "32px 24px 16px",
        background: "#0b0f19", // Solid rich dark background to prevent bleed-through
        position: "relative",
        zIndex: 2, // Layer above fixed light-gradient background
        overflow: "hidden",
        scrollMarginTop: "80px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        boxSizing: "border-box",
      }}
    >
      {/* ── Immersive Blurred Background ──────────────────────────── */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0, overflow: "hidden" }}>
        <AnimatePresence mode="popLayout">
          {currentTopCard && (
            <motion.div
              key={currentTopCard.image}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }} // Increased ambient glow
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage: `url(${currentTopCard.image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                filter: "blur(50px) scale(1.15)", // Smooth edge blur
              }}
            />
          )}
        </AnimatePresence>
        {/* Dark radial gradient overlay for high contrast */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(circle at center, rgba(10, 15, 30, 0.65) 0%, rgba(10, 15, 30, 0.95) 100%)",
          }}
        />
      </div>

      {/* ── Centered Heading ──────────────────────────────────────── */}
      <div
        style={{
          zIndex: 2,
          textAlign: "center",
          maxWidth: "800px",
          marginBottom: "20px", // Compressed space
          position: "relative",
        }}
      >
        <span
          style={{
            fontSize: "11px",
            fontWeight: 800,
            color: "#FF9900",
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            display: "inline-block",
            marginBottom: "8px",
          }}
        >
          Interactive Showcase
        </span>
        <h2
          style={{
            fontSize: "clamp(1.3rem, 3vw, 1.8rem)",
            fontWeight: 600,
            color: "#FFFFFF",
            margin: "0 0 8px 0",
            letterSpacing: "-0.02em",
            lineHeight: 1.2,
            textShadow: "0 2px 12px rgba(0,0,0,0.5)",
          }}
        >
          Highlights From Our Builder Journey
        </h2>
        <p
          style={{
            fontSize: "clamp(13px, 1.4vw, 15px)",
            color: "rgba(255, 255, 255, 0.8)",
            lineHeight: 1.55,
            margin: 0,
            textShadow: "0 1px 6px rgba(0,0,0,0.3)",
          }}
        >
          Explore our hackathons, hands-on workshops, meetups, bootcamps, and robotics exhibitions.
        </p>
      </div>

      {/* ── Centered Photo Stack Container ────────────────────────── */}
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "900px", // Bigger (from 850px)
          height: CARD_H + (N - 1) * Y_STEP, // Total height calculation
          margin: "0 auto",
          zIndex: 2,
          cursor: isBusy ? "wait" : "pointer",
        }}
        onClick={advance}
      >
        {/* Stack cards — rendered back-to-front (bottom first) */}
        {[...order].reverse().map((cardIdx, revDepth) => {
          const depth = N - 1 - revDepth;
          const card = cards[cardIdx];
          const isTop = depth === 0;

          if (!card) return null;

          return (
            <motion.div
              key={cardIdx}
              layout
              animate={{
                y: depth * Y_STEP,
                scale: 1 - depth * SCALE_STEP,
                opacity:
                  isTop && flyingIdx === cardIdx
                    ? 0
                    : 1 - depth * 0.06,
              }}
              transition={{
                layout: { type: "spring", stiffness: 260, damping: 28 },
                opacity: { duration: 0.05 },
              }}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: CARD_H,
                borderRadius: 20,
                overflow: "hidden",
                background: card.gradient,
                zIndex: N - depth,
                transformOrigin: "top center",
                boxShadow: isTop
                  ? "0 24px 56px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,153,0,0.15), 0 0 30px rgba(255,153,0,0.08)"
                  : "0 8px 24px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,153,0,0.05)",
                userSelect: "none",
                pointerEvents: isTop ? "auto" : "none", // only allow interaction on top card
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Top half: Image */}
              <div style={{ height: "270px", width: "100%", position: "relative", overflow: "hidden" }}>
                {card.image && (
                  <img
                    src={card.image}
                    alt={card.label}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      objectPosition: "center",
                      opacity: isTop ? 1 : 0.75,
                    }}
                  />
                )}
                
                {/* Counter badge — top right of image */}
                <div
                  style={{
                    position: "absolute",
                    top: 18,
                    right: 18,
                    background: "rgba(15, 23, 42, 0.65)",
                    backdropFilter: "blur(8px)",
                    WebkitBackdropFilter: "blur(8px)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: 100,
                    padding: "3px 9px",
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#fff",
                    zIndex: 5,
                  }}
                >
                  {String(cardIdx + 1).padStart(2, "0")} / {String(N).padStart(2, "0")}
                </div>
              </div>

              {/* Bottom half: Solid dark text container */}
              <div
                style={{
                  height: "190px",
                  width: "100%",
                  background: "#111622",
                  borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                  padding: "20px 24px",
                  boxSizing: "border-box",
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <CardFace card={card} index={cardIdx} total={N} />
              </div>

              {/* Dimming shadow for cards deeper in stack */}
              {!isTop && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "rgba(10, 15, 25, 0.4)",
                    zIndex: 3,
                    pointerEvents: "none",
                  }}
                />
              )}
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
