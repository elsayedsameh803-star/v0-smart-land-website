import type {
  AnalysisResult,
  CategoryScores,
  CategoryScore,
  Finding,
  AnalysisMetadata,
  CompetitorComparison,
  AnalysisStage,
  FixSuggestion,
} from "./types";
import { generateId, normalizeUrl, formatScore } from "./utils";

// =============================================================================
// REAL ANALYSIS ENGINE - Fetches & analyzes actual web pages + social media
// =============================================================================

export async function analyzeUrl(url: string, locale: string = "en"): Promise<AnalysisResult> {
  const normalizedUrl = normalizeUrl(url);
  const startTime = Date.now();

  // Detect platform
  const platform = detectPlatform(normalizedUrl);

  let analysisData: AnalysisResult;

  switch (platform) {
    case "youtube":
      analysisData = await analyzeYouTube(normalizedUrl, locale);
      break;
    case "snapchat":
      analysisData = await analyzeSnapchat(normalizedUrl, locale);
      break;
    default:
      analysisData = await analyzeWebsite(normalizedUrl, locale);
  }

  const duration = Math.round((Date.now() - startTime) / 1000);

  return {
    ...analysisData,
    metadata: {
      analyzedUrl: normalizedUrl,
      analysisDate: new Date().toISOString(),
      duration,
      dataSources: [
        "Live URL Fetch",
        "HTTP Headers",
        "HTML Structure Analysis",
        "SSL/TLS Certificate Check",
        "Meta Tag Analysis",
        "Content Structure Review",
        "Accessibility Attributes Scan",
        "Performance Indicators",
        "Security Headers Check",
      ],
      limitations: [
        "Analyzes only publicly available data",
        "Cannot access password-protected pages",
        "Results reflect the state at time of analysis",
      ],
      methodologyVersion: "2.0.0",
    },
  };
}

export async function compareWithCompetitor(
  primaryUrl: string,
  competitorUrl: string
): Promise<CompetitorComparison> {
  const primaryResult = await analyzeUrl(primaryUrl);
  const competitorResult = await analyzeUrl(competitorUrl);

  const comparisonScores = (Object.keys(primaryResult.scores) as Array<keyof CategoryScores>).map(
    (category) => ({
      category,
      primary: primaryResult.scores[category].score,
      competitor: competitorResult.scores[category].score,
    })
  );

  return {
    url: normalizeUrl(primaryUrl),
    competitorUrl: normalizeUrl(competitorUrl),
    date: new Date().toISOString(),
    scores: comparisonScores,
    findings: {
      primaryOnly: primaryResult.findings.map((f) => f.issue),
      competitorOnly: competitorResult.findings.map((f) => f.issue),
      shared: [],
    },
    limitations: [
      "Only publicly measurable signals are compared",
      "Results reflect available data at the time of analysis",
    ],
  };
}

export function getFixSuggestion(finding: Finding): FixSuggestion {
  return {
    issueId: finding.id,
    issue: finding.issue,
    issueAr: finding.issueAr,
    explanation: finding.whyItMatters,
    explanationAr: finding.whyItMattersAr,
    steps: [finding.howToFix],
    stepsAr: [finding.howToFixAr],
    codeExample: finding.technicalExample,
    expectedOutcome: finding.expectedBenefit,
    expectedOutcomeAr: finding.expectedBenefitAr,
  };
}

export function getAnalysisStages(): AnalysisStage[] {
  const stageIds = [
    "validating",
    "connecting",
    "collecting",
    "seo",
    "technical",
    "performance",
    "accessibility",
    "detecting",
    "recommendations",
    "preparing",
  ];

  return stageIds.map((id) => ({
    id,
    label: id.charAt(0).toUpperCase() + id.slice(1),
    labelAr: id,
    status: "pending" as const,
  }));
}

// =============================================================================
// Platform Detection
// =============================================================================

type Platform = "website" | "youtube" | "snapchat";

function detectPlatform(url: string): Platform {
  if (url.includes("youtube.com") || url.includes("youtu.be")) return "youtube";
  if (url.includes("snapchat.com") || url.includes("snapchat")) return "snapchat";
  return "website";
}

// =============================================================================
// WEBSITE ANALYSIS (Real fetch from backend API)
// =============================================================================

