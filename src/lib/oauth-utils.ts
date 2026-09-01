// =============================================================================
// Smart Land - Shared OAuth helpers
// =============================================================================
// Small, audited utilities every platform OAuth route reuses so the CSRF
// `state` handling, the safe `return` path validation and the redirect-with-
// -flag logic are identical across Meta / YouTube / LinkedIn / Snapchat.
// =============================================================================

import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { getSiteUrl } from "./site-config";

export const OAUTH_STATE_MAX_AGE = 600; // 10 minutes

export function newStateToken(): string {
  return randomBytes(16).toString("hex");
}

/**
 * Accept ONLY same-site, relative, single-line paths. This is what prevents
 * open-redirect attacks when we redirect the user back after an OAuth flow.
 */
export function safeReturnPath(raw: string | null | undefined): string {
  if (
    raw &&
    raw.startsWith("/") &&
    !raw.startsWith("//") &&
    !raw.includes("\n") &&
    !raw.includes("\r")
  ) {
    return raw;
  }
  return "";
}

export function stateCookieOptions() {
  return {
    path: "/",
    httpOnly: true,
    secure: true,
    sameSite: "lax" as const,
    maxAge: OAUTH_STATE_MAX_AGE,
  };
}

/** Redirect the user back to the page they came from, carrying a query flag. */
export function buildOAuthRedirect(
  returnPath: string | null | undefined,
  flag: string,
  base?: string
): NextResponse {
  const site = (base || getSiteUrl()).replace(/\/+$/, "");
  const safe = safeReturnPath(returnPath);
  const target = safe ? `${site}${safe}` : `${site}/`;
  const separator = target.includes("?") ? "&" : "?";
  return NextResponse.redirect(`${target}${separator}${flag}`);
}