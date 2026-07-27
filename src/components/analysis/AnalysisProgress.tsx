"use client";

import { cn } from "@/lib/utils";
import { Check, Loader2, AlertCircle, Sparkles, Globe, Search, Zap, Shield, Eye, FileText, Gauge } from "lucide-react";
import type { AnalysisStage } from "@/lib/types";

interface AnalysisProgressProps {
  stages: AnalysisStage[];
  url: string;
  error: string | null;
  locale: string;
}

const stageIcons: Record<string, React.ElementType> = {
  validating: Search,
  connecting: Globe,
  collecting: Gauge,
  seo: Search,
  technical: Zap,
  performance: Gauge,
  accessibility: Eye,
  recommendations: FileText,
  preparing: Sparkles,
};

export function AnalysisProgress({ stages, url, error, locale }: AnalysisProgressProps) {
  const isRtl = locale === "ar";
  const completedStages = stages.filter(s => s.status === "completed").length;
  const progress = stages.length > 0 ? (completedStages / stages.length) * 100 : 0;

  return (
    <div className="relative">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/20 mb-6">
          <Sparkles className="w-3.5 h-3.5 text-gold-400" />
          <span className="text-xs text-gold-400 font-medium uppercase tracking-wider">
            {isRtl ? "جاري التحليل" : "ANALYZING"}
          </span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
          {isRtl ? "تحليل الرابط" : "Analyzing URL"}
        </h2>
        <p className="text-sm text-dark-400 flex items-center justify-center gap-2">
          <Globe className="w-4 h-4" />
          {url}
        </p>
      </div>

      {/* Overall Progress */}
      <div className="mb-10 p-6 rounded-2xl bg-dark-800/60 border border-gold-500/10">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-dark-400">
            {isRtl ? "التقدم العام" : "Overall Progress"}
          </span>
          <span className="text-sm font-bold text-gold-400">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-dark-700 rounded-full h-3 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-gold-600 via-gold-500 to-gold-400 transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-dark-500 mt-2">
          {isRtl 
            ? `تم إكمال ${completedStages} من ${stages.length} مراحل` 
            : `${completedStages} of ${stages.length} stages completed`}
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-300 mb-1">
              {isRtl ? "حدث خطأ" : "An error occurred"}
            </p>
            <p className="text-sm text-red-400">{error}</p>
          </div>
        </div>
      )}

      {/* Stages */}
      <div className="space-y-3">
        {stages.map((stage) => {
          const StageIcon = stageIcons[stage.id] || Sparkles;
          const isProcessing = stage.status === "processing";
          const isCompleted = stage.status === "completed";
          const isPending = stage.status === "pending";

          return (
            <div
              key={stage.id}
              className={cn(
                "flex items-center gap-4 p-4 rounded-xl border transition-all duration-300",
                isCompleted && "bg-gold-500/5 border-gold-500/20",
                isProcessing && "bg-dark-800/80 border-gold-500/30 gold-glow",
                isPending && "bg-dark-800/40 border-dark-700"
              )}
            >
              {/* Icon */}
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300",
                isCompleted && "bg-gradient-to-br from-gold-500 to-gold-600",
                isProcessing && "bg-dark-700 border border-gold-500/30",
                isPending && "bg-dark-700"
              )}>
                {isCompleted ? (
                  <Check className="w-5 h-5 text-dark-950" />
                ) : isProcessing ? (
                  <Loader2 className="w-5 h-5 text-gold-400 animate-spin" />
                ) : (
                  <StageIcon className="w-5 h-5 text-dark-500" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "text-sm font-medium transition-colors duration-300",
                  isCompleted && "text-gold-300",
                  isProcessing && "text-gold-400",
                  isPending && "text-dark-500"
                )}>
                  {isRtl ? stage.labelAr : stage.label}
                </p>
                {isProcessing && (
                  <p className="text-xs text-gold-500/70 mt-0.5">
                    {isRtl ? "جاري المعالجة..." : "Processing..."}
                  </p>
                )}
              </div>

              {/* Status indicator */}
              <div className="shrink-0">
                {isCompleted && (
                  <div className="w-6 h-6 rounded-full bg-gold-500/20 flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-gold-400" />
                  </div>
                )}
                {isProcessing && (
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-gold-500 animate-ping-slow" />
                    <span className="w-1.5 h-1.5 rounded-full bg-gold-500 animate-ping-slow" style={{ animationDelay: "0.3s" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-gold-500 animate-ping-slow" style={{ animationDelay: "0.6s" }} />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}