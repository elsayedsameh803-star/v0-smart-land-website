"use client"

import { useState } from "react"
import { useLanguage } from "@/lib/language-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Play } from "lucide-react"
import SimpleResults from "./simple-results"

const SOCIAL_PLATFORMS = [
  { id: "youtube", label: "YouTube", icon: "▶" },
  { id: "instagram", label: "Instagram", icon: "📷" },
  { id: "facebook", label: "Facebook", icon: "f" },
  { id: "tiktok", label: "TikTok", icon: "♪" },
  { id: "linkedin", label: "LinkedIn", icon: "in" },
  { id: "snapchat", label: "Snapchat", icon: "👻" },
]

export default function SocialMediaAnalyzer() {
  const { language } = useLanguage()
  const [selectedPlatform, setSelectedPlatform] = useState("youtube")
  const [handle, setHandle] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [results, setResults] = useState<any>(null)

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!handle.trim()) {
      setError(language === "ar" ? "أدخل اسم المستخدم" : "Enter the user handle")
      return
    }

    setLoading(true)
    setError("")
    setResults(null)

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: selectedPlatform,
          handle: handle.trim(),
          language,
        }),
      })

      if (!response.ok) {
        throw new Error("Analysis failed")
      }

      const data = await response.json()
      setResults(data.analysis)
      setHandle("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed")
      console.error("[v0] Social analysis error:", err)
    } finally {
      setLoading(false)
    }
  }

  const platformLabel = SOCIAL_PLATFORMS.find(p => p.id === selectedPlatform)?.label || ""

  return (
    <div className="space-y-6">
      {/* Platform Selection */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">
          {language === "ar" ? "اختر منصة التواصل" : "Select Social Platform"}
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
          {SOCIAL_PLATFORMS.map((platform) => (
            <button
              key={platform.id}
              onClick={() => setSelectedPlatform(platform.id)}
              className={`py-3 px-2 rounded-lg font-medium transition-all text-sm ${
                selectedPlatform === platform.id
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "bg-muted hover:bg-muted/80"
              }`}
            >
              <div className="text-xl mb-1">{platform.icon}</div>
              {platform.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <form onSubmit={handleAnalyze} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">
            {language === "ar"
              ? `اسم المستخدم على ${platformLabel}`
              : `${platformLabel} Username/Handle`}
          </label>
          <Input
            placeholder={language === "ar" ? "مثال: username" : "e.g., @username"}
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            disabled={loading}
            className="w-full"
          />
        </div>

        {error && (
          <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
            {error}
          </div>
        )}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {language === "ar" ? "جاري التحليل..." : "Analyzing..."}
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              {language === "ar" ? "تحليل" : "Analyze"}
            </>
          )}
        </Button>
      </form>

      {/* Results */}
      {results && (
        <div className="space-y-4">
          <SimpleResults result={results} />
        </div>
      )}
    </div>
  )
}
