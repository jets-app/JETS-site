import { LinkButton } from "@/components/shared/link-button";
import { PublicNav } from "@/components/public/public-nav";
import { PublicFooter } from "@/components/public/public-footer";
import { Testimonials } from "@/components/public/testimonials";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Briefcase,
  GraduationCap,
  Sparkles,
  Dumbbell,
  ArrowRight,
  Globe,
  Award,
  CheckCircle2,
  Hammer,
  Monitor,
  Building,
  Utensils,
  Music,
  ShieldCheck,
  Calculator,
  Code,
  Stethoscope,
  HeartPulse,
} from "lucide-react";

export const metadata = {
  title: "Programs",
  description:
    "A dual curriculum combining Torah study with real-world vocational training. Explore JETS' programs from Judaic Studies to Professional Tracks, GED, and extracurricular enrichment.",
};

const categories = [
  {
    title: "Judaic Studies",
    tag: "Morning Curriculum",
    icon: BookOpen,
    description:
      "Daily immersion in the core texts and ideas of Jewish life, guided by experienced Rabbis committed to every student's spiritual growth.",
    items: ["Chassidut", "Halacha", "Gemara", "Tanach"],
    highlight:
      "Character development guided by experienced Rabbis. Emphasis on spiritual growth and Jewish identity.",
    accent: "bg-primary text-primary-foreground",
  },
  {
    title: "Professional Tracks",
    tag: "Trade Education",
    icon: Briefcase,
    description:
      "Industry-aligned tracks taught by working professionals. Students build portfolios, earn certifications, and graduate ready to work.",
    items: [
      "Entrepreneurship & Real Estate",
      "Construction",
      "Digital Media",
      "Applied Technology",
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
    items: [
      "GED equivalency program",
      "General education refresher courses",
      "English, Math, Science prep",
    ],
  },
  {
    title: "Year One Foundations",
    tag: "Core Curriculum",
    icon: Sparkles,
    description:
      "Every new student begins here. The first year builds the habits and mindset every JETS graduate carries for life.",
    items: [
      "Core curriculum for all new students",
      "Study skills & time management",
      "Work ethic & professional conduct",
    ],
  },
  {
    title: "Extracurricular",
    tag: "Enrichment & Wellness",
    icon: Dumbbell,
    description:
      "Growth happens outside the classroom too. Our enrichment programs build well-rounded young men of body, mind, and spirit.",
    items: [
      "Culinary Arts",
      "Music Coaching",
      "Martial Arts",
      "Fitness / Gym",
      "Sports",
    ],
  },
];

const trackIcons = [
  { label: "Entrepreneurship & Real Estate", icon: Building },
  { label: "Construction", icon: Hammer },
  { label: "Digital Media", icon: Monitor },
  { label: "Applied Technology", icon: Code },
  { label: "Accounting", icon: Calculator },
  { label: "Business", icon: Briefcase },
  { label: "Web Development", icon: Code },
  { label: "EMT", icon: HeartPulse },
  { label: "Electrical", icon: ShieldCheck },
  { label: "Marketing", icon: Sparkles },
  { label: "Culinary", icon: Utensils },
  { label: "Music", icon: Music },
];

const partners = [
  {
    name: "University of East London",
    location: "London, United Kingdom",
  },
  {
    name: "Torrens University Australia",
    location: "Sydney, Australia",
  },
  {
    name: "Rome-based institution",
    location: "Rome, Italy",
  },
  {
    name: "Additional International Partners",
    location: "Worldwide",
  },
];

export default function ProgramsPage() {
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
              <GraduationCap className="h-3.5 w-3.5 text-amber-300" />
              <span className="text-xs font-medium tracking-wide">
                Academic Year 2026-2027
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
              Programs &amp; Curriculum
            </h1>
            <p className="text-lg lg:text-xl text-white/80 leading-relaxed max-w-2xl">
              A dual curriculum combining Torah study with real-world
              vocational training &mdash; giving every graduate both depth
              of character and marketable, modern skills.
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-foreground/20 to-transparent" />
      </section>

      {/* Main Categories */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <Badge variant="outline" className="mb-4">
              Program Categories
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">
              Five distinct tracks. One cohesive education.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {categories.map((cat, i) => {
              const isFeatured = i === 0 || i === 1;
              return (
                <div
                  key={cat.title}
                  className={`group relative rounded-3xl border p-8 lg:p-10 transition-all duration-500 ${
                    i === 0
                      ? "md:col-span-2 bg-gradient-to-br from-primary to-primary/90 text-white border-transparent overflow-hidden"
                      : "bg-card border-border/50 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/[0.03]"
                  } ${isFeatured && i !== 0 ? "md:col-span-2" : ""}`}
                >
                  {i === 0 && (
                    <>
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.08),transparent)]" />
                      <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
                    </>
                  )}
                  <div className="relative">
                    <div className="flex items-start justify-between mb-6">
                      <div
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                          i === 0
                            ? "bg-white/15"
                            : "bg-primary/5 group-hover:bg-primary/10 transition-colors duration-300"
                        }`}
                      >
                        <cat.icon
                          className={`h-7 w-7 ${
                            i === 0 ? "text-white" : "text-primary"
                          }`}
                        />
                      </div>
                      <span
                        className={`text-[10px] uppercase tracking-widest font-medium ${
                          i === 0 ? "text-white/70" : "text-muted-foreground"
                        }`}
                      >
                        {cat.tag}
                      </span>
                    </div>
                    <h3 className="text-2xl lg:text-3xl font-bold mb-3 tracking-tight">
                      {cat.title}
                    </h3>
                    <p
                      className={`text-base leading-relaxed mb-6 ${
                        i === 0 ? "text-white/80" : "text-muted-foreground"
                      }`}
                    >
                      {cat.description}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {cat.items.map((item) => (
                        <span
                          key={item}
                          className={`text-xs px-3 py-1.5 rounded-lg font-medium ${
                            i === 0
                              ? "bg-white/15 text-white"
                              : "bg-muted text-foreground/80"
                          }`}
                        >
                          {item}
                        </span>
                      ))}
                    </div>

                    {cat.highlight && (
                      <div
                        className={`mt-6 pt-6 border-t text-sm leading-relaxed ${
                          i === 0
                            ? "border-white/15 text-white/70"
                            : "border-border/50 text-muted-foreground"
                        }`}
                      >
                        {cat.highlight}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Professional Tracks Icon Grid */}
      <section className="py-20 lg:py-28 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <Badge variant="outline" className="mb-4">
              Industries
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight max-w-2xl">
              Skills that open doors across today&apos;s top industries.
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {trackIcons.map((t) => (
              <div
                key={t.label}
                className="group bg-card border border-border/50 rounded-xl p-5 hover:border-primary/20 hover:shadow-md transition-all duration-300 flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors duration-300 shrink-0">
                  <t.icon className="h-5 w-5 text-primary" />
                </div>
                <span className="text-sm font-medium">{t.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Global Degree Partnerships */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-5">
              <Badge variant="outline" className="mb-4">
                Global Partnerships
              </Badge>
              <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-6">
                Degree pathways that reach
                <span className="block text-primary">around the world.</span>
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                JETS students can access degree programs through a growing
                network of international university partners, opening
                pathways that extend from Los Angeles to London, Sydney,
                and beyond.
              </p>
            </div>
            <div className="lg:col-span-7">
              <div className="grid sm:grid-cols-2 gap-4">
                {partners.map((p) => (
                  <div
                    key={p.name}
                    className="group bg-card border border-border/50 rounded-2xl p-6 hover:border-primary/20 hover:shadow-md transition-all duration-300"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors duration-300">
                      <Globe className="h-6 w-6 text-primary" />
                    </div>
                    <div className="font-semibold text-base mb-1">
                      {p.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {p.location}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trade Certificates */}
      <section className="py-20 lg:py-28 bg-muted/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative bg-card border border-border/50 rounded-3xl p-10 lg:p-16 overflow-hidden">
            <div className="absolute -top-10 -right-10 w-60 h-60 bg-primary/5 rounded-full blur-3xl" />
            <div className="relative flex flex-col md:flex-row gap-10 items-start">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                <Award className="h-8 w-8 text-primary" />
              </div>
              <div>
                <Badge variant="outline" className="mb-4">
                  Industry-Recognized
                </Badge>
                <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-5">
                  Trade Certificates
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                  Partnerships with accredited colleges and occupational
                  training centers mean JETS students earn industry-recognized
                  certificates alongside their Judaic studies &mdash; real
                  credentials from trusted institutions.
                </p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    "Accredited partner institutions",
                    "Occupational training centers",
                    "Nationally-recognized certificates",
                    "Employer-trusted credentials",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Testimonials
        heading="Alumni in the field"
        subheading="The proof of our curriculum is in the careers our graduates build."
      />

      {/* CTA */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative bg-gradient-to-br from-[#8a0014] via-primary to-[#7a0012] rounded-3xl p-10 lg:p-16 text-primary-foreground overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.1),transparent)]" />
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              <div>
                <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-3">
                  Find your track.
                </h2>
                <p className="text-white/70 text-lg max-w-lg">
                  Talk with our admissions team about the program that fits
                  your strengths and ambitions.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <LinkButton
                  size="lg"
                  variant="secondary"
                  className="text-primary font-semibold"
                  href="/register"
                >
                  Start Your Application
                  <ArrowRight className="ml-2 h-4 w-4" />
                </LinkButton>
                <LinkButton
                  size="lg"
                  variant="outline"
                  className="border-white/25 text-white hover:bg-white/10 hover:border-white/40"
                  href="/contact"
                >
                  Talk to Admissions
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
