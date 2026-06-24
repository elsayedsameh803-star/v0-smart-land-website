'use client';
// @ts-ignore
import reshape from 'arabic-reshaper';
import { jsPDF } from 'jspdf';

export function generatePDF(data: any) {
  const isArabic = data.language === 'ar';
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const fix = (text: string) => isArabic ? reshape(text).split("").reverse().join("") : text;

  // العنوان
  doc.setFontSize(20);
  doc.text(fix(isArabic ? "تقرير التحليل" : "Analysis Report"), 20, 25);

  // النتيجة
  doc.setFontSize(16);
  doc.text(fix(isArabic ? "النتيجة" : "Score") + `: ${data.score}`, 30, 63);

  doc.save(`${data.title.replace(/\s+/g, "_")}.pdf`);
}
