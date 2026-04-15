import Link from "next/link";
import { MapPin, Phone, Mail, ArrowUpRight } from "lucide-react";

export function PublicFooter() {
  return (
    <footer className="relative mt-auto bg-[#0a0608] text-white overflow-hidden noise">
      {/* Gradient mesh accent */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[140px] -translate-x-1/3 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#6a0010]/30 rounded-full blur-[120px] translate-x-1/4 translate-y-1/3" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-10">
        {/* Big CTA block */}
        <div className="grid lg:grid-cols-12 gap-10 pb-20 border-b border-white/10">
          <div className="lg:col-span-7">
            <div className="text-xs uppercase tracking-[0.3em] text-amber-300/80 mb-6 flex items-center gap-3">
              <span className="inline-block w-8 h-px bg-amber-300/60" />
              A new chapter begins
            </div>
            <h2 className="font-display text-5xl sm:text-6xl lg:text-7xl xl:text-8xl leading-[0.95] mb-8">
              Build a life of{" "}
              <em className="font-serif italic text-amber-200/90">purpose</em>,{" "}
              <em className="font-serif italic text-amber-200/90">skill</em>, &amp;{" "}
              <em className="font-serif italic text-amber-200/90">faith</em>.
            </h2>
            <Link
              href="/register"
              className="group inline-flex items-center gap-3 text-lg font-medium border-b border-white/30 pb-2 hover:border-white transition-colors"
            >
              Start your application
              <ArrowUpRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
            </Link>
          </div>

          <div className="lg:col-span-5 lg:border-l lg:border-white/10 lg:pl-10 space-y-6">
            <a
              href="https://maps.google.com/?q=16601+Rinaldi+Street+Granada+Hills+CA+91344"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-4 group"
            >
              <MapPin className="h-5 w-5 mt-1 shrink-0 text-amber-300/80" />
              <div>
                <div className="text-[11px] uppercase tracking-[0.25em] text-white/40 mb-1">
                  Campus
                </div>
                <div className="text-base group-hover:text-white text-white/80 transition">
                  16601 Rinaldi Street
                  <br />
                  Granada Hills, CA 91344
                </div>
              </div>
            </a>
            <a href="tel:+18188313000" className="flex items-start gap-4 group">
              <Phone className="h-5 w-5 mt-1 shrink-0 text-amber-300/80" />
              <div>
                <div className="text-[11px] uppercase tracking-[0.25em] text-white/40 mb-1">
                  Phone
                </div>
                <div className="text-base group-hover:text-white text-white/80 transition">
                  (818) 831-3000
                </div>
              </div>
            </a>
            <a
              href="mailto:info@jetsschool.org"
              className="flex items-start gap-4 group"
            >
              <Mail className="h-5 w-5 mt-1 shrink-0 text-amber-300/80" />
              <div>
                <div className="text-[11px] uppercase tracking-[0.25em] text-white/40 mb-1">
                  Email
                </div>
                <div className="text-base group-hover:text-white text-white/80 transition">
                  info@jetsschool.org
                </div>
              </div>
            </a>
          </div>
        </div>

        {/* Link columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 py-16">
          <div>
            <div className="text-[11px] uppercase tracking-[0.25em] text-white/40 mb-5">
              Explore
            </div>
            <div className="space-y-3">
              {[
                { label: "About", href: "/about" },
                { label: "Programs", href: "/programs" },
                { label: "Faculty", href: "/faculty" },
                { label: "Contact", href: "/contact" },
              ].map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="block text-white/70 hover:text-white transition"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <div className="text-[11px] uppercase tracking-[0.25em] text-white/40 mb-5">
              Programs
            </div>
            <div className="space-y-3 text-white/70">
              {[
                "Judaic Studies",
                "Professional Tracks",
                "High School & GED",
                "Year One",
                "Extracurricular",
              ].map((p) => (
                <div key={p}>{p}</div>
              ))}
            </div>
          </div>

          <div>
            <div className="text-[11px] uppercase tracking-[0.25em] text-white/40 mb-5">
              Apply
            </div>
            <div className="space-y-3">
              <Link
                href="/register"
                className="block text-white/70 hover:text-white transition"
              >
                Start Application
              </Link>
              <Link
                href="/login"
                className="block text-white/70 hover:text-white transition"
              >
                Student Portal
              </Link>
              <Link
                href="/contact"
                className="block text-white/70 hover:text-white transition"
              >
                Schedule a Visit
              </Link>
            </div>
          </div>

          <div>
            <div className="text-[11px] uppercase tracking-[0.25em] text-white/40 mb-5">
              Legal
            </div>
            <div className="space-y-3">
              <Link
                href="/privacy"
                className="block text-white/70 hover:text-white transition"
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className="block text-white/70 hover:text-white transition"
              >
                Terms
              </Link>
            </div>
          </div>
        </div>

        {/* Giant wordmark */}
        <div className="relative py-6 md:py-10 select-none overflow-hidden">
          <div className="font-display text-[22vw] md:text-[18vw] leading-[0.85] tracking-[-0.04em] text-transparent bg-clip-text bg-gradient-to-b from-white/10 via-white/5 to-transparent">
            JETS
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8 text-xs text-white/40 border-t border-white/10">
          <span>
            &copy; {new Date().getFullYear()} JETS Synagogue (DBA Jewish
            Educational Trade School). All rights reserved.
          </span>
          <span className="italic font-serif text-white/60">
            Teach a man to fish and you have fed him for a lifetime.
          </span>
        </div>
      </div>
    </footer>
  );
}
