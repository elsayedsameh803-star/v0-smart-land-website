"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Gift, Copy, Check, Share2, Users, MousePointerClick, UserPlus,
  TrendingUp, Rocket, MessageCircle, Facebook, Twitter, Send, Mail,
  Link2, Sparkles, ArrowLeft, Clock, Shield, Award, BadgeCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getOrCreateReferralUser, getReferralStats, getReferralUser } from "@/lib/referral-storage";
import type { ReferralUser, ReferralEntry } from "@/lib/referral-types";
import { toast } from "sonner";

const translations: Record<string, Record<string, string>> = {
  en: {
    title: "Referral Program",
    subtitle: "Invite friends and earn rewards when Smart Land launches",
    comingSoon: "🚀 Rewards Program Coming Soon",
    comingSoonDesc: "Start inviting your friends now, and all referrals will be saved to your account. When the subscription system launches, rewards will be activated automatically according to Smart Land's policy.",
    yourCode: "Your Referral Code",
    yourLink: "Your Referral Link",
    copy: "Copy",
    copied: "Copied!",
    share: "Share via",
    totalClicks: "Total Clicks",
    totalSignups: "Total Signups",
    conversionRate: "Conversion Rate",
    referralsList: "Your Referrals",
    noReferrals: "No referrals yet. Share your link to start!",
    status: "Status",
    date: "Date",
    clicked: "Clicked",
    registered: "Registered",
    verified: "Verified",
    rewarded: "Rewarded",
    howItWorks: "How It Works",
    step1: "Share your link",
    step1Desc: "Share your unique referral link with friends via WhatsApp, Facebook, X, Telegram, or Email.",
    step2: "Friends click & sign up",
    step2Desc: "When your friends click your link and sign up, they're automatically tracked in your account.",
    step3: "Earn rewards",
    step3Desc: "Once the rewards program launches, you'll earn rewards for every successful referral.",
    antiFraud: "Anti-Fraud Protection",
    antiFraudDesc: "We track all referral activity and prevent duplicate or fake referrals to ensure fair rewards for everyone.",
    backToDashboard: "Back to Dashboard",
    shareWhatsApp: "Share on WhatsApp",
    shareFacebook: "Share on Facebook",
    shareX: "Share on X",
    shareTelegram: "Share on Telegram",
    shareEmail: "Share via Email",
    shareMessage: "Join me on Smart Land - the AI Digital Audit Platform! Use my referral link:",
    shareMessageAr: "انضم إلي على سمارت لاند - منصة التدقيق الرقمي بالذكاء الاصطناعي! استخدم رابط الإحالة الخاص بي:",
    emailSubject: "Join me on Smart Land!",
    emailSubjectAr: "انضم إلي على سمارت لاند!",
    emailBody: "Hi! I'm using Smart Land, an amazing AI Digital Audit Platform. Join me using my referral link:",
    emailBodyAr: "مرحباً! أنا أستخدم سمارت لاند، منصة التدقيق الرقمي بالذكاء الاصطناعي. انضم إلي باستخدام رابط الإحالة الخاص بي:",
    welcome: "Welcome to Smart Land Referral Program!",
    welcomeDesc: "Your unique referral code has been created. Share it with friends and start earning rewards.",
    active: "Active",
    pending: "Pending",
  },
  ar: {
    title: "برنامج الإحالة",
    subtitle: "ادعُ أصدقاءك واكسب مكافآت عند إطلاق سمارت لاند",
    comingSoon: "🚀 برنامج المكافآت قادم قريبًا",
    comingSoonDesc: "ابدأ بدعوة أصدقائك من الآن، وسيتم الاحتفاظ بجميع الإحالات داخل حسابك. عند إطلاق نظام الاشتراكات سيتم تفعيل المكافآت تلقائيًا وفقًا لسياسة Smart Land.",
    yourCode: "رمز الإحالة الخاص بك",
    yourLink: "رابط الإحالة الخاص بك",
    copy: "نسخ",
    copied: "تم النسخ!",
    share: "مشاركة عبر",
    totalClicks: "إجمالي النقرات",
    totalSignups: "إجمالي المسجلين",
    conversionRate: "معدل التحويل",
    referralsList: "إحالاتك",
    noReferrals: "لا توجد إحالات بعد. شارك رابطك للبدء!",
    status: "الحالة",
    date: "التاريخ",
    clicked: "نقر",
    registered: "مسجل",
    verified: "موثق",
    rewarded: "مكافأة",
    howItWorks: "كيف يعمل",
    step1: "شارك رابطك",
    step1Desc: "شارك رابط الإحالة الفريد الخاص بك مع أصدقائك عبر واتساب أو فيسبوك أو X أو تيليجرام أو البريد الإلكتروني.",
    step2: "الأصدقاء ينقرون ويسجلون",
    step2Desc: "عندما ينقر أصدقاؤك على رابطك ويسجلون، يتم تتبعهم تلقائيًا في حسابك.",
    step3: "اكسب المكافآت",
    step3Desc: "عند إطلاق برنامج المكافآت، ستكسب مكافآت عن كل إحالة ناجحة.",
    antiFraud: "حماية من التحايل",
    antiFraudDesc: "نتتبع جميع أنشطة الإحالة ونمنع الإحالات المكررة أو الوهمية لضمان مكافآت عادلة للجميع.",
    backToDashboard: "العودة للوحة التحكم",
    shareWhatsApp: "مشاركة عبر واتساب",
    shareFacebook: "مشاركة عبر فيسبوك",
    shareX: "مشاركة عبر X",
    shareTelegram: "مشاركة عبر تيليجرام",
    shareEmail: "مشاركة عبر البريد الإلكتروني",
    shareMessage: "انضم إلي على سمارت لاند - منصة التدقيق الرقمي بالذكاء الاصطناعي! استخدم رابط الإحالة الخاص بي:",
    shareMessageAr: "انضم إلي على سمارت لاند - منصة التدقيق الرقمي بالذكاء الاصطناعي! استخدم رابط الإحالة الخاص بي:",
    emailSubject: "انضم إلي على سمارت لاند!",
    emailSubjectAr: "انضم إلي على سمارت لاند!",
    emailBody: "مرحباً! أنا أستخدم سمارت لاند، منصة التدقيق الرقمي بالذكاء الاصطناعي. انضم إلي باستخدام رابط الإحالة الخاص بي:",
    emailBodyAr: "مرحباً! أنا أستخدم سمارت لاند، منصة التدقيق الرقمي بالذكاء الاصطناعي. انضم إلي باستخدام رابط الإحالة الخاص بي:",
    welcome: "مرحباً بك في برنامج إحالة سمارت لاند!",
    welcomeDesc: "تم إنشاء رمز الإحالة الفريد الخاص بك. شاركه مع أصدقائك وابدأ في كسب المكافآت.",
    active: "نشط",
    pending: "قيد الانتظار",
  },
};

