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
  { href: "/methodology", label: "Methodology", labelAr: "المنهجية" },
  { href: "/admin", label: "Intelligence Center", labelAr: "مركز الذكاء" },
];

export const SOCIAL_LINKS = {
  twitter: "https://twitter.com/smartland",
  github: "https://github.com/smartland",
} as const;