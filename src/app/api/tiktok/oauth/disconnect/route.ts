import { NextRequest, NextResponse } from "next/server";
import { clearTikTokSessionCookie } from "@/lib/tiktok-session";
import { logTikTok } from "@/lib/tiktok-log";

export const dynamic = "force-dynamic";

/**
 * POST /api/tiktok/oauth/disconnect
 * Clears the encrypted TikTok session cookie (user-initiated disconnect).
 */
export async function POST(_request: NextRequest) {
  logTikTok("info", "oauth_disconnected");
  const res = NextResponse.json({ success: true });
  res.headers.set("Set-Cookie", clearTikTokSessionCookie());
  return res;
}