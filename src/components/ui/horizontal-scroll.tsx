"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "motion/react";

interface Panel {
  eyebrow: string;
  title: string;
  description: string;
  image: string;
}

interface HorizontalScrollProps {
  sectionEyebrow?: string;
  sectionTitle?: string;
  panels?: Panel[];
}

const DEFAULT_PANELS: Panel[] = [
  {
    eyebrow: "7:30 AM",
    title: "Morning Seder",
    description:
      "The day begins in the beis medrash. Gemara, chavrusa, the quiet work of shaping a life before the sun is fully up.",
    image:
      "https://www.jetsschool.org/wp-content/uploads/2019/01/cl__0045_c2-1024x576.jpg",
  },
  {
    eyebrow: "10:00 AM",
    title: "Breakfast & Brotherhood",
    description:
      "A communal meal. This is where the friendships that outlast the classroom are forged.",
    image:
      "https://www.jetsschool.org/wp-content/uploads/2020/02/tr3-1024x576.jpg",
  },
  {
    eyebrow: "11:00 AM",
    title: "Trade Workshop",
    description:
      "Wiring a circuit, framing a wall, writing production code. The morning&rsquo;s ideas meet the afternoon&rsquo;s craft.",
    image:
      "https://www.jetsschool.org/wp-content/uploads/2019/01/cl__0041_c6-1024x576.jpg",
  },
  {
    eyebrow: "3:00 PM",
    title: "Afternoon Chavrusa",
    description:
      "Return to the beis medrash. New questions, shaped by the morning&rsquo;s work in the field.",
    image:
      "https://www.jetsschool.org/wp-content/uploads/2019/01/cl__0038_c9-1024x576.jpg",
  },
  {
    eyebrow: "6:00 PM",
    title: "The Wider Life",
    description:
      "Culinary, music, martial arts, athletics. The whole man is more than his trade or his learning.",
    image:
      "https://www.jetsschool.org/wp-content/uploads/2020/02/tr5-1024x576.jpg",
  },
];

export function HorizontalScroll({
  sectionEyebrow = "A Day at JETS",
  sectionTitle = "How the hours unfold.",
  panels = DEFAULT_PANELS,
}: HorizontalScrollProps) {
  const targetRef = useRef<HTMLDivElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"],
  });

  // Translate from 0% to a negative percentage based on panel count
  // With N panels of 85vw each, we need to shift N * 85vw, minus 100vw already visible
  // Plus some padding. Using percentage of total scroll content.
  const xPercent = useTransform(
    scrollYProgress,
    [0, 1],
    ["0%", `-${(panels.length - 1) * 100}%`],
  );

  return (
    // Container height = (panels * 100vh) — gives each panel one screen of vertical scroll
    <section
      ref={targetRef}
      className="relative bg-[#0f0d0a]"
      style={{ height: `${panels.length * 100}vh` }}
    >
      {/* Sticky stage — pinned while scrolling */}
      <div className="sticky top-0 h-screen overflow-hidden flex items-center">
        {/* Section heading — fixed top-left */}
        <div className="absolute top-8 lg:top-12 left-6 lg:left-12 z-10 pointer-events-none">
          <p className="text-xs uppercase tracking-[0.3em] text-white/50 mb-2">
            {sectionEyebrow}
          </p>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-white tracking-tight max-w-[600px]">
            {sectionTitle}
          </h2>
        </div>

        {/* Scroll progress indicator — bottom */}
        <div className="absolute bottom-10 left-6 lg:left-12 right-6 lg:right-12 z-10 flex items-center gap-4 pointer-events-none">
          <span className="text-xs uppercase tracking-[0.3em] text-white/40 whitespace-nowrap">
            Scroll ↓
          </span>
          <div className="flex-1 h-px bg-white/10 relative overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 bg-[#e8c476]"
              style={{
                width: useTransform(scrollYProgress, [0, 1], ["0%", "100%"]),
              }}
            />
          </div>
          <span className="text-xs uppercase tracking-[0.3em] text-white/40 whitespace-nowrap">
            {panels.length} moments
          </span>
        </div>

        {/* Horizontal track — translates based on vertical scroll */}
        <motion.div
          style={{ x: xPercent }}
          className="flex gap-6 lg:gap-10 pl-6 lg:pl-12 pr-6 lg:pr-12 will-change-transform"
        >
          {panels.map((panel, i) => (
            <article
              key={panel.title}
              className="relative shrink-0 overflow-hidden rounded-2xl lg:rounded-3xl"
              style={{
                width: "min(85vw, 1200px)",
                height: "70vh",
              }}
            >
              <Image
                src={panel.image}
                alt={panel.title}
                fill
                priority={i < 2}
                className="object-cover"
                sizes="85vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

              <div className="absolute inset-0 flex flex-col justify-end p-8 lg:p-14">
                <p className="text-xs uppercase tracking-[0.3em] text-[#e8c476] mb-3">
                  {panel.eyebrow}
                </p>
                <h3 className="font-serif text-4xl md:text-5xl lg:text-7xl text-white tracking-tight leading-[1.05] mb-4 max-w-[16ch]">
                  {panel.title}
                </h3>
                <p
                  className="text-base lg:text-lg text-white/80 max-w-[42ch] leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: panel.description }}
                />
              </div>

              {/* Panel index */}
              <div className="absolute top-6 right-6 lg:top-8 lg:right-8 text-xs uppercase tracking-[0.3em] text-white/60 font-medium">
                {String(i + 1).padStart(2, "0")} / {String(panels.length).padStart(2, "0")}
              </div>
            </article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
