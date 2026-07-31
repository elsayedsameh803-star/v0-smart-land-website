"use client";

import { usePathname } from "next/navigation";
import { Search, Globe, BarChart3, Shield, Zap, Eye, FileText, CheckCircle, TrendingUp, Users, Award, Smartphone, Lock, RefreshCw, Download, Share2, Sparkles, ArrowLeft } from "lucide-react";
import Link from "next/link";

const translations: Record<string, Record<string, string>> = {
  en: {
    title: "Features",
    subtitle: "Everything you need to audit and improve your digital presence",
    cta: "Start Free Analysis",
    comprehensive: "Comprehensive Analysis",
    comprehensiveDesc: "Analyze your website across 6 critical categories with over 100 individual signals measured.",
    seo: "SEO & Visibility",
    seoDesc: "Meta tags, headings, structured data, canonical URLs, Open Graph, Twitter Cards, and more.",
    performance: "Performance & Speed",
    performanceDesc: "Load time, page size, compression, CDN usage, caching, HTTP/2, and Core Web Vitals signals.",
    accessibility: "Accessibility & UX",
    accessibilityDesc: "ARIA landmarks, keyboard navigation, contrast ratios, screen reader compatibility, and mobile responsiveness.",
    security: "Security & Trust",
    securityDesc: "SSL/TLS, HSTS, CSP, X-Frame-Options, secure cookies, and security headers analysis.",
    content: "Content & Authority",
    contentDesc: "Content quality, word count, structured data, social signals, and authority indicators.",
    technical: "Technical Infrastructure",
    technicalDesc: "Server configuration, DNS, CDN, HTTP status codes, compression, and technology stack detection.",
    realData: "Real Data Analysis",
    realDataDesc: "We fetch and analyze your actual website data in real-time. No simulations, no estimations — just real evidence from your live site.",
    evidenceBased: "Evidence-Based Results",
    evidenceBasedDesc: "Every score and finding is backed by specific evidence we discover during analysis. You can verify every claim yourself.",
    competitor: "Competitor Comparison",
    competitorDesc: "Compare your site against competitors side-by-side across all categories. Understand where you stand in your market.",
    history: "Track Progress Over Time",
    historyDesc: "Save your analysis history and track how your scores improve. Re-analyze to see before/after comparisons.",
    pdfReport: "PDF Reports",
    pdfReportDesc: "Generate professional PDF audit reports with all findings, evidence, and recommendations. Perfect for sharing with clients or stakeholders.",
    fixAssistant: "AI Fix Assistant",
    fixAssistantDesc: "Get step-by-step instructions on how to fix each issue found, including code examples and expected outcomes.",
    pwa: "Works Offline",
    pwaDesc: "Install Smart Land as a Progressive Web App and access your analysis history even without internet connection.",
    multiLanguage: "Multi-Language Support",
    multiLanguageDesc: "Full support for English and Arabic, with automatic language detection and RTL layout for Arabic users.",
    global: "Global Reach",
    globalDesc: "Analyze any public website worldwide. Our platform works with any URL, regardless of location or hosting provider.",
    free: "Free to Use",
    freeDesc: "Professional-grade digital analysis available to everyone. No credit card required, no hidden fees.",
    privacy: "Privacy First",
    privacyDesc: "Your data stays on your device. We don't store analysis results on our servers. Full privacy protection.",
    allFeatures: "All Features at a Glance",
    platforms: "Platform Support",
    website: "Websites",
    youtube: "YouTube",
    social: "Social Media (Coming Soon)",
  },
  ar: {
    title: "المميزات",
    subtitle: "كل ما تحتاجه لتدقيق وتحسين حضورك الرقمي",
    cta: "ابدأ التحليل المجاني",
    comprehensive: "تحليل شامل",
    comprehensiveDesc: "حلل موقعك عبر 6 فئات حاسمة مع قياس أكثر من 100 إشارة فردية.",
    seo: "تحسين محركات البحث والظهور",
    seoDesc: "العلامات الوصفية، العناوين، البيانات المنظمة، الروابط الأساسية، Open Graph، بطاقات Twitter، والمزيد.",
    performance: "الأداء والسرعة",
    performanceDesc: "وقت التحميل، حجم الصفحة، الضغط، استخدام CDN، التخزين المؤقت، HTTP/2، وإشارات مقاييس الويب الأساسية.",
    accessibility: "إمكانية الوصول وتجربة المستخدم",
    accessibilityDesc: "معالم ARIA، التنقل بلوحة المفاتيح، نسب التباين، توافق قارئ الشاشة، والاستجابة للجوال.",
    security: "الأمان والثقة",
    securityDesc: "SSL/TLS، HSTS، CSP، X-Frame-Options، الكوكيز الآمنة، وتحليل رؤوس الأمان.",
    content: "المحتوى والسلطة",
    contentDesc: "جودة المحتوى، عدد الكلمات، البيانات المنظمة، الإشارات الاجتماعية، ومؤشرات السلطة.",
    technical: "البنية التحتية التقنية",
    technicalDesc: "تكوين الخادم، DNS، CDN، رموز حالة HTTP، الضغط، واكتشاف مجموعة التقنيات.",
    realData: "تحليل بيانات حقيقي",
    realDataDesc: "نجلب ونحلل بيانات موقعك الفعلية في الوقت الفعلي. لا محاكاة، لا تقديرات — فقط أدلة حقيقية من موقعك المباشر.",
    evidenceBased: "نتائج مبنية على الأدلة",
    evidenceBasedDesc: "كل نتيجة واكتشاف مدعوم بأدلة محددة نكتشفها أثناء التحليل. يمكنك التحقق من كل ادعاء بنفسك.",
    competitor: "مقارنة المنافسين",
    competitorDesc: "قارن موقعك مع المنافسين جنباً إلى جنب عبر جميع الفئات. افهم موقعك في السوق.",
    history: "تتبع التقدم بمرور الوقت",
    historyDesc: "احفظ سجل تحليلاتك وتابع كيف تتحسن نتائجك. أعد التحليل لرؤية مقارنات قبل/بعد.",
    pdfReport: "تقارير PDF",
    pdfReportDesc: "أنشئ تقارير تدقيق PDF احترافية مع جميع النتائج والأدلة والتوصيات. مثالية للمشاركة مع العملاء أو أصحاب المصلحة.",
    fixAssistant: "مساعد الإصلاح بالذكاء الاصطناعي",
    fixAssistantDesc: "احصل على تعليمات خطوة بخطوة حول كيفية إصلاح كل مشكلة يتم العثور عليها، بما في ذلك أمثلة برمجية والنتائج المتوقعة.",
    pwa: "يعمل بدون إنترنت",
    pwaDesc: "قم بتثبيت سمارت لاند كتطبيق ويب تقدمي ويمكنك الوصول إلى سجل تحليلاتك حتى بدون اتصال بالإنترنت.",
    multiLanguage: "دعم متعدد اللغات",
    multiLanguageDesc: "دعم كامل للغة الإنجليزية والعربية، مع اكتشاف تلقائي للغة وتخطيط RTL للمستخدمين العرب.",
    global: "وصول عالمي",
    globalDesc: "حلل أي موقع عام في جميع أنحاء العالم. منصتنا تعمل مع أي رابط، بغض النظر عن الموقع أو مزود الاستضافة.",
    free: "مجاني للاستخدام",
    freeDesc: "تحليل رقمي على المستوى الاحترافي متاح للجميع. لا حاجة لبطاقة ائتمان، ولا رسوم مخفية.",
    privacy: "الخصوصية أولاً",
    privacyDesc: "بياناتك تبقى على جهازك. لا نخزن نتائج التحليل على خوادمنا. حماية كاملة للخصوصية.",
    allFeatures: "جميع المميزات في لمحة",
    platforms: "المنصات المدعومة",
    website: "مواقع إلكترونية",
    youtube: "يوتيوب",
    social: "تواصل اجتماعي (قريباً)",
  },
};

