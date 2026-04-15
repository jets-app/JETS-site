"use client";

import { motion, useReducedMotion } from "motion/react";
import { Quote } from "lucide-react";

const testimonials = [
  {
    quote:
      "I formed partnerships with classmates and mentors, creating an incredible network.",
    name: "Koby Lerner",
    title: "Funding Specialist · Gold Funding Group",
    initials: "KL",
  },
  {
    quote: "I came for my GED but found my career path instead.",
    name: "Mendel Rubashkin",
    title: "Mortgage Banker · First Reliant Home Loans",
    initials: "MR",
  },
  {
    quote: "The confidence and drive started at JETS and will stay with me.",
    name: "Sam Liberow",
    title: "VP Investments · Marcus & Millichap",
    initials: "SL",
  },
  {
    quote: "Individualized courses suited my ability perfectly.",
    name: "Nuchom Levitansky",
    title: "Ambulance Operations Manager",
    initials: "NL",
  },
  {
    quote: "JETS made my goal of becoming an accountant a reality.",
    name: "Motty Vogel",
    title: "Financial Director",
    initials: "MV",
  },
];

interface TestimonialsProps {
  heading?: string;
  subheading?: string;
  tone?: "light" | "dark";
}

export function Testimonials({
  heading = "Alumni Voices",
  subheading = "Real graduates. Real careers. Real lives shaped by JETS.",
  tone = "dark",
}: TestimonialsProps) {
  const reduce = useReducedMotion();
  const isDark = tone === "dark";

  return (
    <section
      className={`relative py-28 lg:py-40 overflow-hidden ${
        isDark ? "bg-[#0a0608] text-white noise" : "bg-[#f7f2ea] text-foreground"
      }`}
    >
      {isDark && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-[10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[140px]" />
          <div className="absolute bottom-10 right-[5%] w-[400px] h-[400px] bg-[#6a0010]/25 rounded-full blur-[120px]" />
        </div>
      )}

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-20">
          <div
            className={`text-xs uppercase tracking-[0.3em] mb-6 flex items-center gap-3 ${
              isDark ? "text-amber-300/80" : "text-primary"
            }`}
          >
            <span
              className={`inline-block w-8 h-px ${
                isDark ? "bg-amber-300/60" : "bg-primary/50"
              }`}
            />
            Testimonials
          </div>
          <h2 className="font-display text-5xl sm:text-6xl lg:text-7xl leading-[0.95] mb-6">
            {heading}
          </h2>
          <p
            className={`text-lg max-w-xl leading-relaxed ${
              isDark ? "text-white/60" : "text-muted-foreground"
            }`}
          >
            {subheading}
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-5">
          {testimonials.map((t, i) => {
            // Staggered layout: create a dynamic mosaic
            const layouts = [
              "lg:col-span-5 lg:row-span-2 lg:mt-0",
              "lg:col-span-4 lg:mt-16",
              "lg:col-span-3 lg:mt-4",
              "lg:col-span-4 lg:mt-0",
              "lg:col-span-5 lg:mt-8",
            ];
            const featured = i === 0;
            return (
              <motion.figure
                key={t.name}
                initial={{ opacity: 0, y: reduce ? 0 : 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{
                  duration: 0.8,
                  delay: i * 0.08,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className={`relative rounded-3xl p-8 md:p-10 flex flex-col justify-between ${
                  layouts[i]
                } ${
                  featured
                    ? isDark
                      ? "bg-gradient-to-br from-primary via-[#8a0014] to-[#6a0010] text-white border border-white/10"
                      : "bg-foreground text-background"
                    : isDark
                      ? "bg-white/[0.04] border border-white/10 backdrop-blur-sm"
                      : "bg-white border border-black/5 shadow-sm"
                }`}
              >
                <div>
                  <Quote
                    className={`h-8 w-8 mb-6 ${
                      featured
                        ? "text-white/40"
                        : isDark
                          ? "text-amber-300/50"
                          : "text-primary/30"
                    }`}
                  />
                  <blockquote
                    className={`font-serif italic ${
                      featured
                        ? "text-2xl md:text-3xl leading-snug"
                        : "text-xl md:text-2xl leading-snug"
                    }`}
                  >
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>
                </div>
                <figcaption className="mt-8 pt-6 border-t border-current/15 flex items-center gap-4">
                  <div
                    className={`w-11 h-11 rounded-full flex items-center justify-center text-xs font-bold ${
                      featured
                        ? "bg-white/15 text-white"
                        : isDark
                          ? "bg-white/10 text-white"
                          : "bg-primary/10 text-primary"
                    }`}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{t.name}</div>
                    <div
                      className={`text-xs ${
                        featured
                          ? "text-white/60"
                          : isDark
                            ? "text-white/50"
                            : "text-muted-foreground"
                      }`}
                    >
                      {t.title}
                    </div>
                  </div>
                </figcaption>
              </motion.figure>
            );
          })}
        </div>
      </div>
    </section>
  );
}
