"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "motion/react";
import { Volume2, VolumeX } from "lucide-react";

interface VideoCardRevealProps {
  mediaSrc: string;
  posterSrc?: string;
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  aspectRatio?: "16:9" | "4:3" | "21:9";
}

export function VideoCardReveal({
  mediaSrc,
  posterSrc,
  title,
  subtitle,
  eyebrow,
  aspectRatio = "16:9",
}: VideoCardRevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const vimeoRef = useRef<HTMLIFrameElement | null>(null);
  const [muted, setMuted] = useState(true);

  // Scroll-linked reveal — starts just before card enters viewport, ends when it's fully in
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"],
  });

  const scale = useTransform(scrollYProgress, [0, 1], [0.92, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 1], [0, 0.6, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [60, 0]);

  const aspectClass =
    aspectRatio === "4:3"
      ? "aspect-[4/3]"
      : aspectRatio === "21:9"
        ? "aspect-[21/9]"
        : "aspect-video";

  const isVimeo = mediaSrc.includes("vimeo.com");
  const vimeoId = isVimeo
    ? (mediaSrc.match(/vimeo\.com\/(?:video\/)?(\d+)/) || [])[1]
    : "";
  const isYouTube = mediaSrc.includes("youtube.com");

  function toggleMute() {
    const newMuted = !muted;
    setMuted(newMuted);
    if (isVimeo && vimeoRef.current?.contentWindow) {
      vimeoRef.current.contentWindow.postMessage(
        JSON.stringify({
          method: "setVolume",
          value: newMuted ? 0 : 1,
        }),
        "*",
      );
    }
  }

  return (
    <section
      ref={ref}
      className="relative w-full bg-[#0f0d0a] py-20 md:py-28 lg:py-36 overflow-hidden"
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Heading above card */}
        {(eyebrow || title || subtitle) && (
          <motion.div
            className="max-w-3xl mb-12 lg:mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            {eyebrow && (
              <p className="text-xs uppercase tracking-[0.3em] text-white/50 mb-4">
                {eyebrow}
              </p>
            )}
            {title && (
              <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl tracking-tight text-white leading-[1.05]">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="mt-6 text-lg text-white/60 max-w-2xl leading-relaxed">
                {subtitle}
              </p>
            )}
          </motion.div>
        )}

        {/* Video card with scroll-linked reveal */}
        <motion.div
          style={{ scale, opacity, y }}
          className="relative w-full"
        >
          <div
            className={`relative w-full ${aspectClass} overflow-hidden rounded-2xl lg:rounded-3xl bg-black`}
            style={{
              boxShadow:
                "0 40px 120px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)",
            }}
          >
            {/* Poster — instant placeholder while video loads */}
            {posterSrc && (
              <Image
                src={posterSrc}
                alt={title || ""}
                fill
                priority
                className="object-cover"
                sizes="(min-width: 1400px) 1352px, 100vw"
              />
            )}

            {/* Video */}
            {isVimeo ? (
              <iframe
                ref={vimeoRef}
                src={`https://player.vimeo.com/video/${vimeoId}?autoplay=1&loop=1&muted=1&byline=0&title=0&controls=0&dnt=1&background=1&autopause=0`}
                className="absolute inset-0 w-full h-full"
                style={{ border: 0 }}
                allow="autoplay; fullscreen; picture-in-picture"
                title={title}
              />
            ) : isYouTube ? (
              <iframe
                src={
                  mediaSrc.includes("embed")
                    ? mediaSrc
                    : `${mediaSrc.replace("watch?v=", "embed/")}?autoplay=1&mute=1&loop=1&controls=0&modestbranding=1&playlist=${mediaSrc.split("v=")[1] || ""}`
                }
                className="absolute inset-0 w-full h-full"
                style={{ border: 0 }}
                allow="autoplay; fullscreen"
              />
            ) : (
              <video
                src={mediaSrc}
                poster={posterSrc}
                autoPlay
                muted={muted}
                loop
                playsInline
                preload="auto"
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}

            {/* Subtle gradient at bottom for better button contrast */}
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />

            {/* Sound toggle */}
            {(isVimeo || !isYouTube) && (
              <button
                onClick={toggleMute}
                className="absolute bottom-4 right-4 flex items-center gap-2 px-3.5 py-2 rounded-full bg-black/70 hover:bg-black/90 backdrop-blur-sm border border-white/20 text-white text-xs font-medium transition-colors"
              >
                {muted ? (
                  <>
                    <VolumeX className="h-3.5 w-3.5" />
                    Sound off
                  </>
                ) : (
                  <>
                    <Volume2 className="h-3.5 w-3.5" />
                    Sound on
                  </>
                )}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
