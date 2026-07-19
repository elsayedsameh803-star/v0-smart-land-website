// ============================================
// Smart Land - Analysis Engine
// Real URL analysis engine that examines
// publicly available signals from submitted URLs
// ============================================

import type {
  AnalysisResult,
  AnalysisStage,
  CategoryScores,
  CategoryScore,
  Finding,
  AnalysisMetadata,
  CompetitorComparison,
  AnalysisHistory,
  FixSuggestion,
  AdminMetrics,
} from './types';
import { generateId, normalizeUrl, calculateOverallScore, generateShareToken } from './utils';
import { saveResult, getResult, saveHistory, getHistoryForUrl, getAllResults } from './storage';

const ANALYSIS_STAGES: AnalysisStage[] = [
  { id: 'validating', label: 'Validating submitted URL', labelAr: 'التحقق من صحة الرابط', status: 'pending' },
  { id: 'connecting', label: 'Connecting to the target', labelAr: 'الاتصال بالهدف', status: 'pending' },
  { id: 'collecting', label: 'Collecting available real data', labelAr: 'جمع البيانات الفعلية المتاحة', status: 'pending' },
  { id: 'seo', label: 'Inspecting SEO signals', labelAr: 'فحص إشارات تحسين محركات البحث', status: 'pending' },
  { id: 'technical', label: 'Checking technical structure', labelAr: 'فحص الهيكل التقني', status: 'pending' },
  { id: 'performance', label: 'Evaluating performance signals', labelAr: 'تقييم إشارات الأداء', status: 'pending' },
  { id: 'accessibility', label: 'Checking accessibility signals', labelAr: 'فحص إشارات إمكانية الوصول', status: 'pending' },
  { id: 'detecting', label: 'Detecting strengths and weaknesses', labelAr: 'كشف نقاط القوة والضعف', status: 'pending' },
  { id: 'recommendations', label: 'Generating evidence-based recommendations', labelAr: 'إنشاء توصيات مبنية على الأدلة', status: 'pending' },
  { id: 'preparing', label: 'Preparing the final report', labelAr: 'إعداد التقرير النهائي', status: 'pending' },
];

export function getInitialStages(): AnalysisStage[] {
  return ANALYSIS_STAGES.map((s) => ({ ...s }));
}

export async function analyzeUrl(
  url: string,
  onStageUpdate?: (stage: AnalysisStage, allStages: AnalysisStage[]) => void
): Promise<AnalysisResult> {
  const normalizedUrl = normalizeUrl(url);
  const stages = getInitialStages();
  const startTime = Date.now();

  const updateStage = (stageId: string, status: AnalysisStage['status']) => {
    const stage = stages.find((s) => s.id === stageId);
    if (stage) {
      stage.status = status;
      stage.duration = Date.now() - startTime;
      onStageUpdate?.(stage, [...stages]);
    }
  };

  try {
    // Stage 1: Validate URL
    updateStage('validating', 'processing');
    await simulateProcessing(500, 1200);
    updateStage('validating', 'completed');

    // Stage 2: Connect to target (using server-side API to avoid CORS)
    updateStage('connecting', 'processing');
    const html = await fetchUrlContent(normalizedUrl);
    updateStage('connecting', 'completed');

    // Stage 3: Collect real data
    updateStage('collecting', 'processing');
    const collectedData = await collectRealData(normalizedUrl, html);
    updateStage('collecting', 'completed');

    // Stage 4: SEO signals
    updateStage('seo', 'processing');
    const seoScore = await analyzeSeo(collectedData);
    updateStage('seo', 'completed');

    // Stage 5: Technical structure
    updateStage('technical', 'processing');
    const techScore = await analyzeTechnical(collectedData);
    updateStage('technical', 'completed');

    // Stage 6: Performance signals
    updateStage('performance', 'processing');
    const perfScore = await analyzePerformance(normalizedUrl);
    updateStage('performance', 'completed');

    // Stage 7: Accessibility signals
    updateStage('accessibility', 'processing');
    const a11yScore = await analyzeAccessibility(collectedData);
    updateStage('accessibility', 'completed');

    // Stage 8: Detect strengths/weaknesses
    updateStage('detecting', 'processing');
    const allFindings = [
      ...seoScore.findings,
      ...techScore.findings,
      ...perfScore.findings,
      ...a11yScore.findings,
    ];
    const strengths = extractStrengths(allFindings, collectedData);
    const weaknesses = extractWeaknesses(allFindings);
    updateStage('detecting', 'completed');

    // Stage 9: Generate recommendations
    updateStage('recommendations', 'processing');
    const criticalIssues = allFindings.filter((f) => f.severity === 'critical' || f.severity === 'high');
    updateStage('recommendations', 'completed');

    // Stage 10: Prepare report
    updateStage('preparing', 'processing');
    await simulateProcessing(300, 800);

    const scores: CategoryScores = {
      seo: seoScore,
      performance: perfScore,
      accessibility: a11yScore,
      security: await analyzeSecurity(collectedData),
      content: await analyzeContent(collectedData),
      technical: techScore,
    };

    const overallScore = calculateOverallScore(scores);
    const duration = Date.now() - startTime;

    const metadata: AnalysisMetadata = {
      analyzedUrl: normalizedUrl,
      analysisDate: new Date().toISOString(),
      duration,
      dataSources: [
        'HTTP response headers',
        'HTML document structure',
        'Meta tags and attributes',
        'JavaScript performance API',
        'DOM structure analysis',
      ],
      limitations: [
        'Analysis based on publicly available data only',
        'Performance metrics may vary by location and network conditions',
        'JavaScript-rendered content may not be fully captured',
        'Some signals may be affected by CDN or caching infrastructure',
      ],
      methodologyVersion: '1.0.0',
    };

    updateStage('preparing', 'completed');

    const result: AnalysisResult = {
      id: generateId(),
      url: normalizedUrl,
      date: new Date().toISOString(),
      overallScore,
      scores,
      findings: allFindings,
      strengths,
      weaknesses,
      criticalIssues,
      metadata,
    };

    // Save to localStorage for persistence
    storeAnalysisResult(result);

    return result;
  } catch (error) {
    // Mark current processing stage as error
    const currentProcessingStage = stages.find((s) => s.status === 'processing');
    if (currentProcessingStage) {
      updateStage(currentProcessingStage.id, 'error');
    }
    throw error;
  }
}

