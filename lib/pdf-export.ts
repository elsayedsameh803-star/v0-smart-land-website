"use client"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"

interface PDFData {
  title: string
  date: string
  score: number
  metrics: { label: string; value: string | number }[]
  issues: { type: string; message: string }[]
  recommendations: string[]
  language: "ar" | "en"
  url?: string
  websiteName?: string
}

interface ChartData {
  labels: string[]
  data: number[]
  title: string
}

const arabicText = {
  report: "تقرير",
  score: "النتيجة",
  metrics: "المقاييس",
  issues: "المشاكل المكتشفة",
  recommendations: "التوصيات",
  date: "التاريخ",
  website: "الموقع",
  type: "النوع",
  message: "الرسالة",
  pages: "الصفحات",
  pageOf: "من",
  noData: "لا توجد بيانات",
}

const englishText = {
  report: "Report",
  score: "Score",
  metrics: "Metrics",
  issues: "Detected Issues",
  recommendations: "Recommendations",
  date: "Date",
  website: "Website",
  type: "Type",
  message: "Message",
  pages: "Pages",
  pageOf: "of",
  noData: "No Data",
}

function getTextByLanguage(lang: "ar" | "en", key: keyof typeof arabicText) {
  return lang === "ar" ? arabicText[key] : englishText[key]
}

export function generatePDF(data: PDFData) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    compress: true,
  }) as any

  const isArabic = data.language === "ar"
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  let currentY = 20

  // Set default font with Arabic support
  doc.setFont("Helvetica", "normal")

  // ===== Header Section =====
  doc.setFillColor(59, 130, 246)
  doc.rect(0, 0, pageWidth, 45, "F")

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(28)
  doc.setFont("Helvetica", "bold")
  const headerText = isArabic ? "سمارت لاند - تقرير تحليل" : "Smart Land - Analysis Report"
  doc.text(headerText, pageWidth / 2, 20, { align: "center" })

  doc.setFontSize(11)
  doc.setFont("Helvetica", "normal")
  const dateText = isArabic ? `التاريخ: ${data.date}` : `Date: ${data.date}`
  doc.text(dateText, pageWidth / 2, 32, { align: "center" })

  if (data.websiteName || data.url) {
    const websiteText = isArabic ? "الموقع: " : "Website: "
    doc.setFontSize(10)
    doc.text(websiteText + (data.websiteName || data.url || "N/A"), pageWidth / 2, 40, { align: "center" })
  }

  currentY = 55

  // ===== Overall Score Section =====
  doc.setFillColor(26, 26, 26)
  doc.setDrawColor(59, 130, 246)
  doc.setLineWidth(0.5)
  doc.rect(15, currentY, pageWidth - 30, 25, "FD")

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(16)
  doc.setFont("Helvetica", "bold")
  const scoreLabel = getTextByLanguage(data.language, "score")
  const scoreText = `${scoreLabel}: ${data.score}%`
  doc.text(scoreText, pageWidth / 2, currentY + 15, { align: "center" })

  currentY += 35

  // ===== Metrics Section =====
  if (data.metrics && data.metrics.length > 0) {
    doc.setTextColor(59, 130, 246)
    doc.setFontSize(14)
    doc.setFont("Helvetica", "bold")
    const metricsLabel = getTextByLanguage(data.language, "metrics")
    doc.text(metricsLabel, 15, currentY)
    currentY += 10

    const metricsTableData = data.metrics.map((metric) => [
      metric.label,
      String(metric.value),
    ])

    autoTable(doc, {
      head: [[
        isArabic ? "المقياس" : "Metric",
        isArabic ? "القيمة" : "Value",
      ]],
      body: metricsTableData,
      startY: currentY,
      theme: "dark",
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: [255, 255, 255],
        font: "Helvetica",
        fontStyle: "bold",
        fontSize: 11,
      },
      bodyStyles: {
        fillColor: [30, 30, 30],
        textColor: [255, 255, 255],
        font: "Helvetica",
        fontSize: 10,
      },
      alternateRowStyles: {
        fillColor: [26, 26, 26],
      },
      margin: { left: 15, right: 15 },
      columnStyles: {
        0: { cellWidth: pageWidth - 60 },
        1: { cellWidth: 30, halign: "center" },
      },
    })

    currentY = (doc as any).lastAutoTable.finalY + 15
  }

  // Check for page break
  if (currentY > pageHeight - 60) {
    doc.addPage()
    currentY = 20
  }

  // ===== Issues Section =====
  if (data.issues && data.issues.length > 0) {
    doc.setTextColor(239, 68, 68)
    doc.setFontSize(14)
    doc.setFont("Helvetica", "bold")
    const issuesLabel = getTextByLanguage(data.language, "issues")
    doc.text(issuesLabel, 15, currentY)
    currentY += 10

    const issuesTableData = data.issues.map((issue) => [
      issue.type,
      issue.message,
    ])

    autoTable(doc, {
      head: [[
        isArabic ? "النوع" : "Type",
        isArabic ? "الرسالة" : "Message",
      ]],
      body: issuesTableData,
      startY: currentY,
      theme: "dark",
      headStyles: {
        fillColor: [239, 68, 68],
        textColor: [255, 255, 255],
        font: "Helvetica",
        fontStyle: "bold",
        fontSize: 11,
      },
      bodyStyles: {
        fillColor: [30, 30, 30],
        textColor: [255, 255, 255],
        font: "Helvetica",
        fontSize: 10,
      },
      alternateRowStyles: {
        fillColor: [26, 26, 26],
      },
      margin: { left: 15, right: 15 },
    })

    currentY = (doc as any).lastAutoTable.finalY + 15
  }

  // Check for page break
  if (currentY > pageHeight - 60) {
    doc.addPage()
    currentY = 20
  }

  // ===== Recommendations Section =====
  if (data.recommendations && data.recommendations.length > 0) {
    doc.setTextColor(16, 185, 129)
    doc.setFontSize(14)
    doc.setFont("Helvetica", "bold")
    const recsLabel = getTextByLanguage(data.language, "recommendations")
    doc.text(recsLabel, 15, currentY)
    currentY += 10

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(11)
    doc.setFont("Helvetica", "normal")

    data.recommendations.forEach((rec, index) => {
      if (currentY > pageHeight - 30) {
        doc.addPage()
        currentY = 20
      }

      const bulletPoint = isArabic ? "• " : "• "
      const lines = doc.splitTextToSize(`${bulletPoint}${rec}`, pageWidth - 30)
      doc.text(lines, 20, currentY)
      currentY += (lines.length * 5) + 5
    })
  }

  // ===== Footer =====
  const totalPages = (doc as any).internal.pages.length - 1
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFontSize(9)
    doc.setTextColor(150, 150, 150)
    const footerText = isArabic
      ? `الصفحة ${i} من ${totalPages}`
      : `Page ${i} of ${totalPages}`
    doc.text(footerText, pageWidth / 2, pageHeight - 10, { align: "center" })
  }

  // Save PDF
  const fileName = isArabic
    ? `تقرير_${data.title.replace(/\s+/g, "_")}.pdf`
    : `report_${data.title.replace(/\s+/g, "_")}.pdf`
  
  doc.save(fileName)
}

export function exportAnalysisPDF(data: PDFData) {
  generatePDF(data)
}

export function exportDashboardPDF(data: PDFData) {
  generatePDF(data)
}
