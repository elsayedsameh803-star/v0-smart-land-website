"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { HelpCircle, ChevronDown, Search, MessageCircle, Mail, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { COMPANY_INFO } from "@/lib/constants";

const faqs = {
  en: [
    { q: "What is Smart Land?", a: "Smart Land is an AI-powered digital audit platform that analyzes websites and social media profiles. It examines publicly available data across multiple dimensions including SEO, performance, accessibility, security, content quality, and technical infrastructure." },
    { q: "How does Smart Land analyze my website?", a: "When you submit a URL, Smart Land fetches the actual page and analyzes real data from the HTML, HTTP headers, and other publicly available signals. It scores six categories (SEO, Performance, Accessibility, Security, Content, Technical) based on professional standards and provides evidence-based recommendations." },
    { q: "Is Smart Land free to use?", a: "Smart Land offers free basic analysis for websites and social media profiles. Our platform is designed to be accessible to everyone. Premium features with advanced analytics and scheduled monitoring may be available in the future." },
    { q: "What types of URLs can I analyze?", a: "You can analyze public websites, YouTube videos and channels, and social media profiles. The platform currently supports public websites, YouTube, and we are expanding to support more platforms including Facebook, Instagram, TikTok, and LinkedIn." },
    { q: "How accurate is the analysis?", a: "Smart Land analyzes real, publicly available data from each submitted URL. The accuracy depends on the quality and availability of data at the time of analysis. We clearly label what we can verify directly versus what we infer based on best practices." },
    { q: "Do you store my data?", a: "Analysis results are stored locally on your device using localStorage. We do not store your analysis results on our servers. Contact form submissions are retained for service purposes only. See our Privacy Policy for full details." },
    { q: "Can I compare my site with competitors?", a: "Yes! Smart Land includes a competitor comparison feature that allows you to analyze two URLs side-by-side and compare their scores across all categories." },
    { q: "How do I track my progress over time?", a: "Smart Land automatically saves your analysis history. You can re-analyze the same URL later and see how your scores have changed. The dashboard shows score trends and before/after comparisons." },
    { q: "What is the Smart Score?", a: "The Smart Score is an overall score from 0-100 that represents the health of your digital presence. It is calculated as a weighted average of scores across six categories: SEO, Performance, Accessibility, Security, Content, and Technical." },
    { q: "How can I get help or support?", a: "You can contact us via email at elsayedsameh803@gmail.com, WhatsApp at 01272097150, or through our contact form. We typically respond within 24 hours." },
  ],
  ar: [
    { q: "ما هي سمارت لاند؟", a: "سمارت لاند هي منصة تدقيق رقمي مدعومة بالذكاء الاصطناعي تحلل المواقع الإلكترونية وحسابات التواصل الاجتماعي. تفحص البيانات المتاحة للعموم عبر أبعاد متعددة بما في ذلك تحسين محركات البحث والأداء وإمكانية الوصول والأمان وجودة المحتوى والبنية التحتية التقنية." },
    { q: "كيف تقوم سمارت لاند بتحليل موقعي؟", a: "عند إرسال رابط، تقوم سمارت لاند بجلب الصفحة الفعلية وتحليل البيانات الحقيقية من HTML ورؤوس HTTP والإشارات العامة الأخرى. تسجل ست فئات (SEO، الأداء، إمكانية الوصول، الأمان، المحتوى، التقنية) بناءً على المعايير المهنية وتقدم توصيات مبنية على الأدلة." },
    { q: "هل سمارت لاند مجانية؟", a: "تقدم سمارت لاند تحليلاً أساسياً مجانياً للمواقع الإلكترونية وحسابات التواصل الاجتماعي. منصتنا مصممة لتكون في متناول الجميع. قد تكون الميزات المميزة مع التحليلات المتقدمة والمراقبة المجدولة متاحة في المستقبل." },
    { q: "ما أنواع الروابط التي يمكنني تحليلها؟", a: "يمكنك تحليل المواقع العامة وفيديوهات يوتيوب والقنوات وحسابات التواصل الاجتماعي. تدعم المنصة حالياً المواقع العامة ويوتيوب، ونحن نوسع الدعم ليشمل المزيد من المنصات مثل فيسبوك وإنستغرام وتيك توك ولينكد إن." },
    { q: "ما مدى دقة التحليل؟", a: "تحلل سمارت لاند البيانات الحقيقية المتاحة للعموم من كل رابط يتم إرساله. تعتمد الدقة على جودة وتوفر البيانات وقت التحليل. نحن نصنف بوضوح ما يمكننا التحقق منه مباشرة مقابل ما نستنتجه بناءً على أفضل الممارسات." },
    { q: "هل تخزنون بياناتي؟", a: "يتم تخزين نتائج التحليل محلياً على جهازك باستخدام localStorage. لا نخزن نتائج التحليل على خوادمنا. يتم الاحتفاظ بإرسالات نموذج الاتصال لأغراض الخدمة فقط. راجع سياسة الخصوصية للحصول على التفاصيل الكاملة." },
    { q: "هل يمكنني مقارنة موقعي مع المنافسين؟", a: "نعم! تتضمن سمارت لاند ميزة مقارنة المنافسين التي تسمح لك بتحليل رابطين جنباً إلى جنب ومقارنة نتائجهم عبر جميع الفئات." },
    { q: "كيف أتتبع تقدمي بمرور الوقت؟", a: "تحفظ سمارت لاند تلقائياً سجل تحليلاتك. يمكنك إعادة تحليل نفس الرابط لاحقاً ورؤية كيف تغيرت نتائجك. تظهر لوحة التحكم اتجاهات النتائج والمقارنات قبل/بعد." },
    { q: "ما هي النتيجة الذكية (Smart Score)؟", a: "النتيجة الذكية هي نتيجة إجمالية من 0-100 تمثل صحة حضورك الرقمي. يتم حسابها كمتوسط مرجح للنتائج عبر ست فئات: SEO، الأداء، إمكانية الوصول، الأمان، المحتوى، والتقنية." },
    { q: "كيف يمكنني الحصول على المساعدة أو الدعم؟", a: "يمكنك الاتصال بنا عبر البريد الإلكتروني على elsayedsameh803@gmail.com، أو واتساب على 01272097150، أو من خلال نموذج الاتصال الخاص بنا. نرد عادةً خلال 24 ساعة." },
  ],
};

