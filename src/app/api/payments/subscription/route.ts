import { NextRequest, NextResponse } from "next/server";
import { getCustomerFromRequest } from "@/lib/subscription-service";
import { getSubscriptionByEmail, applyExpiredSubscriptions, getActivePlans } from "@/lib/paymob-store";

export const dynamic = "force-dynamic";

/** Returns the authenticated customer's subscription state (server-authoritative). */
export async function GET(request: NextRequest) {
  applyExpiredSubscriptions();
  const customer = getCustomerFromRequest(request);
  if (!customer) {
    return NextResponse.json({ success: true, hasCustomer: false, subscription: null, plans: getActivePlans() });
  }
  const subscription = getSubscriptionByEmail(customer.email);
  const plans = getActivePlans();
  return NextResponse.json({
    success: true,
    hasCustomer: true,
    customer: { name: customer.name, email: customer.email },
    subscription,
    plans,
  });
}
