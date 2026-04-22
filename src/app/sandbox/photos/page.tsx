import { VideoCardReveal } from "@/components/ui/video-card-reveal";
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

      {/* 2. Video card reveal — scrolls into view smoothly */}
      <VideoCardReveal
        mediaSrc="https://vimeo.com/752152935"
        posterSrc="https://www.jetsschool.org/wp-content/uploads/2020/10/jets_new_campus1.jpg"
        eyebrow="See JETS · Granada Hills, California"
        title="Sixteen years of Torah and trade."
        subtitle="A school for young men formed at once in the study of Torah and in a useful trade — neither aspiration diminished to accommodate the other."
        aspectRatio="16:9"
      />

      {/* 3. Sticky scroll photo gallery */}
      <StickyScroll />
    </div>
  );
}
