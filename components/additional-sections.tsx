"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useLanguage } from "@/lib/language-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import {
  Star,
  Quote,
  TrendingUp,
  Users,
  Eye,
  BookOpen,
  Calendar,
  ArrowRight,
  BarChart3,
  Activity,
} from "lucide-react"

// Demo data for charts
const demoData = [
  { name: "Jan", visits: 4000, sales: 2400, engagement: 2400 },
  { name: "Feb", visits: 3000, sales: 1398, engagement: 2210 },
  { name: "Mar", visits: 2000, sales: 9800, engagement: 2290 },
  { name: "Apr", visits: 2780, sales: 3908, engagement: 2000 },
  { name: "May", visits: 1890, sales: 4800, engagement: 2181 },
  { name: "Jun", visits: 2390, sales: 3800, engagement: 2500 },
  { name: "Jul", visits: 3490, sales: 4300, engagement: 2100 },
]

// Testimonials Section
export function TestimonialsSection() {
  const { t } = useLanguage()

  const testimonials = [
    {
      name: t("أحمد محمد", "Ahmed Mohamed"),
      role: t("مؤسس شركة تقنية", "Tech Company Founder"),
      avatar: "A",
      rating: 5,
      content: t(
        "سمارت لاند غير طريقة تعاملنا مع البيانات تماماً. التحليلات دقيقة والتوصيات ساعدتنا على زيادة أرباحنا بنسبة 40%",
        "Smart Land completely changed how we handle data. The analytics are accurate and the recommendations helped us increase our profits by 40%"
      ),
    },
    {
      name: t("سارة أحمد", "Sarah Ahmed"),
      role: t("مديرة تسويق", "Marketing Director"),
      avatar: "S",
      rating: 5,
      content: t(
        "أفضل منصة تحليل استخدمتها. الواجهة سهلة والتقارير شاملة. أنصح بها بشدة لكل من يريد تحسين أداء موقعه",
        "Best analytics platform I have used. Easy interface and comprehensive reports. Highly recommend for anyone looking to improve their site performance"
      ),
    },
    {
      name: t("محمد علي", "Mohamed Ali"),
      role: t("صاحب متجر إلكتروني", "E-commerce Owner"),
      avatar: "M",
      rating: 5,
      content: t(
        "تحليل السوشيال ميديا ممتاز! ساعدني على فهم جمهوري بشكل أفضل وزيادة التفاعل على انستجرام وتيك توك",
        "Excellent social media analysis! Helped me understand my audience better and increase engagement on Instagram and TikTok"
      ),
    },
    {
      name: t("فاطمة حسن", "Fatma Hassan"),
      role: t("مستشارة تسويق رقمي", "Digital Marketing Consultant"),
      avatar: "F",
      rating: 5,
      content: t(
        "أستخدم سمارت لاند مع جميع عملائي. التقارير احترافية وتصدير PDF يوفر الكثير من الوقت",
        "I use Smart Land with all my clients. Professional reports and PDF export saves a lot of time"
      ),
    },
  ]

  return (
    <section className="py-20 lg:py-32 bg-card/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t("آراء عملائنا", "What Our Clients Say")}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            {t(
              "أكثر من 10,000 عميل يثقون في سمارت لاند لتحليل بياناتهم",
              "More than 10,000 clients trust Smart Land for their data analytics"
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="border-border bg-card relative overflow-hidden group hover:border-primary/50 transition-all"
            >
              <CardContent className="p-6">
                <Quote className="absolute top-4 right-4 h-8 w-8 text-primary/20" />
                
                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>

                {/* Content */}
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {testimonial.content}
                </p>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

// Dashboard Preview Section
export function DashboardPreviewSection() {
  const { t } = useLanguage()

  return (
    <section className="py-20 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm text-primary">
            <Activity className="h-4 w-4" />
            {t("معاينة حية", "Live Preview")}
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t("لوحة تحكم احترافية", "Professional Dashboard")}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            {t(
              "رسوم بيانية تفاعلية لعرض بياناتك بشكل احترافي وسهل الفهم",
              "Interactive charts to display your data professionally and easy to understand"
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Area Chart */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <TrendingUp className="h-5 w-5 text-primary" />
                {t("نمو الزيارات", "Traffic Growth")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={demoData}>
                    <defs>
                      <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#c8a032" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#c8a032" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="name" stroke="#888" />
                    <YAxis stroke="#888" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1a1a2e",
                        border: "1px solid #333",
                        borderRadius: "8px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="visits"
                      stroke="#c8a032"
                      fillOpacity={1}
                      fill="url(#colorVisits)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Bar Chart */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <BarChart3 className="h-5 w-5 text-primary" />
                {t("مقارنة الأداء", "Performance Comparison")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={demoData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="name" stroke="#888" />
                    <YAxis stroke="#888" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1a1a2e",
                        border: "1px solid #333",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="sales" fill="#c8a032" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="engagement" fill="#4ade80" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Line Chart - Full Width */}
          <Card className="border-border bg-card lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Activity className="h-5 w-5 text-primary" />
                {t("تحليل الاتجاهات", "Trend Analysis")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={demoData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="name" stroke="#888" />
                    <YAxis stroke="#888" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1a1a2e",
                        border: "1px solid #333",
                        borderRadius: "8px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="visits"
                      stroke="#c8a032"
                      strokeWidth={2}
                      dot={{ fill: "#c8a032", strokeWidth: 2 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="sales"
                      stroke="#4ade80"
                      strokeWidth={2}
                      dot={{ fill: "#4ade80", strokeWidth: 2 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="engagement"
                      stroke="#f472b6"
                      strokeWidth={2}
                      dot={{ fill: "#f472b6", strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <Button asChild size="lg">
            <Link href="/dashboard">
              {t("استكشف لوحة التحكم الكاملة", "Explore Full Dashboard")}
              <ArrowRight className="mr-2 h-5 w-5 rotate-180" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

// Blog Section
export function BlogSection() {
  const { t } = useLanguage()

  const articles = [
    {
      title: t("10 نصائح لزيادة أرباح موقعك", "10 Tips to Increase Your Website Profits"),
      excerpt: t(
        "اكتشف أفضل الاستراتيجيات لزيادة أرباح موقعك وتحسين معدل التحويل...",
        "Discover the best strategies to increase your website profits and improve conversion rates..."
      ),
      category: t("استراتيجيات الربح", "Profit Strategies"),
      date: t("15 مايو 2026", "May 15, 2026"),
      readTime: t("5 دقائق", "5 min read"),
    },
    {
      title: t("كيف تحلل بيانات انستجرام باحترافية", "How to Analyze Instagram Data Professionally"),
      excerpt: t(
        "دليلك الشامل لفهم تحليلات انستجرام واستخدامها لتحسين أداء حسابك...",
        "Your comprehensive guide to understanding Instagram analytics and using them to improve your account performance..."
      ),
      category: t("السوشيال ميديا", "Social Media"),
      date: t("12 مايو 2026", "May 12, 2026"),
      readTime: t("7 دقائق", "7 min read"),
    },
    {
      title: t("أهمية سرعة الموقع في SEO", "The Importance of Site Speed in SEO"),
      excerpt: t(
        "تعرف على تأثير سرعة التحميل على ترتيب موقعك في محركات البحث...",
        "Learn about the impact of loading speed on your site ranking in search engines..."
      ),
      category: t("تحسين محركات البحث", "SEO"),
      date: t("10 مايو 2026", "May 10, 2026"),
      readTime: t("6 دقائق", "6 min read"),
    },
  ]

  return (
    <section className="py-20 lg:py-32 bg-card/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm text-primary">
            <BookOpen className="h-4 w-4" />
            {t("المدونة", "Blog")}
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t("مقالات ونصائح", "Articles & Tips")}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            {t(
              "اقرأ أحدث المقالات حول تحليل البيانات وزيادة الأرباح",
              "Read the latest articles about data analytics and increasing profits"
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {articles.map((article, index) => (
            <Card
              key={index}
              className="border-border bg-card group hover:border-primary/50 transition-all cursor-pointer overflow-hidden"
            >
              {/* Article Image Placeholder */}
              <div className="h-48 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <BookOpen className="h-16 w-16 text-primary/40" />
              </div>
              
              <CardContent className="p-6">
                {/* Category */}
                <span className="inline-block px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full mb-3">
                  {article.category}
                </span>

                {/* Title */}
                <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                  {article.title}
                </h3>

                {/* Excerpt */}
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {article.excerpt}
                </p>

                {/* Meta */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {article.date}
                  </div>
                  <span>{article.readTime}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Button variant="outline" size="lg">
            {t("عرض جميع المقالات", "View All Articles")}
            <ArrowRight className="mr-2 h-5 w-5 rotate-180" />
          </Button>
        </div>
      </div>
    </section>
  )
}

// Visitor Counter Component
export function VisitorCounter() {
  const { t } = useLanguage()
  const [visitors, setVisitors] = useState(0)
  const [onlineNow, setOnlineNow] = useState(0)

  useEffect(() => {
    // Simulate visitor count from localStorage or start fresh
    const storedVisitors = localStorage.getItem("smartland_visitors")
    const baseCount = storedVisitors ? parseInt(storedVisitors) : 124520
    const newCount = baseCount + 1
    localStorage.setItem("smartland_visitors", newCount.toString())
    
    // Animate the counter
    let current = 0
    const target = newCount
    const increment = Math.ceil(target / 50)
    const timer = setInterval(() => {
      current += increment
      if (current >= target) {
        setVisitors(target)
        clearInterval(timer)
      } else {
        setVisitors(current)
      }
    }, 20)

    // Random online users
    setOnlineNow(Math.floor(Math.random() * 50) + 20)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="border-t border-border bg-card/50 py-4">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">{t("إجمالي الزوار:", "Total Visitors:")}</span>
            <span className="font-bold text-foreground">{visitors.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-muted-foreground">{t("متصل الآن:", "Online Now:")}</span>
            <span className="font-bold text-green-500">{onlineNow}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">{t("عملاء سعداء:", "Happy Clients:")}</span>
            <span className="font-bold text-foreground">+10,000</span>
          </div>
        </div>
      </div>
    </div>
  )
}
