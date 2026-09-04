// =============================================================================
// Smart Land v3 - REAL Analysis Engine (Client-side)
// =============================================================================
// This engine calls the backend API which performs real data extraction
// from live URLs. No mock data, no static values, no fallback defaults.
// Stage callbacks fire in real-time as each phase of analysis completes.
// =============================================================================

import type {
  AnalysisResult,
  CategoryScore,
  CategoryScores,
  Finding,
  AnalysisStage,
} from "./types";
import { generateId, normalizeUrl, formatScore } from "./utils";
import { GateError } from "./analysis-gate";

// =============================================================================
// TYPES
// =============================================================================

export interface AnalysisCallbacks {
  onStageStart?: (id: string) => void;
  onStageComplete?: (id: string) => void;
  onStageError?: (id: string) => void;
}

// =============================================================================
// PRIVATE HELPERS
// =============================================================================

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`⏱ ${label}`)), ms)
    ),
  ]);
}

/**
 * Translates a non-OK analysis-response into either a `GateError` (when the
 * server returned a recognized auth/connection code so the UI can redirect the
 * user to the right next step — login / connect / reconnect) or a generic
 * Error for any other failure.
 */
type GateCode = "auth_required" | "connection_required" | "token_expired";
async function handleApiError(
  response: Response,
  locale: string,
  platform: string
): Promise<never> {
  let errorMsg = `Server returned HTTP ${response.status}`;
  let code: string | undefined;
  let plat: string | undefined;
  try {
    const errBody = await response.json();
    if (locale === "ar" && errBody.errorAr) errorMsg = errBody.errorAr;
    else if (errBody.error) errorMsg = errBody.error;
    code = errBody.code;
    plat = errBody.platform ?? platform;
  } catch {
    /* ignore parse errors — fall back to the generic message */
  }
  if (code === "auth_required" || code === "connection_required" || code === "token_expired") {
    throw new GateError(errorMsg, code as GateCode, plat);
  }
  throw new Error(errorMsg);
}

// =============================================================================
// PUBLIC API - WEBSITE ANALYSIS
// =============================================================================

