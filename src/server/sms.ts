import twilio from "twilio";

/**
 * SMS sender for parent + staff notifications. Falls back to a no-op when
 * Twilio env vars aren't set (so local dev doesn't crash). Real failures
 * (Twilio API errors, A2P throttling) are logged but never thrown — SMS is
 * always best-effort and never blocks the calling action.
 */

const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim();
const authToken = process.env.TWILIO_AUTH_TOKEN?.trim();
const fromNumber = process.env.TWILIO_FROM_NUMBER?.trim();

const client =
  accountSid && authToken && fromNumber
    ? twilio(accountSid, authToken)
    : null;

/**
 * Normalize a US phone string to E.164 (+1XXXXXXXXXX). Accepts most
 * common shapes: "(818) 555-1234", "818-555-1234", "8185551234",
 * "+18185551234". Returns null when we can't make sense of it.
 */
export function toE164(input: string | null | undefined): string | null {
  if (!input) return null;
  const digits = input.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  if (input.startsWith("+") && digits.length >= 10) return `+${digits}`;
  return null;
}

export async function sendSMS(args: {
  to: string;
  body: string;
}): Promise<{ success: boolean; error?: string; sid?: string }> {
  if (!client || !fromNumber) {
    console.log(`[SMS SKIPPED — Twilio not configured] To: ${args.to} | Body: ${args.body.slice(0, 60)}…`);
    return { success: false, error: "Twilio not configured" };
  }

  const normalized = toE164(args.to);
  if (!normalized) {
    console.warn(`[SMS] Skipping — couldn't parse phone "${args.to}"`);
    return { success: false, error: "Invalid phone number" };
  }

  try {
    const message = await client.messages.create({
      to: normalized,
      from: fromNumber,
      body: args.body,
    });
    console.log(`[SMS SENT] To: ${normalized} | SID: ${message.sid}`);
    return { success: true, sid: message.sid };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[SMS FAILED] To: ${normalized} | Error: ${message}`);
    return { success: false, error: message };
  }
}
