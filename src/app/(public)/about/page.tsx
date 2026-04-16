import { V2Nav } from "@/components/v2/v2-nav";
import { V2Footer } from "@/components/v2/v2-footer";
import { EditorialSection, OrnamentDivider } from "@/components/v2/editorial-section";
import { PullQuote } from "@/components/v2/pull-quote";
import { DropCapParagraph } from "@/components/v2/drop-cap-paragraph";
import { EditorialList } from "@/components/v2/editorial-list";
import { FadeIn } from "@/components/v2/fade-in";

export const metadata = {
  title: "About",
  description: "The history, mission, and founding principles of the Jewish Educational Trade School.",
};

const coreValues = [
  {
    title: "Torah",
    subtitle: "The primacy of study",
    body: "The morning seder is not a preliminary to the rest of the day; it is the day&apos;s foundation. Gemara, Chassidut, Halacha, and Tanach are taught in small chaburas by Rabbeim who know their students by name and, more importantly, by temperament.",
  },
  {
    title: "Shekeidah",
    subtitle: "The discipline of perseverance",
    body: "We hold, with the Sages, that a task half-completed is a task scarcely begun. Our students learn — in the beis medrash and in the workshop alike — the quiet virtue of finishing what one has started.",
  },
  {
    title: "Yichudiyut",
    subtitle: "The courage of individuality",
    body: "Each young man arrives at JETS with a particular shape of mind and temperament. Our vocation is not to flatten those differences but to refine them, until each graduate leaves bearing more clearly the imprint of his own character.",
  },
  {
    title: "Chiddush VeYetzirah",
    subtitle: "Innovation and creation",
    body: "A trade is not a static possession but a living practice. We teach our students not only the established techniques of their chosen disciplines but the habit of inquiry — the willingness to ask, in any given moment, whether the thing before them might be done better.",
  },
  {
    title: "Chaim Amitiyim",
    subtitle: "A life truthfully lived",
    body: "In the end, every principle above serves this one. A JETS education is not a credential; it is a preparation for a life of integrity — with one&apos;s family, one&apos;s community, and one&apos;s Creator.",
  },
];

