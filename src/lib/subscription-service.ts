// =============================================================================
// Smart Land - Subscription Service (Server-side)
// =============================================================================
// All subscription decisions happen here on the server using the real store.
// The browser never influences a subscription's status or expiration date.
// =============================================================================

import { createHmac, timingSafeEqual } from "crypto";
import type { NextRequest } from "next/server";
import type { CustomerIdentity, Subscription } from "./paymob-types";
import {
  getPlanById,
  getSubscriptionByEmail,
  createSubscription,
  updateSubscription,
  applyExpiredSubscriptions,
} from "./paymob-store";

export const CUSTOMER_COOKIE = "smartland_customer";

const MS_PER_MONTH = 30.44 * 24 * 60 * 60 * 1000;

// HARD-CODED/fallback secrets are strictly forbidden. The customer identity
// cookie is signed with a secret that MUST come from the environment. If it is
// missing we FAIL CLOSED (throw) instead of falling back to a public/known
// value — a known fallback would let anyone forge a customer cookie and claim
// someone else's premium identity.
function cookieSecret(): string {
  const secret = process.env.PAYMOB_CUSTOMER_SECRET || process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error(
      "PAYMOB_CUSTOMER_SECRET (or ADMIN_SESSION_SECRET) is not configured. Customer identity cannot be signed securely — refusing to fall back to a hard-coded secret."
    );
  }
  return secret;
}

function b64url(input: string): string {
  return Buffer.from(input, "utf8").toString("base64url");
}

function b64urlDecode(input: string): string {
  return Buffer.from(input, "base64url").toString("utf8");
}

export function signCustomer(identity: CustomerIdentity): string {
  const payload = b64url(JSON.stringify(identity));
  const hmac = createHmac("sha256", cookieSecret()).update(payload).digest("base64url");
  return `${payload}.${hmac}`;
}

export function parseCustomer(token: string | undefined | null): CustomerIdentity | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [payload, sig] = parts;
  const expected = createHmac("sha256", cookieSecret()).update(payload).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const parsed = JSON.parse(b64urlDecode(payload)) as CustomerIdentity;
    if (!parsed?.email) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function getCustomerFromRequest(request: NextRequest): CustomerIdentity | null {
  const token = request.cookies.get(CUSTOMER_COOKIE)?.value;
  return parseCustomer(token);
}

export function subscriptionCookieValue(customer: CustomerIdentity): string {
  return `${CUSTOMER_COOKIE}=${signCustomer(customer)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000`;
}

// ---------------------------------------------------------------------------
// Access decision (server-authoritative)
// ---------------------------------------------------------------------------
export interface AccessDecision {
  allowed: boolean;
  hasSubscription: boolean;
  subscription: Subscription | null;
  messageAr: string;
  messageEn: string;
}

export function getAccessDecision(customerEmail?: string | null): AccessDecision {
  applyExpiredSubscriptions();
  const email = customerEmail?.trim().toLowerCase();
  if (!email) {
    // No identity -> treat as anonymous free (platform stays usable)
    return { allowed: true, hasSubscription: false, subscription: null, messageAr: "", messageEn: "" };
  }
  const sub = getSubscriptionByEmail(email);
  if (!sub) {
    return { allowed: true, hasSubscription: false, subscription: null, messageAr: "", messageEn: "" };
  }
  if (sub.status === "active") {
    return { allowed: true, hasSubscription: true, subscription: sub, messageAr: "", messageEn: "" };
  }
  if (sub.status === "expired") {
    return {
      allowed: false,
      hasSubscription: true,
      subscription: sub,
      messageAr: "انتهى اشتراكك، يرجى تجديد الاشتراك للاستمرار في استخدام Smart Land.",
      messageEn: "Your subscription has ended. Please renew to continue using Smart Land.",
    };
  }
  if (sub.status === "cancelled" || sub.status === "failed") {
    return {
      allowed: false,
      hasSubscription: true,
      subscription: sub,
      messageAr: "اشتراكك غير نشط. يرجى تجديد الاشتراك للاستمرار في استخدام Smart Land.",
      messageEn: "Your subscription is not active. Please renew to continue using Smart Land.",
    };
  }
  return {
    allowed: false,
    hasSubscription: true,
    subscription: sub,
    messageAr: "اشتراكك قيد المعالجة. أكمل عملية الدفع أو انتظر التأكيد.",
    messageEn: "Your subscription is pending. Please complete the payment or wait for confirmation.",
  };
}
// ---------------------------------------------------------------------------
// Activation / renewal / extension (only called after a verified payment)
// ---------------------------------------------------------------------------
export function activateSubscription(params: {
  customer: CustomerIdentity;
  planId: string;
  amountCents: number;
  transactionId: string;
  paymentDate: string;
}): Subscription {
  const plan = getPlanById(params.planId);
  const now = new Date();
  const nowIso = now.toISOString();
  const durationMs =
    plan && plan.durationMonths > 0 ? plan.durationMonths * MS_PER_MONTH : 30 * 24 * 60 * 60 * 1000;
  let existing = getSubscriptionByEmail(params.customer.email);

  if (existing) {
    // Renewal: extend from max(now, endDate)
    const base =
      existing.endDate && new Date(existing.endDate).getTime() > now.getTime()
        ? new Date(existing.endDate)
        : now;
    const endDate = new Date(base.getTime() + durationMs).toISOString();
    const updated = updateSubscription(existing.id, {
      planId: params.planId,
      amountCents: params.amountCents,
      startDate: base.toISOString(),
      endDate,
      status: "active",
      transactionId: params.transactionId,
      paymentMethod: "paymob",
      paymentDate: params.paymentDate,
      autoRenew: true,
    });
    if (updated) return updated;
  }

  return createSubscription({
    customerEmail: params.customer.email.trim().toLowerCase(),
    customerName: params.customer.name,
    planId: params.planId,
    amountCents: params.amountCents,
    status: "active",
    startDate: nowIso,
    endDate: new Date(now.getTime() + durationMs).toISOString(),
    autoRenew: true,
    transactionId: params.transactionId,
    paymentMethod: "paymob",
    paymentDate: params.paymentDate,
  });
}