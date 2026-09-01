// =============================================================================
// Smart Land - LinkedIn OAuth callback
// =============================================================================
// GET /api/linkedin/oauth/callback
//   LinkedIn redirects here after consent. Verifies `state`, exchanges the code
//   for access + refresh tokens, then stores `sl_conn_linkedin` (encrypted).
//   Every failure redirects back with `linkedin_oauth=failed`.
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import {
  getLinkedInClientId,
  getLinkedInClientSecret,
  getCallbackUrl,
  LINKEDIN_OAUTH_SCOPES,
} from "@/lib/oauth-config";
import { buildOAuthRedirect, safeReturnPath } from "@/lib/oauth-utils";
import { writeConnection } from "@/lib/connections";

export const dynamic = "force-dynamic";

const STATE_COOKIE = "sl_linkedin_state";
const RETURN_COOKIE = "sl_linkedin_return";

export async function GET(request: NextRequest) {
  const returnRaw = request.cookies.get(RETURN_COOKIE)?.value || "";
  const returnPath = safeReturnPath(returnRaw);
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const error = request.nextUrl.searchParams.get("error");
  const expected = request.cookies.get(STATE_COOKIE)?.value;

  const fail = () => buildOAuthRedirect(returnPath, "linkedin_oauth=failed");

  if (error) return fail();
  if (!code) return fail();
  if (!expected || state !== expected) return fail();

  const clientId = getLinkedInClientId();
  const clientSecret = getLinkedInClientSecret();
  if (!clientId || !clientSecret) return fail();

  const redirectUri = getCallbackUrl("/api/linkedin/oauth/callback");

  try {
    const tokenRes = await fetch(
      "https://www.linkedin.com/oauth/v2/accessToken",
      {
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
      }
    );
    if (!tokenRes.ok) return fail();
    const tokenData: any = await tokenRes.json();
    if (!tokenData?.access_token) return fail();

    const now = Date.now();

    // Fetch LinkedIn profile (non-secret identity).
    let name = "";
    let lid = "";
    let avatar: string | null = null;
    try {
      const meRes = await fetch("https://api.linkedin.com/v2/userinfo", {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
        cache: "no-store",
        signal: AbortSignal.timeout(12000),
      });
      if (meRes.ok) {
        const me: any = await meRes.json();
        name = me?.name || "";
        lid = me?.sub || "";
        avatar = me?.picture || null;
      }
    } catch {
      // identity enrichment optional
    }

    const resp = buildOAuthRedirect(returnPath, "linkedin_oauth=success");
    resp.cookies.delete(STATE_COOKIE);
    resp.cookies.delete(RETURN_COOKIE);

    writeConnection(
      (name, value, options) => resp.cookies.set(name, value, options as any),
      "linkedin",
      {
        platform: "linkedin",
        accountId: lid || "linkedin",
        displayName: name || "LinkedIn profile",
        avatarUrl: avatar,
        token: {
          accessToken: String(tokenData.access_token),
          refreshToken: tokenData.refresh_token
            ? String(tokenData.refresh_token)
            : undefined,
          expiresAt: now + (Number(tokenData.expires_in) || 86400) * 1000,
          refreshExpiresAt: tokenData.refresh_token_expires_in
            ? now + Number(tokenData.refresh_token_expires_in) * 1000
            : undefined,
          scope: LINKEDIN_OAUTH_SCOPES,
        },
        connectedAt: new Date().toISOString(),
      }
    );

    return resp;
  } catch {
    return fail();
  }
}