import { jsPDF } from "jspdf";

export interface PDFData {
  title: string;
  score: number;
}

// الدالة الأساسية
export const exportAnalysisPDF = (data: PDFData) => {
  const doc = new jsPDF();
  doc.text(`${data.title}: ${data.score}%`, 10, 10);
  doc.save("smart-land-report.pdf");
};

// إضافة الدالة التي يطلبها ملف الداشبورد لمنع الإيرور
export const exportDashboardPDF = (data: any) => {
  exportAnalysisPDF(data);
};