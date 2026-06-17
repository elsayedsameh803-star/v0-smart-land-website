import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Smart Land",
  description: "مشروع سمارت لاند",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
}