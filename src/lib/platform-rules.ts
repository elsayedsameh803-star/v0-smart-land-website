// =============================================================================
// Smart Land v3.2 - Platform Analysis Rules (Data-Driven)
// =============================================================================
// This module is the SINGLE source of truth for how each social platform is
// scored. It NEVER invents numbers: every score is derived exclusively from
// real values that were actually extracted from the platform (or from
// structural facts about the submitted URL, like the username).
//
// When a metric cannot be verified from live data it is:
//   1. Excluded from the category score, and
//   2. Listed in `unavailableMetrics`, and
//   3. The affected category is marked `unavailable` in the UI.
//
// No randomness, no seeds, no "estimated" forecasts. Honesty over garnish.
// =============================================================================

import type { CategoryScore, CategoryScores, Finding } from "./types";

export type CategoryKey = keyof CategoryScores;

interface CategoryResult {
  available: boolean;
  score: number;
  reasons: string[];
  reasonsAr: string[];
}

export interface PlatformScoreBreakdown {
  scores: CategoryScores;
  overallScore: number;
  overallAvailable: boolean;
  hasLiveData: boolean;
  availableMetrics: string[];
  unavailableMetrics: string[];
  scoreReasons: Record<CategoryKey, string[]>;
  scoreReasonsAr: Record<CategoryKey, string[]>;
}

// ---------------------------------------------------------------------------
// Field readers (presence-aware: undefined / null / "" / 0-with-no-source
// are treated as "not verified", never as a real zero).
// ---------------------------------------------------------------------------

function present(data: Record<string, any>, key: string): boolean {
  const v = data[key];
  if (v === undefined || v === null || v === "") return false;
  if (typeof v === "number") return Number.isFinite(v) && v > 0;
  if (Array.isArray(v)) return v.length > 0;
  return true; // non-empty strings and booleans (true or explicitly-provided false)
}

function readStr(data: Record<string, any>, keys: string[]): string {
  for (const k of keys) {
    if (present(data, k) && typeof data[k] === "string") return data[k].trim();
  }
  return "";
}

function readNum(data: Record<string, any>, keys: string[]): number {
  for (const k of keys) {
    const v = data[k];
    if (v !== undefined && v !== null && typeof v === "number" && Number.isFinite(v) && v > 0) return v;
  }
  return 0;
}

function readBoolPresent(data: Record<string, any>, keys: string[]): boolean | null {
  for (const k of keys) {
    if (present(data, k)) return !!data[k];
  }
  return null;
}

function readArr(data: Record<string, any>, keys: string[]): string[] {
  for (const k of keys) {
    if (present(data, k) && Array.isArray(data[k])) {
      return data[k].filter((x: unknown) => typeof x === "string");
    }
  }
  return [];
}

// ---------------------------------------------------------------------------
// Category evaluators. Every score is composed of real, verified signals.
// ---------------------------------------------------------------------------

function evalSeo(pd: Record<string, any>, username: string): CategoryResult {
  const reasons: string[] = [];
  const reasonsAr: string[] = [];
  let score = 0;

  const name = readStr(pd, ["fullName", "displayName", "pageName", "channelName", "profileName"]);

  // A name that merely repeats the URL handle is structural, not live data.
  if (name && name !== username) {
    score += 15;
    reasons.push(`Display name present: "${name.slice(0, 40)}"`);
    reasonsAr.push(`اسم العرض موجود: "${name.slice(0, 40)}"`);
  }

  const bio = readStr(pd, ["bio", "about", "aboutText", "description", "signature"]);
  if (bio.length >= 50) { score += 18; reasons.push(`Bio is detailed (${bio.length} chars)`); reasonsAr.push(`الوصف مفصّل (${bio.length} حرف)`); }
  else if (bio.length >= 20) { score += 12; reasons.push(`Bio present (${bio.length} chars)`); reasonsAr.push(`الوصف موجود (${bio.length} حرف)`); }
  else if (bio.length > 0) { score += 6; reasons.push(`Short bio (${bio.length} chars)`); reasonsAr.push(`وصف قصير (${bio.length} حرف)`); }

  const hashtags = readArr(pd, ["bioHashtags", "hashtags", "keywords"]);
  if (hashtags.length >= 3) { score += 15; reasons.push(`${hashtags.length} hashtags in bio`); reasonsAr.push(`${hashtags.length} هاشتاج في الوصف`); }
  else if (hashtags.length >= 1) { score += 8; reasons.push(`${hashtags.length} hashtag in bio`); reasonsAr.push(`${hashtags.length} هاشتاج في الوصف`); }

  const followers = readNum(pd, ["followers", "subscribers", "followerCount"]);
  if (followers > 10000) { score += 10; reasons.push(`Large audience (${followers.toLocaleString()} followers)`); reasonsAr.push(`جمهور كبير (${followers.toLocaleString()} متابع)`); }
  else if (followers > 1000) { score += 7; reasons.push(`Established audience (${followers.toLocaleString()} followers)`); reasonsAr.push(`جمهور راسخ (${followers.toLocaleString()} متابع)`); }
  else if (followers > 100) { score += 4; reasons.push(`Growing audience (${followers.toLocaleString()} followers)`); reasonsAr.push(`جمهور ينمو (${followers.toLocaleString()} متابع)`); }

  const verified = readBoolPresent(pd, ["verified", "channelVerified"]);
  if (verified === true) { score += 10; reasons.push("Verified account"); reasonsAr.push("حساب موثق"); }

  if (username) {
    score += 10; // structural: a real, indexable profile URL exists
    reasons.push(`Public profile URL exists (@${username})`);
    reasonsAr.push(`رابط ملف عام موجود (@${username})`);
  }

  return { available: true, score: Math.min(100, score), reasons, reasonsAr };
}

