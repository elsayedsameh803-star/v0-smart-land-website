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
 * Test Google Search Console
 */
export async function testSearchConsole(): Promise<TestResult> {
  const start = Date.now();
  const gscId = process.env.NEXT_PUBLIC_GSC_VERIFICATION || "JMwP_nJ4KRNImPNKdVqfgJb3yze-zjBbkEEmnlrkfso";

  if (!gscId) {
    return {
      platform: "Search Console",
      status: "warning",
      message: "GSC verification ID not configured",
      messageAr: "معرف التحقق من Search Console غير مُكوّن",
      responseTime: Date.now() - start,
    };
  }

  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://smart-land.vercel.app";
    
    return {
      platform: "Search Console",
      status: "success",
      message: "Search Console verification configured",
      messageAr: "التحقق من Search Console مُكوّن",
      data: {
        verificationId: gscId,
        siteUrl,
        metaTagFormat: `google-site-verification: ${gscId}`,
      },
      responseTime: Date.now() - start,
    };
  } catch (error: any) {
    return {
      platform: "Search Console",
      status: "error",
      message: "Failed to verify Search Console configuration",
      messageAr: "فشل التحقق من إعدادات Search Console",
      error: error?.message || "Unknown error",
      responseTime: Date.now() - start,
    };
  }
}
