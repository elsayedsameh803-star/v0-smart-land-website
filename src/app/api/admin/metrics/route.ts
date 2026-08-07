import { NextRequest, NextResponse } from "next/server";
import {
  verifySessionToken,
  isAdminConfigured,
  SESSION_COOKIE_NAME,
} from "@/lib/admin-auth";
import {
  getAdminUsageStats,
  getLoginFailures,
  getLoginRateLimit,
} from "@/lib/admin-stats";

export const dynamic = "force-dynamic";

async function isAuthed(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  return token ? verifySessionToken(token) : false;
}

export async function GET(request: NextRequest) {
  if (!(await isAuthed(request))) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const usage = getAdminUsageStats();
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const rateLimit = getLoginRateLimit();

  return NextResponse.json({
    success: true,
    usage,
    security: {
      adminConfigured: isAdminConfigured(),
      ssrfProtectionEnabled: true,
      rateLimit,
      loginFailuresForYou: getLoginFailures(ip),
      healthChecks: {
        passwordAuth: isAdminConfigured(),
        hsts: true,
        xContentTypeOptions: true,
        xFrameOptions: true,
        referrerPolicy: true,
        permissionsPolicy: true,
        poweredByHidden: true,
        httpOnlyCookies: true,
      },
    },
    system: {
      nodeVersion: process.version || "unknown",
      platform: process.platform || "unknown",
      nextVersion: "14.2.15",
      uptime: process.uptime ? Math.round(process.uptime()) : 0,
      memoryRssMb: process.memoryUsage
        ? Math.round(process.memoryUsage().rss / 1024 / 1024)
        : 0,
      timestamp: new Date().toISOString(),
    },
    version: "1.0.0",
  });
}
