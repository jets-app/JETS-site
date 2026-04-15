"use client";

import Link from "next/link";
import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from "motion/react";
import {
  ArrowUpRight,
  ArrowRight,
  BookOpen,
  Wrench,
  Briefcase,
  Cpu,
  GraduationCap,
  UtensilsCrossed,
  Sparkles,
  MapPin,
  Phone,
  Star,
} from "lucide-react";
import { PublicNav } from "@/components/public/public-nav";
import { PublicFooter } from "@/components/public/public-footer";
import { Testimonials } from "@/components/public/testimonials";
import { Marquee } from "@/components/public/marquee";
import { StatCounter } from "@/components/public/stat-counter";
import { MagneticButton } from "@/components/public/magnetic-button";
import { AnimatedHeading, FadeUp } from "@/components/public/animated-heading";
import {
  ScrollReveal,
  StaggerReveal,
  StaggerItem,
} from "@/components/public/scroll-reveal";
import { BentoGrid, BentoItem } from "@/components/public/bento-grid";

const alumniNames = [
  "Koby Lerner",
  "Mendel Rubashkin",
  "Sam Liberow",
  "Nuchom Levitansky",
  "Motty Vogel",
  "Ari Goldstein",
  "Shimon Katz",
  "Dovid Klein",
  "Yossi Rosen",
  "Menachem Ziv",
  "Boruch Segal",
  "Eli Weiss",
];

