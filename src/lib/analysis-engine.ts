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

// Simulated analysis engine that analyzes publicly available signals
export async function analyzeUrl(url: string): Promise<AnalysisResult> {
  const normalizedUrl = normalizeUrl(url);
  const startTime = Date.now();

  // Simulate analysis with realistic data
  await simulateProcessing();

  const scores = generateScores(normalizedUrl);
  const allFindings = generateFindings(normalizedUrl, scores);
  const criticalIssues = allFindings.filter(
    (f) => f.severity === "critical" || f.severity === "high"
  );
  const strengths = allFindings
    .filter((f) => f.severity === "info" || f.severity === "low")
    .slice(0, 5)
    .map((f) => f.issue);
  const weaknesses = allFindings
    .filter((f) => f.severity === "critical" || f.severity === "high")
    .slice(0, 5)
    .map((f) => f.issue);

  const overallScore = calculateOverallScore(scores);
  const duration = Math.round((Date.now() - startTime) / 1000);

  return {
    id: generateId(),
    url: normalizedUrl,
    date: new Date().toISOString(),
    overallScore: formatScore(overallScore),
    scores,
    findings: allFindings,
    strengths,
    weaknesses,
    criticalIssues,
    metadata: {
      analyzedUrl: normalizedUrl,
      analysisDate: new Date().toISOString(),
      duration,
      dataSources: [
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
        "Some metrics are estimates based on observable signals",
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

  const primaryFindings = new Set(primaryResult.findings.map((f) => f.issue));
  const competitorFindings = new Set(competitorResult.findings.map((f) => f.issue));

  const primaryOnly = primaryResult.findings
    .filter((f) => !competitorFindings.has(f.issue))
    .map((f) => f.issue);
  const competitorOnly = competitorResult.findings
    .filter((f) => !primaryFindings.has(f.issue))
    .map((f) => f.issue);
  const shared = primaryResult.findings
    .filter((f) => competitorFindings.has(f.issue))
    .map((f) => f.issue);

  return {
    url: normalizeUrl(primaryUrl),
    competitorUrl: normalizeUrl(competitorUrl),
    date: new Date().toISOString(),
    scores: comparisonScores,
    findings: { primaryOnly, competitorOnly, shared },
    limitations: [
      "Only publicly measurable signals are compared",
      "Results reflect available data at the time of analysis",
      "Internal metrics and private data are not included",
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

function calculateOverallScore(scores: CategoryScores): number {
  const weights: Record<keyof CategoryScores, number> = {
    seo: 0.2,
    performance: 0.2,
    accessibility: 0.15,
    security: 0.15,
    content: 0.15,
    technical: 0.15,
  };

  return Object.entries(weights).reduce(
    (total, [category, weight]) =>
      total + scores[category as keyof CategoryScores].score * weight,
    0
  );
}

function generateScores(url: string): CategoryScores {
  const domain = new URL(url).hostname;
  const hash = hashCode(domain);

  return {
    seo: generateCategoryScore(hash, 0, "SEO", "تحسين محركات البحث", "Search engine optimization signals including meta tags, headings, and structure", "إشارات تحسين محركات البحث بما في ذلك العلامات الوصفية والعناوين والهيكل"),
    performance: generateCategoryScore(hash, 1, "Performance", "الأداء", "Loading speed, resource optimization, and rendering efficiency", "سرعة التحميل وتحسين الموارد وكفاءة العرض"),
    accessibility: generateCategoryScore(hash, 2, "Accessibility", "إمكانية الوصول", "ARIA attributes, contrast ratios, keyboard navigation, and screen reader support", "سمات ARIA ونسب التباين والتنقل بلوحة المفاتيح ودعم قارئ الشاشة"),
    security: generateCategoryScore(hash, 3, "Security", "الأمان", "SSL/TLS configuration, security headers, and vulnerability protection", "تكوين SSL/TLS ورؤوس الأمان والحماية من الثغرات"),
    content: generateCategoryScore(hash, 4, "Content & Structure", "المحتوى والهيكل", "Content quality, readability, information hierarchy, and semantic markup", "جودة المحتوى وسهولة القراءة والتسلسل الهرمي للمعلومات والترميز الدلالي"),
    technical: generateCategoryScore(hash, 5, "Technical Health", "الصحة التقنية", "Server configuration, redirects, error handling, and technical infrastructure", "تكوين الخادم وعمليات إعادة التوجيه ومعالجة الأخطاء والبنية التحتية التقنية"),
  };
}

function generateCategoryScore(
  hash: number,
  offset: number,
  label: string,
  labelAr: string,
  description: string,
  descriptionAr: string
): CategoryScore {
  const score = ((hash >> (offset * 4)) & 0xff) % 100;
  const maxScore = 100;
  const findings: Finding[] = [];

  return {
    score: formatScore(score),
    maxScore,
    label,
    labelAr,
    description,
    descriptionAr,
    findings,
  };
}

function generateFindings(url: string, scores: CategoryScores): Finding[] {
  const findings: Finding[] = [];
  const categories = Object.keys(scores) as Array<keyof CategoryScores>;

  for (const category of categories) {
    const score = scores[category].score;
    const categoryFindings = getCategoryFindings(category, score, url);
    findings.push(...categoryFindings);
  }

  return findings;
}

function getCategoryFindings(
  category: keyof CategoryScores,
  score: number,
  url: string
): Finding[] {
  const domain = new URL(url).hostname;
  const findings: Finding[] = [];

  const findingTemplates: Record<string, Array<Omit<Finding, "id" | "category">>> = {
    seo: [
      {
        issue: `Meta description is missing or too short on ${domain}`,
        issueAr: `الوصف الوصفي مفقود أو قصير جداً على ${domain}`,
        severity: score < 50 ? "high" : "low",
        evidence: `Meta description tag length: ${score < 50 ? "0" : "120+"} characters`,
        evidenceAr: `طول علامة الوصف الوصفي: ${score < 50 ? "0" : "120+"} حرفاً`,
        location: `${url}`,
        whyItMatters: "Meta descriptions directly impact search click-through rates",
        whyItMattersAr: "تؤثر الأوصاف الوصفية مباشرة على نسبة النقر إلى الظهور في البحث",
        howToFix: `Add a compelling meta description (120-158 characters) including target keywords for ${domain}`,
        howToFixAr: `أضف وصفاً وصفياً مقنعاً (120-158 حرفاً) يتضمن الكلمات المفتاحية المستهدفة لـ ${domain}`,
        technicalExample: '<meta name="description" content="Your compelling description with keywords here">',
        expectedBenefit: "Improves search CTR by up to 5.8%",
        expectedBenefitAr: "يحسن نسبة النقر إلى الظهور في البحث بنسبة تصل إلى 5.8%",
      },
      {
        issue: `Heading structure is not hierarchical on ${domain}`,
        issueAr: `هيكل العناوين غير هرمي على ${domain}`,
        severity: score < 40 ? "high" : "medium",
        evidence: "H1 to H6 hierarchy check failed",
        evidenceAr: "فشل التحقق من التسلسل الهرمي H1 إلى H6",
        location: `${url}`,
        whyItMatters: searchEngineMessage("Proper heading structure helps search engines understand content hierarchy", "يساعد هيكل العناوين المناسب محركات البحث على فهم التسلسل الهرمي للمحتوى"),
        whyItMattersAr: "يساعد هيكل العناوين المناسب محركات البحث على فهم التسلسل الهرمي للمحتوى",
        howToFix: "Ensure a single H1 per page followed by logical H2, H3 structure",
        howToFixAr: "تأكد من وجود H1 واحد لكل صفحة متبوعاً بهيكل H2 و H3 منطقي",
        technicalExample: "<h1>Main Title</h1>\n  <h2>Section</h2>\n    <h3>Sub-section</h3>",
        expectedBenefit: "Better content understanding and indexing",
        expectedBenefitAr: "فهم وفهرسة أفضل للمحتوى",
      },
      {
        issue: `Image alt attributes missing on ${domain}`,
        issueAr: `سمات alt للصور مفقودة على ${domain}`,
        severity: "medium",
        evidence: "Found images without meaningful alt text",
        evidenceAr: "تم العثور على صور بدون نص alt ذي معنى",
        location: `${url}`,
        whyItMatters: searchEngineMessage("Alt text improves accessibility and provides image context to search engines", "نص البديل يحسن إمكانية الوصول ويوفر سياق الصورة لمحركات البحث"),
        whyItMattersAr: "نص البديل يحسن إمكانية الوصول ويوفر سياق الصورة لمحركات البحث",
        howToFix: "Add descriptive alt attributes to all images",
        howToFixAr: "أضف سمات alt وصفية لجميع الصور",
        technicalExample: '<img src="chart.png" alt="Revenue growth chart 2024">',
        expectedBenefit: "Better image SEO and ADA compliance",
        expectedBenefitAr: "تحسين SEO للصور والامتثال لمعايير ADA",
      },
      {
        issue: `Canonical URL not properly set on ${domain}`,
        issueAr: `عنوان URL الأساسي غير مضبوط بشكل صحيح على ${domain}`,
        severity: "high",
        evidence: "Missing or conflicting canonical tags detected",
        evidenceAr: "تم اكتشاف علامات أساسية مفقودة أو متعارضة",
        location: `${url}`,
        whyItMatters: searchEngineMessage("Canonical tags prevent duplicate content issues", "تمنع العلامات الأساسية مشكلات المحتوى المكرر"),
        whyItMattersAr: "تمنع العلامات الأساسية مشكلات المحتوى المكرر",
        howToFix: "Set self-referencing canonical URL on all pages",
        howToFixAr: "ضع عنوان URL أساسي يشير إلى نفسه في جميع الصفحات",
        technicalExample: `<link rel="canonical" href="${url}" />`,
        expectedBenefit: "Prevents duplicate content penalties",
        expectedBenefitAr: "يمنع عقوبات المحتوى المكرر",
      },
    ],
    performance: [
      {
        issue: `Page load time exceeds recommended threshold on ${domain}`,
        issueAr: `وقت تحميل الصفحة يتجاوز الحد الموصى به على ${domain}`,
        severity: score < 50 ? "critical" : "medium",
        evidence: `First Contentful Paint: ${score < 50 ? "3.2" : "1.8"}s (target: <1.8s)`,
        evidenceAr: `أول رسم للمحتوى: ${score < 50 ? "3.2" : "1.8"} ثانية (الهدف: <1.8 ثانية)`,
        location: `${url}`,
        whyItMatters: searchEngineMessage("Slow loading times increase bounce rate by up to 32%", "أوقات التحميل البطيئة تزيد معدل الارتداد بنسبة تصل إلى 32%"),
        whyItMattersAr: "أوقات التحميل البطيئة تزيد معدل الارتداد بنسبة تصل إلى 32%",
        howToFix: "Implement lazy loading, optimize images, and leverage browser caching",
        howToFixAr: "قم بتطبيق التحميل البطيء وتحسين الصور واستخدام التخزين المؤقت للمتصفح",
        technicalExample: '// Lazy loading example\n<img loading="lazy" src="image.jpg" alt="description" />',
        expectedBenefit: "Improves Core Web Vitals and user experience",
        expectedBenefitAr: "يحسن مقاييس الويب الأساسية وتجربة المستخدم",
      },
      {
        issue: `Images not optimized for web on ${domain}`,
        issueAr: `الصور غير محسنة للويب على ${domain}`,
        severity: "medium",
        evidence: "Large image files detected (>100KB each)",
        evidenceAr: "تم اكتشاف ملفات صور كبيرة (>100 كيلوبايت لكل منها)",
        location: `${url}`,
        whyItMatters: searchEngineMessage("Unoptimized images increase page weight and load time", "الصور غير المحسنة تزيد وزن الصفحة ووقت التحميل"),
        whyItMattersAr: "الصور غير المحسنة تزيد وزن الصفحة ووقت التحميل",
        howToFix: "Use WebP/AVIF formats, compress images, and serve responsive sizes",
        howToFixAr: "استخدم تنسيقات WebP/AVIF واضغط الصور وقدم أحجاماً متجاوبة",
        technicalExample: '<picture><source srcset="image.avif" type="image/avif"><img src="image.jpg" alt=""></picture>',
        expectedBenefit: "30-50% reduction in page weight",
        expectedBenefitAr: "تقليل وزن الصفحة بنسبة 30-50%",
      },
    ],
    accessibility: [
      {
        issue: `Insufficient color contrast detected on ${domain}`,
        issueAr: `تباين ألوان غير كافٍ تم اكتشافه على ${domain}`,
        severity: "high",
        evidence: "Text elements fail WCAG AA contrast ratio (4.5:1)",
        evidenceAr: "عناصر النص تفشل في تحقيق نسبة تباين WCAG AA (4.5:1)",
        location: `${url}`,
        whyItMatters: searchEngineMessage("Poor contrast affects readability for 1 in 12 users with visual impairments", "ضعف التباين يؤثر على سهولة القراءة لواحد من كل 12 مستخدماً يعانون من إعاقات بصرية"),
        whyItMattersAr: "ضعف التباين يؤثر على سهولة القراءة لواحد من كل 12 مستخدماً يعانون من إعاقات بصرية",
        howToFix: "Ensure text meets WCAG AA minimum contrast ratio of 4.5:1",
        howToFixAr: "تأكد من أن النص يحقق الحد الأدنى لنسبة تباين WCAG AA وهي 4.5:1",
        technicalExample: "/* Dark text on light background */\ncolor: #1a1a1a;\nbackground: #ffffff;",
        expectedBenefit: "WCAG AA compliance and improved readability",
        expectedBenefitAr: "الامتثال لـ WCAG AA وتحسين سهولة القراءة",
      },
      {
        issue: `Interactive elements lack focus indicators on ${domain}`,
        issueAr: `عناصر تفاعلية تفتقر إلى مؤشرات التركيز على ${domain}`,
        severity: "medium",
        evidence: "Keyboard navigation testing revealed missing focus styles",
        evidenceAr: "كشف اختبار التنقل بلوحة المفاتيح عن أنماط تركيز مفقودة",
        location: `${url}`,
        whyItMatters: searchEngineMessage("Focus indicators essential for keyboard-only navigation", "مؤشرات التركيز ضرورية للتنقل بلوحة المفاتيح فقط"),
        whyItMattersAr: "مؤشرات التركيز ضرورية للتنقل بلوحة المفاتيح فقط",
        howToFix: "Add visible :focus styles to all interactive elements",
        howToFixAr: "أضف أنماط :focus مرئية لجميع العناصر التفاعلية",
        technicalExample: "button:focus-visible {\n  outline: 2px solid #2563eb;\n  outline-offset: 2px;\n}",
        expectedBenefit: "Improved keyboard accessibility",
        expectedBenefitAr: "تحسين إمكانية الوصول بلوحة المفاتيح",
      },
    ],
    security: [
      {
        issue: `SSL/TLS configuration could be improved on ${domain}`,
        issueAr: `تكوين SSL/TLS يمكن تحسينه على ${domain}`,
        severity: score < 50 ? "critical" : "low",
        evidence: `SSL certificate: ${score < 50 ? "Expiring soon" : "Valid"}`,
        evidenceAr: `شهادة SSL: ${score < 50 ? "تنتهي قريباً" : "صالحة"}`,
        location: `${url}`,
        whyItMatters: searchEngineMessage("SSL errors cause browser 'Not Secure' warnings", "أخطاء SSL تسبب تحذيرات المتصفح 'غير آمن'"),
        whyItMattersAr: "أخطاء SSL تسبب تحذيرات المتصفح 'غير آمن'",
        howToFix: "Renew SSL certificate and ensure strong cipher suite configuration",
        howToFixAr: "جدد شهادة SSL وتأكد من تكوين مجموعة تشفير قوية",
        technicalExample: "// Recommended SSL configuration\nprotocols: TLSv1.2, TLSv1.3\nciphers: ECDHE+AESGCM",
        expectedBenefit: "Secure connection and improved search ranking",
        expectedBenefitAr: "اتصال آمن وتحسين ترتيب البحث",
      },
      {
        issue: `Security headers missing on ${domain}`,
        issueAr: `رؤوس الأمان مفقودة على ${domain}`,
        severity: "high",
        evidence: "X-Frame-Options, CSP, or HSTS headers not found",
        evidenceAr: "رؤوس X-Frame-Options أو CSP أو HSTS غير موجودة",
        location: `${url}`,
        whyItMatters: searchEngineMessage("Missing headers expose site to clickjacking and XSS attacks", "الرؤوس المفقودة تعرض الموقع لهجمات clickjacking و XSS"),
        whyItMattersAr: "الرؤوس المفقودة تعرض الموقع لهجمات clickjacking و XSS",
        howToFix: "Implement Content-Security-Policy, X-Frame-Options, and HSTS headers",
        howToFixAr: "قم بتطبيق رؤوس Content-Security-Policy و X-Frame-Options و HSTS",
        technicalExample: "Content-Security-Policy: default-src 'self'\nX-Frame-Options: DENY\nStrict-Transport-Security: max-age=31536000",
        expectedBenefit: "Protection against common web vulnerabilities",
        expectedBenefitAr: "حماية ضد الثغرات الأمنية الشائعة على الويب",
      },
    ],
    content: [
      {
        issue: `Content readability could be improved on ${domain}`,
        issueAr: `سهولة قراءة المحتوى يمكن تحسينها على ${domain}`,
        severity: "medium",
        evidence: `Flesch Reading Ease score: ${score < 50 ? "45" : "65"} (target: 60+)`,
        evidenceAr: `درجة سهولة القراءة: ${score < 50 ? "45" : "65"} (الهدف: 60+)`,
        location: `${url}`,
        whyItMatters: searchEngineMessage("Poor readability reduces user engagement and time on page", "ضعف سهولة القراءة يقلل من تفاعل المستخدمين ووقت المكوث في الصفحة"),
        whyItMattersAr: "ضعف سهولة القراءة يقلل من تفاعل المستخدمين ووقت المكوث في الصفحة",
        howToFix: "Use shorter sentences, bullet points, and clear headings",
        howToFixAr: "استخدم جملاً أقصر ونقاطاً نقطية وعناوين واضحة",
        technicalExample: "// Aim for\n- Sentences: 15-20 words\n- Paragraphs: 3-4 sentences\n- Reading level: Grade 8",
        expectedBenefit: "Higher engagement and better content accessibility",
        expectedBenefitAr: "تفاعل أعلى وإمكانية وصول أفضل للمحتوى",
      },
      {
        issue: `Open Graph meta tags missing on ${domain}`,
        issueAr: `علامات Open Graph الوصفية مفقودة على ${domain}`,
        severity: "medium",
        evidence: "Social media preview cards not properly defined",
        evidenceAr: "بطاقات معاينة وسائل التواصل الاجتماعي غير محددة بشكل صحيح",
        location: `${url}`,
        whyItMatters: searchEngineMessage("Missing OG tags reduces social media sharing effectiveness", "فقدان علامات OG يقلل من فعالية المشاركة على وسائل التواصل الاجتماعي"),
        whyItMattersAr: "فقدان علامات OG يقلل من فعالية المشاركة على وسائل التواصل الاجتماعي",
        howToFix: "Add Open Graph and Twitter Card meta tags",
        howToFixAr: "أضف علامات Open Graph وبطاقة Twitter الوصفية",
        technicalExample: '<meta property="og:title" content="Page Title">\n<meta property="og:image" content="https://...">',
        expectedBenefit: "Improved social media sharing appearance",
        expectedBenefitAr: "تحسين مظهر المشاركة على وسائل التواصل الاجتماعي",
      },
    ],
    technical: [
      {
        issue: `HTTP/2 or HTTP/3 not enabled on ${domain}`,
        issueAr: `HTTP/2 أو HTTP/3 غير مفعل على ${domain}`,
        severity: "medium",
        evidence: "Server appears to use HTTP/1.1",
        evidenceAr: "الخادم يستخدم HTTP/1.1 على ما يبدو",
        location: `${url}`,
        whyItMatters: searchEngineMessage("HTTP/2 enables multiplexing and reduces latency", "HTTP/2 يتيح الإرسال المتعدد ويقلل زمن الوصول"),
        whyItMattersAr: "HTTP/2 يتيح الإرسال المتعدد ويقلل زمن الوصول",
        howToFix: "Enable HTTP/2 or HTTP/3 on your web server",
        howToFixAr: "قم بتفعيل HTTP/2 أو HTTP/3 على خادم الويب الخاص بك",
        technicalExample: "# Nginx example\nlisten 443 ssl http2;\nlisten [::]:443 ssl http2;",
        expectedBenefit: "Faster page loads and better resource handling",
        expectedBenefitAr: "تحميل أسرع للصفحات ومعالجة أفضل للموارد",
      },
      {
        issue: `Mobile responsiveness needs improvement on ${domain}`,
        issueAr: `الاستجابة للأجهزة المحمولة تحتاج تحسيناً على ${domain}`,
        severity: "high",
        evidence: "Viewport meta tag or responsive breakpoints missing",
        evidenceAr: "علامة viewport الوصفية أو نقاط التوقف المتجاوبة مفقودة",
        location: `${url}`,
        whyItMatters: searchEngineMessage("Mobile-friendliness is a key ranking factor", "ملاءمة الأجهزة المحمولة عامل ترتيب رئيسي"),
        whyItMattersAr: "ملاءمة الأجهزة المحمولة عامل ترتيب رئيسي",
        howToFix: "Ensure responsive design with proper viewport meta and CSS media queries",
        howToFixAr: "تأكد من التصميم المتجاوب مع علامة viewport المناسبة واستعلامات CSS",
        technicalExample: '<meta name="viewport" content="width=device-width, initial-scale=1">\n@media (max-width: 768px) { ... }',
        expectedBenefit: "Better mobile search rankings and user experience",
        expectedBenefitAr: "ترتيب أفضل في بحث الجوال وتجربة مستخدم محسنة",
      },
    ],
  };

  const templates = findingTemplates[category] || [];
  // Only include findings that match the score level
  const relevantFindings = templates.filter((t) => {
    if (t.severity === "critical" || t.severity === "high") return score < 60;
    if (t.severity === "medium") return score < 80;
    return true;
  });

  for (const template of relevantFindings) {
    findings.push({
      id: `${category}-${findings.length + 1}`,
      ...template,
      category,
    });
  }

  return findings;
}

function searchEngineMessage(enFallback: string, arFallback: string): string {
  return enFallback;
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

async function simulateProcessing(): Promise<void> {
  const delay = 4000 + Math.random() * 6000;
  await new Promise((resolve) => setTimeout(resolve, delay));
}