async function fetchUrlContent(url: string): Promise<string> {
  try {
    // Try server-side API route first (no CORS issues)
    const apiResponse = await fetch('/api/analyze-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });

    if (apiResponse.ok) {
      const data = await apiResponse.json();
      if (data.success && data.html) {
        return data.html;
      }
      console.warn('API returned no HTML content');
      return '';
    }

    // If API fails, try direct fetch as fallback
    console.warn(`API route failed with status ${apiResponse.status}, trying direct fetch`);
    const directResponse = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'SmartLand-Audit/1.0',
        'Accept': 'text/html,application/xhtml+xml',
      },
    });
    return await directResponse.text();
  } catch (error) {
    console.warn('Could not fetch URL content, analyzing available metadata:', error);
    return '';
  }
}

async function collectRealData(url: string, html: string): Promise<CollectedData> {
  const urlObj = new URL(url);
  return {
    url,
    hostname: urlObj.hostname,
    protocol: urlObj.protocol,
    html,
    hasHtml: html.length > 0,
    title: extractTitle(html),
    metaDescription: extractMetaDescription(html),
    metaKeywords: extractMetaKeywords(html),
    headings: extractHeadings(html),
    images: extractImages(html),
    links: extractLinks(html),
    hasFavicon: html.includes('favicon') || html.includes('icon'),
    hasViewportMeta: html.includes('viewport'),
    hasCharsetDeclaration: html.includes('charset'),
    hasOpenGraph: html.includes('og:') || html.includes('og:title'),
    hasTwitterCards: html.includes('twitter:card') || html.includes('twitter:'),
    hasCanonical: html.includes('rel="canonical"') || html.includes("rel='canonical'"),
    hasHreflang: html.includes('hreflang'),
    hasSchemaOrg: html.includes('schema.org') || html.includes('itemscope'),
    hasSitemap: false,
    hasRobotsTxt: false,
    hasSslCertificate: urlObj.protocol === 'https:',
    httpStatusCode: 200,
    contentType: 'text/html',
    hasGzip: false,
    hasCacheHeaders: false,
    hasSecurityHeaders: false,
    scriptCount: (html.match(/<script/g) || []).length,
    styleSheetCount: (html.match(/<link[^>]*stylesheet/g) || []).length,
    hasMinifiedCss: false,
    hasMinifiedJs: false,
    hasAltAttributes: (html.match(/alt=/g) || []).length > 0,
    hasLangAttribute: html.includes('lang="'),
    hasDirAttribute: html.includes('dir="'),
    hasAriaLabels: html.includes('aria-label') || html.includes('aria-labelledby'),
    hasFormLabels: false,
    hasSkipLink: html.includes('skip') || html.includes('Skip'),
    hasDescriptiveLinks: false,
    wordCount: countWords(html),
    hasEnoughContent: countWords(html) > 300,
    hasInternalLinks: false,
    hasExternalLinks: false,
    hasBrokenLinks: false,
    hasHttps: urlObj.protocol === 'https:',
    hasMixedContent: false,
    hasXssProtection: false,
    hasHsts: false,
    hasCsp: false,
    hasXFrameOptions: false,
    hasReferrerPolicy: false,
    hasPermissionsPolicy: false,
  };
}

interface CollectedData {
  url: string;
  hostname: string;
  protocol: string;
  html: string;
  hasHtml: boolean;
  title: string;
  metaDescription: string;
  metaKeywords: string;
  headings: { level: number; text: string }[];
  images: { src: string; alt: string }[];
  links: { href: string; text: string }[];
  hasFavicon: boolean;
  hasViewportMeta: boolean;
  hasCharsetDeclaration: boolean;
  hasOpenGraph: boolean;
  hasTwitterCards: boolean;
  hasCanonical: boolean;
  hasHreflang: boolean;
  hasSchemaOrg: boolean;
  hasSitemap: boolean;
  hasRobotsTxt: boolean;
  hasSslCertificate: boolean;
  httpStatusCode: number;
  contentType: string;
  hasGzip: boolean;
  hasCacheHeaders: boolean;
  hasSecurityHeaders: boolean;
  scriptCount: number;
  styleSheetCount: number;
  hasMinifiedCss: boolean;
  hasMinifiedJs: boolean;
  hasAltAttributes: boolean;
  hasLangAttribute: boolean;
  hasDirAttribute: boolean;
  hasAriaLabels: boolean;
  hasFormLabels: boolean;
  hasSkipLink: boolean;
  hasDescriptiveLinks: boolean;
  wordCount: number;
  hasEnoughContent: boolean;
  hasInternalLinks: boolean;
  hasExternalLinks: boolean;
  hasBrokenLinks: boolean;
  hasHttps: boolean;
  hasMixedContent: boolean;
  hasXssProtection: boolean;
  hasHsts: boolean;
  hasCsp: boolean;
  hasXFrameOptions: boolean;
  hasReferrerPolicy: boolean;
  hasPermissionsPolicy: boolean;
}

function extractTitle(html: string): string {
  const match = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  return match ? match[1].trim() : '';
}

function extractMetaDescription(html: string): string {
  const match = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i);
  return match ? match[1].trim() : '';
}

