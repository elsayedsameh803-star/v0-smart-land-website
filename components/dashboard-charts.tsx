"use client"

import { useLanguage } from "@/lib/language-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  ComposedChart,
  Legend,
} from "recharts"
import {
  TrendingUp,
  TrendingDown,
  Users,
  Eye,
  MousePointerClick,
  Clock,
} from "lucide-react"

// ===================== DATA =====================
const candlestickData = [
  { date: "01/01", open: 100, high: 120, low: 95, close: 115 },
  { date: "02/01", open: 115, high: 130, low: 110, close: 125 },
  { date: "03/01", open: 125, high: 135, low: 118, close: 120 },
  { date: "04/01", open: 120, high: 140, low: 115, close: 138 },
  { date: "05/01", open: 138, high: 150, low: 132, close: 145 },
  { date: "06/01", open: 145, high: 155, low: 140, close: 152 },
  { date: "07/01", open: 152, high: 165, low: 148, close: 160 },
  { date: "08/01", open: 160, high: 168, low: 155, close: 158 },
  { date: "09/01", open: 158, high: 175, low: 155, close: 172 },
  { date: "10/01", open: 172, high: 180, low: 168, close: 175 },
  { date: "11/01", open: 175, high: 190, low: 170, close: 185 },
  { date: "12/01", open: 185, high: 200, low: 180, close: 195 },
].map((item) => ({
  ...item,
  range: item.high - item.low,
  body: Math.abs(item.close - item.open),
}))

const performanceData = [
  { name: "يناير", visits: 4000, engagement: 2400, conversions: 400 },
  { name: "فبراير", visits: 3000, engagement: 1398, conversions: 210 },
  { name: "مارس", visits: 2000, engagement: 9800, conversions: 290 },
  { name: "أبريل", visits: 2780, engagement: 3908, conversions: 400 },
  { name: "مايو", visits: 1890, engagement: 4800, conversions: 281 },
  { name: "يونيو", visits: 2390, engagement: 3800, conversions: 350 },
  { name: "يوليو", visits: 3490, engagement: 4300, conversions: 430 },
]

const socialData = [
  { platform: "Instagram", followers: 45000, engagement: 4.5, growth: 12 },
  { platform: "Facebook", followers: 32000, engagement: 2.8, growth: 8 },
  { platform: "TikTok", followers: 78000, engagement: 8.2, growth: 25 },
]

// ===================== STAT CARD =====================
function StatCard({ title, value, change, icon: Icon }: any) {
  const isPositive = change > 0

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
          <Icon className="h-6 w-6 text-primary" />
        </div>

        <div className="mt-4 flex items-center gap-1 text-sm">
          {isPositive ? (
            <TrendingUp className="h-4 w-4 text-green-500" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-500" />
          )}

          <span className={isPositive ? "text-green-500" : "text-red-500"}>
            {Math.abs(change)}%
          </span>
          <span className="text-muted-foreground">من الشهر الماضي</span>
        </div>
      </CardContent>
    </Card>
  )
}

// ===================== CHARTS =====================

// Candlestick (Safe version)
function CandlestickChart() {
  const { t } = useLanguage()

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("شموع الأداء البياني", "Performance Chart")}</CardTitle>
      </CardHeader>

      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={candlestickData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />

            {/* High-Low Range */}
            <Bar dataKey="range" fill="#8884d8" name="Range" />

            {/* Close trend */}
            <Line
              type="monotone"
              dataKey="close"
              stroke="#82ca9d"
              strokeWidth={2}
              name="Close"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

// Performance
function PerformanceChart() {
  const { t } = useLanguage()

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("تحليل الأداء الشهري", "Performance")}</CardTitle>
      </CardHeader>

      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={performanceData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />

            <Area type="monotone" dataKey="visits" stroke="#8884d8" fill="#8884d8" />
            <Area type="monotone" dataKey="engagement" stroke="#82ca9d" fill="#82ca9d" />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

// Social
function SocialMediaChart() {
  const { t } = useLanguage()

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("السوشيال ميديا", "Social Media")}</CardTitle>
      </CardHeader>

      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={socialData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="platform" />
            <YAxis />
            <Tooltip />
            <Legend />

            <Bar dataKey="followers" fill="#8884d8" />
            <Bar dataKey="growth" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

// Conversion
function ConversionChart() {
  const { t } = useLanguage()

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("التحويلات", "Conversions")}</CardTitle>
      </CardHeader>

      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={performanceData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />

            <Line type="monotone" dataKey="conversions" stroke="#ff7300" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

// ===================== MAIN =====================
export function DashboardCharts() {
  const { t } = useLanguage()

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title={t("الزيارات", "Visits")} value="124,520" change={12.5} icon={Eye} />
        <StatCard title={t("المتابعون", "Followers")} value="155,000" change={8.2} icon={Users} />
        <StatCard title={t("التحويل", "Conversion")} value="3.42%" change={-2.1} icon={MousePointerClick} />
        <StatCard title={t("الوقت", "Session Time")} value="4:32" change={5.8} icon={Clock} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <CandlestickChart />
        <PerformanceChart />
        <SocialMediaChart />
        <ConversionChart />
      </div>
    </div>
  )
}