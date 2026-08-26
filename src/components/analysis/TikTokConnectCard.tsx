"use client";

import { useEffect, useState, useCallback } from "react";
import { Link2, Link2Off, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { saveConnectedSocialAccount } from "@/lib/social-links";

// =============================================================================
// TikTokConnectCard — lets a visitor authorize their TikTok account so the
// Display API can read REAL metrics. The tokens stay server-side (HttpOnly
// encrypted cookie). This component only triggers the OAuth flow; secrets
// never enter the browser.
// =============================================================================

interface PropTypes {
  locale: string;
}

export function TikTokConnectCard({ locale }: PropTypes) {
  const isRtl = locale === "ar";
  const [status, setStatus] = useState<"loading" | "connected" | "disconnected">("loading");
  const [displayName, setDisplayName] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/tiktok/oauth/status", { cache: "no-store" });
      const json = await res.json();
      if (json.connected) {
        setStatus("connected");
        setDisplayName(json.displayName || "");
      } else {
        setStatus("disconnected");
      }
    } catch {
      setStatus("disconnected");
    }
  }, []);

  useEffect(() => {
    refresh();
    // Read the callback result flag from the URL (set by our own redirect).
    const flag = new URLSearchParams(window.location.search).get("tiktok_oauth");
    if (flag === "success") {
      setMessage(isRtl ? "تم ربط حساب تيك توك بنجاح" : "TikTok account connected");
      try {
        saveConnectedSocialAccount({
          platform: "tiktok",
          accountId: displayName || `tiktok-${Date.now()}`,
          name: displayName || "TikTok",
          linkedAt: new Date().toISOString(),
          connectedAt: Date.now(),
          valid: true,
        });
      } catch {
        // non-fatal localStorage write
      }
      refresh();
    } else if (flag === "failed") {
      setMessage(isRtl ? "فشل ربط حساب تيك توك، يرجى المحاولة مجدداً" : "Failed to connect TikTok account");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const connect = () => {
    const currentPage =
      typeof window !== "undefined"
        ? `${window.location.pathname}${window.location.search}`
        : "";
    const returnPath = currentPage && currentPage !== "/" ? currentPage : "";
    window.location.href = `/api/tiktok/oauth/start?return=${encodeURIComponent(returnPath || "/")}`;
  };

  const disconnect = async () => {
    try {
      await fetch("/api/tiktok/oauth/disconnect", { method: "POST" });
      setStatus("disconnected");
      setDisplayName("");
    } catch {
      // ignore — the card just stays in its current state
    }
  };

  return (
    <div className="rounded-xl p-5 bg-dark-800/40 border border-gold-500/10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
            {status === "loading" ? (
              <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
            ) : status === "connected" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            ) : (
              <Link2 className="w-5 h-5 text-cyan-400" />
            )}
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm">
              {isRtl ? "ربط حساب تيك توك" : "Connect TikTok account"}
            </h4>
            <p className="text-xs text-dark-400 mt-1 max-w-md">
              {isRtl
                ? "ربط حسابك يسمح لنا بقراءة بيانات فيديوهاتك الرسمية عبر TikTok Display API (المشاهدات، الإعجابات، التعليقات، المشاركات). تُخزَّن بيانات الدخول في الخادم فقط."
                : "Connecting lets us read real metrics for your own videos via the TikTok Display API (views, likes, comments, shares). Tokens stay on the server only."}
            </p>
            {status === "connected" && displayName && (
              <p className="text-xs text-emerald-400 mt-1">
                {isRtl ? `متصل: ${displayName}` : `Connected as: ${displayName}`}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {status === "connected" ? (
            <button
              onClick={disconnect}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-dark-600 text-dark-300 text-sm hover:bg-dark-700/40 transition-colors"
            >
              <Link2Off className="w-4 h-4" />
              {isRtl ? "إلغاء الربط" : "Disconnect"}
            </button>
          ) : (
            <button
              onClick={connect}
              disabled={status === "loading"}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-cyan-600 text-white text-sm font-semibold hover:from-cyan-400 hover:to-cyan-500 transition-all disabled:opacity-50"
            >
              {isRtl ? "ربط حساب تيك توك" : "Connect TikTok"}
            </button>
          )}
        </div>
      </div>

      {message && (
        <div
          className={`mt-3 flex items-center gap-2 text-xs rounded-lg px-3 py-2 border ${
            message.includes("نجاح") || message.toLowerCase().includes("connected")
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              : "bg-red-500/10 text-red-400 border-red-500/20"
          }`}
        >
          {message.includes("فشل") || message.toLowerCase().includes("fail") ? (
            <XCircle className="w-4 h-4 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          )}
          <span>{message}</span>
        </div>
      )}
    </div>
  );
}