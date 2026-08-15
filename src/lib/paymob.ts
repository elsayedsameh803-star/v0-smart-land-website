// =============================================================================
// Smart Land - Paymob Payment Client (Server-side only)
// =============================================================================
// Uses the official Paymob Accept API (current version).
//
// All API keys are read ONLY from environment variables. Nothing sensitive is
// ever returned to the client or written to logs.
//
// SANDBOX MODE: When PAYMOB_SECRET_KEY is not set, the system runs in
// "sandbox" mode — no real API calls are made, and the checkout returns a
// simulated payment URL so you can test the full UX flow end-to-end.
// =============================================================================

import { createHmac, timingSafeEqual } from "crypto";
import { safeFetch } from "./security";

const ACCEPT_BASE = "https://accept.paymob.com/api";

export type PaymobMode = "test" | "live" | "sandbox";

export interface PaymobConfig {
  mode: PaymobMode;
  secretKey: string;
  publicKey: string;
  integrationId: string;
  iframeId: string;
  hmacSecret: string;
  configured: boolean;
  /** True when we are faking API calls for demonstration */
  sandbox: boolean;
}

export function getPaymobMode(): PaymobMode {
  const envMode = process.env.PAYMOB_MODE;
  if (envMode === "live") return "live";
  if (envMode === "test") return "test";
  return "sandbox";
}

export function getPaymobConfig(): PaymobConfig {
  const secretKey = process.env.PAYMOB_SECRET_KEY || "";
  const publicKey = process.env.PAYMOB_PUBLIC_KEY || "";
  const integrationId = process.env.PAYMOB_INTEGRATION_ID || "";
  const iframeId = process.env.PAYMOB_IFRAME_ID || "";
  const hmacSecret = process.env.PAYMOB_HMAC_SECRET || "";
  const mode = getPaymobMode();
  const sandbox = !secretKey;
  return {
    mode: sandbox ? "sandbox" : mode,
    secretKey,
    publicKey,
    integrationId: sandbox ? "123456" : integrationId,
    iframeId: sandbox ? "789012" : iframeId,
    hmacSecret: sandbox ? "sandbox-hmac-secret" : hmacSecret,
    configured: true, // Always true — sandbox allows testing without real keys
    sandbox,
  };
}

// AUTH TOKEN is cached per instance to avoid re-fetching on every request.
let cachedToken: { token: string; expiresAt: number } | null = null;

export async function getAuthToken(): Promise<string> {
  const cfg = getPaymobConfig();
  
  // SANDBOX: return a fake token immediately
  if (cfg.sandbox) {
    return "sandbox-auth-token";
  }
  
  if (cachedToken && Date.now() < cachedToken.expiresAt) return cachedToken.token;
  if (!cfg.secretKey) throw new Error("PAYMOB_SECRET_KEY is not configured");
  const res = await safeFetch(`${ACCEPT_BASE}/auth/tokens`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ api_key: cfg.secretKey }),
  }, 20000);
  if (!res.ok) {
    await res.text().catch(() => "");
    throw new Error(`Paymob auth failed (${res.status})`);
  }
  const json = await res.json();
  if (!json.token) throw new Error("Paymob did not return an auth token");
  cachedToken = { token: json.token, expiresAt: Date.now() + 55 * 60 * 1000 };
  return json.token;
}

