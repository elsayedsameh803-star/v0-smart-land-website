"use client"

import { LanguageProvider, useLanguage } from "@/lib/language-context"
import { AuthProvider } from "@/lib/auth-context"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { WhatsAppButton } from "@/components/whatsapp-button"
import { Card, CardContent } from "@/components/ui/card"
import { Shield, Eye, Lock, Database, UserCheck, FileText } from "lucide-react"

function PrivacyContent() {
  const { t } = useLanguage()

  const sections = [
    {
      icon: Eye,
      title: t("جمع البيانات", "Data Collection"),
      content: t(
        "نقوم بجمع المعلومات التي تقدمها لنا مباشرة، مثل اسمك وعنوان بريدك الإلكتروني عند إنشاء حساب. كما نجمع بيانات الاستخدام تلقائياً عند تفاعلك مع منصتنا.",
        "We collect information you provide directly to us, such as your name and email address when you create an account. We also automatically collect usage data when you interact with our platform."
      ),
    },
    {
      icon: Database,
      title: t("استخدام البيانات", "Data Usage"),
      content: t(
        "نستخدم المعلومات التي نجمعها لتوفير وتحسين خدماتنا، وتخصيص تجربتك، والتواصل معك بشأن حسابك والتحديثات. لا نبيع بياناتك الشخصية لأطراف ثالثة.",
        "We use the information we collect to provide and improve our services, personalize your experience, and communicate with you about your account and updates. We do not sell your personal data to third parties."
      ),
    },
    {
      icon: Lock,
      title: t("أمان البيانات", "Data Security"),
      content: t(
        "نطبق تدابير أمنية معيارية في الصناعة لحماية بياناتك، بما في ذلك التشفير والتخزين الآمن. نراجع ممارساتنا الأمنية بانتظام للتأكد من بقاء بياناتك محمية.",
        "We implement industry-standard security measures to protect your data, including encryption and secure storage. We regularly review our security practices to ensure your data remains protected."
      ),
    },
    {
      icon: UserCheck,
      title: t("حقوقك", "Your Rights"),
      content: t(
        "لديك الحق في الوصول إلى بياناتك الشخصية وتصحيحها وحذفها. يمكنك أيضاً إلغاء الاشتراك في الاتصالات التسويقية في أي وقت. تواصل معنا لممارسة هذه الحقوق.",
        "You have the right to access, correct, and delete your personal data. You can also opt out of marketing communications at any time. Contact us to exercise these rights."
      ),
    },
    {
      icon: FileText,
      title: t("ملفات تعريف الارتباط", "Cookies"),
      content: t(
        "نستخدم ملفات تعريف الارتباط وتقنيات التتبع المماثلة لتحسين تجربتك على منصتنا. يمكنك التحكم في إعدادات ملفات تعريف الارتباط من خلال متصفحك.",
        "We use cookies and similar tracking technologies to improve your experience on our platform. You can control cookie settings through your browser."
      ),
    },
    {
      icon: Shield,
      title: t("تحديثات السياسة", "Policy Updates"),
      content: t(
        "قد نقوم بتحديث سياسة الخصوصية هذه من وقت لآخر. سنخطرك بأي تغييرات جوهرية عبر البريد الإلكتروني أو من خلال إشعار بارز على منصتنا.",
        "We may update this privacy policy from time to time. We will notify you of any material changes via email or through a prominent notice on our platform."
      ),
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            {t("سياسة الخصوصية", "Privacy Policy")}
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
                "نحن في سمارت لاند نأخذ خصوصيتك على محمل الجد. توضح سياسة الخصوصية هذه كيفية جمعنا واستخدامنا وحمايتنا لمعلوماتك الشخصية عند استخدامك لمنصتنا.",
                "At Smart Land, we take your privacy seriously. This Privacy Policy explains how we collect, use, and protect your personal information when you use our platform."
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
                      {section.title}
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
              {t("اتصل بنا", "Contact Us")}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t(
                "إذا كان لديك أي أسئلة حول سياسة الخصوصية هذه، يرجى التواصل معنا عبر الواتساب أو البريد الإلكتروني.",
                "If you have any questions about this Privacy Policy, please contact us via WhatsApp or email."
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

export default function PrivacyPage() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <main className="flex-1">
            <PrivacyContent />
          </main>
          <Footer />
          <WhatsAppButton />
        </div>
      </AuthProvider>
    </LanguageProvider>
  )
}
