import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatScore(score: number): number {
  return Math.round(Math.max(0, Math.min(100, score)));
}

export function getScoreColor(score: number): string {
  if (score >= 90) return "text-gold-400";
  if (score >= 70) return "text-gold-500";
  if (score >= 50) return "text-gold-600";
  if (score >= 30) return "text-gold-700";
  return "text-red-400";
}

export function getScoreBgColor(score: number): string {
  if (score >= 90) return "bg-gold-500";
  if (score >= 70) return "bg-gold-600";
  if (score >= 50) return "bg-gold-600";
  if (score >= 30) return "bg-gold-700";
  return "bg-red-500";
}

export function getScoreRating(score: number, locale: string = "en"): string {
  if (score >= 90) return locale === "ar" ? "ممتاز" : "Excellent";
  if (score >= 70) return locale === "ar" ? "جيد" : "Good";
  if (score >= 50) return locale === "ar" ? "متوسط" : "Average";
  if (score >= 30) return locale === "ar" ? "ضعيف" : "Poor";
  return locale === "ar" ? "حرج" : "Critical";
}

export function getSeverityColor(severity: string): string {
  switch (severity) {
    case "critical":
      return "text-red-400 bg-red-500/10 border-red-500/20";
    case "high":
      return "text-orange-400 bg-orange-500/10 border-orange-500/20";
    case "medium":
      return "text-gold-400 bg-gold-500/10 border-gold-500/20";
    case "low":
      return "text-blue-400 bg-blue-500/10 border-blue-500/20";
    default:
      return "text-dark-300 bg-dark-800 border-dark-700";
  }
}

export function getSeverityBg(severity: string): string {
  switch (severity) {
    case "critical":
      return "bg-red-500";
    case "high":
      return "bg-orange-500";
    case "medium":
      return "bg-gold-500";
    case "low":
      return "bg-blue-500";
    default:
      return "bg-dark-500";
  }
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}

export function formatDate(dateString: string, locale: string = "en"): string {
  const date = new Date(dateString);
  return date.toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function generateId(): string {
  return crypto.randomUUID?.() ?? Math.random().toString(36).substring(2, 15);
}

export function isValidUrl(url: string): boolean {
  try {
    const u = new URL(url.startsWith("http") ? url : `https://${url}`);
    return u.hostname.includes(".");
  } catch {
    return false;
  }
}

export function normalizeUrl(url: string): string {
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return `https://${url}`;
  }
  return url;
}

export function extractDomain(url: string): string {
  try {
    return new URL(normalizeUrl(url)).hostname;
  } catch {
    return url;
  }
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

export const getDirection = (locale: string): "ltr" | "rtl" => {
  return locale === "ar" ? "rtl" : "ltr";
};