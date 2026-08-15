// ============================================
// Smart Land Referral System Storage
// ============================================

import type { ReferralUser, ReferralEntry, RewardEntry, ReferralClickEvent, ReferralRegistrationEvent } from "./referral-types";
import { generateId } from "./utils";
import { getSiteUrl } from "@/lib/site-config";

const REFERRAL_PREFIX = "smart-land-referral-";
const REFERRAL_USERS_KEY = `${REFERRAL_PREFIX}users`;
const REFERRAL_CLICKS_KEY = `${REFERRAL_PREFIX}clicks`;
const REFERRAL_REGISTRATIONS_KEY = `${REFERRAL_PREFIX}registrations`;

// =============================================================================
// Referral Code Generation
// =============================================================================

export function generateReferralCode(name: string = ""): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 6) || "smart";
  
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${base}${randomPart}`.toUpperCase();
}

export function generateReferralLink(code: string, locale: string = "en"): string {
  const baseUrl = getSiteUrl();
  return `${baseUrl}/${locale}/referral/${code}`;
}

// =============================================================================
// Referral User Management
// =============================================================================

export function getReferralUsers(): ReferralUser[] {
  try {
    const data = localStorage.getItem(REFERRAL_USERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function getReferralUser(userId: string): ReferralUser | null {
  const users = getReferralUsers();
  return users.find(u => u.id === userId) || null;
}

export function getReferralUserByCode(code: string): ReferralUser | null {
  const users = getReferralUsers();
  return users.find(u => u.referralCode === code) || null;
}

export function getOrCreateReferralUser(userId: string, name: string = "", email: string = ""): ReferralUser {
  const users = getReferralUsers();
  const existing = users.find(u => u.id === userId);
  if (existing) return existing;

  // Generate unique referral code
  let code = generateReferralCode(name);
  while (users.some(u => u.referralCode === code)) {
    code = generateReferralCode(name);
  }

  const newUser: ReferralUser = {
    id: userId,
    name,
    email,
    referralCode: code,
    referralLink: generateReferralLink(code),
    createdAt: new Date().toISOString(),
    totalClicks: 0,
    totalSignups: 0,
    referrals: [],
    rewards: [],
    status: "active",
  };

  users.push(newUser);
  localStorage.setItem(REFERRAL_USERS_KEY, JSON.stringify(users));
  return newUser;
}

export function updateReferralUser(user: ReferralUser): void {
  const users = getReferralUsers();
  const index = users.findIndex(u => u.id === user.id);
  if (index >= 0) {
    users[index] = user;
    localStorage.setItem(REFERRAL_USERS_KEY, JSON.stringify(users));
  }
}

// =============================================================================
// Referral Tracking (Anti-Fraud)
// =============================================================================

export function trackReferralClick(code: string, ipAddress: string | null = null, userAgent: string | null = null, source: string | null = null, referrer: string | null = null): void {
  const user = getReferralUserByCode(code);
  if (!user) return;

  // Anti-fraud: Check for duplicate clicks from same IP within 24 hours
  const clicks = getReferralClicks();
  const recentClick = clicks.find(c => 
    c.referralCode === code && 
    c.ipAddress === ipAddress &&
    Date.now() - new Date(c.clickedAt).getTime() < 24 * 60 * 60 * 1000
  );
  if (recentClick) return;

  const clickEvent: ReferralClickEvent = {
    id: generateId(),
    referralCode: code,
    clickedAt: new Date().toISOString(),
    ipAddress,
    userAgent,
    source,
    referrer,
  };

  clicks.push(clickEvent);
  localStorage.setItem(REFERRAL_CLICKS_KEY, JSON.stringify(clicks));

  // Update user stats
  user.totalClicks += 1;
  
  // Add referral entry if not exists for this click
  const existingEntry = user.referrals.find(r => r.ipAddress === ipAddress && r.status === "clicked");
  if (!existingEntry) {
    const entry: ReferralEntry = {
      id: generateId(),
      referredUserId: null,
      referredName: null,
      referredEmail: null,
      status: "clicked",
      clickedAt: new Date().toISOString(),
      registeredAt: null,
      ipAddress,
      userAgent,
      source,
    };
    user.referrals.unshift(entry);
  }

  updateReferralUser(user);
}

export function trackReferralRegistration(code: string, newUserId: string, ipAddress: string | null = null, userAgent: string | null = null): void {
  const user = getReferralUserByCode(code);
  if (!user) return;

  // Anti-fraud: Prevent self-referral
  if (user.id === newUserId) return;

  // Anti-fraud: Check if this user already registered via this referral
  const existingRegistration = user.referrals.find(r => r.referredUserId === newUserId);
  if (existingRegistration) return;

  // Anti-fraud: Check if this IP already registered via this referral
  const existingIpRegistration = user.referrals.find(r => r.ipAddress === ipAddress && r.status === "registered");
  if (existingIpRegistration) return;

  const registrationEvent: ReferralRegistrationEvent = {
    id: generateId(),
    referralCode: code,
    userId: newUserId,
    registeredAt: new Date().toISOString(),
    ipAddress,
    userAgent,
  };

  const registrations = getReferralRegistrations();
  registrations.push(registrationEvent);
  localStorage.setItem(REFERRAL_REGISTRATIONS_KEY, JSON.stringify(registrations));

  // Update the referral entry
  const entry = user.referrals.find(r => r.ipAddress === ipAddress && r.status === "clicked");
  if (entry) {
    entry.status = "registered";
    entry.referredUserId = newUserId;
    entry.registeredAt = new Date().toISOString();
  } else {
    user.referrals.unshift({
      id: generateId(),
      referredUserId: newUserId,
      referredName: null,
      referredEmail: null,
      status: "registered",
      clickedAt: new Date().toISOString(),
      registeredAt: new Date().toISOString(),
      ipAddress,
      userAgent,
      source: null,
    });
  }

  user.totalSignups += 1;
  updateReferralUser(user);
}

// =============================================================================
// Referral Events Logging
// =============================================================================

export function getReferralClicks(): ReferralClickEvent[] {
  try {
    const data = localStorage.getItem(REFERRAL_CLICKS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function getReferralRegistrations(): ReferralRegistrationEvent[] {
  try {
    const data = localStorage.getItem(REFERRAL_REGISTRATIONS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

// =============================================================================
// Referral Stats
// =============================================================================

export function getReferralStats(userId: string) {
  const user = getReferralUser(userId);
  if (!user) {
    return {
      totalClicks: 0,
      totalSignups: 0,
      conversionRate: 0,
      recentReferrals: [] as ReferralEntry[],
    };
  }

  const conversionRate = user.totalClicks > 0 
    ? Math.round((user.totalSignups / user.totalClicks) * 100) 
    : 0;

  return {
    totalClicks: user.totalClicks,
    totalSignups: user.totalSignups,
    conversionRate,
    recentReferrals: user.referrals.slice(0, 20),
  };
}

// =============================================================================
// Rewards System (Future-Ready)
// =============================================================================

export function addReward(userId: string, reward: Omit<RewardEntry, "id" | "createdAt">): void {
  const user = getReferralUser(userId);
  if (!user) return;

  user.rewards.unshift({
    ...reward,
    id: generateId(),
    createdAt: new Date().toISOString(),
  });
  updateReferralUser(user);
}

export function getRewards(userId: string): RewardEntry[] {
  const user = getReferralUser(userId);
  return user?.rewards || [];
}

// =============================================================================
// Referral Link Validation
// =============================================================================

export function isValidReferralCode(code: string): boolean {
  return getReferralUserByCode(code) !== null;
}

export function getReferralCodeFromUrl(url: string): string | null {
  const match = url.match(/\/referral\/([A-Z0-9]+)/i);
  return match ? match[1] : null;
}