"use client";

import { cn, getScoreColor, getScoreBgColor, getScoreRating } from "@/lib/utils";
import type { CategoryScores } from "@/lib/types";
import { Sparkles, TrendingUp, Target, Search, Zap, Eye, Shield, FileText, Wrench } from "lucide-react";

interface ScoreBreakdownProps {
  overallScore: number;
  scores: CategoryScores;
  locale: string;
}

const categoryIcons: Record<string, React.ElementType> = {
  seo: Search,
  performance: Zap,
  accessibility: Eye,
  security: Shield,
  content: FileText,
  technical: Wrench,
};

export function ScoreBreakdown({ overallScore, scores, locale }: ScoreBreakdownProps) {
  const isRtl = locale === "ar";
  const size = 160;
  const stroke = 6;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (overallScore / 100) * circumference;

  const categories: Array<{ key: keyof CategoryScores }> = [
    { key: "seo" },
    { key: "performance" },
    { key: "accessibility" },
    { key: "security" },
    { key: "content" },
    { key: "technical" },
  ];

  const hasLiveData = categories.some(({ key }) => !scores[key]?.unavailable);
  const reasonsFor = (key: keyof CategoryScores): string[] => (isRtl ? scores[key]?.reasonsAr : scores[key]?.reasons) || [];

  const getScoreColorGradient = (score: number) => {
    if (score >= 80) return "from-emerald-500 to-emerald-400";
    if (score >= 60) return "from-gold-500 to-gold-400";
    if (score >= 40) return "from-orange-500 to-orange-400";
    return "from-red-500 to-red-400";
  };

  return (
    <div className="space-y-10">
      {/* Overall Score - Enhanced */}
      <div className="relative text-center p-8 md:p-10 rounded-2xl bg-dark-800/60 border border-gold-500/10 gold-glow">
        <div className="absolute inset-0 bg-gradient-to-b from-gold-500/5 via-transparent to-transparent rounded-2xl" />
        
        <div className="relative">
          <div className="inline-flex items-center justify-center w-40 h-40 relative mb-6">
            {/* Outer glow ring */}
            <div className="absolute inset-0 rounded-full bg-gold-500/10 blur-xl" />
            
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
              {/* Background circle */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth={stroke}
                className="text-dark-700"
              />
              {/* Progress circle */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth={stroke}
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                className="text-gold-500 transition-all duration-1000 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]"
                style={{ filter: "drop-shadow(0 0 8px rgba(234,179,8,0.5))" }}
              />
            </svg>
            
            {/* Center content */}
            <div className="relative text-center">
              <div className="text-4xl md:text-5xl font-bold text-gold-400 text-glow">
                {hasLiveData ? overallScore : "—"}
              </div>
              <div className="text-xs text-dark-500 mt-1">
                {isRtl ? "من 100" : "/100"}
              </div>
            </div>
          </div>

          <h3 className="text-2xl font-bold text-white mb-2">
            {isRtl ? "النتيجة الإجمالية" : "Overall Score"}
          </h3>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/20">
            <TrendingUp className="w-4 h-4 text-gold-400" />
            <span className="text-lg font-semibold text-gold-400">
              {hasLiveData ? getScoreRating(overallScore, locale) : (isRtl ? "بيانات غير متاحة" : "Data unavailable")}
            </span>
          </div>

          {!hasLiveData && (
            <p className="mt-3 text-xs text-dark-400 max-w-md mx-auto">
              {isRtl
                ? "لم تتوفر بيانات عامة حقيقية يمكن التحقق منها — لا تُخترع درجات. اجعل الحساب عاماً أو اربط واجهة API رسمية للحصول على تدقيق كامل."
                : "No live public data could be verified — no scores are invented. Make the account public or connect an official API for a full audit."}
            </p>
          )}
        </div>
      </div>

      {/* Category Scores - Enhanced */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map(({ key }) => {
          const score = scores[key];
          const gradientColor = getScoreColorGradient(score.score);
          const Icon = categoryIcons[key];
          return (
            <div
              key={key}
              className="group relative p-5 rounded-xl bg-dark-800/60 border border-gold-500/10 hover:border-gold-500/30 transition-all duration-300 gold-glow-hover card-hover-effect overflow-hidden"
            >
              {/* Hover gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-gold-500/0 via-gold-500/0 to-gold-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold-500/20 to-gold-600/20 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-gold-400" />
                    </div>
                    <span className="text-sm font-medium text-gold-300 group-hover:text-gold-200 transition-colors">
                      {isRtl ? score.labelAr : score.label}
                    </span>
                  </div>
                  {score.unavailable ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-dark-700 text-dark-300 text-[11px] font-medium border border-dark-600">
                      {isRtl ? "غير متاح" : "Unavailable"}
                    </span>
                  ) : (
                    <span className={cn("text-xl font-bold", `text-gold-400`)}>
                      {score.score}
                    </span>
                  )}
                </div>
                
                {/* Progress bar with gradient */}
                <div className="w-full bg-dark-700 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-700 bg-gradient-to-r",
                      score.unavailable ? "bg-dark-600" : gradientColor
                    )}
                    style={{ width: `${score.unavailable ? 0 : score.score}%` }}
                  />
                </div>
                
                <p className="text-xs text-dark-400 mt-2 leading-relaxed">
                  {score.unavailable
                    ? (isRtl ? "لا توجد بيانات عامة حقيقية يمكن التحقق منها لهذا القسم — لا تُخترع درجات." : "No live public data could be verified for this category — no score is invented.")
                    : (isRtl ? score.descriptionAr : score.description)}
                </p>

                {/* Score reasons / evidence */}
                {reasonsFor(key).length > 0 && (
                  <ul className="mt-3 space-y-1.5">
                    {reasonsFor(key).slice(0, 5).map((reason: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-1.5 text-[11px] text-dark-300 leading-snug">
                        <span className="text-gold-500 mt-0.5 shrink-0">•</span>
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}