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
 * Test TikTok API (oEmbed - public, no credentials needed)
 */
export async function testTikTokAPI(): Promise<TestResult> {
  const start = Date.now();
  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET;

  // Test oEmbed first (public, no credentials)
  try {
    const testUrl = "https://www.tiktok.com/@tiktok/video/7000000000000000000";
    const oEmbedRes = await fetch(
      `https://www.tiktok.com/oembed?url=${encodeURIComponent(testUrl)}`,
      {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(12000),
      }
    );

    if (oEmbedRes.ok) {
      const oEmbedData = await oEmbedRes.json();
      return {
        platform: "TikTok",
        status: "success",
        message: "TikTok oEmbed API connected (public data available)",
        messageAr: "تم الاتصال بـ TikTok oEmbed (بيانات عامة متاحة)",
        data: {
          title: oEmbedData?.title,
          authorName: oEmbedData?.author_name,
          thumbnailUrl: oEmbedData?.thumbnail_url ? "Available" : "None",
          hasClientKey: !!clientKey,
          hasClientSecret: !!clientSecret,
        },
        responseTime: Date.now() - start,
      };
    }
  } catch {
    // oEmbed failed, continue to check credentials
  }

  // Check if credentials are configured
  if (!clientKey) {
    return {
      platform: "TikTok",
      status: "warning",
      message: "TIKTOK_CLIENT_KEY not configured. oEmbed also unavailable.",
      messageAr: "مفتاح TIKTOK_CLIENT_KEY غير مُكوّن. oEmbed غير متاح أيضاً.",
      responseTime: Date.now() - start,
    };
  }

  // Test Research API token exchange
  try {
    const tokenRes = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_key: clientKey,
        client_secret: clientSecret || "",
        grant_type: "client_credentials",
      }).toString(),
      signal: AbortSignal.timeout(15000),
    });

    const tokenData = await tokenRes.json().catch(() => null);

    if (tokenData?.data?.access_token) {
      return {
        platform: "TikTok",
        status: "success",
        message: "TikTok Research API connected (client credentials valid)",
        messageAr: "تم الاتصال بـ TikTok Research API (بيانات الاعتماد صالحة)",
        data: {
          hasAccessToken: true,
          tokenType: tokenData.data.token_type,
        },
        responseTime: Date.now() - start,
      };
    }

    return {
      platform: "TikTok",
      status: "warning",
      message: "TikTok credentials configured but token exchange failed",
      messageAr: "بيانات الاعتماد مُكوّنة لكن فشل الحصول على التوكن",
      error: tokenData?.error?.message || "Token exchange failed",
      responseTime: Date.now() - start,
    };
  } catch (error: any) {
    return {
      platform: "TikTok",
      status: "error",
      message: "Failed to connect to TikTok API",
      messageAr: "فشل الاتصال بـ TikTok API",
      error: error?.message || "Unknown error",
      responseTime: Date.now() - start,
    };
  }
}
