"use client"

import React from "react"
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
  Legend,
} from "recharts"
import {
  Eye,
  Users,
  MousePointerClick,
  Clock,
} from "lucide-react"

/* ================= SAFE DATA ================= */

const data = [
  { name: "Jan", visits: 4000, users: 2400, clicks: 1200 },
  { name: "Feb", visits: 3000, users: 1398, clicks: 900 },
  { name: "Mar", visits: 2000, users: 9800, clicks: 1500 },
  { name: "Apr", visits: 2780, users: 3908, clicks: 2000 },
  { name: "May", visits: 1890, users: 4800, clicks: 1700 },
  { name: "Jun", visits: 2390, users: 3800, clicks: 2100 },
]

const social = [
  { name: "Instagram", value: 45000 },
  { name: "Facebook", value: 32000 },
  { name: "TikTok", value: 78000 },
]

/* ================= STATS ================= */

function StatCard({ title, value, icon: Icon }: any) {
  return (
    <Card>
      <CardContent className="p-5 flex justify-between items-center">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <Icon className="text-primary w-5 h-5" />
      </CardContent>
    </Card>
  )
}

/* ================= DASHBOARD ================= */

export default function Dashboard() {
  return (
    <div className="space-y-6 p-6">

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Visits" value="124,520" icon={Eye} />
        <StatCard title="Users" value="155,000" icon={Users} />
        <StatCard title="Clicks" value="3.42%" icon={MousePointerClick} />
        <StatCard title="Session" value="4:32" icon={Clock} />
      </div>

      {/* CHARTS GRID */}
      <div className="grid lg:grid-cols-2 gap-6">

        {/* AREA CHART */}
        <Card>
          <CardHeader>
            <CardTitle>Traffic Overview</CardTitle>
          </CardHeader>

          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />

                <Area
                  type="monotone"
                  dataKey="visits"
                  stroke="#6366f1"
                  fillOpacity={0.2}
                />

                <Area
                  type="monotone"
                  dataKey="users"
                  stroke="#22c55e"
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* BAR CHART */}
        <Card>
          <CardHeader>
            <CardTitle>Social Stats</CardTitle>
          </CardHeader>

          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={social}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />

                <Bar dataKey="value" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* LINE CHART */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Clicks Trend</CardTitle>
          </CardHeader>

          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />

                <Line
                  type="monotone"
                  dataKey="clicks"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}