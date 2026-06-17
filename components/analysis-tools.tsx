"use client"

import { useState } from "react"
import { Facebook, Instagram, Video, Globe, Youtube, FileText } from "lucide-react"

export default function AnalysisTools() {
  const [loading, setLoading] = useState(false)

  const tools = [
    { id: "facebook", name: "Facebook", icon: Facebook },
    { id: "instagram", name: "Instagram", icon: Instagram },
    { id: "tiktok", name: "TikTok", icon: Video },
    { id: "website", name: "Website", icon: Globe },
    { id: "youtube", name: "YouTube", icon: Youtube },
  ]

  const handleToolClick = (id: string) => {
    alert("جاري تحليل: " + id)
    // هنا سيتم ربط منطق التحليل لاحقاً
  }

  return (
    <div className="w-full space-y-8 p-6 bg-black min-h-screen">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => {
          const Icon = tool.icon
          return (
            <button
              key={tool.id}
              onClick={() => handleToolClick(tool.id)}
              className="flex flex-col items-center justify-center p-8 bg-black border-2 border-yellow-400 rounded-xl shadow-[0_0_15px_rgba(250,204,21,0.2)] hover:bg-yellow-400/10 transition-all"
            >
              <Icon className="h-12 w-12 text-yellow-400 mb-4" />
              <h3 className="text-xl font-bold text-yellow-400 uppercase tracking-wider">{tool.name}</h3>
            </button>
          )
        })}
      </div>

      <button 
        onClick={() => setLoading(true)}
        disabled={loading}
        className="w-full py-6 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-2xl shadow-lg transition-all"
      >
        {loading ? "جاري التصدير... Exporting..." : "تصدير التقرير (AR/EN) - Download Report"}
      </button>
    </div>
  )
}