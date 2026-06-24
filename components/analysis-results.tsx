"use client"

import { WebsiteAnalysisResult } from "@/lib/website-analyzer"
import { Language, translations } from "@/lib/translations"

interface AnalysisResultsProps {
  analysisResult: WebsiteAnalysisResult
  language: Language
}

export default function AnalysisResults({ analysisResult, language }: AnalysisResultsProps) {
  const t = (key: keyof typeof translations) => translations[key][language] || translations[key].en

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "bg-green-50"
    if (score >= 60) return "bg-yellow-50"
    return "bg-red-50"
  }

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <div className={`rounded-xl border shadow-sm p-8 ${getScoreBgColor(analysisResult.overallScore)}`}>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">{t("analysisResults")}</p>
            <p className="text-muted-foreground text-sm">{analysisResult.url}</p>
          </div>
          <div className="text-center">
            <div className={`text-5xl font-bold ${getScoreColor(analysisResult.overallScore)}`}>
              {analysisResult.overallScore}
            </div>
            <p className="text-sm text-muted-foreground mt-1">{t("outOf100")}</p>
          </div>
        </div>
      </div>

      {/* Performance Section */}
      <div className="bg-card rounded-xl border shadow-sm p-6">
        <h3 className="text-lg font-bold mb-4 text-primary">{t("performance")}</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <MetricCard
            label={t("pageLoadTime")}
            value={`${analysisResult.performance.pageLoadTime}ms`}
            score={analysisResult.performance.score}
          />
          <MetricCard
            label={t("pageSize")}
            value={`${analysisResult.performance.pageSize}KB`}
            score={analysisResult.performance.score}
          />
          <MetricCard
            label={t("requests")}
            value={analysisResult.performance.requests.toString()}
            score={analysisResult.performance.score}
          />
          <MetricCard
            label={t("largestContentfulPaint")}
            value={`${analysisResult.performance.largestContentfulPaint}ms`}
            score={analysisResult.performance.score}
          />
          <MetricCard
            label={t("firstInputDelay")}
            value={`${analysisResult.performance.firstInputDelay}ms`}
            score={analysisResult.performance.score}
          />
          <MetricCard
            label={t("cumulativeLayoutShift")}
            value={analysisResult.performance.cumulativeLayoutShift.toString()}
            score={analysisResult.performance.score}
          />
        </div>
        <ScoreBar score={analysisResult.performance.score} />
      </div>

      {/* Security Section */}
      <div className="bg-card rounded-xl border shadow-sm p-6">
        <h3 className="text-lg font-bold mb-4 text-primary">{t("security")}</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-muted rounded">
            <span>{t("sslCertificate")}</span>
            <span className={analysisResult.security.hasSSL ? "text-green-600" : "text-red-600"}>
              {analysisResult.security.hasSSL ? "✓" : "✗"}
            </span>
          </div>
          <div className="flex justify-between items-center p-3 bg-muted rounded">
            <span>{t("httpHeaders")}</span>
            <span className="font-medium">{analysisResult.security.securityHeaders.length} headers</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-muted rounded">
            <span>{t("mobileOptimization")}</span>
            <span className={analysisResult.security.mobileOptimized ? "text-green-600" : "text-red-600"}>
              {analysisResult.security.mobileOptimized ? "✓" : "✗"}
            </span>
          </div>
          <div className="flex justify-between items-center p-3 bg-muted rounded">
            <span>{t("colorContrast")}</span>
            <span className="font-medium">{analysisResult.security.colorContrast}%</span>
          </div>
        </div>
        <ScoreBar score={analysisResult.security.score} />
      </div>

      {/* SEO Section */}
      <div className="bg-card rounded-xl border shadow-sm p-6">
        <h3 className="text-lg font-bold mb-4 text-primary">{t("seo")}</h3>
        <div className="space-y-3 mb-4">
          <div className="flex justify-between items-center p-3 bg-muted rounded">
            <span>{t("titleTag")}</span>
            <span className={analysisResult.seo.titleTag.present ? "text-green-600" : "text-red-600"}>
              {analysisResult.seo.titleTag.present ? `✓ (${analysisResult.seo.titleTag.length}ch)` : "✗"}
            </span>
          </div>
          <div className="flex justify-between items-center p-3 bg-muted rounded">
            <span>{t("metaDescription")}</span>
            <span className={analysisResult.seo.metaDescription.present ? "text-green-600" : "text-red-600"}>
              {analysisResult.seo.metaDescription.present
                ? `✓ (${analysisResult.seo.metaDescription.length}ch)`
                : "✗"}
            </span>
          </div>
          <div className="flex justify-between items-center p-3 bg-muted rounded">
            <span>H1 Tags</span>
            <span className="font-medium">{analysisResult.seo.headingStructure.h1Count}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-muted rounded">
            <span>{t("imageAltText")}</span>
            <span className="font-medium">{analysisResult.seo.imageAltText.percentage}%</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-muted rounded">
            <span>{t("mobileFriendly")}</span>
            <span className={analysisResult.seo.mobileFriendly ? "text-green-600" : "text-red-600"}>
              {analysisResult.seo.mobileFriendly ? "✓" : "✗"}
            </span>
          </div>
        </div>
        <ScoreBar score={analysisResult.seo.score} />
      </div>

      {/* UX Section */}
      <div className="bg-card rounded-xl border shadow-sm p-6">
        <h3 className="text-lg font-bold mb-4 text-primary">{t("ux")}</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-muted rounded">
            <span>{t("accessibility")}</span>
            <span className="font-medium text-right truncate">
              {analysisResult.ux.pageTitle.substring(0, 30)}
            </span>
          </div>
          <div className="flex justify-between items-center p-3 bg-muted rounded">
            <span>Response Time</span>
            <span className="font-medium">{Math.round(analysisResult.ux.responseTime)}ms</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-muted rounded">
            <span>Responsive Design</span>
            <span className={analysisResult.ux.isResponsive ? "text-green-600" : "text-red-600"}>
              {analysisResult.ux.isResponsive ? "✓" : "✗"}
            </span>
          </div>
          <div className="flex justify-between items-center p-3 bg-muted rounded">
            <span>Compression</span>
            <span className={analysisResult.ux.hasCompression ? "text-green-600" : "text-red-600"}>
              {analysisResult.ux.hasCompression ? "✓" : "✗"}
            </span>
          </div>
          <div className="flex justify-between items-center p-3 bg-muted rounded">
            <span>Cache Control</span>
            <span className={analysisResult.ux.cacheEnabled ? "text-green-600" : "text-red-600"}>
              {analysisResult.ux.cacheEnabled ? "✓" : "✗"}
            </span>
          </div>
        </div>
        <ScoreBar score={analysisResult.ux.score} />
      </div>
    </div>
  )
}

interface MetricCardProps {
  label: string
  value: string
  score: number
}

function MetricCard({ label, value, score }: MetricCardProps) {
  return (
    <div className="p-4 bg-muted rounded-lg border">
      <p className="text-sm text-muted-foreground mb-2">{label}</p>
      <p className="text-lg font-bold">{value}</p>
    </div>
  )
}

interface ScoreBarProps {
  score: number
}

function ScoreBar({ score }: ScoreBarProps) {
  const getColor = () => {
    if (score >= 80) return "bg-green-600"
    if (score >= 60) return "bg-yellow-600"
    return "bg-red-600"
  }

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium">Score</span>
        <span className="text-sm font-bold">{score}/100</span>
      </div>
      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
        <div className={`h-full ${getColor()} transition-all`} style={{ width: `${score}%` }}></div>
      </div>
    </div>
  )
}
