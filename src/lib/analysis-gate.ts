// =============================================================================
// Smart Land - Analysis access gate (server-side)
// =============================================================================
// Central authorization used by EVERY analyze route. It enforces the SaaS
// contract in one place so the platform-specific routes never duplicate it:
//
//   1. Authentication -> a valid NextAuth session is required (one Smart Land
//      account per user). Anonymous visitors get a 401 with `code: "auth_required"`.
//   2. Platform connection -> social platforms (everything except "website")
//      require an active, usable connection. The connection is refreshed
//      transparently when possible; a missing/expired one yields a 401 with
//      `code: "connection_required"` (or `"token_expired"` when a reconnect is
//      needed without re-authorization).
//
// The home page / analysis UI consumes these `code`s to redirect the user to
// exactly the right step — login, connect, or reconnect — and NEVER restarts
// the flow from scratch.
// =============================================================================

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { resolveConnectionHealth, PlatformId } from "@/lib/connections";

export type AccessError =
  | { code: "auth_required"; message: string; messageAr: string }
  | { code: "connection_required"; platform: string; message: string; messageAr: string }
  | { code: "token_expired"; platform: string; message: string; messageAr: string };

const SOCIAL_PLATFORMS: PlatformId[] = [
  "facebook",
  "instagram",
  "youtube",
  "tiktok",
  "snapchat",
  "linkedin",
];

/**
 * Returns `{ ok: true, session, connection }` when the request is authorized to
 * run an analysis for `platform`, or `{ ok: false, response }` with a
 * machine-readable `code` the client can branch on.
 *
 * `platform` is the lowercase platform id ("website" | "facebook" | ...).
 */
export async function checkAnalysisAccess(
  request: NextRequest,
  platform: string
): Promise<{ ok: true; session: AnySession; connection: any } | { ok: false; response: NextResponse }> {
  // YouTube public analysis uses only public channel/video data. OAuth remains
  // optional for users who want private YouTube Analytics data.
  if (platform === "youtube") {
    return { ok: true, session: {}, connection: null };
  }

  // --- 1. Authentication -----------------------------------------------------
  let session: AnySession | null = null;
  try {
    session = await getServerSession(authOptions);
  } catch {
    session = null;
  }

  if (!session?.user) {
    const resp: AccessError = {
      code: "auth_required",
      message: "Sign in first to continue.",
      messageAr: "يرجى تسجيل الدخول أولاً للمتابعة.",
    };
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, error: resp.message, errorAr: resp.messageAr, code: resp.code, platform },
        { status: 401 }
      ),
    };
  }

  // --- 2. Platform connection (social platforms only) -----------------------
  const isSocial = SOCIAL_PLATFORMS.includes(platform as PlatformId);
  if (!isSocial) {
    // "website" analysis needs a login but no platform connection.
    return { ok: true, session, connection: null };
  }

  // Collect any refreshed-token cookies written during the health check and
  // attach them to WHICHEVER response we end up returning, so the rotation
  // survives and the user is never asked to re-link needlessly.
  const cookieJar: Array<{ name: string; value: string; options?: unknown }> = [];
  const health = await resolveConnectionHealth(
    request.cookies,
    platform as PlatformId,
    (name, value, options) => {
      cookieJar.push({ name, value, options });
    }
  );
  const finalize = (resp: NextResponse): NextResponse => {
    for (const c of cookieJar) {
      resp.cookies.set(c.name, c.value, c.options as any);
    }
    return resp;
  };

  if (!health.usable) {
    // Distinguish "expired, needs reconnect" from "never connected".
    const err: AccessError = health.connected
      ? {
          code: "token_expired",
          platform,
          message: `Your ${platform} connection has expired. Reconnect your ${platform} account to continue.`,
          messageAr: `انتهت صلاحية ربط حساب ${platform}. أعد ربط حسابك للمتابعة.`,
        }
      : {
          code: "connection_required",
          platform,
          message: `Connect your ${platform} account to analyze it.`,
          messageAr: `يرجى ربط حساب ${platform} لتحليله.`,
        };

    return {
      ok: false,
      response: finalize(
        NextResponse.json(
          { success: false, error: err.message, errorAr: err.messageAr, code: err.code, platform },
          { status: 401 }
        )
      ),
    };
  }

  return { ok: true, session, connection: health.connection };
}

// Minimal shape — we only care that a user identity exists.
interface AnySession {
  user?: { name?: string; email?: string; image?: string } | null;
  [key: string]: unknown;
}

// -----------------------------------------------------------------------------
// Client-facing gate error. The home page catches this and routes the user to
// the correct step (login / connect / reconnect) — never back to scratch.
// The `code` mirrors the JSON `code` returned by the server gate.
// -----------------------------------------------------------------------------
export class GateError extends Error {
  code: AccessError["code"];
  platform?: string;
  constructor(message: string, code: AccessError["code"], platform?: string) {
    super(message);
    this.name = "GateError";
    this.code = code;
    this.platform = platform;
  }
}
