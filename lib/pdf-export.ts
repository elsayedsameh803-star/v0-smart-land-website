import { jsPDF } from "jspdf";
import "jspdf-autotable";

export interface PDFData {
  title: string;
  date: string;
  score: number;
  metrics: { label: string; value: string }[];
  recommendations: string[];
}

export function exportAnalysisPDF(data: PDFData) {
  const doc = new jsPDF();
  
  // الألوان الأساسية (الرمادي الغامق الذي يطابق ستايل موقعك)
  const primaryColor = [31, 41, 55]; 

  // الهيدر الملون
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, 210, 30, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.text(data.title, 105, 20, { align: "center" });

  // تفاصيل التقرير
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.text(`التاريخ: ${data.date}`, 10, 40);
  doc.text(`الدرجة: ${data.score}%`, 10, 50);

  doc.save("تقرير-التحليل.pdf");
}