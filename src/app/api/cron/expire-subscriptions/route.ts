import { NextRequest, NextResponse } from "next/server";
import { applyExpiredSubscriptions, getSubscriptions } from "@/lib/paymob-store";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Scheduled auto-cut check (Vercel Cron / external scheduler).
 *
 * Runs daily and expires every subscription whose last day has passed. Once a
 * subscription is expired, every access decision automatically reverts the
 * account to the free tier (premium cut, free quota restored).
 *
 * Security: protected by CRON_SECRET when configured (sent via ?secret= or the
 * Authorization: Bearer header); fails closed when the secret is set.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const provided =
      request.nextUrl.searchParams.get("secret") ||
      (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
    if (!provided || provided !== secret) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
  }

  const expired = applyExpiredSubscriptions();
  const stats = {
    expiredByThisRun: expired,
    activeRemaining: getSubscriptions().filter((s) => s.status === "active").length,
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json({ success: true, ...stats });
}