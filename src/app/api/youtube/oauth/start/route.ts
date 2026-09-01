// =============================================================================
// Smart Land - YouTube (Google) OAuth start
// =============================================================================
// GET /api/youtube/oauth/start?return=<relative path>
//   Redirects the user to Google's consent screen requesting the
//   `youtube.readonly` scope (plus openid/email/profile for identity). Uses
//   `access_type=offline` so a refresh token is issued for long-running access.
//   The `state` value is stored in an HttpOnly cookie for CSRF protection and
//   verified on callback. The `return` path is stored in a second HttpOnly
//   cookie (open-redirect safe).
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import {
  getYouTubeClientId,
  getYouTubeClientSecret,
  getCallbackUrl,
  YOUTUBE_OAUTH_SCOPES,
} from "@/lib/oauth-config";
import { newStateToken, safeReturnPath, stateCookieOptions } from "@/lib/oauth-utils";

export const dynamic = "force-dynamic";

const STATE_COOKIE = "sl_youtube_state";
const RETURN_COOKIE = "sl_youtube_return";

export async function GET(request: NextRequest) {
  const clientId = getYouTubeClientId();
  const clientSecret = getYouTubeClientSecret();
  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { success: false, code: "not_configured", error: "Google OAuth credentials are not configured on the server." },
      { status: 503 }
    );
  }

  const state = newStateToken();
  const returnPath = safeReturnPath(request.nextUrl.searchParams.get("return"));
  const redirectUri = getCallbackUrl("/api/youtube/oauth/callback");

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: YOUTUBE_OAUTH_SCOPES,
    access_type: "offline",
    prompt: "consent",
    state,
  });

  const res = NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  );
  res.cookies.set(STATE_COOKIE, state, stateCookieOptions());
  res.cookies.set(RETURN_COOKIE, returnPath, stateCookieOptions());
  return res;
}