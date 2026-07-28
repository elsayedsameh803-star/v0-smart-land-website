"use client";

import { useState } from "react";
import { FileDown, Printer, CheckCircle2, Copy, FileJson, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AnalysisResult } from "@/lib/types";

interface PdfReportProps {
  result: AnalysisResult;
  locale: string;
}

export function PdfReport({ result, locale }: PdfReportProps) {
  const isRtl = locale === "ar";
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleDownloadPdf = async () => {
    setExporting(true);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      let yPos = 20;

      // === HEADER ===
      doc.setFontSize(22);
      // استخدام Helvetica للإنجليزية و Courier للعربية (لأن jsPDF لا يدعم العربية مباشرة)
      doc.setTextColor(234, 179, 8);
      const title = isRtl ? "تقرير سمارت لاند" : "Smart Land - Audit Report";
      doc.text(title, 105, yPos, { align: "center" });
      yPos += 10;

      // Divider line
      doc.setDrawColor(234, 179, 8);
      doc.setLineWidth(0.5);
      doc.line(20, yPos, 190, yPos);
      yPos += 8;

      // URL and Date
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      doc.text(isRtl ? `الرابط: ${result.url}` : `URL: ${result.url}`, 20, yPos);
      yPos += 6;
      const dateStr = new Date(result.date).toLocaleDateString(isRtl ? "ar-EG" : "en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      doc.text(isRtl ? `التاريخ: ${dateStr}` : `Date: ${dateStr}`, 20, yPos);
      yPos += 12;

      // === OVERALL SCORE ===
      doc.setFontSize(32);
      const scoreColor = result.overallScore >= 80 ? [34, 197, 94] : result.overallScore >= 60 ? [234, 179, 8] : [239, 68, 68];
      doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
      doc.text(`${result.overallScore}/100`, 105, yPos, { align: "center" });
      yPos += 8;
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(isRtl ? "النتيجة الإجمالية" : "Overall Score", 105, yPos, { align: "center" });
      yPos += 14;

      // === SCORE BREAKDOWN ===
      doc.setFontSize(14);
      doc.setTextColor(234, 179, 8);
      doc.text(isRtl ? "تفصيل النتائج" : "Score Breakdown", 20, yPos);
      yPos += 8;

      const categories = Object.entries(result.scores);
      for (const [key, score] of categories) {
        doc.setFontSize(10);
        doc.setTextColor(50, 50, 50);
        const label = isRtl ? score.labelAr : score.label;
        doc.text(`${label}: ${score.score}/100`, 20, yPos);

        // Progress bar background
        doc.setFillColor(230, 230, 230);
        doc.roundedRect(110, yPos - 3, 70, 5, 2, 2, "F");

        // Progress bar fill
        const barColor = score.score >= 80 ? [34, 197, 94] as const : score.score >= 60 ? [234, 179, 8] as const : [239, 68, 68] as const;
        doc.setFillColor(barColor[0], barColor[1], barColor[2]);
        const barWidth = Math.min(70, (score.score / 100) * 70);
        doc.roundedRect(110, yPos - 3, barWidth, 5, 2, 2, "F");

        yPos += 10;

        // New page if needed
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
      }

      yPos += 6;

      // === STRENGTHS ===
      if (result.strengths.length > 0) {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFontSize(14);
        doc.setTextColor(34, 197, 94);
        doc.text(isRtl ? "نقاط القوة" : "Strengths", 20, yPos);
        yPos += 8;

        doc.setFontSize(9);
        doc.setTextColor(80, 80, 80);
        for (const s of result.strengths.slice(0, 5)) {
          const lines = doc.splitTextToSize(`✓ ${s}`, 170);
          for (const line of lines) {
            if (yPos > 275) {
              doc.addPage();
              yPos = 20;
            }
            doc.text(line, 25, yPos);
            yPos += 5;
          }
          yPos += 2;
        }
        yPos += 4;
      }

      // === CRITICAL ISSUES ===
      if (result.criticalIssues.length > 0) {
        if (yPos > 240) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFontSize(14);
        doc.setTextColor(239, 68, 68);
        doc.text(isRtl ? "المشكلات الحرجة" : "Critical Issues", 20, yPos);
        yPos += 8;

        doc.setFontSize(9);
        doc.setTextColor(80, 80, 80);
        for (const issue of result.criticalIssues.slice(0, 5)) {
          const text = isRtl ? issue.issueAr : issue.issue;
          const lines = doc.splitTextToSize(`• ${text}`, 170);
          for (const line of lines) {
            if (yPos > 275) {
              doc.addPage();
              yPos = 20;
            }
            doc.text(line, 25, yPos);
            yPos += 5;
          }
          yPos += 2;
        }
        yPos += 4;
      }

      // === ALL FINDINGS ===
      if (result.findings.length > 0) {
        if (yPos > 240) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFontSize(14);
        doc.setTextColor(100, 100, 100);
        doc.text(isRtl ? "جميع النتائج" : "All Findings", 20, yPos);
        yPos += 8;

        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        for (const finding of result.findings.slice(0, 10)) {
          const text = isRtl ? finding.issueAr : finding.issue;
          const lines = doc.splitTextToSize(`• ${text}`, 170);
          for (const line of lines) {
            if (yPos > 275) {
              doc.addPage();
              yPos = 20;
            }
            doc.text(line, 25, yPos);
            yPos += 4;
          }
          yPos += 1;
        }
      }

      // === FOOTER ===
      if (yPos > 260) {
        doc.addPage();
        yPos = 20;
      }

      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.3);
      doc.line(20, 282, 190, 282);

      doc.setFontSize(7);
      doc.setTextColor(150, 150, 150);
      const footerText = isRtl
        ? "تم الإنشاء بواسطة سمارت لاند - منصة التدقيق الرقمي بالذكاء الاصطناعي"
        : "Generated by Smart Land - AI Digital Audit Platform";
      doc.text(footerText, 105, 288, { align: "center" });

      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(7);
        doc.setTextColor(180, 180, 180);
        doc.text(`${i} / ${pageCount}`, 185, 288, { align: "right" });
      }

      doc.save(`smart-land-audit-report-${Date.now()}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setExporting(false);
    }
  };

  const handleExportJson = () => {
    const exportData = {
      report: {
        title: isRtl ? "تقرير سمارت لاند" : "Smart Land Audit Report",
        url: result.url,
        date: result.date,
        overallScore: result.overallScore,
        locale: locale,
      },
      scores: Object.fromEntries(
        Object.entries(result.scores).map(([key, score]) => [
          key,
          {
            score: score.score,
            maxScore: score.maxScore,
            label: isRtl ? score.labelAr : score.label,
            description: isRtl ? score.descriptionAr : score.description,
          },
        ])
      ),
      strengths: result.strengths,
      weaknesses: result.weaknesses,
      criticalIssues: result.criticalIssues.map((issue) => ({
        issue: isRtl ? issue.issueAr : issue.issue,
        severity: issue.severity,
        howToFix: isRtl ? issue.howToFixAr : issue.howToFix,
        expectedBenefit: isRtl ? issue.expectedBenefitAr : issue.expectedBenefit,
      })),
      findings: result.findings.map((finding) => ({
        issue: isRtl ? finding.issueAr : finding.issue,
        severity: finding.severity,
        category: finding.category,
        evidence: isRtl ? finding.evidenceAr : finding.evidence,
        howToFix: isRtl ? finding.howToFixAr : finding.howToFix,
      })),
      metadata: {
        analyzedUrl: result.metadata.analyzedUrl,
        analysisDate: result.metadata.analysisDate,
        duration: result.metadata.duration,
        dataSources: result.metadata.dataSources,
        methodologyVersion: result.metadata.methodologyVersion,
      },
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `smart-land-report-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-wrap gap-3">
      <button
        onClick={handleDownloadPdf}
        disabled={exporting}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-400 text-dark-950 text-sm font-bold transition-all shadow-lg shadow-gold-500/25 disabled:opacity-50"
      >
        <FileDown className={`w-4 h-4 ${exporting ? "animate-bounce" : ""}`} />
        {exporting ? (isRtl ? "جاري التحميل..." : "Downloading...") : (isRtl ? "تحميل PDF" : "Download PDF")}
      </button>
      
      <button
        onClick={handleExportJson}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-sm font-bold transition-all shadow-lg shadow-emerald-500/25"
      >
        <FileJson className="w-4 h-4" />
        {isRtl ? "تصدير JSON" : "Export JSON"}
      </button>

      <button
        onClick={handlePrint}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-dark-800/80 border border-gold-500/20 hover:bg-dark-700 text-gold-300 text-sm font-medium transition-all"
      >
        <Printer className="w-4 h-4" />
        {isRtl ? "طباعة التقرير" : "Print Report"}
      </button>
      
      <button
        onClick={handleCopyLink}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-dark-800/80 border border-gold-500/20 hover:bg-dark-700 text-gold-300 text-sm font-medium transition-all"
      >
        {copied ? (
          <><CheckCircle2 className="w-4 h-4 text-gold-500" />{isRtl ? "تم النسخ!" : "Copied!"}</>
        ) : (
          <><Copy className="w-4 h-4" />{isRtl ? "نسخ الرابط" : "Copy Link"}</>
        )}
      </button>
    </div>
  );
}