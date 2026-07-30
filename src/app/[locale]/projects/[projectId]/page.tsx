"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Globe, TrendingUp, TrendingDown, Minus, ArrowLeft, Clock,
  BarChart3, AlertTriangle, CheckCircle2, Sparkles, RefreshCw,
  Share2, Trash2, LineChart
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getProject, getProjectAnalyses, deleteProject } from "@/lib/storage";
import type { Project, ProjectAnalysis } from "@/lib/saas-types";

const translations: Record<string, Record<string, string>> = {
  en: {
    notFound: "Project not found",
    backToProjects: "Back to Projects",
    analyzeAgain: "Analyze Again",
    deleteProject: "Delete Project",
    deleteConfirm: "Are you sure? This will delete all analyses for this project.",
    analyses: "Analyses",
    allTime: "All Time",
    latestScore: "Latest Score",
    averageScore: "Average Score",
    bestScore: "Best Score",
    totalAnalyses: "Total Analyses",
    findings: "findings",
    critical: "critical",
    strengths: "strengths",
    weaknesses: "weaknesses",
    change: "Change",
    date: "Date",
    score: "Score",
    noData: "No analysis data available",
    scoreHistory: "Score History Over Time",
    comparison: "Latest vs Previous Comparison",
    improved: "Improved",
    declined: "Declined",
    unchanged: "Unchanged",
    points: "points",
    whatImproved: "What Improved",
    whatDeclined: "What Declined",
    noPreviousData: "No previous data to compare",
  },
  ar: {
    notFound: "المشروع غير موجود",
    backToProjects: "العودة للمشاريع",
    analyzeAgain: "إعادة التحليل",
    deleteProject: "حذف المشروع",
    deleteConfirm: "هل أنت متأكد؟ سيتم حذف جميع تحليلات هذا المشروع.",
    analyses: "التحليلات",
    allTime: "كل الوقت",
    latestScore: "آخر نتيجة",
    averageScore: "متوسط النتيجة",
    bestScore: "أفضل نتيجة",
    totalAnalyses: "إجمالي التحليلات",
    findings: "نتيجة",
    critical: "حرج",
    strengths: "نقاط القوة",
    weaknesses: "نقاط الضعف",
    change: "التغيير",
    date: "التاريخ",
    score: "النتيجة",
    noData: "لا توجد بيانات تحليل متاحة",
    scoreHistory: "تاريخ النتائج عبر الزمن",
    comparison: "مقارنة آخر تحليل بالسابق",
    improved: "تحسن",
    declined: "انخفض",
    unchanged: "لم يتغير",
    points: "نقطة",
    whatImproved: "ما تحسن",
    whatDeclined: "ما تراجع",
    noPreviousData: "لا توجد بيانات سابقة للمقارنة",
  },
};

