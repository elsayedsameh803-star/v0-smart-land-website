"use client"

import { LanguageProvider, useLanguage } from "@/lib/language-context"
import { AuthProvider } from "@/lib/auth-context"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { WhatsAppButton } from "@/components/whatsapp-button"
import { Card, CardContent } from "@/components/ui/card"
import {
  FileText,
  UserCheck,
  CreditCard,
  AlertTriangle,
  Scale,
  RefreshCw,
} from "lucide-react"

function TermsContent() {
  const { t } = useLanguage()

  const sections = [
    {
      icon: UserCheck,
      title: t("قبول الشروط", "Acceptance of Terms"),
      content: t(
        "باستخدامك لمنصة سمارت لاند، فإنك توافق على الالتزام بهذه الشروط والأحكام. إذا كنت لا توافق على أي جزء من هذه الشروط، يرجى عدم استخدام خدماتنا.",
        "By using the Smart Land platform, you agree to be bound by these Terms and Conditions. If you do not agree to any part of these terms, please do not use our services."
      ),
    },
    {
      icon: FileText,
      title: t("وصف الخدمة", "Service Description"),
      content: t(
        "توفر سمارت لاند أدوات تحليل البيانات للمواقع الإلكترونية ومنصات التواصل الاجتماعي. تشمل خدماتنا تحليل الأداء، وتقارير SEO، ورؤى وسائل التواصل الاجتماعي، وتوصيات للتحسين.",
        "Smart Land provides data analytics tools for websites and social media platforms. Our services include performance analysis, SEO reports, social media insights, and optimization recommendations."
      ),
    },
    {
      icon: CreditCard,
      title: t("الحسابات والفوترة", "Accounts & Billing"),
      content: t(
        "بعض خدماتنا قد تتطلب اشتراكاً مدفوعاً. أنت مسؤول عن الحفاظ على سرية معلومات حسابك وعن جميع الأنشطة التي تحدث تحت حسابك. يجب تقديم معلومات دقيقة وكاملة.",
        "Some of our services may require a paid subscription. You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account. You must provide accurate and complete information."
      ),
    },
    {
      icon: AlertTriangle,
      title: t("الاستخدام المقبول", "Acceptable Use"),
      content: t(
        "توافق على عدم استخدام خدماتنا لأي أغراض غير قانونية أو محظورة بموجب هذه الشروط. يُحظر محاولة الوصول غير المصرح به أو تعطيل خدماتنا أو إساءة استخدام البيانات.",
        "You agree not to use our services for any unlawful or prohibited purposes under these terms. Unauthorized access attempts, disrupting our services, or misusing data is prohibited."
      ),
    },
    {
      icon: Scale,
      title: t("حدود المسؤولية", "Limitation of Liability"),
      content: t(
        "يتم تقديم خدماتنا \"كما هي\" دون أي ضمانات. لا نتحمل المسؤولية عن أي أضرار مباشرة أو غير مباشرة أو عرضية ناتجة عن استخدام أو عدم القدرة على استخدام خدماتنا.",
        "Our services are provided \"as is\" without any warranties. We are not liable for any direct, indirect, or incidental damages arising from the use or inability to use our services."
      ),
    },
    {
      icon: RefreshCw,
      title: t("تعديل الشروط", "Modification of Terms"),
      content: t(
        "نحتفظ بالحق في تعديل هذه الشروط في أي وقت. ستكون التغييرات سارية فور نشرها على منصتنا. استمرارك في استخدام الخدمات بعد أي تعديلات يشكل موافقتك على الشروط الجديدة.",
        "We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting on our platform. Your continued use of the services after any modifications constitutes your acceptance of the new terms."
      ),
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10">
            <FileText className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            {t("الشروط والأحكام", "Terms & Conditions")}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {t(
              "آخر تحديث: يناير 2024",
              "Last updated: January 2024"
            )}
          </p>
        </div>

        {/* Introduction */}
        <Card className="mb-8 border-border bg-card">
          <CardContent className="p-6">
            <p className="text-muted-foreground">
              {t(
                "مرحباً بك في سمارت لاند. تحكم هذه الشروط والأحكام استخدامك لمنصتنا وخدماتنا. يرجى قراءتها بعناية قبل استخدام أي من خدماتنا.",
                "Welcome to Smart Land. These Terms and Conditions govern your use of our platform and services. Please read them carefully before using any of our services."
              )}
            </p>
          </CardContent>
        </Card>

        {/* Sections */}
        <div className="space-y-6">
          {sections.map((section, index) => (
            <Card key={index} className="border-border bg-card">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <section.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="mb-2 text-lg font-semibold text-foreground">
                      {index + 1}. {section.title}
                    </h2>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {section.content}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contact */}
        <Card className="mt-8 border-border bg-card">
          <CardContent className="p-6 text-center">
            <h2 className="mb-2 text-lg font-semibold text-foreground">
              {t("أسئلة؟", "Questions?")}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t(
                "إذا كان لديك أي أسئلة حول هذه الشروط والأحكام، يرجى التواصل معنا.",
                "If you have any questions about these Terms and Conditions, please contact us."
              )}
            </p>
            <p className="mt-2 text-sm text-primary" dir="ltr">
              +20 127 209 7150 | info@smartland.com
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function TermsPage() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <main className="flex-1">
            <TermsContent />
          </main>
          <Footer />
          <WhatsAppButton />
        </div>
      </AuthProvider>
    </LanguageProvider>
  )
}
