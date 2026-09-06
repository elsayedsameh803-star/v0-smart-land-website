// =============================================================================
// Smart Land - Official TikTok API Client (server-side ONLY)
// =============================================================================
// Integrates the TikTok for Developers APIs exactly as documented:
//   - oEmbed            : no credentials, returns title/author/thumbnail only
//   - Display API       : /v2/user/info, /v2/video/list, /v2/video/query
//                         needs an authorized USER access token (user.info.basic,
//                         video.list). Delegated to the user's OAuth session.
//   - Research API      : /v2/research/user/info, /v2/research/video/query
//                         needs a CLIENT access token (client_credentials grant)
//                         issued with the CLIENT KEY + CLIENT SECRET. Must be
//                         approved as a Research project.
//
// Credentials come ONLY from server-side environment variables:
//   TIKTOK_CLIENT_KEY   (from Vercel env — client key)
//   TIKTOK_CLIENT_SECRET(from Vercel env — client secret)
//
// They are NEVER shipped to the browser. The RESEARCH client grant uses a
// client access token; there is no per-user consent involved for this path.
// =============================================================================

import { logTikTok } from "./tiktok-log";

export const TIKTOK_API_BASE = "https://open.tiktokapis.com/v2";
export const TIKTOK_OAUTH_BASE = "https://www.tiktok.com/v2/auth/authorize";

// Scopes required for the Display API (user-authorized video metrics).
export const TIKTOK_DISPLAY_SCOPES = "user.info.basic,video.list";

// ---------------------------------------------------------------------------
// Env access (server-only)
// ---------------------------------------------------------------------------
export function getTikTokClientKey(): string {
  return (
    process.env.TIKTOK_CLIENT_KEY ||
    process.env.TIKTOK_CLIENT_ID ||
    process.env.CLIENT_KEY_TIKTOK ||
    ""
  );
}
export function getTikTokClientSecret(): string {
  return process.env.TIKTOK_CLIENT_SECRET || process.env.CLIENT_SECRET_TIKTOK || "";
}

export function getTikTokRedirectUri(): string {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
  return `${base.replace(/\/+$/, "")}/api/tiktok/oauth/callback`;
}

// ---------------------------------------------------------------------------
// oEmbed (public, no credentials) — returns title / author_name / thumbnail
// ---------------------------------------------------------------------------
export async function fetchTikTokOEmbed(
  url: string
): Promise<{
  title: string | null;
  authorName: string | null;
  authorUrl: string | null;
  thumbnailUrl: string | null;
}> {
  try {
    const res = await fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) {
      logTikTok("warn", "oembed_http_error", { status: res.status });
      return { title: null, authorName: null, authorUrl: null, thumbnailUrl: null };
    }
    const data: any = await res.json();
    return {
      title: data?.title || null,
      authorName: data?.author_name || null,
      authorUrl: data?.author_url || null,
      thumbnailUrl: data?.thumbnail_url || null,
    };
  } catch (e) {
    logTikTok("warn", "oembed_failed", { reason: (e as Error).message });
    return { title: null, authorName: null, authorUrl: null, thumbnailUrl: null };
  }
}

// ---------------------------------------------------------------------------
// Research API — client access token (client_credentials grant)
// ---------------------------------------------------------------------------
// Cached client access token. TikTok client tokens typically live ~2 hours;
// caching avoids one extra round-trip on every analysis request.
let cachedClientToken: { token: string; expiresAt: number } | null = null;

async function getResearchClientAccessToken(): Promise<string | null> {
  const clientKey = getTikTokClientKey();
  const clientSecret = getTikTokClientSecret();
  if (!clientKey || !clientSecret) {
    logTikTok("warn", "research_no_credentials");
    return null;
  }
  if (cachedClientToken && Date.now() < cachedClientToken.expiresAt - 60_000) {
    return cachedClientToken.token;
  }
  try {
    const res = await fetch(`${TIKTOK_API_BASE}/oauth/token/`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_key: clientKey,
        client_secret: clientSecret,
        grant_type: "client_credentials",
      }).toString(),
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) {
      const raw = await res.text();
      logTikTok("error", "research_token_http", { status: res.status, body: raw });
      return null;
    }
    const data: any = await res.json();
    const token = data?.data?.access_token;
    if (token) {
      const expiresIn = Number(data?.data?.expires_in) || 7200;
      cachedClientToken = { token, expiresAt: Date.now() + expiresIn * 1000 };
      return token;
    }
    logTikTok("error", "research_token_empty", { body: JSON.stringify(data) });
    return null;
  } catch (e) {
    logTikTok("error", "research_token_exception", { reason: (e as Error).message });
    return null;
  }
}

