"use client"
import { jsPDF } from "jspdf"
// استيراد المكتبة المسؤولة عن تشكيل وشبك الحروف العربية تلقائياً
import { reshape } from "arabic-persian-reshaper"

interface PDFData {
  title: string
  date: string
  score: number
  metrics: { label: string; value: string }[]
  issues: { type: string; message: string }[]
  recommendations: string[]
  language: "ar" | "en"
}

// دالة إصلاح النص العربي ليكون مشبوكاً ومقروءاً بشكل صحيح من اليمين لليسار
function fixArabicText(text: string): string {
  if (!text) return ""
  const arabicRegex = /[\u0600-\u06FF]/
  if (arabicRegex.test(text)) {
    // تشكيل الحروف وشبكها ثم عكسها لتتوافق مع نظام مكتبة jsPDF
    return reshape(text).split(" ").map(word => word.split("").reverse().join("")).reverse().join(" ")
  }
  return text
}

export function generatePDF(data: PDFData) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  })

  const isArabic = data.language === "ar"

  if (isArabic) {
    doc.addFont("https://fonts.gstatic.com/s/amiri/v28/定.ttf", "Amiri", "normal")
    doc.setFont("Amiri")
  } else {
    doc.setFont("helvetica")
  }

  // الألوان الأساسية والتنسيقات
  const primaryColor: [number, number, number] = [31, 41, 55]
  const accentColor: [number, number, number] = [212, 163, 89]
  const textColor: [number, number, number] = [55, 65, 81]
  const mutedColor: [number, number, number] = [156, 163, 175]
  const dangerColor: [number, number, number] = [239, 68, 68]
  const successColor: [number, number, number] = [34, 197, 94]

  // تصميم الهيدر الخلفي
  doc.setFillColor(249, 250, 251)
  doc.rect(0, 0, 210, 45, "F")

  // 1. العنوان
  doc.setTextColor(...accentColor)
  doc.setFontSize(24)
  const displayTitle = isArabic ? fixArabicText(data.title) : data.title
  doc.text(displayTitle, isArabic ? 190 : 20, 25, { align: isArabic ? "right" : "left" })

  // 2. التاريخ
  doc.setTextColor(...mutedColor)
  doc.setFontSize(10)
  const dateText = isArabic ? `${fixArabicText("التاريخ:")} ${data.date}` : `Date: ${data.date}`
  doc.text(dateText, isArabic ? 190 : 20, 35, { align: isArabic ? "right" : "left" })

  doc.setDrawColor(...accentColor)
  doc.setLineWidth(0.8)
  doc.line(20, 45, 190, 45)

  // 3. النتيجة الإجمالية
  doc.setFillColor(243, 244, 246)
  doc.rect(20, 55, 170, 20, "F")
  
  doc.setTextColor(...primaryColor)
  doc.setFontSize(16)
  const scoreText = isArabic ? `${fixArabicText("النتيجة الإجمالية:")} ${data.score}%` : `Total Score: ${data.score}%`
  doc.text(scoreText, isArabic ? 190 : 30, 68, { align: isArabic ? "right" : "left" })

  // 4. المقاييس والتحليلات
  let currentY = 90
  doc.setFontSize(14)
  doc.setTextColor(...primaryColor)
  doc.text(isArabic ? fixArabicText("المقاييس والتحليلات:") : "Metrics & Analysis:", isArabic ? 190 : 20, currentY, { align: isArabic ? "right" : "left" })
  
  currentY += 10
  doc.setFontSize(12)
  doc.setTextColor(...textColor)
  
  data.metrics.forEach((metric) => {
    const label = isArabic ? fixArabicText(metric.label) : metric.label
    const value = isArabic ? fixArabicText(metric.value) : metric.value
    doc.text(`${label}: ${value}`, isArabic ? 190 : 20, currentY, { align: isArabic ? "right" : "left" })
    currentY += 8
  })

  // 5. المشاكل المكتشفة
  if (data.issues && data.issues.length > 0) {
    currentY += 10
    doc.setFontSize(14)
    doc.setTextColor(...dangerColor)
    doc.text(isArabic ? fixArabicText("المشاكل المكتشفة:") : "Detected Issues:", isArabic ? 190 : 20, currentY, { align: isArabic ? "right" : "left" })
    
    currentY += 10
    doc.setFontSize(11)
    doc.setTextColor(...textColor)
    
    data.issues.forEach((issue) => {
      const type = isArabic ? fixArabicText(issue.type) : issue.type
      const msg = isArabic ? fixArabicText(issue.message) : issue.message
      doc.text(isArabic ? `${msg} [${type}] •` : `• [${type}] ${msg}`, isArabic ? 190 : 20, currentY, { align: isArabic ? "right" : "left" })
      currentY += 8
    })
  }

  // 6. التوصيات والحلول
  if (data.recommendations && data.recommendations.length > 0) {
    currentY += 10
    doc.setFontSize(14)
    doc.setTextColor(...successColor)
    doc.text(isArabic ? fixArabicText("التوصيات والحلول المقترحة:") : "Recommendations:", isArabic ? 190 : 20, currentY, { align: isArabic ? "right" : "left" })
    
    currentY += 10
    doc.setFontSize(11)
    doc.setTextColor(...textColor)
    
    data.recommendations.forEach((rec) => {
      const textRec = isArabic ? fixArabicText(rec) : rec
      doc.text(isArabic ? `${textRec} -` : `- ${textRec}`, isArabic ? 190 : 20, currentY, { align: isArabic ? "right" : "left" })
      currentY += 8
    })
  }

  // الفوتر السفلي
  doc.setFillColor(31, 41, 55)
  doc.rect(0, 285, 210, 12, "F")

  doc.save(`${data.title.replace(/\s+/g, "_")}.pdf`)
}

export function exportAnalysisPDF(data: PDFData) {
  generatePDF(data)
}

export function exportDashboardPDF(data: PDFData) {
  generatePDF(data)
}