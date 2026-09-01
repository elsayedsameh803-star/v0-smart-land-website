"use client";

import {
  Users,
  Eye,
  MousePointerClick,
  MessageSquare,
  FileVideo,
  ThumbsUp,
  TrendingUp,
  Activity,
} from "lucide-react";
import type { AnalyticsMetric } from "@/app/api/analytics/overview/route";

export interface SummaryTotals {
  followers: number | null;
  reach: number | null;
  impressions: number | null;
  engagement: number | null;
  content: number | null;
  views: number | null;
  likes: number | null;
}

const BASE_SUMMARY_KEYS: Array<{
  key: keyof SummaryTotals;
  enLabel: string;
  arLabel: string;
  icon: React.ElementType;
  color: string;
}> = [
  {
    key: "followers",
    enLabel: "Total Audience",
    arLabel: "إجمالي الجمهور",
    icon: Users,
    color: "text-gold-400",
  },
  {
    key: "reach",
    enLabel: "Reach (28d)",
    arLabel: "الوصول (28 يوم)",
    icon: Eye,
    color: "text-blue-400",
  },
  {
    key: "impressions",
    enLabel: "Impressions (28d)",
    arLabel: "مرات الظهور (28 يوم)",
    icon: MousePointerClick,
    color: "text-pink-400",
  },
  {
    key: "engagement",
    enLabel: "Engagement",
    arLabel: "التفاعل",
    icon: MessageSquare,
    color: "text-emerald-400",
  },
  {
    key: "content",
    enLabel: "Content",
    arLabel: "المحتوى",
    icon: FileVideo,
    color: "text-cyan-400",
  },
  {
    key: "views",
    enLabel: "Video Views",
    arLabel: "مشاهدات الفيديو",
    icon: Activity,
    color: "text-red-400",
  },
  {
    key: "likes",
    enLabel: "Likes",
    arLabel: "الإعجابات",
    icon: ThumbsUp,
    color: "text-amber-400",
  },
];

function formatCompact(n: number | null): string {
  if (n === null) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(n);
}

interface SummaryCardsProps {
  locale: string;
  totals: SummaryTotals | null;
  connectedCount: number;
  totalPlatforms: number;
  generatedAt: string | null;
}

export function SummaryCards({
  locale,
  totals,
  connectedCount,
  totalPlatforms,
  generatedAt,
}: SummaryCardsProps) {
  const isAr = locale === "ar";
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-gold-400" />
          <h2 className="text-lg font-semibold text-white">
            {isAr ? "الملخص الموحد" : "Unified Summary"}
          </h2>
        </div>
        <div className="flex items-center gap-3 text-xs text-dark-400">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            {isAr ? "منصات مرتبطة" : "Connected"}: {connectedCount}/{totalPlatforms}
          </span>
          {generatedAt ? (
            <span>
              {new Date(generatedAt).toLocaleTimeString(
                isAr ? "ar-EG" : "en-US",
                { hour: "2-digit", minute: "2-digit" }
              )}
            </span>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {BASE_SUMMARY_KEYS.map(({ key, enLabel, arLabel, icon: Icon, color }) => {
          const count = totals?.[key] ?? null;
          return (
            <div
              key={key}
              className="rounded-2xl bg-dark-900 border border-gold-500/10 p-4"
            >
              <div className="flex items-center justify-between">
                <p className="text-[11px] text-dark-400">
                  {isAr ? arLabel : enLabel}
                </p>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <p className="mt-2 text-2xl font-bold text-white tabular-nums">
                {formatCompact(count)}
              </p>
              {count === null && (
                <p className="text-[10px] text-dark-500">
                  {isAr ? "غير متاح" : "unavailable"}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}