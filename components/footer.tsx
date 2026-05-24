"use client"

import Link from "next/link"
import { useLanguage } from "@/lib/language-context"
import { BarChart3, Mail, Phone, MapPin } from "lucide-react"

export function Footer() {
  const { t } = useLanguage()

  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Logo & Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3">
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
            </div>
            <p className="mt-4 max-w-md text-sm text-muted-foreground">
              {t(
                "منصة سمارت لاند المتخصصة في تحليل البيانات والمواقع والسوشيال ميديا. نقدم استشارات احترافية لزيادة أرباح مواقعك وحساباتك.",
                "Smart Land platform specializes in data analytics, websites, and social media analysis. We provide professional consulting to increase your website and account profits."
              )}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground">
              {t("روابط سريعة", "Quick Links")}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/dashboard"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {t("لوحة التحكم", "Dashboard")}
                </Link>
              </li>
              <li>
                <Link
                  href="/analyze"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {t("تحليل البيانات", "Data Analysis")}
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {t("سياسة الخصوصية", "Privacy Policy")}
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {t("الشروط والأحكام", "Terms & Conditions")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground">
              {t("تواصل معنا", "Contact Us")}
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span dir="ltr">+20 127 209 7150</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>info@smartland.com</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{t("مصر", "Egypt")}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-8">
          <p className="text-center text-sm text-muted-foreground">
            {t(
              `© ${new Date().getFullYear()} سمارت لاند. جميع الحقوق محفوظة.`,
              `© ${new Date().getFullYear()} Smart Land. All rights reserved.`
            )}
          </p>
        </div>
      </div>
    </footer>
  )
}
