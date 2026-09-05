import { NextRequest, NextResponse } from "next/server";
import {
  exchangeCodeForToken,
  isAllowedAdminEmail,
} from "@/lib/google-auth";
import {
  createSessionToken,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE,
} from "@/lib/admin-auth";
import { getSiteUrl } from "@/lib/site-config";

export const dynamic = "force-dynamic";

const SITE_BASE = getSiteUrl();

/** Google OAuth callback for admin. On success issues a signed admin session. */
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const deniedUrl = `${SITE_BASE}/admin/login?e=denied`;

  if (!code) return NextResponse.redirect(deniedUrl);

  const profile = await exchangeCodeForToken(code);
  if (!profile || !isAllowedAdminEmail(profile.email)) {
    return NextResponse.redirect(deniedUrl);
  }

  const token = await createSessionToken();
  const response = NextResponse.redirect(`${SITE_BASE}/admin`);
  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return response;
}