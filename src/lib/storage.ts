// ============================================
// Smart Land - Client-Side Storage Utility
// Uses localStorage for data persistence
// ============================================

import type { AnalysisResult, AnalysisHistory } from './types';

const STORAGE_KEYS = {
  results: 'smartland_results',
  history: 'smartland_history',
  adminAuth: 'smartland_admin_auth',
} as const;

// ========== Analysis Results ==========

export function saveResult(result: AnalysisResult): void {
  try {
    const results = getResults();
    results[result.id] = result;
    localStorage.setItem(STORAGE_KEYS.results, JSON.stringify(results));
  } catch (error) {
    console.warn('Failed to save result to localStorage:', error);
  }
}

export function getResult(id: string): AnalysisResult | null {
  try {
    const results = getResults();
    return results[id] || null;
  } catch {
    return null;
  }
}

export function getResults(): Record<string, AnalysisResult> {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.results);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

export function getAllResults(): AnalysisResult[] {
  return Object.values(getResults());
}

// ========== Analysis History ==========

export function saveHistory(url: string, entry: AnalysisHistory): void {
  try {
    const history = getHistoryForUrl(url);
    history.unshift(entry);
    localStorage.setItem(`${STORAGE_KEYS.history}_${url}`, JSON.stringify(history));
  } catch (error) {
    console.warn('Failed to save history to localStorage:', error);
  }
}

export function getHistoryForUrl(url: string): AnalysisHistory[] {
  try {
    const data = localStorage.getItem(`${STORAGE_KEYS.history}_${url}`);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

// ========== Admin Auth ==========

export function saveAdminAuth(token: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.adminAuth, token);
  } catch {
    // Silently fail
  }
}

export function getAdminAuth(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEYS.adminAuth);
  } catch {
    return null;
  }
}

export function clearAdminAuth(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.adminAuth);
  } catch {
    // Silently fail
  }
}

// ========== Utility ==========

export function clearAllData(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.results);
    // Clear all history entries
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_KEYS.history)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  } catch {
    // Silently fail
  }
}