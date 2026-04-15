"use client";

import Link from "next/link";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  CalendarClock,
  ArrowUpRight,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import { PublicNav } from "@/components/public/public-nav";
import { PublicFooter } from "@/components/public/public-footer";
import { ContactForm } from "@/components/public/contact-form";
import { AnimatedHeading, FadeUp } from "@/components/public/animated-heading";
import {
  ScrollReveal,
  StaggerReveal,
  StaggerItem,
} from "@/components/public/scroll-reveal";
import { MagneticButton } from "@/components/public/magnetic-button";

const CALENDLY_URL =
  process.env.NEXT_PUBLIC_CALENDLY_URL || "https://calendly.com/jets-school";

const CAMPUS_ADDRESS = "16601 Rinaldi Street, Granada Hills, CA 91344";
const MAP_EMBED = `https://www.google.com/maps?q=${encodeURIComponent(
  CAMPUS_ADDRESS,
)}&output=embed`;

const infoCards = [
  {
    icon: MapPin,
    label: "Campus",
    primary: "16601 Rinaldi Street",
    secondary: "Granada Hills, CA 91344",
    href: `https://maps.google.com/?q=${encodeURIComponent(CAMPUS_ADDRESS)}`,
  },
  {
    icon: Phone,
    label: "Phone",
    primary: "(818) 831-3000",
    secondary: "Speak with our office",
    href: "tel:+18188313000",
  },
  {
    icon: Mail,
    label: "Email",
    primary: "info@jetsschool.org",
    secondary: "Reply within 1 business day",
    href: "mailto:info@jetsschool.org",
  },
  {
    icon: Clock,
    label: "Hours",
    primary: "Mon – Fri · 9am – 5pm PT",
    secondary: "Closed Shabbat & Yom Tov",
  },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicNav />

      {/* HERO */}
      <section className="relative min-h-[70svh] flex items-end bg-[#0a0608] text-white overflow-hidden noise">
        <div className="absolute inset-0 mesh-bg" />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] left-[5%] w-[500px] h-[500px] bg-primary/25 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-[10%] w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-[100px]" />
        </div>
        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-40 pb-24">
          <FadeUp>
            <div className="text-xs uppercase tracking-[0.3em] text-amber-300/80 mb-10 flex items-center gap-3">
              <MessageCircle className="h-3.5 w-3.5 text-amber-300" />
              We&apos;re here to help
            </div>
          </FadeUp>
          <AnimatedHeading
            as="h1"
            text="Let's"
            className="font-display text-[20vw] sm:text-[14vw] lg:text-[11vw] xl:text-[180px] leading-[0.88] tracking-[-0.04em]"
          />
          <AnimatedHeading
            as="h1"
            text="talk."
            className="font-display text-[20vw] sm:text-[14vw] lg:text-[11vw] xl:text-[180px] leading-[0.88] tracking-[-0.04em] italic font-serif text-amber-200/90 mt-1"
            delay={0.2}
          />
          <FadeUp delay={0.7}>
            <p className="mt-12 text-lg md:text-xl text-white/70 max-w-2xl leading-relaxed">
              Whether you&apos;re exploring admissions, scheduling a visit, or
              simply curious about JETS, our team is ready to answer every
              question.
            </p>
          </FadeUp>
        </div>
      </section>

      {/* INFO CARDS */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <StaggerReveal className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {infoCards.map((c) => {
              const content = (
                <div className="group relative bg-card border border-border rounded-3xl p-8 h-full hover:border-primary/30 hover:-translate-y-1 transition-all duration-500 overflow-hidden">
                  <div className="flex items-start justify-between mb-10">
                    <div className="w-12 h-12 rounded-2xl bg-primary/5 group-hover:bg-primary group-hover:text-white flex items-center justify-center transition-colors duration-500">
                      <c.icon className="h-5 w-5" />
                    </div>
                    {c.href && (
                      <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all" />
                    )}
                  </div>
                  <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-3">
                    {c.label}
                  </div>
                  <div className="font-display text-2xl leading-tight mb-2">
                    {c.primary}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {c.secondary}
                  </div>
                </div>
              );
              return (
                <StaggerItem key={c.label}>
                  {c.href ? (
                    <a
                      href={c.href}
                      target={c.href.startsWith("http") ? "_blank" : undefined}
                      rel={
                        c.href.startsWith("http")
                          ? "noopener noreferrer"
                          : undefined
                      }
                      className="block h-full"
                    >
                      {content}
                    </a>
                  ) : (
                    <div className="h-full">{content}</div>
                  )}
                </StaggerItem>
              );
            })}
          </StaggerReveal>
        </div>
      </section>

      {/* FORM + CONSULTATION */}
      <section className="py-20 lg:py-28 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-10">
            <div className="lg:col-span-7">
              <ScrollReveal>
                <div className="text-xs uppercase tracking-[0.3em] text-primary mb-6 flex items-center gap-3">
                  <span className="inline-block w-8 h-px bg-primary/50" />
                  Send a message
                </div>
              </ScrollReveal>
              <AnimatedHeading
                as="h2"
                text="Drop us a note."
                className="font-display text-5xl md:text-6xl leading-[0.95] mb-6"
              />
              <FadeUp delay={0.2}>
                <p className="text-lg text-foreground/70 leading-relaxed mb-10 max-w-xl">
                  Fill out the form and our team will reply within one business
                  day. For urgent matters, call{" "}
                  <a
                    href="tel:+18188313000"
                    className="text-primary font-medium hover:underline"
                  >
                    (818) 831-3000
                  </a>
                  .
                </p>
              </FadeUp>
              <FadeUp delay={0.3}>
                <ContactForm />
              </FadeUp>
            </div>

            <div className="lg:col-span-5">
              <ScrollReveal>
                <div className="text-xs uppercase tracking-[0.3em] text-primary mb-6 flex items-center gap-3">
                  <span className="inline-block w-8 h-px bg-primary/50" />
                  Book a call
                </div>
              </ScrollReveal>
              <AnimatedHeading
                as="h2"
                text="One-on-one with admissions."
                className="font-display text-4xl md:text-5xl leading-[0.95] mb-8"
              />

              <ScrollReveal delay={0.2}>
                <div className="relative rounded-3xl p-10 overflow-hidden bg-[#0a0608] text-white noise">
                  <div className="absolute inset-0 mesh-bg opacity-60" />
                  <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-amber-500/15 rounded-full blur-[90px]" />
                  <div className="relative">
                    <div className="w-12 h-12 rounded-2xl bg-amber-300/15 flex items-center justify-center mb-6">
                      <CalendarClock className="h-6 w-6 text-amber-200" />
                    </div>
                    <h3 className="font-display text-3xl leading-tight mb-3">
                      Schedule a 1-on-1 call.
                    </h3>
                    <p className="text-white/60 leading-relaxed mb-8">
                      Pick a time that works for you. 30 minutes. No commitment.
                    </p>
                    <Link
                      href={CALENDLY_URL}
                      className="group inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white text-[#0a0608] font-semibold text-sm hover:bg-amber-200 transition-colors"
                    >
                      Open scheduler
                      <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </Link>
                    <div className="flex items-center gap-2 mt-8 text-xs text-white/50">
                      <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                      <span>Average response: under 1 hour</span>
                    </div>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={0.3}>
                <div className="mt-6 p-8 rounded-3xl bg-[#f7f2ea] border border-[#d9c9b0]/50">
                  <div className="text-[10px] uppercase tracking-[0.3em] text-foreground/50 mb-3">
                    Prefer to visit?
                  </div>
                  <p className="font-display text-2xl leading-tight mb-5">
                    Tour the campus. Sit in on a class.
                  </p>
                  <Link
                    href="/contact"
                    className="group inline-flex items-center gap-2 text-sm font-medium border-b border-foreground/30 pb-1 hover:border-foreground transition-colors"
                  >
                    Request a tour
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* MAP */}
      <section className="py-20 lg:py-28 bg-[#0a0608] text-white noise relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-[10%] w-[400px] h-[400px] bg-primary/20 rounded-full blur-[120px]" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-5">
              <ScrollReveal>
                <div className="text-xs uppercase tracking-[0.3em] text-amber-300/80 mb-6 flex items-center gap-3">
                  <span className="inline-block w-8 h-px bg-amber-300/60" />
                  Find us
                </div>
              </ScrollReveal>
              <AnimatedHeading
                as="h2"
                text="Visit our campus."
                className="font-display text-5xl md:text-6xl leading-[0.95] mb-8"
              />
              <FadeUp delay={0.2}>
                <p className="text-lg text-white/60 leading-relaxed mb-10 max-w-md">
                  Our 9-10 acre campus in Granada Hills welcomes prospective
                  students and families year-round. Schedule ahead for the full
                  tour.
                </p>
              </FadeUp>
              <div className="space-y-4">
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(
                    CAMPUS_ADDRESS,
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-4 group"
                >
                  <MapPin className="h-5 w-5 mt-1 shrink-0 text-amber-300/80" />
                  <span className="text-white/80 group-hover:text-white transition-colors">
                    {CAMPUS_ADDRESS}
                  </span>
                </a>
                <a
                  href="tel:+18188313000"
                  className="flex items-start gap-4 group"
                >
                  <Phone className="h-5 w-5 mt-1 shrink-0 text-amber-300/80" />
                  <span className="text-white/80 group-hover:text-white transition-colors">
                    (818) 831-3000
                  </span>
                </a>
              </div>
            </div>
            <ScrollReveal className="lg:col-span-7" delay={0.1}>
              <div className="relative rounded-3xl overflow-hidden border border-white/10 aspect-[16/10] bg-white/5 shadow-2xl shadow-black/50">
                <iframe
                  title="JETS School Campus Map"
                  src={MAP_EMBED}
                  width="100%"
                  height="100%"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="absolute inset-0 w-full h-full border-0 grayscale-[20%]"
                  allowFullScreen
                />
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28 lg:py-40 bg-[#f7f2ea] relative overflow-hidden">
        <div className="absolute inset-0 mesh-cream opacity-60" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <AnimatedHeading
              as="h2"
              text="Ready for the next step?"
              className="font-display text-6xl md:text-7xl lg:text-8xl leading-[0.9] mb-12"
            />
            <FadeUp delay={0.3}>
              <p className="text-xl text-foreground/60 max-w-2xl mb-14 font-serif italic leading-relaxed">
                Applications for the 2026-2027 academic year are open now.
              </p>
            </FadeUp>
            <FadeUp delay={0.4}>
              <div className="flex flex-col sm:flex-row gap-4">
                <MagneticButton href="/register" variant="primary" size="xl">
                  Apply now
                  <ArrowUpRight className="h-4 w-4" />
                </MagneticButton>
                <MagneticButton href="/programs" variant="dark" size="xl">
                  Explore programs
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
