// =============================================================================
// Smart Land - Unified Analytics Overview (server-side aggregation)
// =============================================================================
// GET /api/analytics/overview
//   Requires a valid Smart Land session.
//   Aggregates REAL metrics from every connected platform into a single
//   response the Unified Analytics Dashboard renders. TOTALS ARE NEVER
//   INVENTED: any metric that could not be fetched from the provider's API is
//   returned with `available:false` and the UI renders it as "unavailable".
//
// Data sources (server-side only, tokens never reach the browser):
//   YouTube   -> YouTube Data API v3 (channels?mine=true + recent uploads)
//   Facebook  -> Meta Graph API v20 (managed Pages + page insights)
//   Instagram -> Meta Graph API v20 (IG business account insights)
//   TikTok    -> TikTok Display API /v2/user/info + /v2/video/list
//   LinkedIn  -> LinkedIn OpenID /v2/userinfo (identity only)
//   Snapchat  -> identity only (analytics requires an approved scope)
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { SOCIAL_PLATFORM_IDS, type PlatformId } from "@/lib/platforms";
import { resolveUsableConnection } from "@/lib/connections";
import type { PlatformConnection } from "@/lib/connections";
import { displayUserInfo, displayVideoList } from "@/lib/tiktok-api";
import { isPlatformConfigured } from "@/lib/oauth-config";
import "@/lib/platform-oauth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AnalyticsMetric {
  key: string;
  label: string;
  labelAr: string;
  value: number | null;
  available: boolean;
}

export interface PlatformAnalytics {
  platform: PlatformId;
  connected: boolean;
  configured: boolean;
  available: boolean;
  displayName: string;
  accountId: string;
  avatarUrl: string | null;
  updatedAt: string | null;
  metrics: AnalyticsMetric[];
}

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

const GRAPH_BASE = "https://graph.facebook.com/v20.0";
const YT_BASE = "https://www.googleapis.com/youtube/v3";

function numOrNull(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return Math.round(v);
  if (typeof v === "string" && v.trim() !== "" && Number.isFinite(Number(v))) {
    return Math.round(Number(v));
  }
  return null;
}

function sumMerge(a: number | null, b: number | null): number | null {
  if (a === null) return b;
  if (b === null) return a;
  return a + b;
}

function maxMerge(a: number | null, b: number | null): number | null {
  if (a === null) return b;
  if (b === null) return a;
  return Math.max(a, b);
}

function mkMetric(
  key: string,
  label: string,
  labelAr: string,
  value: number | null
): AnalyticsMetric {
  return {
    key,
    label,
    labelAr,
    value,
    available: value !== null,
  };
}

