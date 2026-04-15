"use client";

import {
  BookOpen,
  Briefcase,
  GraduationCap,
  ArrowUpRight,
  Scale,
  Users,
  ShieldCheck,
  Award,
  ClipboardList,
  Heart,
  Sparkles,
  Building2,
} from "lucide-react";
import { PublicNav } from "@/components/public/public-nav";
import { PublicFooter } from "@/components/public/public-footer";
import { AnimatedHeading, FadeUp } from "@/components/public/animated-heading";
import {
  ScrollReveal,
  StaggerReveal,
  StaggerItem,
} from "@/components/public/scroll-reveal";
import { MagneticButton } from "@/components/public/magnetic-button";

const leaders = [
  {
    initials: "MS",
    name: "Rabbi Mayer Schmukler",
    role: "Founding Director",
    tagline: "The vision that built JETS.",
    bio: "Rabbi Schmukler founded JETS with a singular vision: integrating Torah study with practical career preparation to empower young Jewish men to build lives of purpose, independence, and meaning. An experienced educator and community leader, he continues to guide JETS' mission — ensuring every student receives both moral grounding and the tools to thrive in the modern workforce.",
    highlights: [
      { icon: Sparkles, label: "Founding vision & strategy" },
      { icon: Heart, label: "Student formation" },
      { icon: BookOpen, label: "Torah leadership" },
    ],
  },
  {
    initials: "RS",
    name: "Rabbi Y. Boruch Sufrin",
    role: "COO · Provost of Judaic Studies",
    tagline: "The Judaic heart of JETS.",
    bio: "Ordained rabbi and experienced educational administrator who has served as Head of School and synagogue rabbi. Rabbi Sufrin oversees the Judaic heart of JETS and coordinates day-to-day institutional operations — from curriculum and admissions to campus operations and student culture.",
    highlights: [
      { icon: BookOpen, label: "Judaic curriculum & instruction" },
      { icon: ClipboardList, label: "Admissions & academic records" },
      { icon: Building2, label: "Campus operations & safety" },
      { icon: Heart, label: "Student services & culture" },
      { icon: Scale, label: "Regulatory recordkeeping" },
      { icon: Sparkles, label: "Religious & pastoral guidance" },
    ],
  },
  {
    initials: "MH",
    name: "Matthew B. Hintze",
    role: "CAO · Provost of Professional Studies",
    tagline: "Where academic rigor meets industry standards.",
    bio: "MBA from the University of Florida with doctoral coursework in Finance. Former Adjunct Faculty in the Department of Finance, Insurance, and Real Estate at the University of Florida. Matthew leads Professional Studies and serves as Compliance & Regulatory Liaison — ensuring every program meets the highest academic and industry standards.",
    highlights: [
      { icon: Award, label: "Professional Studies oversight" },
      { icon: BookOpen, label: "Curriculum & instructional quality" },
      { icon: Users, label: "Faculty supervision" },
      { icon: ClipboardList, label: "Academic policies & catalogs" },
      { icon: Scale, label: "Regulatory coordination" },
      { icon: ShieldCheck, label: "Compliance oversight" },
    ],
  },
];