function evalPresence(pd: Record<string, any>, username: string): CategoryResult {
  const reasons: string[] = [];
  const reasonsAr: string[] = [];
  let score = 0;
  let any = false;

  const name = readStr(pd, ["fullName", "displayName", "pageName", "channelName", "profileName"]);
  if (name && name !== username) { score += 18; any = true; reasons.push(`Display name filled`); reasonsAr.push(`اسم العرض مكتمل`); }

  const bio = readStr(pd, ["bio", "about", "aboutText", "description", "signature"]);
  if (bio.length >= 50) { score += 25; any = true; reasons.push(`Rich bio (${bio.length} chars)`); reasonsAr.push(`وصف غني (${bio.length} حرف)`); }
  else if (bio.length >= 20) { score += 15; any = true; reasons.push(`Bio present (${bio.length} chars)`); reasonsAr.push(`وصف موجود (${bio.length} حرف)`); }
  else if (bio.length > 0) { score += 8; any = true; reasons.push(`Short bio`); reasonsAr.push(`وصف قصير`); }

  const verified = readBoolPresent(pd, ["verified", "channelVerified"]);
  if (verified === true) { score += 15; any = true; reasons.push("Verified"); reasonsAr.push("موثق"); }

  const hashtags = readArr(pd, ["bioHashtags", "hashtags", "keywords"]);
  if (hashtags.length >= 3) { score += 10; }
  else if (hashtags.length >= 1) { score += 5; }
  if (hashtags.length > 0) { any = true; reasons.push(`${hashtags.length} hashtags`); reasonsAr.push(`${hashtags.length} هاشتاج`); }

  const links = readArr(pd, ["bioLinks", "links"]);
  if (links.length > 0) { score += 10; any = true; reasons.push(`${links.length} external link(s) in bio`); reasonsAr.push(`${links.length} رابط خارجي في الوصف`); }

  const avatar = readStr(pd, ["profilePicUrl", "avatarUrl", "metaImage", "profilePicUrlHd"]);
  if (avatar) { score += 10; any = true; reasons.push("Profile avatar available"); reasonsAr.push("صورة الملف متاحة"); }

  const posts = readNum(pd, ["postsCount", "visiblePosts", "videoCount", "totalVideos", "mediaCount"]);
  if (posts > 0) { score += 12; any = true; reasons.push(`${posts} published post(s)`); reasonsAr.push(`${posts} منشور منشور`); }

  return { available: any, score: Math.min(100, score), reasons, reasonsAr };
}

// ---------------------------------------------------------------------------
// Platform weight tables (expressed as normalized shares among available cats)
// ---------------------------------------------------------------------------

const PLATFORM_WEIGHTS: Record<string, Partial<Record<CategoryKey, number>>> = {
  facebook: { seo: 0.2, performance: 0.15, accessibility: 0.15, security: 0.1, content: 0.25, technical: 0.15 },
  instagram: { seo: 0.18, performance: 0.14, accessibility: 0.16, security: 0.08, content: 0.28, technical: 0.16 },
  tiktok: { seo: 0.18, performance: 0.12, accessibility: 0.18, security: 0.07, content: 0.3, technical: 0.15 },
  youtube: { seo: 0.22, performance: 0.18, accessibility: 0.14, security: 0.06, content: 0.26, technical: 0.14 },
  linkedin: { seo: 0.2, performance: 0.18, accessibility: 0.14, security: 0.08, content: 0.24, technical: 0.16 },
  snapchat: { seo: 0.14, performance: 0.22, accessibility: 0.16, security: 0.1, content: 0.22, technical: 0.16 },
};
function evalGrowth(pd: Record<string, any>): CategoryResult {
  const reasons: string[] = [];
  const reasonsAr: string[] = [];
  let score = 0;
  let any = false;

  const followers = readNum(pd, ["followers", "subscribers", "followerCount"]);
  if (followers >= 1000000) { score += 30; any = true; reasons.push(`Audience of ${followers.toLocaleString()}`); reasonsAr.push(`جمهور ${followers.toLocaleString()}`); }
  else if (followers >= 100000) { score += 25; any = true; reasons.push(`Audience of ${followers.toLocaleString()}`); reasonsAr.push(`جمهور ${followers.toLocaleString()}`); }
  else if (followers >= 10000) { score += 20; any = true; reasons.push(`Audience of ${followers.toLocaleString()}`); reasonsAr.push(`جمهور ${followers.toLocaleString()}`); }
  else if (followers >= 1000) { score += 15; any = true; reasons.push(`Audience of ${followers.toLocaleString()}`); reasonsAr.push(`جمهور ${followers.toLocaleString()}`); }
  else if (followers >= 100) { score += 10; any = true; reasons.push(`Audience of ${followers.toLocaleString()}`); reasonsAr.push(`جمهور ${followers.toLocaleString()}`); }
  else if (followers > 0) { score += 5; any = true; reasons.push(`Small audience (${followers.toLocaleString()})`); reasonsAr.push(`جمهور صغير (${followers.toLocaleString()})`); }

  const following = readNum(pd, ["following", "followingCount"]);
  if (following > 0 && followers > 0) {
    any = true;
    const ratio = following / followers;
    const pts = ratio < 0.1 ? 15 : ratio < 0.5 ? 10 : 5;
    score += pts;
    reasons.push(`Follow/follower ratio ${ratio.toFixed(2)}`);
    reasonsAr.push(`نسبة المتابعة الحسابية ${ratio.toFixed(2)}`);
  }

  const likes = readNum(pd, ["likes", "totalLikes", "heartCount"]);
  if (likes >= 1000000) { score += 20; any = true; reasons.push(`${likes.toLocaleString()} total likes`); reasonsAr.push(`${likes.toLocaleString()} إعجاب إجمالي`); }
  else if (likes >= 100000) { score += 16; any = true; reasons.push(`${likes.toLocaleString()} total likes`); reasonsAr.push(`${likes.toLocaleString()} إعجاب إجمالي`); }
  else if (likes >= 10000) { score += 12; any = true; reasons.push(`${likes.toLocaleString()} total likes`); reasonsAr.push(`${likes.toLocaleString()} إعجاب إجمالي`); }
  else if (likes >= 1000) { score += 8; any = true; reasons.push(`${likes.toLocaleString()} total likes`); reasonsAr.push(`${likes.toLocaleString()} إعجاب إجمالي`); }
  else if (likes > 0) { score += 4; any = true; reasons.push(`${likes.toLocaleString()} total likes`); reasonsAr.push(`${likes.toLocaleString()} إعجاب إجمالي`); }

  const posts = readNum(pd, ["postsCount", "visiblePosts", "videoCount", "totalVideos", "mediaCount"]);
  if (posts >= 200) { score += 15; any = true; reasons.push(`${posts} published posts`); reasonsAr.push(`${posts} منشور منشور`); }
  else if (posts >= 100) { score += 12; any = true; reasons.push(`${posts} published posts`); reasonsAr.push(`${posts} منشور منشور`); }
  else if (posts >= 20) { score += 6; any = true; reasons.push(`${posts} published posts`); reasonsAr.push(`${posts} منشور منشور`); }
  else if (posts > 0) { score += 3; any = true; reasons.push(`${posts} published posts`); reasonsAr.push(`${posts} منشور منشور`); }

  return { available: any, score: Math.min(100, score), reasons, reasonsAr };
}

