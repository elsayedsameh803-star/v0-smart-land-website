"use client";

import { Globe, Users, FileCheck, TrendingUp, Award, Clock } from "lucide-react";

interface StatsSectionProps {
  locale: string;
}

const translations: Record<string, Record<string, string>> = {
  en: {
    badge: "OUR IMPACT",
    title: "Trusted Numbers That Speak",
    subtitle: "Smart Land is helping businesses and creators worldwide improve their digital presence",
    stat1: "Websites Analyzed",
    stat2: "Social Accounts Analyzed",
    stat3: "Reports Generated",
    stat4: "Average Score Improvement",
    stat5: "Countries Served",
    stat6: "Average Analysis Time",
    stat1Value: "50K+",
    stat2Value: "120K+",
    stat3Value: "1M+",
    stat4Value: "38%",
    stat5Value: "40+",
    stat6Value: "<30s",
  },
  ar: {
    badge: "تأثيرنا",
    title: "أرقام موثوقة تتحدث",
    subtitle: "سمارت لاند تساعد الشركات وصناع المحتوى حول العالم في تحسين حضورهم الرقمي",
    stat1: "مواقع تم تحليلها",
    stat2: "حسابات سوشيال تم تحليلها",
    stat3: "تقرير تم إنشاؤه",
    stat4: "متوسط تحسن الدرجات",
    stat5: "دولة نخدمها",
    stat6: "متوسط وقت التحليل",
    stat1Value: "50K+",
    stat2Value: "120K+",
    stat3Value: "1M+",
    stat4Value: "38%",
    stat5Value: "40+",
    stat6Value: "<30ث",
  },
};

export function StatsSection({ locale }: StatsSectionProps) {
  const isRtl = locale === "ar";
  const t = translations[locale] || translations.en;

  const stats = [
    { icon: Globe, value: t.stat1Value, label: t.stat1, gradient: "from-gold-500 to-gold-600" },
    { icon: Users, value: t.stat2Value, label: t.stat2, gradient: "from-gold-400 to-gold-600" },
    { icon: FileCheck, value: t.stat3Value, label: t.stat3, gradient: "from-gold-500 to-gold-700" },
    { icon: TrendingUp, value: t.stat4Value, label: t.stat4, gradient: "from-gold-400 to-gold-500" },
    { icon: Award, value: t.stat5Value, label: t.stat5, gradient: "from-gold-500 to-gold-600" },
    { icon: Clock, value: t.stat6Value, label: t.stat6, gradient: "from-gold-400 to-gold-600" },
  ];

  return (
    <section className="relative py-16 md:py-20 bg-dark-900 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gold-500/5 via-transparent to-transparent" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-gold-500/20 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/20 mb-6">
            <Award className="w-4 h-4 text-gold-400" />
            <span className="text-xs text-gold-400 font-medium uppercase tracking-wider">
              {t.badge}
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            {t.title}
          </h2>
          <p className="text-lg text-dark-400 max-w-2xl mx-auto">
            {t.subtitle}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="group relative p-6 rounded-2xl bg-dark-800/60 border border-gold-500/10 text-center hover:bg-dark-800/80 hover:border-gold-500/30 transition-all duration-300 hover:-translate-y-1 gold-glow-hover card-hover-effect"
            >
              <div className={`w-12 h-12 mx-auto rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center mb-4 shadow-lg shadow-gold-500/20 group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className="w-6 h-6 text-dark-950" />
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-gold-300 mb-1 group-hover:text-gold-200 transition-colors">
                {stat.value}
              </p>
              <p className="text-xs text-dark-400">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}