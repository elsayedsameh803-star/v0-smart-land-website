import { NextRequest, NextResponse } from "next/server";
import {
  isAdminConfigured,
  createSessionToken,
  safeEqual,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE,
} from "@/lib/admin-auth";
import { recordLoginFailure, resetLoginFailures } from "@/lib/admin-stats";

export const dynamic = "force-dynamic";

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function POST(request: NextRequest) {
  if (!isAdminConfigured()) {
    return NextResponse.json(
      {
        success: false,
        error:
          "Admin access is not configured yet. Set the ADMIN_PASSWORD environment variable.",
      },
      { status: 503 }
    );
  }

  let password = "";
  try {
    const body = await request.json();
    if (typeof body?.password === "string") password = body.password;
  } catch {
    // invalid JSON body -> treated as empty password
  }

  if (!password) {
    return NextResponse.json(
      { success: false, error: "Password is required." },
      { status: 400 }
    );
  }

  const ip = getClientIp(request);
  const { locked } = recordLoginFailure(ip);
  if (locked) {
    return NextResponse.json(
      {
        success: false,
        error: "Too many failed attempts. Please wait a few minutes and try again.",
      },
      { status: 429 }
    );
  }

  const configuredPassword = process.env.ADMIN_PASSWORD || "";
  if (safeEqual(password, configuredPassword)) {
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
  }

  return NextResponse.json(
    { success: false, error: "Invalid password." },
    { status: 401 }
  );
}
