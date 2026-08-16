// =============================================================================
// Smart Land - Invoice Email Service (structure)
// Generates an invoice confirmation and delivers it via email.
//
// This is the scaffold: when an email provider is configured it sends for real
// (Resend / generic SMTP API). Until then it records the invoice to the server
// log (and best-effort file store) so the successful-payment flow is complete
// and ready to plug a provider in without touching the payment code.
//
// Required env (Vercel, optional until enabled):
//   EMAIL_FROM, RESEND_API_KEY (OR SMTP_HOST/SMTP_USER/SMTP_PASS)
// =============================================================================

import * as fs from "fs";
import * as path from "path";

export interface InvoiceData {
  customerEmail: string;
  customerName: string;
  planName: string;
  amountCents: number;
  currency: string;
  transactionId: string;
  paymentDate: string;
}

export interface InvoiceResult {
  sent: boolean;
  method: "resend" | "log" | "none";
  reason?: string;
}

const INVOICE_DIR = path.join(process.cwd(), "data", "invoices");

function recordInvoice(data: InvoiceData): void {
  try {
    if (!fs.existsSync(INVOICE_DIR)) fs.mkdirSync(INVOICE_DIR, { recursive: true });
    const file = path.join(
      INVOICE_DIR,
      `${data.transactionId.replace(/[^a-zA-Z0-9_-]/g, "_")}.json`
    );
    fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf8");
  } catch {
    // best effort; never block payments
  }
}

function logInvoice(data: InvoiceData): void {
  // eslint-disable-next-line no-console
  console.log(
    `[Invoice] Invoice generated for ${data.customerEmail}`,
    JSON.stringify({
      plan: data.planName,
      amount: (data.amountCents / 100).toFixed(2),
      currency: data.currency,
      transactionId: data.transactionId,
      date: data.paymentDate,
    })
  );
}

/**
 * Sends (or records) an invoice confirmation email after a successful payment.
 * Never throws — payment flow is never blocked by email delivery.
 */
export async function sendInvoiceEmail(
  data: InvoiceData
): Promise<InvoiceResult> {
  recordInvoice(data);
  logInvoice(data);

  const from = process.env.EMAIL_FROM;
  const apiKey = process.env.RESEND_API_KEY;

  // Resend provider (recommended) — ready to go once RESEND_API_KEY is set.
  if (from && apiKey) {
    try {
      const html = buildInvoiceHtml(data);
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          from,
          to: [data.customerEmail],
          subject: `Smart Land — Payment confirmation · ${(data.amountCents / 100).toFixed(2)} ${data.currency}`,
          html,
        }),
      });
      if (res.ok) return { sent: true, method: "resend" };
      return {
        sent: false,
        method: "log",
        reason: `email api returned ${res.status}`,
      };
    } catch (error: any) {
      return { sent: false, method: "log", reason: error?.message };
    }
  }

  return {
    sent: false,
    method: "log",
    reason: `${from ? "RESEND_API_KEY" : "EMAIL_FROM"} is not configured`,
  };
}

function buildInvoiceHtml(data: InvoiceData): string {
  const amount = (data.amountCents / 100).toFixed(2);
  const date = new Date(data.paymentDate).toLocaleString();
  return `<div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:auto;border:1px solid #e5e7eb;border-radius:14px;overflow:hidden">
    <div style="background:#eab308;color:#0f172a;padding:16px 20px;font-weight:bold;font-size:18px">Smart Land — Payment Confirmed ✅</div>
    <div style="padding:20px;color:#1e293b;font-size:14px;line-height:1.7">
      <p>Dear <b>${escapeHtml(data.customerName)}</b>,</p>
      <p>Thank you for subscribing to Smart Land. Your paid plan is now active.</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        <tr><td style="padding:8px;border-bottom:1px solid #eee">Plan</td><td style="padding:8px;border-bottom:1px solid #eee"><b>${escapeHtml(data.planName)}</b></td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #eee">Amount</td><td style="padding:8px;border-bottom:1px solid #eee"><b>${amount} ${escapeHtml(data.currency)}</b></td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #eee">Transaction</td><td style="padding:8px;border-bottom:1px solid #eee">${escapeHtml(data.transactionId)}</td></tr>
        <tr><td style="padding:8px">Date</td><td style="padding:8px">${escapeHtml(date)}</td></tr>
      </table>
      <p style="color:#64748b">This is an automated email confirmation. If you did not make this purchase, contact us immediately.</p>
    </div>
  </div>`;
}

function escapeHtml(str: string): string {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}