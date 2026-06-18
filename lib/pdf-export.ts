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

/**
 * تحميل الخط من public وتحويله لصيغة مناسبة لـ jsPDF
 */
async function loadFont(url: string): Promise<string> {
  const res = await fetch(url)
  const buffer = await res.arrayBuffer()

  let binary = ""
  const bytes = new Uint8Array(buffer)

  bytes.forEach((b) => (binary += String.fromCharCode(b)))

  return btoa(binary)
}

export async function generatePDF(data: PDFData) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  })

  const isArabic = data.language === "ar"

  // ==============================
  // 🔥 تحميل وتسجيل الخط العربي
  // ==============================
  const fontBase64 = await loadFont("/Amiri-Regular.ttf")

  doc.addFileToVFS("Amiri.ttf", fontBase64)
  doc.addFont("Amiri.ttf", "Amiri", "normal")

  // اختيار الخط
  doc.setFont(isArabic ? "Amiri" : "helvetica")

  if (isArabic) {
    doc.setR2L(true) // دعم اتجاه الكتابة من اليمين لليسار
  }

  // ==============================
  // تصميم التقرير
  // ==============================

  doc.setFillColor(31, 41, 55)
  doc.rect(0, 0, 210, 40, "F")

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(20)
  doc.text(isArabic ? "تقرير التحليل" : "Analysis Report", 20, 25)

  doc.setFillColor(243, 244, 246)
  doc.rect(20, 50, 170, 20, "F")

  doc.setTextColor(31, 41, 55)
  doc.setFontSize(16)
  doc.text(
    isArabic
      ? `النتيجة: ${data.score}%`
      : `Score: ${data.score}%`,
    30,
    63
  )

  let currentY = 85

  doc.setFontSize(14)
  doc.text(
    isArabic ? "المقاييس:" : "Metrics:",
    20,
    currentY
  )

  currentY += 10
  doc.setFontSize(12)

  data.metrics.forEach((metric) => {
    doc.text(`${metric.label}: ${metric.value}`, 25, currentY)
    currentY += 8
  })

  doc.save(`${data.title.replace(/\s+/g, "_")}.pdf`)
}

export function exportAnalysisPDF(data: PDFData) {
  return generatePDF(data)
}

export function exportDashboardPDF(data: PDFData) {
  return generatePDF(data)
}