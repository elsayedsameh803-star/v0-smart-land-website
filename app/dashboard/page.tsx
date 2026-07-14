"use client"

import { LanguageProvider } from "@/lib/language-context"
import { AuthProvider } from "@/lib/auth-context"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { WhatsAppButton } from "@/components/whatsapp-button"
import { DashboardCharts } from "@/components/dashboard-charts"
import Recommendations from "@/components/recommendations"
import { useEffect, useState } from "react"
import { useLanguage } from "@/lib/language-context"
import { Button } from "@/components/ui/button"
import { Download, RefreshCw } from "lucide-react"
import { exportDashboardPDF } from "@/lib/pdf-export"

function DashboardContent() {
  const { language, t } = useLanguage()
  const [dashboardStats, setDashboardStats] = useState({
    visits: "0",
    followers: "0",
    conversion: "0%",
    avgSession: "4:32",
  })

  useEffect(() => {
    const storedVisits = localStorage.getItem("smartland_dashboard_visits")
    const storedFollowers = localStorage.getItem("smartland_dashboard_followers")
    const storedConversion = localStorage.getItem("smartland_dashboard_conversion")
    const storedAvgSession = localStorage.getItem("smartland_dashboard_avg_session")

    const visitsValue = storedVisits ? parseInt(storedVisits, 10) : 132450
    const followersValue = storedFollowers ? parseInt(storedFollowers, 10) : 68000
    const conversionValue = storedConversion ? parseFloat(storedConversion) : 3.42
    const avgSessionValue = storedAvgSession || "4:32"

    setDashboardStats({
      visits: visitsValue.toLocaleString("en-US"),
      followers: followersValue.toLocaleString("en-US"),
      conversion: `${conversionValue.toFixed(2)}%`,
      avgSession: avgSessionValue,
    })
  }, [])

  const handleExportPDF = () => {
    exportDashboardPDF({
      title: t("تقرير لوحة التحكم", "Dashboard Report"),
      date: new Date().toLocaleDateString(language === "ar" ? "ar-EG" : "en-US"),
      score: 88,
      metrics: [
        { label: t("إجمالي الزيارات", "Total Visits"), value: dashboardStats.visits },
        { label: t("المتابعون", "Followers"), value: dashboardStats.followers },
        { label: t("معدل التحويل", "Conversion Rate"), value: dashboardStats.conversion },
      ],
      issues: [
        { type: "success", message: t("اللوحة تعمل بشكل طبيعي", "Dashboard is working normally") },
      ],
      recommendations: [
        t("راجع تحليلات الأداء لتحديد فرص النمو.", "Review performance analytics to identify growth opportunities."),
      ],
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {t("لوحة التحكم", "Dashboard")}
            </h1>
            <p className="mt-1 text-muted-foreground">
              {t(
                "تحليل شامل لأداء موقعك وحساباتك",
                "Comprehensive analysis of your website and accounts performance"
              )}
            </p>
          </div>
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

        {/* Recommendations */}
        <div className="mb-6">
          <Recommendations />
        </div>

        {/* Charts */}
        <DashboardCharts />
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
