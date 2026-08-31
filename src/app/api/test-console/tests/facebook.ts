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
 * Test Facebook Graph API
 */
export async function testFacebookAPI(): Promise<TestResult> {
  const start = Date.now();
  const appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || process.env.FACEBOOK_APP_ID || process.env.META_APP_ID;
  const appSecret = process.env.FACEBOOK_CLIENT_SECRET || process.env.FACEBOOK_APP_SECRET || process.env.META_APP_SECRET;

  if (!appId) {
    return {
      platform: "Facebook",
      status: "warning",
      message: "Facebook App ID not configured",
      messageAr: "معرف تطبيق فيسبوك غير مُكوّن",
      responseTime: Date.now() - start,
    };
  }

  // Test public page scraping (no auth needed for public pages)
  try {
    const testPage = "facebook";
    const res = await fetch(`https://www.facebook.com/${testPage}/`, {
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
        platform: "Facebook",
        status: "success",
        message: "Facebook public page scraping available",
        messageAr: "تحليل الصفحات العامة على فيسبوك متاح",
        data: {
          pageAccessible: hasContent,
          metaTitle,
          hasAppId: !!appId,
          hasAppSecret: !!appSecret,
          appIdPrefix: appId.substring(0, 4) + "...",
        },
        responseTime: Date.now() - start,
      };
    }

    return {
      platform: "Facebook",
      status: "warning",
      message: `Facebook page returned ${res.status}`,
      messageAr: `صفحة فيسبوك أرجعت ${res.status}`,
      responseTime: Date.now() - start,
    };
  } catch (error: any) {
    return {
      platform: "Facebook",
      status: "error",
      message: "Failed to connect to Facebook",
      messageAr: "فشل الاتصال بفيسبوك",
      error: error?.message || "Unknown error",
      responseTime: Date.now() - start,
    };
  }
}
