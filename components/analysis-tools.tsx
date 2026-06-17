"use client"

import { useState } from "react"
import { Facebook, Instagram, Video, Globe, Youtube } from "lucide-react"

export default function AnalysisTools() {
  const [loading, setLoading] = useState(false)

  const tools = [
    { id: "facebook", label: "Facebook", icon: Facebook },
    { id: "instagram", label: "Instagram", icon: Instagram },
    { id: "tiktok", label: "TikTok", icon: Video },
    { id: "website", label: "Website", icon: Globe },
    { id: "youtube", label: "YouTube", icon: Youtube },
  ]

  const handleDownload = () => {
    setLoading(true)
    // هنا منطق التصدير الخاص بك
    setTimeout(() => setLoading(false), 2000)
  }

  return (
    <div className="space-y-6">
      {/* شبكة الأدوات - الأسود في أصفر */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <div key={tool.id} className="p-6 bg-black border-2 border-yellow-400 rounded-lg shadow-lg hover:border-yellow-500 transition-all">
            <tool.icon className="h-10 w-10 text-yellow-400 mb-4" />
            <h3 className="text-lg font-bold text-yellow-400">
              {tool.label}
            </h3>
          </div>
        ))}
      </div>
      
      {/* زر التصدير - أخضر */}
      <button 
        onClick={handleDownload}
        disabled={loading}
        className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-md font-bold text-lg shadow-md transition-all disabled:bg-gray-600"
      >
        {loading ? "جاري تصدير الملف... Exporting PDF..." : "تصدير التقرير (AR/EN) - Export Report"}
      </button>
    </div>
  )
}