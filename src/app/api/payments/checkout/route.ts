import { NextRequest, NextResponse } from "next/server";
import { getPlanById, createTransaction, updateTransaction } from "@/lib/paymob-store";
import { getPaymobConfig, getAuthToken, createOrder, createPaymentKey, buildCheckoutUrl } from "@/lib/paymob";
import { CUSTOMER_COOKIE, signCustomer } from "@/lib/subscription-service";
import type { CustomerIdentity } from "@/lib/paymob-types";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const planId = body?.planId as string;
    const name = String(body?.customer?.name || "").trim();
    const email = String(body?.customer?.email || "").trim().toLowerCase();
    const locale = body?.locale === "ar" ? "ar" : "en";

    if (!planId) {
      return NextResponse.json({ success: false, error: "Missing plan" }, { status: 400 });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ success: false, error: "A valid email is required" }, { status: 400 });
    }

    const plan = getPlanById(planId);
    if (!plan || !plan.active) {
      return NextResponse.json({ success: false, error: "This plan is not available" }, { status: 400 });
    }

    // Free plan has no payment
    if (plan.priceCents <= 0) {
      return NextResponse.json({
        success: true,
        free: true,
        plan,
        paymentUrl: null,
        transactionId: null,
        orderId: null,
      });
    }

    const cfg = getPaymobConfig();
    
    // SANDBOX: Skip real API calls, return demo payment URL
    if (cfg.sandbox) {
      const demoCustomer: CustomerIdentity = { id: `${Date.now()}`, name, email };
      const demoTransaction = createTransaction({
        transactionId: `sandbox-tx-${Date.now()}`,
        orderId: `sandbox-order-${Date.now()}`,
        customerEmail: email,
        customerName: name,
        planId: plan.id,
        amountCents: plan.priceCents,
        currency: plan.currency,
        status: "pending",
        paymentMethod: "paymob",
        paymobStatus: "sandbox-pending",
        webhookReceived: false,
        webhookResult: null,
      });

      const response = NextResponse.json({
        success: true,
        free: false,
        plan,
        paymentUrl: `/checkout/sandbox?tx=${demoTransaction.id}&email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}&plan=${plan.id}&amount=${plan.priceCents}`,
        transactionId: demoTransaction.id,
        orderId: demoTransaction.transactionId,
        mode: "sandbox",
        sandbox: true,
      });
      response.cookies.set(CUSTOMER_COOKIE, signCustomer(demoCustomer), {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
      });
      return response;
    }

    if (!cfg.configured) {
      return NextResponse.json(
        {
          success: false,
          error: locale === "ar"
            ? "بوابة الدفع غير مهيأة بعد. أضف مفاتيح Paymob في إعدادات البيئة."
            : "Payment gateway is not configured yet. Add Paymob keys in environment settings.",
        },
        { status: 503 }
      );
    }

    // Persist a pending transaction first (server-side record)
    const pendingTx = createTransaction({
      transactionId: `pending-${Date.now()}`,
      orderId: `order-${Date.now()}`,
      customerEmail: email,
      customerName: name,
      planId: plan.id,
      amountCents: plan.priceCents,
      currency: plan.currency,
      status: "pending",
      paymentMethod: "paymob",
      paymobStatus: "pending",
      webhookReceived: false,
      webhookResult: null,
    });

    const customer: CustomerIdentity = { id: `${Date.now()}`, name, email };

    // Official Paymob flow: auth -> order -> payment key
    const authToken = await getAuthToken();
    const orderId = await createOrder({ authToken, amountCents: plan.priceCents, currency: plan.currency });
    const paymentToken = await createPaymentKey({
      authToken,
      orderId,
      amountCents: plan.priceCents,
      currency: plan.currency,
      customer,
    });
    const paymentUrl = buildCheckoutUrl(paymentToken);

    updateTransaction(pendingTx.id, { orderId, transactionId: orderId });

    const response = NextResponse.json({
      success: true,
      free: false,
      plan,
      paymentUrl,
      transactionId: pendingTx.id,
      orderId,
      mode: cfg.mode,
    });
    response.cookies.set(CUSTOMER_COOKIE, signCustomer(customer), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
    return response;
  } catch (error: any) {
    console.error("checkout error:", error?.message);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to start payment" },
      { status: 500 }
    );
  }
}
