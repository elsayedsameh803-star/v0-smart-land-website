import { NextRequest, NextResponse } from "next/server";
import {
  verifySessionToken,
  isAdminConfigured,
  SESSION_COOKIE_NAME,
} from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const authed = token ? await verifySessionToken(token) : false;
  return NextResponse.json({
    success: true,
    authed,
    configured: isAdminConfigured(),
  });
}
