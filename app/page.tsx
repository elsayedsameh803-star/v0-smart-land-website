"use client"

import dynamic from "next/dynamic"
import { Suspense } from "react"
import { LanguageProvider } from "@/lib/language-context"
import { AuthProvider } from "@/lib/auth-context"
import { Navbar } from "@/components/navbar"
import { WhatsAppButton } from "@/components/whatsapp-button"
import { HeroSection, StatsSection } from "@/components/landing-sections"

// Lazy load heavy components for faster initial load
const FeaturesSection = dynamic(
  () => import("@/components/landing-sections").then((mod) => ({ default: mod.FeaturesSection })),
  { 
    loading: () => <SectionSkeleton />,
    ssr: true 
  }
)

const CTASection = dynamic(
  () => import("@/components/landing-sections").then((mod) => ({ default: mod.CTASection })),
  { 
    loading: () => <SectionSkeleton height="h-64" />,
    ssr: true 
  }
)

const DashboardPreviewSection = dynamic(
  () => import("@/components/additional-sections").then((mod) => ({ default: mod.DashboardPreviewSection })),
  { 
    loading: () => <SectionSkeleton height="h-96" />,
    ssr: true 
  }
)

const TestimonialsSection = dynamic(
  () => import("@/components/additional-sections").then((mod) => ({ default: mod.TestimonialsSection })),
  { 
    loading: () => <SectionSkeleton />,
    ssr: true 
  }
)

const BlogSection = dynamic(
  () => import("@/components/additional-sections").then((mod) => ({ default: mod.BlogSection })),
  { 
    loading: () => <SectionSkeleton />,
    ssr: true 
  }
)

const VisitorCounter = dynamic(
  () => import("@/components/additional-sections").then((mod) => ({ default: mod.VisitorCounter })),
  { 
    loading: () => null,
    ssr: false 
  }
)

const Footer = dynamic(
  () => import("@/components/footer").then((mod) => ({ default: mod.Footer })),
  { 
    loading: () => <div className="h-64 bg-card animate-pulse" />,
    ssr: true 
  }
)

// Loading skeleton component
function SectionSkeleton({ height = "h-80" }: { height?: string }) {
  return (
    <div className={`${height} w-full bg-card/50 animate-pulse flex items-center justify-center`}>
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-48 bg-muted rounded-lg" />
        <div className="h-4 w-64 bg-muted/50 rounded" />
        <div className="flex gap-4 mt-4">
          <div className="h-32 w-32 bg-muted/30 rounded-lg" />
          <div className="h-32 w-32 bg-muted/30 rounded-lg" />
          <div className="h-32 w-32 bg-muted/30 rounded-lg" />
        </div>
      </div>
    </div>
  )
}

export default function HomePage() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <main className="flex-1">
            {/* Critical above-the-fold content - loads immediately */}
            <HeroSection />
            <StatsSection />
            
            {/* Lazy loaded sections */}
            <Suspense fallback={<SectionSkeleton />}>
              <FeaturesSection />
            </Suspense>
            
            <Suspense fallback={<SectionSkeleton height="h-96" />}>
              <DashboardPreviewSection />
            </Suspense>
            
            <Suspense fallback={<SectionSkeleton />}>
              <TestimonialsSection />
            </Suspense>
            
            <Suspense fallback={<SectionSkeleton />}>
              <BlogSection />
            </Suspense>
            
            <Suspense fallback={<SectionSkeleton height="h-64" />}>
              <CTASection />
            </Suspense>
          </main>
          
          <Suspense fallback={null}>
            <VisitorCounter />
          </Suspense>
          
          <Suspense fallback={<div className="h-64 bg-card animate-pulse" />}>
            <Footer />
          </Suspense>
          
          <WhatsAppButton />
        </div>
      </AuthProvider>
    </LanguageProvider>
  )
} 