function evalSecurity(pd: Record<string, any>): CategoryResult {
  const reasons: string[] = [];
  const reasonsAr: string[] = [];
  let score = 0;
  let any = false;

  // Verification/privacy claims are only meaningful when we actually fetched
  // profile data. Otherwise the account status is unknown, not "public".
  const hasProfileData =
    readNum(pd, ["followers", "subscribers", "postsCount", "visiblePosts", "videoCount"]) > 0 ||
    readStr(pd, ["bio", "about", "aboutText", "description"]) !== "";
  if (!hasProfileData) {
    return { available: false, score: 0, reasons: [], reasonsAr: [] };
  }

  const verified = readBoolPresent(pd, ["verified", "channelVerified"]);
  if (verified === true) { score += 60; any = true; reasons.push("Verified badge confirmed"); reasonsAr.push("تم تأكيد شارة التوثيق"); }
  else if (verified === false) { score += 25; any = true; reasons.push("Account is not verified (confirmed)"); reasonsAr.push("الحساب غير موثق (مؤكد)"); }

  const isPrivate = readBoolPresent(pd, ["isPrivate", "privateAccount"]);
  if (isPrivate === false) { score += 25; any = true; reasons.push("Profile is public (content reachable)"); reasonsAr.push("الملف عام (المحتوى يمكن الوصول إليه)"); }
  else if (isPrivate === true) { score += 10; any = true; reasons.push("Profile is private — significant discoverability limit"); reasonsAr.push("الملف خاص — قيد واضح على الظهور"); }

  return { available: any, score: Math.min(100, score), reasons, reasonsAr };
}
function evalEngagement(pd: Record<string, any>): CategoryResult {
  const reasons: string[] = [];
  const reasonsAr: string[] = [];
  let score = 0;
  let any = false;

  const rate = readNum(pd, ["engagementRate", "avgEngagementRate"]);
  if (rate > 0) {
    any = true;
    if (rate >= 6) score = 95;
    else if (rate >= 4) score = 85;
    else if (rate >= 3) score = 70;
    else if (rate >= 2) score = 55;
    else if (rate >= 1) score = 40;
    else score = 25;
    reasons.push(`Real engagement rate: ${rate.toFixed(2)}% of followers`);
    reasonsAr.push(`نسبة التفاعل الفعلية: ${rate.toFixed(2)}% من المتابعين`);
  } else {
    const avg = readNum(pd, ["avgLikesPerPost", "avgLikesPerVideo"]);
    const comments = readNum(pd, ["avgCommentsPerPost", "avgCommentsPerVideo"]);
    const views = readNum(pd, ["avgViewsPerVideo", "views"]);
    if (avg > 0 || comments > 0 || views > 0) {
      any = true;
      const primary = avg > 0 ? avg : views > 0 ? views : comments;
      if (primary >= 10000) score = 85;
      else if (primary >= 1000) score = 70;
      else if (primary >= 100) score = 55;
      else if (primary >= 10) score = 40;
      else score = 25;
      reasons.push(`Measured per-post engagement: avg likes ${avg}, comments ${comments}, views ${views}`);
      reasonsAr.push(`تفاعل مُقاس لكل منشور: متوسط الإعجابات ${avg}، التعليقات ${comments}، المشاهدات ${views}`);
    }
  }

  const bio = readStr(pd, ["bio", "about", "aboutText", "description", "signature"]);
  if (any && bio.length >= 50) { score = Math.min(100, score + 5); reasons.push("Detailed bio supports content clarity"); reasonsAr.push("الوصف المفصّل يدعم وضوح المحتوى"); }
  const hashtags = readArr(pd, ["bioHashtags", "hashtags", "keywords"]);
  if (any && hashtags.length >= 3) { score = Math.min(100, score + 5); reasons.push("Hashtag strategy present"); reasonsAr.push("استراتيجية هاشتاجات موجودة"); }

  return { available: any, score: Math.min(100, score), reasons, reasonsAr };
}

