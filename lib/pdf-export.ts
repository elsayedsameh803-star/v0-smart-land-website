// lib/pdf-export.ts
import { jsPDF } from "jspdf";

export interface PDFData {
  title: string;
  score: number;
}

export function exportAnalysisPDF(data: PDFData) {
  const doc = new jsPDF();
  doc.text(`${data.title}: ${data.score}%`, 10, 10);
  doc.save("report.pdf");
}

// هذه هي الدالة التي يطلبها صفحة الـ dashboard ويجدها مفقودة
export function exportDashboardPDF(data: any) {
  exportAnalysisPDF(data);
}