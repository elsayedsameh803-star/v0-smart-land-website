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
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  })

  const isArabic = data.language === "ar"
  doc.setFont(isArabic ? "Helvetica" : "helvetica")

  // خلفية الهيدر العلوي
  doc.setFillColor(31, 41, 55)
  doc.rect(0, 0, 210, 40, "F")

  // عنوان التقرير والتاريخ
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(20)
  doc.text(isArabic ? "Report / تقرير" : "Analysis Report", 20, 25)

  // النتيجة الإجمالية
  doc.setFillColor(243, 244, 246)
  doc.rect(20, 50, 170, 20, "F")
  doc.setTextColor(31, 41, 55)
  doc.setFontSize(16)
  doc.text(`Score / النتيجة: ${data.score}%`, 30, 63)

  // محتوى المقاييس والتحليلات
  let currentY = 85
  doc.setFontSize(14)
  doc.text(isArabic ? "Metrics / المقاييس:" : "Metrics:", 20, currentY)
  
  currentY += 10
  doc.setFontSize(12)
  if (data.metrics && data.metrics.length > 0) {
    data.metrics.forEach((metric) => {
      doc.text(`${metric.label}: ${metric.value}`, 25, currentY)
      currentY += 8
    })
  }

  // حفظ واستخراج ملف الـ PDF
  doc.save(`${data.title.replace(/\s+/g, "_")}.pdf`)
}

export function exportAnalysisPDF(data: PDFData) {
  generatePDF(data)
}

export function exportDashboardPDF(data: PDFData) {
  generatePDF(data)
}