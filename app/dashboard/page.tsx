"use client"

import { LanguageProvider } from "@/lib/language-context"
import { AuthProvider } from "@/lib/auth-context"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { WhatsAppButton } from "@/components/whatsapp-button"
import { DashboardCharts } from "@/components/dashboard-charts"
import Recommendations from "@/components/recommendations"
import { useLanguage } from "@/lib/language-context"
import { Button } from "@/components/ui/button"
import { Download, RefreshCw } from "lucide-react"
import { exportDashboardPDF } from "@/lib/pdf-export"

function DashboardContent() {
  const { language, t } = useLanguage()

  const handleExportPDF = () => {
    exportDashboardPDF(language)
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
