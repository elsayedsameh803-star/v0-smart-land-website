// =============================================================================
// Smart Land - Payment Results Processor (shared by webhook & status polling)
// =============================================================================
// Authoritative, idempotent handling of a payment outcome. A subscription is
// ONLY activated when Paymob reports a confirmed, non-pending success.
// =============================================================================

import type { CustomerIdentity, TransactionStatus, Plan } from "./paymob-types";
import { getPlans, getTransactionByPaymobId, createTransaction, updateTransaction, getPaymentSettings } from "./paymob-store";
import { activateSubscription } from "./subscription-service";
import { sendInvoiceEmail } from "./email-service";

export type PaymentOutcome = "success" | "failed" | "cancelled" | "pending";

export function resolveOutcomeFromObj(obj: any): PaymentOutcome {
  const success = obj.success === true || obj.success === "true";
  const pending = obj.pending === true || obj.pending === "true";
  // Paymob signals a user cancellation via the transaction "data.message",
  // or via error_occurred with a cancelled message.
  const msg = String((obj?.data?.message || "").toLowerCase());
  if (msg.includes("cancelled") || msg.includes("cancel") || msg === "cancelled") {
    return "cancelled";
  }
  if (success && !pending) return "success";
  if (pending) return "pending";
  return "failed";
}

export function statusToTransactionStatus(outcome: PaymentOutcome): TransactionStatus {
  if (outcome === "success") return "success";
  if (outcome === "cancelled") return "cancelled";
  if (outcome === "pending") return "pending";
  return "failed";
}

export function findPlanForAmount(amountCents: number, currency?: string): Plan | null {
  const plans = getPlans();
  return (
    plans.find((p) => p.priceCents === amountCents && (!currency || p.currency === currency) && p.active) ||
    plans.find((p) => p.priceCents === amountCents && p.active) ||
    null
  );
}

export function findPlanByIdOrAmount(planId: string | null, amountCents: number, currency?: string): Plan | null {
  const plans = getPlans();
  if (planId) {
    const byId = plans.find((p) => p.id === planId);
    if (byId) return byId;
  }
  return findPlanForAmount(amountCents, currency);
}

/**
 * Applies a confirmed payment outcome to the store (idempotent).
 * Returns the resulting outcome.
 */
export function processPaymentResult(params: {
  transactionId: string;
  orderId?: string;
  customerEmail?: string;
  customerName?: string;
  planId?: string;
  amountCents: number;
  currency: string;
  outcome: PaymentOutcome;
  paymobStatus?: string;
}): PaymentOutcome {
  const {
    transactionId,
    orderId,
    outcome,
    amountCents,
    currency,
    paymobStatus,
  } = params;

  const existing = getTransactionByPaymobId(transactionId);
  const txnStatus = statusToTransactionStatus(outcome);

  if (existing) {
    updateTransaction(existing.id, {
      status: txnStatus,
      paymobStatus: paymobStatus || String(outcome),
      webhookReceived: true,
      webhookResult: String(outcome),
    });
  } else {
    // A transaction Paymob sent that we do not have locally yet.
    const plan = findPlanByIdOrAmount(params.planId || null, amountCents, currency);
    createTransaction({
      transactionId,
      orderId: orderId || transactionId,
      customerEmail: params.customerEmail || "unknown@paymob",
      customerName: params.customerName || "",
      planId: plan?.id || params.planId || "",
      amountCents,
      currency,
      status: txnStatus,
      paymentMethod: "paymob",
      paymobStatus: paymobStatus || String(outcome),
      webhookReceived: true,
      webhookResult: String(outcome),
    });
  }

  // ==== Activation ONLY on a confirmed, non-pending success ====
  if (outcome === "success") {
    const plan = findPlanByIdOrAmount(params.planId || null, amountCents, currency);
    const email = (params.customerEmail || "").trim().toLowerCase();
    if (plan && email) {
      const activated = activateSubscription({
        customer: {
          id: existing?.id || `c-${Date.now()}`,
          name: params.customerName || email,
          email,
        },
        planId: plan.id,
        amountCents,
        transactionId,
        paymentDate: new Date().toISOString(),
      });

      // Best-effort invoice confirmation email (never blocks the payment flow).
      // The PDF receipt is generated & attached automatically.
      const settings = getPaymentSettings();
      sendInvoiceEmail({
        customerEmail: email,
        customerName: params.customerName || email,
        planName: plan.name,
        amountCents,
        currency,
        transactionId,
        paymentDate: new Date().toISOString(),
        endDate: activated?.endDate || null,
        refundPolicy: settings.refundPolicyEn,
      }).catch(() => {}); // sendInvoiceEmail must never throw, extra safety
    }
  }

  return outcome;
}

// For the status-polling route: no customer needed yet, just resolve + activate
export function processStatusOutcome(params: {
  transactionId: string;
  orderId?: string;
  customerEmail: string;
  customerName: string;
  planId?: string;
  amountCents: number;
  currency: string;
  outcome: PaymentOutcome;
}): PaymentOutcome {
  return processPaymentResult({ ...params });
}

export { getPaymentSettings };
