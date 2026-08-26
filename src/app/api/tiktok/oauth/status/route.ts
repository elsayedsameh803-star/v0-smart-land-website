import { NextRequest, NextResponse } from "next/server";
import {
  parseTikTokSessionCookie,
  isAccessTokenUsable,
} from "@/lib/tiktok-session";

export const dynamic = "force-dynamic";

/**
 * GET /api/tiktok/oauth/status
 * Returns whether the visitor has a connected TikTok session. Only the
 * display name and expiry are returned — never the tokens.
 */
export async function GET(request: NextRequest) {
  const session = parseTikTokSessionCookie(request.cookies.get("sl_tiktok_session")?.value);
  if (!session) {
    return NextResponse.json({ connected: false });
  }
  const connectTime = new Date(session.connectedAt).getTime();
  return NextResponse.json({
    connected: true,
    displayName: session.displayName,
    avatarUrl: session.avatarUrl || null,
    usable: isAccessTokenUsable(session),
    connectedAt: session.connectedAt,
    connectedDaysAgo: Math.max(0, Math.round((Date.now() - connectTime) / 86400000)),
  });
}