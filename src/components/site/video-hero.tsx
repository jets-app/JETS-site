"use client";

import Link from "next/link";
import { motion } from "motion/react";

export function VideoHero() {
  return (
    <section className="relative w-full h-[90vh] min-h-[600px] overflow-hidden">
      {/* Vimeo background */}
      <div className="absolute inset-0">
        <iframe
          src="https://player.vimeo.com/video/752152935?background=1&autoplay=1&loop=1&byline=0&title=0&muted=1"
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[177.78vh] min-w-full h-[56.25vw] min-h-full"
          allow="autoplay; fullscreen"
          style={{ border: 0 }}
          title="JETS Presentation"
        />
      </div>

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/55" />

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
            transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 text-lg sm:text-xl text-white/80 max-w-[600px] mx-auto leading-relaxed"
          >
            Torah. Trade. Brotherhood. A school for young men who are ready to
            become something.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/inquire"
              className="inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold text-white bg-[var(--jet-primary)] hover:bg-[var(--jet-primary-light)] rounded-full transition-colors"
            >
              Apply Now
            </Link>
            <a
              href="https://vimeo.com/752152935"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold text-white border-2 border-white/40 hover:border-white/80 rounded-full transition-colors"
            >
              Watch Our Story
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
