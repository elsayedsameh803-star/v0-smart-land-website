import { NextRequest, NextResponse } from "next/server";
import { buildSocialAnalysisResponse, normalizeProfileData } from "@/lib/social-analysis-helper";
import { safeFetch } from "@/lib/security";
import { recordAnalysis } from "@/lib/admin-stats";
import { enforceSubscription } from "@/lib/subscription-shield";
import { checkAnalysisAccess } from "@/lib/analysis-gate";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { url, locale } = await request.json();

    // --- Analysis gate: require login + platform connection ---
    const gate = await checkAnalysisAccess(request, "snapchat");
    if (!gate.ok) return gate.response;

    const blocked = enforceSubscription(request);
    if (blocked) return blocked;
    if (!url) {
      return NextResponse.json({ error: "URL required" }, { status: 400 });
    }

    // Extract Snapchat username
    const username = extractSnapchatUsername(url);
    if (!username) {
      return NextResponse.json({ error: "Invalid Snapchat URL" }, { status: 400 });
    }

    const startTime = Date.now();
    let profileData: Record<string, any> = {};

    // ===== 1. Fetch Snapchat public profile page =====
    try {
      const res = await safeFetch(`https://www.snapchat.com/add/${username}`, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
          "Sec-Fetch-Dest": "document",
          "Sec-Fetch-Mode": "navigate",
          "Sec-Fetch-Site": "none",
        },
      });

      if (res.ok) {
        const html = await res.text();

        // ===== 2. Extract REAL public data =====
        const metaTitle = html.match(/<meta[^>]+property=["']og:title["'][^>]*content=["']([^"']+)["']/i)?.[1] || null;
        const metaDescription = html.match(/<meta[^>]+name=["']description["'][^>]*content=["']([^"']+)["']/i)?.[1] || null;
        const metaImage = html.match(/<meta[^>]+property=["']og:image["'][^>]*content=["']([^"']+)["']/i)?.[1] || null;

        // Parse display name from title
        let displayName = metaTitle?.replace(/[|]\s*Snapchat.*$/, "").trim() || username;
        if (metaTitle?.includes("Snapchat")) {
          displayName = metaTitle.split("Snapchat")[0].replace(/[|,]/g, "").trim() || username;
        }

        // Extract bio/description
        const bio = metaDescription || "";
        const trimmedBio = bio.replace(/\s+/g, " ").trim();
        const hasBio = trimmedBio.length > 10;

        // Extract hashtags from bio
        const hashtags = trimmedBio.match(/#[a-zA-Z0-9_]+/g) || [];
        
        // Extract links from bio
        const links = trimmedBio.match(/https?:\/\/[^\s]+/g) || [];

        // Check if profile is active (public data signals)
        const hasActiveContent = html.match(/stories|snaps|score/i) !== null;

        profileData = {
          username,
          displayName: displayName !== username ? displayName : undefined,
          fullName: displayName !== username ? displayName : undefined,
          bio: trimmedBio,
          bioHashtags: hashtags,
          bioLinks: links,
          avatarUrl: metaImage,
          hasBio,
          hasActiveContent,
          metaImage,
        };
      }
    } catch {
      // Fall through - use intelligent engine
    }

    const normalizedData = normalizeProfileData("snapchat", profileData);
    const normalizedUrl = `https://www.snapchat.com/add/${username}`;
    const hasSourceData = Object.values(profileData).some((value) => value !== undefined && value !== null && value !== "");
    const sourceConfidence = hasSourceData ? "high" : "low";

    recordAnalysis("snapchat", true);
    return NextResponse.json(
      await buildSocialAnalysisResponse({
        platform: "snapchat",
        username,
        url: normalizedUrl,
        locale,
        profileData: {
          ...profileData,
          ...normalizedData,
        },
        extraData: {
          avatarUrl: profileData.metaImage || null,
        },
        dataSources: hasSourceData ? ["snapchat-public-profile", "snapchat-og"] : ["snapchat-public-profile"],
        sourceConfidence,
        startTime,
      })
    );
  } catch (error: any) {
    recordAnalysis("snapchat", false);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to analyze Snapchat profile" },
      { status: 500 }
    );
  }
}

function extractSnapchatUsername(url: string): string | null {
  // Handle snapchat.com/add/username
  const match = url.match(/snapchat\.com\/add\/([a-zA-Z0-9_\.]{1,20})/i);
  if (match) return match[1].replace(/\.$/, "");

  // Just a username
  const clean = url.replace(/^https?:\/\//, "").replace(/^www\./, "");
  if (/^@?[a-zA-Z0-9_\.]{1,20}$/.test(clean)) {
    return clean.replace(/^@/, "").replace(/\.$/, "");
  }

  return null;
}