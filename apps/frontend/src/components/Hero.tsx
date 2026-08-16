"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { Play } from "lucide-react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

const FRAME_COUNT = 96;

const DecorativeGrid = ({ 
  rows, 
  cols, 
  dotColor = "#94a3b8", 
  activeDot, 
  activeColor = "#FF9900", 
  opacity,
  style 
}: { 
  rows: number; 
  cols: number; 
  dotColor?: string; 
  activeDot?: { r: number; c: number }; 
  activeColor?: string; 
  opacity?: number;
  style?: React.CSSProperties;
}) => {
  return (
    <div style={{ position: "absolute", pointerEvents: "none", zIndex: 2, ...style }}>
      <svg 
        width={cols * 16} 
        height={rows * 16} 
        viewBox={`0 0 ${cols * 16} ${rows * 16}`}
      >
        {Array.from({ length: rows }).map((_, r) =>
          Array.from({ length: cols }).map((_, c) => {
            const isActive = activeDot && activeDot.r === r && activeDot.c === c;
            const isOrange = dotColor.toLowerCase().includes("ff9900");
            const defaultOpacity = isOrange ? 0.30 : 0.42;
            const finalOpacity = isActive ? 0.9 : (opacity !== undefined ? opacity : defaultOpacity);
            return (
              <circle
                key={`${r}-${c}`}
                cx={8 + c * 16}
                cy={8 + r * 16}
                r={isActive ? "2.2" : "1.6"}
                fill={isActive ? activeColor : dotColor}
                opacity={finalOpacity}
              />
            );
          })
        )}
      </svg>
    </div>
  );
};

interface HeroProps {
  previewData?: {
    badge: string;
    titleHighlight: string;
    subtitle: string;
  };
  forceMobile?: boolean;
}

