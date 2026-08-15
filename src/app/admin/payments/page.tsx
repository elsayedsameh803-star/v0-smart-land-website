"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ShieldCheck, RefreshCw, CreditCard, Users, CheckCircle2, TrendingUp } from "lucide-react";
const T: Record<string, any> = {
  ar: { title: "الدّفع والاشتراكات", back: "عودة", mode: "وضع البوابة", test: "اختبار (Test)", live: "مباشر (Live)", conn: "حالة الاتصال", testConn: "اختبار الاتصال", webhook: "حالة Webhook", active: "مفعّل", inactive: "غير مهيأ", envConfigured: "البوابة مهيأة", envNot: "البوابة غير مهيأة", st: "إحصائيات حقيقية", subs: "المشتركون", act: "نشط", exp: "منتهي", payOk: "مدفوعات ناجحة", payFail: "مدفوعات فاشلة", revenue: "إجمالي الإيرادات", refresh: "تحديث", testRunning: "جارٍ الاختبار…", connected: "متصل", disconnected: "غير متصل", open: "فتح الإدارة" },
  en: { title: "Payments & Subscriptions", back: "Back", mode: "Gateway mode", test: "Test mode", live: "Live mode", conn: "Connection", testConn: "Test connection", webhook: "Webhook status", active: "Active", inactive: "Not configured", envConfigured: "Gateway configured", envNot: "Gateway not configured", st: "Real stats", subs: "Subscribers", act: "Active", exp: "Expired", payOk: "Successful payments", payFail: "Failed payments", revenue: "Total revenue", refresh: "Refresh", testRunning: "Testing…", connected: "Connected", disconnected: "Disconnected", open: "Open management" },
};
export default function AdminPaymentsPage() {
  const router = useRouter();
  const [lang, setLang] = useState<"ar" | "en">("ar");
  const d = T[lang]; const dir = lang === "ar" ? "rtl" : "ltr";
  const [settings, setSettings] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [conn, setConn] = useState(false);
  const load = useCallback(async () => {
    try {
      const r1 = await fetch("/api/admin/payment-settings"); if (r1.status === 401) return router.replace("/admin/login");
      setSettings((await r1.json()).settings || null);
      const r2 = await fetch("/api/admin/payment-stats"); setStats((await r2.json()).stats || null);
    } catch {}
  }, [router]);
  useEffect(() => { load(); }, [load]);
  async function testConn() {
    setConn(true);
    const r = await fetch("/api/admin/payment-settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "test-connection" }) });
    const j = await r.json(); alert(j.connected ? d.connected : d.disconnected); setConn(false);
  }
  const isTest = settings?.mode === "test";
  const isSandbox = settings?.sandbox === true;
  const money = (c: number) => (c / 100).toFixed(2) + " EGP";
    return (
    <div dir={dir} className="min-h-screen bg-dark-950 text-gold-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <button onClick={() => router.push("/admin")} className="text-sm text-dark-400 hover:text-gold-300 flex items-center gap-2"><ArrowLeft className="w-4 h-4" />{d.back}</button>
          <button onClick={() => setLang(lang === "ar" ? "en" : "ar")} className="rounded-lg bg-dark-800 border border-gold-500/20 px-3 py-1.5 text-xs">{lang === "ar" ? "English" : "العربية"}</button>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center"><ShieldCheck className="w-5 h-5 text-dark-950" /></div>
          <h1 className="text-2xl font-bold text-white">{d.title}</h1>
          <button onClick={load} className="ms-auto rounded-lg bg-dark-800 border border-gold-500/20 px-3 py-1.5 text-xs"><RefreshCw className="w-3.5 h-3.5 inline" /> {d.refresh}</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl bg-dark-900 border border-gold-500/10 p-5">
            <p className="text-sm text-dark-400">{d.mode}</p>
            <p className={`text-lg font-bold mt-1 ${isSandbox ? "text-purple-300" : isTest ? "text-amber-300" : "text-emerald-300"}`}>{isSandbox ? "🧪 Sandbox" : isTest ? d.test : d.live}</p>
          </div>
          <div className="rounded-2xl bg-dark-900 border border-gold-500/10 p-5">
            <p className="text-sm text-dark-400">{d.webhook}</p>
            <p className={`text-lg font-bold mt-1 ${settings?.envConfigured ? "text-emerald-300" : "text-red-300"}`}>{settings?.envConfigured ? d.active : d.inactive}</p>
            <p className="text-xs text-dark-500 break-all mt-1">{settings?.webhookUrl || "—"}</p>
          </div>
          <div className="rounded-2xl bg-dark-900 border border-gold-500/10 p-5">
            <p className="text-sm text-dark-400">{d.conn}</p>
            <p className={`text-lg font-bold mt-1 ${settings?.envConfigured ? "text-emerald-300" : "text-amber-300"}`}>{settings?.envConfigured ? d.envConfigured : d.envNot}</p>
            <button onClick={testConn} disabled={conn} className="mt-2 text-xs bg-gold-500/15 text-gold-300 px-3 py-1.5 rounded">{conn ? d.testRunning : d.testConn}</button>
          </div>
        </div>
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="rounded-2xl bg-dark-900 border border-gold-500/10 p-4">
              <div className="flex items-center gap-2 text-gold-300 text-xs mb-2"><Users className="w-4 h-4" /><span>{d.subs}</span></div>
              <p className="text-xl font-bold text-white">{stats.totalSubscribers}</p>
            </div>
            <div className="rounded-2xl bg-dark-900 border border-gold-500/10 p-4">
              <div className="flex items-center gap-2 text-gold-300 text-xs mb-2"><CheckCircle2 className="w-4 h-4" /><span>{`${d.act} / ${d.exp}`}</span></div>
              <p className="text-xl font-bold text-white">{stats.activeSubscriptions} / {stats.expiredSubscriptions}</p>
            </div>
            <div className="rounded-2xl bg-dark-900 border border-gold-500/10 p-4">
              <div className="flex items-center gap-2 text-gold-300 text-xs mb-2"><CreditCard className="w-4 h-4" /><span>{`${d.payOk} / ${d.payFail}`}</span></div>
              <p className="text-xl font-bold text-white">{stats.successfulPayments} / {stats.failedPayments}</p>
            </div>
            <div className="rounded-2xl bg-dark-900 border border-gold-500/10 p-4">
              <div className="flex items-center gap-2 text-gold-300 text-xs mb-2"><TrendingUp className="w-4 h-4" /><span>{d.revenue}</span></div>
              <p className="text-xl font-bold text-white">{money(stats.totalRevenueCents)}</p>
            </div>
          </div>
        )}
        <div className="rounded-2xl bg-dark-800/60 border border-gold-500/10 p-4 text-sm">
          <p className="text-dark-400 mb-2">{d.open}:</p>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => router.push("/admin/subscriptions")} className="rounded-lg bg-gold-500/10 text-gold-300 px-3 py-2 text-xs">Subscriptions · الاشتراكات</button>
            <button onClick={() => router.push("/admin/plans")} className="rounded-lg bg-gold-500/10 text-gold-300 px-3 py-2 text-xs">Plans · الباقات</button>
            <button onClick={() => router.push("/admin/transactions")} className="rounded-lg bg-gold-500/10 text-gold-300 px-3 py-2 text-xs">Transactions · العمليات</button>
            <button onClick={() => router.push("/checkout?plan=pro")} className="rounded-lg bg-emerald-500/15 text-emerald-300 px-3 py-2 text-xs border border-emerald-500/20">🧪 Test Checkout</button>
          </div>
        </div>
      </div>
    </div>
  );
}