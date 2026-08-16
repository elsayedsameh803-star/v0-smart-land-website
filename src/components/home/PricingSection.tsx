"use client";

import { useState } from "react";
import { Check, Sparkles, Zap, ArrowRight, X, Lock, BadgeCheck, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";

interface PricingSectionProps {
  locale: string;
}

const translations: Record<string, Record<string, string | string[]>> = {
  en: {
    badge: "PRICING",
    title: "Simple, Transparent Pricing",
    subtitle: "Choose the paid plan ($5) or start with your free analyses. No hidden fees.",
    free: "Free",
    freePrice: "$0",
    freePeriod: "",
    freeDesc: "2 free analyses to try Smart Land",
    freeFeatures: ["2 free analyses", "Website analysis", "Basic score breakdown", "PDF report"],
    pro: "Pro — Paid Plan",
    proPrice: "$5",
    proPeriod: "one-time",
    proDesc: "Your paid plan. Unlock everything in one payment.",
    proFeatures: ["Unlimited analyses", "All platforms (7+)", "Advanced insights & recommendations", "Competitor comparison", "Analysis history & tracking", "Email invoice & priority support"],
    enterprise: "Enterprise",
    enterprisePrice: "Custom",
    enterprisePeriod: "",
    enterpriseDesc: "For agencies and large organizations",
    enterpriseFeatures: ["Everything in Pro", "API access", "White-label reports", "Dedicated account manager", "Custom integrations", "SLA & priority support"],
    popular: "Most Popular",
    freeCta: "Try Free",
    proCta: "Upgrade for $5",
    enterpriseCta: "Talk to Sales",
    moneyBack: "Secure & encrypted checkout",
    badgeSsl: "SSL Secure Checkout",
    badgeLock: "Encrypted & Safe",
    badgeBolt: "Instant activation",
    modalTitle: "Thank you for subscribing!",
    modalBody: "Your Smart Land paid plan ($5) is confirmed. After completing payment your subscription will be activated instantly and an invoice will be emailed to you.",
    modalProceed: "Proceed to secure checkout",
    modalLater: "Not now",
    testMethods: "Test-mode payment methods:",
  },
  ar: {
    badge: "الأسعار",
    title: "أسعار بسيطة وشفافة",
    subtitle: "اختر الباقة المدفوعة ($5) أو ابدأ بتحليلاتك المجانية. لا رسوم خفية.",
    free: "مجاني",
    freePrice: "$0",
    freePeriod: "",
    freeDesc: "تحليلان مجانيان لتجربة سمارت لاند",
    freeFeatures: ["تحليلان مجانيان", "تحليل المواقع", "تفصيل الدرجات الأساسي", "تقرير PDF"],
    pro: "احترافي — الباقة المدفوعة",
    proPrice: "$5",
    proPeriod: "مدفوع مرة واحدة",
    proDesc: "باقتك المدفوعة. افتح كل المزايا بدفعة واحدة.",
    proFeatures: ["تحليلات غير محدودة", "جميع المنصات (7+)", "رؤى وتوصيات متقدمة", "مقارنة المنافسين", "سجل وتتبع التحليلات", "فاتورة إلكترونية ودعم ذو أولوية"],
    enterprise: "مؤسسات",
    enterprisePrice: "مخصص",
    enterprisePeriod: "",
    enterpriseDesc: "للوكالات والمؤسسات الكبيرة",
    enterpriseFeatures: ["كل شيء في Pro", "الوصول للـ API", "تقارير بعلامة بيضاء", "مدير حساب مخصص", "تكاملات مخصصة", "SLA ودعم ذو أولوية"],
    popular: "الأكثر شيوعاً",
    freeCta: "جرّب مجاناً",
    proCta: "اشترك مقابل $5",
    enterpriseCta: "تواصل مع المبيعات",
    moneyBack: "دفع آمن ومشفّر",
    badgeSsl: "دفع آمن SSL",
    badgeLock: "مشفّر وآمن",
    badgeBolt: "تفعيل فوري",
    modalTitle: "شكراً لاشتراكك!",
    modalBody: "باقتك المدفوعة في سمارت لاند ($5) مؤكدة. بعد إتمام الدفع سيتم تفعيل اشتراكك فوراً وستصلك فاتورة إلكترونية على بريدك.",
    modalProceed: "المتابعة إلى الدفع الآمن",
    modalLater: "ليس الآن",
    testMethods: "طرق الدفع (وضع الاختبار):",
  },
};

export function PricingSection({ locale }: PricingSectionProps) {
  const router = useRouter();
  const isRtl = locale === "ar";
  const t = translations[locale] || translations.en;
  const [openModal, setOpenModal] = useState(false);

  const go = (planId: string) => {
    if (planId === "enterprise") { router.push("/contact"); return; }
    if (planId === "pro") { setOpenModal(true); return; }
    // Free plan: go back to the home analyzer.
    router.push(`/${locale}`);
  };

  const plans = [
    {
      planId: "free",
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
      planId: "pro",
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
      planId: "enterprise",
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
              <button onClick={() => go(plan.planId)} className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
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

        {/* Trust badges — SSL secure checkout signals */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
          {[
            { icon: Lock, label: t.badgeSsl },
            { icon: ShieldCheck, label: t.badgeLock },
            { icon: BadgeCheck, label: t.badgeBolt },
          ].map((b, i) => (
            <div key={i} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-dark-800/60 border border-emerald-500/20 text-sm text-dark-300">
              <b.icon className="w-4 h-4 text-emerald-400" />
              {b.label}
            </div>
          ))}
        </div>
      </div>

      {/* Thank-you confirmation modal shown on upgrading to the paid plan */}
      {openModal && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setOpenModal(false)}
          dir={isRtl ? "rtl" : "ltr"}
        >
          <div
            className="relative w-full max-w-md rounded-3xl glass-deep gold-border p-8 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={() => setOpenModal(false)} className="absolute top-4 end-4 text-dark-400 hover:text-gold-300 transition" aria-label="Close">
              <X className="w-5 h-5" />
            </button>
            <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mb-4">
              <BadgeCheck className="w-8 h-8 text-emerald-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">{t.modalTitle}</h3>
            <p className="text-sm text-dark-400 mb-6">{t.modalBody}</p>

            <div className="rounded-xl bg-dark-800/70 border border-gold-500/10 p-4 mb-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-dark-400">{t.pro}</span>
                <span className="font-bold text-gold-300">$5</span>
              </div>
            </div>

            <button
              onClick={() => router.push("/checkout?plan=pro")}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gold-600 to-gold-500 px-6 py-3.5 font-bold text-dark-950 hover:from-gold-500 hover:to-gold-400 transition"
            >
              <Lock className="w-4 h-4" /> {t.modalProceed}
            </button>

            <p className="text-[11px] text-dark-500 mt-4 mb-2">{t.testMethods}</p>
            <div className="flex flex-wrap justify-center gap-2">
              {["Paymob", "Stripe", "PayPal"].map((m) => (
                <span key={m} className="px-3 py-1 rounded-full border border-gold-500/20 text-xs text-gold-300">
                  {m} · Test
                </span>
              ))}
            </div>

            <button onClick={() => setOpenModal(false)} className="mt-4 w-full text-sm text-dark-400 hover:text-gold-300 transition">
              {t.modalLater}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}