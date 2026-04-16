"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from "motion/react";
import {
  BookOpen,
  Flame,
  User,
  Hammer,
  Star,
  ArrowUpRight,
  MapPin,
  Building2,
  BookMarked,
  Sparkles,
} from "lucide-react";
import { PublicNav } from "@/components/public/public-nav";
import { PublicFooter } from "@/components/public/public-footer";
import { Testimonials } from "@/components/public/testimonials";
import { AnimatedHeading, FadeUp } from "@/components/public/animated-heading";
import {
  ScrollReveal,
  StaggerReveal,
  StaggerItem,
} from "@/components/public/scroll-reveal";
import { StatCounter } from "@/components/public/stat-counter";
import { MagneticButton } from "@/components/public/magnetic-button";

const values = [
  {
    title: "Torah",
    subtitle: "Love of Learning",
    description:
      "A lifelong passion for study, wisdom, and spiritual growth — the foundation of every JETS student.",
    icon: BookOpen,
    number: "01",
  },
  {
    title: "Shekeidah",
    subtitle: "Dedication & Persistence",
    description:
      "Diligence in learning and labor. The discipline to show up, grow, and finish what we start.",
    icon: Flame,
    number: "02",
  },
  {
    title: "Yichudiyut",
    subtitle: "Individuality & Potential",
    description:
      "Every student is unique. We meet each young man where he is and guide him toward his greatest self.",
    icon: User,
    number: "03",
  },
  {
    title: "Chiddush VeYetzirah",
    subtitle: "Skills & Innovation",
    description:
      "Creative problem-solving, practical craftsmanship, and the courage to build something new.",
    icon: Hammer,
    number: "04",
  },
  {
    title: "Chaim Amitiyim",
    subtitle: "Lifelong Jewish Identity",
    description:
      "A grounded, authentic Jewish life — in family, community, and every corner of the workplace.",
    icon: Star,
    number: "05",
  },
];

