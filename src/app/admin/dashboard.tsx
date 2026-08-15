"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  BarChart3,
  ShieldCheck,
  Cpu,
  LogOut,
  Globe,
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Loader2,
  Languages,
  RefreshCw,
  Lock,
  Server,
  Zap,
  Shield,
  FileWarning,
  Database,
  CreditCard,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { cn } from "@/lib/utils";

type PlatformDist = { name: string; count: number };
type ActivityPoint = { date: string; count: number };

interface MetricsResponse {
  success: boolean;
  usage: {
    totalAnalyses: number;
    totalFailures: number;
    successCount: number;
    platformDistribution: PlatformDist[];
    recentActivity: ActivityPoint[];
  };
  security: {
    adminConfigured: boolean;
    ssrfProtectionEnabled: boolean;
    rateLimit: { maxAttempts: number; windowMinutes: number };
    loginFailuresForYou: number;
    healthChecks: Record<string, boolean>;
  };
  system: {
    nodeVersion: string;
    platform: string;
    nextVersion: string;
    uptime: number;
    memoryRssMb: number;
    timestamp: string;
  };
  version: string;
}

const PIE_COLORS = ["#eab308", "#f59e0b", "#d97706", "#a16207", "#854d0e", "#6366f1"];

const columns: Record<"ar" | "en", Record<string, string>> = {
  ar: {
    brand: "شركة سمارت لاند",
    role: "لوحة تحكم مالك الموقع",
    overview: "نظرة عامة",
    analytics: "التحليلات",
    security: "الأمان",
    system: "النظام",
    overviewDesc: "أداء المنصة في لمحة",
    analyticsDesc: "إحصاءات التحليلات والمنصات",
    securityDesc: "مركز الحماية وتقييد الوصول",
    systemDesc: "معلومات الخادم وصحة النظام",
    totalAnalyses: "إجمالي التحليلات",
    successRate: "نسبة النجاح",
    failures: "حالات الفشل",
    platforms: "المنصات",
    success: "نجاح",
    failed: "فشل",
    activity: "النشاط اليومي",
    distribution: "توزيع المنصات",
    noData: "لا توجد بيانات بعد",
    protection: "حماية الوصول",
    ssrf: "حماية SSRF (منع الطلبات الداخلية)",
    rateLimit: "تحديد معدل تسجيل الدخول",
    rateHint: "محاولة لكل نافذة زمنية",
    loginFailures: "محاولات فاشلة (لك)",
    headers: "رؤوس الأمان",
    httpOnly: "كوكيز HttpOnly",
    hsts: "HSTS مفعّل",
    xContentTypeOptions: "منع تخمين نوع المحتوى",
    xFrameOptions: "منع التضمين (Clickjacking)",
    referrerPolicy: "سياسة الإحالة",
    permissionsPolicy: "سياسة الأذونات",
    poweredByHidden: "إخفاء رأس Powered-By",
    enabled: "مفعّل",
    disabled: "غير مفعّل",
    secured: "آمن",
    insecure: "يحتاج انتباهاً",
    systemTitle: "معلومات الخادم",
    node: "إصدار Node.js",
    platform: "المنصة",
    next: "إصدار Next.js",
    uptime: "مدة التشغيل",
    memory: "الذاكرة (RSS)",
    version: "إصدار اللوحة",
    refresh: "تحديث",
    logout: "تسجيل الخروج",
    visitSite: "زيارة الموقع",
    paymob: "Paymob — الدفع",
    paymobDesc: "بوابة الدفع والاشتراكات والعمليات",
    openPaymob: "فتح إدارة Paymob",
    payments: "المدفوعات",
    loading: "جارٍ تحميل البيانات…",
    errorLoading: "تعذّر تحميل بيانات اللوحة.",
    minutes: "دقيقة",
    secondsStr: "ثانية",
    healthOk: "جميع الأنظمة تعمل بشكل سليم",
    featured: "بطاقتك",
    exit: "خروج",
  },
  en: {
    brand: "Smart Land Co.",
    role: "Site Owner Control Panel",
    overview: "Overview",
    analytics: "Analytics",
    security: "Security",
    system: "System",
    overviewDesc: "Platform performance at a glance",
    analyticsDesc: "Analytics & platform statistics",
    securityDesc: "Protection center & access control",
    systemDesc: "Server info & system health",
    totalAnalyses: "Total Analyses",
    successRate: "Success Rate",
    failures: "Failures",
    platforms: "Platforms",
    success: "Success",
    failed: "Failed",
    activity: "Daily Activity",
    distribution: "Platform Distribution",
    noData: "No data yet",
    protection: "Access Protection",
    ssrf: "SSRF protection (blocks internal requests)",
    rateLimit: "Login rate limiting",
    rateHint: "attempts per window",
    loginFailures: "Failed attempts (you)",
    headers: "Security Headers",
    httpOnly: "HttpOnly cookies",
    hsts: "HSTS enabled",
    xContentTypeOptions: "X-Content-Type-Options",
    xFrameOptions: "X-Frame-Options (Clickjacking)",
    referrerPolicy: "Referrer policy",
    permissionsPolicy: "Permissions policy",
    poweredByHidden: "Powered-By hidden",
    enabled: "Enabled",
    disabled: "Disabled",
    secured: "Secured",
    insecure: "Needs attention",
    systemTitle: "Server Information",
    node: "Node.js version",
    platform: "Platform",
    next: "Next.js version",
    uptime: "Uptime",
    memory: "Memory (RSS)",
    version: "Panel version",
    refresh: "Refresh",
    logout: "Sign out",
    visitSite: "Visit site",
    paymob: "Paymob",
    paymobDesc: "Payment gateway, subscriptions & transactions",
    openPaymob: "Open Paymob Management",
    payments: "Payments",
    loading: "Loading data…",
    errorLoading: "Failed to load panel data.",
    minutes: "min",
    secondsStr: "sec",
    healthOk: "All systems operational",
    featured: "Your card",
    exit: "Exit",
  },
};

