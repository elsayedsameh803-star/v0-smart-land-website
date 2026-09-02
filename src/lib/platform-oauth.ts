// =============================================================================
// Smart Land - Platform token refresh strategies
// =============================================================================
// Registered one time at module load so the central connections store can
// transparently rotate an expired access token with the platform's refresh
// grant. Meta intentionally has no server-side refresh registered: Meta
// uses ~60-day long-lived tokens, which are short again only when the user
// re-links (no refresh_token is issued).
//
// YouTube / LinkedIn / Snapchat DO issue refresh tokens: their refreshers
// live here so an expired access token NEVER forces the user to re-link —
// the caller persists the rotated tokens via persistRenewedConnection().
//
// IMPORTANT: every consumer of `resolveUsableConnection*` (analysis gate,
// status endpoints, analytics overview) MUST import this module for its side
// effect, otherwise the refresher registry is empty in that bundle and
// refreshable connections are wrongly reported as "needs re-link".
// =============================================================================

import { registerRefresher } from "./connections";
import type { PlatformConnection } from "./connections";
import {
  getYouTubeClientId,
  getYouTubeClientSecret,
  getLinkedInClientId,
  getLinkedInClientSecret,
  getSnapchatClientId,
  getSnapchatClientSecret,
} from "./oauth-config";

// ---------------------------------------------------------------------------
// YouTube (Google refresh_token grant)
// ---------------------------------------------------------------------------
async function refreshYouTube(
  current: PlatformConnection
): Promise<PlatformConnection | null> {
  const clientId = getYouTubeClientId();
  const clientSecret = getYouTubeClientSecret();
  const refreshToken = current.token.refreshToken;
  if (!clientId || !clientSecret || !refreshToken) return null;
  try {
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }).toString(),
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return null;
    const data: any = await res.json();
    if (!data?.access_token) return null;
    const now = Date.now();
    return {
      ...current,
      token: {
        ...current.token,
        accessToken: String(data.access_token),
        refreshToken: data.refresh_token
          ? String(data.refresh_token)
          : current.token.refreshToken,
        expiresAt: now + (Number(data.expires_in) || 3600) * 1000,
      },
    };
  } catch {
    return null;
  }
}
registerRefresher("youtube", { refresh: refreshYouTube });

// ---------------------------------------------------------------------------
// LinkedIn (offline_access -> refresh_token grant)
// ---------------------------------------------------------------------------
async function refreshLinkedIn(
  current: PlatformConnection
): Promise<PlatformConnection | null> {
  const clientId = getLinkedInClientId();
  const clientSecret = getLinkedInClientSecret();
  const refreshToken = current.token.refreshToken;
  if (!clientId || !clientSecret || !refreshToken) return null;
  try {
    const res = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: clientId,
        client_secret: clientSecret,
      }).toString(),
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return null;
    const data: any = await res.json();
    if (!data?.access_token) return null;
    const now = Date.now();
    return {
      ...current,
      token: {
        ...current.token,
        accessToken: String(data.access_token),
        refreshToken:
          data.refresh_token || current.token.refreshToken || "",
        expiresAt: now + (Number(data.expires_in) || 86400) * 1000,
        refreshExpiresAt: data.refresh_token_expires_in
          ? now + Number(data.refresh_token_expires_in) * 1000
          : current.token.refreshExpiresAt,
      },
    };
  } catch {
    return null;
  }
}
registerRefresher("linkedin", { refresh: refreshLinkedIn });

// ---------------------------------------------------------------------------
// Snapchat (Snap Kit refresh_token grant)
// ---------------------------------------------------------------------------
// Snapchat access tokens are SHORT-LIVED (~1 hour). Without this refresher
// users had to re-link their Snapchat account before every analysis — the
// #1 cause of repeated connection prompts on the Snapchat analyzer.
async function refreshSnapchat(
  current: PlatformConnection
): Promise<PlatformConnection | null> {
  const clientId = getSnapchatClientId();
  const clientSecret = getSnapchatClientSecret();
  const refreshToken = current.token.refreshToken;
  if (!clientId || !clientSecret || !refreshToken) return null;
  try {
    const res = await fetch("https://accounts.snapchat.com/accounts/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: clientId,
        client_secret: clientSecret,
      }).toString(),
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return null;
    const data: any = await res.json();
    if (!data?.access_token) return null;
    const now = Date.now();
    return {
      ...current,
      token: {
        ...current.token,
        accessToken: String(data.access_token),
        refreshToken: data.refresh_token
          ? String(data.refresh_token)
          : current.token.refreshToken,
        expiresAt: now + (Number(data.expires_in) || 3600) * 1000,
      },
    };
  } catch {
    return null;
  }
}
registerRefresher("snapchat", { refresh: refreshSnapchat });