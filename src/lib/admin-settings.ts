export type AdminLocale = "en" | "ar";
export type AdminThemeOption = "system" | "dark" | "light";

export interface AdminSettings {
  maintenanceMode: boolean;
  allowAnonymousAnalysis: boolean;
  defaultLocale: AdminLocale;
  theme: AdminThemeOption;
  adminNotifications: boolean;
  enableSSRFProtection: boolean;
}

export interface AuditLogEntry {
  id: string;
  createdAt: string;
  actor: "admin";
  action: string;
  details: string;
}

const defaultAdminSettings: AdminSettings = {
  maintenanceMode: false,
  allowAnonymousAnalysis: false,
  defaultLocale: "en",
  theme: "dark",
  adminNotifications: true,
  enableSSRFProtection: true,
};

let currentAdminSettings: AdminSettings = { ...defaultAdminSettings };
const auditLog: AuditLogEntry[] = [];

function createAuditId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function getAdminSettings(): AdminSettings {
  return { ...currentAdminSettings };
}

export function updateAdminSettings(partial: Partial<AdminSettings>): AdminSettings {
  const previous = { ...currentAdminSettings };
  currentAdminSettings = { ...currentAdminSettings, ...partial };
  recordAdminAudit(
    "admin.settings.updated",
    `Updated settings from ${JSON.stringify(previous)} to ${JSON.stringify(currentAdminSettings)}`
  );
  return getAdminSettings();
}

export function resetAdminSettings(): AdminSettings {
  currentAdminSettings = { ...defaultAdminSettings };
  recordAdminAudit("admin.settings.reset", "Admin settings were reset to defaults.");
  return getAdminSettings();
}

export function recordAdminAudit(action: string, details: string): void {
  auditLog.unshift({
    id: createAuditId(),
    createdAt: new Date().toISOString(),
    actor: "admin",
    action,
    details,
  });
  if (auditLog.length > 200) {
    auditLog.length = 200;
  }
}

export function getAdminAuditLogs(limit = 50): AuditLogEntry[] {
  return auditLog.slice(0, limit);
}
