"use client";

import { type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

interface BentoGridProps {
  children: ReactNode;
  className?: string;
}

export function BentoGrid({ children, className }: BentoGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 auto-rows-[minmax(180px,auto)] gap-4 md:gap-5",
        className,
      )}
    >
      {children}
    </div>
  );
}

interface BentoItemProps {
  children: ReactNode;
  className?: string;
  span?: string;
  tone?: "light" | "dark" | "primary" | "cream";
  hover?: boolean;
  index?: number;
}

const tones = {
  light:
    "bg-card border border-border/60 text-foreground hover:border-primary/25",
  dark: "bg-[#0d0a09] border border-white/10 text-white hover:border-white/25",
  primary:
    "bg-gradient-to-br from-primary via-[#8a0014] to-[#6a0010] text-white border border-white/10",
  cream: "bg-[#f5ede1] text-[#1a0f0f] border border-[#d9c9b0]/60",
};

export function BentoItem({
  children,
  className,
  span = "lg:col-span-2",
  tone = "light",
  hover = true,
  index = 0,
}: BentoItemProps) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0, y: reduce ? 0 : 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: 0.8,
        delay: reduce ? 0 : index * 0.06,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={cn(
        "group/bento relative rounded-3xl p-6 md:p-8 overflow-hidden transition-all duration-500",
        tones[tone],
        hover && "hover:-translate-y-1",
        span,
        className,
      )}
    >
      {children}
    </motion.div>
  );
}
