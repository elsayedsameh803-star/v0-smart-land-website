"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Loader2,
  Link2,
  X,
  AlertTriangle,
  Globe,
  Youtube,
  Facebook,
  Instagram,
  Music2,
  Camera,
  Linkedin,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type PlatformId =
  | "youtube"
  | "facebook"
  | "instagram"
  | "tiktok"
  | "snapchat"
  | "linkedin";

interface ConnectionStatusInfo {
  platform: string;
  connected: boolean;
  usable: boolean;
  displayName: string;
  accountId: string;
  connectedAt: string | null;
  scope: string;
  needsReconnect: boolean;
  canRefresh: boolean;
  configured?: boolean;
}

interface UnifiedConnectProps {
  locale: string;
  /** Optional page to return to after OAuth completes. Defaults to current path. */
  returnPath?: string;
  /** Show a compact row instead of the full card. */
  compact?: boolean;
  /** Called after the connection statuses refresh. */
  onConnectionsChanged?: (connectedCount: number) => void;
}

const PLATFORM_META: Record<
  PlatformId,
  { name: string; nameAr: string; bg: string; icon: React.ElementType }
> = {
  youtube: {
    name: "YouTube",
    nameAr: "يوتيوب",
    bg: "bg-red-500/15 text-red-400 border-red-500/30",
    icon: Youtube,
  },
  facebook: {
    name: "Facebook",
    nameAr: "فيسبوك",
    bg: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    icon: Facebook,
  },
  instagram: {
    name: "Instagram",
    nameAr: "إنستجرام",
    bg: "bg-pink-500/15 text-pink-400 border-pink-500/30",
    icon: Instagram,
  },
  tiktok: {
    name: "TikTok",
    nameAr: "تيك توك",
    bg: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
    icon: Music2,
  },
  snapchat: {
    name: "Snapchat",
    nameAr: "سناب شات",
    bg: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
    icon: Camera,
  },
  linkedin: {
    name: "LinkedIn",
    nameAr: "لينكد إن",
    bg: "bg-blue-600/15 text-blue-500 border-blue-600/30",
    icon: Linkedin,
  },
};

const PLATFORM_ORDER: PlatformId[] = [
  "youtube",
  "facebook",
  "instagram",
  "tiktok",
  "snapchat",
  "linkedin",
];

const T: Record<string, Record<string, string>> = {
  en: {
    title: "Connect accounts in one click",
    subtitle:
      "Link your social platforms once to unlock real analytics for all of them. No repeated sign-ins.",
    connectAll: "Connect all",
    connectAllBusy: "Connecting…",
    connected: "Connected",
    notConnected: "Not connected",
    needsReconnect: "Needs reconnect",
    notConfigured: "Setup needed",
    loginFirst: "Sign in to connect your accounts.",
    goToLogin: "Sign in",
    connect: "Connect",
    reconnect: "Reconnect",
    disconnect: "Disconnect",
    refresh: "Refresh",
    openDash: "Open analytics",
    compactLabel: "Connect accounts",
  },
  ar: {
    title: "اربط حساباتك بضغطة واحدة",
    subtitle:
      "اربط منصاتك الاجتماعية مرة واحدة فقط لتظهر بياناتك الحقيقية في لوحة تحليلات موحّدة. بدون تسجيل دخول متكرر.",
    connectAll: "ربط الكل",
    connectAllBusy: "جارٍ الربط…",
    connected: "مرتبط",
    notConnected: "غير مرتبط",
    needsReconnect: "يحتاج إعادة ربط",
    notConfigured: "يتطلب إعداداً",
    loginFirst: "سجّل دخولك أولاً لربط حساباتك.",
    goToLogin: "تسجيل الدخول",
    connect: "ربط",
    reconnect: "إعادة الربط",
    disconnect: "إلغاء الربط",
    refresh: "تحديث",
    openDash: "فتح التحليلات",
    compactLabel: "ربط حساباتي",
  },
};

function getStartPath(platform: PlatformId): string {
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
  }
}

