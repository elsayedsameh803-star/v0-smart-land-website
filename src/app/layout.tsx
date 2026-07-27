import type { Metadata } from "next";
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html className={`${inter.variable} ${cairo.variable}`}>
      <head>
        <meta charSet="utf-8" />
      </head>
      <body className="min-h-screen bg-dark-950 text-gold-100 antialiased">
        {children}
      </body>
    </html>
  );
}