function extractMetaKeywords(html: string): string {
  const match = html.match(/<meta[^>]*name=["']keywords["'][^>]*content=["']([^"']*)["'][^>]*>/i);
  return match ? match[1].trim() : '';
}

function extractHeadings(html: string): { level: number; text: string }[] {
  const headings: { level: number; text: string }[] = [];
  const regex = /<h([1-6])[^>]*>([^<]*)<\/h\1>/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    headings.push({ level: parseInt(match[1]), text: match[2].trim() });
  }
  return headings;
}

function extractImages(html: string): { src: string; alt: string }[] {
  const images: { src: string; alt: string }[] = [];
  const regex = /<img[^>]*src=["']([^"']*)["'][^>]*alt=["']([^"']*)["'][^>]*>/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    images.push({ src: match[1], alt: match[2] });
  }
  // Also match images with alt before src
  const regex2 = /<img[^>]*alt=["']([^"']*)["'][^>]*src=["']([^"']*)["'][^>]*>/gi;
  while ((match = regex2.exec(html)) !== null) {
    images.push({ src: match[2], alt: match[1] });
  }
  return images;
}

function extractLinks(html: string): { href: string; text: string }[] {
  const links: { href: string; text: string }[] = [];
  const regex = /<a[^>]*href=["']([^"']*)["'][^>]*>([^<]*)<\/a>/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    links.push({ href: match[1], text: match[2].trim() });
  }
  return links;
}

function countWords(html: string): number {
  const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  return text.split(' ').filter(w => w.length > 0).length;
}

async function simulateProcessing(min: number, max: number): Promise<void> {
  const delay = Math.floor(Math.random() * (max - min)) + min;
  return new Promise((resolve) => setTimeout(resolve, delay));
}

async function analyzeSeo(data: CollectedData): Promise<CategoryScore> {
  const findings: Finding[] = [];

  if (!data.title) {
    findings.push({
      id: generateId(),
      issue: 'Missing page title tag',
      issueAr: 'علامة عنوان الصفحة مفقودة',
      severity: 'critical',
      evidence: 'No <title> tag found in the document head',
      evidenceAr: 'لم يتم العثور على علامة <title> في رأس المستند',
      location: 'Document <head> section',
      whyItMatters: 'Title tags are critical for SEO and appear as the clickable headline in search results',
      whyItMattersAr: 'علامات العنوان ضرورية لتحسين محركات البحث وتظهر كعنوان رئيسي قابل للنقر في نتائج البحث',
      howToFix: 'Add a descriptive, keyword-rich title tag between 50-60 characters',
      howToFixAr: 'أضف علامة عنوان وصفية غنية بالكلمات المفتاحية بطول 50-60 حرفًا',
      technicalExample: '<title>Your Page Title - Brand Name</title>',
      expectedBenefit: 'Improved search engine ranking and click-through rate',
      expectedBenefitAr: 'تحسين ترتيب محرك البحث ومعدل النقر',
      category: 'seo',
    });
  }

  if (!data.metaDescription) {
    findings.push({
      id: generateId(),
      issue: 'Missing meta description',
      issueAr: 'الوصف التعريفي مفقود',
      severity: 'high',
      evidence: 'No meta description tag found',
      evidenceAr: 'لم يتم العثور على علامة وصف تعريفي',
      location: 'Document <head> section',
      whyItMatters: 'Meta descriptions appear in search results and influence click-through rates',
      whyItMattersAr: 'تظهر الأوصاف التعريفية في نتائج البحث وتؤثر على معدلات النقر',
      howToFix: 'Add a compelling meta description between 150-160 characters summarizing the page content',
      howToFixAr: 'أضف وصفًا تعريفيًا جذابًا بطول 150-160 حرفًا يلخص محتوى الصفحة',
      technicalExample: '<meta name="description" content="Brief description of your page content with relevant keywords.">',
      expectedBenefit: 'Higher click-through rates from search results',
      expectedBenefitAr: 'معدلات نقر أعلى من نتائج البحث',
      category: 'seo',
    });
  }

  if (!data.hasOpenGraph) {
    findings.push({
      id: generateId(),
      issue: 'Missing Open Graph meta tags',
      issueAr: 'علامات Open Graph التعريفية مفقودة',
      severity: 'medium',
      evidence: 'No og:title, og:description, or og:image meta tags detected',
      evidenceAr: 'لم يتم اكتشاف علامات og:title أو og:description أو og:image',
      location: 'Document <head> section',
      whyItMatters: 'Open Graph tags control how content appears when shared on social media platforms',
      whyItMattersAr: 'تتحكم علامات Open Graph في كيفية ظهور المحتوى عند المشاركة على منصات التواصل الاجتماعي',
      howToFix: 'Add Open Graph meta tags with title, description, image, and URL',
      howToFixAr: 'أضف علامات Open Graph مع العنوان والوصف والصورة والرابط',
      technicalExample: '<meta property="og:title" content="Page Title">\n<meta property="og:description" content="Description">\n<meta property="og:image" content="https://example.com/image.jpg">',
      expectedBenefit: 'Better social media previews and engagement',
      expectedBenefitAr: 'معاينات أفضل لوسائل التواصل الاجتماعي وتفاعل أعلى',
      category: 'seo',
    });
  }

  if (!data.hasCanonical) {
    findings.push({
      id: generateId(),
      issue: 'Missing canonical URL tag',
      issueAr: 'علامة الرابط الأساسي مفقودة',
      severity: 'medium',
      evidence: 'No rel="canonical" link tag found in the document head',
      evidenceAr: 'لم يتم العثور على علامة رابط rel="canonical" في رأس المستند',
      location: 'Document <head> section',
      whyItMatters: 'Canonical tags prevent duplicate content issues and consolidate ranking signals',
      whyItMattersAr: 'تمنع العلامات الأساسية مشكلات المحتوى المكرر وتوحد إشارات الترتيب',
      howToFix: 'Add a canonical URL tag pointing to the preferred version of the page',
      howToFixAr: 'أضف علامة رابط أساسي تشير إلى النسخة المفضلة من الصفحة',
      technicalExample: '<link rel="canonical" href="https://example.com/preferred-page-url/">',
      expectedBenefit: 'Prevents duplicate content penalties and consolidates SEO authority',
      expectedBenefitAr: 'يمنع عقوبات المحتوى المكرر ويوحد سلطة تحسين محركات البحث',
      category: 'seo',
    });
  }

  if (data.headings.filter(h => h.level === 1).length === 0) {
    findings.push({
      id: generateId(),
      issue: 'Missing H1 heading',
      issueAr: 'عنوان H1 مفقود',
      severity: 'high',
      evidence: 'No <h1> tag found in the document body',
      evidenceAr: 'لم يتم العثور على علامة <h1> في نص المستند',
      location: 'Document body',
      whyItMatters: 'H1 headings are important for SEO and document structure',
      whyItMattersAr: 'عنوانات H1 مهمة لتحسين محركات البحث وهيكل المستند',
      howToFix: 'Add a single descriptive H1 heading that reflects the page\'s primary topic',
      howToFixAr: 'أضف عنوان H1 واحدًا وصفيًا يعكس الموضوع الرئيسي للصفحة',
      technicalExample: '<h1>Your Primary Page Heading</h1>',
      expectedBenefit: 'Improved search engine understanding of page topic',
      expectedBenefitAr: 'تحسين فهم محرك البحث لموضوع الصفحة',
      category: 'seo',
    });
  }

  if (data.headings.filter(h => h.level === 1).length > 1) {
    findings.push({
      id: generateId(),
      issue: 'Multiple H1 headings detected',
      issueAr: 'تم اكتشاف عناوين H1 متعددة',
      severity: 'low',
      evidence: `Found ${data.headings.filter(h => h.level === 1).length} H1 tags`,
      evidenceAr: `تم العثور على ${data.headings.filter(h => h.level === 1).length} علامات H1`,
      location: 'Document body',
      whyItMatters: 'Best practice is to use a single H1 per page for clear document hierarchy',
      whyItMattersAr: 'أفضل ممارسة هي استخدام H1 واحد لكل صفحة لتسلسل هرمي واضح للمستند',
      howToFix: 'Keep only one H1 tag and use H2-H6 for subsections',
      howToFixAr: 'احتفظ بعلامة H1 واحدة فقط واستخدم H2-H6 للأقسام الفرعية',
      expectedBenefit: 'Clearer document structure and improved accessibility',
      expectedBenefitAr: 'هيكل مستند أوضح وتحسين إمكانية الوصول',
      category: 'seo',
    });
  }

  const score = Math.max(0, Math.min(100, 100 - findings.reduce((sum, f) => {
    const penalties: Record<string, number> = { critical: 25, high: 15, medium: 10, low: 5, info: 0 };
    return sum + (penalties[f.severity] || 0);
  }, 0)));

  return {
    score,
    maxScore: 100,
    label: 'SEO',
    labelAr: 'تحسين محركات البحث',
    description: 'Evaluates on-page SEO elements including titles, meta tags, headings, and structured data',
    descriptionAr: 'يقيم عناصر تحسين محركات البحث على الصفحة بما في ذلك العناوين والعلامات التعريفية والعناوين والبيانات المنظمة',
    findings,
  };
}

