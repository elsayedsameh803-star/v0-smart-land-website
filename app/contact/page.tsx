"use client"

import { useState } from "react"
import { LanguageProvider, useLanguage } from "@/lib/language-context"
import { AuthProvider } from "@/lib/auth-context"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { WhatsAppButton } from "@/components/whatsapp-button"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import {
  Mail,
  Phone,
  MapPin,
  Send,
  Loader2,
  CheckCircle2,
  MessageCircle,
} from "lucide-react"

function ContactContent() {
  const { t } = useLanguage()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setSuccess(true)
    setLoading(false)
    setFormData({ name: "", email: "", subject: "", message: "" })
  }

  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      t(
        "مرحباً، أريد الاستفسار عن خدمات سمارت لاند",
        "Hello, I would like to inquire about Smart Land services"
      )
    )
    window.open(`https://wa.me/201272097150?text=${message}`, "_blank")
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-bold text-foreground">
            {t("اتصل بنا", "Contact Us")}
          </h1>
          <p className="mx-auto mt-2 max-w-2xl text-muted-foreground">
            {t(
              "نحن هنا لمساعدتك. تواصل معنا لأي استفسارات أو اقتراحات",
              "We're here to help. Contact us for any inquiries or suggestions"
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Contact Info */}
          <div className="space-y-6">
            <Card className="border-border bg-card">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {t("الهاتف", "Phone")}
                    </h3>
                    <p className="text-sm text-muted-foreground" dir="ltr">
                      +20 127 209 7150
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {t("البريد الإلكتروني", "Email")}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      info@smartland.com
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {t("الموقع", "Location")}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {t("مصر", "Egypt")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* WhatsApp Button */}
            <Button
              onClick={handleWhatsApp}
              className="w-full bg-[#25D366] text-white hover:bg-[#20BD5A]"
            >
              <MessageCircle className="ml-2 h-5 w-5" />
              {t("تواصل عبر واتساب", "Chat on WhatsApp")}
            </Button>
          </div>

          {/* Contact Form */}
          <Card className="border-border bg-card lg:col-span-2">
            <CardContent className="p-6">
              {success ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
                    <CheckCircle2 className="h-8 w-8 text-green-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">
                    {t("تم إرسال رسالتك بنجاح!", "Message Sent Successfully!")}
                  </h3>
                  <p className="mt-2 text-muted-foreground">
                    {t(
                      "سنتواصل معك في أقرب وقت ممكن",
                      "We will get back to you as soon as possible"
                    )}
                  </p>
                  <Button
                    variant="outline"
                    className="mt-6"
                    onClick={() => setSuccess(false)}
                  >
                    {t("إرسال رسالة أخرى", "Send Another Message")}
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        {t("الاسم", "Name")}
                      </label>
                      <Input
                        placeholder={t("أدخل اسمك", "Enter your name")}
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        {t("البريد الإلكتروني", "Email")}
                      </label>
                      <Input
                        type="email"
                        placeholder="email@example.com"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        dir="ltr"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      {t("الموضوع", "Subject")}
                    </label>
                    <Input
                      placeholder={t("موضوع الرسالة", "Message subject")}
                      value={formData.subject}
                      onChange={(e) =>
                        setFormData({ ...formData, subject: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      {t("الرسالة", "Message")}
                    </label>
                    <Textarea
                      placeholder={t("اكتب رسالتك هنا...", "Write your message here...")}
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      rows={6}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="ml-2 h-4 w-4" />
                    )}
                    {t("إرسال الرسالة", "Send Message")}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function ContactPage() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <main className="flex-1">
            <ContactContent />
          </main>
          <Footer />
          <WhatsAppButton />
        </div>
      </AuthProvider>
    </LanguageProvider>
  )
}
