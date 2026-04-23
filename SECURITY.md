# JETS Security Protocol

**Last updated:** 2026-04-22
**Stack:** Next.js 16 (App Router) + NextAuth v5 + Prisma + Neon Postgres + Vercel
**Hosting:** Vercel (Pro), `app.jetscollege.org` for the CRM/portal, `jetscollege.org` for the marketing site

This is the security protocol for the JETS School CRM + parent portal. It mirrors the structure of the Hausstack protocol — every control listed here can be copied to another Haustack school client.

---

## 1. Threat Model

We defend against:

- **External attackers** — XSS, SQL injection, brute force, session hijacking, credential stuffing, user enumeration
- **Cross-tenant reads** — one parent reading another parent's application, payments, messages, or interview details
- **Privilege escalation** — a parent reaching admin-only endpoints
- **Webhook spoofing** — attackers POSTing to `/api/webhooks/stripe` to forge "payment succeeded" events
- **Accidental leaks** — secrets committed, full URLs leaked in referrer headers, authed responses cached at the edge
- **Email spoofing** — attackers sending mail "from" `@jetsschool.org` (mitigated via SPF/DKIM/DMARC at the DNS layer)
- **Supply-chain** — dependency compromise (mitigated by weekly Dependabot + npm audit in CI)

We do **not** yet defend against:

- Nation-state / APT-level attackers
- Stolen admin device (no admin 2FA yet)
- Insider threat with valid admin credentials (audit log helps, but not prevention)
- A compromised Vercel deployment (would require platform breach)

---

## 2. Transport Security

All traffic is HTTPS. HTTP is auto-redirected by Vercel's edge. HTTPS is enforced for **two years** via HSTS with preload eligibility:

```
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
```

**Effect:** once a browser has seen this header, it refuses HTTP for `jetscollege.org` + every subdomain for 2 years, even if an attacker tries to downgrade.

---

## 3. HTTP Security Headers

Set in `next.config.ts` so they apply to every response, including static assets and API routes.

| Header | Value | Purpose |
|---|---|---|
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` | Force HTTPS |
| `X-Content-Type-Options` | `nosniff` | Block MIME sniffing |
| `X-Frame-Options` | `SAMEORIGIN` | Clickjacking protection |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Don't leak full URLs to third parties |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), interest-cohort=()` | Block device APIs we don't use + opt out of FLoC |
| `X-Permitted-Cross-Domain-Policies` | `none` | Block legacy Flash/Adobe cross-domain |
| `X-DNS-Prefetch-Control` | `on` | Performance, not security |
| `Cache-Control` (on `/api/*`) | `no-store, max-age=0` | Never cache authed API responses |

**Not yet set:** `Content-Security-Policy` — see §13.

---

## 4. Authentication

Single auth path: **email + password** via NextAuth.js v5 (Credentials provider).

### Flow

1. Parent posts to `/api/auth/callback/credentials` with `{email, password}`
2. NextAuth invokes our `authorize()` callback in `src/server/auth.ts`
3. We look up the user by email, then verify with `bcrypt.compare(plaintext, hash)` — bcrypt is constant-time-ish so timing attacks are bounded
4. On success, NextAuth signs a JWT containing `{id, role, sessionVersion}` and sets it as an HttpOnly cookie

### Properties

- **Hashing:** bcrypt with cost factor 10 (matches NextAuth defaults; ~80ms per verify)
- **No password leaks:** passwords are never logged. They never appear in Sentry breadcrumbs (Sentry not yet installed but if added, password fields must be in the scrub list).
- **Email enumeration:** the login error message is intentionally generic — `"Invalid email or password"` — so an attacker can't tell whether the email exists.
- **Cookie names:** `jets-session-token`, `jets-callback-url`, `jets-csrf-token` — namespaced to avoid collision with other apps on shared parent domains.

### Registration

Self-service via `/register`. New accounts default to `role=PARENT, status=ACTIVE`. Email verification is **not yet enforced** (see §14).

---

## 5. Sessions

