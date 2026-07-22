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
    critical: { icon: AlertCircle, color: "text-red-500", bg: "bg-red-50 border-red-200", badge: "bg-red-100 text-red-700" },
    high: { icon: AlertTriangle, color: "text-orange-500", bg: "bg-orange-50 border-orange-200", badge: "bg-orange-100 text-orange-700" },
    medium: { icon: AlertCircle, color: "text-yellow-500", bg: "bg-yellow-50 border-yellow-200", badge: "bg-yellow-100 text-yellow-700" },
    low: { icon: Info, color: "text-blue-500", bg: "bg-blue-50 border-blue-200", badge: "bg-blue-100 text-blue-700" },
    info: { icon: Info, color: "text-surface-500", bg: "bg-surface-50 border-surface-200", badge: "bg-surface-100 text-surface-700" },
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
          <p className="text-sm font-medium text-surface-900">
            {isRtl ? finding.issueAr : finding.issue}
          </p>
        </div>
        <ChevronDown className={cn("w-5 h-5 text-surface-400 transition-transform shrink-0 mt-1", isExpanded && "rotate-180")} />
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-4 animate-slide-down">
          {/* Evidence */}
          <div>
            <h4 className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-1">
              {isRtl ? "الدليل" : "Evidence"}
            </h4>
            <p className="text-sm text-surface-700">{isRtl ? finding.evidenceAr : finding.evidence}</p>
          </div>

          {/* Location */}
          {finding.location && (
            <div>
              <h4 className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-1">
                {isRtl ? "الموقع" : "Location"}
              </h4>
              <code className="text-sm text-primary-600 bg-primary-50 px-2 py-1 rounded break-all">
                {finding.location}
              </code>
            </div>
          )}

          {/* Why It Matters */}
          <div>
            <h4 className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-1">
              {isRtl ? "لماذا يهم" : "Why It Matters"}
            </h4>
            <p className="text-sm text-surface-700">{isRtl ? finding.whyItMattersAr : finding.whyItMatters}</p>
          </div>

          {/* How to Fix */}
          <div>
            <h4 className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-1">
              {isRtl ? "كيفية الإصلاح" : "How to Fix"}
            </h4>
            <p className="text-sm text-surface-700">{isRtl ? finding.howToFixAr : finding.howToFix}</p>
          </div>

          {/* Technical Example */}
          {finding.technicalExample && (
            <div>
              <h4 className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-1">
                {isRtl ? "مثال تقني" : "Technical Example"}
              </h4>
              <pre className="text-sm bg-surface-900 text-surface-100 p-3 rounded-lg overflow-x-auto">
                <code>{finding.technicalExample}</code>
              </pre>
            </div>
          )}

          {/* Expected Benefit */}
          <div>
            <h4 className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-1">
              {isRtl ? "الفوائد المتوقعة" : "Expected Benefit"}
            </h4>
            <p className="text-sm text-accent-700 font-medium">
              {isRtl ? finding.expectedBenefitAr : finding.expectedBenefit}
            </p>
          </div>

          {/* Help Fix Button */}
          {onHelpFix && (
            <button
              onClick={onHelpFix}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors"
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