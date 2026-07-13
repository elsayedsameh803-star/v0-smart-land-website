"use client"

import { LanguageProvider } from "@/lib/language-context"
import { AuthProvider } from "@/lib/auth-context"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { WhatsAppButton } from "@/components/whatsapp-button"
import { DashboardCharts } from "@/components/dashboard-charts"
import AnalysisTools from "@/components/analysis-tools"
import { TestimonialsSection } from "@/components/additional-sections"
import { FeaturesSection } from "@/components/landing-sections"

export default function Home() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <div className="min-h-screen bg-background text-foreground font-amiri">
          <Navbar />
          <main className="container mx-auto px-4 py-8 space-y-12">
            <FeaturesSection />
            <AnalysisTools />
            <DashboardCharts />
            <TestimonialsSection />
          </main>
          <Footer />
          <WhatsAppButton />
        </div>
      </LanguageProvider>
    </AuthProvider>
  )
}