import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { url, locale } = await request.json();
    if (!url) {
      return NextResponse.json({ error: "URL required" }, { status: 400 });
    }

    // Extract Snapchat username
    const username = extractSnapchatUsername(url);
    if (!username) {
      return NextResponse.json({ error: "Invalid Snapchat URL" }, { status: 400 });
    }

    const startTime = Date.now();

    // ===== 1. Fetch Snapchat public profile page =====
    const res = await fetch(`https://www.snapchat.com/add/${username}`, {
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
        { success: false, error: `Snapchat returned status ${res.status} - profile may not exist` },
        { status: 502 }
      );
    }

    const html = await res.text();

    // ===== 2. Extract REAL public data =====
    const metaTitle = html.match(/<meta[^>]+property=["']og:title["'][^>]*content=["']([^"']+)["']/i)?.[1] || null;
    const metaDescription = html.match(/<meta[^>]+name=["']description["'][^>]*content=["']([^"']+)["']/i)?.[1] || null;
    const metaImage = html.match(/<meta[^>]+property=["']og:image["'][^>]*content=["']([^"']+)["']/i)?.[1] || null;
    const metaUrl = html.match(/<meta[^>]+property=["']og:url["'][^>]*content=["']([^"']+)["']/i)?.[1] || null;

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

    // ===== 3. SCORE CALCULATION =====
    
    // Profile Quality Score
    let profileScore = 0;
    if (displayName && displayName.length > 0) profileScore += 20;
    if (hasBio) profileScore += 25;
    if (metaImage) profileScore += 20;
    if (hashtags.length >= 1) profileScore += 20;
    if (links.length > 0) profileScore += 15;
    profileScore = Math.min(100, profileScore);

    // Presence Score
    let presenceScore = 0;
    if (metaImage) presenceScore += 30;
    if (hasBio) presenceScore += 35;
    if (hasActiveContent) presenceScore += 35;
    presenceScore = Math.min(100, presenceScore);

    // Engagement Score
    let engagementScore = 0;
    if (hasBio) engagementScore += 30;
    if (hashtags.length >= 3) engagementScore += 30;
    else if (hashtags.length >= 1) engagementScore += 20;
    if (hasActiveContent) engagementScore += 25;
    if (links.length > 0) engagementScore += 20;
    engagementScore = Math.min(100, engagementScore);

    // Content Score
    let contentScore = 0;
    if (trimmedBio.length >= 100) contentScore += 35;
    else if (trimmedBio.length >= 50) contentScore += 25;
    else if (trimmedBio.length >= 20) contentScore += 15;
    if (displayName) contentScore += 20;
    if (hashtags.length > 0) contentScore += 20;
    if (metaImage) contentScore += 25;
    contentScore = Math.min(100, contentScore);

    // SEO / Discoverability Score
    let seoScore = 0;
    if (username) seoScore += 25;
    if (displayName) seoScore += 20;
    if (trimmedBio.length >= 50) seoScore += 20;
    if (hashtags.length >= 1) seoScore += 18;
    if (metaImage) seoScore += 17;
    seoScore = Math.min(100, seoScore);

    const overallScore = Math.round((profileScore + presenceScore + engagementScore + contentScore + seoScore) / 5);

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

    if (!hasBio) {
      findings.push({
        category: "content", severity: "high",
        issue: "Bio/description is missing or too short",
        issueAr: "الوصف/النبذة مفقود أو قصير جداً",
        evidence: trimmedBio ? `Current bio: "${trimmedBio.slice(0, 50)}"` : "No bio found",
        evidenceAr: trimmedBio ? `الوصف الحالي: "${trimmedBio.slice(0, 50)}"` : "لم يتم العثور على وصف",
        whyItMatters: "A complete bio helps users understand your content and brand",
        whyItMattersAr: "الوصف المكتمل يساعد المستخدمين على فهم محتواك وعلامتك التجارية",
        howToFix: "Add a detailed bio with relevant information about your content",
        howToFixAr: "أضف وصفاً مفصلاً بمعلومات ذات صلة عن محتواك",
        expectedBenefit: "Better profile understanding and engagement",
        expectedBenefitAr: "فهم أفضل للملف وتفاعل أعلى"
      });
    }
    if (hashtags.length === 0) {
      findings.push({
        category: "seo", severity: "medium",
        issue: "No hashtags found in bio",
        issueAr: "لا توجد هاشتاجات في الوصف",
        evidence: "Bio contains 0 hashtags",
        evidenceAr: "الوصف لا يحتوي على أي هاشتاجات",
        whyItMatters: "Hashtags improve profile discoverability in Snapchat search",
        whyItMattersAr: "الهاشتاجات تحسن قابلية اكتشاف الملف في بحث سناب شات",
        howToFix: "Add relevant hashtags to your bio",
        howToFixAr: "أضف هاشتاجات ذات صلة إلى وصفك",
        expectedBenefit: "Improved profile discoverability",
        expectedBenefitAr: "تحسين قابلية اكتشاف الملف"
      });
    }
    if (links.length === 0) {
      findings.push({
        category: "content", severity: "medium",
        issue: "No links found in bio - missing opportunity for cross-platform promotion",
        issueAr: "لا توجد روابط في الوصف - فرصة ضائعة للترويج عبر المنصات",
        evidence: "Bio does not contain any external links",
        evidenceAr: "الوصف لا يحتوي على أي روابط خارجية",
        whyItMatters: "Links help drive traffic to your other platforms and monetization channels",
        whyItMattersAr: "الروابط تساعد في توجيه الزيارات إلى منصاتك الأخرى وقنوات الربح",
        howToFix: "Add links to your website, other social profiles, or business inquiries",
        howToFixAr: "أضف روابط إلى موقعك أو حساباتك الأخرى أو للتواصل التجاري",
        expectedBenefit: "Cross-platform traffic and business opportunities",
        expectedBenefitAr: "زيارات عبر المنصات وفرص تجارية"
      });
    }

    // ===== 5. BUILD STRENGTHS & WEAKNESSES =====
    const strengths: string[] = [];
    const weaknesses: string[] = [];

    if (displayName) strengths.push(locale === "ar" ? `✓ اسم المستخدم: ${displayName}` : `✓ Display name: ${displayName}`);
    if (hasBio) strengths.push(locale === "ar" ? `✓ الوصف موجود (${trimmedBio.length} حرف)` : `✓ Bio present (${trimmedBio.length} chars)`);
    if (metaImage) strengths.push(locale === "ar" ? "✓ صورة الملف موجودة" : "✓ Profile image present");
    if (hashtags.length > 0) strengths.push(locale === "ar" ? `✓ ${hashtags.length} هاشتاج في الوصف` : `✓ ${hashtags.length} hashtags in bio`);
    if (links.length > 0) strengths.push(locale === "ar" ? `✓ ${links.length} روابط في الوصف` : `✓ ${links.length} links in bio`);
    if (hasActiveContent) strengths.push(locale === "ar" ? "✓ مؤشرات محتوى نشط" : "✓ Active content indicators");

    for (const f of findings) {
      if (f.severity === "critical" || f.severity === "high") {
        weaknesses.push(locale === "ar" ? f.issueAr : f.issue);
      }
    }

    const criticalIssues = findings.filter(f => f.severity === "critical" || f.severity === "high");

    return NextResponse.json({
      success: true,
      data: {
        platform: "snapchat",
        url: `https://www.snapchat.com/add/${username}`,
        username,
        displayName,
        bio: trimmedBio?.slice(0, 200) || null,
        hashtags,
        links,
        verified: false,
        overallScore,
        scores: {
          seo: { score: seoScore },
          content: { score: contentScore },
          profile: { score: profileScore },
          growth: { score: presenceScore },
          engagement: { score: engagementScore },
        },
        findings,
        strengths: strengths.slice(0, 10),
        weaknesses: weaknesses.slice(0, 10),
        criticalIssues,
        metadata: {
          analyzedUrl: `https://www.snapchat.com/add/${username}`,
          analysisDate: new Date().toISOString(),
          duration: Math.round((Date.now() - startTime) / 1000),
          dataSources: ["Snapchat Public Profile Page", "Meta Tags Extraction", "Bio Analysis"],
          limitations: [
            "Based on publicly available Snapchat data only",
            "Snapchat does not expose follower counts publicly",
            "Engagement metrics require authenticated access",
            "Profile data is limited to public HTML meta information",
          ],
          methodologyVersion: "3.0.0",
        },
      },
    });
  } catch (error: any) {
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