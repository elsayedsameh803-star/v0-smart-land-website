import { NextResponse } from "next/server";
import { isGoogleOAuthConfigured, buildGoogleAuthUrl } from "@/lib/google-auth";

export const dynamic = "force-dynamic";

/** Returns the Google OAuth authorization URL for the admin login. */
export async function GET() {
  if (!isGoogleOAuthConfigured()) {
    return NextResponse.json(
      { success: false, error: "not_configured" },
      { status: 503 }
    );
  }
  return NextResponse.json({ success: true, url: buildGoogleAuthUrl() });
}