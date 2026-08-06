"use client";

import { ArrowRight, Zap, Shield, Clock } from "lucide-react";

interface CTASectionProps {
  locale: string;
  onAnalyze?: (url: string, platform?: string) => void;
}

const translations: Record<string, Record<string, string>> = {
  en: {
    badge: "READY TO START?",
    title: "Improve Your Digital Presence Today",
    subtitle: "Join thousands of businesses and creators using Smart Land to analyze, improve, and grow.",
    cta: "Analyze Now",
    quick1: "Free analysis",
    quick2: "No sign-up required",
    quick3: "Results in 30 seconds",
  },
  ar: {
    badge: "مستعد للبدء؟",
    title: "حسّن حضورك الرقمي اليوم",
    subtitle: "انضم إلى آلاف الشركات وصناع المحتوى الذين يستخدمون سمارت لاند للتحليل والتحسين والنمو.",
    cta: "حلل الآن",
    quick1: "تحليل مجاني",
    quick2: "بدون تسجيل",
    quick3: "النتائج في 30 ثانية",
  },
};

export function CTASection({ locale, onAnalyze }: CTASectionProps) {
  const isRtl = locale === "ar";
  const t = translations[locale] || translations.en;

  const handleClick = () => {
    if (onAnalyze) {
      // Scroll to top where the hero section is
      window.scrollTo({ top: 0, behavior: "smooth" });
      // Small delay to let the scroll happen
      setTimeout(() => {
        onAnalyze("");
      }, 500);
    }
  };

  return (
    <section className="relative py-20 md:py-28 bg-dark-950 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gold-500/15 via-transparent to-transparent" />
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-2/3 h-2/3 bg-gold-500/8 rounded-full blur-3xl" />
      
      {/* Decorative grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(234,179,8,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(234,179,8,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />

      {/* Animated gradient border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/40 to-transparent" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gold-500/10 border border-gold-500/20 backdrop-blur-sm mb-8 gold-glow">
          <Zap className="w-4 h-4 text-gold-400" />
          <span className="text-sm text-gold-300 font-medium">
            {t.badge}
          </span>
        </div>

        {/* Title */}
        <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
          {isRtl ? (
            <>
              {t.title.split(" ")[0]}{" "}
              <span className="bg-gradient-to-r from-gold-400 via-gold-500 to-gold-300 text-transparent bg-clip-text text-glow">
                {t.title.split(" ").slice(1).join(" ")}
              </span>
            </>
          ) : (
            <>
              {t.title.split(" ")[0]}{" "}
              <span className="bg-gradient-to-r from-gold-400 via-gold-500 to-gold-300 text-transparent bg-clip-text text-glow">
                {t.title.split(" ").slice(1).join(" ")}
              </span>
            </>
          )}
        </h2>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-dark-300 mb-10 max-w-2xl mx-auto leading-relaxed">
          {t.subtitle}
        </p>

        {/* CTA Button */}
        <button
          onClick={handleClick}
          className="group relative px-10 py-5 rounded-2xl font-bold text-lg transition-all duration-200 overflow-hidden"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-gold-600 via-gold-500 to-gold-400 bg-size-200 animate-gradient-shift" />
          <span className="absolute inset-0 bg-gradient-to-r from-gold-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <span className="relative flex items-center justify-center gap-2 text-dark-950">
            {t.cta}
            <ArrowRight className={`w-5 h-5 transition-transform group-hover:translate-x-1 ${isRtl ? "rotate-180" : ""}`} />
          </span>
        </button>

        {/* Quick benefits */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-10">
          {[t.quick1, t.quick2, t.quick3].map((quick, i) => (
            <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-full bg-dark-800/60 border border-gold-500/10">
              {i === 0 && <Zap className="w-4 h-4 text-gold-500" />}
              {i === 1 && <Shield className="w-4 h-4 text-gold-500" />}
              {i === 2 && <Clock className="w-4 h-4 text-gold-500" />}
              <span className="text-sm text-dark-300">{quick}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}