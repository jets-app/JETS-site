import Link from "next/link";
import { MapPin, Phone, Mail } from "lucide-react";

export function PublicFooter() {
  return (
    <footer className="bg-foreground text-background/70 pt-16 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-background/10">
          {/* Brand column */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">
                  J
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold text-background leading-none">
                  JETS School
                </span>
                <span className="text-[10px] uppercase tracking-[0.15em] text-background/40 leading-none mt-0.5">
                  Est. 2004
                </span>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-background/50 max-w-xs">
              Jewish Educational Trade School. Empowering young men through
              the timeless union of Torah learning and vocational mastery.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-background text-sm uppercase tracking-wider mb-5">
              Quick Links
            </h4>
            <div className="space-y-3 text-sm">
              {[
                { label: "About Us", href: "/about" },
                { label: "Programs", href: "/programs" },
                { label: "Faculty & Staff", href: "/faculty" },
                { label: "Apply Now", href: "/register" },
                { label: "Student Portal", href: "/login" },
              ].map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="block text-background/50 hover:text-background transition-colors duration-200"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Programs */}
          <div>
            <h4 className="font-semibold text-background text-sm uppercase tracking-wider mb-5">
              Programs
            </h4>
            <div className="space-y-3 text-sm">
              {[
                "Judaic Studies",
                "Professional Tracks",
                "High School & GED",
                "Year One Foundations",
                "Extracurricular",
              ].map((program) => (
                <span key={program} className="block text-background/50">
                  {program}
                </span>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-background text-sm uppercase tracking-wider mb-5">
              Contact Us
            </h4>
            <div className="space-y-4 text-sm">
              <a
                href="https://maps.google.com/?q=16601+Rinaldi+Street+Granada+Hills+CA+91344"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 text-background/50 hover:text-background transition-colors duration-200"
              >
                <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                <span>
                  16601 Rinaldi Street
                  <br />
                  Granada Hills, CA 91344
                </span>
              </a>
              <a
                href="tel:+18188313000"
                className="flex items-center gap-3 text-background/50 hover:text-background transition-colors duration-200"
              >
                <Phone className="h-4 w-4 shrink-0" />
                <span>(818) 831-3000</span>
              </a>
              <a
                href="mailto:info@jetsschool.org"
                className="flex items-center gap-3 text-background/50 hover:text-background transition-colors duration-200"
              >
                <Mail className="h-4 w-4 shrink-0" />
                <span>info@jetsschool.org</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8 text-xs text-background/30">
          <span>
            &copy; {new Date().getFullYear()} JETS Synagogue (DBA Jewish
            Educational Trade School). All rights reserved.
          </span>
          <div className="flex items-center gap-6">
            <Link
              href="/privacy"
              className="hover:text-background/60 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="hover:text-background/60 transition-colors"
            >
              Terms of Use
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
