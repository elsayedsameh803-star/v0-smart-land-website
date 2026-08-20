"use client";

import {
  ShieldCheck,
  Database,
  Scale,
  FileCheck,
  Lock,
  MessageCircle,
} from "lucide-react";

interface TestimonialsSectionProps {
  locale: string;
}

const translations: Record<string, Record<string, string>> = {
  en: {
    badge: "OUR COMMITMENT",
    title: "We Are New — So We Build Trust With Honesty",
    subtitle:
      "No fake reviews, no inflated usage numbers. Here is exactly what you can count on from Smart Land from day one.",
    p1Title: "Verified Sources Only",
    p1Text:
      "Every metric comes from the platform's own public data. When a value cannot be verified, we never guess it.",
    p2Title: "Transparent Limits",
    p2Text:
      "Private or unavailable metrics are shown as Not available — clearly, and never fabricated.",
    p3Title: "Evidence-Based Scores",
    p3Text:
      "Your overall score is computed from the signals we actually measured in your site or profile.",
    p4Title: "Try Before You Pay",
    p4Text:
      "You get free analyses first, so you can judge the real value before paying a single cent.",
    p5Title: "Private & Server-Safe",
    p5Text:
      "Subscription and access decisions are made on the server. Signing up is not required for a basic audit.",
    p6Title: "We Listen to Feedback",
    p6Text:
      "Early users shape our roadmap. Reach out with your ideas and we will respond.",
  },
  ar: {
    badge: "تعهّدنا",
    title: "نحن جدد — لذا نبني الثقة بالصدق",
    subtitle:
      "لا آراء مزيفة ولا أرقام استخدام مبالغ فيها. إليك ما يمكنك الاعتماد عليه من سمارت لاند منذ اليوم الأول.",
    p1Title: "مصادر موثّقة فقط",
    p1Text:
      "كل رقم يأتي من بيانات المنصة العامة نفسها. وعندما يتعذّر التحقق من قيمة، لا نخمّنها أبداً.",
    p2Title: "حدود شفّافة",
    p2Text:
      "المقاييس الخاصة أو غير المتاحة تُعرض بوصفها «غير متاح» — بوضوح، ولا تُختلق أبداً.",
    p3Title: "درجات قائمة على الأدلة",
    p3Text:
      "درجتك الإجمالية محسوبة من الإشارات التي قسنّاها فعلياً في موقعك أو حسابك.",
    p4Title: "جرّب قبل أن تدفع",
    p4Text:
      "تحصل على تحليلات مجانية أولاً، لتقيّم القيمة الحقيقية قبل دفع أي شيء.",
    p5Title: "خصوصية على الخادم",
    p5Text:
      "قرارات الاشتراك والوصول تُتخذ على الخادم، ولا حاجة للتسجيل لعمل تدقيق أساسي.",
    p6Title: "نستمع لملاحظاتك",
    p6Text:
      "المستخدمون الأوائل يرسمون خطّتنا القادمة. تواصل معنا بأفكارك وسنرد عليك.",
  },
};

export function TestimonialsSection({ locale }: TestimonialsSectionProps) {
  const isRtl = locale === "ar";
  const t = translations[locale] || translations.en;

  const pillars = [
    { icon: Database, title: t.p1Title, text: t.p1Text },
    { icon: Scale, title: t.p2Title, text: t.p2Text },
    { icon: ShieldCheck, title: t.p3Title, text: t.p3Text },
    { icon: FileCheck, title: t.p4Title, text: t.p4Text },
    { icon: Lock, title: t.p5Title, text: t.p5Text },
    { icon: MessageCircle, title: t.p6Title, text: t.p6Text },
  ];

  return (
    <section className="relative py-20 md:py-28 bg-dark-950 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gold-500/5 via-transparent to-transparent" />
      <div className="absolute top-20 right-20 w-80 h-80 bg-gold-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-gold-600/5 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/20 mb-6">
            <ShieldCheck className="w-4 h-4 text-gold-400" />
            <span className="text-xs text-gold-400 font-medium uppercase tracking-wider">
              {t.badge}
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            {t.title}
          </h2>
          <p className="text-lg text-dark-400 max-w-2xl mx-auto">
            {t.subtitle}
          </p>
        </div>

        {/* Honest commitment pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pillars.map((pillar, index) => (
            <div
              key={index}
              className="relative p-6 rounded-2xl bg-dark-800/60 border border-gold-500/10 shadow-lg hover:shadow-gold-500/10 transition-all duration-300 hover:-translate-y-2 gold-glow-hover card-hover-effect"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 shrink-0 rounded-xl bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center shadow-lg shadow-gold-500/20">
                  <pillar.icon className="w-6 h-6 text-dark-950" />
                </div>
                <h3 className="text-white font-semibold text-sm text-start">{pillar.title}</h3>
              </div>
              <p
                className="text-dark-300 text-sm leading-relaxed text-start"
                dir={isRtl ? "rtl" : "ltr"}
              >
                {pillar.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}