export default function V2AboutPage() {
  return (
    <>
      <V2Nav />

      {/* Title */}
      <section>
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10 pt-10 pb-14 text-center">
          <FadeIn>
            <div className="v2-smallcaps mb-6" style={{ color: "var(--v2-ink-muted)" }}>
              An Essay in Six Parts
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
              About <em className="italic" style={{ color: "var(--v2-burgundy)" }}>JETS.</em>
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
              The Jewish Educational Trade School, in its history, its
              aspirations, and the five principles that have sustained it.
            </div>
          </FadeIn>
          <FadeIn delay={0.3}>
            <div className="v2-ornament mt-12" style={{ color: "var(--v2-gold)" }}>
              <span>✦</span>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* History */}
      <EditorialSection kicker="I. A Brief History">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-4">
            <FadeIn>
              <h2
                className="v2-display sticky top-10"
                style={{
                  fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
                  color: "var(--v2-ink)",
                }}
              >
                Founded in 2008, upon a <em className="italic" style={{ color: "var(--v2-burgundy)" }}>stubborn premise.</em>
              </h2>
            </FadeIn>
          </div>
          <div className="lg:col-span-8 v2-editorial space-y-5" style={{ fontSize: "17.5px", lineHeight: 1.75 }}>
            <FadeIn delay={0.1}>
              <DropCapParagraph>
                In the autumn of 2008, in a modest rented space in the San Fernando
                Valley, the Jewish Educational Trade School opened its doors to
                thirty-two students. It was, at the time, an improbable venture:
                a post-secondary yeshiva that would devote half its hours to
                vocational training, on the premise — then unfashionable, now
                increasingly vindicated — that a young man&apos;s formation is
                impoverished by the omission of either half.
              </DropCapParagraph>
            </FadeIn>
            <FadeIn delay={0.15}>
              <p>
                In the sixteen years since, the school has grown into its nine
                and a half acres in Granada Hills, graduated 812 alumni,
                expanded its course catalogue to fifty-seven distinct offerings,
                and, with the opening of the Fisch Trade School, added four
                purpose-built structures to house its workshops and classrooms.
                What has not changed — and what we hope never will — is the
                premise upon which the experiment began.
              </p>
            </FadeIn>
            <FadeIn delay={0.2}>
              <p>
                That premise, stated plainly: the life of the mind and the life
                of the hands are not rival vocations but complementary ones,
                and a young man formed in both will be the better citizen, the
                better Jew, and the better man for it.
              </p>
            </FadeIn>
          </div>
        </div>
      </EditorialSection>

      {/* Founder tribute */}
      <EditorialSection kicker="II. The Founder">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <FadeIn className="lg:col-span-5">
            <div
              className="aspect-[4/5] w-full relative flex items-center justify-center"
              style={{
                background: "var(--v2-parchment-deep)",
                border: "1px solid var(--v2-rule)",
              }}
            >
              <div className="absolute inset-4" style={{ border: "1px solid var(--v2-gold)" }} />
              <div className="text-center p-8">
                <div
                  className="v2-display"
                  style={{
                    fontSize: "6rem",
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
            <div className="mt-4 v2-byline italic" style={{ fontSize: "12px", letterSpacing: 0, textTransform: "none", color: "var(--v2-ink-faint)" }}>
              Rabbi Mayer Schmukler, photographed c. 2014.
            </div>
          </FadeIn>

          <div className="lg:col-span-7">
            <FadeIn delay={0.1}>
              <h2
                className="v2-display mb-6"
                style={{ fontSize: "clamp(2rem, 4vw, 3rem)", color: "var(--v2-ink)" }}
              >
                Rabbi Mayer Schmukler, <em className="italic" style={{ color: "var(--v2-burgundy)" }}>Founding Director.</em>
              </h2>
            </FadeIn>
            <div className="v2-editorial space-y-5" style={{ fontSize: "17px", lineHeight: 1.75 }}>
              <FadeIn delay={0.15}>
                <p>
                  To the student who has not yet met him, Rabbi Schmukler is
                  most easily described by what he is not. He is not a promoter;
                  he is not given to slogans; he is not, by any reasonable
                  standard, a man who seeks attention. He is, instead, the quiet
                  animating spirit of an institution that has, for sixteen
                  years, reflected his particular combination of rigor and
                  warmth.
                </p>
              </FadeIn>
              <FadeIn delay={0.2}>
                <PullQuote>
                  A school, like a student, is best judged not by its brochures but by the lives it produces.
                </PullQuote>
              </FadeIn>
              <FadeIn delay={0.25}>
                <p>
                  He remains, at sixty-some-odd years, the first to arrive in
                  the beis medrash each morning and the last to leave. This is,
                  we suspect, not an accident of temperament but a deliberate
                  pedagogy. Whatever we teach at JETS, we teach first by
                  example.
                </p>
              </FadeIn>
            </div>
          </div>
        </div>
      </EditorialSection>

      {/* Core Values */}
      <EditorialSection kicker="III. The Five Principles">
        <FadeIn>
          <h2
            className="v2-display max-w-4xl mb-4"
            style={{
              fontSize: "clamp(2rem, 4vw, 3.25rem)",
              color: "var(--v2-ink)",
            }}
          >
            Five principles, <em className="italic" style={{ color: "var(--v2-burgundy)" }}>plainly stated.</em>
          </h2>
        </FadeIn>
        <FadeIn delay={0.1}>
          <p
            className="v2-editorial italic max-w-3xl mb-10"
            style={{ fontSize: "18px", color: "var(--v2-ink-muted)", lineHeight: 1.6 }}
          >
            These are the commitments to which every hour of the JETS day —
            morning seder and afternoon workshop alike — is in some small way a
            tribute.
          </p>
        </FadeIn>

        <EditorialList items={coreValues.map((v) => ({
          title: v.title,
          subtitle: v.subtitle,
          body: <span dangerouslySetInnerHTML={{ __html: v.body }} />,
        }))} />
      </EditorialSection>

      <OrnamentDivider />

      {/* Campus */}
      <EditorialSection kicker="IV. The Campus" bordered={false}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5">
            <FadeIn>
              <h2
                className="v2-display"
                style={{ fontSize: "clamp(2rem, 4vw, 3rem)", color: "var(--v2-ink)" }}
              >
                Nine acres, <em className="italic" style={{ color: "var(--v2-navy)" }}>at the edge of the valley.</em>
              </h2>
            </FadeIn>
            <FadeIn delay={0.15}>
              <div className="mt-6 v2-byline" style={{ color: "var(--v2-ink-muted)" }}>
                16601 Rinaldi Street · Granada Hills
              </div>
            </FadeIn>
          </div>
          <div className="lg:col-span-7 v2-editorial space-y-5" style={{ fontSize: "17px", lineHeight: 1.75 }}>
            <FadeIn delay={0.1}>
              <p>
                The campus occupies nine and a half acres at the northern edge
                of Granada Hills, where the grid of the San Fernando Valley
                breaks against the foothills of the San Gabriels. It is not a
                picturesque campus in the traditional sense; its beauty is the
                beauty of a place that has been honestly used.
              </p>
            </FadeIn>
            <FadeIn delay={0.15}>
              <p>
                The Fisch Trade School expansion, completed in 2021, added four
                purpose-built structures: a workshop for the construction
                trades, a laboratory for the electrical program, a computing
                suite for the technology tracks, and a central pavilion that
                houses the dining hall and the library. The original beis
                medrash, renovated but unchanged in character, remains the
                heart of the institution.
              </p>
            </FadeIn>
          </div>
        </div>
      </EditorialSection>

      <V2Footer />
    </>
  );
}