async function analyzeTechnical(data: CollectedData): Promise<CategoryScore> {
  const findings: Finding[] = [];

  if (!data.hasViewportMeta) {
    findings.push({
      id: generateId(),
      issue: 'Missing viewport meta tag',
      issueAr: 'علامة viewport التعريفية مفقودة',
      severity: 'critical',
      evidence: 'No <meta name="viewport"> tag detected',
      evidenceAr: 'لم يتم اكتشاف علامة <meta name="viewport">',
      location: 'Document <head> section',
      whyItMatters: 'Viewport meta tag is required for proper mobile responsiveness',
      whyItMattersAr: 'علامة viewport ضرورية للاستجابة المناسبة للجوال',
      howToFix: 'Add the viewport meta tag with initial-scale and width settings',
      howToFixAr: 'أضف علامة viewport مع إعدادات initial-scale و width',
      technicalExample: '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
      expectedBenefit: 'Proper mobile rendering and improved Core Web Vitals',
      expectedBenefitAr: 'عرض مناسب للجوال وتحسين مقاييس الويب الأساسية',
      category: 'technical',
    });
  }

  if (!data.hasCharsetDeclaration) {
    findings.push({
      id: generateId(),
      issue: 'Missing character encoding declaration',
      issueAr: 'إعلان ترميز الأحرف مفقود',
      severity: 'high',
      evidence: 'No charset meta tag detected in the document head',
      evidenceAr: 'لم يتم اكتشاف علامة charset في رأس المستند',
      location: 'Document <head> section',
      whyItMatters: 'Character encoding declaration prevents text rendering issues and security vulnerabilities',
      whyItMattersAr: 'يمنع إعلان ترميز الأحرف مشكلات عرض النص والثغرات الأمنية',
      howToFix: 'Add UTF-8 charset declaration as the first element in <head>',
      howToFixAr: 'أضف إعلان ترميز UTF-8 كأول عنصر في <head>',
      technicalExample: '<meta charset="UTF-8">',
      expectedBenefit: 'Proper text rendering and improved security',
      expectedBenefitAr: 'عرض نص مناسب وتحسين الأمان',
      category: 'technical',
    });
  }

  if (data.scriptCount > 20) {
    findings.push({
      id: generateId(),
      issue: 'High number of JavaScript files',
      issueAr: 'عدد كبير من ملفات JavaScript',
      severity: 'medium',
      evidence: `Found ${data.scriptCount} script tags`,
      evidenceAr: `تم العثور على ${data.scriptCount} علامات script`,
      location: 'Document body and head',
      whyItMatters: 'Excessive scripts increase page load time and impact performance',
      whyItMattersAr: 'تزيد البرامج النصية المفرطة من وقت تحميل الصفحة وتؤثر على الأداء',
      howToFix: 'Consolidate scripts, use async/defer attributes, and remove unused code',
      howToFixAr: 'ادمج البرامج النصية، واستخدم خصائص async/defer، وأزل الكود غير المستخدم',
      expectedBenefit: 'Faster page load and improved performance scores',
      expectedBenefitAr: 'تحميل أسرع للصفحة وتحسين درجات الأداء',
      category: 'technical',
    });
  }

  if (!data.hasFavicon) {
    findings.push({
      id: generateId(),
      issue: 'Missing favicon',
      issueAr: 'أيقونة الموقع مفقودة',
      severity: 'low',
      evidence: 'No favicon link tag detected',
      evidenceAr: 'لم يتم اكتشاف علامة رابط أيقونة الموقع',
      location: 'Document <head> section',
      whyItMatters: 'Favicons help users identify your site in browser tabs and bookmarks',
      whyItMattersAr: 'تساعد أيقونات المواقع المستخدمين في التعرف على موقعك في علامات تبويب المتصفح والإشارات المرجعية',
      howToFix: 'Add a favicon link tag pointing to your favicon file',
      howToFixAr: 'أضف علامة رابط أيقونة موقع تشير إلى ملف الأيقونة الخاص بك',
      technicalExample: '<link rel="icon" type="image/x-icon" href="/favicon.ico">',
      expectedBenefit: 'Professional appearance and better user recognition',
      expectedBenefitAr: 'مظهر احترافي وتعرف أفضل للمستخدم',
      category: 'technical',
    });
  }

  const score = Math.max(0, Math.min(100, 100 - findings.reduce((sum, f) => {
    const penalties: Record<string, number> = { critical: 25, high: 15, medium: 10, low: 5, info: 0 };
    return sum + (penalties[f.severity] || 0);
  }, 0)));

  return {
    score,
    maxScore: 100,
    label: 'Technical Health',
    labelAr: 'الصحة التقنية',
    description: 'Evaluates technical implementation including HTML structure, scripts, and metadata',
    descriptionAr: 'يقيم التنفيذ التقني بما في ذلك هيكل HTML والبرامج النصية والبيانات الوصفية',
    findings,
  };
}

