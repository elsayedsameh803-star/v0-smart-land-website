// =============================================================================
// Smart Land - Snapchat OAuth start
// =============================================================================
// GET /api/snapchat/oauth/start?return=<relative path>
//   Redirects the user to Snapchat's consent dialog requesting
//   `user.display_name user.bitmoji.avatar` (identity). The `state` value is
//   stored in an HttpOnly cookie for CSRF protection; `return` in a second
//   HttpOnly cookie (open-redirect safe). Analytics scopes (e.g. story views)
//   can be added later when the Snap Pixel / Business API review is approved.
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import {
  getSnapchatClientId,
  getSnapchatClientSecret,
  getCallbackUrl,
  SNAPCHAT_OAUTH_SCOPES,
} from "@/lib/oauth-config";
import { newStateToken, safeReturnPath, stateCookieOptions } from "@/lib/oauth-utils";

export const dynamic = "force-dynamic";

const STATE_COOKIE = "sl_snapchat_state";
const RETURN_COOKIE = "sl_snapchat_return";

export async function GET(request: NextRequest) {
  const clientId = getSnapchatClientId();
  const clientSecret = getSnapchatClientSecret();
  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { success: false, code: "not_configured", error: "Snapchat app credentials are not configured on the server." },
      { status: 503 }
    );
  }

  const state = newStateToken();
  const returnPath = safeReturnPath(request.nextUrl.searchParams.get("return"));
  const redirectUri = getCallbackUrl("/api/snapchat/oauth/callback");

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: SNAPCHAT_OAUTH_SCOPES,
    state,
  });

  const res = NextResponse.redirect(
    `https://accounts.snapchat.com/accounts/oauth2/auth?${params.toString()}`
  );
  res.cookies.set(STATE_COOKIE, state, stateCookieOptions());
  res.cookies.set(RETURN_COOKIE, returnPath, stateCookieOptions());
  return res;
}