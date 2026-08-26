"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { Facebook, Instagram, RefreshCw, LogOut, CheckCircle2, Loader2 } from "lucide-react";
import { saveConnectedSocialAccount, removeConnectedSocialAccount } from "@/lib/social-links";

interface MetaOverview {
  pages?: Array<{
    id: string;
    name: string;
    link?: string | null;
    picture?: string | null;
    insights?: Record<string, number>;
    instagram?: { id: string; insights?: Record<string, number> } | null;
  }>;
  count?: number;
}

/**
 * Client component: "Connect with Facebook" button + connected analytics
 * summary fetched from the /api/meta/overview proxy (token stays server side).
 */
export function MetaConnect({ locale = "en" }: { locale?: string }) {
  const isAr = locale === "ar";
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [overview, setOverview] = useState<MetaOverview | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session?.accessToken) void loadAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.accessToken]);

  async function loadAnalytics() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/meta/overview");
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to load analytics");
      setOverview(json);
      // Persist the connected accounts so we never re-request OAuth while valid.
      try {
        if (Array.isArray(json?.pages) && json.pages.length > 0) {
          saveConnectedSocialAccount({
            platform: "facebook",
            accountId: json.pages[0].id,
            name: json.pages[0].name,
            linkedAt: new Date().toISOString(),
            connectedAt: Date.now(),
            valid: true,
          });
        }
        if (json?.pages?.some((p: any) => p?.instagram)) {
          saveConnectedSocialAccount({
            platform: "instagram",
            accountId: "instagram-" + Date.now(),
            name: "Instagram",
            linkedAt: new Date().toISOString(),
            connectedAt: Date.now(),
            valid: true,
          });
        }
      } catch {
        // non-fatal
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }

  if (status === "loading") {
    return (
      <div className="flex items-center gap-2 text-sm text-dark-400">
        <Loader2 className="w-4 h-4 animate-spin" />
        {isAr ? "جارٍ التحقق من الجلسة…" : "Checking session…"}
      </div>
    );
  }

  if (!session?.accessToken) {
    return (
      <div className="rounded-2xl bg-dark-900 border border-gold-500/20 p-8 space-y-4">
        <h2 className="text-lg font-semibold text-white">
          {isAr ? "ربط حسابات فيسبوك وإنستجرام" : "Connect Facebook & Instagram"}
        </h2>
        <p className="text-sm text-dark-400">
          {isAr
            ? "سجّل الدخول بحساب فيسبوك لتحليل صفحاتك وحساب إنستجرام بصلاحيات دقيقة (الجمهور، التفاعل، الوصول). الربط إجراء صريح منفصل عن تسجيل دخولك لسمارت لاند."
            : "Sign in with Facebook to analyze your Pages and Instagram account with precise insights (audience, engagement, reach). Linking is an explicit action, separate from your Smart Land login."}
        </p>
        <button
          onClick={() => signIn("facebook-meta", { callbackUrl: `/${locale}/social` })}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-[#1877F2] hover:bg-[#0d65d9] transition"
        >
          <Facebook className="w-4 h-4" />
          {isAr ? "ربط فيسبوك للتحليلات" : "Link Facebook for analytics"}
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-dark-900 border border-gold-500/20 p-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-emerald-400">
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-sm font-medium">
            {isAr ? "حساب فيسبوك متّصل" : "Facebook account connected"}
          </span>
        </div>
        <button
          onClick={() => {
            try {
              removeConnectedSocialAccount("facebook");
              removeConnectedSocialAccount("instagram");
            } catch {
              // ignore
            }
            signOut();
          }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 border border-red-500/30 hover:bg-red-500/10 transition"
        >
          <LogOut className="w-4 h-4" /> {isAr ? "تسجيل الخروج" : "Sign out"}
        </button>
      </div>

      <button
        onClick={loadAnalytics}
        disabled={loading}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-gold-500/90 hover:bg-gold-400 transition"
      >
        <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        {isAr ? "تحميل التحليلات" : "Load analytics"}
      </button>

      {error && <p className="text-xs text-red-400">{error}</p>}

      {overview && overview.count === 0 && (
        <p className="text-sm text-dark-400">
          {isAr
            ? "لا تُدار أي صفحات حالياً تحت هذا الحساب."
            : "No Pages currently managed by this account."}
        </p>
      )}

      {overview?.pages?.map((page) => (
        <div key={page.id} className="rounded-xl bg-dark-800 border border-dark-700 p-4 space-y-2">
          <div className="flex items-center gap-3">
            {page.picture ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={page.picture} alt={page.name} className="w-10 h-10 rounded-xl object-cover" />
            ) : (
              <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center">
                <Facebook className="w-5 h-5 text-dark-950" />
              </span>
            )}
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{page.name}</p>
              <p className="text-xs text-dark-400">
                {isAr ? "المتابعون" : "Fans"}: {page.insights?.fans ?? "—"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs text-dark-300">
            <span>{isAr ? "الوصول" : "Reach"}: <b className="text-white">{page.insights?.reach ?? "—"}</b></span>
            <span>{isAr ? "المشاركون" : "Engaged"}: <b className="text-white">{page.insights?.engagedUsers ?? "—"}</b></span>
            <span>{isAr ? "مرات الظهور" : "Impressions"}: <b className="text-white">{page.insights?.impressions ?? "—"}</b></span>
            <span>{isAr ? "تفاعل المنشورات" : "Post eng."}: <b className="text-white">{page.insights?.postEngagements ?? "—"}</b></span>
          </div>

          {page.instagram && (
            <div className="flex items-center gap-2 text-xs text-pink-500 mt-1">
              <Instagram className="w-4 h-4" />
              <span>{isAr ? "إنستجرام — الوصول" : "Instagram — Reach"}:</span>
              <b className="text-white">{page.instagram.insights?.reach ?? "—"}</b>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}