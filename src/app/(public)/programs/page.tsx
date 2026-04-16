import Link from "next/link";
import { SiteNav } from "@/components/site/site-nav";
import { SiteFooter } from "@/components/site/site-footer";

export const metadata = {
  title: "Programs",
  description:
    "The JETS course catalogue: Judaic studies, professional tracks, and the wider life.",
};

const programSections = [
  {
    category: "Judaic Studies",
    tag: "Morning Curriculum",
    description:
      "Every day starts here. Small groups, experienced Rabbeim, deep study.",
    courses: [
      {
        title: "Gemara",
        body: "Classical Talmudic study in small chaburas organized by level.",
      },
      {
        title: "Chassidut",
        body: "The philosophical and ethical literature of the Chabad tradition.",
      },
      {
        title: "Halacha",
        body: "Practical Jewish law: Shabbat, kashrut, business ethics, and more.",
      },
      {
        title: "Tanach",
        body: "Weekly parasha, Prophets, and Writings with historical context.",
      },
    ],
  },
  {
    category: "Applied Technology",
    tag: "Professional Track",
    description:
      "Build real things with modern tools. Code, create, and ship.",
    courses: [
      {
        title: "Web Development",
        body: "HTML, CSS, JavaScript, and the full modern stack.",
      },
      {
        title: "Digital Media",
        body: "Photography, video production, and storytelling for today.",
      },
      {
        title: "Computer Literacy",
        body: "Hardware, networking, and the habits of a working technologist.",
      },
    ],
  },
  {
    category: "Skilled Trades",
    tag: "Professional Track",
    description:
      "Hands-on work that pays well and serves the community.",
    courses: [
      {
        title: "Construction",
        body: "Framing, finishing, and project management. Build real things.",
      },
      {
        title: "Electrical",
        body: "Residential and commercial wiring, code compliance, precision work.",
      },
      {
        title: "Emergency Medical Services",
        body: "EMT certification coursework paired with ethical training.",
      },
    ],
  },
  {
    category: "Business & Enterprise",
    tag: "Professional Track",
    description:
      "From starting a business to managing money. The skills behind success.",
    courses: [
      {
        title: "Entrepreneurship",
        body: "Economics, ethics, and the patience to build a business that lasts.",
      },
      {
        title: "Accounting",
        body: "Financial statements, bookkeeping, and business management.",
      },
      {
        title: "Marketing",
        body: "Customer communication, branding, and honest business growth.",
      },
      {
        title: "Real Estate",
        body: "License preparation, investment fundamentals, and property management.",
      },
    ],
  },
  {
    category: "Academic Foundations",
    tag: "High School & GED",
    description:
      "Core academics for students completing credentials alongside vocational work.",
    courses: [
      {
        title: "English",
        body: "Composition, literature, and clear writing.",
      },
      {
        title: "Mathematics",
        body: "Arithmetic through pre-calculus with practical applications.",
      },
      {
        title: "The Sciences",
        body: "Biology, chemistry, and physics with a practical eye.",
      },
      {
        title: "GED Preparation",
        body: "Focused sequence for students completing secondary credentials.",
      },
    ],
  },
  {
    category: "The Wider Life",
    tag: "Extracurricular",
    description:
      "Because a well-rounded man needs more than a career.",
    courses: [
      {
        title: "Culinary Arts",
        body: "Kitchen fundamentals, kashrut in practice, hospitality.",
      },
      {
        title: "Music",
        body: "Vocal and instrumental instruction across traditions.",
      },
      {
        title: "Martial Arts",
        body: "Discipline, restraint, and physical competence.",
      },
      {
        title: "Athletics",
        body: "Team sports and physical training for body and mind.",
      },
    ],
  },
];

const partners = [
  "Los Angeles Fire Department",
  "American Red Cross",
  "National Electrical Contractors Association",
  "Home Builders Institute",
  "CompTIA",
  "California Real Estate License Division",
  "ServSafe",
  "OSHA Outreach",
];

export default function ProgramsPage() {
  return (
    <>
      <SiteNav />

      {/* Hero */}
      <section className="pt-28 lg:pt-36 pb-16 lg:pb-20">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-[var(--jet-primary)] mb-4">
            2026-2027 Catalogue
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[var(--jet-text)]">
            Our Programs
          </h1>
          <p className="mt-4 text-lg text-[var(--jet-text-muted)] max-w-[540px] mx-auto">
            57 courses across six disciplines. Morning Torah study, afternoon
            vocational training, and everything in between.
          </p>
        </div>
      </section>

      {/* Program sections */}
      {programSections.map((section) => (
        <section
          key={section.category}
          className="py-16 lg:py-20 even:bg-[var(--jet-bg-subtle)]"
        >
          <div className="max-w-[1280px] mx-auto px-6 lg:px-10">
            <div className="mb-10">
              <span className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[var(--jet-primary)] bg-[var(--jet-primary)]/10 rounded-full mb-3">
                {section.tag}
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--jet-text)]">
                {section.category}
              </h2>
              <p className="mt-2 text-[var(--jet-text-muted)] text-lg">
                {section.description}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {section.courses.map((course) => (
                <div
                  key={course.title}
                  className="bg-white rounded-xl p-6 border border-[var(--jet-border)] hover:shadow-md transition-shadow"
                >
                  <h3 className="text-lg font-bold text-[var(--jet-text)] mb-2">
                    {course.title}
                  </h3>
                  <p className="text-[var(--jet-text-muted)] leading-relaxed">
                    {course.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* Partners */}
      <section className="py-16 lg:py-20">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10">
          <div className="text-center mb-10">
            <p className="text-sm font-semibold uppercase tracking-wider text-[var(--jet-primary)] mb-4">
              Partners
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--jet-text)]">
              Industry-recognized certifications
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {partners.map((p) => (
              <div
                key={p}
                className="flex items-center justify-center text-center p-6 rounded-xl border border-[var(--jet-border)] text-sm font-medium text-[var(--jet-text-muted)]"
              >
                {p}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 lg:py-20 bg-[var(--jet-primary)]">
        <div className="max-w-[700px] mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Find your path
          </h2>
          <p className="mt-4 text-lg text-white/70">
            Not sure which program is right for you? That is fine. We will help
            you figure it out.
          </p>
          <div className="mt-8">
            <Link
              href="/inquire"
              className="inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold text-[var(--jet-primary)] bg-white hover:bg-white/90 rounded-full transition-colors"
            >
              Apply Now
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
