"use client";
"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CreditCard, Loader2, CheckCircle2, XCircle, AlertCircle, BadgeCheck } from "lucide-react";
type Plan = { id: string; name: string; nameAr: string; description: string; descriptionAr: string; priceCents: number; durationMonths: number; currency: string; features: string[]; active: boolean };
const T: Record<string, any> = {
  ar: { title: "اشترك في Smart Land", sub: "اختر باقتك واستكمل الدفع بأمان عبر Paymob (وضع اختبار)", name: "الاسم الكامل", email: "البريد الإلكتروني", cta: "ابدأ الدفع عبر Paymob", or: "أو", backHome: "العودة للرئيسية", required: "أدخل الاسم والبريد الإلكتروني الصحيحين", starting: "جارٍ إنشاء الدفع…", processing: "جارٍ الدفع", success: "تم الدفع بنجاح", failed: "فشل الدفع", cancelled: "تم إلغاء الدفع", pendingState: "عملية قيد المعالجة", goPay: "إتمام الدفع", month: "شهر", free: "مجاني", tryAgain: "حاول مجدداً", redirecting: "يتم توجيهك إلى بوابة الدفع…", unavailable: "الباقة غير متاحة", configErr: "بوابة الدفع غير مهيأة بعد (أضف مفاتيح Paymob في البيئة)." },
  en: { title: "Subscribe to Smart Land", sub: "Choose a plan and pay securely via Paymob (Test mode)", name: "Full name", email: "Email address", cta: "Start payment via Paymob", or: "or", backHome: "Back to home", required: "Enter a valid name and email", starting: "Creating payment…", processing: "Payment in progress", success: "Payment successful", failed: "Payment failed", cancelled: "Payment cancelled", pendingState: "Payment pending", goPay: "Complete payment", month: "month", free: "Free", tryAgain: "Try again", redirecting: "Redirecting to the payment gateway…", unavailable: "Plan unavailable", configErr: "Payment gateway is not configured yet (add Paymob keys in the environment)." },
};
export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-dark-950 text-gold-100 flex items-center justify-center p-6"><Loader2 className="w-10 h-10 animate-spin text-gold-400" /></div>}>
      <CheckoutContent />
    </Suspense>
  );
}

