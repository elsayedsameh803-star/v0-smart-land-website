// ============================================
// Smart Land SaaS Platform Types
// ============================================

export interface Project {
  id: string;
  name: string;
  url: string;
  platform: string;
  createdAt: string;
  updatedAt: string;
  lastAnalysisId: string | null;
  analysisCount: number;
  averageScore: number;
  latestScore: number | null;
  previousScore: number | null;
  scoreChange: number | null;
  tags: string[];
  isFavorite: boolean;
  status: "active" | "archived";
}

export interface ProjectAnalysis {
  id: string;
  projectId: string;
  url: string;
  platform: string;
  date: string;
  overallScore: number;
  scores: Record<string, number>;
  findingsCount: number;
  criticalIssuesCount: number;
  strengthsCount: number;
  weaknessesCount: number;
  duration: number;
  change: number | null;
  summary: string;
}

export interface DashboardMetrics {
  totalProjects: number;
  totalAnalyses: number;
  averageScore: number;
  bestScore: number;
  worstScore: number;
  scoreTrend: "up" | "down" | "stable";
  recentAnalyses: ProjectAnalysis[];
  topIssues: Array<{ issue: string; count: number }>;
  scoreHistory: Array<{ date: string; score: number }>;
  platformDistribution: Array<{ platform: string; count: number }>;
  improvementRate: number;
}

// Future: Scheduled Analysis
export interface ScheduledAnalysis {
  id: string;
  projectId: string;
  frequency: "daily" | "weekly" | "monthly";
  nextRun: string;
  lastRun: string | null;
  isActive: boolean;
  createdAt: string;
}

// Future: Notifications
export interface Notification {
  id: string;
  type: "score_change" | "new_analysis" | "critical_issue" | "schedule_complete" | "improvement";
  title: string;
  titleAr: string;
  message: string;
  messageAr: string;
  projectId: string | null;
  isRead: boolean;
  createdAt: string;
}

// Future: Competitor Tracking
export interface CompetitorTracking {
  id: string;
  projectId: string;
  competitorUrl: string;
  competitorName: string;
  lastComparison: string | null;
  comparisons: Array<{
    date: string;
    yourScore: number;
    competitorScore: number;
  }>;
  isActive: boolean;
}