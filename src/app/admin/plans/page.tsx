"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2, Save, FileText } from "lucide-react";
type Plan = { id: string; name: string; nameAr: string; priceCents: number; durationMonths: number; active: boolean; sortOrder: number; features: string[]; billing: string; limits: { sitesLimit: number; pagesLimit: number } };
const T: Record<string, any> = {
  ar: { title: "إدارة الباقات", back: "عودة", name: "الاسم", price: "السعر", months: "المدة (شهر)", features: "المميزات", status: "الحالة", add: "إضافة", save: "حفظ", del: "حذف", on: "مفعّلة", off: "معطّلة", new: "باقة جديدة", updated: "تم التحديث", billing: "الفوترة", monthly: "شهري", yearly: "سنوي", oneTime: "مرة واحدة", sites: "المواقع", pages: "الصفحات/تدقيق", refundTitle: "سياسة الاسترداد", refundEn: "سياسة الاسترداد (إنجليزي)", refundAr: "سياسة الاسترداد (عربي)", saveRefund: "حفظ السياسة", saved: "تم الحفظ ✓", unlimited: "غير محدود (-1)", loading: "جارٍ التحميل…" },
  en: { title: "Plans Management", back: "Back", name: "Name", price: "Price", months: "Duration (mo)", features: "Features", status: "Status", add: "Add", save: "Save", del: "Delete", on: "Active", off: "Disabled", new: "New plan", updated: "Updated", billing: "Billing", monthly: "Monthly", yearly: "Yearly", oneTime: "One-time", sites: "Sites", pages: "Pages/audit", refundTitle: "Refund Policy", refundEn: "Refund policy (EN)", refundAr: "Refund policy (AR)", saveRefund: "Save policy", saved: "Saved ✓", unlimited: "Unlimited (-1)", loading: "Loading…" },
};
export default function AdminPlansPage() {
  const router = useRouter();
  const [lang, setLang] = useState<"ar" | "en">("ar");
  const d = T[lang]; const dir = lang === "ar" ? "rtl" : "ltr";
  const [plans, setPlans] = useState<Plan[]>([]);
  const [editing, setEditing] = useState<Record<string, Partial<Plan>>>({});
  const [creating, setCreating] = useState(false);
  const [refundEn, setRefundEn] = useState("");
  const [refundAr, setRefundAr] = useState("");
  const [savingRefund, setSavingRefund] = useState(false);
  const [refundMsg, setRefundMsg] = useState("");
  const load = useCallback(async () => {
    try { const r = await fetch("/api/admin/plans"); if (r.status === 401) return router.replace("/admin/login"); setPlans((await r.json()).plans || []); } catch {}
    try {
      const r2 = await fetch("/api/admin/payment-settings");
      const j = await r2.json();
      if (j?.settings) {
        if (j.settings.refundPolicyEn) setRefundEn(j.settings.refundPolicyEn);
        if (j.settings.refundPolicyAr) setRefundAr(j.settings.refundPolicyAr);
      }
    } catch {}
  }, [router]);
  useEffect(() => { load(); }, [load]);
  async function savePlan(id: string, patch: Partial<Plan>) {
    const body: any = { id };
    if (patch.name !== undefined) body.name = patch.name;
    if (patch.nameAr !== undefined) body.nameAr = patch.nameAr;
    if (patch.priceCents !== undefined) body.priceCents = patch.priceCents;
    if (patch.durationMonths !== undefined) body.durationMonths = patch.durationMonths;
    if (patch.billing !== undefined) body.billing = patch.billing;
    if (patch.active !== undefined) body.active = patch.active;
    if (patch.limits !== undefined) body.limits = patch.limits;
    await fetch("/api/admin/plans", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setEditing((e) => { const x = { ...e }; delete x[id]; return x; }); load();
  }
  async function saveRefund() {
    setSavingRefund(true); setRefundMsg("");
    try {
      const r = await fetch("/api/admin/payment-settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ refundPolicyEn: refundEn, refundPolicyAr: refundAr }) });
      if (r.ok) setRefundMsg(d.saved); else setRefundMsg("!");
    } catch { setRefundMsg("!"); } finally { setSavingRefund(false); }
  }
  async function addPlan() {
    const name = prompt(d.name);
    if (!name) return;
    await fetch("/api/admin/plans", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, nameAr: name, priceCents: 9900, durationMonths: 1, active: true, billing: "monthly", limits: { sitesLimit: -1, pagesLimit: -1 } }) });
    load();
  }
  async function delPlan(id: string) {
    if (!confirm("Delete?")) return;
    await fetch(`/api/admin/plans?id=${id}`, { method: "DELETE" });
    load();
  }
  const set = (id: string, k: keyof Plan, v: any) => setEditing((e) => ({ ...e, [id]: { ...(e[id] || {}), [k]: v } }));
  const setLimit = (id: string, key: "sitesLimit" | "pagesLimit", val: number) =>
    setEditing((e) => {
      const existing = e[id]?.limits ?? plans.find((p) => p.id === id)?.limits;
      const base = { sitesLimit: existing?.sitesLimit ?? -1, pagesLimit: existing?.pagesLimit ?? -1 };
      return { ...e, [id]: { ...(e[id] || {}), limits: { ...base, [key]: val } } };
    });
    return (
    <div dir={dir} className="min-h-screen bg-dark-950 text-gold-100 p-6">
      <div className="max-w-5xl mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <button onClick={() => router.push("/admin")} className="text-sm text-dark-400 hover:text-gold-300 flex items-center gap-2"><ArrowLeft className="w-4 h-4" />{d.back}</button>
          <div className="flex gap-2">
            <button onClick={() => setLang(lang === "ar" ? "en" : "ar")} className="rounded-lg bg-dark-800 border border-gold-500/20 px-3 py-1.5 text-xs">{lang === "ar" ? "English" : "العربية"}</button>
            <button onClick={addPlan} className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-gold-600 to-gold-500 px-3 py-1.5 text-xs font-bold text-dark-950"><Plus className="w-4 h-4" />{d.add}</button>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-white">{d.title}</h1>
        <div className="rounded-2xl bg-dark-900 border border-gold-500/10 overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-dark-400 border-b border-gold-500/10">
              <th className="p-3 text-start">{d.name}</th><th className="p-3 text-start">{d.price}</th><th className="p-3 text-start">{d.billing}</th><th className="p-3 text-start">{d.months}</th>
              <th className="p-3 text-start">{d.sites}</th><th className="p-3 text-start">{d.pages}</th><th className="p-3 text-start">{d.status}</th><th className="p-3 text-start">{d.save}</th><th className="p-3 text-start"></th>
            </tr></thead>
            <tbody>
              {plans.map((p) => {
                const e = editing[p.id] || {};
                const name = (e.name ?? p.name) as string;
                const price = e.priceCents ?? p.priceCents;
                const months = e.durationMonths ?? p.durationMonths;
                const active = e.active ?? p.active;
                const billing = e.billing ?? p.billing ?? "monthly";
                const sites = e.limits?.sitesLimit ?? p.limits?.sitesLimit ?? -1;
                const pages = e.limits?.pagesLimit ?? p.limits?.pagesLimit ?? -1;
                return (
                  <tr key={p.id} className="border-b border-gold-500/5">
                    <td className="p-3"><input defaultValue={name} onChange={(ev) => set(p.id, "name", ev.target.value)} className="bg-dark-800 border border-gold-500/20 rounded px-2 py-1 text-sm" /></td>
                    <td className="p-3"><input type="number" defaultValue={price} onChange={(ev) => set(p.id, "priceCents", Number(ev.target.value))} className="bg-dark-800 border border-gold-500/20 rounded px-2 py-1 text-sm w-24" /></td>
                    <td className="p-3">
                      <select
                        value={billing}
                        onChange={(ev) => set(p.id, "billing", ev.target.value)}
                        className="bg-dark-800 border border-gold-500/20 rounded px-2 py-1 text-sm"
                      >
                        <option value="monthly">{d.monthly}</option>
                        <option value="yearly">{d.yearly}</option>
                        <option value="one_time">{d.oneTime}</option>
                      </select>
                    </td>
                    <td className="p-3"><input type="number" defaultValue={months} onChange={(ev) => set(p.id, "durationMonths", Number(ev.target.value))} className="bg-dark-800 border border-gold-500/20 rounded px-2 py-1 text-sm w-16" /></td>
                    <td className="p-3"><input type="number" value={sites} onChange={(ev) => setLimit(p.id, "sitesLimit", Number(ev.target.value))} className="bg-dark-800 border border-gold-500/20 rounded px-2 py-1 text-sm w-20" title={d.unlimited} /></td>
                    <td className="p-3"><input type="number" value={pages} onChange={(ev) => setLimit(p.id, "pagesLimit", Number(ev.target.value))} className="bg-dark-800 border border-gold-500/20 rounded px-2 py-1 text-sm w-20" title={d.unlimited} /></td>
                    <td className="p-3"><input type="checkbox" defaultChecked={active} onChange={(ev) => set(p.id, "active", ev.target.checked)} /></td>
                    <td className="p-3"><button onClick={() => savePlan(p.id, e)} className="text-xs bg-emerald-500/15 text-emerald-300 px-2 py-1 rounded">{d.save}</button></td>
                    <td className="p-3"><button onClick={() => delPlan(p.id)} className="text-xs bg-red-500/15 text-red-300 px-2 py-1 rounded"><Trash2 className="w-3 h-3 inline" /></button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="rounded-2xl bg-dark-900 border border-gold-500/10 p-6">
          <h3 className="text-sm font-bold text-gold-300 mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4" /> {d.refundTitle}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-dark-400 mb-1">{d.refundEn}</label>
              <textarea
                value={refundEn}
                onChange={(ev) => setRefundEn(ev.target.value)}
                rows={3}
                className="w-full rounded-xl bg-dark-800 border border-gold-500/20 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-gold-500/50"
              />
            </div>
            <div>
              <label className="block text-xs text-dark-400 mb-1">{d.refundAr}</label>
              <textarea
                value={refundAr}
                onChange={(ev) => setRefundAr(ev.target.value)}
                rows={3}
                className="w-full rounded-xl bg-dark-800 border border-gold-500/20 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-gold-500/50"
              />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={saveRefund}
              disabled={savingRefund}
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-gold-600 to-gold-500 px-4 py-2 text-xs font-bold text-dark-950 disabled:opacity-50"
            >
              <Save className="w-4 h-4" /> {d.saveRefund}
            </button>
            {refundMsg && <span className="text-xs text-emerald-300">{refundMsg}</span>}
          </div>
        </div>
        <p className="text-xs text-dark-500">{d.features}: {d.unlimited} = السالب للاشتراكات غير المحدودة، ويُطبع على الإيصالات ويُعرض للزوار تلقائياً. {d.updated}.</p>
      </div>
    </div>
  );
}