JWT-based sessions (`session.strategy: "jwt"`).

### Cookie attributes

```
HttpOnly            // not readable from JS — XSS can't steal the cookie
SameSite=Lax        // blocks CSRF on POSTs from third-party sites
Secure              // production only — HTTPS-only transport
Path=/
```

### Session invalidation

NextAuth JWTs default to 30-day expiry. To revoke before then:

- **Sign out (this device):** clears the cookie via NextAuth's `signOut()`
- **Sign out everywhere:** increments `User.sessionVersion` in the DB. The Node-side jwt callback in `src/server/auth.ts` re-reads `sessionVersion` on each request and rejects any token whose version doesn't match — every other device gets logged out within one request cycle.

**Caveat:** Edge middleware (used for route gating) does not consult the DB on every request, so a revoked token may still pass middleware until the next time it's rotated. All actual data access (server actions, route handlers, RSC pages) consults the DB-backed jwt callback, so revocation is fully enforced where it matters.

### New device notification

Every successful sign-in is recorded in the `LoginEvent` table (sha256 of User-Agent, masked IP prefix). The first time we see a (user, userAgentHash) pair, we email the user from `recordSignIn()` so account compromise gets noticed within minutes.

---

## 6. Authorization

Three roles, enforced at three layers:

### 6a. Roles

- `PARENT` — default; can read/write only their own application + related records
- `REVIEWER` — can read and comment on all applications
- `PRINCIPAL` — REVIEWER powers + can move applications through the pipeline + conduct interviews
- `ADMIN` — full access; can mutate any record

### 6b. Layer 1 — Middleware (Edge)

`src/proxy.ts` (Next.js 16 calls middleware "proxy") plus `authConfig.callbacks.authorized` redirects unauthenticated users from any non-public path to `/login`. Public paths are an explicit allowlist (`/`, `/about`, `/login`, `/register`, `/r/*`, `/d/*`, `/api/auth/*`, `/api/webhooks/*`, etc.).

Within authenticated paths:
- `/admin/*` requires `role === "ADMIN"`
- `/review/*` requires `role` ∈ `{ADMIN, PRINCIPAL, REVIEWER}`
- `/portal/*` is open to any authenticated user

### 6c. Layer 2 — Server actions / API routes

Every action that mutates data calls `requireAdmin()` (admin-only) or its equivalent. Actions invokable from the parent portal verify ownership before reading or writing — **e.g. `application.parentId === session.user.id`**. An IDOR audit on 2026-04-22 found this pattern is consistently applied across every parent-facing action.

### 6d. Layer 3 — Token-based public routes

- `/r/[token]` — recommendation forms; the token IS the auth, no session needed
- `/d/[token]` — document signing; same pattern
Tokens are 25-character cuids (~150 bits of entropy) and either single-use (recommendations) or scoped + expiring (documents).

---

## 7. Input Validation + SQL Injection

### SQL injection — mitigated by ORM

All database access goes through Prisma, which uses parameterized queries by construction. There are no raw SQL strings, no `db.$queryRaw` with string concatenation. **Risk: very low.**

### Input validation

Every server action that takes user input runs it through a Zod schema before touching the DB. Schemas live in `src/lib/validators/*.ts`. On parse failure, the action returns `{error: ...}` and never reaches the database.

### Mass assignment

Server actions only forward whitelisted fields to Prisma — never `db.user.update({ where, data: req.body })`. Each update path explicitly destructures the fields it accepts.

---

## 8. Secrets Management

All secrets live in **Vercel environment variables**, scoped per environment (Development / Preview / Production). Never in code, never in `.env` files committed to the repo.

Secret types:
- `DATABASE_URL` — Neon Postgres connection string
- `AUTH_SECRET` — NextAuth JWT signing key
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `RESEND_API_KEY`, `RESEND_FROM_EMAIL`
- `ZOOM_*` (when wired up)
- `CRON_SECRET` — verifies cron job authenticity

**Detection:** weekly **gitleaks** GitHub Action scans for committed secrets (see §11).

