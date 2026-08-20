import { NextRequest, NextResponse } from "next/server";
import {
  getCustomerFromRequest,
  getAccessDecision,
  getUsageQuota,
} from "@/lib/subscription-service";

export const dynamic = "force-dynamic";

/**
 * Server-authoritative access check used by the frontend (before each analysis).
 *
 * Smart Land is now FULLY OPEN — every visitor is always allowed with an
 * unlimited quota. There is no freemium limit, no usage counter and no paywall.
 * This endpoint stays for API compatibility and so the frontend can read the
 * visitor's subscription quota / status.
 */
export async function GET(request: NextRequest) {
  const customer = getCustomerFromRequest(request);
  const decision = getAccessDecision(customer?.email);
  const quota = getUsageQuota(customer?.email);

  // Smart Land is fully open — every visitor (anonymous or signed-in) is always
  // allowed with an unlimited quota. No usage counter, no paywall, no gating.
  return NextResponse.json({
    success: true,
    allowed: true,
    hasSubscription: decision.hasSubscription,
    subscription: decision.subscription,
    downgradedToFree: false,
    quota,
    code: undefined,
    messageAr: "",
    messageEn: "",
    freeLimit: -1,
    freeUsed: 0,
    freeRemaining: null,
  });
}
