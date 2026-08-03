// ============================================
// Smart Land Referral System Types
// ============================================

export interface ReferralUser {
  id: string;
  name: string;
  email: string;
  referralCode: string;
  referralLink: string;
  createdAt: string;
  totalClicks: number;
  totalSignups: number;
  referrals: ReferralEntry[];
  // Future-ready fields for rewards system
  rewards: RewardEntry[];
  status: "active" | "suspended";
}

export interface ReferralEntry {
  id: string;
  referredUserId: string | null;
  referredName: string | null;
  referredEmail: string | null;
  status: "clicked" | "registered" | "verified" | "rewarded";
  clickedAt: string;
  registeredAt: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  source: string | null;
}

export interface RewardEntry {
  id: string;
  type: "discount" | "pro_days" | "commission" | "bonus";
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  value: number;
  status: "pending" | "active" | "redeemed" | "expired";
  createdAt: string;
  expiresAt: string | null;
  referralId: string | null;
}

export interface ReferralStats {
  totalClicks: number;
  totalSignups: number;
  conversionRate: number;
  recentReferrals: ReferralEntry[];
}

export interface ReferralClickEvent {
  id: string;
  referralCode: string;
  clickedAt: string;
  ipAddress: string | null;
  userAgent: string | null;
  source: string | null;
  referrer: string | null;
}

export interface ReferralRegistrationEvent {
  id: string;
  referralCode: string;
  userId: string;
  registeredAt: string;
  ipAddress: string | null;
  userAgent: string | null;
}