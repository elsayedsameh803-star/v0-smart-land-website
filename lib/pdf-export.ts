// lib/pdf-export.ts
import { jsPDF } from "jspdf";

export interface PDFData {
  title: string;
  score: number;
}

// دالة موحدة لجميع صفحات التحليل
export const exportAnalysisPDF = (data: PDFData) => {
  const doc = new jsPDF();
  doc.text(`${data.title}: ${data.score}%`, 10, 10);
  doc.save("smart-land-report.pdf");
};