"use client";

import { Shield, BarChart3, FileSearch, Lock, AlertTriangle, Scale, CheckCircle } from "lucide-react";

interface MethodologySectionProps {
  locale: string;
}

const translations: Record<string, Record<string, string>> = {
  en: {
    badge: "OUR METHODOLOGY",
    title: "Methodology & Trust",
    subtitle: "How Smart Land transparently analyzes and evaluates digital presence",
    tag1: "Analysis",
    tag2: "Metrics",
    tag3: "Accuracy",
    tag4: "Scoring",
    tag5: "Transparency",
    tag6: "Privacy",
    item1Title: "What We Analyze",
    item1Desc: "We examine publicly available signals from your website including HTML structure, HTTP headers, performance metrics, accessibility attributes, and security configurations.",
    item2Title: "Signals Measured",
    item2Desc: "We measure over 100 individual signals across six categories. Each signal is verified where possible through direct observation.",
    item3Title: "Verified vs. Inferred",
    item3Desc: "Where possible, we directly observe and verify data. Some insights are inferred based on established best practices. We clearly label which is which.",
    item4Title: "How Scoring Works",
    item4Desc: "Each category is scored from 0-100 based on positive signal ratio. The overall score is a weighted average. Every deduction is traceable to specific evidence.",
    item5Title: "Data Limitations",
    item5Desc: "We only analyze publicly available data. We cannot access protected pages or internal systems. Results reflect the URL state at time of analysis.",
    item6Title: "Privacy Principles",
    item6Desc: "We only analyze URLs you submit. We don't store personal data. Results are stored securely and can be deleted on request. We don't share your data.",
  },
  ar: {
    badge: "منهجيتنا",
    title: "المنهجية والثقة",
    subtitle: "كيف تقوم سمارت لاند بتحليل وتقييم الحضور الرقمي بشفافية",
    tag1: "تحليل",
    tag2: "قياس",
    tag3: "دقة",
    tag4: "تقييم",
    tag5: "شفافية",
    tag6: "خصوصية",
    item1Title: "ماذا نحلل",
    item1Desc: "نفحص الإشارات العامة المتاحة من موقعك بما في ذلك هيكل HTML، ورؤوس HTTP، ومقاييس الأداء، وسمات إمكانية الوصول، وتكوينات الأمان.",
    item2Title: "الإشارات المقاسة",
    item2Desc: "نقيس أكثر من 100 إشارة فردية عبر ست فئات. يتم التحقق من كل إشارة حيثما أمكن من خلال الملاحظة المباشرة.",
    item3Title: "البيانات المؤكدة مقابل المستنتجة",
    item3Desc: "حيثما أمكن، نراقب ونتحقق من البيانات مباشرة. بعض الرؤى تستنتج بناءً على أفضل الممارسات المعتمدة. نصنف بوضوح كل منهما.",
    item4Title: "كيف تعمل آلية التسجيل",
    item4Desc: "تُسجل كل فئة من 0-100 بناءً على نسبة الإشارات الإيجابية. النتيجة الإجمالية متوسط مرجح. كل خصم يمكن تتبعه إلى دليل محدد.",
    item5Title: "حدود البيانات",
    item5Desc: "نحلل البيانات العامة المتاحة فقط. لا نصل للصفحات المحمية أو الأنظمة الداخلية. النتائج تعبر عن حالة الرابط وقت التحليل.",
    item6Title: "مبادئ الخصوصية",
    item6Desc: "نحلل فقط الروابط التي ترسلها. لا نخزن بيانات شخصية. النتائج مخزنة بأمان ويمكن حذفها عند الطلب. لا نشارك بياناتك مع أطراف ثالثة.",
  },
};

export function MethodologySection({ locale }: MethodologySectionProps) {
  const isRtl = locale === "ar";
  const t = translations[locale] || translations.en;

  const items = [
    {
      icon: FileSearch,
      title: t.item1Title,
      description: t.item1Desc,
      gradient: "from-gold-500 to-gold-600",
      tag: t.tag1,
    },
    {
      icon: BarChart3,
      title: t.item2Title,
      description: t.item2Desc,
      gradient: "from-gold-400 to-gold-600",
      tag: t.tag2,
    },
    {
      icon: Scale,
      title: t.item3Title,
      description: t.item3Desc,
      gradient: "from-gold-500 to-gold-700",
      tag: t.tag3,
    },
    {
      icon: Shield,
      title: t.item4Title,
      description: t.item4Desc,
      gradient: "from-gold-400 to-gold-500",
      tag: t.tag4,
    },
    {
      icon: AlertTriangle,
      title: t.item5Title,
      description: t.item5Desc,
      gradient: "from-gold-500 to-gold-600",
      tag: t.tag5,
    },
    {
      icon: Lock,
      title: t.item6Title,
      description: t.item6Desc,
      gradient: "from-gold-400 to-gold-500",
      tag: t.tag6,
    },
  ];

  return (
    <section className="relative py-20 md:py-28 bg-dark-950 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gold-500/5 via-transparent to-transparent" />
      <div className="absolute top-20 right-20 w-80 h-80 bg-gold-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-20 w-64 h-64 bg-gold-600/5 rounded-full blur-3xl" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/20 mb-6">
            <CheckCircle className="w-3.5 h-3.5 text-gold-400" />
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

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, index) => (
            <div
              key={index}
              className="group relative p-6 md:p-8 rounded-2xl bg-dark-800/60 border border-gold-500/10 hover:bg-dark-800/80 hover:border-gold-500/30 transition-all duration-300 gold-glow-hover card-hover-effect overflow-hidden"
            >
              {/* Hover gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-gold-500/0 via-gold-500/0 to-gold-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              
              {/* Content */}
              <div className="relative">
                {/* Tag */}
                <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-gold-500/10 text-gold-400 border border-gold-500/20 mb-4">
                  {item.tag}
                </span>

                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-4 shadow-lg shadow-gold-500/20 group-hover:scale-110 transition-transform duration-300`}>
                  <item.icon className="w-6 h-6 text-dark-950" />
                </div>
                <h3 className="text-lg font-semibold text-gold-300 mb-3 group-hover:text-gold-200 transition-colors duration-200">{item.title}</h3>
                <p className="text-sm text-dark-400 leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}