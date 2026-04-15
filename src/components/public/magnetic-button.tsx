"use client";

import { useRef, type ReactNode } from "react";
import Link from "next/link";
import { motion, useMotionValue, useSpring, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

interface MagneticButtonProps {
  href: string;
  children: ReactNode;
  className?: string;
  variant?: "primary" | "outline" | "cream" | "dark";
  size?: "default" | "lg" | "xl";
}

const variants = {
  primary:
    "bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl shadow-primary/25",
  outline:
    "border border-white/20 text-white hover:bg-white/10 hover:border-white/40 backdrop-blur-sm",
  cream:
    "bg-cream text-primary hover:bg-cream/90 shadow-xl shadow-black/30",
  dark: "bg-foreground text-background hover:bg-foreground/90",
};

const sizes = {
  default: "h-11 px-6 text-sm",
  lg: "h-13 px-8 text-[15px]",
  xl: "h-16 px-10 text-base",
};

export function MagneticButton({
  href,
  children,
  className,
  variant = "primary",
  size = "lg",
}: MagneticButtonProps) {
  const ref = useRef<HTMLAnchorElement>(null);
  const reduce = useReducedMotion();

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 180, damping: 18, mass: 0.3 });
  const springY = useSpring(y, { stiffness: 180, damping: 18, mass: 0.3 });

  function handleMove(e: React.MouseEvent<HTMLAnchorElement>) {
    if (reduce) return;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const relX = e.clientX - (rect.left + rect.width / 2);
    const relY = e.clientY - (rect.top + rect.height / 2);
    x.set(relX * 0.25);
    y.set(relY * 0.35);
  }

  function handleLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.span
      style={{ display: "inline-block", x: springX, y: springY }}
    >
      <Link
        ref={ref}
        href={href}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        className={cn(
          "relative inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-tight transition-colors duration-300 group/mag will-change-transform",
          variants[variant],
          sizes[size],
          className,
        )}
      >
        <span className="relative z-10 flex items-center gap-2">{children}</span>
      </Link>
    </motion.span>
  );
}
