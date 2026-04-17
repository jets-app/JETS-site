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
  Kanban,
  BarChart3,
  Bell,
  UserPlus,
  Briefcase,
  Handshake,
  Calendar,
  ChevronDown,
  ChevronRight,
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
    { label: "Leads", href: "/admin/leads", icon: UserPlus },
    { label: "Applications", href: "/admin/applications", icon: FileText },
    { label: "Pipeline Board", href: "/admin/applications/pipeline", icon: Kanban },
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
    { label: "Tuition & Billing", href: "/admin/billing", icon: CreditCard },
    { label: "Student Records", href: "/admin/records", icon: ClipboardList },
  ],
};

const alumniSubItems = [
  { label: "Directory", href: "/admin/alumni", icon: Users },
  { label: "Job Board", href: "/admin/alumni/jobs", icon: Briefcase },
  { label: "Mentorship", href: "/admin/alumni/mentors", icon: Handshake },
  { label: "Events", href: "/admin/alumni/events", icon: Calendar },
];

const sharedNav = {
  label: "General",
  items: [
    { label: "Reports", href: "/admin/reports", icon: BarChart3 },
    { label: "Notifications", href: "/admin/notifications", icon: Bell },
    { label: "Messages", href: "/admin/messages", icon: MessageSquare },
    { label: "Alumni", href: "/admin/alumni", icon: Users, hasChildren: true },
    { label: "Donors", href: "/admin/donors", icon: Heart },
    { label: "Settings", href: "/admin/settings", icon: Settings },
  ],
};

export function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [alumniExpanded, setAlumniExpanded] = useState(
    () => typeof window !== "undefined" && window.location.pathname.startsWith("/admin/alumni")
  );
  const mode = detectMode(pathname);

  const activeNav = mode === "admissions" ? admissionsNav : schoolYearNav;

  return (
    <>
      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 flex items-center px-4"
        style={{ background: "#0f0f12", borderBottom: "1px solid rgba(255,255,255,0.08)" }}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-white/80 hover:text-white hover:bg-white/10"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
        <div className="flex items-center gap-2.5 ml-3">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "#A30018" }}
          >
            <Shield className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="font-semibold text-sm text-white tracking-tight">JETS Admin</span>
        </div>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "admin-sidebar fixed top-0 left-0 z-40 h-screen w-[264px] transition-transform duration-300 ease-out flex flex-col",
          "lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="h-14 lg:h-[60px] flex items-center px-5 shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "#A30018" }}
            >
              <Shield className="h-4 w-4 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-[13px] font-bold text-white leading-none tracking-tight">
                JETS School
              </span>
              <span className="text-[10px] text-white/35 leading-none mt-1 font-medium">
                Administration
              </span>
            </div>
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="px-3 pt-4 pb-2 shrink-0">
          <Link
            href={mode === "admissions" ? "/admin/students" : "/admin/admissions"}
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 hover:bg-white/5 group"
          >
            <div className="relative w-9 h-5 rounded-full transition-colors duration-300"
              style={{ background: mode === "admissions" ? "#A30018" : "#059669" }}
            >
              <div
                className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300"
                style={{ left: mode === "admissions" ? "2px" : "18px" }}
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-white/90 leading-none">
                {mode === "admissions" ? "Admissions" : "School Year"}
              </span>
              <span className="text-[10px] text-white/35 leading-none mt-1">
                Switch to {mode === "admissions" ? "School Year" : "Admissions"}
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6 admin-sidebar-scroll">
          {/* Mode-specific section */}
          <div>
            <p className={cn(
              "admin-section-label px-3 mb-1.5",
              mode === "admissions" ? "!text-[#e8687a]" : "!text-emerald-400"
            )}>
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
                      "admin-nav-item group",
                      isActive && "admin-nav-item-active",
                      isActive && mode === "admissions" && "admin-nav-item-active-admissions",
                      isActive && mode === "school_year" && "admin-nav-item-active-school",
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0 transition-colors duration-200" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Shared section */}
          <div>
            <p className="admin-section-label px-3 mb-1.5">
              {sharedNav.label}
            </p>
            <div className="space-y-0.5">
              {sharedNav.items.map((item) => {
                const isAlumni = "hasChildren" in item && item.hasChildren;
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(item.href + "/");

                if (isAlumni) {
                  const isAlumniSection = pathname.startsWith("/admin/alumni");
                  return (
                    <div key={item.href}>
                      <button
                        onClick={() => setAlumniExpanded(!alumniExpanded)}
                        className={cn(
                          "admin-nav-item group w-full",
                          isAlumniSection && "admin-nav-item-active admin-nav-item-active-general",
                        )}
                      >
                        <item.icon className="h-4 w-4 shrink-0 transition-colors duration-200" />
                        <span className="flex-1 text-left">{item.label}</span>
                        {alumniExpanded ? (
                          <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-50" />
                        ) : (
                          <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-50" />
                        )}
                      </button>
                      {alumniExpanded && (
                        <div className="ml-4 mt-0.5 space-y-0.5 border-l border-white/10 pl-3">
                          {alumniSubItems.map((sub) => {
                            const subActive = pathname === sub.href ||
                              (sub.href !== "/admin/alumni" && pathname.startsWith(sub.href + "/"));
                            const subExactActive = sub.href === "/admin/alumni"
                              ? pathname === "/admin/alumni"
                              : pathname.startsWith(sub.href);
                            return (
                              <Link
                                key={sub.href}
                                href={sub.href}
                                onClick={() => setMobileOpen(false)}
                                className={cn(
                                  "admin-nav-item group text-[12px]",
                                  subExactActive && "admin-nav-item-active admin-nav-item-active-general",
                                )}
                              >
                                <sub.icon className="h-3.5 w-3.5 shrink-0 transition-colors duration-200" />
                                <span>{sub.label}</span>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "admin-nav-item group",
                      isActive && "admin-nav-item-active admin-nav-item-active-general",
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0 transition-colors duration-200" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Sign out */}
        <div className="px-3 pb-4 pt-3 shrink-0"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          <form action="/api/auth/signout" method="POST">
            <button
              type="submit"
              className="admin-nav-item w-full !text-white/40 hover:!text-red-400"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              <span>Sign Out</span>
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
