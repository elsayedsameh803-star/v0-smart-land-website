"use client"

import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"
import { WebsiteAnalysisResult } from "./website-analyzer"
import { Language, translations, LANGUAGES } from "./translations"

interface PDFExportOptions {
  language: Language
  analysisResult: WebsiteAnalysisResult
  includeCharts?: boolean
}

export async function generateAnalysisPDF(options: PDFExportOptions): Promise<void> {
  const { language, analysisResult } = options
  const isRTL = LANGUAGES[language].rtl

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    compress: true,
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 15
  const contentWidth = pageWidth - margin * 2
  let yPosition = margin

  // Set text direction for RTL
  if (isRTL) {
    doc.setR2L(true)
  }

  // Helper function for translations
  const t = (key: keyof typeof translations): string => {
    return translations[key][language] || translations[key].en
  }

  // ===== COVER PAGE =====
  doc.setFontSize(28)
  doc.setFont("helvetica", "bold")
  const titleText = t("analysisResults")
  doc.text(titleText, isRTL ? pageWidth - margin : margin, yPosition + 30, {
    align: isRTL ? "right" : "left",
    maxWidth: contentWidth,
  })

  yPosition += 50

  // Website URL
  doc.setFontSize(12)
  doc.setFont("helvetica", "normal")
  const urlLabel = t("websiteUrl") + ":"
  doc.text(urlLabel, isRTL ? pageWidth - margin : margin, yPosition, {
    align: isRTL ? "right" : "left",
  })
  yPosition += 8
  doc.setFont("helvetica", "normal")
  doc.setTextColor(66, 133, 244)
  doc.text(analysisResult.url, isRTL ? pageWidth - margin : margin, yPosition, {
    align: isRTL ? "right" : "left",
    maxWidth: contentWidth,
  })
  doc.setTextColor(0, 0, 0)
  yPosition += 12

  // Report Date
  const dateLabel = t("reportDate") + ":"
  doc.text(dateLabel, isRTL ? pageWidth - margin : margin, yPosition, {
    align: isRTL ? "right" : "left",
  })
  doc.text(new Date(analysisResult.timestamp).toLocaleDateString(language), 
    isRTL ? pageWidth - margin - 60 : margin + 60, 
    yPosition, 
    { align: isRTL ? "right" : "left" }
  )
  yPosition += 20

  // Overall Score - Large Display
  drawScoreBox(doc, analysisResult.overallScore, margin, yPosition, contentWidth, isRTL, language)
  yPosition += 40

  // Add new page for detailed results
  doc.addPage()
  yPosition = margin

  // ===== PERFORMANCE SECTION =====
  drawSectionTitle(doc, t("performance"), margin, yPosition, isRTL, language)
  yPosition += 12

  const performanceData = [
    {
      label: t("pageLoadTime"),
      value: `${analysisResult.performance.pageLoadTime}ms`,
    },
    {
      label: t("pageSize"),
      value: `${analysisResult.performance.pageSize}KB`,
    },
    {
      label: t("requests"),
      value: analysisResult.performance.requests.toString(),
    },
    {
      label: t("largestContentfulPaint"),
      value: `${analysisResult.performance.largestContentfulPaint}ms`,
    },
    {
      label: t("cumulativeLayoutShift"),
      value: analysisResult.performance.cumulativeLayoutShift.toString(),
    },
  ]

  yPosition = drawMetricsTable(doc, performanceData, margin, yPosition, contentWidth, isRTL, language)

  // Performance Score
  doc.setFont("helvetica", "bold")
  doc.setFontSize(11)
  const scoreText = `${t("score")}: ${analysisResult.performance.score}/100`
  doc.text(scoreText, isRTL ? pageWidth - margin : margin, yPosition + 8, {
    align: isRTL ? "right" : "left",
  })
  yPosition += 15

  // Check if we need a new page
  if (yPosition > pageHeight - 40) {
    doc.addPage()
    yPosition = margin
  }

  // ===== SECURITY SECTION =====
  drawSectionTitle(doc, t("security"), margin, yPosition, isRTL, language)
  yPosition += 12

  const securityData = [
    {
      label: t("sslCertificate"),
      value: analysisResult.security.hasSSL ? "✓" : "✗",
    },
    {
      label: t("httpHeaders"),
      value: `${analysisResult.security.securityHeaders.length} headers`,
    },
    {
      label: t("mobileOptimization"),
      value: analysisResult.security.mobileOptimized ? "✓" : "✗",
    },
    {
      label: t("colorContrast"),
      value: `${analysisResult.security.colorContrast}%`,
    },
  ]

  yPosition = drawMetricsTable(doc, securityData, margin, yPosition, contentWidth, isRTL, language)

  doc.setFont("helvetica", "bold")
  doc.setFontSize(11)
  const securityScoreText = `${t("score")}: ${analysisResult.security.score}/100`
  doc.text(securityScoreText, isRTL ? pageWidth - margin : margin, yPosition + 8, {
    align: isRTL ? "right" : "left",
  })
  yPosition += 15

  if (yPosition > pageHeight - 40) {
    doc.addPage()
    yPosition = margin
  }

  // ===== SEO SECTION =====
  drawSectionTitle(doc, t("seo"), margin, yPosition, isRTL, language)
  yPosition += 12

  const seoData = [
    {
      label: t("titleTag"),
      value: analysisResult.seo.titleTag.present ? `✓ (${analysisResult.seo.titleTag.length}ch)` : "✗",
    },
    {
      label: t("metaDescription"),
      value: analysisResult.seo.metaDescription.present
        ? `✓ (${analysisResult.seo.metaDescription.length}ch)`
        : "✗",
    },
    {
      label: "H1 Tags",
      value: analysisResult.seo.headingStructure.h1Count.toString(),
    },
    {
      label: t("imageAltText"),
      value: `${analysisResult.seo.imageAltText.percentage}%`,
    },
    {
      label: t("mobileFriendly"),
      value: analysisResult.seo.mobileFriendly ? "✓" : "✗",
    },
  ]

  yPosition = drawMetricsTable(doc, seoData, margin, yPosition, contentWidth, isRTL, language)

  doc.setFont("helvetica", "bold")
  doc.setFontSize(11)
  const seoScoreText = `${t("score")}: ${analysisResult.seo.score}/100`
  doc.text(seoScoreText, isRTL ? pageWidth - margin : margin, yPosition + 8, {
    align: isRTL ? "right" : "left",
  })

  if (yPosition > pageHeight - 40) {
    doc.addPage()
    yPosition = margin
  } else {
    yPosition += 15
  }

  // ===== UX SECTION =====
  drawSectionTitle(doc, t("ux"), margin, yPosition, isRTL, language)
  yPosition += 12

  const uxData = [
    {
      label: "Page Title",
      value: analysisResult.ux.pageTitle.substring(0, 40),
    },
    {
      label: "Response Time",
      value: `${Math.round(analysisResult.ux.responseTime)}ms`,
    },
    {
      label: "Responsive Design",
      value: analysisResult.ux.isResponsive ? "✓" : "✗",
    },
    {
      label: "Compression",
      value: analysisResult.ux.hasCompression ? "✓" : "✗",
    },
    {
      label: "Cache Control",
      value: analysisResult.ux.cacheEnabled ? "✓" : "✗",
    },
  ]

  yPosition = drawMetricsTable(doc, uxData, margin, yPosition, contentWidth, isRTL, language)

  doc.setFont("helvetica", "bold")
  doc.setFontSize(11)
  const uxScoreText = `${t("score")}: ${analysisResult.ux.score}/100`
  doc.text(uxScoreText, isRTL ? pageWidth - margin : margin, yPosition + 8, {
    align: isRTL ? "right" : "left",
  })

  // Save PDF
  const fileName = `website-analysis-${analysisResult.overallScore}-${new Date().getTime()}.pdf`
  doc.save(fileName)
}

