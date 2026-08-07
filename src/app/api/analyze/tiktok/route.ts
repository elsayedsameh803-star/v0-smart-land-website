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

    // Extract TikTok username/handle from URL
    const handle = extractTikTokHandle(url);
    if (!handle) {
      return NextResponse.json({ error: "Invalid TikTok URL" }, { status: 400 });
    }

    const startTime = Date.now();
    const cleanHandle = handle.replace(/^@/, "");
    let profileData: Record<string, any> = {};

    // ===== 1. Try TikTok oembed API first (official, reliable) =====
    let username = cleanHandle;
    let displayName = cleanHandle;
    let bio = "";
    let verified = false;
    let isPrivate = false;
    let avatarUrl = null;
    let following = 0;
    let followers = 0;
    let likes = 0;
    let videoCount = 0;
    let totalVideos = 0;
    let videos: any[] = [];

    try {
      const oembedRes = await safeFetch(`https://www.tiktok.com/oembed?url=https://www.tiktok.com/@${cleanHandle}`, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
          "Accept": "application/json",
        },
      });

      if (oembedRes.ok) {
        const oembedData = await oembedRes.json();
        if (oembedData.author_name) {
          displayName = oembedData.author_name;
        }
        if (oembedData.author_url) {
          const urlMatch = oembedData.author_url.match(/@([a-zA-Z0-9_\.]+)/i);
          if (urlMatch) username = urlMatch[1];
        }
        if (oembedData.thumbnail_url) {
          avatarUrl = oembedData.thumbnail_url;
        }
      }
    } catch {}

    // ===== 2. Try to fetch TikTok profile page for more data =====
    try {
      const profileRes = await safeFetch(`https://www.tiktok.com/@${cleanHandle}`, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9,ar;q=0.8",
          "Sec-Fetch-Dest": "document",
          "Sec-Fetch-Mode": "navigate",
          "Sec-Fetch-Site": "none",
          "Cache-Control": "no-cache",
        },
      });

      if (profileRes.ok) {
        const profileHtml = await profileRes.text();

        // Extract REAL data from TikTok page JSON
        const jsonData = extractTikTokJson(profileHtml);

        // Get profile info
        const profileDataJson = jsonData?.__DEFAULT_SCOPE__?.["webapp.user-detail"]?.userInfo?.user || null;
        const statsData = jsonData?.__DEFAULT_SCOPE__?.["webapp.user-detail"]?.userInfo?.stats || null;
        const postsData = jsonData?.__DEFAULT_SCOPE__?.["webapp.user-detail"]?.post || null;

        if (profileDataJson?.uniqueId) username = profileDataJson.uniqueId;
        if (profileDataJson?.nickname) displayName = profileDataJson.nickname;
        if (profileDataJson?.signature) bio = profileDataJson.signature;
        if (profileDataJson?.verified !== undefined) verified = profileDataJson.verified;
        if (profileDataJson?.privateAccount !== undefined) isPrivate = profileDataJson.privateAccount;
        if (profileDataJson?.avatarLarger) avatarUrl = profileDataJson.avatarLarger;
        else if (profileDataJson?.avatarMedium) avatarUrl = profileDataJson.avatarMedium;
        if (statsData?.followingCount !== undefined) following = statsData.followingCount;
        if (statsData?.followerCount !== undefined) followers = statsData.followerCount;
        if (statsData?.heartCount !== undefined) likes = statsData.heartCount;
        if (statsData?.videoCount !== undefined) videoCount = statsData.videoCount;
        if (postsData?.videos?.length) {
          totalVideos = postsData.videos.length;
          videos = postsData.videos;
        }
      }
    } catch {}

    // Extract hashtags from bio
    const bioHashtags = bio.match(/#[a-zA-Z0-9_]+/g) || [];

    // Extract links from bio
    const bioLinks = bio.match(/https?:\/\/[^\s]+/g) || [];

    // ===== 3. Fetch real video engagement data =====
    let totalViews = 0;
    let totalLikes = 0;
    let totalComments = 0;
    let totalShares = 0;
    const videoSamples: any[] = [];

    for (const video of videos.slice(0, 10)) {
      const videoUrl = `https://www.tiktok.com/@${cleanHandle}/video/${video.id}`;
      const vStats = video.stats || {};
      const vViews = vStats.playCount || 0;
      const vLikes = vStats.diggCount || 0;
      const vComments = vStats.commentCount || 0;
      const vShares = vStats.shareCount || 0;

      totalViews += vViews;
      totalLikes += vLikes;
      totalComments += vComments;
      totalShares += vShares;

      if (videoSamples.length < 5) {
        videoSamples.push({
          id: video.id,
          title: video.title || video.desc || "",
          views: vViews,
          likes: vLikes,
          comments: vComments,
          shares: vShares,
          duration: video.duration || 0,
          url: videoUrl,
          cover: video.cover || video.originCover || null,
        });
      }
    }

    // ===== 4. Calculate REAL metrics =====
    const sampleCount = Math.max(videoSamples.length, 1);
    const avgViewsPerVideo = totalVideos > 0 ? Math.round(totalViews / sampleCount) : 0;
    const avgEngagementRate = totalViews > 0 ? ((totalLikes + totalComments + totalShares) / totalViews) * 100 : 0;
    const videoPostingFrequency = totalVideos > 0 ? totalVideos / 30 : 0; // videos per month approx

    profileData = {
      username,
      displayName,
      bio,
      bioHashtags,
      bioLinks,
      verified,
      isPrivate,
      avatarUrl,
      followers,
      following,
      likes,
      videoCount,
      totalVideos,
      avgViewsPerVideo,
      avgEngagementRate,
      avgCommentsPerPost: totalComments > 0 ? Math.round(totalComments / sampleCount) : 0,
      videoPostingFrequency,
    };

    const normalizedData = normalizeProfileData("tiktok", profileData);
    const normalizedUrl = `https://www.tiktok.com/@${cleanHandle}`;

    recordAnalysis("tiktok", true);
    return NextResponse.json(
      buildSocialAnalysisResponse({
        platform: "tiktok",
        username: cleanHandle,
        url: normalizedUrl,
        locale,
        profileData: {
          ...profileData,
          ...normalizedData,
        },
        extraData: {
          avatarUrl,
          videoSamples,
          videoPostingFrequency,
        },
        startTime,
      })
    );
  } catch (error: any) {
    recordAnalysis("tiktok", false);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to analyze TikTok profile" },
      { status: 500 }
    );
  }
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function extractTikTokHandle(url: string): string | null {
  // Pattern: tiktok.com/@username
  const match = url.match(/(?:tiktok\.com\/)(?:@)?([a-zA-Z0-9_\.]{2,24})/i);
  if (match) return match[1].replace(/\.$/, "");

  // Just a username
  const clean = url.replace(/^https?:\/\//, "").replace(/^www\./, "");
  if (/^@?[a-zA-Z0-9_\.]{2,24}$/.test(clean)) {
    return clean.replace(/^@/, "").replace(/\.$/, "");
  }

  return null;
}

function extractTikTokJson(html: string): any {
  // Try to find the main JSON data in script tags
  const scripts = html.match(/<script[^>]*id=["']__UNIVERSAL_DATA_FOR_REHYDRATION__["'][^>]*>([\s\S]*?)<\/script>/i);
  if (scripts && scripts[1]) {
    try {
      return JSON.parse(scripts[1]);
    } catch {}
  }

  // Try NEXT_DATA (TikTok sometimes uses this)
  const nextData = html.match(/<script[^>]*id=["']__NEXT_DATA__["'][^>]*>([\s\S]*?)<\/script>/i);
  if (nextData && nextData[1]) {
    try {
      return JSON.parse(nextData[1]);
    } catch {}
  }

  // Try to find any JSON-LD
  const jsonLd = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i);
  if (jsonLd && jsonLd[1]) {
    try {
      return JSON.parse(jsonLd[1]);
    } catch {}
  }

  // Search for user data in inline scripts
  const userMatch = html.match(/"userInfo":\{[^}]*"uniqueId":"([^"]+)"/);
  if (userMatch) return { __DEFAULT_SCOPE__: { "webapp.user-detail": { userInfo: { user: { uniqueId: userMatch[1] } } } } };

  return null;
}