import { NextRequest, NextResponse } from "next/server";
import { safeFetch, validateUrlForFetch, ssrfErrorResponse } from "@/lib/security";
import { recordAnalysis } from "@/lib/admin-stats";
import { enforceSubscription } from "@/lib/subscription-shield";
import { checkRateLimit } from "@/lib/rate-limiter";

export const dynamic = "force-dynamic";

const MAX_BODY_SIZE = 10_000; // Maximum URL length in characters
const MAX_RESPONSE_SIZE = 2_000_000; // ~2MB max HTML response

export async function POST(request: NextRequest) {
  try {
    // ---- Rate limiting by IP ----
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const rl = checkRateLimit(`analyze:${ip}`, 20, 60_000); // 20 requests per minute
    if (!rl.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many requests. Try again in ${Math.ceil((rl.resetAt - Date.now()) / 1000)} seconds.`,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)),
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }

    const body = await request.json();
    const { url, locale } = body;

    // ---- Input validation ----
    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required and must be a string" }, { status: 400 });
    }
    if (url.length > MAX_BODY_SIZE) {
      return NextResponse.json({ error: "URL is too long" }, { status: 400 });
    }

    const blocked = enforceSubscription(request);
    if (blocked) return blocked;

    const normalizedUrl = url.startsWith("http") ? url : `https://${url}`;
    
    // SSRF Protection - Validate URL before fetching
    const urlError = validateUrlForFetch(normalizedUrl);
    if (urlError) {
      return ssrfErrorResponse(urlError);
    }

    const startTime = Date.now();

    // Fetch the actual page with SSRF protection
    const res = await safeFetch(normalizedUrl, {
      headers: {
        "User-Agent": `Mozilla/5.0 (compatible; SmartLandBot/3.0; +${new URL(normalizedUrl).origin}/bot)`,
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
    });

    const html = await res.text();
    const headers: Record<string, string> = {};
    res.headers.forEach((value, key) => { headers[key.toLowerCase()] = value; });
    const loadTime = Date.now() - startTime;
    const pageSize = new TextEncoder().encode(html).length;
    const statusCode = res.status;
    const finalUrl = res.url;
    const lowerHtml = html.toLowerCase();

    // ===== REAL DATA EXTRACTION =====

    // 1. SEO Analysis
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch?.[1]?.trim() || null;
    const titleLength = title ? title.length : 0;
    const hasMetaDesc = !!lowerHtml.match(/<meta[^>]+name=["']description["'][^>]*>/i);
    const metaDescContent = html.match(/<meta[^>]+name=["']description["'][^>]*content=["']([^"']+)["']/i)?.[1] || null;
    const h1Count = (html.match(/<h1[^>]*>/gi) || []).length;
    const h1Texts = [...html.matchAll(/<h1[^>]*>([^<]+)<\/h1>/gi)].map(m => m[1].trim());
    const hasCanonical = !!lowerHtml.match(/<link[^>]+rel=["']canonical["']/i);
    const canonicalHref = html.match(/<link[^>]+rel=["']canonical["'][^>]*href=["']([^"']+)["']/i)?.[1] || null;
    const imgs = html.match(/<img[^>]*>/gi) || [];
    const imgsWithAlt = imgs.filter(i => i.match(/alt=/i)).length;
    const imgsWithoutAlt = imgs.length - imgsWithAlt;
    const hasRobotsMeta = !!lowerHtml.match(/<meta[^>]+name=["']robots["'][^>]*>/i);
    const robotsContent = html.match(/<meta[^>]+name=["']robots["'][^>]*content=["']([^"']+)["']/i)?.[1] || null;
    const h2Count = (html.match(/<h2[^>]*>/gi) || []).length;
    const h3Count = (html.match(/<h3[^>]*>/gi) || []).length;

    // 2. Performance Analysis
    const scripts = (html.match(/<script[^>]*>/gi) || []).length;
    const stylesheets = (html.match(/<link[^>]+rel=["']stylesheet["'][^>]*>/gi) || []).length;
    const hasCompression = !!headers["content-encoding"];
    const hasCDN = !!(headers["cf-ray"] || headers["x-cache"] || headers["x-served-by"] || headers["x-amz-cf-id"]);
    const cdnProvider = headers["cf-ray"] ? "Cloudflare" : headers["x-amz-cf-id"] ? "AWS CloudFront" : headers["x-served-by"] ? "Fastly" : null;
    const hasCacheHeaders = !!(headers["cache-control"] || headers["expires"] || headers["etag"]);
    const hasHttp2 = !!(headers["alt-svc"]?.includes("h2") || headers["alt-svc"]?.includes("h3"));
    const hasLazyLoading = lowerHtml.includes("loading=");
    const hasAsyncScripts = lowerHtml.includes("async") || lowerHtml.includes("defer");
    const inlineStyles = (html.match(/<style[^>]*>/gi) || []).length;
    const fontCount = (html.match(/<link[^>]+href=["'][^"']*\.(woff|woff2|ttf|otf)["'][^>]*>/gi) || []).length;

    // 3. Accessibility Analysis
    const hasLangAttr = !!lowerHtml.match(/<html[^>]+lang=/i);
    const langValue = html.match(/<html[^>]+lang=["']([a-z-]+)["']/i)?.[1] || null;
    const hasViewport = !!lowerHtml.match(/<meta[^>]+name=["']viewport["'][^>]*>/i);
    const ariaRoles = (html.match(/role=["'][^"']*["']/gi) || []).length;
    const ariaAttributes = (html.match(/aria-[a-z]+=/gi) || []).length;
    const hasSkipLink = lowerHtml.includes("skip") || lowerHtml.includes("skip-to-content") || lowerHtml.includes("skiptocontent");
    const hasTabIndex = lowerHtml.includes("tabindex");
    const formLabels = (html.match(/<label[^>]*>/gi) || []).length;
    const inputs = (html.match(/<input[^>]*>/gi) || []).length;
    const inputsWithLabels = Math.min(formLabels, inputs);
    const hasAriaLive = lowerHtml.includes("aria-live");
    const hasAriaHidden = lowerHtml.includes("aria-hidden");
    const headingStructure = h1Count === 1 && h2Count >= h1Count;

    // 4. Security Analysis
    const isHttps = finalUrl.startsWith("https://");
    const hsts = headers["strict-transport-security"] || null;
    const csp = headers["content-security-policy"] || null;
    const xFrameOptions = headers["x-frame-options"] || null;
    const xContentTypeOptions = headers["x-content-type-options"] || null;
    const referrerPolicy = headers["referrer-policy"] || null;
    const permissionsPolicy = headers["permissions-policy"] || null;
    const corsPolicy = headers["access-control-allow-origin"] || null;
    const serverHeader = headers["server"] || null;
    const xPoweredBy = headers["x-powered-by"] || null;
    const cookies = headers["set-cookie"] || null;
    const hasSecureCookies = cookies ? !cookies.includes("; secure") === false : true;

    // 5. Content Analysis
    const textContent = html.replace(/<[^>]+>/g, "").trim();
    const wordCount = textContent.split(/\s+/).filter(w => w.length > 0).length;
    const paragraphCount = (html.match(/<p[^>]*>/gi) || []).length;
    const hasArticle = !!lowerHtml.match(/<article|<section|<main/i);
    const hasAuthorInfo = !!lowerHtml.match(/author|byline|written.?by/i);
    const hasDates = !!lowerHtml.match(/datePublished|dateModified|published|updated/i);
    const hasBlogIndicators = !!lowerHtml.match(/blog|article|news|post/i);
    const listCount = (html.match(/<[uo]l[^>]*>/gi) || []).length;
    const tableCount = (html.match(/<table[^>]*>/gi) || []).length;
    const imageCount = imgs.length;
    const videoCount = (html.match(/<video[^>]*>/gi) || []).length;
    const linkCount = (html.match(/<a[^>]*href=["']https?:\/\//gi) || []).length;
    const internalLinks = (html.match(/<a[^>]*href=["']\//gi) || []).length;

    // 6. Technical Analysis
    const hasDoctype = !!lowerHtml.match(/<!DOCTYPE/i);
    const hasCharset = !!lowerHtml.match(/charset=/i);
    const hasSitemap = !!lowerHtml.match(/sitemap/i);
    const hasRSS = !!lowerHtml.match(/rss|atom|feed/i);
    const hasOpenSearch = !!lowerHtml.match(/opensearch/i);
    const hasPreconnect = lowerHtml.includes("dns-prefetch") || lowerHtml.includes("preconnect");
    const hasPreload = lowerHtml.includes("preload");
    const hasManifest = !!lowerHtml.match(/<link[^>]+rel=["']manifest["']/i);
    const hasServiceWorker = lowerHtml.includes("serviceWorker") || lowerHtml.includes("navigator.serviceWorker");

    // 7. Social Media & Open Graph
    const ogTags = html.match(/<meta[^>]+property=["']og:/gi) || [];
    const ogTitle = html.match(/<meta[^>]+property=["']og:title["'][^>]*content=["']([^"']+)["']/i)?.[1] || null;
    const ogDescription = html.match(/<meta[^>]+property=["']og:description["'][^>]*content=["']([^"']+)["']/i)?.[1] || null;
    const ogImage = html.match(/<meta[^>]+property=["']og:image["'][^>]*content=["']([^"']+)["']/i)?.[1] || null;
    const ogUrl = html.match(/<meta[^>]+property=["']og:url["'][^>]*content=["']([^"']+)["']/i)?.[1] || null;
    const ogType = html.match(/<meta[^>]+property=["']og:type["'][^>]*content=["']([^"']+)["']/i)?.[1] || null;
    const twitterCard = html.match(/<meta[^>]+name=["']twitter:card["'][^>]*content=["']([^"']+)["']/i)?.[1] || null;
    const twitterSite = html.match(/<meta[^>]+name=["']twitter:site["'][^>]*content=["']([^"']+)["']/i)?.[1] || null;
    const twitterCreator = html.match(/<meta[^>]+name=["']twitter:creator["'][^>]*content=["']([^"']+)["']/i)?.[1] || null;
    const hasFacebookPixel = lowerHtml.includes("facebook") || lowerHtml.includes("fbq(");
    const hasTwitterWidget = lowerHtml.includes("twitter.com") || lowerHtml.includes("platform.twitter");

    // 8. Structured Data (Schema.org)
    const jsonLdScripts = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi) || [];
    const schemaTypes: string[] = [];
    let validJsonLd = false;
    for (const script of jsonLdScripts) {
      try {
        const jsonContent = script.replace(/<script[^>]*>/, "").replace(/<\/script>/, "").trim();
        const parsed = JSON.parse(jsonContent);
        if (parsed["@type"]) schemaTypes.push(parsed["@type"]);
        if (parsed["@graph"]) {
          parsed["@graph"].forEach((item: any) => {
            if (item["@type"]) schemaTypes.push(item["@type"]);
          });
        }
        validJsonLd = true;
      } catch {}
    }
    const hasMicrodata = !!lowerHtml.match(/itemscope|itemtype=http/gi);
    const hasStructuredData = jsonLdScripts.length > 0 || hasMicrodata;

    // 9. Technology Detection
    const techStack: string[] = [];
    if (lowerHtml.includes("wp-content") || lowerHtml.includes("wp-includes") || lowerHtml.includes("wordpress")) techStack.push("WordPress");
    if (lowerHtml.includes("shopify") || lowerHtml.includes("myshopify")) techStack.push("Shopify");
    if (lowerHtml.includes("wix.com")) techStack.push("Wix");
    if (lowerHtml.includes("squarespace")) techStack.push("Squarespace");
    if (lowerHtml.includes("__NEXT_DATA__") || lowerHtml.includes("next.js")) techStack.push("Next.js");
    if (lowerHtml.includes("react") || lowerHtml.includes("react.js")) techStack.push("React");
    if (lowerHtml.includes("vue.js") || lowerHtml.includes("vuejs")) techStack.push("Vue.js");
    if (lowerHtml.includes("angular") || lowerHtml.includes("ng-")) techStack.push("Angular");
    if (lowerHtml.includes("jquery")) techStack.push("jQuery");
    if (lowerHtml.includes("bootstrap")) techStack.push("Bootstrap");
    if (lowerHtml.includes("tailwind")) techStack.push("Tailwind CSS");
    if (lowerHtml.includes("font-awesome") || lowerHtml.includes("fontawesome")) techStack.push("Font Awesome");
    if (lowerHtml.includes("chart.js")) techStack.push("Chart.js");
    if (lowerHtml.includes("google-analytics") || lowerHtml.includes("ga.js") || lowerHtml.includes("gtag")) techStack.push("Google Analytics");
    if (lowerHtml.includes("googletagmanager")) techStack.push("Google Tag Manager");
    if (lowerHtml.includes("hotjar")) techStack.push("Hotjar");
    if (lowerHtml.includes("intercom")) techStack.push("Intercom");
    if (lowerHtml.includes("clarity.microsoft")) techStack.push("Microsoft Clarity");
    if (lowerHtml.includes("stripe") || lowerHtml.includes("pk_live")) techStack.push("Stripe");
    if (lowerHtml.includes("paypal")) techStack.push("PayPal");

    // ===== SCORE CALCULATION (based on real data only) =====

    // SEO Score (0-100)
    let seoScore = 0;
    if (title) {
      seoScore += 15;
      if (titleLength >= 30 && titleLength <= 60) seoScore += 10;
      else if (titleLength > 10) seoScore += 5;
    }
    if (hasMetaDesc) seoScore += 12;
    if (metaDescContent && metaDescContent.length >= 50 && metaDescContent.length <= 160) seoScore += 8;
    if (h1Count === 1) seoScore += 10;
    else if (h1Count > 1) seoScore += 5;
    if (hasCanonical) seoScore += 5;
    if (hasRobotsMeta) seoScore += 3;
    if (imgs.length > 0) seoScore += Math.round((imgsWithAlt / imgs.length) * 10);
    if (h2Count > 0) seoScore += 5;
    if (h3Count > 0) seoScore += 3;
    if (hasStructuredData) seoScore += 10;
    if (ogTags.length > 0) seoScore += 5;
    if (twitterCard) seoScore += 3;
    seoScore = Math.min(100, seoScore);

    // Performance Score (0-100)
    let perfScore = 0;
    if (loadTime < 1000) perfScore += 25;
    else if (loadTime < 2000) perfScore += 20;
    else if (loadTime < 3000) perfScore += 15;
    else if (loadTime < 5000) perfScore += 10;
    else perfScore += 5;
    if (pageSize < 50000) perfScore += 15;
    else if (pageSize < 100000) perfScore += 12;
    else if (pageSize < 300000) perfScore += 8;
    else if (pageSize < 500000) perfScore += 5;
    else perfScore += 2;
    if (hasCompression) perfScore += 10;
    if (hasCDN) perfScore += 10;
    if (hasCacheHeaders) perfScore += 8;
    if (hasHttp2) perfScore += 7;
    if (hasLazyLoading) perfScore += 5;
    if (hasAsyncScripts) perfScore += 5;
    if (scripts <= 15) perfScore += 5;
    else if (scripts <= 30) perfScore += 3;
    if (stylesheets <= 5) perfScore += 5;
    else if (stylesheets <= 10) perfScore += 3;
    if (fontCount <= 3) perfScore += 5;
    else perfScore += 2;
    if (hasPreconnect) perfScore += 5;
    if (hasPreload) perfScore += 3;
    perfScore = Math.min(100, perfScore);

    // Accessibility Score (0-100)
    let accScore = 0;
    if (hasLangAttr) accScore += 15;
    if (hasViewport) accScore += 12;
    if (ariaRoles >= 5) accScore += 12;
    else if (ariaRoles >= 3) accScore += 8;
    else if (ariaRoles >= 1) accScore += 4;
    if (ariaAttributes >= 5) accScore += 10;
    else if (ariaAttributes >= 1) accScore += 5;
    if (hasSkipLink) accScore += 8;
    if (hasTabIndex) accScore += 5;
    if (inputs > 0) accScore += Math.round((inputsWithLabels / inputs) * 8);
    else accScore += 8;
    if (hasAriaLive) accScore += 5;
    if (hasAriaHidden) accScore += 5;
    if (headingStructure) accScore += 10;
    if (imgsWithoutAlt === 0 && imgs.length > 0) accScore += 10;
    else if (imgs.length > 0) accScore += Math.round(((imgs.length - imgsWithoutAlt) / imgs.length) * 10);
    accScore = Math.min(100, accScore);

    // Security Score (0-100)
    let secScore = 0;
    if (isHttps) secScore += 20;
    if (hsts) {
      secScore += 15;
      if (hsts.includes("includeSubDomains")) secScore += 5;
      if (hsts.includes("preload")) secScore += 5;
    }
    if (csp) secScore += 15;
    if (xFrameOptions) secScore += 10;
    if (xContentTypeOptions) secScore += 8;
    if (referrerPolicy) secScore += 7;
    if (permissionsPolicy) secScore += 5;
    if (corsPolicy) secScore += 5;
    if (hasSecureCookies) secScore += 5;
    if (serverHeader && !xPoweredBy) secScore += 5;
    secScore = Math.min(100, secScore);

    // Content Score (0-100)
    let contScore = 0;
    if (wordCount >= 2000) contScore += 15;
    else if (wordCount >= 1000) contScore += 12;
    else if (wordCount >= 500) contScore += 8;
    else if (wordCount >= 300) contScore += 5;
    else contScore += 2;
    if (paragraphCount >= 10) contScore += 10;
    else if (paragraphCount >= 5) contScore += 6;
    else if (paragraphCount >= 3) contScore += 3;
    if (hasArticle) contScore += 8;
    if (hasAuthorInfo) contScore += 5;
    if (hasDates) contScore += 5;
    if (hasBlogIndicators) contScore += 5;
    if (listCount > 0) contScore += 5;
    if (imageCount > 0) contScore += 5;
    if (videoCount > 0) contScore += 3;
    if (linkCount > 0) contScore += 5;
    if (internalLinks > 0) contScore += 5;
    if (hasStructuredData) contScore += 8;
    if (ogTags.length > 0) contScore += 5;
    if (hasFacebookPixel || hasTwitterWidget) contScore += 3;
    contScore = Math.min(100, contScore);

    // Technical Score (0-100)
    let techScore = 0;
    if (statusCode >= 200 && statusCode < 300) techScore += 15;
    else if (statusCode >= 300 && statusCode < 400) techScore += 10;
    if (hasDoctype) techScore += 8;
    if (hasCharset) techScore += 8;
    if (hasSitemap) techScore += 8;
    if (hasRSS) techScore += 5;
    if (hasManifest) techScore += 5;
    if (hasServiceWorker) techScore += 5;
    if (hasPreconnect) techScore += 5;
    if (hasPreload) techScore += 5;
    if (hasCompression) techScore += 8;
    if (hasCDN) techScore += 8;
    if (hasHttp2) techScore += 8;
    if (hasCacheHeaders) techScore += 5;
    if (hasOpenSearch) techScore += 3;
    if (techStack.length > 0) techScore += 5;
    techScore = Math.min(100, techScore);

    const overallScore = Math.round((seoScore + perfScore + accScore + secScore + contScore + techScore) / 6);

    // ===== BUILD FINDINGS =====
    const findings: Array<{
      category: string;
      severity: string;
      issue: string;
      issueAr: string;
      evidence: string;
      evidenceAr: string;
      whyItMatters: string;
      whyItMattersAr: string;
      howToFix: string;
      howToFixAr: string;
      expectedBenefit: string;
      expectedBenefitAr: string;
    }> = [];

    // SEO Findings
    if (!title) {
      findings.push({
        category: "seo", severity: "critical",
        issue: "Missing <title> tag - critical for SEO",
        issueAr: "علامة <title> مفقودة - حرجة لتحسين محركات البحث",
        evidence: "No <title> tag found in the HTML head section",
        evidenceAr: "لم يتم العثور على علامة <title> في قسم الرأس في HTML",
        whyItMatters: "Search engines rely on the title tag as the primary identifier for your page in search results. Without it, your page may not rank properly.",
        whyItMattersAr: "تعتمد محركات البحث على علامة العنوان كمحدد أساسي لصفحتك في نتائج البحث. بدونها، قد لا تظهر صفحتك بشكل صحيح.",
        howToFix: "Add a descriptive <title> tag between 30-60 characters in the <head> section of your HTML",
        howToFixAr: "أضف علامة <title> وصفية بين 30-60 حرفاً في قسم <head> في HTML الخاص بك",
        expectedBenefit: "Improved search ranking and click-through rate from search results",
        expectedBenefitAr: "تحسين ترتيب البحث ونسبة النقر من نتائج البحث"
      });
    } else if (titleLength < 30) {
      findings.push({
        category: "seo", severity: "high",
        issue: `Title tag too short (${titleLength} characters). Recommended: 30-60 characters`,
        issueAr: `علامة العنوان قصيرة جداً (${titleLength} حرف). الموصى به: 30-60 حرفاً`,
        evidence: `Current title: "${title}"`,
        evidenceAr: `العنوان الحالي: "${title}"`,
        whyItMatters: "Short title tags may not fully describe your page content to search engines and users",
        whyItMattersAr: "علامات العنوان القصيرة قد لا تصف محتوى صفحتك بالكامل لمحركات البحث والمستخدمين",
        howToFix: `Expand the title to include key keywords. Current length: ${titleLength}. Target: 30-60 characters`,
        howToFixAr: `وسّع العنوان ليشمل الكلمات المفتاحية الرئيسية. الطول الحالي: ${titleLength}. الهدف: 30-60 حرفاً`,
        expectedBenefit: "Better keyword relevance and improved search visibility",
        expectedBenefitAr: "تحسين ملاءمة الكلمات المفتاحية وظهور أفضل في البحث"
      });
    }
    if (!hasMetaDesc) {
      findings.push({
        category: "seo", severity: "high",
        issue: "Missing meta description tag",
        issueAr: "علامة الوصف الوصفي (meta description) مفقودة",
        evidence: "No <meta name='description'> tag found in the HTML head",
        evidenceAr: "لم يتم العثور على علامة <meta name='description'> في قسم الرأس",
        whyItMatters: "Meta descriptions appear in search results and influence click-through rates. They help users decide whether to click your link.",
        whyItMattersAr: "تظهر الأوصاف الوصفية في نتائج البحث وتؤثر على نسبة النقر. تساعد المستخدمين في تحديد ما إذا كانوا سينقرون على رابطك.",
        howToFix: "Add <meta name='description' content='A compelling 150-160 character description of your page'> to the <head> section",
        howToFixAr: "أضف <meta name='description' content='وصف مقنع من 150-160 حرفاً لصفحتك'> إلى قسم <head>",
        expectedBenefit: "Improved click-through rate from search results by up to 5.8%",
        expectedBenefitAr: "تحسين نسبة النقر من نتائج البحث بنسبة تصل إلى 5.8%"
      });
    }
    if (h1Count === 0) {
      findings.push({
        category: "seo", severity: "high",
        issue: "Missing H1 heading tag",
        issueAr: "علامة العنوان الرئيسي H1 مفقودة",
        evidence: "No <h1> tag found in the page content",
        evidenceAr: "لم يتم العثور على علامة <h1> في محتوى الصفحة",
        whyItMatters: "H1 headings help search engines understand the main topic of your page and improve accessibility for screen readers",
        whyItMattersAr: "عناوين H1 تساعد محركات البحث على فهم الموضوع الرئيسي لصفحتك وتحسين إمكانية الوصول لقارئات الشاشة",
        howToFix: "Add one <h1> tag that describes the main topic of your page. Use only one H1 per page.",
        howToFixAr: "أضف علامة <h1> واحدة تصف الموضوع الرئيسي لصفحتك. استخدم H1 واحدة فقط في كل صفحة.",
        expectedBenefit: "Clearer content hierarchy and improved search engine understanding",
        expectedBenefitAr: "تسلسل هرمي أوضح للمحتوى وتحسين فهم محركات البحث"
      });
    } else if (h1Count > 1) {
      findings.push({
        category: "seo", severity: "medium",
        issue: `Multiple H1 tags found (${h1Count}). Best practice is one H1 per page`,
        issueAr: `تم العثور على عدة علامات H1 (${h1Count}). الأفضل استخدام H1 واحدة فقط في كل صفحة`,
        evidence: `Found ${h1Count} H1 tags: ${h1Texts.slice(0, 3).join(", ")}${h1Texts.length > 3 ? "..." : ""}`,
        evidenceAr: `تم العثور على ${h1Count} علامات H1: ${h1Texts.slice(0, 3).join("، ")}${h1Texts.length > 3 ? "..." : ""}`,
        whyItMatters: "Multiple H1 tags can confuse search engines about the primary topic of your page",
        whyItMattersAr: "علامات H1 متعددة قد تربك محركات البحث حول الموضوع الرئيسي لصفحتك",
        howToFix: "Use only one H1 tag per page. Convert additional H1 tags to H2 or H3 as appropriate",
        howToFixAr: "استخدم علامة H1 واحدة فقط في كل صفحة. حول علامات H1 الإضافية إلى H2 أو H3 حسب المناسب",
        expectedBenefit: "Better SEO structure and clearer content hierarchy",
        expectedBenefitAr: "هيكل SEO أفضل وتسلسل هرمي أوضح للمحتوى"
      });
    }
    if (imgsWithoutAlt > 0) {
      findings.push({
        category: "seo", severity: "medium",
        issue: `${imgsWithoutAlt} image(s) missing alt attributes`,
        issueAr: `${imgsWithoutAlt} صورة بدون نص بديل (alt)`,
        evidence: `${imgsWithoutAlt} out of ${imgs.length} images lack alt text`,
        evidenceAr: `${imgsWithoutAlt} من أصل ${imgs.length} صورة تفتقر إلى النص البديل`,
        whyItMatters: "Alt text helps search engines understand images and is essential for accessibility. Screen readers rely on alt text to describe images to visually impaired users.",
        whyItMattersAr: "النص البديل يساعد محركات البحث على فهم الصور وهو ضروري لإمكانية الوصول. تعتمد قارئات الشاشة على النص البديل لوصف الصور للمستخدمين ضعاف البصر.",
        howToFix: "Add descriptive alt attributes to all images. Example: <img src='image.jpg' alt='Description of image'>",
        howToFixAr: "أضف سمات alt وصفية لجميع الصور. مثال: <img src='image.jpg' alt='وصف الصورة'>",
        expectedBenefit: "Better image SEO and improved accessibility for visually impaired users",
        expectedBenefitAr: "تحسين SEO الصور وتحسين إمكانية الوصول للمستخدمين ضعاف البصر"
      });
    }
    if (!hasCanonical) {
      findings.push({
        category: "seo", severity: "low",
        issue: "No canonical URL tag detected",
        issueAr: "لم يتم اكتشاف علامة الرابط الأساسي (canonical)",
        evidence: "No <link rel='canonical'> tag found",
        evidenceAr: "لم يتم العثور على علامة <link rel='canonical'>",
        whyItMatters: "Canonical tags help prevent duplicate content issues by telling search engines which version of a page is the primary one",
        whyItMattersAr: "علامات الرابط الأساسي تساعد في منع مشاكل المحتوى المكرر بإخبار محركات البحث عن النسخة الأساسية للصفحة",
        howToFix: "Add <link rel='canonical' href='https://yourdomain.com/current-page-url/' /> to the <head> section",
        howToFixAr: "أضف <link rel='canonical' href='https://yourdomain.com/current-page-url/' /> إلى قسم <head>",
        expectedBenefit: "Prevents duplicate content penalties and consolidates ranking signals",
        expectedBenefitAr: "يمنع عقوبات المحتوى المكرر ويوحد إشارات التصنيف"
      });
    }

    // Performance Findings
    if (loadTime > 3000) {
      findings.push({
        category: "performance", severity: "high",
        issue: `Slow page load time: ${(loadTime / 1000).toFixed(1)}s (target: <3s)`,
        issueAr: `وقت تحميل الصفحة بطيء: ${(loadTime / 1000).toFixed(1)} ثانية (الهدف: <3 ثوان)`,
        evidence: `Server response time: ${loadTime}ms. Page size: ${(pageSize / 1024).toFixed(1)}KB`,
        evidenceAr: `وقت استجابة الخادم: ${loadTime}ms. حجم الصفحة: ${(pageSize / 1024).toFixed(1)}KB`,
        whyItMatters: "Page load time is a critical ranking factor for Google and directly impacts user experience. 53% of mobile users abandon sites that take longer than 3 seconds to load.",
        whyItMattersAr: "وقت تحميل الصفحة هو عامل ترتيب حاسم لجوجل ويؤثر مباشرة على تجربة المستخدم. 53% من مستخدمي الجوال يتخلون عن المواقع التي تستغرق أكثر من 3 ثوانٍ للتحميل.",
        howToFix: "Optimize images, enable compression (gzip/brotli), minimize CSS/JS, implement lazy loading, and use a CDN",
        howToFixAr: "حسّن الصور، فعّل الضغط (gzip/brotli)، صغّر ملفات CSS/JS، طبّق التحميل البطيء، واستخدم CDN",
        expectedBenefit: "Up to 50% improvement in load time, better user experience, and improved search rankings",
        expectedBenefitAr: "تحسين يصل إلى 50% في وقت التحميل، تجربة مستخدم أفضل، وتحسين ترتيب البحث"
      });
    }
    if (!hasCompression) {
      findings.push({
        category: "performance", severity: "medium",
        issue: "No content compression detected (gzip/brotli)",
        issueAr: "لا يوجد ضغط للمحتوى (gzip/brotli)",
        evidence: "Content-Encoding header is missing from server response",
        evidenceAr: "رأس Content-Encoding مفقود من استجابة الخادم",
        whyItMatters: "Compression can reduce page size by up to 70%, significantly improving load times, especially on slow connections",
        whyItMattersAr: "الضغط يمكن أن يقلل حجم الصفحة بنسبة تصل إلى 70%، مما يحسن أوقات التحميل بشكل كبير، خاصة على الاتصالات البطيئة",
        howToFix: "Enable gzip or brotli compression on your web server (Apache, Nginx, etc.)",
        howToFixAr: "فعّل ضغط gzip أو brotli على خادم الويب الخاص بك (Apache, Nginx, إلخ)",
        expectedBenefit: "Up to 70% reduction in transfer size and significantly faster page loads",
        expectedBenefitAr: "تقليل يصل إلى 70% في حجم النقل وأوقات تحميل أسرع بشكل كبير"
      });
    }
    if (!hasCDN) {
      findings.push({
        category: "performance", severity: "medium",
        issue: "No CDN detected",
        issueAr: "لم يتم اكتشاف CDN",
        evidence: "No CDN-related headers found (cf-ray, x-cache, x-amz-cf-id, etc.)",
        evidenceAr: "لم يتم العثور على رؤوس متعلقة بـ CDN (cf-ray, x-cache, x-amz-cf-id, إلخ)",
        whyItMatters: "CDNs reduce latency for global users by serving content from servers closest to them, improving load times by 50% or more",
        whyItMattersAr: "شبكات CDN تقلل زمن الوصول للمستخدمين العالميين عن طريق تقديم المحتوى من الخوادم الأقرب إليهم، مما يحسن أوقات التحميل بنسبة 50% أو أكثر",
        howToFix: "Consider using a CDN provider like Cloudflare, AWS CloudFront, or Fastly",
        howToFixAr: "فكر في استخدام مزود CDN مثل Cloudflare أو AWS CloudFront أو Fastly",
        expectedBenefit: "Faster global load times, reduced server load, and improved DDoS protection",
        expectedBenefitAr: "أوقات تحميل عالمية أسرع، تقليل حمل الخادم، وتحسين الحماية من هجمات DDoS"
      });
    }
    if (scripts > 30) {
      findings.push({
        category: "performance", severity: "medium",
        issue: `High number of scripts (${scripts}). This can slow down page rendering`,
        issueAr: `عدد كبير من السكريبتات (${scripts}). هذا قد يبطئ عرض الصفحة`,
        evidence: `Found ${scripts} <script> tags in the page`,
        evidenceAr: `تم العثور على ${scripts} علامة <script> في الصفحة`,
        whyItMatters: "Each script requires a separate HTTP request and blocks page rendering. Too many scripts significantly impact page load performance.",
        whyItMattersAr: "كل سكريبت يتطلب طلب HTTP منفصل ويعوق عرض الصفحة. كثرة السكريبتات تؤثر بشكل كبير على أداء تحميل الصفحة.",
        howToFix: "Consolidate scripts, use async/defer attributes, and remove unused JavaScript",
        howToFixAr: "ادمج السكريبتات، استخدم خصائص async/defer، وأزل JavaScript غير المستخدم",
        expectedBenefit: "Faster page rendering and improved performance scores",
        expectedBenefitAr: "عرض أسرع للصفحة وتحسين درجات الأداء"
      });
    }

    // Accessibility Findings
    if (!hasLangAttr) {
      findings.push({
        category: "accessibility", severity: "high",
        issue: "Missing lang attribute on <html> tag",
        issueAr: "خاصية اللغة (lang) مفقودة من وسم <html>",
        evidence: "The <html> tag does not have a lang attribute",
        evidenceAr: "وسم <html> لا يحتوي على خاصية lang",
        whyItMatters: "Screen readers need the lang attribute to pronounce text correctly. It also helps search engines understand the language of your content.",
        whyItMattersAr: "قارئات الشاشة تحتاج خاصية lang لنطق النص بشكل صحيح. كما تساعد محركات البحث على فهم لغة المحتوى الخاص بك.",
        howToFix: "Add lang='en' (or appropriate language code like 'ar' for Arabic) to the <html> tag",
        howToFixAr: "أضف lang='ar' (أو رمز اللغة المناسب) إلى وسم <html>",
        expectedBenefit: "Better screen reader support and improved search engine language detection",
        expectedBenefitAr: "دعم أفضل لقارئات الشاشة وتحسين اكتشاف اللغة لمحركات البحث"
      });
    }
    if (!hasViewport) {
      findings.push({
        category: "accessibility", severity: "high",
        issue: "Missing viewport meta tag for mobile responsiveness",
        issueAr: "علامة viewport الوصفية مفقودة للاستجابة على الجوال",
        evidence: "No <meta name='viewport'> tag found in the HTML head",
        evidenceAr: "لم يتم العثور على علامة <meta name='viewport'> في قسم الرأس",
        whyItMatters: "The viewport meta tag is essential for proper rendering on mobile devices. Without it, mobile users will see a zoomed-out desktop version.",
        whyItMattersAr: "علامة viewport الوصفية ضرورية للعرض المناسب على الأجهزة المحمولة. بدونها، سيرى مستخدمو الجوال نسخة مصغرة من سطح المكتب.",
        howToFix: "Add <meta name='viewport' content='width=device-width, initial-scale=1.0'> to the <head> section",
        howToFixAr: "أضف <meta name='viewport' content='width=device-width, initial-scale=1.0'> إلى قسم <head>",
        expectedBenefit: "Proper mobile rendering and improved mobile user experience",
        expectedBenefitAr: "عرض مناسب على الجوال وتحسين تجربة المستخدم على الأجهزة المحمولة"
      });
    }
    if (ariaRoles < 3) {
      findings.push({
        category: "accessibility", severity: "medium",
        issue: `Limited ARIA landmarks (${ariaRoles}). Recommended: at least 3 for proper navigation`,
        issueAr: `معالم ARIA محدودة (${ariaRoles}). الموصى به: 3 على الأقل للتنقل السليم`,
        evidence: `Found ${ariaRoles} ARIA role(s) in the page`,
        evidenceAr: `تم العثور على ${ariaRoles} دور/أدوار ARIA في الصفحة`,
        whyItMatters: "ARIA landmarks help screen reader users navigate the page structure efficiently. They define regions like navigation, main content, and complementary content.",
        whyItMattersAr: "معالم ARIA تساعد مستخدمي قارئات الشاشة على التنقل في هيكل الصفحة بكفاءة. تحدد مناطق مثل التنقل والمحتوى الرئيسي والمحتوى التكميلي.",
        howToFix: "Add ARIA landmark roles: role='banner' for header, role='navigation' for nav, role='main' for main content, role='contentinfo' for footer",
        howToFixAr: "أضف أدوار معالم ARIA: role='banner' للرأس، role='navigation' للتنقل، role='main' للمحتوى الرئيسي، role='contentinfo' للتذييل",
        expectedBenefit: "Improved navigation for assistive technology users and better accessibility score",
        expectedBenefitAr: "تنقل محسن لمستخدمي التقنيات المساعدة وتحسين درجة إمكانية الوصول"
      });
    }

    // Security Findings
    if (!isHttps) {
      findings.push({
        category: "security", severity: "critical",
        issue: "Website is not using HTTPS encryption",
        issueAr: "الموقع لا يستخدم تشفير HTTPS",
        evidence: `Current protocol: HTTP. URL: ${finalUrl}`,
        evidenceAr: `البروتوكول الحالي: HTTP. الرابط: ${finalUrl}`,
        whyItMatters: "HTTPS encrypts all data between the user and your server. Without it, all data is sent in plain text and can be intercepted. Google also uses HTTPS as a ranking signal.",
        whyItMattersAr: "HTTPS يشفر جميع البيانات بين المستخدم والخادم الخاص بك. بدونه، تُرسل جميع البيانات كنص عادي ويمكن اعتراضها. تستخدم جوجل HTTPS كإشارة ترتيب أيضاً.",
        howToFix: "Install an SSL/TLS certificate and redirect all HTTP traffic to HTTPS. Services like Let's Encrypt offer free certificates.",
        howToFixAr: "قم بتثبيت شهادة SSL/TLS وأعد توجيه جميع حركة المرور HTTP إلى HTTPS. خدمات مثل Let's Encrypt تقدم شهادات مجانية.",
        expectedBenefit: "Encrypted data transmission, improved search ranking, and increased user trust",
        expectedBenefitAr: "نقل بيانات مشفر، تحسين ترتيب البحث، وزيادة ثقة المستخدم"
      });
    }
    if (!hsts) {
      findings.push({
        category: "security", severity: "medium",
        issue: "Missing HTTP Strict-Transport-Security (HSTS) header",
        issueAr: "رأس HSTS (HTTP Strict-Transport-Security) مفقود",
        evidence: "Strict-Transport-Security header is not set in server response",
        evidenceAr: "رأس Strict-Transport-Security غير مضبوط في استجابة الخادم",
        whyItMatters: "HSTS forces browsers to always use HTTPS connections, preventing downgrade attacks and ensuring encrypted communication",
        whyItMattersAr: "HSTS يجبر المتصفحات على استخدام اتصالات HTTPS دائماً، مما يمنع هجمات خفض مستوى التشفير ويضمن اتصالاً مشفراً",
        howToFix: "Add 'Strict-Transport-Security: max-age=31536000; includeSubDomains' to your server response headers",
        howToFixAr: "أضف 'Strict-Transport-Security: max-age=31536000; includeSubDomains' إلى رؤوس استجابة الخادم الخاص بك",
        expectedBenefit: "Forced HTTPS connections, protection against SSL stripping attacks",
        expectedBenefitAr: "اتصالات HTTPS إجبارية، حماية من هجمات إزالة SSL"
      });
    }
    if (!csp) {
      findings.push({
        category: "security", severity: "medium",
        issue: "Missing Content-Security-Policy (CSP) header",
        issueAr: "سياسة أمان المحتوى (CSP) مفقودة",
        evidence: "Content-Security-Policy header is not set",
        evidenceAr: "رأس Content-Security-Policy غير مضبوط",
        whyItMatters: "CSP helps prevent Cross-Site Scripting (XSS) and data injection attacks by controlling which resources can be loaded",
        whyItMattersAr: "CSP يساعد في منع هجمات XSS وحقن البيانات عن طريق التحكم في الموارد التي يمكن تحميلها",
        howToFix: "Add a Content-Security-Policy header that restricts script sources, styles, and other resources to trusted origins",
        howToFixAr: "أضف رأس Content-Security-Policy الذي يقيد مصادر السكريبتات والأنماط والموارد الأخرى بالمصادر الموثوقة",
        expectedBenefit: "Protection against XSS attacks and improved security posture",
        expectedBenefitAr: "حماية من هجمات XSS وتحسين الوضع الأمني"
      });
    }
    if (!xFrameOptions) {
      findings.push({
        category: "security", severity: "medium",
        issue: "Missing X-Frame-Options header (clickjacking protection)",
        issueAr: "رأس X-Frame-Options مفقود (حماية من clickjacking)",
        evidence: "X-Frame-Options header is not set",
        evidenceAr: "رأس X-Frame-Options غير مضبوط",
        whyItMatters: "Without X-Frame-Options, your site can be embedded in iframes on other websites, making it vulnerable to clickjacking attacks",
        whyItMattersAr: "بدون X-Frame-Options، يمكن تضمين موقعك في iframes على مواقع أخرى، مما يجعله عرضة لهجمات clickjacking",
        howToFix: "Add 'X-Frame-Options: SAMEORIGIN' or 'X-Frame-Options: DENY' to your server response headers",
        howToFixAr: "أضف 'X-Frame-Options: SAMEORIGIN' أو 'X-Frame-Options: DENY' إلى رؤوس استجابة الخادم الخاص بك",
        expectedBenefit: "Protection against clickjacking attacks and improved security",
        expectedBenefitAr: "حماية من هجمات clickjacking وتحسين الأمان"
      });
    }

    // Content Findings
    if (wordCount < 300) {
      findings.push({
        category: "content", severity: "high",
        issue: `Thin content detected: approximately ${wordCount} words`,
        issueAr: `محتوى ضعيف: حوالي ${wordCount} كلمة`,
        evidence: `Page contains approximately ${wordCount} words of visible text content`,
        evidenceAr: `تحتوي الصفحة على حوالي ${wordCount} كلمة من المحتوى النصي المرئي`,
        whyItMatters: "Pages with thin content (less than 300 words) tend to rank poorly in search engines and provide less value to users",
        whyItMattersAr: "الصفحات ذات المحتوى الضعيف (أقل من 300 كلمة) تميل إلى الحصول على ترتيب سيء في محركات البحث وتوفر قيمة أقل للمستخدمين",
        howToFix: "Expand your content to at least 500-1000 words. Add detailed information, examples, and relevant sections",
        howToFixAr: "وسّع المحتوى الخاص بك إلى 500-1000 كلمة على الأقل. أضف معلومات مفصلة وأمثلة وأقساماً ذات صلة",
        expectedBenefit: "Better search rankings, improved user engagement, and higher perceived authority",
        expectedBenefitAr: "ترتيب بحث أفضل، تفاعل مستخدم محسن، وسلطة متصورة أعلى"
      });
    }
    if (!hasStructuredData) {
      findings.push({
        category: "content", severity: "medium",
        issue: "No structured data (Schema.org) detected",
        issueAr: "لا توجد بيانات منظمة (Schema.org)",
        evidence: "No JSON-LD or Microdata structured data found on the page",
        evidenceAr: "لم يتم العثور على بيانات منظمة JSON-LD أو Microdata في الصفحة",
        whyItMatters: "Structured data helps search engines understand your content and enables rich snippets in search results, which can increase click-through rates",
        whyItMattersAr: "البيانات المنظمة تساعد محركات البحث على فهم المحتوى الخاص بك وتمكن المقتطفات الغنية في نتائج البحث، مما يمكن أن يزيد من نسب النقر",
        howToFix: "Add JSON-LD structured data using Schema.org vocabulary. Use Google's Structured Data Markup Helper to get started",
        howToFixAr: "أضف بيانات منظمة JSON-LD باستخدام مفردات Schema.org. استخدم أداة مساعدة ترميز البيانات المنظمة من جوجل للبدء",
        expectedBenefit: "Rich snippets in search results, potentially increasing CTR by up to 30%",
        expectedBenefitAr: "مقتطفات غنية في نتائج البحث، مما قد يزيد نسبة النقر بنسبة تصل إلى 30%"
      });
    }
    if (ogTags.length === 0) {
      findings.push({
        category: "content", severity: "medium",
        issue: "Missing Open Graph meta tags for social sharing",
        issueAr: "علامات Open Graph مفقودة للمشاركة الاجتماعية",
        evidence: "No Open Graph meta tags found (og:title, og:description, og:image)",
        evidenceAr: "لم يتم العثور على علامات Open Graph (og:title, og:description, og:image)",
        whyItMatters: "Open Graph tags control how your content appears when shared on social media platforms like Facebook, LinkedIn, and Twitter",
        whyItMattersAr: "علامات Open Graph تتحكم في كيفية ظهور المحتوى الخاص بك عند مشاركته على منصات التواصل الاجتماعي مثل Facebook و LinkedIn و Twitter",
        howToFix: "Add og:title, og:description, og:image, and og:url meta tags to the <head> section",
        howToFixAr: "أضف علامات og:title و og:description و og:image و og:url الوصفية إلى قسم <head>",
        expectedBenefit: "Enhanced social media appearance with proper titles, descriptions, and images when shared",
        expectedBenefitAr: "مظهر محسّن على وسائل التواصل الاجتماعي مع عناوين وأوصاف وصور مناسبة عند المشاركة"
      });
    }

    // Technical Findings
    if (statusCode >= 400) {
      findings.push({
        category: "technical", severity: "critical",
        issue: `HTTP error status code: ${statusCode}`,
        issueAr: `رمز حالة خطأ HTTP: ${statusCode}`,
        evidence: `Server returned HTTP ${statusCode} for the requested URL`,
        evidenceAr: `الخادم أرجع HTTP ${statusCode} للرابط المطلوب`,
        whyItMatters: "HTTP errors prevent proper page loading and can significantly impact user experience and search engine indexing",
        whyItMattersAr: "أخطاء HTTP تمنع تحميل الصفحة بشكل صحيح ويمكن أن تؤثر بشكل كبير على تجربة المستخدم وفهرسة محركات البحث",
        howToFix: "Check server configuration and fix the underlying issue causing the HTTP ${statusCode} error",
        howToFixAr: "تحقق من تكوين الخادم وأصلح المشكلة الأساسية المسببة لخطأ HTTP ${statusCode}",
        expectedBenefit: "Proper page loading, improved user experience, and better search engine indexing",
        expectedBenefitAr: "تحميل الصفحة بشكل صحيح، تحسين تجربة المستخدم، وفهرسة أفضل لمحركات البحث"
      });
    }
    if (!hasDoctype) {
      findings.push({
        category: "technical", severity: "low",
        issue: "Missing DOCTYPE declaration",
        issueAr: "إعلان DOCTYPE مفقود",
        evidence: "No <!DOCTYPE html> declaration found at the beginning of the HTML",
        evidenceAr: "لم يتم العثور على إعلان <!DOCTYPE html> في بداية HTML",
        whyItMatters: "DOCTYPE declaration is required for browsers to render the page in standards mode. Without it, browsers may render in quirks mode, causing layout issues.",
        whyItMattersAr: "إعلان DOCTYPE مطلوب للمتصفحات لعرض الصفحة في الوضع القياسي. بدونه، قد تعرض المتصفحات في الوضع المتوافق، مما يسبب مشاكل في التخطيط.",
        howToFix: "Add <!DOCTYPE html> at the very beginning of your HTML document",
        howToFixAr: "أضف <!DOCTYPE html> في بداية مستند HTML الخاص بك",
        expectedBenefit: "Proper browser rendering in standards mode and consistent cross-browser behavior",
        expectedBenefitAr: "عرض متصفح مناسب في الوضع القياسي وسلوك متسق عبر المتصفحات"
      });
    }
    if (!hasCharset) {
      findings.push({
        category: "technical", severity: "low",
        issue: "Missing character encoding declaration",
        issueAr: "إعلان ترميز الأحرف مفقود",
        evidence: "No charset meta tag found in the HTML head",
        evidenceAr: "لم يتم العثور على علامة charset الوصفية في قسم الرأس",
        whyItMatters: "Character encoding declaration ensures proper rendering of text, especially for special characters and non-English languages",
        whyItMattersAr: "إعلان ترميز الأحرف يضمن العرض المناسب للنص، خاصة للأحرف الخاصة واللغات غير الإنجليزية",
        howToFix: "Add <meta charset='UTF-8'> to the <head> section of your HTML",
        howToFixAr: "أضف <meta charset='UTF-8'> إلى قسم <head> في HTML الخاص بك",
        expectedBenefit: "Proper text rendering for all characters and improved internationalization support",
        expectedBenefitAr: "عرض نص مناسب لجميع الأحرف وتحسين دعم التدويل"
      });
    }

    // Build strengths and weaknesses
    const strengths: string[] = [];
    const weaknesses: string[] = [];

    if (title) strengths.push(locale === "ar" ? `✓ تم العثور على عنوان الصفحة: "${title.slice(0, 50)}"` : `✓ Page title found: "${title.slice(0, 50)}"`);
    if (hasMetaDesc) strengths.push(locale === "ar" ? "✓ تم العثور على الوصف الوصفي" : "✓ Meta description found");
    if (h1Count > 0) strengths.push(locale === "ar" ? `✓ تم العثور على ${h1Count} عنوان H1` : `✓ ${h1Count} H1 heading(s) found`);
    if (hasCanonical) strengths.push(locale === "ar" ? "✓ تم العثور على الرابط الأساسي (canonical)" : "✓ Canonical URL found");
    if (hasStructuredData) strengths.push(locale === "ar" ? `✓ بيانات منظمة موجودة: ${schemaTypes.join(", ")}` : `✓ Structured data found: ${schemaTypes.join(", ")}`);
    if (ogTags.length > 0) strengths.push(locale === "ar" ? `✓ علامات Open Graph موجودة (${ogTags.length})` : `✓ Open Graph tags found (${ogTags.length})`);
    if (hasCompression) strengths.push(locale === "ar" ? "✓ ضغط المحتوى مفعل" : "✓ Content compression enabled");
    if (hasCDN) strengths.push(locale === "ar" ? `✓ CDN مستخدم: ${cdnProvider || "نعم"}` : `✓ CDN in use: ${cdnProvider || "Yes"}`);
    if (hasLangAttr) strengths.push(locale === "ar" ? `✓ خاصية اللغة موجودة: ${langValue}` : `✓ Language attribute set: ${langValue}`);
    if (hasViewport) strengths.push(locale === "ar" ? "✓ علامة viewport موجودة" : "✓ Viewport meta tag present");
    if (isHttps) strengths.push(locale === "ar" ? "✓ HTTPS مفعل" : "✓ HTTPS enabled");
    if (hsts) strengths.push(locale === "ar" ? "✓ رأس HSTS موجود" : "✓ HSTS header present");
    if (hasDoctype) strengths.push(locale === "ar" ? "✓ إعلان DOCTYPE موجود" : "✓ DOCTYPE declaration present");
    if (hasCharset) strengths.push(locale === "ar" ? "✓ ترميز الأحرف محدد" : "✓ Character encoding specified");
    if (hasCacheHeaders) strengths.push(locale === "ar" ? "✓ رؤوس التخزين المؤقت موجودة" : "✓ Cache headers present");
    if (hasHttp2) strengths.push(locale === "ar" ? "✓ HTTP/2 أو HTTP/3 مدعوم" : "✓ HTTP/2 or HTTP/3 supported");
    if (hasPreconnect) strengths.push(locale === "ar" ? "✓ اتصالات مسبقة (preconnect/dns-prefetch)" : "✓ Preconnect/dns-prefetch detected");
    if (hasServiceWorker) strengths.push(locale === "ar" ? "✓ Service Worker موجود" : "✓ Service Worker detected");
    if (hasManifest) strengths.push(locale === "ar" ? "✓ Web App Manifest موجود" : "✓ Web App Manifest found");
    if (techStack.length > 0) strengths.push(locale === "ar" ? `✓ التقنيات المكتشفة: ${techStack.join(", ")}` : `✓ Technologies detected: ${techStack.join(", ")}`);
    if (twitterCard) strengths.push(locale === "ar" ? `✓ بطاقة Twitter موجودة: ${twitterCard}` : `✓ Twitter card found: ${twitterCard}`);

    for (const f of findings) {
      if (f.severity === "critical" || f.severity === "high") {
        weaknesses.push(locale === "ar" ? f.issueAr : f.issue);
      }
    }

    const criticalIssues = findings.filter(f => f.severity === "critical" || f.severity === "high");

    recordAnalysis("website", true);

    return NextResponse.json({
      success: true,
      data: {
        url: finalUrl,
        overallScore,
        scores: {
          seo: { score: seoScore, findings: findings.filter(f => f.category === "seo") },
          performance: { score: perfScore, findings: findings.filter(f => f.category === "performance") },
          accessibility: { score: accScore, findings: findings.filter(f => f.category === "accessibility") },
          security: { score: secScore, findings: findings.filter(f => f.category === "security") },
          content: { score: contScore, findings: findings.filter(f => f.category === "content") },
          technical: { score: techScore, findings: findings.filter(f => f.category === "technical") },
        },
        findings,
        strengths: strengths.slice(0, 10),
        weaknesses: weaknesses.slice(0, 10),
        criticalIssues,
        metadata: {
          analyzedUrl: finalUrl,
          analysisDate: new Date().toISOString(),
          duration: Math.round((Date.now() - startTime) / 1000),
          dataSources: ["Live URL Fetch", "HTTP Headers", "HTML Structure Analysis", "Content Analysis", "Security Headers Check"],
          limitations: [
            "Analyzes only publicly available data",
            "Cannot access password-protected pages",
            "Results reflect the state at time of analysis",
            "Client-side rendered content may not be fully captured",
          ],
          methodologyVersion: "3.0.0",
          sourceConfidence:
            res.ok && statusCode === 200 && title && (hasMetaDesc || hasCanonical || h1Count > 0)
              ? "high"
              : res.ok && statusCode === 200
              ? "medium"
              : "low",
        },
        pageData: {
          title,
          titleLength,
          wordCount,
          loadTime,
          pageSize,
          statusCode,
          scripts,
          stylesheets,
          imgsWithAlt,
          imgsWithoutAlt,
          h1Count,
          h2Count,
          h3Count,
          paragraphCount,
          linkCount,
          internalLinks,
          imageCount,
          videoCount,
          listCount,
          tableCount,
          techStack,
          schemaTypes,
          hasStructuredData,
          ogTitle,
          ogDescription,
          ogImage,
          ogType,
          twitterCard,
          langValue,
          serverHeader,
          cdnProvider,
        },
      },
    });
  } catch (error: any) {
    recordAnalysis("website", false);

    const message = error?.message || "Failed to analyze URL";

    // Timeout
    if (error?.name === "AbortError" || /timed? out/i.test(message)) {
      return NextResponse.json({
        success: false,
        error: "The website did not respond in time. It may be slow or unreachable. Please try again.",
        errorAr: "لم يستجب الموقع في الوقت المحدد. قد يكون بطيئاً أو غير متاح. يرجى المحاولة مرة أخرى.",
        code: "TIMEOUT",
      }, { status: 504 });
    }

    // SSRF / URL validation failures
    if (
      /internal|localhost|private|protocol|port|credential/i.test(message) &&
      !/failed to fetch/i.test(message)
    ) {
      return NextResponse.json({
        success: false,
        error: message,
        errorAr: message,
        code: "URL_BLOCKED",
      }, { status: 400 });
    }

    // DNS / connection failures (unreachable site, blocked crawling)
    if (
      /ENOTFOUND|EAI_AGAIN|ECONNREFUSED|ECONNRESET|network|fetch failed|ssl|tls|certificate|blocked|403|429/i.test(message)
    ) {
      return NextResponse.json({
        success: false,
        error: "Unable to reach the website. It may be offline, blocking automated requests, or the domain may not exist.",
        errorAr: "تعذر الوصول إلى الموقع. قد يكون غير متصل، أو يحظر الطلبات الآلية، أو أن النطاق غير موجود.",
        code: "UNREACHABLE",
        detail: message,
      }, { status: 502 });
    }

    return NextResponse.json({
      success: false,
      error: message || "Failed to analyze URL",
      errorAr: message || "فشل تحليل الرابط",
      code: "INTERNAL",
    }, { status: 500 });
  }
}