'use client';

import { useState } from 'react';
import { Search, ArrowRight, Shield, Zap, Brain } from 'lucide-react';

interface Props {
  onAnalyze: (url: string) => void;
  locale: 'en' | 'ar';
}

export function HeroSection({ onAnalyze, locale }: Props) {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onAnalyze(url.trim());
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-16 pb-24 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-smart-black via-smart-dark to-smart-black" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-smart-gold/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] bg-smart-gold-dark/5 rounded-full blur-3xl" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-smart-gold/20 bg-smart-gold/5 text-smart-gold text-sm mb-8">
          <Brain className="w-4 h-4" />
          <span>{locale === 'ar' ? 'منصة التدقيق الرقمي بالذكاء الاصطناعي' : 'AI Digital Audit Platform'}</span>
        </div>

        {/* Heading */}
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold leading-tight mb-6">
          {locale === 'ar' ? (
            <>
              حضورك الرقمي،
              <br />
              <span className="gold-gradient-text">يُحلل بذكاء</span>
            </>
          ) : (
            <>
              Your Digital Presence,
              <br />
              <span className="gold-gradient-text">Intelligently Analyzed</span>
            </>
          )}
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-smart-gray-light max-w-2xl mx-auto mb-10 leading-relaxed">
          {locale === 'ar'
            ? 'أرسل رابط موقعك الإلكتروني. تقوم سمارت لاند بتحليل الإشارات المتاحة الفعلية، وتكتشف نقاط القوة والضعف، وتظهر الأدلة، وتشرح كيفية إصلاح المشكلات المكتشفة.'
            : 'Submit your website URL. Smart Land analyzes real available signals, detects strengths and weaknesses, shows evidence, and explains how to fix detected problems.'}
        </p>

        {/* URL Input */}
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
          <div className="flex items-center gap-2 p-2 rounded-xl border border-smart-dark-3 bg-smart-dark-2/80 backdrop-blur-sm focus-within:border-smart-gold/50 focus-within:shadow-lg focus-within:shadow-smart-gold/5 transition-all">
            <div className="flex-1 flex items-center gap-3 px-4">
              <Search className="w-5 h-5 text-smart-gray" />
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder={locale === 'ar' ? 'أدخل رابط موقعك (مثال: example.com)' : 'Enter your website URL (e.g., example.com)'}
                className="flex-1 bg-transparent border-none outline-none text-white placeholder-smart-gray-dark text-base py-3"
                aria-label="Website URL"
              />
            </div>
            <button
              type="submit"
              disabled={!url.trim()}
              className="btn-gold flex items-center gap-2 px-6 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <span>{locale === 'ar' ? 'حلل الآن' : 'Analyze'}</span>
              <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </button>
          </div>
        </form>

        {/* Trust indicators */}
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 mt-12">
          <div className="flex items-center gap-2 text-sm text-smart-gray">
            <Shield className="w-4 h-4 text-smart-gold" />
            <span>{locale === 'ar' ? 'تحليل آمن وخاص' : 'Secure & Private Analysis'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-smart-gray">
            <Zap className="w-4 h-4 text-smart-gold" />
            <span>{locale === 'ar' ? 'نتائج فورية' : 'Instant Results'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-smart-gray">
            <Brain className="w-4 h-4 text-smart-gold" />
            <span>{locale === 'ar' ? 'توصيات مدعومة بالذكاء الاصطناعي' : 'AI-Powered Recommendations'}</span>
          </div>
        </div>
      </div>
    </section>
  );
}