"use client";

import { Shield, BarChart3, FileSearch, Lock, AlertTriangle, Scale } from "lucide-react";

interface MethodologySectionProps {
  locale: string;
}

export function MethodologySection({ locale }: MethodologySectionProps) {
  const isRtl = locale === "ar";

  const items = [
    {
      icon: FileSearch,
      title: isRtl ? "ماذا نحلل" : "What We Analyze",
      description: isRtl
        ? "نفحص الإشارات العامة المتاحة من موقعك بما في ذلك هيكل HTML، ورؤوس HTTP، ومقاييس الأداء، وسمات إمكانية الوصول، وتكوينات الأمان."
        : "We examine publicly available signals from your website including HTML structure, HTTP headers, performance metrics, accessibility attributes, and security configurations.",
      gradient: "from-gold-500 to-gold-600",
    },
    {
      icon: BarChart3,
      title: isRtl ? "الإشارات المقاسة" : "Signals Measured",
      description: isRtl
        ? "نقيس أكثر من 100 إشارة فردية عبر ست فئات. يتم التحقق من كل إشارة حيثما أمكن من خلال الملاحظة المباشرة."
        : "We measure over 100 individual signals across six categories. Each signal is verified where possible through direct observation.",
      gradient: "from-gold-400 to-gold-600",
    },
    {
      icon: Scale,
      title: isRtl ? "البيانات المؤكدة مقابل المستنتجة" : "Verified vs. Inferred",
      description: isRtl
        ? "حيثما أمكن، نراقب ونتحقق من البيانات مباشرة. بعض الرؤى تستنتج بناءً على أفضل الممارسات المعتمدة. نصنف بوضوح كل منهما."
        : "Where possible, we directly observe and verify data. Some insights are inferred based on established best practices. We clearly label which is which.",
      gradient: "from-gold-500 to-gold-700",
    },
    {
      icon: Shield,
      title: isRtl ? "كيف تعمل آلية التسجيل" : "How Scoring Works",
      description: isRtl
        ? "تُسجل كل فئة من 0-100 بناءً على نسبة الإشارات الإيجابية. النتيجة الإجمالية متوسط مرجح. كل خصم يمكن تتبعه إلى دليل محدد."
        : "Each category is scored from 0-100 based on positive signal ratio. The overall score is a weighted average. Every deduction is traceable to specific evidence.",
      gradient: "from-gold-400 to-gold-500",
    },
    {
      icon: AlertTriangle,
      title: isRtl ? "حدود البيانات" : "Data Limitations",
      description: isRtl
        ? "نحلل البيانات العامة المتاحة فقط. لا نصل للصفحات المحمية أو الأنظمة الداخلية. النتائج تعبر عن حالة الرابط وقت التحليل."
        : "We only analyze publicly available data. We cannot access protected pages or internal systems. Results reflect the URL state at time of analysis.",
      gradient: "from-gold-500 to-gold-600",
    },
    {
      icon: Lock,
      title: isRtl ? "مبادئ الخصوصية" : "Privacy Principles",
      description: isRtl
        ? "نحلل فقط الروابط التي ترسلها. لا نخزن بيانات شخصية. النتائج مخزنة بأمان ويمكن حذفها عند الطلب. لا نشارك بياناتك مع أطراف ثالثة."
        : "We only analyze URLs you submit. We don't store personal data. Results are stored securely and can be deleted on request. We don't share your data.",
      gradient: "from-gold-400 to-gold-500",
    },
  ];

  return (
    <section className="relative py-20 bg-dark-950">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gold-500/5 via-transparent to-transparent" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            {isRtl ? "المنهجية والثقة" : "Methodology & Trust"}
          </h2>
          <p className="text-lg text-dark-400 max-w-2xl mx-auto">
            {isRtl
              ? "كيف تقوم سمارت لاند بتحليل وتقييم الحضور الرقمي بشفافية"
              : "How Smart Land transparently analyzes and evaluates digital presence"}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, index) => (
            <div
              key={index}
              className="group p-6 rounded-2xl bg-dark-800/60 border border-gold-500/10 hover:bg-dark-800/80 hover:border-gold-500/30 transition-all duration-300 gold-glow-hover"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-4 shadow-lg shadow-gold-500/20`}>
                <item.icon className="w-6 h-6 text-dark-950" />
              </div>
              <h3 className="text-lg font-semibold text-gold-300 mb-3">{item.title}</h3>
              <p className="text-sm text-dark-400 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}