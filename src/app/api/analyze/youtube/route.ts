import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { url, locale } = await request.json();
    if (!url) {
      return NextResponse.json({ error: "URL required" }, { status: 400 });
    }

    const videoId = extractVideoId(url);
    if (!videoId) {
      return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 });
    }

    const startTime = Date.now();

    // Fetch YouTube page publicly - real data extraction
    const res = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: { 
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    if (!res.ok) {
      return NextResponse.json({ 
        success: false, 
        error: `YouTube returned status ${res.status}` 
      }, { status: 502 });
    }

    const html = await res.text();
    const lowerHtml = html.toLowerCase();

    // Extract real public data from YouTube page
    const title = html.match(/<title>([^<]+)<\/title>/i)?.[1]?.replace(" - YouTube", "").trim() || null;
    const viewsMatch = html.match(/"viewCount":"(\d+)"/);
    const likesMatch = html.match(/"likeCount":"(\d+)"/);
    const subsMatch = html.match(/"subscriberCountText":\{"simpleText":"([^"]+)"/);
    const descMatch = html.match(/"shortDescription":"([^"]+)"/);
    const channelNameMatch = html.match(/"author":"([^"]+)"/);
    const channelIdMatch = html.match(/"channelId":"([^"]+)"/);
    const commentCountMatch = html.match(/"commentCount":"(\d+)"/);
    const durationMatch = html.match(/"lengthSeconds":"(\d+)"/);
    const categoryMatch = html.match(/"category":"([^"]+)"/);
    const tagsMatch = html.match(/"keywords":\[([^\]]+)\]/);

    const views = viewsMatch ? parseInt(viewsMatch[1]) : 0;
    const likes = likesMatch ? parseInt(likesMatch[1]) : 0;
    const commentCount = commentCountMatch ? parseInt(commentCountMatch[1]) : 0;
    const duration = durationMatch ? parseInt(durationMatch[1]) : 0;
    const subscriberText = subsMatch?.[1] || null;
    const description = descMatch?.[1]?.replace(/\\n/g, " ").replace(/\\"/g, '"') || null;
    const channelName = channelNameMatch?.[1] || null;
    const channelId = channelIdMatch?.[1] || null;
    const category = categoryMatch?.[1] || null;
    const tags = tagsMatch ? tagsMatch[1].split(",").map((t: string) => t.trim().replace(/"/g, "")).filter(Boolean) : [];

    // Extract hashtags from description
    const hashtags = description ? description.match(/#[a-zA-Z0-9_]+/g) || [] : [];

    // Calculate engagement rate (real metric)
    const engagementRate = views > 0 ? ((likes + commentCount) / views) * 100 : 0;

    // ===== SCORE CALCULATION BASED ON REAL DATA =====

    // Title Optimization Score
    let titleScore = 0;
    if (title) {
      titleScore += 20;
      const titleLen = title.length;
      if (titleLen >= 30 && titleLen <= 60) titleScore += 30;
      else if (titleLen >= 20) titleScore += 20;
      else if (titleLen >= 10) titleScore += 10;
      if (hashtags.some(t => title.toLowerCase().includes(t))) titleScore += 10;
    }

    // Description Quality Score
    let descScore = 0;
    if (description) {
      descScore += 15;
      const descLen = description.length;
      if (descLen >= 200) descScore += 25;
      else if (descLen >= 100) descScore += 18;
      else if (descLen >= 50) descScore += 10;
      else descScore += 5;
      if (hashtags.length >= 3) descScore += 10;
      else if (hashtags.length >= 1) descScore += 5;
      if (description.includes("http") || description.includes("link")) descScore += 10;
    }

    // Engagement Score
    let engagementScore = 0;
    if (views > 0) {
      if (views >= 1000000) engagementScore += 20;
      else if (views >= 100000) engagementScore += 15;
      else if (views >= 10000) engagementScore += 10;
      else if (views >= 1000) engagementScore += 5;
      else engagementScore += 2;
    }
    if (likes > 0) {
      if (likes >= 10000) engagementScore += 15;
      else if (likes >= 1000) engagementScore += 10;
      else if (likes >= 100) engagementScore += 5;
      else engagementScore += 2;
    }
    if (engagementRate >= 5) engagementScore += 20;
    else if (engagementRate >= 2) engagementScore += 15;
    else if (engagementRate >= 1) engagementScore += 10;
    else engagementScore += 5;
    if (commentCount > 0) {
      if (commentCount >= 1000) engagementScore += 15;
      else if (commentCount >= 100) engagementScore += 10;
      else engagementScore += 5;
    }

    // Content Score
    let contentScore = 0;
    if (description) contentScore += 15;
    if (tags.length >= 5) contentScore += 15;
    else if (tags.length >= 3) contentScore += 10;
    else if (tags.length >= 1) contentScore += 5;
    if (hashtags.length >= 3) contentScore += 10;
    else if (hashtags.length >= 1) contentScore += 5;
    if (category) contentScore += 10;
    if (duration > 0) {
      if (duration >= 480 && duration <= 1200) contentScore += 20; // 8-20 min ideal
      else if (duration >= 120) contentScore += 10; // 2+ min
      else contentScore += 5;
    }
    if (channelName) contentScore += 10;

    // SEO Score
    let seoScore = 0;
    if (title) {
      seoScore += 15;
      if (title.length >= 30 && title.length <= 60) seoScore += 15;
    }
    if (description) seoScore += 15;
    if (tags.length > 0) seoScore += 15;
    if (hashtags.length > 0) seoScore += 10;
    if (category) seoScore += 10;
    if (channelName) seoScore += 10;
    if (views > 1000) seoScore += 10;

    // Cap all scores
    titleScore = Math.min(100, titleScore);
    descScore = Math.min(100, descScore);
    engagementScore = Math.min(100, engagementScore);
    contentScore = Math.min(100, contentScore);
    seoScore = Math.min(100, seoScore);

    const overallScore = Math.round((titleScore + descScore + engagementScore + contentScore + seoScore) / 5);

    // Build real findings
    const findings: Array<{
      category: string;
      severity: string;
      issue: string;
      issueAr: string;
      evidence: string;
      evidenceAr: string;
    }> = [];

    if (title && title.length < 20) {
      findings.push({
        category: "seo", severity: "high",
        issue: `Video title is too short (${title.length} chars). YouTube recommends 30-60 characters for optimal SEO`,
        issueAr: `عنوان الفيديو قصير جداً (${title.length} حرف). يوتيوب يوصي بـ 30-60 حرفاً لتحسين SEO`,
        evidence: `${locale === "ar" ? "العنوان الحالي:" : "Current title:"} "${title}"`,
        evidenceAr: `${locale === "ar" ? "العنوان الحالي:" : "Current title:"} "${title}"`,
      });
    }
    if (!description || description.length < 100) {
      findings.push({
        category: "content", severity: "medium",
        issue: `${description ? "Description is too short" : "No video description"} (${description?.length || 0} chars). Add detailed description with keywords`,
        issueAr: `${description ? "الوصف قصير جداً" : "لا يوجد وصف للفيديو"} (${description?.length || 0} حرف). أضف وصفاً مفصلاً مع كلمات مفتاحية`,
        evidence: locale === "ar" ? "الوصف الجيد يحسن ترتيب البحث" : "Good description improves search ranking",
        evidenceAr: locale === "ar" ? "الوصف الجيد يحسن ترتيب البحث" : "Good description improves search ranking",
      });
    }
    if (tags.length < 3) {
      findings.push({
        category: "seo", severity: "medium",
        issue: `Only ${tags.length} tag(s) found. Add 5-10 relevant tags for better discoverability`,
        issueAr: `تم العثور على ${tags.length} علامة(علامات) فقط. أضف 5-10 علامات ذات صلة لتحسين قابلية الاكتشاف`,
        evidence: locale === "ar" ? "العلامات تساعد يوتيوب في فهم محتوى الفيديو" : "Tags help YouTube understand your video content",
        evidenceAr: locale === "ar" ? "العلامات تساعد يوتيوب في فهم محتوى الفيديو" : "Tags help YouTube understand your video content",
      });
    }
    if (hashtags.length === 0) {
      findings.push({
        category: "seo", severity: "low",
        issue: "No hashtags found in description. Hashtags improve video discoverability",
        issueAr: "لا توجد هاشتاجات في الوصف. الهاشتاجات تحسن قابلية اكتشاف الفيديو",
        evidence: locale === "ar" ? "أضف 3-5 هاشتاجات ذات صلة" : "Add 3-5 relevant hashtags",
        evidenceAr: locale === "ar" ? "أضف 3-5 هاشتاجات ذات صلة" : "Add 3-5 relevant hashtags",
      });
    }
    if (views > 0 && engagementRate < 2) {
      findings.push({
        category: "content", severity: "medium",
        issue: `Low engagement rate (${engagementRate.toFixed(1)}%). Consider improving content quality and call-to-action`,
        issueAr: `نسبة تفاعل منخفضة (${engagementRate.toFixed(1)}%). فكر في تحسين جودة المحتوى والدعوة لاتخاذ إجراء`,
        evidence: locale === "ar" ? `نسبة التفاعل المثالية هي 5-10%` : `Ideal engagement rate is 5-10%`,
        evidenceAr: locale === "ar" ? `نسبة التفاعل المثالية هي 5-10%` : `Ideal engagement rate is 5-10%`,
      });
    }

    const strengths: string[] = [];
    if (title) strengths.push(locale === "ar" ? `✓ عنوان الفيديو: "${title.slice(0, 50)}"` : `✓ Video title: "${title.slice(0, 50)}"`);
    if (description) strengths.push(locale === "ar" ? `✓ وصف الفيديو موجود (${description.length} حرف)` : `✓ Video description found (${description.length} chars)`);
    if (views > 0) strengths.push(locale === "ar" ? `✓ ${formatNumber(views)} مشاهدة` : `✓ ${formatNumber(views)} views`);
    if (likes > 0) strengths.push(locale === "ar" ? `✓ ${formatNumber(likes)} إعجاب` : `✓ ${formatNumber(likes)} likes`);
    if (channelName) strengths.push(locale === "ar" ? `✓ القناة: ${channelName}` : `✓ Channel: ${channelName}`);
    if (tags.length >= 3) strengths.push(locale === "ar" ? `✓ ${tags.length} علامة مستخدمة` : `✓ ${tags.length} tags used`);
    if (hashtags.length > 0) strengths.push(locale === "ar" ? `✓ ${hashtags.length} هاشتاج` : `✓ ${hashtags.length} hashtags`);
    if (category) strengths.push(locale === "ar" ? `✓ الفئة: ${category}` : `✓ Category: ${category}`);
    if (duration > 0) strengths.push(locale === "ar" ? `✓ المدة: ${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')}` : `✓ Duration: ${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')}`);

    const weaknesses = findings.filter(f => f.severity === "critical" || f.severity === "high").map(f => locale === "ar" ? f.issueAr : f.issue);
    const criticalIssues = findings.filter(f => f.severity === "critical" || f.severity === "high");

    return NextResponse.json({
      success: true,
      data: {
        platform: "youtube",
        url: `https://youtube.com/watch?v=${videoId}`,
        videoId,
        title,
        description: description?.slice(0, 200) || null,
        views,
        likes,
        commentCount,
        subscribers: subscriberText,
        channelName,
        channelId,
        category,
        duration,
        tags: tags.slice(0, 10),
        hashtags,
        engagementRate: Math.round(engagementRate * 100) / 100,
        overallScore,
        scores: {
          seo: { score: seoScore },
          content: { score: contentScore },
          titleOptimization: { score: titleScore },
          descriptionQuality: { score: descScore },
          engagement: { score: engagementScore },
        },
        findings,
        strengths: strengths.slice(0, 8),
        weaknesses: weaknesses.slice(0, 5),
        criticalIssues,
        metadata: {
          analyzedUrl: `https://youtube.com/watch?v=${videoId}`,
          analysisDate: new Date().toISOString(),
          duration: Math.round((Date.now() - startTime) / 1000),
          dataSources: ["YouTube Public Page Data", "Video Metadata Extraction"],
          limitations: [
            "Based on publicly available YouTube data only",
            "Some metrics may not be available for all videos",
          ],
          methodologyVersion: "3.0.0",
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message || "Failed to analyze YouTube video" 
    }, { status: 500 });
  }
}

function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

function formatNumber(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return n.toString();
}