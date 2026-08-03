"use client";

import Link from 'next/link';
import { Sparkles, Github, Twitter, Linkedin, Mail, Heart, Globe, Gift } from 'lucide-react';

interface FooterProps {
  locale?: string;
}

const translations: Record<string, Record<string, string>> = {
  en: {
    description: "AI Digital Audit Platform — Evidence-driven digital presence analysis. Analyze, understand, and improve your digital presence with actionable insights.",
    trusted: "Trusted globally",
    product: "Product",
    resources: "Resources",
    company: "Company",
    urlAnalyzer: "URL Analyzer",
    methodology: "Methodology",
    referral: "Referral Program",
    admin: "Admin Dashboard",
    documentation: "Documentation",
    apiRef: "API Reference",
    blog: "Blog",
    privacy: "Privacy Policy",
    terms: "Terms of Service",
    contact: "Contact",
    rights: "All rights reserved.",
    madeWith: "Made with",
    precision: "precision — AI Digital Audit Platform",
  },
  ar: {
    description: "منصة التدقيق الرقمي بالذكاء الاصطناعي — تحليل الحضور الرقمي القائم على الأدلة. حلل، افهم، وحسّن حضورك الرقمي برؤى قابلة للتنفيذ.",
    trusted: "موثوق عالمياً",
    product: "المنتج",
    resources: "الموارد",
    company: "الشركة",
    urlAnalyzer: "محلل الروابط",
    methodology: "المنهجية",
    referral: "برنامج الإحالة",
    admin: "لوحة الإدارة",
    documentation: "الوثائق",
    apiRef: "مرجع API",
    blog: "المدونة",
    privacy: "سياسة الخصوصية",
    terms: "شروط الخدمة",
    contact: "اتصل بنا",
    rights: "جميع الحقوق محفوظة.",
    madeWith: "صُنع بـ",
    precision: "دقة — منصة التدقيق الرقمي بالذكاء الاصطناعي",
  },
};

export function Footer({ locale = "en" }: FooterProps) {
  const isRtl = locale === "ar";
  const t = translations[locale] || translations.en;

  return (
    <footer className="relative border-t border-gold-500/10 bg-dark-950 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gold-500/2 to-gold-600/3 pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-gold-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-gold-600/5 rounded-full blur-3xl" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand - wider column */}
          <div className="lg:col-span-2">
            <Link href={`/${locale}`} className="inline-flex items-center gap-3 mb-5 group">
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center shadow-lg shadow-gold-500/20 group-hover:shadow-gold-500/40 transition-all duration-300 group-hover:scale-105">
                  <Sparkles className="w-6 h-6 text-dark-950" />
                </div>
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-gold-500 rounded-full animate-ping-slow" />
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-gold-400 to-gold-600 text-transparent bg-clip-text">Smart Land</span>
                <span className="text-[10px] text-dark-500 block">AI Digital Audit Platform</span>
              </div>
            </Link>
            <p className="text-sm text-dark-400 max-w-md leading-relaxed mb-6" dir={isRtl ? "rtl" : "ltr"}>
              {t.description}
            </p>
            
            {/* Social links */}
            <div className="flex items-center gap-3">
            {[
              { icon: Twitter, href: "https://twitter.com/smartland", label: "Twitter" },
              { icon: Linkedin, href: "https://linkedin.com/company/smartland", label: "LinkedIn" },
              { icon: Github, href: "https://github.com/smartland", label: "GitHub" },
              { icon: Mail, href: "mailto:elsayedsameh803@gmail.com", label: "Email" },
            ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="w-10 h-10 rounded-xl bg-dark-800 border border-gold-500/10 flex items-center justify-center text-dark-400 hover:text-gold-400 hover:border-gold-500/30 hover:bg-dark-700 transition-all duration-200 gold-glow-hover"
                  aria-label={social.label}
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>

            {/* Team avatars */}
            <div className="flex items-center gap-3 mt-6">
              <div className="flex -space-x-2">
                {['bg-gold-500', 'bg-gold-600', 'bg-gold-700', 'bg-gold-800'].map((color, i) => (
                  <div 
                    key={i} 
                    className={`w-8 h-8 rounded-full ${color} ring-2 ring-dark-950 flex items-center justify-center text-xs font-bold text-dark-950 hover:scale-110 transition-transform duration-200`}
                  >
                    {['S', 'M', 'A', 'L'][i]}
                  </div>
                ))}
              </div>
              <span className="text-xs text-dark-500">{t.trusted}</span>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-sm font-semibold text-gold-400 mb-5 relative inline-block">
              {t.product}
              <span className="absolute -bottom-1 left-0 w-8 h-0.5 bg-gradient-to-r from-gold-500 to-transparent rounded-full" />
            </h3>
            <ul className="space-y-3">
              {[
                { href: `/${locale}`, label: t.urlAnalyzer },
                { href: `/${locale}/methodology`, label: t.methodology },
                { href: `/${locale}/referral`, label: t.referral },
                { href: `/${locale}/admin`, label: t.admin },
              ].map((item) => (
                <li key={item.href}>
                  <Link 
                    href={item.href} 
                    className="text-sm text-dark-400 hover:text-gold-400 transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-gold-500/0 group-hover:bg-gold-500 transition-all duration-200" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold text-gold-400 mb-5 relative inline-block">
              {t.resources}
              <span className="absolute -bottom-1 left-0 w-8 h-0.5 bg-gradient-to-r from-gold-500 to-transparent rounded-full" />
            </h3>
            <ul className="space-y-3">
              {[
                { href: `/${locale}/features`, label: "Features" },
                { href: `/${locale}/faq`, label: "FAQ" },
                { href: `/${locale}/help`, label: "Help Center" },
              ].map((item) => (
                <li key={item.label}>
                  <a 
                    href={item.href} 
                    className="text-sm text-dark-400 hover:text-gold-400 transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-gold-500/0 group-hover:bg-gold-500 transition-all duration-200" />
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold text-gold-400 mb-5 relative inline-block">
              {t.company}
              <span className="absolute -bottom-1 left-0 w-8 h-0.5 bg-gradient-to-r from-gold-500 to-transparent rounded-full" />
            </h3>
            <ul className="space-y-3">
              {[
                { href: `/${locale}/privacy`, label: t.privacy },
                { href: `/${locale}/terms`, label: t.terms },
                { href: `/${locale}/contact`, label: t.contact },
              ].map((item) => (
                <li key={item.label}>
                  <Link 
                    href={item.href} 
                    className="text-sm text-dark-400 hover:text-gold-400 transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-gold-500/0 group-hover:bg-gold-500 transition-all duration-200" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="my-10 h-px bg-gradient-to-r from-transparent via-gold-500/15 to-transparent" />

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-dark-500 flex items-center gap-1">
            © {new Date().getFullYear()} Smart Land. {t.rights}
          </p>
          <p className="text-xs text-dark-500 flex items-center gap-1">
            {t.madeWith} <Heart className="w-3 h-3 text-gold-500 fill-gold-500" /> {t.precision}
          </p>
        </div>
      </div>
    </footer>
  );
}