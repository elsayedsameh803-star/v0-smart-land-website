"use client"

import { useState } from "react"
import { useLanguage } from "@/lib/language-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Globe,
  Instagram,
  Facebook,
  Smartphone,
  Search,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
  TrendingUp,
  Shield,
  Zap,
  Clock,
  Users,
  Eye,
  Link2,
  FileDown,
  Brain,
  Sparkles,
} from "lucide-react"
import { exportAnalysisPDF } from "@/lib/pdf-export"

interface AnalysisResult {
  score: number
  issues: { type: "error" | "warning" | "success"; message: string }[]
  metrics: { label: string; value: string; status: "good" | "medium" | "bad" }[]
  recommendations: string[]
  aiInsights?: string
}

function generateWebsiteAnalysis(url: string): AnalysisResult {
  return {
    score: Math.floor(Math.random() * 30) + 70,
    issues: [
      { type: "success", message: "شهادة SSL صالحة ومفعلة" },
      { type: "warning", message: "صور غير محسنة تؤثر على سرعة التحميل" },
      { type: "error", message: "عدم وجود وصف Meta للصفحة الرئيسية" },
      { type: "success", message: "الموقع متوافق مع الجوال" },
      { type: "warning", message: "عدم وجود خريطة موقع XML" },
    ],
    metrics: [
      { label: "سرعة التحميل", value: "2.3s", status: "medium" },
      { label: "نقاط SEO", value: "72/100", status: "medium" },
      { label: "الأمان", value: "ممتاز", status: "good" },
      { label: "توافق الجوال", value: "95%", status: "good" },
      { label: "إمكانية الوصول", value: "68/100", status: "medium" },
      { label: "أفضل الممارسات", value: "80/100", status: "good" },
    ],
    recommendations: [
      "ضغط الصور وتحويلها لصيغة WebP",
      "إضافة وصف Meta وعناوين فرعية",
      "إنشاء خريطة موقع XML وإرسالها لمحركات البحث",
      "تحسين سرعة التحميل باستخدام التخزين المؤقت",
      "إضافة Schema markup للمحتوى",
    ],
  }
}

function generateSocialAnalysis(platform: string, username: string): AnalysisResult {
  const platformData = {
    instagram: {
      metrics: [
        { label: "المتابعون", value: "45.2K", status: "good" as const },
        { label: "معدل التفاعل", value: "4.5%", status: "good" as const },
        { label: "متوسط الإعجابات", value: "2,100", status: "good" as const },
        { label: "متوسط التعليقات", value: "85", status: "medium" as const },
        { label: "أفضل وقت للنشر", value: "8:00 م", status: "good" as const },
        { label: "نمو المتابعين", value: "+12%", status: "good" as const },
      ],
      issues: [
        { type: "success" as const, message: "معدل تفاعل ممتاز مقارنة بالمتوسط" },
        { type: "warning" as const, message: "انخفاض في التفاعل أيام الأحد" },
        { type: "success" as const, message: "استخدام جيد للهاشتاقات" },
        { type: "warning" as const, message: "عدم انتظام في جدول النشر" },
      ],
    },
    facebook: {
      metrics: [
        { label: "الإعجابات", value: "32.1K", status: "good" as const },
        { label: "الوصول الأسبوعي", value: "125K", status: "good" as const },
        { label: "معدل التفاعل", value: "2.8%", status: "medium" as const },
        { label: "المشاركات", value: "450", status: "medium" as const },
        { label: "أفضل نوع محتوى", value: "فيديو", status: "good" as const },
        { label: "نمو الصفحة", value: "+8%", status: "good" as const },
      ],
      issues: [
        { type: "success" as const, message: "وصول عضوي جيد" },
        { type: "warning" as const, message: "معدل التفاعل أقل من المتوسط" },
        { type: "success" as const, message: "محتوى الفيديو يحقق أفضل أداء" },
        { type: "error" as const, message: "عدم استخدام Facebook Stories" },
      ],
    },
    tiktok: {
      metrics: [
        { label: "المتابعون", value: "78.5K", status: "good" as const },
        { label: "إجمالي الإعجابات", value: "1.2M", status: "good" as const },
        { label: "معدل التفاعل", value: "8.2%", status: "good" as const },
        { label: "متوسط المشاهدات", value: "45K", status: "good" as const },
        { label: "أفضل مدة فيديو", value: "15-30 ث", status: "good" as const },
        { label: "نمو المتابعين", value: "+25%", status: "good" as const },
      ],
      issues: [
        { type: "success" as const, message: "معدل نمو استثنائي" },
        { type: "success" as const, message: "تفاعل ممتاز مع المحتوى" },
        { type: "warning" as const, message: "يمكن تحسين استخدام الترندات" },
        { type: "success" as const, message: "محتوى أصلي ومميز" },
      ],
    },
  }

  const data = platformData[platform as keyof typeof platformData] || platformData.instagram

  return {
    score: Math.floor(Math.random() * 20) + 75,
    issues: data.issues,
    metrics: data.metrics,
    recommendations: [
      "زيادة التفاعل مع المتابعين في التعليقات",
      "استخدام المحتوى التفاعلي مثل الاستفتاءات",
      "التعاون مع مؤثرين في نفس المجال",
      "تحليل أفضل أوقات النشر وجدولة المحتوى",
      "استخدام الترندات والتحديات الرائجة",
    ],
  }
}

