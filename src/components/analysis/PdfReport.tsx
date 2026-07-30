"use client";

import { useState, useRef } from "react";
import { FileDown, Printer, CheckCircle2, Copy, FileJson } from "lucide-react";
import type { AnalysisResult } from "@/lib/types";

interface PdfReportProps {
  result: AnalysisResult;
  locale: string;
}

export function PdfReport({ result, locale }: PdfReportProps) {
  const isRtl = locale === "ar";
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const handleDownloadPdf = async () => {
    setExporting(true);
    try {
      const [{ jsPDF }, html2canvas] = await Promise.all([
        import("jspdf"),
        import("html2canvas"),
      ]);

      const container = document.createElement("div");
      container.style.position = "absolute";
      container.style.left = "-9999px";
      container.style.top = "0";
      container.style.width = "800px";
      container.style.padding = "40px";
      container.style.fontFamily = "Arial, sans-serif";
      container.style.direction = isRtl ? "rtl" : "ltr";
      container.style.textAlign = isRtl ? "right" : "left";
      container.style.background = "#ffffff";
      container.style.color = "#333333";
      container.style.fontSize = "14px";
      container.style.lineHeight = "1.6";
      document.body.appendChild(container);

      const scoreColor = result.overallScore >= 80 ? "#22c55e" : result.overallScore >= 60 ? "#eab308" : "#ef4444";
      const getBarColor = (score: number) => score >= 80 ? "#22c55e" : score >= 60 ? "#eab308" : "#ef4444";

      const dateStr = new Date(result.date).toLocaleDateString(isRtl ? "ar-EG" : "en-US", {
        year: "numeric", month: "long", day: "numeric",
      });

      let categoriesHtml = "";
      const categories = Object.entries(result.scores);
      for (const [, score] of categories) {
        const label = isRtl ? score.labelAr : score.label;
        const barColor = getBarColor(score.score);
        categoriesHtml += `
          <div style="margin-bottom:12px;">
            <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
              <span style="font-size:13px;color:#444;">${label}</span>
              <span style="font-size:13px;font-weight:bold;color:${barColor};">${score.score}/100</span>
            </div>
            <div style="background:#e5e7eb;border-radius:6px;height:10px;overflow:hidden;">
              <div style="background:${barColor};width:${Math.min(100, score.score)}%;height:10px;border-radius:6px;"></div>
            </div>
          </div>`;
      }

      let strengthsHtml = "";
      if (result.strengths.length > 0) {
        strengthsHtml = `
          <div style="margin-top:20px;">
            <h2 style="color:#22c55e;font-size:16px;font-weight:bold;margin-bottom:8px;">${isRtl ? "نقاط القوة" : "Strengths"}</h2>
            ${result.strengths.slice(0, 5).map((s) => `<div style="padding:4px 0;font-size:12px;color:#555;">✓ ${s}</div>`).join("")}
          </div>`;
      }

      let criticalIssuesHtml = "";
      if (result.criticalIssues.length > 0) {
        criticalIssuesHtml = `
          <div style="margin-top:20px;">
            <h2 style="color:#ef4444;font-size:16px;font-weight:bold;margin-bottom:8px;">${isRtl ? "المشكلات الحرجة" : "Critical Issues"}</h2>
            ${result.criticalIssues.slice(0, 5).map((issue) => `<div style="padding:4px 0;font-size:12px;color:#555;">• ${isRtl ? issue.issueAr : issue.issue}</div>`).join("")}
          </div>`;
      }

      let findingsHtml = "";
      if (result.findings.length > 0) {
        findingsHtml = `
          <div style="margin-top:20px;">
            <h2 style="color:#666;font-size:16px;font-weight:bold;margin-bottom:8px;">${isRtl ? "جميع النتائج" : "All Findings"}</h2>
            ${result.findings.slice(0, 10).map((f) => `<div style="padding:3px 0;font-size:11px;color:#777;">• ${isRtl ? f.issueAr : f.issue}</div>`).join("")}
          </div>`;
      }

      container.innerHTML = `
        <div style="text-align:center;margin-bottom:20px;">
          <h1 style="color:#eab308;font-size:24px;font-weight:bold;margin:0;">${isRtl ? "تقرير سمارت لاند لتحليل المواقع والسوشيال ميديا" : "Smart Land - Website & Social Media Analysis Report"}</h1>
          <hr style="border:none;border-top:2px solid #eab308;margin:12px 0;" />
          <div style="font-size:12px;color:#888;">
            <div>${isRtl ? "الرابط" : "URL"}: ${result.url}</div>
            <div>${isRtl ? "التاريخ" : "Date"}: ${dateStr}</div>
          </div>
        </div>
        <div style="text-align:center;margin:20px 0;">
          <div style="font-size:40px;font-weight:bold;color:${scoreColor};">${result.overallScore}/100</div>
          <div style="font-size:14px;color:#999;">${isRtl ? "النتيجة الإجمالية" : "Overall Score"}</div>
        </div>
        <div style="margin-top:20px;">
          <h2 style="color:#eab308;font-size:16px;font-weight:bold;margin-bottom:12px;">${isRtl ? "تفصيل النتائج" : "Score Breakdown"}</h2>
          ${categoriesHtml}
        </div>
        ${strengthsHtml}
        ${criticalIssuesHtml}
        ${findingsHtml}
        <div style="margin-top:30px;border-top:1px solid #ddd;padding-top:10px;text-align:center;font-size:10px;color:#aaa;">
          ${isRtl ? "تم الإنشاء بواسطة سمارت لاند لتحليل المواقع والسوشيال ميديا" : "Generated by Smart Land - Website & Social Media Analysis"}
        </div>
      `;

      await new Promise((resolve) => setTimeout(resolve, 500));

      const canvas = await html2canvas.default(container, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        width: 800,
        height: container.scrollHeight,
      });

      document.body.removeChild(container);

      const imgData = canvas.toDataURL("image/png");
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const pageHeight = 295;
      let heightLeft = imgHeight;
      let position = 0;

      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      doc.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        doc.addPage();
        doc.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

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
        title: isRtl ? "تقرير سمارت لاند لتحليل المواقع والسوشيال ميديا" : "Smart Land - Website & Social Media Analysis Report",
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