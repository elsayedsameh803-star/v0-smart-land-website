import { NextRequest, NextResponse } from "next/server";
import { testYouTubeAPI } from "./tests/youtube";
import { testTikTokAPI } from "./tests/tiktok";
import { testFacebookAPI } from "./tests/facebook";
import { testInstagramAPI } from "./tests/instagram";
import { testGoogleAnalytics } from "./tests/google-analytics";
import { testSearchConsole } from "./tests/search-console";

export const dynamic = "force-dynamic";

interface TestResult {
  platform: string;
  status: "success" | "error" | "warning" | "skipped";
  message: string;
  messageAr: string;
  data?: Record<string, any>;
  error?: string;
  responseTime?: number;
}

/**
 * Live API Test Console
 * Tests real connections to all social media platforms and Google services
 */
export async function POST(request: NextRequest) {
  try {
    const { platform } = await request.json().catch(() => ({ platform: "all" }));
    const results: TestResult[] = [];

    if (platform === "all" || platform === "youtube") {
      results.push(await testYouTubeAPI());
    }
    if (platform === "all" || platform === "tiktok") {
      results.push(await testTikTokAPI());
    }
    if (platform === "all" || platform === "facebook") {
      results.push(await testFacebookAPI());
    }
    if (platform === "all" || platform === "instagram") {
      results.push(await testInstagramAPI());
    }
    if (platform === "all" || platform === "google") {
      results.push(await testGoogleAnalytics());
    }
    if (platform === "all" || platform === "search-console") {
      results.push(await testSearchConsole());
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results,
      summary: {
        total: results.length,
        success: results.filter((r) => r.status === "success").length,
        error: results.filter((r) => r.status === "error").length,
        warning: results.filter((r) => r.status === "warning").length,
        skipped: results.filter((r) => r.status === "skipped").length,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Test failed",
      },
      { status: 500 }
    );
  }
}
