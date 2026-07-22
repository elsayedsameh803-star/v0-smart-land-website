import type { Metadata } from "next";
import { Inter, Cairo } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getDictionary } from "@/lib/i18n";
import { Toaster } from "sonner";
import "../globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const cairo = Cairo({ subsets: ["arabic"], variable: "--font-cairo" });

export const metadata: Metadata = {
  title: "Smart Land - AI Digital Audit Platform",
  description: "Analyze, understand, and improve your digital presence with evidence-based AI-powered audits.",
  keywords: ["digital audit", "SEO analysis", "website analyzer", "AI audit"],
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const { locale } = params;
  const dir = locale === "ar" ? "rtl" : "ltr";
  const dict = await getDictionary(locale);

  return (
    <html lang={locale} dir={dir} className={`${inter.variable} ${cairo.variable}`}>
      <body className="min-h-screen bg-white text-surface-900 antialiased">
        <Header locale={locale} dictionary={dict} />
        <main>{children}</main>
        <Footer />
        <Toaster position={locale === "ar" ? "top-left" : "top-right"} />
      </body>
    </html>
  );
}

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "ar" }];
}