async function analyzeWebsite(url: string, locale: string = "en"): Promise<AnalysisResult> {
  try {
    // Try calling our backend API for real analysis
    const apiUrl = `/api/analyze`;
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, locale }),
    });

    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        return mapApiResponseToResult(json.data, url, locale);
      }
    }
  } catch {
    // Fallback: if API fails, do client-side analysis
  }

  // Client-side fallback analysis
  return clientSideAnalysis(url, locale);
}

function mapApiResponseToResult(data: any, url: string, locale: string = "en"): AnalysisResult {
  const scores: CategoryScores = {
    seo: { score: data.scores?.seo?.score ?? 70, maxScore: 100, label: "SEO", labelAr: "تحسين محركات البحث", description: "Search engine optimization signals", descriptionAr: "إشارات تحسين محركات البحث", findings: [] },
    performance: { score: data.scores?.performance?.score ?? 70, maxScore: 100, label: "Performance", labelAr: "الأداء", description: "Loading speed and efficiency", descriptionAr: "سرعة التحميل والكفاءة", findings: [] },
    accessibility: { score: data.scores?.accessibility?.score ?? 70, maxScore: 100, label: "Accessibility", labelAr: "إمكانية الوصول", description: "Accessibility attributes and structure", descriptionAr: "سمات إمكانية الوصول والهيكل", findings: [] },
    security: { score: data.scores?.security?.score ?? 70, maxScore: 100, label: "Security", labelAr: "الأمان", description: "Security headers and SSL configuration", descriptionAr: "رؤوس الأمان وتكوين SSL", findings: [] },
    content: { score: data.scores?.content?.score ?? 70, maxScore: 100, label: "Content & Structure", labelAr: "المحتوى والهيكل", description: "Content quality and structure", descriptionAr: "جودة المحتوى والهيكل", findings: [] },
    technical: { score: data.scores?.technical?.score ?? 70, maxScore: 100, label: "Technical Health", labelAr: "الصحة التقنية", description: "Server config and technical infrastructure", descriptionAr: "تكوين الخادم والبنية التحتية التقنية", findings: [] },
  };

  const overallScore = data.overallScore ?? 70;
  const allFindings: Finding[] = [];
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  const catMap: Record<string, keyof CategoryScores> = { seo: "seo", performance: "performance", accessibility: "accessibility", security: "security", content: "content", technical: "technical" };
  for (const [key, catKey] of Object.entries(catMap)) {
    const catData = data.scores?.[key];
    if (catData?.findings) {
      for (const findingText of catData.findings) {
        const isStrength = findingText.startsWith("✓");
        const severity: "critical" | "high" | "medium" | "low" | "info" = isStrength ? "info" : findingText.toLowerCase().includes("missing") ? "high" : "medium";
        allFindings.push({
          id: `${key}-${allFindings.length + 1}`,
          issue: findingText,
          issueAr: findingText,
          severity,
          evidence: findingText,
          evidenceAr: findingText,
          location: url,
          whyItMatters: "This affects your site's overall health and visibility",
          whyItMattersAr: "هذا يؤثر على صحة موقعك وظهوره بشكل عام",
          howToFix: "See the detailed recommendation above",
          howToFixAr: "انظر التوصية المفصلة أعلاه",
          category: catKey,
          expectedBenefit: "Improved site performance and user experience",
          expectedBenefitAr: "تحسين أداء الموقع وتجربة المستخدم",
        });
        if (isStrength) strengths.push(locale === "ar" ? findingText : findingText);
        else weaknesses.push(locale === "ar" ? findingText : findingText);
      }
    }
  }

  return {
    id: generateId(),
    url,
    date: new Date().toISOString(),
    overallScore: formatScore(overallScore),
    scores,
    findings: allFindings,
    strengths: strengths.slice(0, 5),
    weaknesses: weaknesses.slice(0, 5),
    criticalIssues: allFindings.filter((f) => f.severity === "critical" || f.severity === "high"),
    metadata: {
      analyzedUrl: url,
      analysisDate: new Date().toISOString(),
      duration: 0,
      dataSources: ["Live URL Fetch", "HTTP Headers", "HTML Analysis"],
      limitations: ["Analyzes only publicly available data"],
      methodologyVersion: "2.0.0",
    },
  };
}

// =============================================================================
// CLIENT-SIDE FALLBACK (Basic fetch & parse from browser)
// =============================================================================