function evalTechnical(pd: Record<string, any>): CategoryResult {
  const reasons: string[] = [];
  const reasonsAr: string[] = [];
  let score = 0;
  let any = false;

  const posts = readNum(pd, ["postsCount", "visiblePosts", "videoCount", "totalVideos", "mediaCount"]);
  if (posts >= 500) { score += 30; any = true; reasons.push(`Consistent content library (${posts} posts)`); reasonsAr.push(`مكتبة محتوى منتظمة (${posts} منشور)`); }
  else if (posts >= 200) { score += 26; any = true; reasons.push(`Active content library (${posts} posts)`); reasonsAr.push(`مكتبة محتوى نشطة (${posts} منشور)`); }
  else if (posts >= 100) { score += 22; any = true; reasons.push(`Content library present (${posts} posts)`); reasonsAr.push(`مكتبة محتوى موجودة (${posts} منشور)`); }
  else if (posts >= 50) { score += 18; any = true; reasons.push(`Moderate content output (${posts} posts)`); reasonsAr.push(`إنتاج محتوى متوسط (${posts} منشور)`); }
  else if (posts >= 20) { score += 14; any = true; reasons.push(`Low content output (${posts} posts)`); reasonsAr.push(`إنتاج محتوى منخفض (${posts} منشور)`); }
  else if (posts > 0) { score += 8; any = true; reasons.push(`Very low content footprint (${posts} posts)`); reasonsAr.push(`بصمة محتوى ضعيفة جداً (${posts} منشور)`); }

  const bio = readStr(pd, ["bio", "about", "aboutText", "description", "signature"]);
  if (bio.length >= 50) { score += 20; any = true; reasons.push("Structured bio present"); reasonsAr.push("وصف منظّم موجود"); }
  else if (bio.length > 0) { score += 10; any = true; reasons.push("Bio present"); reasonsAr.push("وصف موجود"); }

  const links = readArr(pd, ["bioLinks", "links"]);
  if (links.length > 0) { score += 15; any = true; reasons.push(`${links.length} trackable link(s) in bio`); reasonsAr.push(`${links.length} رابط قابل للتتبع في الوصف`); }

  const hashtags = readArr(pd, ["bioHashtags", "hashtags", "keywords"]);
  if (hashtags.length >= 3) { score += 15; any = true; reasons.push(`${hashtags.length} hashtags`); reasonsAr.push(`${hashtags.length} هاشتاج`); }
  else if (hashtags.length >= 1) { score += 8; any = true; reasons.push(`${hashtags.length} hashtag`); reasonsAr.push(`${hashtags.length} هاشتاج`); }

  return { available: any, score: Math.min(100, score), reasons, reasonsAr };
}

interface CategoryMeta {
  label: string; labelAr: string; description: string; descriptionAr: string;
}

function categoryMeta(): Record<CategoryKey, CategoryMeta> {
  return {
    seo: { label: "SEO & Discoverability", labelAr: "الظهور والبحث", description: "Name, bio, hashtags, verification and audience size as discoverability signals", descriptionAr: "الاسم، الوصف، الهاشتاجات، التوثيق وحجم الجمهور كإشارات للظهور" },
    performance: { label: "Profile & Presence", labelAr: "الملف والحضور", description: "Completeness of the public profile based on actually provided fields", descriptionAr: "اكتمال الملف العام بناءً على الحقول المتوفرة فعلياً" },
    accessibility: { label: "Audience & Growth", labelAr: "الجمهور والنمو", description: "Real audience size, liking activity and posting volume", descriptionAr: "حجم الجمهور الفعلي ونشاط التفاعل وحجم النشر" },
    security: { label: "Verification & Privacy", labelAr: "التوثيق والخصوصية", description: "Confirmed verification status and public/private visibility", descriptionAr: "حالة التوثيق المؤكدة ومدى علانية الملف" },
    content: { label: "Content & Engagement", labelAr: "المحتوى والتفاعل", description: "Measured engagement rate or per-post engagement metrics", descriptionAr: "نسبة التفاعل المُقاسة أو مؤشرات التفاعل لكل منشور" },
    technical: { label: "Structure & Consistency", labelAr: "البنية والاتساق", description: "Posting volume, bio structure and trackable links", descriptionAr: "حجم النشر وبنية الوصف والروابط القابلة للتتبع" },
  };
}

// ---------------------------------------------------------------------------
// Public entry point
// ---------------------------------------------------------------------------

