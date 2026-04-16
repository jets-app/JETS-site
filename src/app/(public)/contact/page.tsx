import { SiteNav } from "@/components/site/site-nav";
import { SiteFooter } from "@/components/site/site-footer";
import { ContactForm } from "@/components/v2/contact-form";

export const metadata = {
  title: "Contact",
  description:
    "Get in touch with the Jewish Educational Trade School.",
};

export default function ContactPage() {
  return (
    <>
      <SiteNav />

      {/* Hero */}
      <section className="pt-28 lg:pt-36 pb-16 lg:pb-20">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-[var(--jet-primary)] mb-4">
            Contact Us
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[var(--jet-text)]">
            Get in Touch
          </h1>
          <p className="mt-4 text-lg text-[var(--jet-text-muted)] max-w-[540px] mx-auto">
            Questions about JETS? Want to visit the campus? We are here to help.
          </p>
        </div>
      </section>

      {/* Two columns */}
      <section className="pb-20 lg:pb-28">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
            {/* Left: Contact info */}
            <div className="space-y-10">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--jet-text-muted)] mb-4">
                  Address
                </h3>
                <p className="text-xl font-semibold text-[var(--jet-text)] leading-relaxed">
                  16601 Rinaldi Street
                  <br />
                  Granada Hills, CA 91344
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--jet-text-muted)] mb-4">
                  Phone
                </h3>
                <a
                  href="tel:+18188313000"
                  className="text-xl font-semibold text-[var(--jet-primary)] hover:underline"
                >
                  (818) 831-3000
                </a>
              </div>

              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--jet-text-muted)] mb-4">
                  Email
                </h3>
                <a
                  href="mailto:admissions@jets-school.org"
                  className="text-xl font-semibold text-[var(--jet-primary)] hover:underline"
                >
                  admissions@jets-school.org
                </a>
              </div>

              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--jet-text-muted)] mb-4">
                  Hours
                </h3>
                <div className="space-y-2 text-[var(--jet-text)]">
                  {[
                    ["Sunday", "9:00 AM - 3:00 PM"],
                    ["Monday - Thursday", "8:00 AM - 6:00 PM"],
                    ["Friday", "8:00 AM - 1:00 PM"],
                    ["Shabbat", "Closed"],
                  ].map(([day, hours]) => (
                    <div
                      key={day}
                      className="flex justify-between py-2 border-b border-[var(--jet-border)]"
                    >
                      <span className="text-[var(--jet-text-muted)]">
                        {day}
                      </span>
                      <span className="font-medium">{hours}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Contact form */}
            <div>
              <div className="bg-[var(--jet-bg-subtle)] rounded-2xl p-8 lg:p-10">
                <h3 className="text-2xl font-bold text-[var(--jet-text)] mb-2">
                  Send us a message
                </h3>
                <p className="text-[var(--jet-text-muted)] mb-8">
                  We read every message and typically respond within 1-2
                  business days.
                </p>
                <ContactForm />
              </div>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
