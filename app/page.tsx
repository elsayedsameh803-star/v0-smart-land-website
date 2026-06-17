"use client"

import { DashboardCharts } from "@/components/dashboard-charts"
import AnalysisTools from "@/components/analysis-tools"
import { TestimonialsSection } from "@/components/additional-sections"
import { FeaturesSection } from "@/components/landing-sections"

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground font-amiri">
      <FeaturesSection />
      <main className="container mx-auto px-4 py-8 space-y-12">
        <AnalysisTools />
        <DashboardCharts />
        <TestimonialsSection />
      </main>
    </div>
  )
}