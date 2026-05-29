"use client"

import { useLanguage } from "@/lib/language-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Users, Eye, Clock, MousePointerClick, Percent } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from "recharts"

// البيانات الخاصة بك
const performanceData = [
  { name: "يناير", visits: 4000, engagement: 2400, conversions: 400 },
  { name: "فبراير", visits: 3000, engagement: 1398, conversions: 210 },
  { name: "مارس", visits: 2000, engagement: 9800, conversions: 290 },
];

const socialData = [
  { platform: "Instagram", followers: 45000, engagement: 4.5, growth: 12 },
  { platform: "Facebook", followers: 32000, engagement: 2.8, growth: 8 },
  { platform: "TikTok", followers: 78000, engagement: 8.2, growth: 25 },
];

// المكونات الفرعية
function StatCard({ title, value, change, icon: Icon }: any) {
  const isPositive = change > 0
  return (
    <Card className="border-border bg-card">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
          </div>
          <Icon className="h-6 w-6 text-primary" />
        </div>
      </CardContent>
    </Card>
  )
}

function SocialMediaChart() {
  return (
    <Card>
      <CardHeader><CardTitle>Social Media</CardTitle></CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={socialData}>
            <XAxis dataKey="platform" />
            <Tooltip />
            <Bar dataKey="followers" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

function ConversionChart() {
  return (
    <Card>
      <CardHeader><CardTitle>Conversion Rate</CardTitle></CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={performanceData}>
            <XAxis dataKey="name" />
            <Tooltip />
            <Line dataKey="conversions" stroke="#82ca9d" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

// المكون الرئيسي في الأسفل
export default function DashboardCharts() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="الزيارات" value="124,520" change={12.5} icon={Eye} />
        <StatCard title="المتابعون" value="155,000" change={8.2} icon={Users} />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SocialMediaChart />
        <ConversionChart />
      </div>
    </div>
  )
}
