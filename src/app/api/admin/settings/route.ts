import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/admin-auth";
import { getAdminSettings, updateAdminSettings } from "@/lib/admin-settings";

export const dynamic = "force-dynamic";

async function isAuthed(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  return token ? verifySessionToken(token) : false;
}

export async function GET(request: NextRequest) {
  if (!(await isAuthed(request))) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ success: true, settings: getAdminSettings() });
}

export async function POST(request: NextRequest) {
  if (!(await isAuthed(request))) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  let payload: Partial<Record<string, unknown>> = {};
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON payload." }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  if (typeof payload.maintenanceMode === "boolean") updates.maintenanceMode = payload.maintenanceMode;
  if (typeof payload.allowAnonymousAnalysis === "boolean") updates.allowAnonymousAnalysis = payload.allowAnonymousAnalysis;
  if (typeof payload.adminNotifications === "boolean") updates.adminNotifications = payload.adminNotifications;
  if (typeof payload.enableSSRFProtection === "boolean") updates.enableSSRFProtection = payload.enableSSRFProtection;
  if (payload.defaultLocale === "en" || payload.defaultLocale === "ar") updates.defaultLocale = payload.defaultLocale;
  if (payload.theme === "system" || payload.theme === "dark" || payload.theme === "light") updates.theme = payload.theme;

  const settings = updateAdminSettings(updates as any);
  return NextResponse.json({ success: true, settings });
}
