import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { url, locale } = await request.json();
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
    const res = await fetch(`https://www.instagram.com/${username}/`, {
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

    if (!res.ok) {
      return NextResponse.json(
        { success: false, error: `Instagram returned status ${res.status} - profile may not exist or is private` },
        { status: 502 }
      );
    }

    const html = await res.text();

    // ===== 2. Extract REAL data from Instagram page =====
    // Instagram embeds profile data in JSON in script tags
    const sharedData = extractSharedData(html);
    
    const profile = sharedData?.entry_data?.ProfilePage?.[0]?.graphql?.user || null;
    const isPrivate = profile?.is_private || false;
    const verified = profile?.is_verified || false;
    const fullName = profile?.full_name || username;
    const bio = profile?.biography || "";
    const followers = profile?.edge_followed_by?.count ?? 0;
    const following = profile?.edge_follow?.count ?? 0;
    const postsCount = profile?.edge_owner_to_timeline_media?.count ?? 0;
    const posts = profile?.edge_owner_to_timeline_media?.edges?.map((e: any) => e?.node) || [];
    const profilePicUrl = profile?.profile_pic_url_hd || profile?.profile_pic_url || null;
    
    // Extract from meta tags as fallback
    const metaTitle = html.match(/<meta[^>]+property=["']og:title["'][^>]*content=["']([^"']+)["']/i)?.[1] || null;
    const metaDescription = html.match(/<meta[^>]+name=["']description["'][^>]*content=["']([^"']+)["']/i)?.[1] || null;

    // Extract hashtags from bio
    const bioHashtags = bio.match(/#[a-zA-Z0-9_]+/g) || [];
    const bioLinks = bio.match(/https?:\/\/[^\s]+/g) || [];

    // ===== 3. Calculate REAL engagement metrics from actual posts =====
    let totalLikes = 0;
    let totalComments = 0;
    let totalViews = 0;
    const postSamples = [];

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

    // ===== 4. SCORE CALCULATION =====

    // Profile Quality Score
    let profileScore = 0;
    if (fullName && fullName.length > 0) profileScore += 15;
    if (bio && bio.length >= 30) profileScore += 20;
    else if (bio && bio.length >= 10) profileScore += 12;
    else if (bio && bio.length > 0) profileScore += 5;
    if (profilePicUrl) profileScore += 15;
    if (verified) profileScore += 20;
    if (bioHashtags.length >= 3) profileScore += 15;
    else if (bioHashtags.length >= 1) profileScore += 8;
    if (bioLinks.length > 0) profileScore += 15;
    profileScore = Math.min(100, profileScore);

    // Audience Growth Score
    let growthScore = 0;
    if (followers > 0) {
      if (followers >= 1000000) growthScore += 35;
      else if (followers >= 100000) growthScore += 28;
      else if (followers >= 10000) growthScore += 20;
      else if (followers >= 1000) growthScore += 12;
      else if (followers >= 100) growthScore += 6;
      else growthScore += 2;
    }
    if (following > 0 && followers > 0) {
      const ratio = following / followers;
      if (ratio < 0.1) growthScore += 15;
      else if (ratio < 0.5) growthScore += 10;
      else growthScore += 5;
    }
    if (postsCount >= 50) growthScore += 20;
    else if (postsCount >= 20) growthScore += 14;
    else if (postsCount >= 10) growthScore += 8;
    else if (postsCount >= 1) growthScore += 4;
    if (followers > 0 && postsCount > 0) {
      const followersPerPost = followers / postsCount;
      if (followersPerPost >= 100) growthScore += 30;
      else if (followersPerPost >= 50) growthScore += 22;
      else if (followersPerPost >= 10) growthScore += 15;
      else if (followersPerPost >= 5) growthScore += 8;
      else growthScore += 3;
    }
    growthScore = Math.min(100, growthScore);

    // Content Engagement Score
    let engagementScore = 0;
    if (avgLikesPerPost > 0) {
      if (avgLikesPerPost >= 10000) engagementScore += 30;
      else if (avgLikesPerPost >= 1000) engagementScore += 24;
      else if (avgLikesPerPost >= 100) engagementScore += 18;
      else if (avgLikesPerPost >= 10) engagementScore += 10;
      else engagementScore += 4;
    }
    if (engagementRate >= 5) engagementScore += 35;
    else if (engagementRate >= 3) engagementScore += 28;
    else if (engagementRate >= 1) engagementScore += 20;
    else if (engagementRate > 0) engagementScore += 10;
    else engagementScore += 3;
    if (avgCommentsPerPost >= 100) engagementScore += 20;
    else if (avgCommentsPerPost >= 10) engagementScore += 15;
    else if (avgCommentsPerPost >= 1) engagementScore += 8;
    else engagementScore += 3;
    if (totalViews > 0) {
      if (totalViews >= 10000) engagementScore += 15;
      else if (totalViews >= 1000) engagementScore += 10;
      else if (totalViews >= 100) engagementScore += 5;
    }
    engagementScore = Math.min(100, engagementScore);

    // Content Consistency Score
    let consistencyScore = 0;
    if (postsCount >= 100) consistencyScore += 35;
    else if (postsCount >= 50) consistencyScore += 28;
    else if (postsCount >= 20) consistencyScore += 20;
    else if (postsCount >= 10) consistencyScore += 12;
    else if (postsCount >= 1) consistencyScore += 6;
    if (postSamples.length > 0 && postsCount > 0) {
      // Check caption quality
      const captionsWithText = postSamples.filter(p => p.caption && p.caption.length > 50).length;
      const captionRatio = captionsWithText / postSamples.length;
      if (captionRatio >= 0.5) consistencyScore += 30;
      else if (captionRatio >= 0.3) consistencyScore += 20;
      else if (captionRatio >= 0.1) consistencyScore += 10;
    }
    if (postsCount > 0 && followers > 0) {
      const postsPerFollower = postsCount / followers;
      if (postsPerFollower > 0.1) consistencyScore += 10;
      else if (postsPerFollower > 0.05) consistencyScore += 5;
    }
    consistencyScore = Math.min(100, consistencyScore);

    // SEO / Discoverability Score
    let seoScore = 0;
    if (username && username.length >= 3) seoScore += 20;
    if (fullName) seoScore += 15;
    if (bio && bio.length >= 30) seoScore += 15;
    if (bioHashtags.length >= 3) seoScore += 15;
    else if (bioHashtags.length >= 1) seoScore += 8;
    if (postsCount > 0) seoScore += 15;
    if (followers > 1000) seoScore += 10;
    if (verified) seoScore += 10;
    seoScore = Math.min(100, seoScore);

    const overallScore = Math.round((profileScore + growthScore + engagementScore + consistencyScore + seoScore) / 5);

    // ===== 5. BUILD FINDINGS =====
    const findings: Array<{
      category: string;
      severity: string;
      issue: string;
      issueAr: string;
      evidence: string;
      evidenceAr: string;
      whyItMatters: string;
      whyItMattersAr: string;
      howToFix: string;
      howToFixAr: string;
      expectedBenefit: string;
      expectedBenefitAr: string;
    }> = [];

    if (!bio || bio.length < 10) {
      findings.push({
        category: "content", severity: "high",
        issue: `Bio is ${bio?.length || 0} characters - too short for good profile optimization`,
        issueAr: `الوصف الشخصي ${bio?.length || 0} حرف - قصير جداً لتحسين الملف الشخصي`,
        evidence: `Current bio: "${bio?.slice(0, 50) || "empty"}"`,
        evidenceAr: `الوصف الحالي: "${bio?.slice(0, 50) || "فارغ"}"`,
        whyItMatters: "A complete bio with keywords helps Instagram's algorithm understand your profile and helps users decide to follow you",
        whyItMattersAr: "الوصف المكتمل مع الكلمات المفتاحية يساعد خوارزمية إنستغرام على فهم ملفك ويساعد المستخدمين على قرار متابعتك",
        howToFix: "Add a detailed bio (30+ characters) with relevant keywords, hashtags, and a clear description of your content",
        howToFixAr: "أضف وصفاً مفصلاً (30+ حرفاً) مع كلمات مفتاحية ذات صلة وهاشتاجات ووصف واضح لمحتواك",
        expectedBenefit: "Better profile discoverability and increased follower conversion",
        expectedBenefitAr: "تحسين قابلية اكتشاف الملف وزيادة تحويل المتابعين"
      });
    }
    if (bioHashtags.length === 0) {
      findings.push({
        category: "seo", severity: "medium",
        issue: "No hashtags found in bio description",
        issueAr: "لا توجد هاشتاجات في الوصف الشخصي",
        evidence: "Bio contains 0 hashtags",
        evidenceAr: "الوصف الشخصي لا يحتوي على أي هاشتاجات",
        whyItMatters: "Hashtags in bio help with profile discoverability in search and related content recommendations",
        whyItMattersAr: "الهاشتاجات في الوصف تساعد على قابلية اكتشاف الملف في البحث والتوصيات ذات الصلة",
        howToFix: "Add 3-5 relevant hashtags to your bio (e.g., #fashion #lifestyle #travel)",
        howToFixAr: "أضف 3-5 هاشتاجات ذات صلة إلى وصفك (مثل: #موضة #ستايل #سفر)",
        expectedBenefit: "Improved profile search visibility and niche positioning",
        expectedBenefitAr: "تحسين ظهور الملف في البحث وتحديد التخصص بشكل أفضل"
      });
    }
    if (bioLinks.length === 0) {
      findings.push({
        category: "content", severity: "medium",
        issue: "No links found in bio - missing opportunity for traffic redirect",
        issueAr: "لا توجد روابط في الوصف - فرصة ضائعة لتوجيه الزيارات",
        evidence: "Bio does not contain any external links",
        evidenceAr: "الوصف الشخصي لا يحتوي على أي روابط خارجية",
        whyItMatters: "Links in bio are the primary way Instagram creators direct traffic to their websites, products, or other platforms",
        whyItMattersAr: "الروابط في الوصف هي الطريقة الرئيسية التي يستخدمها صناع المحتوى لتوجيه الزيارات إلى مواقعهم أو منتجاتهم أو منصات أخرى",
        howToFix: "Add links to your bio for your website, other social media profiles, or a Linktree page",
        howToFixAr: "أضف روابط إلى وصفك للموقع الخاص بك أو حسابات أخرى أو صفحة Linktree",
        expectedBenefit: "Traffic redirection to your website or other platforms",
        expectedBenefitAr: "توجيه الزيارات إلى موقعك أو منصات أخرى"
      });
    }
    if (followers > 0 && totalLikes > 0 && engagementRate < 1) {
      findings.push({
        category: "engagement", severity: "medium",
        issue: `Low engagement rate (${engagementRate.toFixed(2)}%). Instagram average is 1-5%`,
        issueAr: `نسبة تفاعل منخفضة (${engagementRate.toFixed(2)}%). متوسط إنستغرام هو 1-5%`,
        evidence: `Average engagement rate across ${sampleCount} sampled posts: ${engagementRate.toFixed(2)}%`,
        evidenceAr: `متوسط نسبة التفاعل عبر ${sampleCount} منشورات مأخوذة: ${engagementRate.toFixed(2)}%`,
        whyItMatters: "Low engagement rate means the algorithm won't show your content to as many people, reducing organic reach",
        whyItMattersAr: "نسبة التفاعل المنخفضة تعني أن الخوارزمية لن تعرض محتواك لعدد كبير من الأشخاص، مما يقلل الوصول العضوي",
        howToFix: "Create engaging content with strong hooks, use relevant hashtags, post at optimal times, and engage with your audience",
        howToFixAr: "أنشئ محتوى جذاباً مع مقدمات قوية، استخدم هاشتاجات ذات صلة، انشر في الأوقات المثالية، وتفاعل مع جمهورك",
        expectedBenefit: "Higher organic reach and improved algorithm recommendation",
        expectedBenefitAr: "وصول عضوي أعلى وتحسين توصيات الخوارزمية"
      });
    }
    if (postsCount === 0) {
      findings.push({
        category: "content", severity: "info",
        issue: "No public posts found on this profile",
        issueAr: "لا توجد منشورات عامة في هذا الملف",
        evidence: "Profile has 0 public posts",
        evidenceAr: "الملف لديه 0 منشورات عامة",
        whyItMatters: "Without posts, the profile offers no value to potential followers and the algorithm has no content to recommend",
        whyItMattersAr: "بدون منشورات، لا يقدم الملف أي قيمة للمتابعين المحتملين ولا يوجد محتوى للخوارزمية للتوصية به",
        howToFix: "Start posting regular content with good captions and hashtags",
        howToFixAr: "ابدأ بنشر محتوى منتظم مع أوصاف جيدة وهاشتاجات",
        expectedBenefit: "Build profile value and algorithm learning signal",
        expectedBenefitAr: "بناء قيمة للملف وإشارة تعلم للخوارزمية"
      });
    }

    // ===== 6. BUILD STRENGTHS & WEAKNESSES =====
    const strengths: string[] = [];
    const weaknesses: string[] = [];

    if (fullName) strengths.push(locale === "ar" ? `✓ الاسم الكامل: ${fullName}` : `✓ Full name: ${fullName}`);
    if (bio && bio.length >= 10) strengths.push(locale === "ar" ? `✓ وصف شخصي موجود (${bio.length} حرف)` : `✓ Bio present (${bio.length} chars)`);
    if (profilePicUrl) strengths.push(locale === "ar" ? "✓ صورة الملف الشخصي موجودة" : "✓ Profile picture present");
    if (verified) strengths.push(locale === "ar" ? "✓ حساب موثق" : "✓ Verified account");
    if (bioHashtags.length > 0) strengths.push(locale === "ar" ? `✓ ${bioHashtags.length} هاشتاج في الوصف` : `✓ ${bioHashtags.length} hashtags in bio`);
    if (bioLinks.length > 0) strengths.push(locale === "ar" ? `✓ ${bioLinks.length} روابط في الوصف` : `✓ ${bioLinks.length} links in bio`);
    if (followers > 0) strengths.push(locale === "ar" ? `✓ ${formatNumber(followers)} متابع` : `✓ ${formatNumber(followers)} followers`);
    if (following > 0) strengths.push(locale === "ar" ? `✓ يتابع ${formatNumber(following)}` : `✓ Following ${formatNumber(following)}`);
    if (postsCount > 0) strengths.push(locale === "ar" ? `✓ ${postsCount} منشور` : `✓ ${postsCount} posts`);
    if (avgLikesPerPost > 0) strengths.push(locale === "ar" ? `✓ ${formatNumber(avgLikesPerPost)} متوسط الإعجابات/منشور` : `✓ ${formatNumber(avgLikesPerPost)} avg likes/post`);
    if (engagementRate > 0) strengths.push(locale === "ar" ? `✓ نسبة تفاعل: ${engagementRate.toFixed(2)}%` : `✓ Engagement rate: ${engagementRate.toFixed(2)}%`);
    if (isPrivate) strengths.push(locale === "ar" ? "⚠️ حساب خاص - المحتوى غير متاح للعامة" : "⚠️ Private account - content not publicly available");

    for (const f of findings) {
      if (f.severity === "critical" || f.severity === "high") {
        weaknesses.push(locale === "ar" ? f.issueAr : f.issue);
      }
    }

    const criticalIssues = findings.filter(f => f.severity === "critical" || f.severity === "high");

    return NextResponse.json({
      success: true,
      data: {
        platform: "instagram",
        url: `https://www.instagram.com/${username}/`,
        username,
        fullName,
        bio: bio?.slice(0, 200) || null,
        bioHashtags,
        bioLinks,
        verified,
        isPrivate,
        profilePicUrl,
        followers,
        following,
        postsCount,
        avgLikesPerPost,
        avgCommentsPerPost,
        engagementRate: Math.round(engagementRate * 100) / 100,
        postSamples,
        overallScore,
        scores: {
          seo: { score: seoScore },
          content: { score: consistencyScore },
          profile: { score: profileScore },
          growth: { score: growthScore },
          engagement: { score: engagementScore },
        },
        findings,
        strengths: strengths.slice(0, 10),
        weaknesses: weaknesses.slice(0, 10),
        criticalIssues,
        metadata: {
          analyzedUrl: `https://www.instagram.com/${username}/`,
          analysisDate: new Date().toISOString(),
          duration: Math.round((Date.now() - startTime) / 1000),
          dataSources: ["Instagram Profile Page", "Post Metadata Extraction", "Bio Analysis", "Engagement Metrics Calculation"],
          limitations: [
            "Based on publicly available Instagram data only",
            "Instagram may rate-limit or block automated requests",
            "Some metrics may be approximate due to Instagram's client-side rendering",
            "Post engagement is sampled from the most recent posts",
            "Follower counts are as displayed publicly at time of analysis",
          ],
          methodologyVersion: "3.0.0",
        },
      },
    });
  } catch (error: any) {
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

function formatNumber(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return n.toString();
}