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
        posterSrc="https://www.jetsschool.org/wp-content/uploads/2020/10/jets_new_campus1.jpg"
        bgImageSrc="https://www.jetsschool.org/wp-content/uploads/2020/10/jets_new_campus3.jpg"
        title="See JETS"
        date="Granada Hills, California"
        scrollToExpand="Scroll to play"
        textBlend
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-serif text-4xl lg:text-5xl text-white tracking-tight leading-[1.1]">
            Sixteen years of{" "}
            <em className="italic font-[family-name:var(--font-editorial-display)] text-[#e8c476]">
              Torah and trade.
            </em>
          </h2>
          <p className="mt-6 text-base lg:text-lg text-white/60 max-w-2xl mx-auto leading-relaxed">
            A school for young men formed at once in the study of Torah and in
            a useful trade — neither aspiration diminished to accommodate the
            other.
          </p>
        </div>
      </ScrollExpandMedia>

      {/* 3. Sticky scroll photo gallery */}
      <StickyScroll />
    </div>
  );
}
