import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { resolveUsableConnection, PlatformId } from "@/lib/connections";

export const dynamic = "force-dynamic";

interface ConnectionStatus {
  platform: string;
  connected: boolean;
  requiresConnection: boolean;
  message: string;
  messageAr: string;
}

/**
 * Check connection status for all social platforms
 * Returns which platforms are connected and which need connection
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

    for (const platform of platforms) {
      const connection = await resolveUsableConnection(request.cookies, platform);
      const isConnected = !!connection;
      
      // Check for stale/expired connection
      const stale = request.cookies.get(`sl_conn_${platform}`)?.value || 
                    (platform === "tiktok" && request.cookies.get("sl_tiktok_session")?.value);
      const isExpired = stale && stale !== "" && !isConnected;

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

    return NextResponse.json({
      success: true,
      platforms: statuses,
      allConnected: statuses.every(s => s.connected),
      anyExpired: statuses.some(s => !s.connected && s.message.includes("expired")),
    });
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

    const connection = await resolveUsableConnection(request.cookies, platform as PlatformId);
    const isConnected = !!connection;
    
    // Check for stale/expired connection
    const stale = request.cookies.get(`sl_conn_${platform}`)?.value || 
                  (platform === "tiktok" && request.cookies.get("sl_tiktok_session")?.value);
    const isExpired = stale && stale !== "" && !isConnected;

    const platformNames: Record<string, { en: string; ar: string }> = {
      facebook: { en: "Facebook", ar: "فيسبوك" },
      instagram: { en: "Instagram", ar: "إنستجرام" },
      youtube: { en: "YouTube", ar: "يوتيوب" },
      tiktok: { en: "TikTok", ar: "تيك توك" },
      snapchat: { en: "Snapchat", ar: "سناب شات" },
      linkedin: { en: "LinkedIn", ar: "لينكد إن" },
    };

    const platformName = platformNames[platform] || { en: platform, ar: platform };

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

    return NextResponse.json({
      success: true,
      platform,
      connected: isConnected,
      expired: isExpired,
      requiresConnection: !isConnected,
      message,
      messageAr,
      code,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to check connection" },
      { status: 500 }
    );
  }
}
