import { NextRequest, NextResponse } from "next/server";
import { getCustomerFromRequest } from "@/lib/subscription-service";
import { getSubscriptionByEmail, getTransactions, getPlanById, getPaymentSettings } from "@/lib/paymob-store";
import { buildInvoicePdf, generateInvoiceNumber } from "@/lib/invoice-pdf";

export const dynamic = "force-dynamic";

/**
 * Serves the subscriber's PDF receipt/invoice for download
 * ("Download Invoice PDF" button in the user dashboard).
 *
 * The customer identity is read from the signed cookie; the optional ?email=
 * query parameter is honoured ONLY for sandbox/test convenience and is
 * validated against the cookie when both are present.
 */
export async function GET(request: NextRequest) {
  const customer = getCustomerFromRequest(request);
  let email = customer?.email || "";

  // Sandbox convenience: a matching ?email= for anonymous/dev callers.
  const queryEmail = request.nextUrl.searchParams.get("email")?.trim().toLowerCase() || "";
  if (!email && queryEmail) {
    // Only allow this bypass when the gateway runs in sandbox mode.
    const { getPaymobConfig } = await import("@/lib/paymob");
    if (getPaymobConfig().sandbox) email = queryEmail;
  }
  if (!email) {
    return NextResponse.json(
      { success: false, error: "Authentication required" },
      { status: 401 }
    );
  }

  const subscription = getSubscriptionByEmail(email);
  if (!subscription) {
    return NextResponse.json(
      { success: false, error: "No subscription found" },
      { status: 404 }
    );
  }

  const transaction =
    getTransactions().find((t) => t.customerEmail.toLowerCase() === email && t.status === "success") ||
    null;
  const plan = getPlanById(subscription.planId);
  const settings = getPaymentSettings();

  const transactionId = transaction?.transactionId || subscription.transactionId || subscription.id;
  const purchaseDate = transaction?.createdAt || subscription.paymentDate || subscription.startDate || new Date().toISOString();
  const invoiceNumber = generateInvoiceNumber(transactionId, new Date(purchaseDate));

  try {
    const pdf = buildInvoicePdf({
      invoiceNumber,
      customerName: subscription.customerName || email,
      customerEmail: email,
      planName: plan?.name || subscription.planId,
      amountCents: subscription.amountCents || plan?.priceCents || 0,
      currency: plan?.currency || "USD",
      purchaseDate,
      endDate: subscription.endDate,
      transactionId,
      refundPolicy: settings.refundPolicyEn,
    });

    return new Response(new Uint8Array(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Smart-Land-Receipt-${transactionId.replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: `Invoice generation failed: ${error?.message}` },
      { status: 500 }
    );
  }
}