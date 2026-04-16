import { V2Nav } from "@/components/v2/v2-nav";
import { V2Footer } from "@/components/v2/v2-footer";
import { EditorialSection } from "@/components/v2/editorial-section";
import { FadeIn } from "@/components/v2/fade-in";
import { InquiryForm } from "@/components/v2/inquiry-form";

export const metadata = {
  title: "Inquire",
  description: "Request information about admissions to the Jewish Educational Trade School.",
};

export default function InquirePage() {
  return (
    <>
      <V2Nav />

      <section>
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10 pt-10 pb-14 text-center">
          <FadeIn>
            <div className="v2-smallcaps mb-6" style={{ color: "var(--v2-ink-muted)" }}>
              Admissions Inquiry
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
              Learn <em className="italic" style={{ color: "var(--v2-burgundy)" }}>more.</em>
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
              Interested in JETS for yourself or your son? Tell us a little
              about what you&apos;re looking for, and our admissions team will
              be in touch.
            </div>
          </FadeIn>
          <FadeIn delay={0.3}>
            <div className="v2-ornament mt-12" style={{ color: "var(--v2-gold)" }}>
              <span>✦</span>
            </div>
          </FadeIn>
        </div>
      </section>

      <EditorialSection kicker="Tell Us About Yourself">
        <div className="max-w-2xl mx-auto">
          <FadeIn>
            <InquiryForm />
          </FadeIn>
        </div>
      </EditorialSection>

      <V2Footer />
    </>
  );
}
