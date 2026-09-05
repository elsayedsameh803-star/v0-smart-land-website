import { getYouTubeApiKey } from "@/lib/oauth-config";
import { getSiteUrl } from "@/lib/site-config";

export interface TestResult {
  platform: string;
  status: "success" | "error" | "warning" | "skipped";
  message: string;
  messageAr: string;
  data?: Record<string, any>;
  error?: string;
  responseTime?: number;
}

/**
 * Test YouTube Data API v3
 */
export async function testYouTubeAPI(): Promise<TestResult> {
  const start = Date.now();
  const apiKey = getYouTubeApiKey();

  if (!apiKey) {
    return {
      platform: "YouTube",
      status: "warning",
      message: "YouTube API key not configured (set GOOGLE_API_KEY or YOUTUBE_API_KEY)",
      messageAr: "مفتاح YouTube API غير مُكوّن (GOOGLE_API_KEY أو YOUTUBE_API_KEY)",
      responseTime: Date.now() - start,
    };
  }

  try {
    const testVideoId = "dQw4w9WgXcQ";
    const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${testVideoId}&key=${apiKey}`;
    
    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
        Referer: `${getSiteUrl()}/`,
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return {
        platform: "YouTube",
        status: "error",
        message: `API returned ${res.status}`,
        messageAr: `الـ API أرجع خطأ ${res.status}`,
        error: errorData?.error?.message || `HTTP ${res.status}`,
        responseTime: Date.now() - start,
      };
    }

    const data = await res.json();
    const video = data?.items?.[0];

    if (!video) {
      return {
        platform: "YouTube",
        status: "warning",
        message: "API connected but no video data returned",
        messageAr: "تم الاتصال لكن لم يتم العثور على بيانات الفيديو",
        responseTime: Date.now() - start,
      };
    }

    return {
      platform: "YouTube",
      status: "success",
      message: "YouTube Data API v3 connected successfully",
      messageAr: "تم الاتصال بـ YouTube Data API v3 بنجاح",
      data: {
        videoTitle: video.snippet?.title,
        channelTitle: video.snippet?.channelTitle,
        viewCount: video.statistics?.viewCount,
        likeCount: video.statistics?.likeCount,
        commentCount: video.statistics?.commentCount,
      },
      responseTime: Date.now() - start,
    };
  } catch (error: any) {
    return {
      platform: "YouTube",
      status: "error",
      message: "Failed to connect to YouTube API",
      messageAr: "فشل الاتصال بـ YouTube API",
      error: error?.message || "Unknown error",
      responseTime: Date.now() - start,
    };
  }
}
