import { LinkButton } from "@/components/shared/link-button";
import { PublicNav } from "@/components/public/public-nav";
import { PublicFooter } from "@/components/public/public-footer";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  BookOpen,
  ShieldCheck,
  GraduationCap,
  Briefcase,
  ClipboardList,
  Building2,
  Heart,
  Scale,
  Award,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export const metadata = {
  title: "Faculty",
  description:
    "Meet the leadership and faculty of JETS — dedicated educators and mentors shaping young Jewish men into leaders of character and capability.",
};

export default function FacultyPage() {
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
              <Users className="h-3.5 w-3.5 text-amber-300" />
              <span className="text-xs font-medium tracking-wide">
                Leadership &amp; Faculty
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
              Meet Our Faculty
            </h1>
            <p className="text-lg lg:text-xl text-white/80 leading-relaxed max-w-2xl">
              Dedicated educators and mentors shaping young Jewish men into
              leaders of character, conviction, and capability.
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-foreground/20 to-transparent" />
      </section>

      {/* Founder Feature */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <Badge variant="outline" className="mb-4">
              Founding Leadership
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">
              The vision that built JETS.
            </h2>
          </div>

          <div className="relative bg-gradient-to-br from-primary to-primary/90 rounded-3xl p-10 lg:p-16 text-white overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.1),transparent)]" />
            <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
            <div className="relative grid md:grid-cols-3 gap-10 items-center">
              <div className="md:col-span-1 flex flex-col items-center md:items-start">
                <div className="w-32 h-32 rounded-3xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center text-4xl font-bold shadow-xl mb-5">
                  MS
                </div>
                <div className="text-xs uppercase tracking-[0.25em] text-white/60 mb-2">
                  Founding Director
                </div>
                <div className="text-2xl font-bold tracking-tight">
                  Rabbi Mayer Schmukler
                </div>
              </div>
              <div className="md:col-span-2 md:border-l md:border-white/15 md:pl-10">
                <p className="text-base lg:text-lg text-white/85 leading-relaxed mb-5">
                  Rabbi Schmukler founded JETS with a singular vision:
                  integrating Torah study with practical career preparation
                  to empower young Jewish men to build lives of purpose,
                  independence, and meaning.
                </p>
                <p className="text-base text-white/75 leading-relaxed">
                  An experienced educator and community leader, he continues
                  to guide JETS&apos; mission &mdash; ensuring every student
                  receives both moral grounding and the tools to thrive in the
                  modern workforce.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Executive Leadership */}
      <section className="py-20 lg:py-28 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">
              Executive Leadership
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">
              The team running JETS every day.
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Two seasoned leaders coordinating Judaic formation, academic
              excellence, and institutional integrity.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Rabbi Sufrin */}
            <div className="group relative bg-card border border-border/50 rounded-3xl p-8 lg:p-10 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/[0.04] transition-all duration-500 flex flex-col">
              <div className="flex items-start gap-5 mb-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground flex items-center justify-center text-2xl font-bold shadow-lg shadow-primary/20 shrink-0">
                  RS
                </div>
                <div className="min-w-0">
                  <div className="text-xs uppercase tracking-[0.2em] text-primary font-semibold mb-1.5">
                    COO &middot; Provost of Judaic Studies
                  </div>
                  <h3 className="text-2xl font-bold tracking-tight">
                    Rabbi Y. Boruch Sufrin
                  </h3>
                  <div className="text-xs text-muted-foreground mt-1.5">
                    Reports to: Chief Executive Officer
                  </div>
                </div>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                Ordained rabbi and experienced educational administrator who
                has served as Head of School and synagogue rabbi. Rabbi Sufrin
                oversees the Judaic heart of JETS and coordinates day-to-day
                institutional operations.
              </p>

              <div className="mt-auto pt-6 border-t border-border/50">
                <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-4">
                  Responsibilities
                </div>
                <div className="grid sm:grid-cols-2 gap-2">
                  {[
                    { icon: BookOpen, label: "Judaic curriculum & instruction" },
                    { icon: ClipboardList, label: "Admissions & academic records" },
                    { icon: Building2, label: "Campus operations & safety" },
                    { icon: Heart, label: "Student services & culture" },
                    { icon: Scale, label: "Regulatory recordkeeping" },
                    { icon: Sparkles, label: "Religious & pastoral guidance" },
                  ].map((r) => (
                    <div
                      key={r.label}
                      className="flex items-start gap-2.5 text-xs text-foreground/80"
                    >
                      <div className="w-6 h-6 rounded-md bg-primary/5 flex items-center justify-center shrink-0 mt-px">
                        <r.icon className="h-3 w-3 text-primary" />
                      </div>
                      <span className="leading-snug pt-0.5">{r.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Matthew Hintze */}
            <div className="group relative bg-card border border-border/50 rounded-3xl p-8 lg:p-10 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/[0.04] transition-all duration-500 flex flex-col">
              <div className="flex items-start gap-5 mb-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground flex items-center justify-center text-2xl font-bold shadow-lg shadow-primary/20 shrink-0">
                  MH
                </div>
                <div className="min-w-0">
                  <div className="text-xs uppercase tracking-[0.2em] text-primary font-semibold mb-1.5">
                    CAO &middot; Provost of Professional Studies
                  </div>
                  <h3 className="text-2xl font-bold tracking-tight">
                    Matthew B. Hintze
                  </h3>
                  <div className="text-xs text-muted-foreground mt-1.5">
                    Compliance &amp; Regulatory Liaison &middot; Reports to CEO
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3">
                  <GraduationCap className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <span className="font-semibold">Education: </span>
                    <span className="text-muted-foreground">
                      MBA, University of Florida. Doctoral coursework in Finance.
                    </span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Briefcase className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <span className="font-semibold">Background: </span>
                    <span className="text-muted-foreground">
                      Former Adjunct Faculty, Department of Finance, Insurance,
                      and Real Estate, University of Florida.
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-6 border-t border-border/50">
                <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-4">
                  Responsibilities
                </div>
                <div className="grid sm:grid-cols-2 gap-2">
                  {[
                    { icon: Award, label: "Professional Studies oversight" },
                    { icon: BookOpen, label: "Curriculum & instructional quality" },
                    { icon: Users, label: "Faculty supervision" },
                    { icon: ClipboardList, label: "Academic policies & catalogs" },
                    { icon: Scale, label: "Regulatory coordination" },
                    { icon: ShieldCheck, label: "Compliance oversight" },
                  ].map((r) => (
                    <div
                      key={r.label}
                      className="flex items-start gap-2.5 text-xs text-foreground/80"
                    >
                      <div className="w-6 h-6 rounded-md bg-primary/5 flex items-center justify-center shrink-0 mt-px">
                        <r.icon className="h-3 w-3 text-primary" />
                      </div>
                      <span className="leading-snug pt-0.5">{r.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Faculty philosophy strip */}
      <section className="py-20 lg:py-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="outline" className="mb-4">
            Our Educators
          </Badge>
          <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-6">
            Mentors, not just instructors.
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            Our Rabbeim, industry professionals, and academic faculty share one
            commitment: seeing each student as a whole person. Small cohorts
            and intentional relationships mean every young man gets the
            guidance he needs to grow &mdash; spiritually, academically, and
            professionally.
          </p>
          <div className="grid sm:grid-cols-3 gap-6 mt-12">
            {[
              {
                icon: BookOpen,
                title: "Judaic Rabbeim",
                desc: "Leading daily Gemara, Halacha, Chassidut, and Tanach with warmth and depth.",
              },
              {
                icon: Briefcase,
                title: "Industry Professionals",
                desc: "Working experts teaching current tools, workflows, and real-world standards.",
              },
              {
                icon: GraduationCap,
                title: "Academic Faculty",
                desc: "Credentialed instructors leading GED prep, English, math, and science.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-card border border-border/50 rounded-2xl p-6 text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center mb-4">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-28 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative bg-gradient-to-br from-[#8a0014] via-primary to-[#7a0012] rounded-3xl p-10 lg:p-16 text-primary-foreground overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.1),transparent)]" />
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              <div>
                <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-3">
                  Come meet the team.
                </h2>
                <p className="text-white/70 text-lg max-w-lg">
                  Schedule a visit to the campus and meet the educators who
                  will shape your JETS experience.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <LinkButton
                  size="lg"
                  variant="secondary"
                  className="text-primary font-semibold"
                  href="/contact"
                >
                  Schedule a Visit
                  <ArrowRight className="ml-2 h-4 w-4" />
                </LinkButton>
                <LinkButton
                  size="lg"
                  variant="outline"
                  className="border-white/25 text-white hover:bg-white/10 hover:border-white/40"
                  href="/register"
                >
                  Apply Now
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
