// =============================================================================
// Smart Land - Server-side Paymob Data Store
// =============================================================================
// Persists plans, subscriptions and transactions in a JSON file (data/).
// Falls back to in-memory storage when the filesystem is read-only (e.g.
// some serverless hosts). All subscription decisions are made HERE on the
// server, never from the browser.
//
// For durable cross-instance persistence on serverless platforms (Vercel),
// connect a database / KV store: implement readData()/writeData() below.
// =============================================================================

import * as fs from "fs";
import * as path from "path";
import { generateId } from "./utils";
import type {
  PaymobStoreData,
  Plan,
  Subscription,
  PaymentTransaction,
  PaymentGatewaySettings,
  PaymentStats,
  SubscriptionStatus,
} from "./paymob-types";

// ---------------------------------------------------------------------------
// Default plans (seeded once). Prices are in CENTS (Paymob's amount format).
// ---------------------------------------------------------------------------
export function buildDefaultPlans(): Plan[] {
  const now = new Date().toISOString();
  return [
    {
      id: "free",
      name: "Free",
      nameAr: "المجاني",
      description: "Perfect for trying Smart Land",
      descriptionAr: "مثالي لتجربة Smart Land",
      priceCents: 0,
      currency: "EGP",
      durationMonths: 0,
      billing: "one_time",
      features: ["5 analyses per month", "Website analysis", "Basic score breakdown", "PDF report", "Email support"],
      limits: {
        analysesPerMonth: 5,
        platforms: ["website"],
        competitorComparison: false,
        pdfReports: true,
        prioritySupport: false,
      },
      active: true,
      sortOrder: 1,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "pro",
      name: "Pro",
      nameAr: "الاحترافية",
      description: "For professionals and growing teams",
      descriptionAr: "للمحترفين والفرق النامية",
      priceCents: 190000, // 1900.00 EGP
      currency: "EGP",
      durationMonths: 1,
      billing: "monthly",
      features: [
        "Unlimited analyses",
        "All platforms (7+)",
        "Advanced insights & recommendations",
        "Competitor comparison",
        "Analysis history & tracking",
        "Priority email support",
      ],
      limits: {
        analysesPerMonth: -1,
        platforms: ["*"],
        competitorComparison: true,
        pdfReports: true,
        prioritySupport: true,
      },
      active: true,
      sortOrder: 2,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "enterprise",
      name: "Enterprise",
      nameAr: "المؤسسات",
      description: "For agencies and large organizations",
      descriptionAr: "للوكالات والمؤسسات الكبيرة",
      priceCents: 590000, // 5900.00 EGP
      currency: "EGP",
      durationMonths: 1,
      billing: "monthly",
      features: [
        "Unlimited everything",
        "API access",
        "White-label reports",
        "Dedicated account manager",
        "Custom integrations",
        "SLA & priority support",
      ],
      limits: {
        analysesPerMonth: -1,
        platforms: ["*"],
        competitorComparison: true,
        pdfReports: true,
        prioritySupport: true,
      },
      active: true,
      sortOrder: 3,
      createdAt: now,
      updatedAt: now,
    },
  ];
}
export const DEFAULT_PAYMENT_SETTINGS: PaymentGatewaySettings = {
  mode: "test",
  configured: false,
  integrationId: "",
  iframeId: "",
  webhookUrl: "",
  webhookActive: false,
  updatedAt: new Date().toISOString(),
};

function defaultStore(): PaymobStoreData {
  return {
    plans: buildDefaultPlans(),
    subscriptions: [],
    transactions: [],
    settings: { ...DEFAULT_PAYMENT_SETTINGS },
  };
}

// ---------------------------------------------------------------------------
// File + memory persistence
// ---------------------------------------------------------------------------

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "paymob-store.json");

let memoryStore: PaymobStoreData | null = null;
let fileStore: PaymobStoreData | null = null;

function tryReadFile(): PaymobStoreData | null {
  try {
    if (!fs.existsSync(DATA_FILE)) return null;
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    if (!raw || raw.trim().length === 0) return null;
    const parsed = JSON.parse(raw) as Partial<PaymobStoreData>;
    return normalize(parsed);
  } catch {
    return null;
  }
}

