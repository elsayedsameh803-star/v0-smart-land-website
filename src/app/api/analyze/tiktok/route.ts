import { NextRequest, NextResponse } from "next/server";
import { buildSocialAnalysisResponse, normalizeProfileData } from "@/lib/social-analysis-helper";
import { recordAnalysis } from "@/lib/admin-stats";
import { enforceSubscription } from "@/lib/subscription-shield";
import { parseTikTokSessionCookie, refreshTikTokSessionIfNeeded } from "@/lib/tiktok-session";
import {
  analyzeTikTokVideo,
  analyzeTikTokProfile,
  type TikTokAnalysisOutcome,
} from "@/lib/tiktok-analysis";
import {
  extractTikTokVideoId,
  extractTikTokHandle,
  isShortLinkMarker,
  resolveTikTokShortLink,
  TikTokError,
  tiktokErrorTitle,
} from "@/lib/tiktok-utils";
import { logTikTok } from "@/lib/tiktok-log";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  try {
    const body = await request.json().catch(() => null);
    const url = body?.url;
    const locale = body?.locale || "en";

    const blocked = enforceSubscription(request);
    if (blocked) return blocked;

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { success: false, error: "URL is required", kind: "INVALID_URL" },
        { status: 400 }
      );
    }

    // ---- Session (used to authorize calls only when the visitor connected) ----
    const sessionCookie = request.cookies.get("sl_tiktok_session")?.value;
    let session = parseTikTokSessionCookie(sessionCookie);
    if (session && session.refreshToken) {
      session = await refreshTikTokAccessIfNeeded(session);
    }

    // ---- Identify the target: profile handle vs video id ----
    const handle = extractTikTokHandle(url);
    let rawVideoToken = extractTikTokVideoId(url);

    // Short links (vm/vt) must be resolved to a real video page first.
    if (isShortLinkMarker(rawVideoToken)) {
      const resolved = await resolveTikTokShortLink(url);
      if (!resolved) {
        throw new TikTokError(
          "INVALID_VIDEO_ID",
          "Could not resolve the TikTok short link.",
          400
        );
      }
      rawVideoToken = extractTikTokVideoId(resolved);
      if (!rawVideoToken || isShortLinkMarker(rawVideoToken)) {
        throw new TikTokError(
          "INVALID_VIDEO_ID",
          "The short link does not point to a valid TikTok video.",
          400
        );
      }
    }

    let outcome: TikTokAnalysisOutcome | null = null;
    if (rawVideoToken) {
      outcome = await analyzeTikTokVideo({
        videoId: rawVideoToken,
        handle,
        session,
        locale,
      });
    } else if (handle) {
      outcome = await analyzeTikTokProfile({
        handle,
        session,
        locale,
      });
    } else {
      throw new TikTokError(
        "INVALID_URL",
        "The link does not look like a TikTok profile or video URL.",
        400
      );
    }
if (!outcome) {
      throw new TikTokError(
        "INVALID_URL",
        "The link does not look like a TikTok profile or video URL.",
        400
      );
    }

    // ---- Build the report from REAL extracted data only ----
    const normalized = normalizeProfileData("tiktok", outcome.profileData);
    const mergedProfile = { ...outcome.profileData, ...normalized };

    // Linking gate: when we only got the public oEmbed data (no account stats)
    // and the visitor has not authorized TikTok, connecting their own account
    // unlocks real metrics — one click, instant redirect back.
    const requiresLinking = !session?.accessToken && outcome.via === "oembed-only";

    recordAnalysis("tiktok", true);

    const response = NextResponse.json(
      await buildSocialAnalysisResponse({
        platform: "tiktok",
        username: outcome.username,
        url: outcome.url,
        locale,
        profileData: mergedProfile,
        extraData: {
          ...outcome.extraData,
          requiresLinking,
          linkingHintEn: requiresLinking
            ? "TikTok only exposed public info for this video/profile. Connect your TikTok account once to read real metrics (views, likes, comments) for your own videos."
            : "",
          linkingHintAr: requiresLinking
            ? "عرض تيك توك بيانات عامة فقط لهذا الفيديو/الحساب. اربط حساب تيك توك مرة واحدة لقراءة المقاييس الحقيقية (المشاهدات، الإعجابات، التعليقات) لفيديوهاتك الخاصة."
            : "",
        },
        dataSources: outcome.dataSources,
        sourceConfidence: outcome.sourceConfidence,
        startTime,
      })
    );

    // If the session was refreshed mid-request, re-set the newer cookie
    // (the encrypted value — tokens never reach the response body).
    if (session?.accessToken) {
      const { buildTikTokSessionCookieValue } = await import("@/lib/tiktok-session");
      response.headers.set(
        "Set-Cookie",
        buildTikTokSessionCookieValue(session as any)
      );
    }

    return response;
  } catch (error: any) {
    recordAnalysis("tiktok", false);

    if (error instanceof TikTokError) {
      logTikTok("warn", "analyze_tiktok_failed", { kind: error.kind });
      return NextResponse.json(
        {
          success: false,
          error: tiktokErrorTitle(error.kind, "en"),
          errorAr: tiktokErrorTitle(error.kind, "ar"),
          kind: error.kind,
        },
        { status: error.status }
      );
    }

    logTikTok("error", "analyze_tiktok_unexpected", {
      reason: error?.message || "unknown",
    });
    return NextResponse.json(
      {
        success: false,
        error: tiktokErrorTitle("UNKNOWN", "en"),
        errorAr: tiktokErrorTitle("UNKNOWN", "ar"),
        kind: "UNKNOWN",
      },
      { status: 500 }
    );
  }
}

async function refreshTikTokAccessIfNeeded(
  session: NonNullable<ReturnType<typeof parseTikTokSessionCookie>>
): Promise<ReturnType<typeof parseTikTokSessionCookie>> {
  return refreshTikTokSessionIfNeeded(session);
}