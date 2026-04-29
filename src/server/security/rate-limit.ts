import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { headers } from "next/headers";

/**
 * Rate limiting via Upstash Redis. Applied to:
 *  - Login (per email + per IP, separately)
 *  - Registration (per IP)
 *  - Password reset request (per email + per IP)
 *  - Public token submits (recommendations, document signing — per token)
 *
 * Fail-open: if Redis is unreachable, requests are allowed through. We log
 * the failure but don't lock real users out because of an infra hiccup.
 */

const url = process.env.UPSTASH_REDIS_KV_REST_API_URL;
const token = process.env.UPSTASH_REDIS_KV_REST_API_TOKEN;

const redis =
  url && token
    ? new Redis({ url, token })
    : null;

function makeLimiter(name: string, requests: number, windowSeconds: number) {
  if (!redis) return null;
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, `${windowSeconds} s`),
    analytics: true,
    prefix: `jets:rl:${name}`,
  });
}

// 5 login attempts per IP per 15 min — covers a typo or two
const loginByIp = makeLimiter("login:ip", 5, 60 * 15);
// 10 login attempts per email per hour — slows down credential stuffing
const loginByEmail = makeLimiter("login:email", 10, 60 * 60);
// 3 registrations per IP per hour
const registerByIp = makeLimiter("register:ip", 3, 60 * 60);
// 3 password reset requests per email per hour
const passwordResetByEmail = makeLimiter("pwreset:email", 3, 60 * 60);
// 5 password reset requests per IP per hour
const passwordResetByIp = makeLimiter("pwreset:ip", 5, 60 * 60);
// 30 token submissions per IP per hour (signing pages, recommendation forms)
const publicTokenByIp = makeLimiter("token:ip", 30, 60 * 60);

async function getClientIp(): Promise<string> {
  const h = await headers();
  // Vercel sets x-forwarded-for; first IP in the list is the client
  const fwd = h.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return h.get("x-real-ip") ?? "unknown";
}

interface CheckResult {
  ok: boolean;
  retryAfterSeconds?: number;
  reason?: string;
}

async function check(
  limiter: Ratelimit | null,
  key: string,
): Promise<CheckResult> {
  if (!limiter) {
    // Redis not configured — fail open. Logged once at startup elsewhere.
    return { ok: true };
  }
  try {
    const result = await limiter.limit(key);
    if (!result.success) {
      const retry = Math.max(1, Math.ceil((result.reset - Date.now()) / 1000));
      return {
        ok: false,
        retryAfterSeconds: retry,
        reason: "Too many requests, please slow down.",
      };
    }
    return { ok: true };
  } catch (e) {
    // Redis transient failure — log + fail open
    console.error("[rate-limit] Redis error:", e);
    return { ok: true };
  }
}

export async function rateLimitLogin(email: string): Promise<CheckResult> {
  const ip = await getClientIp();
  const [byIp, byEmail] = await Promise.all([
    check(loginByIp, ip),
    check(loginByEmail, email.toLowerCase()),
  ]);
  if (!byIp.ok) return byIp;
  if (!byEmail.ok) return byEmail;
  return { ok: true };
}

export async function rateLimitRegistration(): Promise<CheckResult> {
  const ip = await getClientIp();
  return check(registerByIp, ip);
}

export async function rateLimitPasswordReset(email: string): Promise<CheckResult> {
  const ip = await getClientIp();
  const [byIp, byEmail] = await Promise.all([
    check(passwordResetByIp, ip),
    check(passwordResetByEmail, email.toLowerCase()),
  ]);
  if (!byIp.ok) return byIp;
  if (!byEmail.ok) return byEmail;
  return { ok: true };
}

export async function rateLimitPublicToken(): Promise<CheckResult> {
  const ip = await getClientIp();
  return check(publicTokenByIp, ip);
}
