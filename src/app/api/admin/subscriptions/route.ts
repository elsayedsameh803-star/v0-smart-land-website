import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import {
  getSubscriptions,
  updateSubscription,
  setSubscriptionStatus,
  getPlanById,
} from "@/lib/paymob-store";
import type { SubscriptionStatus } from "@/lib/paymob-types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  const subs = getSubscriptions().map((s) => ({ ...s, plan: getPlanById(s.planId) }));
  return NextResponse.json({ success: true, subscriptions: subs });
}

export async function POST(request: NextRequest) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  try {
    const body = await request.json();
    const id = String(body?.id || "");
    const action = String(body?.action || "");
    const sub = getSubscriptions().find((s) => s.id === id);
    if (!sub) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

    switch (action) {
      case "activate":
        setSubscriptionStatus(id, "active");
        break;
      case "suspend":
      case "cancel":
        setSubscriptionStatus(id, action === "cancel" ? "cancelled" : "cancelled");
        break;
      case "extend": {
        const months = Number(body?.months) || 1;
        const base = sub.endDate && new Date(sub.endDate).getTime() > Date.now()
          ? new Date(sub.endDate).getTime()
          : Date.now();
        const endDate = new Date(base + months * 30.44 * 24 * 60 * 60 * 1000).toISOString();
        updateSubscription(id, { endDate, status: "active" });
        break;
      }
      case "change-plan": {
        const plan = getPlanById(String(body?.planId || ""));
        if (!plan) return NextResponse.json({ success: false, error: "Invalid plan" }, { status: 400 });
        const base = sub.endDate && new Date(sub.endDate).getTime() > Date.now()
          ? new Date(sub.endDate).getTime()
          : Date.now();
        updateSubscription(id, {
          planId: plan.id,
          amountCents: plan.priceCents,
          endDate: new Date(base + Math.max(plan.durationMonths, 1) * 30.44 * 24 * 60 * 60 * 1000).toISOString(),
          status: "active",
        });
        break;
      }
      case "set-expiry": {
        const end = String(body?.endDate || "");
        if (!end || isNaN(Date.parse(end))) {
          return NextResponse.json({ success: false, error: "Invalid date" }, { status: 400 });
        }
        updateSubscription(id, { endDate: new Date(end).toISOString() });
        break;
      }
      case "set-status": {
        const status = String(body?.status || "") as SubscriptionStatus;
        const valid: SubscriptionStatus[] = ["active", "expired", "pending", "cancelled", "failed"];
        if (!valid.includes(status)) {
          return NextResponse.json({ success: false, error: "Invalid status" }, { status: 400 });
        }
        setSubscriptionStatus(id, status);
        break;
      }
      default:
        return NextResponse.json({ success: false, error: "Unknown action" }, { status: 400 });
    }
    return NextResponse.json({ success: true, subscription: getSubscriptions().find((s) => s.id === id) });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
