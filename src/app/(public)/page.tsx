import Image from "next/image";
import Link from "next/link";
import { SiteNav } from "@/components/site/site-nav";
import { SiteFooter } from "@/components/site/site-footer";
import { VideoHero } from "@/components/site/video-hero";
import { StatsBand } from "@/components/site/stats-band";

const programs = [
  {
    title: "Judaic Studies",
    description:
      "Gemara, Chassidut, Halacha, and Tanach. Small groups, experienced Rabbeim, real depth.",
    icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
  },
  {
    title: "Applied Technology",
    description:
      "Web development, digital media, and computer skills. Build things that actually work.",
    icon: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  },
  {
    title: "Skilled Trades",
    description:
      "Construction, electrical, and EMT certification. Hands-on, real-world skills that pay.",
    icon: "M11.42 15.17l-5.13-5.12a1.5 1.5 0 010-2.12l.88-.88a1.5 1.5 0 012.12 0l.88.88a1.5 1.5 0 002.12 0l.88-.88a1.5 1.5 0 012.12 0l.88.88a1.5 1.5 0 010 2.12l-5.13 5.12a.75.75 0 01-1.06 0zM3 21h18",
  },
  {
    title: "Business & Enterprise",
    description:
      "Entrepreneurship, accounting, and marketing. Learn how to build and run a real business.",
    icon: "M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z",
  },
  {
    title: "Academic Foundations",
    description:
      "High school diploma and GED prep. English, math, and sciences to build on.",
    icon: "M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5",
  },
  {
    title: "The Wider Life",
    description:
      "Culinary arts, music, martial arts, and athletics. Because life is more than a career.",
    icon: "M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.34A1.117 1.117 0 0118.382 1.3l4.59 1.31A1.117 1.117 0 0124 3.726V6M9 9l10.5-3",
  },
];

const testimonials = [
  {
    name: "Koby Lerner",
    role: "Funding Specialist",
    year: "Class of 2014",
    quote:
      "JETS gave me partnerships and a network of people to learn from and work with for mutual success.",
  },
  {
    name: "Mendel Rubashkin",
    role: "Mortgage Banker",
    year: "Class of 2016",
    quote:
      "I got my GED, learned a trade, and found a career I'm genuinely grateful for.",
  },
  {
    name: "Sam Liberow",
    role: "VP Investments",
    year: "Class of 2018",
    quote:
      "The confidence and drive I have today started at JETS. I recommend it to anyone starting fresh.",
  },
  {
    name: "Motty Vogel",
    role: "Financial Director",
    year: "Class of 2019",
    quote:
      "JETS made my goal of becoming an accountant realistic and achievable.",
  },
];

const campusPhotos = [
  {
    src: "https://www.jetsschool.org/wp-content/uploads/2020/02/tr5-1024x576.jpg",
    alt: "Students in classroom",
  },
  {
    src: "https://www.jetsschool.org/wp-content/uploads/2019/01/cl__0045_c2-1024x576.jpg",
    alt: "Campus classroom",
  },
  {
    src: "https://www.jetsschool.org/wp-content/uploads/2019/03/jip1-2.png",
    alt: "Fitness center",
  },
  {
    src: "https://www.jetsschool.org/wp-content/uploads/2019/03/jip5.png",
    alt: "Music studio",
  },
  {
    src: "https://www.jetsschool.org/wp-content/uploads/2020/02/tr3-1024x576.jpg",
    alt: "Students learning",
  },
  {
    src: "https://www.jetsschool.org/wp-content/uploads/2019/03/jip3.png",
    alt: "Computer room",
  },
];

