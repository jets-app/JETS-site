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
  textBlend,
  children,
}: ScrollExpandMediaProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const vimeoRef = useRef<HTMLIFrameElement | null>(null);
  const [muted, setMuted] = useState(true);
  const [showContent, setShowContent] = useState(false);

  // Scroll progress through the section (0 -> 1 as user scrolls through it)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  // Animate over first 60% of scroll, then media is fully expanded
  // and bottom content fades in
  const mediaWidth = useTransform(
    scrollYProgress,
    [0, 0.6],
    ["min(420px, 90vw)", "100vw"],
  );
  const mediaHeight = useTransform(
    scrollYProgress,
    [0, 0.6],
    ["min(560px, 70vh)", "100vh"],
  );
  const radius = useTransform(scrollYProgress, [0, 0.6], [16, 0]);
  const overlay = useTransform(scrollYProgress, [0, 0.6], [0.55, 0.15]);
  const titleOffsetX = useTransform(scrollYProgress, [0, 0.5], [0, 50]);
  const promptOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const bgOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setShowContent(v > 0.7);
  });

  const firstWord = title ? title.split(" ")[0] : "";
  const restOfTitle = title ? title.split(" ").slice(1).join(" ") : "";

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
    // Outer container is 200vh tall — gives the animation room to play out
    // as the user scrolls naturally through it
    <div ref={containerRef} className="relative w-full" style={{ height: "200vh" }}>
      {/* Sticky stage — pinned for the duration of the scroll */}
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-[#0f0d0a]">
        {/* Background image fades out as user scrolls */}
        <motion.div className="absolute inset-0 z-0" style={{ opacity: bgOpacity }}>
          <Image
            src={bgImageSrc}
            alt=""
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-black/30" />
        </motion.div>

        {/* Title — split words slide apart */}
        <div
          className={`absolute inset-0 z-30 flex flex-col items-center justify-center text-center pointer-events-none ${
            textBlend ? "mix-blend-difference" : ""
          }`}
        >
          <motion.h2
            className="font-serif text-5xl md:text-7xl lg:text-8xl font-semibold tracking-tight text-white"
            style={{ x: useTransform(titleOffsetX, (v) => `-${v}vw`) }}
          >
            {firstWord}
          </motion.h2>
          {restOfTitle && (
            <motion.h2
              className="font-serif text-5xl md:text-7xl lg:text-8xl font-semibold tracking-tight text-white italic mt-2"
              style={{ x: useTransform(titleOffsetX, (v) => `${v}vw`) }}
            >
              {restOfTitle}
            </motion.h2>
          )}
        </div>

        {/* Expanding media frame */}
        <motion.div
          className="absolute top-1/2 left-1/2 z-20 overflow-hidden"
          style={{
            width: mediaWidth,
            height: mediaHeight,
            x: "-50%",
            y: "-50%",
            borderRadius: useTransform(radius, (r) => `${r}px`),
            boxShadow: "0px 30px 80px rgba(0,0,0,0.5)",
          }}
        >
          {/* Poster image — visible while video loads */}
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

          {/* Media: Vimeo / YouTube / direct video / image */}
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
            style={{ opacity: overlay }}
          />
        </motion.div>

        {/* Bottom prompt — caption + scroll cue */}
        <motion.div
          className="absolute bottom-10 left-0 right-0 z-30 flex flex-col items-center gap-2 text-center pointer-events-none"
          style={{ opacity: promptOpacity }}
        >
          {date && (
            <p className="text-sm uppercase tracking-[0.25em] text-white/80">
              {date}
            </p>
          )}
          {scrollToExpand && (
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">
              {scrollToExpand} ↓
            </p>
          )}
        </motion.div>

        {/* Sound toggle — only show when video is mostly expanded */}
        {mediaType === "video" && isVimeo && showContent && (
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

      {/* Bottom content — sits below the sticky, becomes visible as user scrolls past */}
      {children && (
        <motion.section
          className="relative z-10 px-8 py-16 md:px-16 lg:py-24 bg-[#0f0d0a] -mt-px"
          animate={{ opacity: showContent ? 1 : 0 }}
          transition={{ duration: 0.4 }}
        >
          {children}
        </motion.section>
      )}
    </div>
  );
};

export default ScrollExpandMedia;
