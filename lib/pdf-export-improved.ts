"use client"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import arabicReshaper from "arabic-reshaper"

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

/**
 * Fix Arabic text rendering in PDF by reshaping characters properly
 */
function processArabicText(text: string): string {
  try {
    const reshaped = arabicReshaper.reshape(text)
    return reshaped.split('').reverse().join('')
  } catch (e) {
    return text
  }
}

export function generatePDFImproved(data: PDFData) {
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

  // Add custom fonts support for Arabic
  doc.addFileToVFS("Tajawal-Regular.ttf", "YOUR_FONT_DATA_HERE")
  doc.addFont("Tajawal-Regular.ttf", "Tajawal", "normal")

  // Fallback: Use default font that handles more characters
  doc.setFont("helvetica", "normal")

  // ===== Header Section =====
  doc.setFillColor(59, 130, 246)
  doc.rect(0, 0, pageWidth, 50, "F")

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(24)
  doc.setFont("helvetica", "bold")
  
  const headerText = isArabic 
    ? processArabicText("سمارت لاند - تقرير تحليل") 
    : "Smart Land - Analysis Report"
  
  doc.text(headerText, isArabic ? pageWidth - 20 : 20, 22, { 
    align: isArabic ? "right" : "left",
    maxWidth: pageWidth - 40
  })

  doc.setFontSize(11)
  doc.setFont("helvetica", "normal")
  
  const dateText = isArabic 
    ? processArabicText(`التاريخ: ${data.date}`)
    : `Date: ${data.date}`
  
  doc.text(dateText, isArabic ? pageWidth - 20 : 20, 33, { 
    align: isArabic ? "right" : "left"
  })

  if (data.websiteName || data.url) {
    const websiteLabel = isArabic ? "الموقع: " : "Website: "
    const websiteText = websiteLabel + (data.websiteName || data.url || "N/A")
    doc.setFontSize(10)
    doc.text(
      isArabic ? processArabicText(websiteText) : websiteText,
      isArabic ? pageWidth - 20 : 20,
      42,
      { align: isArabic ? "right" : "left", maxWidth: pageWidth - 40 }
    )
  }

  currentY = 60

  // ===== Overall Score Section =====
  doc.setFillColor(26, 26, 26)
  doc.setDrawColor(59, 130, 246)
  doc.setLineWidth(0.5)
  doc.rect(15, currentY, pageWidth - 30, 25, "FD")

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(16)
  doc.setFont("helvetica", "bold")
  
  const scoreLabel = getTextByLanguage(data.language, "score")
  const scoreText = `${scoreLabel}: ${data.score}%`
  
  doc.text(scoreText, pageWidth / 2, currentY + 15, { align: "center" })

  currentY += 35

  // ===== Metrics Section =====
  if (data.metrics && data.metrics.length > 0) {
    doc.setTextColor(59, 130, 246)
    doc.setFontSize(13)
    doc.setFont("helvetica", "bold")
    
    const metricsLabel = getTextByLanguage(data.language, "metrics")
    doc.text(
      isArabic ? processArabicText(metricsLabel) : metricsLabel,
      isArabic ? pageWidth - 15 : 15,
      currentY,
      { align: isArabic ? "right" : "left" }
    )
    currentY += 10

    const metricsTableData = data.metrics.map((metric) => [
      isArabic ? processArabicText(metric.label) : metric.label,
      String(metric.value),
    ])

    autoTable(doc, {
      head: [[
        isArabic ? processArabicText("المقياس") : "Metric",
        isArabic ? processArabicText("القيمة") : "Value",
      ]],
      body: metricsTableData,
      startY: currentY,
      theme: "dark",
      didDrawPage: (data: any) => {
        if (data.pageCount > 1) {
          doc.setFontSize(9)
          doc.setTextColor(150, 150, 150)
          const pageText = isArabic
            ? processArabicText(`الصفحة ${data.pageNumber} من ${data.doc.internal.pages.length - 1}`)
            : `Page ${data.pageNumber} of ${data.doc.internal.pages.length - 1}`
          doc.text(
            pageText,
            pageWidth / 2,
            pageHeight - 10,
            { align: "center" }
          )
        }
      },
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: [255, 255, 255],
        font: "helvetica",
        fontStyle: "bold",
        fontSize: 11,
      },
      bodyStyles: {
        fillColor: [30, 30, 30],
        textColor: [255, 255, 255],
        font: "helvetica",
        fontSize: 10,
      },
      alternateRowStyles: {
        fillColor: [26, 26, 26],
      },
      margin: { left: 15, right: 15 },
    })

    currentY = (doc as any).lastAutoTable?.finalY + 15 || currentY + 50
  }

  // Check for page break
  if (currentY > pageHeight - 60) {
    doc.addPage()
    currentY = 20
  }

  // ===== Issues Section =====
  if (data.issues && data.issues.length > 0) {
    doc.setTextColor(239, 68, 68)
    doc.setFontSize(13)
    doc.setFont("helvetica", "bold")
    
    const issuesLabel = getTextByLanguage(data.language, "issues")
    doc.text(
      isArabic ? processArabicText(issuesLabel) : issuesLabel,
      isArabic ? pageWidth - 15 : 15,
      currentY,
      { align: isArabic ? "right" : "left" }
    )
    currentY += 10

    const issuesTableData = data.issues.map((issue) => [
      isArabic ? processArabicText(issue.type) : issue.type,
      isArabic ? processArabicText(issue.message) : issue.message,
    ])

    autoTable(doc, {
      head: [[
        isArabic ? processArabicText("النوع") : "Type",
        isArabic ? processArabicText("الرسالة") : "Message",
      ]],
      body: issuesTableData,
      startY: currentY,
      theme: "dark",
      headStyles: {
        fillColor: [239, 68, 68],
        textColor: [255, 255, 255],
        font: "helvetica",
        fontStyle: "bold",
        fontSize: 11,
      },
      bodyStyles: {
        fillColor: [30, 30, 30],
        textColor: [255, 255, 255],
        font: "helvetica",
        fontSize: 10,
      },
      alternateRowStyles: {
        fillColor: [26, 26, 26],
      },
      margin: { left: 15, right: 15 },
    })

    currentY = (doc as any).lastAutoTable?.finalY + 15 || currentY + 50
  }

  // Check for page break
  if (currentY > pageHeight - 60) {
    doc.addPage()
    currentY = 20
  }

  // ===== Recommendations Section =====
  if (data.recommendations && data.recommendations.length > 0) {
    doc.setTextColor(16, 185, 129)
    doc.setFontSize(13)
    doc.setFont("helvetica", "bold")
    
    const recsLabel = getTextByLanguage(data.language, "recommendations")
    doc.text(
      isArabic ? processArabicText(recsLabel) : recsLabel,
      isArabic ? pageWidth - 15 : 15,
      currentY,
      { align: isArabic ? "right" : "left" }
    )
    currentY += 10

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(11)
    doc.setFont("helvetica", "normal")

    data.recommendations.forEach((rec) => {
      if (currentY > pageHeight - 30) {
        doc.addPage()
        currentY = 20
      }

      const bulletPoint = isArabic ? "• " : "• "
      const recText = isArabic ? processArabicText(rec) : rec
      const lines = doc.splitTextToSize(`${bulletPoint}${recText}`, pageWidth - 30)
      
      doc.text(lines, isArabic ? pageWidth - 20 : 20, currentY, {
        align: isArabic ? "right" : "left"
      })
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
      ? processArabicText(`الصفحة ${i} من ${totalPages}`)
      : `Page ${i} of ${totalPages}`
    
    doc.text(footerText, pageWidth / 2, pageHeight - 10, { align: "center" })
  }

  // Save PDF
  const fileName = isArabic
    ? `تقرير_${data.title.replace(/\s+/g, "_")}.pdf`
    : `report_${data.title.replace(/\s+/g, "_")}.pdf`
  
  doc.save(fileName)
}

export function exportAnalysisPDFImproved(data: PDFData) {
  generatePDFImproved(data)
}

export function exportDashboardPDFImproved(data: PDFData) {
  generatePDFImproved(data)
}
