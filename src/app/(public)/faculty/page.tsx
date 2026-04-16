import { V2Nav } from "@/components/v2/v2-nav";
import { V2Footer } from "@/components/v2/v2-footer";
import { EditorialSection, OrnamentDivider } from "@/components/v2/editorial-section";
import { PullQuote } from "@/components/v2/pull-quote";
import { DropCapParagraph } from "@/components/v2/drop-cap-paragraph";
import { FadeIn } from "@/components/v2/fade-in";

export const metadata = {
  title: "Faculty",
  description: "The Rabbeim, instructors, and leadership of the Jewish Educational Trade School.",
};

const otherLeaders = [
  {
    initials: "YBS",
    name: "Rabbi Y. Boruch Sufrin",
    role: "Menahel · Head of Judaic Studies",
    bio: [
      "Rabbi Sufrin leads the morning curriculum and oversees the spiritual formation of the student body. A graduate of the Rabbinical College of America and a longtime educator in the Chabad network, he has served at JETS since 2011.",
      "His chaburas in Gemara are, by reputation, the quietest hour of the JETS day — a quality he attributes less to his teaching than to the text itself.",
    ],
    pullquote:
      "A Rebbe&apos;s first task is not to answer his students&apos; questions but to teach them which questions are worth asking.",
  },
  {
    initials: "MBH",
    name: "Matthew B. Hintze",
    role: "Director of Vocational Programs",
    bio: [
      "Mr. Hintze directs the afternoon curriculum, oversees the relationships with our industry partners, and has personally built several of the workshops his students now use.",
      "Before joining JETS in 2014, he spent eighteen years as a general contractor in the San Fernando Valley. He holds certifications in nine trades and, by his own admission, is still learning a tenth.",
    ],
    pullquote:
      "A trade is a conversation between the craftsman and the material. Our job is to teach the boys to listen.",
  },
];

