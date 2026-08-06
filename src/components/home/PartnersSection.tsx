"use client";

import { Crown, Building2, Rocket, Globe, Store, Briefcase, Heart } from "lucide-react";

interface PartnersSectionProps {
  locale: string;
}

const translations: Record<string, Record<string, string>> = {
  en: {
    badge: "TRUSTED PARTNERS",
    title: "Companies That Trust Smart Land",
    subtitle: "Join thousands of businesses and creators using Smart Land to grow their digital presence",
  },
  ar: {
    badge: "شركاء موثوقون",
    title: "شركات تثق في سمارت لاند",
    subtitle: "انضم إلى آلاف الشركات وصناع المحتوى الذين يستخدمون سمارت لاند لتنمية حضورهم الرقمي",
  },
};

export function PartnersSection({ locale }: PartnersSectionProps) {
  const isRtl = locale === "ar";
  const t = translations[locale] || translations.en;

  const partners = [
    { icon: Crown, name: "TechNova" },
    { icon: Building2, name: "UrbanCo" },
    { icon: Rocket, name: "LaunchPad" },
    { icon: Globe, name: "WorldLink" },
    { icon: Store, name: "E-Shop" },
    { icon: Briefcase, name: "BizCore" },
    { icon: Heart, name: "Wellness+" },
  ];

  return (
    <section className="relative py-12 md:py-16 bg-dark-900 overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-gold-500/20 to-transparent" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-gold-500/20 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="text-xs text-gold-400 font-medium uppercase tracking-wider">
            {t.badge}
          </span>
          <h3 className="text-xl sm:text-2xl font-bold text-white mt-2">
            {t.title}
          </h3>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8">
          {partners.map((partner, index) => (
            <div
              key={index}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-dark-800/60 border border-gold-500/10 text-dark-400 hover:text-gold-300 hover:border-gold-500/30 transition-all duration-300 hover:-translate-y-0.5"
            >
              <partner.icon className="w-5 h-5 text-gold-500/60" />
              <span className="font-semibold text-sm tracking-wide">
                {partner.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}