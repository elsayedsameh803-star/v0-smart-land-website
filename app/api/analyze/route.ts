import { z } from "zod"

const analysisSchema = z.object({
  url: z.string().url(),
  type: z.enum(["website", "youtube", "instagram", "facebook", "tiktok"]),
})

type MetricStatus = "good" | "medium" | "bad"
type IssueType = "error" | "warning" | "success"

interface Analysis {
  score: number
  metrics: { label: string; value: string; status: MetricStatus }[]
  issues: { type: IssueType; message: string }[]
  recommendations: string[]
  aiInsights: string
}

const requestTimeout = 10_000

export async function POST(req: Request) {
  try {
    const input = analysisSchema.parse(await req.json())
    const analysis = await analyze(input.type, input.url)

    return Response.json({
      success: true,
      analysis,
      analyzedAt: new Date().toISOString(),
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ success: false, error: "رابط أو نوع تحليل غير صالح" }, { status: 400 })
    }

    console.error("Analysis error:", error)
    const message = error instanceof Error ? error.message : "تعذر إكمال التحليل"
    return Response.json({ success: false, error: message }, { status: 502 })
  }
}

async function analyze(type: z.infer<typeof analysisSchema>["type"], url: string): Promise<Analysis> {
  switch (type) {
    case "website":
      return analyzeWebsite(url)
    case "youtube":
      return analyzeYouTube(url)
    case "instagram":
      return analyzeMeta(url, "instagram")
    case "facebook":
      return analyzeMeta(url, "facebook")
    case "tiktok":
      return analyzeTikTok(url)
  }
}

