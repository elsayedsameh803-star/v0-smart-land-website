import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { getTransactions, getPlans } from "@/lib/paymob-store";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  const plans = getPlans();
  const transactions = getTransactions().map((t) => ({
    ...t,
    planName: plans.find((p) => p.id === t.planId)?.name || t.planId,
  }));
  return NextResponse.json({ success: true, transactions });
}
