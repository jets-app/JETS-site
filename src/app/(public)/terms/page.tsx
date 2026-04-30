import { SiteNav } from "@/components/site/site-nav";
import { SiteFooter } from "@/components/site/site-footer";

export const metadata = {
  title: "Terms of Service",
  description:
    "Terms governing the use of JETS School's websites, admissions portal, and SMS/email notifications.",
};

const EFFECTIVE_DATE = "April 29, 2026";

export default function TermsPage() {
  return (
    <>
      <SiteNav />

      <section className="pt-28 lg:pt-36 pb-16 lg:pb-20">
        <div className="max-w-3xl mx-auto px-6 lg:px-10">
          <p className="text-sm font-semibold uppercase tracking-wider text-[var(--jet-primary)] mb-4">
            Terms of Service
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[var(--jet-text)]">
            Terms of Service
          </h1>
          <p className="mt-4 text-sm text-[var(--jet-text-muted)]">
            Effective {EFFECTIVE_DATE}
          </p>

          <div className="prose prose-lg max-w-none mt-12 text-[var(--jet-text)]">
            <h2>1. Agreement</h2>
            <p>
              Welcome to JETS School. These Terms of Service (&ldquo;Terms&rdquo;)
              govern your access to and use of the JETS School websites at{" "}
              <a href="https://www.jetscollege.org">jetscollege.org</a> and{" "}
              <a href="https://app.jetscollege.org">app.jetscollege.org</a> (the
              &ldquo;Sites&rdquo;), including the admissions portal, parent portal,
              document signing flows, and SMS / email notifications. By using the
              Sites or creating an account, you agree to these Terms. If you do not
              agree, please do not use the Sites.
            </p>

            <h2>2. About JETS</h2>
            <p>
              The Sites are operated by Jewish Educational Trade School, a 501(c)(3)
              nonprofit educational institution located at 16601 Rinaldi Street,
              Granada Hills, California 91344.
            </p>

            <h2>3. Eligibility</h2>
            <p>
              To create an account on our admissions portal you must be at least 16
              years of age and a parent, legal guardian, or applicant authorized to
              submit information on behalf of the prospective student.
            </p>

            <h2>4. Your account</h2>
            <ul>
              <li>You are responsible for keeping your password confidential.</li>
              <li>You are responsible for all activity that occurs under your account.</li>
              <li>
                You agree to provide accurate, current, and complete information,
                and to update it as needed.
              </li>
              <li>
                Notify us immediately at{" "}
                <a href="mailto:info@jetsschool.org">info@jetsschool.org</a> if you
                suspect unauthorized access to your account.
              </li>
            </ul>

            <h2>5. SMS notifications (program details)</h2>
            <ul>
              <li>
                <strong>Program name:</strong> JETS School Admissions and Enrollment
                Notifications.
              </li>
              <li>
                <strong>Description:</strong> Transactional alerts about admissions
                status, interview scheduling, payment receipts, document signing,
                and enrollment milestones.
              </li>
              <li>
                <strong>Message and data rates:</strong> Standard message and data
                rates from your mobile carrier may apply.
              </li>
              <li>
                <strong>Message frequency:</strong> Variable. Most families receive
                fewer than 5 messages per month during admissions; lower frequency
                while enrolled.
              </li>
              <li>
                <strong>Support:</strong> Reply <strong>HELP</strong> to any message
                or contact{" "}
                <a href="mailto:info@jetsschool.org">info@jetsschool.org</a> /
                (818) 831-3000.
              </li>
              <li>
                <strong>Opt out:</strong> Reply <strong>STOP</strong> to any message
                to unsubscribe from non-essential SMS. Some essential communications
                (legal or tuition notices) may continue where required.
              </li>
            </ul>

            <h2>6. Acceptable use</h2>
            <p>You agree not to:</p>
            <ul>
              <li>Use the Sites for any unlawful purpose.</li>
              <li>Attempt to access another user&rsquo;s account or non-public areas of the Sites.</li>
              <li>Interfere with the security or proper functioning of the Sites.</li>
              <li>Submit false, misleading, or fraudulent information.</li>
              <li>Reverse engineer, scrape, or copy non-public data from the Sites.</li>
            </ul>

            <h2>7. Tuition and fees</h2>
            <p>
              All tuition, application fees, and other amounts owed to JETS are
              governed by the separate Tuition Contract you sign during enrollment.
              In case of conflict, the Tuition Contract controls. Online payment is
              processed by Stripe and subject to Stripe&rsquo;s terms.
            </p>

            <h2>8. Intellectual property</h2>
            <p>
              The Sites and all content (other than information you provide) are
              owned by JETS School or its licensors and protected by copyright and
              other laws. You may not copy, modify, or distribute Site content
              except as permitted by these Terms or with our written consent.
            </p>

            <h2>9. Privacy</h2>
            <p>
              Our handling of personal information is described in our{" "}
              <a href="/privacy">Privacy Policy</a>. This Privacy Policy is
              incorporated into these Terms by reference.
            </p>

            <h2>10. Disclaimers</h2>
            <p>
              The Sites are provided &ldquo;as is&rdquo; and &ldquo;as
              available.&rdquo; To the maximum extent permitted by law, we disclaim
              all warranties, express or implied, including warranties of
              merchantability, fitness for a particular purpose, and
              non-infringement. We do not guarantee uninterrupted or error-free
              operation.
            </p>

            <h2>11. Limitation of liability</h2>
            <p>
              To the maximum extent permitted by law, JETS School and its
              directors, employees, and agents will not be liable for any indirect,
              incidental, special, consequential, or punitive damages arising from
              your use of the Sites. Our total liability for any claim relating to
              the Sites will not exceed $100.
            </p>

            <h2>12. Dispute resolution (Bais Din)</h2>
            <p>
              Any dispute arising out of or relating to these Terms, including
              claims of negligence, will be settled exclusively by binding
              arbitration before a Bais Din applying Jewish law. This serves as
              binding arbitration under California law. By agreeing to these
              Terms, you give up the right to a court trial, jury trial, and the
              right to appeal an arbitration award. Each party has the right to
              consult independent counsel before agreeing.
            </p>

            <h2>13. Governing law</h2>
            <p>
              These Terms are governed by California law to the extent not
              preempted by the binding-arbitration clause above.
            </p>

            <h2>14. Changes</h2>
            <p>
              We may update these Terms from time to time. The &ldquo;Effective&rdquo;
              date at the top reflects the most recent change. Material changes
              will be posted on the Sites and, where appropriate, communicated by
              email. Continued use of the Sites after a change means you accept
              the updated Terms.
            </p>

            <h2>15. Contact</h2>
            <p>
              Questions about these Terms? Contact us at{" "}
              <a href="mailto:info@jetsschool.org">info@jetsschool.org</a> or
              (818) 831-3000.
            </p>
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