/**
 * Query a single public TikTok video using the Research API (video_id filter).
 * Requires a Research-approved project (client credentials). Returns real
 * engagement metrics, duration, description and hashtags, or null on failure.
 *
 * TikTok requires start_date/end_date to bracket the video's creation time and
 * the window may span AT MOST 30 days (official spec). The video's creation
 * time is unknown before the query, so we scan backwards from today in
 * contiguous 30-day windows and stop at the first window that finds the video.
 */
export async function queryResearchVideoById(videoId: string): Promise<any | null> {
  const token = await getResearchClientAccessToken();
  if (!token) return null;

  // Fields validated against the official Research API Video Object:
  // id, create_time, username, region_code, video_description, hashtag_names,
  // view_count, like_count, comment_count, share_count, favorites_count,
  // video_duration  (play_count/duration/hashtag_info/music_info DO NOT EXIST)
  const fields =
    "id,create_time,username,region_code,video_description,hashtag_names,view_count,like_count,comment_count,share_count,favorites_count,video_duration";

  const dayMs = 24 * 60 * 60 * 1000;
  const fmt = (d: Date) =>
    `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, "0")}${String(
      d.getUTCDate()
    ).padStart(2, "0")}`;

  // 6 contiguous windows ≈ 180 days of coverage, newest first. Most analysed
  // videos are recent, so the first window usually hits and we stop early.
  const WINDOWS = 6;
  const now = Date.now();

  for (let i = 0; i < WINDOWS; i++) {
    const end = new Date(now - i * 30 * dayMs);
    const start = new Date(end.getTime() - 29 * dayMs);
    try {
      const res = await fetch(
        `${TIKTOK_API_BASE}/research/video/query/?fields=${encodeURIComponent(fields)}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: {
              and: [
                { operation: "EQ", field_name: "video_id", field_values: [videoId] },
              ],
            },
            start_date: fmt(start),
            end_date: fmt(end),
            max_count: 1,
            cursor: 0,
            is_random: false,
          }),
          signal: AbortSignal.timeout(20000),
        }
      );
      if (!res.ok) {
        const raw = await res.text();
        // Auth/permission problems will not be fixed by trying other windows.
        if (res.status === 401 || res.status === 403) {
          logTikTok("warn", "research_video_auth", { status: res.status, body: raw });
          return { __httpError: res.status };
        }
        logTikTok("warn", "research_video_http", { status: res.status, body: raw });
        return { __httpError: res.status };
      }
      const data: any = await res.json();
      if (data?.error && data.error.code && data.error.code !== "ok") {
        logTikTok("warn", "research_video_api_error", {
          code: data.error.code,
          message: data.error.message,
        });
        return { __httpError: 400 };
      }
      const videos = data?.data?.videos || [];
      if (videos.length) return videos[0];
      // Not in this window — continue to the previous 30-day window.
    } catch (e) {
      logTikTok("error", "research_video_exception", { reason: (e as Error).message });
      return null;
    }
  }
  // Video was not found inside the scanned period (older than ~180 days).
  return { __empty: true };
}

/**
 * Query a TikTok user's public account info with the Research API.
 * Also returns marker objects when the account cannot be resolved.
 */
export async function queryResearchUserInfo(username: string): Promise<any | null> {
  const token = await getResearchClientAccessToken();
  if (!token) return null;
  try {
    const fields =
      "display_name,bio_description,bio_url,avatar_url,is_verified,follower_count,following_count,likes_count,video_count";
    const res = await fetch(
      `${TIKTOK_API_BASE}/research/user/info/?fields=${encodeURIComponent(fields)}`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
        signal: AbortSignal.timeout(15000),
      }
    );
    if (!res.ok) {
      const raw = await res.text();
      logTikTok("warn", "research_user_http", { status: res.status, body: raw });
      return { __httpError: res.status };
    }
    const data: any = await res.json();
    return data?.data || null;
  } catch (e) {
    logTikTok("error", "research_user_exception", { reason: (e as Error).message });
    return null;
  }
}
// ---------------------------------------------------------------------------
// Display API calls — these require the USER's access token (OAuth session).
// ---------------------------------------------------------------------------

function extractDisplayError(body: any): { code: string; message: string } {
  const e = body?.error;
  return { code: e?.code || "unknown", message: e?.message || e?.message_info || "" };
}

/** GET /v2/user/info/ with the user's access token. */
export async function displayUserInfo(accessToken: string): Promise<any | null> {
  const res = await fetch(
    `${TIKTOK_API_BASE}/user/info/?fields=open_id,union_id,avatar_url,display_name,bio_description,is_verified,follower_count,following_count,video_count,likes_count,profile_deep_link`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      signal: AbortSignal.timeout(15000),
    }
  );
  if (!res.ok) {
    const raw = await res.text();
    logTikTok("warn", "display_userinfo_http", { status: res.status, body: raw });
    return null;
  }
  const data: any = await res.json();
  return data?.data?.user || null;
}

/** POST /v2/video/list/ with the user's access token. Returns raw videos. */
export async function displayVideoList(accessToken: string): Promise<any[] | null> {
  const fields =
    "id,create_time,title,video_description,duration,cover_image_url,share_url,like_count,comment_count,share_count,view_count,hashtag_names";
  const res = await fetch(`${TIKTOK_API_BASE}/video/list/?fields=${encodeURIComponent(fields)}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({ max_count: 10 }),
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) {
    const raw = await res.text();
    logTikTok("warn", "display_videolist_http", { status: res.status, body: raw });
    return null;
  }
  const data: any = await res.json();
  if (data?.error && data.error.code !== "ok") {
    const { code, message } = extractDisplayError(data);
    logTikTok("warn", "display_videolist_api_error", { code, message });
    return null;
  }
  return data?.data?.videos || null;
}

/** POST /v2/video/query/ with the user's access token and a target video id. */
export async function displayVideoQuery(accessToken: string, videoId: string): Promise<any | null> {
  const fields =
    "id,create_time,title,video_description,duration,cover_image_url,share_url,like_count,comment_count,share_count,view_count,hashtag_names";
  const res = await fetch(`${TIKTOK_API_BASE}/video/query/?fields=${encodeURIComponent(fields)}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({ filters: { video_ids: [videoId] } }),
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) {
    const raw = await res.text();
    logTikTok("warn", "display_videoquery_http", { status: res.status, body: raw });
    return null;
  }
  const data: any = await res.json();
  if (data?.error && data.error.code !== "ok") {
    const { code, message } = extractDisplayError(data);
    logTikTok("warn", "display_videoquery_api_error", { code, message });
    return null;
  }
  const videos = data?.data?.videos || [];
  return videos[0] || null;
}

// ---------------------------------------------------------------------------
// OAuth URLs & token exchange (Display scopes, user-authorized)
// ---------------------------------------------------------------------------
export function buildTikTokAuthUrl(state: string): string | null {
  const clientKey = getTikTokClientKey();
  if (!clientKey) return null;
  const params = new URLSearchParams({
    client_key: clientKey,
    response_type: "code",
    scope: "user.info.basic,video.list",
    redirect_uri: getTikTokRedirectUri(),
    state,
  });
  return `${TIKTOK_OAUTH_BASE}?${params.toString()}`;
}

/**
 * Exchange an authorization code for access/refresh tokens. Tries with the
 * client secret first, then without it (some app types don't require it on
 * exchange). Returns the token payload or null on every failure.
 */
export async function exchangeTokenForCode(code: string): Promise<any | null> {
  const clientKey = getTikTokClientKey();
  const clientSecret = getTikTokClientSecret();
  const redirectUri = getTikTokRedirectUri();
  if (!clientKey) return null;

  const attempts: Array<Record<string, string>> = [];
  if (clientSecret) {
    attempts.push({
      client_key: clientKey,
      client_secret: clientSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
    });
  }
  attempts.push({
    client_key: clientKey,
    code,
    grant_type: "authorization_code",
    redirect_uri: redirectUri,
  });

  for (const body of attempts) {
    try {
      const res = await fetch(`${TIKTOK_API_BASE}/oauth/token/`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(body).toString(),
        signal: AbortSignal.timeout(15000),
      });
      const data: any = await res.json().catch(() => null);
      if (data?.data?.access_token) return data.data;
      logTikTok("warn", "token_exchange_attempt", {
        status: res.status,
        error: data?.error?.message || "",
      });
    } catch (e) {
      logTikTok("warn", "token_exchange_exception", { reason: (e as Error).message });
    }
  }
  return null;
}

/** Refresh an expired access token using the refresh token. */
export async function refreshTikTokAccessToken(refreshToken: string): Promise<any | null> {
  const clientKey = getTikTokClientKey();
  const clientSecret = getTikTokClientSecret();
  if (!clientKey) return null;
  const body: Record<string, string> = {
    client_key: clientKey,
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  };
  if (clientSecret) body.client_secret = clientSecret;
  try {
    const res = await fetch(`${TIKTOK_API_BASE}/oauth/token/`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(body).toString(),
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) {
      const raw = await res.text();
      logTikTok("warn", "token_refresh_http", { status: res.status, body: raw });
      return null;
    }
    const data: any = await res.json();
    return data?.data || null;
  } catch (e) {
    logTikTok("warn", "token_refresh_exception", { reason: (e as Error).message });
    return null;
  }
}