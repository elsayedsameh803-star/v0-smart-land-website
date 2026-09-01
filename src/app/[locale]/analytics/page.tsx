"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Loader2,
  LayoutDashboard,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  PieChart,
} from "lucide-react";
import type { PlatformAnalytics } from "@/app/api/analytics/overview/route";
import { UnifiedConnect } from "@/components/connect/UnifiedConnect";
import {
  SummaryCards,
  type SummaryTotals,
} from "@/components/analytics/SummaryCards";
import { PlatformCard } from "@/components/analytics/PlatformCard";

// =============================================================================
// Smart Land — Unified Analytics Dashboard (client)
// =============================================================================
// Renders GET /api/analytics/overview: unified summary cards across ALL
// connected platforms plus a per-platform breakdown below. OAuth flows return
// here with ?<platform>_oauth=success which shows the "linked, fetching…" toast.
// =============================================================================

interface OverviewPayload {
  success: boolean;
  generatedAt?: string;
  totalPlatforms?: number;
  connectedCount?: number;
  configuredCount?: number;
  summary?: SummaryTotals;
  platforms?: PlatformAnalytics[];
}

interface PageProps {
  params: { locale: string };
}

const T: Record<string, Record<string, string>> = {
  en: {
    title: "Unified Analytics",
    subtitle:
      "A single, real-time view of every connected platform — no repeated sign-ins.",
    loading: "Loading your analytics…",
    error: "Could not load analytics. Please refresh.",
    unauth: "Sign in to view a unified analytics dashboard.",
    signIn: "Sign in",
    retry: "Retry",
    justLinked: "Accounts linked successfully — fetching your metrics…",
  },
  ar: {
    title: "التحليلات الموحدة",
    subtitle:
      "نظرة موحّدة ومباشرة لكل منصاتك المرتبطة — بدون تكرار تسجيل الدخول.",
    loading: "جارٍ تحميل تحليلاتك…",
    error: "تعذر تحميل التحليلات. يرجى التحديث.",
    unauth: "سجّل دخولك لعرض لوحة التحليلات الموحدة.",
    signIn: "تسجيل الدخول",
    retry: "إعادة المحاولة",
    justLinked: "تم ربط الحسابات بنجاح — جارٍ جلب المقاييس…",
  },
};

// Skeleton ids rendered as neutral "not connected" cards until the overview
// API responds (it always returns all six platforms once loaded).
const ALL_PLATFORM_IDS = [
  "youtube",
  "facebook",
  "instagram",
  "tiktok",
  "snapchat",
  "linkedin",
] as const;

function getStartPath(platform: string): string {
  switch (platform) {
    case "youtube":
      return "/api/youtube/oauth/start";
    case "facebook":
    case "instagram":
      return "/api/meta/oauth/start";
    case "tiktok":
      return "/api/tiktok/oauth/start";
    case "snapchat":
      return "/api/snapchat/oauth/start";
    case "linkedin":
      return "/api/linkedin/oauth/start";
    default:
      return "";
  }
}

function getDisconnectPath(platform: string): string {
  switch (platform) {
    case "youtube":
      return "/api/youtube/oauth/disconnect";
    case "facebook":
    case "instagram":
      return "/api/meta/oauth/disconnect";
    case "tiktok":
      return "/api/tiktok/oauth/disconnect";
    case "snapchat":
      return "/api/snapchat/oauth/disconnect";
    case "linkedin":
      return "/api/linkedin/oauth/disconnect";
    default:
      return "";
  }
}

export default function AnalyticsPage({ params }: PageProps) {
  const locale = params.locale === "ar" ? "ar" : "en";
  return (
    <Suspense fallback={null}>
      <AnalyticsDashboard locale={locale} />
    </Suspense>
  );
}

