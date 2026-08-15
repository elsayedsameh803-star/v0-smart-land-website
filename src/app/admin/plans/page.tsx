"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
type Plan = { id: string; name: string; nameAr: string; priceCents: number; durationMonths: number; active: boolean; sortOrder: number; features: string[] };
const T: Record<string, any> = {
  ar: { title: "إدارة الباقات", back: "عودة", name: "الاسم", price: "السعر (ج.م)", months: "المدة (شهر)", features: "المميزات", status: "الحالة", add: "إضافة", save: "حفظ", del: "حذف", on: "مفعّلة", off: "معطّلة", new: "باقة جديدة", updated: "تم التحديث" },
  en: { title: "Plans Management", back: "Back", name: "Name", price: "Price (EGP)", months: "Duration (mo)", features: "Features", status: "Status", add: "Add", save: "Save", del: "Delete", on: "Active", off: "Disabled", new: "New plan", updated: "Updated" },
};
export default function AdminPlansPage() {
  const router = useRouter();
  const [lang, setLang] = useState<"ar" | "en">("ar");
  const d = T[lang]; const dir = lang === "ar" ? "rtl" : "ltr";
  const [plans, setPlans] = useState<Plan[]>([]);
  const [editing, setEditing] = useState<Record<string, Partial<Plan>>>({});
  const [creating, setCreating] = useState(false);
  const load = useCallback(async () => {
    try { const r = await fetch("/api/admin/plans"); if (r.status === 401) return router.replace("/admin/login"); setPlans((await r.json()).plans || []); } catch {}
  }, [router]);
  useEffect(() => { load(); }, [load]);
  async function savePlan(id: string, patch: Partial<Plan>) {
    await fetch("/api/admin/plans", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, ...patch }) });
    setEditing((e) => { const x = { ...e }; delete x[id]; return x; }); load();
  }
  async function addPlan() {
    const name = prompt(d.name);
    if (!name) return;
    await fetch("/api/admin/plans", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, priceCents: 9900, durationMonths: 1, active: true }) });
    load();
  }
  async function delPlan(id: string) {
    if (!confirm("Delete?")) return;
    await fetch(`/api/admin/plans?id=${id}`, { method: "DELETE" });
    load();
  }
  const set = (id: string, k: keyof Plan, v: any) => setEditing((e) => ({ ...e, [id]: { ...(e[id] || {}), [k]: v } }));
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
              <th className="p-3 text-start">{d.name}</th><th className="p-3 text-start">{d.price}</th><th className="p-3 text-start">{d.months}</th>
              <th className="p-3 text-start">{d.status}</th><th className="p-3 text-start">{d.save}</th><th className="p-3 text-start"></th>
            </tr></thead>
            <tbody>
              {plans.map((p) => {
                const e = editing[p.id] || {};
                const name = (e.name ?? p.name) as string;
                const price = e.priceCents ?? p.priceCents;
                const months = e.durationMonths ?? p.durationMonths;
                const active = e.active ?? p.active;
                return (
                  <tr key={p.id} className="border-b border-gold-500/5">
                    <td className="p-3"><input defaultValue={name} onChange={(ev) => set(p.id, "name", ev.target.value)} className="bg-dark-800 border border-gold-500/20 rounded px-2 py-1 text-sm" /></td>
                    <td className="p-3"><input type="number" defaultValue={price} onChange={(ev) => set(p.id, "priceCents", Number(ev.target.value))} className="bg-dark-800 border border-gold-500/20 rounded px-2 py-1 text-sm w-28" /></td>
                    <td className="p-3"><input type="number" defaultValue={months} onChange={(ev) => set(p.id, "durationMonths", Number(ev.target.value))} className="bg-dark-800 border border-gold-500/20 rounded px-2 py-1 text-sm w-20" /></td>
                    <td className="p-3"><input type="checkbox" defaultChecked={active} onChange={(ev) => set(p.id, "active", ev.target.checked)} /></td>
                    <td className="p-3"><button onClick={() => savePlan(p.id, e)} className="text-xs bg-emerald-500/15 text-emerald-300 px-2 py-1 rounded">{d.save}</button></td>
                    <td className="p-3"><button onClick={() => delPlan(p.id)} className="text-xs bg-red-500/15 text-red-300 px-2 py-1 rounded"><Trash2 className="w-3 h-3 inline" /></button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-dark-500">{d.features}: Pro = «{d.on}», Free/Enterprise default. {d.updated}.</p>
      </div>
    </div>
  );
}