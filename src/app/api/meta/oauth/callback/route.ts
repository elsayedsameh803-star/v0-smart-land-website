// =============================================================================
// Smart Land - Meta (Facebook + Instagram) OAuth callback
// =============================================================================
// GET /api/meta/oauth/callback
//   Facebook redirects here after the user authorizes. Verifies the `state`
//   cookie, exchanges the code for a short-lived token, upgrades it to a
//   long-lived (~60 day) token, then stores:
//     * sl_conn_facebook    -> always (Facebook user / first managed Page)
//     * sl_conn_instagram   -> only when a managed Page has a linked IG
//                              business account
//   and redirects the user back to their `return` page with `meta_oauth=success`.
//   Every failure redirects back with `meta_oauth=failed` — never stores a
//   fabricated connection.
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getMetaConfig, exchangeForLongLivedToken, fetchUserPages } from "@/lib/meta-graph";
import { getCallbackUrl, META_OAUTH_SCOPES } from "@/lib/oauth-config";
import { buildOAuthRedirect, safeReturnPath } from "@/lib/oauth-utils";
import { writeConnection } from "@/lib/connections";

export const dynamic = "force-dynamic";

const STATE_COOKIE = "sl_meta_state";
const RETURN_COOKIE = "sl_meta_return";
const GRAPH_VERSION = "v20.0";

interface GraphMe {
  id?: string;
  name?: string;
  picture?: { data?: { url?: string } };
}

export async function GET(request: NextRequest) {
  const returnRaw = request.cookies.get(RETURN_COOKIE)?.value || "";
  const returnPath = safeReturnPath(returnRaw);
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const error = request.nextUrl.searchParams.get("error");
  const expected = request.cookies.get(STATE_COOKIE)?.value;

  const fail = () =>
    buildOAuthRedirect(returnPath, "meta_oauth=failed");

  if (error) return fail();
  if (!code) return fail();
  if (!expected || state !== expected) return fail();

  const { appId, appSecret } = getMetaConfig();
  if (!appId || !appSecret) return fail();

  const redirectUri = getCallbackUrl("/api/meta/oauth/callback");

  try {
    // ##### Exchange code -> short-lived token
    const tokenRes = await fetch(
      `https://graph.facebook.com/${GRAPH_VERSION}/oauth/access_token?client_id=${encodeURIComponent(appId)}&client_secret=${encodeURIComponent(appSecret)}&code=${encodeURIComponent(code)}&redirect_uri=${encodeURIComponent(redirectUri)}`,
      { cache: "no-store", signal: AbortSignal.timeout(15000) }
    );
    if (!tokenRes.ok) return fail();
    const tokenData: any = await tokenRes.json();
    if (!tokenData?.access_token) return fail();

    const longLived = await exchangeForLongLivedToken(tokenData.access_token);
    const accessToken = longLived || tokenData.access_token;
    const now = Date.now();
    const expiresAt = now + (longLived ? 60 * 24 * 60 * 60 * 1000 : Number(tokenData.expires_in || 0) * 1000);

    // ##### User profile (non-secret)
    let me: GraphMe = {};
    try {
      const meRes = await fetch(
        `https://graph.facebook.com/${GRAPH_VERSION}/me?fields=id,name,picture&access_token=${encodeURIComponent(accessToken)}`,
        { cache: "no-store", signal: AbortSignal.timeout(12000) }
      );
      if (meRes.ok) me = (await meRes.json()) as GraphMe;
    } catch {
      // optional
    }

    const pages = await fetchUserPages(accessToken).catch(() => []);

    const resp = buildOAuthRedirect(returnPath, "meta_oauth=success");
    resp.cookies.delete(STATE_COOKIE);
    resp.cookies.delete(RETURN_COOKIE);

    // Facebook connection (always) — encrypted exactly like the connection
    // store used by the analysis gate, so the link is immediately usable.
    writeConnection(
      (name, value, options) => resp.cookies.set(name, value, options as any),
      "facebook",
      {
        platform: "facebook",
        accountId: me?.id || "facebook",
        displayName: me?.name || "Facebook account",
        avatarUrl: me?.picture?.data?.url || null,
        token: { accessToken: accessToken, expiresAt, scope: META_OAUTH_SCOPES },
        connectedAt: new Date().toISOString(),
      }
    );

    // Instagram connection (only when a managed Page has a linked IG account)
    const igPage = pages.find((p: any) => p?.instagram_business_account?.id);
    if (igPage?.instagram_business_account?.id) {
      const igId = String(igPage.instagram_business_account.id);
      let igUsername = "";
      try {
        const igRes = await fetch(
          `https://graph.facebook.com/${GRAPH_VERSION}/${igId}?fields=username&access_token=${encodeURIComponent(accessToken)}`,
          { cache: "no-store", signal: AbortSignal.timeout(12000) }
        );
        if (igRes.ok) {
          const igData: any = await igRes.json();
          igUsername = igData?.username || "";
        }
      } catch {
        // optional
      }
      writeConnection(
        (name, value, options) => resp.cookies.set(name, value, options as any),
        "instagram",
        {
          platform: "instagram",
          accountId: igId,
          displayName: igUsername || "Instagram",
          avatarUrl: null,
          token: { accessToken: accessToken, expiresAt, scope: META_OAUTH_SCOPES },
          connectedAt: new Date().toISOString(),
        }
      );
    }

    return resp;
  } catch {
    return fail();
  }
}