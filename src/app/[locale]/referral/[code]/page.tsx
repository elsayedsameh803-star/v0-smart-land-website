"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Gift, Sparkles, ArrowRight, Shield, Users, Award, CheckCircle2 } from "lucide-react";
import { trackReferralClick, getReferralUserByCode } from "@/lib/referral-storage";

const translations: Record<string, Record<string, string>> = {
  en: {
    invalidCode: "Invalid Referral Code",
    invalidDesc: "This referral link is not valid. Please check the link and try again.",
    backHome: "Back to Home",
    redirecting: "Redirecting you to Smart Land...",
    welcome: "Welcome to Smart Land!",
    welcomeDesc: "You've been invited by a friend to discover the power of AI-powered digital audits.",
    whatIs: "What is Smart Land?",
    whatIsDesc: "Smart Land is an AI Digital Audit Platform that analyzes your website and social media presence, detects strengths and weaknesses, and provides actionable recommendations.",
    features: "What You'll Get",
    feature1: "Comprehensive digital audit across 6 categories",
    feature2: "Evidence-based findings with real data",
    feature3: "Actionable fix recommendations",
    feature4: "Track your improvement over time",
    startNow: "Start Your Free Analysis",
    poweredBy: "Powered by Smart Land",
  },
  ar: {
    invalidCode: "رمز الإحالة غير صالح",
    invalidDesc: "رابط الإحالة هذا غير صالح. يرجى التحقق من الرابط والمحاولة مرة أخرى.",
    backHome: "العودة للرئيسية",
    redirecting: "جارٍ توجيهك إلى سمارت لاند...",
    welcome: "مرحباً بك في سمارت لاند!",
    welcomeDesc: "تمت دعوتك من قبل صديق لاكتشاف قوة التدقيقات الرقمية المدعومة بالذكاء الاصطناعي.",
    whatIs: "ما هي سمارت لاند؟",
    whatIsDesc: "سمارت لاند هي منصة تدقيق رقمي بالذكاء الاصطناعي تحلل موقعك الإلكتروني وحضورك على وسائل التواصل الاجتماعي، وتكتشف نقاط القوة والضعف، وتقدم توصيات قابلة للتنفيذ.",
    features: "ماذا ستحصل عليه",
    feature1: "تدقيق رقمي شامل عبر 6 فئات",
    feature2: "نتائج مبنية على الأدلة مع بيانات حقيقية",
    feature3: "توصيات إصلاح قابلة للتنفيذ",
    feature4: "تتبع تحسنك بمرور الوقت",
    startNow: "ابدأ تحليلك المجاني",
    poweredBy: "مدعوم من سمارت لاند",
  },
};

export default function ReferralLandingPage({
  params,
}: {
  params: { locale: string; code: string };
}) {
  const locale = params.locale;
  const code = params.code;
  const isRtl = locale === "ar";
  const t = translations[locale] || translations.en;
  const router = useRouter();

  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // Validate the referral code
    const user = getReferralUserByCode(code);
    setIsValid(!!user);

    if (user) {
      // Track the click
      const ipAddress = null; // In a real app, this would come from the server
      const userAgent = typeof window !== "undefined" ? window.navigator.userAgent : null;
      const source = typeof window !== "undefined" ? window.location.href : null;
      const referrer = typeof document !== "undefined" ? document.referrer : null;
      trackReferralClick(code, ipAddress, userAgent, source, referrer);

      // Auto-redirect after 3 seconds
      const timer = setTimeout(() => {
        setIsRedirecting(true);
        router.push(`/${locale}`);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [code, locale, router]);

  if (isValid === false) {
    return (
      <div className="min-h-screen bg-dark-950 pt-24 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">{t.invalidCode}</h1>
          <p className="text-dark-400 mb-8">{t.invalidDesc}</p>
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-gold-600 to-gold-500 text-dark-950 font-bold hover:from-gold-500 hover:to-gold-400 transition-all shadow-lg shadow-gold-500/25"
          >
            {t.backHome}
            <ArrowRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
          </Link>
        </div>
      </div>
    );
  }

  if (isValid === null) {
    return (
      <div className="min-h-screen bg-dark-950 pt-24 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-dark-400">{locale === "ar" ? "جاري التحميل..." : "Loading..."}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-gold-500/5 via-transparent to-transparent" />
      <div className="absolute top-20 right-20 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-20 w-48 h-48 bg-gold-600/10 rounded-full blur-3xl" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        {/* Redirecting indicator */}
        {isRedirecting && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark-950/95 backdrop-blur-sm">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gold-300 font-medium">{t.redirecting}</p>
            </div>
          </div>
        )}

        {/* Hero */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-gold-500/25 gold-glow-strong">
            <Gift className="w-10 h-10 text-dark-950" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">{t.welcome}</h1>
          <p className="text-xl text-dark-300 max-w-2xl mx-auto">{t.welcomeDesc}</p>
        </div>

        {/* What is Smart Land */}
        <div className="p-8 rounded-2xl bg-dark-800/60 border border-gold-500/10 mb-8 card-hover-effect">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-6 h-6 text-gold-400" />
            <h2 className="text-xl font-bold text-white">{t.whatIs}</h2>
          </div>
          <p className="text-dark-300 leading-relaxed">{t.whatIsDesc}</p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {[
            { icon: CheckCircle2, text: t.feature1 },
            { icon: CheckCircle2, text: t.feature2 },
            { icon: CheckCircle2, text: t.feature3 },
            { icon: CheckCircle2, text: t.feature4 },
          ].map((feature, i) => (
            <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-dark-800/60 border border-gold-500/10">
              <feature.icon className="w-5 h-5 text-gold-400 shrink-0" />
              <span className="text-sm text-dark-300">{feature.text}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-gold-600 to-gold-500 text-dark-950 font-bold text-lg hover:from-gold-500 hover:to-gold-400 transition-all shadow-lg shadow-gold-500/25 gold-glow-strong-hover"
          >
            {t.startNow}
            <ArrowRight className={`w-5 h-5 ${isRtl ? 'rotate-180' : ''}`} />
          </Link>
          <p className="text-xs text-dark-500 mt-4 flex items-center justify-center gap-1">
            <Award className="w-3 h-3" />
            {t.poweredBy}
          </p>
        </div>
      </div>
    </div>
  );
}