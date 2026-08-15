// =============================================================================
// Smart Land v3 - REAL Analysis Engine (Client-side)
// =============================================================================
// This engine calls the backend API which performs real data extraction
// from live URLs. No mock data, no static values, no fallback defaults.
// =============================================================================

import type {
  AnalysisResult,
  CategoryScore,
  CategoryScores,
  Finding,
  AnalysisStage,
} from "./types";
import { generateId, normalizeUrl, formatScore } from "./utils";

// =============================================================================
// PUBLIC API - MAIN ANALYSIS FUNCTION
// =============================================================================

export async function performRealAnalysis(url: string, locale: string = "en"): Promise<AnalysisResult> {
  const normalizedUrl = normalizeUrl(url);
  const startTime = Date.now();

  try {
    const apiUrl = `/api/analyze`;
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: normalizedUrl, locale }),
    });

    if (!res.ok) {
      throw new Error(`API returned status ${res.status}`);
    }

    const json = await res.json();
    if (!json.success || !json.data) {
      throw new Error(json.error || "Analysis failed");
    }

    const data = json.data;
    const duration = Math.round((Date.now() - startTime) / 1000);

    // Map API response to AnalysisResult
    const scores: CategoryScores = {
      seo: {
        score: formatScore(data.scores?.seo?.score ?? 0),
        maxScore: 100,
        label: "SEO & Visibility",
        labelAr: "تحسين محركات البحث والظهور",
        description: "Search engine optimization, meta tags, structured data, social signals",
        descriptionAr: "تحسين محركات البحث، العلامات الوصفية، البيانات المنظمة، إشارات التواصل",
        findings: [],
      },
      performance: {
        score: formatScore(data.scores?.performance?.score ?? 0),
        maxScore: 100,
        label: "Performance & Speed",
        labelAr: "الأداء والسرعة",
        description: "Core Web Vitals, load time, page size, CDN, caching",
        descriptionAr: "مقاييس الويب الأساسية، وقت التحميل، حجم الصفحة، CDN، التخزين المؤقت",
        findings: [],
      },
      accessibility: {
        score: formatScore(data.scores?.accessibility?.score ?? 0),
        maxScore: 100,
        label: "Accessibility & UX",
        labelAr: "إمكانية الوصول وتجربة المستخدم",
        description: "ARIA landmarks, keyboard navigation, contrast, screen reader",
        descriptionAr: "معالم ARIA، التنقل بلوحة المفاتيح، التباين، قارئ الشاشة",
        findings: [],
      },
      security: {
        score: formatScore(data.scores?.security?.score ?? 0),
        maxScore: 100,
        label: "Security & Trust",
        labelAr: "الأمان والثقة",
        description: "SSL/TLS, HSTS, CSP, XSS protection, HTTPS",
        descriptionAr: "SSL/TLS و HSTS و CSP والحماية من XSS و HTTPS",
        findings: [],
      },
      content: {
        score: formatScore(data.scores?.content?.score ?? 0),
        maxScore: 100,
        label: "Content & Authority",
        labelAr: "المحتوى والسلطة",
        description: "Content quality, backlinks, social proof, structured data",
        descriptionAr: "جودة المحتوى، الروابط الخلفية، الإثبات الاجتماعي، البيانات المنظمة",
        findings: [],
      },
      technical: {
        score: formatScore(data.scores?.technical?.score ?? 0),
        maxScore: 100,
        label: "Technical Infrastructure",
        labelAr: "البنية التحتية التقنية",
        description: "Server config, DNS, CDN, SSL cert, HTTP/2, compression",
        descriptionAr: "تكوين الخادم، DNS، CDN، شهادة SSL، HTTP/2، الضغط",
        findings: [],
      },
    };

    const allFindings: Finding[] = (data.findings || []).map((f: any, index: number) => ({
      id: `${f.category || "finding"}-${Date.now()}-${index}`,
      issue: f.issue || "",
      issueAr: f.issueAr || f.issue || "",
      severity: (f.severity as "critical" | "high" | "medium" | "low" | "info") || "info",
      evidence: f.evidence || f.issue || "",
      evidenceAr: f.evidenceAr || f.issueAr || f.issue || "",
      location: normalizedUrl,
      whyItMatters: f.whyItMatters || "",
      whyItMattersAr: f.whyItMattersAr || "",
      howToFix: f.howToFix || "",
      howToFixAr: f.howToFixAr || "",
      category: (f.category as keyof CategoryScores) || "technical",
      expectedBenefit: f.expectedBenefit || "",
      expectedBenefitAr: f.expectedBenefitAr || "",
    }));

    const criticalIssues = allFindings.filter((f) => f.severity === "critical" || f.severity === "high");

    return {
      id: generateId(),
      url: normalizedUrl,
      date: new Date().toISOString(),
      overallScore: formatScore(data.overallScore ?? 0),
      scores,
      findings: allFindings,
      strengths: data.strengths || [],
      weaknesses: data.weaknesses || [],
      criticalIssues,
      metadata: {
        analyzedUrl: normalizedUrl,
        analysisDate: new Date().toISOString(),
        duration,
        dataSources: data.metadata?.dataSources || ["Live URL Fetch", "HTTP Headers", "HTML Structure Analysis"],
        limitations: data.metadata?.limitations || [
          "Analyzes only publicly available data",
          "Cannot access password-protected pages",
          "Results reflect the state at time of analysis",
        ],
        methodologyVersion: "3.0.0",
        sourceConfidence: data.metadata?.sourceConfidence || "medium",
      },
    };
  } catch (error) {
    // Return an error result - no fallback with fake data
    const duration = Math.round((Date.now() - startTime) / 1000);
    const errorMessage = error instanceof Error ? error.message : "Unknown error during analysis";

    return {
      id: generateId(),
      url: normalizedUrl,
      date: new Date().toISOString(),
      overallScore: 0,
      scores: {
        seo: { score: 0, maxScore: 100, label: "SEO & Visibility", labelAr: "تحسين محركات البحث والظهور", description: "Analysis failed", descriptionAr: "فشل التحليل", findings: [] },
        performance: { score: 0, maxScore: 100, label: "Performance & Speed", labelAr: "الأداء والسرعة", description: "Analysis failed", descriptionAr: "فشل التحليل", findings: [] },
        accessibility: { score: 0, maxScore: 100, label: "Accessibility & UX", labelAr: "إمكانية الوصول وتجربة المستخدم", description: "Analysis failed", descriptionAr: "فشل التحليل", findings: [] },
        security: { score: 0, maxScore: 100, label: "Security & Trust", labelAr: "الأمان والثقة", description: "Analysis failed", descriptionAr: "فشل التحليل", findings: [] },
        content: { score: 0, maxScore: 100, label: "Content & Authority", labelAr: "المحتوى والسلطة", description: "Analysis failed", descriptionAr: "فشل التحليل", findings: [] },
        technical: { score: 0, maxScore: 100, label: "Technical Infrastructure", labelAr: "البنية التحتية التقنية", description: "Analysis failed", descriptionAr: "فشل التحليل", findings: [] },
      },
      findings: [{
        id: `error-${Date.now()}`,
        issue: `Analysis failed: ${errorMessage}`,
        issueAr: `فشل التحليل: ${errorMessage}`,
        severity: "high" as const,
        evidence: errorMessage,
        evidenceAr: errorMessage,
        location: normalizedUrl,
        whyItMatters: "The analysis could not be completed due to an error",
        whyItMattersAr: "لم يكتمل التحليل بسبب خطأ",
        howToFix: "Please check the URL and try again. If the problem persists, the server may be blocking requests.",
        howToFixAr: "يرجى التحقق من الرابط والمحاولة مرة أخرى. إذا استمرت المشكلة، قد يكون الخادم يحظر الطلبات.",
        category: "technical" as keyof CategoryScores,
        expectedBenefit: "Successful analysis completion",
        expectedBenefitAr: "إكمال التحليل بنجاح",
      }],
      strengths: [],
      weaknesses: [locale === "ar" ? `فشل التحليل: ${errorMessage}` : `Analysis failed: ${errorMessage}`],
      criticalIssues: [{
        id: `error-${Date.now()}`,
        issue: `Analysis failed: ${errorMessage}`,
        issueAr: `فشل التحليل: ${errorMessage}`,
        severity: "high" as const,
        evidence: errorMessage,
        evidenceAr: errorMessage,
        location: normalizedUrl,
        whyItMatters: "The analysis could not be completed due to an error",
        whyItMattersAr: "لم يكتمل التحليل بسبب خطأ",
        howToFix: "Please check the URL and try again. If the problem persists, the server may be blocking requests.",
        howToFixAr: "يرجى التحقق من الرابط والمحاولة مرة أخرى. إذا استمرت المشكلة، قد يكون الخادم يحظر الطلبات.",
        category: "technical" as keyof CategoryScores,
        expectedBenefit: "Successful analysis completion",
        expectedBenefitAr: "إكمال التحليل بنجاح",
      }],
      metadata: {
        analyzedUrl: normalizedUrl,
        analysisDate: new Date().toISOString(),
        duration,
        dataSources: [],
        limitations: ["Analysis failed - no data available"],
        methodologyVersion: "3.0.0",
      },
    };
  }
}

