"use client"

import Link from "next/link"
import { useLanguage } from "@/lib/language-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  BarChart3,
  LineChart,
  TrendingUp,
  Globe,
  Instagram,
  Facebook,
  Smartphone,
  ArrowRight,
  CheckCircle2,
  Zap,
  Shield,
  Users,
} from "lucide-react"

export function HeroSection() {
  const { t } = useLanguage()

  return (
    <section className="relative overflow-hidden py-20 lg:py-32">
      {/* Background decorations */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-yellow-400/50 bg-yellow-400/10 px-4 py-2 text-sm text-yellow-400">
            <Zap className="h-4 w-4" />
            {t("منصة تحليل البيانات الاحترافية", "Professional Data Analytics Platform")}
          </div>

          {/* Main heading */}
          <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            {t("سمارت لاند", "Smart Land")}
            <span className="mt-2 block text-yellow-400">
              {t("لاستشارات وزيادة أرباح المواقع", "Website Consulting & Profit Growth")}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            {t(
              "حلل موقعك وحساباتك على السوشيال ميديا باحترافية عالية. اكتشف المشاكل واحصل على توصيات لزيادة الأرباح والتفاعل.",
              "Analyze your website and social media accounts professionally. Discover issues and get recommendations to increase profits and engagement."
            )}
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" className="min-w-[180px] bg-yellow-400 text-black hover:bg-yellow-500">
              <Link href="/analyze">
                {t("ابدأ التحليل الآن", "Start Analysis Now")}
                <ArrowRight className="mr-2 h-5 w-5 rotate-180" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="min-w-[180px] border-yellow-400 text-yellow-400 hover:bg-yellow-400/10">
              <Link href="/dashboard">
                {t("استكشف لوحة التحكم", "Explore Dashboard")}
              </Link>
            </Button>
          </div>

          {/* Trust badges */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-accent" />
              {t("تحليل فوري", "Instant Analysis")}
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-accent" />
              {t("آمن 100%", "100% Secure")}
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-accent" />
              {t("+10,000 عميل", "+10,000 Clients")}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export function FeaturesSection() {
  const { t } = useLanguage()

  const features = [
    {
      icon: Globe,
      title: t("تحليل المواقع", "Website Analysis"),
      description: t(
        "تحليل شامل لموقعك يشمل الأداء والسيو والسرعة والأمان",
        "Comprehensive website analysis including performance, SEO, speed, and security"
      ),
    },
    {
      icon: Instagram,
      title: t("تحليل انستجرام", "Instagram Analysis"),
      description: t(
        "تحليل حسابك على انستجرام واكتشاف أفضل أوقات النشر والمحتوى",
        "Analyze your Instagram account and discover best posting times and content"
      ),
    },
    {
      icon: Facebook,
      title: t("تحليل فيسبوك", "Facebook Analysis"),
      description: t(
        "تحليل صفحتك على فيسبوك وتتبع التفاعل والوصول",
        "Analyze your Facebook page and track engagement and reach"
      ),
    },
    {
      icon: Smartphone,
      title: t("تحليل تيك توك", "TikTok Analysis"),
      description: t(
        "تحليل حسابك على تيك توك واكتشاف الترندات والمحتوى الرائج",
        "Analyze your TikTok account and discover trends and viral content"
      ),
    },
    {
      icon: LineChart,
      title: t("شموع بيانية", "Candlestick Charts"),
      description: t(
        "رسوم بيانية احترافية لتتبع أداء موقعك وحساباتك",
        "Professional charts to track your website and account performance"
      ),
    },
    {
      icon: TrendingUp,
      title: t("توصيات الربح", "Profit Recommendations"),
      description: t(
        "توصيات مخصصة لزيادة أرباحك وتحسين أدائك",
        "Custom recommendations to increase profits and improve performance"
      ),
    },
  ]

  return (
    <section className="py-20 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t("خدماتنا المتميزة", "Our Premium Services")}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            {t(
              "نقدم مجموعة شاملة من أدوات التحليل لمساعدتك في تحقيق النجاح الرقمي",
              "We offer a comprehensive suite of analytics tools to help you achieve digital success"
            )}
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="group relative overflow-hidden border-border bg-card transition-all hover:border-yellow-400/50 hover:shadow-lg hover:shadow-yellow-400/5"
            >
              <CardContent className="p-6">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-400/10 text-yellow-400 transition-colors group-hover:bg-yellow-400 group-hover:text-black">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

export function StatsSection() {
  const { t } = useLanguage()

  const stats = [
    { value: "10K+", label: t("عميل نشط", "Active Clients") },
    { value: "50M+", label: t("تحليل مكتمل", "Analyses Completed") },
    { value: "99.9%", label: t("نسبة الدقة", "Accuracy Rate") },
    { value: "24/7", label: t("دعم متواصل", "Support Available") },
  ]

  return (
    <section className="border-y border-border bg-card py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl font-bold text-yellow-400">{stat.value}</div>
              <div className="mt-2 text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function CTASection() {
  const { t } = useLanguage()

  return (
    <section className="py-20 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-yellow-400/20 via-background to-yellow-400/20 p-8 sm:p-16">
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-yellow-400/20 blur-3xl" />
          </div>

          <div className="text-center">
            <BarChart3 className="mx-auto h-16 w-16 text-yellow-400" />
            <h2 className="mt-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {t("ابدأ رحلة النجاح الآن", "Start Your Success Journey Now")}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              {t(
                "انضم إلى آلاف العملاء الذين يثقون في سمارت لاند لتحليل بياناتهم وزيادة أرباحهم",
                "Join thousands of clients who trust Smart Land to analyze their data and increase their profits"
              )}
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button asChild size="lg" className="bg-yellow-400 text-black hover:bg-yellow-500">
                <Link href="/register">
                  {t("إنشاء حساب مجاني", "Create Free Account")}
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-yellow-400 text-yellow-400 hover:bg-yellow-400/10">
                <Link href="/contact">{t("تواصل معنا", "Contact Us")}</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
