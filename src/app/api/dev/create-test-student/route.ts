import { NextResponse } from "next/server";
import { createTestStudentInternal } from "@/server/actions/dev-tools.actions";

export const runtime = "nodejs";

/**
 * Direct API endpoint for creating test students. Hit it from the browser
 * with your email — no auth, no token. Use sparingly; remove after the
 * tuition contract flow is fully tested.
 *
 * Usage:
 *   GET /api/dev/create-test-student?email=you@example.com
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const email = url.searchParams.get("email");
  const firstName = url.searchParams.get("firstName") ?? "Test";
  const lastName = url.searchParams.get("lastName") ?? "Student";

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
