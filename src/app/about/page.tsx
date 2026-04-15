import { LinkButton } from "@/components/shared/link-button";
import { PublicNav } from "@/components/public/public-nav";
import { PublicFooter } from "@/components/public/public-footer";
import { Testimonials } from "@/components/public/testimonials";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Flame,
  User,
  Hammer,
  Star,
  Quote,
  Sparkles,
  ArrowRight,
  GraduationCap,
  BookMarked,
  Users,
  Building2,
  MapPin,
} from "lucide-react";

export const metadata = {
  title: "About",
  description:
    "JETS is an award-winning technical college and high school giving young Jewish men the tools to lead productive and fulfilling lives through Torah, vocation, and character.",
};

const values = [
  {
    title: "Torah",
    subtitle: "Love of Learning",
    description:
      "A lifelong passion for study, wisdom, and spiritual growth — the foundation of every JETS student.",
    icon: BookOpen,
  },
  {
    title: "Shekeidah",
    subtitle: "Dedication & Persistence",
    description:
      "Diligence in learning and labor. The discipline to show up, grow, and finish what we start.",
    icon: Flame,
  },
  {
    title: "Yichudiyut",
    subtitle: "Individuality & Potential",
    description:
      "Every student is unique. We meet each young man where he is and guide him toward his greatest self.",
    icon: User,
  },
  {
    title: "Chiddush VeYetzirah",
    subtitle: "Skills & Innovation",
    description:
      "Creative problem-solving, practical craftsmanship, and the courage to build something new.",
    icon: Hammer,
  },
  {
    title: "Chaim Amitiyim",
    subtitle: "Lifelong Jewish Identity",
    description:
      "A grounded, authentic Jewish life — in family, community, and every corner of the workplace.",
    icon: Star,
  },
];

