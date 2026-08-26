"use client";

import { AlertTriangle } from "lucide-react";

// =============================================================================
// TikTokDataPanel — renders ONLY real data that the TikTok API returned.
// A metric missing from the payload is shown as "غير متاح / Not available".
// No invented numbers are ever displayed here.
// =============================================================================

interface PropTypes {
  result: any;
  locale: string;
}

function formatCount(n: number | undefined | null): string {
  if (n === undefined || n === null || Number.isNaN(Number(n))) return "—";
  const num = Number(n);
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(num >= 10_000_000 ? 0 : 1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(num >= 10_000 ? 0 : 1)}K`;
  return String(num);
}

function formatSeconds(n: number | undefined | null): string {
  if (n === undefined || n === null || Number.isNaN(Number(n))) return "—";
  const s = Number(n);
  const m = Math.floor(s / 60);
  const rest = Math.round(s % 60);
  return m > 0 ? `${m}m ${rest}s` : `${s}s`;
}

export function TikTokDataPanel({ result, locale }: PropTypes) {
  const isRtl = locale === "ar";
  const d = result?.socialData || {};
  const limitations: string[] = Array.isArray(d.limitations)
    ? d.limitations
    : Array.isArray(result?.metadata?.limitations)
      ? result.metadata.limitations
      : [];
  const hashtags: string[] = Array.isArray(d.hashtags)
    ? d.hashtags
    : Array.isArray(d.bioHashtags)
      ? d.bioHashtags
      : [];
  const title = d.videoTitle || d.bio || "";
  const cover = d.coverUrl;
  const username = d.username || d.displayName || "";

  // Build metric rows — a missing numeric is explicitly "not available".
  const metricRows: Array<{
    key: string;
    label: string;
    labelAr: string;
    display: string;
  }> = [];
  const push = (key: string, label: string, labelAr: string, fmt?: (n: number) => string) => {
    const raw = d[key];
    const has = raw !== undefined && raw !== null && raw !== "" && !Number.isNaN(Number(raw));
    metricRows.push({
      key,
      label,
      labelAr,
      display: has ? (fmt ? fmt(Number(raw)) : String(raw)) : isRtl ? "غير متاح" : "N/A",
    });
  };
  push("views", "Views", "المشاهدات", formatCount);
  push("like_count", "Likes", "الإعجابات", formatCount);
  push("likes", "Likes", "الإعجابات", formatCount);
  push("comment_count", "Comments", "التعليقات", formatCount);
  push("commentCount", "Comments", "التعليقات", formatCount);
  push("share_count", "Shares", "المشاركات", formatCount);
  push("shares", "Shares", "المشاركات", formatCount);
  push("duration", "Duration", "المدة", formatSeconds);
  push("engagementRate", "Engagement", "نسبة التفاعل", (n) => `${n}%`);
  push("engagemen_rate", "Engagement", "نسبة التفاعل", (n) => `${n}%`);

  // De-duplicate by (label, display).
  const seenKeys = new Set<string>();
  const deduped = metricRows.filter((r) => {
    const k = `${r.label}::${r.display}`;
    if (seenKeys.has(k)) return false;
    seenKeys.add(k);
    return true;
  });

  return (
    <div className="rounded-xl p-6 bg-dark-800/60 border border-gold-500/10">
      <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
        <h3 className="text-sm uppercase tracking-[0.2em] text-gold-400">
          {isRtl ? "بيانات الفيديو الحقيقية (من TikTok)" : "Real Video Data (from TikTok)"}
        </h3>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[11px] font-medium border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          {isRtl ? "من الـ API الرسمي" : "Official API"}
        </span>
      </div>
      {(title || cover) && (
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          {cover && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={cover}
              alt="TikTok video cover"
              className="w-28 h-40 sm:w-32 sm:h-44 object-cover rounded-xl border border-dark-700"
              loading="lazy"
            />
          )}
          {title && (
            <div className="min-w-0">
              <p className="text-white font-medium leading-relaxed line-clamp-3">{title}</p>
              {username && (
                <p className="flex items-center gap-1.5 text-sm text-dark-400 mt-2">
                  <span dir="ltr">@{username}</span>
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {deduped.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
          {deduped.map((m) => (
            <div key={`${m.key}-${m.display}`} className="rounded-lg bg-dark-900/70 border border-dark-700 p-3 text-center">
              <div className="text-lg font-bold text-white">
                {m.display === (isRtl ? "غير متاح" : "N/A") ? (
                  <span className="text-dark-500 text-sm">{m.display}</span>
                ) : (
                  <span className="text-gold-400">{m.display}</span>
                )}
              </div>
              <div className="text-[11px] text-dark-400 mt-1">{isRtl ? m.labelAr : m.label}</div>
            </div>
          ))}
        </div>
      )}

      {hashtags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {hashtags.slice(0, 12).map((h, i) => (
            <span
              key={`${h}-${i}`}
              className="px-2 py-0.5 rounded-full bg-gold-500/10 text-gold-300 text-[11px] border border-gold-500/20"
            >
              #{h}
            </span>
          ))}
        </div>
      )}

      {limitations.length > 0 && (
        <div className="flex items-start gap-2 text-xs text-gold-400/80 bg-gold-500/5 border border-gold-500/10 rounded-lg px-3 py-2">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{limitations.join(" ")}</span>
        </div>
      )}
    </div>
  );
}