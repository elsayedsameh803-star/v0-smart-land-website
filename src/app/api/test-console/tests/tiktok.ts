import { getTikTokClientKey, getTikTokClientSecret } from "@/lib/tiktok-api";

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
  // Resolve credentials exactly like the analyzer does (canonical + legacy
  // Vercel names), so this test reflects what production actually uses.
  const clientKey = getTikTokClientKey();
  const clientSecret = getTikTokClientSecret();

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
      // ---- REAL data probe: query a known public account via Research API ----
      // Token issuance alone does not prove data access — the project must be
      // Research-approved. Probing user/info for the official @tiktok account
      // verifies the full pipeline end-to-end (no secrets are ever returned).
      const probe: Record<string, any> = { attempted: true };
      try {
        const probeRes = await fetch(
          "https://open.tiktokapis.com/v2/research/user/info/?fields=" +
            encodeURIComponent("display_name,follower_count,likes_count,video_count,is_verified"),
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${tokenData.data.access_token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ username: "tiktok" }),
            signal: AbortSignal.timeout(15000),
          }
        );
        const probeData: any = await probeRes.json().catch(() => null);
        if (probeRes.ok && probeData?.data && typeof probeData.data.follower_count !== "undefined") {
          probe.ok = true;
          probe.displayName = probeData.data.display_name;
          probe.followerCount = probeData.data.follower_count;
          probe.likesCount = probeData.data.likes_count;
          probe.videoCount = probeData.data.video_count;
          probe.verified = probeData.data.is_verified;
        } else {
          probe.ok = false;
          probe.httpStatus = probeRes.status;
          probe.errorCode = probeData?.error?.code || "";
          probe.errorMessage = probeData?.error?.message || "";
        }
      } catch (e: any) {
        probe.ok = false;
        probe.exception = e?.message || "research probe failed";
      }

      const realDataOk = probe.ok === true;
      return {
        platform: "TikTok",
        status: "success",
        message: realDataOk
          ? "TikTok Research API connected AND returning REAL account data (user/info verified)"
          : "TikTok client credentials valid, but Research API data access failed (project may not be Research-approved)",
        messageAr: realDataOk
          ? "TikTok Research API متصل ويعيد بيانات حساب حقيقية (تم التحقق عبر user/info)"
          : "بيانات اعتماد TikTok صالحة، لكن الوصول لبيانات Research API فشل (قد لا يكون المشروع معتمداً كـ Research)",
        data: {
          hasAccessToken: true,
          tokenType: tokenData.data.token_type,
          researchProbe: probe,
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
