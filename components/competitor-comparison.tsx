"use client"

import { useState } from "react"
import { X, AlertTriangle, ArrowRight, BarChart3 } from "lucide-react"

interface AnalysisResult {
  score: number
  metrics: { label: string; value: string; status?: string }[]
  issues: { type: string; message: string }[]
  strengths?: string[]
  weaknesses?: string[]
  recommendations: string[]
  aiInsights: string
}

interface CompetitorComparisonProps {
  language: "ar" | "en"
  currentUrl: string
  currentResult: AnalysisResult
  previousResult: AnalysisResult | null
  onClose: () => void
}

export default function CompetitorComparison({ language, currentUrl, currentResult, previousResult, onClose }: CompetitorComparisonProps) {
  const [competitorUrl, setCompetitorUrl] = useState("https://")
  const [competitorResult, setCompetitorResult] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleCompare = async () => {
    if (!competitorUrl || competitorUrl === "https://" || !/^https?:\/\/.+/.test(competitorUrl)) {
      setError(language === "ar" ? "يرجى إدخال رابط صحيح." : "Please enter a valid URL.")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: competitorUrl, type: "website", language }),
      })

      const data = await response.json()
      if (!data.success) {
        throw new Error(data.error || "فشل التحليل")
      }

      setCompetitorResult(data.analysis)
    } catch (err) {
      console.error(err)
      setError(language === "ar" ? "تعذر تحليل الرابط المنافس." : "Could not analyze competitor URL.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-[2rem] border border-amber-400/20 bg-slate-950/70 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-6">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-amber-300">
          <BarChart3 className="h-4 w-4" />
          {language === "ar" ? "مقارنة المنافسين" : "Competitor Comparison"}
        </h3>
        <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Limitations notice */}
      <div className="mb-4 flex items-start gap-2 rounded-xl border border-amber-400/20 bg-amber-500/10 p-3 text-xs text-amber-300">
        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
        <p>
          {language === "ar"
            ? "هذه المقارنة تعتمد على الإشارات العامة القابلة للقياس فقط. قد تختلف النتائج بناءً على عوامل غير قابلة للقياس مثل جودة المحتوى الداخلي أو استراتيجيات التسويق."
            : "This comparison is based on publicly measurable signals only. Results may vary based on unmeasurable factors like internal content quality or marketing strategies."}
        </p>
      </div>

      {/* Competitor input */}
      <div className="mb-4 flex gap-3">
        <input
          type="url"
          value={competitorUrl}
          onChange={(e) => setCompetitorUrl(e.target.value)}
          placeholder="https://competitor.com"
          className="flex-1 rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-400/50"
        />
        <button
          onClick={handleCompare}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "..." : language === "ar" ? "مقارنة" : "Compare"}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-rose-400/20 bg-rose-500/10 px-4 py-2 text-xs text-rose-300">
          {error}
        </div>
      )}

      {/* Comparison results */}
      {competitorResult && (
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Current */}
          <div className="rounded-xl border border-white/10 bg-slate-900/70 p-4">
            <p className="mb-2 text-xs font-semibold text-slate-400 truncate" title={currentUrl}>
              {language === "ar" ? "الخاص بك" : "Yours"}: {currentUrl.replace("https://", "").slice(0, 30)}
            </p>
            <p className="text-2xl font-bold text-white">{currentResult.score}%</p>
            <div className="mt-2 space-y-1">
              {currentResult.metrics.slice(0, 4).map((m) => (
                <div key={m.label} className="flex justify-between text-xs text-slate-400">
                  <span>{m.label}</span>
                  <span className="font-medium text-slate-300">{m.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Competitor */}
          <div className="rounded-xl border border-amber-400/20 bg-slate-900/70 p-4">
            <p className="mb-2 text-xs font-semibold text-slate-400 truncate" title={competitorUrl}>
              {language === "ar" ? "المنافس" : "Competitor"}: {competitorUrl.replace("https://", "").slice(0, 30)}
            </p>
            <p className="text-2xl font-bold text-amber-300">{competitorResult.score}%</p>
            <div className="mt-2 space-y-1">
              {competitorResult.metrics.slice(0, 4).map((m) => (
                <div key={m.label} className="flex justify-between text-xs text-slate-400">
                  <span>{m.label}</span>
                  <span className="font-medium text-slate-300">{m.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Score difference */}
          <div className="col-span-full rounded-xl bg-slate-900/50 p-3 text-center text-xs text-slate-400">
            {language === "ar" ? "فرق النقاط:" : "Score difference:"}{" "}
            <span className={`font-bold ${currentResult.score > competitorResult.score ? "text-emerald-400" : "text-rose-400"}`}>
              {currentResult.score > competitorResult.score ? "+" : ""}{currentResult.score - competitorResult.score}pts
            </span>
          </div>
        </div>
      )}

      {/* Previous analysis comparison */}
      {previousResult && !competitorResult && (
        <div className="rounded-xl border border-amber-400/20 bg-amber-500/5 p-4">
          <h4 className="mb-2 text-xs font-semibold text-amber-300">
            {language === "ar" ? "مقارنة مع التحليل السابق" : "Previous Analysis Comparison"}
          </h4>
          <div className="flex items-center gap-3 text-sm">
            <div className="rounded-lg bg-slate-900/80 px-3 py-1.5">
              <span className="text-slate-400">{language === "ar" ? "السابق:" : "Previous:"}</span>
              <span className="ml-1 font-bold text-slate-300">{previousResult.score}%</span>
            </div>
            <ArrowRight className="h-4 w-4 text-amber-400" />
            <div className="rounded-lg bg-slate-900/80 px-3 py-1.5">
              <span className="text-slate-400">{language === "ar" ? "الحالي:" : "Current:"}</span>
              <span className="ml-1 font-bold text-white">{currentResult.score}%</span>
            </div>
            <div className={`rounded-lg px-3 py-1.5 font-bold text-xs ${currentResult.score > previousResult.score ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300"}`}>
              {currentResult.score > previousResult.score ? "+" : ""}{currentResult.score - previousResult.score}pts
            </div>
          </div>
        </div>
      )}
    </div>
  )
}