function AnalyticsDashboard({ locale }: { locale: string }) {
  const isAr = locale === "ar";
  const t = T[locale] || T.en;
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [connectedCount, setConnectedCount] = useState(0);
  const [totalPlatforms, setTotalPlatforms] = useState<number>(
    ALL_PLATFORM_IDS.length
  );
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const [platforms, setPlatforms] = useState<PlatformAnalytics[]>([]);
  const [summary, setSummary] = useState<SummaryTotals | null>(null);
  const [justLinked, setJustLinked] = useState(false);
  const justLinkedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // "Linked, fetching…" toast when returning from a completed OAuth flow.
  useEffect(() => {
    const flag =
      searchParams.get("meta_oauth") ||
      searchParams.get("youtube_oauth") ||
      searchParams.get("tiktok_oauth") ||
      searchParams.get("snapchat_oauth") ||
      searchParams.get("linkedin_oauth");
    if (flag === "success") {
      setJustLinked(true);
      if (justLinkedTimer.current) clearTimeout(justLinkedTimer.current);
      justLinkedTimer.current = setTimeout(() => setJustLinked(false), 4000);
    }
  }, [searchParams]);

  useEffect(() => {
    return () => {
      if (justLinkedTimer.current) clearTimeout(justLinkedTimer.current);
    };
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/analytics/overview", { cache: "no-store" });
      if (res.status === 401) {
        setError("unauth");
        return;
      }
      if (!res.ok) {
        setError("error");
        return;
      }
      const data = (await res.json()) as OverviewPayload;
      if (data?.success) {
        setPlatforms(Array.isArray(data.platforms) ? data.platforms : []);
        setSummary(data.summary ?? null);
        setGeneratedAt(data.generatedAt ?? null);
        setTotalPlatforms(data.totalPlatforms ?? ALL_PLATFORM_IDS.length);
        setConnectedCount(data.connectedCount ?? 0);
      } else {
        setError("error");
      }
    } catch {
      setError("error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleConnect = useCallback(
    (platform: string) => {
      const path = getStartPath(platform);
      if (!path) return;
      window.location.href = `${path}?return=${encodeURIComponent(
        `/${locale}/analytics`
      )}`;
    },
    [locale]
  );

  const handleDisconnect = useCallback(
    async (platform: string) => {
      const path = getDisconnectPath(platform);
      if (!path) return;
      try {
        await fetch(path, { method: "POST" });
        await load();
      } catch {
        // best-effort — the card will refresh on next load
      }
    },
    [load]
  );

  // Before the API answers, render neutral skeletons for every platform.
  const displayedPlatforms: PlatformAnalytics[] =
    platforms.length > 0
      ? platforms
      : ALL_PLATFORM_IDS.map(
          (id): PlatformAnalytics => ({
            platform: id,
            connected: false,
            configured: false,
            available: false,
            displayName: "",
            accountId: "",
            avatarUrl: null,
            updatedAt: null,
            metrics: [],
          })
        );

  return (
    <div
      className="min-h-screen bg-dark-950 text-white"
      dir={isAr ? "rtl" : "ltr"}
    >
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-gradient-to-br from-gold-500/20 to-gold-600/5 border border-gold-500/20 p-3">
              <LayoutDashboard className="w-6 h-6 text-gold-400" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gold-200 via-gold-400 to-gold-200 bg-clip-text text-transparent">
                {t.title}
              </h1>
              <p className="text-sm text-dark-400 mt-1 max-w-xl">{t.subtitle}</p>
            </div>
          </div>
          <button
            onClick={() => void load()}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-dark-900 border border-gold-500/20 px-4 py-2 text-sm font-semibold text-gold-300 hover:bg-dark-800 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            {t.retry}
          </button>
        </div>

        {/* "Accounts linked" toast */}
        {justLinked && (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/25 px-4 py-3 text-sm text-emerald-300">
            <CheckCircle2 className="w-4 h-4" />
            {t.justLinked}
          </div>
        )}

        {/* Unauthenticated state */}
        {error === "unauth" && (
          <div className="rounded-2xl bg-dark-900 border border-gold-500/10 p-10 text-center space-y-4">
            <AlertCircle className="w-8 h-8 text-gold-400 mx-auto" />
            <p className="text-dark-400">{t.unauth}</p>
            <a
              href={`/${locale}/login?callbackUrl=${encodeURIComponent(
                `/${locale}/analytics`
              )}`}
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-gold-600 to-gold-500 px-5 py-2.5 text-sm font-bold text-dark-950 hover:from-gold-500 hover:to-gold-400 transition"
            >
              {t.signIn}
            </a>
          </div>
        )}

        {/* Connect card + dashboard */}
        {error !== "unauth" && (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <UnifiedConnect
                locale={locale}
                returnPath={`/${locale}/analytics`}
                onConnectionsChanged={(n) => setConnectedCount(n)}
              />
            </div>
            <div className="lg:col-span-2 space-y-6">
              {/* Unified summary across all platforms */}
              <SummaryCards
                locale={locale}
                totals={summary}
                connectedCount={connectedCount}
                totalPlatforms={totalPlatforms}
                generatedAt={generatedAt}
              />

              {/* Fatal error banner */}
              {error === "error" && (
                <div className="flex items-center justify-between rounded-xl bg-rose-500/10 border border-rose-500/25 px-4 py-3">
                  <p className="text-sm text-rose-300">{t.error}</p>
                  <button
                    onClick={() => void load()}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-dark-800 px-3 py-1.5 text-xs font-semibold text-gold-300 hover:bg-dark-700 transition"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> {t.retry}
                  </button>
                </div>
              )}

              {/* Per-platform breakdown */}
              {loading ? (
                <div className="rounded-2xl bg-dark-900 border border-gold-500/10 p-12 text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-gold-400 mx-auto mb-3" />
                  <p className="text-sm text-dark-400">{t.loading}</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <PieChart className="w-4 h-4 text-gold-400" />
                    <h2 className="text-lg font-semibold text-white">
                      {isAr ? "تفاصيل المنصات" : "Platform Details"}
                    </h2>
                  </div>
                  <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {displayedPlatforms.map((p) => (
                      <PlatformCard
                        key={p.platform}
                        locale={locale}
                        data={p}
                        onConnect={handleConnect}
                        onDisconnect={handleDisconnect}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
