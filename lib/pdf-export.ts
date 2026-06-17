import { jsPDF } from "jspdf";
import "jspdf-autotable";

export interface PDFData {
  title: string;
  date: string;
  score: number;
  metrics: { label: string; value: string }[];
  issues: { type: string; message: string }[];
  recommendations: string[];
}

export function exportAnalysisPDF(data: PDFData) {
  const doc = new jsPDF();

  // إعدادات الألوان (نفس الألوان المستخدمة في الموقع)
  const primaryColor = [31, 41, 55]; // الرمادي الغامق الذي تفضله
  const accentColor = [59, 130, 246]; // الأزرق للمسات التفاعلية

  // 1. رأس الصفحة (Header)
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, 210, 30, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.text(data.title, 105, 20, { align: "center" });

  // 2. التاريخ والنتيجة
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.text(`التاريخ: ${data.date}`, 10, 40);
  doc.text(`الدرجة الكلية: ${data.score}%`, 10, 50);

  // 3. جدول المقاييس (باستخدام autotable للحفاظ على التنسيق)
  (doc as any).autoTable({
    startY: 60,
    head: [['المقياس', 'النتيجة']],
    body: data.metrics.map(m => [m.label, m.value]),
    theme: 'grid',
    headStyles: { fillColor: primaryColor },
  });

  // 4. التوصيات (نص عربي واقعي)
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(14);
  doc.text("التوصيات المقترحة:", 10, finalY);
  
  doc.setFontSize(10);
  data.recommendations.forEach((rec, index) => {
    doc.text(`- ${rec}`, 10, finalY + 10 + (index * 7));
  });

  doc.save("تقرير-تحليل-الموقع.pdf");
}