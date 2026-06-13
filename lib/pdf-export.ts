"use client"

import { jsPDF } from "jspdf"

interface PDFData {
  title: string
  date: string
  score: number
  recommendations: string[]
}

export function generatePDF(data: PDFData) {
  const doc = new jsPDF()

  doc.setFontSize(16)
  doc.text(data.title, 20, 20)

  doc.setFontSize(12)
  doc.text(data.date, 20, 30)

  doc.text(`Score: ${data.score}`, 20, 40)

  let y = 60

  data.recommendations.forEach((r, i) => {
    doc.text(`${i + 1}. ${r}`, 20, y)
    y += 10
  })

  doc.save(`report-${Date.now()}.pdf`)
}