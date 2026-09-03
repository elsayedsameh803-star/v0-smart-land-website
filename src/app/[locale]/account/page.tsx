"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
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
  Link2,
  Unlink,
  LogOut,
} from "lucide-react";

import { PLATFORMS } from "@/lib/platforms";

interface ConnectionStatusInfo {
  platform: string;
  connected: boolean;
  usable: boolean;
  displayName: string;
  accountId: string;
  connectedAt: string | null;
  scope: string;
  needsReconnect: boolean;
  canRefresh: boolean;
}

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
    connectedAccounts: "Connected Accounts",
    connected: "Connected",
    notConnected: "Not Connected",
    needsReconnect: "Needs Reconnect",
    connect: "Connect",
    reconnect: "Reconnect",
    disconnect: "Disconnect",
    logout: "Sign out",
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
    connectedAccounts: "الحسابات المرتبطة",
    connected: "متصل",
    notConnected: "غير مرتبط",
    needsReconnect: "يحتاج إعادة ربط",
    connect: "ربط",
    reconnect: "إعادة الربط",
    disconnect: "إلغاء الربط",
    logout: "تسجيل الخروج",
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
  const { data: session, status } = useSession();

  const [customer, setCustomer] = useState<{ name: string; email: string } | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [quota, setQuota] = useState<Quota | null>(null);
  const [downgraded, setDowngraded] = useState(false);
  const [freeRemaining, setFreeRemaining] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [message, setMessage] = useState("");

  const [connections, setConnections] = useState<Record<string, ConnectionStatusInfo>>({});
  const [connecting, setConnecting] = useState<string | null>(null);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);
  const [connectionsLoaded, setConnectionsLoaded] = useState(false);

  const handleLogout = useCallback(() => {
    void signOut({ callbackUrl: `/${locale}` });
  }, [locale]);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.email) {
      setCustomer((current) => current || {
        email: session.user.email || "",
        name: session.user.name || session.user.email || "",
      });
    }
  }, [session, status]);

  const loadConnections = useCallback(async () => {
    try {
      const res = await fetch("/api/connections");
      if (res.ok) {
        const data = await res.json();
        if (data?.connections && Array.isArray(data.connections)) {
          const record: Record<string, ConnectionStatusInfo> = {};
          for (const c of data.connections) {
            if (c?.platform) record[c.platform] = c;
          }
          setConnections(record);
        }
      }
    } catch {
      // ignore
    } finally {
      setConnectionsLoaded(true);
    }
  }, []);

  useEffect(() => {
    loadConnections();
  }, [loadConnections]);

  const handleConnect = useCallback(async (platformId: string) => {
    setConnecting(platformId);
    try {
      const meta = PLATFORMS.find((p) => p.id === platformId);
      if (!meta) return;
      if (platformId === "tiktok") {
        const res = await fetch("/api/tiktok/oauth/start", { method: "POST" });
        if (res.ok) {
          const data = await res.json();
          if (data?.url) window.location.href = data.url;
        } else if (meta.connectPath) {
          window.location.href = meta.connectPath;
        }
      } else if (meta.connectPath) {
        window.location.href = meta.connectPath;
      }
    } catch {
      // ignore
    } finally {
      setConnecting(null);
    }
  }, []);

  const handleDisconnect = useCallback(async (platformId: string) => {
    setDisconnecting(platformId);
    try {
      const meta = PLATFORMS.find((p) => p.id === platformId);
      if (!meta) return;
      let res;
      if (platformId === "tiktok") {
        res = await fetch("/api/tiktok/oauth/disconnect", { method: "POST" });
      } else if (meta.disconnectPath) {
        res = await fetch(meta.disconnectPath, { method: "POST" });
      }
      if (res && res.ok) {
        await loadConnections();
      }
    } catch {
      // ignore
    } finally {
      setDisconnecting(null);
    }
  }, [loadConnections]);



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
        ) : status === "unauthenticated" ? (
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
                {status === "authenticated" && session?.user && (
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="inline-flex items-center gap-2 rounded-lg border border-rose-500/30 px-4 py-2.5 text-sm font-semibold text-rose-300 transition hover:bg-rose-500/10"
                  >
                    <LogOut className="w-4 h-4" />
                    {t.logout}
                  </button>
                )}
                {message && <p className="text-xs text-rose-300">{message}</p>}
              </div>
            </div>



            {/* Connected Accounts */}
            <div className="rounded-2xl bg-dark-900 border border-gold-500/10 p-6">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-5">
                <Link2 className="w-5 h-5 text-gold-400" /> {t.connectedAccounts || "الحسابات المرتبطة"}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {PLATFORMS
                  .filter((p) => p.requiresConnection)
                  .map((p) => {
                    const status = connections[p.id];
                    const isConnected = status?.connected && !status?.needsReconnect;
                    const needsReconnect = status?.connected && status?.needsReconnect;
                    const displayStatus = needsReconnect ? "needsReconnect" : isConnected ? "connected" : "disconnected";
                    return (
                      <div
                        key={p.id}
                        className="rounded-xl bg-dark-800/60 border border-gold-500/10 p-4 flex items-center gap-3"
                      >
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white bg-dark-700">
                          <Globe className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white">{locale === "ar" ? p.nameAr : p.name}</p>
                          <p className={`text-xs mt-0.5 ${displayStatus === "connected" ? "text-emerald-300" : displayStatus === "needsReconnect" ? "text-amber-300" : "text-dark-400"}`}>
                            {displayStatus === "connected" ? (t.connected || "متصل") : displayStatus === "needsReconnect" ? (t.needsReconnect || "يحتاج إعادة ربط") : (t.notConnected || "غير مرتبط")}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {isConnected ? (
                            <button
                              onClick={() => handleDisconnect(p.id)}
                              disabled={disconnecting === p.id}
                              className="inline-flex items-center gap-1 rounded-lg bg-rose-500/15 border border-rose-500/30 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/25 transition disabled:opacity-50"
                            >
                              {disconnecting === p.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Unlink className="w-3 h-3" />}
                              {t.disconnect || "إلغاء الربط"}
                            </button>
                          ) : (
                            <button
                              onClick={() => handleConnect(p.id)}
                              disabled={connecting === p.id}
                              className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-gold-600 to-gold-500 px-3 py-1.5 text-xs font-bold text-dark-950 hover:from-gold-500 hover:to-gold-400 transition disabled:opacity-50"
                            >
                              {connecting === p.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Link2 className="w-3 h-3" />}
                              {needsReconnect ? (t.reconnect || "إعادة الربط") : (t.connect || "ربط")}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>


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