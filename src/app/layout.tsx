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
  title: "Smart Land - AI Digital Audit Platform",
  description: "Analyze, understand, and improve your digital presence with evidence-based AI-powered audits.",
  keywords: ["digital audit", "SEO analysis", "website analyzer", "AI audit"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html className={`${inter.variable} ${cairo.variable}`}>
      <body className="min-h-screen bg-dark-950 text-gold-100 antialiased">
        {children}
      </body>
    </html>
  );
}