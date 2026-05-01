import { NextResponse } from "next/server";
import { createTestStudentInternal } from "@/server/actions/dev-tools.actions";

export const runtime = "nodejs";

/**
 * Direct API endpoint for creating test students. Bypasses the admin UI in
 * case of caching or auth weirdness. Gated by CRON_SECRET so only people
 * with access to env vars can hit it.
 *
 * Usage:
 *   GET /api/dev/create-test-student?token=<CRON_SECRET>&email=you@example.com
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  const email = url.searchParams.get("email");
  const firstName = url.searchParams.get("firstName") ?? "Test";
  const lastName = url.searchParams.get("lastName") ?? "Student";

  const expected = process.env.CRON_SECRET;
  if (!expected) {
    return NextResponse.json(
      { error: "CRON_SECRET not configured on server." },
      { status: 500 },
    );
  }
  if (token !== expected) {
    return NextResponse.json(
      { error: "Invalid token. Pass ?token=<CRON_SECRET>." },
      { status: 401 },
    );
  }
  if (!email || !email.includes("@")) {
    return NextResponse.json(
      { error: "Pass ?email=<your-email> for the +alias parent email." },
      { status: 400 },
    );
  }

  try {
    const result = await createTestStudentInternal({
      baseEmail: email,
      studentFirstName: firstName,
      studentLastName: lastName,
    });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
