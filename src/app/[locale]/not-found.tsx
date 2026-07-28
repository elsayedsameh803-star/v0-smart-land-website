"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function LocaleNotFound() {
  const pathname = usePathname();
  const locale = pathname.startsWith("/ar") ? "ar" : "en";
  const isRtl = locale === "ar";

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-950 px-4">
      <div className="text-center max-w-lg">
        <div className="relative mb-8">
          <h1 className="text-9xl font-bold bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600 text-transparent bg-clip-text">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 bg-gold-500/5 rounded-full blur-3xl" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-white mb-4">
          {isRtl ? "عذراً، الصفحة غير موجودة" : "Oops! Page Not Found"}
        </h2>
        <p className="text-dark-400 mb-8 leading-relaxed">
          {isRtl 
            ? "لم نتمكن من العثور على الصفحة التي تبحث عنها. قد تكون الصفحة قد تم نقلها أو حذفها، أو أن الرابط الذي أدخلته غير صحيح."
            : "We couldn't find the page you're looking for. It might have been moved, deleted, or the URL you entered might be incorrect."
          }
        </p>
        <Link
          href={`/${locale}`}
          className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-gold-600 to-gold-500 text-dark-950 rounded-xl font-bold hover:from-gold-500 hover:to-gold-400 transition-all duration-300 shadow-lg shadow-gold-500/25 hover:shadow-gold-500/40 text-lg"
        >
          {isRtl ? "العودة إلى الرئيسية" : "Back to Home"}
        </Link>
      </div>
    </div>
  );
}