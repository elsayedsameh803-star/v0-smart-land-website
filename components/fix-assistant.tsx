"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2, Lightbulb, Sparkles } from "lucide-react"

interface FixAssistantProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  issue: string
  evidence: string
  language: "ar" | "en"
}

export default function FixAssistant({ open, onOpenChange, issue, evidence, language }: FixAssistantProps) {
  const [fixSuggestion, setFixSuggestion] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const generateFix = async () => {
    setLoading(true)
    setFixSuggestion(null)

    // Use a local AI-like generation based on the issue
    // This simulates what would be a call to an AI service
    setTimeout(() => {
      const suggestion = generateLocalFix(issue, evidence, language)
      setFixSuggestion(suggestion)
      setLoading(false)
    }, 800)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border border-amber-400/20 bg-slate-950 text-white sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-amber-300">
            <Sparkles className="h-5 w-5" />
            {language === "ar" ? "مساعد الإصلاح الذكي" : "AI Fix Assistant"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Issue context */}
          <div className="rounded-xl bg-slate-900/80 p-3 text-xs text-slate-400">
            <span className="font-semibold text-amber-300">
              {language === "ar" ? "المشكلة:" : "Issue:"}
            </span>{" "}
            {issue}
          </div>

          {!fixSuggestion && !loading && (
            <Button
              onClick={generateFix}
              className="w-full bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500 text-slate-950 font-semibold hover:opacity-90"
            >
              <Lightbulb className="mr-2 h-4 w-4" />
              {language === "ar" ? "توليد حل مخصص" : "Generate specific fix"}
            </Button>
          )}

          {loading && (
            <div className="flex items-center justify-center gap-2 py-6 text-sm text-amber-300">
              <Loader2 className="h-5 w-5 animate-spin" />
              {language === "ar" ? "تحليل المشكلة وتوليد الحل..." : "Analyzing issue and generating solution..."}
            </div>
          )}

          {fixSuggestion && (
            <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/5 p-4">
              <pre className="whitespace-pre-wrap text-xs text-slate-300 leading-relaxed font-sans">
                {fixSuggestion}
              </pre>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function generateLocalFix(issue: string, evidence: string, language: "ar" | "en"): string {
  const isAr = language === "ar"

  if (issue.includes("title") || issue.includes("عنوان")) {
    return isAr
      ? `لإصلاح مشكلة العنوان المفقود أو غير المناسب:

1. أضف وسم <title> داخل قسم <head> في صفحة HTML
2. تأكد أن الطول بين 50-60 حرفاً
3. استخدم الكلمة المفتاحية الأساسية في البداية
4. أضف اسم العلامة التجارية في النهاية

مثال:
<title>استشارات تسويق رقمي - سمارت لاند</title>

التأثير المتوقع: تحسين معدل النقر من نتائج البحث بنسبة تصل إلى 40%`
      : `To fix the missing or poor title tag:

1. Add a <title> tag inside the <head> section of your HTML page
2. Keep length between 50-60 characters
3. Place primary keyword at the beginning
4. Add brand name at the end

Example:
<title>Digital Marketing Consulting - Smart Land</title>

Expected impact: Up to 40% improvement in search result click-through rate`
  }

  if (issue.includes("description") || issue.includes("وصف")) {
    return isAr
      ? `لإصلاح مشكلة وصف الميتا المفقود:

1. أضف وسم <meta name="description"> داخل <head>
2. اجعل الطول بين 150-160 حرفاً
3. اكتب وصفاً مقنعاً يتضمن الكلمة المفتاحية
4. أضف دعوة لاتخاذ إجراء (CTA)

مثال:
<meta name="description" content="احصل على استشارة تسويق رقمي احترافية. نحلل موقعك ونقدم توصيات مخصصة لزيادة أرباحك.">

التأثير المتوقع: زيادة نسبة النقر من نتائج البحث`
      : `To fix the missing meta description:

1. Add <meta name="description"> inside <head>
2. Keep length between 150-160 characters
3. Write compelling copy with keywords
4. Include a call to action (CTA)

Example:
<meta name="description" content="Get professional digital marketing consulting. We analyze your site and provide custom recommendations to increase profits.">

Expected impact: Higher click-through rate from search results`
  }

  if (issue.includes("HTTPS") || issue.includes("SSL") || issue.includes("آمن")) {
    return isAr
      ? `لإصلاح مشكلة الأمان (HTTPS):

1. اشترِ شهادة SSL من موفر موثوق (Let's Encrypt مجانية)
2. ثبّت الشهادة على الخادم
3. أعد توجيه جميع زوار HTTP إلى HTTPS

مثال لإعادة التوجيه في .htaccess:
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}/$1 [R=301,L]

التأثير المتوقع: تحسين الثقة لدى الزوار وتحسين ترتيب البحث`
      : `To fix the HTTPS/SSL issue:

1. Purchase an SSL certificate from a trusted provider (Let's Encrypt is free)
2. Install the certificate on your server
3. Redirect all HTTP traffic to HTTPS

Example .htaccess redirect:
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}/$1 [R=301,L]

Expected impact: Improved user trust and better search ranking`
  }

  // Generic fallback
  return isAr
    ? `حل مخصص للمشكلة المكتشفة:

المشكلة: ${issue}
الدليل: ${evidence}

خطوات الإصلاح المقترحة:
1. راجع الموقع أو العنصر المذكور في موقع المشكلة
2. طبق التغييرات الموصى بها في بطاقة التشخيص
3. أعد التحليل للتحقق من تحسن النتيجة

نصيحة: استخدم أدوات المطورين في المتصفح لفحص العناصر المتأثرة مباشرة`
    : `Custom fix for the detected issue:

Issue: ${issue}
Evidence: ${evidence}

Suggested fix steps:
1. Review the site or element mentioned in the issue location
2. Apply the recommended changes from the diagnostic card
3. Re-analyze to verify the improvement

Tip: Use browser developer tools to inspect affected elements directly`
}