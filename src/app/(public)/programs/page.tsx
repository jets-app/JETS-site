import { V2Nav } from "@/components/v2/v2-nav";
import { V2Footer } from "@/components/v2/v2-footer";
import { EditorialSection, OrnamentDivider } from "@/components/v2/editorial-section";
import { DropCapParagraph } from "@/components/v2/drop-cap-paragraph";
import { FadeIn } from "@/components/v2/fade-in";

export const metadata = {
  title: "Programs",
  description: "The JETS course catalogue — Judaic studies, professional tracks, and the wider life.",
};

const programCatalogue = [
  {
    section: "Judaic Studies",
    note: "Morning Curriculum · Required of all students",
    courses: [
      { title: "Gemara", body: "Close textual study with a classical methodology; small chaburas organized by level and disposition." },
      { title: "Chassidut", body: "The philosophical and ethical literature of the Chabad tradition and its intellectual neighbors." },
      { title: "Halacha", body: "Practical law as it bears upon the working life — kashrut, Shabbat, business ethics, and the laws of the craftsman." },
      { title: "Tanach", body: "The weekly parasha, the Prophets, and the Writings, read with historical and literary attention." },
    ],
  },
  {
    section: "Applied Technology",
    note: "Professional Track · Afternoon",
    courses: [
      { title: "Web Development", body: "The modern stack: HTML, CSS, JavaScript, and the discipline of shipping software that serves real users." },
      { title: "Digital Media", body: "Photography, video, and the editorial craft of storytelling for contemporary audiences." },
      { title: "Computer Literacy", body: "Foundations in hardware, networking, and the operating habits of a working technologist." },
    ],
  },
  {
    section: "Skilled Trades",
    note: "Professional Track · Afternoon",
    courses: [
      { title: "Construction", body: "Framing, finishing, and the project management that transforms a set of drawings into a standing building." },
      { title: "Electrical", body: "Residential and commercial wiring, code, and the culture of a trade that rewards precision." },
      { title: "Emergency Medical Services", body: "EMT certification coursework, paired with the ethical training proper to the care of strangers." },
    ],
  },
  {
    section: "Business & Enterprise",
    note: "Professional Track · Afternoon",
    courses: [
      { title: "Entrepreneurship", body: "The economics, the ethics, and the patience required to build a small business that lasts." },
      { title: "Accounting", body: "The working grammar of financial statements, for those who intend to run a business or assist one." },
      { title: "Marketing", body: "Communication with the customer, written as honestly as one would wish to be written to." },
    ],
  },
  {
    section: "Real Estate",
    note: "Professional Track · Afternoon",
    courses: [
      { title: "Real Estate Principles", body: "License preparation, investment fundamentals, and the longer history of stewarding property." },
    ],
  },
  {
    section: "Academic Foundations",
    note: "High School & GED · All ages",
    courses: [
      { title: "English", body: "Composition, literature, and the slow work of learning to write a sentence one is willing to sign." },
      { title: "Mathematics", body: "From arithmetic through pre-calculus, with attention to the applications that a tradesman encounters." },
      { title: "The Sciences", body: "Biology, chemistry, and physics, taught with the working man&apos;s eye toward practical consequence." },
      { title: "GED Preparation", body: "A focused sequence for students completing secondary credentials alongside their vocational work." },
    ],
  },
  {
    section: "The Wider Life",
    note: "Extracurricular · By interest",
    courses: [
      { title: "Culinary Arts", body: "Kitchen fundamentals, kashrut in practice, and the hospitality of a well-set table." },
      { title: "Music", body: "Vocal and instrumental instruction; niggunim, classical, and the traditions in between." },
      { title: "Martial Arts", body: "Discipline, restraint, and the cultivation of physical competence." },
      { title: "Athletics", body: "Team sports and physical training, for the health of the body and the moderation of the temperament." },
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

export default function V2ProgramsPage() {
  return (
    <>
      <V2Nav />

      {/* Title */}
      <section>
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10 pt-10 pb-14 text-center">
          <FadeIn>
            <div className="v2-smallcaps mb-6" style={{ color: "var(--v2-ink-muted)" }}>
              The Course Catalogue &nbsp;·&nbsp; Academic Year 2026–27
            </div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h1
              className="v2-display"
              style={{
                fontSize: "clamp(3rem, 8vw, 6.5rem)",
                color: "var(--v2-ink)",
              }}
            >
              <em className="italic" style={{ color: "var(--v2-burgundy)" }}>Programs</em> of Study.
            </h1>
          </FadeIn>
          <FadeIn delay={0.2}>
            <div
              className="mt-6 italic v2-editorial mx-auto"
              style={{
                fontSize: "19px",
                maxWidth: "42rem",
                color: "var(--v2-ink-muted)",
                lineHeight: 1.55,
              }}
            >
              Fifty-seven courses across seven disciplines, arranged in the
              order in which a JETS day actually unfolds.
            </div>
          </FadeIn>
          <FadeIn delay={0.3}>
            <div className="v2-ornament mt-12" style={{ color: "var(--v2-gold)" }}>
              <span>✦</span>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Overview essay */}
      <EditorialSection kicker="An Overview">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 lg:col-start-3">
            <FadeIn>
              <DropCapParagraph>
                The JETS day is divided, in the main, into two sessions: the
                morning, given to Torah study in all its traditional forms, and
                the afternoon, given to the professional or vocational track
                each student has chosen. A third category of offering — which
                we have, with some affection, called <em>The Wider Life</em> —
                occupies the late afternoon and early evening, and attends to
                the cultivation of interests and skills that no professional
                catalogue can properly name.
              </DropCapParagraph>
            </FadeIn>
            <FadeIn delay={0.1}>
              <p
                className="v2-editorial mt-5"
                style={{ fontSize: "17.5px", lineHeight: 1.75 }}
              >
                What follows is the full course catalogue for the 2026–27
                academic year. Course descriptions have been kept deliberately
                brief. The fuller picture emerges, as it should, from
                conversation with the instructor and from the first hour in the
                classroom itself.
              </p>
            </FadeIn>
          </div>
        </div>
      </EditorialSection>

      {/* Catalogue */}
      {programCatalogue.map((section, si) => (
        <EditorialSection
          key={section.section}
          kicker={`§ ${String(si + 1).padStart(2, "0")} — ${section.section}`}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-10">
            <div className="lg:col-span-5">
              <FadeIn>
                <h2
                  className="v2-display"
                  style={{ fontSize: "clamp(1.75rem, 3.25vw, 2.75rem)", color: "var(--v2-ink)" }}
                >
                  {section.section}
                </h2>
              </FadeIn>
              <FadeIn delay={0.1}>
                <div className="mt-3 v2-byline" style={{ color: "var(--v2-ink-muted)" }}>
                  {section.note}
                </div>
              </FadeIn>
            </div>
          </div>

          <div style={{ borderTop: "1px solid var(--v2-rule)" }}>
            {section.courses.map((c, i) => (
              <FadeIn key={c.title} delay={i * 0.04}>
                <div
                  className="grid grid-cols-12 gap-6 py-6"
                  style={{ borderBottom: "1px solid var(--v2-rule-soft)" }}
                >
                  <div
                    className="col-span-12 md:col-span-1 v2-byline pt-1"
                    style={{ color: "var(--v2-ink-faint)" }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div className="col-span-12 md:col-span-4">
                    <h3
                      className="v2-display"
                      style={{
                        fontSize: "1.35rem",
                        color: "var(--v2-ink)",
                      }}
                    >
                      {c.title}
                    </h3>
                  </div>
                  <div
                    className="col-span-12 md:col-span-7 v2-editorial"
                    style={{ fontSize: "16px", lineHeight: 1.65, color: "var(--v2-ink-muted)" }}
                    dangerouslySetInnerHTML={{ __html: c.body }}
                  />
                </div>
              </FadeIn>
            ))}
          </div>
        </EditorialSection>
      ))}

      <OrnamentDivider />

      {/* Partners */}
      <EditorialSection kicker="In Partnership With" bordered={false}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-10">
          <div className="lg:col-span-5">
            <FadeIn>
              <h2
                className="v2-display"
                style={{ fontSize: "clamp(2rem, 3.5vw, 2.75rem)", color: "var(--v2-ink)" }}
              >
                Our <em className="italic" style={{ color: "var(--v2-burgundy)" }}>accrediting</em> partners.
              </h2>
            </FadeIn>
          </div>
          <div className="lg:col-span-7">
            <FadeIn delay={0.1}>
              <p
                className="v2-editorial italic"
                style={{ fontSize: "17px", color: "var(--v2-ink-muted)", lineHeight: 1.65 }}
              >
                JETS certifications are issued in collaboration with the
                industry bodies that set the standards for the trades we teach.
                We are grateful for their partnership, and for the discipline
                their standards impose upon our work.
              </p>
            </FadeIn>
          </div>
        </div>

        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
          style={{
            borderTop: "1px solid var(--v2-rule)",
            borderLeft: "1px solid var(--v2-rule)",
          }}
        >
          {partners.map((p) => (
            <div
              key={p}
              className="p-6 text-center v2-smallcaps flex items-center justify-center"
              style={{
                borderRight: "1px solid var(--v2-rule)",
                borderBottom: "1px solid var(--v2-rule)",
                color: "var(--v2-ink)",
                minHeight: "110px",
                fontSize: "11.5px",
              }}
            >
              {p}
            </div>
          ))}
        </div>
      </EditorialSection>

      <V2Footer />
    </>
  );
}
