"use client";

import { useRef, useState, ReactNode } from "react";
import Image from "next/image";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
} from "motion/react";
import { Volume2, VolumeX } from "lucide-react";

interface ScrollExpandMediaProps {
  mediaType?: "video" | "image";
  mediaSrc: string;
  posterSrc?: string;
  bgImageSrc: string;
  title?: string;
  date?: string;
  scrollToExpand?: string;
  textBlend?: boolean;
  children?: ReactNode;
}

const ScrollExpandMedia = ({
  mediaType = "video",
  mediaSrc,
  posterSrc,
  bgImageSrc,
  title,
  date,
  scrollToExpand,
  children,
}: ScrollExpandMediaProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const vimeoRef = useRef<HTMLIFrameElement | null>(null);
  const [muted, setMuted] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  // Container is 200vh:
  // - First 100vh: sticky stage pins, animation runs from 0 -> 1
  // - Remaining 100vh would be dead space — but we put children OUTSIDE the container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Animation runs over the full 0 -> 1 range (no wasted scroll)
  // For a 200vh container with 100vh sticky, scrollYProgress 0->1 = scroll of 100vh
  const mediaWidth = useTransform(
    scrollYProgress,
    [0, 1],
    ["min(320px, 75vw)", "100vw"],
  );
  const mediaHeight = useTransform(
    scrollYProgress,
    [0, 1],
    ["min(440px, 60vh)", "100vh"],
  );
  const radius = useTransform(scrollYProgress, [0, 1], [16, 0]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 1], [0.4, 0]);
  const bgOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const titleY = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const titleOpacity = useTransform(scrollYProgress, [0.6, 0.95], [1, 0]);
  const promptOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setIsExpanded(v > 0.85);
  });

  const isVimeo = mediaSrc.includes("vimeo.com");
  const vimeoId = isVimeo
    ? (mediaSrc.match(/vimeo\.com\/(?:video\/)?(\d+)/) || [])[1]
    : "";

  function toggleMute() {
    if (!vimeoRef.current?.contentWindow) return;
    const newMuted = !muted;
    setMuted(newMuted);
    vimeoRef.current.contentWindow.postMessage(
      JSON.stringify({
        method: "setVolume",
        value: newMuted ? 0 : 1,
      }),
      "*",
    );
  }

  return (
    <>
      {/* 200vh container with sticky stage — animation runs over 100vh of scroll */}
      <div
        ref={containerRef}
        className="relative w-full bg-[#0f0d0a]"
        style={{ height: "200vh" }}
      >
        {/* Sticky stage — pinned for the entire animation */}
        <div className="sticky top-0 h-screen w-full overflow-hidden bg-[#0f0d0a]">
          {/* Background image — fades out as media expands */}
          <motion.div className="absolute inset-0 z-0" style={{ opacity: bgOpacity }}>
            <Image
              src={bgImageSrc}
              alt=""
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-black/60" />
          </motion.div>

          {/* Title — sits above the media frame, fades out near the end */}
          <motion.div
            className="absolute top-[12%] left-0 right-0 z-30 flex flex-col items-center text-center pointer-events-none px-6"
            style={{ y: titleY, opacity: titleOpacity }}
          >
            {date && (
              <p className="text-xs uppercase tracking-[0.3em] text-white/60 mb-3">
                {date}
              </p>
            )}
            {title && (
              <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-white">
                {title}
              </h2>
            )}
          </motion.div>

          {/* Expanding media frame */}
          <motion.div
            className="absolute top-1/2 left-1/2 z-20 overflow-hidden bg-black"
            style={{
              width: mediaWidth,
              height: mediaHeight,
              x: "-50%",
              y: "-50%",
              borderRadius: useTransform(radius, (r) => `${r}px`),
              boxShadow:
                "0px 30px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.08)",
            }}
          >
            {/* Poster — instant placeholder while iframe loads */}
            {posterSrc && (
              <Image
                src={posterSrc}
                alt={title || ""}
                fill
                priority
                className="object-cover"
                sizes="100vw"
              />
            )}

            {/* Media */}
            {mediaType === "video" ? (
              isVimeo ? (
                <iframe
                  ref={vimeoRef}
                  src={`https://player.vimeo.com/video/${vimeoId}?autoplay=1&loop=1&muted=1&byline=0&title=0&controls=0&dnt=1&background=1&autopause=0`}
                  className="absolute inset-0 w-full h-full"
                  style={{ border: 0 }}
                  allow="autoplay; fullscreen; picture-in-picture"
                  title={title}
                />
              ) : mediaSrc.includes("youtube.com") ? (
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
                  muted
                  loop
                  playsInline
                  preload="auto"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )
            ) : (
              <Image
                src={mediaSrc}
                alt={title || ""}
                fill
                priority
                className="object-cover"
                sizes="100vw"
              />
            )}

            {/* Dark overlay fades out as media expands */}
            <motion.div
              className="absolute inset-0 bg-black pointer-events-none"
              style={{ opacity: overlayOpacity }}
            />
          </motion.div>

          {/* Bottom prompt */}
          <motion.div
            className="absolute bottom-10 left-0 right-0 z-30 flex flex-col items-center gap-2 text-center pointer-events-none"
            style={{ opacity: promptOpacity }}
          >
            {scrollToExpand && (
              <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                {scrollToExpand} ↓
              </p>
            )}
          </motion.div>

          {/* Sound toggle — visible once expanded */}
          {mediaType === "video" && isVimeo && isExpanded && (
            <button
              onClick={toggleMute}
              className="absolute bottom-6 right-6 z-40 flex items-center gap-2 px-3 py-2 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-sm border border-white/20 text-white text-xs font-medium transition-colors"
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
      </div>

      {/* Bottom content — its own section, no dead space */}
      {children && (
        <section className="relative z-10 px-8 py-16 md:px-16 lg:py-20 bg-[#0f0d0a]">
          {children}
        </section>
      )}
    </>
  );
};

export default ScrollExpandMedia;
