import { SiteNav } from "@/components/site/site-nav";
import { SiteFooter } from "@/components/site/site-footer";

export const metadata = {
  title: "Privacy Policy",
  description:
    "How JETS School (Jewish Educational Trade School) collects, uses, and protects information from applicants, students, parents, and visitors.",
};

const EFFECTIVE_DATE = "April 29, 2026";

export default function PrivacyPolicyPage() {
  return (
    <>
      <SiteNav />

      <section className="pt-28 lg:pt-36 pb-16 lg:pb-20">
        <div className="max-w-3xl mx-auto px-6 lg:px-10">
          <p className="text-sm font-semibold uppercase tracking-wider text-[var(--jet-primary)] mb-4">
            Privacy Policy
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[var(--jet-text)]">
            How we handle your information
          </h1>
          <p className="mt-4 text-sm text-[var(--jet-text-muted)]">
            Effective {EFFECTIVE_DATE}
          </p>

          <div className="prose prose-lg max-w-none mt-12 text-[var(--jet-text)]">
            <h2>1. Who we are</h2>
            <p>
              Jewish Educational Trade School (&ldquo;JETS,&rdquo; &ldquo;we,&rdquo; or
              &ldquo;us&rdquo;) is a 501(c)(3) nonprofit educational institution located
              at 16601 Rinaldi Street, Granada Hills, California 91344. This Privacy
              Policy describes how we collect, use, disclose, and protect information
              we receive from visitors to our websites at{" "}
              <a href="https://www.jetscollege.org">jetscollege.org</a> and{" "}
              <a href="https://app.jetscollege.org">app.jetscollege.org</a>, applicants
              for admission, current students, parents and guardians, donors, and
              other members of the JETS community.
            </p>

            <h2>2. Information we collect</h2>
            <h3>From applicants and parents during admissions</h3>
            <ul>
              <li>
                Identity and contact information: name, date of birth, mailing
                address, email address, phone number.
              </li>
              <li>
                Educational background: prior schools, grade level, recommendations,
                and academic records you provide.
              </li>
              <li>
                Family information voluntarily shared as part of the application,
                including parent/guardian names, addresses, and contact details.
              </li>
            </ul>

            <h3>From enrolled students and families</h3>
            <ul>
              <li>
                Health and emergency information needed to safely care for the
                student (allergies, conditions, medications, insurance, emergency
                contacts).
              </li>
              <li>
                Tuition payment information processed through our payment provider
                (Stripe). We never store full credit card numbers on our servers.
              </li>
              <li>Documents you sign electronically through our portal.</li>
            </ul>

            <h3>Automatically when you use our websites</h3>
            <ul>
              <li>
                Standard log information: IP address (truncated to /24 prefix for
                privacy), browser, operating system, pages visited, and the date and
                time of access.
              </li>
              <li>
                Cookies and similar technologies used to keep you signed in and to
                remember your preferences. We do not use third-party advertising
                cookies.
              </li>
            </ul>

            <h2>3. How we use your information</h2>
            <p>We use the information we collect only for legitimate educational and operational purposes, including:</p>
            <ul>
              <li>Reviewing and processing admissions applications.</li>
              <li>Communicating with applicants and families about admissions status, interview scheduling, enrollment documents, and milestones.</li>
              <li>Providing the educational program and caring for enrolled students.</li>
              <li>Processing tuition payments and issuing receipts.</li>
              <li>Maintaining safety, security, and accountability of our community.</li>
              <li>Complying with applicable laws and responding to legal process.</li>
            </ul>
            <p>
              We do <strong>not</strong> sell or rent personal information. We do
              <strong> not</strong> use your information for third-party marketing or
              advertising.
            </p>

            <h2>4. SMS and email notifications</h2>
            <p>
              When you provide a phone number or email address on our application
              form, you consent to receive transactional notifications from JETS
              School about your application, interview, enrollment, and tuition. SMS
              messages are sent through our service provider Twilio. Standard message
              and data rates may apply.
            </p>
            <p>
              You can opt out of SMS at any time by replying <strong>STOP</strong> to
              any message. You can opt out of non-essential email by following the
              unsubscribe link in any email or by contacting our office. Note that
              certain communications (such as legal or tuition notices) may continue
              even after opt-out where required.
            </p>

            <h2>5. Who we share information with</h2>
            <p>
              We share your information only with parties who help us operate the
              school, and only to the extent they need it:
            </p>
            <ul>
              <li>
                <strong>Service providers</strong> like our hosting provider
                (Vercel), database (Neon), email provider (Resend), SMS provider
                (Twilio), payment processor (Stripe), video conferencing (Zoom), and
                error monitoring (Sentry). Each is bound by confidentiality
                obligations.
              </li>
              <li>
                <strong>Other JETS staff</strong> who need access to do their jobs
                (admissions, principal review, office, faculty, accounting).
              </li>
              <li>
                <strong>Government agencies</strong> when legally required (such as
                in response to a subpoena or court order).
              </li>
              <li>
                <strong>Successor entities</strong> in the unlikely event of a
                merger, reorganization, or acquisition.
              </li>
            </ul>
            <p>
              We do not share information with third-party advertisers or data
              brokers.
            </p>

            <h2>6. How we protect your information</h2>
            <ul>
              <li>All web traffic is encrypted in transit (HTTPS / TLS).</li>
              <li>Passwords are hashed using bcrypt; we never store plain text passwords.</li>
              <li>
                Sensitive financial information (credit card numbers) is handled by
                Stripe and never touches our servers.
              </li>
              <li>
                Access to administrative systems is restricted by role-based
                permissions, and we offer two-factor authentication for staff.
              </li>
              <li>We log every administrative action for accountability.</li>
            </ul>

            <h2>7. How long we keep information</h2>
            <p>
              We retain admissions applications, enrollment records, and academic
              records for as long as a student is enrolled, plus the period required
              by California education law for graduates. Other records are kept for
              the period needed to fulfill the purpose for which we collected them
              and to comply with legal obligations. You may request earlier deletion
              of information that is not subject to a legal retention requirement
              (see Section 9).
            </p>

            <h2>8. Children&rsquo;s privacy</h2>
            <p>
              JETS is a postsecondary institution and our admissions portal is
              intended to be used by parents/guardians or students at least 16 years
              old. We do not knowingly collect personal information from children
              under 13. If you believe a child under 13 has submitted information,
              please contact us and we will delete it.
            </p>

            <h2>9. Your rights and choices</h2>
            <p>
              California residents and others may have the right to:
            </p>
            <ul>
              <li>Know what personal information we have collected about them.</li>
              <li>Request a copy of that information (a downloadable export is available from your portal account settings).</li>
              <li>Request correction of inaccurate information.</li>
              <li>Request deletion of information that is not subject to a legal retention requirement.</li>
              <li>Opt out of SMS or email notifications.</li>
            </ul>
            <p>
              To exercise these rights, contact us at{" "}
              <a href="mailto:info@jetsschool.org">info@jetsschool.org</a>.
            </p>

            <h2>10. Cookies</h2>
            <p>
              Our portal uses essential cookies (for authentication and session
              management) and a small number of preference cookies. We do not use
              third-party advertising or behavioral tracking cookies. You can clear
              cookies in your browser at any time, but doing so will sign you out
              of the portal.
            </p>

            <h2>11. Changes to this policy</h2>
            <p>
              We may update this Privacy Policy from time to time. The
              &ldquo;Effective&rdquo; date at the top reflects the most recent change.
              For material changes, we will post a notice on our website and, where
              appropriate, notify users by email.
            </p>

            <h2>12. Contact us</h2>
            <p>
              Questions about this Privacy Policy or your information? Contact:
            </p>
            <p>
              <strong>JETS School</strong>
              <br />
              16601 Rinaldi Street
              <br />
              Granada Hills, CA 91344
              <br />
              <a href="mailto:info@jetsschool.org">info@jetsschool.org</a>
              <br />
              (818) 831-3000
            </p>
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
