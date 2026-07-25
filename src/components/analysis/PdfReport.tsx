"use client";

import { useState } from "react";
import { FileDown, Share2, Printer, CheckCircle2, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AnalysisResult } from "@/lib/types";

interface PdfReportProps {
  result: AnalysisResult;
  locale: string;
}

export function PdfReport({ result, locale }: PdfReportProps) {
  const isRtl = locale === "ar";
  const [copied, setCopied] = useState(false);

  const handleDownload = async () => {
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF();
      
      doc.setFontSize(24);
      doc.text("Smart Land - Audit Report", 20, 30);
      
      doc.setFontSize(12);
      doc.text(`URL: ${result.url}`, 20, 50);
      doc.text(`Date: ${new Date(result.date).toLocaleDateString()}`, 20, 60);
      doc.text(`Overall Score: ${result.overallScore}/100`, 20, 70);
      
      doc.setFontSize(16);
      doc.text("Score Breakdown", 20, 90);
      
      let yPos = 100;
      const categories = Object.entries(result.scores);
      for (const [key, score] of categories) {
        doc.setFontSize(11);
        doc.text(`${score.label}: ${score.score}/100`, 20, yPos);
        yPos += 10;
      }

      doc.setFontSize(16);
      doc.text("Strengths", 20, yPos + 10);
      yPos += 20;
      result.strengths.slice(0, 3).forEach((s) => {
        doc.setFontSize(10);
        doc.text(`✓ ${s}`, 25, yPos);
        yPos += 7;
      });

      doc.setFontSize(16);
      doc.text("Action Items", 20, yPos + 10);
      yPos += 20;
      result.criticalIssues.slice(0, 3).forEach((issue) => {
        doc.setFontSize(10);
        const lines = doc.splitTextToSize(`• ${issue.issue}`, 170);
        doc.text(lines, 25, yPos);
        yPos += lines.length * 5 + 3;
      });

      doc.save(`smart-land-audit-${Date.now()}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-wrap gap-3">
      <button
        onClick={handleDownload}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-400 text-dark-950 text-sm font-bold transition-all shadow-lg shadow-gold-500/25"
      >
        <FileDown className="w-4 h-4" />
        {isRtl ? "تحميل PDF" : "Download PDF"}
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