---

## 9. Webhook Integrity

`/api/webhooks/stripe` validates every incoming request via `stripe.webhooks.constructEvent(rawBody, sig, STRIPE_WEBHOOK_SECRET)`. An attacker who POSTs a forged "payment succeeded" event without the matching HMAC signature gets a 400. Without this, anyone could fake a paid application.

---

## 10. File Uploads

Currently only images: student photos via `next/image` + `data:image/*` URLs in profile avatars. Size capped server-side at ~5MB per upload (`MAX_AVATAR_LENGTH` in `profile.actions.ts`). Stored as base64 in the DB rather than a Blob bucket — fine at our current scale, will migrate to Vercel Blob with token-scoped uploads when we exceed it.

---

## 11. Defensive Layers

### 11a. Rate limiting (incoming)

**Status:** not yet implemented. Login + reapplication endpoints are unbounded.

**Plan:** Provision Upstash Redis from Vercel Marketplace, add `@upstash/ratelimit` helper, apply to:
- `/api/auth/callback/credentials` — 5 attempts per IP per 15 min
- `/api/account` (DELETE) — 1 per hour
- `bookInterview` server action — 5 per IP per minute

### 11b. Error monitoring

**Status:** not yet installed. Errors go to `console.error` and surface in Vercel function logs only.

**Plan:** Add Sentry (server + browser) once Resend domain is verified — email-domain verification is a smaller blocker, and configuring Sentry well takes 1-2 hours.

### 11c. Audit log

Append-only `AuditLog` table records every status change, archive/unarchive, and delete by an admin. Each row captures `(actor, action, entityType, entityId, before, after, ipPrefix, userAgent, createdAt)`. Never deleted; queryable for incident review.

### 11d. Login event log

`LoginEvent` table records every successful sign-in with hashed UA + masked IP prefix. Used by §5 new-device notifications and available for incident triage.

### 11e. Backups

Postgres lives on Neon, which takes continuous WAL backups + daily snapshots, kept 7 days on the free tier. **Plan:** add an off-platform backup (S3) before we have client data we can't lose.

---

## 12. Email Authentication (DNS)

`info@jetsschool.org` — and any address we send mail from — needs SPF + DKIM + DMARC configured at Cloudflare for the `jetsschool.org` domain. As of 2026-04-22 the following is **pending**:

- **SPF / DKIM (Resend):** pending Cloudflare access — see Resend dashboard for the 4 records
- **DMARC at p=reject:** currently published at p=none. Strengthen to `p=quarantine` once Resend mail is flowing cleanly for two weeks, then `p=reject`.
- **CAA:** restricts which CAs can issue TLS certs for `*.jetsschool.org` and `*.jetscollege.org`. Add `0 issue "letsencrypt.org"` and `0 issue "amazon.com"` (Vercel uses both).

---

## 13. Content-Security-Policy

**Status:** not yet enabled. The other security headers in §3 are live; CSP is the next step.

**Why it's risky to ship blindly:** CSP can break inline styles (Next.js hydration), Stripe.js, Vimeo embeds, and any third-party script we add later. A misconfigured CSP silently breaks things in production.

**Plan (next session):**

1. Build a draft policy:
   ```
   default-src 'self';
   script-src 'self' 'unsafe-inline' https://js.stripe.com;
   style-src 'self' 'unsafe-inline';
   img-src 'self' data: blob: https://i.vimeocdn.com https://www.jetsschool.org;
   font-src 'self' data:;
   connect-src 'self' https://api.stripe.com https://*.vimeo.com;
   frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://player.vimeo.com;
   frame-ancestors 'self';
   form-action 'self';
   base-uri 'self';
   object-src 'none';
   ```
2. Deploy in **Report-Only mode** for one week → read violation reports → tighten
3. Switch to enforce mode
4. Eventually drop `'unsafe-inline'` from script-src by switching to nonce-based CSP

---

## 14. Known Gaps / Roadmap (Priority Order)

### 🔴 Critical — do first

