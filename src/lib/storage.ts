import type { AnalysisResult, AnalysisHistory, CompetitorComparison } from "./types";

const STORAGE_PREFIX = "smart-land-";

export function saveAnalysis(result: AnalysisResult): void {
  try {
    const key = `${STORAGE_PREFIX}analysis-${result.id}`;
    localStorage.setItem(key, JSON.stringify(result));
    saveToHistory(result);
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