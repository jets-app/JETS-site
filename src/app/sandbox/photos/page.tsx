import ScrollExpandMedia from "@/components/ui/scroll-expansion-hero";
import { StickyScroll } from "@/components/ui/sticky-scroll";
import { AnimatedHero } from "@/components/ui/animated-hero";

export const metadata = {
  title: "Photos — JETS Sandbox",
};

export default function SandboxPhotosPage() {
  return (
    <div className="bg-[#0f0d0a] text-white">
      {/* 1. Landing — animated hero with rotating words */}
      <AnimatedHero
        rotatingWords={["ready", "driven", "thoughtful", "ambitious", "called"]}
        staticPrefix="A school for young men who are"
        description="Mornings in the beis medrash. Afternoons in the workshop. A clear path to a career, a community, and a meaningful life."
      />

      {/* 2. Scroll-to-expand — JETS Vimeo presentation video */}
      <ScrollExpandMedia
        mediaType="video"
        mediaSrc="https://vimeo.com/752152935"
        bgImageSrc="https://www.jetsschool.org/wp-content/uploads/2020/10/jets_new_campus3.jpg"
        title="See JETS"
        date="Granada Hills, California"
        scrollToExpand="Scroll to play"
        textBlend
      >
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-white/50 mb-6">
            About
          </p>
          <h2 className="font-serif text-4xl lg:text-6xl text-white mb-10 tracking-tight leading-[1.05]">
            Sixteen years of{" "}
            <em className="italic font-[family-name:var(--font-editorial-display)] text-[#e8c476]">
              Torah and trade.
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

      {/* 3. Sticky scroll photo gallery */}
      <StickyScroll />
    </div>
  );
}
