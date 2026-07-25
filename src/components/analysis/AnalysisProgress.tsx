"use client";

import { CheckCircle2, Loader2, AlertCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AnalysisStage } from "@/lib/types";

interface AnalysisProgressProps {
  stages: AnalysisStage[];
  url: string;
  error: string | null;
  locale: string;
}

export function AnalysisProgress({ stages, url, error, locale }: AnalysisProgressProps) {
  const isRtl = locale === "ar";
  const completedStages = stages.filter(s => s.status === "completed").length;
  const totalStages = stages.length;
  const progress = totalStages > 0 ? Math.round((completedStages / totalStages) * 100) : 0;

  const getStageIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle2 className="w-5 h-5 text-gold-500" />;
      case "processing": return <Loader2 className="w-5 h-5 text-gold-400 animate-spin" />;
      case "error": return <AlertCircle className="w-5 h-5 text-red-500" />;
      default: return <Clock className="w-5 h-5 text-dark-500" />;
    }
  };

  const getStageColor = (status: string) => {
    switch (status) {
      case "completed": return "border-gold-500/30 bg-gold-500/5";
      case "processing": return "border-gold-500/30 bg-gold-500/10";
      case "error": return "border-red-500/30 bg-red-500/10";
      default: return "border-dark-700 bg-dark-800/50";
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">
          {isRtl ? "التحليل في الوقت الفعلي" : "Real-Time Analysis"}
        </h2>
        <p className="text-sm text-dark-400">
          {url}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-dark-700 rounded-full h-3 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-gold-500 to-gold-600 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-center text-sm text-dark-400">
        {isRtl ? `${completedStages} من ${totalStages} اكتمل` : `${completedStages} of ${totalStages} complete`}
      </p>

      {/* Error State */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-300">
              {isRtl ? "فشل التحليل" : "Analysis Failed"}
            </p>
            <p className="text-sm text-red-400 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Stages */}
      <div className="space-y-3">
        {stages.map((stage) => (
          <div
            key={stage.id}
            className={cn(
              "flex items-center gap-4 p-4 rounded-xl border transition-all duration-300",
              getStageColor(stage.status)
            )}
          >
            {getStageIcon(stage.status)}
            <div className="flex-1 min-w-0">
              <p className={cn(
                "text-sm font-medium",
                stage.status === "completed" ? "text-gold-300" :
                stage.status === "processing" ? "text-gold-400" :
                stage.status === "error" ? "text-red-400" :
                "text-dark-500"
              )}>
                {isRtl ? stage.labelAr : stage.label}
              </p>
              {stage.duration && (
                <p className="text-xs text-dark-500 mt-0.5">
                  {stage.duration}s
                </p>
              )}
            </div>
            {stage.status === "processing" && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gold-500 animate-pulse" />
                <span className="text-xs text-gold-400 font-medium">
                  {isRtl ? "جارٍ..." : "Processing..."}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}