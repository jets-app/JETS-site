"use client";

import Link from "next/link";
import { useState } from "react";

const navLinks = [
  { href: "/v2", label: "Home" },
  { href: "/v2/about", label: "About" },
  { href: "/v2/programs", label: "Programs" },
  { href: "/v2/faculty", label: "Faculty" },
  { href: "/v2/contact", label: "Contact" },
];

export function V2Nav() {
  const [open, setOpen] = useState(false);
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <header
      className="relative z-40"
      style={{ background: "var(--v2-parchment)" }}
    >
      {/* Top meta strip */}
      <div
        className="border-b v2-rule"
        style={{ borderColor: "var(--v2-rule)" }}
      >
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-2 flex items-center justify-between text-[10.5px] v2-smallcaps"
             style={{ color: "var(--v2-ink-muted)" }}>
          <span className="hidden sm:block">Vol. XVI · No. 1</span>
          <span className="hidden md:block tracking-[0.22em]">{today}</span>
          <span>Granada Hills, California</span>
        </div>
      </div>

      {/* Masthead */}
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10 pt-8 pb-6 text-center">
        <div className="v2-byline mb-2" style={{ color: "var(--v2-ink-faint)" }}>
          Jewish Educational Trade School
        </div>
        <Link
          href="/v2"
          className="v2-display inline-block"
          style={{
            fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
            color: "var(--v2-ink)",
            letterSpacing: "-0.02em",
          }}
        >
          The <em className="italic" style={{ color: "var(--v2-burgundy)" }}>JETS</em> Review
        </Link>
        <div
          className="mt-3 v2-smallcaps"
          style={{ color: "var(--v2-ink-muted)", fontSize: "10.5px" }}
        >
          Torah V&apos;Avodah &nbsp;·&nbsp; Since 2008
        </div>
      </div>

      {/* Nav rule with links */}
      <div
        className="v2-double-rule"
        style={{ borderColor: "var(--v2-rule)" }}
      >
        <nav className="max-w-[1280px] mx-auto px-6 lg:px-10 py-3 flex items-center justify-between">
          <ul className="hidden md:flex items-center gap-8 v2-smallcaps" style={{ color: "var(--v2-ink)" }}>
            {navLinks.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="v2-link-underline hover:text-[color:var(--v2-burgundy)] transition-colors"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <button
            aria-label="Menu"
            className="md:hidden v2-smallcaps"
            onClick={() => setOpen(!open)}
            style={{ color: "var(--v2-ink)" }}
          >
            {open ? "Close" : "Menu"}
          </button>
          <Link
            href="/register"
            className="v2-smallcaps hidden md:inline-flex items-center gap-2 hover:opacity-70 transition-opacity"
            style={{ color: "var(--v2-burgundy)" }}
          >
            Apply &nbsp;→
          </Link>
        </nav>
        {open && (
          <div className="md:hidden border-t" style={{ borderColor: "var(--v2-rule)" }}>
            <ul className="px-6 py-4 space-y-3 v2-smallcaps">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} onClick={() => setOpen(false)} className="block py-1">
                    {l.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/register"
                  onClick={() => setOpen(false)}
                  className="block py-1"
                  style={{ color: "var(--v2-burgundy)" }}
                >
                  Apply →
                </Link>
              </li>
            </ul>
          </div>
        )}
      </div>
    </header>
  );
}
