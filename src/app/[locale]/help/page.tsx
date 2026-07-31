"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { HelpCircle, BookOpen, MessageCircle, Mail, Search, ArrowLeft, FileText, Video, Globe, Zap, Shield, BarChart3, Download, Share2, Users, Smartphone } from "lucide-react";
import Link from "next/link";
import { COMPANY_INFO } from "@/lib/constants";

const translations: Record<string, Record<string, string>> = {
  en: {
    title: "Help Center",
    subtitle: "Everything you need to get the most out of Smart Land",
    searchPlaceholder: "Search help articles...",
    gettingStarted: "Getting Started",
    gettingStartedDesc: "Learn how to use Smart Land for the first time",
    analysis: "Understanding Analysis",
    analysisDesc: "How our analysis works and what the scores mean",
    features: "Features Guide",
    featuresDesc: "Detailed guides for each feature",
    troubleshooting: "Troubleshooting",
    troubleshootingDesc: "Common issues and how to resolve them",
    faq: "Frequently Asked Questions",
    faqDesc: "Quick answers to common questions",
    contact: "Still need help?",
    contactDesc: "Our support team is ready to assist you",
    contactUs: "Contact Us",
    visitFaq: "Visit FAQ",
    backHome: "Back to Home",
    articles_start: "How to Start an Analysis",
    articles_startContent: "Go to the homepage, enter your website URL or social media profile link in the input field, select the platform type (Website, YouTube, etc.), and click 'Analyze'. Smart Land will fetch real data from your URL and provide a comprehensive analysis across multiple categories.",
    articles_scores: "Understanding Your Scores",
    articles_scoresContent: "Each category is scored from 0-100. The overall Smart Score is a weighted average of all categories. Scores above 80 are excellent, 60-80 are good, 40-60 are average, 20-40 are poor, and below 20 is critical. Every score is backed by specific evidence found during analysis.",
    articles_history: "Using Analysis History",
    articles_historyContent: "Smart Land automatically saves your analysis history. You can view past analyses, compare scores over time, and re-analyze URLs to track improvements. Access your history from the Dashboard or Projects page.",
    articles_report: "Generating PDF Reports",
    articles_reportContent: "After analysis, click 'Download PDF' to generate a professional audit report. The report includes all findings, evidence, scores, and recommendations. Perfect for sharing with clients or stakeholders.",
    articles_compare: "Comparing with Competitors",
    articles_compareContent: "Use the Competitor Comparison feature to analyze two URLs side-by-side. Enter your URL and a competitor's URL to see how they compare across all categories. This helps you understand your market position.",
    articles_fix: "Using the Fix Assistant",
    articles_fixContent: "For each finding, click 'Help Me Fix This' to open the AI Fix Assistant. It provides step-by-step instructions, code examples, and expected outcomes to help you resolve issues.",
    articles_pwa: "Installing as an App",
    articles_pwaContent: "Smart Land can be installed as a Progressive Web App (PWA) on your device. Look for the install prompt or use your browser's 'Add to Home Screen' option. This allows you to access your analysis history even offline.",
  },
  ar: {
    title: "مركز المساعدة",
    subtitle: "كل ما تحتاجه لتحقيق أقصى استفادة من سمارت لاند",
    searchPlaceholder: "ابحث في مقالات المساعدة...",
    gettingStarted: "بدء الاستخدام",
    gettingStartedDesc: "تعلم كيفية استخدام سمارت لاند لأول مرة",
    analysis: "فهم التحليل",
    analysisDesc: "كيف يعمل تحليلنا وماذا تعني النتائج",
    features: "دليل المميزات",
    featuresDesc: "أدلة مفصلة لكل ميزة",
    troubleshooting: "استكشاف الأخطاء وإصلاحها",
    troubleshootingDesc: "المشكلات الشائعة وكيفية حلها",
    faq: "الأسئلة الشائعة",
    faqDesc: "إجابات سريعة للأسئلة الشائعة",
    contact: "ما زلت بحاجة للمساعدة؟",
    contactDesc: "فريق الدعم لدينا جاهز لمساعدتك",
    contactUs: "اتصل بنا",
    visitFaq: "زيارة الأسئلة الشائعة",
    backHome: "العودة إلى الرئيسية",
    articles_start: "كيف تبدأ التحليل",
    articles_startContent: "اذهب إلى الصفحة الرئيسية، أدخل رابط موقعك الإلكتروني أو رابط صفحة التواصل الاجتماعي في حقل الإدخال، اختر نوع المنصة (موقع إلكتروني، يوتيوب، إلخ)، وانقر على 'حلل'. ستقوم سمارت لاند بجلب البيانات الفعلية من رابطك وتقديم تحليل شامل عبر فئات متعددة.",
    articles_scores: "فهم نتائجك",
    articles_scoresContent: "يتم تسجيل كل فئة من 0-100. النتيجة الذكية الإجمالية هي متوسط مرجح لجميع الفئات. النتائج فوق 80 ممتازة، 60-80 جيدة، 40-60 متوسطة، 20-40 ضعيفة، وأقل من 20 حرجة. كل نتيجة مدعومة بأدلة محددة تم العثور عليها أثناء التحليل.",
    articles_history: "استخدام سجل التحليلات",
    articles_historyContent: "تحفظ سمارت لاند تلقائياً سجل تحليلاتك. يمكنك عرض التحليلات السابقة، مقارنة النتائج بمرور الوقت، وإعادة تحليل الروابط لتتبع التحسينات. يمكنك الوصول إلى سجلك من لوحة التحكم أو صفحة المشاريع.",
    articles_report: "إنشاء تقارير PDF",
    articles_reportContent: "بعد التحليل، انقر على 'تحميل PDF' لإنشاء تقرير تدقيق احترافي. يتضمن التقرير جميع النتائج والأدلة والنتائج والتوصيات. مثالي للمشاركة مع العملاء أو أصحاب المصلحة.",
    articles_compare: "المقارنة مع المنافسين",
    articles_compareContent: "استخدم ميزة مقارنة المنافسين لتحليل رابطين جنباً إلى جنب. أدخل رابطك ورابط المنافس لترى كيف يقارنان عبر جميع الفئات. يساعدك هذا على فهم موقعك في السوق.",
    articles_fix: "استخدام مساعد الإصلاح",
    articles_fixContent: "لكل نتيجة، انقر على 'ساعدني في الإصلاح' لفتح مساعد الإصلاح بالذكاء الاصطناعي. يقدم تعليمات خطوة بخطوة وأمثلة برمجية والنتائج المتوقعة لمساعدتك في حل المشكلات.",
    articles_pwa: "التثبيت كتطبيق",
    articles_pwaContent: "يمكن تثبيت سمارت لاند كتطبيق ويب تقدمي (PWA) على جهازك. ابحث عن مطالبة التثبيت أو استخدم خيار 'إضافة إلى الشاشة الرئيسية' في متصفحك. يتيح لك ذلك الوصول إلى سجل تحليلاتك حتى بدون اتصال بالإنترنت.",
  },
};

