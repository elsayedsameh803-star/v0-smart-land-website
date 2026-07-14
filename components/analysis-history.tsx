"use client"

import { useEffect, useState } from "react"
import { X, Calendar, Globe, BarChart3, Trash2 } from "lucide-react"

interface AnalysisResult {
  score: number
  metrics: { label: string; value: string; status?: string }[]
  issues: { type: string; message: string }[]
  strengths?: string[]
  weaknesses?: string[]
  recommendations: string[]
  aiInsights: string
}

interface HistoryEntry {
  id: string
  url: string
  type: string
  language: "ar" | "en"
  date: string
  result: AnalysisResult
}

interface AnalysisHistoryProps {
  language: "ar" | "en"
  onSelect: (entry: HistoryEntry) => void
}

export default function AnalysisHistory({ language, onSelect }: AnalysisHistoryProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([])

  useEffect(() => {
    const stored = localStorage.getItem("smartland_analysis_history")
    if (stored) {
      try {
        setHistory(JSON.parse(stored))
      } catch { /* ignore */ }
    }
  }, [])

  const clearHistory = () => {
    localStorage.removeItem("smartland_analysis_history")
    setHistory([])
  }

  const deleteEntry = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const updated = history.filter(h => h.id !== id)
    setHistory(updated)
    localStorage.setItem("smartland_analysis_history", JSON.stringify(updated))
  }

  if (history.length === 0) {
    return (
      <div className="rounded-[1.5rem] border border-white/10 bg-slate-900/70 p-5 text-center">
        <p className="text-sm text-slate-400">
          {language === "ar" ? "لا يوجد تحليلات سابقة." : "No previous analyses found."}
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-slate-900/70 p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-amber-300">
          <BarChart3 className="h-4 w-4" />
          {language === "ar" ? "سجل التحليلات" : "Analysis History"}
        </h3>
        <button
          onClick={clearHistory}
          className="flex items-center gap-1 rounded-lg bg-rose-500/10 px-2.5 py-1 text-[10px] text-rose-400 hover:bg-rose-500/20 transition-colors"
        >
          <Trash2 className="h-3 w-3" />
          {language === "ar" ? "مسح الكل" : "Clear all"}
        </button>
      </div>

      <div className="space-y-3">
        {history.map((entry) => (
          <button
            key={entry.id}
            onClick={() => onSelect(entry)}
            className="group w-full rounded-xl border border-white/5 bg-slate-950/50 p-3 text-right transition-all hover:border-amber-400/20 hover:bg-slate-900/80"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Globe className="h-3.5 w-3.5 flex-shrink-0" />
                  <span className="truncate font-medium text-slate-300">{entry.url}</span>
                </div>
                <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-500">
                  <Calendar className="h-3 w-3" />
                  <span>{new Date(entry.date).toLocaleDateString(language === "ar" ? "ar-EG" : "en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}</span>
                  <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[9px] uppercase">{entry.type}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`text-lg font-bold ${entry.result.score >= 80 ? "text-emerald-400" : entry.result.score >= 50 ? "text-amber-400" : "text-rose-400"}`}>
                  {entry.result.score}%
                </span>
                <button
                  onClick={(e) => deleteEntry(entry.id, e)}
                  className="rounded-lg p-1 text-slate-600 opacity-0 group-hover:opacity-100 hover:text-rose-400 transition-all"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}