// =============================================================================
// Smart Land v3.1 - Social Analysis Helper
// =============================================================================
// Combines REAL platform data extraction with the Intelligent Analysis Engine
// to produce UNIQUE, data-driven analysis for every social account.
// =============================================================================

import { generateUniqueAnalysis, type UniqueAnalysisOutput } from "./intelligent-analysis-engine";
import { analyzeSocialWithGemini } from "./gemini-analysis";

/**
 * Build a complete analysis response by combining:
 * 1. Real extracted profile data (when available)
 * 2. Gemini AI evidence-based analysis (when configured) — else the intelligent engine
 */
export async function buildSocialAnalysisResponse(params: {
  platform: string;
  username: string;
  url: string;
  locale?: string;
  profileData?: Record<string, any>;
  extraData?: Record<string, any>;
  dataSources?: string[];
  sourceConfidence?: "high" | "medium" | "low";
  startTime?: number;
}) {
  const {
    platform,
    username,
    url,
    locale = "en",
    profileData = {},
    extraData = {},
    dataSources,
    sourceConfidence,
    startTime = Date.now(),
  } = params;

  // Try Gemini (real, evidence-based analysis of the extracted data) first;
  // fall back to the deterministic intelligent engine if Gemini is unavailable.
  let analysis: UniqueAnalysisOutput | null = null;
  let engine = "intelligent-analysis-engine";
  try {
    analysis = await analyzeSocialWithGemini({
      platform,
      username,
      url,
      locale,
      profileData,
    });
    if (analysis) engine = "gemini-ai";
  } catch {
    analysis = null;
  }
  if (!analysis) {
    analysis = generateUniqueAnalysis({
      platform,
      username,
      url,
      locale,
      profileData,
    });
  }

  const duration = Math.round((Date.now() - startTime) / 1000);
  const metadataDataSources = dataSources ?? analysis.dataSources;
  const metadataSourceConfidence = sourceConfidence ?? computeSourceConfidence(profileData);

  // Transparency layer: when no real public data could be extracted, make sure
  // the report clearly says so instead of presenting estimates as hard facts.
  const analysisLimitations = [...analysis.limitations];
  if (metadataSourceConfidence === "low") {
    analysisLimitations.unshift(
      locale === "ar"
        ? "تعذّر استرداد بيانات عامة حقيقية من المنصة لهذا الحساب — النتائج تقديرية مبنية على إشارات جزئية فقط"
        : "No live public data could be retrieved for this account — results are estimates based on partial signals only"
    );
  }

  return {
    success: true,
    data: {
      platform,
      url,
      username,
      ...extraData,
      ...profileData,
      overallScore: analysis.overallScore,
      scores: analysis.scores,
      findings: analysis.findings,
      strengths: analysis.strengths,
      weaknesses: analysis.weaknesses,
      profileSummary: analysis.profileSummary,
      criticalIssues: analysis.findings.filter(
        (f) => f.severity === "critical" || f.severity === "high"
      ),
      metadata: {
        analyzedUrl: url,
        analysisDate: new Date().toISOString(),
        duration,
        dataSources: metadataDataSources,
        limitations: analysisLimitations,
        methodologyVersion: "3.2.0",
        sourceConfidence: metadataSourceConfidence,
        engine,
      },
    },
  };
}

/**
 * Convert platform-specific raw data into normalized profileData
 * for the intelligent analysis engine.
 */
