"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  LayoutDashboard, FolderKanban, TrendingUp, TrendingDown, Minus, 
  Globe, BarChart3, AlertTriangle, CheckCircle2, Clock, ArrowRight,
  Sparkles, Search, Zap, Eye, Shield, FileText, Wrench, Plus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getProjects, getDashboardMetrics, getProjectAnalyses } from "@/lib/storage";
import type { Project, DashboardMetrics, ProjectAnalysis } from "@/lib/saas-types";

const translations: Record<string, Record<string, string>> = {
  en: {
    title: "Dashboard",
    subtitle: "Your digital audit overview at a glance",
    totalProjects: "Total Projects",
    totalAnalyses: "Total Analyses",
    averageScore: "Average Smart Score",
    bestScore: "Best Score",
    improvementRate: "Improvement Rate",
    scoreTrend: "Score Trend",
    recentAnalyses: "Recent Analyses",
    topIssues: "Most Common Issues",
    scoreHistory: "Score History",
    platformDistribution: "Platform Distribution",
    viewAll: "View All",
    newAnalysis: "New Analysis",
    myProjects: "My Projects",
    noProjects: "No projects yet. Start by analyzing a website!",
    noAnalyses: "No analyses yet",
    up: "Up",
    down: "Down",
    stable: "Stable",
    points: "pts",
    findings: "findings",
    critical: "critical",
    viewProject: "View Project",
    analyzeAgain: "Analyze Again",
    lastAnalyzed: "Last analyzed",
    daysAgo: "days ago",
    justNow: "Just now",
  },
  ar: {
    title: "لوحة التحكم",
    subtitle: "نظرة عامة على تدقيقاتك الرقمية في لمحة",
    totalProjects: "إجمالي المشاريع",
    totalAnalyses: "إجمالي التحليلات",
    averageScore: "متوسط النتيجة",
    bestScore: "أفضل نتيجة",
    improvementRate: "معدل التحسن",
    scoreTrend: "اتجاه النتيجة",
    recentAnalyses: "آخر التحليلات",
    topIssues: "أكثر المشكلات شيوعاً",
    scoreHistory: "تاريخ النتائج",
    platformDistribution: "توزيع المنصات",
    viewAll: "عرض الكل",
    newAnalysis: "تحليل جديد",
    myProjects: "مشاريعي",
    noProjects: "لا توجد مشاريع بعد. ابدأ بتحليل موقع!",
    noAnalyses: "لا توجد تحليلات بعد",
    up: "ارتفاع",
    down: "انخفاض",
    stable: "مستقر",
    points: "نقطة",
    findings: "نتيجة",
    critical: "حرج",
    viewProject: "عرض المشروع",
    analyzeAgain: "إعادة التحليل",
    lastAnalyzed: "آخر تحليل",
    daysAgo: "يوم مضى",
    justNow: "الآن",
  },
};

