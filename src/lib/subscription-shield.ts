// =============================================================================
// Smart Land - Subscription Access Shield (server-side guard)
// =============================================================================
// Applied to protected (paid) server actions. A request is rejected with a
// renewal message when the identified customer's subscription is expired,
// cancelled, failed or still pending. Anonymous / free users stay allowed.
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getCustomerFromRequest, getAccessDecision } from "./subscription-service";

export function enforceSubscription(request: NextRequest): NextResponse | null {
  const customer = getCustomerFromRequest(request);
  const decision = getAccessDecision(customer?.email);
  if (!decision.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: decision.messageEn,
        errorAr: decision.messageAr,
        code: "SUBSCRIPTION_REQUIRED",
      },
      { status: 403 }
    );
  }
  return null;
}
