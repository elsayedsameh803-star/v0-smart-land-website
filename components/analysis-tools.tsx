"use client"

import { useState, useCallback } from "react"
import { ArrowRight, Download, ShieldCheck, Sparkles, TrendingUp, Zap, RefreshCw, Share2, History, GitCompare } from "lucide-react"
import { exportAnalysisPDF } from "@/lib/pdf-export"
import AnalysisProgress from "@/components/analysis-progress"
import ScoreBreakdown from "@/components/score-breakdown"
import EvidenceCard from "@/components/evidence-card"
import FixAssistant from "@/components/fix-assistant"
import CompetitorComparison from "@/components/competitor-comparison"
import AnalysisHistory from "@/components/analysis-history"

interface EvidenceCardData {
  issue: string
  severity: "critical" | "warning" | "info"
  evidence: string
  location: string
  whyItMatters: string
  howToFix: string
  technicalExample?: string
  expectedBenefit: string
  category: string
}

interface CategoryScore {
  score: number
  max: number
  deductions: { reason: string; evidence: string; points: number }[]
}

interface AnalysisResult {
  score: number
  metrics: { label: string; value: string; status?: string }[]
  issues: { type: string; message: string }[]
  strengths?: string[]
  weaknesses?: string[]
  recommendations: string[]
  aiInsights: string
  categoryScores?: {
    seo: CategoryScore
    performance: CategoryScore
    accessibility: CategoryScore
    security: CategoryScore
    content: CategoryScore
    technical: CategoryScore
  }
  evidenceCards?: EvidenceCardData[]
}

interface HistoryEntry {
  id: string
  url: string
  type: string
  language: "ar" | "en"
  date: string
  result: AnalysisResult
}

function saveToHistory(url: string, type: string, language: "ar" | "en", result: AnalysisResult) {
  if (typeof window === "undefined") return
  const stored = localStorage.getItem("smartland_analysis_history")
  const history: HistoryEntry[] = stored ? JSON.parse(stored) : []
  history.unshift({
    id: Date.now().toString(),
    url,
    type,
    language,
    date: new Date().toISOString(),
    result,
  })
  // Keep last 50 entries
  if (history.length > 50) history.length = 50
  localStorage.setItem("smartland_analysis_history", JSON.stringify(history))
}

function getPreviousAnalysis(url: string): HistoryEntry | null {
  if (typeof window === "undefined") return null
  const stored = localStorage.getItem("smartland_analysis_history")
  if (!stored) return null
  const history: HistoryEntry[] = JSON.parse(stored)
  return history.find(h => h.url === url) || null
}

