"use client";

import { Search, Brain, Target, Wrench, TrendingUp, ChevronRight } from "lucide-react";

interface OnboardingStepsProps {
  locale: string;
}

export function OnboardingSteps({ locale }: OnboardingStepsProps) {
  const isRtl = locale === "ar";

  const steps = [
    {
      icon: Search,
      title: isRtl ? "أرسل الرابط" : "Submit your link",
      description: isRtl ? "أدخل أي رابط موقع عام لبدء التحليل." : "Enter any public website URL to begin the analysis.",
      gradient: "from-gold-500 to-gold-600",
      stats: isRtl ? "الخطوة ١" : "Step 1",
    },
    {
      icon: Brain,
      title: isRtl ? "سمارت لاند تحلل البيانات" : "Smart Land analyzes real data",
      description: isRtl ? "يقوم الذكاء الاصطناعي لدينا بفحص الإشارات العامة المتاحة عبر أبعاد متعددة." : "Our AI examines available public signals across multiple dimensions.",
      gradient: "from-gold-400 to-gold-600",
      stats: isRtl ? "الخطوة ٢" : "Step 2",
    },
    {
      icon: Target,
      title: isRtl ? "اكتشف نقاط القوة والضعف" : "Discover strengths & weaknesses",
      description: isRtl ? "احصل على تحليل شفاف مع أدلة لكل نتيجة." : "Get a transparent breakdown with evidence for every finding.",
      gradient: "from-gold-500 to-gold-700",
      stats: isRtl ? "الخطوة ٣" : "Step 3",
    },
    {
      icon: Wrench,
      title: isRtl ? "افهم كيفية إصلاح المشكلات" : "Understand how to fix problems",
      description: isRtl ? "احصل على توصيات إصلاح قابلة للتنفيذ مع أمثلة تقنية." : "Receive actionable fix recommendations with technical examples.",
      gradient: "from-gold-400 to-gold-500",
      stats: isRtl ? "الخطوة ٤" : "Step 4",
    },
    {
      icon: TrendingUp,
      title: isRtl ? "أعد التحليل وقياس التحسن" : "Re-analyze & measure improvement",
      description: isRtl ? "تتبع تقدمك بمرور الوقت مع مقارنات قبل/بعد." : "Track your progress over time with before/after comparisons.",
      gradient: "from-gold-500 to-gold-600",
      stats: isRtl ? "الخطوة ٥" : "Step 5",
    },
  ];

  return (
    <section className="relative py-20 md:py-28 bg-dark-900 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-gold-500/8 via-transparent to-transparent" />
      <div className="absolute top-10 left-10 w-72 h-72 bg-gold-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-gold-600/5 rounded-full blur-3xl" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/20 mb-6">
            <span className="w-2 h-2 rounded-full bg-gold-500 animate-ping-slow" />
            <span className="text-xs text-gold-400 font-medium uppercase tracking-wider">
              {isRtl ? "كيفية العمل" : "HOW IT WORKS"}
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            {isRtl ? "كيف تعمل سمارت لاند" : "How Smart Land Works"}
          </h2>
          <p className="text-lg text-dark-400 max-w-2xl mx-auto">
            {isRtl
              ? "خمس خطوات بسيطة لتحليل وتحسين حضورك الرقمي"
              : "Five simple steps to analyze and improve your digital presence"}
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {steps.map((step, index) => (
            <div key={index} className="relative group">
              {/* Connection line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-[60%] w-[80%] h-px bg-gradient-to-r from-gold-500/30 to-transparent">
                  <span className="absolute right-0 top-1/2 -translate-y-1/2">
                    <ChevronRight className="w-4 h-4 text-gold-500/30" />
                  </span>
                </div>
              )}
              
              <div className="relative flex flex-col items-center text-center p-6 md:p-8 rounded-2xl bg-dark-800/60 border border-gold-500/10 shadow-lg hover:shadow-gold-500/10 transition-all duration-300 hover:-translate-y-2 gold-glow-hover card-hover-effect">
                {/* Step Number with glow */}
                <div className="absolute -top-3 -right-3 w-9 h-9 rounded-full bg-gradient-to-br from-gold-500 to-gold-600 text-dark-950 text-sm font-bold flex items-center justify-center shadow-lg shadow-gold-500/25 group-hover:scale-110 transition-transform duration-300">
                  {index + 1}
                </div>

                {/* Step label */}
                <span className="text-xs text-gold-500/60 font-medium uppercase tracking-wider mb-3">
                  {step.stats}
                </span>

                {/* Icon */}
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center mb-4 shadow-lg shadow-gold-500/20 group-hover:scale-110 transition-transform duration-300`}>
                  <step.icon className="w-7 h-7 text-dark-950" />
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold text-gold-300 mb-2 group-hover:text-gold-200 transition-colors duration-200">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-dark-400 leading-relaxed">
                  {step.description}
                </p>

                {/* Hover gradient overlay */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-gold-500/0 via-gold-500/0 to-gold-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}