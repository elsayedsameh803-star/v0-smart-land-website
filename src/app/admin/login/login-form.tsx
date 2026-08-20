"use client";

import { useState } from "react";
import {
  Loader2,
  ShieldCheck,
  Languages,
  AlertTriangle,
  Chrome,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";

const dict = {
  ar: {
    lang: "en" as const,
    langLabel: "English",
    badge: "لوحة تحكم مالك الموقع",
    title: "مركز التحكم والأمان",
    subtitle: "Smart Land — إدارة وتدقيق وإحصاءات في لوحة واحدة.",
    passwordLabel: "كلمة المرور",
    passwordPlaceholder: "أدخل كلمة مرور مالك الموقع",
    signIn: "تسجيل الدخول",
    signingIn: "جارٍ تسجيل الدخول…",
    showPassword: "إظهار كلمة المرور",
    hidePassword: "إخفاء كلمة المرور",
    continueWithGoogle: "المتابعة باستخدام Google",
    notConfigured:
      "كلمة المرور غير مهيأة بعد. اضبط ADMIN_PASSWORD في إعدادات البيئة (محلياً وفي Vercel).",
    googleNotConfigured:
      "تسجيل الدخول عبر Google غير مهيأ. اضبط GOOGLE_CLIENT_ID و GOOGLE_CLIENT_SECRET.",
    wrongPassword: "كلمة المرور غير صحيحة.",
    locked: "محاولات فاشلة كثيرة جداً. انتظر قليلاً ثم حاول لاحقاً.",
    required: "أدخل كلمة المرور أولاً.",
    network: "تعذّر الاتصال بالخادم. حاول لاحقاً.",
    secure:
      "حماية: جلسات موقّعة HttpOnly، HTTPS افتراضي، وتحديد سرعة يمنع تخمين كلمة المرور.",
    hint: "هذه الصفحة مخصصة لمالك الموقع فقط — لا يستطيع المستخدم العادي دخول لوحة التحكم.",
    denied:
      "تعذّر تسجيل الدخول عبر Google: هذا الحساب غير مصرَّح له بالوصول إلى لوحة التحكم.",
    or: "أو",
  },
  en: {
    lang: "ar" as const,
    langLabel: "العربية",
    badge: "Site Owner Control Panel",
    title: "Security & Control Center",
    subtitle: "Smart Land — manage, audit and monitor everything in one console.",
    passwordLabel: "Password",
    passwordPlaceholder: "Enter the site owner password",
    signIn: "Sign In",
    signingIn: "Signing in…",
    showPassword: "Show password",
    hidePassword: "Hide password",
    continueWithGoogle: "Continue with Google",
    notConfigured:
      "Admin password is not configured yet. Set ADMIN_PASSWORD in your environment settings.",
    googleNotConfigured:
      "Google sign-in is not configured yet. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.",
    wrongPassword: "Incorrect password.",
    locked: "Too many failed attempts. Please wait and try again later.",
    required: "Please enter the password first.",
    network: "Could not reach the server. Please try again later.",
    secure:
      "Protection: signed HttpOnly sessions, HTTPS by default, and rate limiting against brute force.",
    hint: "This page is for the site owner only — regular users cannot access the control panel.",
    denied:
      "Google sign-in failed: this account is not authorized to access the control panel.",
    or: "or",
  },
};

export default function LoginForm({
  passwordConfigured,
  googleConfigured,
}: {
  passwordConfigured: boolean;
  googleConfigured: boolean;
}) {
  const [lang, setLang] = useState<"ar" | "en">("ar");
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const t = dict[lang];
  const dir = lang === "ar" ? "rtl" : "ltr";

  async function handlePassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (loading) return;
    if (!password) {
      setError(t.required);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const j = res.ok ? await res.json().catch(() => null) : null;
      if (res.ok && j?.success) {
        window.location.href = "/admin";
        return;
      }
      if (res.status === 503) setError(t.notConfigured);
      else if (res.status === 429) setError(t.locked);
      else setError(t.wrongPassword);
      setLoading(false);
    } catch {
      setError(t.network);
      setLoading(false);
    }
  }

  async function handleGoogle() {
    if (!googleConfigured || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", { method: "GET" });
      const j = res.ok ? await res.json().catch(() => null) : null;
      if (j?.url) {
        window.location.href = j.url;
        return;
      }
      setError(t.googleNotConfigured);
      setLoading(false);
    } catch {
      setError(t.network);
      setLoading(false);
    }
  }

  const denied =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("e") === "denied";

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

          {/* Password login — password is set by the site owner via ADMIN_PASSWORD */}
          <form onSubmit={handlePassword} className="space-y-4">
            {(denied || error === "denied") && (
              <div className="flex items-start gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{t.denied}</span>
              </div>
            )}

            <div>
              <label htmlFor="admin-password" className="block text-xs font-medium text-dark-300 mb-1.5">
                {t.passwordLabel}
              </label>
              <div className="relative">
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  placeholder={t.passwordPlaceholder}
                  disabled={loading}
                  className="w-full px-4 py-3 rounded-lg bg-dark-800/70 border border-gold-500/30 text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-gold-500/40 focus:border-gold-500 disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                  aria-label={showPassword ? t.hidePassword : t.showPassword}
                  className="absolute top-1/2 -translate-y-1/2 end-3 text-dark-400 hover:text-gold-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !passwordConfigured}
              className="w-full inline-flex items-center justify-center gap-3 py-3 rounded-lg font-bold transition-all duration-200 bg-gradient-to-r from-gold-600 to-gold-500 text-dark-950 hover:from-gold-500 hover:to-gold-400 shadow-lg shadow-gold-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lock className="w-5 h-5" />}
              {loading ? t.signingIn : t.signIn}
            </button>

            {!passwordConfigured && !error && !denied && (
              <div className="flex items-start gap-2 text-sm text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{t.notConfigured}</span>
              </div>
            )}

            {error && error !== "denied" && (
              <div className="flex items-start gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {googleConfigured && (
              <>
                <div className="flex items-center gap-3 text-[11px] text-dark-500">
                  <span className="flex-1 h-px bg-gold-500/10" />
                  {t.or}
                  <span className="flex-1 h-px bg-gold-500/10" />
                </div>
                <button
                  type="button"
                  onClick={handleGoogle}
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-3 py-3 rounded-lg font-bold transition-all duration-200 bg-white text-dark-950 hover:bg-gold-50 shadow-lg shadow-gold-500/10 hover:shadow-gold-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Chrome className="w-5 h-5" />}
                  {t.continueWithGoogle}
                </button>
              </>
            )}
          </form>

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