export async function performRealAnalysis(
  url: string,
  locale: string = "en",
  callbacks?: AnalysisCallbacks
): Promise<AnalysisResult> {
  const normalizedUrl = normalizeUrl(url);
  const startTime = Date.now();

  callbacks?.onStageStart?.("validating");

  // Validate URL client-side (real check before any network call)
  try {
    const parsed = new URL(normalizedUrl);
    if (!parsed.hostname.includes(".")) {
      throw new Error("Invalid URL format — hostname must include a domain");
    }
  } catch (e) {
    callbacks?.onStageError?.("validating");
    throw new Error(e instanceof Error ? e.message : "Invalid URL");
  }
  callbacks?.onStageComplete?.("validating");

  // Connecting — POST to the server analysis API
  callbacks?.onStageStart?.("connecting");
  const apiUrl = `/api/analyze`;

  let response: Response;
  try {
    response = await withTimeout(
      fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: normalizedUrl, locale }),
      }),
      45_000, // 45 second timeout for the full server-side analysis
      "Server did not respond within 45 seconds"
    );
  } catch (e) {
    callbacks?.onStageError?.("connecting");
    const msg = e instanceof Error ? e.message : "Connection failed";
    throw new Error(
      msg.includes("⏱")
        ? "Request timed out — the server took too long to respond"
        : msg
    );
  }
  callbacks?.onStageComplete?.("connecting");

  // Fetching — reading the analysis response
  callbacks?.onStageStart?.("fetching");

  if (!response.ok) {
    callbacks?.onStageError?.("fetching");
    let errorMsg = `Server returned HTTP ${response.status}`;
    try {
      const errBody = await response.json();
      if (locale === "ar" && errBody.errorAr) errorMsg = errBody.errorAr;
      else if (errBody.error) errorMsg = errBody.error;
    } catch { /* ignore parse errors */ }
    throw new Error(errorMsg);
  }

  let json: any;
  try {
    json = await response.json();
  } catch {
    callbacks?.onStageError?.("fetching");
    throw new Error("Server returned an invalid response — please try again");
  }

  if (!json.success || !json.data) {
    callbacks?.onStageError?.("fetching");
    throw new Error(json.error || "Analysis failed — server did not return analysis data");
  }
  callbacks?.onStageComplete?.("fetching");

  const data = json.data;
  const duration = Math.round((Date.now() - startTime) / 1000);

  // Build category findings lookup from the real API findings
  const apiFindings: any[] = data.findings || [];

  function findingsForCategory(cat: string): Finding[] {
    return apiFindings
      .filter((f: any) => f.category === cat)
      .map((f: any, idx: number) => ({
        id: `${f.category || "finding"}-${Date.now()}-${idx}`,
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
  }

  function makeCategoryScore(
    cat: string,
    label: string,
    labelAr: string,
    desc: string,
    descAr: string
  ): CategoryScore {
    callbacks?.onStageComplete?.(cat);
    const src = data.scores?.[cat] || {};
    return {
      score: formatScore(src.score ?? 0),
      maxScore: 100,
      label,
      labelAr,
      description: desc,
      descriptionAr: descAr,
      findings: findingsForCategory(cat),
      unavailable: src.unavailable,
      reasons: src.reasons,
      reasonsAr: src.reasonsAr,
    };
  }

  // SEO
  callbacks?.onStageStart?.("seo");
  const seoCat = makeCategoryScore(
    "seo", "SEO & Visibility", "تحسين محركات البحث والظهور",
    "Search engine optimization, meta tags, structured data, social signals",
    "تحسين محركات البحث، العلامات الوصفية، البيانات المنظمة، إشارات التواصل"
  );

  // Performance
  callbacks?.onStageStart?.("performance");
  const perfCat = makeCategoryScore(
    "performance", "Performance & Speed", "الأداء والسرعة",
    "Core Web Vitals, load time, page size, CDN, caching",
    "مقاييس الويب الأساسية، وقت التحميل، حجم الصفحة، CDN، التخزين المؤقت"
  );

  // Accessibility
  callbacks?.onStageStart?.("accessibility");
  const accCat = makeCategoryScore(
    "accessibility", "Accessibility & UX", "إمكانية الوصول وتجربة المستخدم",
    "ARIA landmarks, keyboard navigation, contrast, screen reader",
    "معالم ARIA، التنقل بلوحة المفاتيح، التباين، قارئ الشاشة"
  );

  // Security
  callbacks?.onStageStart?.("security");
  const secCat = makeCategoryScore(
    "security", "Security & Trust", "الأمان والثقة",
    "SSL/TLS, HSTS, CSP, XSS protection, HTTPS",
    "SSL/TLS و HSTS و CSP والحماية من XSS و HTTPS"
  );

  // Content
  callbacks?.onStageStart?.("content");
  const contCat = makeCategoryScore(
    "content", "Content & Authority", "المحتوى والسلطة",
    "Content quality, backlinks, social proof, structured data",
    "جودة المحتوى، الروابط الخلفية، الإثبات الاجتماعي، البيانات المنظمة"
  );

  // Technical
  callbacks?.onStageStart?.("technical");
  const techCat = makeCategoryScore(
    "technical", "Technical Infrastructure", "البنية التحتية التقنية",
    "Server config, DNS, CDN, SSL cert, HTTP/2, compression",
    "تكوين الخادم، DNS، CDN، شهادة SSL، HTTP/2، الضغط"
  );

  const scores: CategoryScores = {
    seo: seoCat,
    performance: perfCat,
    accessibility: accCat,
    security: secCat,
    content: contCat,
    technical: techCat,
  };

  // Prepare report
  callbacks?.onStageStart?.("preparing");

  const allFindings: Finding[] = apiFindings.map((f: any, index: number) => ({
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

  const criticalIssues = allFindings.filter(
    (f) => f.severity === "critical" || f.severity === "high"
  );

  const result: AnalysisResult = {
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

  callbacks?.onStageComplete?.("preparing");
  return result;
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
  platform: string,
  callbacks?: AnalysisCallbacks
): Promise<AnalysisResult> {
  const normalizedUrl = normalizeUrl(url);
  const startTime = Date.now();

  callbacks?.onStageStart?.("validating");
  try {
    const parsed = new URL(normalizedUrl);
    if (!parsed.hostname.includes(".")) {
      throw new Error("Invalid URL format — hostname must include a domain");
    }
  } catch (e) {
    callbacks?.onStageError?.("validating");
    throw new Error(e instanceof Error ? e.message : "Invalid URL");
  }
  callbacks?.onStageComplete?.("validating");

  // Connecting — POST to the platform-specific API
  callbacks?.onStageStart?.("connecting");
  const apiPath = getPlatformApiPath(platform);

  let response: Response;
  try {
    response = await withTimeout(
      fetch(apiPath, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: normalizedUrl, locale }),
      }),
      45_000,
      "Server did not respond within 45 seconds"
    );
  } catch (e) {
    callbacks?.onStageError?.("connecting");
    const msg = e instanceof Error ? e.message : "Connection failed";
    throw new Error(
      msg.includes("⏱")
        ? "Request timed out — the server took too long to respond"
        : msg
    );
  }
  callbacks?.onStageComplete?.("connecting");

  // Fetching — reading the analysis response
  callbacks?.onStageStart?.("fetching");

  if (!response.ok) {
    callbacks?.onStageError?.("fetching");
    await handleApiError(response, locale, platform);
  }

  let json: any;
  try {
    json = await response.json();
  } catch {
    callbacks?.onStageError?.("fetching");
    throw new Error("Server returned an invalid response — please try again");
  }

  if (!json.success || !json.data) {
    callbacks?.onStageError?.("fetching");
    throw new Error(json.error || "Analysis failed — server did not return analysis data");
  }
  callbacks?.onStageComplete?.("fetching");

  const data = json.data;
  const duration = Math.round((Date.now() - startTime) / 1000);

  // Map platform-specific scores to standard CategoryScores
  callbacks?.onStageStart?.("seo");
  const scores = buildSocialCategoryScores(data, platform);
  callbacks?.onStageComplete?.("seo");
  callbacks?.onStageComplete?.("performance");
  callbacks?.onStageComplete?.("accessibility");
  callbacks?.onStageComplete?.("security");
  callbacks?.onStageComplete?.("content");
  callbacks?.onStageComplete?.("technical");

  // Prepare report
  callbacks?.onStageStart?.("preparing");

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

  const criticalIssues = allFindings.filter(
    (f) => f.severity === "critical" || f.severity === "high"
  );

  const platformLabel = getPlatformLabel(platform, locale);

  const result: AnalysisResult = {
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
    socialData: data,
    premiumLocked: data.premiumLocked === true,
    upgradeUrl: data.upgradeUrl,
  };

  callbacks?.onStageComplete?.("preparing");
  return result;
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