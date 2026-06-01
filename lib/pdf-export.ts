export async function exportDashboardPDF(language: "ar" | "en") {
  if (typeof window === "undefined") return

  const { jsPDF } = await import("jspdf")

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  })

  const isArabic = language === "ar"

  // ===== Titles =====
  const title = isArabic ? "تقرير لوحة التحكم" : "Dashboard Report"
  const subtitle = isArabic ? "تحليل شامل للأداء" : "Performance Analytics Report"

  // ===== Header =====
  doc.setFillColor(200, 160, 50)
  doc.rect(0, 0, 210, 40, "F")

  doc.setTextColor(30, 30, 40)
  doc.setFontSize(20)
  doc.text("Smart Land", 105, 18, { align: "center" })

  doc.setFontSize(11)
  doc.text("Analytics System", 105, 28, { align: "center" })

  // ===== Title =====
  doc.setTextColor(20, 20, 30)
  doc.setFontSize(16)
  doc.text(title, 105, 55, { align: "center" })

  doc.setFontSize(11)
  doc.setTextColor(120, 120, 120)
  doc.text(subtitle, 105, 63, { align: "center" })

  // ===== Date =====
  doc.setFontSize(10)
  doc.text(new Date().toLocaleDateString(), 105, 72, { align: "center" })

  // ===== Metrics =====
  const metrics = [
    isArabic ? "إجمالي الزيارات: 124,520" : "Total Visits: 124,520",
    isArabic ? "المتابعون: 155,000" : "Followers: 155,000",
    isArabic ? "معدل التحويل: 3.42%" : "Conversion Rate: 3.42%",
    isArabic ? "مدة الجلسة: 4:32" : "Avg Session: 4:32",
  ]

  let y = 95

  doc.setFontSize(12)
  doc.setTextColor(30, 30, 40)

  metrics.forEach((item) => {
    doc.text(item, 20, y)
    y += 10
  })

  // ===== Footer =====
  doc.setFontSize(9)
  doc.setTextColor(120, 120, 120)

  doc.text(
    "Smart Land Analytics - Confidential Report",
    105,
    285,
    { align: "center" }
  )

  doc.save(`smartland-report-${Date.now()}.pdf`)
}