import { NextRequest, NextResponse } from "next/server";
import { buildSocialAnalysisResponse, normalizeProfileData } from "@/lib/social-analysis-helper";

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
      const res = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
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

    const normalizedData = normalizeProfileData("youtube", profileData);
    const normalizedUrl = `https://youtube.com/watch?v=${videoId}`;

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
          duration: profileData.duration || 0,
          category: profileData.category || null,
        },
        startTime,
      })
    );
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message || "Failed to analyze YouTube video" 
    }, { status: 500 });
  }
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