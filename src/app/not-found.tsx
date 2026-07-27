"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NotFound() {
  const pathname = usePathname();
  const locale = pathname.startsWith("/ar") ? "ar" : "en";
  const isRtl = locale === "ar";

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-950">
      <div className="text-center px-4">
        <h1 className="text-8xl font-bold text-gold-500 mb-4">404</h1>
        <p className="text-xl text-dark-400 mb-8">
          {isRtl ? "الصفحة غير موجودة" : "Page not found"}
        </p>
        <Link
          href={`/${locale}`}
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-gold-600 to-gold-500 text-dark-950 rounded-xl hover:from-gold-500 hover:to-gold-400 transition-all font-bold shadow-lg shadow-gold-500/25"
        >
          {isRtl ? "العودة للرئيسية" : "Go Home"}
        </Link>
      </div>
    </div>
  );
}