1. **Cloudflare DNS access + Resend domain verification** — every email currently sends from `onboarding@resend.dev`, lands in spam
2. **CAA records** at Cloudflare for both jetscollege.org and jetsschool.org
3. **Rate limiting on auth + account-delete endpoints** (Upstash from Vercel Marketplace)
4. **CSP in Report-Only mode** — collect a week of reports, then enforce

### 🟠 Important — within 30 days

5. **Admin 2FA** — TOTP via NextAuth + a small TOTP table on User
6. **Email verification on registration** — prevents fake email accounts and gives us a verified channel for password resets
7. **Email change confirmation** — when a parent changes their email, the OLD address gets a "you can revert this within 24h" link
8. **Sentry for error monitoring** (server + browser)
9. **Off-platform backup** — daily Postgres dump → S3 with 30-day retention
10. **Strict-mode CSP** — drop `'unsafe-inline'` via nonce middleware

### 🟡 Nice-to-have

11. **DNSSEC** at Cloudflare for both domains
12. **Subresource Integrity** if/when we add any externally-hosted script tag
13. **Login throttling** — exponential backoff per (email, ip) pair
14. **Trusted Types** — XSS-mitigation evolution beyond CSP
15. **Branch protection on `main`** — require PR review before merge
16. **Pre-launch pentest** — one-time external review before we onboard a paying school client

### 🟢 Already solid

- Parameterized SQL via Prisma — no injection
- HttpOnly + SameSite=Lax cookies
- Bcrypt password hashing
- Stripe webhook signature verification
- IDOR-safe (audited 2026-04-22)
- Append-only audit log for admin actions
- Login event log + new-device email notifications
- All security headers except CSP
- `.well-known/security.txt` published — researchers know where to report
- `robots.txt` blocks `/admin`, `/portal`, `/api`, etc. from crawlers

---

## 15. Copy-this-to-a-new-school Checklist

When spinning up a new Haustack school CRM, the per-tenant security setup is:

1. ☐ Fresh `AUTH_SECRET` per environment (`openssl rand -base64 32`)
2. ☐ DB credentials provisioned in Neon, scoped to one project
3. ☐ Stripe keys per environment (test in dev/preview, live only in production)
4. ☐ Resend domain verified for the school's domain (SPF + DKIM + DMARC at p=quarantine minimum)
5. ☐ CAA records at the school's DNS provider
6. ☐ `RESEND_FROM_EMAIL` set to a school-monitored address
7. ☐ Admin allowlist set (whoever should be `role=ADMIN`)
8. ☐ Cron secret rotated (`CRON_SECRET`)
9. ☐ `next.config.ts` security headers — leave as-is
10. ☐ `SECURITY.md` and `/.well-known/security.txt` updated with school's contact

---

## 16. Incident Response (Six-Step Playbook)

When something goes wrong:

1. **Contain.** Revoke compromised credentials immediately. For account compromise, increment `User.sessionVersion` (forces sign-out everywhere). For service compromise, rotate the secret in Vercel and trigger a redeploy.
2. **Snapshot.** Export `AuditLog` and `LoginEvent` rows for the affected user / time window so we have evidence.
3. **Notify the user(s).** If parent data was accessed, email the parent within 24 hours describing what was exposed. Do not speculate — say what we know.
4. **Hunt.** Look for the same pattern in other accounts (`AuditLog` by `ipPrefix`, `LoginEvent` by `userAgentHash`).
5. **Patch.** Fix the underlying weakness. Add a regression test.
6. **Postmortem.** One-page doc — what happened, when, how we found it, what we changed. Filed in `docs/incidents/`.

### Emergency contacts

- **Vercel** — https://vercel.com/help (Pro tier = 24h response SLA)
- **Neon** — https://neon.tech/docs/introduction/support
- **Stripe** — https://support.stripe.com (account compromise: file under "Account & Settings → Security")
- **Resend** — support@resend.com
- **Security researcher reports** — `mailto:security@haustack.com` (also published at `/.well-known/security.txt`)