function tryWriteFile(data: PaymobStoreData): boolean {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const tmp = `${DATA_FILE}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2), "utf8");
    fs.renameSync(tmp, DATA_FILE);
    return true;
  } catch {
    return false;
  }
}

export function resetStoreForTests(): void {
  memoryStore = buildDefaultStore();
  fileStore = null;
}

function buildDefaultStore(): PaymobStoreData {
  return {
    plans: buildDefaultPlans(),
    subscriptions: [],
    transactions: [],
    settings: { ...DEFAULT_PAYMENT_SETTINGS },
  };
}

function normalize(parsed: Partial<PaymobStoreData>): PaymobStoreData {
  const base = buildDefaultStore();
  return {
    plans: Array.isArray(parsed.plans) && parsed.plans.length > 0 ? parsed.plans : base.plans,
    subscriptions: Array.isArray(parsed.subscriptions) ? parsed.subscriptions : [],
    transactions: Array.isArray(parsed.transactions) ? parsed.transactions : [],
    settings: parsed.settings ? { ...base.settings, ...parsed.settings } : base.settings,
  };
}

export function readData(): PaymobStoreData {
  if (fileStore) return fileStore;
  const fromFile = tryReadFile();
  if (fromFile) {
    fileStore = fromFile;
    return fileStore;
  }
  if (!memoryStore) memoryStore = buildDefaultStore();
  return memoryStore;
}

export function writeData(data: PaymobStoreData): void {
  fileStore = data;
  memoryStore = data;
  tryWriteFile(data); // best effort; harmless if it fails on a read-only FS
}

// ---------------------------------------------------------------------------
// Auto-expiry: subscriptions past their end date become expired (server-side)
// ---------------------------------------------------------------------------
export function applyExpiredSubscriptions(): void {
  const data = readData();
  const now = Date.now();
  let changed = false;
  for (const sub of data.subscriptions) {
    if (sub.status === "active" && sub.endDate && new Date(sub.endDate).getTime() < now) {
      sub.status = "expired";
      sub.updatedAt = new Date().toISOString();
      changed = true;
    }
  }
  if (changed) writeData(data);
}
// ---------------------------------------------------------------------------
// Plans CRUD
// ---------------------------------------------------------------------------
export function getPlans(): Plan[] {
  const data = readData();
  return [...data.plans].sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getActivePlans(): Plan[] {
  return getPlans().filter((p) => p.active);
}

export function getPlanById(id: string): Plan | null {
  return getPlans().find((p) => p.id === id) || null;
}

export function savePlans(plans: Plan[]): Plan[] {
  const data = readData();
  data.plans = [...plans].sort((a, b) => a.sortOrder - b.sortOrder);
  writeData(data);
  return getPlans();
}

export function createPlan(input: Omit<Plan, "id" | "createdAt" | "updatedAt">): Plan {
  const data = readData();
  const now = new Date().toISOString();
  const plan: Plan = {
    ...input,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
  };
  data.plans.push(plan);
  writeData(data);
  return plan;
}

export function updatePlan(id: string, patch: Partial<Plan>): Plan | null {
  const data = readData();
  const plan = data.plans.find((p) => p.id === id);
  if (!plan) return null;
  Object.assign(plan, patch, { updatedAt: new Date().toISOString() });
  writeData(data);
  return plan;
}

export function deletePlan(id: string): boolean {
  const data = readData();
  const index = data.plans.findIndex((p) => p.id === id);
  if (index < 0) return false;
  // Safety: prevent deleting a plan that already has subscriptions
  const inUse = data.subscriptions.some((s) => s.planId === id);
  if (inUse) return false;
  data.plans.splice(index, 1);
  writeData(data);
  return true;
}

// ---------------------------------------------------------------------------
// Subscriptions CRUD
// ---------------------------------------------------------------------------
export function getSubscriptions(): Subscription[] {
  applyExpiredSubscriptions();
  const data = readData();
  return [...data.subscriptions].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getSubscriptionByEmail(email: string): Subscription | null {
  const subs = getSubscriptions();
  const normalized = email.trim().toLowerCase();
  return subs.find((s) => s.customerEmail.trim().toLowerCase() === normalized) || null;
}

export function getLatestSubscriptionByEmail(email: string): Subscription | null {
  const subs = getSubscriptions();
  const normalized = email.trim().toLowerCase();
  return subs.find((s) => s.customerEmail.trim().toLowerCase() === normalized) || null;
}

export function createSubscription(input: Omit<Subscription, "id" | "createdAt" | "updatedAt">): Subscription {
  const data = readData();
  const now = new Date().toISOString();
  const sub: Subscription = { ...input, id: generateId(), createdAt: now, updatedAt: now };
  data.subscriptions.push(sub);
  writeData(data);
  return sub;
}

export function updateSubscription(id: string, patch: Partial<Subscription>): Subscription | null {
  const data = readData();
  const sub = data.subscriptions.find((s) => s.id === id);
  if (!sub) return null;
  Object.assign(sub, patch, { updatedAt: new Date().toISOString() });
  writeData(data);
  return sub;
}

export function setSubscriptionStatus(id: string, status: SubscriptionStatus): Subscription | null {
  return updateSubscription(id, { status });
}
// ---------------------------------------------------------------------------
// Transactions CRUD
// ---------------------------------------------------------------------------
export function getTransactions(): PaymentTransaction[] {
  const data = readData();
  return [...data.transactions].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getTransaction(id: string): PaymentTransaction | null {
  return getTransactions().find((t) => t.id === id) || null;
}

export function getTransactionByPaymobId(transactionId: string): PaymentTransaction | null {
  return (
    getTransactions().find((t) => t.transactionId === transactionId) ||
    getTransactions().find((t) => t.orderId === transactionId) ||
    null
  );
}

export function createTransaction(
  input: Omit<PaymentTransaction, "id" | "createdAt" | "updatedAt">
): PaymentTransaction {
  const data = readData();
  const now = new Date().toISOString();
  const tx: PaymentTransaction = { ...input, id: generateId(), createdAt: now, updatedAt: now };
  data.transactions.unshift(tx);
  writeData(data);
  return tx;
}

export function updateTransaction(id: string, patch: Partial<PaymentTransaction>): PaymentTransaction | null {
  const data = readData();
  const tx = data.transactions.find((t) => t.id === id);
  if (!tx) return null;
  Object.assign(tx, patch, { updatedAt: new Date().toISOString() });
  writeData(data);
  return tx;
}

// ---------------------------------------------------------------------------
// Gateway settings
// ---------------------------------------------------------------------------
export function getPaymentSettings(): PaymentGatewaySettings {
  const data = readData();
  return { ...DEFAULT_PAYMENT_SETTINGS, ...data.settings };
}

export function savePaymentSettings(
  patch: Partial<PaymentGatewaySettings>
): PaymentGatewaySettings {
  const data = readData();
  data.settings = { ...data.settings, ...patch, updatedAt: new Date().toISOString() };
  writeData(data);
  return getPaymentSettings();
}

// ---------------------------------------------------------------------------
// Statistics (computed from the real store, never hardcoded)
// ---------------------------------------------------------------------------
export function computePaymentStats(): PaymentStats {
  applyExpiredSubscriptions();
  const subs = getSubscriptions();
  const txns = getTransactions();

  const activeSubscriptions = subs.filter((s) => s.status === "active").length;
  const successfulPayments = txns.filter((t) => t.status === "success").length;
  const failedPayments = txns.filter((t) => t.status === "failed").length;
  const pendingPayments = txns.filter((t) => t.status === "pending").length;
  const cancelledPayments = txns.filter((t) => t.status === "cancelled").length;
  const totalRevenueCents = txns
    .filter((t) => t.status === "success")
    .reduce((sum, t) => sum + (t.amountCents || 0), 0);

  // Revenue by period (last 6 months)
  const revenueByPeriod: Array<{ period: string; revenueCents: number }> = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const period = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const revenueCents = txns
      .filter((t) => {
        if (t.status !== "success") return false;
        const td = new Date(t.createdAt);
        return `${td.getFullYear()}-${String(td.getMonth() + 1).padStart(2, "0")}` === period;
      })
      .reduce((sum, t) => sum + (t.amountCents || 0), 0);
    revenueByPeriod.push({ period, revenueCents });
  }

  // Subscriptions per plan
  const planCounts = new Map<string, number>();
  for (const s of subs) planCounts.set(s.planId, (planCounts.get(s.planId) || 0) + 1);
  const plans = getPlans();
  const subscriptionsByPlan = Array.from(planCounts.entries()).map(([planId, count]) => ({
    planId,
    planName: plans.find((p) => p.id === planId)?.name || planId,
    count,
  }));

  return {
    totalSubscribers: new Set(subs.map((s) => s.customerEmail.toLowerCase())).size,
    activeSubscriptions,
    expiredSubscriptions: subs.filter((s) => s.status === "expired").length,
    pendingSubscriptions: subs.filter((s) => s.status === "pending").length,
    cancelledSubscriptions: subs.filter((s) => s.status === "cancelled").length,
    failedSubscriptions: subs.filter((s) => s.status === "failed").length,
    successfulPayments,
    failedPayments,
    pendingPayments,
    cancelledPayments,
    totalRevenueCents,
    revenueByPeriod,
    subscriptionsByPlan,
  };
}