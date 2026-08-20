"use client";

import { Globe, Youtube, Facebook, Instagram, Music2, Linkedin, Camera } from "lucide-react";

interface PartnersSectionProps {
  locale: string;
}

const translations: Record<string, Record<string, string>> = {
  en: {
    badge: "PLATFORMS WE ANALYZE",
    title: "Audit Every Major Platform",
    subtitle: "Submit a URL and get a real, evidence-based audit. Every metric is sourced from the platform's own public data.",
    p1: "Website",
    p2: "YouTube",
    p3: "Facebook",
    p4: "Instagram",
    p5: "TikTok",
    p6: "LinkedIn",
    p7: "Snapchat",
  },
  ar: {
    badge: "المنصّات التي نحلّلها",
    title: "دقّق كل المنصّات الكبرى",
    subtitle: "أرسل رابطاً واحصل على تدقيق حقيقي قائم على الأدلة. كل رقم من بيانات المنصة العامة نفسها.",
    p1: "موقعك",
    p2: "يوتيوب",
    p3: "فيسبوك",
    p4: "إنستغرام",
    p5: "تيك توك",
    p6: "لينكد إن",
    p7: "سناب شات",
  },
};

export function PartnersSection({ locale }: PartnersSectionProps) {
  const t = translations[locale] || translations.en;

  const partners = [
    { icon: Globe, name: t.p1 },
    { icon: Youtube, name: t.p2 },
    { icon: Facebook, name: t.p3 },
    { icon: Instagram, name: t.p4 },
    { icon: Music2, name: t.p5 },
    { icon: Linkedin, name: t.p6 },
    { icon: Camera, name: t.p7 },
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