// =============================================================================
// Smart Land - Admin metrics & security counters (server-side, best-effort)
//
// NOTE: These counters live in module memory so they are scoped to a single
// serverless instance and are reset on cold starts. They are intended to power
// the admin console's live view and login rate limiting. For durable analytics
// across instances a database should be introduced later.
// =============================================================================

const MAX_ATTEMPTS = 5;
const RATE_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

type Attempt = { count: number; firstAt: number };

const loginAttempts = new Map<string, Attempt>();

let totalAnalyses = 0;
let totalFailures = 0;
const platformCounts = new Map<string, number>();
const recentActivity: Array<{ date: string; count: number }> = [];

/**
 * Records a failed login for an IP. Returns true once the IP is locked out.
 */
export function recordLoginFailure(ip: string): { locked: boolean } {
  const now = Date.now();
  const current = loginAttempts.get(ip);
  if (!current || now - current.firstAt > RATE_WINDOW_MS) {
    loginAttempts.set(ip, { count: 1, firstAt: now });
    return { locked: false };
  }
  current.count += 1;
  return { locked: current.count >= MAX_ATTEMPTS };
}

export function resetLoginFailures(ip: string): void {
  loginAttempts.delete(ip);
}

export function getLoginFailures(ip: string): number {
  return loginAttempts.get(ip)?.count ?? 0;
}

export function getLoginRateLimit(): { maxAttempts: number; windowMinutes: number } {
  return { maxAttempts: MAX_ATTEMPTS, windowMinutes: Math.floor(RATE_WINDOW_MS / 60000) };
}

/**
 * Records an analysis event (platform + success).
 */
export function recordAnalysis(platform: string, ok: boolean): void {
  totalAnalyses += 1;
  if (!ok) totalFailures += 1;
  const key = (platform && platform.trim().toLowerCase()) || "website";
  platformCounts.set(key, (platformCounts.get(key) ?? 0) + 1);

  const day = new Date().toISOString().slice(0, 10);
  const last = recentActivity[recentActivity.length - 1];
  if (last && last.date === day) last.count += 1;
  else recentActivity.push({ date: day, count: 1 });
  if (recentActivity.length > 30) recentActivity.shift();
}

export function getAdminUsageStats() {
  return {
    totalAnalyses,
    totalFailures,
    successCount: Math.max(totalAnalyses - totalFailures, 0),
    platformDistribution: Array.from(platformCounts.entries()).map(
      ([name, count]) => ({ name, count })
    ),
    recentActivity: recentActivity.map((a) => ({ ...a })),
  };
}
