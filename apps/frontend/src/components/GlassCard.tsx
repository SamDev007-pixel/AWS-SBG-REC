"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  hoverEffect?: boolean;
  delay?: number;
}

export default function GlassCard({
  children,
  className,
  style,
  onClick,
  hoverEffect = true,
  delay = 0,
}: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      onClick={onClick}
      style={style}
      className={cn(
        "glass-panel rounded-[22px] overflow-hidden p-6 text-foreground border border-white/25 transition-all duration-[250ms] ease-out",
        onClick && "cursor-pointer select-none",
        className
      )}
      whileHover={
        hoverEffect
          ? {
            y: -4,
            boxShadow:
              "0 14px 28px -5px rgba(35, 47, 62, 0.12), 0 10px 14px -6px rgba(0, 0, 0, 0.05)",
            borderColor: "rgba(255, 255, 255, 0.8)",
            backgroundColor: "rgba(255, 255, 255, 0.98)",
            transition: { duration: 0.2, ease: "easeOut" },
          }
          : undefined
      }
      whileTap={hoverEffect ? { scale: 0.97 } : undefined}
    >
      {children}
    </motion.div>
  );
}

