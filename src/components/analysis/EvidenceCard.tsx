"use client";

import { cn } from "@/lib/utils";
import { AlertCircle, AlertTriangle, Info, ChevronDown, Wrench, ExternalLink, Lightbulb } from "lucide-react";
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

  const severityConfig: Record<string, { icon: React.ElementType; color: string; bg: string; badge: string; borderColor: string }> = {
    critical: { 
      icon: AlertCircle, color: "text-red-400", bg: "bg-red-500/5 border-red-500/20", badge: "bg-red-500/20 text-red-300", borderColor: "hover:border-red-500/40" 
    },
    high: { 
      icon: AlertTriangle, color: "text-orange-400", bg: "bg-orange-500/5 border-orange-500/20", badge: "bg-orange-500/20 text-orange-300", borderColor: "hover:border-orange-500/40" 
    },
    medium: { 
      icon: AlertCircle, color: "text-gold-400", bg: "bg-gold-500/5 border-gold-500/20", badge: "bg-gold-500/20 text-gold-300", borderColor: "hover:border-gold-500/40" 
    },
    low: { 
      icon: Info, color: "text-blue-400", bg: "bg-blue-500/5 border-blue-500/20", badge: "bg-blue-500/20 text-blue-300", borderColor: "hover:border-blue-500/40" 
    },
    info: { 
      icon: Info, color: "text-dark-400", bg: "bg-dark-800 border-dark-700", badge: "bg-dark-700 text-dark-300", borderColor: "hover:border-dark-600" 
    },
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
    <div className={cn("rounded-xl border transition-all duration-200 gold-glow-hover", config.bg, config.borderColor)}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-start gap-3 p-4 md:p-5 text-left group"
      >
        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", config.badge)}>
          <SeverityIcon className={cn("w-4 h-4", config.color)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className={cn("px-2 py-0.5 rounded text-xs font-medium", config.badge)}>
              {isRtl ? severityLabels[finding.severity] : finding.severity.charAt(0).toUpperCase() + finding.severity.slice(1)}
            </span>
          </div>
          <p className="text-sm font-medium text-white group-hover:text-gold-200 transition-colors">
            {isRtl ? finding.issueAr : finding.issue}
          </p>
        </div>
        <ChevronDown className={cn("w-5 h-5 text-dark-400 transition-transform shrink-0 mt-1 group-hover:text-gold-400", isExpanded && "rotate-180")} />
      </button>

      {isExpanded && (
        <div className="px-4 md:px-5 pb-5 space-y-5 animate-slide-down border-t border-gold-500/10">
          {/* Evidence */}
          <div className="pt-4">
            <h4 className="text-xs font-semibold text-gold-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Lightbulb className="w-3 h-3" />
              {isRtl ? "الدليل" : "Evidence"}
            </h4>
            <div className="p-3 rounded-lg bg-dark-900/50 border border-gold-500/10">
              <p className="text-sm text-dark-300">{isRtl ? finding.evidenceAr : finding.evidence}</p>
            </div>
          </div>

          {/* Location */}
          {finding.location && (
            <div>
              <h4 className="text-xs font-semibold text-gold-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <ExternalLink className="w-3 h-3" />
                {isRtl ? "الموقع" : "Location"}
              </h4>
              <code className="inline-block text-sm text-gold-400 bg-gold-500/10 px-3 py-1.5 rounded-lg border border-gold-500/20 break-all">
                {finding.location}
              </code>
            </div>
          )}

          {/* Why It Matters */}
          <div>
            <h4 className="text-xs font-semibold text-gold-400 uppercase tracking-wider mb-2">
              {isRtl ? "لماذا يهم" : "Why It Matters"}
            </h4>
            <p className="text-sm text-dark-300 leading-relaxed">{isRtl ? finding.whyItMattersAr : finding.whyItMatters}</p>
          </div>

          {/* How to Fix */}
          <div>
            <h4 className="text-xs font-semibold text-gold-400 uppercase tracking-wider mb-2">
              {isRtl ? "كيفية الإصلاح" : "How to Fix"}
            </h4>
            <p className="text-sm text-dark-300 leading-relaxed">{isRtl ? finding.howToFixAr : finding.howToFix}</p>
          </div>

          {/* Technical Example */}
          {finding.technicalExample && (
            <div>
              <h4 className="text-xs font-semibold text-gold-400 uppercase tracking-wider mb-2">
                {isRtl ? "مثال تقني" : "Technical Example"}
              </h4>
              <pre className="text-sm bg-dark-950 text-gold-200 p-4 rounded-xl overflow-x-auto border border-gold-500/10">
                <code>{finding.technicalExample}</code>
              </pre>
            </div>
          )}

          {/* Expected Benefit */}
          <div>
            <h4 className="text-xs font-semibold text-gold-400 uppercase tracking-wider mb-2">
              {isRtl ? "الفوائد المتوقعة" : "Expected Benefit"}
            </h4>
            <p className="text-sm text-gold-300 font-medium bg-gold-500/5 p-3 rounded-lg border border-gold-500/10">
              {isRtl ? finding.expectedBenefitAr : finding.expectedBenefit}
            </p>
          </div>

          {/* Help Fix Button */}
          {onHelpFix && (
            <button
              onClick={onHelpFix}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-gold-600 to-gold-500 text-dark-950 text-sm font-bold hover:from-gold-500 hover:to-gold-400 transition-all duration-200 shadow-lg shadow-gold-500/25 hover:shadow-gold-500/40 group"
            >
              <Wrench className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              {isRtl ? "ساعدني في الإصلاح" : "Help Me Fix This"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}