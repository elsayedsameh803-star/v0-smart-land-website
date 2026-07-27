"use client";

import { Shield, BarChart3, FileSearch, Lock, AlertTriangle, Scale, CheckCircle } from "lucide-react";

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
      tag: isRtl ? "تحليل" : "Analysis",
    },
    {
      icon: BarChart3,
      title: isRtl ? "الإشارات المقاسة" : "Signals Measured",
      description: isRtl
        ? "نقيس أكثر من 100 إشارة فردية عبر ست فئات. يتم التحقق من كل إشارة حيثما أمكن من خلال الملاحظة المباشرة."
        : "We measure over 100 individual signals across six categories. Each signal is verified where possible through direct observation.",
      gradient: "from-gold-400 to-gold-600",
      tag: isRtl ? "قياس" : "Metrics",
    },
    {
      icon: Scale,
      title: isRtl ? "البيانات المؤكدة مقابل المستنتجة" : "Verified vs. Inferred",
      description: isRtl
        ? "حيثما أمكن، نراقب ونتحقق من البيانات مباشرة. بعض الرؤى تستنتج بناءً على أفضل الممارسات المعتمدة. نصنف بوضوح كل منهما."
        : "Where possible, we directly observe and verify data. Some insights are inferred based on established best practices. We clearly label which is which.",
      gradient: "from-gold-500 to-gold-700",
      tag: isRtl ? "دقة" : "Accuracy",
    },
    {
      icon: Shield,
      title: isRtl ? "كيف تعمل آلية التسجيل" : "How Scoring Works",
      description: isRtl
        ? "تُسجل كل فئة من 0-100 بناءً على نسبة الإشارات الإيجابية. النتيجة الإجمالية متوسط مرجح. كل خصم يمكن تتبعه إلى دليل محدد."
        : "Each category is scored from 0-100 based on positive signal ratio. The overall score is a weighted average. Every deduction is traceable to specific evidence.",
      gradient: "from-gold-400 to-gold-500",
      tag: isRtl ? "تقييم" : "Scoring",
    },
    {
      icon: AlertTriangle,
      title: isRtl ? "حدود البيانات" : "Data Limitations",
      description: isRtl
        ? "نحلل البيانات العامة المتاحة فقط. لا نصل للصفحات المحمية أو الأنظمة الداخلية. النتائج تعبر عن حالة الرابط وقت التحليل."
        : "We only analyze publicly available data. We cannot access protected pages or internal systems. Results reflect the URL state at time of analysis.",
      gradient: "from-gold-500 to-gold-600",
      tag: isRtl ? "شفافية" : "Transparency",
    },
    {
      icon: Lock,
      title: isRtl ? "مبادئ الخصوصية" : "Privacy Principles",
      description: isRtl
        ? "نحلل فقط الروابط التي ترسلها. لا نخزن بيانات شخصية. النتائج مخزنة بأمان ويمكن حذفها عند الطلب. لا نشارك بياناتك مع أطراف ثالثة."
        : "We only analyze URLs you submit. We don't store personal data. Results are stored securely and can be deleted on request. We don't share your data.",
      gradient: "from-gold-400 to-gold-500",
      tag: isRtl ? "خصوصية" : "Privacy",
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
              {isRtl ? "منهجيتنا" : "OUR METHODOLOGY"}
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            {isRtl ? "المنهجية والثقة" : "Methodology & Trust"}
          </h2>
          <p className="text-lg text-dark-400 max-w-2xl mx-auto">
            {isRtl
              ? "كيف تقوم سمارت لاند بتحليل وتقييم الحضور الرقمي بشفافية"
              : "How Smart Land transparently analyzes and evaluates digital presence"}
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