"use client";

import { cn, getScoreColor, getScoreBgColor, getScoreRating } from "@/lib/utils";
import type { CategoryScores } from "@/lib/types";
import { Sparkles, TrendingUp, Target } from "lucide-react";

interface ScoreBreakdownProps {
  overallScore: number;
  scores: CategoryScores;
  locale: string;
}

export function ScoreBreakdown({ overallScore, scores, locale }: ScoreBreakdownProps) {
  const isRtl = locale === "ar";
  const size = 160;
  const stroke = 6;
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
                {overallScore}
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
              {getScoreRating(overallScore, locale)}
            </span>
          </div>
        </div>
      </div>

      {/* Category Scores - Enhanced */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map(({ key, icon }) => {
          const score = scores[key];
          const gradientColor = getScoreColorGradient(score.score);
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
                    <span className="text-xl">{icon}</span>
                    <span className="text-sm font-medium text-gold-300 group-hover:text-gold-200 transition-colors">
                      {isRtl ? score.labelAr : score.label}
                    </span>
                  </div>
                  <span className={cn("text-xl font-bold", `text-gold-400`)}>
                    {score.score}
                  </span>
                </div>
                
                {/* Progress bar with gradient */}
                <div className="w-full bg-dark-700 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all duration-700 bg-gradient-to-r", gradientColor)}
                    style={{ width: `${score.score}%` }}
                  />
                </div>
                
                <p className="text-xs text-dark-400 mt-2 leading-relaxed">
                  {isRtl ? score.descriptionAr : score.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}