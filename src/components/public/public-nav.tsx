import Link from "next/link";
import { LinkButton } from "@/components/shared/link-button";

export function PublicNav() {
  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-9 h-9 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-md shadow-primary/20 group-hover:shadow-lg group-hover:shadow-primary/30 transition-all duration-300">
              <span className="text-primary-foreground font-bold text-sm tracking-tight">
                J
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight leading-none">
                JETS
              </span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground leading-none mt-0.5">
                Torah V&apos;avodah
              </span>
            </div>
          </Link>
          <div className="hidden md:flex items-center gap-1">
            {[
              { label: "About", href: "/about" },
              { label: "Programs", href: "/programs" },
              { label: "Faculty", href: "/faculty" },
              { label: "Contact", href: "/contact" },
            ].map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-foreground px-3 py-2 rounded-lg hover:bg-muted/50 transition-all duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <LinkButton variant="ghost" size="sm" href="/login">
              Sign In
            </LinkButton>
            <LinkButton
              size="sm"
              href="/register"
              className="shadow-md shadow-primary/20"
            >
              Apply Now
            </LinkButton>
          </div>
        </div>
      </div>
    </nav>
  );
}
