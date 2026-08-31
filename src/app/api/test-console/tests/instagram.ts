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
 * Test Instagram (via Facebook Graph API)
 */
export async function testInstagramAPI(): Promise<TestResult> {
  const start = Date.now();
  const appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || process.env.FACEBOOK_APP_ID || process.env.META_APP_ID;
  const appSecret = process.env.FACEBOOK_CLIENT_SECRET || process.env.FACEBOOK_APP_SECRET || process.env.META_APP_SECRET;

  if (!appId) {
    return {
      platform: "Instagram",
      status: "warning",
      message: "Instagram requires Facebook App ID (via Meta Graph API)",
      messageAr: "إنستجرام يتطلب معرف تطبيق فيسبوك (عبر Meta Graph API)",
      responseTime: Date.now() - start,
    };
  }

  // Test public Instagram page scraping
  try {
    const testUsername = "instagram";
    const res = await fetch(`https://www.instagram.com/${testUsername}/`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      signal: AbortSignal.timeout(15000),
    });

    if (res.ok) {
      const html = await res.text();
      const hasContent = html.length > 500;
      const metaTitle = html.match(/<title>([^<]+)<\/title>/i)?.[1] || null;

      return {
        platform: "Instagram",
        status: "success",
        message: "Instagram public profile scraping available",
        messageAr: "تحليل البروفايلات العامة على إنستجرام متاح",
        data: {
          profileAccessible: hasContent,
          metaTitle,
          hasAppId: !!appId,
          hasAppSecret: !!appSecret,
        },
        responseTime: Date.now() - start,
      };
    }

    return {
      platform: "Instagram",
      status: "warning",
      message: `Instagram page returned ${res.status}`,
      messageAr: `صفحة إنستجرام أرجعت ${res.status}`,
      responseTime: Date.now() - start,
    };
  } catch (error: any) {
    return {
      platform: "Instagram",
      status: "error",
      message: "Failed to connect to Instagram",
      messageAr: "فشل الاتصال بإنستجرام",
      error: error?.message || "Unknown error",
      responseTime: Date.now() - start,
    };
  }
}