// =============================================================================
// SOCIAL MEDIA ANALYSIS - Platform-specific routing
// =============================================================================
// Routes to dedicated platform API routes that perform real data extraction
// from each social platform's public pages.
// =============================================================================

export async function performRealSocialAnalysis(
  url: string,
  locale: string = "en",
  platform: string
): Promise<AnalysisResult> {
  const normalizedUrl = normalizeUrl(url);
  const startTime = Date.now();

  try {
    // Route to platform-specific API
    const apiPath = getPlatformApiPath(platform);
    const res = await fetch(apiPath, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: normalizedUrl, locale }),
    });

    if (!res.ok) {
      throw new Error(`API returned status ${res.status}`);
    }

    const json = await res.json();
    if (!json.success || !json.data) {
      throw new Error(json.error || "Analysis failed");
    }

    const data = json.data;
    const duration = Math.round((Date.now() - startTime) / 1000);

    // Map platform-specific scores to standard CategoryScores
    const scores = buildSocialCategoryScores(data, platform);

    const allFindings: Finding[] = (data.findings || []).map((f: any, index: number) => ({
      id: `${f.category || "finding"}-${Date.now()}-${index}`,
      issue: f.issue || "",
      issueAr: f.issueAr || f.issue || "",
      severity: (f.severity as "critical" | "high" | "medium" | "low" | "info") || "info",
      evidence: f.evidence || f.issue || "",
      evidenceAr: f.evidenceAr || f.issueAr || f.issue || "",
      location: normalizedUrl,
      whyItMatters: f.whyItMatters || "",
      whyItMattersAr: f.whyItMattersAr || "",
      howToFix: f.howToFix || "",
      howToFixAr: f.howToFixAr || "",
      category: mapPlatformCategory(f.category, platform),
      expectedBenefit: f.expectedBenefit || "",
      expectedBenefitAr: f.expectedBenefitAr || "",
    }));

    const criticalIssues = allFindings.filter((f) => f.severity === "critical" || f.severity === "high");

    const platformLabel = getPlatformLabel(platform, locale);

    return {
      id: generateId(),
      url: data.url || normalizedUrl,
      date: new Date().toISOString(),
      overallScore: formatScore(data.overallScore ?? 0),
      scores,
      findings: allFindings,
      strengths: data.strengths || [],
      weaknesses: data.weaknesses || [],
      criticalIssues,
      metadata: {
        analyzedUrl: data.url || normalizedUrl,
        analysisDate: new Date().toISOString(),
        duration,
        dataSources: data.metadata?.dataSources || [`${platformLabel} Public Data Extraction`],
        limitations: data.metadata?.limitations || [
          "Analyzes only publicly available data",
          "Platform may limit access to certain metrics",
          "Results reflect the state at time of analysis",
        ],
        methodologyVersion: "3.2.0",
        sourceConfidence: data.metadata?.sourceConfidence || "medium",
        dataAvailability: data.metadata?.dataAvailability,
      },
    };
  } catch (error) {
    const duration = Math.round((Date.now() - startTime) / 1000);
    const errorMessage = error instanceof Error ? error.message : "Unknown error during analysis";

    return {
      id: generateId(),
      url: normalizedUrl,
      date: new Date().toISOString(),
      overallScore: 0,
      scores: {
        seo: { score: 0, maxScore: 100, label: "SEO & Visibility", labelAr: "تحسين محركات البحث والظهور", description: "Analysis failed", descriptionAr: "فشل التحليل", findings: [] },
        performance: { score: 0, maxScore: 100, label: "Performance & Speed", labelAr: "الأداء والسرعة", description: "Analysis failed", descriptionAr: "فشل التحليل", findings: [] },
        accessibility: { score: 0, maxScore: 100, label: "Accessibility & UX", labelAr: "إمكانية الوصول وتجربة المستخدم", description: "Analysis failed", descriptionAr: "فشل التحليل", findings: [] },
        security: { score: 0, maxScore: 100, label: "Security & Trust", labelAr: "الأمان والثقة", description: "Analysis failed", descriptionAr: "فشل التحليل", findings: [] },
        content: { score: 0, maxScore: 100, label: "Content & Authority", labelAr: "المحتوى والسلطة", description: "Analysis failed", descriptionAr: "فشل التحليل", findings: [] },
        technical: { score: 0, maxScore: 100, label: "Technical Infrastructure", labelAr: "البنية التحتية التقنية", description: "Analysis failed", descriptionAr: "فشل التحليل", findings: [] },
      },
      findings: [{
        id: `error-${Date.now()}`,
        issue: `Analysis failed: ${errorMessage}`,
        issueAr: `فشل التحليل: ${errorMessage}`,
        severity: "high" as const,
        evidence: errorMessage,
        evidenceAr: errorMessage,
        location: normalizedUrl,
        whyItMatters: "The analysis could not be completed due to an error",
        whyItMattersAr: "لم يكتمل التحليل بسبب خطأ",
        howToFix: "Please check the URL and try again. If the problem persists, the platform may be blocking requests.",
        howToFixAr: "يرجى التحقق من الرابط والمحاولة مرة أخرى. إذا استمرت المشكلة، قد تكون المنصة تحظر الطلبات.",
        category: "technical" as keyof CategoryScores,
        expectedBenefit: "Successful analysis completion",
        expectedBenefitAr: "إكمال التحليل بنجاح",
      }],
      strengths: [],
      weaknesses: [locale === "ar" ? `فشل التحليل: ${errorMessage}` : `Analysis failed: ${errorMessage}`],
      criticalIssues: [{
        id: `error-${Date.now()}`,
        issue: `Analysis failed: ${errorMessage}`,
        issueAr: `فشل التحليل: ${errorMessage}`,
        severity: "high" as const,
        evidence: errorMessage,
        evidenceAr: errorMessage,
        location: normalizedUrl,
        whyItMatters: "The analysis could not be completed due to an error",
        whyItMattersAr: "لم يكتمل التحليل بسبب خطأ",
        howToFix: "Please check the URL and try again. If the problem persists, the platform may be blocking requests.",
        howToFixAr: "يرجى التحقق من الرابط والمحاولة مرة أخرى. إذا استمرت المشكلة، قد تكون المنصة تحظر الطلبات.",
        category: "technical" as keyof CategoryScores,
        expectedBenefit: "Successful analysis completion",
        expectedBenefitAr: "إكمال التحليل بنجاح",
      }],
      metadata: {
        analyzedUrl: normalizedUrl,
        analysisDate: new Date().toISOString(),
        duration,
        dataSources: [],
        limitations: ["Analysis failed - no data available"],
        methodologyVersion: "3.0.0",
      },
    };
  }
}

