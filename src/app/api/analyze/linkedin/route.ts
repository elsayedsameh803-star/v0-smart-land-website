import { NextRequest, NextResponse } from "next/server";
import { buildSocialAnalysisResponse, normalizeProfileData } from "@/lib/social-analysis-helper";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { url, locale } = await request.json();
    if (!url) {
      return NextResponse.json({ error: "URL required" }, { status: 400 });
    }

    // Extract LinkedIn profile/company identifier
    const profileId = extractLinkedInProfileId(url);
    if (!profileId) {
      return NextResponse.json({ error: "Invalid LinkedIn URL" }, { status: 400 });
    }

    const startTime = Date.now();
    let profileData: Record<string, any> = {};

    // ===== 1. Fetch LinkedIn public profile/company page =====
    try {
      const res = await fetch(`https://www.linkedin.com/in/${profileId}/`, {
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

        // Parse profile name from title
        let profileName = metaTitle?.replace(/\s*[|]\s*LinkedIn$/, "").trim() || profileId;
        if (metaTitle?.includes(" - ")) {
          profileName = metaTitle.split(" - ")[0].trim();
        }

        // Extract headline from description
        let headline = metaDescription || "";
        if (metaDescription) {
          // LinkedIn descriptions usually start with "X | Company | ..." or contain headline
          const parts = metaDescription.split(" | ");
          if (parts.length > 1) {
            headline = parts[1] || parts[0] || "";
          }
        }

        // Check for company URL vs profile
        const isCompany = url.includes("company/") || url.includes("/company/");
        
        // Extract connections/followers if visible
        const followersText = html.match(/([0-9.,KM])+\s*(?:followers|connections)/i)?.[0] || null;
        const connections = followersText ? parseCountString(followersText) : 0;

        // Extract skills/experience keywords from description and HTML
        const keywords = extractKeywords(html);
        
        // Check profile completeness signals
        const hasExperience = html.match(/experience|employment/i) !== null;
        const hasEducation = html.match(/education|university/i) !== null;
        const hasProfilePic = metaImage !== null;
        const hasHeadline = headline.length > 20;

        profileData = {
          username: profileId,
          displayName: profileName,
          fullName: profileName,
          headline,
          bio: headline,
          connections,
          followersText,
          keywords,
          verified: false,
          isPrivate: false,
          isCompany,
          hasExperience,
          hasEducation,
          hasProfilePic,
          hasHeadline,
          profilePicUrl: metaImage,
          metaImage,
        };
      }
    } catch {
      // Fall through - use intelligent engine
    }

    const normalizedData = normalizeProfileData("linkedin", profileData);
    const normalizedUrl = `https://www.linkedin.com/in/${profileId}/`;

    return NextResponse.json(
      buildSocialAnalysisResponse({
        platform: "linkedin",
        username: profileId,
        url: normalizedUrl,
        locale,
        profileData: {
          ...profileData,
          ...normalizedData,
        },
        extraData: {
          isCompany: profileData.isCompany || false,
          profilePicUrl: profileData.metaImage || null,
          keywords: profileData.keywords || [],
        },
        startTime,
      })
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to analyze LinkedIn profile" },
      { status: 500 }
    );
  }
}

function extractLinkedInProfileId(url: string): string | null {
  // Handle linkedin.com/in/username
  const match = url.match(/linkedin\.com\/in\/([a-zA-Z0-9\-_]+)/i);
  if (match) return match[1].replace(/[\/?#].*$/, "");

  // Handle linkedin.com/company/name
  const companyMatch = url.match(/linkedin\.com\/company\/([a-zA-Z0-9\-_]+)/i);
  if (companyMatch) return companyMatch[1].replace(/[\/?#].*$/, "");

  return null;
}

function extractKeywords(html: string): string[] {
  const keywords = new Set<string>();
  
  // Common professional keywords to look for
  const commonKeywords = [
    "management", "marketing", "sales", "engineering", "development", "design",
    "finance", "consulting", "strategy", "operations", "product", "project",
    "leadership", "communication", "analysis", "research", "technology", "software",
    "healthcare", "education", "business", "customer", "data", "cloud", "security",
  ];

  const lowerHtml = html.toLowerCase();
  for (const kw of commonKeywords) {
    if (lowerHtml.includes(kw)) {
      keywords.add(kw);
    }
  }

  // Extract from meta keywords
  const metaKeywords = html.match(/<meta[^>]+name=["']keywords["'][^>]*content=["']([^"']+)["']/i);
  if (metaKeywords) {
    metaKeywords[1].split(",").forEach(k => {
      const clean = k.trim();
      if (clean.length > 2) keywords.add(clean.toLowerCase());
    });
  }

  return Array.from(keywords).slice(0, 30);
}

function parseCountString(str: string): number {
  const cleaned = str.replace(/[^0-9.KM]/gi, "");
  if (cleaned.endsWith("M")) return parseFloat(cleaned) * 1000000;
  if (cleaned.endsWith("K")) return parseFloat(cleaned) * 1000;
  return parseFloat(cleaned) || 0;
}