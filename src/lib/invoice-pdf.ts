// =============================================================================
// Smart Land - Invoice PDF Generator (server-side, Node runtime)
// Generates a digital paid receipt / invoice (PDF) automatically after a
// successful payment. Contains: invoice number, subscriber name, plan name,
// amount paid, purchase date, expiration date and the no-refund policy.
//
// Runs in the Node.js runtime of Next.js (jspdf ships a node build).
// =============================================================================

import { jsPDF } from "jspdf";

export interface InvoicePdfData {
  invoiceNumber: string;
  customerName: string;
  customerEmail: string;
  planName: string;
  amountCents: number;
  currency: string;
  purchaseDate: string;
  endDate: string | null;
  transactionId: string;
  refundPolicy: string;
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  EGP: "EGP ",
};

function money(data: InvoicePdfData): string {
  const symbol = CURRENCY_SYMBOLS[data.currency] || `${data.currency} `;
  return `${symbol}${(data.amountCents / 100).toFixed(2)}`;
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "—";
  }
}

/** Deterministic, human-friendly invoice number: INV-YYYYMM-<tx suffix>. */
export function generateInvoiceNumber(
  transactionId: string,
  date: Date = new Date()
): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const tail =
    transactionId.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(-6) ||
    String(Date.now()).slice(-6);
  return `INV-${y}${m}-${tail}`;
}

/** Builds the invoice PDF and returns it as a Node Buffer. */
export function buildInvoicePdf(data: InvoicePdfData): Buffer {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = 210;
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;

  // ---- Header band (gold) ----
  doc.setFillColor(234, 179, 8);
  doc.rect(0, 0, pageWidth, 30, "F");
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("SMART LAND", margin, 15);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("AI Digital Audit Platform", margin, 22);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("PAID RECEIPT", pageWidth - margin, 15, { align: "right" });
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Invoice No: ${data.invoiceNumber}`, pageWidth - margin, 22, {
    align: "right",
  });
  doc.text(`Transaction: ${data.transactionId}`, pageWidth - margin, 27, {
    align: "right",
  });

  // ---- Billing / subscriber block ----
  let y = 44;
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("BILLED TO", margin, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  y += 7;
  doc.text(data.customerName || data.customerEmail, margin, y);
  y += 6;
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  doc.text(data.customerEmail, margin, y);

  // ---- Summary box ----
  y += 12;
  doc.setDrawColor(234, 179, 8);
  doc.setLineWidth(0.4);
  doc.rect(margin, y, contentWidth, 46);

  const rows: Array<[string, string]> = [
    ["Plan", data.planName],
    ["Amount paid", money(data)],
    ["Purchase date", formatDate(data.purchaseDate)],
    ["Expiration date", formatDate(data.endDate)],
  ];

  let rowY = y + 8;
  doc.setFontSize(10);
  for (const [label, value] of rows) {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text(label.toUpperCase(), margin + 6, rowY);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    doc.text(value, pageWidth - margin - 6, rowY, { align: "right" });
    rowY += 9;
  }

  // ---- No-refund policy ----
  let policyY = y + 56;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(190, 18, 60); // rose
  doc.text("NO-REFUND POLICY", margin, policyY);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(80, 80, 80);
  const policyLines = doc.splitTextToSize(data.refundPolicy, contentWidth);
  policyY += 6;
  doc.text(policyLines, margin, policyY);

  // ---- Footer ----
  const footerY = 280;
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.2);
  doc.line(margin, footerY - 6, pageWidth - margin, footerY - 6);
  doc.setFontSize(8.5);
  doc.setTextColor(120, 120, 120);
  doc.text(
    "This is an automatically generated receipt. Please keep it for your records.",
    pageWidth / 2,
    footerY,
    { align: "center" }
  );
  doc.text(
    "Smart Land · AI Digital Audit Platform · support@smart-land.app",
    pageWidth / 2,
    footerY + 5,
    { align: "center" }
  );

  const arrayBuffer = doc.output("arraybuffer");
  return Buffer.from(arrayBuffer);
}
