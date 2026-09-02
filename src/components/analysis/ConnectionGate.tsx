"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Loader2, 
  Link2, 
  Facebook, 
  Instagram, 
  Youtube,
  Music2,
  Camera,
  Linkedin,
  Globe,
  ArrowRight
} from "lucide-react";
import { getPlatformMeta } from "@/lib/platforms";

interface ConnectionStatus {
  platform: string;
  connected: boolean;
  expired?: boolean;
  requiresConnection: boolean;
  message: string;
  messageAr: string;
  code?: string;
}

interface PropTypes {
  locale: string;
  selectedPlatform: string;
  onConnectionVerified?: (canProceed: boolean) => void;
}

const platformIcons: Record<string, React.ElementType> = {
  facebook: Facebook,
  instagram: Instagram,
  youtube: Youtube,
  tiktok: Music2,
  snapchat: Camera,
  linkedin: Linkedin,
  website: Globe,
};

// Icon + container tint per platform (brand identity kept per-platform).
const platformColors: Record<string, string> = {
  facebook: "text-[#1877F2] bg-[#1877F2]/10",
  instagram: "text-pink-500 bg-pink-500/10",
  youtube: "text-red-500 bg-red-500/10",
  tiktok: "text-cyan-400 bg-cyan-500/10",
  snapchat: "text-yellow-400 bg-yellow-500/10",
  linkedin: "text-blue-600 bg-blue-600/10",
  website: "text-gold-400 bg-gold-500/10",
};

// Button style per platform — each platform keeps its own brand identity.
const platformButtonStyles: Record<string, string> = {
  facebook: "bg-[#1877F2] hover:bg-[#0d65d9] text-white",
  instagram: "bg-gradient-to-r from-pink-500 to-fuchsia-600 hover:from-pink-400 hover:to-fuchsia-500 text-white",
  youtube: "bg-red-500 hover:bg-red-400 text-white",
  tiktok: "bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-white",
  snapchat: "bg-yellow-400 hover:bg-yellow-300 text-dark-950",
  linkedin: "bg-[#0A66C2] hover:bg-[#004182] text-white",
};

