"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { label: "About", href: "/about" },
  { label: "Programs", href: "/programs" },
  { label: "Faculty", href: "/faculty" },
  { label: "Contact", href: "/contact" },
];

export function PublicNav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Thin top announcement bar */}
      <div className="relative z-[60] bg-[#0a0608] text-white/70 text-[11px] tracking-[0.25em] uppercase">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="hidden sm:inline">
              Now Accepting Applications — 2026-2027
            </span>
            <span className="sm:hidden">Applications Open</span>
          </div>
          <div className="hidden md:flex items-center gap-5">
            <span>Torah V&apos;avodah</span>
            <span className="text-white/30">·</span>
            <a
              href="tel:+18188313000"
              className="hover:text-white transition-colors"
            >
              (818) 831-3000
            </a>
          </div>
        </div>
      </div>

      <motion.nav
        initial={false}
        animate={{
          backgroundColor: scrolled
            ? "rgba(10, 6, 8, 0.85)"
            : "rgba(10, 6, 8, 0.55)",
          borderColor: scrolled
            ? "rgba(255,255,255,0.08)"
            : "rgba(255,255,255,0.04)",
        }}
        transition={{ duration: 0.3 }}
        className="sticky top-0 z-50 backdrop-blur-2xl border-b"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-18">
            <Link href="/" className="flex items-center gap-3 group shrink-0">
              <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-br from-primary via-[#8a0014] to-[#6a0010] flex items-center justify-center shadow-lg shadow-primary/30 ring-1 ring-white/10">
                <span className="font-display text-white text-xl leading-none">
                  J
                </span>
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-[15px] font-semibold tracking-tight text-white">
                  JETS
                </span>
                <span className="font-serif italic text-[11px] text-white/50 mt-0.5">
                  est. Torah V&apos;avodah
                </span>
              </div>
            </Link>

            <div className="hidden lg:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
              {links.map((link) => {
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "relative px-4 py-2 text-sm font-medium transition-colors duration-200 rounded-full",
                      active
                        ? "text-white"
                        : "text-white/60 hover:text-white",
                    )}
                  >
                    {active && (
                      <motion.span
                        layoutId="nav-active"
                        className="absolute inset-0 bg-white/10 rounded-full ring-1 ring-white/15"
                        transition={{
                          type: "spring",
                          stiffness: 380,
                          damping: 30,
                        }}
                      />
                    )}
                    <span className="relative">{link.label}</span>
                  </Link>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="hidden sm:inline-flex text-sm text-white/60 hover:text-white px-3 py-2 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="group relative inline-flex items-center gap-1.5 h-10 px-5 rounded-full bg-white text-[#0a0608] text-sm font-semibold hover:bg-white/90 transition-all duration-300 shadow-lg shadow-black/40"
              >
                Apply Now
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
              <button
                onClick={() => setOpen((o) => !o)}
                className="lg:hidden ml-1 w-10 h-10 inline-flex items-center justify-center rounded-full text-white hover:bg-white/10 transition"
                aria-label="Menu"
              >
                {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="lg:hidden overflow-hidden bg-[#0a0608]/95 backdrop-blur-xl border-t border-white/5"
            >
              <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col gap-1">
                {links.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link
                      href={link.href}
                      className="flex items-center justify-between py-4 text-2xl font-display text-white border-b border-white/5"
                    >
                      <span>{link.label}</span>
                      <ArrowUpRight className="h-5 w-5 text-white/40" />
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
}
