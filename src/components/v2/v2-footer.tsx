import Link from "next/link";

export function V2Footer() {
  const year = new Date().getFullYear();
  return (
    <footer
      className="mt-24"
      style={{
        background: "var(--v2-parchment-deep)",
        color: "var(--v2-ink)",
      }}
    >
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10 pt-16 pb-10">
        <div className="v2-ornament mb-12">
          <span>✦ ✦ ✦</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 lg:gap-14">
          <div>
            <div className="v2-kicker mb-4" style={{ color: "var(--v2-burgundy)" }}>
              The School
            </div>
            <ul className="space-y-2 v2-editorial" style={{ fontSize: "15px" }}>
              <li><Link href="/about" className="v2-link-underline">About JETS</Link></li>
              <li><Link href="/faculty" className="v2-link-underline">Faculty</Link></li>
              <li><Link href="/programs" className="v2-link-underline">Programs</Link></li>
              <li><Link href="/contact" className="v2-link-underline">Contact</Link></li>
            </ul>
          </div>

          <div>
            <div className="v2-kicker mb-4" style={{ color: "var(--v2-burgundy)" }}>
              Admissions
            </div>
            <ul className="space-y-2 v2-editorial" style={{ fontSize: "15px" }}>
              <li><Link href="/register" className="v2-link-underline">Apply</Link></li>
              <li><Link href="/contact" className="v2-link-underline">Visit Campus</Link></li>
              <li><Link href="/login" className="v2-link-underline">Student Portal</Link></li>
            </ul>
          </div>

          <div>
            <div className="v2-kicker mb-4" style={{ color: "var(--v2-burgundy)" }}>
              Correspondence
            </div>
            <address className="not-italic v2-editorial" style={{ fontSize: "15px", lineHeight: 1.7 }}>
              16601 Rinaldi Street<br />
              Granada Hills, CA 91344<br />
              (818) 831-3000
            </address>
          </div>

          <div>
            <div className="v2-kicker mb-4" style={{ color: "var(--v2-burgundy)" }}>
              Colophon
            </div>
            <p className="v2-editorial" style={{ fontSize: "14px", lineHeight: 1.6, color: "var(--v2-ink-muted)" }}>
              Set in <em>EB Garamond</em> &amp; <em>Playfair Display</em>. Published at the foothills of the San Gabriel Valley.
            </p>
          </div>
        </div>

        <div className="mt-16 pt-6 border-t flex flex-col md:flex-row justify-between gap-3 v2-smallcaps" style={{ borderColor: "var(--v2-rule)", color: "var(--v2-ink-muted)", fontSize: "10.5px" }}>
          <span>© {year} Jewish Educational Trade School · All rights reserved</span>
          <span className="italic v2-editorial" style={{ letterSpacing: 0, textTransform: "none", fontSize: "13px" }}>
            Torah V&apos;Avodah
          </span>
          <span>Printed on the web · Granada Hills</span>
        </div>
      </div>
    </footer>
  );
}
