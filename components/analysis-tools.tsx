"use client"

import { useState } from "react"
import { ArrowRight, Download, ShieldCheck, Sparkles, TrendingUp, Zap } from "lucide-react"
import { exportAnalysisPDF } from "@/lib/pdf-export"

interface AnalysisResult {
  score: number
  metrics: { label: string; value: string; status?: string }[]
  issues: { type: string; message: string }[]
  strengths?: string[]
  weaknesses?: string[]
  recommendations: string[]
  aiInsights: string
}

export default function AnalysisTools() {
  const [url, setUrl] = useState("https://")
  const [type, setType] = useState<"website" | "instagram" | "facebook" | "tiktok" | "youtube" | "snapchat">("website")
  const [language, setLanguage] = useState<"ar" | "en">("ar")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState("")

  const handleAnalyze = async () => {
    if (!url || url === "https://" || !/^https?:\/\/.+/.test(url)) {
      setError("يرجى إدخال رابط صحيح للتحليل.")
      return
    }

    setLoading(true)
    setError("")
    setResult(null)

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, type, language }),
      })

      const data = await response.json()
      if (!data.success) {
        throw new Error(data.error || "فشل التحليل")
      }

      setResult(data.analysis)
    } catch (err) {
      console.error(err)
      setError("تعذر تحليل الرابط. تأكد من أن الرابط صحيح وحاول مرة أخرى.")
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    if (!result) {
      setError("قم أولا بإجراء التحليل ثم حمل التقرير.")
      return
    }

    setLoading(true)
    setError("")

    await exportAnalysisPDF({
      title: language === "ar" ? "تقرير التحليل" : "Analysis Report",
      date: new Date().toLocaleDateString(language === "ar" ? "ar-EG" : "en-US"),
      score: result.score,
      metrics: result.metrics.map((metric) => ({ label: metric.label, value: metric.value })),
      issues: result.issues,
      strengths: result.strengths,
      weaknesses: result.weaknesses,
      recommendations: result.recommendations,
    })

    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-7">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center rounded-full border border-amber-400/25 bg-amber-400/10 px-3 py-1 text-sm font-semibold text-amber-300">
              <Sparkles className="ml-2 h-4 w-4" />
              AI Insights
            </div>
            <h2 className="text-2xl font-bold text-white">أدوات التحليل والتقارير</h2>
            <p className="mt-2 text-sm leading-7 text-slate-400">
              ادخل رابط الموقع أو الحساب واختر نوع التحليل لتحصل على تقرير واقعي مخصص ومفيد.
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              تحليل موثوق ومبني على بيانات واضحة
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-300">الرابط</span>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-400/50"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-300">نوع التحليل</span>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as typeof type)}
              className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-400/50"
            >
              <option value="website">الموقع</option>
              <option value="instagram">إنستجرام</option>
              <option value="facebook">فيسبوك</option>
              <option value="tiktok">تيك توك</option>
              <option value="youtube">يوتيوب</option>
              <option value="snapchat">سناب شات</option>
            </select>
          </label>

          <label className="space-y-2 sm:col-span-2">
            <span className="text-sm font-medium text-slate-300">لغة التقرير</span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as typeof language)}
              className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-400/50"
            >
              <option value="ar">العربية</option>
              <option value="en">English</option>
            </select>
          </label>
        </div>

        {error && (
          <div className="mt-5 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
            {error}
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "جاري التحليل..." : "ابدأ التحليل"}
            <ArrowRight className="h-4 w-4" />
          </button>
          <button
            onClick={handleDownload}
            disabled={!result || loading}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-800 disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            {loading ? "جار التحضير..." : "تحميل التقرير (PDF)"}
          </button>
        </div>
      </div>

      {result && (
        <div className="space-y-4 rounded-[2rem] border border-white/10 bg-slate-950/70 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-6">
          <div className="flex flex-col gap-4 rounded-[1.5rem] border border-white/10 bg-gradient-to-r from-amber-400/10 via-slate-900 to-sky-400/10 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-slate-400">النتيجة النهائية</p>
              <p className="text-4xl font-bold text-white">{result.score}%</p>
            </div>
            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
              {language === "ar" ? "تحليل واقعي بناء على الرابط المدخل" : "Real analysis based on entered URL"}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[1.5rem] border border-white/10 bg-slate-900/70 p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
                <TrendingUp className="h-4 w-4 text-amber-400" />
                القياسات
              </div>
              <ul className="space-y-3">
                {result.metrics.map((metric) => (
                  <li key={metric.label} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-950/80 px-4 py-3 text-sm text-slate-300">
                    <span>{metric.label}</span>
                    <span className="font-semibold text-white">{metric.value}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-[1.5rem] border border-white/10 bg-slate-900/70 p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
                <Zap className="h-4 w-4 text-sky-400" />
                التوصيات السريعة
              </div>
              <ul className="space-y-3">
                {result.recommendations.slice(0, 4).map((recommendation, index) => (
                  <li key={index} className="rounded-2xl bg-slate-950/80 px-4 py-3 text-sm text-slate-300">
                    {recommendation}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-[1.5rem] border border-white/10 bg-slate-900/70 p-4">
              <h3 className="mb-3 text-sm font-semibold text-white">نقاط القوة</h3>
              <ul className="space-y-3">
                {(result.strengths || []).map((strength, index) => (
                  <li key={index} className="rounded-2xl bg-slate-950/80 px-4 py-3 text-sm text-slate-300">
                    {strength}
                  </li>
                ))}
                {!result.strengths?.length && (
                  <li className="rounded-2xl bg-slate-950/80 px-4 py-3 text-sm text-slate-300">لا توجد نقاط قوة محددة.</li>
                )}
              </ul>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-slate-900/70 p-4">
              <h3 className="mb-3 text-sm font-semibold text-white">نقاط الضعف</h3>
              <ul className="space-y-3">
                {(result.weaknesses || []).map((weakness, index) => (
                  <li key={index} className="rounded-2xl bg-slate-950/80 px-4 py-3 text-sm text-slate-300">
                    {weakness}
                  </li>
                ))}
                {!result.weaknesses?.length && (
                  <li className="rounded-2xl bg-slate-950/80 px-4 py-3 text-sm text-slate-300">لا توجد نقاط ضعف محددة.</li>
                )}
              </ul>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-slate-900/70 p-4">
            <h3 className="mb-3 text-sm font-semibold text-white">ملاحظات الذكاء الاصطناعي</h3>
            <p className="text-sm leading-7 text-slate-400">{result.aiInsights}</p>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-slate-900/70 p-4">
            <h3 className="mb-3 text-sm font-semibold text-white">المشاكل والاكتشافات</h3>
            <ul className="space-y-3">
              {result.issues.map((issue, index) => (
                <li key={index} className="rounded-2xl bg-slate-950/80 px-4 py-3 text-sm text-slate-300">
                  <span className="font-semibold text-white">
                    {issue.type === "error" ? "خطأ" : issue.type === "warning" ? "تحذير" : "ممتاز"}
                  </span>
                  : {issue.message}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
