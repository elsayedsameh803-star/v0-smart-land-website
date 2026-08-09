"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Switch } from "@/components/ui/Switch";
import { ArrowLeft, ShieldCheck, Globe, Database, RefreshCw } from "lucide-react";

interface AdminSettingsState {
  maintenanceMode: boolean;
  allowAnonymousAnalysis: boolean;
  defaultLocale: "en" | "ar";
  theme: "system" | "dark" | "light";
  adminNotifications: boolean;
  enableSSRFProtection: boolean;
}

const options = {
  theme: [
    { label: "System", value: "system" },
    { label: "Dark", value: "dark" },
    { label: "Light", value: "light" },
  ],
  locale: [
    { label: "English", value: "en" },
    { label: "العربية", value: "ar" },
  ],
};

export default function AdminSettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<AdminSettingsState | null>(null);
  const [saved, setSaved] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [auditLog, setAuditLog] = useState<Array<{ id: string; createdAt: string; actor: string; action: string; details: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
    fetchAuditLog();
  }, []);

  async function fetchSettings() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings");
      if (!res.ok) throw new Error("Unauthorized");
      const json = await res.json();
      setSettings(json.settings || null);
    } catch {
      setSettings(null);
    } finally {
      setLoading(false);
    }
  }

  async function fetchAuditLog() {
    try {
      const res = await fetch("/api/admin/audit-logs");
      if (!res.ok) throw new Error("Unauthorized");
      const json = await res.json();
      setAuditLog(json.auditLog || []);
    } catch {
      setAuditLog([]);
    }
  }

  const handleChange = (partial: Partial<AdminSettingsState>) => {
    setSettings((current) => (current ? { ...current, ...partial } : null));
    setIsDirty(true);
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error("Save failed");
      const json = await res.json();
      if (json.success) {
        setSettings(json.settings);
        setSaved(true);
        setIsDirty(false);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch {
      // ignore
    } finally {
      setSaving(false);
      fetchAuditLog();
    }
  };

  if (loading || !settings) {
    return (
      <div className="min-h-screen bg-dark-950 text-gold-100 flex items-center justify-center p-4">
        <div className="rounded-3xl bg-dark-900 border border-gold-500/10 p-8 text-center">
          <div className="inline-flex items-center justify-center mb-4 w-12 h-12 rounded-full bg-gold-500/10 text-gold-300">
            <RefreshCw className="w-5 h-5 animate-spin" />
          </div>
          <p className="text-sm text-dark-400">Loading admin settings…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950 text-gold-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-gold-300/70">Admin Settings</p>
            <h1 className="text-3xl font-bold text-white">Smart Land Admin Configuration</h1>
            <p className="mt-2 text-dark-400 max-w-2xl">Manage security defaults, availability, and operational controls for the admin console.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="secondary" onClick={() => router.push("/admin")}>Back to Dashboard</Button>
            <Button variant="primary" onClick={handleSave} disabled={!isDirty || saving}>{saving ? "Saving..." : "Save Settings"}</Button>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
          <section className="space-y-6">
            <Card className="p-6">
              <CardHeader>
                <CardTitle>Control Settings</CardTitle>
                <CardDescription>Configure core admin behaviors and platform controls.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Switch
                  label="Enable maintenance mode"
                  checked={settings.maintenanceMode}
                  onChange={(e) => handleChange({ maintenanceMode: e.target.checked })}
                />
                <Switch
                  label="Allow anonymous analysis"
                  checked={settings.allowAnonymousAnalysis}
                  onChange={(e) => handleChange({ allowAnonymousAnalysis: e.target.checked })}
                  helperText="When enabled, users can run audits without an authenticated admin session."
                />
                <Switch
                  label="Admin notifications"
                  checked={settings.adminNotifications}
                  onChange={(e) => handleChange({ adminNotifications: e.target.checked })}
                  helperText="Send admin alerts for critical events and failed logins."
                />
                <Switch
                  label="Enable SSRF protection"
                  checked={settings.enableSSRFProtection}
                  onChange={(e) => handleChange({ enableSSRFProtection: e.target.checked })}
                  helperText="Use the built-in request validation layer for external analysis requests."
                />
              </CardContent>
            </Card>

            <Card className="p-6">
              <CardHeader>
                <CardTitle>Appearance & Locale</CardTitle>
                <CardDescription>Set the admin console default language and theme.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gold-300 mb-2">Default locale</label>
                    <select
                      value={settings.defaultLocale}
                      onChange={(e) => handleChange({ defaultLocale: e.target.value as "en" | "ar" })}
                      className="w-full rounded-xl bg-dark-900 border border-gold-500/20 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-gold-500/50"
                    >
                      {options.locale.map((item) => (
                        <option key={item.value} value={item.value}>{item.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gold-300 mb-2">Theme</label>
                    <select
                      value={settings.theme}
                      onChange={(e) => handleChange({ theme: e.target.value as "system" | "dark" | "light" })}
                      className="w-full rounded-xl bg-dark-900 border border-gold-500/20 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-gold-500/50"
                    >
                      {options.theme.map((item) => (
                        <option key={item.value} value={item.value}>{item.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          <aside className="space-y-6">
            <Card className="p-6">
              <CardHeader>
                <CardTitle>Audit Log</CardTitle>
                <CardDescription>Recent configuration and admin actions.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {loading ? (
                  <p className="text-sm text-dark-400">Loading audit history…</p>
                ) : auditLog.length === 0 ? (
                  <p className="text-sm text-dark-400">No audit events yet.</p>
                ) : (
                  <div className="space-y-3">
                    {auditLog.slice(0, 8).map((entry) => (
                      <div key={entry.id} className="rounded-2xl bg-dark-900 border border-gold-500/10 p-3">
                        <div className="flex items-center justify-between gap-2 text-xs text-dark-400 mb-1">
                          <span>{new Date(entry.createdAt).toLocaleString()}</span>
                          <span className="uppercase tracking-[0.25em] text-gold-300">{entry.actor}</span>
                        </div>
                        <p className="text-sm text-white font-semibold">{entry.action}</p>
                        <p className="mt-1 text-xs text-dark-400 break-words">{entry.details}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="p-6">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl bg-gold-500/10 p-3 text-gold-300">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">Operational notes</h3>
                  <p className="mt-2 text-sm text-dark-400">These settings are stored in memory for the current server instance and are intended for runtime admin control. For persistent storage, connect to a database or config service.</p>
                </div>
              </div>
            </Card>
          </aside>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="text-sm text-dark-400">{saved ? "Settings updated." : "Make changes then save to apply."}</div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={fetchAuditLog}>Refresh Log</Button>
            <Button variant="secondary" onClick={() => router.refresh()}>Reload</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