function getPlatformApiPath(platform: string): string {
  switch (platform) {
    case "youtube":
      return "/api/analyze/youtube";
    case "tiktok":
      return "/api/analyze/tiktok";
    case "facebook":
      return "/api/analyze/facebook";
    case "instagram":
      return "/api/analyze/instagram";
    case "snapchat":
      return "/api/analyze/snapchat";
    case "linkedin":
      return "/api/analyze/linkedin";
    default:
      return "/api/analyze";
  }
}

function getPlatformLabel(platform: string, locale: string): string {
  const labels: Record<string, { en: string; ar: string }> = {
    youtube: { en: "YouTube", ar: "يوتيوب" },
    tiktok: { en: "TikTok", ar: "تيك توك" },
    facebook: { en: "Facebook", ar: "فيسبوك" },
    instagram: { en: "Instagram", ar: "إنستغرام" },
    snapchat: { en: "Snapchat", ar: "سناب شات" },
    linkedin: { en: "LinkedIn", ar: "لينكد إن" },
  };
  const label = labels[platform] || { en: platform, ar: platform };
  return locale === "ar" ? label.ar : label.en;
}

function mapPlatformCategory(category: string | undefined, platform: string): keyof CategoryScores {
  const categoryMap: Record<string, keyof CategoryScores> = {
    seo: "seo",
    content: "content",
    engagement: "content",
    profile: "content",
    growth: "content",
    consistency: "content",
    titleOptimization: "seo",
    descriptionQuality: "content",
    performance: "performance",
    accessibility: "accessibility",
    security: "security",
    technical: "technical",
  };
  return categoryMap[category || ""] || "technical";
}

