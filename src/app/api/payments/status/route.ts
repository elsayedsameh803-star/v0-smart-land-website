import { NextRequest, NextResponse } from "next/server";
import { getTransactionByPaymobId, getTransaction } from "@/lib/paymob-store";
import { verifyTransaction } from "@/lib/paymob";
import { getCustomerFromRequest } from "@/lib/subscription-service";
import { processStatusOutcome, resolveOutcomeFromObj, PaymentOutcome } from "@/lib/payment-processor";

export const dynamic = "force-dynamic";

/**
 * Polls the authoritative status of a payment from Paymob (server-side) and
 * applies the result. The client NEVER decides success — this does.
 */
export async function GET(request: NextRequest) {
  try {
    const orderId = request.nextUrl.searchParams.get("orderId") || "";
    const txId = request.nextUrl.searchParams.get("transactionId") || "";
    const locale = request.nextUrl.searchParams.get("locale") === "ar" ? "ar" : "en";
    if (!orderId && !txId) {
      return NextResponse.json({ success: false, error: "Missing order id" }, { status: 400 });
    }

    const customer = getCustomerFromRequest(request);
    const localTx = txId ? getTransaction(txId) : getTransactionByPaymobId(orderId);

    // Ask Paymob for the real state of this transaction (authoritative).
    let verified: { success: boolean; pending: boolean; amountCents: number; currency: string; data: any } | null = null;
    const paymobTransactionId = localTx?.transactionId && !localTx?.transactionId.startsWith("pending-") && !localTx?.transactionId.startsWith("order-")
      ? localTx.transactionId
      : orderId;
    try {
      verified = await verifyTransaction(paymobTransactionId);
    } catch {
      verified = null;
    }

    let outcome: PaymentOutcome = "pending";
    if (verified) {
      outcome = resolveOutcomeFromObj(verified.data);
    }

    // Apply result server-side (activation only on confirmed success)
    const email = customer?.email || localTx?.customerEmail;
    const name = customer?.name || localTx?.customerName || "";
    const planId = localTx?.planId || undefined;
    const amountCents = verified?.amountCents || localTx?.amountCents || 0;
    const currency = verified?.currency || localTx?.currency || "EGP";

    if (outcome !== "pending") {
      processStatusOutcome({
        transactionId: localTx?.transactionId && !localTx.transactionId.startsWith("pending-") && !localTx.transactionId.startsWith("order-")
          ? localTx.transactionId
          : String(orderId),
        orderId: orderId || undefined,
        customerEmail: email || "",
        customerName: name,
        planId,
        amountCents,
        currency,
        outcome,
      });
    }

    return NextResponse.json({
      success: true,
      outcome,
      verified: !!verified,
    });
  } catch (error: any) {
    console.error("status error:", error?.message);
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