const stats = [
  { value: "812", label: "Graduates", icon: GraduationCap },
  { value: "57", label: "Courses", icon: BookMarked },
  { value: "16+", label: "Years", icon: Users },
  { value: "9-10", label: "Acre Campus", icon: Building2 },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicNav />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#8a0014] via-primary to-[#7a0012] text-primary-foreground">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_20%_-10%,rgba(255,255,255,0.12),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_80%_at_80%_120%,rgba(255,255,255,0.06),transparent)]" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] opacity-[0.04]">
          <div className="absolute inset-0 border border-white/20 rounded-full translate-x-1/3 -translate-y-1/4" />
          <div className="absolute inset-12 border border-white/15 rounded-full translate-x-1/3 -translate-y-1/4" />
          <div className="absolute inset-24 border border-white/10 rounded-full translate-x-1/3 -translate-y-1/4" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 mb-8">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              <span className="text-xs font-medium tracking-wide">
                Jewish Educational Trade School
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
              About JETS
            </h1>
            <p className="text-xl text-white/80 mb-4">
              Jewish Educational Trade School
            </p>
            <p className="text-sm uppercase tracking-[0.3em] text-white/60">
              Torah V&apos;avodah &mdash; Torah and Industry
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-foreground/20 to-transparent" />
      </section>

      {/* Mission + Philosophy Quote */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-7">
              <Badge variant="outline" className="mb-4">
                Our Mission
              </Badge>
              <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-6">
                Tools to lead{" "}
                <span className="text-primary">productive, fulfilling lives.</span>
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                JETS is an award-winning technical college and high school that
                gives young Jewish men the tools with which to lead productive
                and fulfilling lives through a well-balanced program of Judaic
                studies, vocational training, and recreational activities.
              </p>
            </div>

            <div className="lg:col-span-5">
              <div className="relative bg-gradient-to-br from-primary to-primary/90 rounded-3xl p-10 text-white overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.08),transparent)]" />
                <div className="relative">
                  <Quote className="h-10 w-10 text-white/30 mb-6" />
                  <blockquote className="text-2xl lg:text-3xl font-bold leading-tight mb-4 tracking-tight">
                    Teach a man to fish and you have fed him for a lifetime.
                  </blockquote>
                  <div className="text-sm text-white/60 uppercase tracking-[0.2em]">
                    Core Philosophy
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="py-10 bg-muted/30 border-y border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {stats.map((s) => (
              <div key={s.label} className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors duration-300">
                  <s.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground leading-none">
                    {s.value}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">
                    {s.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Founder */}
      <section className="py-20 lg:py-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative bg-card border border-border/50 rounded-3xl p-10 lg:p-16 overflow-hidden">
            <div className="absolute -top-10 -right-10 w-60 h-60 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-primary/5 rounded-full blur-3xl" />
            <div className="relative grid md:grid-cols-3 gap-10 items-center">
              <div className="md:col-span-1 flex flex-col items-center text-center">
                <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground flex items-center justify-center text-3xl font-bold shadow-lg shadow-primary/20 mb-5">
                  MS
                </div>
                <div className="font-bold text-lg">Rabbi Mayer Schmukler</div>
                <div className="text-sm text-muted-foreground mt-1">
                  Founding Director
                </div>
              </div>
              <div className="md:col-span-2">
                <Quote className="h-8 w-8 text-primary/30 mb-4" />
                <blockquote className="text-xl lg:text-2xl font-medium leading-snug mb-5 tracking-tight">
                  &ldquo;Educate a child according to his way to ensure it
                  endures though old age.&rdquo;
                </blockquote>
                <div className="text-sm text-muted-foreground mb-6">
                  &mdash; Proverbs 22:6
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Rabbi Schmukler founded JETS with a clear conviction:
                  teaching ethical values must go hand-in-hand with real
                  job-training tools. Every young man deserves both a
                  moral compass and the practical skills to build his future.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 lg:py-28 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">
              Core Values
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">
              Five Pillars of the JETS Experience
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              The values that shape our curriculum, our culture, and every
              young man who walks through our doors.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((v, i) => (
              <div
                key={v.title}
                className={`group relative bg-card rounded-2xl border border-border/50 p-8 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/[0.03] transition-all duration-500 ${
                  i === 4 ? "md:col-span-2 lg:col-span-1" : ""
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center mb-5 group-hover:bg-primary/10 transition-colors duration-300">
                  <v.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="text-xs uppercase tracking-[0.2em] text-primary font-semibold mb-2">
                  {v.subtitle}
                </div>
                <h3 className="text-2xl font-bold mb-3 tracking-tight">
                  {v.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {v.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Campus */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="outline" className="mb-4">
                Our Campus
              </Badge>
              <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-6">
                A 9-10 acre home in
                <span className="block text-primary">Granada Hills, LA.</span>
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                Our Los Angeles campus is undergoing an ambitious expansion
                project &mdash; The Fisch Trade School &mdash; featuring
                state-of-the-art classrooms, workshops, and study laboratories
                spread across four purpose-built structures.
              </p>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                <span>16601 Rinaldi Street, Granada Hills, CA 91344</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-primary to-primary/90 text-white rounded-2xl p-6 aspect-square flex flex-col justify-between relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.1),transparent)]" />
                <Building2 className="h-8 w-8 text-white/80 relative" />
                <div className="relative">
                  <div className="text-4xl font-bold">4</div>
                  <div className="text-xs text-white/70 mt-1">Structures</div>
                </div>
              </div>
              <div className="bg-card border border-border/50 rounded-2xl p-6 aspect-square flex flex-col justify-between">
                <Hammer className="h-8 w-8 text-primary" />
                <div>
                  <div className="text-4xl font-bold">SoA</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    State-of-the-art workshops
                  </div>
                </div>
              </div>
              <div className="bg-card border border-border/50 rounded-2xl p-6 aspect-square flex flex-col justify-between">
                <BookMarked className="h-8 w-8 text-primary" />
                <div>
                  <div className="text-4xl font-bold">Labs</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Study laboratories
                  </div>
                </div>
              </div>
              <div className="bg-muted/40 border border-border/50 rounded-2xl p-6 aspect-square flex flex-col justify-between">
                <Sparkles className="h-8 w-8 text-primary" />
                <div>
                  <div className="text-sm font-bold uppercase tracking-wider">
                    Fisch Trade School
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Expansion in progress
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Approach */}
      <section className="py-20 lg:py-28 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="outline" className="mb-4">
            Our Approach
          </Badge>
          <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-6">
            We celebrate individuality.
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            JETS creates supportive environments where students discover their
            strengths, set meaningful goals, and pursue the aspirations that
            make each of them unique. No two paths are the same &mdash; and
            that&apos;s the point.
          </p>
        </div>
      </section>

      <Testimonials
        heading="Lives shaped by JETS"
        subheading="Our alumni carry the JETS values into industries across the country."
      />

      {/* CTA */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative bg-gradient-to-br from-[#8a0014] via-primary to-[#7a0012] rounded-3xl p-10 lg:p-16 text-primary-foreground overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.1),transparent)]" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-3">
                  Ready to learn more?
                </h2>
                <p className="text-white/70 max-w-lg">
                  Explore our programs, meet our faculty, or start your
                  application today.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 shrink-0">
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
                  href="/contact"
                >
                  Contact Us
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