function CheckoutContent() {
  const params = useSearchParams();
  const qPlan = params.get("plan") || "pro";
  const [lang, setLang] = useState<"ar" | "en">("ar");
  const d = T[lang]; const dir = lang === "ar" ? "rtl" : "ltr";
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selected, setSelected] = useState(qPlan);
  const [name, setName] = useState(""); const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<"idle" | "processing" | "success" | "failed" | "cancelled" | "pending" | "error">("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/payments/subscription").then((r) => r.json()).then((j) => {
      if (Array.isArray(j.plans)) setPlans(j.plans.filter((p: Plan) => p.active));
    }).catch(() => {});
  }, []);
  const money = (c: number) => (c / 100).toFixed(2);

  async function start() {
    if (!name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setStatus("error"); setError(d.required); return; }
    setBusy(true); setStatus("processing");
    const res = await fetch("/api/payments/checkout", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId: selected, customer: { name, email }, locale: lang }),
    }).catch(() => null);
    const j = res ? await res.json().catch(() => null) : null;
    if (!res || !j?.success) {
      setStatus("error"); setBusy(false);
      setError(j?.error || d.configErr); return;
    }
    if (j.free) { setStatus("success"); setBusy(false); return; }
    // Sandbox mode: process inline instead of redirect
    if (j.sandbox) {
      // Simulate payment via webhook
      const cb = await fetch("/api/payments/webhook?sandbox=true", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transactionId: j.transactionId,
          email,
          name,
          planId: selected,
          amountCents: j.plan?.priceCents || 190000,
          outcome: "success",
        }),
      }).catch(() => null);
      const cbj = cb ? await cb.json().catch(() => null) : null;
      if (cbj?.success) {
        setStatus("success");
      } else {
        setStatus("failed");
      }
      setBusy(false);
      return;
    }
    // Real Paymob: redirect to the iframe payment page
    sessionStorage.setItem("paymob_order", j.orderId || "");
    window.location.href = j.paymentUrl;
  }
    // Status screen when a payment has been initiated / returning from Paymob
  if (status !== "idle") {
    return (
      <div dir={dir} className="min-h-screen bg-dark-950 text-gold-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-3xl bg-dark-900 border border-gold-500/10 p-8 text-center space-y-5">
          {status === "processing" && <>
            <Loader2 className="w-12 h-12 mx-auto text-gold-400 animate-spin" />
            <p className="text-lg font-semibold text-white">{d.redirecting}</p>
            <p className="text-sm text-dark-400">{d.processing}</p>
          </>}
          {status === "success" && <>
            <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-400" />
            <p className="text-lg font-semibold text-emerald-300">{d.success}</p>
            <a href="/" className="inline-block rounded-lg bg-gradient-to-r from-gold-600 to-gold-500 px-5 py-2.5 text-sm font-bold text-dark-950">{d.backHome}</a>
          </>}
          {status === "failed" && <>
            <XCircle className="w-12 h-12 mx-auto text-red-400" />
            <p className="text-lg font-semibold text-red-300">{d.failed}</p>
            <button onClick={() => setStatus("idle")} className="rounded-lg bg-dark-800 border border-gold-500/20 px-4 py-2 text-sm">{d.tryAgain}</button>
          </>}
          {status === "cancelled" && <>
            <AlertCircle className="w-12 h-12 mx-auto text-amber-400" />
            <p className="text-lg font-semibold text-amber-300">{d.cancelled}</p>
            <button onClick={() => setStatus("idle")} className="rounded-lg bg-dark-800 border border-gold-500/20 px-4 py-2 text-sm">{d.tryAgain}</button>
          </>}
          {status === "pending" && <>
            <AlertCircle className="w-12 h-12 mx-auto text-amber-400" />
            <p className="text-lg font-semibold text-amber-300">{d.pendingState}</p>
          </>}
          {status === "error" && <>
            <XCircle className="w-12 h-12 mx-auto text-red-400" />
            <p className="text-lg font-semibold text-red-300">{error || d.configErr}</p>
            <button onClick={() => setStatus("idle")} className="rounded-lg bg-dark-800 border border-gold-500/20 px-4 py-2 text-sm">{d.tryAgain}</button>
          </>}
        </div>
      </div>
    );
  }

  return (
    <div dir={dir} className="min-h-screen bg-dark-950 text-gold-100 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex mx-auto items-center gap-2 rounded-full bg-gold-500/10 border border-gold-500/20 px-3 py-1 text-xs text-gold-300"><CreditCard className="w-4 h-4" /> Paymob</div>
          <h1 className="text-3xl font-bold text-white">{d.title}</h1>
          <p className="text-dark-400 text-sm">{d.sub}</p>
          <button onClick={() => setLang(lang === "ar" ? "en" : "ar")} className="mt-1 rounded-lg bg-dark-800 border border-gold-500/20 px-3 py-1.5 text-xs">{lang === "ar" ? "English" : "العربية"}</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((p) => {
            const sel = selected === p.id;
            return (
              <button key={p.id} onClick={() => setSelected(p.id)}
                className={`text-start rounded-2xl border p-5 transition ${sel ? "border-gold-500 bg-gold-500/10" : "border-gold-500/15 bg-dark-900 hover:border-gold-500/40"}`}>
                <div className="flex items-center justify-between">
                  <p className="font-bold text-white">{lang === "ar" ? p.nameAr : p.name}</p>
                  {sel && <BadgeCheck className="w-5 h-5 text-gold-400" />}
                </div>
                <p className="mt-2 text-2xl font-bold text-gold-300">{p.priceCents <= 0 ? d.free : `${money(p.priceCents)} ${p.currency}`}<span className="text-xs text-dark-400">/{d.month}</span></p>
                <p className="mt-1 text-xs text-dark-400">{lang === "ar" ? p.descriptionAr : p.description}</p>
              </button>
            );
          })}
        </div>

        <div className="rounded-2xl bg-dark-900 border border-gold-500/10 p-6 space-y-4">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder={d.name} className="w-full rounded-xl bg-dark-800 border border-gold-500/20 px-4 py-3 text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-gold-500/50" />
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder={d.email} className="w-full rounded-xl bg-dark-800 border border-gold-500/20 px-4 py-3 text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-gold-500/50" />
          <button onClick={start} disabled={busy} className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gold-600 to-gold-500 px-6 py-3.5 font-bold text-dark-950">
            {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <CreditCard className="w-5 h-5" />}
            {busy ? d.starting : d.cta}
          </button>
          <p className="text-center text-xs text-dark-500">{d.or} <a href="/" className="text-gold-400 hover:underline">{d.backHome}</a></p>
        </div>
      </div>
    </div>
  );
}