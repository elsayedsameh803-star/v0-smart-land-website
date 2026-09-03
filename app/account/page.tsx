"use client"

import Link from "next/link"
import { AuthProvider, useAuth } from "@/lib/auth-context"
import { LanguageProvider, useLanguage } from "@/lib/language-context"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { WhatsAppButton } from "@/components/whatsapp-button"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, User } from "lucide-react"

function AccountContent() {
  const { t } = useLanguage()
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return <div className="flex min-h-[calc(100vh-200px)] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
  }

  if (!user) {
    return (
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md text-center">
          <CardHeader><CardTitle>{t("تسجيل الدخول لعرض حسابك", "Sign in to view your account")}</CardTitle></CardHeader>
          <CardContent><Button asChild><Link href="/login">{t("تسجيل الدخول", "Sign in")}</Link></Button></CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-200px)] max-w-3xl items-center justify-center px-4 py-12">
      <Card className="w-full">
        <CardHeader><CardTitle className="flex items-center gap-2"><User className="h-5 w-5" />{t("حسابي", "My account")}</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p><span className="text-muted-foreground">{t("الاسم:", "Name:")}</span> {user.name}</p>
          <p><span className="text-muted-foreground">{t("البريد الإلكتروني:", "Email:")}</span> {user.email}</p>
        </CardContent>
      </Card>
    </div>
  )
}

export default function AccountPage() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <main className="flex-1"><AccountContent /></main>
          <Footer />
          <WhatsAppButton />
        </div>
      </AuthProvider>
    </LanguageProvider>
  )
}
