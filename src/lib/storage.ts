import type { AnalysisResult, AnalysisHistory, CompetitorComparison } from "./types";
import type { Project, ProjectAnalysis, DashboardMetrics, ScheduledAnalysis, Notification, CompetitorTracking } from "./saas-types";
import { generateId } from "./utils";

const STORAGE_PREFIX = "smart-land-";

// =============================================================================
// EXISTING FUNCTIONS (Preserved)
// =============================================================================

export function saveAnalysis(result: AnalysisResult): void {
  try {
    const key = `${STORAGE_PREFIX}analysis-${result.id}`;
    localStorage.setItem(key, JSON.stringify(result));
    saveToHistory(result);
    // Also save to project system
    saveAnalysisToProject(result);
  } catch (error) {
    console.error("Failed to save analysis:", error);
  }
}

export function getAnalysis(id: string): AnalysisResult | null {
  try {
    const key = `${STORAGE_PREFIX}analysis-${id}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function getAllAnalyses(): AnalysisResult[] {
  try {
    const analyses: AnalysisResult[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(`${STORAGE_PREFIX}analysis-`)) {
        const data = localStorage.getItem(key);
        if (data) {
          analyses.push(JSON.parse(data));
        }
      }
    }
    return analyses.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  } catch {
    return [];
  }
}

export function getAnalysisHistory(): AnalysisHistory[] {
  try {
    const historyKey = `${STORAGE_PREFIX}history`;
    const data = localStorage.getItem(historyKey);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveComparison(comparison: CompetitorComparison): void {
  try {
    const key = `${STORAGE_PREFIX}comparison-${Date.now()}`;
    localStorage.setItem(key, JSON.stringify(comparison));
  } catch (error) {
    console.error("Failed to save comparison:", error);
  }
}

export function clearAllData(): void {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(STORAGE_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));
  } catch (error) {
    console.error("Failed to clear data:", error);
  }
}

function saveToHistory(result: AnalysisResult): void {
  const history = getAnalysisHistory();
  const existingIndex = history.findIndex((h) => h.url === result.url);

  const historyEntry: AnalysisHistory = {
    id: result.id,
    url: result.url,
    date: result.date,
    overallScore: result.overallScore,
    change: null,
    findingsCount: result.findings.length,
  };

  if (existingIndex >= 0) {
    const previous = history[existingIndex];
    historyEntry.change = result.overallScore - previous.overallScore;
    history[existingIndex] = historyEntry;
  } else {
    history.unshift(historyEntry);
  }

  const historyKey = `${STORAGE_PREFIX}history`;
  localStorage.setItem(historyKey, JSON.stringify(history.slice(0, 50)));
}

// =============================================================================
// NEW: PROJECT SYSTEM (SaaS)
// =============================================================================

function getProjectsKey(): string {
  return `${STORAGE_PREFIX}projects`;
}

function getProjectAnalysesKey(projectId: string): string {
  return `${STORAGE_PREFIX}project-analyses-${projectId}`;
}

function getNotificationsKey(): string {
  return `${STORAGE_PREFIX}notifications`;
}

function getSchedulesKey(): string {
  return `${STORAGE_PREFIX}schedules`;
}

function getCompetitorsKey(): string {
  return `${STORAGE_PREFIX}competitors`;
}

// --- Projects ---

export function getProjects(): Project[] {
  try {
    const data = localStorage.getItem(getProjectsKey());
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function getProject(id: string): Project | null {
  const projects = getProjects();
  return projects.find(p => p.id === id) || null;
}

export function saveProject(project: Project): void {
  const projects = getProjects();
  const index = projects.findIndex(p => p.id === project.id);
  if (index >= 0) {
    projects[index] = project;
  } else {
    projects.unshift(project);
  }
  localStorage.setItem(getProjectsKey(), JSON.stringify(projects));
}

export function deleteProject(id: string): void {
  const projects = getProjects().filter(p => p.id !== id);
  localStorage.setItem(getProjectsKey(), JSON.stringify(projects));
  // Also remove project analyses
  localStorage.removeItem(getProjectAnalysesKey(id));
}

export function getOrCreateProject(url: string, platform: string = "website"): Project {
  const projects = getProjects();
  const existing = projects.find(p => p.url === url);
  if (existing) return existing;

  const newProject: Project = {
    id: generateId(),
    name: extractProjectName(url),
    url,
    platform,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastAnalysisId: null,
    analysisCount: 0,
    averageScore: 0,
    latestScore: null,
    previousScore: null,
    scoreChange: null,
    tags: [],
    isFavorite: false,
    status: "active",
  };

  saveProject(newProject);
  return newProject;
}

function extractProjectName(url: string): string {
  try {
    const hostname = new URL(url.startsWith("http") ? url : `https://${url}`).hostname;
    return hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

// --- Project Analyses ---

export function getProjectAnalyses(projectId: string): ProjectAnalysis[] {
  try {
    const data = localStorage.getItem(getProjectAnalysesKey(projectId));
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveAnalysisToProject(result: AnalysisResult): void {
  const project = getOrCreateProject(result.url, "website");
  
  const projectAnalyses = getProjectAnalyses(project.id);
  const previousAnalysis = projectAnalyses.length > 0 ? projectAnalyses[0] : null;
  
  const change = previousAnalysis ? result.overallScore - previousAnalysis.overallScore : null;

  const projectAnalysis: ProjectAnalysis = {
    id: result.id,
    projectId: project.id,
    url: result.url,
    platform: "website",
    date: result.date,
    overallScore: result.overallScore,
    scores: Object.fromEntries(
      Object.entries(result.scores).map(([key, val]) => [key, val.score])
    ),
    findingsCount: result.findings.length,
    criticalIssuesCount: result.criticalIssues.length,
    strengthsCount: result.strengths.length,
    weaknessesCount: result.weaknesses.length,
    duration: result.metadata.duration,
    change,
    summary: result.strengths.slice(0, 2).join(", "),
  };

  projectAnalyses.unshift(projectAnalysis);
  localStorage.setItem(getProjectAnalysesKey(project.id), JSON.stringify(projectAnalyses.slice(0, 100)));

  // Update project metadata
  const allScores = projectAnalyses.map(a => a.overallScore);
  project.analysisCount = projectAnalyses.length;
  project.averageScore = Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length);
  project.latestScore = result.overallScore;
  project.previousScore = previousAnalysis?.overallScore ?? null;
  project.scoreChange = change;
  project.lastAnalysisId = result.id;
  project.updatedAt = new Date().toISOString();
  saveProject(project);
}

// --- Dashboard Metrics ---

export function getDashboardMetrics(locale: string = "en"): DashboardMetrics {
  const projects = getProjects();
  const allAnalyses = getAllAnalyses();
  const recentAnalyses = getAllProjectAnalyses().slice(0, 10);
  
  const scores = allAnalyses.map(a => a.overallScore);
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  const bestScore = scores.length > 0 ? Math.max(...scores) : 0;
  const worstScore = scores.length > 0 ? Math.min(...scores) : 0;

  // Score trend
  let scoreTrend: "up" | "down" | "stable" = "stable";
  if (recentAnalyses.length >= 2) {
    const recent = recentAnalyses.slice(0, 3);
    const avgRecent = recent.reduce((a, b) => a + b.overallScore, 0) / recent.length;
    const older = allAnalyses.slice(-3);
    const avgOlder = older.length > 0 ? older.reduce((a, b) => a + b.overallScore, 0) / older.length : avgRecent;
    scoreTrend = avgRecent > avgOlder + 2 ? "up" : avgRecent < avgOlder - 2 ? "down" : "stable";
  }

  // Top issues
  const issueCount: Record<string, number> = {};
  allAnalyses.forEach(a => {
    a.findings.forEach(f => {
      if (f.severity === "critical" || f.severity === "high") {
        const key = locale === "ar" ? f.issueAr : f.issue;
        issueCount[key] = (issueCount[key] || 0) + 1;
      }
    });
  });
  const topIssues = Object.entries(issueCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([issue, count]) => ({ issue, count }));

  // Score history (last 10)
  const scoreHistory = allAnalyses
    .slice(0, 10)
    .reverse()
    .map(a => ({ date: a.date, score: a.overallScore }));

  // Platform distribution
  const platformCount: Record<string, number> = {};
  allAnalyses.forEach(a => {
    const p = a.metadata.dataSources[0] || "website";
    platformCount[p] = (platformCount[p] || 0) + 1;
  });
  const platformDistribution = Object.entries(platformCount)
    .map(([platform, count]) => ({ platform, count }));

  // Improvement rate
  const improved = recentAnalyses.filter(a => a.change && a.change > 0).length;
  const improvementRate = recentAnalyses.length > 0 
    ? Math.round((improved / recentAnalyses.length) * 100) 
    : 0;

  return {
    totalProjects: projects.length,
    totalAnalyses: allAnalyses.length,
    averageScore: avgScore,
    bestScore,
    worstScore,
    scoreTrend,
    recentAnalyses,
    topIssues,
    scoreHistory,
    platformDistribution,
    improvementRate,
  };
}

function getAllProjectAnalyses(): ProjectAnalysis[] {
  const projects = getProjects();
  const all: ProjectAnalysis[] = [];
  projects.forEach(p => {
    all.push(...getProjectAnalyses(p.id));
  });
  return all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// --- Future: Notifications ---

export function getNotifications(): Notification[] {
  try {
    const data = localStorage.getItem(getNotificationsKey());
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function addNotification(notification: Omit<Notification, "id" | "createdAt" | "isRead">): void {
  const notifications = getNotifications();
  notifications.unshift({
    ...notification,
    id: generateId(),
    isRead: false,
    createdAt: new Date().toISOString(),
  });
  localStorage.setItem(getNotificationsKey(), JSON.stringify(notifications.slice(0, 50)));
}

export function markNotificationRead(id: string): void {
  const notifications = getNotifications();
  const index = notifications.findIndex(n => n.id === id);
  if (index >= 0) {
    notifications[index].isRead = true;
    localStorage.setItem(getNotificationsKey(), JSON.stringify(notifications));
  }
}

// --- Future: Scheduled Analysis ---

export function getScheduledAnalyses(): ScheduledAnalysis[] {
  try {
    const data = localStorage.getItem(getSchedulesKey());
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveScheduledAnalysis(schedule: ScheduledAnalysis): void {
  const schedules = getScheduledAnalyses();
  const index = schedules.findIndex(s => s.id === schedule.id);
  if (index >= 0) {
    schedules[index] = schedule;
  } else {
    schedules.push(schedule);
  }
  localStorage.setItem(getSchedulesKey(), JSON.stringify(schedules));
}

// --- Future: Competitor Tracking ---

export function getCompetitorTrackings(): CompetitorTracking[] {
  try {
    const data = localStorage.getItem(getCompetitorsKey());
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveCompetitorTracking(tracking: CompetitorTracking): void {
  const trackings = getCompetitorTrackings();
  const index = trackings.findIndex(t => t.id === tracking.id);
  if (index >= 0) {
    trackings[index] = tracking;
  } else {
    trackings.push(tracking);
  }
  localStorage.setItem(getCompetitorsKey(), JSON.stringify(trackings));
}