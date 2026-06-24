"use client"

import { useState } from "react"
import { LanguageProvider } from "@/lib/language-context"
import { AuthProvider } from "@/lib/auth-context"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { WhatsAppButton } from "@/components/whatsapp-button"
import AnalysisTools from "@/components/analysis-tools"
import SocialMediaAnalyzer from "@/components/social-media-analyzer"
import { useLanguage } from "@/lib/language-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

function AnalyzeContent() {
  const { language } = useLanguage()
  const [activeTab, setActiveTab] = useState("website")

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-foreground text-balance">
            {language === "ar" ? "أدوات التحليل الاحترافية" : "Professional Analysis Tools"}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground text-balance">
            {language === "ar"
              ? "حلل موقعك وحساباتك على وسائل التواصل واحصل على تقارير شاملة وتوصيات متقدمة"
              : "Analyze your website and social media accounts to get comprehensive reports and advanced recommendations"}
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mx-auto mb-8">
            <TabsTrigger value="website">
              {language === "ar" ? "تحليل الموقع" : "Website"}
            </TabsTrigger>
            <TabsTrigger value="social">
              {language === "ar" ? "وسائل التواصل" : "Social Media"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="website" className="space-y-6">
            <AnalysisTools />
          </TabsContent>

          <TabsContent value="social" className="space-y-6">
            <SocialMediaAnalyzer />
          </TabsContent>
        </Tabs>
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
