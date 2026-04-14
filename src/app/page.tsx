import Link from "next/link";
import { LinkButton } from "@/components/shared/link-button";
import {
  GraduationCap,
  BookOpen,
  Wrench,
  Users,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Star,
  Shield,
  Heart,
  Target,
  ChevronRight,
  Quote,
  Sparkles,
  Clock,
  Award,
  Building2,
  Cpu,
  Briefcase,
  UtensilsCrossed,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="relative w-9 h-9 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-md shadow-primary/20">
                <span className="text-primary-foreground font-bold text-sm tracking-tight">
                  J
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tight leading-none">
                  JETS
                </span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground leading-none mt-0.5">
                  Torah V&apos;avodah
                </span>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-1">
              {[
                { label: "About", href: "/about" },
                { label: "Programs", href: "/programs" },
                { label: "Faculty", href: "/faculty" },
                { label: "Contact", href: "/contact" },
              ].map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-sm text-muted-foreground hover:text-foreground px-3 py-2 rounded-lg hover:bg-muted/50 transition-all duration-200"
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <LinkButton variant="ghost" size="sm" href="/login">
                Sign In
              </LinkButton>
              <LinkButton
                size="sm"
                href="/register"
                className="shadow-md shadow-primary/20"
              >
                Apply Now
              </LinkButton>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#8a0014] via-primary to-[#7a0012] text-primary-foreground">
        {/* Layered gradient overlays */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_20%_-10%,rgba(255,255,255,0.12),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_80%_at_80%_120%,rgba(255,255,255,0.06),transparent)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent_0%,rgba(255,255,255,0.02)_50%,transparent_100%)]" />

        {/* Subtle geometric decorations */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] opacity-[0.04]">
          <div className="absolute inset-0 border border-white/20 rounded-full translate-x-1/3 -translate-y-1/4" />
          <div className="absolute inset-12 border border-white/15 rounded-full translate-x-1/3 -translate-y-1/4" />
          <div className="absolute inset-24 border border-white/10 rounded-full translate-x-1/3 -translate-y-1/4" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Left content */}
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 mb-8">
                <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                <span className="text-xs font-medium tracking-wide">
                  Now Accepting Applications for 2026-2027
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] xl:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
                Where Torah Meets
                <span className="block mt-1 bg-gradient-to-r from-white via-white/95 to-white/70 bg-clip-text">
                  Real-World Mastery
                </span>
              </h1>

              <p className="text-base lg:text-lg text-white/75 max-w-xl leading-relaxed mb-10">
                JETS empowers young Jewish men ages 17-21 with a unique dual
                curriculum: deep Judaic learning paired with hands-on
                vocational training. Graduate with purpose, skills, and
                the confidence to build an extraordinary life.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <LinkButton
                  size="lg"
                  variant="secondary"
                  className="text-primary font-semibold shadow-xl shadow-black/20 hover:shadow-2xl hover:shadow-black/30 transition-all duration-300 hover:-translate-y-0.5"
                  href="/register"
                >
                  Start Your Application
                  <ArrowRight className="ml-2 h-4 w-4" />
                </LinkButton>
                <LinkButton
                  size="lg"
                  variant="outline"
                  className="border-white/25 text-white hover:bg-white/10 hover:border-white/40 transition-all duration-300"
                  href="/contact"
                >
                  Schedule a Visit
                </LinkButton>
              </div>

              {/* Micro social proof */}
              <div className="mt-12 flex items-center gap-6 pt-8 border-t border-white/10">
                <div className="flex -space-x-2">
                  {[
                    "bg-amber-500",
                    "bg-emerald-500",
                    "bg-blue-500",
                    "bg-violet-500",
                  ].map((color, i) => (
                    <div
                      key={i}
                      className={`w-8 h-8 rounded-full ${color} border-2 border-primary flex items-center justify-center text-[10px] font-bold text-white`}
                    >
                      {["A", "M", "D", "Y"][i]}
                    </div>
                  ))}
                </div>
                <div className="text-sm text-white/60">
                  <span className="text-white font-medium">Join 200+ alumni</span>{" "}
                  who launched careers through JETS
                </div>
              </div>
            </div>

            {/* Right side - Stats cards stacked */}
            <div className="lg:col-span-5 hidden lg:flex flex-col gap-4">
              <div className="bg-white/[0.08] backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:bg-white/[0.12] transition-all duration-500">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Torah Studies</h3>
                    <p className="text-sm text-white/60 leading-relaxed">
                      Gemarah, Chassidus, Halacha, and Mussar with dedicated
                      Rabbeim in an intimate learning environment.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/[0.08] backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:bg-white/[0.12] transition-all duration-500 lg:translate-x-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                    <Wrench className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Trade Training</h3>
                    <p className="text-sm text-white/60 leading-relaxed">
                      11+ vocational tracks from tech to construction,
                      taught by working industry professionals.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/[0.08] backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:bg-white/[0.12] transition-all duration-500">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                    <GraduationCap className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Career Launch</h3>
                    <p className="text-sm text-white/60 leading-relaxed">
                      GED prep, certifications, mentorship, and direct
                      connections to employers who value our graduates.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom fade transition */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-foreground/20 to-transparent" />
      </section>

      {/* Scrolling stats bar */}
      <section className="py-6 bg-muted/30 border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {[
              { value: "9-10", label: "Acre Campus", icon: Building2 },
              { value: "11+", label: "Trade Programs", icon: Briefcase },
              { value: "20+", label: "Years of Excellence", icon: Award },
              { value: "200+", label: "Alumni & Counting", icon: Users },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex items-center gap-3 group"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors duration-300">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-xl font-bold text-foreground leading-none">
                    {stat.value}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {stat.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why JETS Section */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left - Content */}
            <div>
              <Badge variant="outline" className="mb-4">
                Why JETS
              </Badge>
              <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-6">
                Not just a school.
                <span className="block text-primary">A launchpad for life.</span>
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                Most educational paths force a choice: spiritual growth or
                professional skills. JETS refuses that tradeoff. Our students
                grow in Torah and in trade simultaneously, emerging as young men
                of character who can support their families and communities from
                day one.
              </p>

              <div className="space-y-5">
                {[
                  {
                    icon: Shield,
                    title: "Values-First Education",
                    desc: "Every vocational lesson is grounded in Torah ethics. Integrity, honesty, and responsibility are woven into everything we teach.",
                  },
                  {
                    icon: Target,
                    title: "Career-Ready on Graduation",
                    desc: "Our graduates don't just have diplomas — they have certifications, portfolios, and employer connections ready to go.",
                  },
                  {
                    icon: Heart,
                    title: "A Brotherhood for Life",
                    desc: "Small cohorts and dedicated mentorship create bonds that last. Our alumni network is a lifelong support system.",
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="flex gap-4 group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors duration-300 mt-0.5">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">
                        {item.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right - Visual grid */}
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                {/* Large feature card */}
                <div className="col-span-2 bg-gradient-to-br from-primary to-primary/90 rounded-2xl p-8 text-white relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.08),transparent)]" />
                  <div className="relative">
                    <div className="text-5xl font-bold mb-2">Torah V&apos;avodah</div>
                    <p className="text-white/70 text-sm max-w-xs">
                      Torah and Industry — Our founding philosophy that
                      spiritual depth and professional excellence strengthen
                      each other.
                    </p>
                  </div>
                </div>

                {/* Smaller cards */}
                <div className="bg-card rounded-2xl p-6 border border-border/50 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <Clock className="h-8 w-8 text-primary mb-3" />
                  <div className="text-2xl font-bold">2 Years</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Comprehensive program length
                  </p>
                </div>

                <div className="bg-card rounded-2xl p-6 border border-border/50 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <Star className="h-8 w-8 text-primary mb-3" />
                  <div className="text-2xl font-bold">1:8</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Student to teacher ratio
                  </p>
                </div>
              </div>

              {/* Subtle floating decoration */}
              <div className="absolute -z-10 -top-4 -right-4 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />
              <div className="absolute -z-10 -bottom-4 -left-4 w-24 h-24 bg-primary/5 rounded-full blur-xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section className="py-20 lg:py-28 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-16">
            <div>
              <Badge variant="outline" className="mb-4">
                Programs
              </Badge>
              <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">
                A Dual Curriculum for Success
              </h2>
              <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
                Morning Torah study meets afternoon trade training. Two worlds,
                one transformative experience.
              </p>
            </div>
            <LinkButton
              variant="outline"
              href="/programs"
              className="shrink-0 self-start md:self-auto"
            >
              View All Programs
              <ChevronRight className="ml-1 h-4 w-4" />
            </LinkButton>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: BookOpen,
                title: "Judaic Studies",
                tag: "Morning Curriculum",
                description:
                  "Dive deep into Gemarah, Chassidus, Halacha, and personal character development. Our experienced Rabbeim create an intimate learning environment where every student's growth is personal.",
                highlights: ["Gemarah & Talmud", "Chassidus", "Halacha", "Mussar"],
              },
              {
                icon: Cpu,
                title: "Technology & Computing",
                tag: "Trade Track",
                description:
                  "From web development to IT infrastructure. Learn programming, hardware repair, networking, and modern software tools used by today's top companies.",
                highlights: ["Web Development", "IT Support", "Networking", "Software"],
              },
              {
                icon: Wrench,
                title: "Skilled Trades",
                tag: "Trade Track",
                description:
                  "Electrical work, construction, HVAC, and more. Hands-on training in our fully equipped workshops with licensed professionals who've built real careers.",
                highlights: ["Electrical", "Construction", "HVAC", "Plumbing"],
              },
              {
                icon: Briefcase,
                title: "Business & Marketing",
                tag: "Trade Track",
                description:
                  "Entrepreneurship, digital marketing, bookkeeping, and sales. Learn to launch and run a business with practical, real-world projects and mentorship.",
                highlights: ["Entrepreneurship", "Marketing", "Bookkeeping", "Sales"],
              },
              {
                icon: GraduationCap,
                title: "Academic Foundation",
                tag: "Core Curriculum",
                description:
                  "GED preparation, English language skills, math fundamentals, and Hebrew literacy. Tailored to each student's starting point with clear pathways to achievement.",
                highlights: ["GED Prep", "English", "Mathematics", "Hebrew"],
              },
              {
                icon: UtensilsCrossed,
                title: "Life Skills & Wellness",
                tag: "Enrichment",
                description:
                  "Culinary arts, physical fitness, financial literacy, and community service. Building well-rounded individuals prepared for every dimension of adult life.",
                highlights: ["Culinary Arts", "Fitness", "Finance", "Community"],
              },
            ].map((program) => (
              <div
                key={program.title}
                className="group relative bg-card rounded-2xl border border-border/50 p-6 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/[0.03] transition-all duration-500"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors duration-300">
                    <program.icon className="h-6 w-6 text-primary" />
                  </div>
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
                    {program.tag}
                  </span>
                </div>
                <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors duration-300">
                  {program.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  {program.description}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {program.highlights.map((h) => (
                    <span
                      key={h}
                      className="text-[11px] px-2 py-0.5 rounded-md bg-muted text-muted-foreground"
                    >
                      {h}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">
              Testimonials
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">
              Hear From Our Community
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              The people who know JETS best are the ones whose lives it changed.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                quote:
                  "JETS gave me something no other place could: a way to grow in my Yiddishkeit while learning a real trade. I graduated with my faith stronger and a career in IT already lined up.",
                name: "David M.",
                role: "JETS Alumni, Class of 2023",
                initials: "DM",
                color: "bg-blue-500",
              },
              {
                quote:
                  "My son came to JETS unsure of his path. Two years later, he's a confident young man running his own small business and learning Gemarah every morning. This school changed our family's trajectory.",
                name: "Sarah K.",
                role: "Parent",
                initials: "SK",
                color: "bg-emerald-500",
              },
              {
                quote:
                  "The Rabbeim at JETS don't just teach — they mentor. They see each student as a whole person. Combined with the hands-on trade training, it's an approach I haven't seen anywhere else.",
                name: "Rabbi Yosef L.",
                role: "Community Leader",
                initials: "YL",
                color: "bg-amber-500",
              },
            ].map((testimonial) => (
              <div
                key={testimonial.name}
                className="relative bg-card rounded-2xl border border-border/50 p-8 hover:border-primary/15 hover:shadow-lg transition-all duration-500 flex flex-col"
              >
                <Quote className="h-8 w-8 text-primary/15 mb-4" />
                <p className="text-sm text-foreground/80 leading-relaxed flex-1 italic">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3 mt-6 pt-6 border-t border-border/50">
                  <div
                    className={`w-10 h-10 rounded-full ${testimonial.color} flex items-center justify-center text-white text-xs font-bold`}
                  >
                    {testimonial.initials}
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{testimonial.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative bg-gradient-to-br from-[#8a0014] via-primary to-[#7a0012] rounded-3xl p-10 lg:p-20 text-primary-foreground overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.1),transparent)]" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/[0.03] rounded-full -translate-x-1/2 translate-y-1/2" />
            <div className="absolute top-0 right-0 w-60 h-60 bg-white/[0.03] rounded-full translate-x-1/3 -translate-y-1/3" />

            <div className="relative z-10 grid lg:grid-cols-2 gap-10 items-center">
              <div>
                <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight leading-tight mb-4">
                  Your future starts
                  <br />
                  with one step.
                </h2>
                <p className="text-base lg:text-lg text-white/70 max-w-lg leading-relaxed">
                  Applications are open for the 2026-2027 academic year.
                  Whether you know exactly what trade you want to pursue
                  or you&apos;re still figuring it out, JETS meets you where
                  you are.
                </p>
              </div>

              <div className="flex flex-col gap-4 lg:items-end">
                <LinkButton
                  size="lg"
                  variant="secondary"
                  className="text-primary font-semibold shadow-xl shadow-black/20 hover:shadow-2xl hover:shadow-black/30 transition-all duration-300 hover:-translate-y-0.5 w-full sm:w-auto"
                  href="/register"
                >
                  Start Your Application
                  <ArrowRight className="ml-2 h-4 w-4" />
                </LinkButton>
                <LinkButton
                  size="lg"
                  variant="outline"
                  className="border-white/25 text-white hover:bg-white/10 hover:border-white/40 transition-all duration-300 w-full sm:w-auto"
                  href="/contact"
                >
                  Talk to Admissions
                  <Phone className="ml-2 h-4 w-4" />
                </LinkButton>
                <p className="text-xs text-white/40 lg:text-right">
                  No commitment required. We&apos;ll guide you through every step.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background/70 pt-16 pb-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-background/10">
            {/* Brand column */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">
                    J
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-base font-bold text-background leading-none">
                    JETS School
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.15em] text-background/40 leading-none mt-0.5">
                    Est. 2004
                  </span>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-background/50 max-w-xs">
                Jewish Educational Trade School. Empowering young men through
                the timeless union of Torah learning and vocational mastery.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold text-background text-sm uppercase tracking-wider mb-5">
                Quick Links
              </h4>
              <div className="space-y-3 text-sm">
                {[
                  { label: "About Us", href: "/about" },
                  { label: "Programs", href: "/programs" },
                  { label: "Faculty & Staff", href: "/faculty" },
                  { label: "Apply Now", href: "/register" },
                  { label: "Student Portal", href: "/login" },
                ].map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="block text-background/50 hover:text-background transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Programs */}
            <div>
              <h4 className="font-semibold text-background text-sm uppercase tracking-wider mb-5">
                Programs
              </h4>
              <div className="space-y-3 text-sm">
                {[
                  "Judaic Studies",
                  "Technology & IT",
                  "Skilled Trades",
                  "Business & Marketing",
                  "GED Preparation",
                ].map((program) => (
                  <span
                    key={program}
                    className="block text-background/50"
                  >
                    {program}
                  </span>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold text-background text-sm uppercase tracking-wider mb-5">
                Contact Us
              </h4>
              <div className="space-y-4 text-sm">
                <a
                  href="https://maps.google.com/?q=Granada+Hills+Los+Angeles+CA"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 text-background/50 hover:text-background transition-colors duration-200"
                >
                  <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>
                    Granada Hills
                    <br />
                    Los Angeles, CA
                  </span>
                </a>
                <a
                  href="tel:+18188313000"
                  className="flex items-center gap-3 text-background/50 hover:text-background transition-colors duration-200"
                >
                  <Phone className="h-4 w-4 shrink-0" />
                  <span>(818) 831-3000</span>
                </a>
                <a
                  href="mailto:info@jetsschool.org"
                  className="flex items-center gap-3 text-background/50 hover:text-background transition-colors duration-200"
                >
                  <Mail className="h-4 w-4 shrink-0" />
                  <span>info@jetsschool.org</span>
                </a>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8 text-xs text-background/30">
            <span>
              &copy; {new Date().getFullYear()} JETS Synagogue (DBA Jewish
              Educational Trade School). All rights reserved.
            </span>
            <div className="flex items-center gap-6">
              <Link
                href="/privacy"
                className="hover:text-background/60 transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="hover:text-background/60 transition-colors"
              >
                Terms of Use
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