const MEASURABLE = [
  "followers", "following", "postsCount", "visiblePosts", "likes", "engagementRate",
  "avgLikesPerPost", "avgCommentsPerPost", "avgViewsPerVideo", "bio", "about",
  "aboutText", "description", "verified", "isPrivate", "bioHashtags", "bioLinks",
  "fullName", "pageName", "profilePicUrl", "avatarUrl", "metaImage", "subscribers",
  "videoCount", "totalVideos", "views", "followerCount", "followingCount",
];

export function computeScoreBreakdown(
  platform: string,
  profileData: Record<string, any>,
  username: string
): PlatformScoreBreakdown {
  const pd = profileData || {};
  const usernameSafe = username || "";

  const meta = categoryMeta();
  const evaluators: Record<CategoryKey, (d: Record<string, any>, u: string) => CategoryResult> = {
    seo: evalSeo,
    performance: evalPresence,
    accessibility: evalGrowth,
    security: evalSecurity,
    content: evalEngagement,
    technical: evalTechnical,
  };

  const weights = PLATFORM_WEIGHTS[platform] || PLATFORM_WEIGHTS.facebook;

  const scores = {} as CategoryScores;
  const scoreReasons = {} as Record<CategoryKey, string[]>;
  const scoreReasonsAr = {} as Record<CategoryKey, string[]>;

  let weightedSum = 0;
  let weightTotal = 0;
  let anyAvailable = false;

  for (const key of Object.keys(evaluators) as CategoryKey[]) {
    const result = evaluators[key](pd, usernameSafe);
    const m = meta[key];
    const reasons = result.available ? result.reasons : [
      "No live public data could be verified for this category — no score was invented.",
    ];
    const reasonsAr = result.available ? result.reasonsAr : [
      "لا توجد بيانات عامة حقيقية يمكن التحقق منها لهذا القسم — لم تُختلَق أي درجة.",
    ];

    scores[key] = {
      score: result.score,
      maxScore: 100,
      label: m.label,
      labelAr: m.labelAr,
      description: m.description,
      descriptionAr: m.descriptionAr,
      findings: [],
      unavailable: !result.available,
      reasons,
      reasonsAr,
    } as CategoryScore;

    scoreReasons[key] = reasons;
    scoreReasonsAr[key] = reasonsAr;

    if (result.available) {
      anyAvailable = true;
      const w = weights[key] ?? 0.15;
      weightedSum += w * result.score;
      weightTotal += w;
    }
  }

  const overallScore = weightTotal > 0 ? Math.round(weightedSum / weightTotal) : 0;

  // Build metric availability lists (only explicit keys that hold content)
  const availableMetrics: string[] = [];
  const unavailableMetrics: string[] = [];
  for (const metric of MEASURABLE) {
    if (present(pd, metric)) availableMetrics.push(metric);
    else unavailableMetrics.push(metric);
  }

  return {
    scores,
    overallScore: Math.max(0, Math.min(100, overallScore)),
    overallAvailable: anyAvailable,
    hasLiveData: anyAvailable,
    availableMetrics,
    unavailableMetrics,
    scoreReasons,
    scoreReasonsAr,
  };
}
// ---------------------------------------------------------------------------
// Data-conditioned findings (each finding is tied to a REAL verified signal;
// when no live data exists, only ONE transparent informational finding is
// emitted instead of pretending we measured anything).
// ---------------------------------------------------------------------------