export function normalizeProfileData(platform: string, raw: Record<string, any>): Record<string, any> {
  const normalized: Record<string, any> = {};

  // Common fields with platform-specific mapping
  const mappings: Record<string, Record<string, string[]>> = {
    followers: {
      instagram: ["followers"],
      facebook: ["followers"],
      tiktok: ["followers", "followerCount"],
      youtube: ["subscribers"],
      snapchat: [],
      linkedin: ["connections"],
    },
    following: {
      instagram: ["following"],
      tiktok: ["following", "followingCount"],
      facebook: [],
      youtube: [],
      snapchat: [],
      linkedin: [],
    },
    postsCount: {
      instagram: ["postsCount", "mediaCount"],
      facebook: ["visiblePosts", "postsCount"],
      tiktok: ["videoCount", "totalVideos"],
      youtube: ["videoCount", "totalVideos"],
      snapchat: [],
      linkedin: [],
    },
    likes: {
      instagram: ["likes", "totalLikes"],
      tiktok: ["likes", "heartCount"],
      youtube: ["likes"],
      facebook: [],
      snapchat: [],
      linkedin: [],
    },
    engagementRate: {
      instagram: ["engagementRate"],
      tiktok: ["avgEngagementRate", "engagementRate"],
      youtube: ["engagementRate"],
      facebook: [],
      snapchat: [],
      linkedin: [],
    },
    avgLikesPerPost: {
      instagram: ["avgLikesPerPost"],
      tiktok: [],
      youtube: [],
      facebook: [],
      snapchat: [],
      linkedin: [],
    },
    avgViewsPerVideo: {
      instagram: [],
      tiktok: ["avgViewsPerVideo"],
      youtube: ["views"],
      facebook: [],
      snapchat: [],
      linkedin: [],
    },
    avgCommentsPerPost: {
      instagram: ["avgCommentsPerPost"],
      tiktok: ["avgCommentsPerVideo"],
      youtube: ["commentCount"],
      facebook: [],
      snapchat: [],
      linkedin: [],
    },
    bio: {
      instagram: ["bio"],
      tiktok: ["bio", "signature"],
      facebook: ["about", "aboutText"],
      snapchat: ["bio"],
      youtube: ["description"],
      linkedin: ["headline"],
    },
    fullName: {
      instagram: ["fullName"],
      tiktok: ["displayName", "nickname"],
      facebook: ["pageName"],
      snapchat: ["displayName"],
      youtube: ["channelName"],
      linkedin: ["profileName"],
    },
    displayName: {
      instagram: ["fullName"],
      tiktok: ["displayName", "nickname"],
      facebook: ["pageName"],
      snapchat: ["displayName"],
      youtube: ["channelName"],
      linkedin: ["profileName"],
    },
    verified: {
      instagram: ["verified"],
      tiktok: ["verified"],
      facebook: ["verified"],
      youtube: ["channelVerified"],
      snapchat: ["verified"],
      linkedin: ["verified"],
    },
    isPrivate: {
      instagram: ["isPrivate"],
      tiktok: ["isPrivate", "privateAccount"],
      facebook: ["isPrivate"],
      youtube: [],
      snapchat: [],
      linkedin: [],
    },
    bioHashtags: {
      instagram: ["bioHashtags", "hashtags"],
      tiktok: ["bioHashtags", "hashtags"],
      facebook: ["hashtags"],
      snapchat: ["hashtags"],
      youtube: ["hashtags"],
      linkedin: ["keywords"],
    },
    bioLinks: {
      instagram: ["bioLinks", "links"],
      tiktok: ["bioLinks", "links"],
      facebook: ["links"],
      snapchat: ["links"],
      youtube: [],
      linkedin: [],
    },
  };

  // Apply mappings
  for (const [targetField, sourceMap] of Object.entries(mappings)) {
    const sources = sourceMap[platform] || [];
    for (const source of sources) {
      const value = raw[source];
      if (value !== undefined && value !== null && value !== "") {
        normalized[targetField] = value;
        break;
      }
    }
  }

  // Special handling for numeric fields that might be strings
  for (const numField of ["followers", "following", "postsCount", "likes", "engagementRate", "avgLikesPerPost", "avgViewsPerVideo", "avgCommentsPerPost"]) {
    if (typeof normalized[numField] === "string") {
      const parsed = parseNumericString(normalized[numField]);
      if (!isNaN(parsed)) {
        normalized[numField] = parsed;
      }
    }
  }

  // Special handling: YouTube subscribers text like "1.2M" or "1,234"
  if (platform === "youtube" && typeof raw.subscribersText === "string") {
    const parsed = parseCountString(raw.subscribersText);
    if (parsed > 0) normalized.followers = parsed;
  }

  // Special handling: Facebook follower text
  if (platform === "facebook" && typeof raw.followersText === "string") {
    const parsed = parseCountString(raw.followersText);
    if (parsed > 0) normalized.followers = parsed;
  }

  // Ensure booleans
  normalized.verified = !!normalized.verified;
  normalized.isPrivate = !!normalized.isPrivate;

  // Ensure arrays
  if (!Array.isArray(normalized.bioHashtags)) normalized.bioHashtags = [];
  if (!Array.isArray(normalized.bioLinks)) normalized.bioLinks = [];

  // Ensure strings
  normalized.bio = typeof normalized.bio === "string" ? normalized.bio : "";
  normalized.fullName = typeof normalized.fullName === "string" ? normalized.fullName : "";

  return normalized;
}

function computeSourceConfidence(profileData: Record<string, any>): "high" | "medium" | "low" {
  const indicators = [
    "followers",
    "following",
    "postsCount",
    "videoCount",
    "subscribers",
    "likes",
    "engagementRate",
    "bio",
    "description",
    "title",
    "profilePicUrl",
    "avatarUrl",
  ];
  const score = indicators.reduce((count, field) => {
    const value = profileData[field];
    return value !== undefined && value !== null && value !== "" ? count + 1 : count;
  }, 0);

  if (score >= 3) return "high";
  if (score > 0) return "medium";
  return "low";
}

function parseNumericString(val: string): number {
  const cleaned = val.replace(/[^0-9.\-]/g, "");
  return parseFloat(cleaned);
}

function parseCountString(str: string): number {
  const cleaned = str.replace(/[^0-9.KM]/gi, "");
  if (cleaned.endsWith("M")) return parseFloat(cleaned) * 1000000;
  if (cleaned.endsWith("K")) return parseFloat(cleaned) * 1000;
  return parseFloat(cleaned) || 0;
}