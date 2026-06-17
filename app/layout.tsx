import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "منصة التحليل الرقمي",
  description: "تحليل ذكي لعيوب المواقع والسوشيال ميديا",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className="min-h-screen bg-background text-foreground font-sans">
        {children}
      </body>
    </html>
  );
