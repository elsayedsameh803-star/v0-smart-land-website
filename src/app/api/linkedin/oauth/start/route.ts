// =============================================================================
// Smart Land - LinkedIn OAuth start
// =============================================================================
// GET /api/linkedin/oauth/start?return=<relative path>
//   Redirects the user to LinkedIn's consent dialog requesting profile info
//   plus `offline_access` (so a refresh token is issued). The `state` value is
//   stored in an HttpOnly cookie for CSRF protection; the `return` path in a
//   second HttpOnly cookie (open-redirect safe).
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import {
  getLinkedInClientId,
  getLinkedInClientSecret,
  getCallbackUrl,
  LINKEDIN_OAUTH_SCOPES,
} from "@/lib/oauth-config";
import { newStateToken, safeReturnPath, stateCookieOptions } from "@/lib/oauth-utils";

export const dynamic = "force-dynamic";

const STATE_COOKIE = "sl_linkedin_state";
const RETURN_COOKIE = "sl_linkedin_return";

export async function GET(request: NextRequest) {
  const clientId = getLinkedInClientId();
  const clientSecret = getLinkedInClientSecret();
  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { success: false, code: "not_configured", error: "LinkedIn app credentials are not configured on the server." },
      { status: 503 }
    );
  }

  const state = newStateToken();
  const returnPath = safeReturnPath(request.nextUrl.searchParams.get("return"));
  const redirectUri = getCallbackUrl("/api/linkedin/oauth/callback");

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: LINKEDIN_OAUTH_SCOPES,
    state,
  });

  const res = NextResponse.redirect(
    `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`
  );
  res.cookies.set(STATE_COOKIE, state, stateCookieOptions());
  res.cookies.set(RETURN_COOKIE, returnPath, stateCookieOptions());
  return res;
}