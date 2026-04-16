import Link from "next/link";

const schoolLinks = [
  { href: "/about", label: "About JETS" },
  { href: "/faculty", label: "Faculty" },
  { href: "/contact", label: "Contact" },
  { href: "/inquire", label: "Apply Now" },
];

const programLinks = [
  { href: "/programs", label: "Judaic Studies" },
  { href: "/programs", label: "Applied Technology" },
  { href: "/programs", label: "Skilled Trades" },
  { href: "/programs", label: "Business & Enterprise" },
];

export function SiteFooter() {
  return (
    <footer className="bg-[#0a0a0a] text-white">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-16 lg:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* School */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white/60 mb-5">
              School
            </h3>
            <ul className="space-y-3">
              {schoolLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/70 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Programs */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white/60 mb-5">
              Programs
            </h3>
            <ul className="space-y-3">
              {programLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/70 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white/60 mb-5">
              Connect
            </h3>
            <ul className="space-y-3 text-sm text-white/70">
              <li>16601 Rinaldi Street</li>
              <li>Granada Hills, CA 91344</li>
              <li>
                <a href="tel:+18188313000" className="hover:text-white transition-colors">
                  (818) 831-3000
                </a>
              </li>
              <li>
                <a
                  href="mailto:admissions@jets-school.org"
                  className="hover:text-white transition-colors"
                >
                  admissions@jets-school.org
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white/60 mb-5">
              Legal
            </h3>
            <ul className="space-y-3 text-sm text-white/70">
              <li>Privacy Policy</li>
              <li>Terms of Service</li>
              <li>Non-Discrimination Policy</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold tracking-tight">JETS</span>
            <span className="text-sm font-light text-white/50">School</span>
          </div>
          <p className="text-xs text-white/40">
            &copy; {new Date().getFullYear()} Jewish Educational Trade School. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
