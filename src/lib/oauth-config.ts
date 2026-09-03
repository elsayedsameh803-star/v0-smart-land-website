// =============================================================================
// Smart Land - OAuth configuration registry (server-side only)
// =============================================================================
// Single source of truth for "does the server actually have the OAuth
// credentials needed to connect <platform>?". The unified connect UI and
// /api/connections read this so the user is never sent into a dead provider
// flow without prior notice (the UI shows "credentials not configured").
//
// Required env vars (Vercel -> Settings -> Environment Variables):
//   Meta (Facebook/Instagram)   : META_APP_ID + FACEBOOK_CLIENT_SECRET
//   YouTube                    : GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET
//   TikTok                     : TIKTOK_CLIENT_KEY + TIKTOK_CLIENT_SECRET
//   LinkedIn                   : LINKEDIN_CLIENT_ID + LINKEDIN_CLIENT_SECRET
//   Snapchat                   : SNAPCHAT_CLIENT_ID + SNAPCHAT_CLIENT_SECRET
// =============================================================================

import type { PlatformId } from "./connections";
import { getMetaConfig } from "./meta-graph";
import { getTikTokClientKey, getTikTokClientSecret } from "./tiktok-api";

export function getYouTubeClientId(): string {
  return process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
}
export function getYouTubeClientSecret(): string {
  return process.env.GOOGLE_CLIENT_SECRET || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET || "";
}

/**
 * YouTube Data API v3 key (public-data access, no OAuth needed).
 * Accepts every supported alias so Vercel env vars can be named either
 * GOOGLE_API_KEY (existing convention) or YOUTUBE_API_KEY /
 * YOUTUBE_DATA_API_KEY (added via Vercel -> Settings -> Environment Variables).
 */
export function getYouTubeApiKey(): string {
  return (
    process.env.GOOGLE_API_KEY ||
    process.env.YOUTUBE_API_KEY ||
    process.env.YOUTUBE_DATA_API_KEY ||
    ""
  );
}

/** True when a YouTube Data API v3 key is present on the server. */
export function isYouTubeApiKeyConfigured(): boolean {
  return Boolean(getYouTubeApiKey());
}
export function getLinkedInClientId(): string {
  return process.env.LINKEDIN_CLIENT_ID || process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID || "";
}
export function getLinkedInClientSecret(): string {
  return process.env.LINKEDIN_CLIENT_SECRET || "";
}
export function getSnapchatClientId(): string {
  return process.env.SNAPCHAT_CLIENT_ID || process.env.NEXT_PUBLIC_SNAPCHAT_CLIENT_ID || "";
}
export function getSnapchatClientSecret(): string {
  return process.env.SNAPCHAT_CLIENT_SECRET || "";
}

// ---------------------------------------------------------------------------
// OAuth scope strings — single source of truth shared by each platform's
// start & callback routes (route-to-route imports are avoided on purpose).
// ---------------------------------------------------------------------------

export const YOUTUBE_OAUTH_SCOPES =
  "https://www.googleapis.com/auth/youtube.readonly openid email profile";

export const META_OAUTH_SCOPES =
  "email,public_profile,pages_show_list,pages_read_engagement,instagram_basic,instagram_manage_insights";

export const LINKEDIN_OAUTH_SCOPES = "openid profile email offline_access";

export const SNAPCHAT_OAUTH_SCOPES = "user.display_name user.bitmoji.avatar";

/** True when the platform's OAuth credentials are configured on the server. */
export function isPlatformConfigured(platform: PlatformId): boolean {
  switch (platform) {
    case "website":
      return true;
    case "facebook":
    case "instagram": {
      const meta = getMetaConfig();
      return Boolean(meta.appId && meta.appSecret);
    }
    case "youtube":
      return Boolean(getYouTubeClientId() && getYouTubeClientSecret());
    case "tiktok":
      return Boolean(getTikTokClientKey() && getTikTokClientSecret());
    case "linkedin":
      return Boolean(getLinkedInClientId() && getLinkedInClientSecret());
    case "snapchat":
      return Boolean(getSnapchatClientId() && getSnapchatClientSecret());
  }
}

/**
 * Resolve the absolute callback URL for a platform's OAuth flow.
 * Mirrors the existing TikTok helper (`getTikTokRedirectUri`) so local dev
 * and Vercel preview/production each resolve to the right origin.
 */
export function getCallbackUrl(path: string): string {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");
  return `${base.replace(/\/+$/, "")}${path}`;
}