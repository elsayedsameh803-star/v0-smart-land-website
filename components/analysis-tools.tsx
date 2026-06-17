"use client"

import { useState } from "react"
// استيراد الأيقونات بشكل مباشر وتسميتها بأسماء واضحة لتجنب أي شطب
import { Facebook as FBIcon, Instagram as InstaIcon, Video as VideoIcon, Globe as GlobeIcon, Youtube as YTIcon } from "lucide-react"

export default function AnalysisTools() {
  const [loading, setLoading] = useState(false)

  const tools = [
    { id: "facebook", label: "Facebook", icon: FBIcon },
    { id: "instagram", label: "Instagram", icon: InstaIcon },
    { id: "tiktok", label: "TikTok", icon: VideoIcon },
    { id: "website", label: "Website", icon: GlobeIcon },
    { id: "youtube", label: "YouTube", icon: YTIcon },
  ]

  const handleDownload = () => {
    setLoading(true)
    setTimeout(() => setLoading(false), 2000)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <div key={tool.id} className="p-6 bg-card border border-border rounded-lg shadow-sm">
              <Icon className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-lg font-semibold text-foreground">
                {tool.label}
              </h3>
            </div>
          )
        })}
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