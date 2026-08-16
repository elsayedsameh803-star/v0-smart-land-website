import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Password-based admin login is permanently DISABLED.
// The only authentication path is Google Sign-In (OAuth) via /api/auth/login
// and /api/auth/google/callback. This route is kept only to return a clear
// denial so any legacy/injected password attempts are rejected.
export async function POST(request: NextRequest) {
  return NextResponse.json(
    {
      success: false,
      error:
        "Password login is disabled. Sign in with Google via the admin login page.",
    },
    { status: 403 }
  );
}
