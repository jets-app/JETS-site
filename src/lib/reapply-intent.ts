import { cookies } from "next/headers";

/**
 * Tracks whether a parent landed via /reapply, so we can keep them on the
 * reapplication path even if their auth flow detours through /login or
 * /portal/dashboard. Cleared once a reapplication is actually created.
 */
const COOKIE_NAME = "jets-reapply-intent";
const TTL_SECONDS = 60 * 30; // 30 min — enough to register/login + finish form

export async function setReapplyIntent() {
  const jar = await cookies();
  jar.set(COOKIE_NAME, "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: TTL_SECONDS,
  });
}

export async function hasReapplyIntent() {
  const jar = await cookies();
  return jar.get(COOKIE_NAME)?.value === "1";
}

export async function clearReapplyIntent() {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}
