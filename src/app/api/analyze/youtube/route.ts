import { NextRequest, NextResponse } from "next/server";
import { buildSocialAnalysisResponse, normalizeProfileData } from "@/lib/social-analysis-helper";
import { safeFetch } from "@/lib/security";
import { recordAnalysis } from "@/lib/admin-stats";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { url, locale } = await request.json();
    if (!url) {
      return NextResponse.json({ error: "URL required" }, { status: 400 });
    }

    const videoId = extractVideoId(url);
    if (!videoId) {
      return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 });
    }

    const startTime = Date.now();
    let profileData: Record<string, any> = {};

    // Fetch YouTube page publicly - real data extraction
    try {
      const res = await safeFetch(`https://www.youtube.com/watch?v=${videoId}`, {
        headers: { 
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept-Language": "en-US,en;q=0.9",
        },
      });

      if (res.ok) {
        const html = await res.text();
        const lowerHtml = html.toLowerCase();

        // Extract real public data from YouTube page
        const title = html.match(/<title>([^<]+)<\/title>/i)?.[1]?.replace(" - YouTube", "").trim() || null;
        const viewsMatch = html.match(/"viewCount":"(\d+)"/);
        const likesMatch = html.match(/"likeCount":"(\d+)"/);
        const subsMatch = html.match(/"subscriberCountText":\{"simpleText":"([^"]+)"/);
        const descMatch = html.match(/"shortDescription":"([^"]+)"/);
        const channelNameMatch = html.match(/"author":"([^"]+)"/);
        const channelIdMatch = html.match(/"channelId":"([^"]+)"/);
        const commentCountMatch = html.match(/"commentCount":"(\d+)"/);
        const durationMatch = html.match(/"lengthSeconds":"(\d+)"/);
        const categoryMatch = html.match(/"category":"([^"]+)"/);
        const tagsMatch = html.match(/"keywords":\[([^\]]+)\]/);

        const views = viewsMatch ? parseInt(viewsMatch[1]) : 0;
        const likes = likesMatch ? parseInt(likesMatch[1]) : 0;
        const commentCount = commentCountMatch ? parseInt(commentCountMatch[1]) : 0;
        const duration = durationMatch ? parseInt(durationMatch[1]) : 0;
        const subscriberText = subsMatch?.[1] || null;
        const description = descMatch?.[1]?.replace(/\\n/g, " ").replace(/\\"/g, '"') || null;
        const channelName = channelNameMatch?.[1] || null;
        const channelId = channelIdMatch?.[1] || null;
        const category = categoryMatch?.[1] || null;
        const tags = tagsMatch ? tagsMatch[1].split(",").map((t: string) => t.trim().replace(/"/g, "")).filter(Boolean) : [];

        // Extract hashtags from description
        const hashtags = description ? description.match(/#[a-zA-Z0-9_]+/g) || [] : [];

        // Calculate engagement rate (real metric)
        const engagementRate = views > 0 ? ((likes + commentCount) / views) * 100 : 0;

        // Parse subscriber text like "1.2M" or "1,234"
        let subscribers = 0;
        if (subscriberText) {
          const cleaned = subscriberText.replace(/[^0-9.KM]/gi, "");
          if (cleaned.endsWith("M")) subscribers = parseFloat(cleaned) * 1000000;
          else if (cleaned.endsWith("K")) subscribers = parseFloat(cleaned) * 1000;
          else subscribers = parseFloat(cleaned) || 0;
        }

        profileData = {
          username: channelName || videoId,
          displayName: channelName || videoId,
          title,
          description,
          views,
          likes,
          commentCount,
          subscribers,
          subscribersText: subscriberText,
          channelName,
          channelId,
          category,
          duration,
          tags,
          hashtags,
          engagementRate,
          fullName: channelName || videoId,
          bio: description || "",
          bioHashtags: hashtags,
          postsCount: 0,
          followers: subscribers,
        };
      }
    } catch {
      // Fall through - use intelligent engine
    }

    // ===== YouTube Data API v3 - authoritative real metrics (when API key is set) =====
    const apiKey = process.env.GOOGLE_API_KEY;
    if (apiKey) {
      try {
        const apiResult = await fetchYouTubeApiData(videoId, apiKey);
        if (apiResult) {
          // Overlay real API metrics onto any scraped data (never hard-fail)
          profileData = { ...profileData, ...apiResult.profile };
        }
      } catch {
        // keep scraped data - analysis still returns real, partial evidence
      }
    }

    const normalizedData = normalizeProfileData("youtube", profileData);
    const normalizedUrl = `https://youtube.com/watch?v=${videoId}`;

    recordAnalysis("youtube", true);
    return NextResponse.json(
      buildSocialAnalysisResponse({
        platform: "youtube",
        username: (profileData.channelName || videoId).toLowerCase().replace(/[^a-z0-9]/g, "") || videoId,
        url: normalizedUrl,
        locale,
        profileData: {
          ...profileData,
          ...normalizedData,
        },
        extraData: {
          videoId,
          videoTitle: profileData.title || null,
          views: profileData.views || 0,
          likes: profileData.likes || 0,
          commentCount: profileData.commentCount || 0,
          subscribers: profileData.subscribers || 0,
          videoCount: profileData.postsCount || profileData.channelVideoCount || 0,
          channelTitle: profileData.channelName || null,
          duration: profileData.duration || 0,
          category: profileData.category || null,
          publishedAt: profileData.publishedAt || null,
          thumbnail: profileData.avatarUrl || null,
          dataSource: profileData.dataSource || "youtube-page-scrape",
        },
        startTime,
      })
    );
  } catch (error: any) {
    recordAnalysis("youtube", false);
    return NextResponse.json({ 
      success: false, 
      error: error.message || "Failed to analyze YouTube video" 
    }, { status: 500 });
  }
}

