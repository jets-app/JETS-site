"use client";

import Link from "next/link";
import { motion } from "motion/react";

export function VideoHero() {
  return (
    <section className="relative w-full h-[90vh] min-h-[600px] overflow-hidden bg-[#0a0a0a]">
      {/* Vimeo background video */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          paddingBottom: "56.25%",
          overflow: "hidden",
        }}
      >
        <iframe
          src="https://player.vimeo.com/video/752152935?background=1&autoplay=1&loop=1&byline=0&title=0&muted=1&dnt=1"
          className="absolute w-[300%] h-[300%] top-[-100%] left-[-100%]"
          allow="autoplay; fullscreen"
          style={{ border: 0, pointerEvents: "none" }}
          title="JETS Presentation"
          loading="eager"
        />
      </div>

      {/* Fallback background image in case video doesn't load */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url(https://www.jetsschool.org/wp-content/uploads/2020/10/jets_new_campus1.jpg)",
        }}
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Content */}
      <div className="relative z-10 h-full flex items-center justify-center">
        <div className="max-w-[900px] mx-auto px-6 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-[1.1]"
          >
            Build Your Future.
            <br />
            On Your Terms.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.9,
              delay: 0.2,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="mt-6 text-lg sm:text-xl text-white/80 max-w-[600px] mx-auto leading-relaxed"
          >
            Torah. Trade. Brotherhood. A school for young men who are ready to
            become something.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.9,
              delay: 0.4,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/register"
              className="inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold text-white bg-[var(--jet-primary)] hover:bg-[var(--jet-primary-light)] rounded-full transition-colors"
            >
              Apply Now
            </Link>
            <a
              href="https://vimeo.com/752152935"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base font-semibold text-white border-2 border-white/40 hover:border-white/80 rounded-full transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
              </svg>
              Watch Our Story
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
