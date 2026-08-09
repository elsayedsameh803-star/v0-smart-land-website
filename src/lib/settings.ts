import { getDirection } from "./i18n";

export type LanguageOption = "en" | "ar";
export type ThemeOption = "system" | "dark" | "light";
export type DetailLevel = "compact" | "standard" | "detailed";

export interface AnalysisSettings {
  saveHistory: boolean;
  keepHistory: boolean;
  detailLevel: DetailLevel;
  pdf: {
    includeStrengths: boolean;
    includeWeaknesses: boolean;
    includeCriticalIssues: boolean;
    includeFindings: boolean;
  };
  hideMinorSections: boolean;
}

export interface NotificationSettings {
  analysisComplete: boolean;
  reports: boolean;
  account: boolean;
  offers: boolean;
}

export interface PrivacySettings {
  allowExport: boolean;
  dataRetentionDays: number;
}

export interface AccountSettings {
  name: string;
  email: string;
  passwordHash: string | null;
}

export interface SubscriptionInfo {
  plan: string;
  status: "active" | "trial" | "expired" | "free";
  renewalDate: string | null;
}

export interface UserSettings {
  language: LanguageOption;
  theme: ThemeOption;
  notifications: NotificationSettings;
  analysis: AnalysisSettings;
  privacy: PrivacySettings;
  account: AccountSettings;
  subscription: SubscriptionInfo;
}

const SETTINGS_KEY = "smart-land-user-settings";

const defaultSettings: UserSettings = {
  language: "en",
  theme: "dark",
  notifications: {
    analysisComplete: true,
    reports: true,
    account: true,
    offers: false,
  },
  analysis: {
    saveHistory: true,
    keepHistory: true,
    detailLevel: "standard",
    pdf: {
      includeStrengths: true,
      includeWeaknesses: true,
      includeCriticalIssues: true,
      includeFindings: true,
    },
    hideMinorSections: false,
  },
  privacy: {
    allowExport: true,
    dataRetentionDays: 365,
  },
  account: {
    name: "",
    email: "",
    passwordHash: null,
  },
  subscription: {
    plan: "free",
    status: "active",
    renewalDate: null,
  },
};

function safeParseSettings(value: string | null): UserSettings {
  if (!value) return defaultSettings;

  try {
    const parsed = JSON.parse(value) as Partial<UserSettings>;
    return { ...defaultSettings, ...parsed, language: (parsed.language === "ar" ? "ar" : "en") };
  } catch {
    return defaultSettings;
  }
}

export function getUserSettings(): UserSettings {
  if (typeof window === "undefined") return defaultSettings;
  try {
    return safeParseSettings(window.localStorage.getItem(SETTINGS_KEY));
  } catch {
    return defaultSettings;
  }
}

export function saveUserSettings(settings: UserSettings): UserSettings {
  if (typeof window === "undefined") return settings;
  try {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // ignore write failures in private browsing or strict mode
  }
  return settings;
}

export function resetUserSettings(): UserSettings {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(SETTINGS_KEY);
    window.localStorage.removeItem("smart-land-user-id");
  }
  return defaultSettings;
}

export function updateUserSettings(partial: Partial<UserSettings>): UserSettings {
  const current = getUserSettings();
  const updated = { ...current, ...partial };
  return saveUserSettings(updated);
}

export function applyUserTheme(theme: ThemeOption = "system") {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const selectedTheme = theme === "system" ? (prefersDark ? "dark" : "light") : theme;

  root.classList.remove("theme-dark", "theme-light");
  root.classList.add(`theme-${selectedTheme}`);
}

export function applyUserLanguage(language: LanguageOption = "en") {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.lang = language;
  root.dir = getDirection(language);
  document.cookie = `NEXT_LOCALE=${language};path=/;max-age=${60 * 60 * 24 * 365}`;
}
