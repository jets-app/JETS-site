import ScrollExpandMedia from "@/components/ui/scroll-expansion-hero";
import { StickyScroll } from "@/components/ui/sticky-scroll";
import { AnimatedHero } from "@/components/ui/animated-hero";

export const metadata = {
  title: "Photos — JETS Sandbox",
};

export default function SandboxPhotosPage() {
  return (
    <div className="bg-[#0f0d0a] text-white">
      {/* 1. Scroll-to-expand hero — hijacks scroll until image fills the screen */}
      <ScrollExpandMedia
        mediaType="image"
        mediaSrc="https://www.jetsschool.org/wp-content/uploads/2020/10/jets_new_campus1.jpg"
        bgImageSrc="https://www.jetsschool.org/wp-content/uploads/2020/10/jets_new_campus3.jpg"
        title="Welcome to JETS"
        date="Granada Hills, California"
        scrollToExpand="Scroll to discover"
        textBlend
      >
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-white/50 mb-6">
            About
          </p>
          <h2 className="font-serif text-4xl lg:text-6xl text-white mb-10 tracking-tight leading-[1.05]">
            A school for young men who are{" "}
            <em className="italic font-[family-name:var(--font-editorial-display)] text-[#e8c476]">
              ready to build something.
            </em>
          </h2>
          <p className="text-lg lg:text-xl text-white/70 leading-relaxed mb-6">
            Established in 2008 on a stubborn premise: that a young man can be
            formed at once in the study of Torah and in a useful trade.
          </p>
          <p className="text-sm uppercase tracking-[0.25em] text-white/40 mt-12">
            Keep scrolling ↓
          </p>
        </div>
      </ScrollExpandMedia>

      {/* 2. Animated hero with rotating words */}
      <AnimatedHero />

      {/* 3. Sticky scroll photo gallery */}
      <StickyScroll />
    </div>
  );
}
