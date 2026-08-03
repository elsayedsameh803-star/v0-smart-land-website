"use client";

import { useState, useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard, FolderKanban, TrendingUp, TrendingDown, Minus,
  Globe, BarChart3, AlertTriangle, CheckCircle2, Clock, ArrowRight,
  Sparkles, Search, Zap, Eye, Shield, FileText, Wrench, Plus, Gift,
  Bell, Star, Activity, Target, Award, Users, MousePointerClick,
  UserPlus, LineChart, PieChart, Calendar, Filter, Download, RefreshCw,
  ChevronRight, ChevronLeft, X, Check, Info, AlertCircle, TrendingUp as TrendUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getProjects, getDashboardMetrics, getProjectAnalyses, getNotifications, markNotificationRead, getScheduledAnalyses, getCompetitorTrackings } from "@/lib/storage";
import { getReferralStats, getReferralUser } from "@/lib/referral-storage";
import type { Project, DashboardMetrics, ProjectAnalysis, Notification, ScheduledAnalysis, CompetitorTracking } from "@/lib/saas-types";
import {
  ResponsiveContainer, LineChart as ReLineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, BarChart as ReBarChart, Bar,
  PieChart as RePieChart, Pie, Cell, AreaChart, Area
} from "recharts";

const translations: Record<string, Record<string, string>> = {
  en: {
    title: "Dashboard",
    subtitle: "Your complete digital audit command center",
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
    referralProgram: "Referral Program",
    referralDesc: "Invite friends and earn rewards",
    viewReferral: "View Referral",
    notifications: "Notifications",
    markAllRead: "Mark all read",
    noNotifications: "No notifications yet",
    scheduledAnalyses: "Scheduled Analyses",
    competitorTracking: "Competitor Tracking",
    performanceOverview: "Performance Overview",
    scoreDistribution: "Score Distribution",
    categoryBreakdown: "Category Breakdown",
    recentActivity: "Recent Activity",
    quickActions: "Quick Actions",
    analyzeWebsite: "Analyze Website",
    viewProjects: "View Projects",
    viewReferrals: "View Referrals",
    exportReport: "Export Report",
    totalFindings: "Total Findings",
    criticalIssues: "Critical Issues",
    strengths: "Strengths",
    weaknesses: "Weaknesses",
    avgDuration: "Avg Duration",
    totalClicks: "Total Clicks",
    totalSignups: "Total Signups",
    conversionRate: "Conversion Rate",
    activeProjects: "Active Projects",
    archivedProjects: "Archived",
    favoriteProjects: "Favorites",
    scoreChange: "Score Change",
    last7Days: "Last 7 Days",
    last30Days: "Last 30 Days",
    allTime: "All Time",
    filter: "Filter",
    all: "All",
    website: "Website",
    youtube: "YouTube",
    facebook: "Facebook",
    instagram: "Instagram",
    tiktok: "TikTok",
    snapchat: "Snapchat",
    linkedin: "LinkedIn",
    noData: "No data available",
    loading: "Loading...",
    welcome: "Welcome back!",
    welcomeDesc: "Here's what's happening with your digital presence today.",
    viewDetails: "View Details",
    markRead: "Mark as read",
    new: "New",
    today: "Today",
    yesterday: "Yesterday",
    thisWeek: "This Week",
    thisMonth: "This Month",
  },
  ar: {
    title: "لوحة التحكم",
    subtitle: "مركز القيادة الكامل لتدقيقاتك الرقمية",
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
    referralProgram: "برنامج الإحالة",
    referralDesc: "ادعُ أصدقاءك واكسب مكافآت",
    viewReferral: "عرض الإحالات",
    notifications: "الإشعارات",
    markAllRead: "تحديد الكل كمقروء",
    noNotifications: "لا توجد إشعارات بعد",
    scheduledAnalyses: "التحليلات المجدولة",
    competitorTracking: "تتبع المنافسين",
    performanceOverview: "نظرة عامة على الأداء",
    scoreDistribution: "توزيع النتائج",
    categoryBreakdown: "تفصيل الفئات",
    recentActivity: "النشاط الأخير",
    quickActions: "إجراءات سريعة",
    analyzeWebsite: "تحليل موقع",
    viewProjects: "عرض المشاريع",
    viewReferrals: "عرض الإحالات",
    exportReport: "تصدير التقرير",
    totalFindings: "إجمالي النتائج",
    criticalIssues: "مشكلات حرجة",
    strengths: "نقاط القوة",
    weaknesses: "نقاط الضعف",
    avgDuration: "متوسط المدة",
    totalClicks: "إجمالي النقرات",
    totalSignups: "إجمالي المسجلين",
    conversionRate: "معدل التحويل",
    activeProjects: "مشاريع نشطة",
    archivedProjects: "مؤرشفة",
    favoriteProjects: "المفضلة",
    scoreChange: "تغير النتيجة",
    last7Days: "آخر 7 أيام",
    last30Days: "آخر 30 يوم",
    allTime: "كل الوقت",
    filter: "تصفية",
    all: "الكل",
    website: "موقع",
    youtube: "يوتيوب",
    facebook: "فيسبوك",
    instagram: "إنستغرام",
    tiktok: "تيك توك",
    snapchat: "سناب شات",
    linkedin: "لينكد إن",
    noData: "لا توجد بيانات متاحة",
    loading: "جاري التحميل...",
    welcome: "مرحباً بعودتك!",
    welcomeDesc: "إليك ما يحدث مع حضورك الرقمي اليوم.",
    viewDetails: "عرض التفاصيل",
    markRead: "تحديد كمقروء",
    new: "جديد",
    today: "اليوم",
    yesterday: "أمس",
    thisWeek: "هذا الأسبوع",
    thisMonth: "هذا الشهر",
  },
};