export default function FAQPage({ params }: { params: { locale: string } }) {
  const locale = params.locale;
  const isRtl = locale === "ar";
  const t = locale === "ar" ? "ar" : "en";
  const [searchQuery, setSearchQuery] = useState("");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const items = faqs[t] || faqs.en;
  const filtered = items.filter(item =>
    item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-dark-950" dir={isRtl ? "rtl" : "ltr"}>
      <div className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gold-500/5 via-transparent to-transparent" />
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center mx-auto mb-6">
            <HelpCircle className="w-8 h-8 text-dark-950" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            {locale === "ar" ? "الأسئلة الشائعة" : "Frequently Asked Questions"}
          </h1>
          <p className="text-xl text-dark-300 mb-8">
            {locale === "ar" ? "أجوبة على الأسئلة الأكثر شيوعاً حول سمارت لاند" : "Answers to the most common questions about Smart Land"}
          </p>
          
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={locale === "ar" ? "ابحث في الأسئلة..." : "Search questions..."}
              className="w-full pl-12 pr-4 py-4 rounded-xl bg-dark-800/80 border border-gold-500/20 text-white placeholder-dark-400 focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/30 transition-all"
              dir={isRtl ? "rtl" : "ltr"}
            />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-dark-400">{locale === "ar" ? "لا توجد نتائج للبحث" : "No results found"}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((item, i) => (
              <div key={i} className="rounded-2xl bg-dark-800/60 border border-gold-500/10 overflow-hidden transition-all">
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-gold-500/5 transition-colors"
                >
                  <span className="text-white font-medium pr-4">{item.q}</span>
                  <ChevronDown className={`w-5 h-5 text-gold-400 transition-transform duration-200 ${openIndex === i ? 'rotate-180' : ''}`} />
                </button>
                {openIndex === i && (
                  <div className="px-5 pb-5">
                    <div className="h-px bg-gradient-to-r from-gold-500/20 via-gold-500/10 to-transparent mb-4" />
                    <p className="text-dark-300 leading-relaxed">{item.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 p-8 rounded-2xl bg-dark-800/60 border border-gold-500/10 text-center">
          <MessageCircle className="w-10 h-10 text-gold-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">
            {locale === "ar" ? "لم تجد ما تبحث عنه؟" : "Still have questions?"}
          </h3>
          <p className="text-dark-400 mb-6">
            {locale === "ar" ? "نحن هنا لمساعدتك. تواصل معنا مباشرة." : "We're here to help. Reach out to us directly."}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href={`mailto:${COMPANY_INFO.email}`} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-gold-600 to-gold-500 text-dark-950 font-bold hover:from-gold-500 hover:to-gold-400 transition-all">
              <Mail className="w-4 h-4" />
              {locale === "ar" ? "راسلنا عبر البريد" : "Email Us"}
            </a>
            <a href={`https://wa.me/${COMPANY_INFO.whatsapp}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold hover:bg-emerald-500/20 transition-all">
              <MessageCircle className="w-4 h-4" />
              {locale === "ar" ? "تواصل عبر واتساب" : "WhatsApp"}
            </a>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link href={`/${locale}`} className="inline-flex items-center gap-2 text-gold-400 hover:text-gold-300 transition-colors">
            <ArrowLeft className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
            {locale === "ar" ? "العودة إلى الرئيسية" : "Back to Home"}
          </Link>
        </div>
      </div>
    </div>
  );
}