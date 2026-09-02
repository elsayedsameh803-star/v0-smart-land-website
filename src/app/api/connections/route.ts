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
  resolveConnectionHealth,
  type PlatformConnection,
} from "@/lib/connections";

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

  // Collect refreshed-token cookies written during health checks and attach
  // them to the outgoing response so the rotation survives this request.
  const cookieJar: Array<{ name: string; value: string; options?: unknown }> = [];
  const sink = (name: string, value: string, options?: unknown) => {
    cookieJar.push({ name, value, options });
  };

  const connections = await Promise.all(
    SOCIAL_PLATFORM_IDS.map(async (platform): Promise<ConnectionStatus> => {
      // Uniform health path for EVERY platform: an expired-but-refreshable
      // token is refreshed server-side here (rotated tokens are persisted via
      // sink) so connected accounts do NOT flip to "needs reconnect" on every
      // visit — the root cause of repeated re-link prompts.
      const health = await resolveConnectionHealth(request.cookies, platform, sink);

      if (!health.connection) {
        return baseStatus(platform, false);
      }

      return {
        ...baseStatus(platform, health.connected),
        displayName: health.connection.displayName,
        accountId: health.connection.accountId,
        connectedAt: health.connection.connectedAt,
        scope: health.connection.token.scope ?? "",
        usable: health.usable,
        needsReconnect: health.needsReconnect,
        canRefresh: health.canRefresh,
      };
    })
  );

  const resp = NextResponse.json({ success: true, connections });
  for (const c of cookieJar) {
    resp.cookies.set(c.name, c.value, c.options as any);
  }
  return resp;
}


