import { NextRequest, NextResponse } from "next/server";
import { buildSocialAnalysisResponse, normalizeProfileData } from "@/lib/social-analysis-helper";
import { safeFetch } from "@/lib/security";
import { recordAnalysis } from "@/lib/admin-stats";
import { enforceSubscription } from "@/lib/subscription-shield";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { url, locale } = await request.json();
    const blocked = enforceSubscription(request);
    if (blocked) return blocked;
    if (!url) {
      return NextResponse.json({ error: "URL required" }, { status: 400 });
    }

    // Extract Instagram username
    const username = extractInstagramUsername(url);
    if (!username) {
      return NextResponse.json({ error: "Invalid Instagram URL" }, { status: 400 });
    }

    const startTime = Date.now();

    // ===== 1. Fetch Instagram profile page =====
    let profileData: Record<string, any> = {};

    try {
      const res = await safeFetch(`https://www.instagram.com/${username}/`, {
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

        // ===== 2. Extract REAL data from Instagram page =====
        const sharedData = extractSharedData(html);
        
        const profile = sharedData?.entry_data?.ProfilePage?.[0]?.graphql?.user || null;

        // Only treat data as extracted when the profile object actually exists;
        // a login-wall or JS-only page means "unknown", never verified zeros.
        if (profile) {
        const isPrivate = profile?.is_private || false;
        const verified = profile?.is_verified || false;
        const fullName = profile?.full_name || username;
        const bio = profile?.biography || "";
        const followers = profile?.edge_followed_by?.count ?? 0;
        const following = profile?.edge_follow?.count ?? 0;
        const postsCount = profile?.edge_owner_to_timeline_media?.count ?? 0;
        const posts = profile?.edge_owner_to_timeline_media?.edges?.map((e: any) => e?.node) || [];
        const profilePicUrl = profile?.profile_pic_url_hd || profile?.profile_pic_url || null;

        // Extract hashtags from bio
        const bioHashtags = bio.match(/#[a-zA-Z0-9_]+/g) || [];
        const bioLinks = bio.match(/https?:\/\/[^\s]+/g) || [];

        // ===== 3. Calculate REAL engagement metrics from actual posts =====
        let totalLikes = 0;
        let totalComments = 0;
        let totalViews = 0;
        const postSamples: any[] = [];

        for (const post of posts.slice(0, 10)) {
          const pLikes = post.edge_liked_by?.count ?? post.edge_media_preview_like?.count ?? 0;
          const pComments = post.edge_media_to_comment?.count ?? 0;
          const pViews = post.video_view_count ?? 0;
          
          totalLikes += pLikes;
          totalComments += pComments;
          totalViews += pViews;

          if (postSamples.length < 5) {
            postSamples.push({
              id: post.id,
              shortcode: post.shortcode,
              caption: post.edge_media_to_caption?.edges?.[0]?.node?.text?.slice(0, 100) || "",
              likes: pLikes,
              comments: pComments,
              views: pViews,
              url: `https://www.instagram.com/p/${post.shortcode}/`,
              thumbnail: post.display_url || null,
            });
          }
        }

        const sampleCount = Math.max(postSamples.length, 1);
        const avgLikesPerPost = postsCount > 0 ? Math.round(totalLikes / sampleCount) : 0;
        const avgCommentsPerPost = postsCount > 0 ? Math.round(totalComments / sampleCount) : 0;
        const engagementRate = followers > 0 ? ((totalLikes + totalComments) / Math.max(sampleCount, 1) / followers) * 100 : 0;

        profileData = {
          followers,
          following,
          postsCount,
          likes: totalLikes,
          avgLikesPerPost,
          avgCommentsPerPost,
          engagementRate,
          bio,
          bioHashtags,
          bioLinks,
          fullName,
          verified,
          isPrivate,
          profilePicUrl,
        };
        }
      }
    } catch {
      // Fall through — no verifiable profile data
    }

    const normalizedData = normalizeProfileData("instagram", profileData);
    const normalizedUrl = `https://www.instagram.com/${username}/`;
    const hasSourceData = Object.values(profileData).some((value) => value !== undefined && value !== null && value !== "");
    const sourceConfidence = hasSourceData ? "high" : "low";

    recordAnalysis("instagram", true);

    // ---- Social linking gate ----
    // Public accounts are always analyzed from public data. A private account —
    // or one hidden behind Instagram's login wall — has no verifiable public
    // metrics, so we transparently ask the visitor to LINK their own Facebook /
    // Instagram (Meta OAuth) once; they are redirected straight back after it.
    const isPrivateAccount = profileData.isPrivate === true;
    const requiresLinking = !hasSourceData || isPrivateAccount;

    return NextResponse.json(
      await buildSocialAnalysisResponse({
        platform: "instagram",
        username,
        url: normalizedUrl,
        locale,
        profileData: {
          ...profileData,
          ...normalizedData,
        },
        extraData: {
          profilePicUrl: profileData.profilePicUrl || null,
          postSamples: profileData.postSamples || [],
          requiresLinking,
          isPrivate: isPrivateAccount,
          linkingHintEn: requiresLinking
            ? "This Instagram account is private or hidden behind a login wall. Link your Facebook account once to unlock precise Instagram analytics on Smart Land (for accounts you manage)."
            : "",
          linkingHintAr: requiresLinking
            ? "حساب إنستغرام هذا خاص أو محجوب خلف جدار تسجيل الدخول. اربط حساب فيسبوك مرة واحدة لفتح تحليلات دقيقة لإنستغرام على سمارت لاند (للحسابات التي تديرها)."
            : "",
        },
        dataSources: hasSourceData ? ["instagram-public-profile", "instagram-sharedData"] : ["instagram-public-profile"],
        sourceConfidence,
        startTime,
      })
    );
  } catch (error: any) {
    recordAnalysis("instagram", false);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to analyze Instagram profile" },
      { status: 500 }
    );
  }
}

function extractInstagramUsername(url: string): string | null {
  const match = url.match(/(?:instagram\.com\/)([a-zA-Z0-9_\.]{1,30})/i);
  if (match) return match[1].replace(/^@/, "").replace(/\.$/, "");

  const clean = url.replace(/^https?:\/\//, "").replace(/^www\./, "");
  if (/^@?[a-zA-Z0-9_\.]{1,30}$/.test(clean)) {
    return clean.replace(/^@/, "").replace(/\.$/, "");
  }

  return null;
}

function extractSharedData(html: string): any {
  // Instagram embeds data in sharedData script
  const match = html.match(/<script[^>]*>window\._sharedData\s*=\s*([\s\S]*?);<\/script>/i);
  if (match && match[1]) {
    try {
      return JSON.parse(match[1]);
    } catch {}
  }

  // Try alternate format
  const altMatch = html.match(/<script[^>]*type=["']application\/json["'][^>]*id=["']__additionalDataLoaded["'][^>]*>([\s\S]*?)<\/script>/i);
  if (altMatch && altMatch[1]) {
    try {
      return JSON.parse(altMatch[1]);
    } catch {}
  }

  // Try to find user data in any JSON structure
  const userMatch = html.match(/"username":"([^"]+)","full_name":"([^"]+)"/);
  if (userMatch) return { entry_data: { ProfilePage: [{ graphql: { user: { username: userMatch[1], full_name: userMatch[2] } } }] } };

  return null;
}