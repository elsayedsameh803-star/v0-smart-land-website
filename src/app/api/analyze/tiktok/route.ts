import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { url, locale } = await request.json();
    if (!url) {
      return NextResponse.json({ error: "URL required" }, { status: 400 });
    }

    // Extract TikTok username/handle from URL
    const handle = extractTikTokHandle(url);
    if (!handle) {
      return NextResponse.json({ error: "Invalid TikTok URL" }, { status: 400 });
    }

    const startTime = Date.now();
    const cleanHandle = handle.replace(/^@/, "");

    // ===== 1. Try TikTok oembed API first (official, reliable) =====
    let username = cleanHandle;
    let displayName = cleanHandle;
    let bio = "";
    let verified = false;
    let isPrivate = false;
    let avatarUrl = null;
    let following = 0;
    let followers = 0;
    let likes = 0;
    let videoCount = 0;
    let totalVideos = 0;
    let videos: any[] = [];
    let metaTitle = null;
    let metaDescription = null;
    let metaImage = null;
    let profileHtml = "";

    try {
      const oembedRes = await fetch(`https://www.tiktok.com/oembed?url=https://www.tiktok.com/@${cleanHandle}`, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
          "Accept": "application/json",
        },
      });

      if (oembedRes.ok) {
        const oembedData = await oembedRes.json();
        if (oembedData.author_name) {
          displayName = oembedData.author_name;
        }
        if (oembedData.author_url) {
          const urlMatch = oembedData.author_url.match(/@([a-zA-Z0-9_\.]+)/i);
          if (urlMatch) username = urlMatch[1];
        }
        if (oembedData.title) {
          metaTitle = oembedData.title;
        }
        if (oembedData.thumbnail_url) {
          avatarUrl = oembedData.thumbnail_url;
          metaImage = oembedData.thumbnail_url;
        }
      }
    } catch {}

    // ===== 2. Try to fetch TikTok profile page for more data =====
    try {
      const profileRes = await fetch(`https://www.tiktok.com/@${cleanHandle}`, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9,ar;q=0.8",
          "Accept-Encoding": "gzip, deflate, br",
          "Sec-Fetch-Dest": "document",
          "Sec-Fetch-Mode": "navigate",
          "Sec-Fetch-Site": "none",
          "Referer": "https://www.tiktok.com/",
          "Cache-Control": "no-cache",
        },
        redirect: "follow",
      });

      if (profileRes.ok) {
        profileHtml = await profileRes.text();

        // Extract REAL data from TikTok page JSON
        const jsonData = extractTikTokJson(profileHtml);

        // Get profile info
        const profileData = jsonData?.__DEFAULT_SCOPE__?.["webapp.user-detail"]?.userInfo?.user || null;
        const statsData = jsonData?.__DEFAULT_SCOPE__?.["webapp.user-detail"]?.userInfo?.stats || null;
        const postsData = jsonData?.__DEFAULT_SCOPE__?.["webapp.user-detail"]?.post || null;

        if (profileData?.uniqueId) username = profileData.uniqueId;
        if (profileData?.nickname) displayName = profileData.nickname;
        if (profileData?.signature) bio = profileData.signature;
        if (profileData?.verified !== undefined) verified = profileData.verified;
        if (profileData?.privateAccount !== undefined) isPrivate = profileData.privateAccount;
        if (profileData?.avatarLarger) avatarUrl = profileData.avatarLarger;
        else if (profileData?.avatarMedium) avatarUrl = profileData.avatarMedium;
        else if (profileData?.avatarThumb) avatarUrl = profileData.avatarThumb;
        if (statsData?.followingCount !== undefined) following = statsData.followingCount;
        if (statsData?.followerCount !== undefined) followers = statsData.followerCount;
        if (statsData?.heartCount !== undefined) likes = statsData.heartCount;
        if (statsData?.videoCount !== undefined) videoCount = statsData.videoCount;
        if (postsData?.videos?.length) {
          totalVideos = postsData.videos.length;
          videos = postsData.videos;
        }

        // Extract from meta tags
        metaTitle = profileHtml.match(/<meta[^>]+property=["']og:title["'][^>]*content=["']([^"']+)["']/i)?.[1] || metaTitle;
        metaDescription = profileHtml.match(/<meta[^>]+name=["']description["'][^>]*content=["']([^"']+)["']/i)?.[1] || metaDescription;
        metaImage = profileHtml.match(/<meta[^>]+property=["']og:image["'][^>]*content=["']([^"']+)["']/i)?.[1] || metaImage;
      }
    } catch {}

    // Extract hashtags from bio
    const bioHashtags = bio.match(/#[a-zA-Z0-9_]+/g) || [];

    // Extract links from bio
    const bioLinks = bio.match(/https?:\/\/[^\s]+/g) || [];

    // ===== 3. Fetch real follower trends from profile page =====
    // Get video engagement data from actual posts
    let totalViews = 0;
    let totalLikes = 0;
    let totalComments = 0;
    let totalShares = 0;
    const videoSamples = [];

    for (const video of videos.slice(0, 10)) {
      const videoUrl = `https://www.tiktok.com/@${cleanHandle}/video/${video.id}`;
      const vStats = video.stats || {};
      const vViews = vStats.playCount || 0;
      const vLikes = vStats.diggCount || 0;
      const vComments = vStats.commentCount || 0;
      const vShares = vStats.shareCount || 0;

      totalViews += vViews;
      totalLikes += vLikes;
      totalComments += vComments;
      totalShares += vShares;

      if (videoSamples.length < 5) {
        videoSamples.push({
          id: video.id,
          title: video.title || video.desc || "",
          views: vViews,
          likes: vLikes,
          comments: vComments,
          shares: vShares,
          duration: video.duration || 0,
          url: videoUrl,
          cover: video.cover || video.originCover || null,
        });
      }
    }

    // ===== 4. Calculate REAL metrics =====
    const sampleCount = Math.max(videoSamples.length, 1);
    const avgViewsPerVideo = totalVideos > 0 ? Math.round(totalViews / sampleCount) : 0;
    const avgEngagementRate = totalViews > 0 ? ((totalLikes + totalComments + totalShares) / totalViews) * 100 : 0;
    const videoPostingFrequency = totalVideos > 0 ? totalVideos / 30 : 0; // videos per month approx

    // ===== 5. SCORE CALCULATION (based on real data only) =====

    // Profile Quality Score
    let profileScore = 0;
    if (displayName && displayName.length > 0) profileScore += 15;
    if (bio && bio.length >= 30) profileScore += 20;
    else if (bio && bio.length >= 10) profileScore += 12;
    else if (bio && bio.length > 0) profileScore += 5;
    if (avatarUrl) profileScore += 15;
    if (verified) profileScore += 20;
    if (bioHashtags.length >= 3) profileScore += 15;
    else if (bioHashtags.length >= 1) profileScore += 8;
    if (bioLinks.length > 0) profileScore += 15;
    profileScore = Math.min(100, profileScore);

    // Audience Growth Score
    let growthScore = 0;
    if (followers > 0) {
      if (followers >= 1000000) growthScore += 30;
      else if (followers >= 100000) growthScore += 24;
      else if (followers >= 10000) growthScore += 18;
      else if (followers >= 1000) growthScore += 12;
      else if (followers >= 100) growthScore += 6;
      else growthScore += 2;
    }
    if (following > 0 && followers > 0) {
      const ratio = following / followers;
      if (ratio < 0.1) growthScore += 15; // Good: follows few relative to followers
      else if (ratio < 0.5) growthScore += 10;
      else growthScore += 5;
    }
    if (likes > 0) {
      if (likes >= 1000000) growthScore += 25;
      else if (likes >= 100000) growthScore += 20;
      else if (likes >= 10000) growthScore += 15;
      else if (likes >= 1000) growthScore += 8;
      else growthScore += 3;
    }
    if (totalVideos > 0) {
      if (totalVideos >= 50) growthScore += 15;
      else if (totalVideos >= 20) growthScore += 10;
      else if (totalVideos >= 10) growthScore += 6;
      else growthScore += 3;
    }
    if (followers > 0 && likes > 0) {
      const likesPerFollower = likes / followers;
      if (likesPerFollower >= 10) growthScore += 15;
      else if (likesPerFollower >= 5) growthScore += 10;
      else if (likesPerFollower >= 1) growthScore += 5;
    }
    growthScore = Math.min(100, growthScore);

    // Content Engagement Score
    let engagementScore = 0;
    if (avgViewsPerVideo > 0) {
      if (avgViewsPerVideo >= 1000000) engagementScore += 30;
      else if (avgViewsPerVideo >= 100000) engagementScore += 24;
      else if (avgViewsPerVideo >= 10000) engagementScore += 18;
      else if (avgViewsPerVideo >= 1000) engagementScore += 12;
      else if (avgViewsPerVideo >= 100) engagementScore += 6;
      else engagementScore += 2;
    }
    if (avgEngagementRate >= 10) engagementScore += 30;
    else if (avgEngagementRate >= 5) engagementScore += 24;
    else if (avgEngagementRate >= 3) engagementScore += 18;
    else if (avgEngagementRate >= 1) engagementScore += 12;
    else if (avgEngagementRate > 0) engagementScore += 6;
    if (totalComments > 0) {
      const commentRate = totalComments > 0 ? (totalComments / sampleCount) : 0;
      if (commentRate >= 100) engagementScore += 20;
      else if (commentRate >= 10) engagementScore += 15;
      else if (commentRate >= 1) engagementScore += 8;
      else engagementScore += 3;
    }
    if (totalShares > 0) {
      const shareRate = totalShares / sampleCount;
      if (shareRate >= 50) engagementScore += 20;
      else if (shareRate >= 10) engagementScore += 15;
      else if (shareRate >= 1) engagementScore += 8;
      else engagementScore += 3;
    }
    engagementScore = Math.min(100, engagementScore);

    // Content Consistency Score
    let consistencyScore = 0;
    if (totalVideos >= 100) consistencyScore += 30;
    else if (totalVideos >= 50) consistencyScore += 24;
    else if (totalVideos >= 20) consistencyScore += 18;
    else if (totalVideos >= 10) consistencyScore += 12;
    else if (totalVideos >= 1) consistencyScore += 6;
    if (videoPostingFrequency >= 4) consistencyScore += 30;
    else if (videoPostingFrequency >= 2) consistencyScore += 24;
    else if (videoPostingFrequency >= 1) consistencyScore += 15;
    else if (videoPostingFrequency > 0) consistencyScore += 8;
    if (totalViews > 0 && followers > 0) {
      const viewsPerFollower = totalViews / followers;
      if (viewsPerFollower >= 50) consistencyScore += 40;
      else if (viewsPerFollower >= 20) consistencyScore += 30;
      else if (viewsPerFollower >= 10) consistencyScore += 20;
      else if (viewsPerFollower >= 5) consistencyScore += 10;
      else consistencyScore += 5;
    }
    consistencyScore = Math.min(100, consistencyScore);

    // SEO / Discoverability Score
    let seoScore = 0;
    if (username && username.length > 0) {
      seoScore += 15;
      if (username.length >= 5 && username.length <= 24) seoScore += 10;
    }
    if (displayName) seoScore += 10;
    if (bio && bio.length >= 30) seoScore += 15;
    if (bioHashtags.length >= 3) seoScore += 15;
    else if (bioHashtags.length >= 1) seoScore += 8;
    if (totalVideos > 0) seoScore += 15;
    if (followers > 1000) seoScore += 15;
    if (verified) seoScore += 15;
    seoScore = Math.min(100, seoScore);

    const overallScore = Math.round((profileScore + growthScore + engagementScore + consistencyScore + seoScore) / 5);

    // ===== 6. BUILD REAL FINDINGS =====
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

    // Profile findings
    if (!bio || bio.length < 10) {
      findings.push({
        category: "content", severity: "high",
        issue: `Bio is ${bio?.length || 0} characters - too short for good profile optimization`,
        issueAr: `الوصف الشخصي ${bio?.length || 0} حرف - قصير جداً لتحسين الملف الشخصي`,
        evidence: `Current bio: "${bio?.slice(0, 50) || "empty"}"`,
        evidenceAr: `الوصف الحالي: "${bio?.slice(0, 50) || "فارغ"}"`,
        whyItMatters: "A complete bio with keywords helps TikTok's algorithm understand your content and helps users decide to follow you",
        whyItMattersAr: "الوصف المكتمل مع الكلمات المفتاحية يساعد خوارزمية تيك توك على فهم محتواك ويساعد المستخدمين على اتخاذ قرار متابعتك",
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
        whyItMattersAr: "الهاشتاجات في الوصف تساعد على قابلية اكتشاف الملف في البحث وتوصيات المحتوى ذات الصلة",
        howToFix: "Add 3-5 relevant hashtags to your bio (e.g., #fitness #motivation #dailyvlog)",
        howToFixAr: "أضف 3-5 هاشتاجات ذات صلة إلى وصفك (مثل: #رياضة #تحفيز #يوميات)",
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
        whyItMatters: "Links in bio are the primary way TikTok creators direct traffic to their websites, other social media, or products",
        whyItMattersAr: "الروابط في الوصف هي الطريقة الرئيسية التي يستخدمها صناع المحتوى لتوجيه الزيارات إلى مواقعهم أو حساباتهم الأخرى أو منتجاتهم",
        howToFix: "Add links to your bio for your website, other social media profiles, or a Linktree/Beacons page",
        howToFixAr: "أضف روابط إلى وصفك للموقع الخاص بك أو حسابات أخرى أو صفحة Linktree/Beacons",
        expectedBenefit: "Traffic redirection to your website or other platforms - up to 10% of profile visitors",
        expectedBenefitAr: "توجيه الزيارات إلى موقعك أو منصات أخرى - تصل إلى 10% من زوار الملف"
      });
    }

    // Growth findings
    if (followers > 0 && likes === 0) {
      findings.push({
        category: "content", severity: "info",
        issue: "Like count is not accessible from public data for this profile",
        issueAr: "عدد الإعجابات غير متاح من البيانات العامة لهذا الملف",
        evidence: "TikTok did not expose total likes in the page data",
        evidenceAr: "تيك توك لم يعرض إجمالي الإعجابات في بيانات الصفحة",
        whyItMatters: "Likes indicate content quality and audience appreciation",
        whyItMattersAr: "الإعجابات تشير إلى جودة المحتوى وتقدير الجمهور",
        howToFix: "Content that resonates with your audience will naturally increase like count",
        howToFixAr: "المحتوى الذي يناسب جمهورك سيزيد عدد الإعجابات بشكل طبيعي",
        expectedBenefit: "Higher engagement metrics and improved algorithm recommendation",
        expectedBenefitAr: "مقاييس تفاعل أعلى وتحسين توصيات الخوارزمية"
      });
    }
    if (followers > 0 && videoCount > 0 && followers < videoCount * 10) {
      findings.push({
        category: "content", severity: "medium",
        issue: `Follower-to-video ratio is low (${followers} followers / ${videoCount} videos = ${(followers / Math.max(videoCount, 1)).toFixed(1)})`,
        issueAr: `نسبة المتابعين إلى الفيديوهات منخفضة (${followers} متابع / ${videoCount} فيديو = ${(followers / Math.max(videoCount, 1)).toFixed(1)})`,
        evidence: `Profile has ${followers} followers and ${videoCount} videos`,
        evidenceAr: `الملف لديه ${followers} متابع و${videoCount} فيديو`,
        whyItMatters: "Low follower-to-video ratio suggests content is not converting viewers to followers effectively",
        whyItMattersAr: "نسبة المتابعين إلى الفيديوهات المنخفضة تشير إلى أن المحتوى لا يحول المشاهدين إلى متابعين بشكل فعال",
        howToFix: "Add clear calls-to-action in videos, create compelling content hooks, and maintain consistent posting schedule",
        howToFixAr: "أضف دعوات واضحة لاتخاذ إجراء في الفيديوهات، أنشئ محتوى جذاباً، وحافظ على جدول نشر منتظم",
        expectedBenefit: "Higher follower conversion rate and faster audience growth",
        expectedBenefitAr: "نسبة تحويل أعلى للمتابعين ونمو أسرع للجمهور"
      });
    }

    // Engagement findings
    if (totalViews > 0 && avgEngagementRate < 3) {
      findings.push({
        category: "engagement", severity: "medium",
        issue: `Low engagement rate (${avgEngagementRate.toFixed(1)}%). TikTok average is 3-10%`,
        issueAr: `نسبة تفاعل منخفضة (${avgEngagementRate.toFixed(1)}%). متوسط تيك توك هو 3-10%`,
        evidence: `Average engagement rate across ${sampleCount} sampled videos: ${avgEngagementRate.toFixed(1)}%`,
        evidenceAr: `متوسط نسبة التفاعل عبر ${sampleCount} فيديوهات مأخوذة: ${avgEngagementRate.toFixed(1)}%`,
        whyItMatters: "Engagement rate is TikTok's primary ranking signal. Low engagement means the algorithm won't recommend your content",
        whyItMattersAr: "نسبة التفاعل هي إشارة الترتيب الأساسية في تيك توك. التفاعل المنخفض يعني أن الخوارزمية لن توصي بمحتواك",
        howToFix: "Create content that encourages comments and shares - ask questions, use trending sounds, create relatable content",
        howToFixAr: "أنشئ محتوى يشجع على التعليقات والمشاركة - اطرح أسئلة، استخدم أصوات رائجة، أنشئ محتوى يلمس الجمهور",
        expectedBenefit: "Higher reach through algorithm recommendations and increased engagement metrics",
        expectedBenefitAr: "وصول أعلى من خلال توصيات الخوارزمية وزيادة مقاييس التفاعل"
      });
    }
    if (totalViews === 0 && videoSamples.length === 0) {
      findings.push({
        category: "engagement", severity: "info",
        issue: "No video engagement data available - account may be new or content is not publicly accessible",
        issueAr: "لا توجد بيانات تفاعل للفيديوهات - قد يكون الحساب جديداً أو المحتوى غير متاح للعامة",
        evidence: "No public videos found with engagement data",
        evidenceAr: "لم يتم العثور على فيديوهات عامة مع بيانات تفاعل",
        whyItMatters: "Without engagement data, we cannot assess content performance",
        whyItMattersAr: "بدون بيانات التفاعل، لا يمكننا تقييم أداء المحتوى",
        howToFix: "Post regular content with trending sounds and hashtags to build audience engagement",
        howToFixAr: "انشر محتوى منتظماً مع أصوات رائجة وهاشتاجات لبناء تفاعل الجمهور",
        expectedBenefit: "Build engagement baseline and algorithm learning signal",
        expectedBenefitAr: "بناء خط أساس للتفاعل وإشارة تعلم للخوارزمية"
      });
    }

    // Consistency findings
    if (totalVideos > 0 && videoPostingFrequency < 1) {
      findings.push({
        category: "content", severity: "medium",
        issue: `Low posting frequency (approximately ${videoPostingFrequency.toFixed(1)} videos/month). TikTok recommends 1-4 posts/day`,
        issueAr: `تكرار نشر منخفض (حوالي ${videoPostingFrequency.toFixed(1)} فيديو/شهر). تيك توك يوصي بـ 1-4 منشورات يومياً`,
        evidence: `Profile has ${totalVideos} total videos. Estimated posting frequency: ${videoPostingFrequency.toFixed(1)} videos/month`,
        evidenceAr: `الملف لديه ${totalVideos} فيديو. التكرار التقديري للنشر: ${videoPostingFrequency.toFixed(1)} فيديو/شهر`,
        whyItMatters: "Consistent posting keeps your audience engaged and signals activity to TikTok's algorithm",
        whyItMattersAr: "النشر المنتظم يحافظ على تفاعل جمهورك ويرسل إشارة نشاط لخوارزمية تيك توك",
        howToFix: "Aim for at least 1 video per day. Create a content calendar and batch-create content to stay consistent",
        howToFixAr: "استهدف نشر فيديو واحد يومياً على الأقل. أنشئ تقويماً للمحتوى وحضّر المحتوى دفعة واحدة للالتزام بالانتظام",
        expectedBenefit: "Improved algorithm support, higher reach, and faster audience growth",
        expectedBenefitAr: "دعم أفضل من الخوارزمية، وصول أعلى، ونمو أسرع للجمهور"
      });
    }
    if (videoSamples.length > 0 && avgViewsPerVideo > 0 && followers > 0 && avgViewsPerVideo > followers) {
      findings.push({
        category: "content", severity: "low",
        issue: `Strong views-to-followers ratio (${avgViewsPerVideo.toLocaleString()} avg views vs ${followers.toLocaleString()} followers)`,
        issueAr: `نسبة مشاهدات قوية إلى المتابعين (${avgViewsPerVideo.toLocaleString()} مشاهدات في المتوسط مقابل ${followers.toLocaleString()} متابع)`,
        evidence: `Average views (${avgViewsPerVideo.toLocaleString()}) exceed follower count (${followers.toLocaleString()})`,
        evidenceAr: `متوسط المشاهدات (${avgViewsPerVideo.toLocaleString()}) يتجاوز عدد المتابعين (${followers.toLocaleString()})`,
        whyItMatters: "This suggests strong algorithmic reach - content is being recommended to non-followers",
        whyItMattersAr: "هذا يشير إلى وصول خوارزمي قوي - المحتوى يتم التوصية به لغير المتابعين",
        howToFix: "Capitalize on this momentum - post consistently and use trending formats to convert viewers into followers",
        howToFixAr: "استغل هذا الزخم - انشر بشكل منتظم واستخدم صيغ رائجة لتحويل المشاهدين إلى متابعين",
        expectedBenefit: "Continue growing reach and convert more viewers to followers",
        expectedBenefitAr: "مواصلة نمو الوصول وتحويل المزيد من المشاهدين إلى متابعين"
      });
    }

    // SEO findings
    if (!verified && followers > 100000) {
      findings.push({
        category: "seo", severity: "low",
        issue: `Profile has ${followers.toLocaleString()} followers but is not verified. Verification could boost credibility`,
        issueAr: `الملف لديه ${followers.toLocaleString()} متابع لكنه غير موثق. التوثيق قد يعزز المصداقية`,
        evidence: `Followers: ${followers.toLocaleString()}, Verified: false`,
        evidenceAr: `المتابعون: ${followers.toLocaleString()}، موثق: لا`,
        whyItMatters: "Verification badges increase trust and can improve profile visibility in search and recommendations",
        whyItMattersAr: "شارات التوثيق تزيد الثقة ويمكن أن تحسن ظهور الملف في البحث والتوصيات",
        howToFix: "Apply for TikTok verification through the app settings - you typically need consistent press mentions and a complete profile",
        howToFixAr: "قدم طلب توثيق تيك توك من خلال إعدادات التطبيق - عادة تحتاج إلى ذكر إعلامي مستمر وملف مكتمل",
        expectedBenefit: "Increased credibility, trust, and profile visibility",
        expectedBenefitAr: "زيادة المصداقية والثقة وظهور الملف"
      });
    }

    // ===== 7. BUILD STRENGTHS & WEAKNESSES =====
    const strengths: string[] = [];
    const weaknesses: string[] = [];

    if (displayName) strengths.push(locale === "ar" ? `✓ اسم العرض: ${displayName}` : `✓ Display name: ${displayName}`);
    if (bio && bio.length >= 10) strengths.push(locale === "ar" ? `✓ وصف شخصي موجود (${bio.length} حرف)` : `✓ Bio present (${bio.length} chars)`);
    if (avatarUrl) strengths.push(locale === "ar" ? "✓ صورة الملف الشخصي موجودة" : "✓ Profile avatar present");
    if (verified) strengths.push(locale === "ar" ? "✓ حساب موثق" : "✓ Verified account");
    if (bioHashtags.length > 0) strengths.push(locale === "ar" ? `✓ ${bioHashtags.length} هاشتاج في الوصف` : `✓ ${bioHashtags.length} hashtags in bio`);
    if (bioLinks.length > 0) strengths.push(locale === "ar" ? `✓ ${bioLinks.length} روابط في الوصف` : `✓ ${bioLinks.length} links in bio`);
    if (followers > 0) strengths.push(locale === "ar" ? `✓ ${formatNumber(followers)} متابع` : `✓ ${formatNumber(followers)} followers`);
    if (following > 0) strengths.push(locale === "ar" ? `✓ يتابع ${formatNumber(following)}` : `✓ Following ${formatNumber(following)}`);
    if (likes > 0) strengths.push(locale === "ar" ? `✓ ${formatNumber(likes)} إعجاب` : `✓ ${formatNumber(likes)} likes`);
    if (totalVideos > 0) strengths.push(locale === "ar" ? `✓ ${totalVideos} فيديو` : `✓ ${totalVideos} videos`);
    if (avgViewsPerVideo > 0) strengths.push(locale === "ar" ? `✓ ${formatNumber(avgViewsPerVideo)} متوسط المشاهدات/فيديو` : `✓ ${formatNumber(avgViewsPerVideo)} avg views/video`);
    if (avgEngagementRate > 0) strengths.push(locale === "ar" ? `✓ نسبة تفاعل: ${avgEngagementRate.toFixed(1)}%` : `✓ Engagement rate: ${avgEngagementRate.toFixed(1)}%`);
    if (isPrivate) strengths.push(locale === "ar" ? "⚠️ حساب خاص - المحتوى غير متاح للعامة" : "⚠️ Private account - content not publicly available");
    if (metaTitle) strengths.push(locale === "ar" ? `✓ العنوان: ${metaTitle.slice(0, 50)}` : `✓ Title: ${metaTitle.slice(0, 50)}`);

    for (const f of findings) {
      if (f.severity === "critical" || f.severity === "high") {
        weaknesses.push(locale === "ar" ? f.issueAr : f.issue);
      }
    }

    const criticalIssues = findings.filter(f => f.severity === "critical" || f.severity === "high");

    return NextResponse.json({
      success: true,
      data: {
        platform: "tiktok",
        url: `https://www.tiktok.com/@${cleanHandle}`,
        handle: `@${username}`,
        displayName,
        bio: bio?.slice(0, 200) || null,
        bioHashtags,
        bioLinks,
        verified,
        isPrivate,
        avatarUrl,
        followers,
        following,
        likes,
        videoCount,
        totalVideos,
        avgViewsPerVideo,
        avgEngagementRate: Math.round(avgEngagementRate * 100) / 100,
        videoPostingFrequency: Math.round(videoPostingFrequency * 100) / 100,
        videoSamples,
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
          analyzedUrl: `https://www.tiktok.com/@${cleanHandle}`,
          analysisDate: new Date().toISOString(),
          duration: Math.round((Date.now() - startTime) / 1000),
          dataSources: ["TikTok Profile Page", "Video Metadata Extraction", "Bio Analysis", "Engagement Metrics Calculation"],
          limitations: [
            "Based on publicly available TikTok data only",
            "TikTok may rate-limit or block automated requests",
            "Some metrics may be approximate due to TikTok's client-side rendering",
            "Video engagement is sampled from the most recent posts",
            "Follower counts are as displayed publicly at time of analysis",
          ],
          methodologyVersion: "3.0.0",
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to analyze TikTok profile" },
      { status: 500 }
    );
  }
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function extractTikTokHandle(url: string): string | null {
  // Pattern: tiktok.com/@username
  const match = url.match(/(?:tiktok\.com\/)(?:@)?([a-zA-Z0-9_\.]{2,24})/i);
  if (match) return match[1].replace(/\.$/, "");

  // Just a username
  const clean = url.replace(/^https?:\/\//, "").replace(/^www\./, "");
  if (/^@?[a-zA-Z0-9_\.]{2,24}$/.test(clean)) {
    return clean.replace(/^@/, "").replace(/\.$/, "");
  }

  return null;
}

function extractTikTokJson(html: string): any {
  // Try to find the main JSON data in script tags
  const scripts = html.match(/<script[^>]*id=["']__UNIVERSAL_DATA_FOR_REHYDRATION__["'][^>]*>([\s\S]*?)<\/script>/i);
  if (scripts && scripts[1]) {
    try {
      return JSON.parse(scripts[1]);
    } catch {}
  }

  // Try NEXT_DATA (TikTok sometimes uses this)
  const nextData = html.match(/<script[^>]*id=["']__NEXT_DATA__["'][^>]*>([\s\S]*?)<\/script>/i);
  if (nextData && nextData[1]) {
    try {
      return JSON.parse(nextData[1]);
    } catch {}
  }

  // Try to find any JSON-LD
  const jsonLd = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i);
  if (jsonLd && jsonLd[1]) {
    try {
      return JSON.parse(jsonLd[1]);
    } catch {}
  }

  // Search for user data in inline scripts
  const userMatch = html.match(/"userInfo":\{[^}]*"uniqueId":"([^"]+)"/);
  if (userMatch) return { __DEFAULT_SCOPE__: { "webapp.user-detail": { userInfo: { user: { uniqueId: userMatch[1] } } } } };

  return null;
}

function formatNumber(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return n.toString();
}