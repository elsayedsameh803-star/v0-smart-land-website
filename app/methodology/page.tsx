"use client"

import { LanguageProvider } from "@/lib/language-context"
import { AuthProvider } from "@/lib/auth-context"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { WhatsAppButton } from "@/components/whatsapp-button"
import { useLanguage } from "@/lib/language-context"
import { Shield, BarChart3, Eye, Lock, FileText, AlertTriangle, CheckCircle2 } from "lucide-react"

function MethodologyContent() {
  const { language, t } = useLanguage()

  const sections = [
    {
      icon: BarChart3,
      title: t("ما الذي يحلله سمارت لاند؟", "What Does Smart Land Analyze?"),
      content: t(
        "يقوم سمارت لاند بتحليل المواقع الإلكترونية وحسابات وسائل التواصل الاجتماعي المدعومة. يتم جمع الإشارات العامة المتاحة مثل بنية HTML، وسمات SEO، وإعدادات الأمان، وتوافق الجوال، وجودة المحتوى النصي، وأداء التحميل الأساسي. بالنسبة لوسائل التواصل، يتم تحليل الإشارات العامة مثل عدد المتابعين، ومعدل التفاعل، ونمط النشر.",
        "Smart Land analyzes websites and supported social media accounts. It collects publicly available signals such as HTML structure, SEO attributes, security settings, mobile compatibility, text content quality, and basic load performance. For social media, it analyzes public signals like follower count, engagement rate, and posting patterns."
      ),
    },
    {
      icon: Eye,
      title: t("الإشارات المقاسة", "Measured Signals"),
      content: t(
        "البيانات التي يتم قياسها فعلياً تشمل: وجود وسوم HTML الأساسية (Title, Description, Viewport, Canonical)، حالة شهادة SSL/HTTPS، عدد النصوص والصور، وسوم alt للصور، سرعة التحميل التقريبية بناءً على حجم المحتوى، عدد ملفات JavaScript، للمنصات الاجتماعية: المقاييس العامة المتاحة مثل التفاعل والنمو.",
        "Actually measured data includes: presence of essential HTML tags (Title, Description, Viewport, Canonical), SSL/HTTPS certificate status, text and image counts, image alt tags, approximate load speed based on content size, JavaScript file count, for social platforms: publicly available metrics like engagement and growth."
      ),
    },
    {
      icon: AlertTriangle,
      title: t("البيانات المحققة مقابل الاستنتاجات", "Verified Data vs. Inferred Insights"),
      content: t(
        "البيانات المحققة: هي البيانات التي يتم استخراجها مباشرة من HTML الموقع أو من البيانات العامة. مثل وجود title، شهادة SSL، عدد الصور. الاستنتاجات: بعض التوصيات تستند إلى أفضل الممارسات المعروفة في تحسين محركات البحث وتجربة المستخدم، ويتم تصنيفها بوضوح على أنها استنتاجات وليست بيانات مؤكدة.",
        "Verified Data: Data extracted directly from site HTML or public data - e.g., title presence, SSL certificate, image count. Inferred Insights: Some recommendations are based on known best practices in SEO and user experience, and are clearly labeled as insights rather than confirmed data."
      ),
    },
    {
      icon: Shield,
      title: t("كيف تعمل آلية التسجيل؟", "How Does Scoring Work?"),
      content: t(
        "يتم حساب النتيجة الإجمالية بناءً على مجموعة من العوامل الموزونة: عناصر SEO (حتى 25 نقطة)، الأداء (حتى 20 نقطة)، الأمان (حتى 20 نقطة)، إمكانية الوصول (حتى 15 نقطة)، المحتوى (حتى 10 نقاط)، الصحة التقنية (حتى 10 نقاط). كل خصم من النقاط يكون مدعوماً بدليل من التحليل الفعلي. النتيجة النهائية هي مجموع النقاط من 100.",
        "The overall score is calculated from weighted factors: SEO elements (up to 25 pts), Performance (up to 20 pts), Security (up to 20 pts), Accessibility (up to 15 pts), Content (up to 10 pts), Technical Health (up to 10 pts). Every point deduction is supported by evidence from actual analysis. The final score is the sum out of 100."
      ),
    },
    {
      icon: Lock,
      title: t("حدود البيانات", "Data Limitations"),
      content: t(
        "1. يتم تحليل الصفحة الأولى فقط من الموقع (وليس جميع الصفحات). 2. قد لا تتمكن بعض المواقع من تحميل JavaScript بالكامل. 3. يتم تحليل البيانات العامة فقط - لا يتم الوصول إلى لوحات التحكم الخاصة. 4. قد تختلف النتائج لمواقع المحتوى الديناميكي. 5. التحليل يعتمد على البيانات المتاحة في وقت التحليل. 6. بعض التحليلات الاجتماعية تستند إلى بيانات عامة محدودة.",
        "1. Only the first page of a site is analyzed (not all pages). 2. Some sites with heavy JavaScript may not load fully. 3. Only public data is analyzed - no private dashboards are accessed. 4. Results may vary for dynamic content sites. 5. Analysis is based on data available at the time of analysis. 6. Some social analyses are based on limited public data."
      ),
    },
    {
      icon: CheckCircle2,
      title: t("مبادئ الخصوصية", "Privacy Principles"),
      content: t(
        "1. سمارت لاند لا يخزن محتوى الصفحات المحللة. 2. يتم تخزين نتائج التحليل محلياً في متصفح المستخدم فقط. 3. لا يتم مشاركة بيانات التحليل مع أطراف ثالثة. 4. لا يتم تتبع المستخدمين عبر المواقع. 5. يمكن للمستخدم مسح سجل التحليلات الخاص به في أي وقت. 6. يتم استخدام البيانات فقط لغرض تقديم نتائج التحليل.",
        "1. Smart Land does not store analyzed page content. 2. Analysis results are stored locally in the user's browser only. 3. Analysis data is not shared with third parties. 4. Users are not tracked across websites. 5. Users can clear their analysis history at any time. 6. Data is used only for providing analysis results."
      ),
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-400/25 bg-amber-400/10 px-4 py-2 text-sm font-semibold text-amber-300">
            <FileText className="h-4 w-4" />
            {t("المنهجية والشفافية", "Methodology & Transparency")}
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t("كيف يعمل سمارت لاند", "How Smart Land Works")}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            {t(
              "نشرح بشفافية كيف نقوم بتحليل المواقع، وكيف تحتسب النتائج، وما هي حدود البيانات.",
              "We transparently explain how we analyze sites, how scores are calculated, and what data limitations exist."
            )}
          </p>
        </div>

        <div className="space-y-8">
          {sections.map((section, index) => (
            <div
              key={index}
              className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-8"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-amber-400/10">
                  <section.icon className="h-6 w-6 text-amber-400" />
                </div>
                <div>
                  <h2 className="mb-3 text-lg font-semibold text-white">{section.title}</h2>
                  <p className="text-sm leading-7 text-slate-400 whitespace-pre-line">{section.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Scoring details table */}
        <div className="mt-12 rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-8">
          <h2 className="mb-4 text-lg font-semibold text-white">
            {t("جدول توزيع النقاط", "Score Distribution Table")}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400">
                    {t("الفئة", "Category")}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400">
                    {t("الحد الأقصى", "Max Score")}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400">
                    {t("ماذا نقيس؟", "What We Measure")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  { cat: t("تحسين محركات البحث", "SEO"), max: "25", desc: t("وسوم العنوان والوصف، والبنية", "Title, description tags, structure") },
                  { cat: t("الأداء", "Performance"), max: "20", desc: t("سرعة التحميل، عدد السكربتات", "Load speed, script count") },
                  { cat: t("الأمان", "Security"), max: "20", desc: t("HTTPS، شهادة SSL", "HTTPS, SSL certificate") },
                  { cat: t("إمكانية الوصول", "Accessibility"), max: "15", desc: t("توافق الجوال، وسوم alt", "Mobile compatibility, alt tags") },
                  { cat: t("المحتوى", "Content"), max: "10", desc: t("عدد الكلمات، جودة المحتوى", "Word count, content quality") },
                  { cat: t("الصحة التقنية", "Technical Health"), max: "10", desc: t("Canonical، هيكل الموقع", "Canonical, site structure") },
                ].map((row, i) => (
                  <tr key={i} className="border-b border-white/5">
                    <td className="px-4 py-3 text-white">{row.cat}</td>
                    <td className="px-4 py-3 text-amber-400 font-semibold">{row.max}</td>
                    <td className="px-4 py-3 text-slate-400">{row.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function MethodologyPage() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <main className="flex-1">
            <MethodologyContent />
          </main>
          <Footer />
          <WhatsAppButton />
        </div>
      </AuthProvider>
    </LanguageProvider>
  )
}