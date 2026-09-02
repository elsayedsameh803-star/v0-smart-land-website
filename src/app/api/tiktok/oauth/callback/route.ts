import { NextRequest, NextResponse } from "next/server";
import { exchangeTokenForCode, displayUserInfo } from "@/lib/tiktok-api";
import {
  buildTikTokSessionCookieValue,
  encryptTikTokSession,
  clearTikTokSessionCookie,
  type TikTokOAuthSessionData,
} from "@/lib/tiktok-session";
import { logTikTok, redactTikTokText } from "@/lib/tiktok-log";
import { getSiteUrl } from "@/lib/site-config";

export const dynamic = "force-dynamic";

const STATE_COOKIE = "sl_tiktok_state";
const RETURN_URL_COOKIE = "sl_tiktok_return";

/**
 * GET /api/tiktok/oauth/callback
 * TikTok redirects here after the user authorizes. Verifies the `state`
 * cookie, exchanges the code for tokens, calls /v2/user/info to store the
 * display name, then stores the encrypted session and redirects BACK to the
 * SAME page the user came from (returnUrl cookie), appending ?tiktok_oauth=
 * so the UI can trigger the analysis automatically.
 * Every failure redirects back (or home) with a query flag — never returns a
 * mocked successful connection.
 */
export async function GET(request: NextRequest) {
  const base = getSiteUrl().replace(/\/+$/, "");
  const home = `${base}/`;
  const returnUrl = request.cookies.get(RETURN_URL_COOKIE)?.value || "";

  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const error = request.nextUrl.searchParams.get("error");
  const expectedState = request.cookies.get(STATE_COOKIE)?.value;

  const fail = (msg: string) => {
    logTikTok("warn", "oauth_callback_failed", { reason: msg });
    const safeReturn =
      returnUrl && returnUrl.startsWith("/") && !returnUrl.startsWith("//")
        ? returnUrl
        : "";
    const target = safeReturn ? `${base}${safeReturn}` : home;
    const separator = target.includes("?") ? "&" : "?";
    return NextResponse.redirect(`${target}${separator}tiktok_oauth=failed`);
  };

  const clear = NextResponse.redirect(`${home}?tiktok_oauth=success`);
  clear.cookies.delete(STATE_COOKIE);
  clear.cookies.delete(RETURN_URL_COOKIE);
  if (error) {
    logTikTok("warn", "oauth_denied", { error: redactTikTokText(error) });
    return fail("user denied or error");
  }
  if (!code) return fail("no code");
  if (!expectedState || state !== expectedState) return fail("state mismatch");

  const tokenData = await exchangeTokenForCode(code);
  if (!tokenData || !tokenData.access_token || !tokenData.open_id) {
    return fail("token exchange failed");
  }

  let displayName = "TikTok user";
  let avatarUrl: string | null = null;
  try {
    const user = await displayUserInfo(tokenData.access_token as string);
    if (user) {
      if (user.display_name) displayName = user.display_name;
      if (user.avatar_url) avatarUrl = user.avatar_url;
    }
  } catch {
    // optional enrichment
  }

  const now = Date.now();
  const sessionData: TikTokOAuthSessionData = {
    openId: tokenData.open_id as string,
    displayName,
    avatarUrl,
    accessToken: tokenData.access_token as string,
    refreshToken: (tokenData.refresh_token as string) || "",
    accessExpiresAt: now + (Number(tokenData.expires_in) || 86400) * 1000,
    refreshExpiresAt: now + (Number(tokenData.refresh_expires_in) || 31536000) * 1000,
    connectedAt: new Date().toISOString(),
  };

  logTikTok("info", "oauth_connected", { openIdPrefix: sessionData.openId.slice(0, 4) });
  // Only valid relative paths are accepted for the return (open-redirect safe).
  const safeReturn =
    returnUrl && returnUrl.startsWith("/") && !returnUrl.startsWith("//")
      ? returnUrl
      : "";
  const target = safeReturn
    ? `${base}${safeReturn.startsWith("/") ? safeReturn : `/${safeReturn}`}`
    : home;
  const separator = target.includes("?") ? "&" : "?";
  const redirectTarget = `${target}${separator}tiktok_oauth=success`;
  const final = NextResponse.redirect(redirectTarget);
  final.cookies.delete(STATE_COOKIE);
  final.cookies.delete(RETURN_URL_COOKIE);
  // FIX: write ONLY the encrypted payload as the cookie value. Passing
  // buildTikTokSessionCookieValue() here stored a full Set-Cookie header
  // string INSIDE the cookie value, which could never be decrypted again —
  // TikTok users were forced to re-link on every single request.
  final.cookies.set("sl_tiktok_session", encryptTikTokSession(sessionData), {
    path: "/",
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 31536000,
  });
  return final;
}