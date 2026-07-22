"use client";

import { useState } from "react";
import { ArrowRight, Sparkles, Loader2, Globe, Shield, Zap, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeroSectionProps {
  onAnalyze: (url: string) => void;
  locale: string;
}

export function HeroSection({ onAnalyze, locale }: HeroSectionProps) {
  const [url, setUrl] = useState("");
  const [isValid, setIsValid] = useState(true);
  const isRtl = locale === "ar";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedUrl = url.trim();
    if (!trimmedUrl) {
      setIsValid(false);
      return;
    }
    setIsValid(true);
    onAnalyze(trimmedUrl);
  };

  const features = [
    { icon: BarChart3, label: isRtl ? "تحليل SEO" : "SEO Analysis", color: "from-blue-500 to-blue-600" },
    { icon: Zap, label: isRtl ? "تحليل الأداء" : "Performance", color: "from-yellow-500 to-orange-500" },
    { icon: Shield, label: isRtl ? "فحص الأمان" : "Security Check", color: "from-green-500 to-emerald-600" },
    { icon: Globe, label: isRtl ? "تحليل شامل" : "Full Audit", color: "from-purple-500 to-pink-500" },
  ];

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-surface-950 via-surface-900 to-primary-950" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-500/10 via-transparent to-transparent" />
      
      {/* Animated grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />

      {/* Floating orbs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-8">
            <Sparkles className="w-4 h-4 text-primary-400" />
            <span className="text-sm text-primary-200">
              {isRtl ? "مدعوم بالذكاء الاصطناعي" : "AI-Powered Digital Audit"}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            {isRtl ? (
              <>
                حضورك الرقمي،
                <br />
                <span className="bg-gradient-to-r from-primary-400 via-accent-400 to-primary-300 text-transparent bg-clip-text">
                  يُحلل بذكاء
                </span>
              </>
            ) : (
              <>
                Your Digital Presence,
                <br />
                <span className="bg-gradient-to-r from-primary-400 via-accent-400 to-primary-300 text-transparent bg-clip-text">
                  Intelligently Analyzed
                </span>
              </>
            )}
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-surface-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            {isRtl
              ? "أرسل رابط موقعك الإلكتروني. تقوم سمارت لاند بتحليل الإشارات المتاحة الفعلية، وتكتشف نقاط القوة والضعف، وتظهر الأدلة، وتشرح كيفية إصلاح المشكلات المكتشفة."
              : "Submit your website URL. Smart Land analyzes real available signals, detects strengths and weaknesses, shows evidence, and explains how to fix detected problems."}
          </p>

          {/* URL Input */}
          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto mb-12">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => { setUrl(e.target.value); setIsValid(true); }}
                  placeholder={isRtl ? "أدخل رابط موقعك (مثال: example.com)" : "Enter your website URL (e.g., example.com)"}
                  className={`w-full px-6 py-4 rounded-xl bg-white/5 border ${isValid ? 'border-white/10 focus:border-primary-500' : 'border-red-500'} text-white placeholder-surface-400 text-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all backdrop-blur-sm`}
                  dir={isRtl ? "rtl" : "ltr"}
                />
              </div>
              <button
                type="submit"
                className="px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 flex items-center justify-center gap-2 text-lg"
              >
                {isRtl ? "حلل موقعك الآن" : "Analyze Your Site"}
                <ArrowRight className={`w-5 h-5 ${isRtl ? 'rotate-180' : ''}`} />
              </button>
            </div>
            {!isValid && (
              <p className="text-red-400 text-sm mt-2 text-right">
                {isRtl ? "يرجى إدخال رابط صحيح" : "Please enter a valid URL"}
              </p>
            )}
          </form>

          {/* Features Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all"
              >
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center`}>
                  <feature.icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm text-surface-300 font-medium">{feature.label}</span>
              </div>
            ))}
          </div>

          {/* Trust indicator */}
          <p className="text-surface-500 text-sm mt-8 flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-500 animate-pulse" />
            {isRtl ? "موثوق من فرق رقمية حول العالم" : "Trusted by digital teams worldwide"}
          </p>
        </div>
      </div>
    </section>
  );
}