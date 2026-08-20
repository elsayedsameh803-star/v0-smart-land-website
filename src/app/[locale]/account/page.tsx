"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  CreditCard,
  Download,
  FileText,
  Loader2,
  ShieldCheck,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Zap,
  Globe,
  FileBarChart,
} from "lucide-react";

type Subscription = {
  id: string;
  customerEmail: string;
  customerName: string;
  planId: string;
  amountCents: number;
  status: "active" | "expired" | "pending" | "cancelled" | "failed";
  startDate: string | null;
  endDate: string | null;
  transactionId: string | null;
  paymentDate: string | null;
  plan?: { name: string; nameAr: string } | null;
};

type Quota = {
  planId: string;
  planName: string;
  planNameAr: string;
  isPaid: boolean;
  analysesPerMonth: number;
  sitesLimit: number;
  pagesLimit: number;
  platforms: string[];
  expiresAt: string | null;
  subscriptionStatus: string;
};

interface PageProps {
  params: { locale: string };
}

const T: Record<string, any> = {
  en: {
    title: "My Account",
    sub: "Subscription status, usage quota and your receipts.",
    signIn: "Sign in to view your account",
    noCustomer:
      "After subscribing, your account appears here. You can also add your email to receive updates.",
    plan: "Current plan",
    status: "Status",
    start: "Started",
    end: "Expires",
    noRefund: "Paid subscriptions are non-refundable. You can try the service for free first.",
    downloadInvoice: "Download Invoice PDF",
    renew: "Renew / Upgrade",
    subscribe: "Subscribe",
    quota: "Usage Quota",
    analyses: "Analyses / month",
    sites: "Sites",
    pages: "Pages per audit",
    platforms: "Platforms",
    unlimited: "Unlimited",
    loading: "Loading your account…",
    noInvoices: "No paid invoices yet.",
    downgraded: "Your paid subscription has ended — your account was reverted to the free tier.",
    active: "Active",
    expired: "Expired",
    pending: "Pending",
    cancelled: "Cancelled",
    failed: "Failed",
    noData: "No data",
    invoicesTitle: "Invoices",
    invoiceNum: "Invoice",
    visitSite: "Back to home",
  },
  ar: {
    title: "حسابي",
    sub: "حالة الاشتراك والحصة المتاحة وإيصالاتك.",
    signIn: "سجّل دخولك لعرض حسابك",
    noCustomer: "بعد الاشتراك سيظهر حسابك هنا. يمكنك أيضاً إضافة بريدك لتصلك التحديثات.",
    plan: "الباقة الحالية",
    status: "الحالة",
    start: "تاريخ البدء",
    end: "تاريخ الانتهاء",
    noRefund: "الاشتراكات المدفوعة غير قابلة للاسترداد، يمكنك تجربة الخدمة مجاناً أولاً.",
    downloadInvoice: "تحميل الإيصال PDF",
    renew: "تجديد / ترقية",
    subscribe: "اشترك الآن",
    quota: "الحصة المتاحة",
    analyses: "التحليلات / شهر",
    sites: "المواقع",
    pages: "الصفحات في التدقيق",
    platforms: "المنصات",
    unlimited: "غير محدود",
    loading: "جارٍ تحميل حسابك…",
    noInvoices: "لا توجد إيصالات مدفوعة بعد.",
    downgraded: "انتهى اشتراكك المدفوع — تمت إعادة حسابك تلقائياً للحصة المجانية.",
    active: "نشط",
    expired: "منتهي",
    pending: "قيد المعالجة",
    cancelled: "ملغى",
    failed: "فشل",
    noData: "لا توجد بيانات",
    invoicesTitle: "الإيصالات",
    invoiceNum: "الإيصال",
    visitSite: "العودة للرئيسية",
  },
};

const STATUS_STYLES: Record<string, string> = {
  active: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
  expired: "bg-rose-500/15 text-rose-300 border-rose-500/25",
  pending: "bg-amber-500/15 text-amber-300 border-amber-500/25",
  cancelled: "bg-dark-800 text-dark-300 border-dark-600",
  failed: "bg-rose-500/15 text-rose-300 border-rose-500/25",
};

