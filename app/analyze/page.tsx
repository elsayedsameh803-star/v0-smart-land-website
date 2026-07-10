"use client"

import { LanguageProvider } from "@/lib/language-context"
import { AuthProvider } from "@/lib/auth-context"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { WhatsAppButton } from "@/components/whatsapp-button"
import AnalysisTools from "@/components/analysis-tools"
import { useLanguage } from "@/lib/language-context"
import { ShieldCheck, Sparkles, TrendingUp, Zap } from "lucide-react"

function AnalyzeContent() {
  const { t } = useLanguage()

  const highlights = [
    {
      title: t("تحليل ذكي", "Smart analysis"),
      description: t("تقارير مبنية على بيانات واضحة", "Reports based on clear data"),
      icon: Sparkles,
    },
    {
      title: t("أداء أسرع", "Faster performance"),
      description: t("ملاحظات عملية مباشرة", "Practical insights instantly"),
      icon: Zap,
    },
    {
      title: t("نمو مستدام", "Sustainable growth"),
      description: t("توصيات واضحة لتحقيق النتائج", "Clear recommendations for results"),
      icon: TrendingUp,
    },
  ]

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.18),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.14),_transparent_28%),linear-gradient(135deg,_#060816_0%,_#0f172a_55%,_#111827_100%)]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(110deg,rgba(255,255,255,0.06)_0%,transparent_35%,rgba(255,255,255,0.04)_100%)]" />
      <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="mb-8 rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex items-center rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-sm font-semibold text-amber-300">
                <Sparkles className="ml-2 h-4 w-4" />
                {t("تحليل ذكي", "Smart analysis")}
              </div>
              <h1 className="text-3xl font-bold text-white sm:text-4xl">
                {t("أدوات التحليل الاحترافية", "Professional Analysis Tools")}
              </h1>
              <p className="mt-3 text-base leading-8 text-slate-300 sm:text-lg">
                {t(
                  "حلل موقعك وحساباتك على السوشيال ميديا واحصل على تقارير مفصلة وتوصيات عملية لتحسين الأداء بشكل واضح وسريع.",
                  "Analyze your website and social media accounts and get detailed reports and practical recommendations to improve performance clearly and quickly."
                )}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {highlights.map((item) => {
                const Icon = item.icon
                return (
                  <div key={item.title} className="rounded-2xl border border-white/10 bg-slate-950/60 p-3">
                    <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-sky-500 text-slate-950">
                      <Icon className="h-4 w-4" />
                    </div>
                    <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                    <p className="mt-1 text-xs leading-6 text-slate-400">{item.description}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

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