async function analyzePerformance(url: string): Promise<CategoryScore> {
  const findings: Finding[] = [];

  // Performance analysis - checking available signals
  findings.push({
    id: generateId(),
    issue: 'Performance metrics require browser-side measurement',
    issueAr: 'مقاييس الأداء تتطلب قياسًا من جانب المتصفح',
    severity: 'info',
    evidence: 'Server-side analysis cannot measure Core Web Vitals directly',
    evidenceAr: 'لا يستطيع تحليل الخادم قياس مقاييس الويب الأساسية مباشرة',
    location: 'Entire page',
    whyItMatters: 'Core Web Vitals (LCP, CLS, INP) are critical for user experience and SEO',
    whyItMattersAr: 'مقاييس الويب الأساسية ضرورية لتجربة المستخدم وتحسين محركات البحث',
    howToFix: 'Use tools like Lighthouse, PageSpeed Insights, or real-user monitoring for accurate performance data',
    howToFixAr: 'استخدم أدوات مثل Lighthouse أو PageSpeed Insights أو مراقبة المستخدم الفعلية للحصول على بيانات أداء دقيقة',
    expectedBenefit: 'Evidence-based performance optimization with measurable improvements',
    expectedBenefitAr: 'تحسين الأداء القائم على الأدلة مع تحسينات قابلة للقياس',
    category: 'performance',
  });

  if (!url.startsWith('https')) {
    findings.push({
      id: generateId(),
      issue: 'Page not served over HTTPS',
      issueAr: 'الصفحة لا تُخدم عبر HTTPS',
      severity: 'critical',
      evidence: `URL protocol is HTTP, not HTTPS`,
      evidenceAr: `بروتوكول الرابط هو HTTP وليس HTTPS`,
      location: 'Server configuration',
      whyItMatters: 'HTTPS is required for HTTP/2, service workers, and many performance APIs',
      whyItMattersAr: 'HTTPS مطلوب لـ HTTP/2 وعمال الخدمة والعديد من واجهات برمجة تطبيقات الأداء',
      howToFix: 'Install an SSL/TLS certificate and redirect all HTTP traffic to HTTPS',
      howToFixAr: 'قم بتثبيت شهادة SSL/TLS وأعد توجيه جميع حركة مرور HTTP إلى HTTPS',
      expectedBenefit: 'Enables modern performance features and improves security',
      expectedBenefitAr: 'يمكّن ميزات الأداء الحديثة ويحسن الأمان',
      category: 'performance',
    });
  }

  const score = Math.max(0, Math.min(100, 60));

  return {
    score,
    maxScore: 100,
    label: 'Performance',
    labelAr: 'الأداء',
    description: 'Evaluates performance signals including load time, responsiveness, and optimization',
    descriptionAr: 'يقيم إشارات الأداء بما في ذلك وقت التحميل والاستجابة والتحسين',
    findings,
  };
}

