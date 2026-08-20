import { NextRequest, NextResponse } from "next/server";
import {
  createSessionToken,
  safeEqual,
  isAdminConfigured,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE,
} from "@/lib/admin-auth";
import {
  recordLoginFailure,
  resetLoginFailures,
  getLoginFailures,
  getLoginRateLimit,
} from "@/lib/admin-stats";

export const dynamic = "force-dynamic";

const MAX_BODY = 2000;

function clientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

/**
 * Password-based admin login.
 *
 * The password is set by the site owner via the ADMIN_PASSWORD environment
 * variable (there is NO hardcoded password). Successful logins issue a short-
 * lived, HMAC-signed HttpOnly session cookie that the middleware verifies
 * before granting access to /admin.
 *
 * Security: constant-time comparison (safeEqual), per-IP rate limiting that
 * locks an IP after several failures, and fail-closed when ADMIN_PASSWORD is
 * not set (no one can log in).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const password = typeof body?.password === "string" ? body.password : "";
    const ip = clientIp(request);

    if (!password || password.length > MAX_BODY) {
      return NextResponse.json(
        { success: false, error: "Password is required" },
        { status: 400 }
      );
    }

    if (!isAdminConfigured()) {
      return NextResponse.json(
        {
          success: false,
          error: "NOT_CONFIGURED",
          message:
            "Admin password is not configured. Set ADMIN_PASSWORD in your environment variables.",
        },
        { status: 503 }
      );
    }

    const expected = process.env.ADMIN_PASSWORD || "";
    const valid = safeEqual(password, expected);

    if (!valid) {
      const { locked } = recordLoginFailure(ip);
      if (locked) {
        return NextResponse.json(
          { success: false, error: "LOCKED" },
          { status: 429 }
        );
      }
      const { maxAttempts } = getLoginRateLimit();
      const attemptsLeft = Math.max(maxAttempts - getLoginFailures(ip), 0);
      return NextResponse.json(
        { success: false, error: "WRONG_PASSWORD", attemptsLeft },
        { status: 401 }
      );
    }

    resetLoginFailures(ip);
    const token = await createSessionToken();
    const response = NextResponse.json({ success: true });
    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE,
    });
    return response;
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: "SERVER_ERROR",
        message: error?.message || "Login failed",
      },
      { status: 500 }
    );
  }
}
