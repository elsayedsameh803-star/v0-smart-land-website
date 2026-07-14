"use client"

import { AlertTriangle, CheckCircle2, HelpCircle } from "lucide-react"

interface CategoryScore {
  score: number
  max: number
  deductions: { reason: string; evidence: string; points: number }[]
}

interface ScoreBreakdownProps {
  categoryScores?: {
    seo: CategoryScore
    performance: CategoryScore
    accessibility: CategoryScore
    security: CategoryScore
    content: CategoryScore
    technical: CategoryScore
  }
  language: "ar" | "en"
}

const CATEGORY_LABELS: Record<string, { ar: string; en: string }> = {
  seo: { ar: "تحسين محركات البحث", en: "SEO" },
  performance: { ar: "الأداء", en: "Performance" },
  accessibility: { ar: "إمكانية الوصول", en: "Accessibility" },
  security: { ar: "الأمان", en: "Security" },
  content: { ar: "المحتوى والبنية", en: "Content & Structure" },
  technical: { ar: "الصحة التقنية", en: "Technical Health" },
}

function ScoreGauge({ score, max, label }: { score: number; max: number; label: string }) {
  const pct = Math.round((score / max) * 100)
  const color = pct >= 80 ? "#22c55e" : pct >= 50 ? "#f59e0b" : "#ef4444"
  const circumference = 2 * Math.PI * 36
  const offset = circumference - (pct / 100) * circumference

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="80" height="80" viewBox="0 0 80 80" className="-rotate-90">
        <circle cx="40" cy="40" r="36" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
        <circle
          cx="40"
          cy="40"
          r="36"
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
        <text
          x="40"
          y="40"
          textAnchor="middle"
          dominantBaseline="central"
          fill={color}
          fontSize="16"
          fontWeight="bold"
          className="rotate-90"
        >
          {pct}%
        </text>
      </svg>
      <span className="text-xs font-medium text-slate-300 text-center leading-tight">{label}</span>
    </div>
  )
}

export default function ScoreBreakdown({ categoryScores, language }: ScoreBreakdownProps) {
  if (!categoryScores) return null

  const categories = Object.entries(categoryScores) as [string, CategoryScore][]

  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-slate-900/70 p-4 sm:p-5">
      <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
        <HelpCircle className="h-4 w-4 text-amber-400" />
        {language === "ar" ? "تفصيل الدرجات" : "Score Breakdown"}
      </h3>

      {/* Score gauges */}
      <div className="mb-5 grid grid-cols-3 gap-4 sm:grid-cols-6">
        {categories.map(([key, data]) => (
          <ScoreGauge
            key={key}
            score={data.score}
            max={data.max}
            label={language === "ar" ? CATEGORY_LABELS[key]?.ar || key : CATEGORY_LABELS[key]?.en || key}
          />
        ))}
      </div>

      {/* Deductions */}
      <div className="space-y-3">
        {categories.map(([key, data]) => {
          if (!data.deductions?.length) return null
          return (
            <div key={key} className="rounded-xl bg-slate-950/80 p-3">
              <div className="mb-2 text-xs font-semibold text-amber-400">
                {language === "ar" ? CATEGORY_LABELS[key]?.ar || key : CATEGORY_LABELS[key]?.en || key}
              </div>
              {data.deductions.map((d, i) => (
                <div key={i} className="mb-1.5 flex items-start gap-2 text-xs">
                  {d.points > 10 ? (
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-rose-400" />
                  ) : (
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-amber-400" />
                  )}
                  <div className="flex-1">
                    <span className="text-slate-300">{d.reason}</span>
                    <span className="ml-2 text-rose-400">-{d.points}pts</span>
                    <div className="mt-0.5 text-[10px] text-slate-500 italic">{d.evidence}</div>
                  </div>
                </div>
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}