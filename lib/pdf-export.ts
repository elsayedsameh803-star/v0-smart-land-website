"use client"

import { jsPDF } from "jspdf"

interface PDFData {
  title: string
  date: string
  score: number
  metrics: { label: string; value: string }[]
  issues: { type: string; message: string }[]
  recommendations: string[]
  language: "ar" | "en"
}

export function generatePDF(data: PDFData) {
    try {
        const doc = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4",
        });

        doc.setFontSize(18);
        doc.text("Report: " + data.title, 10, 10);
        doc.text("Date: " + data.date, 10, 20);

        const isArabic = data.language === "ar";
        
        doc.save("report.pdf");
    } catch (error) {
        console.error("PDF Export Error:", error);
    }
}



  // Colors
  const primaryColor = [200, 160, 50] as [number, number, number]
  const textColor = [30, 30, 40] as [number, number, number]
  const mutedColor = [120, 120, 130] as [number, number, number]
  const successColor = [34, 197, 94] as [number, number, number]
  const warningColor = [234, 179, 8] as [number, number, number]
  const errorColor = [239, 68, 68] as [number, number, number]

  // Header
  doc.setFillColor(...primaryColor)
  doc.rect(0, 0, 210, 40, "F")

  doc.setTextColor(30, 30, 40)
  doc.setFontSize(24)
  doc.text("Smart Land", 105, 20, { align: "center" })

  doc.setFontSize(12)
  doc.text(
    isArabic ? "Professional Data Analytics" : "Professional Data Analytics",
    105,
    30,
    { align: "center" }
  )

  // Report Title
  doc.setTextColor(...textColor)
  doc.setFontSize(18)
  doc.text(data.title, 105, 55, { align: "center" })

  doc.setFontSize(10)
  doc.setTextColor(...mutedColor)
  doc.text(data.date, 105, 62, { align: "center" })

  // Score Section
  doc.setFillColor(245, 245, 250)
  doc.roundedRect(20, 70, 170, 30, 5, 5, "F")

  doc.setTextColor(...textColor)
  doc.setFontSize(14)
  doc.text(isArabic ? "Analysis Score" : "Analysis Score", 30, 82)

  doc.setFontSize(24)
  doc.setTextColor(...primaryColor)
  doc.text(`${data.score}/100`, 160, 90, { align: "right" })

  // Metrics Section
  let yPos = 115

  doc.setFontSize(14)
  doc.setTextColor(...textColor)
  doc.text(isArabic ? "Key Metrics" : "Key Metrics", 20, yPos)

  yPos += 10

  doc.setFontSize(10)
  data.metrics.forEach((metric, index) => {
    if (yPos > 270) {
      doc.addPage()
      yPos = 20
    }

    doc.setFillColor(index % 2 === 0 ? 250 : 245, index % 2 === 0 ? 250 : 245, 255)
    doc.rect(20, yPos - 5, 170, 10, "F")

    doc.setTextColor(...textColor)
    doc.text(metric.label, 25, yPos)
    doc.text(metric.value, 185, yPos, { align: "right" })

    yPos += 12
  })

  // Issues Section
  yPos += 10

  if (yPos > 240) {
    doc.addPage()
    yPos = 20
  }

  doc.setFontSize(14)
  doc.setTextColor(...textColor)
  doc.text(isArabic ? "Analysis Results" : "Analysis Results", 20, yPos)

  yPos += 10

  doc.setFontSize(9)
  data.issues.forEach((issue) => {
    if (yPos > 270) {
      doc.addPage()
      yPos = 20
    }

    const color =
      issue.type === "success"
        ? successColor
        : issue.type === "warning"
          ? warningColor
          : errorColor

    doc.setFillColor(...color)
    doc.circle(25, yPos - 2, 2, "F")

    doc.setTextColor(...textColor)
    doc.text(issue.message, 32, yPos)

    yPos += 8
  })

  // Recommendations Section
  yPos += 10

  if (yPos > 220) {
    doc.addPage()
    yPos = 20
  }

  doc.setFontSize(14)
  doc.setTextColor(...textColor)
  doc.text(isArabic ? "Recommendations" : "Recommendations", 20, yPos)

  yPos += 10

  doc.setFontSize(9)
  data.recommendations.forEach((rec, index) => {
    if (yPos > 270) {
      doc.addPage()
      yPos = 20
    }

    doc.setTextColor(...primaryColor)
    doc.text(`${index + 1}.`, 25, yPos)

    doc.setTextColor(...textColor)
    doc.text(rec, 32, yPos)

    yPos += 8
  })

  // Footer
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(...mutedColor)
    doc.text(
      `Smart Land Analytics Report - Page ${i} of ${pageCount}`,
      105,
      290,
      { align: "center" }
    )
    doc.text("www.smartland.com | +20 127 209 7150", 105, 295, { align: "center" })
  }

  // Save the PDF
  const fileName = `smartland-report-${new Date().toISOString().split("T")[0]}.pdf`
  doc.save(fileName)
}

export function exportAnalysisPDF(
  analysisType: string,
  result: {
    score: number
    metrics: { label: string; value: string; status?: string }[]
    issues: { type: string; message: string }[]
    recommendations: string[]
  },
  language: "ar" | "en"
) {
  const titles: Record<string, { ar: string; en: string }> = {
    website: { ar: "Website Analysis Report", en: "Website Analysis Report" },
    instagram: { ar: "Instagram Analysis Report", en: "Instagram Analysis Report" },
    facebook: { ar: "Facebook Analysis Report", en: "Facebook Analysis Report" },
    tiktok: { ar: "TikTok Analysis Report", en: "TikTok Analysis Report" },
  }

  const data: PDFData = {
    title: titles[analysisType]?.[language] || "Analysis Report",
    date: new Date().toLocaleDateString(language === "ar" ? "ar-EG" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    score: result.score,
    metrics: result.metrics.map((m) => ({ label: m.label, value: m.value })),
    issues: result.issues,
    recommendations: result.recommendations,
    language,
  }

  generatePDF(data)
}

export function exportDashboardPDF(language: "ar" | "en") {
  const data: PDFData = {
    title: language === "ar" ? "Dashboard Analytics Report" : "Dashboard Analytics Report",
    date: new Date().toLocaleDateString(language === "ar" ? "ar-EG" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    score: 85,
    metrics: [
      { label: language === "ar" ? "Total Visits" : "Total Visits", value: "124,520" },
      { label: language === "ar" ? "Followers" : "Followers", value: "155,000" },
      { label: language === "ar" ? "Conversion Rate" : "Conversion Rate", value: "3.42%" },
      { label: language === "ar" ? "Avg. Session" : "Avg. Session", value: "4:32" },
      { label: language === "ar" ? "Bounce Rate" : "Bounce Rate", value: "32%" },
      { label: language === "ar" ? "Page Views" : "Page Views", value: "450,000" },
    ],
    issues: [
      { type: "success", message: "High traffic growth maintained" },
      { type: "success", message: "Good engagement rate on social media" },
      { type: "warning", message: "Bounce rate slightly above average" },
      { type: "warning", message: "Mobile traffic needs improvement" },
      { type: "success", message: "Conversion rate improving steadily" },
    ],
    recommendations: [
      "Optimize landing pages to reduce bounce rate",
      "Improve mobile user experience",
      "Increase posting frequency on social media",
      "Add more call-to-action buttons",
      "Implement A/B testing for key pages",
    ],
    language,
  }

  generatePDF(data)
}
