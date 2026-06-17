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

// الدالة الأساسية الموحدة لطباعة الـ PDF باللغة العربية
function generatePDF(data: PDFData) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  })

  const isArabic = data.language === "ar"

  if (isArabic) {
    doc.addFont("https://fonts.gstatic.com/s/amiri/v28/定.ttf", "Amiri", "normal")
    doc.setFont("Amiri")
    doc.processJSKey = (text: string) => text
  } else {
    doc.setFont("helvetica")
  }

  const primaryColor: [number, number, number] = [200, 160, 50]
  const textColor: [number, number, number] = [30, 30, 40]
  const mutedColor: [number, number, number] = [120, 120, 130]
  const successColor: [number, number, number] = [34, 197, 94]

  // 1. العنوان
  doc.setTextColor(...primaryColor)
  doc.setFontSize(24)
  doc.text(data.title, isArabic ? 190 : 20, 25, { align: isArabic ? "right" : "left" })

  // 2. التاريخ
  doc.setTextColor(...mutedColor)
  doc.setFontSize(10)
  doc.text(`${isArabic ? "التاريخ: " : "Date: "} ${data.date}`, isArabic ? 190 : 20, 35, { align: isArabic ? "right" : "left" })

  // 3. النتيجة
  doc.setTextColor(...textColor)
  doc.setFontSize(16)
  doc.text(`${isArabic ? "النتيجة الإجمالية:" : "Total Score:"} ${data.score}%`, isArabic ? 190 : 20, 50, { align: isArabic ? "right" : "left" })

  doc.setDrawColor(220, 220, 230)
  doc.line(20, 55, 190, 55)

  // 4. المقاييس
  let currentY = 65
  doc.setFontSize(14)
  doc.setTextColor(...primaryColor)
  doc.text(isArabic ? "المقاييس والتحليلات:" : "Metrics & Analysis:", isArabic ? 190 : 20, currentY, { align: isArabic ? "right" : "left" })
  
  currentY += 10
  doc.setFontSize(12)
  doc.setTextColor(...textColor)
  
  data.metrics.forEach((metric) => {
    doc.text(`${metric.label}: ${metric.value}`, isArabic ? 190 : 20, currentY, { align: isArabic ? "right" : "left" })
    currentY += 8
  })

  // 5. المشاكل
  if (data.issues && data.issues.length > 0) {
    currentY += 5
    doc.setFontSize(14)
    doc.setTextColor(220, 50, 50)
    doc.text(isArabic ? "المشاكل المكتشفة:" : "Detected Issues:", isArabic ? 190 : 20, currentY, { align: isArabic ? "right" : "left" })
    
    currentY += 10
    doc.setFontSize(11)
    doc.setTextColor(...textColor)
    
    data.issues.forEach((issue) => {
      doc.text(`• [${issue.type}] ${issue.message}`, isArabic ? 190 : 20, currentY, { align: isArabic ? "right" : "left" })
      currentY += 7
    })
  }

  // 6. التوصيات
  if (data.recommendations && data.recommendations.length > 0) {
    currentY += 5
    doc.setFontSize(14)
    doc.setTextColor(...successColor)
    doc.text(isArabic ? "التوصيات والحلول:" : "Recommendations:", isArabic ? 190 : 20, currentY, { align: isArabic ? "right" : "left" })
    
    currentY += 10
    doc.setFontSize(11)
    doc.setTextColor(...textColor)
    
    data.recommendations.forEach((rec) => {
      doc.text(`- ${rec}`, isArabic ? 190 : 20, currentY, { align: isArabic ? "right" : "left" })
      currentY += 7
    })
  }

  doc.save(`${data.title.replace(/\s+/g, "_")}.pdf`)
}

// تصدير الدوال بالأسماء المطلوبة في المكونات الأخرى لحل أخطاء الـ Build تماماً
export function exportAnalysisPDF(data: PDFData) {
  generatePDF(data)
}

export function exportDashboardPDF(data: PDFData) {
  generatePDF(data)
}