const COLORS = ["#facc15", "#f59e0b", "#d97706", "#b45309", "#92400e", "#78350f"];

export default function DashboardPage({ params }: { params: { locale: string } }) {
  const locale = params.locale;
  const isRtl = locale === "ar";
  const t = translations[locale] || translations.en;
  const router = useRouter();
  const pathname = usePathname();

  const [projects, setProjects] = useState<Project[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [schedules, setSchedules] = useState<ScheduledAnalysis[]>([]);
  const [competitors, setCompetitors] = useState<CompetitorTracking[]>([]);
  const [referralStats, setReferralStats] = useState({ totalClicks: 0, totalSignups: 0, conversionRate: 0 });
  const [isLoaded, setIsLoaded] = useState(false);
  const [timeRange, setTimeRange] = useState<"7" | "30" | "all">("30");
  const [platformFilter, setPlatformFilter] = useState<string>("all");
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const projectsData = getProjects();
    setProjects(projectsData);
    setMetrics(getDashboardMetrics(locale));
    setNotifications(getNotifications());
    setSchedules(getScheduledAnalyses());
    setCompetitors(getCompetitorTrackings());

    // Get referral stats
    const userId = "demo-user-" + (typeof window !== "undefined" ? window.localStorage.getItem("smart-land-user-id") || "default" : "default");
    const stats = getReferralStats(userId);
    setReferralStats({ totalClicks: stats.totalClicks, totalSignups: stats.totalSignups, conversionRate: stats.conversionRate });

    setIsLoaded(true);
  }, [locale]);

  const handleMarkAllRead = () => {
    notifications.forEach(n => markNotificationRead(n.id));
    setNotifications(getNotifications());
  };

  const handleMarkRead = (id: string) => {
    markNotificationRead(id);
    setNotifications(getNotifications());
  };

  // Filter projects by platform
  const filteredProjects = useMemo(() => {
    if (platformFilter === "all") return projects;
    return projects.filter(p => p.platform === platformFilter);
  }, [projects, platformFilter]);

  // Filter analyses by time range
  const filteredAnalyses = useMemo(() => {
    if (!metrics) return [];
    const all = metrics.recentAnalyses;
    if (timeRange === "all") return all;
    const days = parseInt(timeRange);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return all.filter(a => new Date(a.date) >= cutoff);
  }, [metrics, timeRange]);

  // Chart data
  const scoreHistoryData = useMemo(() => {
    if (!metrics) return [];
    return metrics.scoreHistory.map((h, i) => ({
      name: new Date(h.date).toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US", { month: "short", day: "numeric" }),
      score: h.score,
    }));
  }, [metrics, locale]);

  const platformData = useMemo(() => {
    if (!metrics) return [];
    return metrics.platformDistribution.map((p, i) => ({
      name: p.platform,
      value: p.count,
      color: COLORS[i % COLORS.length],
    }));
  }, [metrics]);

  const categoryData = useMemo(() => {
    if (!metrics || metrics.recentAnalyses.length === 0) return [];
    const latest = metrics.recentAnalyses[0];
    return Object.entries(latest.scores).map(([key, value]) => ({
      name: key,
      score: value,
    }));
  }, [metrics]);

  const activityData = useMemo(() => {
    if (!metrics) return [];
    const last7 = metrics.recentAnalyses.slice(0, 7).reverse();
    return last7.map(a => ({
      name: new Date(a.date).toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US", { month: "short", day: "numeric" }),
      analyses: 1,
      score: a.overallScore,
    }));
  }, [metrics, locale]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-dark-950 pt-24 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-dark-400">{t.loading}</span>
        </div>
      </div>
    );
  }

  const activeProjects = projects.filter(p => p.status === "active").length;
  const favoriteProjects = projects.filter(p => p.isFavorite).length;
  const totalFindings = metrics?.recentAnalyses.reduce((sum, a) => sum + a.findingsCount, 0) || 0;
  const totalCritical = metrics?.recentAnalyses.reduce((sum, a) => sum + a.criticalIssuesCount, 0) || 0;
  const totalStrengths = metrics?.recentAnalyses.reduce((sum, a) => sum + a.strengthsCount, 0) || 0;
  const totalWeaknesses = metrics?.recentAnalyses.reduce((sum, a) => sum + a.weaknessesCount, 0) || 0;
  const avgDuration = metrics?.recentAnalyses.length ? Math.round(metrics.recentAnalyses.reduce((sum, a) => sum + a.duration, 0) / metrics.recentAnalyses.length) : 0;

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Header */}
      <div className="pt-24 pb-8 px-4 sm:px-6 lg:px-8 border-b border-gold-500/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gold-500/5 via-transparent to-transparent" />
        <div className="max-w-7xl mx-auto relative">
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
            <div className="flex items-center gap-3">
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2.5 rounded-xl bg-dark-800/60 border border-gold-500/10 text-dark-300 hover:text-gold-400 hover:border-gold-500/30 transition-all"
                >
                  <Bell className="w-5 h-5" />
                  {notifications.filter(n => !n.isRead).length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold">
                      {notifications.filter(n => !n.isRead).length}
                    </span>
                  )}
                </button>
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-dark-900 border border-gold-500/20 shadow-2xl z-50 overflow-hidden">
                    <div className="flex items-center justify-between p-4 border-b border-gold-500/10">
                      <h3 className="text-sm font-bold text-white">{t.notifications}</h3>
                      <button onClick={handleMarkAllRead} className="text-xs text-gold-400 hover:text-gold-300">
                        {t.markAllRead}
                      </button>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center">
                          <Bell className="w-8 h-8 text-dark-500 mx-auto mb-2" />
                          <p className="text-sm text-dark-400">{t.noNotifications}</p>
                        </div>
                      ) : (
                        notifications.slice(0, 10).map((n) => (
                          <button
                            key={n.id}
                            onClick={() => handleMarkRead(n.id)}
                            className={cn(
                              "w-full text-left p-4 border-b border-gold-500/5 hover:bg-dark-800/50 transition-colors",
                              !n.isRead && "bg-gold-500/5"
                            )}
                          >
                            <div className="flex items-start gap-3">
                              <div className={cn(
                                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                                n.type === "critical_issue" ? "bg-red-500/10 text-red-400" :
                                n.type === "improvement" ? "bg-emerald-500/10 text-emerald-400" :
                                "bg-gold-500/10 text-gold-400"
                              )}>
                                {n.type === "critical_issue" ? <AlertTriangle className="w-4 h-4" /> :
                                 n.type === "improvement" ? <TrendingUp className="w-4 h-4" /> :
                                 <Info className="w-4 h-4" />}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-white">{locale === "ar" ? n.titleAr : n.title}</p>
                                <p className="text-xs text-dark-400 mt-0.5">{locale === "ar" ? n.messageAr : n.message}</p>
                                <p className="text-[10px] text-dark-500 mt-1">
                                  {new Date(n.createdAt).toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                                </p>
                              </div>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
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
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Banner */}
        <div className="relative p-6 rounded-2xl bg-gradient-to-r from-gold-500/10 via-gold-600/5 to-transparent border border-gold-500/20 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/10 rounded-full blur-3xl" />
          <div className="relative flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center shrink-0">
                <Sparkles className="w-6 h-6 text-dark-950" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">{t.welcome}</h2>
                <p className="text-sm text-dark-400">{t.welcomeDesc}</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs text-dark-400">{t.scoreTrend}:</span>
              <span className={cn(
                "flex items-center gap-1 text-sm font-bold",
                metrics?.scoreTrend === "up" ? "text-emerald-400" :
                metrics?.scoreTrend === "down" ? "text-red-400" : "text-dark-300"
              )}>
                {metrics?.scoreTrend === "up" ? <TrendingUp className="w-4 h-4" /> :
                 metrics?.scoreTrend === "down" ? <TrendingDown className="w-4 h-4" /> :
                 <Minus className="w-4 h-4" />}
                {metrics?.scoreTrend === "up" ? t.up : metrics?.scoreTrend === "down" ? t.down : t.stable}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {metrics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              icon={FolderKanban}
              label={t.totalProjects}
              value={metrics.totalProjects.toString()}
              gradient="from-gold-500 to-gold-600"
              subValue={`${activeProjects} ${t.activeProjects}`}
            />
            <StatCard
              icon={BarChart3}
              label={t.totalAnalyses}
              value={metrics.totalAnalyses.toString()}
              gradient="from-gold-400 to-gold-600"
              subValue={`${favoriteProjects} ${t.favoriteProjects}`}
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
              subValue={`${t.bestScore}: ${metrics.bestScore}`}
            />
          </div>
        )}

        {/* Secondary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MiniStatCard icon={FileText} label={t.totalFindings} value={totalFindings.toString()} color="text-gold-400" />
          <MiniStatCard icon={AlertTriangle} label={t.criticalIssues} value={totalCritical.toString()} color="text-red-400" />
          <MiniStatCard icon={CheckCircle2} label={t.strengths} value={totalStrengths.toString()} color="text-emerald-400" />
          <MiniStatCard icon={Wrench} label={t.weaknesses} value={totalWeaknesses.toString()} color="text-orange-400" />
        </div>

        {/* Referral Banner */}
        <Link
          href={`/${locale}/referral`}
          className="group relative p-6 rounded-2xl bg-gradient-to-r from-gold-500/10 via-gold-600/5 to-transparent border border-gold-500/20 overflow-hidden block card-hover-effect"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/10 rounded-full blur-3xl" />
          <div className="relative flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center shrink-0">
                <Gift className="w-6 h-6 text-dark-950" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white group-hover:text-gold-200 transition-colors">
                  {t.referralProgram}
                </h3>
                <p className="text-sm text-dark-400">{t.referralDesc}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-4">
                <div className="text-center">
                  <p className="text-lg font-bold text-gold-400">{referralStats.totalClicks}</p>
                  <p className="text-[10px] text-dark-500">{t.totalClicks}</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-emerald-400">{referralStats.totalSignups}</p>
                  <p className="text-[10px] text-dark-500">{t.totalSignups}</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-blue-400">{referralStats.conversionRate}%</p>
                  <p className="text-[10px] text-dark-500">{t.conversionRate}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-gold-400">
                <span className="text-sm font-medium">{t.viewReferral}</span>
                <ArrowRight className={`w-4 h-4 group-hover:translate-x-1 transition-transform ${isRtl ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
              </div>
            </div>
          </div>
        </Link>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Score History Chart */}
          <div className="p-6 rounded-2xl bg-dark-800/60 border border-gold-500/10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <LineChart className="w-5 h-5 text-gold-400" />
                {t.scoreHistory}
              </h3>
              <div className="flex gap-1">
                {(["7", "30", "all"] as const).map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-xs font-medium transition-all",
                      timeRange === range
                        ? "bg-gold-500/20 text-gold-400 border border-gold-500/30"
                        : "bg-dark-700 text-dark-300 hover:text-gold-400 border border-transparent"
                    )}
                  >
                    {range === "7" ? t.last7Days : range === "30" ? t.last30Days : t.allTime}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-64">
              {scoreHistoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={scoreHistoryData}>
                    <defs>
                      <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#facc15" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#facc15" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(234,179,8,0.1)" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{
                        background: "#1e293b",
                        border: "1px solid rgba(234,179,8,0.2)",
                        borderRadius: "12px",
                        color: "#facc15",
                      }}
                    />
                    <Area type="monotone" dataKey="score" stroke="#facc15" fill="url(#scoreGradient)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-dark-500">{t.noData}</p>
                </div>
              )}
            </div>
          </div>

          {/* Platform Distribution */}
          <div className="p-6 rounded-2xl bg-dark-800/60 border border-gold-500/10">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-gold-400" />
              {t.platformDistribution}
            </h3>
            <div className="h-64">
              {platformData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={platformData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {platformData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "#1e293b",
                        border: "1px solid rgba(234,179,8,0.2)",
                        borderRadius: "12px",
                        color: "#facc15",
                      }}
                    />
                    <Legend />
                  </RePieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-dark-500">{t.noData}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Category Breakdown & Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Breakdown */}
          <div className="p-6 rounded-2xl bg-dark-800/60 border border-gold-500/10">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Target className="w-5 h-5 text-gold-400" />
              {t.categoryBreakdown}
            </h3>
            <div className="h-64">
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <ReBarChart data={categoryData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(234,179,8,0.1)" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{
                        background: "#1e293b",
                        border: "1px solid rgba(234,179,8,0.2)",
                        borderRadius: "12px",
                        color: "#facc15",
                      }}
                    />
                    <Bar dataKey="score" fill="#facc15" radius={[4, 4, 0, 0]} />
                  </ReBarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-dark-500">{t.noData}</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="p-6 rounded-2xl bg-dark-800/60 border border-gold-500/10">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-gold-400" />
              {t.recentActivity}
            </h3>
            <div className="h-64">
              {activityData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <ReLineChart data={activityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(234,179,8,0.1)" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{
                        background: "#1e293b",
                        border: "1px solid rgba(234,179,8,0.2)",
                        borderRadius: "12px",
                        color: "#facc15",
                      }}
                    />
                    <Line type="monotone" dataKey="score" stroke="#facc15" strokeWidth={2} dot={{ fill: "#facc15", r: 4 }} />
                  </ReLineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-dark-500">{t.noData}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-gold-400" />
            {t.quickActions}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <QuickAction
              icon={Globe}
              label={t.analyzeWebsite}
              href={`/${locale}`}
              color="from-gold-500 to-gold-600"
            />
            <QuickAction
              icon={FolderKanban}
              label={t.viewProjects}
              href={`/${locale}/projects`}
              color="from-blue-500 to-blue-600"
            />
            <QuickAction
              icon={Gift}
              label={t.viewReferrals}
              href={`/${locale}/referral`}
              color="from-emerald-500 to-emerald-600"
            />
            <QuickAction
              icon={Download}
              label={t.exportReport}
              href={`/${locale}/projects`}
              color="from-purple-500 to-purple-600"
            />
          </div>
        </div>

        {/* Projects Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FolderKanban className="w-5 h-5 text-gold-400" />
              {t.myProjects}
            </h2>
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                {["all", "website", "youtube", "facebook", "instagram", "tiktok", "snapchat", "linkedin"].map((platform) => (
                  <button
                    key={platform}
                    onClick={() => setPlatformFilter(platform)}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-xs font-medium transition-all",
                      platformFilter === platform
                        ? "bg-gold-500/20 text-gold-400 border border-gold-500/30"
                        : "bg-dark-700 text-dark-300 hover:text-gold-400 border border-transparent"
                    )}
                  >
                    {platform === "all" ? t.all : t[platform as keyof typeof t] || platform}
                  </button>
                ))}
              </div>
              <Link
                href={`/${locale}/projects`}
                className="text-sm text-gold-400 hover:text-gold-300 transition-colors flex items-center gap-1"
              >
                {t.viewAll}
                <ArrowRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
              </Link>
            </div>
          </div>

          {filteredProjects.length === 0 ? (
            <div className="text-center py-16 rounded-2xl bg-dark-800/40 border border-gold-500/10">
              <FolderKanban className="w-12 h-12 text-dark-500 mx-auto mb-4" />
              <p className="text-dark-400">{t.noProjects}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProjects.slice(0, 6).map((project) => (
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
        {filteredAnalyses.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-gold-400" />
              {t.recentAnalyses}
            </h2>
            <div className="space-y-3">
              {filteredAnalyses.slice(0, 5).map((analysis) => (
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

        {/* Scheduled & Competitors */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Scheduled Analyses */}
          <div className="p-6 rounded-2xl bg-dark-800/60 border border-gold-500/10">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gold-400" />
              {t.scheduledAnalyses}
            </h3>
            {schedules.length === 0 ? (
              <p className="text-sm text-dark-500">{t.noData}</p>
            ) : (
              <div className="space-y-3">
                {schedules.slice(0, 3).map((schedule) => (
                  <div key={schedule.id} className="flex items-center justify-between p-3 rounded-xl bg-dark-900/50 border border-gold-500/10">
                    <div>
                      <p className="text-sm font-medium text-white">{schedule.frequency}</p>
                      <p className="text-xs text-dark-500">
                        {new Date(schedule.nextRun).toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US")}
                      </p>
                    </div>
                    <span className={cn(
                      "text-xs font-medium px-2.5 py-1 rounded-full",
                      schedule.isActive ? "bg-emerald-500/10 text-emerald-400" : "bg-dark-700 text-dark-400"
                    )}>
                      {schedule.isActive ? t.activeProjects : t.archivedProjects}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Competitor Tracking */}
          <div className="p-6 rounded-2xl bg-dark-800/60 border border-gold-500/10">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-gold-400" />
              {t.competitorTracking}
            </h3>
            {competitors.length === 0 ? (
              <p className="text-sm text-dark-500">{t.noData}</p>
            ) : (
              <div className="space-y-3">
                {competitors.slice(0, 3).map((comp) => (
                  <div key={comp.id} className="flex items-center justify-between p-3 rounded-xl bg-dark-900/50 border border-gold-500/10">
                    <div>
                      <p className="text-sm font-medium text-white">{comp.competitorName}</p>
                      <p className="text-xs text-dark-500">{comp.competitorUrl}</p>
                    </div>
                    <span className={cn(
                      "text-xs font-medium px-2.5 py-1 rounded-full",
                      comp.isActive ? "bg-emerald-500/10 text-emerald-400" : "bg-dark-700 text-dark-400"
                    )}>
                      {comp.isActive ? t.activeProjects : t.archivedProjects}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
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
  subValue,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  suffix?: string;
  gradient: string;
  trend?: "up" | "down" | "stable";
  subValue?: string;
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
      {subValue && <p className="text-[10px] text-dark-500 mt-0.5">{subValue}</p>}
    </div>
  );
}

function MiniStatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="p-4 rounded-2xl bg-dark-800/60 border border-gold-500/10 card-hover-effect">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-dark-700 flex items-center justify-center">
          <Icon className={`w-4 h-4 ${color}`} />
        </div>
        <div>
          <p className="text-lg font-bold text-white">{value}</p>
          <p className="text-[10px] text-dark-500">{label}</p>
        </div>
      </div>
    </div>
  );
}

function QuickAction({
  icon: Icon,
  label,
  href,
  color,
}: {
  icon: React.ElementType;
  label: string;
  href: string;
  color: string;
}) {
  return (
    <Link
      href={href}
      className="group p-4 rounded-2xl bg-dark-800/60 border border-gold-500/10 hover:border-gold-500/30 transition-all card-hover-effect"
    >
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
        <Icon className="w-5 h-5 text-dark-950" />
      </div>
      <p className="text-sm font-medium text-white group-hover:text-gold-200 transition-colors">{label}</p>
    </Link>
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
        {project.isFavorite && <Star className="w-3 h-3 text-gold-400 fill-gold-400" />}
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