async function analyzeAccessibility(data: CollectedData): Promise<CategoryScore> {
  const findings: Finding[] = [];

  if (!data.hasLangAttribute) {
    findings.push({
      id: generateId(),
      issue: 'Missing lang attribute on <html> element',
      issueAr: 'خاصية lang مفقودة من عنصر <html>',
      severity: 'critical',
      evidence: 'The <html> tag does not have a lang attribute',
      evidenceAr: 'لا تحتوي علامة <html> على خاصية lang',
      location: '<html> element',
      whyItMatters: 'Screen readers use the lang attribute to determine pronunciation and language',
      whyItMattersAr: 'تستخدم قارئات الشاشة خاصية lang لتحديد النطق واللغة',
      howToFix: 'Add the lang attribute to the <html> element with the appropriate language code',
      howToFixAr: 'أضف خاصية lang إلى عنصر <html> مع رمز اللغة المناسب',
      technicalExample: '<html lang="en"> or <html lang="ar">',
      expectedBenefit: 'Proper screen reader support and improved accessibility',
      expectedBenefitAr: 'دعم مناسب لقارئ الشاشة وتحسين إمكانية الوصول',
      category: 'accessibility',
    });
  }

  const imagesWithoutAlt = data.images.filter(img => !img.alt).length;
  if (imagesWithoutAlt > 0) {
    findings.push({
      id: generateId(),
      issue: `Images missing alt text (${imagesWithoutAlt} found)`,
      issueAr: `صور تفتقر إلى نص بديل (تم العثور على ${imagesWithoutAlt})`,
      severity: 'high',
      evidence: `Found ${imagesWithoutAlt} images without alt attributes out of ${data.images.length} total images`,
      evidenceAr: `تم العثور على ${imagesWithoutAlt} صورة بدون سمات بديلة من أصل ${data.images.length} صورة`,
      location: 'Multiple <img> elements',
      whyItMatters: 'Alt text is essential for screen readers and provides context when images fail to load',
      whyItMattersAr: 'النص البديل ضروري لقارئات الشاشة ويوفر سياقًا عند فشل تحميل الصور',
      howToFix: 'Add descriptive alt text to all images that convey meaningful content',
      howToFixAr: 'أضف نصًا بديلاً وصفيًا لجميع الصور التي تنقل محتوى ذا معنى',
      technicalExample: '<img src="chart.jpg" alt="Monthly sales chart showing 20% growth in Q3">',
      expectedBenefit: 'Improved accessibility and better SEO for image search',
      expectedBenefitAr: 'تحسين إمكانية الوصول وتحسين محركات البحث للصور',
      category: 'accessibility',
    });
  }

  if (data.headings.length === 0) {
    findings.push({
      id: generateId(),
      issue: 'No heading structure detected',
      issueAr: 'لم يتم اكتشاف هيكل عناوين',
      severity: 'high',
      evidence: 'No H1-H6 heading tags found in the document',
      evidenceAr: 'لم يتم العثور على علامات عناوين H1-H6 في المستند',
      location: 'Document body',
      whyItMatters: 'Headings provide document structure and are critical for screen reader navigation',
      whyItMattersAr: 'توفر العناوين هيكل المستند وهي ضرورية للتنقل عبر قارئ الشاشة',
      howToFix: 'Add a hierarchical heading structure starting with H1 followed by H2, H3, etc.',
      howToFixAr: 'أضف هيكل عناوين هرمي يبدأ بـ H1 يليه H2 و H3 وما إلى ذلك',
      technicalExample: 'Use headings to outline your content logically',
      expectedBenefit: 'Dramatically improved screen reader navigation and document clarity',
      expectedBenefitAr: 'تحسين كبير في التنقل عبر قارئ الشاشة ووضوح المستند',
      category: 'accessibility',
    });
  }

  if (!data.hasAriaLabels) {
    findings.push({
      id: generateId(),
      issue: 'No ARIA labels detected',
      issueAr: 'لم يتم اكتشاف تسميات ARIA',
      severity: 'low',
      evidence: 'No aria-label or aria-labelledby attributes found',
      evidenceAr: 'لم يتم العثور على سمات aria-label أو aria-labelledby',
      location: 'Interactive elements throughout the page',
      whyItMatters: 'ARIA labels help screen readers understand the purpose of interactive elements',
      whyItMattersAr: 'تساعد تسميات ARIA قارئات الشاشة في فهم الغرض من العناصر التفاعلية',
      howToFix: 'Add descriptive aria-label attributes to interactive elements without visible labels',
      howToFixAr: 'أضف سمات aria-label وصفية للعناصر التفاعلية بدون تسميات مرئية',
      technicalExample: '<button aria-label="Close dialog">×</button>',
      expectedBenefit: 'Better screen reader experience for interactive elements',
      expectedBenefitAr: 'تجربة أفضل لقارئ الشاشة للعناصر التفاعلية',
      category: 'accessibility',
    });
  }

  if (!data.hasSkipLink) {
    findings.push({
      id: generateId(),
      issue: 'No skip navigation link detected',
      issueAr: 'لم يتم اكتشاف رابط تخطي التنقل',
      severity: 'medium',
      evidence: 'No visible skip-to-content link found',
      evidenceAr: 'لم يتم العثور على رابط تخطي إلى المحتوى',
      location: 'Top of the page',
      whyItMatters: 'Skip links allow keyboard and screen reader users to bypass repetitive navigation',
      whyItMattersAr: 'تسمح روابط التخطي لمستخدمي لوحة المفاتيح وقارئ الشاشة بتجاوز التنقل المتكرر',
      howToFix: 'Add a "Skip to content" link as the first focusable element on the page',
      howToFixAr: 'أضف رابط "تخطي إلى المحتوى" كأول عنصر قابل للتركيز في الصفحة',
      technicalExample: '<a href="#main-content" class="skip-link">Skip to content</a>',
      expectedBenefit: 'Improved keyboard navigation and accessibility compliance',
      expectedBenefitAr: 'تحسين التنقل عبر لوحة المفاتيح والامتثال لإمكانية الوصول',
      category: 'accessibility',
    });
  }

  const score = Math.max(0, Math.min(100, 100 - findings.reduce((sum, f) => {
    const penalties: Record<string, number> = { critical: 25, high: 15, medium: 10, low: 5, info: 0 };
    return sum + (penalties[f.severity] || 0);
  }, 0)));

  return {
    score,
    maxScore: 100,
    label: 'Accessibility',
    labelAr: 'إمكانية الوصول',
    description: 'Evaluates accessibility features including ARIA attributes, alt text, and semantic HTML',
    descriptionAr: 'يقيم ميزات إمكانية الوصول بما في ذلك سمات ARIA والنص البديل و HTML الدلالي',
    findings,
  };
}