export default function DashboardPage({ params }: { params: { locale: string } }) {
  const locale = params.locale;
  const isRtl = locale === "ar";
  const t = translations[locale] || translations.en;
  const router = useRouter();
  const pathname = usePathname();

  const [projects, setProjects] = useState<Project[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setProjects(getProjects());
    setMetrics(getDashboardMetrics(locale));
    setIsLoaded(true);
  }, [locale]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-dark-950 pt-24 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-dark-400">{locale === "ar" ? "جاري التحميل..." : "Loading..."}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Header */}
      <div className="pt-24 pb-8 px-4 sm:px-6 lg:px-8 border-b border-gold-500/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center">
                  <LayoutDashboard className="w-5 h-5 text-dark-950" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">{t.title}</h1>
              </div>
              <p className="text-dark-400">{t.subtitle}</p>
            </div>
            <Link
              href={`/${locale}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-gold-600 to-gold-500 text-dark-950 font-bold hover:from-gold-500 hover:to-gold-400 transition-all shadow-lg shadow-gold-500/25"
            >
              <Plus className="w-4 h-4" />
              {t.newAnalysis}
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Stats Cards */}
        {metrics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              icon={FolderKanban}
              label={t.totalProjects}
              value={metrics.totalProjects.toString()}
              gradient="from-gold-500 to-gold-600"
            />
            <StatCard
              icon={BarChart3}
              label={t.totalAnalyses}
              value={metrics.totalAnalyses.toString()}
              gradient="from-gold-400 to-gold-600"
            />
            <StatCard
              icon={TrendingUp}
              label={t.averageScore}
              value={`${metrics.averageScore}`}
              suffix="/100"
              gradient="from-gold-500 to-gold-700"
              trend={metrics.scoreTrend}
            />
            <StatCard
              icon={CheckCircle2}
              label={t.improvementRate}
              value={`${metrics.improvementRate}%`}
              gradient="from-emerald-500 to-emerald-600"
            />
          </div>
        )}

        {/* Projects Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FolderKanban className="w-5 h-5 text-gold-400" />
              {t.myProjects}
            </h2>
            <Link
              href={`/${locale}/projects`}
              className="text-sm text-gold-400 hover:text-gold-300 transition-colors flex items-center gap-1"
            >
              {t.viewAll}
              <ArrowRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
            </Link>
          </div>

          {projects.length === 0 ? (
            <div className="text-center py-16 rounded-2xl bg-dark-800/40 border border-gold-500/10">
              <FolderKanban className="w-12 h-12 text-dark-500 mx-auto mb-4" />
              <p className="text-dark-400">{t.noProjects}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.slice(0, 6).map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  locale={locale}
                  t={t}
                  onAnalyzeAgain={() => router.push(`/${locale}?url=${encodeURIComponent(project.url)}`)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Recent Analyses */}
        {metrics && metrics.recentAnalyses.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-gold-400" />
              {t.recentAnalyses}
            </h2>
            <div className="space-y-3">
              {metrics.recentAnalyses.slice(0, 5).map((analysis) => (
                <RecentAnalysisRow
                  key={analysis.id}
                  analysis={analysis}
                  locale={locale}
                  t={t}
                />
              ))}
            </div>
          </section>
        )}

        {/* Top Issues */}
        {metrics && metrics.topIssues.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-gold-400" />
              {t.topIssues}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {metrics.topIssues.map((issue, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 rounded-xl bg-dark-800/60 border border-gold-500/10"
                >
                  <span className="text-sm text-dark-300">{issue.issue}</span>
                  <span className="text-sm font-bold text-red-400 ml-2">×{issue.count}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

// --- Sub-components ---

function StatCard({
  icon: Icon,
  label,
  value,
  suffix,
  gradient,
  trend,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  suffix?: string;
  gradient: string;
  trend?: "up" | "down" | "stable";
}) {
  return (
    <div className="relative p-5 rounded-2xl bg-dark-800/60 border border-gold-500/10 gold-glow-hover card-hover-effect group">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg shadow-gold-500/20 group-hover:scale-110 transition-transform`}>
          <Icon className="w-5 h-5 text-dark-950" />
        </div>
        {trend && (
          <div className={cn(
            "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
            trend === "up" ? "bg-emerald-500/10 text-emerald-400" :
            trend === "down" ? "bg-red-500/10 text-red-400" :
            "bg-dark-700 text-dark-400"
          )}>
            {trend === "up" ? <TrendingUp className="w-3 h-3" /> :
             trend === "down" ? <TrendingDown className="w-3 h-3" /> :
             <Minus className="w-3 h-3" />}
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-white">
        {value}
        {suffix && <span className="text-sm text-dark-400 font-normal ml-1">{suffix}</span>}
      </p>
      <p className="text-xs text-dark-400 mt-1">{label}</p>
    </div>
  );
}

function ProjectCard({
  project,
  locale,
  t,
  onAnalyzeAgain,
}: {
  project: Project;
  locale: string;
  t: Record<string, string>;
  onAnalyzeAgain: () => void;
}) {
  const isRtl = locale === "ar";
  const daysSinceUpdate = Math.floor(
    (Date.now() - new Date(project.updatedAt).getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="group relative p-5 rounded-2xl bg-dark-800/60 border border-gold-500/10 hover:border-gold-500/30 transition-all duration-300 gold-glow-hover card-hover-effect">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-500/20 to-gold-600/20 flex items-center justify-center">
            <Globe className="w-5 h-5 text-gold-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white group-hover:text-gold-200 transition-colors">
              {project.name}
            </h3>
            <p className="text-xs text-dark-500 truncate max-w-[200px]">{project.url}</p>
          </div>
        </div>
        {project.latestScore !== null && (
          <div className={cn(
            "text-lg font-bold",
            project.latestScore >= 80 ? "text-emerald-400" :
            project.latestScore >= 60 ? "text-gold-400" :
            "text-red-400"
          )}>
            {project.latestScore}
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 text-xs text-dark-400 mb-4">
        <span>{project.analysisCount} {t.findings}</span>
        {project.scoreChange !== null && (
          <span className={cn(
            "flex items-center gap-1",
            project.scoreChange > 0 ? "text-emerald-400" :
            project.scoreChange < 0 ? "text-red-400" : "text-dark-400"
          )}>
            {project.scoreChange > 0 ? <TrendingUp className="w-3 h-3" /> :
             project.scoreChange < 0 ? <TrendingDown className="w-3 h-3" /> :
             <Minus className="w-3 h-3" />}
            {project.scoreChange > 0 ? "+" : ""}{project.scoreChange}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gold-500/10">
        <span className="text-[10px] text-dark-500">
          {t.lastAnalyzed}: {daysSinceUpdate === 0 ? t.justNow : `${daysSinceUpdate} ${t.daysAgo}`}
        </span>
        <div className="flex gap-2">
          <Link
            href={`/${locale}/projects/${project.id}`}
            className="text-xs px-3 py-1.5 rounded-lg bg-gold-500/10 text-gold-400 hover:bg-gold-500/20 transition-colors"
          >
            {t.viewProject}
          </Link>
          <button
            onClick={onAnalyzeAgain}
            className="text-xs px-3 py-1.5 rounded-lg bg-dark-700 text-dark-300 hover:text-gold-400 transition-colors"
          >
            {t.analyzeAgain}
          </button>
        </div>
      </div>
    </div>
  );
}

function RecentAnalysisRow({
  analysis,
  locale,
  t,
}: {
  analysis: ProjectAnalysis;
  locale: string;
  t: Record<string, string>;
}) {
  const isRtl = locale === "ar";
  const date = new Date(analysis.date);
  const dateStr = date.toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Link
      href={`/${locale}/projects/${analysis.projectId}`}
      className="flex items-center justify-between p-4 rounded-xl bg-dark-800/60 border border-gold-500/10 hover:border-gold-500/30 transition-all group"
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-dark-700 flex items-center justify-center">
          <BarChart3 className="w-4 h-4 text-gold-400" />
        </div>
        <div>
          <p className="text-sm font-medium text-white group-hover:text-gold-200 transition-colors">
            {analysis.url}
          </p>
          <p className="text-xs text-dark-500">{dateStr}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className={cn(
            "text-sm font-bold",
            analysis.overallScore >= 80 ? "text-emerald-400" :
            analysis.overallScore >= 60 ? "text-gold-400" :
            "text-red-400"
          )}>
            {analysis.overallScore}
          </p>
          {analysis.change !== null && (
            <p className={cn(
              "text-xs",
              analysis.change > 0 ? "text-emerald-400" :
              analysis.change < 0 ? "text-red-400" : "text-dark-500"
            )}>
              {analysis.change > 0 ? "+" : ""}{analysis.change}
            </p>
          )}
        </div>
        <ArrowRight className={`w-4 h-4 text-dark-500 group-hover:text-gold-400 transition-colors ${isRtl ? 'rotate-180' : ''}`} />
      </div>
    </Link>
  );
}