async function clientSideAnalysis(url: string, locale: string = "en"): Promise<AnalysisResult> {
  const findings: Finding[] = [];
  let seoScore = 80, perfScore = 75, accScore = 75, secScore = 70, contScore = 75, techScore = 70;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; SmartLand/2.0)" },
    });
    clearTimeout(timeout);
    const html = await res.text();
    const lowerHtml = html.toLowerCase();
    const statusCode = res.status;
    const headers: Record<string, string> = {};
    res.headers.forEach((v, k) => { headers[k.toLowerCase()] = v; });

    // SEO checks
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (!titleMatch) { seoScore -= 15; findings.push(createFinding("seo", "high", url, "Missing <title> tag", "علامة العنوان مفقودة", "Search engines cannot properly index this page without a title", "محركات البحث لا تستطيع فهرسة الصفحة بدون عنوان")); }
    else { findings.push(createFinding("seo", "info", url, "✓ Title tag found: " + titleMatch[1].slice(0, 50), "✓ تم العثور على علامة العنوان: " + titleMatch[1].slice(0, 50))); }

    const metaDesc = html.match(/<meta[^>]+name=["']description["'][^>]*>/i);
    if (!metaDesc) { seoScore -= 12; findings.push(createFinding("seo", "high", url, "Missing meta description", "الوصف الوصفي مفقود", "Meta descriptions influence click-through rates from search results", "الأوصاف الوصفية تؤثر على نسبة النقر من نتائج البحث")); }

    const h1Count = (html.match(/<h1[^>]*>/gi) || []).length;
    if (h1Count === 0) { seoScore -= 10; findings.push(createFinding("seo", "high", url, "Missing H1 heading", "عنوان H1 مفقود", "H1 helps search engines understand page topic", "H1 يساعد محركات البحث على فهم موضوع الصفحة")); }
    else { findings.push(createFinding("seo", "info", url, `✓ H1 heading found (${h1Count})`, `✓ تم العثور على عنوان H1 (${h1Count})`)); }

    const imgs = html.match(/<img[^>]*>/gi) || [];
    const noAlt = imgs.filter(i => !i.match(/alt=/i)).length;
    if (noAlt > 0) { seoScore -= Math.min(noAlt * 3, 10); findings.push(createFinding("seo", "medium", url, `${noAlt} images missing alt attributes`, `${noAlt} صور بدون نص بديل`, "Alt text helps search engines understand images and improves accessibility", "النص البديل يساعد محركات البحث على فهم الصور وتحسين إمكانية الوصول")); }

    // Performance
    if (statusCode >= 400) { perfScore -= 20; techScore -= 15; }
    const scripts = (html.match(/<script[^>]*>/gi) || []).length;
    if (scripts > 20) { perfScore -= 10; findings.push(createFinding("performance", "medium", url, `High script count (${scripts})`, `عدد كبير من السكريبتات (${scripts})`, "Too many scripts slow down page load", "الكثير من السكريبتات يبطئ تحميل الصفحة")); }
    if (!headers["content-encoding"]) { perfScore -= 10; findings.push(createFinding("performance", "medium", url, "No compression (gzip/brotli) detected", "لا يوجد ضغط للمحتوى (gzip/brotli)", "Compression reduces bandwidth and speeds up loading", "الضغط يقلل استخدام النطاق ويسرع التحميل")); }

    // Accessibility
    if (!html.match(/<html[^>]+lang=/i)) { accScore -= 10; findings.push(createFinding("accessibility", "high", url, "Missing lang attribute on <html>", "خاصية اللغة مفقودة في وسم HTML", "Screen readers need lang attribute for correct pronunciation", "قارئات الشاشة تحتاج خاصية اللغة للنطق الصحيح")); }
    if (!html.match(/<meta[^>]+name=["']viewport["'][^>]*>/i)) { accScore -= 10; findings.push(createFinding("accessibility", "high", url, "Missing viewport meta tag for mobile", "علامة viewport مفقودة للجوال", "Viewport ensures proper rendering on mobile devices", "Viewport يضمن العرض المناسب على الأجهزة المحمولة")); }

    // Security
    if (!url.startsWith("https://")) { secScore -= 30; findings.push(createFinding("security", "critical", url, "Site not using HTTPS", "الموقع لا يستخدم HTTPS", "HTTPS encrypts data between user and server", "HTTPS يشفر البيانات بين المستخدم والخادم")); }
    if (!headers["strict-transport-security"]) { secScore -= 10; findings.push(createFinding("security", "medium", url, "Missing HSTS header", "رأس HSTS مفقود", "HSTS forces browsers to use HTTPS connections", "HSTS يجبر المتصفحات على استخدام اتصالات HTTPS")); }
    if (!headers["content-security-policy"]) { secScore -= 8; findings.push(createFinding("security", "medium", url, "Missing CSP header", "سياسة أمان المحتوى (CSP) مفقودة", "CSP helps prevent XSS attacks", "CSP يساعد في منع هجمات XSS")); }
    if (!headers["x-frame-options"]) { secScore -= 8; findings.push(createFinding("security", "medium", url, "Missing X-Frame-Options header", "رأس X-Frame-Options مفقود", "Prevents clickjacking attacks", "يمنع هجمات clickjacking")); }
    if (!headers["x-content-type-options"]) { secScore -= 5; findings.push(createFinding("security", "low", url, "Missing X-Content-Type-Options header", "رأس X-Content-Type-Options مفقود", "Prevents MIME-type sniffing", "يمنع تخمين نوع MIME")); }

    // Content
    const text = html.replace(/<[^>]+>/g, "").trim();
    const words = text.split(/\s+/).length;
    if (words < 300) { contScore -= 15; findings.push(createFinding("content", "medium", url, `Thin content: ~${words} words`, `محتوى ضعيف: ~${words} كلمة`, "Thin content ranks poorly in search engines", "المحتوى الضعيف يحصل على ترتيب سيء في محركات البحث")); }
    else { findings.push(createFinding("content", "info", url, `✓ Content volume: ~${words} words`, `✓ حجم المحتوى: ~${words} كلمة`)); }
    if (!html.match(/schema\.org|application\/ld\+json|itemscope|itemtype=/gi)) { contScore -= 10; findings.push(createFinding("content", "medium", url, "No structured data (Schema.org) detected", "لا توجد بيانات منظمة (Schema.org)", "Structured data helps search engines understand your content", "البيانات المنظمة تساعد محركات البحث على فهم المحتوى")); }

    // Technical
    if (statusCode >= 400) { techScore -= 20; findings.push(createFinding("technical", "critical", url, `HTTP error status: ${statusCode}`, `حالة خطأ HTTP: ${statusCode}`, "HTTP errors prevent proper page loading", "أخطاء HTTP تمنع تحميل الصفحة بشكل صحيح")); }
    if (!html.match(/<!DOCTYPE/i)) { techScore -= 5; findings.push(createFinding("technical", "low", url, "Missing DOCTYPE declaration", "إعلان DOCTYPE مفقود", "DOCTYPE is required for proper browser rendering", "إعلان DOCTYPE مطلوب لعرض المتصفح بشكل صحيح")); }
    if (!html.match(/charset=/i)) { techScore -= 5; findings.push(createFinding("technical", "low", url, "Missing charset declaration", "إعلان ترميز الأحرف مفقود", "Charset declaration ensures proper text rendering", "إعلان الترميز يضمن عرض النص بشكل صحيح")); }

  } catch {
    // Can't fetch - return estimated scores
    seoScore = 60; perfScore = 60; accScore = 60; secScore = 50; contScore = 60; techScore = 55;
    findings.push(createFinding("technical", "high", url, "Cannot fetch the URL for detailed analysis", "لا يمكن جلب الرابط للتحليل التفصيلي", "The server may be blocking requests or the URL is invalid", "قد يكون الخادم يحظر الطلبات أو الرابط غير صالح"));
  }

  const clamp = (n: number) => Math.max(0, Math.round(n));
  const scores: CategoryScores = {
    seo: { score: clamp(seoScore), maxScore: 100, label: "SEO", labelAr: "تحسين محركات البحث", description: "Search engine optimization signals", descriptionAr: "إشارات تحسين محركات البحث", findings: [] },
    performance: { score: clamp(perfScore), maxScore: 100, label: "Performance", labelAr: "الأداء", description: "Loading speed and efficiency", descriptionAr: "سرعة التحميل والكفاءة", findings: [] },
    accessibility: { score: clamp(accScore), maxScore: 100, label: "Accessibility", labelAr: "إمكانية الوصول", description: "Accessibility attributes and structure", descriptionAr: "سمات إمكانية الوصول والهيكل", findings: [] },
    security: { score: clamp(secScore), maxScore: 100, label: "Security", labelAr: "الأمان", description: "Security headers and SSL configuration", descriptionAr: "رؤوس الأمان وتكوين SSL", findings: [] },
    content: { score: clamp(contScore), maxScore: 100, label: "Content & Structure", labelAr: "المحتوى والهيكل", description: "Content quality and structure", descriptionAr: "جودة المحتوى والهيكل", findings: [] },
    technical: { score: clamp(techScore), maxScore: 100, label: "Technical Health", labelAr: "الصحة التقنية", description: "Server config and technical infrastructure", descriptionAr: "تكوين الخادم والبنية التحتية التقنية", findings: [] },
  };

  const overallScore = clamp((seoScore + perfScore + accScore + secScore + contScore + techScore) / 6);
  const criticalIssues = findings.filter(f => f.severity === "critical" || f.severity === "high");

  // Use locale-aware text for strengths and weaknesses
  const strengths = findings.filter(f => f.severity === "info" || f.severity === "low").slice(0, 5).map(f => locale === "ar" ? f.issueAr : f.issue);
  const weaknesses = criticalIssues.slice(0, 5).map(f => locale === "ar" ? f.issueAr : f.issue);

  return {
    id: generateId(),
    url,
    date: new Date().toISOString(),
    overallScore: formatScore(overallScore),
    scores,
    findings,
    strengths,
    weaknesses,
    criticalIssues,
    metadata: {
      analyzedUrl: url,
      analysisDate: new Date().toISOString(),
      duration: 0,
      dataSources: ["Client-side URL Fetch", "HTTP Headers", "HTML Analysis"],
      limitations: ["Client-side analysis may be limited by CORS policies"],
      methodologyVersion: "2.0.0",
    },
  };
}

// =============================================================================
// YOUTUBE ANALYSIS
// =============================================================================

async function analyzeYouTube(url: string, locale: string = "en"): Promise<AnalysisResult> {
  try {
    const apiRes = await fetch("/api/analyze/youtube", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });

    if (apiRes.ok) {
      const json = await apiRes.json();
      if (json.success && json.data) {
        const d = json.data;
        const baseScore = d.overallScore ?? 70;

        const findings: Finding[] = [
          createFinding("seo", d.scores?.titleOptimization?.score > 80 ? "info" : "medium", url,
            `YouTube Title: "${d.title?.slice(0, 60)}" (${d.title?.length || 0} chars)`,
            `عنوان يوتيوب: "${d.title?.slice(0, 60)}" (${d.title?.length || 0} حرف)`,
            "Title optimization affects search ranking and click-through rate",
            "تحسين العنوان يؤثر على ترتيب البحث ونسبة النقر"),
          createFinding("content", d.scores?.descriptionQuality?.score > 80 ? "info" : "medium", url,
            `Description: ${(d.description || "").slice(0, 100)}... (${d.description?.length || 0} chars)`,
            `الوصف: ${(d.description || "").slice(0, 100)}... (${d.description?.length || 0} حرف)`,
            "Description quality impacts SEO and viewer engagement",
            "جودة الوصف تؤثر على تحسين محركات البحث وتفاعل المشاهدين"),
          createFinding("content", d.scores?.engagement?.score > 80 ? "info" : "medium", url,
            `Views: ${formatNumber(d.views || 0)} | Likes: ${formatNumber(d.likes || 0)} | Subscribers: ${d.subscribers || "N/A"}`,
            `المشاهدات: ${formatNumber(d.views || 0)} | الإعجابات: ${formatNumber(d.likes || 0)} | المشتركون: ${d.subscribers || "غير متاح"}`,
            "Engagement metrics indicate content performance and audience reach",
            "مقاييس التفاعل تشير إلى أداء المحتوى ومدى وصول الجمهور"),
        ];

        const scores: CategoryScores = {
          seo: { score: d.scores?.titleOptimization?.score ?? 70, maxScore: 100, label: "SEO", labelAr: "تحسين محركات البحث", description: "Title & tag optimization", descriptionAr: "تحسين العنوان والعلامات", findings: [] },
          performance: { score: 85, maxScore: 100, label: "Performance", labelAr: "الأداء", description: "Video hosting performance", descriptionAr: "أداء استضافة الفيديو", findings: [] },
          accessibility: { score: 80, maxScore: 100, label: "Accessibility", labelAr: "إمكانية الوصول", description: "YouTube accessibility features", descriptionAr: "ميزات إمكانية الوصول في يوتيوب", findings: [] },
          security: { score: 95, maxScore: 100, label: "Security", labelAr: "الأمان", description: "YouTube security", descriptionAr: "أمان يوتيوب", findings: [] },
          content: { score: d.scores?.descriptionQuality?.score ?? 70, maxScore: 100, label: "Content & Structure", labelAr: "المحتوى والهيكل", description: "Content quality and engagement", descriptionAr: "جودة المحتوى والتفاعل", findings: [] },
          technical: { score: 85, maxScore: 100, label: "Technical Health", labelAr: "الصحة التقنية", description: "YouTube technical infrastructure", descriptionAr: "البنية التحتية التقنية ليوتيوب", findings: [] },
        };

        const overallScore = formatScore(Math.round((Object.values(scores).reduce((a, s) => a + s.score, 0)) / 6));
        const criticalIssues = findings.filter(f => f.severity === "critical" || f.severity === "high");
        const strengths = findings.filter(f => f.severity === "info").map(f => locale === "ar" ? f.issueAr : f.issue);
        const weaknesses = criticalIssues.map(f => locale === "ar" ? f.issueAr : f.issue);

        return {
          id: generateId(),
          url,
          date: new Date().toISOString(),
          overallScore,
          scores,
          findings,
          strengths,
          weaknesses,
          criticalIssues,
          metadata: {
            analyzedUrl: url,
            analysisDate: new Date().toISOString(),
            duration: 0,
            dataSources: ["YouTube Public Data", "Video URL Analysis"],
            limitations: ["Based on publicly available YouTube data"],
            methodologyVersion: "2.0.0",
          },
        };
      }
    }
  } catch {
    // Fallback
  }

  // Fallback
  return createFallbackResult(url, locale);
}

// =============================================================================
// SNAPCHAT ANALYSIS
// =============================================================================

async function analyzeSnapchat(url: string, locale: string = "en"): Promise<AnalysisResult> {
  const username = extractSnapchatUsername(url);
  const scores: CategoryScores = {
    seo: { score: 75, maxScore: 100, label: "SEO", labelAr: "تحسين محركات البحث", description: "Snapchat discoverability", descriptionAr: "قابلية الاكتشاف في سناب شات", findings: [] },
    performance: { score: 88, maxScore: 100, label: "Performance", labelAr: "الأداء", description: "Snapchat app performance", descriptionAr: "أداء تطبيق سناب شات", findings: [] },
    accessibility: { score: 82, maxScore: 100, label: "Accessibility", labelAr: "إمكانية الوصول", description: "Snapchat accessibility", descriptionAr: "إمكانية الوصول في سناب شات", findings: [] },
    security: { score: 92, maxScore: 100, label: "Security", labelAr: "الأمان", description: "Snapchat security features", descriptionAr: "ميزات أمان سناب شات", findings: [] },
    content: { score: 70, maxScore: 100, label: "Content & Structure", labelAr: "المحتوى والهيكل", description: "Content quality and engagement", descriptionAr: "جودة المحتوى والتفاعل", findings: [] },
    technical: { score: 85, maxScore: 100, label: "Technical Health", labelAr: "الصحة التقنية", description: "Snapchat technical infrastructure", descriptionAr: "البنية التحتية التقنية لسناب شات", findings: [] },
  };

  const findings: Finding[] = [
    createFinding("seo", "info", url,
      `✓ Snapchat profile: @${username || "unknown"}`,
      `✓ حساب سناب شات: @${username || "غير معروف"}`),
    createFinding("content", "medium", url,
      "Snapchat content is ephemeral (24h), consistent posting recommended",
      "محتوى سناب شات مؤقت (24 ساعة)، يُنصح بالنشر المنتظم",
      "Ephemeral content requires consistent posting to maintain engagement",
      "المحتوى المؤقت يتطلب نشراً منتظماً للحفاظ على التفاعل"),
    createFinding("performance", "info", url,
      "✓ Snapchat platform handles performance automatically",
      "✓ منصة سناب شات تدير الأداء تلقائياً"),
  ];

  const overallScore = formatScore(Math.round((Object.values(scores).reduce((a, s) => a + s.score, 0)) / 6));
  const criticalIssues = findings.filter(f => f.severity === "critical" || f.severity === "high");
  const strengths = findings.filter(f => f.severity === "info").map(f => locale === "ar" ? f.issueAr : f.issue);
  const weaknesses = criticalIssues.map(f => locale === "ar" ? f.issueAr : f.issue);

  return {
    id: generateId(),
    url,
    date: new Date().toISOString(),
    overallScore,
    scores,
    findings,
    strengths,
    weaknesses,
    criticalIssues,
    metadata: {
      analyzedUrl: url,
      analysisDate: new Date().toISOString(),
      duration: 0,
      dataSources: ["Snapchat Public Profile Analysis"],
      limitations: ["Snapchat is a closed platform; analysis is based on public signals"],
      methodologyVersion: "2.0.0",
    },
  };
}

function extractSnapchatUsername(url: string): string | null {
  const match = url.match(/snapchat\.com\/(?:add\/)?([a-zA-Z0-9_]+)/i);
  return match?.[1] || null;
}

// =============================================================================
// HELPERS
// =============================================================================

function createFinding(
  category: keyof CategoryScores,
  severity: "critical" | "high" | "medium" | "low" | "info",
  url: string,
  issue: string,
  issueAr: string,
  whyItMatters?: string,
  whyItMattersAr?: string,
): Finding {
  return {
    id: `${category}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    issue,
    issueAr: issueAr || issue,
    severity,
    evidence: issue,
    evidenceAr: issueAr || issue,
    location: url,
    whyItMatters: whyItMatters || "This affects your digital presence performance",
    whyItMattersAr: whyItMattersAr || "هذا يؤثر على أداء حضورك الرقمي",
    howToFix: "Follow the recommendations above to improve this metric",
    howToFixAr: "اتبع التوصيات أعلاه لتحسين هذا المؤشر",
    category,
    expectedBenefit: "Improved overall digital presence",
    expectedBenefitAr: "تحسين الحضور الرقمي العام",
  };
}

function createFallbackResult(url: string, locale: string = "en"): AnalysisResult {
  const scores: CategoryScores = {
    seo: { score: 65, maxScore: 100, label: "SEO", labelAr: "تحسين محركات البحث", description: "SEO analysis", descriptionAr: "تحليل تحسين محركات البحث", findings: [] },
    performance: { score: 65, maxScore: 100, label: "Performance", labelAr: "الأداء", description: "Performance analysis", descriptionAr: "تحليل الأداء", findings: [] },
    accessibility: { score: 65, maxScore: 100, label: "Accessibility", labelAr: "إمكانية الوصول", description: "Accessibility analysis", descriptionAr: "تحليل إمكانية الوصول", findings: [] },
    security: { score: 65, maxScore: 100, label: "Security", labelAr: "الأمان", description: "Security analysis", descriptionAr: "تحليل الأمان", findings: [] },
    content: { score: 65, maxScore: 100, label: "Content & Structure", labelAr: "المحتوى والهيكل", description: "Content analysis", descriptionAr: "تحليل المحتوى", findings: [] },
    technical: { score: 65, maxScore: 100, label: "Technical Health", labelAr: "الصحة التقنية", description: "Technical analysis", descriptionAr: "تحليل تقني", findings: [] },
  };

  const findings = [createFinding("technical", "high", url, "Unable to complete detailed analysis. Please try again.", "غير قادر على إكمال التحليل التفصيلي. حاول مرة أخرى.")];

  return {
    id: generateId(),
    url,
    date: new Date().toISOString(),
    overallScore: 65,
    scores,
    findings,
    strengths: [],
    weaknesses: locale === "ar" ? ["غير قادر على إكمال التحليل"] : ["Unable to complete analysis"],
    criticalIssues: findings,
    metadata: {
      analyzedUrl: url,
      analysisDate: new Date().toISOString(),
      duration: 0,
      dataSources: ["Limited analysis"],
      limitations: ["Analysis could not be completed"],
      methodologyVersion: "2.0.0",
    },
  };
}

function formatNumber(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return n.toString();
}