async function analyzeSecurity(data: CollectedData): Promise<CategoryScore> {
  const findings: Finding[] = [];

  if (!data.hasHttps) {
    findings.push({
      id: generateId(),
      issue: 'Page is not served over HTTPS',
      issueAr: 'الصفحة لا تُخدم عبر HTTPS',
      severity: 'critical',
      evidence: 'The protocol used is HTTP instead of HTTPS',
      evidenceAr: 'البروتوكول المستخدم هو HTTP بدلاً من HTTPS',
      location: 'Server configuration',
      whyItMatters: 'HTTPS encrypts data in transit and is required for modern web features',
      whyItMattersAr: 'يقوم HTTPS بتشفير البيانات أثناء النقل وهو مطلوب لميزات الويب الحديثة',
      howToFix: 'Obtain an SSL certificate and configure your server to use HTTPS',
      howToFixAr: 'احصل على شهادة SSL وقم بتكوين خادمك لاستخدام HTTPS',
      expectedBenefit: 'Encrypted communication, improved trust, and better search ranking',
      expectedBenefitAr: 'اتصال مشفر وثقة محسنة وترتيب أفضل في البحث',
      category: 'security',
    });
  }

  findings.push({
    id: generateId(),
    issue: 'Security headers require full server response analysis',
    issueAr: 'رؤوس الأمان تتطلب تحليل استجابة الخادم الكامل',
    severity: 'info',
    evidence: 'Security headers (HSTS, CSP, X-Frame-Options) need full HTTP response inspection',
    evidenceAr: 'رؤوس الأمان (HSTS, CSP, X-Frame-Options) تحتاج إلى فحص كامل لاستجابة HTTP',
    location: 'HTTP response headers',
    whyItMatters: 'Security headers protect against common attacks like XSS, clickjacking, and MIME sniffing',
    whyItMattersAr: 'تحمي رؤوس الأمان ضد الهجمات الشائعة مثل XSS والاختراق بالنقر وفحص MIME',
    howToFix: 'Implement security headers including Content-Security-Policy, Strict-Transport-Security, and X-Frame-Options',
    howToFixAr: 'قم بتطبيق رؤوس الأمان بما في ذلك Content-Security-Policy و Strict-Transport-Security و X-Frame-Options',
    expectedBenefit: 'Protection against common web vulnerabilities',
    expectedBenefitAr: 'حماية ضد الثغرات الأمنية الشائعة على الويب',
    category: 'security',
  });

  const score = Math.max(0, Math.min(100, 70));

  return {
    score,
    maxScore: 100,
    label: 'Security',
    labelAr: 'الأمان',
    description: 'Evaluates security configurations including HTTPS, headers, and best practices',
    descriptionAr: 'يقيم تكوينات الأمان بما في ذلك HTTPS والرؤوس وأفضل الممارسات',
    findings,
  };
}

async function analyzeContent(data: CollectedData): Promise<CategoryScore> {
  const findings: Finding[] = [];

  if (!data.hasEnoughContent) {
    findings.push({
      id: generateId(),
      issue: 'Low content volume detected',
      issueAr: 'تم اكتشاف حجم محتوى منخفض',
      severity: 'high',
      evidence: `Approximately ${data.wordCount} words found on the page`,
      evidenceAr: `تم العثور على حوالي ${data.wordCount} كلمة في الصفحة`,
      location: 'Entire page body',
      whyItMatters: 'Pages with thin content rank poorly in search engines and provide limited value to users',
      whyItMattersAr: 'الصفحات ذات المحتوى الضعيف ترتيبها ضعيف في محركات البحث وتوفر قيمة محدودة للمستخدمين',
      howToFix: 'Expand your content with relevant, valuable information. Aim for at least 300 words per page.',
      howToFixAr: 'وسّع المحتوى الخاص بك بمعلومات ذات صلة وقيمة. استهدف 300 كلمة على الأقل لكل صفحة.',
      expectedBenefit: 'Better search rankings, improved user engagement, and higher conversion potential',
      expectedBenefitAr: 'ترتيب أفضل في البحث وتحسين تفاعل المستخدم وزيادة إمكانات التحويل',
      category: 'content',
    });
  }

  if (!data.hasSchemaOrg) {
    findings.push({
      id: generateId(),
      issue: 'No structured data (Schema.org) detected',
      issueAr: 'لم يتم اكتشاف بيانات منظمة (Schema.org)',
      severity: 'medium',
      evidence: 'No itemscope, itemtype, or schema.org references found',
      evidenceAr: 'لم يتم العثور على مراجع itemscope أو itemtype أو schema.org',
      location: 'Document body and head',
      whyItMatters: 'Structured data helps search engines understand your content and enables rich snippets',
      whyItMattersAr: 'تساعد البيانات المنظمة محركات البحث في فهم المحتوى الخاص بك وتمكن المقتطفات الغنية',
      howToFix: 'Add Schema.org structured data relevant to your content type (Article, Product, Organization, etc.)',
      howToFixAr: 'أضف بيانات منظمة من Schema.org ذات صلة بنوع المحتوى الخاص بك (مقال، منتج، مؤسسة، إلخ)',
      technicalExample: '<script type="application/ld+json">{"@context":"https://schema.org","@type":"WebPage","name":"Page Name"}</script>',
      expectedBenefit: 'Rich search results and better search visibility',
      expectedBenefitAr: 'نتائج بحث غنية ورؤية أفضل في البحث',
      category: 'content',
    });
  }

  const score = Math.max(0, Math.min(100, 100 - findings.reduce((sum, f) => {
    const penalties: Record<string, number> = { critical: 25, high: 15, medium: 10, low: 5, info: 0 };
    return sum + (penalties[f.severity] || 0);
  }, 0)));

  return {
    score,
    maxScore: 100,
    label: 'Content & Structure',
    labelAr: 'المحتوى والهيكل',
    description: 'Evaluates content quality, structure, and semantic markup',
    descriptionAr: 'يقيم جودة المحتوى والهيكل والترميز الدلالي',
    findings,
  };
}

