"use client"

import { FormEvent, useState } from "react"
import { useLanguage } from "@/lib/language-context"
import { exportAnalysisPDF } from "@/lib/pdf-export"

type Platform = "website" | "youtube" | "instagram" | "facebook" | "tiktok"
type Analysis = {
  score: number
  metrics: { label: string; value: string; status: "good" | "medium" | "bad" }[]
  issues: { type: string; message: string }[]
  recommendations: string[]
  aiInsights: string
}

const platforms: { value: Platform; ar: string; en: string; placeholder: string }[] = [
  { value: "website", ar: "موقع إلكتروني", en: "Website", placeholder: "https://example.com" },
  { value: "youtube", ar: "YouTube", en: "YouTube", placeholder: "https://www.youtube.com/@channel" },
  { value: "instagram", ar: "Instagram", en: "Instagram", placeholder: "https://www.instagram.com/account" },
  { value: "facebook", ar: "Facebook", en: "Facebook", placeholder: "https://www.facebook.com/page" },
  { value: "tiktok", ar: "TikTok", en: "TikTok", placeholder: "https://www.tiktok.com/@account" },
]

export default function AnalysisTools() {
  const { language, t } = useLanguage()
  const [platform, setPlatform] = useState<Platform>("website")
  const [url, setUrl] = useState("")
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const selected = platforms.find((item) => item.value === platform) || platforms[0]

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError("")
    setAnalysis(null)
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: platform, url }),
      })
      const result = await response.json() as { success?: boolean; analysis?: Analysis; error?: string }
      if (!response.ok || !result.success || !result.analysis) {
        throw new Error(result.error || t("تعذر إكمال التحليل", "The analysis could not be completed"))
      }
      setAnalysis(result.analysis)
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : t("حدث خطأ غير متوقع", "An unexpected error occurred"))
    } finally {
      setLoading(false)
    }
  }

  function handleDownload() {
    if (!analysis) return
    void exportAnalysisPDF({
      title: t("تقرير التحليل", "Analysis Report"),
      date: new Date().toLocaleDateString(language),
      score: analysis.score,
      metrics: analysis.metrics,
      issues: analysis.issues,
      recommendations: analysis.recommendations,
    })
  }

  return (
    <div className="space-y-6 rounded-xl border bg-card p-6 shadow-sm">
      <div>
        <h2 className="text-xl font-bold">{t("أدوات التحليل والتقارير", "Analysis and reports")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("أدخل رابطاً عاماً لجلب بيانات حقيقية من المصدر المختار.", "Enter a public URL to fetch real data from the selected source.")}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-[180px_1fr_auto]">
        <label className="sr-only" htmlFor="analysis-platform">{t("المنصة", "Platform")}</label>
        <select id="analysis-platform" value={platform} onChange={(event) => setPlatform(event.target.value as Platform)} className="h-10 rounded-md border bg-background px-3 text-sm">
          {platforms.map((item) => <option key={item.value} value={item.value}>{t(item.ar, item.en)}</option>)}
        </select>
        <label className="sr-only" htmlFor="analysis-url">{t("الرابط", "URL")}</label>
        <input id="analysis-url" required type="url" value={url} onChange={(event) => setUrl(event.target.value)} placeholder={selected.placeholder} className="h-10 rounded-md border bg-background px-3 text-sm" />
        <button type="submit" disabled={loading} className="h-10 rounded-md bg-primary px-5 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
          {loading ? t("جاري التحليل...", "Analyzing...") : t("ابدأ التحليل", "Analyze")}
        </button>
      </form>

      {error && <p role="alert" className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}

      {analysis && (
        <section aria-live="polite" className="space-y-4 border-t pt-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-lg font-semibold">{t("النتائج", "Results")}</h3>
            <div className="flex items-center gap-3">
              <strong className="text-2xl">{analysis.score}/100</strong>
              <button type="button" onClick={handleDownload} className="rounded-md border px-3 py-2 text-sm hover:bg-muted">
                {t("تحميل PDF", "Download PDF")}
              </button>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {analysis.metrics.map((metric) => (
              <div key={`${metric.label}-${metric.value}`} className="rounded-md border p-3">
                <p className="text-sm text-muted-foreground">{metric.label}</p>
                <p className="font-semibold">{metric.value}</p>
              </div>
            ))}
          </div>
          {analysis.issues.length > 0 && (
            <ul className="space-y-2 text-sm">{analysis.issues.map((issue) => <li key={issue.message} className="rounded-md bg-muted p-2"><strong>{issue.type}: </strong>{issue.message}</li>)}</ul>
          )}
          {analysis.recommendations.length > 0 && (
            <div><h4 className="font-semibold">{t("التوصيات", "Recommendations")}</h4><ul className="list-disc space-y-1 ps-5 text-sm text-muted-foreground">{analysis.recommendations.map((item) => <li key={item}>{item}</li>)}</ul></div>
          )}
          <p className="text-sm text-muted-foreground">{analysis.aiInsights}</p>
        </section>
      )}
    </div>
  )
}
