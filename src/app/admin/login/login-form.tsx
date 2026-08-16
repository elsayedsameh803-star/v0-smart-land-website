"use client";

import { useState } from "react";
import {
  Loader2,
  ShieldCheck,
  Languages,
  AlertTriangle,
  Chrome,
} from "lucide-react";

const dict = {
  ar: {
    lang: "en" as const,
    langLabel: "English",
    badge: "لوحة تحكم مالك الموقع",
    title: "مركز التحكم والأمان",
    subtitle: "Smart Land — إدارة وتدقيق وإحصاءات في لوحة واحدة.",
    continueWithGoogle: "المتابعة باستخدام Google",
    signingIn: "جارٍ تسجيل الدخول عبر Google…",
    notConfigured:
      "تسجيل الدخول عبر Google غير مهيأ بعد. تأكد من ضبط GOOGLE_CLIENT_ID و GOOGLE_CLIENT_SECRET و ADMIN_ALLOWED_EMAILS في إعدادات البيئة على Vercel.",
    network: "تعذّر الاتصال بالخادم. حاول لاحقاً.",
    secure: "حماية: تسجيل دخول حصري عبر Google (OAuth)، جلسات موقّعة، وHTTPS افتراضي",
    hint: "لا توجد كلمات مرور — الوصول فقط للحسابات المُصرَّح لها عبر البريد الإلكتروني.",
    denied: "تعذّر تسجيل الدخول: هذا الحساب غير مصرَّح له بالوصول إلى لوحة التحكم.",
  },
  en: {
    lang: "ar" as const,
    langLabel: "العربية",
    badge: "Site Owner Control Panel",
    title: "Security & Control Center",
    subtitle: "Smart Land — manage, audit and monitor everything in one console.",
    continueWithGoogle: "Continue with Google",
    signingIn: "Signing in with Google…",
    notConfigured:
      "Google sign-in is not configured yet. Add GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET and ADMIN_ALLOWED_EMAILS in your Vercel environment settings.",
    network: "Could not reach the server. Please try again later.",
    secure: "Protection: Google-only (OAuth) sign-in, signed sessions, HTTPS by default",
    hint: "No passwords — access is limited to explicitly authorized email accounts.",
    denied: "Sign-in failed: this account is not authorized to access the control panel.",
  },
};

export default function LoginForm({ configured }: { configured: boolean }) {
  const [lang, setLang] = useState<"ar" | "en">("ar");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const t = dict[lang];
  const dir = lang === "ar" ? "rtl" : "ltr";

  async function handleGoogle() {
    if (!configured || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", { method: "GET" });
      const j = res.ok ? await res.json().catch(() => null) : null;
      if (j?.url) {
        window.location.href = j.url;
        return;
      }
      setError(t.notConfigured);
      setLoading(false);
    } catch {
      setError(t.network);
      setLoading(false);
    }
  }

  const denied = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("e") === "denied";

  return (
    <div dir={dir} className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-gold-500/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-midnight-600/20 blur-3xl" />
      </div>

      <div className="w-full max-w-md">
        <div className="rounded-3xl glass-deep gold-border p-8 sm:p-10 gold-glow-strong relative">
          <button
            type="button"
            onClick={() => setLang(lang === "ar" ? "en" : "ar")}
            className="absolute top-4 end-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gold-500/20 text-gold-300 text-xs hover:bg-gold-500/10 transition"
          >
            <Languages className="w-4 h-4" />
            {t.langLabel}
          </button>

          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center text-dark-950 shadow-lg shadow-gold-500/30 mb-4">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-gold-400/90 bg-gold-500/10 border border-gold-500/20 px-3 py-1 rounded-full mb-3">
              <ShieldCheck className="w-3 h-3" />
              {t.badge}
            </span>
            <h1 className="text-2xl font-bold text-white mb-1">{t.title}</h1>
            <p className="text-sm text-dark-400">{t.subtitle}</p>
          </div>

          {/* Google Sign-In — the ONLY login option (no password) */}
          <div className="space-y-4">
            {(denied || error === "denied") && (
              <div className="flex items-start gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{t.denied}</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleGoogle}
              disabled={loading || !configured}
              className="w-full inline-flex items-center justify-center gap-3 py-3 rounded-lg font-bold transition-all duration-200 bg-white text-dark-950 hover:bg-gold-50 shadow-lg shadow-gold-500/10 hover:shadow-gold-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Chrome className="w-5 h-5" />}
              {loading ? t.signingIn : t.continueWithGoogle}
            </button>

            {error && error !== "denied" && (
              <div className="flex items-start gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {!configured && !error && !denied && (
              <div className="flex items-start gap-2 text-sm text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{t.notConfigured}</span>
              </div>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-gold-500/10 space-y-2">
            <p className="flex items-start gap-2 text-[11px] text-dark-400">
              <ShieldCheck className="w-3.5 h-3.5 mt-0.5 text-emerald-400 shrink-0" />
              {t.secure}
            </p>
            <p className="flex items-start gap-2 text-[11px] text-dark-500">
              <ShieldCheck className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              {t.hint}
            </p>
          </div>

          {denied && (
            <button
              onClick={() => {
                const url = new URL(window.location.href);
                url.searchParams.delete("e");
                window.history.replaceState({}, "", url.toString());
              }}
              className="mt-4 text-xs text-gold-400 hover:underline"
            >
              {lang === "ar" ? "المحاولة مجدداً" : "Try again"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

