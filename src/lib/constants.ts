import type { NavItem } from "./types";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://smart-land.vercel.app";
export const SITE_NAME = "Smart Land";
export const SITE_DESCRIPTION = "AI Digital Audit Platform — Analyze, understand, and improve your digital presence with evidence-based AI-powered audits.";

export const ANALYSIS_CATEGORIES = [
  "seo",
  "performance",
  "accessibility",
  "security",
  "content",
  "technical",
] as const;

export const ANALYSIS_STAGES = [
  { id: "validating", duration: 2000 },
  { id: "connecting", duration: 2000 },
  { id: "collecting", duration: 3000 },
  { id: "seo", duration: 2500 },
  { id: "technical", duration: 2500 },
  { id: "performance", duration: 2000 },
  { id: "accessibility", duration: 2000 },
  { id: "detecting", duration: 2000 },
  { id: "recommendations", duration: 2000 },
  { id: "preparing", duration: 1500 },
] as const;

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Home", labelAr: "الرئيسية" },
  { href: "/features", label: "Features", labelAr: "المميزات" },
  { href: "/pricing", label: "Pricing", labelAr: "الأسعار" },
  { href: "/methodology", label: "Methodology", labelAr: "المنهجية" },
  { href: "/about", label: "About", labelAr: "حول" },
  { href: "/contact", label: "Contact", labelAr: "اتصل بنا" },
  { href: "/faq", label: "FAQ", labelAr: "الأسئلة الشائعة" },
];

export const SOCIAL_LINKS = {
  twitter: "https://twitter.com/smartland",
  github: "https://github.com/smartland",
  linkedin: "https://linkedin.com/company/smartland",
  email: "mailto:elsayedsameh803@gmail.com",
  whatsapp: "https://wa.me/201272097150",
} as const;

export const COMPANY_INFO = {
  email: "elsayedsameh803@gmail.com",
  phone: "01272097150",
  whatsapp: "201272097150",
  address: "Egypt",
  workingHours: "Sun - Thu, 9:00 AM - 6:00 PM (GMT+2)",
  workingHoursAr: "الأحد - الخميس، 9:00 صباحاً - 6:00 مساءً (توقيت مصر)",
} as const;
