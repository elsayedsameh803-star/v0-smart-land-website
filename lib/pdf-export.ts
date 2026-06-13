export async function exportAnalysisPDF(type: string, result: any, language: "ar" | "en") {
  const { jsPDF } = await import("jspdf")

  const doc = new jsPDF()

  const title =
    type === "website"
      ? "Website Analysis Report"
      : type === "instagram"
      ? "Instagram Analysis Report"
      : type === "facebook"
      ? "Facebook Analysis Report"
      : "TikTok Analysis Report"

  doc.setFontSize(16)
  doc.text(title, 20, 20)

  doc.setFontSize(12)
  doc.text(`Score: ${result.score}`, 20, 35)

  let y = 50

  doc.text("Recommendations:", 20, y)
  y += 10

  result.recommendations?.forEach((r: string, i: number) => {
    doc.text(`${i + 1}. ${r}`, 20, y)
    y += 10
  })

  doc.save(`${type}-report.pdf`)
}