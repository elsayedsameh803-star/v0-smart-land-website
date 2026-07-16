import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { type Locale } from './i18n';
import type { CategoryScores, Finding, ActionItem } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string, locale: Locale): string {
  const d = new Date(date);
  return d.toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDateShort(date: string, locale: Locale): string {
  const d = new Date(date);
  return d.toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function getScoreColor(score: number): string {
  if (score >= 90) return 'text-green-400';
  if (score >= 70) return 'text-smart-gold';
  if (score >= 50) return 'text-yellow-400';
  if (score >= 30) return 'text-orange-400';
  return 'text-red-400';
}

export function getScoreBgColor(score: number): string {
  if (score >= 90) return 'bg-green-500';
  if (score >= 70) return 'bg-smart-gold';
  if (score >= 50) return 'bg-yellow-500';
  if (score >= 30) return 'bg-orange-500';
  return 'bg-red-500';
}

export function getScoreLabel(score: number, locale: Locale): string {
  if (locale === 'ar') {
    if (score >= 90) return 'ممتاز';
    if (score >= 70) return 'جيد';
    if (score >= 50) return 'متوسط';
    if (score >= 30) return 'ضعيف';
    return 'حرج';
  }
  if (score >= 90) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 50) return 'Average';
  if (score >= 30) return 'Poor';
  return 'Critical';
}

export function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'critical': return 'text-red-400 bg-red-400/10 border-red-400/30';
    case 'high': return 'text-orange-400 bg-orange-400/10 border-orange-400/30';
    case 'medium': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
    case 'low': return 'text-smart-gold bg-smart-gold/10 border-smart-gold/30';
    case 'info': return 'text-blue-400 bg-blue-400/10 border-blue-400/30';
    default: return 'text-gray-400 bg-gray-400/10 border-gray-400/30';
  }
}

export function getCategoryLabel(category: keyof CategoryScores, locale: Locale): string {
  const labels: Record<keyof CategoryScores, { en: string; ar: string }> = {
    seo: { en: 'SEO', ar: 'تحسين محركات البحث' },
    performance: { en: 'Performance', ar: 'الأداء' },
    accessibility: { en: 'Accessibility', ar: 'إمكانية الوصول' },
    security: { en: 'Security', ar: 'الأمان' },
    content: { en: 'Content & Structure', ar: 'المحتوى والهيكل' },
    technical: { en: 'Technical Health', ar: 'الصحة التقنية' },
  };
  return locale === 'ar' ? labels[category].ar : labels[category].en;
}

export function getSeverityLabel(severity: string, locale: Locale): string {
  const labels: Record<string, { en: string; ar: string }> = {
    critical: { en: 'Critical', ar: 'حرج' },
    high: { en: 'High', ar: 'عالٍ' },
    medium: { en: 'Medium', ar: 'متوسط' },
    low: { en: 'Low', ar: 'منخفض' },
    info: { en: 'Info', ar: 'معلومات' },
  };
  return locale === 'ar' ? labels[severity]?.ar || severity : labels[severity]?.en || severity;
}

export function getPriorityLabel(priority: string, locale: Locale): string {
  const labels: Record<string, { en: string; ar: string }> = {
    critical: { en: 'Critical', ar: 'حرج' },
    high: { en: 'High', ar: 'عالية' },
    medium: { en: 'Medium', ar: 'متوسطة' },
    low: { en: 'Low', ar: 'منخفضة' },
  };
  return locale === 'ar' ? labels[priority]?.ar || priority : labels[priority]?.en || priority;
}

export function isValidUrl(url: string): boolean {
  try {
    const u = new URL(url.startsWith('http') ? url : `https://${url}`);
    return u.hostname.includes('.');
  } catch {
    return false;
  }
}

export function normalizeUrl(url: string): string {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`;
  }
  return url;
}

export function generateId(): string {
  return `sl-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function generateShareToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function calculateOverallScore(scores: CategoryScores): number {
  const weights: Record<keyof CategoryScores, number> = {
    seo: 0.25,
    performance: 0.20,
    accessibility: 0.15,
    security: 0.15,
    content: 0.15,
    technical: 0.10,
  };

  let weightedSum = 0;
  let totalWeight = 0;

  for (const [key, value] of Object.entries(scores)) {
    const weight = weights[key as keyof CategoryScores];
    weightedSum += (value.score / value.maxScore) * 100 * weight;
    totalWeight += weight;
  }

  return Math.round(weightedSum / totalWeight);
}

export function generateActionPlan(findings: Finding[]): ActionItem[] {
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };

  return findings
    .sort((a, b) => (priorityOrder[a.severity] || 99) - (priorityOrder[b.severity] || 99))
    .map((f) => ({
      priority: f.severity,
      issue: f.issue,
      issueAr: f.issueAr,
      action: f.howToFix,
      actionAr: f.howToFixAr,
      expectedImpact: f.expectedBenefit,
      expectedImpactAr: f.expectedBenefitAr,
    }));
}

export function truncateUrl(url: string, maxLength: number = 40): string {
  if (url.length <= maxLength) return url;
  return url.substring(0, maxLength - 3) + '...';
}

export function getDomain(url: string): string {
  try {
    return new URL(url.startsWith('http') ? url : `https://${url}`).hostname;
  } catch {
    return url;
  }
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function classNames(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}