export default function V2FacultyPage() {
  return (
    <>
      <V2Nav />

      {/* Title */}
      <section>
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10 pt-10 pb-14 text-center">
          <FadeIn>
            <div className="v2-smallcaps mb-6" style={{ color: "var(--v2-ink-muted)" }}>
              A Profile in Three Parts
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
              Meet Our <em className="italic" style={{ color: "var(--v2-burgundy)" }}>Faculty.</em>
            </h1>
          </FadeIn>
          <FadeIn delay={0.2}>
            <div
              className="mt-6 italic v2-editorial mx-auto"
              style={{
                fontSize: "19px",
                maxWidth: "44rem",
                color: "var(--v2-ink-muted)",
                lineHeight: 1.55,
              }}
            >
              The Rabbeim, craftsmen, and educators who have, between them, shaped
              the character of the institution for the better part of two
              decades.
            </div>
          </FadeIn>
          <FadeIn delay={0.3}>
            <div className="v2-ornament mt-12" style={{ color: "var(--v2-gold)" }}>
              <span>✦</span>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Featured leader: Rabbi Schmukler */}
      <EditorialSection kicker="I. The Founder">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <FadeIn className="lg:col-span-5">
            <div
              className="aspect-[4/5] w-full relative flex items-center justify-center"
              style={{
                background: "var(--v2-parchment-deep)",
                border: "1px solid var(--v2-rule)",
              }}
            >
              <div className="absolute inset-4" style={{ border: "1px solid var(--v2-gold)" }} />
              <div className="text-center">
                <div
                  className="v2-display"
                  style={{
                    fontSize: "7rem",
                    color: "var(--v2-burgundy)",
                    fontStyle: "italic",
                    lineHeight: 1,
                  }}
                >
                  MS
                </div>
                <div className="mt-4 v2-byline" style={{ color: "var(--v2-ink-muted)" }}>
                  A Portrait in Absentia
                </div>
              </div>
            </div>
          </FadeIn>

          <div className="lg:col-span-7">
            <FadeIn delay={0.1}>
              <div className="v2-kicker mb-3">Founding Director</div>
              <h2
                className="v2-display mb-8"
                style={{ fontSize: "clamp(2.25rem, 4.5vw, 3.5rem)", color: "var(--v2-ink)" }}
              >
                Rabbi <em className="italic" style={{ color: "var(--v2-burgundy)" }}>Mayer Schmukler.</em>
              </h2>
            </FadeIn>
            <div className="v2-editorial space-y-5" style={{ fontSize: "17.5px", lineHeight: 1.75 }}>
              <FadeIn delay={0.15}>
                <DropCapParagraph>
                  Rabbi Mayer Schmukler founded the Jewish Educational Trade
                  School in 2008, and has served as its director continuously
                  ever since. He was ordained at the Rabbinical College of
                  America in Morristown, New Jersey, and spent the first decade
                  of his career in the classical pulpit rabbinate before
                  arriving at the conviction that would become, in due course,
                  JETS.
                </DropCapParagraph>
              </FadeIn>
              <FadeIn delay={0.2}>
                <p>
                  That conviction — that Torah learning and vocational
                  formation are not rivals but partners in the making of a
                  serious Jewish life — is not, he is the first to admit, his
                  own invention. It is the plain implication of the Mishnah in
                  Pirkei Avos, read honestly. What he has done, and what the
                  school that bears his fingerprints continues to do, is take
                  that implication seriously.
                </p>
              </FadeIn>
              <FadeIn delay={0.25}>
                <PullQuote attribution="Rabbi Mayer Schmukler">
                  If a graduate of ours, twenty years hence, should say of JETS only that it taught him how to learn and how to labor — then we will have succeeded.
                </PullQuote>
              </FadeIn>
              <FadeIn delay={0.3}>
                <p>
                  He remains, at the time of this writing, the first into the
                  beis medrash each morning and, more often than he admits, the
                  last out of it in the evening. His office is on the second
                  floor of the main building; the door, almost invariably, is
                  open.
                </p>
              </FadeIn>
            </div>
          </div>
        </div>
      </EditorialSection>

      <OrnamentDivider />

      {/* Other leaders */}
      {otherLeaders.map((leader, i) => (
        <EditorialSection
          key={leader.name}
          kicker={`${i === 0 ? "II" : "III"}. ${leader.role.split(" · ")[0]}`}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <FadeIn className={`lg:col-span-4 ${i % 2 === 1 ? "lg:order-2" : ""}`}>
              <div
                className="aspect-[4/5] w-full relative flex items-center justify-center"
                style={{
                  background: "var(--v2-parchment-deep)",
                  border: "1px solid var(--v2-rule)",
                }}
              >
                <div className="absolute inset-4" style={{ border: "1px solid var(--v2-rule-soft)" }} />
                <div
                  className="v2-display italic"
                  style={{
                    fontSize: "5rem",
                    color: "var(--v2-navy)",
                    lineHeight: 1,
                  }}
                >
                  {leader.initials}
                </div>
              </div>
            </FadeIn>

            <div className={`lg:col-span-8 ${i % 2 === 1 ? "lg:order-1" : ""}`}>
              <FadeIn delay={0.1}>
                <div className="v2-kicker mb-3">{leader.role}</div>
                <h2
                  className="v2-display mb-6"
                  style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)", color: "var(--v2-ink)" }}
                >
                  {leader.name}
                </h2>
              </FadeIn>
              <div className="v2-editorial space-y-5" style={{ fontSize: "17px", lineHeight: 1.75 }}>
                {leader.bio.map((p, pi) => (
                  <FadeIn key={pi} delay={0.15 + pi * 0.05}>
                    <p>{p}</p>
                  </FadeIn>
                ))}
                <FadeIn delay={0.3}>
                  <PullQuote size="md">
                    <span dangerouslySetInnerHTML={{ __html: leader.pullquote }} />
                  </PullQuote>
                </FadeIn>
              </div>
            </div>
          </div>
        </EditorialSection>
      ))}

      <V2Footer />
    </>
  );
}
