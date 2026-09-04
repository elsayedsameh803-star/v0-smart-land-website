// =============================================================================
// Smart Land - Subscription Service (Server-side)
// =============================================================================
// All subscription decisions happen here on the server using the real store.
// The browser never influences a subscription's status or expiration date.
// =============================================================================

import { createHmac, timingSafeEqual } from "crypto";
import type { NextRequest } from "next/server";
import type { CustomerIdentity, Subscription, UsageQuota } from "./paymob-types";
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
  /** True when a paid subscription just expired and the account was reverted to the free tier. */
  downgradedToFree?: boolean;
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
    // Auto-cut: once the last day of the subscription passes, premium access is
    // cut and the account is automatically reverted to the free tier (free
    // analyses restored). The subscriber can renew at any time.
    return {
      allowed: true,
      hasSubscription: false,
      subscription: sub,
      downgradedToFree: true,
      messageAr:
        "انتهى اشتراكك المدفوع. تمت إعادة حسابك تلقائياً للحصة المجانية — جدّد اشتراكك لاستعادة كل المزايا.",
      messageEn:
        "Your paid subscription has ended. Your account was automatically reverted to the free tier — renew to restore full access.",
    };
  }
  if (sub.status === "cancelled" || sub.status === "failed") {
    return {
      allowed: true,
      hasSubscription: false,
      subscription: sub,
      downgradedToFree: true,
      messageAr:
        "اشتراكك المدفوع غير نشط. عُدت إلى الحصة المجانية تلقائياً — اشترك لاستعادة كل المزايا.",
      messageEn:
        "Your paid subscription is not active. Your account was reverted to the free tier — subscribe to restore full access.",
    };
  }
  // pending — treat as free tier until the payment is confirmed by the gateway.
  return {
    allowed: true,
    hasSubscription: false,
    subscription: sub,
    messageAr: "اشتراكك قيد المعالجة. ستُفعّل المزايا فور تأكيد الدفع.",
    messageEn: "Your subscription is pending. Benefits will activate as soon as payment is confirmed.",
  };
}
// ---------------------------------------------------------------------------
// Freemium — free analysis allowance (server-authoritative, signed cookie)
// ---------------------------------------------------------------------------
export const FREE_USAGE_COOKIE = "smartland_free_usage";
const FREE_USAGE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export function getFreeAnalysesLimit(): number {
  return 10;
}

function usageMonth(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}-${now.getUTCMonth() + 1}`;
}

function signUsageToken(count: number): string {
  const payload = b64url(JSON.stringify({ count, month: usageMonth() }));
  const hmac = createHmac("sha256", cookieSecret())
    .update(payload)
    .digest("base64url");
  return `${payload}.${hmac}`;
}

export function readAnonymousUsage(request: NextRequest): number {
  const token = request.cookies.get(FREE_USAGE_COOKIE)?.value;
  if (!token) return 0;
  const parts = token.split(".");
  if (parts.length !== 2) return 0;
  const [payload, sig] = parts;
  const expected = createHmac("sha256", cookieSecret())
    .update(payload)
    .digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return 0;
  try {
    const parsed = JSON.parse(b64urlDecode(payload)) as { count?: number; month?: string };
    const n = Number(parsed?.count);
    return parsed.month === usageMonth() && Number.isFinite(n) && n >= 0 ? n : 0;
  } catch {
    return 0;
  }
}

export function buildFreeUsageCookieValue(count: number): string {
  return `${FREE_USAGE_COOKIE}=${signUsageToken(count)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${FREE_USAGE_MAX_AGE}`;
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

// ---------------------------------------------------------------------------
// Usage quota (server-authoritative, derived from the active plan or free tier)
// ---------------------------------------------------------------------------
export function getUsageQuota(customerEmail?: string | null): UsageQuota {
  applyExpiredSubscriptions();
  const email = customerEmail?.trim().toLowerCase();
  const sub = email ? getSubscriptionByEmail(email) : null;

  // Active paid subscription -> quota comes straight from the plan's limits.
  if (sub && sub.status === "active") {
    const plan = getPlanById(sub.planId);
    return {
      planId: plan?.id || sub.planId,
      planName: plan?.name || sub.planId,
      planNameAr: plan?.nameAr || sub.planId,
      isPaid: true,
      analysesPerMonth: plan?.limits?.analysesPerMonth ?? -1,
      sitesLimit: plan?.limits?.sitesLimit ?? -1,
      pagesLimit: plan?.limits?.pagesLimit ?? -1,
      platforms: plan?.limits?.platforms ?? ["*"],
      expiresAt: sub.endDate,
      subscriptionStatus: sub.status,
    };
  }

  // Free tier (anonymous, expired, cancelled or pending account).
  // The platform is fully open — unlimited analyses on every platform.
  return {
    planId: "free",
    planName: "Free",
    planNameAr: "المجاني",
    isPaid: false,
    analysesPerMonth: -1, // -1 = unlimited (open to all visitors)
    sitesLimit: -1,
    pagesLimit: -1,
    platforms: ["*"],
    expiresAt: null,
    subscriptionStatus: sub?.status || "free",
  };
}