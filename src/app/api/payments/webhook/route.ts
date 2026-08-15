import { NextRequest, NextResponse } from "next/server";
import { verifyHmac, getPaymobConfig } from "@/lib/paymob";
import { processPaymentResult, resolveOutcomeFromObj, PaymentOutcome } from "@/lib/payment-processor";

export const dynamic = "force-dynamic";

/**
 * Paymob sends the "transaction processed" webhook here. We ALWAYS verify the
 * HMAC signature first; unverified requests are rejected (401) and never
 * activate anything. A transaction only activates a subscription when Paymob
 * reports a confirmed, non-pending success.
 * 
 * SANDBOX: When ?sandbox=true, we skip HMAC verification and process a
 * simulated payment for testing.
 */
export async function POST(request: NextRequest) {
  try {
    const isSandbox = request.nextUrl.searchParams.get("sandbox") === "true";
    
    // SANDBOX: Process simulated payment without real API calls
    if (isSandbox) {
      const body = await request.json().catch(() => null);
      if (!body) {
        return NextResponse.json({ success: false, error: "Invalid body" }, { status: 400 });
      }
      const { transactionId, email, name, planId, amountCents, outcome } = body;
      if (!transactionId || !email) {
        return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
      }
      const result = processPaymentResult({
        transactionId,
        orderId: transactionId,
        customerEmail: email,
        customerName: name || email,
        planId: planId || "",
        amountCents: Number(amountCents) || 0,
        currency: "EGP",
        outcome: outcome === "success" ? "success" : "failed",
        paymobStatus: `sandbox-${outcome}`,
      });
      return NextResponse.json({ success: true, outcome: result, sandbox: true });
    }

    const raw = await request.text().catch(() => "");
    let parsed: any = null;
    try {
      parsed = raw ? JSON.parse(raw) : {};
    } catch {
      parsed = {};
    }

    const obj = parsed?.obj || parsed?.data?.obj || parsed?.transaction || null;
    const hmacFromBody = parsed?.hmac || parsed?.data?.hmac || null;
    const hmacFromQuery = request.nextUrl.searchParams.get("hmac") || null;
    const providedHmac = hmacFromBody || hmacFromQuery || "";

    const cfg = getPaymobConfig();

    // Reject if we cannot validate (HMAC secret not configured).
    if (!cfg.hmacSecret) {
      console.error("[webhook] HMAC secret not configured, ignoring webhook.");
      return NextResponse.json({ received: true }, { status: 200 });
    }

    if (!obj || typeof obj !== "object") {
      return NextResponse.json({ received: true }, { status: 200 });
    }

    const valid = verifyHmac(obj, providedHmac);
    if (!valid) {
      console.error("[webhook] HMAC verification FAILED. Ignoring payload.");
      return NextResponse.json({ received: false, error: "invalid hmac" }, { status: 401 });
    }

    const transactionId = String(obj.id || "");
    const orderId = String(obj.order?.id || "");
    const amountCents = Number(obj.amount_cents) || 0;
    const currency = obj.currency || "EGP";
    const email = String(obj.billing_data?.email || obj.payment_key_claims?.billing_data?.email || "").trim().toLowerCase();
    const name = String(obj.billing_data?.first_name || "").trim();

    const outcome: PaymentOutcome = resolveOutcomeFromObj(obj);

    processPaymentResult({
      transactionId,
      orderId,
      customerEmail: email,
      customerName: name,
      amountCents,
      currency,
      outcome,
      paymobStatus: String(obj.data?.message || outcome),
    });

    // Always respond 200 to stop Paymob retries.
    return NextResponse.json({ received: true, outcome }, { status: 200 });
  } catch (error: any) {
    console.error("[webhook] error:", error?.message);
    return NextResponse.json({ received: true }, { status: 200 });
  }
}
