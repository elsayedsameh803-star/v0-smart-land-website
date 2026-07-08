"use client"

import { useLanguage } from "@/lib/language-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, AlertTriangle, Wrench } from "lucide-react"

export function Recommendations() {
  const { t } = useLanguage()

  // مؤقت — في النسخة الاحترافية سنجلب هذه النتائج من الـ API
  const features = [
    "تحسين سرعة التحميل (ضغط الصور وLazy-loading)",
    "تحسين عناوين الصفحات و meta tags للـ SEO",
    "تفعيل Caching و CDN للملفات الثابتة",
  ]

  const issues = [
    { type: "critical", message: "صور كبيرة تؤثر على زمن التحميل" },
    { type: "warning", message: "بعض الروابط لا تحتوي على وسم alt" },
  ]

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wrench className="h-5 w-5 text-primary" />
          {t("توصيات ومميزات", "Recommendations & Fixes")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <h4 className="mb-2 text-sm font-semibold">{t("مميزات مقترحة", "Suggested Features")}</h4>
          <ul className="space-y-2">
            {features.map((f, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-1" />
                <span className="text-sm text-foreground">{f}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-2 text-sm font-semibold">{t("المشاكل المكتشفة", "Detected Issues")}</h4>
          <ul className="space-y-2">
            {issues.map((i, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500 mt-1" />
                <span className="text-sm text-foreground">{i.message}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

export default Recommendations
