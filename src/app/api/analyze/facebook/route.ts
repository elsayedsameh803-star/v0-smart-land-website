import { NextRequest, NextResponse } from "next/server";
import { buildSocialAnalysisResponse, normalizeProfileData } from "@/lib/social-analysis-helper";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { url, locale } = await request.json();
    if (!url) {
      return NextResponse.json({ error: "URL required" }, { status: 400 });
    }

    // Extract Facebook page identifier
    const pageId = extractFacebookPageId(url);
    if (!pageId) {
      return NextResponse.json({ error: "Invalid Facebook URL" }, { status: 400 });
    }

    const startTime = Date.now();

    // ===== 1. Fetch Facebook page (public data) =====
    let profileData: Record<string, any> = {};

    try {
      const res = await fetch(`https://www.facebook.com/${pageId}/`, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
          "Sec-Fetch-Dest": "document",
          "Sec-Fetch-Mode": "navigate",
          "Sec-Fetch-Site": "none",
        },
        redirect: "follow",
      });

      if (res.ok) {
        const html = await res.text();

        // ===== 2. Extract REAL public data =====
        const metaTitle = html.match(/<meta[^>]+property=["']og:title["'][^>]*content=["']([^"']+)["']/i)?.[1] || null;
        const metaDescription = html.match(/<meta[^>]+name=["']description["'][^>]*content=["']([^"']+)["']/i)?.[1] || null;
        const metaImage = html.match(/<meta[^>]+property=["']og:image["'][^>]*content=["']([^"']+)["']/i)?.[1] || null;

        // Extract page name from title
        const pageName = metaTitle?.replace(/\s*[|]\s*Facebook$/, "").trim() || pageId;

        // Extract about/description
        const aboutText = metaDescription || "";
        const trimmedAbout = aboutText.replace(/\s+/g, " ").trim();
        const hasAbout = trimmedAbout.length > 20;

        // Extract likes/follows indicators from meta tags
        const likeCountMatch = html.match(/([0-9.,KM])+\s*(?:likes|followers)/i);
        const followersText = likeCountMatch?.[0] || null;
        const followers = followersText ? parseCountString(followersText) : 0;

        // Check verification
        const verified = html.match(/verified\s*page/i) !== null;

        // Extract hashtags from description
        const hashtags = trimmedAbout.match(/#[a-zA-Z0-9_]+/g) || [];
        
        // Extract links from about
        const links = trimmedAbout.match(/https?:\/\/[^\s]+/g) || [];

        // Count recent posts if accessible
        const postIndicators = html.match(/role=["']article["']/gi) || [];
        const visiblePosts = Math.min(postIndicators.length, 20);

        profileData = {
          pageId,
          pageName,
          about: aboutText,
          aboutText: trimmedAbout,
          hasAbout,
          followers,
          followersText,
          verified,
          hashtags,
          links,
          visiblePosts,
          metaImage,
        };
      }
    } catch {
      // Fall through - use intelligent engine
    }

    const normalizedData = normalizeProfileData("facebook", profileData);
    const normalizedUrl = `https://www.facebook.com/${pageId}/`;

    return NextResponse.json(
      buildSocialAnalysisResponse({
        platform: "facebook",
        username: pageId,
        url: normalizedUrl,
        locale,
        profileData: {
          ...profileData,
          ...normalizedData,
        },
        extraData: {
          metaImage: profileData.metaImage || null,
        },
        startTime,
      })
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to analyze Facebook page" },
      { status: 500 }
    );
  }
}

function extractFacebookPageId(url: string): string | null {
  // Handle facebook.com/username
  const match = url.match(/(?:facebook\.com|fb\.com)\/(?:pages\/[^/]+\/)?([a-zA-Z0-9\.\-_]+)/i);
  if (match) {
    const id = match[1].replace(/[\/?#].*$/, "");
    if (id !== "profile.php" && id !== "share" && id !== "login" && id !== "groups") {
      return id.replace(/^@/, "");
    }
  }

  // Handle profile.php?id=XXXX
  const profileMatch = url.match(/profile\.php\?id=(\d+)/i);
  if (profileMatch) return profileMatch[1];

  return null;
}

function parseCountString(str: string): number {
  const cleaned = str.replace(/[^0-9.KM]/gi, "");
  if (cleaned.endsWith("M")) return parseFloat(cleaned) * 1000000;
  if (cleaned.endsWith("K")) return parseFloat(cleaned) * 1000;
  return parseFloat(cleaned) || 0;
}