export default function FacultyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicNav />

      {/* HERO */}
      <section className="relative min-h-[75svh] flex items-end bg-[#0a0608] text-white overflow-hidden noise">
        <div className="absolute inset-0 mesh-bg" />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] right-[10%] w-[500px] h-[500px] bg-primary/25 rounded-full blur-[120px]" />
        </div>
        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-40 pb-24">
          <FadeUp>
            <div className="text-xs uppercase tracking-[0.3em] text-amber-300/80 mb-10 flex items-center gap-3">
              <span className="inline-block w-8 h-px bg-amber-300/60" />
              Leadership &amp; Faculty
            </div>
          </FadeUp>
          <AnimatedHeading
            as="h1"
            text="Mentors, not"
            className="font-display text-[18vw] sm:text-[14vw] lg:text-[11vw] xl:text-[170px] leading-[0.88] tracking-[-0.04em]"
          />
          <AnimatedHeading
            as="h1"
            text="instructors."
            className="font-display text-[18vw] sm:text-[14vw] lg:text-[11vw] xl:text-[170px] leading-[0.88] tracking-[-0.04em] italic font-serif text-amber-200/90 mt-1"
            delay={0.25}
          />
          <FadeUp delay={0.8}>
            <p className="mt-12 text-lg md:text-xl text-white/70 max-w-2xl leading-relaxed">
              Our Rabbeim, industry professionals, and academic faculty share
              one commitment: seeing each student as a whole person — and
              guiding him toward his greatest self.
            </p>
          </FadeUp>
        </div>
      </section>

      {/* LEADERS - EDITORIAL STYLE */}
      <section className="py-28 lg:py-40 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-20">
            <ScrollReveal>
              <div className="text-xs uppercase tracking-[0.3em] text-primary mb-6 flex items-center gap-3">
                <span className="inline-block w-8 h-px bg-primary/50" />
                Executive Leadership
              </div>
            </ScrollReveal>
            <AnimatedHeading
              as="h2"
              text="The team running JETS every day."
              className="font-display text-5xl md:text-6xl lg:text-7xl leading-[0.95]"
            />
          </div>

          <div className="space-y-20 lg:space-y-32">
            {leaders.map((leader, i) => (
              <ScrollReveal key={leader.name} delay={0}>
                <div
                  className={`group grid lg:grid-cols-12 gap-10 items-start ${
                    i % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""
                  }`}
                >
                  {/* Portrait card */}
                  <div className="lg:col-span-5">
                    <div className="relative aspect-[4/5] rounded-3xl bg-gradient-to-br from-primary via-[#8a0014] to-[#6a0010] overflow-hidden noise group-hover:scale-[1.01] transition-transform duration-700">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.12),transparent)]" />
                      <div className="absolute top-8 right-8 text-[10px] uppercase tracking-[0.3em] text-amber-200/70">
                        0{i + 1}
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="font-display text-[220px] leading-none text-white/15">
                          {leader.initials}
                        </div>
                      </div>
                      <div className="absolute bottom-10 left-10 right-10">
                        <div className="text-[10px] uppercase tracking-[0.3em] text-amber-200/80 mb-3">
                          {leader.role}
                        </div>
                        <div className="font-display text-3xl md:text-4xl text-white leading-tight">
                          {leader.name}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="lg:col-span-7 lg:pt-8">
                    <h3 className="font-display text-4xl md:text-5xl lg:text-6xl leading-[1] tracking-[-0.02em] mb-8">
                      <em className="italic font-serif text-primary">
                        {leader.tagline}
                      </em>
                    </h3>
                    <p className="text-lg text-foreground/70 leading-relaxed mb-10">
                      {leader.bio}
                    </p>

                    <div className="border-t border-border pt-8">
                      <div className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-5">
                        Responsibilities
                      </div>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {leader.highlights.map((h) => (
                          <div
                            key={h.label}
                            className="flex items-start gap-3"
                          >
                            <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center shrink-0 mt-0.5">
                              <h.icon className="h-4 w-4 text-primary" />
                            </div>
                            <span className="text-sm text-foreground/80 leading-snug pt-1.5">
                              {h.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* FACULTY TYPES */}
      <section className="py-28 lg:py-40 bg-[#0a0608] text-white noise relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-[20%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[140px]" />
          <div className="absolute bottom-0 right-[15%] w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-[120px]" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-20">
            <ScrollReveal>
              <div className="text-xs uppercase tracking-[0.3em] text-amber-300/80 mb-6 flex items-center gap-3">
                <span className="inline-block w-8 h-px bg-amber-300/60" />
                Our Educators
              </div>
            </ScrollReveal>
            <AnimatedHeading
              as="h2"
              text="Three kinds of teacher. One shared commitment."
              className="font-display text-5xl md:text-6xl lg:text-7xl leading-[0.95]"
            />
          </div>

          <StaggerReveal className="grid md:grid-cols-3 gap-5">
            {[
              {
                icon: BookOpen,
                title: "Judaic Rabbeim",
                desc: "Leading daily Gemara, Halacha, Chassidut, and Tanach with warmth and depth.",
                count: "01",
              },
              {
                icon: Briefcase,
                title: "Industry Professionals",
                desc: "Working experts teaching current tools, workflows, and real-world standards.",
                count: "02",
              },
              {
                icon: GraduationCap,
                title: "Academic Faculty",
                desc: "Credentialed instructors leading GED prep, English, math, and science.",
                count: "03",
              },
            ].map((f) => (
              <StaggerItem key={f.title}>
                <div className="group relative bg-white/[0.03] border border-white/10 rounded-3xl p-10 h-full hover:bg-white/[0.06] hover:border-amber-300/30 transition-all duration-500 overflow-hidden">
                  <div className="absolute top-6 right-6 font-display text-2xl text-amber-300/40">
                    {f.count}
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-amber-300/10 flex items-center justify-center mb-10">
                    <f.icon className="h-6 w-6 text-amber-200" />
                  </div>
                  <h3 className="font-display text-3xl md:text-4xl leading-tight mb-4 group-hover:translate-x-1 transition-transform duration-500">
                    {f.title}
                  </h3>
                  <p className="text-white/60 leading-relaxed">{f.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerReveal>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28 lg:py-40 bg-[#f7f2ea] relative overflow-hidden">
        <div className="absolute inset-0 mesh-cream opacity-60" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <AnimatedHeading
              as="h2"
              text="Come meet the team."
              className="font-display text-6xl md:text-7xl lg:text-8xl leading-[0.9] mb-12"
            />
            <FadeUp delay={0.3}>
              <p className="text-xl text-foreground/60 max-w-2xl mb-14 font-serif italic leading-relaxed">
                Schedule a visit to the campus and meet the educators who will
                shape your JETS experience.
              </p>
            </FadeUp>
            <FadeUp delay={0.4}>
              <div className="flex flex-col sm:flex-row gap-4">
                <MagneticButton href="/contact" variant="primary" size="xl">
                  Schedule a visit
                  <ArrowUpRight className="h-4 w-4" />
                </MagneticButton>
                <MagneticButton href="/register" variant="dark" size="xl">
                  Apply now
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
