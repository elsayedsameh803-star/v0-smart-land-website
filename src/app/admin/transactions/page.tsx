"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search, CreditCard } from "lucide-react";
type Tx = { id: string; customerEmail: string; planName: string; amountCents: number; status: string; transactionId: string; paymentMethod: string; createdAt: string; webhookReceived: boolean; webhookResult: string | null };
const T: Record<string, any> = {
  ar: { title: "إدارة العمليات (Transactions)", back: "عودة", search: "بحث (بريد / باقة / رقم)", email: "المستخدم", plan: "الباقة", amount: "المبلغ", status: "حالة العملية", tx: "Transaction ID", method: "الطريقة", date: "التاريخ", webhook: "Webhook", none: "لا توجد عمليات", load: "جارٍ التحميل…", rec: "استلم", not: "لم يستلم", result: "النتيجة" },
  en: { title: "Transactions Management", back: "Back", search: "Search (email / plan / id)", email: "User", plan: "Plan", amount: "Amount", status: "Status", tx: "Transaction ID", method: "Method", date: "Date", webhook: "Webhook", none: "No transactions", load: "Loading…", rec: "Received", not: "Not received", result: "Result" },
};
export default function AdminTransactionsPage() {
  const router = useRouter();
  const [lang, setLang] = useState<"ar" | "en">("ar");
  const d = T[lang]; const dir = lang === "ar" ? "rtl" : "ltr";
  const [tx, setTx] = useState<Tx[]>([]); const [q, setQ] = useState("");
  const load = useCallback(async () => {
    try { const r = await fetch("/api/admin/transactions"); if (r.status === 401) return router.replace("/admin/login"); setTx((await r.json()).transactions || []); } catch {}
  }, [router]);
  useEffect(() => { load(); }, [load]);
  const filtered = tx.filter((t) => `${t.customerEmail} ${t.planName} ${t.transactionId} ${t.id}`.toLowerCase().includes(q.toLowerCase()));
  const statusColor = (s: string) => s === "success" ? "bg-emerald-500/15 text-emerald-300" : s === "failed" ? "bg-red-500/15 text-red-300" : s === "pending" ? "bg-amber-500/15 text-amber-300" : "bg-dark-700 text-dark-300";
  const money = (c: number) => (c / 100).toFixed(2);
  return (
    <div dir={dir} className="min-h-screen bg-dark-950 text-gold-100 p-6">
      <div className="max-w-7xl mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <button onClick={() => router.push("/admin")} className="text-sm text-dark-400 hover:text-gold-300 flex items-center gap-2"><ArrowLeft className="w-4 h-4" />{d.back}</button>
          <button onClick={() => setLang(lang === "ar" ? "en" : "ar")} className="rounded-lg bg-dark-800 border border-gold-500/20 px-3 py-1.5 text-xs">{lang === "ar" ? "English" : "العربية"}</button>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center"><CreditCard className="w-5 h-5 text-dark-950" /></div>
          <h1 className="text-2xl font-bold text-white">{d.title}</h1>
        </div>
        <div className="relative max-w-md"><Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={d.search} className="w-full rounded-xl bg-dark-900 border border-gold-500/20 ps-10 pe-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-gold-500/50" /></div>
        <div className="rounded-2xl bg-dark-900 border border-gold-500/10 overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-dark-400 border-b border-gold-500/10">
              <th className="p-3 text-start">{d.email}</th><th className="p-3 text-start">{d.plan}</th><th className="p-3 text-start">{d.amount}</th>
              <th className="p-3 text-start">{d.status}</th><th className="p-3 text-start">{d.tx}</th><th className="p-3 text-start">{d.method}</th>
              <th className="p-3 text-start">{d.date}</th><th className="p-3 text-start">{d.webhook}</th>
            </tr></thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={8} className="p-4 text-dark-400">{tx.length === 0 ? d.load : d.none}</td></tr>}
              {filtered.map((t) => (
                <tr key={t.id} className="border-b border-gold-500/5">
                  <td className="p-3">{t.customerEmail}</td><td className="p-3">{t.planName}</td><td className="p-3">{money(t.amountCents)}</td>
                  <td className="p-3"><span className={`text-xs px-2 py-1 rounded-full ${statusColor(t.status)}`}>{t.status}</span></td>
                  <td className="p-3 text-xs font-mono">{t.transactionId || "—"}</td><td className="p-3">{t.paymentMethod}</td>
                  <td className="p-3 text-xs">{new Date(t.createdAt).toLocaleString(lang === "ar" ? "ar-EG" : "en-US")}</td>
                  <td className="p-3 text-xs">{t.webhookReceived ? `${d.rec} (${t.webhookResult || ""})` : d.not}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