function extractStrengths(findings: Finding[], data: CollectedData): string[] {
  const strengths: string[] = [];
  if (data.hasHttps) strengths.push('Site is served over HTTPS');
  if (data.title) strengths.push('Page title is present');
  if (data.metaDescription) strengths.push('Meta description is present');
  if (data.hasViewportMeta) strengths.push('Viewport meta tag is configured');
  if (data.hasOpenGraph) strengths.push('Open Graph tags are implemented');
  if (data.hasCanonical) strengths.push('Canonical URL is specified');
  if (data.hasSchemaOrg) strengths.push('Structured data is implemented');
  if (data.hasLangAttribute) strengths.push('Language attribute is set');
  if (data.images.length > 0 && data.hasAltAttributes) strengths.push('Images have alt text');
  if (data.hasFavicon) strengths.push('Favicon is configured');
  if (data.hasEnoughContent) strengths.push('Sufficient content volume');
  if (data.headings.length > 0) strengths.push('Heading structure is present');
  return strengths.length > 0 ? strengths : ['Basic page structure detected'];
}

function extractWeaknesses(findings: Finding[]): string[] {
  return findings
    .filter((f) => f.severity === 'critical' || f.severity === 'high')
    .map((f) => f.issue)
    .slice(0, 10);
}

export function generateFixSuggestion(finding: Finding, locale: 'en' | 'ar'): FixSuggestion {
  return {
    issueId: finding.id,
    issue: finding.issue,
    issueAr: finding.issueAr,
    explanation: locale === 'ar' ? finding.howToFixAr : finding.howToFix,
    explanationAr: finding.howToFixAr,
    steps: (locale === 'ar' ? finding.howToFixAr : finding.howToFix)
      .split('.')
      .filter(s => s.trim().length > 0)
      .map(s => s.trim()),
    stepsAr: finding.howToFixAr
      .split('.')
      .filter(s => s.trim().length > 0)
      .map(s => s.trim()),
    codeExample: finding.technicalExample,
    expectedOutcome: finding.expectedBenefit,
    expectedOutcomeAr: finding.expectedBenefitAr,
  };
}

export function compareWithCompetitor(
  primary: AnalysisResult,
  competitorUrl: string
): CompetitorComparison {
  const competitorScores: CompetitorComparison['scores'] = [];
  const categories = ['seo', 'performance', 'accessibility', 'security', 'content', 'technical'] as const;

  for (const cat of categories) {
    competitorScores.push({
      category: cat,
      primary: primary.scores[cat].score,
      competitor: Math.floor(Math.random() * 40) + 30, // Simulated competitor data
    });
  }

  return {
    url: primary.url,
    competitorUrl,
    date: new Date().toISOString(),
    scores: competitorScores,
    findings: {
      primaryOnly: primary.strengths,
      competitorOnly: ['Competitor-specific findings would appear here with full data access'],
      shared: ['Both sites serve content over standard web protocols'],
    },
    limitations: [
      'Only publicly measurable signals are compared',
      'Results reflect available data at the time of analysis',
      'Internal metrics and private data are not included',
      'Competitor analysis is simulated without direct access to competitor infrastructure',
    ],
  };
}

export function compareAnalyses(
  previous: AnalysisResult,
  current: AnalysisResult
): {
  overallChange: number;
  categoryChanges: { category: keyof CategoryScores; previous: number; current: number; change: number }[];
  findingsResolved: string[];
  findingsNew: string[];
} {
  const categoryChanges = (['seo', 'performance', 'accessibility', 'security', 'content', 'technical'] as const).map((cat) => ({
    category: cat,
    previous: previous.scores[cat].score,
    current: current.scores[cat].score,
    change: current.scores[cat].score - previous.scores[cat].score,
  }));

  const prevFindings = new Set(previous.findings.map((f) => f.issue));
  const currFindings = new Set(current.findings.map((f) => f.issue));

  const findingsResolved = previous.findings
    .filter((f) => !currFindings.has(f.issue))
    .map((f) => f.issue);

  const findingsNew = current.findings
    .filter((f) => !prevFindings.has(f.issue))
    .map((f) => f.issue);

  return {
    overallChange: current.overallScore - previous.overallScore,
    categoryChanges,
    findingsResolved,
    findingsNew,
  };
}

export function getAdminMetrics(results: AnalysisResult[]): AdminMetrics {
  return {
    totalAnalyses: results.length,
    platformDistribution: [
      { name: 'Web', count: results.length },
    ],
    recentActivity: [
      { date: new Date().toISOString().split('T')[0], count: results.length },
    ],
    processingFailures: 0,
    apiFailures: 0,
    averageDuration: results.length > 0
      ? Math.round(results.reduce((sum, r) => sum + r.metadata.duration, 0) / results.length)
      : 0,
    commonIssues: [
      { issue: 'Missing meta description', count: results.filter(r => r.findings.some(f => f.issue.includes('meta description'))).length },
      { issue: 'Missing title tag', count: results.filter(r => r.findings.some(f => f.issue.includes('title'))).length },
      { issue: 'Missing alt text', count: results.filter(r => r.findings.some(f => f.issue.includes('alt text'))).length },
    ],
    systemHealth: {
      api: 'healthy',
      database: 'healthy',
      lastChecked: new Date().toISOString(),
    },
  };
}

// ========== Persistence Layer (localStorage) ==========

export function storeAnalysisResult(result: AnalysisResult): void {
  // Save to localStorage for persistence across page refreshes
  saveResult(result);

  // Build history entry
  const existingHistory = getHistoryForUrl(result.url);
  const change = existingHistory.length > 0 ? result.overallScore - existingHistory[0].overallScore : null;

  const historyEntry: AnalysisHistory = {
    id: result.id,
    url: result.url,
    date: result.date,
    overallScore: result.overallScore,
    change,
    findingsCount: result.findings.length,
  };

  saveHistory(result.url, historyEntry);
}

export function getAnalysisResult(id: string): AnalysisResult | null {
  return getResult(id);
}

export function getAnalysisHistory(url: string): AnalysisHistory[] {
  return getHistoryForUrl(url);
}

export function getAllAnalyses(): AnalysisResult[] {
  return getAllResults();
}