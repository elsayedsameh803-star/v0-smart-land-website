// =============================================================================
// Smart Land - Meta (Facebook + Instagram) Graph API helpers.
// Stateless, fetch-based access to the Meta Graph API (no SDK required).
// Tokens are read from the authenticated NextAuth session and used server
// side only (they are never exposed to the browser).
//
// Required env vars (Vercel → Settings → Environment Variables):
//   NEXT_PUBLIC_FACEBOOK_APP_ID (or FACEBOOK_APP_ID), FACEBOOK_APP_SECRET
// =============================================================================

const GRAPH_VERSION = "v20.0";

export const FACEBOOK_SCOPES = [
  "email",
  "public_profile",
  "pages_show_list",
  "pages_read_engagement",
  "instagram_basic",
  "instagram_manage_insights",
].join(",");

export interface MetaConfig {
  appId: string;
  appSecret: string;
}

export function getMetaConfig(): MetaConfig {
  return {
    appId:
      process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || process.env.FACEBOOK_APP_ID || "",
    appSecret: process.env.FACEBOOK_APP_SECRET || "",
  };
}

/** True when the Meta app credentials are present. */
export function isMetaConfigured(): boolean {
  const c = getMetaConfig();
  return Boolean(c.appId && c.appSecret);
}

function graphUrl(
  path: string,
  params: Record<string, string | number | undefined>
): string {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") search.set(k, String(v));
  });
  return `https://graph.facebook.com/${GRAPH_VERSION}${path}?${search.toString()}`;
}

async function graphGet<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

/**
 * Exchanges a short-lived Facebook user token for a ~60-day long-lived token
 * so the analytics session stays valid without a re-login.
 */
export async function exchangeForLongLivedToken(
  shortToken: string
): Promise<string | null> {
  const { appId, appSecret } = getMetaConfig();
  if (!shortToken || !appId || !appSecret) return null;
  const url = graphUrl("/oauth/access_token", {
    grant_type: "fb_exchange_token",
    client_id: appId,
    client_secret: appSecret,
    fb_exchange_token: shortToken,
  });
  const json = await graphGet<{ access_token?: string }>(url);
  return json?.access_token ?? null;
}

export interface FacebookPage {
  id: string;
  name: string;
  access_token?: string;
  link?: string;
  picture?: { data?: { url?: string } };
  instagram_business_account?: { id: string };
}

/** Pages the user manages (requires pages_show_list + pages_read_engagement). */
export async function fetchUserPages(
  accessToken: string
): Promise<FacebookPage[]> {
  if (!accessToken) return [];
  const url = graphUrl("/me/accounts", {
    fields:
      "id,name,link,picture,access_token,instagram_business_account",
    limit: 100,
    access_token: accessToken,
  });
  const json = await graphGet<{ data?: FacebookPage[] }>(url);
  return json?.data ?? [];
}

interface InsightsEntry {
  name?: string;
  values?: Array<{ value?: number | { value?: number } }>;
}

/** Aggregates a metric series into a single total number. */
function sumSeries(entries: InsightsEntry[] | undefined, key: string): number {
  let total = 0;
  (entries ?? []).forEach((entry) => {
    if (!entry?.name || entry.name !== key) return;
    (entry.values ?? []).forEach((v) => {
      let n = 0;
      if (typeof v.value === "number") n = v.value;
      else if (v.value && typeof v.value === "object" && "value" in v.value)
        n = Number((v.value as { value?: number }).value) || 0;
      if (Number.isFinite(n)) total += n;
    });
  });
  return Math.round(total);
}

/** Aggregate Page analytics for the last N days (default 28). */
export async function fetchPageInsights(
  pageId: string,
  pageAccessToken: string,
  days = 28
): Promise<Record<string, number>> {
  const until = Math.floor(Date.now() / 1000);
  const since = until - days * 86400;
  const metric =
    "page_fans,page_total_post_reach,page_engaged_users,page_impressions,page_post_engagements";
  const url = graphUrl(`/${pageId}/insights`, {
    metric,
    period: "day",
    since,
    until,
    access_token: pageAccessToken,
  });
  const json = await graphGet<{ data?: InsightsEntry[] }>(url);
  const data = json?.data ?? [];
  return {
    fans: sumSeries(data, "page_fans"),
    reach: sumSeries(data, "page_total_post_reach"),
    engagedUsers: sumSeries(data, "page_engaged_users"),
    impressions: sumSeries(data, "page_impressions"),
    postEngagements: sumSeries(data, "page_post_engagements"),
  };
}

/** Aggregate Instagram business-account analytics for the last N days. */
export async function fetchInstagramInsights(
  instagramBusinessAccountId: string,
  accessToken: string,
  days = 28
): Promise<Record<string, number>> {
  const until = Math.floor(Date.now() / 1000);
  const since = until - days * 86400;
  const url = graphUrl(`/${instagramBusinessAccountId}/insights`, {
    metric: "reach,impressions,profile_views",
    period: "day",
    since,
    until,
    access_token: accessToken,
  });
  const json = await graphGet<{ data?: InsightsEntry[] }>(url);
  const data = json?.data ?? [];
  return {
    reach: sumSeries(data, "reach"),
    impressions: sumSeries(data, "impressions"),
    profileViews: sumSeries(data, "profile_views"),
  };
}