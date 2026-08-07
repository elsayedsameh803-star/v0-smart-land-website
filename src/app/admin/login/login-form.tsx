"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  AlertTriangle,
  Loader2,
  ShieldCheck,
  Languages,
} from "lucide-react";
import { cn } from "@/lib/utils";

const dict = {
  ar: {
    lang: "en" as const,
    langLabel: "English",
    badge: "لوحة تحكم مالك الموقع",
    title: "مركز التحكم والأمان",
    subtitle: "Smart Land — إدارة وتدقيق وإحصاءات في لوحة واحدة.",
    password: "كلمة المرور",
    placeholder: "أدخل كلمة المرور",
    submit: "تسجيل الدخول",
    error: "كلمة المرور غير صحيحة.",
    notConfigured:
      "لم يتم ضبط كلمة مرور الأدمن بعد. أضف متغير ADMIN_PASSWORD في إعدادات البيئة على Vercel.",
    tooMany: "محاولات خاطئة كثيرة. انتظر بضع دقائق ثم حاول مجدداً.",
    network: "تعذّر الاتصال بالخادم. حاول لاحقاً.",
    secure: "حماية: جلسات موقّعة، تحديد معدل، وHTTPS افتراضي",
    hint: "بيانات الدخول صادرة من متغيرات البيئة فقط، ولا تُخزَّن في قاعدة بيانات.",
  },
  en: {
    lang: "ar" as const,
    langLabel: "العربية",
    badge: "Site Owner Control Panel",
    title: "Security & Control Center",
    subtitle: "Smart Land — manage, audit and monitor everything in one console.",
    password: "Password",
    placeholder: "Enter your password",
    submit: "Sign in",
    error: "Invalid password.",
    notConfigured:
      "Admin password is not configured yet. Add the ADMIN_PASSWORD environment variable on Vercel.",
    tooMany: "Too many failed attempts. Please wait a few minutes and try again.",
    network: "Could not reach the server. Please try again later.",
    secure: "Protection: signed sessions, rate limiting, and HTTPS by default",
    hint: "Credentials come only from environment variables and are never stored in a database.",
  },
};

export default function LoginForm({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [lang, setLang] = useState<"ar" | "en">("ar");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const t = dict[lang];
  const dir = lang === "ar" ? "rtl" : "ltr";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!configured || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        router.push("/admin");
        router.refresh();
        return;
      }
      if (res.status === 503) setError(t.notConfigured);
      else if (res.status === 429) setError(t.tooMany);
      else setError(t.error);
    } catch {
      setError(t.network);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div dir={dir} className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-gold-500/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-midnight-600/20 blur-3xl" />
      </div>

      <div className="w-full max-w-md">
        <div className="flex justify-end mb-4">
          <button
            type="button"
            onClick={() => setLang(lang === "ar" ? "en" : "ar")}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gold-500/20 text-gold-300 text-xs hover:bg-gold-500/10 transition"
          >
            <Languages className="w-4 h-4" />
            {t.langLabel}
          </button>
        </div>

        <div className="rounded-3xl glass-deep gold-border p-8 sm:p-10 gold-glow-strong">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center text-dark-950 shadow-lg shadow-gold-500/30 mb-4">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-gold-400/90 bg-gold-500/10 border border-gold-500/20 px-3 py-1 rounded-full mb-3">
              <Lock className="w-3 h-3" />
              {t.badge}
            </span>
            <h1 className="text-2xl font-bold text-white mb-1">{t.title}</h1>
            <p className="text-sm text-dark-400">{t.subtitle}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gold-300 mb-1.5">
                {t.password}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-dark-400 absolute start-3 top-1/2 -translate-y-1/2" />
                <input
                  id="password"
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.placeholder}
                  autoComplete="current-password"
                  autoFocus
                  className={cn(
                    "w-full ps-10 pe-10 px-4 py-2.5 rounded-lg bg-dark-800 border text-white placeholder-dark-400",
                    "transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gold-500/50",
                    error
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500/50"
                      : "border-gold-500/20 focus:border-gold-500"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-gold-400 transition"
                  aria-label="toggle visibility"
                >
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {!configured && !error && (
              <div className="flex items-start gap-2 text-sm text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{t.notConfigured}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !configured}
              className={cn(
                "w-full inline-flex items-center justify-center gap-2 py-3 rounded-lg font-bold transition-all duration-200",
                "bg-gradient-to-r from-gold-600 to-gold-500 text-dark-950",
                "hover:from-gold-500 hover:to-gold-400 shadow-lg shadow-gold-500/25 hover:shadow-gold-500/40",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Sparkles className="w-5 h-5" />
              )}
              {t.submit}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gold-500/10 space-y-2">
            <p className="flex items-start gap-2 text-[11px] text-dark-400">
              <ShieldCheck className="w-3.5 h-3.5 mt-0.5 text-emerald-400 shrink-0" />
              {t.secure}
            </p>
            <p className="flex items-start gap-2 text-[11px] text-dark-500">
              <Lock className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              {t.hint}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