function drawSectionTitle(
  doc: jsPDF,
  title: string,
  x: number,
  y: number,
  isRTL: boolean,
  language: Language
): void {
  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.setFillColor(66, 133, 244)
  doc.rect(x, y - 4, doc.internal.pageSize.getWidth() - x * 2, 8, "F")
  doc.setTextColor(255, 255, 255)
  doc.text(title, isRTL ? doc.internal.pageSize.getWidth() - x : x + 2, y + 2, {
    align: isRTL ? "right" : "left",
  })
  doc.setTextColor(0, 0, 0)
}

function drawScoreBox(
  doc: jsPDF,
  score: number,
  x: number,
  y: number,
  width: number,
  isRTL: boolean,
  language: Language
): void {
  // Background circle/box
  const scoreBoxSize = 50
  const scoreX = isRTL ? doc.internal.pageSize.getWidth() - x - scoreBoxSize : x + width - scoreBoxSize

  doc.setFillColor(66, 133, 244)
  doc.circle(scoreX + scoreBoxSize / 2, y + scoreBoxSize / 2, scoreBoxSize / 2, "F")

  // Score text
  doc.setTextColor(255, 255, 255)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(24)
  doc.text(score.toString(), scoreX + scoreBoxSize / 2, y + scoreBoxSize / 2 + 5, {
    align: "center",
    valign: "middle",
  })

  doc.setTextColor(0, 0, 0)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)
  doc.text("/100", scoreX + scoreBoxSize / 2, y + scoreBoxSize / 2 + 12, {
    align: "center",
  })
}

interface MetricItem {
  label: string
  value: string
}

function drawMetricsTable(
  doc: jsPDF,
  metrics: MetricItem[],
  x: number,
  y: number,
  width: number,
  isRTL: boolean,
  language: Language
): number {
  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)

  const rowHeight = 8
  let currentY = y

  for (const metric of metrics) {
    // Label
    doc.setFont("helvetica", "bold")
    doc.text(metric.label, isRTL ? doc.internal.pageSize.getWidth() - x : x + 2, currentY, {
      align: isRTL ? "right" : "left",
    })

    // Value
    doc.setFont("helvetica", "normal")
    doc.setTextColor(100, 100, 100)
    doc.text(metric.value, isRTL ? x + 5 : doc.internal.pageSize.getWidth() - x - 5, currentY, {
      align: isRTL ? "left" : "right",
    })
    doc.setTextColor(0, 0, 0)

    currentY += rowHeight
  }

  return currentY
}