export default function AboutPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const reduce = useReducedMotion();
  const y = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "40%"]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicNav />

      {/* HERO */}
      <section
        ref={heroRef}
        className="relative min-h-[85svh] flex items-end bg-[#0a0608] text-white overflow-hidden noise"
      >
        <motion.div style={{ y }} className="absolute inset-0 mesh-bg" />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] right-[10%] w-[500px] h-[500px] bg-primary/25 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-[5%] w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-[100px]" />
        </div>

        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-40 pb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-xs uppercase tracking-[0.3em] text-amber-300/80 mb-10 flex items-center gap-3"
          >
            <span className="inline-block w-8 h-px bg-amber-300/60" />
            About JETS — Est. Torah V&apos;avodah
          </motion.div>
          <AnimatedHeading
            as="h1"
            text="Teach a man"
            className="font-display text-[18vw] sm:text-[14vw] lg:text-[10.5vw] xl:text-[160px] leading-[0.88] tracking-[-0.04em]"
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="font-display text-[18vw] sm:text-[14vw] lg:text-[10.5vw] xl:text-[160px] leading-[0.88] tracking-[-0.04em] -mt-1"
          >
            <em className="italic text-amber-200/90 font-serif">to fish.</em>
          </motion.div>
          <FadeUp delay={0.9}>
            <p className="mt-12 text-lg md:text-xl text-white/70 max-w-2xl leading-relaxed">
              For sixteen years, JETS has given young Jewish men the tools to
              lead lives of purpose, independence, and meaning — through the
              timeless union of Torah learning and vocational mastery.
            </p>
          </FadeUp>
        </div>
      </section>

      {/* MISSION STATEMENT — GIANT */}
      <section className="relative py-32 lg:py-44 bg-[#f7f2ea]">
        <div className="absolute inset-0 mesh-cream opacity-60" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-xs uppercase tracking-[0.3em] text-primary mb-10 flex items-center gap-3">
              <span className="inline-block w-8 h-px bg-primary/50" />
              Our Mission
            </div>
          </ScrollReveal>
          <AnimatedHeading
            as="h2"
            text="Tools to lead productive, fulfilling lives."
            className="font-display text-5xl md:text-6xl lg:text-7xl xl:text-8xl leading-[0.95] tracking-[-0.03em]"
          />
          <FadeUp delay={0.3}>
            <p className="mt-16 text-xl md:text-2xl text-foreground/60 max-w-3xl leading-relaxed font-serif italic">
              JETS is an award-winning technical college and high school that
              empowers young Jewish men through a well-balanced program of
              Judaic studies, vocational training, and recreational activities.
            </p>
          </FadeUp>
        </div>
      </section>

      {/* STATS */}
      <section className="bg-[#0a0608] text-white py-24 noise relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-primary/25 rounded-full blur-[120px]" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <StaggerReveal className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { value: 812, suffix: "", label: "Graduates" },
              { value: 57, suffix: "", label: "Courses" },
              { value: 16, suffix: "+", label: "Years" },
              { value: 10, suffix: "ac", label: "Campus" },
            ].map((s) => (
              <StaggerItem
                key={s.label}
                className="border-l border-white/10 pl-6"
              >
                <div className="font-display text-6xl md:text-7xl lg:text-8xl leading-none mb-4 tabular-nums">
                  <StatCounter value={s.value} suffix={s.suffix} />
                </div>
                <div className="text-xs uppercase tracking-[0.25em] text-white/50">
                  {s.label}
                </div>
              </StaggerItem>
            ))}
          </StaggerReveal>
        </div>
      </section>

      {/* FOUNDER */}
      <section className="py-28 lg:py-40 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <ScrollReveal className="lg:col-span-5" y={40}>
              <div className="relative aspect-[4/5] rounded-3xl bg-gradient-to-br from-primary via-[#8a0014] to-[#6a0010] overflow-hidden">
                <div className="absolute inset-0 opacity-20 pointer-events-none noise" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent)]" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="font-display text-[220px] leading-none text-white/15">
                    MS
                  </div>
                </div>
                <div className="absolute bottom-10 left-10 right-10">
                  <div className="text-[10px] uppercase tracking-[0.3em] text-amber-200/70 mb-3">
                    Founding Director
                  </div>
                  <div className="font-display text-3xl text-white leading-tight">
                    Rabbi Mayer Schmukler
                  </div>
                </div>
              </div>
            </ScrollReveal>
            <div className="lg:col-span-7 lg:pl-10">
              <ScrollReveal>
                <div className="text-xs uppercase tracking-[0.3em] text-primary mb-6 flex items-center gap-3">
                  <span className="inline-block w-8 h-px bg-primary/50" />
                  The Founder
                </div>
              </ScrollReveal>
              <AnimatedHeading
                as="h2"
                text="Educate a child according to his way."
                className="font-display text-5xl md:text-6xl leading-[0.95] mb-8"
              />
              <FadeUp delay={0.2}>
                <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-8">
                  — Proverbs 22:6
                </p>
              </FadeUp>
              <FadeUp delay={0.3}>
                <p className="text-lg text-foreground/70 leading-relaxed mb-6">
                  Rabbi Schmukler founded JETS with a singular conviction:
                  teaching ethical values must walk hand-in-hand with real
                  job-training tools. Every young man deserves both a moral
                  compass and the practical skills to build his future.
                </p>
              </FadeUp>
              <FadeUp delay={0.4}>
                <p className="text-lg text-foreground/70 leading-relaxed">
                  An experienced educator and community leader, he continues
                  to guide JETS&apos; mission — shaping each student into a
                  whole person, ready for every dimension of adult life.
                </p>
              </FadeUp>
            </div>
          </div>
        </div>
      </section>

      {/* CORE VALUES */}
      <section className="py-28 lg:py-40 bg-[#0a0608] text-white noise relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-[10%] w-[400px] h-[400px] bg-primary/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-20 right-[5%] w-[500px] h-[500px] bg-[#6a0010]/30 rounded-full blur-[140px]" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-20">
            <ScrollReveal>
              <div className="text-xs uppercase tracking-[0.3em] text-amber-300/80 mb-6 flex items-center gap-3">
                <span className="inline-block w-8 h-px bg-amber-300/60" />
                Five Pillars
              </div>
            </ScrollReveal>
            <AnimatedHeading
              as="h2"
              text="The values that shape every day."
              className="font-display text-5xl md:text-6xl lg:text-7xl leading-[0.95] mb-6"
            />
            <FadeUp delay={0.2}>
              <p className="text-lg text-white/60 max-w-xl">
                Five core values — rooted in Jewish tradition and expressed
                through modern craft — that define the JETS experience.
              </p>
            </FadeUp>
          </div>

          <div className="space-y-px bg-white/10 rounded-3xl overflow-hidden">
            {values.map((v, i) => (
              <ScrollReveal
                key={v.title}
                delay={i * 0.05}
                className="bg-[#0a0608]"
              >
                <div className="group grid lg:grid-cols-12 gap-6 items-start p-8 md:p-12 hover:bg-white/[0.03] transition-colors duration-500">
                  <div className="lg:col-span-1 font-display text-2xl text-amber-300/60">
                    {v.number}
                  </div>
                  <div className="lg:col-span-3">
                    <v.icon className="h-8 w-8 mb-4 text-amber-200" />
                    <div className="text-[11px] uppercase tracking-[0.25em] text-white/40 mb-2">
                      {v.subtitle}
                    </div>
                  </div>
                  <div className="lg:col-span-4">
                    <h3 className="font-display text-5xl md:text-6xl leading-[0.95] group-hover:translate-x-2 transition-transform duration-500">
                      {v.title}
                    </h3>
                  </div>
                  <div className="lg:col-span-4 lg:pt-2">
                    <p className="text-white/60 leading-relaxed">
                      {v.description}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CAMPUS */}
      <section className="py-28 lg:py-40 bg-[#f7f2ea] relative overflow-hidden">
        <div className="absolute inset-0 mesh-cream opacity-50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6">
              <ScrollReveal>
                <div className="text-xs uppercase tracking-[0.3em] text-primary mb-6 flex items-center gap-3">
                  <span className="inline-block w-8 h-px bg-primary/50" />
                  The Campus
                </div>
              </ScrollReveal>
              <AnimatedHeading
                as="h2"
                text="A home in Granada Hills."
                className="font-display text-5xl md:text-6xl lg:text-7xl leading-[0.95] mb-8"
              />
              <FadeUp delay={0.2}>
                <p className="text-lg text-foreground/70 leading-relaxed max-w-lg mb-8">
                  Our Los Angeles campus — 9 to 10 acres of purpose-built
                  learning — is in the middle of The Fisch Trade School
                  expansion. State-of-the-art classrooms, workshops, and
                  study laboratories spread across four new structures.
                </p>
              </FadeUp>
              <FadeUp delay={0.3}>
                <a
                  href="https://maps.google.com/?q=16601+Rinaldi+Street+Granada+Hills+CA+91344"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 text-sm text-foreground/80 hover:text-primary transition-colors"
                >
                  <MapPin className="h-4 w-4 text-primary" />
                  16601 Rinaldi Street, Granada Hills, CA 91344
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              </FadeUp>
            </div>
            <div className="lg:col-span-6 grid grid-cols-2 gap-4">
              {[
                { label: "Structures", value: "4", icon: Building2 },
                { label: "Workshops", value: "SoA", icon: Hammer },
                { label: "Study Labs", value: "Labs", icon: BookMarked },
                {
                  label: "Expansion",
                  value: "Fisch",
                  icon: Sparkles,
                  small: true,
                },
              ].map((item, i) => (
                <ScrollReveal
                  key={item.label}
                  delay={i * 0.08}
                  className={
                    i === 0
                      ? "col-span-2 bg-foreground text-background rounded-3xl p-8 aspect-[2/1] flex flex-col justify-between"
                      : "bg-white border border-black/5 rounded-3xl p-8 aspect-square flex flex-col justify-between"
                  }
                >
                  <div className={i === 0 ? "" : ""}>
                    <item.icon
                      className={`h-8 w-8 ${
                        i === 0 ? "text-amber-300" : "text-primary"
                      }`}
                    />
                  </div>
                  <div>
                    <div
                      className={`font-display ${
                        item.small ? "text-2xl" : "text-5xl md:text-6xl"
                      } leading-none ${i === 0 ? "text-white" : ""}`}
                    >
                      {item.value}
                    </div>
                    <div
                      className={`text-xs uppercase tracking-[0.2em] mt-2 ${
                        i === 0
                          ? "text-white/60"
                          : "text-muted-foreground"
                      }`}
                    >
                      {item.label}
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Testimonials
        heading="Lives shaped by JETS."
        subheading="Our alumni carry these values into industries across the country."
        tone="dark"
      />

      {/* CTA */}
      <section className="relative py-28 lg:py-40 bg-background overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <ScrollReveal>
              <div className="text-xs uppercase tracking-[0.3em] text-primary mb-8 flex items-center gap-3">
                <span className="inline-block w-8 h-px bg-primary/50" />
                Come see for yourself
              </div>
            </ScrollReveal>
            <AnimatedHeading
              as="h2"
              text="Ready to learn more?"
              className="font-display text-6xl md:text-7xl lg:text-8xl leading-[0.9] tracking-[-0.03em] mb-12"
            />
            <FadeUp delay={0.3}>
              <div className="flex flex-col sm:flex-row gap-4">
                <MagneticButton href="/register" variant="primary" size="xl">
                  Apply now
                  <ArrowUpRight className="h-4 w-4" />
                </MagneticButton>
                <MagneticButton href="/contact" variant="dark" size="xl">
                  Schedule a visit
                </MagneticButton>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
