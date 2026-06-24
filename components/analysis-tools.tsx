"use client"

import { useState } from "react"
import { useLanguage } from "@/lib/language-context"
import { Language, LANGUAGES, translations } from "@/lib/translations"
import { WebsiteAnalysisResult } from "@/lib/website-analyzer"
import { generateAnalysisPDF } from "@/lib/pdf-export-enhanced"
import SimpleResults from "./simple-results"

export default function AnalysisTools() {
  const { language, setLanguage, t } = useLanguage()
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [results, setResults] = useState<WebsiteAnalysisResult | null>(null)
  const [generatingPDF, setGeneratingPDF] = useState(false)

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!url.trim()) {
      setError(t("enterWebsiteUrl"))
      return
    }

    setLoading(true)
    setError("")
    setResults(null)

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: url.trim(),
          type: "website",
          language,
        }),
      })

      if (!response.ok) {
        throw new Error("Analysis failed")
      }

      const data = await response.json()
      console.log("[v0] API Response:", data)
      setResults(data.analysis)
      setUrl("")
    } catch (err) {
      setError(err instanceof Error ? err.message : t("analysisFailed"))
      console.error("Analysis error:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleGeneratePDF = async () => {
    if (!results) return

    setGeneratingPDF(true)
    try {
      await generateAnalysisPDF({
        language,
        analysisResult: results,
      })
    } catch (err) {
      console.error("PDF generation error:", err)
      setError("Failed to generate PDF")
    } finally {
      setGeneratingPDF(false)
    }
  }

  const handleClearResults = () => {
    setResults(null)
    setUrl("")
    setError("")
  }

  return (
    <div className="space-y-8">
      {/* Language Selector */}
      <div className="flex justify-center gap-2 flex-wrap">
        {Object.entries(LANGUAGES).map(([lang, config]) => (
          <button
            key={lang}
            onClick={() => setLanguage(lang as Language)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              language === lang
                ? "bg-primary text-primary-foreground"
                : "bg-card text-foreground border hover:bg-muted"
            }`}
          >
            {config.nativeName}
          </button>
        ))}
      </div>

      {/* Analysis Form */}
      <div className="bg-card rounded-xl border shadow-sm p-6">
        <h2 className="text-xl font-bold mb-6">{t("analyzeWebsite")}</h2>
        
        <form onSubmit={handleAnalyze} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              {t("enterWebsiteUrl")}
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              disabled={loading}
              className="w-full px-4 py-2 rounded-lg border bg-background text-foreground placeholder-muted-foreground disabled:opacity-50"
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {loading ? t("analyzing") : t("analyzeButton")}
          </button>
        </form>
      </div>

      {/* Analysis Results */}
      {results && (
        <div className="space-y-6">
          <SimpleResults result={results} />

          {/* PDF Export Button */}
          <div className="bg-card rounded-xl border shadow-sm p-6 flex flex-col gap-4">
            <div>
              <h3 className="font-bold mb-2">{t("generatePdf")}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {t("websiteUrl")}: {results.url}
              </p>
            </div>

            <div className="flex gap-3 flex-col sm:flex-row">
              <button
                onClick={handleGeneratePDF}
                disabled={generatingPDF}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {generatingPDF ? t("generatingPdf") : t("downloadPdf")}
              </button>
              
              <button
                onClick={handleClearResults}
                disabled={generatingPDF}
                className="flex-1 px-4 py-2 bg-muted text-foreground rounded-lg font-medium hover:bg-muted/80 disabled:opacity-50 transition-colors"
              >
                {t("analyzeButton")} {t("analyze")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
