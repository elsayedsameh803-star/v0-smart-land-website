// =============================================================================
// Smart Land - Platform registry (single source of truth)
// =============================================================================
// Authoritative list of analysable platforms + their connection metadata. The
// UI (Hero, Account / Connected Accounts, status endpoint) and the OAuth routes
// all read from here so the platform list is never duplicated.
//
//   * `website` needs a Smart Land login only (no external OAuth).
//   * every social platform needs BOTH a login AND an independent connection.
// =============================================================================
import type { PlatformId } from "./connections";

export interface PlatformMeta {
  id: PlatformId;
  /** Public display name (EN). */
  name: string;
  nameAr: string;
  /** Lucide icon component name used by the client (kept as a string to avoid
   *  bundling every icon into this server module). */
  icon: string;
  /** Path that starts the OAuth connection flow for this platform. */
  connectPath: string;
  /** Path that disconnects this platform. */
  disconnectPath: string;
  /** Human description of what data the connection unlocks. */
  unlocksEn: string;
  unlocksAr: string;
  /** True when analyzing this platform requires a connected account. */
  requiresConnection: boolean;
  /** True when the platform's analysis can ALSO fall back to public data when
   *  not connected (e.g. TikTok oEmbed). The connection still MUST be present
   *  before analysis is allowed per the SaaS contract, but this flag documents
   *  the data-upgrade path. */
  hasPublicFallback: boolean;
  /** OAuth scopes requested (documentation / display). */
  scopes: string;
}

export const PLATFORMS: PlatformMeta[] = [
  {
    id: "website",
    name: "Website",
    nameAr: "موقع إلكتروني",
    icon: "Globe",
    connectPath: "",
    disconnectPath: "",
    unlocksEn: "Full SEO / performance / security / accessibility audit",
    unlocksAr: "تدقيق كامل SEO / أداء / أمان / إتاحة",
    requiresConnection: false,
    hasPublicFallback: false,
    scopes: "",
  },
  {
    id: "facebook",
    name: "Facebook",
    nameAr: "فيسبوك",
    icon: "Facebook",
    connectPath: "/api/meta/oauth/start",
    disconnectPath: "/api/meta/oauth/disconnect",
    unlocksEn: "Real Page likes, reach, engagement, impressions",
    unlocksAr: "بيانات صفحة حقيقية: المتابعون، الوصول، التفاعل، المشاهدات",
    requiresConnection: true,
    hasPublicFallback: true,
    scopes:
      "email,public_profile,pages_show_list,pages_read_engagement,instagram_basic,instagram_manage_insights",
  },
  {
    id: "instagram",
    name: "Instagram",
    nameAr: "إنستجرام",
    icon: "Instagram",
    connectPath: "/api/meta/oauth/start", // Meta OAuth covers IG Business too
    disconnectPath: "/api/meta/oauth/disconnect",
    unlocksEn: "Real followers, reach, impressions, profile views",
    unlocksAr: "بيانات إنستجرام حقيقية: المتابعون، الوصول، المشاهدات، منظورات الملف",
    requiresConnection: true,
    hasPublicFallback: true,
    scopes:
      "email,public_profile,pages_show_list,pages_read_engagement,instagram_basic,instagram_manage_insights",
  },
  {
    id: "youtube",
    name: "YouTube",
    nameAr: "يوتيوب",
    icon: "Youtube",
    connectPath: "/api/youtube/oauth/start",
    disconnectPath: "/api/youtube/oauth/disconnect",
    unlocksEn: "Real subscribers, video views, likes, comments",
    unlocksAr: "بيانات يوتيوب حقيقية: المشتركين، المشاهدات، الإعجابات، التعليقات",
    requiresConnection: true,
    hasPublicFallback: true,
    scopes: "https://www.googleapis.com/auth/youtube.readonly openid email profile",
  },
  {
    id: "tiktok",
    name: "TikTok",
    nameAr: "تيك توك",
    icon: "Music2",
    connectPath: "/api/tiktok/oauth/start",
    disconnectPath: "/api/tiktok/oauth/disconnect",
    unlocksEn: "Real views, likes, comments, shares for your videos",
    unlocksAr: "مقاييس تيك توك الحقيقية: المشاهدات، الإعجابات، التعليقات، المشاركات",
    requiresConnection: true,
    hasPublicFallback: true,
    scopes: "user.info.basic,video.list",
  },
  {
    id: "snapchat",
    name: "Snapchat",
    nameAr: "سناب شات",
    icon: "Camera",
    connectPath: "/api/snapchat/oauth/start",
    disconnectPath: "/api/snapchat/oauth/disconnect",
    unlocksEn: "Real Snap score, story views, profile metrics",
    unlocksAr: "مقاييس سناب شات الحقيقية: السكور، منظورات القصص، الملف الشخصي",
    requiresConnection: true,
    hasPublicFallback: true,
    scopes: "user_bitmoji,user_snaps",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    nameAr: "لينكد إن",
    icon: "Linkedin",
    connectPath: "/api/linkedin/oauth/start",
    disconnectPath: "/api/linkedin/oauth/disconnect",
    unlocksEn: "Real profile, experience, headline, connections",
    unlocksAr: "بيانات لينكد إن حقيقية: الملف، الخبرة، العنوان المهني، الاتصالات",
    requiresConnection: true,
    hasPublicFallback: true,
    scopes: "r_liteprofile r_emailaddress offline_access",
  },
];

export const PLATFORM_IDS = PLATFORMS.map((p) => p.id);

export function getPlatformMeta(id: string): PlatformMeta | undefined {
  return PLATFORMS.find((p) => p.id === id);
}

/** Social platforms only (everything except "website"). */
export const SOCIAL_PLATFORM_IDS: PlatformId[] = PLATFORMS.filter(
  (p) => p.requiresConnection
).map((p) => p.id);

export type { PlatformId };
