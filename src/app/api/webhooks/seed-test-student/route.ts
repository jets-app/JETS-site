import { NextResponse } from "next/server";
import { createTestStudentInternal } from "@/server/actions/dev-tools.actions";

export const runtime = "nodejs";

/**
 * Public endpoint for creating test students. Tucked under /api/webhooks/
 * because that path is already in the auth allowlist. Token-free —
 * remove this file once tuition contract testing is done.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const email = url.searchParams.get("email");
  const firstName = url.searchParams.get("firstName") ?? "Test";
  const lastName = url.searchParams.get("lastName") ?? "Student";

  if (!email || !email.includes("@")) {
    return NextResponse.json(
      { error: "Pass ?email=<your-email>." },
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
