import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { buildTikTokAuthUrl } from "@/lib/tiktok-api";
import { logTikTok } from "@/lib/tiktok-log";

export const dynamic = "force-dynamic";

const STATE_COOKIE = "sl_tiktok_state";
const RETURN_URL_COOKIE = "sl_tiktok_return";

/**
 * GET /api/tiktok/oauth/start?returnUrl=<url>&platform=tiktok
 * Redirects the user to TikTok's authorize screen with the Display scopes
 * (user.info.basic, video.list). The `state` value is stored in an HttpOnly
 * cookie for CSRF protection and verified on callback. The original page the
 * user wants to return to (returnUrl) is stored in a second HttpOnly cookie so
 * the flow can continue the analysis automatically after authorization.
 */
export async function GET(request: NextRequest) {
  const state = randomBytes(16).toString("hex");
  const authUrl = buildTikTokAuthUrl(state);
  if (!authUrl) {
    logTikTok("warn", "oauth_start_no_client");
    return NextResponse.json(
      { success: false, error: "TikTok client is not configured on the server." },
      { status: 503 }
    );
  }

  const requestedReturn = request.nextUrl.searchParams.get("return");
  const res = NextResponse.redirect(authUrl);
  res.cookies.set(STATE_COOKIE, state, {
    path: "/",
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 600, // 10 min
  });
  if (requestedReturn && requestedReturn.startsWith("/") && !requestedReturn.startsWith("//")) {
    res.cookies.set(RETURN_URL_COOKIE, requestedReturn, {
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 600,
    });
  } else {
    res.cookies.set(RETURN_URL_COOKIE, "", { path: "/", maxAge: 0 });
  }
  return res;
}