export default function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const reduce = useReducedMotion();
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "30%"]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, reduce ? 1 : 1.15]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicNav />

      {/* ===== CINEMATIC HERO ===== */}
      <section
        ref={heroRef}
        className="relative min-h-[100svh] flex items-end overflow-hidden bg-[#0a0608] text-white noise"
      >
        {/* Animated gradient mesh background */}
        <motion.div
          style={{ y: heroY, scale: heroScale }}
          className="absolute inset-0 mesh-bg"
        />

        {/* Ambient glowing orbs */}
        <motion.div
          style={{ opacity: heroOpacity }}
          className="absolute inset-0 pointer-events-none"
        >
          <motion.div
            animate={
              reduce
                ? {}
                : { x: [0, 30, 0], y: [0, -20, 0] }
            }
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[20%] left-[15%] w-[500px] h-[500px] rounded-full bg-primary/30 blur-[120px]"
          />
          <motion.div
            animate={
              reduce
                ? {}
                : { x: [0, -40, 0], y: [0, 30, 0] }
            }
            transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-[10%] right-[10%] w-[600px] h-[600px] rounded-full bg-[#6a0010]/40 blur-[140px]"
          />
          <motion.div
            animate={reduce ? {} : { scale: [1, 1.2, 1] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[50%] left-[50%] w-[300px] h-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500/10 blur-[100px]"
          />
        </motion.div>

        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />

        {/* Concentric rings decoration */}
        <div className="absolute top-[15%] right-[-5%] w-[700px] h-[700px] opacity-[0.06] pointer-events-none">
          <div className="absolute inset-0 border border-white rounded-full" />
          <div className="absolute inset-16 border border-white rounded-full" />
          <div className="absolute inset-32 border border-white rounded-full" />
          <div className="absolute inset-48 border border-white rounded-full" />
        </div>

        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 lg:pb-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-10 flex items-center gap-3"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-400" />
            </span>
            <span className="text-xs uppercase tracking-[0.3em] text-white/60">
              Est. Torah V&apos;avodah · Granada Hills, LA
            </span>
          </motion.div>

          <AnimatedHeading
            as="h1"
            text="Torah &amp; trade."
            className="font-display text-[19vw] sm:text-[14vw] lg:text-[10.5vw] xl:text-[160px] leading-[0.88] tracking-[-0.04em] text-white"
            stagger={0.12}
          />
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-[19vw] sm:text-[14vw] lg:text-[10.5vw] xl:text-[160px] leading-[0.88] tracking-[-0.04em] -mt-2"
          >
            <em className="italic text-amber-200/90 font-serif">A school for</em>
          </motion.div>
          <AnimatedHeading
            as="h1"
            text="young men of action."
            className="font-display text-[15vw] sm:text-[11vw] lg:text-[8vw] xl:text-[130px] leading-[0.9] tracking-[-0.04em] text-white/85 mt-2"
            stagger={0.08}
            delay={0.9}
          />

          <div className="mt-16 grid lg:grid-cols-12 gap-10 items-end">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3, duration: 0.9 }}
              className="lg:col-span-6 text-lg md:text-xl text-white/70 max-w-xl leading-relaxed"
            >
              JETS gives young Jewish men the tools to lead productive,
              fulfilling lives — through Torah learning, vocational mastery,
              and a brotherhood that lasts.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5, duration: 0.8 }}
              className="lg:col-span-6 flex flex-col sm:flex-row items-start lg:justify-end gap-4"
            >
              <MagneticButton href="/register" variant="cream" size="xl">
                Apply for 2026-2027
                <ArrowUpRight className="h-4 w-4" />
              </MagneticButton>
              <MagneticButton href="/contact" variant="outline" size="xl">
                Schedule a visit
              </MagneticButton>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          style={{ opacity: heroOpacity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.35em] text-white/40 flex flex-col items-center gap-2"
        >
          Scroll
          <motion.span
            animate={reduce ? {} : { y: [0, 8, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            className="block w-px h-10 bg-gradient-to-b from-white/60 to-transparent"
          />
        </motion.div>
      </section>

      {/* ===== STATS MARQUEE ===== */}
      <section className="relative bg-[#0a0608] text-white border-y border-white/10 overflow-hidden">
        <Marquee className="py-8" speed="slow">
          {[
            "812 Graduates",
            "Torah V'avodah",
            "57 Courses",
            "Granada Hills · LA",
            "16+ Years",
            "1,600 Students Enrolled",
            "9-10 Acre Campus",
            "Founded by Rabbi Mayer Schmukler",
          ].map((item) => (
            <div
              key={item}
              className="flex items-center gap-12 font-display text-4xl md:text-6xl tracking-tight text-white/15 hover:text-white/40 transition-colors duration-700"
            >
              <span>{item}</span>
              <Star className="h-5 w-5 text-amber-300/60" />
            </div>
          ))}
        </Marquee>
      </section>

      {/* ===== MISSION SECTION — SPLIT SCREEN ===== */}
      <section className="relative py-32 lg:py-44 bg-[#f7f2ea] text-foreground overflow-hidden">
        <div className="absolute inset-0 mesh-cream opacity-60" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-20 items-start">
            <div className="lg:col-span-5 lg:sticky lg:top-32">
              <ScrollReveal>
                <div className="text-xs uppercase tracking-[0.3em] text-primary mb-6 flex items-center gap-3">
                  <span className="inline-block w-8 h-px bg-primary/50" />
                  Our Mission
                </div>
              </ScrollReveal>
              <AnimatedHeading
                as="h2"
                text="Not a choice. A synthesis."
                className="font-display text-5xl md:text-6xl lg:text-7xl leading-[0.95] mb-8"
              />
              <FadeUp delay={0.3}>
                <p className="text-lg text-foreground/70 leading-relaxed max-w-md">
                  Most schools force young men to choose between spiritual
                  depth and professional skill. JETS refuses that false
                  trade-off.
                </p>
              </FadeUp>
            </div>

            <div className="lg:col-span-7 space-y-6">
              <ScrollReveal delay={0.1}>
                <blockquote className="font-display text-3xl md:text-4xl lg:text-5xl leading-[1.05] tracking-tight">
                  <span className="text-foreground/30">
                    &ldquo;JETS is an award-winning technical college and high
                    school that gives young Jewish men the tools with which to
                  </span>{" "}
                  <span className="text-foreground">
                    lead productive and fulfilling lives
                  </span>{" "}
                  <span className="text-foreground/30">
                    through a well-balanced program of Judaic studies, vocational
                    training, and recreational activities.&rdquo;
                  </span>
                </blockquote>
              </ScrollReveal>

              <ScrollReveal delay={0.2}>
                <div className="pt-10 flex items-center gap-6">
                  <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-display text-xl shadow-lg shadow-primary/30">
                    MS
                  </div>
                  <div>
                    <div className="text-sm font-semibold">
                      Rabbi Mayer Schmukler
                    </div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider mt-0.5">
                      Founding Director
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* ===== STAT COUNTERS ===== */}
      <section className="relative bg-[#0a0608] text-white py-24 lg:py-32 noise">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/20 rounded-full blur-[130px]" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <StaggerReveal className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
            {[
              { value: 812, suffix: "", label: "Graduates" },
              { value: 57, suffix: "", label: "Courses" },
              { value: 16, suffix: "+", label: "Years" },
              { value: 1600, suffix: "+", label: "Students Enrolled" },
            ].map((s) => (
              <StaggerItem
                key={s.label}
                className="border-l border-white/10 pl-6 lg:pl-8"
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

      {/* ===== BENTO GRID — WHY JETS ===== */}
      <section className="relative py-28 lg:py-40 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16 max-w-3xl">
            <ScrollReveal>
              <div className="text-xs uppercase tracking-[0.3em] text-primary mb-6 flex items-center gap-3">
                <span className="inline-block w-8 h-px bg-primary/50" />
                Why JETS
              </div>
            </ScrollReveal>
            <AnimatedHeading
              as="h2"
              text="A dual curriculum for a whole life."
              className="font-display text-5xl md:text-6xl lg:text-7xl leading-[0.95] mb-6"
            />
            <FadeUp delay={0.2}>
              <p className="text-lg text-muted-foreground max-w-xl">
                Morning Torah. Afternoon trade. Evening brotherhood. Every
                hour of the day compounds toward the life you&apos;re
                building.
              </p>
            </FadeUp>
          </div>

          <BentoGrid>
            <BentoItem
              tone="primary"
              span="lg:col-span-4 lg:row-span-2 min-h-[420px]"
              index={0}
            >
              <div className="absolute inset-0 opacity-30 pointer-events-none">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-[100px] translate-x-1/3 -translate-y-1/3" />
              </div>
              <div className="relative h-full flex flex-col justify-between">
                <BookOpen className="h-10 w-10 text-amber-200" />
                <div>
                  <div className="text-[11px] uppercase tracking-[0.3em] text-amber-200/80 mb-4">
                    Morning Curriculum
                  </div>
                  <h3 className="font-display text-5xl md:text-6xl lg:text-7xl leading-[0.95] mb-6">
                    Torah,{" "}
                    <em className="italic text-amber-200/90 font-serif">
                      lived daily.
                    </em>
                  </h3>
                  <p className="text-white/70 max-w-md leading-relaxed mb-8">
                    Gemara, Chassidut, Halacha, and Tanach taught by
                    experienced Rabbeim in intimate, transformative learning
                    environments.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {["Gemara", "Chassidut", "Halacha", "Tanach"].map((t) => (
                      <span
                        key={t}
                        className="text-xs px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-white/90"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </BentoItem>

            <BentoItem tone="dark" span="lg:col-span-2" index={1}>
              <div className="flex flex-col h-full justify-between">
                <Wrench className="h-8 w-8 text-amber-300/80" />
                <div>
                  <h3 className="font-display text-3xl md:text-4xl leading-tight mb-3">
                    Trade mastery
                  </h3>
                  <p className="text-sm text-white/60 leading-relaxed">
                    Certifications, portfolios, and employer connections ready
                    on day one.
                  </p>
                </div>
              </div>
            </BentoItem>

            <BentoItem tone="cream" span="lg:col-span-2" index={2}>
              <div className="flex flex-col h-full justify-between">
                <Sparkles className="h-8 w-8 text-primary" />
                <div>
                  <div className="font-display text-6xl leading-none mb-2">
                    <StatCounter value={1} />:<StatCounter value={8} />
                  </div>
                  <div className="text-xs uppercase tracking-wider text-foreground/60">
                    Student to teacher ratio
                  </div>
                </div>
              </div>
            </BentoItem>

            <BentoItem tone="light" span="lg:col-span-3" index={3}>
              <div className="flex flex-col h-full">
                <div className="flex items-start justify-between mb-6">
                  <MapPin className="h-8 w-8 text-primary" />
                  <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                    Our campus
                  </span>
                </div>
                <h3 className="font-display text-4xl lg:text-5xl leading-tight mb-3">
                  9-10 acres in Granada Hills.
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  The Fisch Trade School expansion brings state-of-the-art
                  classrooms, workshops, and study labs across four purpose-built
                  structures.
                </p>
                <Link
                  href="/about"
                  className="mt-auto inline-flex items-center gap-2 text-sm font-medium text-primary hover:gap-3 transition-all"
                >
                  Learn about campus
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </BentoItem>

            <BentoItem tone="dark" span="lg:col-span-3" index={4}>
              <div className="flex flex-col h-full">
                <div className="flex items-start justify-between mb-6">
                  <Briefcase className="h-8 w-8 text-amber-300/80" />
                  <span className="text-[10px] uppercase tracking-[0.25em] text-white/40">
                    12 Tracks
                  </span>
                </div>
                <h3 className="font-display text-4xl lg:text-5xl leading-tight mb-3">
                  Careers that matter.
                </h3>
                <p className="text-sm text-white/60 leading-relaxed mb-4">
                  From EMT to Real Estate, Web Development to Construction —
                  real skills taught by working professionals.
                </p>
                <Link
                  href="/programs"
                  className="mt-auto inline-flex items-center gap-2 text-sm font-medium text-amber-200 hover:gap-3 transition-all"
                >
                  Explore all programs
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </BentoItem>
          </BentoGrid>
        </div>
      </section>

      {/* ===== ALUMNI MARQUEE ===== */}
      <section className="relative bg-[#0a0608] text-white py-20 border-y border-white/5 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <ScrollReveal>
            <div className="flex items-end justify-between gap-8 flex-wrap">
              <div>
                <div className="text-xs uppercase tracking-[0.3em] text-amber-300/80 mb-4 flex items-center gap-3">
                  <span className="inline-block w-8 h-px bg-amber-300/60" />
                  The Brotherhood
                </div>
                <h2 className="font-display text-4xl md:text-5xl lg:text-6xl leading-[0.95]">
                  812 graduates, and{" "}
                  <em className="italic text-amber-200/90 font-serif">counting.</em>
                </h2>
              </div>
            </div>
          </ScrollReveal>
        </div>
        <Marquee className="py-2" speed="slow">
          {alumniNames.map((name) => (
            <div
              key={name}
              className="flex items-center gap-8 font-display text-5xl md:text-7xl tracking-tight text-white/20"
            >
              <span>{name}</span>
              <span className="text-amber-300/50">·</span>
            </div>
          ))}
        </Marquee>
        <Marquee className="py-2 mt-2" speed="slow" reverse>
          {alumniNames
            .slice()
            .reverse()
            .map((name) => (
              <div
                key={name}
                className="flex items-center gap-8 font-display text-5xl md:text-7xl tracking-tight italic font-serif text-white/10"
              >
                <span>{name}</span>
                <span className="text-amber-300/40">·</span>
              </div>
            ))}
        </Marquee>
      </section>

      {/* ===== PROGRAMS SNAPSHOT ===== */}
      <section className="py-28 lg:py-40 bg-[#f7f2ea]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-20">
            <div>
              <ScrollReveal>
                <div className="text-xs uppercase tracking-[0.3em] text-primary mb-6 flex items-center gap-3">
                  <span className="inline-block w-8 h-px bg-primary/50" />
                  Programs
                </div>
              </ScrollReveal>
              <AnimatedHeading
                as="h2"
                text="Six worlds. One curriculum."
                className="font-display text-5xl md:text-6xl lg:text-7xl leading-[0.95]"
              />
            </div>
            <FadeUp delay={0.2}>
              <Link
                href="/programs"
                className="group inline-flex items-center gap-3 text-base font-medium border-b border-foreground/30 pb-2 hover:border-foreground transition-colors self-start"
              >
                Explore all programs
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              </Link>
            </FadeUp>
          </div>

          <StaggerReveal className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                icon: BookOpen,
                title: "Judaic Studies",
                tag: "Morning",
                items: ["Gemara", "Chassidut", "Halacha", "Tanach"],
              },
              {
                icon: Cpu,
                title: "Applied Technology",
                tag: "Professional",
                items: ["Web Dev", "Digital Media", "Computers"],
              },
              {
                icon: Wrench,
                title: "Skilled Trades",
                tag: "Professional",
                items: ["Construction", "Electrical", "EMT"],
              },
              {
                icon: Briefcase,
                title: "Business",
                tag: "Professional",
                items: ["Entrepreneurship", "Accounting", "Marketing"],
              },
              {
                icon: GraduationCap,
                title: "High School & GED",
                tag: "Academic",
                items: ["GED Prep", "English", "Math", "Science"],
              },
              {
                icon: UtensilsCrossed,
                title: "Extracurricular",
                tag: "Enrichment",
                items: ["Culinary", "Music", "Martial Arts", "Sports"],
              },
            ].map((p) => (
              <StaggerItem key={p.title}>
                <div className="group relative bg-white rounded-3xl p-8 h-full border border-black/5 hover:border-primary/30 hover:-translate-y-1 transition-all duration-500 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/0 group-hover:from-primary/5 transition-all duration-500" />
                  <div className="relative flex flex-col h-full">
                    <div className="flex items-center justify-between mb-12">
                      <div className="w-12 h-12 rounded-2xl bg-primary/5 group-hover:bg-primary group-hover:text-white flex items-center justify-center transition-colors duration-500">
                        <p.icon className="h-5 w-5" />
                      </div>
                      <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                        {p.tag}
                      </span>
                    </div>
                    <h3 className="font-display text-3xl mb-4">{p.title}</h3>
                    <div className="flex flex-wrap gap-1.5 mt-auto">
                      {p.items.map((i) => (
                        <span
                          key={i}
                          className="text-[11px] px-2.5 py-1 rounded-full bg-muted text-foreground/70"
                        >
                          {i}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerReveal>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <Testimonials
        heading="Voices from the brotherhood."
        subheading="Real graduates, real careers. The JETS experience in their own words."
        tone="dark"
      />

      {/* ===== FINAL CTA ===== */}
      <section className="relative py-28 lg:py-40 bg-[#f7f2ea] overflow-hidden">
        <div className="absolute inset-0 mesh-cream opacity-60" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl">
            <ScrollReveal>
              <div className="text-xs uppercase tracking-[0.3em] text-primary mb-8 flex items-center gap-3">
                <span className="inline-block w-8 h-px bg-primary/50" />
                Start your story
              </div>
            </ScrollReveal>
            <AnimatedHeading
              as="h2"
              text="Your future starts with a single step."
              className="font-display text-6xl md:text-7xl lg:text-8xl xl:text-9xl leading-[0.9] tracking-[-0.03em] mb-12"
            />
            <FadeUp delay={0.3}>
              <p className="text-xl md:text-2xl text-foreground/60 leading-relaxed max-w-2xl mb-14 font-serif italic">
                Applications are open for the 2026-2027 academic year.
                Whatever trade you want to pursue — or if you&apos;re still
                figuring it out — JETS meets you where you are.
              </p>
            </FadeUp>
            <FadeUp delay={0.4}>
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <MagneticButton href="/register" variant="primary" size="xl">
                  Start your application
                  <ArrowUpRight className="h-4 w-4" />
                </MagneticButton>
                <MagneticButton href="/contact" variant="dark" size="xl">
                  <Phone className="h-4 w-4" />
                  Talk to admissions
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
