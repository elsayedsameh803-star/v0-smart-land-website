import { NextRequest, NextResponse } from "next/server";
import { getCustomerFromRequest, getAccessDecision } from "@/lib/subscription-service";

export const dynamic = "force-dynamic";

/** Server-authoritative access check used by the frontend and guard middleware. */
export async function GET(request: NextRequest) {
  const customer = getCustomerFromRequest(request);
  const decision = getAccessDecision(customer?.email);
  return NextResponse.json({ success: true, ...decision });
}
