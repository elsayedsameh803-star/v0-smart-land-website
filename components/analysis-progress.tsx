"use client"

import { useEffect, useState, useCallback } from "react"
import { CheckCircle2, Circle, Loader2 } from "lucide-react"

interface Stage {
  id: string
  labelAr: string
  labelEn: string
}

const STAGES: Stage[] = [
  { id: "validate", labelAr: "التحقق من الرابط", labelEn: "Validating URL" },
  { id: "connect", labelAr: "الاتصال بالهدف", labelEn: "Connecting to target" },
  { id: "collect", labelAr: "جمع البيانات المتاحة", labelEn: "Collecting available data" },
  { id: "seo", labelAr: "فحص إشارات SEO", labelEn: "Inspecting SEO signals" },
  { id: "technical", labelAr: "فحص البنية التقنية", labelEn: "Checking technical structure" },
  { id: "performance", labelAr: "تقييم إشارات الأداء", labelEn: "Evaluating performance signals" },
  { id: "accessibility", labelAr: "فحص إشارات الوصول", labelEn: "Checking accessibility signals" },
  { id: "analyze", labelAr: "كشف نقاط القوة والضعف", labelEn: "Detecting strengths and weaknesses" },
  { id: "recommend", labelAr: "توليد توصيات قائمة على الأدلة", labelEn: "Generating evidence-based recommendations" },
  { id: "report", labelAr: "تجهيز التقرير النهائي", labelEn: "Preparing the final report" },
]

interface AnalysisProgressProps {
  language: "ar" | "en"
  isActive: boolean
  onComplete: () => void
}

export default function AnalysisProgress({ language, isActive, onComplete }: AnalysisProgressProps) {
  const [currentStageIndex, setCurrentStageIndex] = useState(-1)
  const [completedStages, setCompletedStages] = useState<Set<string>>(new Set())

  const advanceStage = useCallback(() => {
    setCurrentStageIndex(prev => {
      const next = prev + 1
      if (next < STAGES.length) {
        // Mark previous as complete
        if (prev >= 0) {
          setCompletedStages(prevSet => new Set([...Array.from(prevSet), STAGES[prev].id]))
        }
        // Simulate variable timing per stage (200ms-800ms)
        const delay = 200 + Math.random() * 600
        setTimeout(advanceStage, delay)
        return next
      } else {
        // All done
        setCompletedStages(prevSet => new Set([...Array.from(prevSet), STAGES[STAGES.length - 1].id]))
        setTimeout(onComplete, 300)
        return prev
      }
    })
  }, [onComplete])

  useEffect(() => {
    if (isActive && currentStageIndex === -1) {
      setCurrentStageIndex(0)
      setTimeout(advanceStage, 400)
    }
    if (!isActive) {
      setCurrentStageIndex(-1)
      setCompletedStages(new Set())
    }
  }, [isActive, currentStageIndex, advanceStage])

  if (!isActive) return null

  return (
    <div className="rounded-[2rem] border border-amber-400/20 bg-slate-950/80 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl">
      <h3 className="mb-4 text-sm font-semibold text-amber-300">
        {language === "ar" ? "جاري التحليل..." : "Analyzing..."}
      </h3>
      <div className="space-y-3">
        {STAGES.map((stage, index) => {
          const isCurrent = index === currentStageIndex
          const isCompleted = completedStages.has(stage.id)
          return (
            <div
              key={stage.id}
              className={`flex items-center gap-3 rounded-xl px-4 py-2.5 transition-all duration-300 ${
                isCurrent
                  ? "bg-amber-400/10 border border-amber-400/30"
                  : isCompleted
                  ? "bg-emerald-500/5 border border-transparent"
                  : "bg-slate-900/50 border border-transparent opacity-40"
              }`}
            >
              {isCompleted ? (
                <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-emerald-400" />
              ) : isCurrent ? (
                <Loader2 className="h-5 w-5 flex-shrink-0 animate-spin text-amber-400" />
              ) : (
                <Circle className="h-5 w-5 flex-shrink-0 text-slate-600" />
              )}
              <span
                className={`text-sm ${
                  isCompleted
                    ? "text-emerald-300"
                    : isCurrent
                    ? "text-amber-200 font-medium"
                    : "text-slate-500"
                }`}
              >
                {language === "ar" ? stage.labelAr : stage.labelEn}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}