export default function Hero({ previewData, forceMobile }: HeroProps = {}) {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [windowWidth, setWindowWidth] = useState(1200);
  const [viewportHeight, setViewportHeight] = useState(800);
  const imagesRef = useRef<(HTMLImageElement | null)[]>([]);
  const rafIdRef = useRef<number | null>(null);
  const lastIndexRef = useRef<number>(-1);
  
  const [heroData, setHeroData] = useState(previewData || {
    badge: "Rajalakshmi Engineering College",
    titleHighlight: "AWS SBG REC",
    subtitle: "Learn cloud computing through structured roadmaps, industry-recognized certifications, hands-on projects, workshops, and a thriving builder community.",
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const viewportHeightRef = useRef(800);

  useEffect(() => {
    if (previewData) {
      setHeroData(previewData);
    }
  }, [previewData]);

  useEffect(() => {
    if (previewData) return;
    let active = true;
    api.get<any>("/homepage/hero")
      .then((res) => {
        if (active && res) {
          setHeroData(res);
        }
      })
      .catch((err) => {
        // Silently use fallback default hero data
      });
    return () => { active = false; };
  }, [previewData]);

  // Check mobile viewport size, width, and height
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(!!forceMobile || window.innerWidth < 1024);
      setWindowWidth(window.innerWidth);
      setViewportHeight(window.innerHeight);
      viewportHeightRef.current = window.innerHeight;
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [forceMobile]);

  // Framer Motion scroll hooks mapping scroll progress to frame index
  const { scrollYProgress, scrollY } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Smooth, responsive spring physics for fluid, deliberate frame scrubbing
  const smoothScroll = useSpring(scrollYProgress, {
    stiffness: 240,
    damping: 32,
    mass: 0.08,
    restDelta: 0.0005,
  });

  // Piecewise frame scrubbing: allocates extra scroll travel to the "Hi" wave pose (frames 30-70) to make it scroll slower
  const frameIndex = useTransform(
    smoothScroll,
    [0, 0.16, 0.54, 0.70],
    [0, 30, 70, FRAME_COUNT - 1]
  );

  // Translate the fixed container up seamlessly as user reaches the about section (from 280vh to 380vh)
  const y = useTransform(scrollY, (latestScrollY) => {
    const currentHeight = viewportHeightRef.current;
    const startScroll = currentHeight * 2.8;
    const endScroll = currentHeight * 3.8;
    if (latestScrollY <= startScroll) {
      return 0;
    }
    if (latestScrollY >= endScroll) {
      return -currentHeight;
    }
    return -(latestScrollY - startScroll);
  });
  
  // Fade out the fixed container and disable pointer events at the very end of the scroll-up transition
  const opacity = useTransform(scrollY, (latestScrollY) => {
    const currentHeight = viewportHeightRef.current;
    const fadeStart = currentHeight * 3.65;
    const fadeEnd = currentHeight * 3.8;
    if (latestScrollY <= fadeStart) {
      return 1;
    }
    if (latestScrollY >= fadeEnd) {
      return 0;
    }
    const progress = (latestScrollY - fadeStart) / (currentHeight * 0.15);
    return 1 - progress;
  });

  const pointerEvents = useTransform(scrollY, (v) => {
    const currentHeight = viewportHeightRef.current;
    return v >= currentHeight * 3.8 ? "none" as const : "auto" as const;
  });

  // Find the closest loaded frame to avoid missing renders while streaming frames
  const getNearestLoadedImage = useCallback((targetIndex: number): HTMLImageElement | null => {
    const list = imagesRef.current;
    if (!list || list.length === 0) return null;
    const clamped = Math.max(0, Math.min(FRAME_COUNT - 1, Math.round(targetIndex)));
    if (list[clamped] && list[clamped]?.complete && list[clamped]!.naturalWidth > 0) {
      return list[clamped];
    }
    for (let offset = 1; offset < FRAME_COUNT; offset++) {
      const left = clamped - offset;
      const right = clamped + offset;
      if (left >= 0 && list[left] && list[left]?.complete && list[left]!.naturalWidth > 0) {
        return list[left];
      }
      if (right < FRAME_COUNT && list[right] && list[right]?.complete && list[right]!.naturalWidth > 0) {
        return list[right];
      }
    }
    return null;
  }, []);

  // Paint single frame onto canvas with 4x Super-Resolution scaling, balanced symmetry, and clean background blend
  const renderFrame = useCallback((index: number, ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, forceRedraw = false) => {
    const valid = Math.max(0, Math.min(FRAME_COUNT - 1, Math.round(index)));
    if (!forceRedraw && valid === lastIndexRef.current) return;
    lastIndexRef.current = valid;

    const img = getNearestLoadedImage(valid);
    if (img && img.complete && img.naturalWidth > 0) {
      const dpr = Math.min(typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1, 2.5);
      const cssWidth = window.innerWidth;
      const cssHeight = window.innerHeight;
      const targetWidth = Math.round(cssWidth * dpr);
      const targetHeight = Math.round(cssHeight * dpr);

      // Ensure canvas internal bitmap matches display DPI 1:1
      if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        canvas.style.width = `${cssWidth}px`;
        canvas.style.height = `${cssHeight}px`;
      }
      
      // Reset transform and scale for high-DPI
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // Tightly-cropped Super-Resolution image dimensions (1640 x 1440, ratio ~1.1388)
      const imgW = img.naturalWidth;
      const imgH = img.naturalHeight;
      const cropRatio = imgW / imgH; // ~1.1388
      
      // Right half of screen
      const rightSectionWidth = cssWidth * 0.50;
      
      // Prominent, balanced height (76% of viewport height, max 620px, min 420px) to eliminate empty gaps
      let drawHeight = Math.min(Math.max(cssHeight * 0.76, 420), 620);
      let drawWidth = drawHeight * cropRatio;
      
      // Ensure drawWidth fits comfortably within 92% of the right half
      const maxDrawWidth = rightSectionWidth * 0.92;
      if (drawWidth > maxDrawWidth) {
        drawWidth = maxDrawWidth;
        drawHeight = drawWidth / cropRatio;
      }
      
      // Symmetrically centered in the right column
      const shiftLeft = cssWidth > 1400 ? 35 : cssWidth > 1100 ? 20 : 10;
      const roundedOffsetX = Math.round(cssWidth * 0.50 + (rightSectionWidth - drawWidth) / 2 - shiftLeft);
      
      // Vertically balanced and shifted slightly down to align with CTA buttons
      const shiftDown = cssHeight > 800 ? 32 : 20;
      const roundedOffsetY = Math.round((cssHeight - drawHeight) / 2 + shiftDown);
      const roundedDrawWidth = Math.round(drawWidth);
      const roundedDrawHeight = Math.round(drawHeight);
      
      ctx.clearRect(0, 0, cssWidth, cssHeight);
      
      // Direct 2K Super-Resolution frame draw downscaled on Retina canvas for crystal-clear quality
      ctx.drawImage(img, 0, 0, imgW, imgH, roundedOffsetX, roundedOffsetY, roundedDrawWidth, roundedDrawHeight);
    }
  }, [getNearestLoadedImage]);

  // Non-blocking streaming frame loader with immediate Canvas High-DPI setup
  useEffect(() => {
    if (isMobile || !!previewData) return;

    const loadedList: (HTMLImageElement | null)[] = new Array(FRAME_COUNT).fill(null);
    imagesRef.current = loadedList;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Immediately initialize canvas bitmap to High-DPI resolution on mount
    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    canvas.width = Math.round(window.innerWidth * dpr);
    canvas.height = Math.round(window.innerHeight * dpr);
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;

    const triggerRedraw = () => {
      if (canvas && ctx) {
        renderFrame(frameIndex.get(), ctx, canvas, true);
      }
    };

    // 1. Immediately load frame 0 with cache-buster to render instantly on mount
    const frame0 = new Image();
    frame0.src = `/assets/hero-sequence/0.webp?v=len96`;
    frame0.onload = () => {
      loadedList[0] = frame0;
      triggerRedraw();
    };
    loadedList[0] = frame0;

    // 2. Stream remaining frames in non-blocking background batches
    let currentIndex = 1;
    let timer: NodeJS.Timeout | null = null;
    const BATCH_SIZE = 8;

    const streamNextBatch = () => {
      if (currentIndex >= FRAME_COUNT) return;
      const limit = Math.min(currentIndex + BATCH_SIZE, FRAME_COUNT);
      for (let i = currentIndex; i < limit; i++) {
        const img = new Image();
        img.src = `/assets/hero-sequence/${i}.webp?v=len96`;
        img.onload = () => {
          loadedList[i] = img;
        };
        img.onerror = () => {
          // ignore failures
        };
        loadedList[i] = img;
      }
      currentIndex = limit;
      if (currentIndex < FRAME_COUNT) {
        timer = setTimeout(streamNextBatch, 25);
      }
    };

    timer = setTimeout(streamNextBatch, 40);

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isMobile, previewData, frameIndex, renderFrame]);

  // Canvas drawing effect triggered on resize and scroll index updates
  useEffect(() => {
    if (isMobile) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    const handleCanvasResize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      lastIndexRef.current = -1; // force redraw
      renderFrame(frameIndex.get(), ctx, canvas, true);
    };
    
    handleCanvasResize();
    window.addEventListener("resize", handleCanvasResize);
    
    const unsubscribe = frameIndex.on("change", (latest) => {
      if (rafIdRef.current !== null) cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = requestAnimationFrame(() => {
        renderFrame(latest, ctx, canvas);
        rafIdRef.current = null;
      });
    });
    
    return () => {
      unsubscribe();
      window.removeEventListener("resize", handleCanvasResize);
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [isMobile, frameIndex, renderFrame]);

  // Mobile View: Clean responsive layout with single static image fallback
  if (isMobile) {
    return (
      <section
        id="home"
        style={{
          width: "100%",
          minHeight: previewData ? "400px" : "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#ffffff",
          position: "relative",
          overflow: "hidden",
          padding: previewData ? "20px 12px" : "80px 20px 32px",
          boxSizing: "border-box",
          zIndex: 2,
        }}
      >
        {/* Technical Grid Pattern Overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `
              linear-gradient(to right, rgba(15, 23, 42, 0.03) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(15, 23, 42, 0.03) 1px, transparent 1px)
            `,
            backgroundSize: "36px 36px",
            maskImage: "radial-gradient(circle at center, black 50%, transparent 95%)",
            WebkitMaskImage: "radial-gradient(circle at center, black 50%, transparent 95%)",
            zIndex: 1,
            pointerEvents: "none",
          }}
        />

        {/* Decorative Grid Ornaments for Mobile */}
        {!previewData && (
          <>
            <DecorativeGrid rows={3} cols={4} style={{ top: "35px", left: "2%" }} />
            <DecorativeGrid rows={4} cols={3} dotColor="#FF9900" opacity={0.25} style={{ bottom: "60px", right: "3%" }} />

            {/* Top Right Circuit Graphic - Scaled for Mobile */}
            <div 
              style={{ 
                position: "absolute",
                top: "35px", 
                right: "0px",
                width: "100px",
                zIndex: 10,
                pointerEvents: "none",
              }}
            >
              <svg 
                viewBox="0 0 240 70" 
                width="100%" 
                height="auto" 
                style={{ 
                  opacity: 0.95,
                  display: "block"
                }}
              >
                <path 
                  d="M 100 20 L 125 40 L 165 40 L 190 20 L 240 20" 
                  stroke="#475569" 
                  strokeWidth="1.0"
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  fill="none" 
                />
                <path 
                  d="M 180 50 a 6 6 0 0 1 3 -11 a 9 9 0 0 1 15 -3 a 6 6 0 0 1 9 5 a 5 5 0 0 1 1 9 z" 
                  stroke="#cbd5e1" 
                  strokeWidth="1.0" 
                  fill="#ffffff" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />
                <circle cx="100" cy="20" r="1.8" fill="#0f172a" />
                <rect x="142" y="37" width="6" height="6" transform="rotate(45 145 40)" fill="#FF9900" stroke="#475569" strokeWidth="1.0" rx="1" />
                <circle cx="145" cy="40" r="1.0" fill="#ffffff" />
              </svg>
            </div>
          </>
        )}

        {/* Premium Gradient Blobs */}
        <div
          style={{
            position: "absolute",
            top: "10%",
            right: "15%",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(0, 115, 187, 0.05) 0%, rgba(255, 255, 255, 0) 70%)",
            filter: "blur(40px)",
            pointerEvents: "none",
            zIndex: 1,
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "10%",
            left: "10%",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255, 153, 0, 0.05) 0%, rgba(255, 255, 255, 0) 70%)",
            filter: "blur(50px)",
            pointerEvents: "none",
            zIndex: 1,
          }}
        />

        {/* Main Container - Balanced Vertical Stack */}
        <div
          style={{
            width: "100%",
            maxWidth: "520px",
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            position: "relative",
            zIndex: 10,
          }}
        >
          {/* Main Title */}
          <h1
            style={{
              fontSize: previewData ? "20px" : "clamp(25px, 6.2vw, 36px)",
              lineHeight: 1.18,
              fontWeight: 800,
              color: "#0F172A",
              letterSpacing: "-0.02em",
              marginBottom: "10px",
              fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            }}
          >
            Build Your Cloud Future
            <br />
            With <span style={{ color: "#FF9900", fontWeight: 800 }}>{heroData.titleHighlight}</span>
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: previewData ? "12px" : "clamp(13px, 3.4vw, 15px)",
              lineHeight: 1.5,
              color: "#475569",
              fontWeight: 500,
              maxWidth: "460px",
              margin: "0 auto 16px auto",
              fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            }}
          >
            {heroData.subtitle}
          </p>

          {/* Action Buttons */}
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              width: "100%",
              maxWidth: "380px",
              margin: "0 auto 20px auto",
            }}
          >
            {/* Join Community button */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => router.push("/signup")}
              style={{
                flex: "1 1 0",
                height: "48px",
                padding: "0 18px",
                background: "linear-gradient(180deg, #FF9900 0%, #FF8800 100%)",
                color: "#ffffff",
                border: "none",
                fontWeight: 700,
                fontSize: "14px",
                cursor: "pointer",
                fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                borderRadius: "12px",
                boxShadow: "0 4px 14px rgba(255, 153, 0, 0.28)",
                outline: "none",
                whiteSpace: "nowrap",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              Join Community
            </motion.button>

            {/* Explore Roadmap button */}
            <motion.button
              onClick={() => router.push("/login")}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              style={{
                flex: "1 1 0",
                height: "48px",
                background: "#ffffff",
                border: "1.5px solid rgba(226, 232, 240, 0.95)",
                color: "#0F172A",
                fontSize: "13.5px",
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                padding: "0 16px",
                borderRadius: "12px",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
                fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                outline: "none",
                whiteSpace: "nowrap",
              }}
            >
              <div
                style={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  border: "1.5px solid #FF9900",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#FF9900",
                  backgroundColor: "rgba(255, 153, 0, 0.08)",
                  flexShrink: 0,
                }}
              >
                <Play size={10} fill="#FF9900" style={{ marginLeft: "2px" }} />
              </div>
              Explore Roadmap
            </motion.button>
          </div>

          {/* Character Illustration - Cleanly scaled and positioned */}
          {!previewData && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              style={{
                width: "100%",
                maxWidth: "330px",
                position: "relative",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <img
                src="/assets/hero-mobile-last.webp?v=last_pose_v1"
                alt="AWS SBG REC Student Builder"
                style={{
                  width: "100%",
                  height: "auto",
                  display: "block",
                  filter: "drop-shadow(0 12px 24px rgba(0, 0, 0, 0.05))",
                }}
              />
            </motion.div>
          )}
        </div>
      </section>
    );
  }

  // Desktop View: Scroll-Driven canvas frame scrubbing
  return (
    <div
      id="home"
      ref={containerRef}
      style={{
        position: "relative",
        height: previewData ? "450px" : "380vh", // scrolling track
        width: "100%",
      }}
    >
      <motion.div
        style={{
          position: previewData ? "absolute" : "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: previewData ? 0 : undefined,
          height: previewData ? "100%" : "100vh",
          overflow: "hidden",
          backgroundColor: "#ffffff", // Solid white background to serve as the backdrop for multiply blending
          opacity: previewData ? 1 : opacity,
          y: previewData ? 0 : y,
          pointerEvents: previewData ? "auto" : pointerEvents,
          zIndex: 5,
        }}
      >
        {/* Top Right Circuit Graphic - Positioned under the navbar Join Us button */}
        {!previewData && (
          <div 
            style={{ 
              position: "absolute",
              top: "80px", 
              right: 0,
              width: "240px",
              zIndex: 10,
              pointerEvents: "none",
            }}
          >
            <svg 
              viewBox="0 0 240 70" 
              width="100%" 
              height="auto" 
              style={{ 
                opacity: 0.95,
                display: "block"
              }}
            >
              {/* Circuit Line */}
              <path 
                d="M 100 20 L 125 40 L 165 40 L 190 20 L 240 20" 
                stroke="#475569" 
                strokeWidth="1.0" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                fill="none" 
              />

              {/* Floating Cloud Outline */}
              <path 
                d="M 180 50 a 6 6 0 0 1 3 -11 a 9 9 0 0 1 15 -3 a 6 6 0 0 1 9 5 a 5 5 0 0 1 1 9 z" 
                stroke="#cbd5e1" 
                strokeWidth="1.0" 
                fill="#ffffff" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />

              {/* Starting Terminal Dot */}
              <circle cx="100" cy="20" r="1.8" fill="#0f172a" />

              {/* Node (Orange Diamond) */}
              <rect x="142" y="37" width="6" height="6" transform="rotate(45 145 40)" fill="#FF9900" stroke="#475569" strokeWidth="1.0" rx="1" />
              <circle cx="145" cy="40" r="1.0" fill="#ffffff" />
            </svg>
          </div>
        )}

        {/* Radial-Masked Grid Background Pattern */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `
              linear-gradient(to right, rgba(15, 23, 42, 0.02) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(15, 23, 42, 0.02) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
            maskImage: "radial-gradient(ellipse at center, black 50%, transparent 85%)",
            WebkitMaskImage: "radial-gradient(ellipse at center, black 50%, transparent 85%)",
            zIndex: 0,
            pointerEvents: "none",
          }}
        />

        {/* Decorative Grid Ornaments */}
        {!previewData && (
          <>
            <DecorativeGrid rows={3} cols={5} activeDot={{ r: 0, c: 3 }} style={{ top: "14vh", left: "6%" }} />
            <DecorativeGrid rows={6} cols={3} dotColor="#FF9900" style={{ top: "48vh", left: "3%" }} />
            <DecorativeGrid rows={4} cols={4} activeDot={{ r: 2, c: 1 }} style={{ top: "16vh", right: "26%" }} />
            <DecorativeGrid rows={5} cols={3} dotColor="#FF9900" style={{ top: "52vh", right: "4%" }} />
            <DecorativeGrid rows={3} cols={6} style={{ bottom: "24vh", left: "8%" }} />
            {/* Center Blank Space Fillers */}
            <DecorativeGrid rows={5} cols={3} dotColor="#FF9900" style={{ top: "40vh", left: "46%" }} />
          </>
        )}

        {/* Canvas Background Frame Playback */}
        {!previewData && (
          <canvas
            ref={canvasRef}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              zIndex: 1,
              pointerEvents: "none",
              mixBlendMode: "multiply", // Multiplies frame white background seamlessly with the grid and tech pattern
            }}
          />
        )}

        {/* Content Overlay */}
        <div
          style={{
            width: "100%",
            height: "100%",
            position: "relative",
            zIndex: 10,
            display: "flex",
            justifyContent: "flex-start", // Left-aligned layout horizontally
            alignItems: "center",         // Centered vertically
          }}
        >
          {/* Left half container to center the text column in the left 50% of the screen */}
          <div
            style={{
              width: "50%",
              height: "100%", // Fill the full height of the parent Overlay container
              display: "flex",
              flexDirection: "column",
              justifyContent: "center", // Vertically center the text content wrapper
              alignItems: "center",     // Horizontally center the text content wrapper
              paddingLeft: "clamp(30px, 4vw, 60px)",
              paddingRight: "20px",
              boxSizing: "border-box",
              position: "relative",
            }}
          >
            {/* Left-Aligned Content Wrapper */}
            <div
              style={{
                width: "100%",
                maxWidth: previewData ? "100%" : (windowWidth > 1400 ? "600px" : windowWidth > 1200 ? "540px" : "460px"),
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",    // Left-aligned items
                textAlign: "left",           // Left-aligned text
                zIndex: 20,
              }}
            >
            {/* Main Title */}
            <h1
              style={{
                fontSize: previewData ? "26px" : "clamp(36px, 4.0vw, 54px)",
                lineHeight: previewData ? 1.25 : 1.15,
                fontWeight: 800,
                color: "#0F172A",
                letterSpacing: "-0.015em",
                marginBottom: previewData ? "10px" : "20px",
                fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                textShadow: "0 2px 20px rgba(255, 255, 255, 0.85)",
              }}
            >
              Build Your
              <br />
              Cloud Future
              <br />
              With <span style={{ color: "#E68A00", fontWeight: 800 }}>{heroData.titleHighlight}</span>
            </h1>

            <p
              style={{
                fontSize: previewData ? "13px" : "clamp(15px, 1.3vw, 18px)",
                lineHeight: previewData ? 1.5 : 1.6,
                color: "#334155",
                fontWeight: 600,
                marginBottom: previewData ? "16px" : "40px",
                maxWidth: "680px",
                margin: previewData ? "0 0 16px 0" : "0 0 40px 0",
                fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                textShadow: "0 1px 12px rgba(255, 255, 255, 0.85)",
              }}
            >
              {heroData.subtitle}
            </p>

            {/* Buttons */}
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "flex-start",
                gap: previewData ? "16px" : "24px",
                width: "auto",
              }}
            >
              {/* Join Community slanted orange button */}
              <button
                onClick={() => router.push("/signup")}
                style={{
                  width: "auto",
                  padding: previewData ? "10px 24px" : "15px 36px",
                  background: "#FF9900",
                  color: "#ffffff",
                  border: "none",
                  fontWeight: 700,
                  fontSize: previewData ? "14px" : "17px",
                  cursor: "pointer",
                  fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                  transform: "skewX(-20deg) scale(1)",
                  borderRadius: "12px",
                  boxShadow: "none",
                  outline: "none",
                  transition: "transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "skewX(-20deg) scale(1.04)";
                  e.currentTarget.style.backgroundColor = "#E68A00";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "skewX(-20deg) scale(1)";
                  e.currentTarget.style.backgroundColor = "#FF9900";
                }}
              >
                <span style={{ display: "inline-block", transform: "skewX(20deg)" }}>
                  Join Community
                </span>
              </button>

              {/* Explore Roadmap button */}
              <motion.button
                onClick={() => router.push("/login")}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  width: "auto",
                  background: "transparent",
                  border: "none",
                  color: "#0F172A",
                  fontSize: previewData ? "14px" : "17px",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: previewData ? "8px" : "11px",
                  padding: "10px 16px",
                  fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                  outline: "none",
                }}
              >
                <div
                  style={{
                    width: previewData ? "36px" : "48px",
                    height: previewData ? "36px" : "48px",
                    borderRadius: "50%",
                    border: "2px solid #FF9900",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#FF9900",
                    backgroundColor: "rgba(255, 153, 0, 0.03)",
                    transition: "all 0.2s ease",
                  }}
                >
                  <Play size={previewData ? 12 : 16} fill="#FF9900" style={{ marginLeft: "4px" }} />
                </div>
                Explore Roadmap
              </motion.button>
            </div>
            </div> {/* closes Left-Aligned Content Wrapper */}

            {/* Bottom Left Circuit Graphic */}
            {!previewData && (
              <div 
                style={{ 
                  position: "absolute",
                  bottom: "5vh",
                  left: "40px",
                  width: "100%", 
                  maxWidth: "320px",
                  zIndex: 10,
                }}
              >
              <svg 
                viewBox="0 0 500 130" 
                width="100%" 
                height="auto" 
                style={{ 
                  opacity: 0.95,
                  marginLeft: "-25px",
                  display: "block"
                }}
              >
                {/* Grid Dots */}
                {Array.from({ length: 4 }).map((_, rIndex) => 
                  Array.from({ length: 9 }).map((_, cIndex) => {
                    const cx = 350 + cIndex * 15;
                    const cy = 35 + rIndex * 10;
                    const isOrange = rIndex === 0 && cIndex === 0;
                    return (
                      <circle 
                        key={`dot-${rIndex}-${cIndex}`} 
                        cx={cx} 
                        cy={cy} 
                        r="0.8"
                        fill={isOrange ? "#FF9900" : "#cbd5e1"} 
                      />
                    );
                  })
                )}

                {/* Circuit Line */}
                <path 
                  d="M 0 25 L 25 25 L 65 65 L 250 65 L 270 45 L 410 45" 
                  stroke="#475569" 
                  strokeWidth="1.0"
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  fill="none" 
                />

                {/* Floating Cloud Outline */}
                <path 
                  d="M 65 35 a 10 10 0 0 1 5 -18 a 15 15 0 0 1 25 -5 a 10 10 0 0 1 15 8 a 8 8 0 0 1 2 15 z" 
                  stroke="#cbd5e1" 
                  strokeWidth="1.0"
                  fill="#ffffff" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />

                {/* Node 1 - Orange Diamond with white center */}
                <rect x="22" y="22" width="6" height="6" transform="rotate(45 25 25)" fill="#FF9900" stroke="#475569" strokeWidth="1.0" rx="1" />
                <circle cx="25" cy="25" r="1.0" fill="#ffffff" />
                
                {/* Node 2 - Orange Diamond with white center */}
                <rect x="317" y="42" width="6" height="6" transform="rotate(45 320 45)" fill="#FF9900" stroke="#475569" strokeWidth="1.0" rx="1" />
                <circle cx="320" cy="45" r="1.0" fill="#ffffff" />

                {/* Node 3 - Terminal dark slate dot */}
                <circle cx="410" cy="45" r="1.8" fill="#0f172a" />
              </svg>
            </div>
          )}
        </div> {/* closes 50% Left Half Container */}

        {/* Right half container for illustration (only in previewData mode) */}
        {previewData && (
          <div
            style={{
              width: "50%",
              height: "100%",
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              paddingRight: "30px",
              overflow: "hidden",
            }}
          >
            <img
              src="/assets/hero-sequence/0.webp"
              alt="AWS SBG REC Preview"
              style={{
                maxHeight: "85%",
                maxWidth: "90%",
                objectFit: "contain",
                objectPosition: "center right",
                mixBlendMode: "multiply",
                pointerEvents: "none",
              }}
            />
          </div>
        )}
      </div> {/* closes Content Overlay */}
      </motion.div>
    </div>
  );
}
