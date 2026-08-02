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
      style={{
        backgroundColor: "#ffffff",
        ...style,
      }}
      className={cn(
        "rounded-xl border border-slate-200 p-4 text-foreground transition-all duration-[250ms] ease-out shadow-xs",
        onClick && "cursor-pointer select-none hover:border-slate-400 hover:shadow-sm",
        className
      )}
      whileHover={undefined}
      whileTap={hoverEffect ? { scale: 0.97 } : undefined}
    >
      {children}
    </motion.div>
  );
}

