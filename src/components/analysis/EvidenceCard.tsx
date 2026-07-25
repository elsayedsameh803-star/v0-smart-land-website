"use client";

import { cn } from "@/lib/utils";
import { AlertCircle, AlertTriangle, Info, ChevronDown, Wrench } from "lucide-react";
import { useState } from "react";
import type { Finding } from "@/lib/types";

interface EvidenceCardProps {
  finding: Finding;
  locale: string;
  onHelpFix?: () => void;
}

export function EvidenceCard({ finding, locale, onHelpFix }: EvidenceCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isRtl = locale === "ar";

  const severityConfig: Record<string, { icon: React.ElementType; color: string; bg: string; badge: string }> = {
    critical: { icon: AlertCircle, color: "text-red-400", bg: "bg-red-500/10 border-red-500/20", badge: "bg-red-500/20 text-red-300" },
    high: { icon: AlertTriangle, color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20", badge: "bg-orange-500/20 text-orange-300" },
    medium: { icon: AlertCircle, color: "text-gold-400", bg: "bg-gold-500/10 border-gold-500/20", badge: "bg-gold-500/20 text-gold-300" },
    low: { icon: Info, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20", badge: "bg-blue-500/20 text-blue-300" },
    info: { icon: Info, color: "text-dark-400", bg: "bg-dark-800 border-dark-700", badge: "bg-dark-700 text-dark-300" },
  };

  const config = severityConfig[finding.severity];
  const SeverityIcon = config.icon;

  const severityLabels: Record<string, string> = {
    critical: "حرج",
    high: "عالٍ",
    medium: "متوسط",
    low: "منخفض",
    info: "معلومات",
  };

  return (
    <div className={cn("rounded-xl border transition-all duration-200", config.bg)}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-start gap-3 p-4 text-left"
      >
        <SeverityIcon className={cn("w-5 h-5 mt-0.5 shrink-0", config.color)} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={cn("px-2 py-0.5 rounded text-xs font-medium", config.badge)}>
              {isRtl ? severityLabels[finding.severity] : finding.severity.charAt(0).toUpperCase() + finding.severity.slice(1)}
            </span>
          </div>
          <p className="text-sm font-medium text-white">
            {isRtl ? finding.issueAr : finding.issue}
          </p>
        </div>
        <ChevronDown className={cn("w-5 h-5 text-dark-400 transition-transform shrink-0 mt-1", isExpanded && "rotate-180")} />
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-4 animate-slide-down">
          {/* Evidence */}
          <div>
            <h4 className="text-xs font-semibold text-gold-400 uppercase tracking-wider mb-1">
              {isRtl ? "الدليل" : "Evidence"}
            </h4>
            <p className="text-sm text-dark-300">{isRtl ? finding.evidenceAr : finding.evidence}</p>
          </div>

          {/* Location */}
          {finding.location && (
            <div>
              <h4 className="text-xs font-semibold text-gold-400 uppercase tracking-wider mb-1">
                {isRtl ? "الموقع" : "Location"}
              </h4>
              <code className="text-sm text-gold-400 bg-gold-500/10 px-2 py-1 rounded break-all">
                {finding.location}
              </code>
            </div>
          )}

          {/* Why It Matters */}
          <div>
            <h4 className="text-xs font-semibold text-gold-400 uppercase tracking-wider mb-1">
              {isRtl ? "لماذا يهم" : "Why It Matters"}
            </h4>
            <p className="text-sm text-dark-300">{isRtl ? finding.whyItMattersAr : finding.whyItMatters}</p>
          </div>

          {/* How to Fix */}
          <div>
            <h4 className="text-xs font-semibold text-gold-400 uppercase tracking-wider mb-1">
              {isRtl ? "كيفية الإصلاح" : "How to Fix"}
            </h4>
            <p className="text-sm text-dark-300">{isRtl ? finding.howToFixAr : finding.howToFix}</p>
          </div>

          {/* Technical Example */}
          {finding.technicalExample && (
            <div>
              <h4 className="text-xs font-semibold text-gold-400 uppercase tracking-wider mb-1">
                {isRtl ? "مثال تقني" : "Technical Example"}
              </h4>
              <pre className="text-sm bg-dark-950 text-gold-200 p-3 rounded-lg overflow-x-auto border border-gold-500/10">
                <code>{finding.technicalExample}</code>
              </pre>
            </div>
          )}

          {/* Expected Benefit */}
          <div>
            <h4 className="text-xs font-semibold text-gold-400 uppercase tracking-wider mb-1">
              {isRtl ? "الفوائد المتوقعة" : "Expected Benefit"}
            </h4>
            <p className="text-sm text-gold-300 font-medium">
              {isRtl ? finding.expectedBenefitAr : finding.expectedBenefit}
            </p>
          </div>

          {/* Help Fix Button */}
          {onHelpFix && (
            <button
              onClick={onHelpFix}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-gold-600 to-gold-500 text-dark-950 text-sm font-bold hover:from-gold-500 hover:to-gold-400 transition-all shadow-lg shadow-gold-500/25"
            >
              <Wrench className="w-4 h-4" />
              {isRtl ? "ساعدني في الإصلاح" : "Help Me Fix This"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}