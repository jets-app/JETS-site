import Link from "next/link";
import { V2Nav } from "@/components/v2/v2-nav";
import { V2Footer } from "@/components/v2/v2-footer";
import { EditorialSection, OrnamentDivider } from "@/components/v2/editorial-section";
import { PullQuote } from "@/components/v2/pull-quote";
import { DropCapParagraph } from "@/components/v2/drop-cap-paragraph";
import { FadeIn } from "@/components/v2/fade-in";

const programs = [
  {
    title: "Judaic Studies",
    kicker: "Morning Curriculum",
    body: "Gemara, Chassidut, Halacha, and Tanach taught by experienced Rabbeim in small, dialogic settings.",
  },
  {
    title: "Applied Technology",
    kicker: "Professional Track",
    body: "Web development, digital media, and computer literacy — a modern apprenticeship in the craft of making.",
  },
  {
    title: "Skilled Trades",
    kicker: "Professional Track",
    body: "Construction, electrical work, and emergency medical services. Work of the hands and of service.",
  },
  {
    title: "Business & Enterprise",
    kicker: "Professional Track",
    body: "Entrepreneurship, accounting, and the quiet discipline of building something durable.",
  },
  {
    title: "Academic Foundations",
    kicker: "High School & GED",
    body: "English, mathematics, and the sciences — the grammar of a learned life.",
  },
  {
    title: "The Wider Life",
    kicker: "Extracurricular",
    body: "Culinary arts, music, martial arts, and athletics — for the cultivation of the whole man.",
  },
];

const alumniVoices = [
  {
    quote:
      "At JETS I learned that my hands and my mind were not adversaries. The morning seder in the beis medrash prepared me for the afternoon in the workshop, and both prepared me for a life I did not know to want.",
    attribution: "Koby Lerner",
    role: "Class of 2014 · Electrical Contractor",
  },
  {
    quote:
      "What they gave me was not merely a trade. It was a way of being useful — to my family, to my community, to Hashem. That, I think, is the whole point.",
    attribution: "Mendel Rubashkin",
    role: "Class of 2016 · Small Business Owner",
  },
  {
    quote:
      "I arrived uncertain and left decided. The Rabbeim did not tell me what to do with my life; they taught me how to ask the question properly.",
    attribution: "Sam Liberow",
    role: "Class of 2018 · Web Developer",
  },
];

