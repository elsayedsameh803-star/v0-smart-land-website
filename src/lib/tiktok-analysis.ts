// =============================================================================
// Smart Land - TikTok analysis orchestration (data-driven, server-side)
// =============================================================================
// Turns real TikTok API payloads into the normalized profileData the analysis
// engine understands. Every number in the result originates from an official
// TikTok endpoint — never a fabricated default. Missing values are simply
// absent (omitted by JSON.stringify) so the UI reports them as "not available".
//
// Data path priority for a single PUBLIC video:
//   1. oEmbed            -> real title/author/thumbnail (always public)
//   2. Research API      -> full real metrics IF the app is Research-approved
//                           (client_credentials grant, NO user login needed)
//   3. Display /video/query -> real metrics IF the visitor authorized AND the
//                           video belongs to that authorized account
// =============================================================================

import {
  fetchTikTokOEmbed,
  queryResearchVideoById,
  queryResearchUserInfo,
  displayVideoQuery,
  displayUserInfo,
} from "./tiktok-api";
import { extractTikTokHandle } from "./tiktok-utils";
import type { TikTokOAuthSessionData } from "./tiktok-session";
import { logTikTok } from "./tiktok-log";

export interface TikTokAnalysisOutcome {
  username: string;
  url: string;
  profileData: Record<string, any>;
  extraData: Record<string, any>;
  dataSources: string[];
  limitations: string[];
  sourceConfidence: "high" | "medium" | "low";
  via: "research" | "display" | "oembed-only";
}

function extractHandleFromAuthorUrl(authorUrl: string | null): string | null {
  if (!authorUrl) return null;
  return extractTikTokHandle(authorUrl);
}

function pickHashtags(video: any): string[] {
  // Research-style: hashtag_info = [{ tag_name }]
  if (Array.isArray(video?.hashtag_info)) {
    return video.hashtag_info
      .map((h: any) => (typeof h === "string" ? h : h?.tag_name))
      .filter(Boolean);
  }
  // Display-style: hashtag_names = [...]
  if (Array.isArray(video?.hashtag_names)) {
    return video.hashtag_names.filter((h: any) => typeof h === "string");
  }
  return [];
}

