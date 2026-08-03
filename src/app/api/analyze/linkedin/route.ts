import { NextRequest, NextResponse } from "next/server";

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

    // ===== 1. Fetch LinkedIn public profile/company page =====
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

    if (!res.ok) {
      return NextResponse.json(
        { success: false, error: `LinkedIn returned status ${res.status} - profile may not exist or is private` },
        { status: 502 }
      );
    }

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

    // ===== 3. SCORE CALCULATION =====
    
    // Profile Quality Score
    let profileScore = 0;
    if (profileName && profileName.length > 0) profileScore += 20;
    if (hasProfilePic) profileScore += 20;
    if (hasHeadline) profileScore += 30;
    if (hasExperience) profileScore += 15;
    if (hasEducation) profileScore += 15;
    profileScore = Math.min(100, profileScore);

    // Professional Network Score
    let networkScore = 0;
    if (connections > 0) {
      if (connections >= 5000) networkScore += 40;
      else if (connections >= 1000) networkScore += 32;
      else if (connections >= 500) networkScore += 24;
      else if (connections >= 100) networkScore += 16;
      else if (connections >= 1) networkScore += 8;
      else networkScore += 3;
    }
    if (keywords.length >= 10) networkScore += 30;
    else if (keywords.length >= 5) networkScore += 22;
    else if (keywords.length >= 3) networkScore += 14;
    if (hasHeadline) networkScore += 30;
    networkScore = Math.min(100, networkScore);

    // Content Score
    let contentScore = 0;
    if (metaDescription && metaDescription.length >= 100) contentScore += 35;
    else if (metaDescription && metaDescription.length >= 50) contentScore += 25;
    else if (metaDescription && metaDescription.length >= 20) contentScore += 15;
    if (hasExperience) contentScore += 25;
    if (hasEducation) contentScore += 20;
    if (keywords.length > 0) contentScore += 20;
    contentScore = Math.min(100, contentScore);

    // SEO Score
    let seoScore = 0;
    if (profileName) seoScore += 20;
    if (metaDescription && metaDescription.length >= 50) seoScore += 25;
    if (keywords.length >= 10) seoScore += 20;
    else if (keywords.length >= 5) seoScore += 14;
    if (hasHeadline) seoScore += 20;
    if (metaImage) seoScore += 15;
    seoScore = Math.min(100, seoScore);

    // Professional Authority Score
    let authorityScore = 0;
    if (connections > 0) {
      if (connections >= 500) authorityScore += 30;
      else if (connections >= 100) authorityScore += 22;
      else if (connections >= 50) authorityScore += 14;
      else authorityScore += 6;
    }
    if (hasExperience) authorityScore += 25;
    if (hasEducation) authorityScore += 20;
    if (keywords.length >= 5) authorityScore += 25;
    else if (keywords.length >= 3) authorityScore += 15;
    authorityScore = Math.min(100, authorityScore);

    const overallScore = Math.round((profileScore + networkScore + contentScore + seoScore + authorityScore) / 5);

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

    if (!hasHeadline) {
      findings.push({
        category: "content", severity: "high",
        issue: "Profile headline is missing or too short",
        issueAr: "العنوان الرئيسي للملف مفقود أو قصير جداً",
        evidence: `Current headline: "${headline.slice(0, 50) || "empty"}"`,
        evidenceAr: `العنوان الحالي: "${headline.slice(0, 50) || "فارغ"}"`,
        whyItMatters: "A professional headline is the first thing recruiters see. It helps you appear in LinkedIn searches with 0.0% visibility without one.",
        whyItMattersAr: "العنوان المهني هو أول ما يراه مسؤولو التوظيف. يساعدك على الظهور في بحث لينكد إن.",
        howToFix: "Add a descriptive headline (50+ characters) with your role, industry, and key skills",
        howToFixAr: "أضف عنواناً وصفياً (50+ حرفاً) مع دورك وصناعتك ومهاراتك الرئيسية",
        expectedBenefit: "Up to 50% more profile views from search results",
        expectedBenefitAr: "ما يصل إلى 50% المزيد من مشاهدات الملف من نتائج البحث"
      });
    }
    if (keywords.length < 3) {
      findings.push({
        category: "seo", severity: "medium",
        issue: "Limited professional keywords detected in profile",
        issueAr: "كلمات مفتاحية مهنية محدودة في الملف",
        evidence: `Found only ${keywords.length} relevant keywords`,
        evidenceAr: `تم العثور على ${keywords.length} كلمة مفتاحية ذات صلة فقط`,
        whyItMatters: "Recruiters search for specific skills and keywords. More keywords = more discoverability",
        whyItMattersAr: "يبحث مسؤولو التوظيف عن مهارات وكلمات مفتاحية محددة. كلمات أكثر = قابلية اكتشاف أكبر",
        howToFix: "Add relevant industry keywords to your headline, summary, and experience sections",
        howToFixAr: "أضف كلمات مفتاحية ذات صلة بصناعتك إلى العنوان والملخص وأقسام الخبرة",
        expectedBenefit: "Improved search visibility for recruiters and opportunities",
        expectedBenefitAr: "تحسين ظهور البحث لمسؤولي التوظيف والفرص"
      });
    }
    if (!hasExperience) {
      findings.push({
        category: "content", severity: "medium",
        issue: "No professional experience section detected",
        issueAr: "لا يوجد قسم خبرة مهنية",
        evidence: "Experience/employment section not found in public profile data",
        evidenceAr: "لم يتم العثور على قسم الخبرة/التوظيف في بيانات الملف العامة",
        whyItMatters: "Experience is the most important section for recruiters evaluating candidates",
        whyItMattersAr: "الخبرة هي أهم قسم لمسؤولي التوظيف عند تقييم المرشحين",
        howToFix: "Add your work experience with detailed descriptions of your responsibilities and achievements",
        howToFixAr: "أضف خبرتك العملية مع أوصاف مفصلة لمسؤولياتك وإنجازاتك",
        expectedBenefit: "Higher visibility for job opportunities",
        expectedBenefitAr: "ظهور أعلى لفرص العمل"
      });
    }
    if (!hasEducation) {
      findings.push({
        category: "content", severity: "low",
        issue: "No education section detected",
        issueAr: "لا يوجد قسم تعليم",
        evidence: "Education/university section not found in public profile data",
        evidenceAr: "لم يتم العثور على قسم التعليم/الجامعة في بيانات الملف العامة",
        whyItMatters: "Education adds credibility and helps with alumni network connections",
        whyItMattersAr: "التعليم يضيف مصداقية ويساعد في اتصالات شبكة الخريجين",
        howToFix: "Add your education history including degrees, institutions, and graduation dates",
        howToFixAr: "أضف سيرتك التعليمية بما في ذلك الدرجات والمؤسسات وتواريخ التخرج",
        expectedBenefit: "Increased credibility and networking opportunities",
        expectedBenefitAr: "زيادة المصداقية وفرص التواصل"
      });
    }

    // ===== 5. BUILD STRENGTHS & WEAKNESSES =====
    const strengths: string[] = [];
    const weaknesses: string[] = [];

    if (profileName) strengths.push(locale === "ar" ? `✓ الاسم: ${profileName}` : `✓ Name: ${profileName}`);
    if (hasHeadline) strengths.push(locale === "ar" ? `✓ العنوان الرئيسي: ${headline.slice(0, 50)}` : `✓ Headline: ${headline.slice(0, 50)}`);
    if (hasProfilePic) strengths.push(locale === "ar" ? "✓ صورة الملف الشخصي موجودة" : "✓ Profile picture present");
    if (hasExperience) strengths.push(locale === "ar" ? "✓ قسم الخبرة موجود" : "✓ Experience section present");
    if (hasEducation) strengths.push(locale === "ar" ? "✓ قسم التعليم موجود" : "✓ Education section present");
    if (keywords.length >= 3) strengths.push(locale === "ar" ? `✓ ${keywords.length} كلمة مفتاحية مهنية` : `✓ ${keywords.length} professional keywords`);
    if (connections > 0) strengths.push(locale === "ar" ? `✓ ${formatNumber(connections)} اتصال` : `✓ ${formatNumber(connections)} connections`);

    for (const f of findings) {
      if (f.severity === "critical" || f.severity === "high") {
        weaknesses.push(locale === "ar" ? f.issueAr : f.issue);
      }
    }

    const criticalIssues = findings.filter(f => f.severity === "critical" || f.severity === "high");

    return NextResponse.json({
      success: true,
      data: {
        platform: "linkedin",
        url: `https://www.linkedin.com/in/${profileId}/`,
        profileId,
        profileName,
        headline,
        isCompany,
        connections,
        followersText,
        keywords: keywords.slice(0, 20),
        overallScore,
        scores: {
          seo: { score: seoScore },
          content: { score: contentScore },
          profile: { score: profileScore },
          growth: { score: networkScore },
          engagement: { score: authorityScore },
        },
        findings,
        strengths: strengths.slice(0, 10),
        weaknesses: weaknesses.slice(0, 10),
        criticalIssues,
        metadata: {
          analyzedUrl: `https://www.linkedin.com/in/${profileId}/`,
          analysisDate: new Date().toISOString(),
          duration: Math.round((Date.now() - startTime) / 1000),
          dataSources: ["LinkedIn Public Profile Data", "Meta Tags Extraction", "Keyword Analysis"],
          limitations: [
            "Based on publicly available LinkedIn data only",
            "LinkedIn heavily restricts automated access",
            "Follower/connection counts may require login",
            "Full profile details require authentication",
          ],
          methodologyVersion: "3.0.0",
        },
      },
    });
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

function formatNumber(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return n.toString();
}