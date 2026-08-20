// =============================================================================
// Smart Land - Paymob & Subscriptions Types
// =============================================================================

export type PlanBilling = "monthly" | "yearly" | "one_time";

export interface Plan {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  priceCents: number; // amount in cents (Paymob format)
  currency: "EGP" | "USD";
  durationMonths: number;
  billing: PlanBilling;
  features: string[]; // list of included features
  limits: {
    analysesPerMonth: number; // -1 = unlimited
    platforms: string[]; // ["*"] = all
    /** Max number of sites/projects the subscriber can track (-1 = unlimited). */
    sitesLimit: number;
    /** Max number of pages per audit (-1 = unlimited). */
    pagesLimit: number;
    competitorComparison: boolean;
    pdfReports: boolean;
    prioritySupport: boolean;
  };
  active: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export type SubscriptionStatus =
  | "active" // paid & not expired
  | "expired" // ended automatically
  | "pending" // checkout started / payment processing
  | "cancelled" // admin cancelled / user cancelled
  | "failed"; // payment failed

export interface Subscription {
  id: string;
  customerEmail: string;
  customerName: string;
  planId: string;
  amountCents: number;
  status: SubscriptionStatus;
  startDate: string | null;
  endDate: string | null;
  autoRenew: boolean;
  transactionId: string | null;
  paymentMethod: "paymob";
  paymentDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export type TransactionStatus =
  | "pending"
  | "success"
  | "failed"
  | "cancelled";

export interface PaymentTransaction {
  id: string;
  transactionId: string; // Paymob transaction id
  orderId: string; // Paymob order id
  customerEmail: string;
  customerName: string;
  planId: string;
  amountCents: number;
  currency: string;
  status: TransactionStatus;
  paymentMethod: "paymob";
  paymobStatus: string | null; // raw paymob status if known
  webhookReceived: boolean;
  webhookResult: string | null;
  createdAt: string;
  updatedAt: string;
}

export type PaymentGatewayMode = "test" | "live";

export interface PaymentGatewaySettings {
  mode: PaymentGatewayMode;
  configured: boolean;
  integrationId: string;
  iframeId: string;
  webhookUrl: string;
  webhookActive: boolean;
  /** Refund policy shown on the pricing page, checkout and printed on invoices. */
  refundPolicyEn: string;
  refundPolicyAr: string;
  updatedAt: string;
}

/** The usage quota granted to an account (paid plan limits or free tier). */
export interface UsageQuota {
  planId: string;
  planName: string;
  planNameAr: string;
  isPaid: boolean;
  analysesPerMonth: number; // -1 = unlimited
  sitesLimit: number; // -1 = unlimited
  pagesLimit: number; // -1 = unlimited
  platforms: string[];
  expiresAt: string | null;
  subscriptionStatus: SubscriptionStatus | "free";
}

export interface PaymobStoreData {
  plans: Plan[];
  subscriptions: Subscription[];
  transactions: PaymentTransaction[];
  settings: PaymentGatewaySettings;
  nextPlanOrder?: number;
}

export interface CustomerIdentity {
  id: string;
  name: string;
  email: string;
}

export interface PaymentStats {
  totalSubscribers: number;
  activeSubscriptions: number;
  expiredSubscriptions: number;
  pendingSubscriptions: number;
  cancelledSubscriptions: number;
  failedSubscriptions: number;
  successfulPayments: number;
  failedPayments: number;
  pendingPayments: number;
  cancelledPayments: number;
  totalRevenueCents: number;
  revenueByPeriod: Array<{ period: string; revenueCents: number }>;
  subscriptionsByPlan: Array<{ planId: string; planName: string; count: number }>;
}