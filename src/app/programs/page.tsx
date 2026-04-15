"use client";

import {
  BookOpen,
  Briefcase,
  GraduationCap,
  Sparkles,
  Dumbbell,
  ArrowUpRight,
  Globe,
  Award,
  Hammer,
  Monitor,
  Building,
  ShieldCheck,
  Calculator,
  Code,
  HeartPulse,
  Shield,
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
import { Marquee } from "@/components/public/marquee";
import { BentoGrid, BentoItem } from "@/components/public/bento-grid";
import { MagneticButton } from "@/components/public/magnetic-button";

const categories = [
  {
    title: "Judaic Studies",
    tag: "Morning Curriculum",
    icon: BookOpen,
    description:
      "Daily immersion in the core texts and ideas of Jewish life, guided by experienced Rabbeim committed to every student's spiritual growth.",
    items: ["Chassidut", "Halacha", "Gemara", "Tanach"],
  },
  {
    title: "Professional Tracks",
    tag: "Trade Education",
    icon: Briefcase,
    description:
      "Industry-aligned tracks taught by working professionals. Students build portfolios, earn certifications, and graduate ready to work.",
    items: [
      "Entrepreneurship",
      "Real Estate",
      "Construction",
      "Digital Media",
      "Applied Tech",
      "Accounting",
      "Business",
      "Computers",
      "Electrical",
      "Marketing",
      "Web Development",
      "EMT",
    ],
  },
  {
    title: "High School & GED",
    tag: "Academic Foundation",
    icon: GraduationCap,
    description:
      "A clear, supportive pathway for students completing secondary education alongside their trade and Torah studies.",
    items: ["GED", "English", "Math", "Science"],
  },
  {
    title: "Year One Foundations",
    tag: "Core Curriculum",
    icon: Sparkles,
    description:
      "Every new student begins here. The first year builds the habits and mindset every JETS graduate carries for life.",
    items: ["Core curriculum", "Study skills", "Work ethic", "Conduct"],
  },
  {
    title: "Extracurricular",
    tag: "Enrichment",
    icon: Dumbbell,
    description:
      "Growth beyond the classroom. Culinary, music, martial arts, fitness, and sports — building well-rounded young men.",
    items: ["Culinary", "Music", "Martial Arts", "Fitness", "Sports"],
  },
];

const tracks = [
  { label: "Entrepreneurship", icon: Sparkles },
  { label: "Real Estate", icon: Building },
  { label: "Construction", icon: Hammer },
  { label: "Digital Media", icon: Monitor },
  { label: "Applied Technology", icon: Shield },
  { label: "Accounting", icon: Calculator },
  { label: "Business", icon: Briefcase },
  { label: "Computers", icon: Monitor },
  { label: "Electrical", icon: ShieldCheck },
  { label: "Marketing", icon: Sparkles },
  { label: "Web Development", icon: Code },
  { label: "EMT", icon: HeartPulse },
];

const partners = [
  { name: "University of East London", location: "London, UK" },
  { name: "Torrens University", location: "Sydney, Australia" },
  { name: "Rome Institution", location: "Rome, Italy" },
  { name: "Global Partners", location: "Worldwide" },
];

export default function ProgramsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicNav />

      {/* HERO */}
      <section className="relative min-h-[75svh] flex items-end bg-[#0a0608] text-white overflow-hidden noise">
        <div className="absolute inset-0 mesh-bg" />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] left-[10%] w-[500px] h-[500px] bg-primary/25 rounded-full blur-[120px]" />
        </div>
        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-40 pb-24">
          <FadeUp>
            <div className="text-xs uppercase tracking-[0.3em] text-amber-300/80 mb-10 flex items-center gap-3">
              <span className="inline-block w-8 h-px bg-amber-300/60" />
              Programs &amp; Curriculum
            </div>
          </FadeUp>
          <AnimatedHeading
            as="h1"
            text="Two worlds."
            className="font-display text-[18vw] sm:text-[14vw] lg:text-[11vw] xl:text-[170px] leading-[0.88] tracking-[-0.04em]"
          />
          <AnimatedHeading
            as="h1"
            text="One curriculum."
            className="font-display text-[18vw] sm:text-[14vw] lg:text-[11vw] xl:text-[170px] leading-[0.88] tracking-[-0.04em] italic font-serif text-amber-200/90 mt-1"
            delay={0.3}
          />
          <FadeUp delay={0.8}>
            <p className="mt-12 text-lg md:text-xl text-white/70 max-w-2xl leading-relaxed">
              Morning Torah study meets afternoon trade training. A daily
              rhythm that builds depth of character and marketable, modern
              skills — side by side.
            </p>
          </FadeUp>
        </div>
      </section>

      {/* CATEGORY LIST (EDITORIAL) */}
      <section className="py-28 lg:py-40 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-20">
            <ScrollReveal>
              <div className="text-xs uppercase tracking-[0.3em] text-primary mb-6 flex items-center gap-3">
                <span className="inline-block w-8 h-px bg-primary/50" />
                Five Tracks
              </div>
            </ScrollReveal>
            <AnimatedHeading
              as="h2"
              text="Depth of character. Marketable skill."
              className="font-display text-5xl md:text-6xl lg:text-7xl leading-[0.95]"
            />
          </div>

          <div className="border-t border-border">
            {categories.map((c, i) => (
              <ScrollReveal key={c.title} delay={i * 0.05}>
                <div className="group grid lg:grid-cols-12 gap-6 items-start py-10 md:py-14 border-b border-border">
                  <div className="lg:col-span-1 font-display text-2xl text-primary/50">
                    0{i + 1}
                  </div>
                  <div className="lg:col-span-3 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors duration-500">
                      <c.icon className="h-5 w-5" />
                    </div>
                    <div className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
                      {c.tag}
                    </div>
                  </div>
                  <div className="lg:col-span-4">
                    <h3 className="font-display text-5xl md:text-6xl leading-[0.95] group-hover:translate-x-2 transition-transform duration-500">
                      {c.title}
                    </h3>
                  </div>
                  <div className="lg:col-span-4">
                    <p className="text-foreground/70 leading-relaxed mb-5">
                      {c.description}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {c.items.map((item) => (
                        <span
                          key={item}
                          className="text-[11px] px-2.5 py-1 rounded-full bg-muted text-foreground/70"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* TRACK ICONS MARQUEE */}
      <section className="bg-[#0a0608] text-white py-20 border-y border-white/5 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
          <ScrollReveal>
            <div className="text-xs uppercase tracking-[0.3em] text-amber-300/80 mb-6 flex items-center gap-3">
              <span className="inline-block w-8 h-px bg-amber-300/60" />
              Twelve professional tracks
            </div>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl leading-[0.95]">
              Skills that open doors across{" "}
              <em className="italic text-amber-200/90 font-serif">
                today&apos;s top industries.
              </em>
            </h2>
          </ScrollReveal>
        </div>
        <Marquee className="py-6" speed="slow">
          {tracks.map((t) => (
            <div
              key={t.label}
              className="flex items-center gap-4 px-8 py-4 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-amber-300/30 transition-colors duration-500"
            >
              <t.icon className="h-5 w-5 text-amber-300/80" />
              <span className="font-display text-2xl md:text-3xl whitespace-nowrap">
                {t.label}
              </span>
            </div>
          ))}
        </Marquee>
        <Marquee className="py-6" speed="slow" reverse>
          {tracks
            .slice()
            .reverse()
            .map((t) => (
              <div
                key={t.label + "-r"}
                className="flex items-center gap-4 px-8 py-4 rounded-full bg-white/5 border border-white/10"
              >
                <t.icon className="h-5 w-5 text-white/40" />
                <span className="font-serif italic text-2xl md:text-3xl whitespace-nowrap text-white/40">
                  {t.label}
                </span>
              </div>
            ))}
        </Marquee>
      </section>

      {/* GLOBAL PARTNERSHIPS — BENTO */}
      <section className="py-28 lg:py-40 bg-[#f7f2ea] relative overflow-hidden">
        <div className="absolute inset-0 mesh-cream opacity-50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 mb-16 items-end">
            <div className="lg:col-span-7">
              <ScrollReveal>
                <div className="text-xs uppercase tracking-[0.3em] text-primary mb-6 flex items-center gap-3">
                  <span className="inline-block w-8 h-px bg-primary/50" />
                  Global Partnerships
                </div>
              </ScrollReveal>
              <AnimatedHeading
                as="h2"
                text="Degree pathways around the world."
                className="font-display text-5xl md:text-6xl lg:text-7xl leading-[0.95]"
              />
            </div>
            <FadeUp delay={0.2} className="lg:col-span-5">
              <p className="text-lg text-foreground/70 leading-relaxed">
                JETS students access degree programs through a growing network
                of international university partners — pathways that extend from
                Los Angeles to London, Sydney, and Rome.
              </p>
            </FadeUp>
          </div>

          <BentoGrid>
            {partners.map((p, i) => (
              <BentoItem
                key={p.name}
                tone={i === 0 ? "dark" : i === 1 ? "primary" : "light"}
                span={i === 0 ? "lg:col-span-3 lg:row-span-2 min-h-[360px]" : "lg:col-span-3"}
                index={i}
              >
                <div className="flex flex-col h-full justify-between">
                  <Globe
                    className={`h-10 w-10 ${
                      i === 0
                        ? "text-amber-300/80"
                        : i === 1
                          ? "text-amber-200"
                          : "text-primary"
                    }`}
                  />
                  <div>
                    <div
                      className={`text-[10px] uppercase tracking-[0.3em] mb-3 ${
                        i === 0
                          ? "text-white/40"
                          : i === 1
                            ? "text-white/70"
                            : "text-muted-foreground"
                      }`}
                    >
                      {p.location}
                    </div>
                    <h3 className="font-display text-3xl md:text-4xl leading-tight">
                      {p.name}
                    </h3>
                  </div>
                </div>
              </BentoItem>
            ))}
          </BentoGrid>
        </div>
      </section>

      {/* TRADE CERTIFICATES */}
      <section className="py-28 lg:py-40 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5">
              <ScrollReveal>
                <div className="text-xs uppercase tracking-[0.3em] text-primary mb-6 flex items-center gap-3">
                  <span className="inline-block w-8 h-px bg-primary/50" />
                  Industry-Recognized
                </div>
              </ScrollReveal>
              <AnimatedHeading
                as="h2"
                text="Trade certificates that employers trust."
                className="font-display text-5xl md:text-6xl leading-[0.95] mb-8"
              />
              <FadeUp delay={0.2}>
                <p className="text-lg text-foreground/70 leading-relaxed">
                  Partnerships with accredited colleges and occupational
                  training centers mean JETS students earn industry-recognized
                  certificates alongside their Judaic studies — real credentials
                  from trusted institutions.
                </p>
              </FadeUp>
            </div>
            <div className="lg:col-span-7">
              <StaggerReveal className="grid sm:grid-cols-2 gap-4">
                {[
                  "Accredited partner institutions",
                  "Occupational training centers",
                  "Nationally-recognized certificates",
                  "Employer-trusted credentials",
                ].map((item) => (
                  <StaggerItem key={item}>
                    <div className="relative bg-card border border-border rounded-3xl p-8 h-full group hover:border-primary/30 transition-all">
                      <Award className="h-8 w-8 text-primary mb-6" />
                      <div className="font-display text-2xl leading-tight">
                        {item}
                      </div>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerReveal>
            </div>
          </div>
        </div>
      </section>

      <Testimonials
        heading="Alumni in the field."
        subheading="The proof of our curriculum is in the careers our graduates build."
        tone="dark"
      />

      {/* CTA */}
      <section className="py-28 lg:py-40 bg-[#f7f2ea] relative overflow-hidden">
        <div className="absolute inset-0 mesh-cream opacity-60" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <AnimatedHeading
              as="h2"
              text="Find your track."
              className="font-display text-6xl md:text-7xl lg:text-8xl xl:text-9xl leading-[0.9] mb-12"
            />
            <FadeUp delay={0.3}>
              <p className="text-xl text-foreground/60 max-w-2xl mb-14 font-serif italic leading-relaxed">
                Talk with our admissions team about the program that fits your
                strengths and ambitions.
              </p>
            </FadeUp>
            <FadeUp delay={0.4}>
              <div className="flex flex-col sm:flex-row gap-4">
                <MagneticButton href="/register" variant="primary" size="xl">
                  Start your application
                  <ArrowUpRight className="h-4 w-4" />
                </MagneticButton>
                <MagneticButton href="/contact" variant="dark" size="xl">
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