interface YouTubeApiResult {
  profile: Record<string, any>;
}

/**
 * Fetches authoritative, real metrics for a YouTube video + channel using the
 * official YouTube Data API v3. Requires GOOGLE_API_KEY. Returns null on any
 * failure so the analyzer never hard-fails (it keeps scraped/partial evidence).
 */
async function fetchYouTubeApiData(
  videoId: string,
  apiKey: string
): Promise<YouTubeApiResult | null> {
  const videoRes = await safeFetch(
    `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoId}&key=${apiKey}`,
    { headers: { Accept: "application/json" } },
    15000
  );
  if (!videoRes.ok) return null;
  const videoJson = await videoRes.json();
  const item = videoJson?.items?.[0];
  if (!item) return null;

  const snippet = item.snippet || {};
  const stats = item.statistics || {};

  const views = parseInt(stats.viewCount || "0", 10) || 0;
  const likes = parseInt(stats.likeCount || "0", 10) || 0;
  const commentCount = parseInt(stats.commentCount || "0", 10) || 0;
  const durationIso = item.contentDetails?.duration || "";
  const duration = parseIsoDurationSeconds(durationIso);
  const description = snippet.description || "";
  const tags: string[] = Array.isArray(snippet.tags) ? snippet.tags : [];
  const hashtags = description.match(/#[a-zA-Z0-9_]+/g) || [];
  const engagement = views > 0 ? ((likes + commentCount) / views) * 100 : 0;

  const thumbnail =
    snippet.thumbnails?.maxres?.url ||
    snippet.thumbnails?.high?.url ||
    snippet.thumbnails?.default?.url ||
    null;

  const channelId = snippet.channelId || "";
  let subscribers = 0;
  let videoCount = 0;
  let channelViews = 0;
  let channelTitle = snippet.channelTitle || "";

  if (channelId) {
    try {
      const chRes = await safeFetch(
        `https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet&id=${channelId}&key=${apiKey}`,
        { headers: { Accept: "application/json" } },
        15000
      );
      if (chRes.ok) {
        const chJson = await chRes.json();
        const ch = chJson?.items?.[0];
        if (ch) {
          subscribers = parseInt(ch.statistics?.subscriberCount || "0", 10) || 0;
          videoCount = parseInt(ch.statistics?.videoCount || "0", 10) || 0;
          channelViews = parseInt(ch.statistics?.viewCount || "0", 10) || 0;
          channelTitle = ch.snippet?.title || channelTitle;
        }
      }
    } catch {
      // optional channel enrichment
    }
  }

  return {
    profile: {
      title: snippet.title || null,
      description: description || null,
      views,
      likes,
      commentCount,
      subscribers,
      subscribersText: formatCount(subscribers),
      followers: subscribers,
      postsCount: videoCount,
      channelId,
      channelName: channelTitle,
      displayName: channelTitle,
      fullName: channelTitle,
      avatarUrl: thumbnail,
      category: snippet.categoryId || null,
      duration,
      tags,
      hashtags: hashtags.map((h: string) => h.replace("#", "")),
      engagementRate: Math.round(engagement * 100) / 100,
      publishedAt: snippet.publishedAt || null,
      channelSubscribers: subscribers,
      channelVideoCount: videoCount,
      channelViewCount: channelViews,
      dataSource: "youtube-data-api",
    },
  };
}

/** Converts ISO-8601 duration (PT#H#M#S) to total seconds. */
function parseIsoDurationSeconds(iso: string): number {
  if (!iso) return 0;
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return 0;
  const h = parseInt(m[1] || "0", 10);
  const min = parseInt(m[2] || "0", 10);
  const s = parseInt(m[3] || "0", 10);
  return h * 3600 + min * 60 + s;
}

/** Formats a number as a compact count (e.g. 1.2M, 45K). */
function formatCount(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(n % 1000000 === 0 ? 0 : 1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K`;
  return String(n);
}

function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}