function getDisconnectPath(platform: PlatformId): string {
  switch (platform) {
    case "facebook":
    case "instagram":
      return "/api/meta/oauth/disconnect";
    case "youtube":
      return "/api/youtube/oauth/disconnect";
    case "tiktok":
      return "/api/tiktok/oauth/disconnect";
    case "snapchat":
      return "/api/snapchat/oauth/disconnect";
    case "linkedin":
      return "/api/linkedin/oauth/disconnect";
  }
}
export function UnifiedConnect({
  locale,
  returnPath,
  compact = false,
  onConnectionsChanged,
}: UnifiedConnectProps) {
  const isAr = locale === "ar";
  const t = T[locale] || T.en;
  const { data: session, status: sessionStatus } = useSession();
  const [connections, setConnections] = useState<Record<string, ConnectionStatusInfo>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");

  const loadConnections = useCallback(async () => {
    try {
      const res = await fetch("/api/connections");
      if (res.ok) {
        const data = await res.json();
        if (data?.connections && Array.isArray(data.connections)) {
          const record: Record<string, ConnectionStatusInfo> = {};
          for (const c of data.connections) {
            if (c?.platform) record[c.platform] = c;
          }
          setConnections(record);
          const count = data.connections.filter(
            (c: any) => c?.connected && !c?.needsReconnect
          ).length;
          onConnectionsChanged?.(count);
        }
      }
    } catch {
      // ignore transient network errors
    }
  }, [onConnectionsChanged]);

  useEffect(() => {
    loadConnections();
  }, [loadConnections]);

  const doStart = useCallback(
    async (platform: PlatformId) => {
      if (sessionStatus === "loading") return;
      if (!session?.user) {
        window.location.href = `/${locale}/login?callbackUrl=${encodeURIComponent(
          returnPath || window.location.pathname
        )}`;
        return;
      }
      setBusyId(platform);
      setError("");
      try {
        const path = getStartPath(platform);
        const returnTarget =
          returnPath || `${window.location.pathname}${window.location.search}`;
        window.location.href = `${path}?return=${encodeURIComponent(returnTarget)}`;
      } catch {
        setError(
          isAr
            ? "تعذر بدء الربط. حاول مرة أخرى."
            : "Could not start the connection. Please try again."
        );
        setBusyId(null);
      }
    },
    [session, sessionStatus, locale, returnPath, isAr]
  );

  const doDisconnect = useCallback(
    async (platform: PlatformId) => {
      setBusyId(platform);
      setError("");
      try {
        const res = await fetch(getDisconnectPath(platform), { method: "POST" });
        if (res.ok) await loadConnections();
      } catch {
        setError(isAr ? "تعذر إلغاء الربط." : "Could not disconnect.");
      }
      setBusyId(null);
    },
    [loadConnections, isAr]
  );

  const connectedCount = Object.values(connections).filter(
    (c) => c?.connected && !c?.needsReconnect
  ).length;
const renderPlatforms = () =>
    PLATFORM_ORDER.map((p) => {
      const meta = PLATFORM_META[p];
      const status = connections[p];
      const isConnected = status?.connected && !status?.needsReconnect;
      const needsReconnect = status?.connected && !!status?.needsReconnect;
      const notConfigured = status?.configured === false;
      const Icon = meta.icon;
      return (
        <div
          key={p}
          className={cn(
            "flex items-center gap-3 rounded-xl border p-3 transition",
            notConfigured
              ? "bg-dark-800/40 border-dark-700 opacity-70"
              : isConnected
              ? "bg-emerald-500/5 border-emerald-500/20"
              : needsReconnect
              ? "bg-amber-500/5 border-amber-500/20"
              : "bg-dark-800/60 border-gold-500/10"
          )}
        >
          <div
            className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center border",
              meta.bg
            )}
          >
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              {isAr ? meta.nameAr : meta.name}
            </p>
            {isConnected ? (
              <p className="text-xs text-emerald-300 truncate">
                {t.connected} · {status?.displayName || "—"}
              </p>
            ) : notConfigured ? (
              <p className="text-xs text-dark-400">{t.notConfigured}</p>
            ) : needsReconnect ? (
              <p className="text-xs text-amber-300">{t.needsReconnect}</p>
            ) : (
              <p className="text-xs text-dark-400">{t.notConnected}</p>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            {isConnected ? (
              <button
                onClick={() => doDisconnect(p)}
                disabled={busyId === p || sessionStatus === "loading"}
                className="inline-flex items-center gap-1 rounded-lg bg-rose-500/15 border border-rose-500/30 px-2.5 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/25 transition disabled:opacity-50"
              >
                {busyId === p ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <X className="w-3 h-3" />
                )}
                {t.disconnect}
              </button>
            ) : notConfigured ? (
              <span className="inline-flex items-center gap-1 rounded-lg bg-dark-800 border border-dark-700 px-2.5 py-1.5 text-xs text-dark-400">
                <AlertTriangle className="w-3 h-3" /> {t.notConfigured}
              </span>
            ) : (
              <button
                onClick={() => doStart(p)}
                disabled={busyId === p || sessionStatus === "loading"}
                className={cn(
                  "inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition disabled:opacity-50",
                  needsReconnect
                    ? "bg-amber-500/15 border-amber-500/30 text-amber-300 hover:bg-amber-500/25"
                    : "bg-gradient-to-r from-gold-600 to-gold-500 border-transparent text-dark-950 hover:from-gold-500 hover:to-gold-400"
                )}
              >
                {busyId === p ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Link2 className="w-3 h-3" />
                )}
                {needsReconnect ? t.reconnect : t.connect}
              </button>
            )}
          </div>
        </div>
      );
    });
