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
  const [showContent, setShowContent] = useState(false);

  // Section is 150vh — gives 0.5 screen of scroll space for the animation,
  // then natural scroll into the bottom content
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Animation runs over the first 60% of scroll
  // Container is 250vh, sticky pin = 150vh of available scroll, animation fills 90vh of it
  const mediaWidth = useTransform(
    scrollYProgress,
    [0, 0.6],
    ["min(320px, 75vw)", "100vw"],
  );
  const mediaHeight = useTransform(
    scrollYProgress,
    [0, 0.6],
    ["min(440px, 60vh)", "100vh"],
  );
  const radius = useTransform(scrollYProgress, [0, 0.6], [16, 0]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.6], [0.4, 0]);
  const bgOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const titleY = useTransform(scrollYProgress, [0, 0.6], [0, -200]);
  const titleOpacity = useTransform(scrollYProgress, [0.45, 0.6], [1, 0]);
  const promptOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setShowContent(v > 0.8);
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
    // 250vh container — gives ample scroll room (150vh of actual scroll-driven animation)
    <div ref={containerRef} className="relative w-full" style={{ height: "250vh" }}>
      {/* Sticky stage */}
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-[#0f0d0a]">
        {/* Background image — DARK by default, fades out as media expands */}
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

        {/* Title — sits ABOVE the media frame, not on top of it */}
        <motion.div
          className="absolute top-[14%] left-0 right-0 z-30 flex flex-col items-center text-center pointer-events-none px-6"
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

        {/* Expanding media frame — clearly visible from the start */}
        <motion.div
          className="absolute top-1/2 left-1/2 z-20 overflow-hidden bg-black"
          style={{
            width: mediaWidth,
            height: mediaHeight,
            x: "-50%",
            y: "-50%",
            borderRadius: useTransform(radius, (r) => `${r}px`),
            boxShadow: "0px 30px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.08)",
          }}
        >
          {/* Poster image — instant placeholder while iframe loads */}
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

          {/* Subtle dark overlay that fades out as media expands */}
          <motion.div
            className="absolute inset-0 bg-black pointer-events-none"
            style={{ opacity: overlayOpacity }}
          />
        </motion.div>

        {/* Scroll prompt at bottom */}
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

        {/* Sound toggle — visible when video is mostly expanded */}
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

      {/* Bottom content — appears after the sticky stage scrolls out */}
      {children && (
        <motion.section
          className="relative z-10 px-8 py-16 md:px-16 lg:py-20 bg-[#0f0d0a]"
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