export default function V2Home() {
  return (
    <>
      <V2Nav />

      {/* ===== HERO / OPENING ===== */}
      <section className="relative">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10 pt-10 pb-16">
          <FadeIn>
            <div className="text-center v2-smallcaps mb-10" style={{ color: "var(--v2-ink-muted)" }}>
              Part One &nbsp;—&nbsp; An Introduction
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <h1
              className="v2-display text-center mx-auto"
              style={{
                fontSize: "clamp(2.75rem, 7.5vw, 6.5rem)",
                maxWidth: "16ch",
                color: "var(--v2-ink)",
                lineHeight: 1.02,
              }}
            >
              A <em className="italic" style={{ color: "var(--v2-burgundy)" }}>Torah-centered</em> trade education,{" "}
              <span style={{ color: "var(--v2-navy)" }}>since 2008.</span>
            </h1>
          </FadeIn>

          <FadeIn delay={0.25}>
            <div
              className="mt-10 mx-auto text-center italic v2-editorial"
              style={{
                fontSize: "20px",
                maxWidth: "42rem",
                color: "var(--v2-ink-muted)",
                lineHeight: 1.5,
              }}
            >
              Where the morning is given to study, the afternoon to craft, and the
              whole of a young man&apos;s life to the quiet work of becoming.
            </div>
          </FadeIn>

          <FadeIn delay={0.4}>
            <div className="v2-ornament mt-14" style={{ color: "var(--v2-gold)" }}>
              <span>✦</span>
            </div>
          </FadeIn>

          {/* Multi-column editorial lede */}
          <div className="mt-14 grid grid-cols-1 md:grid-cols-12 gap-10">
            <div className="md:col-span-3">
              <div className="v2-kicker mb-3">From the Editors</div>
              <div className="italic v2-editorial" style={{ color: "var(--v2-ink-muted)" }}>
                A brief note on the institution and its improbable, sixteen-year experiment.
              </div>
              <div className="mt-4 v2-byline" style={{ color: "var(--v2-ink-faint)" }}>
                Granada Hills
              </div>
            </div>
            <div className="md:col-span-9">
              <DropCapParagraph>
                The Jewish Educational Trade School, known to its eight hundred and
                twelve alumni simply as <em>JETS</em>, was founded in 2008 on a
                premise that has become, in our age, almost radical: that a young
                man may be formed at once in the study of Torah and in a useful
                trade, and that neither aspiration need be diminished to
                accommodate the other. Sixteen years on, the school sits upon nine
                and a half acres in Granada Hills, at the foothills of the San
                Gabriel Valley, and has quietly sent graduates into fifty-seven
                disciplines — from electrical work to entrepreneurship, from the
                rabbinate to the fire service. This is its story, told in parts.
              </DropCapParagraph>
            </div>
          </div>
        </div>
      </section>

      {/* ===== MISSION ===== */}
      <EditorialSection kicker="Part Two — Our Mission">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          <div className="lg:col-span-5">
            <FadeIn>
              <h2
                className="v2-display"
                style={{
                  fontSize: "clamp(2.25rem, 4.5vw, 3.75rem)",
                  color: "var(--v2-ink)",
                }}
              >
                Not a choice, <em className="italic" style={{ color: "var(--v2-burgundy)" }}>but a synthesis.</em>
              </h2>
            </FadeIn>
            <FadeIn delay={0.1}>
              <div
                className="mt-6 v2-byline"
                style={{ color: "var(--v2-ink-muted)" }}
              >
                By Rabbi Mayer Schmukler &nbsp;·&nbsp; Founding Director
              </div>
            </FadeIn>
          </div>

          <div className="lg:col-span-7 v2-editorial space-y-6" style={{ fontSize: "17.5px", lineHeight: 1.75, color: "var(--v2-ink)" }}>
            <FadeIn delay={0.15}>
              <p>
                JETS is an award-winning technical college and high school that
                gives young Jewish men the tools with which to lead productive
                and fulfilling lives — through a well-balanced program of
                Judaic studies, vocational training, and recreational activity.
                It is, we believe, a uniquely <em>whole</em> kind of education.
              </p>
            </FadeIn>
            <FadeIn delay={0.2}>
              <p>
                Most institutions ask a young man to choose: the life of the
                mind <em>or</em> the life of the hands; spiritual depth{" "}
                <em>or</em> professional competence. We have never accepted the
                terms of that bargain. Our graduates emerge fluent in both
                idioms, and that fluency is, we find, its own kind of freedom.
              </p>
            </FadeIn>
            <FadeIn delay={0.25}>
              <p>
                Teach a man to fish, the old proverb runs, and you feed him for
                a lifetime. We have taken the liberty of amending it: teach a
                young man to learn, to labor, and to live among brothers — and
                you give him something no market can take away.
              </p>
            </FadeIn>
          </div>
        </div>
      </EditorialSection>

      {/* ===== STATISTICS — INLINE ===== */}
      <EditorialSection kicker="By the Numbers">
        <FadeIn>
          <div
            className="v2-editorial mx-auto text-center"
            style={{
              fontSize: "clamp(1.5rem, 2.5vw, 2.25rem)",
              lineHeight: 1.35,
              maxWidth: "56rem",
              color: "var(--v2-ink)",
            }}
          >
            Over <em className="v2-display italic" style={{ color: "var(--v2-burgundy)" }}>812 graduates</em> across{" "}
            <em className="v2-display italic" style={{ color: "var(--v2-burgundy)" }}>sixteen years</em>, enrolled in some{" "}
            <em className="v2-display italic" style={{ color: "var(--v2-burgundy)" }}>fifty-seven courses</em>, studying upon{" "}
            <em className="v2-display italic" style={{ color: "var(--v2-burgundy)" }}>nine and a half acres</em> in the foothills of the San Gabriel Valley.
          </div>
        </FadeIn>
      </EditorialSection>

      {/* ===== PROGRAMS ===== */}
      <EditorialSection kicker="Part Three — Our Programs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-12">
          <h2
            className="lg:col-span-7 v2-display"
            style={{
              fontSize: "clamp(2rem, 4vw, 3.25rem)",
              color: "var(--v2-ink)",
            }}
          >
            Six disciplines, <em className="italic" style={{ color: "var(--v2-navy)" }}>one curriculum.</em>
          </h2>
          <p
            className="lg:col-span-5 v2-editorial italic self-end"
            style={{ fontSize: "17px", color: "var(--v2-ink-muted)", lineHeight: 1.6 }}
          >
            The JETS day is structured like a well-edited magazine: distinct
            sections, a single sensibility.
          </p>
        </div>

        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          style={{ borderTop: "1px solid var(--v2-rule)", borderLeft: "1px solid var(--v2-rule)" }}
        >
          {programs.map((p, i) => (
            <FadeIn key={p.title} delay={i * 0.05}>
              <article
                className="p-8 h-full"
                style={{
                  borderRight: "1px solid var(--v2-rule)",
                  borderBottom: "1px solid var(--v2-rule)",
                  minHeight: "260px",
                }}
              >
                <div className="v2-kicker mb-4">{p.kicker}</div>
                <h3
                  className="v2-display mb-4"
                  style={{ fontSize: "1.65rem", color: "var(--v2-ink)" }}
                >
                  {p.title}
                </h3>
                <p
                  className="v2-editorial"
                  style={{ fontSize: "15.5px", lineHeight: 1.65, color: "var(--v2-ink-muted)" }}
                >
                  {p.body}
                </p>
              </article>
            </FadeIn>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/programs"
            className="v2-smallcaps v2-link-underline"
            style={{ color: "var(--v2-burgundy)" }}
          >
            The Full Course Catalogue &nbsp;→
          </Link>
        </div>
      </EditorialSection>

      {/* ===== FOUNDER / VALUES LONG-FORM ===== */}
      <EditorialSection kicker="Part Four — Founding Principles">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8">
            <FadeIn>
              <h2
                className="v2-display mb-6"
                style={{
                  fontSize: "clamp(2rem, 3.8vw, 3rem)",
                  color: "var(--v2-ink)",
                }}
              >
                On the cultivation of <em className="italic" style={{ color: "var(--v2-burgundy)" }}>productive men.</em>
              </h2>
            </FadeIn>
            <div className="v2-editorial space-y-5" style={{ fontSize: "17.5px", lineHeight: 1.75 }}>
              <FadeIn delay={0.1}>
                <p className="v2-drop-cap">
                  When Rabbi Mayer Schmukler founded JETS in 2008, he did so with a
                  conviction borrowed in equal parts from the Mishnah and from
                  common sense: that a young man without a trade is, however
                  learned, only partially prepared for the world he must enter.
                  Yafeh talmud Torah im derech eretz — the Torah is most beautiful
                  when paired with honest labor.
                </p>
              </FadeIn>
              <FadeIn delay={0.15}>
                <p>
                  Five principles have guided the institution from its first day
                  to its sixteenth year. They are, in order: the primacy of{" "}
                  <em>Torah</em>; the discipline of <em>Shekeidah</em>,
                  perseverance; the courage of <em>Yichudiyut</em>, individual
                  identity; the imagination of <em>Chiddush VeYetzirah</em>,
                  innovation and creation; and the ideal of <em>Chaim Amitiyim</em>
                  , a life truthfully lived.
                </p>
              </FadeIn>
              <FadeIn delay={0.2}>
                <p>
                  These are not mottoes affixed to a wall. They are, at JETS, the
                  working grammar of every class, every workshop, and every
                  conversation in the quiet hours between.
                </p>
              </FadeIn>
            </div>
          </div>

          <aside className="lg:col-span-4 lg:pl-8" style={{ borderLeft: "1px solid var(--v2-rule)" }}>
            <FadeIn delay={0.2}>
              <PullQuote
                attribution="Rabbi Mayer Schmukler"
                role="Founding Director"
                size="md"
              >
                We do not prepare boys for jobs. We prepare men for lives — and a life, properly understood, is never merely an occupation.
              </PullQuote>
            </FadeIn>
          </aside>
        </div>
      </EditorialSection>

      <OrnamentDivider />

      {/* ===== ALUMNI VOICES ===== */}
      <EditorialSection kicker="Part Five — Voices from the Brotherhood" bordered={false}>
        <FadeIn>
          <h2
            className="v2-display mb-12 max-w-4xl"
            style={{
              fontSize: "clamp(2rem, 3.8vw, 3rem)",
              color: "var(--v2-ink)",
            }}
          >
            Three alumni, <em className="italic" style={{ color: "var(--v2-burgundy)" }}>in their own words.</em>
          </h2>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-0" style={{ borderTop: "1px solid var(--v2-rule)" }}>
          {alumniVoices.map((v, i) => (
            <FadeIn key={v.attribution} delay={i * 0.1}>
              <article
                className="p-8 h-full"
                style={{
                  borderRight: i < alumniVoices.length - 1 ? "1px solid var(--v2-rule)" : undefined,
                  borderBottom: "1px solid var(--v2-rule)",
                }}
              >
                <span
                  className="v2-display"
                  style={{
                    fontSize: "4rem",
                    lineHeight: 0.6,
                    color: "var(--v2-gold)",
                    display: "block",
                    marginBottom: "0.25rem",
                  }}
                  aria-hidden
                >
                  &ldquo;
                </span>
                <blockquote
                  className="v2-editorial italic"
                  style={{ fontSize: "17px", lineHeight: 1.6, color: "var(--v2-ink)" }}
                >
                  {v.quote}
                </blockquote>
                <footer className="mt-6 v2-byline" style={{ color: "var(--v2-ink-muted)" }}>
                  {v.attribution}
                  <div
                    className="mt-1 italic v2-editorial"
                    style={{
                      fontSize: "13px",
                      letterSpacing: 0,
                      textTransform: "none",
                      color: "var(--v2-ink-faint)",
                    }}
                  >
                    {v.role}
                  </div>
                </footer>
              </article>
            </FadeIn>
          ))}
        </div>
      </EditorialSection>

      {/* ===== CTA: VISIT / APPLY ===== */}
      <EditorialSection kicker="Part Six — An Invitation">
        <div
          className="grid grid-cols-1 md:grid-cols-2"
          style={{ borderTop: "1px solid var(--v2-rule)", borderBottom: "1px solid var(--v2-rule)" }}
        >
          <div
            className="p-10 lg:p-14"
            style={{ borderRight: "1px solid var(--v2-rule)" }}
          >
            <div className="v2-kicker mb-4">To the Prospective Student</div>
            <h3
              className="v2-display mb-4"
              style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)", color: "var(--v2-ink)" }}
            >
              Apply for <em className="italic" style={{ color: "var(--v2-burgundy)" }}>2026–2027.</em>
            </h3>
            <p
              className="v2-editorial italic mb-8"
              style={{ color: "var(--v2-ink-muted)", fontSize: "16.5px", lineHeight: 1.65 }}
            >
              Applications are open for the coming academic year. Whatever
              trade you intend to pursue — or if the question is still, for
              you, an open one — we will meet you where you are.
            </p>
            <Link
              href="/register"
              className="v2-smallcaps v2-link-underline"
              style={{ color: "var(--v2-burgundy)" }}
            >
              Begin your application &nbsp;→
            </Link>
          </div>

          <div className="p-10 lg:p-14">
            <div className="v2-kicker mb-4">To the Visitor</div>
            <h3
              className="v2-display mb-4"
              style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)", color: "var(--v2-ink)" }}
            >
              Come <em className="italic" style={{ color: "var(--v2-navy)" }}>see the campus.</em>
            </h3>
            <p
              className="v2-editorial italic mb-8"
              style={{ color: "var(--v2-ink-muted)", fontSize: "16.5px", lineHeight: 1.65 }}
            >
              A morning in the beis medrash, an afternoon in the workshop, a
              conversation with the Rabbeim. It is, we find, the best way to
              understand what we do.
            </p>
            <Link
              href="/contact"
              className="v2-smallcaps v2-link-underline"
              style={{ color: "var(--v2-navy)" }}
            >
              Schedule a visit &nbsp;→
            </Link>
          </div>
        </div>
      </EditorialSection>

      <V2Footer />
    </>
  );
}