// Compact row
  if (compact) {
    return (
      <div className="w-full">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between gap-2 rounded-xl border border-gold-500/20 bg-dark-800/60 px-4 py-3 text-sm font-semibold text-white hover:bg-dark-800 transition"
        >
          <span className="flex items-center gap-2">
            <Link2 className="w-4 h-4 text-gold-400" />
            {t.compactLabel}
            {connectedCount > 0 && (
              <span className="rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] px-2 py-0.5">
                {connectedCount}
              </span>
            )}
          </span>
          <ChevronDown
            className={cn("w-4 h-4 text-gold-400 transition", open ? "rotate-180" : "")}
          />
        </button>
        {open && <div className="mt-3 space-y-2">{renderPlatforms()}</div>}
      </div>
    );
  }

  // Full card
  return (
    <div className="rounded-2xl bg-dark-900 border border-gold-500/10 p-6 shadow-xl">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-gold-500/10 border border-gold-500/20 px-3 py-1 text-xs text-gold-300">
            <Sparkles className="w-3.5 h-3.5" /> {t.title}
          </div>
          <h3 className="mt-3 text-xl font-bold text-white">{t.title}</h3>
          <p className="mt-1 text-sm text-dark-400">{t.subtitle}</p>
        </div>
        {connectedCount > 0 ? (
          <div className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 text-sm font-semibold text-emerald-300">
            {connectedCount}/{PLATFORM_ORDER.length} {t.connected}
          </div>
        ) : null}
      </div>

      <div className="mt-5">
        {sessionStatus === "loading" ? (
          <div className="flex items-center justify-center py-10 text-dark-400">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        ) : !session?.user ? (
          <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
            <Globe className="w-8 h-8 text-gold-400" />
            <p className="text-dark-400 max-w-sm">{t.loginFirst}</p>
            <a
              href={`/${locale}/login?callbackUrl=${encodeURIComponent(
                returnPath || window.location.pathname
              )}`}
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-gold-600 to-gold-500 px-5 py-2.5 text-sm font-bold text-dark-950 hover:from-gold-500 hover:to-gold-400 transition"
            >
              {t.goToLogin}
            </a>
          </div>
        ) : (
          <div className="space-y-2">{renderPlatforms()}</div>
        )}
      </div>

      {session?.user ? (
        <div className="mt-5 border-t border-gold-500/10 pt-4">
          {error && (
            <p className="mb-3 flex items-center gap-2 rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-2 text-xs text-amber-300">
              <AlertTriangle className="w-3.5 h-3.5" /> {error}
            </p>
          )}
          <button
            onClick={() => {
              // If any platform is still unconnected & ready, start its OAuth;
              // otherwise open the analytics dashboard.
              const next = PLATFORM_ORDER.find(
                (p) =>
                  connections[p]?.connected !== true &&
                  connections[p]?.configured !== false
              );
              if (next) void doStart(next);
              else window.location.href = `/${locale}/analytics`;
            }}
            disabled={busyId !== null || sessionStatus !== "authenticated"}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gold-600 to-gold-500 px-5 py-3 text-sm font-bold text-dark-950 hover:from-gold-500 hover:to-gold-400 transition disabled:opacity-60"
          >
            {busyId ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Link2 className="w-4 h-4" />
            )}
            {busyId
              ? t.connectAllBusy
              : `${t.openDash} · ${connectedCount}/${PLATFORM_ORDER.length}`}
          </button>
        </div>
      ) : null}

      <div className="mt-3 flex items-center justify-between">
        <button
          onClick={loadConnections}
          disabled={sessionStatus === "loading"}
          className="inline-flex items-center gap-1.5 text-xs text-dark-400 hover:text-gold-300 transition"
        >
          <Loader2
            className={cn(
              "w-3.5 h-3.5",
              sessionStatus === "loading" ? "animate-spin" : ""
            )}
          />
          {t.refresh}
        </button>
      </div>
    </div>
  );
}