"use client";

import { useState } from "react";
import { BarChart3, AlertTriangle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AnalysisResult } from "@/lib/types";

interface CompetitorComparisonProps {
  primaryResult: AnalysisResult;
  locale: string;
}

export function CompetitorComparison({ primaryResult, locale }: CompetitorComparisonProps) {
  const isRtl = locale === "ar";
  const [competitorUrl, setCompetitorUrl] = useState("");
  const [isComparing, setIsComparing] = useState(false);
  const [competitorResult, setCompetitorResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCompare = async () => {
    if (!competitorUrl.trim()) return;
    setIsComparing(true);
    setError(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      const { analyzeUrl } = await import("@/lib/analysis-engine");
      const result = await analyzeUrl(competitorUrl);
      setCompetitorResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Comparison failed");
    } finally {
      setIsComparing(false);
    }
  };

  const categories = [
    { key: "seo" as const, label: "SEO", labelAr: "تحسين محركات البحث" },
    { key: "performance" as const, label: "Performance", labelAr: "الأداء" },
    { key: "accessibility" as const, label: "Accessibility", labelAr: "إمكانية الوصول" },
    { key: "security" as const, label: "Security", labelAr: "الأمان" },
    { key: "content" as const, label: "Content", labelAr: "المحتوى" },
    { key: "technical" as const, label: "Technical", labelAr: "التقني" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-white mb-2">
          {isRtl ? "مقارنة المنافسين" : "Competitor Comparison"}
        </h3>
        <p className="text-sm text-surface-400">
          {isRtl ? "قارن موقعك مع رابط عام آخر" : "Compare your site with another public URL"}
        </p>
      </div>
      <div className="flex gap-3">
        <input
          type="text"
          value={competitorUrl}
          onChange={(e) => setCompetitorUrl(e.target.value)}
          placeholder={isRtl ? "أدخل رابط المنافس" : "Enter competitor URL"}
          className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-surface-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50"
          dir={isRtl ? "rtl" : "ltr"}
        />
        <button
          onClick={handleCompare}
          disabled={isComparing || !competitorUrl.trim()}
          className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
        >
          {isComparing ? (
            <><Loader2 className="w-4 h-4 animate-spin" />{isRtl ? "جارٍ المقارنة..." : "Comparing..."}</>
          ) : (
            <><BarChart3 className="w-4 h-4" />{isRtl ? "قارن" : "Compare"}</>
          )}
        </button>
      </div>
      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}
      {competitorResult && (
        <div className="space-y-4">
          <div className="grid gap-3">
            {categories.map(({ key, label, labelAr }) => {
              const primary = primaryResult.scores[key].score;
              const competitor = competitorResult.scores[key].score;
              const diff = primary - competitor;
              const maxVal = Math.max(primary, competitor, 1);
              return (
                <div key={key} className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white">{isRtl ? labelAr : label}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-primary-400">{isRtl ? "موقعك" : "You"}: {primary}</span>
                      <span className="text-sm text-surface-400">vs</span>
                      <span className="text-sm text-accent-400">{isRtl ? "المنافس" : "Competitor"}: {competitor}</span>
                      {diff !== 0 && (
                        <span className={cn("text-xs font-medium", diff > 0 ? "text-accent-500" : "text-red-500")}>
                          {diff > 0 ? "+" : ""}{diff}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="relative h-6 bg-surface-800 rounded-full overflow-hidden">
                    <div className="absolute top-0 left-0 h-full bg-primary-500/50 rounded-full transition-all" style={{ width: `${(primary / maxVal) * 100}%` }} />
                    <div className="absolute top-0 h-full bg-accent-500/50 rounded-full transition-all" style={{ width: `${(competitor / maxVal) * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/20">
            <h4 className="text-sm font-semibold text-yellow-300 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              {isRtl ? "حدود المقارنة" : "Comparison Limitations"}
            </h4>
            <ul className="space-y-1">
              {[
                isRtl ? "تتم مقارنة الإشارات العامة القابلة للقياس فقط" : "Only publicly measurable signals are compared",
                isRtl ? "تعكس النتائج البيانات المتاحة وقت التحليل" : "Results reflect available data at the time of analysis",
                isRtl ? "المقاييس الداخلية والبيانات الخاصة غير مشمولة" : "Internal metrics and private data are not included",
              ].map((limitation, i) => (
                <li key={i} className="text-xs text-yellow-400 flex items-start gap-2"><span>•</span>{limitation}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}