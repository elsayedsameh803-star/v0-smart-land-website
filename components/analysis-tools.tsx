"use client"

import { useState } from "react"
import { exportAnalysisPDF } from "@/lib/pdf-export"

export default function AnalysisTools() {
  const [loading, setLoading] = useState(false)

  const handleDownload = () => {
    setLoading(true)
    exportAnalysisPDF({
      title: "Smart Land Analysis Report",
      date: new Date().toLocaleDateString("en-US"),
      score: 85,
      metrics: [
        { label: "Loading Speed", value: "Excellent (1.2s)" },
        { label: "Overall Performance", value: "90%" }
      ],
      issues: [],
      recommendations: []
      // شيلت language: "ar"
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