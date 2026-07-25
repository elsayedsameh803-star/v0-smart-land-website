"use client";

import { cn, getScoreColor, getScoreBgColor, getScoreRating } from "@/lib/utils";
import type { CategoryScores } from "@/lib/types";

interface ScoreBreakdownProps {
  overallScore: number;
  scores: CategoryScores;
  locale: string;
}

export function ScoreBreakdown({ overallScore, scores, locale }: ScoreBreakdownProps) {
  const isRtl = locale === "ar";
  const size = 128;
  const stroke = 4;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (overallScore / 100) * circumference;

  const categories = [
    { key: "seo" as const, icon: "🔍" },
    { key: "performance" as const, icon: "⚡" },
    { key: "accessibility" as const, icon: "♿" },
    { key: "security" as const, icon: "🔒" },
    { key: "content" as const, icon: "📝" },
    { key: "technical" as const, icon: "🛠️" },
  ];

  return (
    <div className="space-y-8">
      {/* Overall Score */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-32 h-32 relative mb-4">
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth={stroke}
              className="text-dark-700"
            />
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
              className={cn("transition-all duration-1000", "text-gold-500")}
            />
          </svg>
          <div className="text-center">
            <div className={cn("text-3xl font-bold text-gold-400")}>
              {overallScore}
            </div>
            <div className="text-xs text-dark-500 mt-0.5">
              {isRtl ? "من 100" : "/100"}
            </div>
          </div>
        </div>
        <h3 className="text-xl font-semibold text-white mb-1">
          {isRtl ? "النتيجة الإجمالية" : "Overall Score"}
        </h3>
        <p className={cn("text-lg font-medium text-gold-400")}>
          {getScoreRating(overallScore, locale)}
        </p>
      </div>

      {/* Category Scores */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map(({ key, icon }) => {
          const score = scores[key];
          return (
            <div
              key={key}
              className="p-5 rounded-xl bg-dark-800 border border-gold-500/10 hover:border-gold-500/30 hover:shadow-lg hover:shadow-gold-500/5 transition-all gold-glow-hover"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{icon}</span>
                  <span className="text-sm font-medium text-gold-300">
                    {isRtl ? score.labelAr : score.label}
                  </span>
                </div>
                <span className={cn("text-lg font-bold text-gold-400")}>
                  {score.score}
                </span>
              </div>
              <div className="w-full bg-dark-700 rounded-full h-2 overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all duration-500 bg-gradient-to-r from-gold-500 to-gold-600")}
                  style={{ width: `${score.score}%` }}
                />
              </div>
              <p className="text-xs text-dark-400 mt-2">
                {isRtl ? score.descriptionAr : score.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}