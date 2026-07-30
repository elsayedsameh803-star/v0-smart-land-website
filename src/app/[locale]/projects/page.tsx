"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  FolderKanban, Globe, TrendingUp, TrendingDown, Minus, 
  Search, ArrowRight, BarChart3, Sparkles, Plus, Trash2, Star
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getProjects, deleteProject } from "@/lib/storage";
import type { Project } from "@/lib/saas-types";

const translations: Record<string, Record<string, string>> = {
  en: {
    title: "My Projects",
    subtitle: "All your analyzed websites and social media profiles",
    newAnalysis: "New Analysis",
    noProjects: "No projects yet. Start by analyzing a website!",
    searchPlaceholder: "Search projects...",
    analyses: "analyses",
    avgScore: "Avg Score",
    lastAnalyzed: "Last analyzed",
    daysAgo: "d ago",
    justNow: "Just now",
    deleteConfirm: "Are you sure you want to delete this project?",
    delete: "Delete",
    cancel: "Cancel",
    viewProject: "View Details",
    analyzeAgain: "Analyze Again",
    favorites: "Favorites",
    allProjects: "All Projects",
    archived: "Archived",
  },
  ar: {
    title: "مشاريعي",
    subtitle: "جميع المواقع والحسابات التي قمت بتحليلها",
    newAnalysis: "تحليل جديد",
    noProjects: "لا توجد مشاريع بعد. ابدأ بتحليل موقع!",
    searchPlaceholder: "البحث في المشاريع...",
    analyses: "تحليل",
    avgScore: "متوسط النتيجة",
    lastAnalyzed: "آخر تحليل",
    daysAgo: "ي",
    justNow: "الآن",
    deleteConfirm: "هل أنت متأكد من حذف هذا المشروع؟",
    delete: "حذف",
    cancel: "إلغاء",
    viewProject: "عرض التفاصيل",
    analyzeAgain: "إعادة التحليل",
    favorites: "المفضلة",
    allProjects: "جميع المشاريع",
    archived: "المؤرشفة",
  },
};

export default function ProjectsPage({ params }: { params: { locale: string } }) {
  const locale = params.locale;
  const isRtl = locale === "ar";
  const t = translations[locale] || translations.en;
  const router = useRouter();

  const [projects, setProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "favorites">("all");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    setProjects(getProjects());
  }, []);

  const handleDelete = (id: string) => {
    deleteProject(id);
    setProjects(getProjects());
    setDeleteConfirmId(null);
  };

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         p.url.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === "favorites" ? p.isFavorite : true;
    return matchesSearch && matchesFilter && p.status === "active";
  });

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Header */}
      <div className="pt-24 pb-8 px-4 sm:px-6 lg:px-8 border-b border-gold-500/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center">
                  <FolderKanban className="w-5 h-5 text-dark-950" />
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-dark-800/80 border border-gold-500/20 text-white placeholder-dark-400 focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/30 transition-all"
              dir={isRtl ? "rtl" : "ltr"}
            />
          </div>
          <div className="flex gap-2">
            {(["all", "favorites"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
                  filter === f
                    ? "bg-gold-500/20 text-gold-400 border border-gold-500/30"
                    : "bg-dark-800/60 text-dark-300 border border-gold-500/10 hover:border-gold-500/30"
                )}
              >
                {f === "all" ? t.allProjects : t.favorites}
              </button>
            ))}
          </div>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <div className="text-center py-20 rounded-2xl bg-dark-800/40 border border-gold-500/10">
            <FolderKanban className="w-16 h-16 text-dark-500 mx-auto mb-4" />
            <p className="text-dark-400 text-lg">{t.noProjects}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="group relative p-6 rounded-2xl bg-dark-800/60 border border-gold-500/10 hover:border-gold-500/30 transition-all duration-300 gold-glow-hover card-hover-effect"
              >
                {/* Actions */}
                <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setDeleteConfirmId(project.id)}
                    className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Content */}
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold-500/20 to-gold-600/20 flex items-center justify-center shrink-0">
                    <Globe className="w-6 h-6 text-gold-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-semibold text-white group-hover:text-gold-200 transition-colors truncate">
                      {project.name}
                    </h3>
                    <p className="text-xs text-dark-500 truncate">{project.url}</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex-1">
                    <p className="text-xs text-dark-500">{t.analyses}</p>
                    <p className="text-sm font-semibold text-white">{project.analysisCount}</p>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-dark-500">{t.avgScore}</p>
                    <p className={cn(
                      "text-sm font-semibold",
                      project.averageScore >= 80 ? "text-emerald-400" :
                      project.averageScore >= 60 ? "text-gold-400" : "text-red-400"
                    )}>
                      {project.averageScore}
                    </p>
                  </div>
                  {project.scoreChange !== null && (
                    <div className="flex-1">
                      <p className="text-xs text-dark-500">Change</p>
                      <p className={cn(
                        "text-sm font-semibold flex items-center gap-1",
                        project.scoreChange > 0 ? "text-emerald-400" :
                        project.scoreChange < 0 ? "text-red-400" : "text-dark-400"
                      )}>
                        {project.scoreChange > 0 ? <TrendingUp className="w-3 h-3" /> :
                         project.scoreChange < 0 ? <TrendingDown className="w-3 h-3" /> :
                         <Minus className="w-3 h-3" />}
                        {project.scoreChange > 0 ? "+" : ""}{project.scoreChange}
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-3 border-t border-gold-500/10">
                  <Link
                    href={`/${locale}/projects/${project.id}`}
                    className="flex-1 text-center text-sm px-3 py-2 rounded-xl bg-gradient-to-r from-gold-600 to-gold-500 text-dark-950 font-bold hover:from-gold-500 hover:to-gold-400 transition-all"
                  >
                    {t.viewProject}
                  </Link>
                  <button
                    onClick={() => router.push(`/${locale}?url=${encodeURIComponent(project.url)}`)}
                    className="flex-1 text-center text-sm px-3 py-2 rounded-xl bg-dark-700 text-dark-300 hover:text-gold-400 hover:bg-dark-600 transition-all"
                  >
                    {t.analyzeAgain}
                  </button>
                </div>

                {/* Delete Confirmation */}
                {deleteConfirmId === project.id && (
                  <div className="absolute inset-0 rounded-2xl bg-dark-900/95 backdrop-blur-sm flex items-center justify-center z-10">
                    <div className="text-center p-6">
                      <p className="text-sm text-dark-300 mb-4">{t.deleteConfirm}</p>
                      <div className="flex gap-3 justify-center">
                        <button
                          onClick={() => handleDelete(project.id)}
                          className="px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-colors"
                        >
                          {t.delete}
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-4 py-2 rounded-xl bg-dark-700 text-dark-300 text-sm hover:text-white transition-colors"
                        >
                          {t.cancel}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}