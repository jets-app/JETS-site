import { StickyScroll } from "@/components/ui/sticky-scroll";
import { AnimatedHero } from "@/components/ui/animated-hero";

export const metadata = {
  title: "Photos — JETS Sandbox",
};

export default function SandboxPhotosPage() {
  return (
    <>
      {/* Animated rotating-word hero */}
      <AnimatedHero />

      {/* Sticky scroll photo gallery */}
      <StickyScroll />
    </>
  );
}
