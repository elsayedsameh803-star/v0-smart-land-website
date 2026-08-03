import { NextRequest, NextResponse } from "next/server";

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

    if (!res.ok) {
      return NextResponse.json(
        { success: false, error: `Facebook returned status ${res.status} - page may not exist or is private` },
        { status: 502 }
      );
    }

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

    // ===== 3. SCORE CALCULATION =====
    
    // Profile/Page Quality Score
    let profileScore = 0;
    if (pageName && pageName.length > 0) profileScore += 20;
    if (hasAbout) profileScore += 20;
    if (metaImage) profileScore += 15;
    if (verified) profileScore += 20;
    if (hashtags.length >= 3) profileScore += 15;
    else if (hashtags.length >= 1) profileScore += 8;
    if (links.length > 0) profileScore += 10;
    profileScore = Math.min(100, profileScore);

    // Audience Score
    let audienceScore = 0;
    if (followers > 0) {
      if (followers >= 1000000) audienceScore += 40;
      else if (followers >= 100000) audienceScore += 32;
      else if (followers >= 10000) audienceScore += 24;
      else if (followers >= 1000) audienceScore += 16;
      else if (followers >= 100) audienceScore += 8;
      else audienceScore += 3;
    }
    if (visiblePosts > 0) {
      if (visiblePosts >= 10) audienceScore += 30;
      else if (visiblePosts >= 5) audienceScore += 22;
      else if (visiblePosts >= 1) audienceScore += 12;
    }
    if (followers > 0 && visiblePosts > 0) {
      audienceScore += Math.min(30, visiblePosts * 5);
    }
    audienceScore = Math.min(100, audienceScore);

    // Engagement Score
    let engagementScore = 0;
    if (hasAbout)
      engagementScore += 25;
    if (hashtags.length >= 3)
      engagementScore += 25;
    else if (hashtags.length >= 1)
      engagementScore += 15;
    if (visiblePosts >= 5)
      engagementScore += 25;
    else if (visiblePosts >= 1)
      engagementScore += 15;
    if (followers > 1000)
      engagementScore += 25;
    else if (followers > 100)
      engagementScore += 15;
    engagementScore = Math.min(100, engagementScore);

    // Content Score
    let contentScore = 0;
    if (aboutText.length >= 100) contentScore += 30;
    else if (aboutText.length >= 50) contentScore += 22;
    else if (aboutText.length >= 20) contentScore += 12;
    if (pageName) contentScore += 20;
    if (hashtags.length > 0) contentScore += 20;
    if (links.length > 0) contentScore += 10;
    if (metaImage) contentScore += 20;
    contentScore = Math.min(100, contentScore);

    // SEO / Discoverability Score
    let seoScore = 0;
    if (pageName) seoScore += 20;
    if (aboutText.length >= 50) seoScore += 20;
    if (hashtags.length >= 1) seoScore += 15;
    if (verified) seoScore += 20;
    if (metaImage) seoScore += 15;
    if (followers > 100) seoScore += 10;
    seoScore = Math.min(100, seoScore);

    const overallScore = Math.round((profileScore + audienceScore + engagementScore + contentScore + seoScore) / 5);

    // ===== 4. BUILD FINDINGS =====
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

    if (!hasAbout) {
      findings.push({
        category: "content", severity: "high",
        issue: "Page about/description is missing or too short",
        issueAr: "وصف الصفحة مفقود أو قصير جداً",
        evidence: trimmedAbout ? `Current description: "${trimmedAbout.slice(0, 50)}"` : "No page description found",
        evidenceAr: trimmedAbout ? `الوصف الحالي: "${trimmedAbout.slice(0, 50)}"` : "لم يتم العثور على وصف للصفحة",
        whyItMatters: "A complete page description helps Facebook understand your page and helps users decide to follow it",
        whyItMattersAr: "وصف الصفحة المكتمل يساعد فيسبوك على فهم صفحتك ويساعد المستخدمين على قرار متابعتها",
        howToFix: "Add a detailed page description (50+ characters) with relevant keywords",
        howToFixAr: "أضف وصفاً مفصلاً للصفحة (50+ حرفاً) مع كلمات مفتاحية ذات صلة",
        expectedBenefit: "Better page discoverability and increased follower conversion",
        expectedBenefitAr: "تحسين قابلية اكتشاف الصفحة وزيادة تحويل المتابعين"
      });
    }
    if (hashtags.length === 0) {
      findings.push({
        category: "seo", severity: "medium",
        issue: "No hashtags found in page description",
        issueAr: "لا توجد هاشتاجات في وصف الصفحة",
        evidence: "Page description contains 0 hashtags",
        evidenceAr: "وصف الصفحة لا يحتوي على أي هاشتاجات",
        whyItMatters: "Hashtags help with page discoverability in Facebook search and content recommendations",
        whyItMattersAr: "الهاشتاجات تساعد على قابلية اكتشاف الصفحة في بحث فيسبوك وتوصيات المحتوى",
        howToFix: "Add relevant hashtags to your page description and posts",
        howToFixAr: "أضف هاشتاجات ذات صلة إلى وصف الصفحة والمنشورات",
        expectedBenefit: "Improved page search visibility",
        expectedBenefitAr: "تحسين ظهور الصفحة في البحث"
      });
    }
    if (links.length === 0) {
      findings.push({
        category: "content", severity: "medium",
        issue: "No links found in page description - missing opportunity for traffic redirect",
        issueAr: "لا توجد روابط في وصف الصفحة - فرصة ضائعة لتوجيه الزيارات",
        evidence: "Page description does not contain any external links",
        evidenceAr: "وصف الصفحة لا يحتوي على أي روابط خارجية",
        whyItMatters: "Links help direct visitors to your website, store, or other platforms",
        whyItMattersAr: "الروابط تساعد في توجيه الزوار إلى موقعك أو متجرك أو منصات أخرى",
        howToFix: "Add links to your website and other social media profiles in the page description",
        howToFixAr: "أضف روابط إلى موقعك وحساباتك الأخرى في وصف الصفحة",
        expectedBenefit: "Traffic redirection to your website or other platforms",
        expectedBenefitAr: "توجيه الزيارات إلى موقعك أو منصات أخرى"
      });
    }
    if (followers === 0 && !followersText) {
      findings.push({
        category: "content", severity: "info",
        issue: "Follower count not accessible from public page data",
        issueAr: "عدد المتابعين غير متاح من بيانات الصفحة العامة",
        evidence: "Facebook did not expose follower count in public page HTML",
        evidenceAr: "فيسبوك لم يعرض عدد المتابعين في HTML العامة للصفحة",
        whyItMatters: "Follower count is a key social proof metric for page credibility",
        whyItMattersAr: "عدد المتابعين مقياس إثبات اجتماعي رئيسي لمصداقية الصفحة",
        howToFix: "Facebook limits public access to this data. Continue posting quality content to grow your audience",
        howToFixAr: "فيسبوك يحد من الوصول العام لهذه البيانات. واصل نشر محتوى عالي الجودة لتنمية جمهورك",
        expectedBenefit: "Verified follower growth over time",
        expectedBenefitAr: "نمو موثق للمتابعين مع مرور الوقت"
      });
    }

    // ===== 5. BUILD STRENGTHS & WEAKNESSES =====
    const strengths: string[] = [];
    const weaknesses: string[] = [];

    if (pageName) strengths.push(locale === "ar" ? `✓ اسم الصفحة: ${pageName}` : `✓ Page name: ${pageName}`);
    if (hasAbout) strengths.push(locale === "ar" ? `✓ وصف الصفحة موجود (${aboutText.length} حرف)` : `✓ Page description present (${aboutText.length} chars)`);
    if (verified) strengths.push(locale === "ar" ? "✓ صفحة موثقة" : "✓ Verified page");
    if (hashtags.length > 0) strengths.push(locale === "ar" ? `✓ ${hashtags.length} هاشتاج في الوصف` : `✓ ${hashtags.length} hashtags in description`);
    if (links.length > 0) strengths.push(locale === "ar" ? `✓ ${links.length} روابط في الوصف` : `✓ ${links.length} links in description`);
    if (metaImage) strengths.push(locale === "ar" ? "✓ صورة الغلاف موجودة" : "✓ Cover image present");
    if (followers > 0) strengths.push(locale === "ar" ? `✓ ${formatNumber(followers)} متابع` : `✓ ${formatNumber(followers)} followers`);
    if (visiblePosts > 0) strengths.push(locale === "ar" ? `✓ ${visiblePosts} منشور ظاهر` : `✓ ${visiblePosts} visible posts`);

    for (const f of findings) {
      if (f.severity === "critical" || f.severity === "high") {
        weaknesses.push(locale === "ar" ? f.issueAr : f.issue);
      }
    }

    const criticalIssues = findings.filter(f => f.severity === "critical" || f.severity === "high");

    return NextResponse.json({
      success: true,
      data: {
        platform: "facebook",
        url: `https://www.facebook.com/${pageId}/`,
        pageId,
        pageName,
        about: aboutText?.slice(0, 200) || null,
        hashtags,
        links,
        verified,
        followers,
        followersText,
        visiblePosts,
        profileScore,
        audienceScore,
        engagementScore,
        contentScore,
        seoScore,
        overallScore,
        scores: {
          seo: { score: seoScore },
          content: { score: contentScore },
          profile: { score: profileScore },
          growth: { score: audienceScore },
          engagement: { score: engagementScore },
        },
        findings,
        strengths: strengths.slice(0, 10),
        weaknesses: weaknesses.slice(0, 10),
        criticalIssues,
        metadata: {
          analyzedUrl: `https://www.facebook.com/${pageId}/`,
          analysisDate: new Date().toISOString(),
          duration: Math.round((Date.now() - startTime) / 1000),
          dataSources: ["Facebook Public Page Data", "Meta Tags Extraction", "Description Analysis"],
          limitations: [
            "Based on publicly available Facebook data only",
            "Facebook heavily limits automated access to page data",
            "Follower count may not be visible without authentication",
            "Post engagement data requires login for full access",
          ],
          methodologyVersion: "3.0.0",
        },
      },
    });
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

function formatNumber(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return n.toString();
}