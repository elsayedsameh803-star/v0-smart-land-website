"use client"

import { LanguageProvider } from "@/lib/language-context"
import { AuthProvider } from "@/lib/auth-context"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { WhatsAppButton } from "@/components/whatsapp-button"
import { DashboardCharts } from "@/components/dashboard-charts"
import AnalysisTools from "@/components/analysis-tools"
import { TestimonialsSection } from "@/components/additional-sections"
import { FeaturesSection, HeroSection, StatsSection, CTASection } from "@/components/landing-sections"
import { VideoSection } from "@/components/video-section"

export default function Home() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <div className="min-h-screen bg-background text-foreground font-amiri">
          <Navbar />
          <main className="container mx-auto px-4 py-8 space-y-12">
            <HeroSection />
            <FeaturesSection />
            <AnalysisTools />
            <VideoSection />
            <DashboardCharts />
            <StatsSection />
            <TestimonialsSection />
            <CTASection />
          </main>
          <Footer />
          <WhatsAppButton />
        </div>
      </LanguageProvider>
    </AuthProvider>
  )
}