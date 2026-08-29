"use client";

import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { Facebook, Instagram, Loader2, CheckCircle2, XCircle, Link2 } from "lucide-react";
import type { AnalysisResult } from "@/lib/types";

// =============================================================================
// SocialLinkPrompt — shown on the analysis results when the platform reports
// that a page/account is private or hidden behind a login wall, and REAL
// precision analytics require the visitor to LINK their social account.
//
//   * Facebook / Instagram → links via the Meta `facebook-meta` provider
//   * TikTok                → links via /api/tiktok/oauth/start (own card)
//
// The tokens stay on the server (NextAuth JWT / encrypted HttpOnly cookie) and
// after a successful link the visitor is redirected BACK instantly to the exact
// page they were on, where the pending analysis resumes automatically.
// =============================================================================

interface PropTypes {
  platform: string;
  result: AnalysisResult | null;
  locale: string;
}

type LinkFlag = "success" | "failed" | null;

export function SocialLinkPrompt({ platform, result, locale }: PropTypes) {
  const isAr = locale === "ar";
  const { data: session, status } = useSession();
  const [linking, setLinking] = useState(false);
  const [flag, setFlag] = useState<LinkFlag>(null);

  // Only Facebook/Instagram need this prompt — TikTok already shows its own
  // connect card on the results page.
  const d: any = result?.socialData || {};
  const requiresLinking = d.requiresLinking === true;
  const isPrivate = d.isPrivate === true;

  // Read the OAuth return flag from the URL (set by our own callbackUrl), then
  // immediately clean it so it can never re-trigger.
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const f = params.get("meta_oauth");
      if (f === "success" || f === "failed") {
        setFlag(f);
        params.delete("meta_oauth");
        const next =
          params.toString() === ""
            ? window.location.pathname
            : `${window.location.pathname}?${params.toString()}`;
        window.history.replaceState({}, "", next);
      }
    } catch {
      // ignore — flag is best-effort only
    }
  }, []);

  // No prompt when there is nothing to unlock (fully public data) or when the
  // platform has no linking flow (the leading early return is only AFTER all
  // hooks so the rules of hooks are always satisfied).
  if (platform !== "facebook" && platform !== "instagram") return null;
  if (!requiresLinking) return null;

  const alreadyConnected = status === "authenticated" && Boolean(session?.accessToken);

  const connect = () => {
    setLinking(true);
    let callbackUrl = "/";
    try {
      const path = window.location.pathname;
      const params = new URLSearchParams(window.location.search);
      params.set("meta_oauth", "success");
      callbackUrl = `${path}?${params.toString()}`;
    } catch {
      // fallback below
    }
    // Redirect to the current page after the Meta OAuth finishes — no extra
    // steps, the pending analysis resumes automatically from sessionStorage.
    void signIn("facebook-meta", { callbackUrl });
  };

  const title = isAr
    ? platform === "instagram"
      ? "حساب إنستغرام خاص أو محجوب"
      : "صفحة فيسبوك خاصة أو محجوبة"
    : platform === "instagram"
      ? "Private or hidden Instagram account"
      : "Private or hidden Facebook page";

  const body = isAr
    ? "بيانات هذا الحساب غير متاحة للجمهور بالكامل. اربط حساب فيسبوك الخاص بك بسمارت لاند (مرة واحدة فقط) لفتح تحليلات دقيقة للصفحات والصفحات التجارية المرتبطة بها — ويتم تحويلك تلقائياً إلى هنا بعد الربط مباشرة."
    : "This account's data is not fully public. Link your Facebook account to Smart Land (only once) to unlock precise analytics for this page and any linked business pages — you are automatically sent right back here after linking.";

  return (
    <div className="rounded-xl p-6 bg-dark-800/60 border border-gold-500/20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1877F2]/10 border border-[#1877F2]/30 flex items-center justify-center shrink-0">
            {platform === "instagram" ? (
              <Instagram className="w-5 h-5 text-pink-500" />
            ) : (
              <Facebook className="w-5 h-5 text-[#1877F2]" />
            )}
          </div>
          <div className="min-w-0">
            <h4 className="text-white font-semibold text-sm">{title}</h4>
            <p className="text-xs text-dark-400 mt-1 max-w-xl leading-relaxed">{body}</p>
            {isPrivate && (
              <p className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-red-500/10 border border-red-500/20 px-2 py-0.5 text-[11px] text-red-400">
                <XCircle className="w-3 h-3" />
                {isAr ? "الحساب خاص" : "Private account"}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {alreadyConnected ? (
            <>
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                {isAr ? "حساب فيسبوك متصل" : "Facebook connected"}
              </span>
              <a
                href={`/${locale}/social`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-gold-500 to-gold-400 text-dark-950 text-sm font-semibold hover:from-gold-400 hover:to-gold-300 transition-all"
              >
                <Link2 className="w-4 h-4" />
                {isAr ? "تحليلات الصفحات" : "Page analytics"}
              </a>
            </>
          ) : (
            <button
              onClick={connect}
              disabled={linking || status === "loading"}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#1877F2] hover:bg-[#0d65d9] text-white text-sm font-semibold transition-colors disabled:opacity-60"
            >
              {linking ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Facebook className="w-4 h-4" />
              )}
              {isAr ? "ربط حساب فيسبوك" : "Connect Facebook"}
            </button>
          )}
        </div>
      </div>

      {flag === "success" && (
        <div className="mt-3 flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          {isAr
            ? "تم ربط حساب فيسبوك بنجاح — أعد التحليل الآن للحصول على بيانات أدق."
            : "Facebook connected successfully — re-run the analysis for more precise data."}
        </div>
      )}
      {flag === "failed" && (
        <div className="mt-3 flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
          <XCircle className="w-4 h-4 shrink-0" />
          {isAr
            ? "تعذّر إتمام الربط. يرجى المحاولة مجدداً."
            : "Could not complete the link. Please try again."}
        </div>
      )}
    </div>
  );
}