export default function FeaturesPage({ params }: { params: { locale: string } }) {
  const locale = params.locale;
  const isRtl = locale === "ar";
  const t = translations[locale] || translations.en;

  const analysisFeatures = [
    { icon: Search, title: t.seo, desc: t.seoDesc },
    { icon: Zap, title: t.performance, desc: t.performanceDesc },
    { icon: Eye, title: t.accessibility, desc: t.accessibilityDesc },
    { icon: Shield, title: t.security, desc: t.securityDesc },
    { icon: FileText, title: t.content, desc: t.contentDesc },
    { icon: Globe, title: t.technical, desc: t.technicalDesc },
  ];

  const platformFeatures = [
    { icon: Globe, title: t.website, desc: "", color: "from-gold-500 to-gold-600" },
    { icon: Award, title: t.youtube, desc: "", color: "from-red-500 to-red-600" },
    { icon: Smartphone, title: t.social, desc: "", color: "from-blue-500 to-blue-600" },
  ];

  const keyFeatures = [
    { icon: BarChart3, title: t.realData, desc: t.realDataDesc },
    { icon: CheckCircle, title: t.evidenceBased, desc: t.evidenceBasedDesc },
    { icon: Users, title: t.competitor, desc: t.competitorDesc },
    { icon: TrendingUp, title: t.history, desc: t.historyDesc },
    { icon: Download, title: t.pdfReport, desc: t.pdfReportDesc },
    { icon: Sparkles, title: t.fixAssistant, desc: t.fixAssistantDesc },
    { icon: Smartphone, title: t.pwa, desc: t.pwaDesc },
    { icon: Globe, title: t.multiLanguage, desc: t.multiLanguageDesc },
    { icon: Award, title: t.free, desc: t.freeDesc },
    { icon: Lock, title: t.privacy, desc: t.privacyDesc },
  ];

  return (
    <div className="min-h-screen bg-dark-950" dir={isRtl ? "rtl" : "ltr"}>
      <div className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gold-500/5 via-transparent to-transparent" />
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-8 h-8 text-dark-950" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">{t.title}</h1>
          <p className="text-xl text-dark-300 mb-8">{t.subtitle}</p>
          <Link href={`/${locale}`} className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-gold-600 to-gold-500 text-dark-950 font-bold text-lg hover:from-gold-500 hover:to-gold-400 transition-all shadow-lg shadow-gold-500/25">
            <Zap className="w-5 h-5" />
            {t.cta}
          </Link>
        </div>
      </div>

      {/* Analysis Categories */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-bold text-white text-center mb-12">{t.comprehensive}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {analysisFeatures.map((f, i) => (
            <div key={i} className="p-6 rounded-2xl bg-dark-800/60 border border-gold-500/10 card-hover-effect">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold-500/20 to-gold-600/20 flex items-center justify-center mb-4">
                <f.icon className="w-6 h-6 text-gold-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-dark-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Key Features */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-bold text-white text-center mb-12">{t.allFeatures}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {keyFeatures.map((f, i) => (
            <div key={i} className="flex items-start gap-4 p-6 rounded-2xl bg-dark-800/60 border border-gold-500/10 card-hover-effect">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-500/20 to-gold-600/20 flex items-center justify-center shrink-0">
                <f.icon className="w-5 h-5 text-gold-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white mb-1">{f.title}</h3>
                <p className="text-sm text-dark-400">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Platform Support */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-bold text-white text-center mb-12">{t.platforms}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {platformFeatures.map((p, i) => (
            <div key={i} className="text-center p-8 rounded-2xl bg-dark-800/60 border border-gold-500/10 card-hover-effect">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${p.color} flex items-center justify-center mx-auto mb-4`}>
                <p.icon className="w-8 h-8 text-dark-950" />
              </div>
              <h3 className="text-lg font-bold text-white">{p.title}</h3>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center pb-20">
        <Link href={`/${locale}`} className="inline-flex items-center gap-2 text-gold-400 hover:text-gold-300 transition-colors">
          <ArrowLeft className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
          {locale === "ar" ? "العودة إلى الرئيسية" : "Back to Home"}
        </Link>
      </div>
    </div>
  );
}