export default function ReferralPage({ params }: { params: { locale: string } }) {
  const locale = params.locale;
  const isRtl = locale === "ar";
  const t = translations[locale] || translations.en;
  const router = useRouter();

  const [referralUser, setReferralUser] = useState<ReferralUser | null>(null);
  const [stats, setStats] = useState({ totalClicks: 0, totalSignups: 0, conversionRate: 0, recentReferrals: [] as ReferralEntry[] });
  const [copied, setCopied] = useState<"code" | "link" | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Get or create a demo user for the referral system
  useEffect(() => {
    const userId = "demo-user-" + (typeof window !== "undefined" ? window.localStorage.getItem("smart-land-user-id") || "default" : "default");
    const user = getOrCreateReferralUser(userId, "Smart Land User", "user@smartland.com");
    setReferralUser(user);
    setStats(getReferralStats(userId));
    setIsLoaded(true);
  }, [locale]);

  const handleCopy = useCallback(async (text: string, type: "code" | "link") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      toast.success(t.copied);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      toast.error(locale === "ar" ? "فشل النسخ" : "Copy failed");
    }
  }, [t, locale]);

  const getShareMessage = () => {
    return locale === "ar" ? t.shareMessageAr : t.shareMessage;
  };

  const getEmailSubject = () => {
    return locale === "ar" ? t.emailSubjectAr : t.emailSubject;
  };

  const getEmailBody = () => {
    return locale === "ar" ? t.emailBodyAr : t.emailBody;
  };

  const shareLinks = referralUser ? {
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${getShareMessage()} ${referralUser.referralLink}`)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralUser.referralLink)}`,
    x: `https://twitter.com/intent/tweet?text=${encodeURIComponent(getShareMessage())}&url=${encodeURIComponent(referralUser.referralLink)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(referralUser.referralLink)}&text=${encodeURIComponent(getShareMessage())}`,
    email: `mailto:?subject=${encodeURIComponent(getEmailSubject())}&body=${encodeURIComponent(`${getEmailBody()} ${referralUser.referralLink}`)}`,
  } : null;

  if (!isLoaded) {
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
    <div className="min-h-screen bg-dark-950">
      {/* Header */}
      <div className="pt-24 pb-8 px-4 sm:px-6 lg:px-8 border-b border-gold-500/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gold-500/5 via-transparent to-transparent" />
        <div className="max-w-7xl mx-auto relative">
          <Link
            href={`/${locale}/dashboard`}
            className="inline-flex items-center gap-2 text-sm text-dark-400 hover:text-gold-400 transition-colors mb-4"
          >
            <ArrowLeft className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
            {t.backToDashboard}
          </Link>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center shadow-lg shadow-gold-500/25">
                <Gift className="w-7 h-7 text-dark-950" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">{t.title}</h1>
                <p className="text-sm text-dark-400">{t.subtitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gold-500/10 border border-gold-500/20">
              <BadgeCheck className="w-4 h-4 text-gold-400" />
              <span className="text-sm font-medium text-gold-300">{t.active}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Coming Soon Banner */}
        <div className="relative p-6 rounded-2xl bg-gradient-to-r from-gold-500/10 via-gold-600/5 to-transparent border border-gold-500/20 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/10 rounded-full blur-3xl" />
          <div className="relative flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center shrink-0">
              <Rocket className="w-6 h-6 text-dark-950" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gold-300 mb-2">{t.comingSoon}</h2>
              <p className="text-sm text-dark-300 leading-relaxed">{t.comingSoonDesc}</p>
            </div>
          </div>
        </div>

        {/* Referral Code & Link */}
        {referralUser && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Referral Code */}
            <div className="p-6 rounded-2xl bg-dark-800/60 border border-gold-500/10 card-hover-effect">
              <div className="flex items-center gap-2 mb-4">
                <Link2 className="w-5 h-5 text-gold-400" />
                <h3 className="text-sm font-semibold text-white">{t.yourCode}</h3>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 px-4 py-3 rounded-xl bg-dark-900/80 border border-gold-500/20 font-mono text-lg font-bold text-gold-300 tracking-wider">
                  {referralUser.referralCode}
                </div>
                <button
                  onClick={() => handleCopy(referralUser.referralCode, "code")}
                  className="p-3 rounded-xl bg-gold-500/10 text-gold-400 hover:bg-gold-500/20 transition-colors border border-gold-500/20"
                  aria-label={t.copy}
                >
                  {copied === "code" ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Referral Link */}
            <div className="p-6 rounded-2xl bg-dark-800/60 border border-gold-500/10 card-hover-effect">
              <div className="flex items-center gap-2 mb-4">
                <Share2 className="w-5 h-5 text-gold-400" />
                <h3 className="text-sm font-semibold text-white">{t.yourLink}</h3>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 px-4 py-3 rounded-xl bg-dark-900/80 border border-gold-500/20 text-sm text-dark-300 truncate" dir="ltr">
                  {referralUser.referralLink}
                </div>
                <button
                  onClick={() => handleCopy(referralUser.referralLink, "link")}
                  className="p-3 rounded-xl bg-gold-500/10 text-gold-400 hover:bg-gold-500/20 transition-colors border border-gold-500/20"
                  aria-label={t.copy}
                >
                  {copied === "link" ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Share Buttons */}
        {shareLinks && (
          <div>
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Share2 className="w-4 h-4 text-gold-400" />
              {t.share}
            </h3>
            <div className="flex flex-wrap gap-3">
              <a
                href={shareLinks.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="text-sm font-medium">{t.shareWhatsApp}</span>
              </a>
              <a
                href={shareLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-all"
              >
                <Facebook className="w-4 h-4" />
                <span className="text-sm font-medium">{t.shareFacebook}</span>
              </a>
              <a
                href={shareLinks.x}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-dark-700 text-dark-300 border border-dark-600 hover:bg-dark-600 hover:text-white transition-all"
              >
                <Twitter className="w-4 h-4" />
                <span className="text-sm font-medium">{t.shareX}</span>
              </a>
              <a
                href={shareLinks.telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 hover:bg-sky-500/20 transition-all"
              >
                <Send className="w-4 h-4" />
                <span className="text-sm font-medium">{t.shareTelegram}</span>
              </a>
              <a
                href={shareLinks.email}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gold-500/10 text-gold-400 border border-gold-500/20 hover:bg-gold-500/20 transition-all"
              >
                <Mail className="w-4 h-4" />
                <span className="text-sm font-medium">{t.shareEmail}</span>
              </a>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-dark-800/60 border border-gold-500/10 card-hover-effect">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-500/20 to-gold-600/20 flex items-center justify-center">
                <MousePointerClick className="w-5 h-5 text-gold-400" />
              </div>
              <p className="text-xs text-dark-400">{t.totalClicks}</p>
            </div>
            <p className="text-3xl font-bold text-white">{stats.totalClicks}</p>
          </div>
          <div className="p-5 rounded-2xl bg-dark-800/60 border border-gold-500/10 card-hover-effect">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-emerald-400" />
              </div>
              <p className="text-xs text-dark-400">{t.totalSignups}</p>
            </div>
            <p className="text-3xl font-bold text-white">{stats.totalSignups}</p>
          </div>
          <div className="p-5 rounded-2xl bg-dark-800/60 border border-gold-500/10 card-hover-effect">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-xs text-dark-400">{t.conversionRate}</p>
            </div>
            <p className="text-3xl font-bold text-white">{stats.conversionRate}%</p>
          </div>
        </div>

        {/* Referrals List */}
        <div>
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Users className="w-5 h-5 text-gold-400" />
            {t.referralsList}
          </h3>

          {stats.recentReferrals.length === 0 ? (
            <div className="text-center py-16 rounded-2xl bg-dark-800/40 border border-gold-500/10">
              <Users className="w-12 h-12 text-dark-500 mx-auto mb-4" />
              <p className="text-dark-400">{t.noReferrals}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.recentReferrals.map((referral) => {
                const date = new Date(referral.clickedAt);
                const dateStr = date.toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                });
                return (
                  <div
                    key={referral.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-dark-800/60 border border-gold-500/10 hover:border-gold-500/30 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-dark-700 flex items-center justify-center">
                        <Users className="w-4 h-4 text-gold-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">
                          {referral.referredName || (locale === "ar" ? "زائر" : "Visitor")}
                        </p>
                        <p className="text-xs text-dark-500">{dateStr}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={cn(
                        "text-xs font-medium px-2.5 py-1 rounded-full",
                        referral.status === "clicked" && "bg-dark-700 text-dark-300",
                        referral.status === "registered" && "bg-emerald-500/10 text-emerald-400",
                        referral.status === "verified" && "bg-blue-500/10 text-blue-400",
                        referral.status === "rewarded" && "bg-gold-500/10 text-gold-400"
                      )}>
                        {referral.status === "clicked" ? t.clicked :
                         referral.status === "registered" ? t.registered :
                         referral.status === "verified" ? t.verified : t.rewarded}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* How It Works */}
        <div>
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-gold-400" />
            {t.howItWorks}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: Share2, title: t.step1, desc: t.step1Desc },
              { icon: Users, title: t.step2, desc: t.step2Desc },
              { icon: Award, title: t.step3, desc: t.step3Desc },
            ].map((step, i) => (
              <div key={i} className="p-6 rounded-2xl bg-dark-800/60 border border-gold-500/10 card-hover-effect">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-500/20 to-gold-600/20 flex items-center justify-center">
                    <step.icon className="w-5 h-5 text-gold-400" />
                  </div>
                  <span className="text-2xl font-bold text-gold-500/30">{i + 1}</span>
                </div>
                <h4 className="text-sm font-semibold text-white mb-2">{step.title}</h4>
                <p className="text-xs text-dark-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Anti-Fraud */}
        <div className="p-6 rounded-2xl bg-dark-800/60 border border-gold-500/10">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500/20 to-red-600/20 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-1">{t.antiFraud}</h4>
              <p className="text-xs text-dark-400 leading-relaxed">{t.antiFraudDesc}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}