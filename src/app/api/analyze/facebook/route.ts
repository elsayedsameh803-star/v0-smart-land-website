import { NextRequest, NextResponse } from "next/server";
import { buildSocialAnalysisResponse, normalizeProfileData } from "@/lib/social-analysis-helper";
import { safeFetch } from "@/lib/security";
import { recordAnalysis } from "@/lib/admin-stats";
import { enforceSubscription } from "@/lib/subscription-shield";
import { getMetaConfig } from "@/lib/meta-graph";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { url, locale } = await request.json();
    const blocked = enforceSubscription(request);
    if (blocked) return blocked;
    if (!url) {
      return NextResponse.json({ error: "URL required" }, { status: 400 });
    }

    // Extract Facebook page identifier
    const pageId = extractFacebookPageId(url);
    if (!pageId) {
      return NextResponse.json({ error: "Invalid Facebook URL" }, { status: 400 });
    }

    const startTime = Date.now();

    // ===== 1. Fetch Facebook page (public data) =====
    let profileData: Record<string, any> = {};
    let fetchedHtml = "";

    // Facebook heavily gatekeeps HTML for bots. Try the main page first, then
    // the lightweight mbasic endpoint as a fallback. Both may return a login
    // wall — in that case we honestly report that no data could be verified.
    const fetchAttempts = [
      `https://www.facebook.com/${pageId}/`,
      `https://mbasic.facebook.com/${pageId}/`,
    ];

    for (const attemptUrl of fetchAttempts) {
      try {
        const res = await safeFetch(attemptUrl, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
            "Sec-Fetch-Dest": "document",
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-Site": "none",
          },
        });
        if (!res.ok) continue;
        const html = await res.text();
        if (!html || html.length < 200) continue;
        fetchedHtml = html;
        break;
      } catch {
        continue;
      }
    }

    if (fetchedHtml) {
      const html = fetchedHtml;

      // ===== 2. Extract REAL public data (only what actually exists) =====
      const metaTitle = matchMeta(html, "og:title");
      const metaDescription = matchMeta(html, "description") || matchMeta(html, "og:description");
      const metaImage = matchMeta(html, "og:image");

      // Page name from title
      const pageName = metaTitle?.replace(/\s*[|]\s*Facebook$/, "").trim() || pageId;

      // About/description
      const aboutText = (metaDescription || "").replace(/\s+/g, " ").trim();
      const hasAbout = aboutText.length > 20;

      // REAL follower/like counts — only when the platform actually exposes them
      const followers = extractFollowerCount(html);
      const followersText = followers > 0 ? formatFollowerText(followers) : null;

      // Verification marker (true only when explicitly present)
      const verified = /verified\s*page/i.test(html);

      // Hashtags & links inside the verified description
      const hashtags = aboutText.match(/#[a-zA-Z0-9_]+/g) || [];
      const links = aboutText.match(/https?:\/\/[^\s"]+/g) || [];

      // Visible post markers (article roles rendered in public HTML)
      const postIndicators = html.match(/role=["']article["']/gi) || [];
      const visiblePosts = postIndicators.length;

      // Only fields that were genuinely extracted are emitted. Absence of a
      // metric (login wall, JS-only render) stays "unknown", never a fake zero.
      const fb: Record<string, any> = {
        pageId,
        pageName,
      };
      if (aboutText) {
        fb.about = aboutText;
        fb.aboutText = aboutText;
        fb.hasAbout = hasAbout;
        if (hashtags.length > 0) fb.hashtags = hashtags;
        if (links.length > 0) fb.links = links;
      }
      if (followers > 0) {
        fb.followers = followers;
        fb.followersText = followersText;
      }
      if (verified) fb.verified = true;
      if (visiblePosts > 0) fb.visiblePosts = visiblePosts;
      if (metaImage) fb.metaImage = metaImage;
      profileData = fb;
    }

    const normalizedData = normalizeProfileData("facebook", profileData);
    const normalizedUrl = `https://www.facebook.com/${pageId}/`;

    // ===== 1b. Optional: Meta Graph API enrichment (REAL official source) =====
    // When the site owner's Meta App credentials are configured on the server
    // (FACEBOOK_APP_ID / FACEBOOK_APP_SECRET, or META_APP_ID / META_APP_SECRET),
    // pull genuinely public Page fields with an APP access token (appId|appSecret).
    // These public fields (name, about, link, website, fan_count, picture,
    // category) need no App Review. Best-effort only: any failure keeps the
    // public HTML extraction result untouched — no metric is ever invented.
    let enrichedViaGraph = false;
    const metaCfg = getMetaConfig();
    if (metaCfg.appId && metaCfg.appSecret) {
      try {
        const graphParams = new URLSearchParams({
          fields: "name,about,link,website,fan_count,category,picture.type(large)",
          access_token: `${metaCfg.appId}|${metaCfg.appSecret}`,
        });
        const graphRes = await safeFetch(
          `https://graph.facebook.com/v20.0/${encodeURIComponent(pageId)}?${graphParams.toString()}`,
          { headers: { Accept: "application/json" }, cache: "no-store" },
          12000
        );
        if (graphRes.ok) {
          const graphData: any = await graphRes.json().catch(() => null);
          if (graphData && !graphData.error) {
            if (typeof graphData.name === "string" && graphData.name.length > 0) {
              profileData.pageName = decodeEntities(graphData.name);
            }
            if (typeof graphData.about === "string" && graphData.about.trim().length > 0) {
              const aboutTxt = decodeEntities(graphData.about).replace(/\s+/g, " ").trim();
              profileData.about = aboutTxt;
              profileData.aboutText = aboutTxt;
              profileData.hasAbout = aboutTxt.length > 20;
            }
            const parsedFans = Number(graphData.fan_count);
            if (Number.isFinite(parsedFans) && parsedFans > 0) {
              profileData.followers = parsedFans;
              profileData.followersText = formatFollowerText(parsedFans);
            }
            const graphLinks: string[] = [];
            if (typeof graphData.website === "string" && graphData.website.length > 0)
              graphLinks.push(graphData.website);
            if (typeof graphData.link === "string" && graphData.link.length > 0)
              graphLinks.push(graphData.link);
            if (graphLinks.length > 0) {
              profileData.links = Array.from(new Set(graphLinks));
            }
            if (typeof graphData.category === "string" && graphData.category.length > 0) {
              profileData.category = graphData.category;
            }
            const picUrl = graphData?.picture?.data?.url;
            if (typeof picUrl === "string" && picUrl.length > 0) {
              profileData.profilePicUrl = picUrl;
              profileData.metaImage = picUrl;
            }
            enrichedViaGraph = true;
          }
        }
      } catch {
        // Best-effort: keep the public HTML extraction result untouched.
      }
    }

    // Honest confidence: pageId/pageName are structural (derived from the URL).
    // "high" is only warranted when genuinely extracted signals exist.
    const realSignalCount =
      ((profileData.followers || 0) > 0 ? 1 : 0) +
      (profileData.hasAbout ? 1 : 0) +
      (profileData.metaImage ? 1 : 0) +
      (profileData.verified ? 1 : 0) +
      ((profileData.visiblePosts || 0) > 0 ? 1 : 0);
    const hasSourceData = realSignalCount > 0 || enrichedViaGraph;
    const sourceConfidence = hasSourceData ? "high" : "low";
    const dataSources: string[] = [];
    if (enrichedViaGraph) dataSources.push("facebook-graph-api");
    if (hasSourceData) {
      if (!dataSources.includes("facebook-public-page")) dataSources.push("facebook-public-page");
      if (!dataSources.includes("facebook-og")) dataSources.push("facebook-og");
    }
    if (dataSources.length === 0) dataSources.push("facebook-public-page");

    recordAnalysis("facebook", true);
    return NextResponse.json(
      await buildSocialAnalysisResponse({
        platform: "facebook",
        username: pageId,
        url: normalizedUrl,
        locale,
        profileData: {
          ...profileData,
          ...normalizedData,
        },
        extraData: {
          metaImage: profileData.metaImage || null,
        },
        dataSources,
        sourceConfidence,
        startTime,
      })
    );
  } catch (error: any) {
    recordAnalysis("facebook", false);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to analyze Facebook page" },
      { status: 500 }
    );
  }
}

function matchMeta(html: string, prop: string): string | null {
  const attr = `(?:property|name)`;
  const re1 = new RegExp(`<meta[^>]+${attr}=["']${prop}["'][^>]*content=["']([^"']+)["']`, "i");
  const m1 = html.match(re1);
  if (m1) return decodeEntities(m1[1]);
  const re2 = new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+${attr}=["']${prop}["']`, "i");
  const m2 = html.match(re2);
  if (m2) return decodeEntities(m2[1]);
  return null;
}

function decodeEntities(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

// Extracts a REAL follower/like count only when the platform actually exposes
// it in the public HTML (embedded JSON or visible text). Returns 0 otherwise —
// never guesses.
function extractFollowerCount(html: string): number {
  const jsonPatterns = [
    /["']follower_count["']\s*:\s*(\d+)/i,
    /["']followerCount["']\s*:\s*(\d+)/i,
    /["']pageLikes["']\s*:\s*(\d+)/i,
    /["']likes["']\s*:\s*(\d{4,})/i,
    /["']followers["']\s*:\s*(\d+)/i,
  ];
  for (const p of jsonPatterns) {
    const m = html.match(p);
    if (m) {
      const parsed = parseInt(m[1], 10);
      if (parsed > 0) return parsed;
    }
  }
  // Visible text like "1.2M followers" or "12,345 followers"
  const txt = html.match(/id=["']PagesLikesCountDOMID["'][^>]*>([^<]+)/i) ||
              html.match(/([0-9][0-9.,]*\s*[KM]?)\s*(?:followers|follow|people like this)\b/i);
  if (txt) {
    const parsed = parseCountString(txt[1]);
    if (parsed > 0) return parsed;
  }
  return 0;
}

function formatFollowerText(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(n);
}

function extractFacebookPageId(url: string): string | null {
  // Handle facebook.com/username
  const match = url.match(/(?:facebook\.com|fb\.com)\/(?:pages\/[^/]+\/)?([a-zA-Z0-9\.\-_]+)/i);
  if (match) {
    const id = match[1].replace(/[\/?#].*$/, "");
    if (id !== "profile.php" && id !== "share" && id !== "login" && id !== "groups") {
      return id.replace(/^@/, "");
    }
  }

  // Handle profile.php?id=XXXX
  const profileMatch = url.match(/profile\.php\?id=(\d+)/i);
  if (profileMatch) return profileMatch[1];

  return null;
}

function parseCountString(str: string): number {
  const cleaned = str.replace(/[^0-9.KM]/gi, "");
  if (cleaned.endsWith("M")) return parseFloat(cleaned) * 1000000;
  if (cleaned.endsWith("K")) return parseFloat(cleaned) * 1000;
  return parseFloat(cleaned) || 0;
}