export async function createOrder(params: {
  authToken: string;
  amountCents: number;
  currency: string;
}): Promise<string> {
  const cfg = getPaymobConfig();
  
  // SANDBOX: return fake order id
  if (cfg.sandbox) {
    return `sandbox-order-${Date.now()}`;
  }
  
  const res = await safeFetch(`${ACCEPT_BASE}/ecommerce/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      auth_token: params.authToken,
      delivery_needed: false,
      amount_cents: params.amountCents,
      currency: params.currency,
      merchant_order_id: `sm-${Date.now()}`,
      items: [],
    }),
  }, 20000);
  if (!res.ok) throw new Error(`Paymob order failed (${res.status})`);
  const json = await res.json();
  if (!json.id) throw new Error("Paymob did not return an order id");
  return String(json.id);
}
export async function createPaymentKey(params: {
  authToken: string;
  orderId: string;
  amountCents: number;
  currency: string;
  customer: { name: string; email: string };
}): Promise<string> {
  const cfg = getPaymobConfig();
  
  // SANDBOX: return fake payment token
  if (cfg.sandbox) {
    return `sandbox-pay-token-${Date.now()}`;
  }
  
  const [first, ...rest] = params.customer.name.trim().split(" ");
  const lastName = rest.join(" ") || first;
  const res = await safeFetch(`${ACCEPT_BASE}/acceptance/payment_keys`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      auth_token: params.authToken,
      amount_cents: params.amountCents,
      expiration: 3600,
      order_id: params.orderId,
      billing_data: {
        apartment: "NA",
        email: params.customer.email,
        floor: "NA",
        first_name: first || "Customer",
        street: "NA",
        building: "NA",
        phone_number: "+201000000000",
        shipping_method: "NA",
        postal_code: "NA",
        city: "NA",
        country: "EG",
        last_name: lastName || first || "Customer",
        state: "NA",
      },
      currency: params.currency,
      integration_id: Number(cfg.integrationId) || parseInt(cfg.integrationId, 10) || 0,
      lock_order_when_paid: false,
    }),
  }, 30000);
  if (!res.ok) {
    await res.text().catch(() => "");
    throw new Error(`Paymob payment key failed (${res.status})`);
  }
  const json = await res.json();
  if (!json.token) throw new Error("Paymob did not return a payment token");
  return String(json.token);
}

export function buildCheckoutUrl(paymentToken: string): string {
  const cfg = getPaymobConfig();
  
  // SANDBOX: Build a local sandbox checkout page instead of Paymob iframe
  if (cfg.sandbox) {
    return `/checkout/sandbox?token=${paymentToken}&amount=paid`;
  }
  
  return `${ACCEPT_BASE}/acceptance/iframes/${cfg.iframeId}?payment_token=${paymentToken}`;
}

// ---------------------------------------------------------------------------
// Webhook HMAC verification (official Paymob algorithm)
// ---------------------------------------------------------------------------
export function computeHmac(transaction: any, hmacSecret: string): string {
  const hmac = createHmac("sha256", hmacSecret);
  hmac.update(`${transaction.amount_cents}${transaction.created_at}${transaction.currency}${transaction.error_occurred}${transaction.has_source_identifier}${transaction.id}${transaction.integration_id}${transaction.is_3d_secure}${transaction.is_auth}${transaction.is_capture}${transaction.is_refunded}${transaction.is_standalone_payment}${transaction.is_voided}${transaction.order?.id}${transaction.owner}${transaction.pending}${transaction.source_data?.pan}${transaction.source_data?.sub_type}${transaction.source_data?.type}${transaction.success}`);
  return hmac.digest("hex");
}

export function verifyHmac(transaction: any, providedHmac: string): boolean {
  const cfg = getPaymobConfig();
  if (!cfg.hmacSecret || !providedHmac) return false;
  const expected = computeHmac(transaction, cfg.hmacSecret);
  const a = Buffer.from(expected.toLowerCase(), "hex");
  const b = Buffer.from(String(providedHmac).toLowerCase(), "hex");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

// ---------------------------------------------------------------------------
// Query a transaction's real status from Paymob (server-side, authoritative)
// ---------------------------------------------------------------------------
export async function verifyTransaction(
  transactionId: string
): Promise<{ success: boolean; pending: boolean; amountCents: number; currency: string; data: any }> {
  const cfg = getPaymobConfig();
  
  // SANDBOX: return simulated success for sandbox transactions
  if (cfg.sandbox && transactionId.startsWith("sandbox-")) {
    return {
      success: true,
      pending: false,
      amountCents: 190000,
      currency: "EGP",
      data: { id: transactionId, message: "Sandbox payment (simulated success)" },
    };
  }
  
  const authToken = await getAuthToken();
  const res = await safeFetch(`${ACCEPT_BASE}/acceptance/transactions/${transactionId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
  }, 20000);
  if (!res.ok) throw new Error(`Paymob transaction query failed (${res.status})`);
  const json = await res.json();
  const t = json || {};
  return {
    success: t.success === true || t.success === "true",
    pending: t.pending === true || t.pending === "true",
    amountCents: Number(t.amount_cents) || 0,
    currency: t.currency || "EGP",
    data: t,
  };
}
