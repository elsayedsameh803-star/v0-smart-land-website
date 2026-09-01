// =============================================================================
// Smart Land - YouTube (Google) OAuth callback
// =============================================================================
// GET /api/youtube/oauth/callback
//   Google redirects here after consent. Verifies `state`, exchanges the code
//   for access + refresh tokens, and stores `sl_conn_youtube` (encrypted) so
//   the analysis gate and the unified analytics dashboard can read REAL
//   channel metrics. Every failure redirects back with `youtube_oauth=failed`.
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import {
  getYouTubeClientId,
  getYouTubeClientSecret,
  getCallbackUrl,
  YOUTUBE_OAUTH_SCOPES,
} from "@/lib/oauth-config";
import { buildOAuthRedirect, safeReturnPath } from "@/lib/oauth-utils";
import { writeConnection } from "@/lib/connections";

export const dynamic = "force-dynamic";

const STATE_COOKIE = "sl_youtube_state";
const RETURN_COOKIE = "sl_youtube_return";

export async function GET(request: NextRequest) {
  const returnRaw = request.cookies.get(RETURN_COOKIE)?.value || "";
  const returnPath = safeReturnPath(returnRaw);
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const error = request.nextUrl.searchParams.get("error");
  const expected = request.cookies.get(STATE_COOKIE)?.value;

  const fail = () => buildOAuthRedirect(returnPath, "youtube_oauth=failed");

  if (error) return fail();
  if (!code) return fail();
  if (!expected || state !== expected) return fail();

  const clientId = getYouTubeClientId();
  const clientSecret = getYouTubeClientSecret();
  if (!clientId || !clientSecret) return fail();

  const redirectUri = getCallbackUrl("/api/youtube/oauth/callback");

  try {
    // Exchange the authorization code for access + refresh tokens.
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }).toString(),
      signal: AbortSignal.timeout(15000),
    });
    if (!tokenRes.ok) return fail();
    const tokenData: any = await tokenRes.json();
    if (!tokenData?.access_token) return fail();

    const now = Date.now();

    // Fetch the connected channel identity (non-secret).
    let channelId = "";
    let channelName = "";
    let channelAvatar: string | null = null;
    try {
      const chRes = await fetch(
        "https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true",
        {
          headers: { Authorization: `Bearer ${tokenData.access_token}` },
          cache: "no-store",
          signal: AbortSignal.timeout(15000),
        }
      );
      if (chRes.ok) {
        const chData: any = await chRes.json();
        const item = chData?.items?.[0];
        if (item) {
          channelId = item?.id || "";
          channelName = item?.snippet?.title || "";
          channelAvatar = item?.snippet?.thumbnails?.default?.url || null;
        }
      }
    } catch {
      // identity enrichment optional
    }

    const resp = buildOAuthRedirect(returnPath, "youtube_oauth=success");
    resp.cookies.delete(STATE_COOKIE);
    resp.cookies.delete(RETURN_COOKIE);

    writeConnection(
      (name, value, options) => resp.cookies.set(name, value, options as any),
      "youtube",
      {
        platform: "youtube",
        accountId: channelId || "youtube",
        displayName: channelName || "YouTube channel",
        avatarUrl: channelAvatar,
        token: {
          accessToken: String(tokenData.access_token),
          refreshToken: tokenData.refresh_token
            ? String(tokenData.refresh_token)
            : undefined,
          expiresAt: now + (Number(tokenData.expires_in) || 3600) * 1000,
          scope: YOUTUBE_OAUTH_SCOPES,
        },
        connectedAt: new Date().toISOString(),
      }
    );

    return resp;
  } catch {
    return fail();
  }
}