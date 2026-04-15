"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  FileSignature,
  CreditCard,
  MessageSquare,
  GraduationCap,
  Users,
  Heart,
  Settings,
  LogOut,
  Menu,
  X,
  Shield,
  UserCircle,
  Mail,
  ClipboardList,
  HomeIcon,
  School,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

type Mode = "admissions" | "school_year";

const admissionsPaths = [
  "/admin/admissions",
  "/admin/applications",
  "/admin/scholarships",
  "/admin/documents",
  "/admin/recommendations",
];

const schoolYearPaths = [
  "/admin/students",
  "/admin/families",
  "/admin/billing",
  "/admin/records",
];

function detectMode(pathname: string): Mode {
  for (const p of schoolYearPaths) {
    if (pathname === p || pathname.startsWith(p + "/")) return "school_year";
  }
  for (const p of admissionsPaths) {
    if (pathname === p || pathname.startsWith(p + "/")) return "admissions";
  }
  return "admissions";
}

const admissionsNav = {
  label: "Admissions",
  accentClass: "text-primary",
  items: [
    { label: "Dashboard", href: "/admin/admissions", icon: LayoutDashboard },
    { label: "Applications", href: "/admin/applications", icon: FileText },
    { label: "Scholarships", href: "/admin/scholarships", icon: Sparkles },
    {
      label: "Enrollment Documents",
      href: "/admin/documents",
      icon: FileSignature,
    },
    {
      label: "Recommendations",
      href: "/admin/recommendations",
      icon: Mail,
    },
  ],
};

const schoolYearNav = {
  label: "Current School Year",
  accentClass: "text-emerald-600 dark:text-emerald-400",
  items: [
    { label: "Dashboard", href: "/admin/students", icon: LayoutDashboard },
    { label: "Students", href: "/admin/students/list", icon: GraduationCap },
    { label: "Families", href: "/admin/families", icon: HomeIcon },
    { label: "Tuition & Billing", href: "/admin/billing", icon: CreditCard },
    { label: "Student Records", href: "/admin/records", icon: ClipboardList },
  ],
};

const sharedNav = {
  label: "General",
  items: [
    { label: "Messages", href: "/admin/messages", icon: MessageSquare },
    { label: "Alumni", href: "/admin/alumni", icon: Users },
    { label: "Donors", href: "/admin/donors", icon: Heart },
    { label: "Settings", href: "/admin/settings", icon: Settings },
  ],
};

export function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const mode = detectMode(pathname);

  const activeNav = mode === "admissions" ? admissionsNav : schoolYearNav;

  return (
    <>
      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-b h-14 flex items-center px-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
        <div className="flex items-center gap-2 ml-3">
          <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xs">J</span>
          </div>
          <span className="font-semibold text-sm">JETS Admin</span>
        </div>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-screen w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-transform duration-300 flex flex-col",
          "lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="h-14 lg:h-16 flex items-center px-5 border-b border-sidebar-border shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center">
              <Shield className="h-4 w-4 text-sidebar-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-sidebar-foreground leading-none">
                JETS School
              </span>
              <span className="text-[10px] text-sidebar-foreground/50 leading-none mt-1">
                Administration
              </span>
            </div>
          </div>
        </div>

        {/* Mode Switcher */}
        <div className="px-3 pt-4 pb-2 shrink-0">
          <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-sidebar-foreground/40 mb-2">
            Mode
          </p>
          <div className="grid grid-cols-2 gap-1 rounded-lg bg-sidebar-accent/40 p-1">
            <Link
              href="/admin/admissions"
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center justify-center gap-1.5 rounded-md px-2 py-2 text-xs font-semibold transition-all",
                mode === "admissions"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-sidebar-foreground/60 hover:text-sidebar-foreground"
              )}
            >
              <FileText className="h-3.5 w-3.5" />
              Admissions
            </Link>
            <Link
              href="/admin/students"
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center justify-center gap-1.5 rounded-md px-2 py-2 text-xs font-semibold transition-all",
                mode === "school_year"
                  ? "bg-emerald-600 text-white shadow-sm dark:bg-emerald-500"
                  : "text-sidebar-foreground/60 hover:text-sidebar-foreground"
              )}
            >
              <School className="h-3.5 w-3.5" />
              School Year
            </Link>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {/* Mode-specific section */}
          <div>
            <p
              className={cn(
                "px-3 text-[10px] font-semibold uppercase tracking-[0.15em] mb-2",
                activeNav.accentClass
              )}
            >
              {activeNav.label}
            </p>
            <div className="space-y-0.5">
              {activeNav.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                      isActive
                        ? mode === "admissions"
                          ? "bg-primary/15 text-primary"
                          : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Shared section */}
          <div>
            <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-sidebar-foreground/40 mb-2">
              {sharedNav.label}
            </p>
            <div className="space-y-0.5">
              {sharedNav.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Sign out */}
        <div className="px-3 pb-4 border-t border-sidebar-border pt-4 shrink-0">
          <form action="/api/auth/signout" method="POST">
            <button
              type="submit"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-all duration-200 w-full"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              Sign Out
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
