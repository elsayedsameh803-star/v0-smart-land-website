import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { resolveConnectionHealth, PlatformId } from "@/lib/connections";

export const dynamic = "force-dynamic";

interface ConnectionStatus {
  platform: string;
  connected: boolean;
  requiresConnection: boolean;
  message: string;
  messageAr: string;
}

/**
 * Check connection status for all social platforms.
 * Uses resolveConnectionHealth so an expired-but-refreshable token is
 * transparently refreshed server-side (and the rotated tokens are persisted
 * back into the cookie) instead of being reported as "needs re-link".
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required", code: "auth_required" },
        { status: 401 }
      );
    }

    const platforms: PlatformId[] = ["facebook", "instagram", "youtube", "tiktok", "snapchat", "linkedin"];
    const statuses: ConnectionStatus[] = [];

    // Collect refreshed-token cookies and attach them to the response so the
    // rotation survives this request.
    const cookieJar: Array<{ name: string; value: string; options?: unknown }> = [];
    const sink = (name: string, value: string, options?: unknown) => {
      cookieJar.push({ name, value, options });
    };

    for (const platform of platforms) {
      const health = await resolveConnectionHealth(request.cookies, platform, sink);
      const isConnected = health.usable;
      const isExpired = health.needsReconnect;

      // Public YouTube analysis remains available even when its optional OAuth
      // connection expires, so do not report a reconnect requirement here.
      if (platform === "youtube" && !isConnected) {
        statuses.push({
          platform,
          connected: false,
          requiresConnection: false,
          message: "YouTube public analysis available",
          messageAr: "التحليل العام ليوتيوب متاح",
        });
        continue;
      }

      let message = "";
      let messageAr = "";

      if (isConnected) {
        message = `${platform} account connected`;
        messageAr = `حساب ${platform} مرتبط`;
      } else if (isExpired) {
        message = `${platform} connection expired - reconnect required`;
        messageAr = `انتهت صلاحية ربط ${platform} - مطلوب إعادة الربط`;
      } else {
        message = `${platform} account not connected`;
        messageAr = `حساب ${platform} غير مرتبط`;
      }

      statuses.push({
        platform,
        connected: isConnected,
        requiresConnection: !isConnected,
        message,
        messageAr,
      });
    }

    const resp = NextResponse.json({
      success: true,
      platforms: statuses,
      allConnected: statuses.every(s => s.connected),
      anyExpired: statuses.some(s => !s.connected && s.message.includes("expired")),
    });
    for (const c of cookieJar) {
      resp.cookies.set(c.name, c.value, c.options as any);
    }
    return resp;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to check connections" },
      { status: 500 }
    );
  }
}

/**
 * Check connection status for a specific platform
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required", code: "auth_required" },
        { status: 401 }
      );
    }

    const { platform } = await request.json().catch(() => ({ platform: null }));
    
    if (!platform) {
      return NextResponse.json(
        { success: false, error: "Platform is required" },
        { status: 400 }
      );
    }

    const platformNames: Record<string, { en: string; ar: string }> = {
      facebook: { en: "Facebook", ar: "فيسبوك" },
      instagram: { en: "Instagram", ar: "إنستجرام" },
      youtube: { en: "YouTube", ar: "يوتيوب" },
      tiktok: { en: "TikTok", ar: "تيك توك" },
      snapchat: { en: "Snapchat", ar: "سناب شات" },
      linkedin: { en: "LinkedIn", ar: "لينكد إن" },
    };

    const platformName = platformNames[platform] || { en: platform, ar: platform };

    // Collect refreshed-token cookies so the rotation survives this request
    // (previously an in-memory refresh was thrown away, forcing a re-link).
    const cookieJar: Array<{ name: string; value: string; options?: unknown }> = [];
    const health = await resolveConnectionHealth(
      request.cookies,
      platform as PlatformId,
      (name, value, options) => {
        cookieJar.push({ name, value, options });
      }
    );

    const isConnected = health.usable;
    const isExpired = health.needsReconnect;
 
    // Public YouTube analysis remains available even when its optional OAuth
    // connection expires, so do not report a reconnect requirement here.
    if (platform === "youtube" && !isConnected) {
      return NextResponse.json({
        success: true,
        platform,
        connected: false,
        expired: false,
        requiresConnection: false,
        message: `${platformName.en} public analysis available`,
        messageAr: `التحليل العام لـ${platformName.ar} متاح`,
        code: "public_analysis",
      });
    }

    let message = "";
    let messageAr = "";
    let code = "";

    if (isConnected) {
      message = `${platformName.en} account connected`;
      messageAr = `حساب ${platformName.ar} مرتبط`;
      code = "connected";
    } else if (isExpired) {
      message = `${platformName.en} connection expired - reconnect required`;
      messageAr = `انتهت صلاحية ربط ${platformName.ar} - مطلوب إعادة الربط`;
      code = "token_expired";
    } else {
      message = `${platformName.en} account not connected`;
      messageAr = `حساب ${platformName.ar} غير مرتبط`;
      code = "connection_required";
    }

    const resp = NextResponse.json({
      success: true,
      platform,
      connected: isConnected,
      expired: isExpired,
      requiresConnection: !isConnected,
      message,
      messageAr,
      code,
    });
    for (const c of cookieJar) {
      resp.cookies.set(c.name, c.value, c.options as any);
    }
    return resp;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to check connection" },
      { status: 500 }
    );
  }
}
