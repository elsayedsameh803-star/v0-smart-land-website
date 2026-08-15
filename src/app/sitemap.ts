import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-config";

const BASE_URL = getSiteUrl();

const locales = ["en", "ar"] as const;
type Locale = (typeof locales)[number];

interface PageConfig {
  path: string;
  changefreq: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority: number;
}

const pages: PageConfig[] = [
  { path: "", changefreq: "weekly", priority: 1.0 },
  { path: "/about", changefreq: "monthly", priority: 0.8 },
  { path: "/contact", changefreq: "monthly", priority: 0.8 },
  { path: "/features", changefreq: "monthly", priority: 0.8 },
  { path: "/faq", changefreq: "monthly", priority: 0.7 },
  { path: "/help", changefreq: "monthly", priority: 0.7 },
  { path: "/privacy", changefreq: "monthly", priority: 0.6 },
  { path: "/terms", changefreq: "monthly", priority: 0.6 },
  { path: "/dashboard", changefreq: "weekly", priority: 0.5 },
  { path: "/projects", changefreq: "weekly", priority: 0.5 },
  { path: "/offline", changefreq: "monthly", priority: 0.3 },
];

function getAlternates(path: string) {
  const alternates: Record<string, string> = {};
  for (const locale of locales) {
    alternates[locale] = `${BASE_URL}/${locale}${path}`;
  }
  alternates["x-default"] = `${BASE_URL}/en${path}`;
  return alternates;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const today = new Date().toISOString().split("T")[0];

  const entries: MetadataRoute.Sitemap = [];

  for (const page of pages) {
    for (const locale of locales) {
      entries.push({
        url: `${BASE_URL}/${locale}${page.path}`,
        lastModified: today,
        changeFrequency: page.changefreq,
        priority: page.priority,
        alternates: {
          languages: getAlternates(page.path),
        },
      });
    }
  }

  return entries;
}