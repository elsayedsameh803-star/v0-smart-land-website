"use client";

import {
  Users,
  Eye,
  MousePointerClick,
  MessageSquare,
  FileVideo,
  ThumbsUp,
  Activity,
  Link2,
  Unlink,
  AlertTriangle,
} from "lucide-react";
import type { PlatformAnalytics, AnalyticsMetric } from "@/app/api/analytics/overview/route";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, React.ElementType> = {
  followers: Users,
  reach: Eye,
  impressions: MousePointerClick,
  engagement: MessageSquare,
  content: FileVideo,
  views: Activity,
  likes: ThumbsUp,
};

const BRIEF_COLORS: Record<string, string> = {
  youtube: "text-red-400",
  facebook: "text-blue-400",
  instagram: "text-pink-400",
  tiktok: "text-cyan-400",
  snapchat: "text-yellow-400",
  linkedin: "text-blue-500",
};

function formatMetric(n: number | null): string {
  if (n === null) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(n);
}

interface PlatformCardProps {
  locale: string;
  data: PlatformAnalytics;
  onConnect: (platform: string) => void;
  onDisconnect: (platform: string) => void;
}

const T: Record<string, Record<string, string>> = {
  en: {
    connected: "Connected",
    notConnected: "Not connected",
    unavailable: "Metrics temporarily unavailable",
    unavailableSub:
      "This platform requires additional permissions or is not linked yet.",
    setupNeeded: "Credentials not configured on the server.",
    connect: "Connect",
    disconnect: "Disconnect",
    last: "Updated",
    reconnectNeeded: "Connection expired — reconnect required",
    reconnectNeededSub:
      "Your linked account's authorization has expired. Reconnect it to keep your analytics up to date.",
    reconnectBtn: "Reconnect account",
  },
  ar: {
    connected: "مرتبط",
    notConnected: "غير مرتبط",
    unavailable: "المقاييس غير متاحة مؤقتاً",
    unavailableSub: "تتطلب هذه المنصة أذونات إضافية أو لم تُربط بعد.",
    setupNeeded: "بيانات الاعتماد غير مكوّنة على الخادم.",
    connect: "ربط",
    disconnect: "إلغاء الربط",
    last: "آخر تحديث",
    reconnectNeeded: "انتهت صلاحية الربط — مطلوب إعادة الربط",
    reconnectNeededSub:
      "صلاحية تفويض حسابك المنتهية أوقفت جلب التحليلات الحقيقية. اضغط إعادة الربط لتسجيل الدخول من جديد.",
    reconnectBtn: "إعادة الربط",
  },
};
export function PlatformCard({ locale, data, onConnect, onDisconnect }: PlatformCardProps) {
  const isAr = locale === "ar";
  const t = T[locale] || T.en;
  const isConnected = data.connected;
  const platformLabel = data.platform.charAt(0).toUpperCase() + data.platform.slice(1);
  const briefColor = BRIEF_COLORS[data.platform] || "text-gold-400";

  return (
    <div
      className={cn(
        "rounded-2xl border p-5 flex flex-col gap-4",
        isConnected
          ? "bg-dark-900 border-gold-500/20"
          : "bg-dark-900/60 border-dark-700"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-11 h-11 rounded-xl bg-dark-800 border border-gold-500/10 flex items-center justify-center",
              briefColor
            )}
          >
            <span className="text-lg font-black uppercase">
              {data.platform.charAt(0)}
            </span>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{platformLabel}</p>
            <p className="text-xs text-dark-400 truncate max-w-[160px]">
              {data.displayName || (isAr ? "غير مرتبط" : "Not linked")}
            </p>
          </div>
        </div>
        <div
          className={cn(
            "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold",
            isConnected
              ? "bg-emerald-500/15 text-emerald-300"
              : "bg-dark-800 text-dark-400"
          )}
        >
          {isConnected ? (
            <>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              {t.connected}
            </>
          ) : (
            <>
              <span className="h-1.5 w-1.5 rounded-full bg-dark-500" />
              {t.notConnected}
            </>
          )}
        </div>
      </div>

      {/* Body */}
      {isConnected && data.available ? (
        <>
          {data.needsReconnect && (
            <div className="flex items-center gap-2 rounded-xl bg-amber-500/10 border border-amber-500/25 px-3 py-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
              <p className="text-[11px] font-medium text-amber-300">
                {(isAr && data.statusMessageAr) ||
                  data.statusMessage ||
                  t.reconnectNeeded}
              </p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-2">
          {data.metrics.map((m: AnalyticsMetric) => {
            const Icon = ICON_MAP[m.key] || Activity;
            const shown = m.available && m.value !== null && m.value > 0;
            return (
              <div key={m.key} className="rounded-xl bg-dark-800/50 p-3">
                <div className="flex items-center justify-between gap-1">
                  <p className="flex items-center gap-1 text-[11px] text-dark-400">
                    <Icon className="w-3.5 h-3.5" />
                    {isAr ? m.labelAr : m.label}
                  </p>
                </div>
                <p className="mt-1 text-lg font-bold text-white tabular-nums">
                  {formatMetric(m.value)}
                </p>
                {shown ? (
                  <div className="mt-2 h-1.5 w-full rounded-full bg-dark-700 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-gold-600 to-gold-400"
                      style={{ width: "100%" }}
                    />
                  </div>
                ) : (
                  <p className="mt-1 text-[10px] text-dark-500">
                    {isAr ? "غير متاح" : "unavailable"}
                  </p>
                )}
              </div>
            );
          })}
          </div>
        </>
      ) : isConnected && !data.available ? (
        data.needsReconnect ? (
          <div className="rounded-xl bg-amber-500/10 border border-amber-500/25 p-4 text-center">
            <AlertTriangle className="w-5 h-5 text-amber-400 mx-auto mb-1" />
            <p className="text-xs font-semibold text-amber-300">
              {(isAr && data.statusMessageAr) ||
                data.statusMessage ||
                t.reconnectNeeded}
            </p>
            <p className="text-[11px] text-dark-400 mt-0.5">
              {t.reconnectNeededSub}
            </p>
          </div>
        ) : (
          <div className="rounded-xl bg-dark-800/50 border border-amber-500/20 p-4 text-center">
            <AlertTriangle className="w-5 h-5 text-amber-400 mx-auto mb-1" />
            <p className="text-xs text-amber-300">{t.unavailable}</p>
            <p className="text-[11px] text-dark-400 mt-0.5">{t.unavailableSub}</p>
          </div>
        )
      ) : (
        <div className="rounded-xl bg-dark-800/50 p-4 text-center text-xs text-dark-400">
          {data.configured ? t.notConnected : t.setupNeeded}
        </div>
      )}

      {/* Footer */}
      <div className="mt-auto flex items-center justify-between gap-2 pt-1">
        {data.updatedAt ? (
          <p className="text-[11px] text-dark-500">
            {t.last} ·{" "}
            {new Date(data.updatedAt).toLocaleDateString(isAr ? "ar-EG" : "en-US")}
          </p>
        ) : (
          <span />
        )}
        {isConnected && data.needsReconnect ? (
          <button
            onClick={() => onConnect(data.platform)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-gold-600 to-gold-500 px-3 py-1.5 text-xs font-bold text-dark-950 hover:from-gold-500 hover:to-gold-400 transition"
          >
            <Link2 className="w-3.5 h-3.5" /> {t.reconnectBtn}
          </button>
        ) : isConnected ? (
          <button
            onClick={() => onDisconnect(data.platform)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-rose-500/15 border border-rose-500/30 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/25 transition"
          >
            <Unlink className="w-3.5 h-3.5" /> {t.disconnect}
          </button>
        ) : (
          <button
            onClick={() => onConnect(data.platform)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-gold-600 to-gold-500 px-3 py-1.5 text-xs font-bold text-dark-950 hover:from-gold-500 hover:to-gold-400 transition"
          >
            <Link2 className="w-3.5 h-3.5" /> {t.connect}
          </button>
        )}
      </div>
    </div>
  );
}