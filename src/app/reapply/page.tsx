import Link from "next/link";
import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import { GraduationCap, LogIn, UserPlus, ArrowRight } from "lucide-react";
import { setReapplyIntent } from "@/lib/reapply-intent";

export const metadata = {
  title: "Reapplication — JETS School",
};

export default async function ReapplyLandingPage() {
  // Mark that this parent wants the reapply path. Survives the register/login
  // detour so they always land on the returning-student form, not a fresh app.
  await setReapplyIntent();

  const session = await auth();
  // If already signed in, skip straight to the form
  if (session?.user) {
    redirect("/portal/reapply");
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top bar */}
      <div className="border-b">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
              J
            </div>
            <span className="font-semibold tracking-tight">JETS School</span>
          </Link>
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Back to site
          </Link>
        </div>
      </div>

      {/* Hero */}
      <div className="flex-1 flex items-center justify-center py-20 px-6">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider">
              <GraduationCap className="h-3.5 w-3.5" />
              Returning Students
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mt-6">
              Reapply for 2026–27
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto mt-6 leading-relaxed">
              Welcome back. Because we already have your son&apos;s information on
              file, reapplying takes just a few minutes.
            </p>
          </div>

          <div className="bg-card border rounded-2xl p-8 space-y-6">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Sign in to continue</h2>
              <p className="text-sm text-muted-foreground">
                If you applied last year, sign in with the same account you used
                then.
              </p>
            </div>

            <Link
              href="/login?callbackUrl=/portal/reapply"
              className="w-full inline-flex items-center justify-center gap-2 h-12 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 font-semibold transition-colors"
            >
              <LogIn className="h-4 w-4" />
              Sign in to my account
            </Link>

            <div className="flex items-center gap-4">
              <div className="h-px bg-border flex-1" />
              <span className="text-xs text-muted-foreground uppercase tracking-wider">
                or
              </span>
              <div className="h-px bg-border flex-1" />
            </div>

            <div className="space-y-3">
              <p className="text-sm text-muted-foreground text-center">
                New to the portal? You&apos;ll need to create an account first.
              </p>
              <Link
                href="/register?callbackUrl=/portal/reapply"
                className="w-full inline-flex items-center justify-center gap-2 h-11 rounded-lg border border-input hover:bg-accent hover:text-accent-foreground font-semibold transition-colors"
              >
                <UserPlus className="h-4 w-4" />
                Create a parent account
              </Link>
            </div>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-8">
            First-time applicant?{" "}
            <Link href="/register" className="text-primary font-medium hover:underline inline-flex items-center gap-1">
              Start a new application
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
