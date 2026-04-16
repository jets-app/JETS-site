import { SiteNav } from "@/components/site/site-nav";
import { SiteFooter } from "@/components/site/site-footer";
import { InquiryForm } from "@/components/v2/inquiry-form";

export const metadata = {
  title: "Apply",
  description:
    "Request information about admissions to the Jewish Educational Trade School.",
};

export default function InquirePage() {
  return (
    <>
      <SiteNav />

      {/* Hero */}
      <section className="pt-28 lg:pt-36 pb-16 lg:pb-20">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-[var(--jet-primary)] mb-4">
            Admissions
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[var(--jet-text)]">
            Interested in JETS?
          </h1>
          <p className="mt-4 text-lg text-[var(--jet-text-muted)] max-w-[540px] mx-auto">
            Whether for yourself or your son, fill out this short form and our
            admissions team will be in touch.
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="pb-20 lg:pb-28">
        <div className="max-w-2xl mx-auto px-6 lg:px-10">
          <div className="bg-[var(--jet-bg-subtle)] rounded-2xl p-8 lg:p-10">
            <InquiryForm />
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
