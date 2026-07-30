"use client";

import { WifiOff, Sparkles, RefreshCw } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function OfflinePage() {
  const pathname = usePathname();
  const locale = pathname.startsWith("/ar") ? "ar" : "en";
  const isRtl = locale === "ar";

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-950 px-4">
      <div className="text-center max-w-lg">
        {/* Icon */}
        <div className="relative mb-8 inline-flex">
          <div className="w-20 h-20 rounded-2xl bg-dark-800/80 border border-gold-500/20 flex items-center justify-center">
            <WifiOff className="w-10 h-10 text-gold-400" />
          </div>
          <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gold-500/20 flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-gold-400" />
          </span>
        </div>

        <h1 className="text-3xl font-bold text-white mb-4">
          {isRtl ? "أنت غير متصل بالإنترنت" : "You're Offline"}
        </h1>
        <p className="text-dark-400 mb-8 leading-relaxed">
          {isRtl 
            ? "يرجى الاتصال بالإنترنت لاستخدام سمارت لاند. بمجرد اتصالك، يمكنك متابعة تحليل مواقعك وحساباتك."
            : "Please connect to the internet to use Smart Land. Once connected, you can continue analyzing your websites and social media accounts."}
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-gold-600 to-gold-500 text-dark-950 font-bold hover:from-gold-500 hover:to-gold-400 transition-all shadow-lg shadow-gold-500/25"
          >
            <RefreshCw className="w-4 h-4" />
            {isRtl ? "إعادة المحاولة" : "Try Again"}
          </button>
          
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-gold-500/20 text-gold-300 hover:bg-gold-500/10 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            {isRtl ? "العودة للرئيسية" : "Back to Home"}
          </Link>
        </div>
      </div>
    </div>
  );
}