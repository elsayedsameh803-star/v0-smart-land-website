import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    if (!url) throw new Error("URL required");

    const videoId = extractVideoId(url);
    if (!videoId) {
      return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 });
    }

    // Fetch YouTube page publicly
    const res = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
    });
    const html = await res.text();

    // Extract public data
    const title = html.match(/<title>([^<]+)<\/title>/i)?.[1]?.replace(" - YouTube", "") || "Unknown";
    const viewsMatch = html.match(/"viewCount":"(\d+)"/);
    const likesMatch = html.match(/"likeCount":"(\d+)"/);
    const subsMatch = html.match(/"subscriberCountText":\{"simpleText":"([^"]+)"/);
    const descMatch = html.match(/"shortDescription":"([^"]+)"/);

    const views = viewsMatch ? parseInt(viewsMatch[1]) : 0;
    const likes = likesMatch ? parseInt(likesMatch[1]) : 0;
    const subscriberText = subsMatch?.[1] || "Unknown";
    const description = descMatch?.[1]?.replace(/\\n/g, " ") || "No description";

    // Performance score based on views ratio
    const titleScore = title.length > 20 ? 90 : title.length > 10 ? 70 : 50;
    const descScore = description.length > 100 ? 90 : description.length > 50 ? 70 : 50;
    const engagementScore = views > 100000 ? 95 : views > 10000 ? 80 : views > 1000 ? 65 : 50;

    return NextResponse.json({
      success: true,
      data: {
        platform: "youtube",
        title,
        description: description.slice(0, 200),
        views,
        likes,
        subscribers: subscriberText,
        videoId,
        url: `https://youtube.com/watch?v=${videoId}`,
        overallScore: Math.round((titleScore + descScore + engagementScore) / 3),
        scores: {
          titleOptimization: { score: titleScore },
          descriptionQuality: { score: descScore },
          engagement: { score: engagementScore },
        },
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to analyze YouTube video" }, { status: 500 });
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