export default function AccountPage({ params }: PageProps) {
  const locale = params?.locale === "ar" ? "ar" : "en";
  const dir = locale === "ar" ? "rtl" : "ltr";
  const t = T[locale];

  const [customer, setCustomer] = useState<{ name: string; email: string } | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [quota, setQuota] = useState<Quota | null>(null);
  const [downgraded, setDowngraded] = useState(false);
  const [freeRemaining, setFreeRemaining] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [subRes, accRes] = await Promise.all([
        fetch("/api/payments/subscription").then((r) => r.json()).catch(() => null),
        fetch("/api/payments/access").then((r) => r.json()).catch(() => null),
      ]);
      if (subRes?.hasCustomer) {
        setCustomer(subRes.customer);
        setSubscription(subRes.subscription || null);
      } else {
        setCustomer(null);
        setSubscription(null);
      }
      setQuota(accRes?.quota || null);
      setDowngraded(!!accRes?.downgradedToFree);
      setFreeRemaining(typeof accRes?.freeRemaining === "number" ? accRes.freeRemaining : null);
    } catch {
      setCustomer(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function downloadInvoice() {
    if (!customer?.email) return;
    setDownloading(true);
    setMessage("");
    try {
      const res = await fetch(`/api/payments/invoice?email=${encodeURIComponent(customer.email)}`);
      if (!res.ok) {
        const j = await res.json().catch(() => null);
        setMessage(j?.error || "Failed to generate invoice");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Smart-Land-Receipt.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      setMessage("Download failed. Please try again.");
    } finally {
      setDownloading(false);
    }
  }

  const statusKey = subscription?.status || quota?.subscriptionStatus || "free";
  const statusLabel =
    statusKey === "active" ? t.active : statusKey === "expired" ? t.expired : statusKey === "pending" ? t.pending : statusKey === "cancelled" ? t.cancelled : statusKey === "failed" ? t.failed : t.noData;

  const fmtDate = (iso: string | null | undefined) =>
    iso ? new Date(iso).toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US", { year: "numeric", month: "long", day: "numeric" }) : "—";

  const num = (n: number | undefined) => (n === -1 || n === undefined ? t.unlimited : String(n));

  const isPaidActive = !!subscription && subscription.status === "active";

  return (
    <div dir={dir} className="min-h-screen bg-dark-950 text-gold-100 pt-32 pb-20 px-4">
      <div className="max-w-4xl mx-auto space-y-6 animate-in">
        <div className="text-center space-y-2">
          <div className="inline-flex mx-auto items-center gap-2 rounded-full bg-gold-500/10 border border-gold-500/20 px-3 py-1 text-xs text-gold-300">
            <ShieldCheck className="w-4 h-4" /> Smart Land
          </div>
          <h1 className="text-3xl font-bold text-white">{t.title}</h1>
          <p className="text-dark-400 text-sm">{t.sub}</p>
          <button onClick={load} className="rounded-lg bg-dark-800 border border-gold-500/20 px-3 py-1.5 text-xs inline-flex items-center gap-1">
            <RefreshCw className="w-3.5 h-3.5" /> {locale === "ar" ? "تحديث" : "Refresh"}
          </button>
        </div>

        {loading ? (
          <div className="rounded-2xl bg-dark-900 border border-gold-500/10 p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-gold-400 mx-auto mb-3" />
            <p className="text-sm text-dark-400">{t.loading}</p>
          </div>
        ) : !customer ? (
          <div className="rounded-2xl bg-dark-900 border border-gold-500/10 p-10 text-center space-y-4">
            <AlertTriangle className="w-10 h-10 mx-auto text-gold-400" />
            <h2 className="text-lg font-semibold text-white">{t.signIn}</h2>
            <p className="text-sm text-dark-400 max-w-md mx-auto">{t.noCustomer}</p>
            <Link href={`/${locale}`} className="text-sm text-gold-400 hover:underline">{t.visitSite}</Link>
          </div>
        ) : (
          <>
            {downgraded && (
              <div className="rounded-2xl bg-amber-500/10 border border-amber-500/30 p-4 text-sm text-amber-200 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{t.downgraded} — <Link href={`/checkout?plan=pro`} className="underline font-semibold">{t.renew}</Link></span>
              </div>
            )}

            <div className="rounded-2xl bg-dark-900 border border-gold-500/10 overflow-hidden">
              <div className="bg-gradient-to-r from-gold-600 to-gold-500 px-6 py-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-dark-950/90 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-gold-400" />
                </div>
                <div className="min-w-0">
                  <h2 className="font-bold text-dark-950">{customer.name || customer.email}</h2>
                  <p className="text-xs text-dark-900/80">{customer.email}</p>
                </div>
                {isPaidActive && (
                  <span className={`ms-auto text-xs px-3 py-1 rounded-full border ${STATUS_STYLES.active}`}>{statusLabel}</span>
                )}
              </div>

              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-dark-400 mb-1">{t.plan}</p>
                  <p className="text-lg font-bold text-white">
                    {subscription?.plan
                      ? locale === "ar" ? subscription.plan.nameAr : subscription.plan.name
                      : locale === "ar" ? quota?.planNameAr || t.noData : quota?.planName || t.noData}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-dark-400 mb-1">{t.status}</p>
                  <span className={`text-xs px-3 py-1 rounded-full border ${STATUS_STYLES[statusKey] || STATUS_STYLES.pending}`}>{statusLabel}</span>
                </div>
                <div>
                  <p className="text-xs text-dark-400 mb-1">{t.start}</p>
                  <p className="text-sm font-semibold text-white">{fmtDate(subscription?.startDate)}</p>
                </div>
                <div>
                  <p className="text-xs text-dark-400 mb-1">{t.end}</p>
                  <p className="text-sm font-semibold text-white">{fmtDate(subscription?.endDate)}</p>
                </div>
                <div>
                  <p className="text-xs text-dark-400 mb-1">Transaction</p>
                  <p className="text-sm font-mono text-dark-200 break-all">{subscription?.transactionId || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-dark-400">{t.noRefund}</p>
                </div>
              </div>

              <div className="border-t border-gold-500/10 px-6 py-4 flex flex-wrap items-center gap-3">
                {isPaidActive && (
                  <button
                    onClick={downloadInvoice}
                    disabled={downloading}
                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-500/15 border border-emerald-500/30 px-4 py-2.5 text-sm font-semibold text-emerald-300 hover:bg-emerald-500/25 transition disabled:opacity-50"
                  >
                    {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    {t.downloadInvoice}
                  </button>
                )}
                <Link
                  href={`/checkout?plan=pro`}
                  className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-gold-600 to-gold-500 px-4 py-2.5 text-sm font-bold text-dark-950 hover:from-gold-500 hover:to-gold-400 transition"
                >
                  <Zap className="w-4 h-4" />
                  {isPaidActive ? t.renew : t.subscribe}
                </Link>
                {message && <p className="text-xs text-rose-300">{message}</p>}
              </div>
            </div>



            {/* Usage quota */}
            <div className="rounded-2xl bg-dark-900 border border-gold-500/10 p-6">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-5">
                <FileBarChart className="w-5 h-5 text-gold-400" /> {t.quota}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="rounded-xl bg-dark-800/60 border border-gold-500/10 p-4">
                  <p className="text-[11px] text-dark-400 mb-1">{t.analyses}</p>
                  <p className="text-xl font-bold text-gold-300">
                    {quota?.isPaid ? num(quota.analysesPerMonth) : freeRemaining !== null ? `${freeRemaining} / ${quota?.analysesPerMonth ?? 2}` : num(quota?.analysesPerMonth)}
                  </p>
                </div>
                <div className="rounded-xl bg-dark-800/60 border border-gold-500/10 p-4">
                  <p className="text-[11px] text-dark-400 mb-1">{t.sites}</p>
                  <p className="text-xl font-bold text-white">{num(quota?.sitesLimit)}</p>
                </div>
                <div className="rounded-xl bg-dark-800/60 border border-gold-500/10 p-4">
                  <p className="text-[11px] text-dark-400 mb-1">{t.pages}</p>
                  <p className="text-xl font-bold text-white">{num(quota?.pagesLimit)}</p>
                </div>
                <div className="rounded-xl bg-dark-800/60 border border-gold-500/10 p-4">
                  <p className="text-[11px] text-dark-400 mb-1 flex items-center gap-1"><Globe className="w-3 h-3" /> {t.platforms}</p>
                  <p className="text-sm font-bold text-white truncate">
                    {(quota?.platforms || ["website"]).includes("*") ? t.unlimited : (quota?.platforms || ["website"]).join(", ")}
                  </p>
                </div>
              </div>
            </div>

            {/* Invoices */}
            <div className="rounded-2xl bg-dark-900 border border-gold-500/10 p-6">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-gold-400" /> {t.invoicesTitle}
              </h3>
              {isPaidActive ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between rounded-xl bg-dark-800/60 border border-gold-500/10 px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-white flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gold-400" />
                        {locale === "ar" ? subscription?.plan?.nameAr : subscription?.plan?.name}
                      </p>
                      <p className="text-xs text-dark-400 mt-0.5">
                        {((subscription?.amountCents || 0) / 100).toFixed(2)} USD · {fmtDate(subscription?.paymentDate)}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 text-xs text-emerald-300">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Paid
                    </span>
                  </div>
                  <button
                    onClick={downloadInvoice}
                    disabled={downloading}
                    className="inline-flex items-center gap-2 rounded-lg bg-dark-800 border border-gold-500/20 px-4 py-2 text-sm text-gold-300 hover:bg-gold-500/10 transition disabled:opacity-50"
                  >
                    {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    {t.downloadInvoice}
                  </button>
                </div>
              ) : (
                <p className="text-sm text-dark-400">{t.noInvoices}</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}