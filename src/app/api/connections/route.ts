// =============================================================================
// Smart Land - Unified Connected-Accounts status endpoint
// =============================================================================
// GET /api/connections
//   Requires a valid Smart Land session (one account per user).
//   Returns the connection status for EVERY platform in one call so the
//   Connected-Accounts UI and the analysis gate share a single, consistent
//   view. NEVER returns tokens — only non-secret status + display info.
//
// Response shape:
//   { success: true, connections: [
//     { platform, connected, usable, displayName, accountId, connectedAt,
//       scope, needsReconnect, canRefresh }
//   ]}
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { SOCIAL_PLATFORM_IDS, type PlatformId } from "@/lib/platforms";
import { isPlatformConfigured } from "@/lib/oauth-config";
import {
  readConnection,
  isConnectionUsable,
  type PlatformConnection,
} from "@/lib/connections";
import { parseTikTokSessionCookie, isAccessTokenUsable } from "@/lib/tiktok-session";

export const dynamic = "force-dynamic";

interface ConnectionStatus {
  platform: PlatformId;
  connected: boolean;
  usable: boolean;
  displayName: string;
  accountId: string;
  connectedAt: string | null;
  scope: string;
  needsReconnect: boolean;
  canRefresh: boolean;
  /** True when this platform's OAuth credentials are present on the server. */
  configured: boolean;
}

function baseStatus(platform: PlatformId, connected: boolean): ConnectionStatus {
  return {
    platform,
    connected,
    usable: connected,
    displayName: "",
    accountId: "",
    connectedAt: null,
    scope: "",
    needsReconnect: false,
    canRefresh: false,
    configured: isPlatformConfigured(platform),
  };
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions).catch(() => null);
  if (!session?.user) {
    return NextResponse.json(
      { success: false, error: "Authentication required", code: "auth_required" },
      { status: 401 }
    );
  }

  const connections = await Promise.all(
    SOCIAL_PLATFORM_IDS.map(async (platform): Promise<ConnectionStatus> => {
      if (platform === "tiktok") {
        const raw = request.cookies.get("sl_tiktok_session")?.value ?? null;
        const sess = parseTikTokSessionCookie(raw);
        if (!sess || !sess.accessToken) {
          return baseStatus("tiktok", false);
        }
        const usable = isAccessTokenUsable(sess);
        return {
          ...baseStatus("tiktok", true),
          displayName: sess.displayName || "TikTok",
          accountId: sess.openId || "tiktok",
          connectedAt: sess.connectedAt,
          scope: "user.info.basic,video.list",
          usable,
          needsReconnect: !usable,
          canRefresh: Boolean(sess.refreshToken),
        };
      }

      const conn = readConnection(request.cookies, platform);
      if (!conn) {
        return baseStatus(platform, false);
      }
      const usable = isConnectionUsable(conn);
      // A refresh is possible only when the platform has a registered
      // refresher (registered at module load by each platform's oauth module).
      const canRefresh = Boolean(conn.token.refreshToken);
      return {
        ...baseStatus(platform, true),
        displayName: conn.displayName,
        accountId: conn.accountId,
        connectedAt: conn.connectedAt,
        scope: conn.token.scope ?? "",
        usable,
        needsReconnect: !usable,
        canRefresh,
      };
    })
  );

          return NextResponse.json({ success: true, connections });
}


