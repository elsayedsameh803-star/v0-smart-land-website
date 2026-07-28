import type { Metadata } from "next";
import { headers } from "next/headers";
import { Inter, Cairo } from "next/font/google";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"], 
  variable: "--font-inter",
  display: "swap",
  preload: false,
});

const cairo = Cairo({ 
  subsets: ["arabic"], 
  variable: "--font-cairo",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: "Smart Land - AI Digital Audit Platform | سمارت لاند - منصة التدقيق الرقمي",
  description: "Analyze, understand, and improve your digital presence with evidence-based AI-powered audits. حلل، افهم، وحسّن حضورك الرقمي بتدقيقات مدعومة بالذكاء الاصطناعي.",
  keywords: ["digital audit", "SEO analysis", "website analyzer", "AI audit", "تدقيق رقمي", "تحليل مواقع"],
};

function detectLocaleFromHeaders(): string {
  try {
    const headersList = headers();
    const acceptLanguage = headersList.get("accept-language") || "";
    
    // Check for Arabic first
    if (acceptLanguage.includes("ar")) {
      return "ar";
    }
    
    // Default to English
    return "en";
  } catch {
    return "en";
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = detectLocaleFromHeaders();
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir} className={`${inter.variable} ${cairo.variable}`}>
      <head>
        <meta charSet="utf-8" />
      </head>
      <body className="min-h-screen bg-dark-950 text-gold-100 antialiased">
        {children}
      </body>
    </html>
  );
}
