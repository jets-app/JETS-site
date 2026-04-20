import { db } from "@/server/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const userCount = await db.user.count();
    return NextResponse.json({
      status: "ok",
      database: "connected",
      users: userCount,
      env: {
        hasDbUrl: !!process.env.DATABASE_URL,
        hasAuthSecret: !!process.env.AUTH_SECRET,
        hasAuthUrl: !!process.env.AUTH_URL,
        hasTrustHost: !!process.env.AUTH_TRUST_HOST,
      },
    });
  } catch (error) {
    return NextResponse.json({
      status: "error",
      database: "failed",
      error: String(error),
      env: {
        hasDbUrl: !!process.env.DATABASE_URL,
        hasAuthSecret: !!process.env.AUTH_SECRET,
      },
    }, { status: 500 });
  }
}
