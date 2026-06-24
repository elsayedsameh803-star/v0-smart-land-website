"use client"

import { useState } from "react"
import { useLanguage } from "@/lib/language-context"
import { Language, LANGUAGES, translations } from "@/lib/translations"
import { WebsiteAnalysisResult } from "@/lib/website-analyzer"
import { generateArabicPDF } from "@/lib/pdf-export-arabic"
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
      // Create a temporary container with results data
      const container = document.createElement("div")
      container.id = "pdf-export-container"
      container.style.position = "absolute"
      container.style.left = "-9999px"
      container.style.width = "1200px"
      container.style.padding = "40px"
      container.style.backgroundColor = "white"
      container.style.color = "black"
      container.style.direction = language === "ar" ? "rtl" : "ltr"
      container.innerHTML = `
        <h1 style="font-size: 32px; margin-bottom: 20px; text-align: center;">
          ${language === "ar" ? "تقرير التحليل الشامل" : "Comprehensive Analysis Report"}
        </h1>
        <div style="margin: 30px 0; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <p><strong>${language === "ar" ? "النقاط الإجمالية" : "Overall Score"}:</strong> ${results.score || 0}/100</p>
          <p><strong>${language === "ar" ? "الموقع" : "Website"}:</strong> ${url || results.url || "N/A"}</p>
          <p><strong>${language === "ar" ? "تاريخ التحليل" : "Analysis Date"}:</strong> ${new Date().toLocaleDateString()}</p>
        </div>
        <h2 style="font-size: 24px; margin: 20px 0 10px 0;">${language === "ar" ? "المقاييس" : "Metrics"}</h2>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          ${(results.metrics || []).map((m: any) => `
            <tr style="border: 1px solid #ddd;">
              <td style="padding: 10px; border: 1px solid #ddd;">${m.label}</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${m.value}</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${m.status}</td>
            </tr>
          `).join("")}
        </table>
        <h2 style="font-size: 24px; margin: 20px 0 10px 0;">${language === "ar" ? "المشاكل والنجاحات" : "Issues"}</h2>
        <ul>
          ${(results.issues || []).map((i: any) => `<li>${i.message}</li>`).join("")}
        </ul>
        <h2 style="font-size: 24px; margin: 20px 0 10px 0;">${language === "ar" ? "التوصيات" : "Recommendations"}</h2>
        <ul>
          ${(results.recommendations || []).map((r: any) => `<li>${r}</li>`).join("")}
        </ul>
      `
      document.body.appendChild(container)

      // Generate PDF
      await generateArabicPDF("pdf-export-container", `analysis-report-${new Date().getTime()}.pdf`, language, {
        title: language === "ar" ? "تقرير التحليل" : "Analysis Report",
        description: language === "ar" ? "تقرير تحليل شامل للموقع الإلكتروني" : "Comprehensive website analysis report",
        url: url || results.url,
        score: results.score || 0,
      })

      // Cleanup
      document.body.removeChild(container)
    } catch (err) {
      console.error("[v0] PDF generation error:", err)
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
