"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/lib/validators/auth";
import { loginUser } from "@/server/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  Mail,
  Lock,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginInput) {
    setError(null);
    const result = await loginUser(data);

    if (result.error) {
      setError(result.error);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="space-y-8">
      {/* Mobile branding */}
      <div className="lg:hidden text-center space-y-3 pb-4">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary text-primary-foreground font-bold text-xl">
          J
        </div>
        <h1 className="text-2xl font-bold text-foreground">JETS School</h1>
        <p className="text-muted-foreground text-sm">
          Jewish Educational Trade School
        </p>
        <div className="w-8 h-[2px] bg-primary/30 mx-auto" />
      </div>

      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Welcome back
        </h2>
        <p className="text-muted-foreground">
          Sign in to your account to continue
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4 animate-in fade-in slide-in-from-top-1 duration-300">
          <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-destructive">
              Sign in failed
            </p>
            <p className="text-sm text-destructive/80 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-sm font-medium text-foreground">
            Email address
          </Label>
          <div className="relative group">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              className="h-11 pl-10 rounded-xl transition-all duration-200 focus-visible:ring-primary/30"
              aria-invalid={!!errors.email}
              {...register("email")}
            />
          </div>
          {errors.email && (
            <p className="text-xs text-destructive flex items-center gap-1 mt-1 animate-in fade-in slide-in-from-top-1 duration-200">
              <AlertCircle className="h-3 w-3" />
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-sm font-medium text-foreground">
              Password
            </Label>
            <Link
              href="/forgot-password"
              className="text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative group">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              autoComplete="current-password"
              className="h-11 pl-10 rounded-xl transition-all duration-200 focus-visible:ring-primary/30"
              aria-invalid={!!errors.password}
              {...register("password")}
            />
          </div>
          {errors.password && (
            <p className="text-xs text-destructive flex items-center gap-1 mt-1 animate-in fade-in slide-in-from-top-1 duration-200">
              <AlertCircle className="h-3 w-3" />
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="pt-1">
          <Button
            type="submit"
            className="w-full h-11 rounded-xl text-sm font-semibold tracking-wide shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-200"
            size="lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                Sign In
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Footer */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border/60" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-background px-3 text-muted-foreground">
            New to JETS?
          </span>
        </div>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        <Link
          href="/register"
          className="font-medium text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-1"
        >
          Create an account
          <ArrowRight className="h-3 w-3" />
        </Link>
      </p>
    </div>
  );
}
