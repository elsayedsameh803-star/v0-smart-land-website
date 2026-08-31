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
 * Test Google Analytics 4
 */
export async function testGoogleAnalytics(): Promise<TestResult> {
  const start = Date.now();
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  if (!gaId) {
    return {
      platform: "Google Analytics",
      status: "warning",
      message: "NEXT_PUBLIC_GA_ID not configured",
      messageAr: "مُعرّف تحليلات جوجل NEXT_PUBLIC_GA_ID غير مُكوّن",
      responseTime: Date.now() - start,
    };
  }

  // Test if GA script is accessible
  try {
    const gaScriptUrl = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    const res = await fetch(gaScriptUrl, {
      signal: AbortSignal.timeout(10000),
    });

    if (res.ok) {
      return {
        platform: "Google Analytics",
        status: "success",
        message: "Google Analytics 4 script accessible",
        messageAr: "سكريبت تحليلات جوجل 4 متاح",
        data: {
          measurementId: gaId,
          scriptAccessible: true,
        },
        responseTime: Date.now() - start,
      };
    }

    return {
      platform: "Google Analytics",
      status: "error",
      message: `GA script returned ${res.status}`,
      messageAr: `سكريبت تحليلات جوجل أرجع ${res.status}`,
      responseTime: Date.now() - start,
    };
  } catch (error: any) {
    return {
      platform: "Google Analytics",
      status: "error",
      message: "Failed to access Google Analytics script",
      messageAr: "فشل الوصول لسكريبت تحليلات جوجل",
      error: error?.message || "Unknown error",
      responseTime: Date.now() - start,
    };
  }
}