async function analyzeWebsite(url: string): Promise<Analysis> {
  const target = assertPublicUrl(url)
  const started = Date.now()
  const response = await fetchWithTimeout(target)
  const html = await response.text()
  const elapsed = Date.now() - started
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim()
  const description = /<meta[^>]+name=["']description["'][^>]+content=["'][^"']+/i.test(html)
  const viewport = /<meta[^>]+name=["']viewport["'][^>]+content=["'][^"']+/i.test(html)
  const hasH1 = /<h1(?:\s|>)/i.test(html)
  const https = target.protocol === "https:"
  const score = Math.round(
    [response.ok, elapsed < 2_000, Boolean(title), description, viewport, hasH1, https]
      .filter(Boolean).length / 7 * 100,
  )

  return {
    score,
    metrics: [
      { label: "حالة الاستجابة", value: `${response.status} ${response.statusText}`, status: response.ok ? "good" : "bad" },
      { label: "زمن الاستجابة", value: `${elapsed}ms`, status: elapsed < 2_000 ? "good" : "medium" },
      { label: "عنوان الصفحة", value: title ? "موجود" : "غير موجود", status: title ? "good" : "bad" },
      { label: "وصف SEO", value: description ? "موجود" : "غير موجود", status: description ? "good" : "medium" },
      { label: "توافق الجوال", value: viewport ? "موجود" : "غير موجود", status: viewport ? "good" : "bad" },
      { label: "HTTPS", value: https ? "مفعل" : "غير مفعل", status: https ? "good" : "bad" },
    ],
    issues: [
      ...(response.ok ? [{ type: "success" as const, message: "الموقع يستجيب بنجاح" }] : [{ type: "error" as const, message: `الموقع أعاد الحالة ${response.status}` }]),
      ...(!title ? [{ type: "warning" as const, message: "لا يوجد عنوان HTML واضح" }] : []),
      ...(!description ? [{ type: "warning" as const, message: "أضف وصفاً تعريفياً لتحسين ظهور الصفحة في البحث" }] : []),
      ...(!viewport ? [{ type: "warning" as const, message: "وسم viewport غير موجود" }] : []),
    ],
    recommendations: [
      ...(!description ? ["إضافة meta description فريد لكل صفحة"] : []),
      ...(!hasH1 ? ["إضافة عنوان H1 يصف محتوى الصفحة"] : []),
      ...(!https ? ["تفعيل HTTPS وإعادة التوجيه من HTTP"] : []),
    ],
    aiInsights: "تم استخراج هذه النتائج مباشرة من استجابة الموقع، وليست أرقاماً تجريبية.",
  }
}

async function analyzeYouTube(url: string): Promise<Analysis> {
  const apiKey = process.env.YOUTUBE_API_KEY
  if (!apiKey) throw new Error("YOUTUBE_API_KEY غير مضبوط في إعدادات الخادم")
  const parsed = new URL(url)
  const videoId = parsed.searchParams.get("v") || parsed.pathname.match(/\/shorts\/([^/]+)/)?.[1]
  const channelId = parsed.pathname.match(/\/channel\/([^/]+)/)?.[1]
  const endpoint = videoId
    ? `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${encodeURIComponent(videoId)}&key=${encodeURIComponent(apiKey)}`
    : channelId
      ? `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${encodeURIComponent(channelId)}&key=${encodeURIComponent(apiKey)}`
      : `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(parsed.pathname.replace(/^\/@?/, ""))}&maxResults=1&key=${encodeURIComponent(apiKey)}`
  const response = await fetchWithTimeout(endpoint)
  const data = await response.json() as { items?: Array<{ statistics?: Record<string, string>; snippet?: { title?: string } }>; error?: { message?: string } }
  if (!response.ok || !data.items?.length) throw new Error(data.error?.message || "لم يتم العثور على قناة أو فيديو YouTube")
  const stats = data.items[0].statistics || {}
  const metrics = Object.entries(stats).map(([key, value]) => ({
    label: key.replace(/[A-Z]/g, (letter) => ` ${letter}`).replace(/^./, (letter) => letter.toUpperCase()),
    value: Number(value).toLocaleString("en-US"),
    status: "good" as const,
  }))
  return {
    score: 100,
    metrics: metrics.length ? metrics : [{ label: "العنصر", value: data.items[0].snippet?.title || "تم العثور عليه", status: "good" }],
    issues: [{ type: "success", message: "تم جلب البيانات الحقيقية من YouTube Data API" }],
    recommendations: ["قارن المشاهدات والتفاعل بين آخر المقاطع", "حافظ على عناوين ووصف واضحين"],
    aiInsights: "تم حساب التقرير من الإحصاءات التي أعادها YouTube مباشرة.",
  }
}

async function analyzeMeta(url: string, platform: "instagram" | "facebook"): Promise<Analysis> {
  const token = process.env.META_ACCESS_TOKEN
  const id = platform === "instagram" ? process.env.META_INSTAGRAM_ACCOUNT_ID : process.env.META_FACEBOOK_PAGE_ID
  if (!token || !id) throw new Error(`أكمل META_ACCESS_TOKEN و ${platform === "instagram" ? "META_INSTAGRAM_ACCOUNT_ID" : "META_FACEBOOK_PAGE_ID"} في إعدادات الخادم`)
  const fields = platform === "instagram" ? "username,name,followers_count,media_count" : "name,fan_count,followers_count,talking_about_count"
  const endpoint = `https://graph.facebook.com/v21.0/${encodeURIComponent(id)}?fields=${fields}&access_token=${encodeURIComponent(token)}`
  const response = await fetchWithTimeout(endpoint)
  const data = await response.json() as Record<string, string | number | { message?: string }>
  if (!response.ok) throw new Error(typeof data.error === "object" && data.error ? data.error.message || "فشل Meta Graph API" : "فشل Meta Graph API")
  const metrics = Object.entries(data).filter(([, value]) => typeof value === "string" || typeof value === "number").map(([label, value]) => ({
    label, value: typeof value === "number" ? value.toLocaleString("en-US") : value, status: "good" as const,
  }))
  return {
    score: 100,
    metrics,
    issues: [{ type: "success", message: `تم جلب بيانات ${platform === "instagram" ? "Instagram" : "Facebook"} من Meta Graph API` }],
    recommendations: ["راجع نمو المتابعين أسبوعياً", "اربط بيانات المنشورات لتحليل أفضل أوقات النشر"],
    aiInsights: "النتائج مبنية على الحقول التي أتاحها Meta access token الحالي.",
  }
}

async function analyzeTikTok(url: string): Promise<Analysis> {
  const token = process.env.TIKTOK_ACCESS_TOKEN
  if (!token) throw new Error("TIKTOK_ACCESS_TOKEN غير مضبوط في إعدادات الخادم")
  const response = await fetchWithTimeout("https://open.tiktokapis.com/v2/user/info/?fields=display_name,avatar_url,follower_count,following_count,likes_count,video_count", {
    headers: { Authorization: `Bearer ${token}` },
  })
  const data = await response.json() as { data?: { user?: Record<string, string | number> }; error?: { message?: string } }
  if (!response.ok || !data.data?.user) throw new Error(data.error?.message || "فشل TikTok API")
  return {
    score: 100,
    metrics: Object.entries(data.data.user).map(([label, value]) => ({ label, value: String(value), status: "good" as const })),
    issues: [{ type: "success", message: "تم جلب بيانات الحساب من TikTok API" }],
    recommendations: ["حلل أداء الفيديوهات عبر Content Posting/Display API المفعلة لحسابك"],
    aiInsights: "النتائج مبنية على بيانات الحساب الحقيقية من TikTok.",
  }
}

function assertPublicUrl(value: string): URL {
  const url = new URL(value)
  const blocked = ["localhost", "127.0.0.1", "0.0.0.0", "::1", "169.254.169.254"]
  if (!["http:", "https:"].includes(url.protocol) || blocked.includes(url.hostname) || url.hostname.endsWith(".local")) {
    throw new Error("يسمح فقط بروابط HTTP/HTTPS العامة")
  }
  return url
}

async function fetchWithTimeout(input: string | URL, init: RequestInit = {}): Promise<Response> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), requestTimeout)
  try {
    return await fetch(input, { ...init, redirect: "error", signal: controller.signal, cache: "no-store" })
  } finally {
    clearTimeout(timeout)
  }
}
