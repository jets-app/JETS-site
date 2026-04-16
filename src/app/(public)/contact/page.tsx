import { V2Nav } from "@/components/v2/v2-nav";
import { V2Footer } from "@/components/v2/v2-footer";
import { EditorialSection, OrnamentDivider } from "@/components/v2/editorial-section";
import { FadeIn } from "@/components/v2/fade-in";
import { ContactForm } from "@/components/v2/contact-form";

export const metadata = {
  title: "Contact",
  description: "Correspondence, visits, and the address of the Jewish Educational Trade School.",
};

export default function ContactPage() {
  return (
    <>
      <V2Nav />

      <section>
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10 pt-10 pb-14 text-center">
          <FadeIn>
            <div className="v2-smallcaps mb-6" style={{ color: "var(--v2-ink-muted)" }}>
              Correspondence &nbsp;·&nbsp; Visitation &nbsp;·&nbsp; Address
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
              Get <em className="italic" style={{ color: "var(--v2-burgundy)" }}>in touch.</em>
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
              We prefer conversation to correspondence, and a visit to either.
              In that spirit, the particulars below.
            </div>
          </FadeIn>
          <FadeIn delay={0.3}>
            <div className="v2-ornament mt-12" style={{ color: "var(--v2-gold)" }}>
              <span>✦</span>
            </div>
          </FadeIn>
        </div>
      </section>

      <EditorialSection kicker="The Particulars">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5 space-y-10">
            <FadeIn>
              <div>
                <div className="v2-kicker mb-4">Campus Address</div>
                <address
                  className="not-italic v2-display"
                  style={{
                    fontSize: "1.75rem",
                    lineHeight: 1.35,
                    color: "var(--v2-ink)",
                  }}
                >
                  16601 Rinaldi Street<br />
                  Granada Hills, California<br />
                  91344
                </address>
              </div>
            </FadeIn>

            <FadeIn delay={0.1}>
              <div>
                <div className="v2-kicker mb-4">By Telephone</div>
                <a
                  href="tel:+18188313000"
                  className="v2-display v2-link-underline inline-block"
                  style={{
                    fontSize: "1.75rem",
                    color: "var(--v2-burgundy)",
                  }}
                >
                  (818) 831–3000
                </a>
              </div>
            </FadeIn>

            <FadeIn delay={0.15}>
              <div>
                <div className="v2-kicker mb-4">By Electronic Post</div>
                <a
                  href="mailto:admissions@jets-school.org"
                  className="v2-display v2-link-underline inline-block"
                  style={{
                    fontSize: "1.5rem",
                    color: "var(--v2-navy)",
                  }}
                >
                  admissions@jets-school.org
                </a>
              </div>
            </FadeIn>

            <FadeIn delay={0.2}>
              <div>
                <div className="v2-kicker mb-4">Hours of Operation</div>
                <table
                  className="v2-editorial w-full"
                  style={{ fontSize: "16px", color: "var(--v2-ink)" }}
                >
                  <tbody>
                    {[
                      ["Sunday", "9:00 — 3:00"],
                      ["Monday – Thursday", "8:00 — 6:00"],
                      ["Friday", "8:00 — 1:00"],
                      ["Shabbat", "Closed"],
                    ].map(([day, hours]) => (
                      <tr
                        key={day}
                        style={{ borderBottom: "1px solid var(--v2-rule-soft)" }}
                      >
                        <td className="py-3 pr-4 italic" style={{ color: "var(--v2-ink-muted)" }}>
                          {day}
                        </td>
                        <td className="py-3 text-right v2-display" style={{ fontSize: "17px" }}>
                          {hours}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </FadeIn>
          </div>

          <div className="lg:col-span-7 lg:pl-10" style={{ borderLeft: "1px solid var(--v2-rule)" }}>
            <FadeIn>
              <div className="v2-kicker mb-4">An Inquiry</div>
              <h2
                className="v2-display mb-3"
                style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)", color: "var(--v2-ink)" }}
              >
                Write to <em className="italic" style={{ color: "var(--v2-burgundy)" }}>the school.</em>
              </h2>
              <p
                className="v2-editorial italic mb-10"
                style={{ fontSize: "16.5px", color: "var(--v2-ink-muted)", lineHeight: 1.65 }}
              >
                We read every letter. A reply, in our experience, arrives within two or three business days.
              </p>
            </FadeIn>

            <FadeIn delay={0.1}>
              <ContactForm />
            </FadeIn>
          </div>
        </div>
      </EditorialSection>

      <OrnamentDivider />

      <EditorialSection kicker="Finding Us" bordered={false}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-10">
          <div className="lg:col-span-5">
            <FadeIn>
              <h2
                className="v2-display"
                style={{ fontSize: "clamp(2rem, 3.5vw, 2.75rem)", color: "var(--v2-ink)" }}
              >
                At the foothills of the <em className="italic" style={{ color: "var(--v2-navy)" }}>San Gabriel Valley.</em>
              </h2>
            </FadeIn>
          </div>
          <div className="lg:col-span-7">
            <FadeIn delay={0.1}>
              <p className="v2-editorial italic" style={{ fontSize: "17px", color: "var(--v2-ink-muted)", lineHeight: 1.65 }}>
                The campus sits a short drive from the 118 and 405 freeways,
                roughly thirty-five minutes from central Los Angeles in
                agreeable traffic — which is to say, before eight in the
                morning or after eight in the evening.
              </p>
            </FadeIn>
          </div>
        </div>

        <FadeIn delay={0.15}>
          <div
            className="relative w-full overflow-hidden"
            style={{
              aspectRatio: "21 / 9",
              background: "var(--v2-parchment-deep)",
              border: "1px solid var(--v2-rule)",
            }}
          >
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "linear-gradient(var(--v2-rule-soft) 1px, transparent 1px), linear-gradient(90deg, var(--v2-rule-soft) 1px, transparent 1px)",
                backgroundSize: "44px 44px",
                opacity: 0.6,
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div
                  className="v2-display italic mb-3"
                  style={{ fontSize: "2.5rem", color: "var(--v2-burgundy)" }}
                >
                  ✦
                </div>
                <div className="v2-display" style={{ fontSize: "1.5rem", color: "var(--v2-ink)" }}>
                  JETS Campus
                </div>
                <div className="mt-1 v2-byline" style={{ color: "var(--v2-ink-muted)" }}>
                  16601 Rinaldi St · Granada Hills
                </div>
              </div>
            </div>
            <div
              className="absolute top-6 right-6 w-16 h-16 rounded-full flex items-center justify-center"
              style={{ border: "1px solid var(--v2-rule)", background: "var(--v2-parchment)" }}
            >
              <div className="v2-display italic" style={{ color: "var(--v2-gold)", fontSize: "18px" }}>
                N
              </div>
            </div>
            <div className="absolute bottom-6 left-6 v2-byline" style={{ color: "var(--v2-ink-muted)" }}>
              ← 1 mi →
            </div>
          </div>
        </FadeIn>
      </EditorialSection>

      <V2Footer />
    </>
  );
}
