import crypto from "crypto";
import { db } from "@/server/db";
import { sendEmail } from "@/server/email";

/**
 * Record a successful sign-in. If we've never seen this (user, userAgentHash)
 * combination before, send a "new sign-in detected" email so account takeover
 * gets noticed within minutes even if the password was leaked.
 */
export async function recordSignIn(args: {
  userId: string;
  userAgent: string;
  ip?: string | null;
  userEmail: string;
  userName: string;
}) {
  const userAgentHash = crypto
    .createHash("sha256")
    .update(args.userAgent || "unknown")
    .digest("hex");
  const ipPrefix = args.ip ? maskIp(args.ip) : null;

  const known = await db.loginEvent.findFirst({
    where: { userId: args.userId, userAgentHash, notified: true },
    select: { id: true },
  });

  await db.loginEvent.create({
    data: {
      userId: args.userId,
      userAgentHash,
      ipPrefix,
      userAgentRaw: args.userAgent.slice(-200),
      notified: !known ? true : false, // mark as notified so we only send once per UA
    },
  });

  if (known) return;

  const browser = friendlyBrowser(args.userAgent);
  const when = new Date().toLocaleString("en-US", {
    timeZone: "America/Los_Angeles",
    dateStyle: "long",
    timeStyle: "short",
  });

  await sendEmail({
    to: args.userEmail,
    subject: "New sign-in to your JETS account",
    html: wrap(
      `Hi ${args.userName},\n\n` +
        `We noticed a sign-in to your JETS account from a new browser or device.\n\n` +
        `When: ${when} (Los Angeles time)\n` +
        `Device: ${browser}\n` +
        (ipPrefix ? `Network: ${ipPrefix}.x (approximate)\n` : "") +
        `\n` +
        `If this was you, you can ignore this email.\n\n` +
        `If this WASN'T you:\n` +
        `  1. Sign in to your portal\n` +
        `  2. Go to Profile → Sign out everywhere\n` +
        `  3. Change your password right after\n\n` +
        `Stay safe,\nThe JETS Team`,
    ),
  }).catch((e) => {
    // Never let an email failure break sign-in
    console.error("Login notification email failed:", e);
  });
}

function maskIp(ip: string): string {
  // Strip the last octet for IPv4 ("1.2.3.4" → "1.2.3"), or first 4 hextets
  // for IPv6. We log a coarse network identifier, not the full address.
  if (ip.includes(":")) return ip.split(":").slice(0, 4).join(":");
  const parts = ip.split(".");
  if (parts.length === 4) return parts.slice(0, 3).join(".");
  return ip;
}

function friendlyBrowser(ua: string): string {
  if (!ua) return "Unknown browser";
  if (/iPhone|iPad|iPod/.test(ua)) return "iPhone / iPad";
  if (/Android/.test(ua)) return "Android device";
  if (/Macintosh/.test(ua)) {
    if (/Chrome/.test(ua)) return "Mac (Chrome)";
    if (/Safari/.test(ua)) return "Mac (Safari)";
    if (/Firefox/.test(ua)) return "Mac (Firefox)";
    return "Mac";
  }
  if (/Windows/.test(ua)) {
    if (/Edg/.test(ua)) return "Windows (Edge)";
    if (/Chrome/.test(ua)) return "Windows (Chrome)";
    if (/Firefox/.test(ua)) return "Windows (Firefox)";
    return "Windows";
  }
  if (/Linux/.test(ua)) return "Linux";
  return ua.slice(0, 80);
}

function wrap(body: string) {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #A30018;">
        <h1 style="color: #A30018; font-size: 24px; margin: 0;">JETS School</h1>
      </div>
      <div style="padding: 30px 0; white-space: pre-wrap; line-height: 1.6; color: #333;">
        ${body.replace(/\n/g, "<br>")}
      </div>
      <div style="border-top: 1px solid #eee; padding: 20px 0; text-align: center; color: #999; font-size: 12px;">
        Jewish Educational Trade School · 16601 Rinaldi Street, Granada Hills, CA · (818) 831-3000
      </div>
    </div>
  `;
}
