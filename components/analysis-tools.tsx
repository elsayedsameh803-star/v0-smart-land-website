"use client"

import { useState } from "react"
import { exportAnalysisPDF } from "@/lib/pdf-export"

export default function AnalysisTools() {
  const [loading, setLoading] = useState(false)

  const handleDownload = () => {
    setLoading(true)
    // بيانات تجريبية للتقرير
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

  return (
    <div className="p-6 bg-card rounded-xl border shadow-sm space-y-4">
      <h2 className="text-xl font-bold">أدوات التحليل والتقارير</h2>
      <p className="text-muted-foreground text-sm">يمكنك تحميل تقرير الأداء الشامل بصيغة PDF فوراً.</p>
      <button 
        onClick={handleDownload}
        disabled={loading}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
      >
        {loading ? "جاري التحضير..." : "تحميل التقرير (PDF)"}
      </button>
    </div>
  )
}