async function graphJson<T>(
  path: string,
  params: Record<string, string | number | undefined>,
  token: string
): Promise<T | null> {
  try {
    const search = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null && v !== "") search.set(k, String(v));
    }
    if (token) search.set("access_token", token);
    const res = await fetch(`${GRAPH_BASE}${path}?${search.toString()}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}
// ---------------------------------------------------------------------------
// Meta (Facebook Pages + linked Instagram business accounts)
// ---------------------------------------------------------------------------

interface MetaAggregate {
  displayName: string;
  accountId: string;
  avatarUrl: string | null;
  fans: number | null;
  fbReach: number | null;
  fbImpressions: number | null;
  engagedUsers: number | null;
  igLinked: boolean;
  igUsername: string;
  igFollowers: number | null;
  igMediaCount: number | null;
  igReach: number | null;
  igImpressions: number | null;
}

const META_INSIGHT_DAYS = 28;

async function collectMeta(
  conn: PlatformConnection
): Promise<MetaAggregate | null> {
  const token = conn.token.accessToken || "";
  if (!token) return null;

  try {
    const pagesData = await graphJson<{
      data?: Array<Record<string, any>>;
    }>(
      "/me/accounts",
      {
        fields:
          "id,name,link,picture,access_token,instagram_business_account{id,username,followers_count,media_count}",
        limit: 25,
      },
      token
    );
    const pages = pagesData?.data ?? [];

    const now = Math.floor(Date.now() / 1000);
    const since = now - META_INSIGHT_DAYS * 86400;

    let fans: number | null = null;
    let fbReach: number | null = null;
    let fbImpressions: number | null = null;
    let engagedUsers: number | null = null;
    let igLinked = false;
    let igUsername = "";
    let igFollowers: number | null = null;
    let igMediaCount: number | null = null;
    let igReach: number | null = null;
    let igImpressions: number | null = null;
    let displayName = conn.displayName || "Facebook";

    for (const page of pages.slice(0, 6)) {
      const pageId = page?.id ? String(page.id) : "";
      const pageName = page?.name ? String(page.name) : "";
      const pageToken = (page?.access_token as string) || token;
      if (!pageId) continue;
      if (pageName) displayName = pageName;

      const fansRes = await graphJson<{
        data?: Array<{ values?: Array<{ value?: unknown }> }>;
      }>(
        `/${pageId}/insights`,
        { metric: "page_fans", period: "lifetime" },
        pageToken
      );
      const latestFans = fansRes?.data?.[0]?.values?.at(-1)?.value;
      fans = maxMerge(fans, numOrNull(latestFans));

      const aggRes = await graphJson<{
        data?: Array<{ name?: string; values?: Array<{ value?: unknown }> }>;
      }>(
        `/${pageId}/insights`,
        {
          metric: "page_total_post_reach,page_engaged_users,page_impressions",
          period: "total_over_range",
          since,
          until: now,
        },
        pageToken
      );
      const metrics = aggRes?.data ?? [];
      const pick = (key: string) =>
        metrics.find((m) => m.name === key)?.values?.[0]?.value;
      fbReach = sumMerge(fbReach, numOrNull(pick("page_total_post_reach")));
      engagedUsers = sumMerge(engagedUsers, numOrNull(pick("page_engaged_users")));
      fbImpressions = sumMerge(fbImpressions, numOrNull(pick("page_impressions")));

      const igId = page?.instagram_business_account?.id
        ? String(page.instagram_business_account.id)
        : "";
      if (!igId) continue;
      igLinked = true;

      const igRes = await graphJson<{
        username?: string;
        followers_count?: unknown;
        media_count?: unknown;
      }>(
        `/${igId}`,
        { fields: "username,followers_count,media_count" },
        pageToken
      );
      if (igRes) {
        if (igRes.username) {
          igUsername = igRes.username;
          displayName = igRes.username;
        }
        igFollowers = sumMerge(igFollowers, numOrNull(igRes.followers_count));
        igMediaCount = sumMerge(igMediaCount, numOrNull(igRes.media_count));
      }

      const igIns = await graphJson<{
        data?: Array<{ name?: string; values?: Array<{ value?: unknown }> }>;
      }>(
        `/${igId}/insights`,
        { metric: "reach,impressions", period: "day", since, until: now },
        pageToken
      );
      const igMetrics = igIns?.data ?? [];
      const igPick = (key: string) =>
        igMetrics
          .find((m) => m.name === key)
          ?.values?.reduce((acc, v) => acc + (numOrNull(v.value) ?? 0), 0);
      igReach = sumMerge(igReach, numOrNull(igPick("reach")));
      igImpressions = sumMerge(igImpressions, numOrNull(igPick("impressions")));
    }

    return {
      displayName,
      accountId: conn.accountId,
      avatarUrl: conn.avatarUrl ?? null,
      fans,
      fbReach,
      fbImpressions,
      engagedUsers,
      igLinked,
      igUsername,
      igFollowers,
      igMediaCount,
      igReach,
      igImpressions,
    };
  } catch {
    return null;
  }
}
// ---------------------------------------------------------------------------
// YouTube (Data API v3)
// ---------------------------------------------------------------------------

interface YouTubeAggregate {
  displayName: string;
  accountId: string;
  avatarUrl: string | null;
  subscribers: number | null;
  channelViews: number | null;
  videos: number | null;
  recentViews: number | null;
  recentLikes: number | null;
  recentComments: number | null;
}

async function collectYouTube(
  conn: PlatformConnection
): Promise<YouTubeAggregate | null> {
  const token = conn.token.accessToken || "";
  if (!token) return null;
  try {
    const chRes = await fetch(
      `${YT_BASE}/channels?part=statistics,snippet&mine=true`,
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
        signal: AbortSignal.timeout(15000),
      }
    );
    if (!chRes.ok) return null;
    const chData: any = await chRes.json();
    const item = chData?.items?.[0];
    if (!item) return null;

    const agg: YouTubeAggregate = {
      displayName: item?.snippet?.title || conn.displayName,
      accountId: item?.id || conn.accountId,
      avatarUrl:
        item?.snippet?.thumbnails?.default?.url || conn.avatarUrl || null,
      subscribers: numOrNull(item?.statistics?.subscriberCount),
      channelViews: numOrNull(item?.statistics?.viewCount),
      videos: numOrNull(item?.statistics?.videoCount),
      recentViews: null,
      recentLikes: null,
      recentComments: null,
    };

    // Optional enrichment: the 5 most recent uploads.
    try {
      const cdRes = await fetch(
        `${YT_BASE}/channels?part=contentDetails&mine=true`,
        {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
          signal: AbortSignal.timeout(12000),
        }
      );
      if (cdRes.ok) {
        const cdData: any = await cdRes.json();
        const uploadsId =
          cdData?.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
        if (uploadsId) {
          const piRes = await fetch(
            `${YT_BASE}/playlistItems?part=snippet&playlistId=${encodeURIComponent(
              uploadsId
            )}&maxResults=5`,
            {
              headers: { Authorization: `Bearer ${token}` },
              cache: "no-store",
              signal: AbortSignal.timeout(12000),
            }
          );
          if (piRes.ok) {
            const piData: any = await piRes.json();
            const ids = (piData?.items ?? [])
              .map((i: any) => i?.snippet?.resourceId?.videoId)
              .filter(Boolean) as string[];
            if (ids.length) {
              const vRes = await fetch(
                `${YT_BASE}/videos?part=statistics&id=${ids.join(",")}`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                  cache: "no-store",
                  signal: AbortSignal.timeout(12000),
                }
              );
              if (vRes.ok) {
                const vData: any = await vRes.json();
                let views = 0;
                let likes = 0;
                let comments = 0;
                for (const v of vData?.items ?? []) {
                  views += numOrNull(v?.statistics?.viewCount) ?? 0;
                  likes += numOrNull(v?.statistics?.likeCount) ?? 0;
                  comments += numOrNull(v?.statistics?.commentCount) ?? 0;
                }
                agg.recentViews = views;
                agg.recentLikes = likes;
                agg.recentComments = comments;
              }
            }
          }
        }
      }
    } catch {
      // optional enrichment failed — channel stats are still valid
    }
    return agg;
  } catch {
    return null;
  }
}
// ---------------------------------------------------------------------------
// TikTok (Display API)
// ---------------------------------------------------------------------------

interface TikTokAggregate {
  displayName: string;
  accountId: string;
  avatarUrl: string | null;
  followers: number | null;
  following: number | null;
  totalLikes: number | null;
  videoCount: number | null;
  recentViews: number | null;
  recentLikes: number | null;
  recentComments: number | null;
}

async function collectTikTok(
  conn: PlatformConnection
): Promise<TikTokAggregate | null> {
  const token = conn.token.accessToken || "";
  if (!token) return null;
  try {
    const user = await displayUserInfo(token);
    if (!user) return null;
    const agg: TikTokAggregate = {
      displayName: user?.display_name || conn.displayName,
      accountId: user?.open_id || conn.accountId,
      avatarUrl: user?.avatar_url || conn.avatarUrl || null,
      followers: numOrNull(user?.follower_count),
      following: numOrNull(user?.following_count),
      totalLikes: numOrNull(user?.likes_count),
      videoCount: numOrNull(user?.video_count),
      recentViews: null,
      recentLikes: null,
      recentComments: null,
    };
    try {
      const videos = (await displayVideoList(token)) ?? [];
      let views = 0;
      let likes = 0;
      let comments = 0;
      for (const v of videos) {
        views += numOrNull(v?.view_count) ?? 0;
        likes += numOrNull(v?.like_count) ?? 0;
        comments += numOrNull(v?.comment_count) ?? 0;
      }
      agg.recentViews = views;
      agg.recentLikes = likes;
      agg.recentComments = comments;
    } catch {
      // optional enrichment failed
    }
    return agg;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// LinkedIn / Snapchat (identity only — metrics need extra approved scopes)
// ---------------------------------------------------------------------------

interface IdentityAggregate {
  displayName: string;
  accountId: string;
  avatarUrl: string | null;
}

async function collectIdentity(
  url: string,
  conn: PlatformConnection,
  fallbackName: string
): Promise<IdentityAggregate | null> {
  const token = conn.token.accessToken || "";
  if (!token) {
    return {
      displayName: fallbackName,
      accountId: conn.accountId,
      avatarUrl: conn.avatarUrl ?? null,
    };
  }
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) {
      return {
        displayName: fallbackName,
        accountId: conn.accountId,
        avatarUrl: conn.avatarUrl ?? null,
      };
    }
    const data: any = await res.json();
    return {
      displayName: data?.name || data?.display_name || fallbackName,
      accountId: data?.sub || data?.external_id || conn.accountId,
      avatarUrl:
        data?.picture ||
        data?.avatarUrl ||
        data?.bitmoji?.avatar_image_url ||
        conn.avatarUrl ||
        null,
    };
  } catch {
    return {
      displayName: fallbackName,
      accountId: conn.accountId,
      avatarUrl: conn.avatarUrl ?? null,
    };
  }
}

function collectLinkedIn(conn: PlatformConnection) {
  return collectIdentity(
    "https://api.linkedin.com/v2/userinfo",
    conn,
    conn.displayName || "LinkedIn"
  );
}

function collectSnapchat(conn: PlatformConnection) {
  return collectIdentity(
    "https://api.snapkit.com/v1/me",
    conn,
    conn.displayName || "Snapchat"
  );
}
// ---------------------------------------------------------------------------
// Per-platform builders
// ---------------------------------------------------------------------------

function unavailablePlatform(
  platform: PlatformId,
  configured: boolean,
  conn: PlatformConnection | null
): PlatformAnalytics {
  return {
    platform,
    connected: Boolean(conn),
    configured,
    available: false,
    displayName: conn?.displayName ?? "",
    accountId: conn?.accountId ?? "",
    avatarUrl: conn?.avatarUrl ?? null,
    updatedAt: conn?.connectedAt ?? null,
    metrics: [],
  };
}

function buildMetaPlatform(
  platform: "facebook" | "instagram",
  conn: PlatformConnection | null,
  meta: MetaAggregate | null
): PlatformAnalytics {
  const configured = isPlatformConfigured(platform);
  if (!conn || !meta) return unavailablePlatform(platform, configured, conn);

  if (platform === "facebook") {
    return {
      platform,
      connected: true,
      configured,
      available: true,
      displayName: meta.displayName,
      accountId: meta.accountId,
      avatarUrl: meta.avatarUrl,
      updatedAt: conn.connectedAt,
      metrics: [
        mkMetric("followers", "Followers", "المتابعون", meta.fans),
        mkMetric("reach", `Reach (${META_INSIGHT_DAYS}d)`, `الوصول (${META_INSIGHT_DAYS} يوم)`, meta.fbReach),
        mkMetric("impressions", `Impressions (${META_INSIGHT_DAYS}d)`, `مرات الظهور (${META_INSIGHT_DAYS} يوم)`, meta.fbImpressions),
        mkMetric("engagement", `Engaged users (${META_INSIGHT_DAYS}d)`, `المتفاعلون (${META_INSIGHT_DAYS} يوم)`, meta.engagedUsers),
      ],
    };
  }

  // Instagram — available only when a linked IG business account exists.
  if (!meta.igLinked) {
    return {
      platform,
      connected: true,
      configured,
      available: false,
      displayName: meta.displayName,
      accountId: meta.accountId,
      avatarUrl: meta.avatarUrl,
      updatedAt: conn.connectedAt,
      metrics: [],
    };
  }
  return {
    platform,
    connected: true,
    configured,
    available: true,
    displayName: meta.igUsername || meta.displayName,
    accountId: meta.accountId,
    avatarUrl: meta.avatarUrl,
    updatedAt: conn.connectedAt,
    metrics: [
      mkMetric("followers", "Followers", "المتابعون", meta.igFollowers),
      mkMetric("reach", `Reach (${META_INSIGHT_DAYS}d)`, `الوصول (${META_INSIGHT_DAYS} يوم)`, meta.igReach),
      mkMetric("impressions", `Impressions (${META_INSIGHT_DAYS}d)`, `مرات الظهور (${META_INSIGHT_DAYS} يوم)`, meta.igImpressions),
      mkMetric("content", "Media posts", "المنشورات", meta.igMediaCount),
    ],
  };
}

async function buildPlatformAnalytics(
  platform: PlatformId,
  configured: boolean,
  conn: PlatformConnection | null
): Promise<PlatformAnalytics> {
  if (!conn || !conn.token.accessToken) {
    return unavailablePlatform(platform, configured, conn);
  }

  switch (platform) {
    case "youtube": {
      const yt = await collectYouTube(conn).catch(() => null);
      if (!yt) return unavailablePlatform(platform, configured, conn);
      return {
        platform,
        connected: true,
        configured,
        available: true,
        displayName: yt.displayName,
        accountId: yt.accountId,
        avatarUrl: yt.avatarUrl,
        updatedAt: conn.connectedAt,
        metrics: [
          mkMetric("followers", "Subscribers", "المشتركون", yt.subscribers),
          mkMetric("views", "Channel views", "مشاهدات القناة", yt.channelViews),
          mkMetric("content", "Videos", "الفيديوهات", yt.videos),
          mkMetric("engagement", "Recent video engagement", "تفاعل أحدث الفيديوهات", sumMerge(yt.recentLikes, yt.recentComments)),
        ],
      };
    }
    case "tiktok": {
      const tk = await collectTikTok(conn).catch(() => null);
      if (!tk) return unavailablePlatform(platform, configured, conn);
      return {
        platform,
        connected: true,
        configured,
        available: true,
        displayName: tk.displayName,
        accountId: tk.accountId,
        avatarUrl: tk.avatarUrl,
        updatedAt: conn.connectedAt,
        metrics: [
          mkMetric("followers", "Followers", "المتابعون", tk.followers),
          mkMetric("likes", "Total likes", "إجمالي الإعجابات", tk.totalLikes),
          mkMetric("content", "Videos", "الفيديوهات", tk.videoCount),
          mkMetric("views", "Views (last 10 videos)", "مشاهدات (آخر 10 فيديوهات)", tk.recentViews),
          mkMetric("engagement", "Engagement (last 10 videos)", "تفاعل آخر 10 فيديوهات", sumMerge(tk.recentLikes, tk.recentComments)),
        ],
      };
    }
    case "linkedin": {
      const id = await collectLinkedIn(conn).catch(() => null);
      if (!id) return unavailablePlatform(platform, configured, conn);
      return {
        platform,
        connected: true,
        configured,
        available: false,
        displayName: id.displayName,
        accountId: id.accountId,
        avatarUrl: id.avatarUrl,
        updatedAt: conn.connectedAt,
        metrics: [],
      };
    }
    case "snapchat": {
      const id = await collectSnapchat(conn).catch(() => null);
      if (!id) return unavailablePlatform(platform, configured, conn);
      return {
        platform,
        connected: true,
        configured,
        available: false,
        displayName: id.displayName,
        accountId: id.accountId,
        avatarUrl: id.avatarUrl,
        updatedAt: conn.connectedAt,
        metrics: [],
      };
    }
    default:
      return unavailablePlatform(platform, configured, conn);
  }
}
// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions).catch(() => null);
  if (!session?.user) {
    return NextResponse.json(
      { success: false, error: "Authentication required", code: "auth_required" },
      { status: 401 }
    );
  }

  // Collect refreshed-token cookies written while resolving connections and
  // attach them to the outgoing response, so the rotation survives this
  // request (otherwise every dashboard load re-refreshes and rotating
  // providers like LinkedIn eventually break → forced re-link).
  const cookieJar: Array<{ name: string; value: string; options?: unknown }> = [];
  const connFor = async (p: PlatformId): Promise<PlatformConnection | null> => {
    try {
      return await resolveUsableConnection(request.cookies, p, (name, value, options) => {
        cookieJar.push({ name, value, options });
      });
    } catch {
      return null;
    }
  };

  // Meta (Facebook + Instagram) share a single OAuth grant.
  const facebookConn = await connFor("facebook");
  const instagramConn = facebookConn ? null : await connFor("instagram");
  const metaConn = facebookConn || instagramConn;
  const metaData = metaConn
    ? await collectMeta(metaConn).catch(() => null)
    : null;

  const youtubeConn = await connFor("youtube");
  const tiktokConn = await connFor("tiktok");
  const snapchatConn = await connFor("snapchat");
  const linkedinConn = await connFor("linkedin");

  const platforms: PlatformAnalytics[] = [
    buildMetaPlatform("facebook", facebookConn, metaData),
    buildMetaPlatform("instagram", instagramConn, metaData),
    await buildPlatformAnalytics("youtube", isPlatformConfigured("youtube"), youtubeConn),
    await buildPlatformAnalytics("tiktok", isPlatformConfigured("tiktok"), tiktokConn),
    await buildPlatformAnalytics("snapchat", isPlatformConfigured("snapchat"), snapchatConn),
    await buildPlatformAnalytics("linkedin", isPlatformConfigured("linkedin"), linkedinConn),
  ];

  const metricOf = (p: PlatformAnalytics, key: string): number | null =>
    p.metrics.find((m) => m.key === key)?.value ?? null;

  const sumAcross = (key: string): number | null => {
    let total: number | null = null;
    for (const p of platforms) {
      const v = metricOf(p, key);
      if (v !== null) total = sumMerge(total, v);
    }
    return total;
  };

  const summary: Record<string, number | null> = {
    followers: sumAcross("followers"),
    reach: sumAcross("reach"),
    impressions: sumAcross("impressions"),
    engagement: sumAcross("engagement"),
    content: sumAcross("content"),
    views: sumAcross("views"),
    likes: sumAcross("likes"),
  };

  const resp = NextResponse.json({
    success: true,
    generatedAt: new Date().toISOString(),
    totalPlatforms: SOCIAL_PLATFORM_IDS.length,
    connectedCount: platforms.filter((p) => p.connected).length,
    configuredCount: platforms.filter((p) => p.configured).length,
    summary,
    platforms,
  });
  for (const c of cookieJar) {
    resp.cookies.set(c.name, c.value, c.options as any);
  }
  return resp;
}