export function buildPlatformFindings(params: {
  platform: string;
  username: string;
  url: string;
  profileData: Record<string, any>;
  locale?: string;
  availableMetrics: string[];
}): Finding[] {
  const { platform, username, url, locale = "en", profileData = {}, availableMetrics } = params;
  const isAr = locale === "ar";
  const findings: Finding[] = [];
  const add = (f: Partial<Finding> & { category: CategoryKey }) => {
    findings.push({
      id: `${platform}-${username}-${findings.length}-${Date.now()}`,
      issue: f.issue || "",
      issueAr: f.issueAr || f.issue || "",
      severity: f.severity || "info",
      evidence: f.evidence || "",
      evidenceAr: f.evidenceAr || f.evidence || "",
      location: url,
      whyItMatters: f.whyItMatters || "",
      whyItMattersAr: f.whyItMattersAr || f.whyItMatters || "",
      howToFix: f.howToFix || "",
      howToFixAr: f.howToFixAr || f.howToFix || "",
      expectedBenefit: f.expectedBenefit || "",
      expectedBenefitAr: f.expectedBenefitAr || f.expectedBenefit || "",
      category: f.category,
    });
  };

  const has = (k: string) => availableMetrics.includes(k) || profileData[k] !== undefined;

  if (availableMetrics.length === 0) {
    add({
      category: "technical",
      severity: "high",
      issue: `No live public data could be retrieved from ${platform} for this profile. Scores reflect only structural signals (profile URL). Connect an official API credential, or open the profile publicly, to enable a full data-driven audit.`,
      issueAr: `تعذّر استرداد أي بيانات عامة حقيقية من ${platformLabelAr(platform)} لهذا الملف. الدرجات تعكس إشارات بنيوية فقط (رابط الملف). قم بربط مفتاح API رسمي، أو اجعل الملف متاحاً للجمهور، لتمكين تدقيق كامل مبنٍ على البيانات.`,
      evidence: "Platform returned no verifiable public fields",
      evidenceAr: "لم تُرجع المنصة أي حقول عامة قابلة للتحقق",
      whyItMatters: "Scores without live data would be guesses. Smart Land never invents numbers — this notice is intentional.",
      whyItMattersAr: "الدرجات بدون بيانات حية ستكون تخميناً. سمارت لاند لا تخترع أرقاماً — هذا التنبيه مقصود.",
      howToFix: "Make the account public or connect the platform's official API",
      howToFixAr: "اجعل الحساب عاماً أو اربط واجهة برمجة المنصة الرسمية",
      expectedBenefit: "Full evidence-based audit with real metrics",
      expectedBenefitAr: "تدقيق كامل مبنٍ على أدلة ومقاييس حقيقية",
    });
    return sortBySeverity(findings);
  }

  const bio = typeof profileData.bio === "string" ? profileData.bio : "";

  if (has("bio") || has("aboutText") || has("about")) {
    if (bio.length < 10) {
      add({
        category: "content",
        severity: "high",
        issue: `The verified bio is only ${bio.length} character(s) — far below the 50+ recommended for discoverability.`,
        issueAr: `الوصف الذي تم التحقق منه ${bio.length} حرف فقط — أقل بكثير من 50+ حرف الموصى بها للظهور.`,
        evidence: `Verified bio length: ${bio.length} chars · content: "${bio.slice(0, 40)}"`,
        evidenceAr: `طول الوصف المحقق: ${bio.length} حرف · المحتوى: "${bio.slice(0, 40)}"`,
        whyItMatters: "A rich, keyworded bio is how platform search and audiences understand the profile.",
        whyItMattersAr: "الوصف الغني بالكلمات المفتاحية هو كيف تفهم منصة البحث والجمهور الملف.",
        howToFix: "Write a 50-150 character bio with a value proposition, 3-5 keywords and a call to action.",
        howToFixAr: "اكتب وصفاً من 50-150 حرفاً يتضمن عرض القيمة و3-5 كلمات مفتاحية ودعوة لاتخاذ إجراء.",
        expectedBenefit: "Better search visibility and profile-to-follower conversion",
        expectedBenefitAr: "ظهور أفضل في البحث وتحويل أفضل من الملف إلى متابع",
      });
    }

    const hashtags = Array.isArray(profileData.bioHashtags) ? profileData.bioHashtags : [];
    if (hashtags.length === 0) {
      add({
        category: "seo",
        severity: "medium",
        issue: `The bio contains no hashtags (verified). Hashtags connect the profile to topic-based search and recommendation feeds.`,
        issueAr: `الوصف لا يحتوي على هاشتاجات (تم التحقق). الهاشتاجات تربط الملف بالبحث القائم على المواضيع وخلاصات التوصية.`,
        evidence: `Hashtags in bio: 0`,
        evidenceAr: `الهاشتاجات في الوصف: 0`,
        whyItMatters: "Accounts using niche hashtags get significantly more topic-based discovery.",
        whyItMattersAr: "الحسابات التي تستخدم هاشتاجات متخصصة تحصل على اكتشاف أكبر عبر المواضيع.",
        howToFix: "Add 3-5 niche hashtags describing your content focus to the bio.",
        howToFixAr: "أضف 3-5 هاشتاجات متخصصة تصف تركيز محتواك إلى الوصف.",
        expectedBenefit: "Higher discovery through hashtag search",
        expectedBenefitAr: "ظهور أعلى عبر البحث بالهاشتاج",
      });
    }

    const links = Array.isArray(profileData.bioLinks) ? profileData.bioLinks : [];
    if (links.length === 0) {
      add({
        category: "content",
        severity: "medium",
        issue: `No external links found in the verified bio — a missed conversion opportunity.`,
        issueAr: `لا توجد روابط خارجية في الوصف المحقق — فرصة تحويل ضائعة.`,
        evidence: `Links in bio: 0`,
        evidenceAr: `الروابط في الوصف: 0`,
        whyItMatters: "Bio links are the primary way audiences convert to traffic or customers.",
        whyItMattersAr: "الروابط في الوصف هي الطريقة الأساسية لتحويل الجمهور إلى زيارات أو عملاء.",
        howToFix: "Add a trackable link (link-in-bio tool, landing page, or direct site link).",
        howToFixAr: "أضف رابطاً قابلاً للتتبع (أداة روابط أو صفحة هبوط أو رابط مباشر للموقع).",
        expectedBenefit: "Convert a share of profile visits into clicks",
        expectedBenefitAr: "تحويل نسبة من زيارات الملف إلى نقرات",
      });
    }
  }
const verified = profileData.verified;
  if (verified === false && Number(profileData.followers || 0) > 1000) {
    add({
      category: "security",
      severity: "medium",
      issue: `The account is confirmed as NOT verified despite having ${Number(profileData.followers).toLocaleString()} followers.`,
      issueAr: `تم تأكيد أن الحساب غير موثق رغم امتلاكه ${Number(profileData.followers).toLocaleString()} متابعاً.`,
      evidence: `Verified status: false · followers: ${Number(profileData.followers).toLocaleString()}`,
      evidenceAr: `حالة التوثيق: غير موثق · المتابعون: ${Number(profileData.followers).toLocaleString()}`,
      whyItMatters: "Unverified profiles can suffer from lower trust signals and impersonation risk.",
      whyItMattersAr: "الملفات غير الموثقة قد تعاني من انخفاض إشارات الثقة وخطر انتحال الشخصية.",
      howToFix: "Apply for platform verification if eligible.",
      howToFixAr: "قم بالتقديم للتوثيق على المنصة إذا كنت مؤهلاً.",
      expectedBenefit: "Stronger trust and reduced impersonation risk",
      expectedBenefitAr: "ثقة أعلى وتقليل خطر انتحال الشخصية",
    });
  }

  const engagementRate = Number(profileData.engagementRate || 0);
  if (engagementRate > 0 && engagementRate < 2.5) {
    add({
      category: "content",
      severity: "high",
      issue: `Measured engagement rate ${engagementRate.toFixed(2)}% is below the typical 3-6% healthy range.`,
      issueAr: `نسبة التفاعل المُقاسة ${engagementRate.toFixed(2)}% أقل من النطاق الصحي المعتاد 3-6%.`,
      evidence: `Engagement rate: ${engagementRate.toFixed(2)}% of ${Number(profileData.followers || 0).toLocaleString()} followers`,
      evidenceAr: `نسبة التفاعل: ${engagementRate.toFixed(2)}% من ${Number(profileData.followers || 0).toLocaleString()} متابع`,
      whyItMatters: "Low engagement signals to algorithms that content is not resonating, shrinking organic reach.",
      whyItMattersAr: "التفاعل المنخفض يخبر الخوارزميات أن المحتوى لا يلقى صدى، مما يقلص الوصول العضوي.",
      howToFix: "Post emotionally-engaging content, ask questions, respond to comments quickly and post consistently.",
      howToFixAr: "انشر محتوى تفاعلياً، اطرح أسئلة، رد على التعليقات بسرعة وانشر بانتظام.",
      expectedBenefit: "Restore reach by improving measured engagement rate",
      expectedBenefitAr: "استعادة الوصول عبر تحسين نسبة التفاعل المقاسة",
    });
  }

  const followers = Number(profileData.followers || 0);
  const posts = Number(profileData.postsCount || profileData.visiblePosts || 0);
  if (followers > 0 && posts > 0) {
    const ratio = followers / posts;
    if (ratio < 3) {
      add({
        category: "content",
        severity: "medium",
        issue: `Measured follower-to-content ratio is ${ratio.toFixed(1)} followers per post — content volume may exceed audience conversion.`,
        issueAr: `نسبة المتابعين إلى المحتوى المُقاسة ${ratio.toFixed(1)} متابع لكل منشور — قد يتجاوز حجم المحتوى تحويل الجمهور.`,
        evidence: `${followers.toLocaleString()} followers / ${posts} posts = ${ratio.toFixed(1)} per post`,
        evidenceAr: `${followers.toLocaleString()} متابع / ${posts} منشور = ${ratio.toFixed(1)} لكل منشور`,
        whyItMatters: "A healthy ratio is 10+ followers per post. Lower ratios show content is not converting viewers.",
        whyItMattersAr: "النسبة الصحية 10+ متابع لكل منشور. النسب الأقل تشير إلى أن المحتوى لا يحول المشاهدين إلى متابعين.",
        howToFix: "Add follow-worthy value hooks and cross-promote your best posts.",
        howToFixAr: "أضف خطافات تستحق المتابعة وروج لمنشوراتك الأفضل عبر المنصات.",
        expectedBenefit: "Improve follower-to-post conversion ratio",
        expectedBenefitAr: "تحسين نسبة تحويل المتابعين إلى المنشورات",
      });
    }
  }

  const isPrivate = profileData.isPrivate;
  if (isPrivate === true) {
    add({
      category: "accessibility",
      severity: "high",
      issue: `The profile is confirmed as PRIVATE. Public metrics and content are not reachable, severely limiting analysis and growth tracking.`,
      issueAr: `تم تأكيد أن الملف خاص. المقاييس العامة والمحتوى غير قابلة للوصول، مما يحد بشدة من التحليل وتتبع النمو.`,
      evidence: "Privacy status: private",
      evidenceAr: "حالة الخصوصية: خاص",
      whyItMatters: "Private accounts cannot be analyzed or discovered publicly.",
      whyItMattersAr: "الحسابات الخاصة لا يمكن تحليلها أو اكتشافها علناً.",
      howToFix: "Switch the account to public to enable monitoring and growth tools.",
      howToFixAr: "حوّل الحساب إلى عام لتمكين أدوات المراقبة والنمو.",
      expectedBenefit: "Analyzable public profile with trackable metrics",
      expectedBenefitAr: "ملف عام قابل للتحليل مع مقاييس قابلة للتتبع",
    });
  }

  return sortBySeverity(findings);
}
export function buildPlatformStrengths(params: {
  platform: string;
  profileData: Record<string, any>;
  locale?: string;
}): string[] {
  const { platform, profileData = {}, locale = "en" } = params;
  const isAr = locale === "ar";
  const s: string[] = [];
  const add = (en: string, ar: string) => s.push(isAr ? `✓ ${ar}` : `✓ ${en}`);

  const followers = Number(profileData.followers || 0);
  if (followers > 0) add(`Real audience of ${followers.toLocaleString()} on ${platform}`, `جمهور حقيقي ${followers.toLocaleString()} على ${platform}`);
  if (profileData.verified === true) add("Verified account", "حساب موثق");
  const bio = typeof profileData.bio === "string" ? profileData.bio : "";
  if (bio.length >= 20) add(`Rich bio (${bio.length} chars)`, `وصف غني (${bio.length} حرف)`);
  const hashtags = Array.isArray(profileData.bioHashtags) ? profileData.bioHashtags : [];
  if (hashtags.length >= 3) add(`${hashtags.length} strategic hashtags`, `${hashtags.length} هاشتاج استراتيجي`);
  const links = Array.isArray(profileData.bioLinks) ? profileData.bioLinks : [];
  if (links.length > 0) add(`${links.length} link(s) in bio`, `${links.length} رابط في الوصف`);
  const posts = Number(profileData.postsCount || profileData.visiblePosts || 0);
  if (posts >= 100) add(`Active content library (${posts} posts)`, `مكتبة محتوى نشطة (${posts} منشور)`);
  const rate = Number(profileData.engagementRate || 0);
  if (rate >= 3) add(`Healthy engagement rate (${rate.toFixed(2)}%)`, `نسبة تفاعل صحية (${rate.toFixed(2)}%)`);

  if (s.length === 0 && Object.keys(profileData).length === 0) {
    s.push(isAr ? "الملف العام موجود وقابل للفهرسة" : "Profile URL exists and is indexable");
  }
  return s;
}

