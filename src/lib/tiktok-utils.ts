// =============================================================================
// Smart Land - TikTok shared utilities (video-id extraction + error taxonomy)
// =============================================================================

// ---------------------------------------------------------------------------
// TikTok error taxonomy. Every failure a user can hit maps to one of these
// kinds so the UI can show a precise, translated reason instead of a fake
// result. No mocked values are ever used as a fallback.
// ---------------------------------------------------------------------------
export type TikTokErrorKind =
  | "INVALID_URL"
  | "INVALID_VIDEO_ID"
  | "VIDEO_NOT_AVAILABLE"
  | "ACCOUNT_NOT_AVAILABLE"
  | "OAUTH_REQUIRED"
  | "OAUTH_FAILED"
  | "TOKEN_EXPIRED"
  | "INSUFFICIENT_PERMISSIONS"
  | "API_RATE_LIMIT"
  | "API_ERROR"
  | "NOT_CONFIGURED"
  | "TIMEOUT"
  | "UNKNOWN";

export class TikTokError extends Error {
  kind: TikTokErrorKind;
  status: number;
  details?: Record<string, unknown>;
  constructor(kind: TikTokErrorKind, message: string, status = 500, details?: Record<string, unknown>) {
    super(message);
    this.name = "TikTokError";
    this.kind = kind;
    this.status = status;
    this.details = details;
  }
}

const TITLES_EN: Record<TikTokErrorKind, string> = {
  INVALID_URL: "The link you entered is not a valid TikTok link.",
  INVALID_VIDEO_ID: "The video ID could not be extracted from that link.",
  VIDEO_NOT_AVAILABLE: "This video is not available on TikTok.",
  ACCOUNT_NOT_AVAILABLE: "This TikTok account could not be found or is not public.",
  OAUTH_REQUIRED: "TikTok needs you to authorize your account to read this data.",
  OAUTH_FAILED: "TikTok did not complete the authorization request.",
  TOKEN_EXPIRED: "Your TikTok authorization expired. Please connect again.",
  INSUFFICIENT_PERMISSIONS: "Your TikTok app is missing the required permissions.",
  API_RATE_LIMIT: "TikTok rate limited this request. Please try again shortly.",
  API_ERROR: "TikTok returned an error while processing the request.",
  NOT_CONFIGURED: "The TikTok integration is not configured on the server.",
  TIMEOUT: "TikTok took too long to respond. Please try again.",
  UNKNOWN: "An unexpected TikTok error occurred.",
};

const TITLES_AR: Record<TikTokErrorKind, string> = {
  INVALID_URL: "الرابط الذي أدخلته ليس رابط تيك توك صالحاً.",
  INVALID_VIDEO_ID: "تعذّر استخراج معرّف الفيديو من هذا الرابط.",
  VIDEO_NOT_AVAILABLE: "هذا الفيديو غير متاح على تيك توك.",
  ACCOUNT_NOT_AVAILABLE: "تعذّر العثور على هذا الحساب أو أنه غير عام.",
  OAUTH_REQUIRED: "يحتاج تيك توك إلى تفويض حسابك لقراءة هذه البيانات.",
  OAUTH_FAILED: "لم يكتمل طلب التفويض من تيك توك.",
  TOKEN_EXPIRED: "انتهت صلاحية تفويض تيك توك لديك. يرجى إعادة الربط.",
  INSUFFICIENT_PERMISSIONS: "تطبيق تيك توك يفتقر إلى الصلاحيات المطلوبة.",
  API_RATE_LIMIT: "طبّق تيك توك حداً للطلبات. يرجى المحاولة لاحقاً.",
  API_ERROR: "أرجع تيك توك خطأ أثناء معالجة الطلب.",
  NOT_CONFIGURED: "تكامل تيك توك غير مُهيأ على الخادم.",
  TIMEOUT: "استغرق تيك توك وقتاً طويلاً للاستجابة. يرجى المحاولة لاحقاً.",
  UNKNOWN: "حدث خطأ غير متوقّع من تيك توك.",
};

export function tiktokErrorTitle(kind: TikTokErrorKind, locale: string): string {
  return locale === "ar" ? TITLES_AR[kind] : TITLES_EN[kind];
}

// ---------------------------------------------------------------------------
// Video ID extraction. Supports all the common TikTok URL shapes:
//   tiktok.com/@user/video/1234567890123456789
//   tiktok.com/@user/photo/1234567890123456789 (photo posts still have numeric id)
//   vm.tiktok.com/Abc123 / vt.tiktok.com
//   tiktok.com/share/video/123...
//   a bare 19+ digit numeric id
// ---------------------------------------------------------------------------
export function extractTikTokVideoId(rawUrl: string): string | null {
  if (!rawUrl) return null;
  const url = rawUrl.trim();

  // Native /video/ path
  let m = url.match(/(?:tiktok\.com|tiktokcdn\.com)\/@[^/]+\/video\/(\d{2,25})/i);
  if (m) return m[1];

  // Native /photo/ path (photo mode still uses numeric media ids)
  m = url.match(/(?:tiktok\.com)\/@[^/]+\/photo\/(\d{2,25})/i);
  if (m) return m[1];

  // /share/video/ and /embed/video/
  m = url.match(/(?:tiktok\.com)\/(?:share|embed)\/video\/(\d{2,25})/i);
  if (m) return m[1];

  // Short links (vm.tiktok.com / vt.tiktok.com) — resolve via oEmbed fallback
  if (/^(?:https?:\/\/)?(?:vm|vt)\.tiktok\.com\//i.test(url)) {
    return "__SHORT__:0"; // marker handled by caller resolution
  }

  // Bare numeric id
  m = url.match(/^(\d{16,25})$/);
  if (m) return m[1];

  return null;
}

/** True when the extracted token is a short-link marker that needs resolution. */
export function isShortLinkMarker(token: string | null): boolean {
  return token === "__SHORT__:0";
}

/** Resolve a short vm/vt URL to a full video URL via real shortener redirect. */
export async function resolveTikTokShortLink(rawUrl: string): Promise<string | null> {
  const normalized = rawUrl.includes("://") ? rawUrl : `https://${rawUrl}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  try {
    const res = await fetch(normalized, {
      redirect: "manual",
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    if (res.status === 301 || res.status === 302 || res.status === 303 || res.status === 307 || res.status === 308) {
      return res.headers.get("location");
    }
    return null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Extract the canonical profile handle from a TikTok URL (nice username).
 */
export function extractTikTokHandle(rawUrl: string): string | null {
  if (!rawUrl) return null;
  const m = rawUrl.match(/(?:tiktok\.com)\/@([a-zA-Z0-9_.]{1,24})/i);
  if (m) return m[1].replace(/\.$/, "");
  return null;
}