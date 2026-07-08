"use client"

import { LanguageProvider } from "@/lib/language-context"
import { AuthProvider } from "@/lib/auth-context"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { WhatsAppButton } from "@/components/whatsapp-button"
import { useLanguage } from "@/lib/language-context"
import { Button } from "@/components/ui/button"
import { Download, Globe, Shield, Zap, Smartphone, RefreshCw } from "lucide-react"
import { exportDashboardPDF } from "@/lib/pdf-export"

function AnalysisCard({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

function DashboardContent() {
  const { t } = useLanguage()

  const handleExportPDF = () => {
    exportDashboardPDF({
      title: "Smart Land Analysis Report",
      date: new Date().toLocaleDateString("en-US"),
      score: 85,
      metrics: [
        { label: "Loading Speed", value: "Excellent (1.2s)" },
        { label: "Overall Performance", value: "90%" },
        { label: "SEO Score", value: "92%" }
      ],
      issues: [],
      recommendations: []
    })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            {t("أدوات التحليل الاحترافية", "Professional Analysis Tools")}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            {t(
              "حلل موقعك وحساباتك على السوشيال ميديا واحصل على تقارير مفصلة وتوصيات لتحسين الأداء",
              "Analyze your website and social media accounts and get detailed reports and recommendations to improve performance"
            )}
          </p>
        </div>

        {/* PDF Export Button */}
        <div className="flex justify-center mb-8">
          <div className="flex gap-3">
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
              <RefreshCw className="ml-2 h-4 w-4" />
              {t("تحديث", "Refresh")}
            </Button>
            <Button size="sm" onClick={handleExportPDF}>
              <Download className="ml-2 h-4 w-4" />
              {t("تصدير PDF", "Export PDF")}
            </Button>
          </div>
        </div>

        {/* Analysis Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <AnalysisCard
            icon={Globe}
            title={t("تحليل الموقع الإلكتروني", "Website Analysis")}
            description={t("أدخل رابط موقعك للحصول على تحليل شامل يشمل الأداء والسيو والأمان", "Enter your website URL to get a comprehensive analysis including performance, SEO, and security")}
          />
          <AnalysisCard
            icon={Zap}
            title={t("سرعة التحميل", "Loading Speed")}
            description={t("قياس سرعة تحميل موقعك وتحديد العوامل المؤثرة", "Measure your website loading speed and identify affecting factors")}
          />
          <AnalysisCard
            icon={Shield}
            title={t("الأمان", "Security")}
            description={t("فحص ثغرات الأمان وتوصيات لحماية موقعك", "Scan security vulnerabilities and recommendations to protect your site")}
          />
          <AnalysisCard
            icon={Globe}
            title={t("SEO", "SEO")}
            description={t("تحليل محركات البحث وتحسين الظهور في نتائج البحث", "Search engine analysis and optimization for search results visibility")}
          />
          <AnalysisCard
            icon={Smartphone}
            title={t("الجوال", "Mobile")}
            description={t("اختبار توافق موقعك مع أجهزة الجوال والشاشات المختلفة", "Test your website compatibility with mobile devices and different screens")}
          />
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <main className="flex-1">
            <DashboardContent />
          </main>
          <Footer />
          <WhatsAppButton />
        </div>
      </AuthProvider>
    </LanguageProvider>
  )
}