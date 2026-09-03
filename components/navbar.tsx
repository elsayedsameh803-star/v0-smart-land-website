"use client"

import Link from "next/link"
import { useLanguage } from "@/lib/language-context"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { BarChart3, Globe, User, LogOut, Menu, X, Loader2 } from "lucide-react"
import { useState } from "react"

export function Navbar() {
  const { language, setLanguage, t } = useLanguage()
  const { user, isLoading, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <BarChart3 className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-foreground">
                {t("سمارت لاند", "Smart Land")}
              </span>
              <span className="text-xs text-muted-foreground">
                {t("لاستشارات وزيادة الأرباح", "Consulting & Growth")}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:gap-6">
            <Link
              href="/"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {t("الرئيسية", "Home")}
            </Link>
            <Link
              href="/dashboard"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {t("لوحة التحكم", "Dashboard")}
            </Link>
            <Link
              href="/analyze"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {t("تحليل", "Analyze")}
            </Link>
            <Link
              href="/privacy"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {t("الخصوصية", "Privacy")}
            </Link>
            <Link
              href="/terms"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {t("الشروط", "Terms")}
            </Link>
            <Link
              href="/contact"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {t("اتصل بنا", "Contact")}
            </Link>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Language Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLanguage(language === "ar" ? "en" : "ar")}
              className="hidden sm:flex"
            >
              <Globe className="mr-2 h-4 w-4" />
              {language === "ar" ? "EN" : "عربي"}
            </Button>

            {/* User Menu */}
            {isLoading ? (
              <Button variant="outline" size="sm" disabled aria-label={t("جاري تحميل الحساب", "Loading account")}>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              </Button>
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <User className="mr-2 h-4 w-4" />
                    {user.name}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/account">{t("حسابي", "My account")}</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">{t("لوحة التحكم", "Dashboard")}</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    {t("تسجيل الخروج", "Logout")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild size="sm">
                <Link href="/login">{t("تسجيل الدخول", "Login")}</Link>
              </Button>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="border-t border-border py-4 md:hidden">
            <div className="flex flex-col gap-3">
              <Link
                href="/"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t("الرئيسية", "Home")}
              </Link>
              <Link
                href="/account"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t("حسابي", "My account")}
              </Link>
              <Link
                href="/dashboard"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t("لوحة التحكم", "Dashboard")}
              </Link>
              <Link
                href="/analyze"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t("تحليل", "Analyze")}
              </Link>
              <Link
                href="/privacy"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t("الخصوصية", "Privacy")}
              </Link>
              <Link
                href="/terms"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t("الشروط", "Terms")}
              </Link>
              <Link
                href="/contact"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t("اتصل بنا", "Contact")}
              </Link>
              {user && !isLoading && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-fit text-destructive hover:text-destructive"
                  onClick={() => {
                    logout()
                    setMobileMenuOpen(false)
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  {t("تسجيل الخروج", "Logout")}
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLanguage(language === "ar" ? "en" : "ar")}
                className="w-fit"
              >
                <Globe className="mr-2 h-4 w-4" />
                {language === "ar" ? "English" : "عربي"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
