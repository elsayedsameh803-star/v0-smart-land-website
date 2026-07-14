"use client"

import { useState } from "react"
import { AlertTriangle, Bug, ChevronDown, ChevronUp, Lightbulb, Target, Wrench } from "lucide-react"

interface EvidenceCardData {
  issue: string
  severity: "critical" | "warning" | "info"
  evidence: string
  location: string
  whyItMatters: string
  howToFix: string
  technicalExample?: string
  expectedBenefit: string
  category: string
}

interface EvidenceCardProps {
  card: EvidenceCardData
  language: "ar" | "en"
  onFixHelp?: (issue: string, evidence: string) => void
}

const SEVERITY_CONFIG = {
  critical: {
    labelAr: "حرج",
    labelEn: "Critical",
    color: "border-rose-500/40 bg-rose-500/10",
    badgeColor: "bg-rose-500/20 text-rose-300",
    icon: AlertTriangle,
  },
  warning: {
    labelAr: "تحذير",
    labelEn: "Warning",
    color: "border-amber-500/40 bg-amber-500/10",
    badgeColor: "bg-amber-500/20 text-amber-300",
    icon: AlertTriangle,
  },
  info: {
    labelAr: "معلومة",
    labelEn: "Info",
    color: "border-sky-500/40 bg-sky-500/10",
    badgeColor: "bg-sky-500/20 text-sky-300",
    icon: Bug,
  },
}

const CATEGORY_LABELS: Record<string, { ar: string; en: string }> = {
  seo: { ar: "SEO", en: "SEO" },
  performance: { ar: "الأداء", en: "Performance" },
  accessibility: { ar: "إمكانية الوصول", en: "Accessibility" },
  security: { ar: "الأمان", en: "Security" },
  content: { ar: "المحتوى", en: "Content" },
  technical: { ar: "تقني", en: "Technical" },
}

export default function EvidenceCard({ card, language, onFixHelp }: EvidenceCardProps) {
  const [expanded, setExpanded] = useState(false)
  const sev = SEVERITY_CONFIG[card.severity]
  const SevIcon = sev.icon

  return (
    <div className={`rounded-[1.5rem] border ${sev.color} p-4 transition-all`}>
      {/* Header */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${sev.badgeColor}`}>
          <SevIcon className="h-3 w-3" />
          {language === "ar" ? sev.labelAr : sev.labelEn}
        </span>
        <span className="rounded-full bg-slate-700/60 px-2.5 py-0.5 text-[10px] font-medium text-slate-300">
          {language === "ar" ? CATEGORY_LABELS[card.category]?.ar || card.category : CATEGORY_LABELS[card.category]?.en || card.category}
        </span>
      </div>

      {/* Issue */}
      <p className="mb-2 text-sm font-medium text-white">{card.issue}</p>

      {/* Evidence */}
      <div className="mb-2 flex items-start gap-1.5 text-xs text-slate-400">
        <Target className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-amber-400" />
        <span>{card.evidence}</span>
      </div>

      {/* Location */}
      <div className="mb-2 flex items-start gap-1.5 text-xs text-slate-400">
        <Bug className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-sky-400" />
        <span>{card.location}</span>
      </div>

      {/* Expandable details */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="mb-2 flex items-center gap-1 text-xs font-medium text-amber-400 hover:text-amber-300 transition-colors"
      >
        {expanded ? (
          <>
            <ChevronUp className="h-3.5 w-3.5" />
            {language === "ar" ? "إخفاء التفاصيل" : "Hide details"}
          </>
        ) : (
          <>
            <ChevronDown className="h-3.5 w-3.5" />
            {language === "ar" ? "عرض التفاصيل" : "Show details"}
          </>
        )}
      </button>

      {expanded && (
        <div className="space-y-3 border-t border-white/10 pt-3">
          {/* Why it matters */}
          <div>
            <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-amber-300">
              <AlertTriangle className="h-3.5 w-3.5" />
              {language === "ar" ? "لماذا هذا مهم؟" : "Why it matters"}
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">{card.whyItMatters}</p>
          </div>

          {/* How to fix */}
          <div>
            <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-emerald-300">
              <Wrench className="h-3.5 w-3.5" />
              {language === "ar" ? "كيفية الإصلاح" : "How to fix"}
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">{card.howToFix}</p>
          </div>

          {/* Technical example */}
          {card.technicalExample && (
            <div>
              <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-sky-300">
                <Bug className="h-3.5 w-3.5" />
                {language === "ar" ? "مثال تقني" : "Technical example"}
              </div>
              <pre className="overflow-x-auto rounded-lg bg-slate-950 p-3 text-[10px] text-sky-200 font-mono leading-relaxed">
                {card.technicalExample}
              </pre>
            </div>
          )}

          {/* Expected benefit */}
          <div>
            <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-emerald-300">
              <Lightbulb className="h-3.5 w-3.5" />
              {language === "ar" ? "الفوائد المتوقعة" : "Expected benefit"}
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">{card.expectedBenefit}</p>
          </div>

          {/* Fix help button */}
          {onFixHelp && (
            <button
              onClick={() => onFixHelp(card.issue, card.evidence)}
              className="mt-2 inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-400/20 to-orange-500/20 px-3 py-2 text-xs font-medium text-amber-300 border border-amber-400/20 hover:from-amber-400/30 hover:to-orange-500/30 transition-all"
            >
              <Lightbulb className="h-3.5 w-3.5" />
              {language === "ar" ? "ساعدني في الإصلاح" : "Help me fix this"}
            </button>
          )}
        </div>
      )}
    </div>
  )
}