type Tab = "overview" | "analytics" | "security" | "system" | "settings";

export default function AdminDashboard() {
  const router = useRouter();
  const [lang, setLang] = useState<"ar" | "en">("ar");
  const [tab, setTab] = useState<Tab>("overview");
  const [data, setData] = useState<MetricsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const t = columns[lang];
  const dir = lang === "ar" ? "rtl" : "ltr";

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/metrics");
      if (res.status === 401) {
        router.replace("/admin/login");
        return;
      }
      if (!res.ok) throw new Error("bad response");
      const json: MetricsResponse = await res.json();
      setData(json);
    } catch {
      setError(t.errorLoading);
    } finally {
      setLoading(false);
    }
  }, [router, t.errorLoading]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleLogout() {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } catch {
      // ignore
    }
    router.replace("/admin/login");
    router.refresh();
  }

  const usage = data?.usage;
  const total = usage?.totalAnalyses ?? 0;
  const success = usage?.successCount ?? 0;
  const fail = usage?.totalFailures ?? 0;
  const successRate = total > 0 ? Math.round((success / total) * 100) : 100;
  const platformData = usage?.platformDistribution ?? [];
  const activityData = usage?.recentActivity ?? [];

  const navItems: Array<{ id: Tab; label: string; icon: typeof LayoutDashboard }> = [
    { id: "overview", label: t.overview, icon: LayoutDashboard },
    { id: "analytics", label: t.analytics, icon: BarChart3 },
    { id: "security", label: t.security, icon: ShieldCheck },
    { id: "system", label: t.system, icon: Cpu },
    { id: "settings", label: "Settings", icon: Database },
  ];

  return (
    <div dir={dir} className="min-h-screen bg-dark-950 text-gold-100">
      {/* === Top bar === */}
      <header className="sticky top-0 z-40 border-b border-gold-500/10 bg-dark-900/80 backdrop-blur-md">
        <div className="flex items-center justify-between px-4 lg:px-8 h-16">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center text-dark-950 shadow-lg shadow-gold-500/25">
              <Shield className="w-5 h-5" />
            </div>
            <div className="leading-tight">
              <p className="font-bold text-white text-sm">{t.brand}</p>
              <p className="text-[10px] text-dark-400">{t.role}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setLang(lang === "ar" ? "en" : "ar")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gold-500/20 text-gold-300 text-xs hover:bg-gold-500/10 transition"
            >
              <Languages className="w-4 h-4" />
              {lang === "ar" ? "English" : "العربية"}
            </button>
            <a
              href="/"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gold-500/20 text-gold-300 text-xs hover:bg-gold-500/10 transition"
            >
              <Globe className="w-4 h-4" />
              {t.visitSite}
            </a>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/25 text-red-300 text-xs hover:bg-red-500/20 transition"
            >
              <LogOut className="w-4 h-4" />
              {t.logout}
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* === Sidebar (desktop) === */}
        <aside className="hidden lg:flex flex-col w-60 shrink-0 border-e border-gold-500/10 bg-dark-900/40 p-4 gap-1 sticky top-16 h-[calc(100vh-4rem)]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                  active
                    ? "bg-gold-500/15 text-gold-300 border border-gold-500/25"
                    : "text-dark-400 hover:text-gold-300 hover:bg-gold-500/5 border border-transparent"
                )}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
          <div className="mt-auto pt-4">
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
              <p className="flex items-center gap-2 text-xs text-emerald-300 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {t.healthOk}
              </p>
            </div>
          </div>
        </aside>


        {/* === Main content === */}
        <main className="flex-1 min-w-0 p-4 lg:p-8">
          {/* Mobile nav tabs */}
          <nav className="lg:hidden flex flex-wrap gap-2 mb-5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = tab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTab(item.id)}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all",
                    active
                      ? "bg-gold-500/15 text-gold-300 border border-gold-500/25"
                      : "text-dark-400 border border-transparent hover:text-gold-300 hover:bg-gold-500/5"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-3">
              <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
              <p className="text-sm text-dark-400">{t.loading}</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-32 gap-3 text-center">
              <AlertTriangle className="w-10 h-10 text-red-400" />
              <p className="text-sm text-red-300">{error}</p>
              <button
                type="button"
                onClick={load}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gold-500/25 text-gold-300 text-sm hover:bg-gold-500/10 transition"
              >
                <RefreshCw className="w-4 h-4" />
                {t.refresh}
              </button>
            </div>
          ) : (
            <>
              {tab === "overview" && (
                <OverviewSection
                  t={t}
                  dir={dir}
                  total={total}
                  successRate={successRate}
                  fail={fail}
                  platforms={platformData.length}
                  platformData={platformData}
                  activityData={activityData}
                />
              )}
              {tab === "analytics" && (
                <AnalyticsSection
                  t={t}
                  platformData={platformData}
                  activityData={activityData}
                />
              )}
              {tab === "security" && data && (
                <SecuritySection t={t} metrics={data} />
              )}
              {tab === "system" && data && (
                <SystemSection t={t} system={data.system} version={data.version} />
              )}
              {tab === "settings" && (
                <div className="rounded-2xl bg-dark-900/70 border border-gold-500/10 p-8">
                  <div className="flex flex-col gap-3">
                    <div className="inline-flex items-center gap-3 rounded-2xl bg-gold-500/10 border border-gold-500/20 p-4">
                      <Database className="w-5 h-5 text-gold-300" />
                      <div>
                        <h2 className="text-lg font-bold text-white">Admin Settings</h2>
                        <p className="text-sm text-dark-400">Open the runtime configuration panel and audit log for the admin console.</p>
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-2xl bg-dark-800/80 border border-gold-500/10 p-5">
                        <p className="text-sm text-dark-400">Use this panel to manage maintenance mode, default admin locale, theme, and runtime security options.</p>
                      </div>
                      <div className="rounded-2xl bg-dark-800/80 border border-gold-500/10 p-5">
                        <p className="text-sm text-dark-400">Settings are stored in memory on the current instance and require a persistent store for cross-instance durability.</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => router.push("/admin/settings")}
                      className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-gold-600 to-gold-500 px-5 py-3 text-sm font-bold text-dark-950 hover:from-gold-500 hover:to-gold-400 transition"
                    >
                      <span>Open Admin Settings</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => router.push("/admin/payments")}
                      className="inline-flex items-center gap-2 rounded-lg bg-gold-500/10 border border-gold-500/25 px-5 py-3 text-sm font-bold text-gold-300 hover:bg-gold-500/20 transition"
                    >
                      <span>Subscriptions &amp; Payments</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

// ===================== Shared sub-components =====================

function SectionHeader({
  icon: Icon,
  title,
  desc,
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center text-dark-950 shadow-lg shadow-gold-500/20">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <h2 className="text-lg font-bold text-white">{title}</h2>
        <p className="text-xs text-dark-400">{desc}</p>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  tone = "gold",
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  hint?: string;
  tone?: "gold" | "emerald" | "rose" | "blue";
}) {
  const tones = {
    gold: "from-gold-500 to-gold-600 text-dark-950 shadow-gold-500/25",
    emerald: "from-emerald-500 to-emerald-600 text-dark-950 shadow-emerald-500/25",
    rose: "from-rose-500 to-rose-600 text-white shadow-rose-500/25",
    blue: "from-midnight-500 to-midnight-600 text-white shadow-midnight-500/25",
  };
  return (
    <div className="rounded-2xl bg-dark-800/60 border border-gold-500/10 gold-glow-hover card-hover-effect p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={cn("w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg", tones[tone])}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className="text-3xl font-bold text-white">{value}</p>
      <p className="text-xs text-dark-400 mt-1">{label}</p>
      {hint && <p className="text-[10px] text-dark-500 mt-0.5">{hint}</p>}
    </div>
  );
}

const tooltipStyle = {
  background: "#0f172a",
  border: "1px solid rgba(234,179,8,0.25)",
  borderRadius: "12px",
  color: "#fde047",
  fontSize: "12px",
};

// ===================== Overview =====================

function OverviewSection({
  t,
  total,
  successRate,
  fail,
  platforms,
  platformData,
  activityData,
  dir,
}: {
  t: Record<string, string>;
  dir: string;
  total: number;
  successRate: number;
  fail: number;
  platforms: number;
  platformData: PlatformDist[];
  activityData: ActivityPoint[];
}) {
  return (
    <section>
      <SectionHeader icon={LayoutDashboard} title={t.overview} desc={t.overviewDesc} />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard icon={BarChart3} label={t.totalAnalyses} value={String(total)} />
        <StatCard icon={CheckCircle2} label={t.successRate} value={`${successRate}%`} tone="emerald" />
        <StatCard icon={AlertTriangle} label={t.failures} value={String(fail)} tone="rose" />
        <StatCard icon={Globe} label={t.platforms} value={String(platforms)} tone="blue" />
      </div>

      {/* Paymob quick access — payment gateway & subscriptions */}
      <a
        href="/admin/payments"
        className="group block mb-6 rounded-2xl border border-gold-500/25 bg-gradient-to-r from-dark-800/80 via-dark-800/40 to-dark-800/80 p-5 hover:border-gold-500/50 hover:from-dark-800/90 transition-all duration-300 gold-glow-hover"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center text-dark-950 shadow-lg shadow-gold-500/25 group-hover:scale-105 transition-transform duration-200">
            <CreditCard className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-bold text-white text-base">{t.paymob}</p>
            <p className="text-xs text-dark-400 mt-0.5">{t.paymobDesc}</p>
          </div>
          <span className="hidden sm:inline-flex items-center gap-2 rounded-lg bg-gold-500/15 border border-gold-500/25 px-4 py-2 text-sm font-bold text-gold-300 group-hover:bg-gold-500/25 transition">
            {t.openPaymob}
          </span>
        </div>
      </a>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 rounded-2xl bg-dark-800/60 border border-gold-500/10 p-5">
          <h3 className="text-sm font-semibold text-gold-300 mb-4">{t.activity}</h3>
          {activityData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={activityData}>
                <defs>
                  <linearGradient id="act" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#eab308" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#eab308" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(234,179,8,0.08)" />
                <XAxis dataKey="date" stroke="#475569" fontSize={11} tickLine={false} />
                <YAxis stroke="#475569" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="count" stroke="#eab308" strokeWidth={2} fill="url(#act)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState message={t.noData} />
          )}
        </div>

        <div className="lg:col-span-2 rounded-2xl bg-dark-800/60 border border-gold-500/10 p-5">
          <h3 className="text-sm font-semibold text-gold-300 mb-4">{t.distribution}</h3>
          {platformData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={platformData} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={40} paddingAngle={3}>
                    {platformData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-2 space-y-1.5">
                {platformData.slice(0, 5).map((p, i) => (
                  <div key={p.name} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 text-dark-300">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                      {p.name}
                    </span>
                    <span className="text-white font-medium">{p.count}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <EmptyState message={t.noData} />
          )}
        </div>
      </div>
    </section>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center">
      <Database className="w-8 h-8 text-dark-500 mb-2" />
      <p className="text-sm text-dark-500">{message}</p>
    </div>
  );
}


// ===================== Analytics =====================

function AnalyticsSection({
  t,
  platformData,
  activityData,
}: {
  t: Record<string, string>;
  platformData: PlatformDist[];
  activityData: ActivityPoint[];
}) {
  const maxCount = Math.max(1, ...platformData.map((p) => p.count));
  return (
    <section>
      <SectionHeader icon={BarChart3} title={t.analytics} desc={t.analyticsDesc} />

      <div className="rounded-2xl bg-dark-800/60 border border-gold-500/10 p-5 mb-4">
        <h3 className="text-sm font-semibold text-gold-300 mb-4">{t.activity}</h3>
        {activityData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={activityData}>
              <defs>
                <linearGradient id="actBig" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(234,179,8,0.08)" />
              <XAxis dataKey="date" stroke="#475569" fontSize={11} tickLine={false} />
              <YAxis stroke="#475569" fontSize={11} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="count" stroke="#f59e0b" strokeWidth={2} fill="url(#actBig)" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState message={t.noData} />
        )}
      </div>

      <div className="rounded-2xl bg-dark-800/60 border border-gold-500/10 p-5">
        <h3 className="text-sm font-semibold text-gold-300 mb-4">{t.distribution}</h3>
        {platformData.length > 0 ? (
          <div className="space-y-4">
            {platformData.map((p, i) => (
              <div key={p.name}>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-dark-300">{p.name}</span>
                  <span className="text-white font-medium">{p.count}</span>
                </div>
                <div className="h-2 rounded-full bg-dark-700 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.round((p.count / maxCount) * 100)}%`,
                      background: PIE_COLORS[i % PIE_COLORS.length],
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState message={t.noData} />
        )}
      </div>
    </section>
  );
}

// ===================== Security =====================

function SecuritySection({
  t,
  metrics,
}: {
  t: Record<string, string>;
  metrics: MetricsResponse;
}) {
  const sec = metrics.security;
  const checks: Array<{ key: string; label: string; ok: boolean }> = [
    { key: "httpOnly", label: t.httpOnly, ok: sec.healthChecks.httpOnly === true },
    { key: "hsts", label: t.hsts, ok: sec.healthChecks.hsts === true },
    { key: "xContentTypeOptions", label: t.xContentTypeOptions, ok: sec.healthChecks.xContentTypeOptions === true },
    { key: "xFrameOptions", label: t.xFrameOptions, ok: sec.healthChecks.xFrameOptions === true },
    { key: "referrerPolicy", label: t.referrerPolicy, ok: sec.healthChecks.referrerPolicy === true },
    { key: "permissionsPolicy", label: t.permissionsPolicy, ok: sec.healthChecks.permissionsPolicy === true },
    { key: "poweredByHidden", label: t.poweredByHidden, ok: sec.healthChecks.poweredByHidden === true },
  ];

  return (
    <section>
      <SectionHeader icon={ShieldCheck} title={t.security} desc={t.securityDesc} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl bg-dark-800/60 border border-gold-500/10 p-5">
          <h3 className="text-sm font-semibold text-gold-300 mb-4 flex items-center gap-2">
            <Lock className="w-4 h-4" />
            {t.protection}
          </h3>
          <ul className="space-y-3">
            <SecurityRow
              label={t.ssrf}
              ok={sec.ssrfProtectionEnabled}
              okText={t.enabled}
              badText={t.disabled}
            />
            <SecurityRow
              label={`${t.rateLimit} · ${sec.rateLimit.maxAttempts} ${t.rateHint} / ${sec.rateLimit.windowMinutes} ${t.minutes}`}
              ok
              okText={t.enabled}
              badText={t.disabled}
            />
            <SecurityRow
              label={`${t.loginFailures}: ${sec.loginFailuresForYou}`}
              ok={sec.loginFailuresForYou === 0}
              okText={t.secured}
              badText={t.insecure}
            />
            <SecurityRow
              label={t.adminConfigured ?? "Admin configured"}
              ok={sec.adminConfigured}
              okText={t.enabled}
              badText={t.disabled}
            />
          </ul>
        </div>

        <div className="rounded-2xl bg-dark-800/60 border border-gold-500/10 p-5">
          <h3 className="text-sm font-semibold text-gold-300 mb-4 flex items-center gap-2">
            <FileWarning className="w-4 h-4" />
            {t.headers}
          </h3>
          <ul className="space-y-3">
            {checks.map((c) => (
              <SecurityRow key={c.key} label={c.label} ok={c.ok} okText={t.enabled} badText={t.disabled} />
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function SecurityRow({
  label,
  ok,
  okText,
  badText,
}: {
  label: string;
  ok: boolean;
  okText: string;
  badText: string;
}) {
  return (
    <li className="flex items-center justify-between gap-3 text-sm">
      <span className="text-dark-200 flex items-center gap-2">
        {ok ? (
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
        ) : (
          <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
        )}
        {label}
      </span>
      <span
        className={cn(
          "text-[11px] font-medium px-2 py-0.5 rounded-full",
          ok ? "bg-emerald-500/10 text-emerald-300" : "bg-rose-500/10 text-rose-300"
        )}
      >
        {ok ? okText : badText}
      </span>
    </li>
  );
}

// ===================== System =====================

function SystemSection({
  t,
  system,
  version,
}: {
  t: Record<string, string>;
  system: MetricsResponse["system"];
  version: string;
}) {
  const rows: Array<{ icon: React.ElementType; label: string; value: string }> = [
    { icon: Server, label: t.node, value: system.nodeVersion },
    { icon: Cpu, label: t.platform, value: system.platform },
    { icon: Zap, label: t.next, value: system.nextVersion },
    { icon: Activity, label: t.uptime, value: formatUptime(system.uptime) },
    { icon: Database, label: t.memory, value: `${system.memoryRssMb} MB` },
    { icon: Shield, label: t.version, value: version },
  ];

  return (
    <section>
      <SectionHeader icon={Cpu} title={t.systemTitle} desc={t.systemDesc} />
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {rows.map((r) => {
          const Icon = r.icon;
          return (
            <div key={r.label} className="rounded-2xl bg-dark-800/60 border border-gold-500/10 p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-dark-700 flex items-center justify-center">
                <Icon className="w-5 h-5 text-gold-400" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-dark-400">{r.label}</p>
                <p className="text-sm font-semibold text-white truncate">{r.value}</p>
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-[11px] text-dark-500 mt-6 text-center">
        {t.healthOk} · {system.timestamp}
      </p>
    </section>
  );
}

function formatUptime(seconds: number): string {
  if (!seconds || seconds < 60) return `${seconds ?? 0}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const rem = minutes % 60;
  return `${hours}h ${rem}m`;
}

