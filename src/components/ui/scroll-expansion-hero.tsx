"use client";

import {
  useEffect,
  useRef,
  useState,
  ReactNode,
} from "react";
import Image from "next/image";
import { motion, useScroll, useTransform, useMotionValueEvent } from "motion/react";
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
  mediaType = "image",
  mediaSrc,
  posterSrc,
  bgImageSrc,
  title,
  date,
  scrollToExpand,
  textBlend,
  children,
}: ScrollExpandMediaProps) => {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [muted, setMuted] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const vimeoRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // Width grows from 320 -> 100% of viewport
  const baseW = 320;
  const targetW = isMobile ? "100vw" : "100vw";
  const baseH = isMobile ? 200 : 420;

  const widthCalc = useTransform(scrollYProgress, [0, 0.6], [`${baseW}px`, targetW]);
  const heightCalc = useTransform(scrollYProgress, [0, 0.6], [`${baseH}px`, "100vh"]);
  const radius = useTransform(scrollYProgress, [0, 0.6], ["16px", "0px"]);
  const overlay = useTransform(scrollYProgress, [0, 0.6], [0.55, 0.15]);
  const titleX = useTransform(scrollYProgress, [0, 0.6], [0, isMobile ? 180 : 200]);
  const bgOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const promptOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

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
    const newMuted = !muted;
    setMuted(newMuted);
    if (vimeoRef.current?.contentWindow) {
      vimeoRef.current.contentWindow.postMessage(
        JSON.stringify({
          method: newMuted ? "setVolume" : "setVolume",
          value: newMuted ? 0 : 1,
        }),
        "*",
      );
      vimeoRef.current.contentWindow.postMessage(
        JSON.stringify({ method: "play" }),
        "*",
      );
    }
  }

  return (
    <div
      ref={sectionRef}
      className="relative w-full"
      style={{ height: "200vh" }}
    >
      {/* Sticky stage */}
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* BG image */}
        <motion.div
          className="absolute inset-0 z-0"
          style={{ opacity: bgOpacity }}
        >
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

        {/* Centered title behind/around the media (split text) */}
        <div
          className={`absolute inset-0 z-20 flex flex-col items-center justify-center text-center pointer-events-none ${
            textBlend ? "mix-blend-difference" : ""
          }`}
        >
          <motion.h2
            className="font-serif text-5xl md:text-7xl lg:text-8xl font-semibold tracking-tight text-white"
            style={{ x: useTransform(titleX, (v) => -v) }}
          >
            {firstWord}
          </motion.h2>
          <motion.h2
            className="font-serif text-5xl md:text-7xl lg:text-8xl font-semibold tracking-tight text-white italic"
            style={{ x: titleX }}
          >
            {restOfTitle}
          </motion.h2>
        </div>

        {/* Expanding media */}
        <motion.div
          className="absolute top-1/2 left-1/2 z-10 overflow-hidden"
          style={{
            width: widthCalc,
            height: heightCalc,
            x: "-50%",
            y: "-50%",
            borderRadius: radius,
            boxShadow: "0px 0px 80px rgba(0,0,0,0.5)",
          }}
        >
          {/* Poster fallback */}
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
                src={`https://player.vimeo.com/video/${vimeoId}?autoplay=1&loop=1&muted=1&byline=0&title=0&controls=0&dnt=1&background=1&autopause=0&api=1&player_id=jets-video`}
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
                    : mediaSrc.replace("watch?v=", "embed/") +
                      `?autoplay=1&mute=1&loop=1&controls=0&modestbranding=1&playlist=${mediaSrc.split("v=")[1] || ""}`
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

          {/* Dark overlay that fades out as it expands */}
          <motion.div
            className="absolute inset-0 bg-black pointer-events-none"
            style={{ opacity: overlay }}
          />

          {/* Sound toggle (only for video) */}
          {mediaType === "video" && (
            <button
              onClick={toggleMute}
              className="absolute bottom-4 right-4 z-30 flex items-center gap-2 px-3 py-2 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-sm border border-white/20 text-white text-xs font-medium transition-colors"
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
        </motion.div>

        {/* Caption row above the media (date + scroll prompt) */}
        <motion.div
          className="absolute bottom-10 left-0 right-0 z-20 flex flex-col items-center gap-2 text-center"
          style={{ opacity: promptOpacity }}
        >
          {date && (
            <p className="text-sm uppercase tracking-[0.25em] text-white/70">
              {date}
            </p>
          )}
          {scrollToExpand && (
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">
              {scrollToExpand} ↓
            </p>
          )}
        </motion.div>
      </div>

      {/* Bottom content section — appears after media expands */}
      <motion.section
        className="relative z-20 px-8 py-16 md:px-16 lg:py-24 bg-[#0f0d0a]"
        animate={{ opacity: showContent ? 1 : 0 }}
        transition={{ duration: 0.4 }}
      >
        {children}
      </motion.section>
    </div>
  );
};

export default ScrollExpandMedia;
