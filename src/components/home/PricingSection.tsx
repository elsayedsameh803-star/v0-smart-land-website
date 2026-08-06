"use client";

import { Check, Sparkles, Zap, ArrowRight } from "lucide-react";

interface PricingSectionProps {
  locale: string;
}

const translations: Record<string, Record<string, string | string[]>> = {
  en: {
    badge: "PRICING",
    title: "Simple, Transparent Pricing",
    subtitle: "Choose the plan that fits your needs. No hidden fees, cancel anytime.",
    free: "Free",
    freePrice: "$0",
    freePeriod: "/forever",
    freeDesc: "Perfect for trying Smart Land",
    freeFeatures: ["5 analyses per month", "Website analysis", "Basic score breakdown", "PDF report", "Email support"],
    pro: "Pro",
    proPrice: "$19",
    proPeriod: "/month",
    proDesc: "For professionals and growing teams",
    proFeatures: ["Unlimited analyses", "All platforms (7+)", "Advanced insights & recommendations", "Competitor comparison", "Analysis history & tracking", "Priority email support"],
    enterprise: "Enterprise",
    enterprisePrice: "Custom",
    enterprisePeriod: "",
    enterpriseDesc: "For agencies and large organizations",
    enterpriseFeatures: ["Unlimited everything", "API access", "White-label reports", "Dedicated account manager", "Custom integrations", "SLA & priority support"],
    popular: "Most Popular",
    getStarted: "Get Started",
    contactUs: "Contact Us",
    freeCta: "Start Free",
    proCta: "Go Pro",
    enterpriseCta: "Talk to Sales",
    moneyBack: "30-day money-back guarantee",
  },
  ar: {
    badge: "الأسعار",
    title: "أسعار بسيطة وشفافة",
    subtitle: "اختر الخطة التي تناسب احتياجاتك. لا رسوم خفية، يمكنك الإلغاء في أي وقت.",
    free: "مجاني",
    freePrice: "$0",
    freePeriod: "/للأبد",
    freeDesc: "مثالي لتجربة سمارت لاند",
    freeFeatures: ["5 تحليلات شهرياً", "تحليل المواقع", "تفصيل الدرجات الأساسي", "تقرير PDF", "دعم عبر البريد"],
    pro: "احترافي",
    proPrice: "$19",
    proPeriod: "/شهرياً",
    proDesc: "للمحترفين والفرق المتنامية",
    proFeatures: ["تحليلات غير محدودة", "جميع المنصات (7+)", "رؤى وتوصيات متقدمة", "مقارنة المنافسين", "سجل وتتبع التحليلات", "دعم بريدي ذو أولوية"],
    enterprise: "مؤسسات",
    enterprisePrice: "مخصص",
    enterprisePeriod: "",
    enterpriseDesc: "للوكالات والمؤسسات الكبيرة",
    enterpriseFeatures: ["كل شيء غير محدود", "الوصول للـ API", "تقارير بعلامة بيضاء", "مدير حساب مخصص", "تكاملات مخصصة", "SLA ودعم ذو أولوية"],
    popular: "الأكثر شيوعاً",
    getStarted: "ابدأ الآن",
    contactUs: "تواصل معنا",
    freeCta: "ابدأ مجاناً",
    proCta: "اشترك الآن",
    enterpriseCta: "تواصل مع المبيعات",
    moneyBack: "ضمان استرداد الأموال لمدة 30 يوماً",
  },
};

export function PricingSection({ locale }: PricingSectionProps) {
  const isRtl = locale === "ar";
  const t = translations[locale] || translations.en;

  const plans = [
    {
      name: t.free as string,
      price: t.freePrice as string,
      period: t.freePeriod as string,
      desc: t.freeDesc as string,
      features: t.freeFeatures as string[],
      cta: t.freeCta as string,
      popular: false,
      gradient: "from-gold-500/20 to-gold-600/5",
    },
    {
      name: t.pro as string,
      price: t.proPrice as string,
      period: t.proPeriod as string,
      desc: t.proDesc as string,
      features: t.proFeatures as string[],
      cta: t.proCta as string,
      popular: true,
      gradient: "from-gold-500 to-gold-600",
    },
    {
      name: t.enterprise as string,
      price: t.enterprisePrice as string,
      period: t.enterprisePeriod as string,
      desc: t.enterpriseDesc as string,
      features: t.enterpriseFeatures as string[],
      cta: t.enterpriseCta as string,
      popular: false,
      gradient: "from-gold-500/20 to-gold-600/5",
    },
  ];

  return (
    <section className="relative py-20 md:py-28 bg-dark-950 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gold-500/8 via-transparent to-transparent" />
      <div className="absolute top-20 left-20 w-80 h-80 bg-gold-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-gold-600/5 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/20 mb-6">
            <Sparkles className="w-4 h-4 text-gold-400" />
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

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative flex flex-col p-8 rounded-2xl border transition-all duration-300 ${
                plan.popular
                  ? "bg-gradient-to-b from-gold-500/15 to-dark-800/60 border-gold-500/40 shadow-2xl shadow-gold-500/20 scale-105 neon-gold"
                  : "bg-dark-800/60 border-gold-500/10 hover:border-gold-500/30 hover:-translate-y-1"
              }`}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="flex items-center gap-1 px-4 py-1.5 rounded-full bg-gradient-to-r from-gold-600 to-gold-500 text-dark-950 text-xs font-bold shadow-lg shadow-gold-500/30">
                    <Zap className="w-3 h-3" />
                    {t.popular}
                  </div>
                </div>
              )}

              {/* Plan name */}
              <h3 className="text-xl font-bold text-white mb-2">
                {plan.name}
              </h3>

              {/* Price */}
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-4xl font-bold text-gold-300">
                  {plan.price}
                </span>
                {plan.period && (
                  <span className="text-dark-400 text-sm">
                    {plan.period}
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-dark-400 text-sm mb-6">
                {plan.desc}
              </p>

              {/* Features */}
              <ul className="flex-1 space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-dark-200">
                    <Check className="w-4 h-4 text-gold-500 mt-0.5 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <button className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                plan.popular
                  ? "bg-gradient-to-r from-gold-600 to-gold-500 text-dark-950 hover:from-gold-500 hover:to-gold-400 shadow-lg shadow-gold-500/25"
                  : "border border-gold-500/30 text-gold-300 hover:bg-gold-500/10 hover:border-gold-500/50"
              }`}>
                {plan.cta}
                <ArrowRight className={`w-4 h-4 ${isRtl ? "rotate-180" : ""}`} />
              </button>
            </div>
          ))}
        </div>

        {/* Money back guarantee */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-dark-800/60 border border-gold-500/20">
            <Check className="w-4 h-4 text-gold-500" />
            <span className="text-sm text-dark-300">
              {t.moneyBack}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}