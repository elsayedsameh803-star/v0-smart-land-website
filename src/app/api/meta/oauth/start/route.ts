// =============================================================================
// Smart Land - Meta (Facebook + Instagram) OAuth start
// =============================================================================
// GET /api/meta/oauth/start?return=<relative path>
//   Redirects the user to Facebook's consent dialog with the analytics scopes
//   (pages_show_list, pages_read_engagement, instagram_basic,
//   instagram_manage_insights...). The `state` value is stored in an HttpOnly
//   cookie for CSRF protection and verified on callback. The `return` path is
//   stored in a second HttpOnly cookie so the user lands exactly where they
//   left off (open-redirect safe).
//
// The SAME Meta OAuth grant covers BOTH Facebook and Instagram: the callback
// stores a connection for Facebook and, when the user manages a Page with a
// linked Instagram business account, a second connection for Instagram.
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getMetaConfig } from "@/lib/meta-graph";
import { getCallbackUrl, META_OAUTH_SCOPES } from "@/lib/oauth-config";
import { newStateToken, safeReturnPath, stateCookieOptions } from "@/lib/oauth-utils";

export const dynamic = "force-dynamic";

const STATE_COOKIE = "sl_meta_state";
const RETURN_COOKIE = "sl_meta_return";

export async function GET(request: NextRequest) {
  const { appId } = getMetaConfig();
  const appSecret = getMetaConfig().appSecret;
  if (!appId || !appSecret) {
    return NextResponse.json(
      { success: false, code: "not_configured", error: "Meta app credentials are not configured on the server." },
      { status: 503 }
    );
  }

  const state = newStateToken();
  const returnPath = safeReturnPath(request.nextUrl.searchParams.get("return"));
  const redirectUri = getCallbackUrl("/api/meta/oauth/callback");

  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    scope: META_OAUTH_SCOPES,
    response_type: "code",
    state,
    display: "popup",
  });

  const res = NextResponse.redirect(
    `https://www.facebook.com/v20.0/dialog/oauth?${params.toString()}`
  );
  res.cookies.set(STATE_COOKIE, state, stateCookieOptions());
  res.cookies.set(RETURN_COOKIE, returnPath, stateCookieOptions());
  return res;
}