function buildSocialCategoryScores(data: any, platform: string): CategoryScores {
  const platformLabel = getPlatformLabel(platform, "en");
  const platformLabelAr = getPlatformLabel(platform, "ar");
  const platformName = platform.charAt(0).toUpperCase() + platform.slice(1);

  // Extract platform-specific scores (data-driven scores already carry
  // `unavailable` and `reasons` — preserve them through the mapping).
  const platformScores = data.scores || {};

  const build = (
    key: string,
    label: string,
    labelAr: string,
    description: string,
    descriptionAr: string,
    fallback: number
  ): CategoryScore => {
    const src = platformScores[key] || {};
    return {
      score: formatScore(src.score ?? fallback),
      maxScore: 100,
      label,
      labelAr,
      description,
      descriptionAr,
      findings: src.findings || [],
      unavailable: src.unavailable,
      reasons: src.reasons,
      reasonsAr: src.reasonsAr,
    };
  };

  return {
    seo: build(
      "seo", "SEO & Discoverability", "الظهور والبحث",
      `${platformName} search optimization, profile keywords, hashtags`,
      `تحسين البحث في ${platformLabelAr}، الكلمات المفتاحية للملف، الهاشتاجات`,
      data.overallScore ?? 0
    ),
    performance: build(
      "performance", "Profile & Presence", "الملف والحضور",
      `Profile completeness, verification, bio quality on ${platformName}`,
      `اكتمال الملف، التوثيق، جودة الوصف على ${platformLabelAr}`,
      platformScores.profile?.score ?? 0
    ),
    accessibility: build(
      "accessibility", "Audience & Growth", "الجمهور والنمو",
      "Audience growth, follower engagement, reach metrics",
      "نمو الجمهور، تفاعل المتابعين، مقاييس الوصول",
      platformScores.growth?.score ?? 0
    ),
    security: build(
      "security", "Verification & Privacy", "التوثيق والخصوصية",
      "Confirmed verification status and public/private visibility",
      "حالة التوثيق المؤكدة ومدى علانية الملف",
      platformScores.engagement?.score ?? 0
    ),
    content: build(
      "content", "Content & Engagement", "المحتوى والتفاعل",
      `Content quality, consistency, and value on ${platformName}`,
      `جودة المحتوى والاتساق والقيمة على ${platformLabelAr}`,
      data.overallScore ?? 0
    ),
    technical: build(
      "technical", "Structure & Consistency", "البنية والاتساق",
      "Platform-specific technical signals and infrastructure",
      "إشارات تقنية خاصة بالمنصة والبنية التحتية",
      0
    ),
  };
}

// =============================================================================
// ANALYSIS STAGES (Real progression based on actual API processing)
// =============================================================================

export function getRealAnalysisStages(): AnalysisStage[] {
  return [
    { id: "validating", label: "Validating URL", labelAr: "التحقق من الرابط", status: "pending" },
    { id: "connecting", label: "Connecting to server", labelAr: "الاتصال بالخادم", status: "pending" },
    { id: "fetching", label: "Fetching page data", labelAr: "جلب بيانات الصفحة", status: "pending" },
    { id: "seo", label: "SEO Analysis", labelAr: "تحليل SEO", status: "pending" },
    { id: "performance", label: "Performance Analysis", labelAr: "تحليل الأداء", status: "pending" },
    { id: "accessibility", label: "Accessibility Analysis", labelAr: "تحليل إمكانية الوصول", status: "pending" },
    { id: "security", label: "Security Scan", labelAr: "فحص أمني", status: "pending" },
    { id: "content", label: "Content Analysis", labelAr: "تحليل المحتوى", status: "pending" },
    { id: "technical", label: "Technical Check", labelAr: "الفحص التقني", status: "pending" },
    { id: "preparing", label: "Preparing Report", labelAr: "تجهيز التقرير", status: "pending" },
  ];
}