"use client";

import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MarqueeProps {
  children: ReactNode;
  className?: string;
  reverse?: boolean;
  speed?: "slow" | "normal" | "fast";
  pauseOnHover?: boolean;
}

export function Marquee({
  children,
  className,
  reverse = false,
  speed = "normal",
  pauseOnHover = true,
}: MarqueeProps) {
  const speedClass = {
    slow: "animate-marquee-slow",
    normal: "animate-marquee",
    fast: "animate-marquee",
  }[speed];

  return (
    <div
      className={cn(
        "group/marquee relative flex overflow-hidden",
        className,
      )}
    >
      <div
        className={cn(
          "flex shrink-0 items-center gap-12 pr-12",
          reverse ? "animate-marquee-reverse" : speedClass,
          pauseOnHover && "group-hover/marquee:[animation-play-state:paused]",
        )}
      >
        {children}
        {children}
      </div>
    </div>
  );
}
