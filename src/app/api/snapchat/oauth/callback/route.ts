// =============================================================================
// Smart Land - Snapchat OAuth callback
// =============================================================================
// GET /api/snapchat/oauth/callback
//   Snapchat redirects here after consent. Verifies `state`, exchanges the code
//   for access/refresh tokens, then stores `sl_conn_snapchat` (encrypted).
//   Every failure redirects back with `snapchat_oauth=failed`.
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import {
  getSnapchatClientId,
  getSnapchatClientSecret,
  getCallbackUrl,
  SNAPCHAT_OAUTH_SCOPES,
} from "@/lib/oauth-config";
import { buildOAuthRedirect, safeReturnPath } from "@/lib/oauth-utils";
import { writeConnection } from "@/lib/connections";

export const dynamic = "force-dynamic";

const STATE_COOKIE = "sl_snapchat_state";
const RETURN_COOKIE = "sl_snapchat_return";

export async function GET(request: NextRequest) {
  const returnRaw = request.cookies.get(RETURN_COOKIE)?.value || "";
  const returnPath = safeReturnPath(returnRaw);
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const error = request.nextUrl.searchParams.get("error");
  const expected = request.cookies.get(STATE_COOKIE)?.value;

  const fail = () => buildOAuthRedirect(returnPath, "snapchat_oauth=failed");

  if (error) return fail();
  if (!code) return fail();
  if (!expected || state !== expected) return fail();

  const clientId = getSnapchatClientId();
  const clientSecret = getSnapchatClientSecret();
  if (!clientId || !clientSecret) return fail();

  const redirectUri = getCallbackUrl("/api/snapchat/oauth/callback");

  try {
    const tokenRes = await fetch("https://accounts.snapchat.com/accounts/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret,
      }).toString(),
      signal: AbortSignal.timeout(15000),
    });
    if (!tokenRes.ok) return fail();
    const tokenData: any = await tokenRes.json();
    if (!tokenData?.access_token) return fail();

    const now = Date.now();

    // Fetch Snapchat display name + bitmoji (non-secret identity).
    let displayName = "";
    let extId = "";
    let avatar: string | null = null;
    try {
      const meRes = await fetch("https://api.snapkit.com/v1/me", {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
        cache: "no-store",
        signal: AbortSignal.timeout(12000),
      });
      if (meRes.ok) {
        const me: any = await meRes.json();
        const d = me?.data?.me;
        displayName = d?.display_name || d?.external_id || "";
        extId = d?.external_id || "";
        avatar =
          d?.bitmoji?.avatar_url ||
          d?.bitmoji?.avatar_image_url ||
          null;
      }
    } catch {
      // identity enrichment optional
    }

    const resp = buildOAuthRedirect(returnPath, "snapchat_oauth=success");
    resp.cookies.delete(STATE_COOKIE);
    resp.cookies.delete(RETURN_COOKIE);

    writeConnection(
      (name, value, options) => resp.cookies.set(name, value, options as any),
      "snapchat",
      {
        platform: "snapchat",
        accountId: extId || "snapchat",
        displayName: displayName || "Snapchat user",
        avatarUrl: avatar,
        token: {
          accessToken: String(tokenData.access_token),
          refreshToken: tokenData.refresh_token
            ? String(tokenData.refresh_token)
            : undefined,
          expiresAt: now + (Number(tokenData.expires_in) || 3600) * 1000,
          scope: SNAPCHAT_OAUTH_SCOPES,
        },
        connectedAt: new Date().toISOString(),
      }
    );

    return resp;
  } catch {
    return fail();
  }
}