export function buildPlatformWeaknesses(params: {
  platform: string;
  profileData: Record<string, any>;
  locale?: string;
}): string[] {
  const { profileData = {}, locale = "en" } = params;
  const isAr = locale === "ar";
  const w: string[] = [];

  const bio = typeof profileData.bio === "string" ? profileData.bio : "";
  if (typeof profileData.bio === "string" && bio.length < 20) w.push(isAr ? `وصف قصير (${bio.length} حرف)` : `Short bio (${bio.length} chars)`);
  const hashtags = Array.isArray(profileData.bioHashtags) ? profileData.bioHashtags : [];
  if (typeof profileData.bio === "string" && hashtags.length === 0) w.push(isAr ? "لا هاشتاجات في الوصف" : "No hashtags in bio");
  const links = Array.isArray(profileData.bioLinks) ? profileData.bioLinks : [];
  if (typeof profileData.bio === "string" && links.length === 0) w.push(isAr ? "لا روابط خارجية في الوصف" : "No external links in bio");

  // Verification / privacy claims are only reported when we actually have
  // profile data; otherwise the status is unknown, not a confirmed weakness.
  const hasProfileData =
    Number(profileData.followers || 0) > 0 ||
    Number(profileData.postsCount || profileData.visiblePosts || 0) > 0 ||
    typeof profileData.bio === "string";
  if (hasProfileData && profileData.verified === false) w.push(isAr ? "الحساب غير موثق" : "Account is not verified");
  if (hasProfileData && profileData.isPrivate === true) w.push(isAr ? "الملف خاص — يمنع التحليل العام" : "Profile is private — blocks public analysis");

  const posts = Number(profileData.postsCount || profileData.visiblePosts || 0);
  if (posts > 0 && posts < 20) w.push(isAr ? `محتوى محدود (${posts} منشور)` : `Limited content (${posts} posts)`);
  const rate = Number(profileData.engagementRate || 0);
  if (rate > 0 && rate < 2.5) w.push(isAr ? `تفاعل منخفض (${rate.toFixed(2)}%)` : `Low engagement (${rate.toFixed(2)}%)`);

  return w;
}

