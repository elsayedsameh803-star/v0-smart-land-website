import { NextRequest, NextResponse } from "next/server";
import {
  getCustomerFromRequest,
  getAccessDecision,
  getFreeAnalysesLimit,
  readAnonymousUsage,
  buildFreeUsageCookieValue,
} from "@/lib/subscription-service";

export const dynamic = "force-dynamic";

/**
 * Server-authoritative access check used by the frontend (before each analysis).
 *
 * Freemium model:
 *  - Paid / active subscribers are always allowed (free credits untouched).
 *  - Expired/cancelled/pending subscribers are blocked with a renewal message.
 *  - Anonymous / free users get a limited number of free analyses (default 2),
 *    tracked server-side via a signed cookie. Once exhausted they are prompted
 *    to subscribe to the $5 paid plan.
 */
export async function GET(request: NextRequest) {
  const customer = getCustomerFromRequest(request);
  const decision = getAccessDecision(customer?.email);
  const limit = getFreeAnalysesLimit();

  // 1) Paid active subscriber -> always allowed, no credit consumed.
  if (decision.allowed && decision.hasSubscription) {
    return NextResponse.json({
      success: true,
      allowed: true,
      hasSubscription: true,
      subscription: decision.subscription,
      messageAr: "",
      messageEn: "",
      freeLimit: limit,
      freeUsed: 0,
      freeRemaining: limit,
    });
  }

  // 2) Subscriber whose subscription is not usable -> block with renew message.
  if (!decision.allowed) {
    return NextResponse.json({
      success: true,
      allowed: false,
      hasSubscription: decision.hasSubscription,
      subscription: decision.subscription,
      code: "SUBSCRIPTION_REQUIRED",
      messageAr: decision.messageAr,
      messageEn: decision.messageEn,
      freeLimit: limit,
      freeUsed: readAnonymousUsage(request),
      freeRemaining: 0,
    });
  }

  // 3) Anonymous / free tier -> consume one credit per analysis attempt.
  const used = readAnonymousUsage(request);
  const next = used + 1;
  const allowed = next <= limit;
  const response = NextResponse.json({
    success: true,
    allowed,
    hasSubscription: false,
    subscription: null,
    code: allowed ? undefined : "SUBSCRIPTION_REQUIRED",
    messageAr: allowed
      ? ""
      : "لقد استهلكت تحليلاتك المجانية. اشترك في الباقة المدفوعة ($5) لمواصلة استخدام Smart Land.",
    messageEn: allowed
      ? ""
      : "You've used all your free analyses. Subscribe to the $5 plan to continue using Smart Land.",
    freeLimit: limit,
    freeUsed: used,
    freeRemaining: Math.max(0, limit - next),
  });
  response.headers.set("Set-Cookie", buildFreeUsageCookieValue(next));
  return response;
}