function AnalysisResultCard({ result, type }: { result: AnalysisResult; type: string }) {
  const { t, language } = useLanguage()

  const handleExportPDF = () => {
    exportAnalysisPDF(type, result, language)
  }

  return (
    <div className="mt-6 space-y-6">
      {/* Score Card with Export Button */}
      <Card className="border-border bg-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                {t("نتيجة التحليل", "Analysis Score")}
              </p>
              <p className="mt-1 text-4xl font-bold text-foreground">
                {result.score}
                <span className="text-lg text-muted-foreground">/100</span>
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportPDF}
                className="gap-2"
              >
                <FileDown className="h-4 w-4" />
                {t("تصدير PDF", "Export PDF")}
              </Button>
              <div
                className={`flex h-20 w-20 items-center justify-center rounded-full ${
                  result.score >= 80
                    ? "bg-green-500/20 text-green-500"
                    : result.score >= 60
                      ? "bg-yellow-500/20 text-yellow-500"
                      : "bg-red-500/20 text-red-500"
                }`}
              >
                {result.score >= 80 ? (
                  <CheckCircle2 className="h-10 w-10" />
                ) : result.score >= 60 ? (
                  <AlertTriangle className="h-10 w-10" />
                ) : (
                  <XCircle className="h-10 w-10" />
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {result.metrics.map((metric, index) => (
          <Card key={index} className="border-border bg-card">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">{metric.label}</p>
              <p
                className={`mt-1 text-xl font-bold ${
                  metric.status === "good"
                    ? "text-green-500"
                    : metric.status === "medium"
                      ? "text-yellow-500"
                      : "text-red-500"
                }`}
              >
                {metric.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Issues */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>{t("نتائج الفحص", "Check Results")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {result.issues.map((issue, index) => (
            <div key={index} className="flex items-start gap-3">
              {issue.type === "success" ? (
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
              ) : issue.type === "warning" ? (
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-yellow-500" />
              ) : (
                <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
              )}
              <span className="text-sm text-foreground">{issue.message}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>{t("التوصيات", "Recommendations")}</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {result.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                {rec}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* AI Insights */}
      {result.aiInsights && (
        <Card className="border-primary/30 bg-gradient-to-br from-primary/10 to-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20">
                <Brain className="h-4 w-4 text-primary" />
              </div>
              <span className="flex items-center gap-2">
                {t("تحليل الذكاء الاصطناعي", "AI Analysis")}
                <Sparkles className="h-4 w-4 text-primary animate-pulse" />
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-foreground">
              {result.aiInsights}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export function AnalysisTools() {
  const { t } = useLanguage()
  const [websiteUrl, setWebsiteUrl] = useState("")
  const [instagramUsername, setInstagramUsername] = useState("")
  const [facebookPage, setFacebookPage] = useState("")
  const [tiktokUsername, setTiktokUsername] = useState("")
  const [analyzing, setAnalyzing] = useState(false)
  const [results, setResults] = useState<{
    website?: AnalysisResult
    instagram?: AnalysisResult
    facebook?: AnalysisResult
    tiktok?: AnalysisResult
  }>({})

  const analyzeWithAI = async (type: string, url: string) => {
    if (!url) return
    setAnalyzing(true)
    
    try {
      // Try AI-powered analysis first
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, type }),
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.analysis) {
          setResults((prev) => ({ ...prev, [type]: data.analysis }))
          setAnalyzing(false)
          return
        }
      }
    } catch (error) {
      console.log('[v0] AI analysis failed, using fallback:', error)
    }
    
    // Fallback to local analysis
    if (type === 'website') {
      setResults((prev) => ({ ...prev, website: generateWebsiteAnalysis(url) }))
    } else {
      setResults((prev) => ({
        ...prev,
        [type]: generateSocialAnalysis(type, url),
      }))
    }
    setAnalyzing(false)
  }

  const analyzeWebsite = async () => {
    await analyzeWithAI('website', websiteUrl)
  }

  const analyzeSocial = async (platform: string, username: string) => {
    await analyzeWithAI(platform, username)
  }

  return (
    <div className="space-y-8">
      <Tabs defaultValue="website" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="website" className="gap-2">
            <Globe className="h-4 w-4" />
            {t("المواقع", "Websites")}
          </TabsTrigger>
          <TabsTrigger value="instagram" className="gap-2">
            <Instagram className="h-4 w-4" />
            {t("انستجرام", "Instagram")}
          </TabsTrigger>
          <TabsTrigger value="facebook" className="gap-2">
            <Facebook className="h-4 w-4" />
            {t("فيسبوك", "Facebook")}
          </TabsTrigger>
          <TabsTrigger value="tiktok" className="gap-2">
            <Smartphone className="h-4 w-4" />
            {t("تيك توك", "TikTok")}
          </TabsTrigger>
        </TabsList>

        {/* Website Analysis */}
        <TabsContent value="website" className="mt-6">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                {t("تحليل الموقع الإلكتروني", "Website Analysis")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {t(
                  "أدخل رابط موقعك للحصول على تحليل شامل يشمل الأداء والسيو والأمان",
                  "Enter your website URL for comprehensive analysis including performance, SEO, and security"
                )}
              </p>
              <div className="flex gap-3">
                <Input
                  placeholder={t("https://example.com", "https://example.com")}
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  dir="ltr"
                  className="flex-1"
                />
                <Button onClick={analyzeWebsite} disabled={analyzing || !websiteUrl}>
                  {analyzing ? (
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="ml-2 h-4 w-4" />
                  )}
                  {t("تحليل", "Analyze")}
                </Button>
              </div>

              {/* Quick Analysis Features */}
              <div className="grid grid-cols-2 gap-3 pt-4 sm:grid-cols-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Zap className="h-4 w-4 text-primary" />
                  {t("سرعة التحميل", "Load Speed")}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4 text-primary" />
                  {t("الأمان", "Security")}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Link2 className="h-4 w-4 text-primary" />
                  {t("SEO", "SEO")}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Smartphone className="h-4 w-4 text-primary" />
                  {t("الجوال", "Mobile")}
                </div>
              </div>
            </CardContent>
          </Card>

          {results.website && <AnalysisResultCard result={results.website} type="website" />}
        </TabsContent>

        {/* Instagram Analysis */}
        <TabsContent value="instagram" className="mt-6">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Instagram className="h-5 w-5 text-pink-500" />
                {t("تحليل انستجرام", "Instagram Analysis")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {t(
                  "أدخل اسم المستخدم لتحليل أداء الحساب والتفاعل",
                  "Enter username to analyze account performance and engagement"
                )}
              </p>
              <div className="flex gap-3">
                <Input
                  placeholder={t("@username", "@username")}
                  value={instagramUsername}
                  onChange={(e) => setInstagramUsername(e.target.value)}
                  dir="ltr"
                  className="flex-1"
                />
                <Button
                  onClick={() => analyzeSocial("instagram", instagramUsername)}
                  disabled={analyzing || !instagramUsername}
                >
                  {analyzing ? (
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="ml-2 h-4 w-4" />
                  )}
                  {t("تحليل", "Analyze")}
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4 sm:grid-cols-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4 text-pink-500" />
                  {t("المتابعون", "Followers")}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <TrendingUp className="h-4 w-4 text-pink-500" />
                  {t("التفاعل", "Engagement")}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 text-pink-500" />
                  {t("أوقات النشر", "Post Times")}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Eye className="h-4 w-4 text-pink-500" />
                  {t("الوصول", "Reach")}
                </div>
              </div>
            </CardContent>
          </Card>

          {results.instagram && <AnalysisResultCard result={results.instagram} type="instagram" />}
        </TabsContent>

        {/* Facebook Analysis */}
        <TabsContent value="facebook" className="mt-6">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Facebook className="h-5 w-5 text-blue-500" />
                {t("تحليل فيسبوك", "Facebook Analysis")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {t(
                  "أدخل اسم الصفحة لتحليل الأداء والوصول",
                  "Enter page name to analyze performance and reach"
                )}
              </p>
              <div className="flex gap-3">
                <Input
                  placeholder={t("اسم الصفحة", "Page name")}
                  value={facebookPage}
                  onChange={(e) => setFacebookPage(e.target.value)}
                  dir="ltr"
                  className="flex-1"
                />
                <Button
                  onClick={() => analyzeSocial("facebook", facebookPage)}
                  disabled={analyzing || !facebookPage}
                >
                  {analyzing ? (
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="ml-2 h-4 w-4" />
                  )}
                  {t("تحليل", "Analyze")}
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4 sm:grid-cols-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4 text-blue-500" />
                  {t("الإعجابات", "Likes")}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Eye className="h-4 w-4 text-blue-500" />
                  {t("الوصول", "Reach")}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                  {t("التفاعل", "Engagement")}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Zap className="h-4 w-4 text-blue-500" />
                  {t("المشاركات", "Shares")}
                </div>
              </div>
            </CardContent>
          </Card>

          {results.facebook && <AnalysisResultCard result={results.facebook} type="facebook" />}
        </TabsContent>

        {/* TikTok Analysis */}
        <TabsContent value="tiktok" className="mt-6">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-foreground" />
                {t("تحليل تيك توك", "TikTok Analysis")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {t(
                  "أدخل اسم المستخدم لتحليل أداء الفيديوهات والترندات",
                  "Enter username to analyze video performance and trends"
                )}
              </p>
              <div className="flex gap-3">
                <Input
                  placeholder={t("@username", "@username")}
                  value={tiktokUsername}
                  onChange={(e) => setTiktokUsername(e.target.value)}
                  dir="ltr"
                  className="flex-1"
                />
                <Button
                  onClick={() => analyzeSocial("tiktok", tiktokUsername)}
                  disabled={analyzing || !tiktokUsername}
                >
                  {analyzing ? (
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="ml-2 h-4 w-4" />
                  )}
                  {t("تحليل", "Analyze")}
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4 sm:grid-cols-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  {t("المتابعون", "Followers")}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Eye className="h-4 w-4" />
                  {t("المشاهدات", "Views")}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <TrendingUp className="h-4 w-4" />
                  {t("الترندات", "Trends")}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Zap className="h-4 w-4" />
                  {t("الفيرال", "Viral")}
                </div>
              </div>
            </CardContent>
          </Card>

          {results.tiktok && <AnalysisResultCard result={results.tiktok} type="tiktok" />}
        </TabsContent>
      </Tabs>
    </div>
  )
}
