"use client";

import { Clock, TrendingUp, TrendingDown, Minus, BarChart3 } from "lucide-react";
import { cn, getScoreColor, formatDate } from "@/lib/utils";
import type { AnalysisHistory as HistoryType, AnalysisResult } from "@/lib/types";

interface AnalysisHistoryProps {
  history: HistoryType[];
  locale: string;
  onReAnalyze: () => void;
  currentResult: AnalysisResult;
}

export function AnalysisHistory({ history, locale, onReAnalyze, currentResult }: AnalysisHistoryProps) {
  const isRtl = locale === "ar";

  if (history.length === 0) {
    return (
      <div className="p-6 rounded-xl bg-white/5 border border-white/10 text-center">
        <Clock className="w-8 h-8 text-surface-400 mx-auto mb-2" />
        <p className="text-sm text-surface-400">
          {isRtl ? "لم يتم العثور على تحليلات سابقة" : "No previous analyses found"}
        </p>
      </div>
    );
  }

  const previousResult = history.length > 1 ? history[1] : null;
  const change = currentResult.overallScore - (previousResult?.overallScore ?? currentResult.overallScore);

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-white">
        {isRtl ? "سجل التحليلات" : "Analysis History"}
      </h3>

      {previousResult && (
        <div className={cn(
          "p-4 rounded-xl border flex items-center gap-3",
          change > 0 ? "bg-accent-500/10 border-accent-500/20" : 
          change < 0 ? "bg-red-500/10 border-red-500/20" : 
          "bg-surface-500/10 border-surface-500/20"
        )}>
          {change > 0 ? <TrendingUp className="w-5 h-5 text-accent-500" /> : 
           change < 0 ? <TrendingDown className="w-5 h-5 text-red-500" /> : 
           <Minus className="w-5 h-5 text-surface-400" />}
          <div>
            <p className="text-sm font-medium text-white">
              {isRtl ? "التغيير عن التحليل السابق" : "Change from previous analysis"}
            </p>
            <p className={cn("text-lg font-bold", getScoreColor(currentResult.overallScore))}>
              {change > 0 ? "+" : ""}{change} points
            </p>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {history.slice(0, 5).map((entry, index) => (
          <div
            key={entry.id}
            className={cn(
              "p-4 rounded-xl border transition-all",
              index === 0 ? "bg-primary-500/10 border-primary-500/30" : "bg-white/5 border-white/10"
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BarChart3 className={cn("w-4 h-4", index === 0 ? "text-primary-400" : "text-surface-400")} />
                <div>
                  <p className={cn("text-sm font-medium", index === 0 ? "text-primary-300" : "text-white")}>
                    {formatDate(entry.date, locale)}
                  </p>
                  <p className="text-xs text-surface-400">
                    {entry.findingsCount} {isRtl ? "نتيجة" : "findings"}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={cn("text-lg font-bold", getScoreColor(entry.overallScore))}>
                  {entry.overallScore}
                </p>
                {entry.change !== null && (
                  <p className={cn("text-xs", entry.change > 0 ? "text-accent-500" : entry.change < 0 ? "text-red-500" : "text-surface-400")}>
                    {entry.change > 0 ? "+" : ""}{entry.change}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={onReAnalyze}
        className="w-full py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-medium transition-colors text-sm"
      >
        {isRtl ? "إعادة التحليل" : "Re-Analyze"}
      </button>
    </div>
  );
}