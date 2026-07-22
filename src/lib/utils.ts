import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatScore(score: number): number {
  return Math.round(Math.max(0, Math.min(100, score)));
}

export function getScoreColor(score: number): string {
  if (score >= 90) return "text-accent-500";
  if (score >= 70) return "text-primary-500";
  if (score >= 50) return "text-yellow-500";
  if (score >= 30) return "text-orange-500";
  return "text-red-500";
}

export function getScoreBgColor(score: number): string {
  if (score >= 90) return "bg-accent-500";
  if (score >= 70) return "bg-primary-500";
  if (score >= 50) return "bg-yellow-500";
  if (score >= 30) return "bg-orange-500";
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
      return "text-red-500 bg-red-50 border-red-200";
    case "high":
      return "text-orange-500 bg-orange-50 border-orange-200";
    case "medium":
      return "text-yellow-500 bg-yellow-50 border-yellow-200";
    case "low":
      return "text-blue-500 bg-blue-50 border-blue-200";
    default:
      return "text-surface-500 bg-surface-50 border-surface-200";
  }
}

export function getSeverityBg(severity: string): string {
  switch (severity) {
    case "critical":
      return "bg-red-500";
    case "high":
      return "bg-orange-500";
    case "medium":
      return "bg-yellow-500";
    case "low":
      return "bg-blue-500";
    default:
      return "bg-surface-500";
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