export function ConnectionGate({ locale, selectedPlatform, onConnectionVerified }: PropTypes) {
  const isAr = locale === "ar";
  const { data: session, status: sessionStatus } = useSession();
  const [status, setStatus] = useState<ConnectionStatus | null>(null);
  const [checking, setChecking] = useState(false);
  const [oauthFailed, setOauthFailed] = useState(false);

  // Per-platform metadata from the SINGLE source of truth (src/lib/platforms.ts):
  // each platform links through ITS OWN OAuth start route and is analyzed by
  // ITS OWN /api/analyze/<platform> route — no platform borrows another's flow.
  const meta = getPlatformMeta(selectedPlatform);
  const isSocialPlatform = Boolean(meta?.requiresConnection && meta?.connectPath);
  const platformName = meta ? (isAr ? meta.nameAr : meta.name) : selectedPlatform;

  const checkConnections = useCallback(async () => {
    if (!session?.user || !isSocialPlatform) {
      onConnectionVerified?.(true);
      return;
    }

    setChecking(true);
    try {
      const res = await fetch("/api/social/connection-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform: selectedPlatform }),
      });
      const data = await res.json();
      
      if (data.success) {
        setStatus({
          platform: data.platform,
          connected: data.connected,
          expired: data.expired === true,
          requiresConnection: data.requiresConnection,
          message: data.message,
          messageAr: data.messageAr,
          code: data.code,
        });
        onConnectionVerified?.(data.connected);
      } else {
        if (data.code === "auth_required") {
          setStatus({
            platform: selectedPlatform,
            connected: false,
            expired: false,
            requiresConnection: true,
            message: "Please sign in first",
            messageAr: "يرجى تسجيل الدخول أولاً",
            code: "auth_required",
          });
        }
        onConnectionVerified?.(false);
      }
    } catch {
      onConnectionVerified?.(false);
    } finally {
      setChecking(false);
    }
  }, [session, selectedPlatform, isSocialPlatform, onConnectionVerified]);

  useEffect(() => {
    checkConnections();
  }, [checkConnections]);

  // Surface THIS platform's own OAuth return flag (snapchat_oauth /
  // youtube_oauth / meta_oauth / tiktok_oauth / linkedin_oauth). Success needs
  // no banner: the gate re-checks on mount and shows the connected state.
  useEffect(() => {
    const flagParam = meta?.oauthFlagParam;
    if (!flagParam) return;
    try {
      const params = new URLSearchParams(window.location.search);
      const flag = params.get(flagParam);
      if (flag === "success" || flag === "failed") {
        if (flag === "failed") setOauthFailed(true);
        params.delete(flagParam);
        const next =
          params.toString() === ""
            ? window.location.pathname
            : `${window.location.pathname}?${params.toString()}`;
        window.history.replaceState({}, "", next);
      }
    } catch {
      // ignore — flag is best-effort only
    }
  }, [meta]);

  // Start THIS platform's own OAuth flow. Every platform has an independent
  // start route, its own connection cookie, and its own analyze route
  // (see src/lib/platforms.ts) — no platform borrows another platform's flow.
  const handleConnect = useCallback(() => {
    if (!meta?.connectPath) return;
    const returnPath = `${window.location.pathname}${window.location.search}`;
    window.location.href = `${meta.connectPath}?return=${encodeURIComponent(returnPath)}`;
  }, [meta]);

  // Sign-in goes through the standard login page (provider-neutral); it never
  // links a social account by itself. Linking always happens per-platform next.
  const handleSignIn = useCallback(() => {
    const callbackUrl = `${window.location.pathname}${window.location.search}`;
    window.location.href = `/${locale}/login?callbackUrl=${encodeURIComponent(callbackUrl)}`;
  }, [locale]);

  if (!isSocialPlatform) return null;

  if (checking || sessionStatus === "loading") {
    return (
      <div className="rounded-xl p-5 bg-dark-800/40 border border-gold-500/10 mb-4">
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 text-gold-400 animate-spin" />
          <span className="text-sm text-dark-300">
            {isAr ? "جاري فحص حالة الاتصال..." : "Checking connection status..."}
          </span>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="rounded-xl p-5 bg-yellow-500/10 border border-yellow-500/20 mb-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-yellow-300 font-semibold text-sm">
              {isAr ? "تسجيل الدخول مطلوب" : "Sign in required"}
            </h4>
            <p className="text-xs text-yellow-400/80 mt-1">
              {isAr 
                ? `لتحليل ${platformName}، يرجى تسجيل الدخول أولاً ثم ربط حساب ${platformName} الخاص بك.`
                : `To analyze ${platformName}, sign in first, then link your ${platformName} account.`}
            </p>
            <button
              onClick={handleSignIn}
              className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-dark-950 text-sm font-semibold transition-colors"
            >
              {isAr ? "تسجيل الدخول" : "Sign In"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  const connected = Boolean(status?.connected) && !status?.expired;
  if (connected) {
    return (
      <div className="rounded-xl p-5 bg-emerald-500/10 border border-emerald-500/20 mb-4">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-sm text-emerald-300">
            {isAr ? status?.messageAr : status?.message}
          </span>
        </div>
      </div>
    );
  }

  const Icon = platformIcons[selectedPlatform] || Globe;
  const tint = platformColors[selectedPlatform] || "text-gold-400 bg-gold-500/10";
  const buttonStyle =
    platformButtonStyles[selectedPlatform] ||
    "bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-400 text-dark-950";
  const needsReconnect = Boolean(status?.connected) && Boolean(status?.expired);

  return (
    <div
      className={`rounded-xl p-5 mb-4 border ${
        needsReconnect
          ? "bg-amber-500/10 border-amber-500/20"
          : "bg-red-500/10 border-red-500/20"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${tint}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h4 className={`font-semibold text-sm ${needsReconnect ? "text-amber-300" : "text-red-300"}`}>
            {needsReconnect
              ? isAr
                ? `انتهت صلاحية ربط حساب ${platformName}`
                : `Your ${platformName} connection has expired`
              : isAr
                ? `حساب ${platformName} غير مرتبط`
                : `${platformName} account not connected`}
          </h4>
          <p className={`text-xs mt-1 ${needsReconnect ? "text-amber-400/80" : "text-red-400/80"}`}>
            {needsReconnect
              ? isAr
                ? `أعد ربط حساب ${platformName} للمتابعة — تحليل ${platformName} يعتمد على رابط حساب ${platformName} الخاص فقط.`
                : `Reconnect your ${platformName} account to continue — ${platformName} analysis relies solely on its own account link.`
              : isAr
                ? `تحليل ${platformName} يتطلب ربط حساب ${platformName} — لكل منصة رابطها وتحليلها الخاص، ولا يمكن استخدام حساب منصة أخرى بديلاً عنها.`
                : `Analyzing ${platformName} requires linking a ${platformName} account — each platform has its own link and its own analysis; an account from another platform cannot be used instead.`}
          </p>

          {oauthFailed && (
            <p className="mt-2 flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-xs text-red-300">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              {isAr
                ? `تعذّر إكمال ربط ${platformName}. يرجى المحاولة مرة أخرى.`
                : `${platformName} linking could not be completed. Please try again.`}
            </p>
          )}

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={handleConnect}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${buttonStyle}`}
            >
              <Link2 className="w-4 h-4" />
              {needsReconnect
                ? isAr
                  ? `إعادة ربط حساب ${platformName}`
                  : `Reconnect ${platformName}`
                : isAr
                  ? `ربط حساب ${platformName}`
                  : `Connect ${platformName}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