export default function AnalysisTools() {
  const [url, setUrl] = useState("https://")
  const [type, setType] = useState<"website" | "instagram" | "facebook" | "tiktok" | "youtube" | "snapchat">("website")
  const [language, setLanguage] = useState<"ar" | "en">("ar")
  const [loading, setLoading] = useState(false)
  const [progressActive, setProgressActive] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [previousResult, setPreviousResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState("")
  const [fixIssue, setFixIssue] = useState("")
  const [fixEvidence, setFixEvidence] = useState("")
  const [fixOpen, setFixOpen] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showComparison, setShowComparison] = useState(false)

  const handleProgressComplete = useCallback(() => {
    setProgressActive(false)
  }, [])

  const handleAnalyze = async () => {
    if (!url || url === "https://" || !/^https?:\/\/.+/.test(url)) {
      setError("يرجى إدخال رابط صحيح للتحليل.")
      return
    }

    setLoading(true)
    setProgressActive(true)
    setError("")
    
    // Check for previous analysis
    const prev = getPreviousAnalysis(url)
    setPreviousResult(prev?.result || null)
    if (prev) {
      setShowComparison(true)
    }

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
      saveToHistory(url, type, language, data.analysis)
    } catch (err) {
      console.error(err)
      setError("تعذر تحليل الرابط. تأكد من أن الرابط صحيح وحاول مرة أخرى.")
      setProgressActive(false)
    } finally {
      setLoading(false)
    }
  }

  const handleReAnalyze = () => {
    setResult(null)
    setPreviousResult(null)
    setShowComparison(false)
    handleAnalyze()
  }

  const handleFixHelp = (issue: string, evidence: string) => {
    setFixIssue(issue)
    setFixEvidence(evidence)
    setFixOpen(true)
  }

  const handleDownload = async () => {
    if (!result) {
      setError("قم أولا بإجراء التحليل ثم حمل التقرير.")
      return
    }

    setLoading(true)
    setError("")

    try {
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
    } catch (err) {
      console.error(err)
      setError("فشل تحميل التقرير. حاول مرة أخرى.")
    } finally {
      setLoading(false)
    }
  }

  const handleShare = async () => {
    if (!result) return
    const shareData = {
      title: language === "ar" ? "تقرير سمارت لاند" : "Smart Land Report",
      text: language === "ar"
        ? `نتيجة تحليلي في سمارت لاند: ${result.score}%\nرابط: ${url}`
        : `My Smart Land analysis result: ${result.score}%\nURL: ${url}`,
    }
    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(`${shareData.text}`)
      setError(language === "ar" ? "تم نسخ الرابط" : "Link copied!")
      setTimeout(() => setError(""), 2000)
    }
  }

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-7">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center rounded-full border border-amber-400/25 bg-amber-400/10 px-3 py-1 text-sm font-semibold text-amber-300">
              <Sparkles className="ml-2 h-4 w-4" />
              AI Digital Audit
            </div>
            <h2 className="text-2xl font-bold text-white">
              {language === "ar" ? "أداة التدقيق الرقمي" : "Digital Audit Tool"}
            </h2>
            <p className="mt-2 text-sm leading-7 text-slate-400">
              {language === "ar"
                ? "أدخل رابط موقعك أو حسابك على وسائل التواصل للتحليل والحصول على تقرير تدقيق شامل قائم على الأدلة."
                : "Enter your website or social account URL to get a comprehensive evidence-based audit report."}
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              {language === "ar" ? "تحليل قائم على أدلة حقيقية" : "Evidence-based real analysis"}
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-300">{language === "ar" ? "الرابط" : "URL"}</span>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-400/50"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-300">{language === "ar" ? "نوع التحليل" : "Analysis Type"}</span>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as typeof type)}
              className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-400/50"
            >
              <option value="website">{language === "ar" ? "الموقع" : "Website"}</option>
              <option value="instagram">Instagram</option>
              <option value="facebook">Facebook</option>
              <option value="tiktok">TikTok</option>
              <option value="youtube">YouTube</option>
              <option value="snapchat">Snapchat</option>
            </select>
          </label>

          <label className="space-y-2 sm:col-span-2">
            <span className="text-sm font-medium text-slate-300">{language === "ar" ? "لغة التقرير" : "Report Language"}</span>
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

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:opacity-90 disabled:opacity-50"
          >
            {loading ? (language === "ar" ? "جاري التحليل..." : "Analyzing...") : (language === "ar" ? "ابدأ التدقيق" : "Start Audit")}
            <ArrowRight className="h-4 w-4" />
          </button>
          {result && (
            <>
              <button
                type="button"
                onClick={handleReAnalyze}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-800 disabled:opacity-50"
              >
                <RefreshCw className="h-4 w-4" />
                {language === "ar" ? "إعادة التحليل" : "Re-analyze"}
              </button>
              <button
                type="button"
                onClick={handleDownload}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-800 disabled:opacity-50"
              >
                <Download className="h-4 w-4" />
                {language === "ar" ? "تحميل PDF" : "Download PDF"}
              </button>
              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
              >
                <Share2 className="h-4 w-4" />
                {language === "ar" ? "مشاركة" : "Share"}
              </button>
              <button
                type="button"
                onClick={() => setShowHistory(!showHistory)}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
              >
                <History className="h-4 w-4" />
                {language === "ar" ? "السجل" : "History"}
              </button>
              <button
                type="button"
                onClick={() => setShowComparison(true)}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
              >
                <GitCompare className="h-4 w-4" />
                {language === "ar" ? "مقارنة" : "Compare"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Progress */}
      <AnalysisProgress
        language={language}
        isActive={progressActive}
        onComplete={handleProgressComplete}
      />

      {/* Analysis History */}
      {showHistory && (
        <AnalysisHistory
          language={language}
          onSelect={(entry) => {
            setResult(entry.result)
            setUrl(entry.url)
            setType(entry.type as typeof type)
            setShowHistory(false)
          }}
        />
      )}

      {/* Competitor Comparison */}
      {showComparison && result && (
        <CompetitorComparison
          language={language}
          currentUrl={url}
          currentResult={result}
          previousResult={previousResult}
          onClose={() => setShowComparison(false)}
        />
      )}

      {/* Results */}
      {result && !showComparison && (
        <div className="space-y-4">
          {/* Score Overview */}
          <div className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-6">
            <div className="flex flex-col gap-4 rounded-[1.5rem] border border-white/10 bg-gradient-to-r from-amber-400/10 via-slate-900 to-sky-400/10 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-slate-400">
                  {language === "ar" ? "النتيجة النهائية" : "Overall Score"}
                </p>
                <p className="text-4xl font-bold text-white">{result.score}%</p>
              </div>
              <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                {language === "ar" ? "تحليل قائم على أدلة حقيقية" : "Real evidence-based analysis"}
              </div>
            </div>

            {/* Score breakdown */}
            <div className="mt-5">
              <ScoreBreakdown categoryScores={result.categoryScores} language={language} />
            </div>
          </div>

          {/* Before/After Comparison */}
          {previousResult && (
            <div className="rounded-[1.5rem] border border-amber-400/20 bg-amber-500/5 p-4">
              <h3 className="mb-3 text-sm font-semibold text-amber-300">
                {language === "ar" ? "مقارنة التحليل السابق" : "Previous Analysis Comparison"}
              </h3>
              <div className="flex items-center gap-4 text-sm">
                <div className="rounded-xl bg-slate-900/80 px-4 py-2">
                  <span className="text-slate-400">{language === "ar" ? "السابق:" : "Previous:"}</span>
                  <span className="ml-2 font-bold text-slate-300">{previousResult.score}%</span>
                </div>
                <ArrowRight className="h-4 w-4 text-amber-400" />
                <div className="rounded-xl bg-slate-900/80 px-4 py-2">
                  <span className="text-slate-400">{language === "ar" ? "الحالي:" : "Current:"}</span>
                  <span className="ml-2 font-bold text-white">{result.score}%</span>
                </div>
                <div className={`rounded-xl px-4 py-2 font-bold ${result.score > previousResult.score ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300"}`}>
                  {result.score > previousResult.score ? "+" : ""}{result.score - previousResult.score}pts
                </div>
              </div>
            </div>
          )}

          {/* Metrics & Recommendations */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[1.5rem] border border-white/10 bg-slate-900/70 p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
                <TrendingUp className="h-4 w-4 text-amber-400" />
                {language === "ar" ? "القياسات" : "Metrics"}
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
                {language === "ar" ? "التوصيات" : "Recommendations"}
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

          {/* Strengths & Weaknesses */}
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-[1.5rem] border border-white/10 bg-slate-900/70 p-4">
              <h3 className="mb-3 text-sm font-semibold text-emerald-300">
                {language === "ar" ? "نقاط القوة" : "Strengths"}
              </h3>
              <ul className="space-y-3">
                {(result.strengths || []).map((strength, index) => (
                  <li key={index} className="rounded-2xl bg-slate-950/80 px-4 py-3 text-sm text-slate-300">
                    {strength}
                  </li>
                ))}
                {!result.strengths?.length && (
                  <li className="rounded-2xl bg-slate-950/80 px-4 py-3 text-sm text-slate-300">
                    {language === "ar" ? "لا توجد نقاط قوة محددة." : "No specific strengths found."}
                  </li>
                )}
              </ul>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-slate-900/70 p-4">
              <h3 className="mb-3 text-sm font-semibold text-rose-300">
                {language === "ar" ? "نقاط الضعف" : "Weaknesses"}
              </h3>
              <ul className="space-y-3">
                {(result.weaknesses || []).map((weakness, index) => (
                  <li key={index} className="rounded-2xl bg-slate-950/80 px-4 py-3 text-sm text-slate-300">
                    {weakness}
                  </li>
                ))}
                {!result.weaknesses?.length && (
                  <li className="rounded-2xl bg-slate-950/80 px-4 py-3 text-sm text-slate-300">
                    {language === "ar" ? "لا توجد نقاط ضعف محددة." : "No specific weaknesses found."}
                  </li>
                )}
              </ul>
            </div>
          </div>

          {/* Evidence Cards */}
          {result.evidenceCards && result.evidenceCards.length > 0 && (
            <div className="rounded-[1.5rem] border border-white/10 bg-slate-900/70 p-4">
              <h3 className="mb-3 text-sm font-semibold text-white">
                {language === "ar" ? "بطاقات التشخيص والأدلة" : "Diagnostic Evidence Cards"}
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                {result.evidenceCards.map((card, index) => (
                  <EvidenceCard
                    key={index}
                    card={card}
                    language={language}
                    onFixHelp={handleFixHelp}
                  />
                ))}
              </div>
            </div>
          )}

          {/* AI Insights */}
          <div className="rounded-[1.5rem] border border-white/10 bg-slate-900/70 p-4">
            <h3 className="mb-3 text-sm font-semibold text-white">
              {language === "ar" ? "تحليل الذكاء الاصطناعي" : "AI Analysis"}
            </h3>
            <p className="text-sm leading-7 text-slate-400">{result.aiInsights}</p>
          </div>
        </div>
      )}

      {/* Fix Assistant Dialog */}
      <FixAssistant
        open={fixOpen}
        onOpenChange={setFixOpen}
        issue={fixIssue}
        evidence={fixEvidence}
        language={language}
      />
    </div>
  )
}