export function buildPlatformSummary(params: {
  platform: string;
  username: string;
  profileData: Record<string, any>;
  locale?: string;
}): string {
  const { platform, username, profileData = {}, locale = "en" } = params;
  const isAr = locale === "ar";
  const followers = Number(profileData.followers || 0);
  const name = typeof profileData.fullName === "string" && profileData.fullName ? profileData.fullName : username;
  const posts = Number(profileData.postsCount || profileData.visiblePosts || 0);
  const rate = Number(profileData.engagementRate || 0);

  if (Object.keys(profileData).length === 0) {
    return isAr
      ? `تعذّر استرداد بيانات عامة حقيقية من ${platformLabelAr(platform)} للحساب "${username}" — النتائج تعكس البنية فقط ولا تخترع أرقاماً.`
      : `No live public data could be retrieved for ${platform} account "${username}" — results reflect structure only and no numbers are invented.`;
  }
  if (followers > 0) {
    return isAr
      ? `حساب ${platformLabelAr(platform)} "${name}" — جمهور حقيقي ${followers.toLocaleString()}، و${posts} منشور${rate > 0 ? `، ونسبة تفاعل ${rate.toFixed(2)}%` : ""}.`
      : `${platform} account "${name}" — real audience of ${followers.toLocaleString()}, ${posts} posts${rate > 0 ? `, ${rate.toFixed(2)}% engagement` : ""}.`;
  }
  return isAr
    ? `حساب ${platformLabelAr(platform)} "${name}" جاهز للتحليل، لكن البيانات العامة المتاحة محدودة حالياً وتم تسجيل الدرجات بناءً عليها فقط.`
    : `${platform} account "${name}" is analyzable, but limited public data is currently available and scores reflect only that.`;
}
function sortBySeverity(findings: Finding[]): Finding[] {
  const order: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
  return [...findings].sort((a, b) => (order[a.severity] ?? 5) - (order[b.severity] ?? 5));
}

function platformLabelAr(platform: string): string {
  const labels: Record<string, string> = {
    facebook: "فيسبوك", instagram: "إنستغرام", tiktok: "تيك توك", youtube: "يوتيوب",
    linkedin: "لينكد إن", snapchat: "سناب شات", twitter: "تويتر",
  };
  return labels[platform] || platform;
}