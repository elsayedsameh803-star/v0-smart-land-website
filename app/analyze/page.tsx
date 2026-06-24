"use client"

import { LanguageProvider } from "@/lib/language-context"
import { AuthProvider } from "@/lib/auth-context"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { WhatsAppButton } from "@/components/whatsapp-button"
import AnalysisTools from "@/components/analysis-tools"
import { useLanguage } from "@/lib/language-context"

function AnalyzeContent() {
  const { language } = useLanguage()

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-foreground text-balance">
            {language === "ar" ? "تحليل الموقع" : "Analyze Website"}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground text-balance">
            {language === "ar"
              ? "قم بتحليل موقعك الإلكتروني واحصل على تقرير شامل عن الأداء والأمان وتحسين محركات البحث"
              : "Analyze your website and get comprehensive reports on performance, security, and SEO optimization"}
          </p>
        </div>

        {/* Tools */}
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
