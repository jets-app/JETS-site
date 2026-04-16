import { SiteNav } from "@/components/site/site-nav";
import { SiteFooter } from "@/components/site/site-footer";

export const metadata = {
  title: "Faculty",
  description:
    "The Rabbeim, instructors, and leadership of the Jewish Educational Trade School.",
};

const faculty = [
  {
    initials: "MS",
    name: "Rabbi Mayer Schmukler",
    role: "Founding Director",
    bio: "Rabbi Schmukler founded JETS in 2008 with a straightforward conviction: Torah learning and vocational training belong together. Ordained at the Rabbinical College of America in Morristown, NJ, he spent a decade in the pulpit rabbinate before creating JETS. He is the first to arrive each morning and the last to leave. His door is always open.",
  },
  {
    initials: "YBS",
    name: "Rabbi Y. Boruch Sufrin",
    role: "Head of Judaic Studies",
    bio: "Rabbi Sufrin leads the morning curriculum and oversees the spiritual formation of every student. A graduate of the Rabbinical College of America and a longtime Chabad educator, he has served at JETS since 2011. His Gemara chaburas are known for their depth and focus.",
  },
  {
    initials: "MBH",
    name: "Matthew B. Hintze",
    role: "Director of Vocational Programs",
    bio: "Matt directs the afternoon curriculum and manages relationships with industry partners. Before joining JETS in 2014, he spent eighteen years as a general contractor in the San Fernando Valley. He holds certifications in nine trades and personally built several of the workshops his students now use.",
  },
];

export default function FacultyPage() {
  return (
    <>
      <SiteNav />

      {/* Hero */}
      <section className="pt-28 lg:pt-36 pb-16 lg:pb-20">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-[var(--jet-primary)] mb-4">
            Leadership
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[var(--jet-text)]">
            Our Faculty
          </h1>
          <p className="mt-4 text-lg text-[var(--jet-text-muted)] max-w-[540px] mx-auto">
            The Rabbeim, tradesmen, and educators who have shaped JETS for
            nearly two decades.
          </p>
        </div>
      </section>

      {/* Faculty cards */}
      <section className="pb-20 lg:pb-28">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {faculty.map((member) => (
              <div
                key={member.name}
                className="bg-white rounded-2xl border border-[var(--jet-border)] overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Initials avatar */}
                <div className="bg-[var(--jet-bg-subtle)] flex items-center justify-center py-14">
                  <div className="w-28 h-28 rounded-full bg-[var(--jet-primary)] flex items-center justify-center">
                    <span className="text-4xl font-bold text-white tracking-tight">
                      {member.initials}
                    </span>
                  </div>
                </div>

                <div className="p-8">
                  <h3 className="text-xl font-bold text-[var(--jet-text)]">
                    {member.name}
                  </h3>
                  <p className="text-sm font-medium text-[var(--jet-primary)] mt-1 mb-4">
                    {member.role}
                  </p>
                  <p className="text-[var(--jet-text-muted)] leading-relaxed">
                    {member.bio}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 lg:py-20 bg-[var(--jet-accent)]">
        <div className="max-w-[700px] mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Want to meet the team?
          </h2>
          <p className="mt-4 text-lg text-white/70">
            Schedule a campus visit and see JETS in action. Meet the Rabbeim,
            tour the workshops, and ask any question you have.
          </p>
          <div className="mt-8">
            <a
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold text-white bg-[var(--jet-primary)] hover:bg-[var(--jet-primary-light)] rounded-full transition-colors"
            >
              Schedule a Visit
            </a>
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
