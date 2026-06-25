"use client"

import Link from "next/link"
import { useLanguage } from "@/lib/language-context"
import { BarChart3, Mail, Phone, MapPin, Youtube, Instagram, Facebook } from "lucide-react"

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

        {/* Social Media Links */}
        <div className="mt-8 border-t border-border pt-8">
          <div className="mb-6 flex justify-center gap-6">
            <a
              href="https://youtube.com/smartland"
              target="_blank"
              rel="noopener noreferrer"
              title={t("اتبعنا على يوتيوب", "Follow us on YouTube")}
              className="text-muted-foreground transition-colors hover:text-primary"
              aria-label="YouTube"
            >
              <Youtube className="h-6 w-6" />
            </a>
            <a
              href="https://instagram.com/smartland"
              target="_blank"
              rel="noopener noreferrer"
              title={t("اتبعنا على انستجرام", "Follow us on Instagram")}
              className="text-muted-foreground transition-colors hover:text-primary"
              aria-label="Instagram"
            >
              <Instagram className="h-6 w-6" />
            </a>
            <a
              href="https://facebook.com/smartland"
              target="_blank"
              rel="noopener noreferrer"
              title={t("اتبعنا على فيسبوك", "Follow us on Facebook")}
              className="text-muted-foreground transition-colors hover:text-primary"
              aria-label="Facebook"
            >
              <Facebook className="h-6 w-6" />
            </a>
            {/* Snapchat Icon - Using custom SVG */}
            <a
              href="https://snapchat.com/add/smartland"
              target="_blank"
              rel="noopener noreferrer"
              title={t("اتبعنا على سناب شات", "Follow us on Snapchat")}
              className="text-muted-foreground transition-colors hover:text-primary"
              aria-label="Snapchat"
            >
              <svg
                className="h-6 w-6"
                fill="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12.06.5c-.3 0-.58.04-.88.07C5.1.9.5 5.75.5 11.6c0 3.45 1.5 6.55 4.04 8.65.06 1.08.36 2.13.82 3.08.46.95 1.08 1.8 1.85 2.5.7.65 1.5 1.2 2.37 1.55 1.33.55 2.86.85 4.42.85s3.09-.3 4.42-.85c.87-.35 1.67-.9 2.37-1.55.77-.7 1.39-1.55 1.85-2.5.46-.95.76-2 .82-3.08 2.54-2.1 4.04-5.2 4.04-8.65 0-5.85-4.6-10.7-10.6-11.03-.3-.03-.58-.07-.88-.07z" />
              </svg>
            </a>
            {/* TikTok Icon */}
            <a
              href="https://tiktok.com/@smartland"
              target="_blank"
              rel="noopener noreferrer"
              title={t("اتبعنا على تيك توك", "Follow us on TikTok")}
              className="text-muted-foreground transition-colors hover:text-primary"
              aria-label="TikTok"
            >
              <svg
                className="h-6 w-6"
                fill="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.68v13.7a2.4 2.4 0 0 1-2.4 2.4 2.4 2.4 0 0 1-2.4-2.4 2.4 2.4 0 0 1 2.4-2.4c.18 0 .37.02.55.07V9.44a6.1 6.1 0 0 0-.55-.05A6.12 6.12 0 0 0 5.78 15.4a6.12 6.12 0 0 0 6.12 6.12 6.12 6.12 0 0 0 6.12-6.12v-3.15a8.15 8.15 0 0 0 3.77 1.04v-3.68a4.83 4.83 0 0 1-3.77 1.88Z" />
              </svg>
            </a>
          </div>

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
