"use client";

import { useState, Suspense } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { Chrome, Github, Facebook, Apple, Mail, Loader2, AlertTriangle, ArrowLeft, LogOut, CheckCircle2 } from "lucide-react";

const dicts: Record<string, any> = {
  ar: {
    badge: "تسجيل الدخول إلى سمارت لاند",
    title: "مرحباً بك من جديد",
    subtitle:
      "سجّل دخولك لاستخدام لوحة حسابك. تسجيل الدخول لا يربط أي حساب تواصل اجتماعي تلقائياً — الربط يتم عند الطلب فقط.",
    google: "المتابعة باستخدام Google",
    github: "المتابعة باستخدام GitHub",
    facebook: "المتابعة باستخدام Facebook",
    apple: "المتابعة باستخدام Apple",
    email: "المتابعة باستخدام البريد الإلكتروني",
    emailPlaceholder: "بريدك الإلكتروني",
    continue: "متابعة",
    or: "أو",
    loading: "جارٍ…",
    error: "أدخل بريداً إلكترونياً صالحاً.",
    errorMsg: "تعذّر تسجيل الدخول. حاول مجدداً.",
    back: "العودة للرئيسية",
  },
  en: {
    badge: "Sign in to Smart Land",
    title: "Welcome back",
    subtitle:
      "Sign in to use your dashboard. Signing in does NOT link any social account automatically — linking happens only when you explicitly ask for it.",
    google: "Continue with Google",
    github: "Continue with GitHub",
    facebook: "Continue with Facebook",
    apple: "Continue with Apple",
    email: "Continue with Email",
    emailPlaceholder: "Your email address",
    continue: "Continue",
    or: "or",
    loading: "Redirecting…",
    error: "Please enter a valid email address.",
    errorMsg: "Sign in failed. Please try again.",
    back: "Back to home",
  },
};

function buildCallbackUrl(): string {
  try {
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get("redirect");
    if (redirect && /^\/[^\s]*$/.test(redirect)) return redirect;
    const callback = params.get("callbackUrl");
    if (callback) return callback;
  } catch {
    // ignore
  }
  return "/";
}
function LoginFormInner({ locale }: { locale: string }) {
  const t = dicts[locale] || dicts.en;
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");

  async function handleProvider(provider: string, event?: React.FormEvent) {
    event?.preventDefault();
    if (loading) return;
    if (provider === "email") {
      if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
        setError(t.error);
        return;
      }
    }
    setLoading(provider);
    setError(null);
    try {
      const callbackUrl = buildCallbackUrl() || "/";
      if (provider === "email") {
        await signIn("email", { email, redirect: false });
      } else {
        const res = await signIn(provider, { redirect: false, callbackUrl });
        if (res?.error) {
          setError(t.errorMsg);
          setLoading(null);
          return;
        }
        if (res?.url) {
          window.location.href = res.url;
          return;
        }
      }
      setLoading(null);
    } catch {
      setError(t.errorMsg);
      setLoading(null);
    }
  }

  const providerBtn =
    "w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200";

  return (
    <div className="rounded-2xl bg-dark-900 border border-gold-500/20 p-8 space-y-5 max-w-md mx-auto">
      <div className="text-center space-y-1">
        <p className="text-xs uppercase tracking-[0.3em] text-gold-300/80">{t.badge}</p>
        <h1 className="text-2xl font-bold text-white">{t.title}</h1>
        <p className="text-sm text-dark-400 max-w-sm mx-auto">{t.subtitle}</p>
        {status === "authenticated" && session?.user && (
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {locale === "ar"
              ? `مسجّل دخولك: ${session.user.name || session.user.email || ""}`
              : `Signed in as: ${session.user.name || session.user.email || ""}`}
            <button
              onClick={() => signOut({ callbackUrl: `/${locale}/login` })}
              className="ml-1 inline-flex items-center gap-1 text-red-400 hover:text-red-300 transition"
              aria-label={locale === "ar" ? "تسجيل الخروج" : "Sign out"}
            >
              <LogOut className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
      <div className="space-y-2.5">
        <button
          onClick={() => handleProvider("google")}
          disabled={!!loading}
          className={`${providerBtn} bg-white text-dark-900 hover:bg-dark-100 disabled:opacity-50 shadow-lg shadow-white/10`}
        >
          {loading === "google" ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Chrome className="w-4 h-4 text-gold-600" />
          )}
          {t.google}
        </button>

        <button
          onClick={() => handleProvider("github")}
          disabled={!!loading}
          className={`${providerBtn} bg-[#24292E] hover:bg-[#1d2125] text-white disabled:opacity-50`}
        >
          {loading === "github" ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Github className="w-4 h-4" />
          )}
          {t.github}
        </button>

        <button
          onClick={() => handleProvider("facebook")}
          disabled={!!loading}
          className={`${providerBtn} bg-[#1877F2] hover:bg-[#0d65d9] text-white disabled:opacity-50`}
        >
          {loading === "facebook" ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Facebook className="w-4 h-4" />
          )}
          {t.facebook}
        </button>

        <button
          onClick={() => handleProvider("apple")}
          disabled={!!loading}
          className={`${providerBtn} bg-white text-dark-900 hover:bg-dark-100 disabled:opacity-50`}
        >
          {loading === "apple" ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Apple className="w-4 h-4 text-dark-900" />
          )}
          {t.apple}
        </button>

        <div className="flex items-center gap-3 my-2">
          <span className="flex-1 h-px bg-dark-700" />
          <span className="text-[11px] uppercase tracking-wider text-dark-500">{t.or}</span>
          <span className="flex-1 h-px bg-dark-700" />
        </div>

        <form onSubmit={(e) => handleProvider("email", e)} className="space-y-2.5">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t.emailPlaceholder}
            className="w-full rounded-xl bg-dark-800/80 border border-gold-500/30 px-4 py-3 text-sm text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500"
          />
          <button
            type="submit"
            disabled={!!loading}
            className={`${providerBtn} bg-gradient-to-r from-gold-600 via-gold-500 to-gold-400 text-dark-950 hover:from-gold-500 hover:to-gold-300 disabled:opacity-50`}
          >
            {loading === "email" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Mail className="w-4 h-4" />
            )}
            {t.continue}
          </button>
        </form>
      </div>

      <p className="flex items-center justify-center gap-1.5 text-[11px] text-dark-500 text-center">
        <ArrowLeft className="w-3 h-3" />
        <a href={locale === "ar" ? "/ar" : "/"} className="hover:text-gold-400 transition">
          {t.back}
        </a>
      </p>
    </div>
  );
}

export function LoginForm({ locale }: { locale: string }) {
  return (
    <Suspense fallback={<div className="text-center text-dark-400 py-12">…</div>}>
      <LoginFormInner locale={locale} />
    </Suspense>
  );
}