export default function ProjectDetailPage({
  params,
}: {
  params: { locale: string; projectId: string };
}) {
  const locale = params.locale;
  const projectId = params.projectId;
  const isRtl = locale === "ar";
  const t = translations[locale] || translations.en;
  const router = useRouter();

  const [project, setProject] = useState<Project | null>(null);
  const [analyses, setAnalyses] = useState<ProjectAnalysis[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const p = getProject(projectId);
    setProject(p);
    if (p) {
      setAnalyses(getProjectAnalyses(projectId));
    }
  }, [projectId]);

  if (!project) {
    return (
      <div className="min-h-screen bg-dark-950 pt-24 flex items-center justify-center">
        <div className="text-center">
          <Globe className="w-12 h-12 text-dark-500 mx-auto mb-4" />
          <p className="text-dark-400">{t.notFound}</p>
          <Link
            href={`/${locale}/projects`}
            className="inline-flex items-center gap-2 mt-4 text-gold-400 hover:text-gold-300 transition-colors"
          >
            <ArrowLeft className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
            {t.backToProjects}
          </Link>
        </div>
      </div>
    );
  }

  const latestAnalysis = analyses[0] || null;
  const previousAnalysis = analyses[1] || null;
  const bestScore = analyses.length > 0 ? Math.max(...analyses.map(a => a.overallScore)) : 0;
  const avgScore = analyses.length > 0
    ? Math.round(analyses.reduce((a, b) => a + b.overallScore, 0) / analyses.length)
    : 0;

  const handleDelete = () => {
    deleteProject(projectId);
    router.push(`/${locale}/projects`);
  };

  // Score history for chart
  const scoreHistory = analyses.slice().reverse();

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Header */}
      <div className="pt-24 pb-8 px-4 sm:px-6 lg:px-8 border-b border-gold-500/10">
        <div className="max-w-7xl mx-auto">
          <Link
            href={`/${locale}/projects`}
            className="inline-flex items-center gap-2 text-sm text-dark-400 hover:text-gold-400 transition-colors mb-4"
          >
            <ArrowLeft className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
            {t.backToProjects}
          </Link>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gold-500/20 to-gold-600/20 flex items-center justify-center">
                <Globe className="w-7 h-7 text-gold-400" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">{project.name}</h1>
                <p className="text-sm text-dark-400">{project.url}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push(`/${locale}?url=${encodeURIComponent(project.url)}`)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-gold-600 to-gold-500 text-dark-950 font-bold hover:from-gold-500 hover:to-gold-400 transition-all shadow-lg shadow-gold-500/25"
              >
                <RefreshCw className="w-4 h-4" />
                {t.analyzeAgain}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors border border-red-500/20"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-dark-800/60 border border-gold-500/10">
            <p className="text-xs text-dark-400 mb-1">{t.latestScore}</p>
            <p className={cn(
              "text-2xl font-bold",
              (latestAnalysis?.overallScore || 0) >= 80 ? "text-emerald-400" :
              (latestAnalysis?.overallScore || 0) >= 60 ? "text-gold-400" : "text-red-400"
            )}>
              {latestAnalysis?.overallScore || "-"}
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-dark-800/60 border border-gold-500/10">
            <p className="text-xs text-dark-400 mb-1">{t.averageScore}</p>
            <p className="text-2xl font-bold text-white">{avgScore}</p>
          </div>
          <div className="p-5 rounded-2xl bg-dark-800/60 border border-gold-500/10">
            <p className="text-xs text-dark-400 mb-1">{t.bestScore}</p>
            <p className="text-2xl font-bold text-emerald-400">{bestScore}</p>
          </div>
          <div className="p-5 rounded-2xl bg-dark-800/60 border border-gold-500/10">
            <p className="text-xs text-dark-400 mb-1">{t.totalAnalyses}</p>
            <p className="text-2xl font-bold text-white">{analyses.length}</p>
          </div>
        </div>

        {/* Comparison with previous analysis */}
        {latestAnalysis && previousAnalysis && (
          <div className="p-6 rounded-2xl bg-dark-800/60 border border-gold-500/10">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-gold-400" />
              {t.comparison}
            </h3>
            
            <div className="flex items-center gap-6 mb-6">
              <div className="text-center">
                <p className="text-xs text-dark-400 mb-1">Previous</p>
                <p className="text-xl font-bold text-dark-300">{previousAnalysis.overallScore}</p>
              </div>
              <div className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold",
                (latestAnalysis.overallScore - previousAnalysis.overallScore) > 0
                  ? "bg-emerald-500/10 text-emerald-400"
                  : (latestAnalysis.overallScore - previousAnalysis.overallScore) < 0
                  ? "bg-red-500/10 text-red-400"
                  : "bg-dark-700 text-dark-300"
              )}>
                {latestAnalysis.overallScore - previousAnalysis.overallScore > 0 ? (
                  <TrendingUp className="w-4 h-4" />
                ) : latestAnalysis.overallScore - previousAnalysis.overallScore < 0 ? (
                  <TrendingDown className="w-4 h-4" />
                ) : (
                  <Minus className="w-4 h-4" />
                )}
                {latestAnalysis.overallScore - previousAnalysis.overallScore > 0 ? "+" : ""}
                {latestAnalysis.overallScore - previousAnalysis.overallScore} {t.points}
              </div>
              <div className="text-center">
                <p className="text-xs text-dark-400 mb-1">Latest</p>
                <p className="text-xl font-bold text-gold-400">{latestAnalysis.overallScore}</p>
              </div>
            </div>

            {/* Category comparison */}
            <div className="space-y-3">
              {Object.entries(latestAnalysis.scores).map(([key, score]) => {
                const prevScore = (previousAnalysis.scores as Record<string, number>)[key] || 0;
                const diff = score - prevScore;
                return (
                  <div key={key} className="flex items-center gap-3">
                    <span className="text-xs text-dark-400 w-28 capitalize">{key}</span>
                    <div className="flex-1 h-2 bg-dark-700 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-gold-600 to-gold-500 rounded-full transition-all" style={{ width: `${Math.max(score, prevScore)}%` }} />
                    </div>
                    <span className={cn(
                      "text-xs font-bold w-16 text-right",
                      diff > 0 ? "text-emerald-400" : diff < 0 ? "text-red-400" : "text-dark-400"
                    )}>
                      {diff > 0 ? "+" : ""}{diff}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Score History */}
        {scoreHistory.length > 0 && (
          <div>
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <LineChart className="w-5 h-5 text-gold-400" />
              {t.scoreHistory}
            </h3>
            <div className="space-y-2">
              {scoreHistory.map((analysis, index) => {
                const date = new Date(analysis.date);
                const dateStr = date.toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                });
                return (
                  <div
                    key={analysis.id}
                    className="flex items-center gap-4 p-4 rounded-xl bg-dark-800/60 border border-gold-500/10 hover:border-gold-500/30 transition-all group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-dark-700 flex items-center justify-center">
                      <BarChart3 className="w-4 h-4 text-gold-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-dark-300">{dateStr}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <div className="flex-1 h-1.5 bg-dark-700 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all",
                              analysis.overallScore >= 80 ? "bg-emerald-500" :
                              analysis.overallScore >= 60 ? "bg-gold-500" : "bg-red-500"
                            )}
                            style={{ width: `${analysis.overallScore}%` }}
                          />
                        </div>
                        <span className={cn(
                          "text-sm font-bold",
                          analysis.overallScore >= 80 ? "text-emerald-400" :
                          analysis.overallScore >= 60 ? "text-gold-400" : "text-red-400"
                        )}>
                          {analysis.overallScore}
                        </span>
                      </div>
                    </div>
                    {analysis.change !== null && (
                      <span className={cn(
                        "text-xs font-medium flex items-center gap-1",
                        analysis.change > 0 ? "text-emerald-400" :
                        analysis.change < 0 ? "text-red-400" : "text-dark-400"
                      )}>
                        {analysis.change > 0 ? <TrendingUp className="w-3 h-3" /> :
                         analysis.change < 0 ? <TrendingDown className="w-3 h-3" /> :
                         <Minus className="w-3 h-3" />}
                        {analysis.change > 0 ? "+" : ""}{analysis.change}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Findings Summary */}
        {latestAnalysis && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-dark-800/60 border border-gold-500/10">
              <p className="text-xs text-dark-400 mb-2">{t.findings}</p>
              <p className="text-xl font-bold text-white">{latestAnalysis.findingsCount}</p>
            </div>
            <div className="p-5 rounded-2xl bg-dark-800/60 border border-gold-500/10">
              <p className="text-xs text-dark-400 mb-2">{t.strengths}</p>
              <p className="text-xl font-bold text-emerald-400">{latestAnalysis.strengthsCount}</p>
            </div>
            <div className="p-5 rounded-2xl bg-dark-800/60 border border-gold-500/10">
              <p className="text-xs text-dark-400 mb-2">{t.weaknesses}</p>
              <p className="text-xl font-bold text-red-400">{latestAnalysis.weaknessesCount}</p>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-2xl bg-dark-900 border border-gold-500/10 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">{t.deleteProject}</h3>
            <p className="text-sm text-dark-400 mb-6">{t.deleteConfirm}</p>
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-colors"
              >
                {t.deleteProject}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-dark-700 text-dark-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}