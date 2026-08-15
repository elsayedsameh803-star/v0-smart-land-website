"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, ShieldCheck, ArrowLeft } from "lucide-react";

type Sub = {
  id: string; customerEmail: string; customerName: string; planId: string; amountCents: number;
  status: "active" | "expired" | "pending" | "cancelled" | "failed";
  startDate: string | null; endDate: string | null; transactionId: string | null;
  paymentMethod: string; paymentDate: string | null; plan?: { name: string } | null;
};
const T: Record<string, any> = {
  ar: { title: "إدارة الاشتراكات", search: "بحث (المستخدم / البريد)", plan: "الباقة", status: "الحالة", all: "الكل", acts: "إجراءات", no: "لا توجد اشتراكات", load: "جارٍ التحميل…", a: "تفعيل", s: "إيقاف", x: "تمديد 1 شهر", user: "المستخدم", email: "البريد", price: "السعر", start: "البداية", end: "الانتهاء", tx: "Transaction ID", back: "عودة", sa: "نشط", se: "منتهي", sp: "معلّق", sc: "ملغى", sf: "فشل" },
  en: { title: "Subscription Management", search: "Search (user / email)", plan: "Plan", status: "Status", all: "All", acts: "Actions", no: "No subscriptions", load: "Loading…", a: "Activate", s: "Suspend", x: "Extend 1mo", user: "User", email: "Email", price: "Price", start: "Start", end: "End", tx: "Transaction ID", back: "Back", sa: "Active", se: "Expired", sp: "Pending", sc: "Cancelled", sf: "Failed" },
};
export default function AdminSubscriptionsPage() {
  const router = useRouter();
  const [lang, setLang] = useState<"ar" | "en">("ar");
  const d = T[lang];
  const dir = lang === "ar" ? "rtl" : "ltr";
  const [subs, setSubs] = useState<Sub[]>([]);
  const [plans, setPlans] = useState<Array<{ id: string; name: string }>>([]);
  const [q, setQ] = useState(""); const [fPlan, setFPlan] = useState("all"); const [fStatus, setFStatus] = useState("all");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/subscriptions");
      if (r.status === 401) return router.replace("/admin/login");
      setSubs((await r.json()).subscriptions || []);
      setPlans((await (await fetch("/api/admin/plans")).json()).plans || []);
    } catch { setSubs([]); } finally { setLoading(false); }
  }, [router]);
  useEffect(() => { load(); }, [load]);
  async function act(id: string, action: string, extra: any = {}) {
    await fetch("/api/admin/subscriptions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, action, ...extra }) });
    load();
  }
  const filtered = subs.filter((s) =>
    `${s.customerName} ${s.customerEmail}`.toLowerCase().includes(q.toLowerCase()) &&
    (fPlan === "all" || s.planId === fPlan) && (fStatus === "all" || s.status === fStatus));
  const label = (s: string) => s === "active" ? d.sa : s === "expired" ? d.se : s === "pending" ? d.sp : s === "cancelled" ? d.sc : d.sf;
  const fv = (v: string | null) => v ? new Date(v).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US") : "—";
  const money = (c: number) => (c / 100).toFixed(2);
    return (
    <div dir={dir} className="min-h-screen bg-dark-950 text-gold-100 p-6">
      <div className="max-w-7xl mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <button onClick={() => router.push("/admin")} className="text-sm text-dark-400 hover:text-gold-300 flex items-center gap-2"><ArrowLeft className="w-4 h-4" />{d.back}</button>
          <button onClick={() => setLang(lang === "ar" ? "en" : "ar")} className="rounded-lg bg-dark-800 border border-gold-500/20 px-3 py-1.5 text-xs">{lang === "ar" ? "English" : "العربية"}</button>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center"><ShieldCheck className="w-5 h-5 text-dark-950" /></div>
          <h1 className="text-2xl font-bold text-white">{d.title}</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative"><Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={d.search} className="w-full rounded-xl bg-dark-900 border border-gold-500/20 ps-10 pe-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-gold-500/50" />
          </div>
          <select value={fPlan} onChange={(e) => setFPlan(e.target.value)} className="rounded-xl bg-dark-900 border border-gold-500/20 px-4 py-2.5 text-sm">
            <option value="all">{d.plan}: {d.all}</option>{plans.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <select value={fStatus} onChange={(e) => setFStatus(e.target.value)} className="rounded-xl bg-dark-900 border border-gold-500/20 px-4 py-2.5 text-sm">
            <option value="all">{d.status}: {d.all}</option>{["active", "expired", "pending", "cancelled", "failed"].map((s) => <option key={s} value={s}>{label(s)}</option>)}
          </select>
        </div>
        <div className="rounded-2xl bg-dark-900 border border-gold-500/10 overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-dark-400 border-b border-gold-500/10">
              <th className="p-3 text-start">{d.user}</th><th className="p-3 text-start">{d.email}</th><th className="p-3 text-start">{d.plan}</th>
              <th className="p-3 text-start">{d.price}</th><th className="p-3 text-start">{d.status}</th><th className="p-3 text-start">{d.start}</th>
              <th className="p-3 text-start">{d.end}</th><th className="p-3 text-start">{d.tx}</th><th className="p-3 text-start">{d.acts}</th>
            </tr></thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={9} className="p-4 text-dark-400">{loading ? d.load : d.no}</td></tr>}
              {filtered.map((s) => (
                <tr key={s.id} className="border-b border-gold-500/5 hover:bg-dark-800/40">
                  <td className="p-3">{s.customerName || "—"}</td><td className="p-3">{s.customerEmail}</td>
                  <td className="p-3">{s.plan?.name || s.planId}</td><td className="p-3">{money(s.amountCents)}</td>
                  <td className="p-3"><span className={`text-xs px-2 py-1 rounded-full ${s.status === "active" ? "bg-emerald-500/15 text-emerald-300" : s.status === "expired" ? "bg-red-500/15 text-red-300" : s.status === "pending" ? "bg-amber-500/15 text-amber-300" : "bg-dark-700 text-dark-300"}`}>{label(s.status)}</span></td>
                  <td className="p-3 text-xs">{fv(s.startDate)}</td><td className="p-3 text-xs">{fv(s.endDate)}</td>
                  <td className="p-3 text-xs font-mono">{s.transactionId || "—"}</td>
                  <td className="p-3"><div className="flex gap-1 flex-wrap">
                    {s.status !== "active" && <button onClick={() => act(s.id, "activate")} className="text-xs bg-emerald-500/15 text-emerald-300 px-2 py-1 rounded">{d.a}</button>}
                    {s.status === "active" && <button onClick={() => act(s.id, "cancel")} className="text-xs bg-red-500/15 text-red-300 px-2 py-1 rounded">{d.s}</button>}
                    <button onClick={() => act(s.id, "extend", { months: 1 })} className="text-xs bg-dark-800 px-2 py-1 rounded">{d.x}</button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}