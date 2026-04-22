"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, Phone } from "lucide-react";

interface AnimatedHeroProps {
  eyebrow?: string;
  staticPrefix?: string;
  rotatingWords?: string[];
  description?: string;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
}

export function AnimatedHero({
  eyebrow = "Apply for 2026–27",
  staticPrefix = "A school for young men who are",
  rotatingWords = ["ready", "driven", "thoughtful", "ambitious", "called"],
  description = "Mornings in the beis medrash. Afternoons in the workshop. A clear path to a career, a community, and a meaningful life.",
  primaryCta = { label: "Begin Application", href: "/register" },
  secondaryCta = { label: "Schedule a Visit", href: "/inquire" },
}: AnimatedHeroProps) {
  const [titleNumber, setTitleNumber] = useState(0);
  const titles = useMemo(() => rotatingWords, [rotatingWords]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (titleNumber === titles.length - 1) {
        setTitleNumber(0);
      } else {
        setTitleNumber(titleNumber + 1);
      }
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [titleNumber, titles]);

  return (
    <div className="w-full min-h-screen flex items-center bg-[#0f0d0a] text-white">
      <div className="w-full max-w-[1600px] mx-auto px-6 lg:px-12">
        <div className="flex gap-10 items-center justify-center flex-col">
          <div>
            <a
              href={primaryCta.href}
              className="inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-white/80 hover:border-white/40 transition-colors"
            >
              {eyebrow} <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
          <div className="flex gap-4 flex-col w-full">
            <h1 className="font-serif text-5xl sm:text-7xl md:text-8xl lg:text-9xl tracking-tight text-center font-normal leading-[1]">
              <span className="text-white block whitespace-nowrap">{staticPrefix}</span>
              <span className="relative flex w-full justify-center overflow-hidden text-center pt-2 md:pt-4 lg:pt-6 pb-2 md:pb-4">
                &nbsp;
                {titles.map((title, index) => (
                  <motion.span
                    key={index}
                    className="absolute italic font-[family-name:var(--font-editorial-display)] text-[#e8c476]"
                    initial={{ opacity: 0, y: -100 }}
                    transition={{ type: "spring", stiffness: 50 }}
                    animate={
                      titleNumber === index
                        ? { y: 0, opacity: 1 }
                        : {
                            y: titleNumber > index ? -150 : 150,
                            opacity: 0,
                          }
                    }
                  >
                    {title}.
                  </motion.span>
                ))}
              </span>
            </h1>

            <p className="text-lg md:text-xl leading-relaxed text-white/60 max-w-2xl text-center mx-auto">
              {description}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href={secondaryCta.href}
              className="inline-flex items-center justify-center gap-2 h-11 rounded-md px-8 text-sm font-medium border border-white/20 text-white hover:bg-white/10 transition-colors"
            >
              {secondaryCta.label} <Phone className="w-4 h-4" />
            </a>
            <a
              href={primaryCta.href}
              className="inline-flex items-center justify-center gap-2 h-11 rounded-md px-8 text-sm font-medium bg-white text-black hover:bg-white/90 transition-colors"
            >
              {primaryCta.label} <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
