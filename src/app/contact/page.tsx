import { LinkButton } from "@/components/shared/link-button";
import { PublicNav } from "@/components/public/public-nav";
import { PublicFooter } from "@/components/public/public-footer";
import { ContactForm } from "@/components/public/contact-form";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  CalendarClock,
  ArrowRight,
  MessageCircle,
  Sparkles,
} from "lucide-react";

const CALENDLY_URL =
  process.env.NEXT_PUBLIC_CALENDLY_URL || "https://calendly.com/jets-school";

const CAMPUS_ADDRESS = "16601 Rinaldi Street, Granada Hills, CA 91344";
const MAP_EMBED = `https://www.google.com/maps?q=${encodeURIComponent(
  CAMPUS_ADDRESS
)}&output=embed`;

export const metadata = {
  title: "Contact",
  description:
    "Get in touch with JETS School. Visit our Granada Hills campus, call admissions, or schedule a 1-on-1 consultation.",
};

const infoCards = [
  {
    icon: MapPin,
    label: "Address",
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
    secondary: "We reply within 1 business day",
    href: "mailto:info@jetsschool.org",
  },
  {
    icon: Clock,
    label: "Hours",
    primary: "Mon – Fri, 9am – 5pm PT",
    secondary: "Closed Shabbat & Yom Tov",
  },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicNav />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#8a0014] via-primary to-[#7a0012] text-primary-foreground">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_20%_-10%,rgba(255,255,255,0.12),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_80%_at_80%_120%,rgba(255,255,255,0.06),transparent)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 mb-8">
              <MessageCircle className="h-3.5 w-3.5 text-amber-300" />
              <span className="text-xs font-medium tracking-wide">
                We&apos;re here to help
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
              Get in Touch
            </h1>
            <p className="text-lg lg:text-xl text-white/80 leading-relaxed max-w-2xl">
              We&apos;d love to hear from you. Whether you&apos;re exploring
              admissions, scheduling a visit, or simply curious about JETS,
              our team is ready to answer every question.
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-foreground/20 to-transparent" />
      </section>

      {/* Info cards */}
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {infoCards.map((c) => {
              const content = (
                <div className="group bg-card border border-border/50 rounded-2xl p-6 h-full hover:border-primary/20 hover:shadow-lg hover:shadow-primary/[0.04] transition-all duration-300">
                  <div className="w-11 h-11 rounded-xl bg-primary/5 flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors duration-300">
                    <c.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-semibold mb-2">
                    {c.label}
                  </div>
                  <div className="font-semibold text-base leading-snug">
                    {c.primary}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {c.secondary}
                  </div>
                </div>
              );
              return c.href ? (
                <a
                  key={c.label}
                  href={c.href}
                  target={c.href.startsWith("http") ? "_blank" : undefined}
                  rel={c.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="block"
                >
                  {content}
                </a>
              ) : (
                <div key={c.label}>{content}</div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact Form + Consultation */}
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-10">
            <div className="lg:col-span-7">
              <Badge variant="outline" className="mb-4">
                Send a Message
              </Badge>
              <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4">
                Drop us a note.
              </h2>
              <p className="text-muted-foreground mb-8 max-w-xl leading-relaxed">
                Fill out the form and our team will get back to you within one
                business day. For urgent matters, call{" "}
                <a
                  href="tel:+18188313000"
                  className="text-primary font-medium hover:underline"
                >
                  (818) 831-3000
                </a>
                .
              </p>
              <ContactForm />
            </div>

            <div className="lg:col-span-5">
              <Badge variant="outline" className="mb-4">
                Book a Consultation
              </Badge>
              <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4">
                One-on-one with admissions.
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Schedule a personal call with our admissions team. We&apos;ll
                walk you through programs, tuition, visits, and anything else
                you want to know.
              </p>

              <div className="relative bg-gradient-to-br from-primary to-primary/90 text-white rounded-3xl p-8 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.1),transparent)]" />
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-2xl" />
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center mb-5">
                    <CalendarClock className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">
                    Schedule a 1-on-1 call
                  </h3>
                  <p className="text-sm text-white/75 leading-relaxed mb-6">
                    Pick a time that works for you. 30 minutes. No commitment.
                  </p>
                  <LinkButton
                    size="lg"
                    variant="secondary"
                    className="text-primary font-semibold w-full"
                    href={CALENDLY_URL}
                  >
                    Open Scheduler
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </LinkButton>
                  <div className="flex items-center gap-2 mt-5 text-xs text-white/60">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Average response: under 1 hour</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 bg-muted/40 border border-border/50 rounded-2xl p-6">
                <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3">
                  Prefer to visit?
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  We love in-person visits. Tour the campus, sit in on a
                  class, and meet our students.
                </p>
                <LinkButton
                  variant="outline"
                  size="sm"
                  href="/contact"
                  className="w-full"
                >
                  Request a Campus Tour
                </LinkButton>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map */}
      <section className="py-16 lg:py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-4">
              <Badge variant="outline" className="mb-4">
                Find Us
              </Badge>
              <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4">
                Visit our campus.
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Our 9-10 acre campus in Granada Hills welcomes prospective
                students and families year-round. Schedule ahead so we can
                give you the full tour.
              </p>
              <div className="space-y-3 text-sm">
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(
                    CAMPUS_ADDRESS
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 group"
                >
                  <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span className="group-hover:text-primary transition-colors">
                    {CAMPUS_ADDRESS}
                  </span>
                </a>
                <a
                  href="tel:+18188313000"
                  className="flex items-center gap-3 group"
                >
                  <Phone className="h-4 w-4 text-primary shrink-0" />
                  <span className="group-hover:text-primary transition-colors">
                    (818) 831-3000
                  </span>
                </a>
              </div>
            </div>
            <div className="lg:col-span-8">
              <div className="relative rounded-3xl overflow-hidden border border-border/50 shadow-lg aspect-[16/10] bg-muted">
                <iframe
                  title="JETS School Campus Map"
                  src={MAP_EMBED}
                  width="100%"
                  height="100%"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="absolute inset-0 w-full h-full border-0"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Apply CTA */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative bg-gradient-to-br from-[#8a0014] via-primary to-[#7a0012] rounded-3xl p-10 lg:p-16 text-primary-foreground overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.1),transparent)]" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/[0.03] rounded-full -translate-x-1/2 translate-y-1/2" />
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              <div>
                <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-3">
                  Ready to take the next step?
                </h2>
                <p className="text-white/70 text-lg max-w-lg">
                  Applications for the 2026-2027 academic year are open now.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <LinkButton
                  size="lg"
                  variant="secondary"
                  className="text-primary font-semibold"
                  href="/register"
                >
                  Apply Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </LinkButton>
                <LinkButton
                  size="lg"
                  variant="outline"
                  className="border-white/25 text-white hover:bg-white/10 hover:border-white/40"
                  href="/programs"
                >
                  Explore Programs
                </LinkButton>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
