"use client"

import { useState } from "react"
import { Facebook, Instagram, Video, Globe, Youtube } from "lucide-react"
import { exportAnalysisPDF } from "@/lib/pdf-export"

export default function AnalysisTools() {
  const [loading, setLoading] = useState(false)

  const handleDownload = () => {
    setLoading(true)
    // هنا يتم استدعاء دالة التصدير مع البيانات المجمعة
    exportAnalysisPDF({
      title: "تقرير تحليل الموقع الذكي",
      date: new Date().toLocaleDateString("ar-EG"),
      score: 85,
      metrics: [
        { label: "سرعة التحميل", value: "ممتاز (1.2 ثانية)" },
        { label: "الأداء العام", value: "90%" }
      ],
      issues: [],
      recommendations: [],
      language: "ar"
    })
    setLoading(false)
  }

  const tools = [
    { id: 'facebook', label: 'Facebook', icon: Facebook },
    { id: 'instagram', label: 'Instagram', icon: Instagram },
    { id: 'tiktok', label: 'TikTok', icon: Video },
    { id: 'website', label: 'Website', icon: Globe },
    { id: 'youtube', label: 'YouTube', icon: Youtube },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <div key={tool.id} className="p-6 bg-card border border-border rounded-lg shadow-sm">
            <tool.icon className="h-10 w-10 text-primary mb-4" />
            <h3 className="text-lg font-semibold">{tool.label}</h3>
          </div>
        ))}
      </div>
      
      <button 
        onClick={handleDownload}
        disabled={loading}
        className="w-full py-3 bg-primary text-primary-foreground rounded-md font-bold"
      >
        {loading ? "جاري التصدير..." : "تصدير التقرير (AR/EN)"}
      </button>
    </div>
  )
}