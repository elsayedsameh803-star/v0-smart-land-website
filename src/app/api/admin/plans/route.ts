import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { getPlans, createPlan, updatePlan, deletePlan } from "@/lib/paymob-store";
import type { Plan } from "@/lib/paymob-types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  return NextResponse.json({ success: true, plans: getPlans() });
}

export async function POST(request: NextRequest) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  const body = await request.json().catch(() => null);
  if (!body?.name) return NextResponse.json({ success: false, error: "Plan name required" }, { status: 400 });
  try {
    const plan = createPlan({
      name: String(body.name),
      nameAr: String(body.nameAr || body.name),
      description: String(body.description || ""),
      descriptionAr: String(body.descriptionAr || body.description || ""),
      priceCents: Math.max(0, Number(body.priceCents) || 0),
      currency: body.currency === "USD" ? "USD" : "EGP",
      durationMonths: Math.max(1, Number(body.durationMonths) || 1),
      billing: (body.billing === "yearly" || body.billing === "one_time") ? body.billing : "monthly",
      features: Array.isArray(body.features) ? body.features.map(String) : [],
      limits: {
        analysesPerMonth: body.limits?.analysesPerMonth === -1 ? -1 : Math.max(0, Number(body.limits?.analysesPerMonth) || 0),
        platforms: Array.isArray(body.limits?.platforms) ? body.limits.platforms : ["*"],
        sitesLimit: body.limits?.sitesLimit === undefined ? -1 : Number(body.limits.sitesLimit) || 0,
        pagesLimit: body.limits?.pagesLimit === undefined ? -1 : Number(body.limits.pagesLimit) || 0,
        competitorComparison: !!body.limits?.competitorComparison,
        pdfReports: body.limits?.pdfReports === undefined ? true : !!body.limits.pdfReports,
        prioritySupport: !!body.limits?.prioritySupport,
      },
      active: body.active === undefined ? true : !!body.active,
      sortOrder: Math.max(1, Number(body.sortOrder) || 1),
    });
    return NextResponse.json({ success: true, plan });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  const body = await request.json().catch(() => null);
  const id = String(body?.id || "");
  if (!id) return NextResponse.json({ success: false, error: "Missing id" }, { status: 400 });
  try {
    const patch: Partial<Plan> = {};
    if (body.name !== undefined) patch.name = String(body.name);
    if (body.nameAr !== undefined) patch.nameAr = String(body.nameAr);
    if (body.description !== undefined) patch.description = String(body.description);
    if (body.descriptionAr !== undefined) patch.descriptionAr = String(body.descriptionAr);
    if (body.priceCents !== undefined) patch.priceCents = Math.max(0, Number(body.priceCents) || 0);
    if (body.currency !== undefined) patch.currency = body.currency === "USD" ? "USD" : "EGP";
    if (body.durationMonths !== undefined) patch.durationMonths = Math.max(1, Number(body.durationMonths) || 1);
    if (body.billing !== undefined) {
      patch.billing =
        body.billing === "yearly" || body.billing === "one_time" ? body.billing : "monthly";
    }
    if (body.features !== undefined) patch.features = Array.isArray(body.features) ? body.features.map(String) : [];
    if (body.active !== undefined) patch.active = !!body.active;
    if (body.sortOrder !== undefined) patch.sortOrder = Math.max(1, Number(body.sortOrder) || 1);
    if (body.limits !== undefined) patch.limits = { ...(getPlans().find((p) => p.id === id)?.limits || {}), ...body.limits };
    const updated = updatePlan(id, patch);
    if (!updated) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true, plan: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  const id = request.nextUrl.searchParams.get("id") || "";
  if (!id) return NextResponse.json({ success: false, error: "Missing id" }, { status: 400 });
  const ok = deletePlan(id);
  if (!ok) {
    return NextResponse.json(
      { success: false, error: "Cannot delete — plan is in use or not found" },
      { status: 400 }
    );
  }
  return NextResponse.json({ success: true });
}
