"use client"

import { LanguageProvider } from "@/lib/language-context"
import { AuthProvider } from "@/lib/auth-context"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { WhatsAppButton } from "@/components/whatsapp-button"
import AnalysisTools from "@/components/analysis-tools"
import { useLanguage } from "@/lib/language-context"

function AnalyzeContent() {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground">
            {t("أدوات التحليل الاحترافية", "Professional Analysis Tools")}
          </h1>
          <p className="mx-auto mt-2 max-w-2xl text-muted-foreground">
            {t(
              "حلل موقعك وحساباتك على السوشيال ميديا واحصل على تقارير مفصلة وتوصيات لتحسين الأداء",
              "Analyze your website and social media accounts and get detailed reports and recommendations to improve performance"
            )}
          </p>
        </div>

        {/* Tools Grid */}
        <AnalysisTools />
      </div>
    </div>
  )
}

export default function AnalyzePage() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <div className="flex min-h-screen flex-col bg-background text-foreground antialiased selection:bg-primary selection:text-primary-foreground">
          <Navbar />
          <main className="flex-1">
            <AnalyzeContent />
          </main>
          <Footer />
          <WhatsAppButton />
        </div>
      </LanguageProvider>
    </AuthProvider>
  )
}
