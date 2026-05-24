"use client"

import { LanguageProvider } from "@/lib/language-context"
import { AuthProvider } from "@/lib/auth-context"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { WhatsAppButton } from "@/components/whatsapp-button"
import {
  HeroSection,
  FeaturesSection,
  StatsSection,
  CTASection,
} from "@/components/landing-sections"
import {
  TestimonialsSection,
  DashboardPreviewSection,
  BlogSection,
  VisitorCounter,
} from "@/components/additional-sections"

export default function HomePage() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <main className="flex-1">
            <HeroSection />
            <StatsSection />
            <FeaturesSection />
            <DashboardPreviewSection />
            <TestimonialsSection />
            <BlogSection />
            <CTASection />
          </main>
          <VisitorCounter />
          <Footer />
          <WhatsAppButton />
        </div>
      </AuthProvider>
    </LanguageProvider>
  )
}