export default function HelpPage({ params }: { params: { locale: string } }) {
  const locale = params.locale;
  const isRtl = locale === "ar";
  const t = translations[locale] || translations.en;
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    { icon: Zap, title: t.gettingStarted, desc: t.gettingStartedDesc, article: "start" },
    { icon: BarChart3, title: t.analysis, desc: t.analysisDesc, article: "scores" },
    { icon: BookOpen, title: t.features, desc: t.featuresDesc, article: "report" },
    { icon: Shield, title: t.troubleshooting, desc: t.troubleshootingDesc, article: "fix" },
  ];

  const articleKeys = ["start", "scores", "history", "report", "compare", "fix", "pwa"];

  return (
    <div className="min-h-screen bg-dark-950" dir={isRtl ? "rtl" : "ltr"}>
      <div className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gold-500/5 via-transparent to-transparent" />
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center mx-auto mb-6">
            <HelpCircle className="w-8 h-8 text-dark-950" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">{t.title}</h1>
          <p className="text-xl text-dark-300 mb-8">{t.subtitle}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {categories.map((cat, i) => (
            <div key={i} className="p-6 rounded-2xl bg-dark-800/60 border border-gold-500/10 card-hover-effect">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold-500/20 to-gold-600/20 flex items-center justify-center mb-4">
                <cat.icon className="w-6 h-6 text-gold-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{cat.title}</h3>
              <p className="text-sm text-dark-400">{cat.desc}</p>
            </div>
          ))}
        </div>

        {/* Articles */}
        <div className="space-y-4 mb-16">
          {articleKeys.map((key) => {
            const titleKey = `articles_${key}` as keyof typeof t;
            const contentKey = `articles_${key}Content` as keyof typeof t;
            const title = t[titleKey];
            const content = t[contentKey];
            if (!title || !content) return null;
            return (
              <div key={key} className="p-6 rounded-2xl bg-dark-800/60 border border-gold-500/10">
                <h3 className="text-lg font-bold text-white mb-3">{title}</h3>
                <p className="text-dark-300 leading-relaxed">{content}</p>
              </div>
            );
          })}
        </div>

        {/* FAQ Link */}
        <div className="p-6 rounded-2xl bg-dark-800/60 border border-gold-500/10 mb-8 text-center">
          <FileText className="w-8 h-8 text-gold-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-2">{t.faq}</h3>
          <p className="text-dark-400 mb-4">{t.faqDesc}</p>
          <Link href={`/${locale}/faq`} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-gold-600 to-gold-500 text-dark-950 font-bold hover:from-gold-500 hover:to-gold-400 transition-all">
            {t.visitFaq}
          </Link>
        </div>

        {/* Contact */}
        <div className="p-8 rounded-2xl bg-dark-800/60 border border-gold-500/10 text-center">
          <MessageCircle className="w-10 h-10 text-gold-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">{t.contact}</h3>
          <p className="text-dark-400 mb-6">{t.contactDesc}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href={`/${locale}/contact`} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-gold-600 to-gold-500 text-dark-950 font-bold hover:from-gold-500 hover:to-gold-400 transition-all">
              <Mail className="w-4 h-4" />
              {t.contactUs}
            </Link>
            <a href={`https://wa.me/${COMPANY_INFO.whatsapp}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold hover:bg-emerald-500/20 transition-all">
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </a>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link href={`/${locale}`} className="inline-flex items-center gap-2 text-gold-400 hover:text-gold-300 transition-colors">
            <ArrowLeft className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
            {t.backHome}
          </Link>
        </div>
      </div>
    </div>
  );
}