export default function HomePage() {
  return (
    <>
      <SiteNav />

      {/* 1. Video Hero */}
      <VideoHero />

      {/* 2. Stats Band */}
      <StatsBand />

      {/* 3. What is JETS? */}
      <section className="py-20 lg:py-28">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-[var(--jet-primary)] mb-4">
                What is JETS?
              </p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[var(--jet-text)] leading-[1.15]">
                Real skills. Real Torah.
                <br />
                Real results.
              </h2>
              <p className="mt-6 text-lg text-[var(--jet-text-muted)] leading-relaxed max-w-[520px]">
                JETS is where young Jewish men gain real-world skills while
                deepening their Torah learning. No fluff. No wasted time. Just a
                clear path to a career and a meaningful life.
              </p>
              <div className="mt-8">
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 text-[var(--jet-primary)] font-semibold hover:underline"
                >
                  Learn more about JETS
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                    />
                  </svg>
                </Link>
              </div>
            </div>
            <div className="relative">
              <Image
                src="https://www.jetsschool.org/wp-content/uploads/2020/10/jets_new_campus4.jpg"
                alt="JETS campus rendering"
                width={640}
                height={440}
                className="rounded-2xl object-cover w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 4. Programs Grid */}
      <section className="py-20 lg:py-28 bg-[var(--jet-bg-subtle)]">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold uppercase tracking-wider text-[var(--jet-primary)] mb-4">
              Programs
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[var(--jet-text)]">
              Six paths. One mission.
            </h2>
            <p className="mt-4 text-lg text-[var(--jet-text-muted)] max-w-[540px] mx-auto">
              Morning Torah study. Afternoon vocational training. Every day, a step closer to the man you want to be.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs.map((program) => (
              <div
                key={program.title}
                className="group bg-white rounded-2xl p-8 border border-[var(--jet-border)] hover:border-[var(--jet-primary)]/30 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-[var(--jet-primary)]/10 flex items-center justify-center mb-5">
                  <svg
                    className="w-6 h-6 text-[var(--jet-primary)]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d={program.icon}
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-[var(--jet-text)] mb-2">
                  {program.title}
                </h3>
                <p className="text-[var(--jet-text-muted)] leading-relaxed">
                  {program.description}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/programs"
              className="inline-flex items-center justify-center px-7 py-3 text-sm font-semibold text-[var(--jet-primary)] border-2 border-[var(--jet-primary)] hover:bg-[var(--jet-primary)] hover:text-white rounded-full transition-colors"
            >
              View All Programs
            </Link>
          </div>
        </div>
      </section>

      {/* 5. Campus Photos */}
      <section className="py-20 lg:py-28">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold uppercase tracking-wider text-[var(--jet-primary)] mb-4">
              Campus
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[var(--jet-text)]">
              Life at JETS
            </h2>
            <p className="mt-4 text-lg text-[var(--jet-text-muted)] max-w-[540px] mx-auto">
              9.5 acres in Granada Hills, CA. Classrooms, workshops, a fitness
              center, pool, music studio, and more.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {campusPhotos.map((photo) => (
              <div
                key={photo.alt}
                className="relative aspect-video overflow-hidden rounded-xl group"
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  width={640}
                  height={360}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Testimonials */}
      <section className="py-20 lg:py-28 bg-[var(--jet-bg-subtle)]">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold uppercase tracking-wider text-[var(--jet-primary)] mb-4">
              Alumni
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[var(--jet-text)]">
              Hear from our graduates
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="bg-white rounded-2xl p-8 border border-[var(--jet-border)]"
              >
                <svg
                  className="w-8 h-8 text-[var(--jet-primary)]/30 mb-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151C7.563 6.068 6 8.789 6 11h4v10H0z" />
                </svg>
                <p className="text-[var(--jet-text)] text-lg leading-relaxed mb-6">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div>
                  <p className="font-semibold text-[var(--jet-text)]">
                    {t.name}
                  </p>
                  <p className="text-sm text-[var(--jet-text-muted)]">
                    {t.role} &middot; {t.year}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. CTA */}
      <section className="py-20 lg:py-28 bg-[var(--jet-accent)]">
        <div className="max-w-[800px] mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
            Ready to start?
          </h2>
          <p className="mt-4 text-lg text-white/70 max-w-[480px] mx-auto">
            Applications are open for 2026-2027. Take the first step toward a
            career, a community, and a meaningful life.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/inquire"
              className="inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold text-white bg-[var(--jet-primary)] hover:bg-[var(--jet-primary-light)] rounded-full transition-colors"
            >
              Apply Now
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold text-white border-2 border-white/30 hover:border-white/60 rounded-full transition-colors"
            >
              Schedule a Visit
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
