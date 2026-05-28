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
const socialPlatforms = [
  { name: "YouTube", key: "youtube" },
  { name: "LinkedIn", key: "linkedin" },
  { name: "Telegram", key: "telegram" },
  { name: "Pinterest", key: "pinterest" },
  { name: "Reddit", key: "reddit" },
  { name: "BIGO LIVE", key: "bigo" },
];

// Candlestick data simulation
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
]

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

interface StatCardProps {
  title: string
  value: string
  change: number
  icon: React.ElementType
}

function StatCard({ title, value, change, icon: Icon }: StatCardProps) {
  const isPositive = change > 0

  return (
    <Card className="border-border bg-card">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="h-6 w-6 text-primary" />
          </div>
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

// Custom Candlestick component
function CandlestickChart() {
  const { t } = useLanguage()

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          {t("شموع الأداء البياني", "Performance Candlestick Chart")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={candlestickData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
            <YAxis stroke="hsl(var(--muted-foreground))" />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "hsl(var(--foreground))" }}
            />
            <Legend />
            <Bar
              dataKey="low"
              fill="transparent"
              stackId="candle"
              name={t("أدنى", "Low")}
            />
            <Bar
              dataKey={(data) => data.close - data.low}
              fill="hsl(var(--chart-2))"
              stackId="candle"
              name={t("إغلاق", "Close")}
              radius={[4, 4, 0, 0]}
            />
            <Line
              type="monotone"
              dataKey="high"
              stroke="hsl(var(--chart-1))"
              strokeWidth={2}
              dot={{ fill: "hsl(var(--chart-1))", strokeWidth: 2 }}
              name={t("أعلى", "High")}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

function PerformanceChart() {
  const { t } = useLanguage()

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-primary" />
          {t("تحليل الأداء الشهري", "Monthly Performance Analysis")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={performanceData}>
            <defs>
              <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
            <YAxis stroke="hsl(var(--muted-foreground))" />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="visits"
              stroke="hsl(var(--chart-1))"
              fillOpacity={1}
              fill="url(#colorVisits)"
              name={t("الزيارات", "Visits")}
            />
            <Area
              type="monotone"
              dataKey="engagement"
              stroke="hsl(var(--chart-2))"
              fillOpacity={1}
              fill="url(#colorEngagement)"
              name={t("التفاعل", "Engagement")}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

function SocialMediaChart() {
  const { t } = useLanguage()

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          {t("تحليل السوشيال ميديا", "Social Media Analysis")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={socialData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="platform" stroke="hsl(var(--muted-foreground))" />
            <YAxis stroke="hsl(var(--muted-foreground))" />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Bar
              dataKey="followers"
              fill="hsl(var(--chart-1))"
              name={t("المتابعون", "Followers")}
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="growth"
              fill="hsl(var(--chart-2))"
              name={t("النمو %", "Growth %")}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

function ConversionChart() {
  const { t } = useLanguage()

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MousePointerClick className="h-5 w-5 text-primary" />
          {t("معدل التحويلات", "Conversion Rate")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={performanceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
            <YAxis stroke="hsl(var(--muted-foreground))" />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="conversions"
              stroke="hsl(var(--chart-3))"
              strokeWidth={3}
              dot={{ fill: "hsl(var(--chart-3))", strokeWidth: 2, r: 4 }}
              name={t("التحويلات", "Conversions")}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export function DashboardCharts() {
  const { t } = useLanguage()

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t("إجمالي الزيارات", "Total Visits")}
          value="124,520"
          change={12.5}
          icon={Eye}
        />
        <StatCard
          title={t("المتابعون", "Followers")}
          value="155,000"
          change={8.2}
          icon={Users}
        />
        <StatCard
          title={t("معدل التحويل", "Conversion Rate")}
          value="3.42%"
          change={-2.1}
          icon={MousePointerClick}
        />
        <StatCard
          title={t("متوسط وقت الجلسة", "Avg. Session")}
          value="4:32"
          change={5.8}
          icon={Clock}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <CandlestickChart />
        <PerformanceChart />
        <SocialMediaChart />
        <ConversionChart />
      </div>
    </div>
  )
}
