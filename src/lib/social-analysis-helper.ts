// =============================================================================
// Smart Land v3.1 - Social Analysis Helper
// =============================================================================
// Combines REAL platform data extraction with the Intelligent Analysis Engine
// to produce UNIQUE, data-driven analysis for every social account.
// =============================================================================

import { generateUniqueAnalysis } from "./intelligent-analysis-engine";

/**
 * Build a complete analysis response by combining:
 * 1. Real extracted profile data (when available)
 * 2. Intelligent unique analysis generation
 */
export function buildSocialAnalysisResponse(params: {
  platform: string;
  username: string;
  url: string;
  locale?: string;
  profileData?: Record<string, any>;
  extraData?: Record<string, any>;
  startTime?: number;
}) {
  const {
    platform,
    username,
    url,
    locale = "en",
    profileData = {},
    extraData = {},
    startTime = Date.now(),
  } = params;

  // Generate UNIQUE analysis using the intelligent engine
  const analysis = generateUniqueAnalysis({
    platform,
    username,
    url,
    locale,
    profileData,
  });

  const duration = Math.round((Date.now() - startTime) / 1000);

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
        dataSources: analysis.dataSources,
        limitations: analysis.limitations,
        methodologyVersion: "3.1.0",
        engine: "intelligent-analysis-engine",
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