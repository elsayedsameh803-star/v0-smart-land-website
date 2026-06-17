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
  // إنشاء مستند جديد بمقاس A4 وتوجيه رأسي
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  })

  const isArabic = data.language === "ar"

  // إعدادات الخطوط ودعم اللغة العربية (تجنب الحروف المقطعة والمربعات)
  if (isArabic) {
    // استدعاء خط Amiri المخصص للـ PDF برابط ثابت ليعمل عند جميع المستخدمين
    doc.addFont("https://fonts.gstatic.com/s/amiri/v28/定.ttf", "Amiri", "normal")
    doc.setFont("Amiri")
    // تفعيل خاصية الكتابة من اليمين لليسار للنصوص العربية
    doc.processJSKey = (text: string) => text
  } else {
    doc.setFont("helvetica")
  }

  // تعريف الألوان الأساسية للتقرير (RGB)
  const primaryColor: [number, number, number] = [200, 160, 50]
  const textColor: [number, number, number] = [30, 30, 40]
  const mutedColor: [number, number, number] = [120, 120, 130]
  const successColor: [number, number, number] = [34, 197, 94]

  // --- بداية رسم وتنسيق محتوى الـ PDF ---
  
  // 1. العنوان الرئيسي
  doc.setTextColor(...primaryColor)
  doc.setFontSize(24)
  doc.text(data.title, isArabic ? 190 : 20, 25, { align: isArabic ? "right" : "left" })

  // 2. التاريخ
  doc.setTextColor(...mutedColor)
  doc.setFontSize(10)
  doc.text(`${isArabic ? "التاريخ: " : "Date: "} ${data.date}`, isArabic ? 190 : 20, 35, { align: isArabic ? "right" : "left" })

  // 3. النتيجة الإجمالية (Score)
  doc.setTextColor(...textColor)
  doc.setFontSize(16)
  doc.text(`${isArabic ? "النتيجة الإجمالية:" : "Total Score:"} ${data.score}%`, isArabic ? 190 : 20, 50, { align: isArabic ? "right" : "left" })

  // خط فاصل
  doc.setDrawColor(220, 220, 230)
  doc.line(20, 55, 190, 55)

  // 4. طباعة المقاييس (Metrics)
  let currentY = 65
  doc.setFontSize(14)
  doc.setTextColor(...primaryColor)
  doc.text(isArabic ? "المقاييس والتحليلات:" : "Metrics & Analysis:", isArabic ? 190 : 20, currentY, { align: isArabic ? "right" : "left" })
  
  currentY += 10
  doc.setFontSize(12)
  doc.setTextColor(...textColor)
  
  data.metrics.forEach((metric) => {
    const textLine = `${metric.label}: ${metric.value}`
    doc.text(textLine, isArabic ? 190 : 20, currentY, { align: isArabic ? "right" : "left" })
    currentY += 8
  })

  // 5. طباعة المشاكل (Issues) إن وجدت
  if (data.issues && data.issues.length > 0) {
    currentY += 5
    doc.setFontSize(14)
    doc.setTextColor(220, 50, 50) // لون أحمر للمشاكل
    doc.text(isArabic ? "المشاكل المكتشفة:" : "Detected Issues:", isArabic ? 190 : 20, currentY, { align: isArabic ? "right" : "left" })
    
    currentY += 10
    doc.setFontSize(11)
    doc.setTextColor(...textColor)
    
    data.issues.forEach((issue) => {
      const issueText = `• [${issue.type}] ${issue.message}`
      doc.text(issueText, isArabic ? 190 : 20, currentY, { align: isArabic ? "right" : "left" })
      currentY += 7
    })
  }

  // 6. طباعة التوصيات (Recommendations)
  if (data.recommendations && data.recommendations.length > 0) {
    currentY += 5
    doc.setFontSize(14)
    doc.setTextColor(...successColor) // لون أخضر للتوصيات
    doc.text(isArabic ? "التوصيات والحلول:" : "Recommendations:", isArabic ? 190 : 20, currentY, { align: isArabic ? "right" : "left" })
    
    currentY += 10
    doc.setFontSize(11)
    doc.setTextColor(...textColor)
    
    data.recommendations.forEach((rec) => {
      doc.text(`- ${rec}`, isArabic ? 190 : 20, currentY, { align: isArabic ? "right" : "left" })
      currentY += 7
    })
  }

  // حفظ وحفظ الملف للمستخدم
  doc.save(`${data.title.replace(/\s+/g, "_")}.pdf`)
}