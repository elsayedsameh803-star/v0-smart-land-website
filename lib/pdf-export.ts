import { jsPDF } from "jspdf";

export function exportAnalysisPDF(type: string, result: any, language: "ar" | "en") {
  const doc = new jsPDF();

  // Load the font you installed
  doc.addFont('NotoNaskhArabic-VariableFont.ttf', 'ArabicFont', 'normal');
  doc.setFont('ArabicFont');

  // Define titles based on type
  const titles = {
    website: language === "ar" ? "تقرير تحليل الموقع" : "Website Analysis Report",
    instagram: language === "ar" ? "تقرير تحليل إنستجرام" : "Instagram Analysis Report",
    facebook: language === "ar" ? "تقرير تحليل فيسبوك" : "Facebook Analysis Report",
    youtube: language === "ar" ? "تقرير تحليل يوتيوب" : "YouTube Analysis Report",
    tiktok: language === "ar" ? "تقرير تحليل تيك توك" : "TikTok Analysis Report"
  };

  // Determine current title
  const reportTitle = titles[type as keyof typeof titles] || "Analysis Report";
  const scoreLabel = language === "ar" ? "النتيجة" : "Score";

  // PDF generation
  doc.setFontSize(16);
  doc.text(reportTitle, 20, 20);

  doc.setFontSize(12);
  doc.text(`${scoreLabel}: ${result.score}`, 20, 35);
  
  doc.save("report.pdf");
}
