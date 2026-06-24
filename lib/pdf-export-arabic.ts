import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Language } from "./translations";

// Arabic font setup - using system fonts that support Arabic
const FONT_CONFIG = {
  ar: {
    main: "Courier", // jsPDF default that supports Arabic better
    fallback: "Arial",
    fontSize: 11,
  },
  en: {
    main: "Helvetica",
    fallback: "Arial",
    fontSize: 11,
  },
};

export async function generateArabicPDF(
  elementId: string,
  filename: string,
  language: Language,
  metadata?: {
    title: string;
    description: string;
    url?: string;
    score?: number;
  }
) {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      console.error("[v0] Element not found:", elementId);
      return;
    }

    // Create canvas from HTML element with proper settings
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      allowTaint: true,
      foreignObjectRendering: true,
    });

    const imgData = canvas.toDataURL("image/png");
    const imgWidth = 210; // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // Create PDF with proper Arabic support
    const pdf = new jsPDF({
      orientation: imgHeight > imgWidth ? "portrait" : "landscape",
      unit: "mm",
      format: "a4",
    });

    // Set up fonts for Arabic
    setupArabicFonts(pdf, language);

    // Add title page
    addTitlePage(pdf, metadata, language);

    // Add main content
    const pageHeight = pdf.internal.pageSize.getHeight();
    const pageWidth = pdf.internal.pageSize.getWidth();
    let heightLeft = imgHeight;
    let position = 0;

    // Add first page
    let pageNumber = 1;
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Add additional pages if needed
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      pageNumber++;
    }

    // Add page numbers in Arabic and English
    addPageNumbers(pdf, pageNumber, language);

    // Save PDF
    pdf.save(filename);
    console.log("[v0] PDF generated successfully:", filename);
  } catch (error) {
    console.error("[v0] PDF generation error:", error);
    throw error;
  }
}

function setupArabicFonts(pdf: jsPDF, language: Language) {
  // Add support for Arabic character rendering
  if (language === "ar") {
    // jsPDF doesn't natively support Arabic text positioning (RTL),
    // but html2canvas handles the HTML rendering which includes Arabic
    // This ensures proper encoding in the PDF
    pdf.setProperties({
      title: "تقرير التحليل",
      subject: "تحليل الموقع الإلكتروني",
      author: "Smart Land",
      keywords: "تحليل, موقع, تقرير",
      creator: "Smart Land Report Generator",
    });
  }
}

function addTitlePage(
  pdf: jsPDF,
  metadata: {
    title: string;
    description: string;
    url?: string;
    score?: number;
  } | undefined,
  language: Language
) {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // Add background
  pdf.setFillColor(41, 128, 185); // Professional blue
  pdf.rect(0, 0, pageWidth, pageHeight, "F");

  // Add white content area
  pdf.setFillColor(255, 255, 255);
  pdf.rect(20, 40, pageWidth - 40, pageHeight - 80, "F");

  // Set text color to dark
  pdf.setTextColor(50, 50, 50);

  // Title
  pdf.setFontSize(32);
  pdf.setFont("helvetica", "bold");
  const titleText = language === "ar" ? "تقرير التحليل الشامل" : "Comprehensive Analysis Report";
  pdf.text(titleText, pageWidth / 2, 70, { align: "center" });

  // Subtitle
  pdf.setFontSize(14);
  pdf.setFont("helvetica", "normal");
  const subtitleText =
    language === "ar" ? "تحليل الأداء والأمان والتحسين" : "Performance, Security & Optimization Analysis";
  pdf.text(subtitleText, pageWidth / 2, 90, { align: "center" });

  // Website info
  if (metadata?.url) {
    pdf.setFontSize(11);
    pdf.setTextColor(100, 100, 100);
    const urlLabel = language === "ar" ? "الموقع الإلكتروني:" : "Website:";
    pdf.text(urlLabel, 30, 120);
    pdf.text(metadata.url, 30, 130);
  }

  // Overall score
  if (metadata?.score !== undefined) {
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(41, 128, 185);
    const scoreLabel = language === "ar" ? "النقاط الإجمالية:" : "Overall Score:";
    pdf.text(scoreLabel, 30, 160);
    pdf.text(`${metadata.score}/100`, 120, 160);

    // Score bar
    const barWidth = 60;
    const barHeight = 8;
    const barX = 120;
    const barY = 165;

    pdf.setFillColor(230, 230, 230);
    pdf.rect(barX, barY, barWidth, barHeight, "F");

    const scorePercentage = Math.min(metadata.score / 100, 1);
    const fillColor = scorePercentage > 0.7 ? [46, 204, 113] : scorePercentage > 0.4 ? [241, 196, 15] : [231, 76, 60];
    pdf.setFillColor(...fillColor);
    pdf.rect(barX, barY, barWidth * scorePercentage, barHeight, "F");
  }

  // Footer
  pdf.setFontSize(10);
  pdf.setTextColor(150, 150, 150);
  const generatedText = language === "ar" ? "تم الإنشاء بواسطة Smart Land" : "Generated by Smart Land";
  pdf.text(generatedText, pageWidth / 2, pageHeight - 20, { align: "center" });
}

function addPageNumbers(pdf: jsPDF, totalPages: number, language: Language) {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(9);
    pdf.setTextColor(150, 150, 150);

    const pageText = language === "ar" ? `صفحة ${i} من ${totalPages}` : `Page ${i} of ${totalPages}`;
    pdf.text(pageText, pageWidth / 2, pageHeight - 10, { align: "center" });
  }
}

export async function generateSimplePDF(
  content: string,
  filename: string,
  language: Language
) {
  const pdf = new jsPDF();

  // Setup fonts
  setupArabicFonts(pdf, language);

  // Add content
  pdf.setFontSize(12);
  pdf.setTextColor(0, 0, 0);

  const lines = pdf.splitTextToSize(content, 180);
  pdf.text(lines, 15, 15);

  pdf.save(filename);
}

// Alternative: HTML2PDF approach for better Arabic support
export async function generateHTMLPDF(
  html: string,
  filename: string,
  language: Language
) {
  try {
    // Create temporary container
    const container = document.createElement("div");
    container.innerHTML = html;
    container.style.padding = "20px";
    container.style.backgroundColor = "white";
    container.style.color = "black";
    document.body.appendChild(container);

    // Render to canvas
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    });

    // Create PDF
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const imgData = canvas.toDataURL("image/png");
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
    pdf.save(filename);

    // Cleanup
    document.body.removeChild(container);
  } catch (error) {
    console.error("[v0] HTML PDF generation error:", error);
    throw error;
  }
}