function extractHashtagsFromText(text: string | undefined | null): string[] {
  if (!text) return [];
  return (text.match(/#[a-zA-Z0-9_]+/g) || []).map((h) => h.replace("#", ""));
}

function toPositiveInt(value: any): number | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}
/** Analyze a single TikTok video by its numeric id. Uses ONLY real data. */
export async function analyzeTikTokVideo(params: {
  videoId: string;
  handle?: string | null;
  session?: TikTokOAuthSessionData | null;
  locale?: string;
}): Promise<TikTokAnalysisOutcome> {
  const { videoId, handle, session } = params;

  const canonicalUrl = handle
    ? `https://www.tiktok.com/@${handle}/video/${videoId}`
    : `https://www.tiktok.com/video/${videoId}`;

  const oembed = await fetchTikTokOEmbed(canonicalUrl);
  const username = handle || extractHandleFromAuthorUrl(oembed.authorUrl) || videoId;

  // ---- Research API first (client credentials, no user consent needed) ----
  let video: any = null;
  let via: "research" | "display" | "oembed-only" = "oembed-only";
  const research = await queryResearchVideoById(videoId);
  if (research && !research.__httpError && !research.__empty) {
    video = research;
    via = "research";
  } else if (research && research.__httpError === 400) {
    logTikTok("warn", "research_video_rejected", { videoId: videoId.slice(0, 4) });
  }

  // ---- Display API fallback (only own videos of an authorized user) ----
  if (!video && session?.accessToken) {
    const userVideo = await displayVideoQuery(session.accessToken, videoId);
    if (userVideo) {
      video = userVideo;
      via = "display";
    }
  }

  const profileData: Record<string, any> = {};
  const extraData: Record<string, any> = {};

  profileData.username = username;
  if (oembed.authorName) profileData.displayName = oembed.authorName;
  if (oembed.title) extraData.videoTitle = oembed.title;
  if (oembed.thumbnailUrl) extraData.coverUrl = oembed.thumbnailUrl;

  const description = video?.video_description || oembed.title || "";
  if (description) profileData.bio = description;

  // ---- Real engagement metrics (ONLY when actually measured) ----
  if (video) {
    const views = toPositiveInt(video.view_count);
    const likes = toPositiveInt(video.like_count);
    const comments = toPositiveInt(video.comment_count);
    const shares = toPositiveInt(video.share_count);
    const duration = toPositiveInt(video.duration);

    if (views) {
      profileData.views = views;
      profileData.avgViewsPerVideo = views;
    }
    if (likes) profileData.likes = likes;
    if (comments !== undefined && comments > 0) {
      profileData.commentCount = comments;
      profileData.avgCommentsPerPost = comments;
    }
    if (shares) profileData.shares = shares;
    if (duration) {
      profileData.duration = duration;
      extraData.duration = duration;
    }

    if (views && (likes || comments || shares)) {
      profileData.engagementRate =
        Math.round((((likes ?? 0) + (comments ?? 0) + (shares ?? 0)) / views) * 10000) / 100;
    }
  }

  // ---- Hashtags (from the real payload or real description) ----
  const hashtags = pickHashtags(video).concat(extractHashtagsFromText(description));
  const uniqueHashtags = Array.from(new Set(hashtags.map((h) => h.toLowerCase())));
  if (uniqueHashtags.length) {
    profileData.bioHashtags = uniqueHashtags.slice(0, 30);
    extraData.hashtags = uniqueHashtags.slice(0, 30);
  }

  const dataSources = ["tiktok-oembed"];
  const limitations: string[] = [];
  let sourceConfidence: "high" | "medium" | "low" = oembed.authorName
    ? "medium"
    : "low";

  if (via === "research") {
    dataSources.push("tiktok-research-api");
    sourceConfidence = "high";
  } else if (via === "display") {
    dataSources.push("tiktok-display-api");
    sourceConfidence = "high";
  }

  if (via === "oembed-only") {
    limitations.push(
      params.locale === "ar"
        ? "تعذّر جلب مقاييس الفيديو من واجهات TikTok المأذون بها لهذا التطبيق. عُرضت البيانات العامة المتاحة فعلياً (العنوان، المؤلف، الصورة). لم تُختلق أي مقاييس."
        : "Could not retrieve numeric metrics from the TikTok APIs this app is authorized for. Only genuinely public data (title, author, thumbnail) is shown. No metrics were invented."
    );
    logTikTok("warn", "video_oembed_only", { videoId: videoId.slice(0, 4) });
  }

  return {
    username,
    url: canonicalUrl,
    profileData,
    extraData,
    dataSources,
    limitations,
    sourceConfidence,
    via,
  };
}
/** Analyze a TikTok PROFILE (handle) using real Research user info + oEmbed. */
export async function analyzeTikTokProfile(params: {
  handle: string;
  session?: TikTokOAuthSessionData | null;
  locale?: string;
}): Promise<TikTokAnalysisOutcome> {
  const { handle, session } = params;
  const cleanHandle = handle.replace(/^@/, "");
  const canonicalUrl = `https://www.tiktok.com/@${cleanHandle}`;

  const oembed = await fetchTikTokOEmbed(canonicalUrl);

  const profileData: Record<string, any> = {};
  const extraData: Record<string, any> = {};

  profileData.username = cleanHandle;
  if (oembed.authorName && oembed.authorName !== cleanHandle) {
    profileData.displayName = oembed.authorName;
  }
  if (oembed.thumbnailUrl) extraData.coverUrl = oembed.thumbnailUrl;

  // ---- Research API: real account metrics (client credentials) ----
  let via: "research" | "display" | "oembed-only" = "oembed-only";
  let hasStats = false;

  const researchUser = await queryResearchUserInfo(cleanHandle);
  if (researchUser && !researchUser.__httpError) {
    profileData.displayName =
      researchUser.display_name || profileData.displayName || cleanHandle;
    if (researchUser.bio_description) profileData.bio = researchUser.bio_description;
    const followers = toPositiveInt(researchUser.follower_count);
    const following = toPositiveInt(researchUser.following_count);
    const likes = toPositiveInt(researchUser.likes_count);
    const videoCount = toPositiveInt(researchUser.video_count);
    if (followers) profileData.followers = followers;
    if (following) profileData.following = following;
    if (likes) profileData.likes = likes;
    if (videoCount) {
      profileData.videoCount = videoCount;
      profileData.postsCount = videoCount;
    }
    if (researchUser.avatar_url) {
      profileData.avatarUrl = researchUser.avatar_url;
      extraData.avatarUrl = researchUser.avatar_url;
    }
    if (typeof researchUser.is_verified === "boolean") {
      profileData.verified = researchUser.is_verified;
    }
    hasStats = Boolean(followers || videoCount);
    via = "research";
  }

  if (!hasStats && session?.accessToken) {
    // Display API: own account details
    const info = await displayUserInfo(session.accessToken);
    if (info) {
      const followers = toPositiveInt(info.follower_count);
      const following = toPositiveInt(info.following_count);
      const videoCount = toPositiveInt(info.video_count);
      if (followers) profileData.followers = followers;
      if (following) profileData.following = following;
      if (videoCount) {
        profileData.videoCount = videoCount;
        profileData.postsCount = videoCount;
      }
      if (info.bio_description) profileData.bio = info.bio_description;
      if (typeof info.is_verified === "boolean") profileData.verified = info.is_verified;
      if (info.avatar_url) {
        profileData.avatarUrl = info.avatar_url;
        extraData.avatarUrl = info.avatar_url;
      }
      if (info.open_id) profileData.openId = info.open_id;
      hasStats = Boolean(followers || videoCount);
      via = "display";
    }
  }

  // ---- Hashtags extracted from the real bio ----
  const bioHashtags = extractHashtagsFromText(profileData.bio);
  if (bioHashtags.length) {
    profileData.bioHashtags = bioHashtags.slice(0, 30);
    extraData.hashtags = bioHashtags.slice(0, 30);
  }

  const dataSources = ["tiktok-oembed"];
  const limitations: string[] = [];
  let sourceConfidence: "high" | "medium" | "low" = "low";

  if (hasStats) {
    dataSources.push("tiktok-research-api");
    sourceConfidence = "high";
    via = "research";
  } else if (profileData.openId) {
    dataSources.push("tiktok-display-api");
    sourceConfidence = "medium";
    via = "display";
  }

  if (!hasStats) {
    limitations.push(
      params.locale === "ar"
        ? "تعذّر جلب إحصائيات الحساب من واجهات TikTok المأذون بها لهذا التطبيق. عُرضت البيانات العامة المتاحة فعلياً فقط. لم تُختلق أي أرقام."
        : "Could not retrieve account statistics from the TikTok APIs this app is authorized for. Only genuinely public data is shown. No numbers were invented."
    );
    logTikTok("warn", "profile_oembed_only", { handle: cleanHandle });
  }

  return {
    username: cleanHandle,
    url: canonicalUrl,
    profileData,
    extraData,
    dataSources,
    limitations,
    sourceConfidence,
    via,
  };
}